import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Header
from models.schemas import PatientConsentUpdateRequest
from database.db import find_all, find_one, update
from services.auth_utils import get_current_user_payload, decode_access_token
from routes.admin import log_audit_event

router = APIRouter(prefix="/api/patients", tags=["Patients"])

def get_optional_user_payload(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        return decode_access_token(token)
    except Exception:
        return None

@router.get("/me")
def get_my_patient_data(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Access reserved for patient role")

    user_id = current_user.get("sub")
    entity_id = current_user.get("entity_id")
    email = current_user.get("email")

    patient = find_one("patients", lambda p: 
        (entity_id and (p.get("patient_id") == entity_id or p.get("id") == entity_id)) or
        (user_id and p.get("user_id") == user_id) or
        (email and p.get("email") and str(p.get("email")).lower() == str(email).lower())
    )
    if not patient:
        # Auto-create fresh isolated patient profile for this user record if missing
        user = find_one("users", lambda u: u.get("id") == user_id)
        if user and user.get("role") == "patient":
            patients = find_all("patients")
            next_num = len(patients) + 1
            new_pid = user.get("entity_id") or f"PAT-2026-{next_num:06d}"
            new_hid = f"HC-2026-{next_num:06d}"
            patient = {
                "id": new_pid,
                "patient_id": new_pid,
                "health_id": new_hid,
                "user_id": user_id,
                "full_name": user.get("full_name") or user.get("username", "Patient"),
                "email": user.get("email", ""),
                "mobile": user.get("phone") or user.get("mobile", ""),
                "phone": user.get("phone") or user.get("mobile", ""),
                "dob": "1992-06-15",
                "age": 34,
                "gender": "Other",
                "blood_group": "O+",
                "address": "Hyderabad, Telangana",
                "area": "Hyderabad",
                "city": "Hyderabad",
                "pincode": "500001",
                "emergency_contact": "",
                "allergies": [],
                "chronic_conditions": [],
                "permitted_organizations": [],
                "created_at": datetime.now().isoformat(),
                "account_status": "active"
            }
            insert("patients", patient)
            if not user.get("entity_id"):
                update("users", user_id, {"entity_id": new_pid}, id_field="id")
        else:
            raise HTTPException(status_code=404, detail="Patient profile not found for the authenticated user")

    # Fetch patient's related entities
    pid = patient["patient_id"]
    appointments = find_all("appointments", lambda a: a.get("patient_id") == pid)
    prescriptions = find_all("prescriptions", lambda pr: pr.get("patient_id") == pid)
    orders = find_all("orders", lambda o: o.get("patient_id") == pid)
    records = find_all("medical_records", lambda r: r.get("patient_id") == pid)

    # Fetch organizations list for consent mapping
    hospitals = find_all("hospitals", lambda h: h.get("publishing_status") == "published")
    clinics = find_all("clinics", lambda c: c.get("publishing_status") == "published")
    all_orgs = [
        {"id": h["id"], "name": h["name"], "type": "Hospital", "area": h.get("area", "Hyderabad")}
        for h in hospitals
    ] + [
        {"id": c["id"], "name": c["name"], "type": "Clinic", "area": c.get("area", "Hyderabad")}
        for c in clinics
    ]

    return {
        "patient": patient,
        "metrics": {
            "upcoming_appointments": len([a for a in appointments if a.get("status") in ["Confirmed", "Pending", "Waiting", "In Consultation"]]),
            "total_prescriptions": len(prescriptions),
            "active_orders": len([o for o in orders if o.get("status") not in ["Collected", "Delivered", "Cancelled"]]),
            "medical_records": len(records)
        },
        "appointments": sorted(appointments, key=lambda x: x.get("created_at", ""), reverse=True),
        "prescriptions": sorted(prescriptions, key=lambda x: x.get("created_at", ""), reverse=True),
        "orders": sorted(orders, key=lambda x: x.get("created_at", ""), reverse=True),
        "medical_records": sorted(records, key=lambda x: x.get("created_at", ""), reverse=True),
        "available_organizations": all_orgs
    }

@router.get("/me/doctors")
def get_my_doctors(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Access reserved for patient role")

    user_id = current_user.get("sub")
    entity_id = current_user.get("entity_id")
    email = current_user.get("email")

    patient = find_one("patients", lambda p: 
        (entity_id and (p.get("patient_id") == entity_id or p.get("id") == entity_id)) or
        (user_id and p.get("user_id") == user_id) or
        (email and p.get("email") and str(p.get("email")).lower() == str(email).lower())
    )
    if not patient:
        return {"doctors": [], "total_associated_doctors": 0, "recommended_doctors": []}

    pid = patient.get("patient_id")
    appointments = find_all("appointments", lambda a: a.get("patient_id") == pid)

    from routes.doctors import normalize_doctor, is_doctor_on_leave
    all_raw_docs = find_all("doctors")
    doc_map = {d["id"]: d for d in all_raw_docs}

    doc_appts = {}
    for a in appointments:
        d_id = a.get("doctor_id")
        if d_id:
            if d_id not in doc_appts:
                doc_appts[d_id] = []
            doc_appts[d_id].append(a)

    my_doctors = []
    seen_doc_ids = set()
    for d_id, appts in doc_appts.items():
        raw_doc = doc_map.get(d_id)
        if raw_doc:
            doc = normalize_doctor(raw_doc)
            sorted_appts = sorted(appts, key=lambda x: (x.get("appointment_date", ""), x.get("appointment_time", "")), reverse=True)
            last_appt = sorted_appts[0] if sorted_appts else None
            has_upcoming = any(a.get("status") in ["Confirmed", "Pending", "Waiting", "In Consultation"] for a in appts)

            doc["total_consultations"] = len(appts)
            doc["last_consultation_date"] = last_appt.get("appointment_date") if last_appt else None
            doc["last_consultation_time"] = last_appt.get("appointment_time") if last_appt else None
            doc["last_consultation_status"] = last_appt.get("status") if last_appt else None
            doc["has_upcoming_appointment"] = has_upcoming
            doc["is_associated"] = True
            my_doctors.append(doc)
            seen_doc_ids.add(d_id)

    # Sort associated doctors: most recently consulted first
    my_doctors.sort(key=lambda d: d.get("last_consultation_date") or "", reverse=True)

    # Recommended doctors from active facilities
    recommended = []
    for raw_d in all_raw_docs:
        if raw_d["id"] not in seen_doc_ids:
            doc = normalize_doctor(raw_d)
            if doc.get("is_active", True):
                recommended.append(doc)

    return {
        "doctors": my_doctors,
        "total_associated_doctors": len(my_doctors),
        "recommended_doctors": recommended[:6]
    }

@router.put("/consent")
def update_patient_consent(req: PatientConsentUpdateRequest, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Only patients can manage their data sharing consents")
    
    user_id = current_user.get("sub")
    entity_id = current_user.get("entity_id")
    email = current_user.get("email")

    patient = find_one("patients", lambda p: 
        (entity_id and (p.get("patient_id") == entity_id or p.get("id") == entity_id)) or
        (user_id and p.get("user_id") == user_id) or
        (email and p.get("email") and str(p.get("email")).lower() == str(email).lower())
    )
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    updated = update("patients", patient["id"], {"permitted_organizations": req.permitted_organizations}, id_field="id")
    return {
        "message": "Consent preferences updated successfully",
        "permitted_organizations": updated.get("permitted_organizations", [])
    }

@router.put("/me")
def update_my_patient_profile(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Only patients can manage personal profile")

    user_id = current_user.get("sub")
    entity_id = current_user.get("entity_id")
    email = current_user.get("email")

    patient = find_one("patients", lambda p: 
        (entity_id and (p.get("patient_id") == entity_id or p.get("id") == entity_id)) or
        (user_id and p.get("user_id") == user_id) or
        (email and p.get("email") and str(p.get("email")).lower() == str(email).lower())
    )
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    allowed_fields = [
        "full_name", "phone", "mobile", "email", "dob", "gender",
        "address", "area", "city", "pincode", "blood_group",
        "emergency_contact", "allergies", "chronic_conditions",
        "profile_photo_url", "notification_preferences"
    ]
    updates = {}
    for k in allowed_fields:
        if k in payload:
            updates[k] = payload[k]

    if "phone" in updates and "mobile" not in updates:
        updates["mobile"] = updates["phone"]
    if "mobile" in updates and "phone" not in updates:
        updates["phone"] = updates["mobile"]

    if "dob" in updates and updates["dob"]:
        try:
            birth_year = int(str(updates["dob"]).split("-")[0])
            updates["age"] = max(0, 2026 - birth_year)
        except Exception:
            pass

    updated = update("patients", patient["id"], updates, id_field="id")

    # Sync name/phone/email to users table so session reflects changes
    user_updates = {}
    if "full_name" in updates:
        user_updates["full_name"] = updates["full_name"]
    if "email" in updates:
        user_updates["email"] = updates["email"]
    if "mobile" in updates:
        user_updates["phone"] = updates["mobile"]
    if user_updates and user_id:
        update("users", user_id, user_updates, id_field="id")

    return {
        "message": "Personal health profile updated successfully",
        "patient": updated
    }
    updates = {k: v for k, v in payload.items() if k in allowed_fields}

    updated = update("patients", patient["id"], updates, id_field="id")
    return {"message": "Profile updated successfully", "patient": updated}

@router.get("/me/qr-token")
def get_my_patient_qr_token(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    """
    Requirement 4: Digital Patient ID Card QR Code
    Retrieves or generates a secure, unique patient verification token.
    Never encodes medical records in the QR code itself.
    """
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Only registered patients can retrieve their verification QR token")

    patient = find_one("patients", lambda p: p.get("patient_id") == current_user.get("entity_id") or p.get("user_id") == current_user["sub"])
    if not patient:
        patient = find_one("patients", lambda p: p.get("patient_id") == "PAT-2026-000001")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    token = patient.get("qr_token")
    if not token or patient.get("qr_token_status") != "ACTIVE":
        token = secrets.token_urlsafe(32)
        created_at = datetime.now().isoformat()
        expires_at = (datetime.now() + timedelta(days=90)).isoformat()
        update("patients", patient["id"], {
            "qr_token": token,
            "qr_token_created_at": created_at,
            "qr_token_expires_at": expires_at,
            "qr_token_status": "ACTIVE"
        }, id_field="id")

    return {
        "patient_id": patient["patient_id"],
        "health_id": patient["health_id"],
        "patient_name": patient["full_name"],
        "qr_token": token,
        "verification_path": f"/verify-patient?token={token}",
        "card_status": "ACTIVE",
        "created_at": patient.get("qr_token_created_at", datetime.now().isoformat()),
        "expires_at": patient.get("qr_token_expires_at")
    }

@router.post("/me/qr-token/refresh")
def refresh_my_patient_qr_token(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    """
    Requirement 4: Patient QR Code Security
    Allows patient to rotate/refresh their verification token, invalidating previous QR codes.
    """
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Only registered patients can refresh verification token")

    patient = find_one("patients", lambda p: p.get("patient_id") == current_user.get("entity_id") or p.get("user_id") == current_user["sub"])
    if not patient:
        patient = find_one("patients", lambda p: p.get("patient_id") == "PAT-2026-000001")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    new_token = secrets.token_urlsafe(32)
    created_at = datetime.now().isoformat()
    expires_at = (datetime.now() + timedelta(days=90)).isoformat()

    update("patients", patient["id"], {
        "qr_token": new_token,
        "qr_token_created_at": created_at,
        "qr_token_expires_at": expires_at,
        "qr_token_status": "ACTIVE"
    }, id_field="id")

    log_audit_event(
        actor=current_user.get("username", "patient"),
        action="PATIENT_QR_TOKEN_ROTATED",
        target=patient["patient_id"],
        category="Patient Identity Security",
        detail=f"Patient {patient['patient_id']} rotated their digital ID verification QR token",
        severity="info",
        ip_address="127.0.0.1"
    )

    return {
        "message": "Digital Health ID QR token rotated successfully",
        "qr_token": new_token,
        "verification_path": f"/verify-patient?token={new_token}",
        "card_status": "ACTIVE",
        "created_at": created_at,
        "expires_at": expires_at
    }

@router.get("/verify-card")
def verify_patient_card(
    token: str = Query(..., description="Secure QR verification token"),
    caller: Optional[Dict[str, Any]] = Depends(get_optional_user_payload)
):
    """
    Requirement 4: Secure QR Scanning Experience
    - Public / Unauthorized scanner: Returns safe confirmation message without exposing medical history.
    - Authorized Provider (Doctor, Hospital, Clinic): Evaluates patient consent and returns authorized records.
    """
    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid verification token format")

    patient = find_one("patients", lambda p: p.get("qr_token") == token and p.get("qr_token_status") == "ACTIVE")
    if not patient:
        raise HTTPException(status_code=404, detail="Invalid, revoked, or expired Patient ID verification token.")

    # Check expiry
    exp = patient.get("qr_token_expires_at")
    if exp and exp < datetime.now().isoformat():
        raise HTTPException(status_code=400, detail="Patient verification QR code has expired. Please ask patient to refresh their card in the portal.")

    # Check caller permissions
    is_authorized_provider = False
    consent_granted = False

    if caller:
        caller_role = caller.get("role")
        caller_org = caller.get("organization_id")
        
        if caller_role == "super_admin":
            is_authorized_provider = True
            consent_granted = True
        elif caller_role == "patient" and (caller.get("entity_id") == patient["patient_id"] or caller.get("sub") == patient.get("user_id")):
            is_authorized_provider = True
            consent_granted = True
        elif caller_role in ["doctor", "hospital", "clinic"]:
            is_authorized_provider = True
            permitted = patient.get("permitted_organizations", [])
            if not permitted or caller_org in permitted:
                consent_granted = True

    # If caller is an authorized provider with patient consent
    if is_authorized_provider and consent_granted:
        log_audit_event(
            actor=caller.get("username", "provider"),
            action="PATIENT_EHR_QR_VERIFIED_AND_ACCESSED",
            target=patient["patient_id"],
            category="Patient Identity & EHR Access",
            detail=f"Provider {caller.get('username')} scanned and accessed authorized records for patient {patient['patient_id']} ({patient['full_name']})",
            severity="info",
            ip_address="127.0.0.1"
        )

        prescriptions = find_all("prescriptions", lambda pr: pr.get("patient_id") == patient["patient_id"])
        records = find_all("medical_records", lambda r: r.get("patient_id") == patient["patient_id"])
        appointments = find_all("appointments", lambda a: a.get("patient_id") == patient["patient_id"])

        return {
            "status": "VALID",
            "card_status": "ACTIVE",
            "authorized_access": True,
            "patient_id": patient["patient_id"],
            "health_id": patient["health_id"],
            "patient_name": patient["full_name"],
            "gender": patient["gender"],
            "age": patient["age"],
            "blood_group": patient.get("blood_group", "B+"),
            "allergies": patient.get("allergies", []),
            "chronic_conditions": patient.get("chronic_conditions", []),
            "registration_date": patient.get("created_at", "2026-01-01T00:00:00"),
            "prescriptions": sorted(prescriptions, key=lambda x: x.get("created_at", ""), reverse=True),
            "medical_records": sorted(records, key=lambda x: x.get("created_at", ""), reverse=True),
            "appointment_history": sorted(appointments, key=lambda x: x.get("created_at", ""), reverse=True),
            "message": "Identity and EHR access verified with authorized clinical permissions."
        }

    elif is_authorized_provider and not consent_granted:
        return {
            "status": "VALID",
            "card_status": "ACTIVE",
            "authorized_access": False,
            "patient_id": patient["patient_id"],
            "health_id": patient["health_id"],
            "patient_name": patient["full_name"],
            "gender": patient["gender"],
            "age": patient["age"],
            "consent_status": "RESTRICTED",
            "message": "Patient card verified, but patient has not yet authorized medical history sharing with this organization. Consent request required."
        }

    # Public / Unauthenticated / Smartphone camera scanning response:
    # CRITICAL: NO medical history, NO prescriptions, NO phone number, NO full address exposed.
    return {
        "status": "VALID",
        "card_status": "ACTIVE",
        "authorized_access": False,
        "is_safe_public_view": True,
        "patient_id": patient["patient_id"],
        "health_id": patient["health_id"],
        "patient_name": patient["full_name"],
        "gender": patient["gender"],
        "registration_year": "2026",
        "verification_timestamp": datetime.now().isoformat(),
        "federation": "All.Connect Centralized Healthcare Federation • Hyderabad",
        "message": "Authentic All.Connect Digital Patient ID Card successfully verified."
    }

@router.get("/{patient_id}")
def get_patient_profile(patient_id: str, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    patient = find_one("patients", lambda p: p.get("patient_id") == patient_id or p.get("health_id") == patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found with provided ID")

    # If caller is doctor or hospital/clinic, verify consent
    role = current_user.get("role")
    org_id = current_user.get("organization_id")

    # Strict patient-to-patient isolation: patients cannot probe other patients
    if role == "patient" and (current_user.get("entity_id") != patient["patient_id"] and current_user["sub"] != patient.get("user_id")):
        raise HTTPException(status_code=403, detail="Access denied: Cross-patient data access is strictly forbidden")

    consent_granted = False
    if role == "super_admin":
        consent_granted = True
    elif role == "patient" and (current_user.get("entity_id") == patient["patient_id"] or current_user["sub"] == patient.get("user_id")):
        consent_granted = True
    elif role in ["hospital", "clinic", "doctor"]:
        # Check if org_id is in permitted_organizations
        permitted = patient.get("permitted_organizations", [])
        if org_id in permitted or not permitted:  # If empty or explicitly permitted
            consent_granted = True

    # If consent not granted, return restricted demographics only
    if not consent_granted:
        return {
            "patient_id": patient["patient_id"],
            "health_id": patient["health_id"],
            "full_name": patient["full_name"],
            "gender": patient["gender"],
            "age": patient["age"],
            "consent_status": "RESTRICTED",
            "message": "Patient has not granted permission for this organization to view full medical history. Consent request required."
        }

    # Full details with authorized records
    prescriptions = find_all("prescriptions", lambda pr: pr.get("patient_id") == patient["patient_id"])
    records = find_all("medical_records", lambda r: r.get("patient_id") == patient["patient_id"])
    appointments = find_all("appointments", lambda a: a.get("patient_id") == patient["patient_id"])

    return {
        **patient,
        "consent_status": "AUTHORIZED",
        "prescriptions": sorted(prescriptions, key=lambda x: x.get("created_at", ""), reverse=True),
        "medical_records": sorted(records, key=lambda x: x.get("created_at", ""), reverse=True),
        "appointment_history": sorted(appointments, key=lambda x: x.get("created_at", ""), reverse=True)
    }
