import random
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import PrescriptionCreateRequest, UploadPrescriptionOCRRequest
from database.db import find_all, find_one, insert, update
from services.auth_utils import get_current_user_payload

router = APIRouter(prefix="/api/prescriptions", tags=["Prescriptions"])

@router.get("")
def list_prescriptions(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    role = current_user.get("role")
    entity_id = current_user.get("entity_id")
    org_id = current_user.get("organization_id")
    user_id = current_user.get("sub")

    if role == "patient":
        patient = find_one("patients", lambda p: p.get("patient_id") == entity_id or p.get("user_id") == user_id)
        pid = patient["patient_id"] if patient else "PAT-2026-000001"
        records = find_all("prescriptions", lambda pr: pr.get("patient_id") == pid)
    elif role == "doctor":
        records = find_all("prescriptions", lambda pr: pr.get("doctor_id") == entity_id)
    elif role in ["hospital", "clinic"]:
        records = find_all("prescriptions", lambda pr: pr.get("organization_id") == org_id)
    elif role == "super_admin":
        records = find_all("prescriptions")
    else:
        records = []

    return sorted(records, key=lambda x: x.get("created_at", ""), reverse=True)

@router.get("/{prescription_id}")
def get_prescription(prescription_id: str, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    prescription = find_one("prescriptions", lambda pr: pr.get("id") == prescription_id or pr.get("prescription_id") == prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription

@router.post("/create")
def create_digital_prescription(req: PrescriptionCreateRequest, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] not in ["doctor", "hospital", "clinic", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only authorized healthcare practitioners can issue digital prescriptions")

    # Doctor information
    doc_id = current_user.get("entity_id") or "doc-001"
    doctor = find_one("doctors", lambda d: d.get("id") == doc_id)
    if not doctor:
        doctor = find_one("doctors", lambda d: d.get("id") == "doc-001")

    # Patient information
    patient = find_one("patients", lambda p: p.get("patient_id") == req.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    prescriptions = find_all("prescriptions")
    next_num = len(prescriptions) + 101
    prescription_id = f"PRE-2026-{next_num:06d}"

    today_str = datetime.now().strftime("%Y-%m-%d")

    meds_dict = [m.model_dump() for m in req.medicines]

    record = {
        "id": prescription_id,
        "prescription_id": prescription_id,
        "appointment_id": req.appointment_id,
        "patient_id": patient["patient_id"],
        "patient_name": patient["full_name"],
        "health_id": patient["health_id"],
        "doctor_id": doctor["id"],
        "doctor_name": doctor["name"],
        "doctor_qualifications": doctor.get("qualifications", "MBBS, MD"),
        "organization_id": doctor.get("organization_id"),
        "organization_name": doctor.get("organization_name", "Medical Centre"),
        "consultation_date": today_str,
        "diagnosis": req.diagnosis,
        "symptoms": req.symptoms or "",
        "vitals": req.vitals or {},
        "medicines": meds_dict,
        "advice": req.advice or "Take all medicines as prescribed. Maintain adequate hydration.",
        "follow_up_date": req.follow_up_date,
        "status": "Authorized & Published",
        "type": "digital",
        "created_at": datetime.now().isoformat()
    }
    insert("prescriptions", record)

    # Update appointment status to Completed if linked
    if req.appointment_id:
        update("appointments", req.appointment_id, {"status": "Completed"}, id_field="id")

    # In-app notification to patient
    if patient.get("user_id"):
        insert("notifications", {
            "id": f"notif-rx-{next_num}",
            "user_id": patient.get("user_id"),
            "role": "patient",
            "title": f"Digital Prescription Issued ({prescription_id})",
            "message": f"{doctor['name']} has published your digital prescription. You can now order medicines online or download the copy.",
            "type": "prescription",
            "link": "/dashboard/patient/prescriptions",
            "is_read": False,
            "created_at": datetime.now().isoformat()
        })

    return {
        "message": "Prescription authorized and published to patient portal successfully!",
        "prescription": record
    }

@router.post("/simulate-ocr")
def simulate_ocr_prescription_analysis(req: Dict[str, Any]):
    """
    Simulates high-precision OCR extraction from camera photo or file upload.
    Returns structured detected candidate medicines, patient details, and doctor headers
    for verification before saving.
    """
    sample_ocr_scenarios = [
        {
            "extracted_doctor": "Dr. Ramesh Babu, MD (Medicine)",
            "extracted_clinic": "Sri Venkateshwara Medical Center, Tarnaka",
            "raw_text": "Rx:\n1. Tab. Metformin 500mg SR - 1-0-1 after food x 30 days\n2. Tab. Telmisartan 40mg - 1-0-0 morning x 30 days\n3. Tab. Pan 40mg - 1-0-0 empty stomach x 15 days\nReview with FBS/PPBS in 1 month.",
            "suggested_medicines": [
                {"name": "Metformin 500mg SR", "dosage": "500mg", "frequency": "Twice Daily (Morning & Night)", "duration": "30 Days", "instructions": "After meals"},
                {"name": "Telmisartan 40mg", "dosage": "40mg", "frequency": "Once Daily (Morning)", "duration": "30 Days", "instructions": "Fixed time"},
                {"name": "Pantoprazole 40mg", "dosage": "40mg", "frequency": "Once Daily (Morning)", "duration": "15 Days", "instructions": "Empty stomach"}
            ],
            "diagnosis_detected": "Type 2 Diabetes Mellitus & Hypertension",
            "confidence_score": 0.94
        },
        {
            "extracted_doctor": "Dr. Geetha S., MBBS, DNB (Chest)",
            "extracted_clinic": "Secunderabad Respiratory Clinic",
            "raw_text": "Rx:\n1. Tab Montair-LC (Montelukast + Levocet) - 0-0-1 night x 14 days\n2. Tab Dolo 650 - SOS for body pains\n3. Budesonide Inhaler 200 - 2 puffs BD",
            "suggested_medicines": [
                {"name": "Montelukast & Levocetirizine", "dosage": "10mg + 5mg", "frequency": "Once Daily (Night)", "duration": "14 Days", "instructions": "At bedtime"},
                {"name": "Paracetamol 650mg (Dolo)", "dosage": "650mg", "frequency": "When Required (SOS)", "duration": "5 Days", "instructions": "For fever or body pain"}
            ],
            "diagnosis_detected": "Allergic Bronchitis",
            "confidence_score": 0.91
        }
    ]
    chosen = random.choice(sample_ocr_scenarios)
    return chosen

@router.post("/upload-ocr")
def save_uploaded_ocr_prescription(req: UploadPrescriptionOCRRequest, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    patient = find_one("patients", lambda p: p.get("patient_id") == current_user.get("entity_id") or p.get("user_id") == current_user["sub"])
    if not patient:
        patient = find_one("patients", lambda p: p.get("patient_id") == (req.patient_id or "PAT-2026-000001"))

    prescriptions = find_all("prescriptions")
    next_num = len(prescriptions) + 101
    prescription_id = f"PRE-2026-{next_num:06d}"

    meds_dict = [m.model_dump() for m in req.medicines]

    record = {
        "id": prescription_id,
        "prescription_id": prescription_id,
        "patient_id": patient["patient_id"],
        "patient_name": patient["full_name"],
        "health_id": patient["health_id"],
        "doctor_id": None,
        "doctor_name": req.doctor_name or "External Doctor",
        "doctor_qualifications": "MBBS",
        "organization_id": None,
        "organization_name": req.organization_name or "External Healthcare Provider",
        "consultation_date": req.consultation_date or datetime.now().strftime("%Y-%m-%d"),
        "diagnosis": "Prescription Uploaded by Patient (OCR Verified)",
        "symptoms": "Prescription from previous consultation",
        "vitals": {},
        "medicines": meds_dict,
        "advice": req.advice or "OCR verified by patient.",
        "follow_up_date": None,
        "status": "Patient Uploaded (OCR Verified)",
        "type": "uploaded_ocr",
        "file_image": req.image_base64_or_name or "prescription_sample_scan.jpg",
        "created_at": datetime.now().isoformat()
    }
    insert("prescriptions", record)

    return {
        "message": "Prescription saved to your digital locker!",
        "prescription": record
    }
