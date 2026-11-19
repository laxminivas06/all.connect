from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import PatientConsentUpdateRequest
from database.db import find_all, find_one, update
from services.auth_utils import get_current_user_payload

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("/me")
def get_my_patient_data(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Access reserved for patient role")

    patient = find_one("patients", lambda p: p.get("patient_id") == current_user.get("entity_id") or p.get("user_id") == current_user["sub"])
    if not patient:
        patient = find_one("patients", lambda p: p.get("patient_id") == "PAT-2026-000001")

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
        {"id": h["id"], "name": h["name"], "type": "Hospital", "area": h["area"]}
        for h in hospitals
    ] + [
        {"id": c["id"], "name": c["name"], "type": "Clinic", "area": c["area"]}
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

@router.put("/consent")
def update_patient_consent(req: PatientConsentUpdateRequest, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] != "patient":
        raise HTTPException(status_code=403, detail="Only patients can manage their data sharing consents")
    
    patient = find_one("patients", lambda p: p.get("patient_id") == current_user.get("entity_id") or p.get("user_id") == current_user["sub"])
    if not patient:
        patient = find_one("patients", lambda p: p.get("patient_id") == "PAT-2026-000001")

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

    patient = find_one("patients", lambda p: p.get("patient_id") == current_user.get("entity_id") or p.get("user_id") == current_user["sub"])
    if not patient:
        patient = find_one("patients", lambda p: p.get("patient_id") == "PAT-2026-000001")
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    allowed_fields = [
        "full_name", "phone", "emergency_contact", "address",
        "blood_group", "allergies", "chronic_conditions", "notification_preferences"
    ]
    updates = {k: v for k, v in payload.items() if k in allowed_fields}

    updated = update("patients", patient["id"], updates, id_field="id")
    return {"message": "Profile updated successfully", "patient": updated}

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
