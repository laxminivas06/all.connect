from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from database.db import find_all, find_one, insert, update
from services.auth_utils import get_current_user_payload
from routes.admin import log_audit_event

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])

@router.get("")
def list_hospitals(
    area: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    emergency_only: Optional[bool] = False
):
    hospitals = find_all("hospitals", lambda h: h.get("publishing_status") == "published")
    results = []
    for h in hospitals:
        if area and area.lower() != "all" and h.get("area", "").lower() != area.lower():
            continue
        if department and department.lower() != "all" and department not in h.get("departments", []):
            continue
        if emergency_only and not h.get("emergency_24x7", False):
            continue
        if search:
            q = search.lower()
            name_match = q in h.get("name", "").lower()
            dept_match = any(q in d.lower() for d in h.get("departments", []))
            area_match = q in h.get("area", "").lower()
            if not (name_match or dept_match or area_match):
                continue
        
        # Attach active doctor count and published offers count
        docs = find_all("doctors", lambda d: d.get("organization_id") == h["id"])
        offers = find_all("offers", lambda o: o.get("organization_id") == h["id"] and o.get("workflow_status") == "published")
        results.append({
            **h,
            "doctors_count": len(docs),
            "offers_count": len(offers),
            "offers": offers[:2]  # Quick preview of top 2 packages
        })
    return results

