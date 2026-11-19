from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from database.db import find_all, find_one, insert, update, delete
from services.auth_utils import get_current_user_payload

router = APIRouter(prefix="/api/services", tags=["Clinical Services"])

@router.get("")
def list_services(
    organization_id: Optional[str] = None,
    category: Optional[str] = None
):
    services = find_all("services")
    results = []
    for s in services:
        if organization_id and s.get("organization_id") != organization_id:
            continue
        if category and category.lower() != "all" and s.get("category", "").lower() != category.lower():
            continue
        results.append(s)
    return results

@router.post("")
def create_service(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    if current_user["role"] not in ["hospital", "clinic", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    org_id = current_user.get("organization_id") or payload.get("organization_id") or "hosp-001"
    org_table = "hospitals" if org_id.startswith("hosp") else "clinics"
    org = find_one(org_table, lambda o: o.get("id") == org_id)

    services = find_all("services")
    service_id = f"srv-{len(services) + 1:03d}"

    fee = float(payload.get("price") or payload.get("consultation_fee") or payload.get("fee") or 500)

    record = {
        "id": service_id,
        "organization_id": org_id,
        "organization_name": org.get("name", "Healthcare Organization") if org else "Healthcare Organization",
        "name": payload.get("name"),
        "category": payload.get("category", "General Consultation"),
        "department": payload.get("department", "General Medicine"),
        "associated_doctor_id": payload.get("associated_doctor_id"),
        "associated_doctor_name": payload.get("associated_doctor_name"),
        "consultation_fee": fee,
        "price": fee,
        "duration_minutes": int(payload.get("duration_minutes", 15)),
        "availability": payload.get("availability", "Monday to Saturday (09:00 AM - 06:00 PM)"),
        "description": payload.get("description", "Clinical healthcare service."),
        "terms": payload.get("terms", "Advance appointment required."),
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    insert("services", record)
    return {"message": "Service created successfully", "service": record}

@router.put("/{service_id}")
def update_service(
    service_id: str,
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    if current_user["role"] not in ["hospital", "clinic", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    service = find_one("services", lambda s: s.get("id") == service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Enforce tenant isolation
    if current_user["role"] != "super_admin" and current_user.get("organization_id") != service.get("organization_id"):
        raise HTTPException(status_code=403, detail="Access denied to other organisation's services")

    updates = dict(payload)
    if "price" in updates:
        updates["price"] = float(updates["price"])
        updates["consultation_fee"] = updates["price"]
    elif "consultation_fee" in updates:
        updates["consultation_fee"] = float(updates["consultation_fee"])
        updates["price"] = updates["consultation_fee"]

    updated = update("services", service_id, updates, id_field="id")
    return {"message": "Service updated successfully", "service": updated}

@router.delete("/{service_id}")
def delete_service_item(
    service_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    if current_user["role"] not in ["hospital", "clinic", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    service = find_one("services", lambda s: s.get("id") == service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    if current_user["role"] != "super_admin" and current_user.get("organization_id") != service.get("organization_id"):
        raise HTTPException(status_code=403, detail="Access denied")

    delete("services", service_id, id_field="id")
    return {"message": "Service deleted successfully"}
