from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, Body
from models.schemas import AppointmentCreateRequest, AppointmentStatusUpdateRequest, AppointmentPricingQuoteRequest
from database.db import find_all, find_one, insert, update
from services.auth_utils import get_current_user_payload
from routes.admin import log_audit_event

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.get("")
def get_appointments(
    status: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    role = current_user.get("role")
    entity_id = current_user.get("entity_id")
    org_id = current_user.get("organization_id")
    user_id = current_user.get("sub")

    if role == "patient":
        patient = find_one("patients", lambda p: p.get("patient_id") == entity_id or p.get("user_id") == user_id)
        pid = patient["patient_id"] if patient else "PAT-2026-000001"
        appts = find_all("appointments", lambda a: a.get("patient_id") == pid)
    elif role in ["hospital", "clinic"]:
        appts = find_all("appointments", lambda a: a.get("organization_id") == org_id)
    elif role == "doctor":
        appts = find_all("appointments", lambda a: a.get("doctor_id") == entity_id)
    elif role == "super_admin":
        appts = find_all("appointments")
    else:
        appts = []

    if status and status.lower() != "all":
        appts = [a for a in appts if a.get("status", "").lower() == status.lower()]

    return sorted(appts, key=lambda x: x.get("created_at", ""), reverse=True)

@router.post("/pricing-quote")
def get_appointment_pricing_quote(req: AppointmentPricingQuoteRequest):
    """
    Step 5: Official Consultation Price Quote from backend.
    Calculates applicable fee based on Doctor, Consultation Mode, and additional charges.
    """
    doctor = find_one("doctors", lambda d: d.get("id") == req.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    target_org_id = req.organization_id or doctor.get("organization_id")
    org_table = "hospitals" if str(target_org_id).startswith("hosp") else "clinics"
    org = find_one(org_table, lambda o: o.get("id") == target_org_id)
    org_name = org.get("name") if org else doctor.get("organization_name", "Medical Centre")

    # Base consultation fee
    base_fee = float(doctor.get("consultation_fee") or 500)
    mode = req.consultation_mode.strip()
    
    # Mode-based adjustments: Video consultation can have discounted or dedicated rate
    if mode.lower() in ["video", "teleconsultation", "video consultation"]:
        mode_label = "Video Consultation"
        fee = float(doctor.get("video_consultation_fee") or (base_fee * 0.9))
    else:
        mode_label = "In-Person Consultation"
        fee = base_fee

    fee = round(fee, 2)
    additional_charges = 0.0  # Optional facility service charge
    total_payable = round(fee + additional_charges, 2)

    return {
        "doctor_id": doctor.get("id"),
        "doctor_name": doctor.get("name") or doctor.get("full_name") or "Doctor",
        "specialization": doctor.get("specialization", "General Medicine"),
        "organization_id": target_org_id,
        "organization_name": org_name,
        "consultation_mode": mode_label,
        "appointment_date": req.appointment_date,
        "appointment_time": req.appointment_time,
        "consultation_fee": fee,
        "additional_charges": additional_charges,
        "total_payable": total_payable,
        "currency": "INR"
    }

@router.post("")
@router.post("/book")
def book_appointment(req: AppointmentCreateRequest, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    # 1. Fetch doctor & organization
    doctor = find_one("doctors", lambda d: d.get("id") == req.doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    doc_display_name = doctor.get("name") or doctor.get("full_name") or "Doctor"

    # 2. Date validation: Prevent booking in the past
    today_str = datetime.now().strftime("%Y-%m-%d")
    if req.appointment_date < today_str:
        raise HTTPException(status_code=400, detail="Cannot book an appointment on a past date.")

    # 3. Doctor availability by weekday and leave
    try:
        appt_date_obj = datetime.strptime(req.appointment_date, "%Y-%m-%d")
        day_name = appt_date_obj.strftime("%A")
        avail_days = doctor.get("available_days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
        if day_name not in avail_days:
            raise HTTPException(
                status_code=400,
                detail=f"Dr. {doc_display_name} is not available on {day_name}s. Available days: {', '.join(avail_days)}"
            )
        from routes.doctors import is_doctor_on_leave
        on_leave, s_date, e_date, reason = is_doctor_on_leave(doctor, req.appointment_date)
        if on_leave:
            date_info = f" ({s_date} to {e_date})" if (s_date and e_date) else ""
            raise HTTPException(
                status_code=400,
                detail=f"Dr. {doc_display_name} is on leave on {req.appointment_date}{date_info}. Doctor Currently Unavailable – On Leave."
            )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # 4. Maximum Daily Appointment Capacity Enforcement
    max_capacity = int(doctor.get("slot_limits") or doctor.get("max_daily_patients") or 20)
    existing_day_appts = find_all(
        "appointments",
        lambda a: a.get("doctor_id") == req.doctor_id 
        and a.get("appointment_date") == req.appointment_date 
        and a.get("status") not in ["Cancelled", "Refunded"]
    )
    if len(existing_day_appts) >= max_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum daily appointment capacity ({max_capacity}) reached for Dr. {doc_display_name} on {req.appointment_date}. Please choose another date."
        )
    
    # 5. Prevent DOUBLE BOOKING on the same doctor, date, and slot
    existing_slot = find_one("appointments", lambda a: (
        a.get("doctor_id") == req.doctor_id and
        a.get("appointment_date") == req.appointment_date and
        a.get("appointment_time") == req.appointment_time and
        a.get("status") not in ["Cancelled", "Refunded"]
    ))
    if existing_slot:
        raise HTTPException(
            status_code=400,
            detail=f"Slot '{req.appointment_time}' on {req.appointment_date} is already booked for Dr. {doc_display_name}. Please select another slot."
        )

    # 3. Determine patient details
    patient_id = req.patient_id
    if current_user["role"] == "patient":
        patient = find_one("patients", lambda p: p.get("patient_id") == current_user.get("entity_id") or p.get("user_id") == current_user["sub"])
        if not patient:
            patient = find_one("patients", lambda p: p.get("patient_id") == "PAT-2026-000001")
        patient_id = patient["patient_id"]
        patient_name = patient["full_name"]
        patient_mobile = patient["mobile"]
        patient_health_id = patient["health_id"]
    else:
        # Hospital/clinic booking on behalf of patient
        patient = find_one("patients", lambda p: p.get("patient_id") == patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient record not found")
        patient_name = patient["full_name"]
        patient_mobile = patient["mobile"]
        patient_health_id = patient["health_id"]

    # 4. Generate unique appointment ID
    all_appts = find_all("appointments")
    next_num = len(all_appts) + 1
    appointment_id = f"APT-2026-{next_num:06d}"

    target_org_id = req.organization_id or doctor.get("organization_id") or doctor.get("hospital_id")
    org_table = "hospitals" if str(target_org_id).startswith("hosp") else "clinics"
    org = find_one(org_table, lambda o: o.get("id") == target_org_id)
    org_name = org.get("name", doctor.get("organization_name", "Medical Centre")) if org else doctor.get("organization_name", "Medical Centre")

    # Enforce verification & appointment availability controls
    if org:
        ver_status = (org.get("verification_status") or "verified").lower()
        if ver_status in ["pending_verification", "rejected", "action_required", "under_review", "pending"]:
            raise HTTPException(
                status_code=400,
                detail=f"Appointments are not available for {org.get('name', 'this provider')} because organization verification is pending or unapproved."
            )
        if org.get("appointment_availability_status") == "disabled":
            raise HTTPException(
                status_code=400,
                detail=f"Appointments are currently disabled for {org.get('name', 'this provider')} pending administrative enablement."
            )
        if org.get("account_status") == "suspended":
            raise HTTPException(
                status_code=400,
                detail=f"Appointments are currently unavailable because {org.get('name', 'this provider')} account is suspended."
            )

    token_count = len(existing_day_appts) + 1
    token_number = f"T-{token_count:02d}"

    new_appointment = {
        "id": appointment_id,
        "appointment_id": appointment_id,
        "token_number": token_number,
        "queue_position": token_count,
        "queue_status": "Waiting",
        "patient_id": patient_id,
        "patient_name": patient_name,
        "patient_mobile": patient_mobile,
        "patient_health_id": patient_health_id,
        "doctor_id": doctor["id"],
        "doctor_name": doc_display_name,
        "department": doctor.get("department", "General Medicine"),
        "specialization": doctor.get("specialization", "General Medicine"),
        "organization_id": doctor.get("organization_id"),
        "organization_name": org_name,
        "appointment_date": req.appointment_date,
        "appointment_time": req.appointment_time,
        "appointment_type": req.appointment_type,
        "consultation_fee": int(doctor.get("video_consultation_fee") or (doctor.get("consultation_fee", 500) * 0.9)) if ("video" in req.appointment_type.lower() or "tele" in req.appointment_type.lower()) else int(doctor.get("consultation_fee", 500)),
        "payment_status": "Confirmed (Online)",
        "payment_mode": "Online UPI Gateway",
        "status": "Confirmed",
        "chief_complaint": req.chief_complaint or f"Consultation with {doc_display_name}",
        "created_at": datetime.now().isoformat()
    }
    insert("appointments", new_appointment)

    # 5. Automatically add organization to patient's permitted_organizations if not already present
    if patient and doctor.get("organization_id") not in patient.get("permitted_organizations", []):
        perms = patient.get("permitted_organizations", [])
        perms.append(doctor.get("organization_id"))
        update("patients", patient["id"], {"permitted_organizations": perms}, id_field="id")

    # 6. Notifications for Doctor, Hospital, and Patient
    patient_user_identifier = patient.get("user_id") or patient.get("patient_id") or current_user.get("sub")
    target_org_id = doctor.get("organization_id")
    is_hospital_org = str(target_org_id).startswith("hosp")

    insert("notifications", {
        "id": f"notif-apt-pat-{next_num}",
        "user_id": patient_user_identifier,
        "role": "patient",
        "title": "Appointment Booked & Confirmed",
        "message": f"Your appointment {appointment_id} with {doc_display_name} at {org_name} is confirmed for {req.appointment_date} at {req.appointment_time}.",
        "type": "appointment",
        "link": "/dashboard/patient/appointments",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    })

    insert("notifications", {
        "id": f"notif-apt-org-{next_num}",
        "user_id": None,
        "organization_id": target_org_id,
        "role": "hospital" if is_hospital_org else "clinic",
        "title": "New Appointment Booked",
        "message": f"{patient_name} booked with {doc_display_name} for {req.appointment_date} at {req.appointment_time}.",
        "type": "appointment",
        "link": f"/dashboard/{'hospital' if is_hospital_org else 'clinic'}/appointments",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    })

    return {
        "message": "Appointment booked successfully!",
        "appointment": new_appointment
    }

@router.put("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: str,
    req: AppointmentStatusUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    appt = find_one("appointments", lambda a: a.get("id") == appointment_id or a.get("appointment_id") == appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    updates = {"status": req.status, "queue_status": req.status}
    if req.status == "Rescheduled":
        if not req.rescheduled_date or not req.rescheduled_time:
            raise HTTPException(status_code=400, detail="Rescheduled date and time must be provided")
        updates["appointment_date"] = req.rescheduled_date
        updates["appointment_time"] = req.rescheduled_time
    elif req.status == "Cancelled":
        updates["cancellation_reason"] = req.cancellation_reason or "Cancelled by user/provider"
        updates["payment_status"] = "Refund Initiated"

    updated = update("appointments", appt["id"], updates, id_field="id")

    # Notification to patient
    patient = find_one("patients", lambda p: p.get("patient_id") == appt.get("patient_id"))
    if patient and patient.get("user_id"):
        insert("notifications", {
            "id": f"notif-apt-status-{datetime.now().timestamp()}",
            "user_id": patient.get("user_id"),
            "role": "patient",
            "title": f"Appointment Status Updated: {req.status}",
            "message": f"Your appointment {appt['appointment_id']} with {appt['doctor_name']} is now '{req.status}'.",
            "type": "appointment",
            "link": "/dashboard/patient/appointments",
            "is_read": False,
            "created_at": datetime.now().isoformat()
        })

    return {
        "message": f"Appointment status changed to {req.status}",
        "appointment": updated
    }

@router.put("/{appointment_id}/cancel")
def cancel_appointment_endpoint(
    appointment_id: str,
    payload: Dict[str, Any] = Body(default={}),
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    appt = find_one("appointments", lambda a: a.get("id") == appointment_id or a.get("appointment_id") == appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    reason = payload.get("reason") or "Patient cancelled via portal"
    updates = {
        "status": "cancelled",
        "cancellation_reason": reason,
        "payment_status": "Refund Initiated"
    }
    updated = update("appointments", appt["id"], updates, id_field="id")
    return {
        "message": "Appointment cancelled successfully",
        "appointment": updated
    }

@router.put("/{appointment_id}/assign")
def assign_doctor_appointment(
    appointment_id: str,
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    if current_user["role"] not in ["hospital", "clinic", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    appt = find_one("appointments", lambda a: a.get("id") == appointment_id or a.get("appointment_id") == appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    target_doc_id = payload.get("doctor_id")
    if not target_doc_id:
        raise HTTPException(status_code=400, detail="Target doctor ID required")

    doctor = find_one("doctors", lambda d: d.get("id") == target_doc_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Conflict prevention: ensure target doctor is not already booked for this date and time
    appt_date = appt.get("appointment_date")
    appt_time = appt.get("appointment_time")
    conflict = find_one("appointments", lambda a: (
        a.get("id") != appt["id"] and
        a.get("doctor_id") == target_doc_id and
        a.get("appointment_date") == appt_date and
        a.get("appointment_time") == appt_time and
        a.get("status") not in ["Cancelled", "Refunded"]
    ))
    if conflict:
        raise HTTPException(
            status_code=400,
            detail=f"Conflict detected: Dr. {doctor.get('name')} already has an appointment ({conflict.get('appointment_id')}) at {appt_time} on {appt_date}."
        )

    old_doc = appt.get("doctor_name", "Unassigned")
    new_doc_name = doctor.get("name") or doctor.get("full_name") or "Doctor"

    history = appt.get("assignment_history", [])
    history.append({
        "from_doctor": old_doc,
        "to_doctor": new_doc_name,
        "to_doctor_id": target_doc_id,
        "assigned_by": current_user.get("role", "admin"),
        "notes": payload.get("notes", "Assigned"),
        "timestamp": datetime.now().isoformat()
    })

    updated = update("appointments", appt["id"], {
        "doctor_id": target_doc_id,
        "doctor_name": new_doc_name,
        "department": doctor.get("department", appt.get("department")),
        "specialization": doctor.get("specialization", appt.get("specialization")),
        "consultation_fee": doctor.get("consultation_fee", appt.get("consultation_fee")),
        "assignment_history": history
    }, id_field="id")

    log_audit_event(
        actor=current_user.get("role", "organization"),
        action="APPOINTMENT_ASSIGNED",
        target=f"{appt.get('appointment_id')}",
        category="Appointment Management",
        detail=f"Reassigned appointment {appt.get('appointment_id')} from {old_doc} to Dr. {new_doc_name}"
    )

    return {
        "message": f"Appointment successfully assigned to Dr. {new_doc_name}",
        "appointment": updated
    }

@router.put("/{appointment_id}/billing")
def update_appointment_billing(
    appointment_id: str,
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    if current_user["role"] not in ["hospital", "clinic", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    appt = find_one("appointments", lambda a: a.get("id") == appointment_id or a.get("appointment_id") == appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    old_fee = appt.get("consultation_fee", 0)
    updates = {}
    if "consultation_fee" in payload:
        updates["consultation_fee"] = float(payload["consultation_fee"])
    if "payment_status" in payload:
        updates["payment_status"] = payload["payment_status"]
    if "payment_mode" in payload:
        updates["payment_mode"] = payload["payment_mode"]
    if "payment_notes" in payload:
        updates["payment_notes"] = payload["payment_notes"]

    updates["billing_updated_at"] = datetime.now().isoformat()
    updated = update("appointments", appt["id"], updates, id_field="id")

    log_audit_event(
        actor=current_user.get("role", "organization"),
        action="CONSULTATION_FEE_UPDATED",
        target=f"{appt.get('appointment_id')}",
        category="Billing Management",
        detail=f"Updated billing for {appt.get('appointment_id')}: Fee changed from ₹{old_fee} to ₹{updates.get('consultation_fee', old_fee)}, Status: {updates.get('payment_status')}"
    )

    receipt = {
        "receipt_number": f"RCP-{appt.get('appointment_id', appt['id'])}",
        "appointment_id": appt.get("appointment_id"),
        "patient_name": appt.get("patient_name"),
        "doctor_name": appt.get("doctor_name"),
        "amount": updates.get("consultation_fee", old_fee),
        "payment_status": updates.get("payment_status", appt.get("payment_status", "paid")),
        "payment_mode": updates.get("payment_mode", "Cash / UPI"),
        "generated_at": datetime.now().isoformat()
    }

    return {
        "message": "Appointment billing details updated successfully",
        "appointment": updated,
        "receipt": receipt
    }