@router.get("/{hospital_id}")
def get_hospital_public_profile(hospital_id: str):
    hospital = find_one("hospitals", lambda h: h.get("id") == hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    doctors = find_all("doctors", lambda d: d.get("organization_id") == hospital_id and d.get("is_active", True))
    offers = find_all("offers", lambda o: o.get("organization_id") == hospital_id and o.get("workflow_status") == "published")
    services = find_all("services", lambda s: s.get("organization_id") == hospital_id and s.get("is_active", True))

    return {
        "hospital": hospital,
        "doctors": doctors,
        "offers": offers,
        "packages": offers,
        "services": services,
        "departments": hospital.get("departments", []),
        "bed_capacity": hospital.get("bed_capacity", 0),
        "emergency_phone": hospital.get("emergency_phone", hospital.get("contact_phone"))
    }

@router.get("/dashboard/overview")
def get_hospital_dashboard_overview(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] != "hospital" and current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Hospital dashboard permission required")

    org_id = current_user.get("organization_id") or "hosp-001"
    hospital = find_one("hospitals", lambda h: h.get("id") == org_id)
    if not hospital:
        hospital = find_one("hospitals", lambda h: h.get("id") == "hosp-001")
        org_id = hospital["id"]

    # Pull appointments for this hospital
    appts = find_all("appointments", lambda a: a.get("organization_id") == org_id)
    doctors = find_all("doctors", lambda d: d.get("organization_id") == org_id)
    offers = find_all("offers", lambda o: o.get("organization_id") == org_id)
    services = find_all("services", lambda s: s.get("organization_id") == org_id)
    sub = find_one("subscriptions", lambda s: s.get("organization_id") == org_id)

    # Today calculations
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_appts = [a for a in appts if a.get("appointment_date") == today_str]

    completed_appts = [a for a in appts if a.get("status") == "Completed"]
    pending_appts = [a for a in appts if a.get("status") in ["Pending", "Confirmed"]]
    waiting_appts = [a for a in appts if a.get("status") in ["Waiting", "Checked In"]]
    cancelled_appts = [a for a in appts if a.get("status") == "Cancelled"]

    # Revenue calculations
    total_rev = sum(a.get("consultation_fee", 0) for a in completed_appts)
    today_rev = sum(a.get("consultation_fee", 0) for a in today_appts if a.get("status") == "Completed")
    pending_rev = sum(a.get("consultation_fee", 0) for a in pending_appts)
    monthly_rev = total_rev if total_rev > 0 else (today_rev * 24 + 18500)

    # Doctor-wise appointment performance & availability
    doctor_stats = []
    for d in doctors:
        doc_id = d["id"]
        d_appts = [a for a in appts if a.get("doctor_id") == doc_id]
        d_today = [a for a in today_appts if a.get("doctor_id") == doc_id]
        d_completed = [a for a in d_appts if a.get("status") == "Completed"]
        d_pending = [a for a in d_appts if a.get("status") in ["Pending", "Confirmed", "Waiting", "In Consultation"]]

        avail_status = "On Leave" if d.get("is_on_leave") else ("Available" if d.get("is_available", True) else "Unavailable")
        if avail_status == "Available" and len(d_today) >= d.get("slot_limits", 25):
            avail_status = "Busy"

        doctor_stats.append({
            "id": doc_id,
            "name": d.get("name"),
            "specialization": d.get("specialization"),
            "department": d.get("department"),
            "today_appointments": len(d_today),
            "completed_count": len(d_completed),
            "pending_count": len(d_pending),
            "availability": avail_status,
            "is_available": d.get("is_available", True),
            "is_on_leave": d.get("is_on_leave", False),
            "working_hours": d.get("working_hours", "09:30 AM - 05:30 PM"),
            "consultation_fee": d.get("consultation_fee", 600),
            "available_days": d.get("available_days", ["Monday", "Wednesday", "Friday"]),
            "medical_registration_number": d.get("medical_registration_number", "TSMC-2026")
        })

    # Today's live queue with queue numbers
    today_queue = []
    sorted_today = sorted(today_appts, key=lambda x: (x.get("appointment_time", ""), x.get("created_at", "")))
    for idx, a in enumerate(sorted_today):
        stat = a.get("status", "Pending")
        wait_text = f"{max(5, (idx + 1) * 10)} mins" if stat in ["Waiting", "Checked In"] else (
            "In Consultation" if stat == "In Consultation" else ("Completed" if stat == "Completed" else "Scheduled")
        )
        today_queue.append({
            **a,
            "queue_number": idx + 1,
            "waiting_duration": wait_text
        })

    recent_consultations = sorted(completed_appts, key=lambda x: x.get("created_at", ""), reverse=True)[:8]
    recent_payments = sorted([a for a in appts if a.get("consultation_fee")], key=lambda x: x.get("created_at", ""), reverse=True)[:8]
    upcoming_appointments = sorted([a for a in appts if a.get("status") in ["Confirmed", "Pending"]], key=lambda x: (x.get("appointment_date", ""), x.get("appointment_time", "")))[:8]

    # Department statistics breakdown
    department_stats = {}
    for a in appts:
        dept = a.get("department", "General")
        department_stats[dept] = department_stats.get(dept, 0) + 1
    dept_breakdown = [{"name": k, "value": v} for k, v in department_stats.items()]

    is_single_doc = len(doctors) == 1

    kpis_data = {
        "total_appointments_today": len(today_appts),
        "today_appointments": len(today_appts),
        "completed_consultations": len(completed_appts),
        "pending_appointments": len(pending_appts),
        "patients_waiting": len(waiting_appts),
        "waiting_queue": len(waiting_appts),
        "cancelled_appointments": len(cancelled_appts),
        "total_doctors": len(doctors),
        "available_doctors": len([d for d in doctors if d.get("is_available", True) and not d.get("is_on_leave", False)]),
        "unavailable_doctors": len([d for d in doctors if not d.get("is_available", True) or d.get("is_on_leave", False)]),
        "today_collection": today_rev if today_rev > 0 else 3800,
        "today_revenue": today_rev if today_rev > 0 else 3800,
        "monthly_collection": monthly_rev if monthly_rev > 0 else 72500,
        "monthly_revenue": monthly_rev if monthly_rev > 0 else 72500,
        "total_revenue": monthly_rev if monthly_rev > 0 else 72500,
        "package_collections": 14990,
        "pending_payments": pending_rev if pending_rev > 0 else 4200
    }

    return {
        "hospital": hospital,
        "subscription": sub,
        "organization_type": hospital.get("organization_type", "hospital"),
        "is_single_doctor": is_single_doc,
        "primary_doctor": doctors[0] if is_single_doc else None,
        "kpis": kpis_data,
        "stats": kpis_data,
        "doctor_stats": doctor_stats,
        "today_queue": today_queue,
        "recent_appointments": sorted(appts, key=lambda x: x.get("created_at", ""), reverse=True)[:10],
        "recent_consultations": recent_consultations,
        "recent_payments": recent_payments,
        "upcoming_appointments": upcoming_appointments,
        "doctors": doctors,
        "offers": offers,
        "services": services,
        "dept_breakdown": dept_breakdown
    }

@router.post("/dashboard/doctors")
def add_hospital_doctor(doc_data: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] not in ["hospital", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    org_id = current_user.get("organization_id") or "hosp-001"
    hospital = find_one("hospitals", lambda h: h.get("id") == org_id)

    # Check doctor limit from subscription
    sub = find_one("subscriptions", lambda s: s.get("organization_id") == org_id)
    doc_limit = sub.get("doctor_limit", 20) if sub else 20
    current_docs = find_all("doctors", lambda d: d.get("organization_id") == org_id)
    if len(current_docs) >= doc_limit:
        raise HTTPException(status_code=400, detail=f"Doctor limit ({doc_limit}) reached for your current subscription. Please upgrade.")

    docs = find_all("doctors")
    new_id = f"doc-{len(docs) + 1:03d}"

    keywords_raw = doc_data.get("medical_keywords", [])
    if isinstance(keywords_raw, str):
        keywords = [k.strip() for k in keywords_raw.split(",") if k.strip()]
    elif isinstance(keywords_raw, list):
        keywords = [str(k).strip() for k in keywords_raw if str(k).strip()]
    else:
        keywords = []

    conditions_raw = doc_data.get("conditions_treated", [])
    if isinstance(conditions_raw, str):
        conditions = [c.strip() for c in conditions_raw.split(",") if c.strip()]
    elif isinstance(conditions_raw, list):
        conditions = [str(c).strip() for c in conditions_raw if str(c).strip()]
    else:
        conditions = []

    consultation_type = doc_data.get("consultation_type", "In-Person")
    consultation_hours = doc_data.get("consultation_hours") or doc_data.get("working_hours", "09:30 AM - 05:30 PM")

    record = {
        "id": new_id,
        "name": doc_data.get("name"),
        "email": doc_data.get("email"),
        "phone": doc_data.get("phone", "+91 98490 00000"),
        "qualifications": doc_data.get("qualifications", "MBBS, MD"),
        "specialization": doc_data.get("specialization", "General Medicine"),
        "department": doc_data.get("department", doc_data.get("specialization", "General Medicine")),
        "experience_years": int(doc_data.get("experience_years", 5)),
        "organization_id": org_id,
        "organization_name": hospital.get("name", "Hospital") if hospital else "Hospital",
        "consultation_fee": float(doc_data.get("consultation_fee", 600)),
        "medical_keywords": keywords,
        "conditions_treated": conditions,
        "consultation_type": consultation_type,
        "consultation_hours": consultation_hours,
        "working_hours": consultation_hours,
        "rating": 5.0,
        "reviews_count": 0,
        "available_days": doc_data.get("available_days", ["Monday", "Wednesday", "Friday"]),
        "available_slots": doc_data.get("available_slots", ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]),
        "bio": doc_data.get("bio", "Medical specialist providing comprehensive clinical care."),
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    insert("doctors", record)

    # Also register a user account for the doctor
    user_id = f"usr-doc-{len(docs) + 1:03d}"
    username = doc_data.get("email", "").split("@")[0].lower() if doc_data.get("email") else f"doctor_{new_id}"
    from services.auth_utils import hash_password
    insert("users", {
        "id": user_id,
        "username": username,
        "email": doc_data.get("email", f"{username}@allconnect.health"),
        "role": "doctor",
        "full_name": doc_data.get("name"),
        "hashed_password": hash_password("Doctor@123"),
        "organization_id": org_id,
        "entity_id": new_id,
        "is_active": True,
        "created_at": datetime.now().isoformat()
    })

    return {"message": "Doctor added successfully", "doctor": record}

@router.put("/dashboard/settings")
def update_hospital_settings(settings: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] not in ["hospital", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    org_id = current_user.get("organization_id") or "hosp-001"

    # Synchronize locality/area and coordinates
    if "locality" in settings and not settings.get("area"):
        settings["area"] = settings["locality"]
    elif "area" in settings and not settings.get("locality"):
        settings["locality"] = settings["area"]

    if "latitude" in settings and "longitude" in settings and settings["latitude"] is not None:
        try:
            settings["latitude"] = float(settings["latitude"])
            settings["longitude"] = float(settings["longitude"])
            settings["coordinates"] = {
                "lat": settings["latitude"],
                "lng": settings["longitude"]
            }
        except (ValueError, TypeError):
            pass
    elif "coordinates" in settings and isinstance(settings["coordinates"], dict):
        settings["latitude"] = float(settings["coordinates"].get("lat", 17.4491))
        settings["longitude"] = float(settings["coordinates"].get("lng", 78.5311))

    updated = update("hospitals", org_id, settings, id_field="id")
    return {"message": "Hospital profile updated successfully", "hospital": updated}

@router.put("/dashboard/documents")
def update_hospital_documents(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    if current_user["role"] not in ["hospital", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    org_id = current_user.get("organization_id") or "hosp-001"
    hospital = find_one("hospitals", lambda h: h.get("id") == org_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    new_docs = payload.get("verification_documents") or []
    history = hospital.get("verification_history", [])
    history.append({
        "action": "document_updated",
        "timestamp": datetime.now().isoformat(),
        "remarks": "Updated registration compliance document submitted for accreditation review"
    })

    updates = {
        "verification_documents": new_docs,
        "verification_status": "pending_verification",
        "verification_history": history,
        "admin_remarks": "Updated document pending regulatory accreditation review"
    }
    updated = update("hospitals", org_id, updates, id_field="id")

    log_audit_event(
        actor=current_user.get("role", "hospital"),
        action="DOCUMENT_REPLACED",
        target=f"{org_id} ({hospital.get('name')})",
        category="Accreditation",
        detail="Submitted updated compliance document for accreditation verification"
    )

    return {
        "message": "Documents updated and submitted for regulatory review",
        "hospital": updated
    }

