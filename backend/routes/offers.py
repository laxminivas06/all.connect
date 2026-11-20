from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import OfferCreateRequest, OfferStatusUpdateRequest
from database.db import find_all, find_one, insert, update, delete
from services.auth_utils import get_current_user_payload

router = APIRouter(prefix="/api/offers", tags=["Offers & Advertisements"])

@router.get("")
def list_published_offers(
    category: Optional[str] = None,
    organization_id: Optional[str] = None,
    organization_type: Optional[str] = None
):
    today_str = datetime.now().strftime("%Y-%m-%d")
    offers = find_all("offers", lambda o: o.get("workflow_status") == "published")
    results = []
    for o in offers:
        # Only return non-expired offers
        end_d = o.get("end_date") or o.get("valid_to") or o.get("valid_until")
        if end_d and end_d < today_str:
            continue
        if category and category.lower() != "all" and o.get("category", "").lower() != category.lower():
            continue
        if organization_id and o.get("organization_id") != organization_id:
            continue
        if organization_type and o.get("organization_type") != organization_type:
            continue
        results.append(o)
    return results

@router.get("/all")
def list_all_offers_for_admin(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin permission required")
    return find_all("offers")

@router.get("/my")
def get_my_org_offers(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    org_id = current_user.get("organization_id")
    if not org_id:
        return []
    return find_all("offers", lambda o: o.get("organization_id") == org_id)

@router.post("/create")
def create_offer(req: OfferCreateRequest, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] not in ["hospital", "clinic", "pharmacy", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only healthcare providers (hospitals, clinics, pharmacies) can publish promotions")

    org_id = current_user.get("organization_id") or "hosp-001"
    if org_id.startswith("hosp"):
        org_type = "hospital"
        org_table = "hospitals"
    elif org_id.startswith("clinic"):
        org_type = "clinic"
        org_table = "clinics"
    elif org_id.startswith("pharm"):
        org_type = "pharmacy"
        org_table = "pharmacies"
    else:
        org_type = "hospital"
        org_table = "hospitals"

    org = find_one(org_table, lambda o: o.get("id") == org_id)

    offers = find_all("offers")
    offer_id = f"off-{len(offers) + 1:03d}"

    discount_pct = int(((req.original_price - req.discounted_price) / req.original_price) * 100) if req.original_price > req.discounted_price else 0

    record = {
        "id": offer_id,
        "organization_id": org_id,
        "organization_name": org.get("name", "Healthcare Organization") if org else "Healthcare Organization",
        "organization_type": org_type,
        "title": req.title,
        "category": req.category,
        "description": req.description,
        "original_price": req.original_price,
        "discounted_price": req.discounted_price,
        "discount_percentage": discount_pct,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "applicable_departments": req.applicable_departments or ["General Healthcare"],
        "terms": req.terms or "Advance booking required. Non-refundable.",
        # Organizations independently publish their own campaigns without mandatory super admin approval
        "workflow_status": "published",
        "featured": False,
        "created_at": datetime.now().isoformat()
    }
    insert("offers", record)

    # Informational system notification
    insert("notifications", {
        "id": f"notif-ad-published-{offer_id}",
        "user_id": "usr-admin-01",
        "role": "super_admin",
        "title": "New Promotional Campaign Live",
        "message": f"'{req.title}' published by {record['organization_name']}.",
        "type": "advertisement",
        "link": "/dashboard/admin/promotions",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    })

    return {
        "message": "Promotion created and published live successfully!",
        "offer": record
    }

@router.put("/{offer_id}/status")
def update_offer_status(
    offer_id: str,
    req: OfferStatusUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    offer = find_one("offers", lambda o: o.get("id") == offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    updated = update("offers", offer_id, {"workflow_status": req.workflow_status}, id_field="id")
    return {
        "message": f"Offer status updated to {req.workflow_status}",
        "offer": updated
    }

@router.put("/{offer_id}")
def update_offer_details(
    offer_id: str,
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    offer = find_one("offers", lambda o: o.get("id") == offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if current_user["role"] != "super_admin" and current_user.get("organization_id") != offer.get("organization_id"):
        raise HTTPException(status_code=403, detail="Permission denied")

    # Recalculate discount percentage if prices change
    orig = float(payload.get("original_price") or offer.get("original_price", 0))
    disc = float(payload.get("discounted_price") or offer.get("discounted_price", 0))
    if orig > disc and orig > 0:
        payload["discount_percentage"] = int(((orig - disc) / orig) * 100)

    updated = update("offers", offer_id, payload, id_field="id")
    return {"message": "Offer updated successfully", "offer": updated}

@router.delete("/{offer_id}")
def delete_offer_item(
    offer_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    offer = find_one("offers", lambda o: o.get("id") == offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if current_user["role"] != "super_admin" and current_user.get("organization_id") != offer.get("organization_id"):
        raise HTTPException(status_code=403, detail="Permission denied")

    delete("offers", offer_id, id_field="id")
    return {"message": "Offer deleted successfully"}

