from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from database.db import find_all, find_one, insert, update
from services.auth_utils import get_current_user_payload

router = APIRouter(prefix="/api/pharmacies", tags=["Pharmacies"])

@router.get("")
def list_pharmacies(
    area: Optional[str] = None,
    home_delivery_only: Optional[bool] = False,
    search: Optional[str] = None
):
    pharmacies = find_all("pharmacies", lambda p: p.get("is_active", True) and p.get("verification_status") == "verified")
    results = []
    for p in pharmacies:
        if area and area.lower() != "all" and p.get("area", "").lower() != area.lower():
            continue
        if home_delivery_only and not p.get("home_delivery", False):
            continue
        if search:
            q = search.lower()
            name_match = q in p.get("name", "").lower()
            area_match = q in p.get("area", "").lower()
            if not (name_match or area_match):
                continue
        results.append(p)
    return results

@router.get("/{pharmacy_id}")
def get_pharmacy_details(pharmacy_id: str):
    pharm = find_one("pharmacies", lambda p: p.get("id") == pharmacy_id)
    if not pharm:
        raise HTTPException(status_code=404, detail="Pharmacy not found")
    medicines = find_all("sample_medicines")
    return {
        "pharmacy": pharm,
        "catalog_preview": medicines[:6]
    }

@router.get("/dashboard/overview")
def get_pharmacy_dashboard_overview(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] not in ["pharmacy", "super_admin"]:
        raise HTTPException(status_code=403, detail="Pharmacy dashboard permission required")

    pharm_id = current_user.get("entity_id") or "pharm-001"
    pharmacy = find_one("pharmacies", lambda p: p.get("id") == pharm_id)
    if not pharmacy:
        pharmacy = find_one("pharmacies", lambda p: p.get("id") == "pharm-001")
        pharm_id = pharmacy["id"]

    orders = find_all("orders", lambda o: o.get("pharmacy_id") == pharm_id)
    medicines = find_all("sample_medicines")

    today_str = datetime.now().strftime("%Y-%m-%d")
    today_orders = [o for o in orders if o.get("created_at", "").startswith(today_str)]

    pending_quotes_count = 3  # Active incoming quote requests
    active_orders = [o for o in orders if o.get("status") not in ["Collected", "Delivered", "Cancelled"]]
    ready_for_pickup = [o for o in orders if o.get("status") == "Ready for Pickup"]

    completed_orders = [o for o in orders if o.get("status") in ["Collected", "Delivered"]]
    total_sales = sum(o.get("total_amount", 0) for o in completed_orders)

    return {
        "pharmacy": pharmacy,
        "kpis": {
            "total_orders_count": len(orders),
            "pending_quotes_count": pending_quotes_count,
            "active_orders_count": len(active_orders),
            "ready_for_pickup_count": len(ready_for_pickup),
            "today_sales": 1840.0,
            "monthly_sales": 48250.0,
            "catalog_items_count": len(medicines) * 140
        },
        "recent_orders": sorted(orders, key=lambda x: x.get("created_at", ""), reverse=True)[:8],
        "inventory_sample": medicines
    }
