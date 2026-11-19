import random
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import QuotationRequest, OrderCreateRequest, OrderStatusUpdateRequest
from database.db import find_all, find_one, insert, update
from services.auth_utils import get_current_user_payload

router = APIRouter(prefix="/api/orders", tags=["Orders & Quotations"])

@router.get("")
def list_orders(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    role = current_user.get("role")
    entity_id = current_user.get("entity_id")
    user_id = current_user.get("sub")

    if role == "patient":
        patient = find_one("patients", lambda p: p.get("patient_id") == entity_id or p.get("user_id") == user_id)
        pid = patient["patient_id"] if patient else "PAT-2026-000001"
        orders = find_all("orders", lambda o: o.get("patient_id") == pid)
    elif role == "pharmacy":
        orders = find_all("orders", lambda o: o.get("pharmacy_id") == entity_id)
    elif role == "super_admin":
        orders = find_all("orders")
    else:
        orders = []

    return sorted(orders, key=lambda x: x.get("created_at", ""), reverse=True)

@router.post("/request-quotations")
def request_pharmacy_quotations(req: QuotationRequest):
    """
    Simulates real-time quotation discovery from nearby pharmacies in Hyderabad.
    Generates realistic itemized prices, distances, availability, and delivery charges.
    """
    pharmacies = find_all("pharmacies", lambda p: p.get("is_active", True) and p.get("verification_status") == "verified")
    all_meds = find_all("sample_medicines")

    requested_med_names = [m.get("name", "").lower() for m in req.medicines]
    
    quotations = []
    distances = [0.8, 1.4, 2.1, 2.8, 3.5, 4.2, 5.0, 5.8, 6.5, 7.2]

    for idx, pharm in enumerate(pharmacies[:6]):
        # Calculate pricing for each item with slight price variation per pharmacy
        items_quote = []
        subtotal = 0.0
        all_available = True

        for m_req in req.medicines:
            m_name = m_req.get("name", "Medicine")
            # find matching catalog medicine or mock price
            match = next((item for item in all_meds if item["name"].lower() in m_name.lower() or m_name.lower() in item["name"].lower()), None)
            base_price = match["unit_price"] if match else 65.0
            variance = random.choice([0.95, 1.0, 1.05, 0.98, 1.02])
            item_price = round(base_price * variance, 2)
            qty = int(m_req.get("quantity", 1))
            total_item = round(item_price * qty, 2)
            subtotal += total_item

            items_quote.append({
                "name": m_name,
                "quantity": qty,
                "unit_price": item_price,
                "total": total_item,
                "in_stock": True if (idx != 2 or len(req.medicines) < 3) else False
            })

        availability_status = "Available" if all(item["in_stock"] for item in items_quote) else "Partial (2 of 3)"
        dist = distances[idx % len(distances)]
        del_charge = pharm.get("delivery_charge", 25.0) if pharm.get("home_delivery", False) else 0.0

        quotations.append({
            "pharmacy_id": pharm["id"],
            "pharmacy_name": pharm["name"],
            "pharmacy_area": pharm["area"],
            "rating": pharm["rating"],
            "distance_km": f"{dist} km",
            "availability": availability_status,
            "can_fulfill": availability_status == "Available",
            "items": items_quote,
            "subtotal": round(subtotal, 2),
            "delivery_charge": del_charge,
            "total_pickup": round(subtotal, 2),
            "total_delivery": round(subtotal + del_charge, 2),
            "home_delivery_available": pharm.get("home_delivery", True),
            "estimated_delivery_time": f"{pharm.get('avg_prep_time_minutes', 20) + int(dist * 5)} mins",
            "estimated_pickup_time": f"Ready in {pharm.get('avg_prep_time_minutes', 20)} mins"
        })

    # Sort primarily by availability and lowest price
    quotations.sort(key=lambda q: (0 if q["availability"] == "Available" else 1, q["total_pickup"]))

    return {
        "prescription_id": req.prescription_id,
        "requested_items_count": len(req.medicines),
        "quotations_count": len(quotations),
        "quotations": quotations
    }

@router.post("/place-order")
def place_medicine_order(req: OrderCreateRequest, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    pharm = find_one("pharmacies", lambda p: p.get("id") == req.pharmacy_id)
    if not pharm:
        raise HTTPException(status_code=404, detail="Selected pharmacy not found")

    patient = find_one("patients", lambda p: p.get("patient_id") == current_user.get("entity_id") or p.get("user_id") == current_user["sub"])
    if not patient:
        patient = find_one("patients", lambda p: p.get("patient_id") == "PAT-2026-000001")

    orders = find_all("orders")
    next_num = len(orders) + 141
    order_id = f"MED-2026-{next_num:06d}"
    pickup_code = f"PICK-{random.randint(10000, 99999)}"

    subtotal = sum(item.get("total", item.get("unit_price", 50) * item.get("quantity", 1)) for item in req.items)
    delivery_charge = pharm.get("delivery_charge", 25.0) if req.fulfillment_type == "Home Delivery" else 0.0
    total_amount = round(subtotal + delivery_charge, 2)

    order_record = {
        "id": order_id,
        "order_id": order_id,
        "patient_id": patient["patient_id"],
        "patient_name": patient["full_name"],
        "patient_mobile": patient["mobile"],
        "pharmacy_id": pharm["id"],
        "pharmacy_name": pharm["name"],
        "prescription_id": req.prescription_id,
        "items": req.items,
        "subtotal": round(subtotal, 2),
        "delivery_charge": delivery_charge,
        "total_amount": total_amount,
        "fulfillment_type": req.fulfillment_type,
        "delivery_address": req.delivery_address or (patient["address"] if req.fulfillment_type == "Home Delivery" else None),
        "pickup_code": pickup_code,
        "status": "Pharmacy Verification",
        "payment_status": "Paid Online (Escrow)",
        "notes": req.notes or "Order placed via Centralized Healthcare app.",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    insert("orders", order_record)

    # In-app notification for patient
    insert("notifications", {
        "id": f"notif-order-pat-{next_num}",
        "user_id": patient.get("user_id"),
        "role": "patient",
        "title": f"Order Placed: {order_id}",
        "message": f"Your medicine order with {pharm['name']} has been submitted for pharmacy verification. Verification Code: {pickup_code}.",
        "type": "order",
        "link": "/dashboard/patient/orders",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    })

    # In-app notification for pharmacy
    insert("notifications", {
        "id": f"notif-order-pharm-{next_num}",
        "user_id": None,
        "role": "pharmacy",
        "title": f"New Medicine Order Received ({order_id})",
        "message": f"{patient['full_name']} placed order {order_id} ({req.fulfillment_type}). Verification required.",
        "type": "order",
        "link": "/dashboard/pharmacy/orders",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    })

    return {
        "message": "Medicine order placed successfully!",
        "order": order_record
    }

@router.put("/{order_id}/status")
def update_order_status(
    order_id: str,
    req: OrderStatusUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    order = find_one("orders", lambda o: o.get("id") == order_id or o.get("order_id") == order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # If verifying pickup handover, validate code if provided
    if req.status == "Collected":
        if req.pickup_code_verify and req.pickup_code_verify.strip().upper() != order.get("pickup_code", "").upper():
            raise HTTPException(status_code=400, detail="Invalid Pickup Verification Code! Handover denied.")

    updated = update("orders", order["id"], {
        "status": req.status,
        "updated_at": datetime.now().isoformat()
    }, id_field="id")

    # Notify patient of status progression
    patient = find_one("patients", lambda p: p.get("patient_id") == order.get("patient_id"))
    if patient and patient.get("user_id"):
        insert("notifications", {
            "id": f"notif-ord-prog-{datetime.now().timestamp()}",
            "user_id": patient.get("user_id"),
            "role": "patient",
            "title": f"Medicine Order Update: {req.status}",
            "message": f"Your order {order['order_id']} is now '{req.status}'.",
            "type": "order",
            "link": "/dashboard/patient/orders",
            "is_read": False,
            "created_at": datetime.now().isoformat()
        })

    return {
        "message": f"Order status updated to {req.status}",
        "order": updated
    }
