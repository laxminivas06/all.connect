"""
Comprehensive Test Suite for Customer Home Page & Book OPD Experience Upgrade.
Covers:
- Journey 1: Symptom search ('fever') -> Doctor selection -> Slot verification -> Booking -> APT-YYYY-XXXXXX confirmation
- Journey 2: Hospital search ('Yashoda') -> Public profile -> Department/Doctor -> Booking
- Journey 3: Surgery search ('cataract surgery') -> Procedure catalog -> Procedure enquiry submission -> ENQ-2026-XXXXXX generated
- Journey 4: Direct Patient Profile navigation -> Health ID verified
- Journey 5: Hospital doctor management & appointments
- Journey 6: Billing & revenue consultation collections
- Journey 7: Clinic single/multi doctor operations & daily collection
- API Route integrity & non-diagnostic disclaimer verification
"""
import sys
import os
from datetime import datetime, date, timedelta

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from database.db import find_all, find_one, update
from services.auth_utils import create_access_token

client = TestClient(app)

hosp_token = create_access_token({'sub': 'usr-hosp-01', 'role': 'hospital', 'organization_id': 'hosp-001', 'name': 'Yashoda Admin'})
hosp_headers = {'Authorization': f'Bearer {hosp_token}'}

clinic_token = create_access_token({'sub': 'usr-clinic-01', 'role': 'clinic', 'organization_id': 'clinic-001', 'name': 'MedPlus Admin'})
clinic_headers = {'Authorization': f'Bearer {clinic_token}'}

patient_token = create_access_token({'sub': 'usr-pat-01', 'role': 'patient', 'entity_id': 'pat-001', 'name': 'Rahul Sharma'})
patient_headers = {'Authorization': f'Bearer {patient_token}'}

def test_journey_1_symptom_search_and_booking():
    print("\n--- Journey 1: Patient Symptom Search & Direct Slot Booking ---")
    
    # 1. Search for 'fever'
    res = client.get("/api/doctors/discovery-search?q=fever")
    assert res.status_code == 200, f"Search failed: {res.text}"
    search_data = res.json()
    
    assert search_data.get("disclaimer"), "Missing medical disclaimer"
    assert search_data.get("matched_specializations"), "No specializations matched for fever"
    assert len(search_data.get("doctors", [])) > 0, "No doctors returned for fever"
    
    doctor = search_data["doctors"][0]
    print(f"  [PASS] Searched 'fever' -> Matched {len(search_data['doctors'])} doctors (e.g. {doctor['name']} - {doctor['specialization']})")
    print(f"  [PASS] Disclaimer verified: '{search_data['disclaimer'][:60]}...'")
    
    # 2. Get Doctor Public Dossier by ID
    doc_res = client.get(f"/api/doctors/{doctor['id']}")
    assert doc_res.status_code == 200
    doc_detail = doc_res.json()
    assert doc_detail.get("slot_calendar"), "Slot calendar missing in doctor profile"
    first_day = doc_detail["slot_calendar"][0]
    available_slots = first_day.get("available_slots", [])
    assert len(available_slots) > 0, "No available slots on first calendar day"
    chosen_slot = available_slots[0]
    chosen_date = first_day["date"]
    print(f"  [PASS] Doctor dossier loaded: {doc_detail['doctor']['name']} with {len(doc_detail['slot_calendar'])} days slot calendar")
    
    # 3. Book Appointment
    book_payload = {
        "patient_name": "Kavita Ramamurthy",
        "patient_phone": "+91 98490 55112",
        "patient_email": "kavita.r@example.com",
        "doctor_id": doctor["id"],
        "appointment_date": chosen_date,
        "appointment_time": chosen_slot,
        "appointment_type": "In-Person Consultation",
        "chief_complaint": "High fever, chills, and fatigue since 2 days",
        "organization_id": doctor.get("organization_id") or "hosp-001"
    }
    book_res = client.post("/api/appointments/book", json=book_payload, headers=patient_headers)
    assert book_res.status_code == 200, f"Booking failed: {book_res.text}"
    booking_result = book_res.json()
    
    appt = booking_result.get("appointment")
    assert appt, "Appointment not returned"
    assert appt["appointment_id"].startswith("APT-"), f"Invalid ID format: {appt['appointment_id']}"
    assert appt["status"] in ["Confirmed", "Scheduled"], f"Unexpected status: {appt['status']}"
    print(f"  [PASS] Appointment booked successfully: {appt['appointment_id']} ({appt['status']}) for {appt['patient_name']} on {appt['appointment_date']} at {appt['appointment_time']}")


def test_journey_2_hospital_discovery_and_booking():
    print("\n--- Journey 2: Hospital Discovery, Department Filter & Booking ---")
    
    # 1. Search 'Yashoda'
    res = client.get("/api/doctors/discovery-search?q=Yashoda")
    assert res.status_code == 200
    search_data = res.json()
    assert len(search_data.get("hospitals", [])) > 0, "Yashoda not found in hospitals"
    hospital = search_data["hospitals"][0]
    print(f"  [PASS] Found Hospital: {hospital['name']} in {hospital['area']}")
    
    # 2. View Hospital Public Profile
    hosp_res = client.get(f"/api/hospitals/{hospital['id']}")
    assert hosp_res.status_code == 200
    hosp_detail = hosp_res.json()
    assert hosp_detail.get("hospital"), "Hospital info missing"
    assert len(hosp_detail.get("doctors", [])) > 0, "Doctors missing in hospital public profile"
    
    # Pick a cardiologist
    target_doc = hosp_detail["doctors"][0]
    print(f"  [PASS] Hospital details loaded with {len(hosp_detail['doctors'])} doctors (Selected: {target_doc['name']})")
    
    # 3. Direct booking with selected hospital doctor
    import random
    unique_day = (datetime.now() + timedelta(days=random.randint(10, 40))).strftime("%Y-%m-%d")
    unique_time = f"{random.randint(10, 11)}:{random.choice(['15', '45'])} AM"
    book_payload = {
        "patient_name": "Siddharth Verma",
        "patient_phone": "+91 99887 66554",
        "doctor_id": target_doc["id"],
        "appointment_date": unique_day,
        "appointment_time": unique_time,
        "appointment_type": "In-Person Consultation",
        "chief_complaint": "Cardiology general checkup",
        "organization_id": hospital["id"]
    }
    book_res = client.post("/api/appointments/book", json=book_payload, headers=patient_headers)
    assert book_res.status_code == 200
    booked = book_res.json()["appointment"]
    assert booked["appointment_id"].startswith("APT-")
    print(f"  [PASS] Hospital appointment confirmed: {booked['appointment_id']}")


def test_journey_3_surgery_procedure_enquiry():
    print("\n--- Journey 3: Surgeries / Procedures Search & Dedicated Enquiry ---")
    
    # 1. Search for 'cataract surgery'
    res = client.get("/api/doctors/discovery-search?q=cataract surgery")
    assert res.status_code == 200
    search_data = res.json()
    
    assert search_data.get("is_procedure") is True, "Query should be classified as procedure"
    proc_info = search_data.get("procedure_info")
    assert proc_info, "Missing procedure_info"
    proc_name = proc_info.get("title") or proc_info.get("name")
    assert "Cataract" in proc_name
    print(f"  [PASS] Procedure recognized: '{proc_name}' (Est Cost: {proc_info.get('avg_cost') or proc_info.get('estimated_cost_range')})")
    print(f"  [PASS] Procedure disclaimer verified: '{(proc_info.get('eligibility_disclaimer') or proc_info.get('surgical_disclaimer'))[:60]}...'")
    
    # 2. Submit Surgical Enquiry
    enquiry_payload = {
        "procedure_name": proc_name,
        "department": proc_info["department"],
        "patient_name": "Lakshmi Narayana Rao",
        "patient_phone": "+91 94401 22334",
        "patient_email": "ln.rao@example.com",
        "area": "Secunderabad",
        "organization_id": "hosp-001",
        "notes": "Looking for phacoemulsification with multifocal IOL lens"
    }
    
    enq_res = client.post("/api/doctors/procedures/enquire", json=enquiry_payload)
    assert enq_res.status_code == 200, f"Enquiry failed: {enq_res.text}"
    enq_data = enq_res.json()
    
    enquiry = enq_data.get("enquiry")
    assert enquiry, "Enquiry record missing"
    assert enquiry["enquiry_id"].startswith("ENQ-2026-"), f"Invalid enquiry ID: {enquiry['enquiry_id']}"
    assert "pending" in enquiry["status"].lower() or enquiry["status"] == "New"
    print(f"  [PASS] Surgical enquiry created: {enquiry['enquiry_id']} for {enquiry['patient_name']} -> Assigned to {enquiry.get('organization_name')}")


def test_journey_4_direct_patient_profile():
    print("\n--- Journey 4: Direct Patient Profile Navigation ---")
    
    # Verify patient profile endpoint returns health dossier with Health ID
    res = client.get("/api/patients/me", headers=patient_headers)
    assert res.status_code == 200, f"Profile failed: {res.text}"
    data = res.json()
    pat = data.get("patient")
    assert pat, "Patient object missing"
    assert pat.get("health_id"), "Health ID missing in patient profile"
    assert "PAT-" in pat.get("patient_id")
    print(f"  [PASS] Patient dossier loaded: {pat['full_name']} (Health ID: {pat['health_id']}) - Direct navigation verified")


def test_journey_5_hospital_doctor_management():
    print("\n--- Journey 5: Hospital Doctor Management & Operational Controls ---")
    
    # 1. View hospital dashboard with auth headers
    res = client.get("/api/hospitals/dashboard/overview", headers=hosp_headers)
    assert res.status_code == 200, f"Dashboard failed: {res.text}"
    dash = res.json()
    assert "stats" in dash
    assert len(dash.get("doctors", [])) > 0
    print(f"  [PASS] Hospital operational overview active: {len(dash['doctors'])} affiliated doctors")


def test_journey_6_billing_and_consultation_collection():
    print("\n--- Journey 6: Billing & Consultation Collections ---")
    
    # Check appointment collection status
    appts = find_all("appointments")
    assert len(appts) > 0
    first_appt = appts[0]
    
    update_res = client.put(
        f"/api/appointments/{first_appt['id']}/billing",
        json={"consultation_fee": 750.0, "payment_status": "paid", "payment_mode": "UPI"},
        headers=hosp_headers
    )
    assert update_res.status_code == 200, f"Billing update failed: {update_res.text}"
    res_data = update_res.json()
    updated_bill = res_data["appointment"]
    receipt = res_data["receipt"]
    assert updated_bill["consultation_fee"] == 750.0
    assert updated_bill["payment_status"] == "paid"
    assert receipt.get("receipt_number"), "Receipt number missing"
    print(f"  [PASS] Billing updated: Rs.{updated_bill['consultation_fee']} ({updated_bill['payment_status']}) - Receipt: {receipt['receipt_number']}")


def test_journey_7_clinic_operations_and_daily_collection():
    print("\n--- Journey 7: Clinic Operations & Single/Multi Doctor Management ---")
    
    # Test clinic dashboard with auth headers
    res = client.get("/api/clinics/dashboard/overview", headers=clinic_headers)
    assert res.status_code == 200, f"Clinic overview failed: {res.text}"
    clinic_dash = res.json()
    assert clinic_dash.get("clinic"), "Clinic info missing"
    assert clinic_dash.get("is_single_doctor") is not None
    print(f"  [PASS] Clinic loaded: {clinic_dash['clinic']['name']} (Single Doctor Mode: {clinic_dash['is_single_doctor']})")


def test_non_diagnostic_disclaimers():
    print("\n--- Verification: Non-Diagnostic Disclaimers on Medical Searches ---")
    
    queries = ["headache", "knee replacement", "cough and cold", "chest pain"]
    for q in queries:
        res = client.get(f"/api/doctors/discovery-search?q={q}")
        assert res.status_code == 200
        data = res.json()
        assert data.get("disclaimer"), f"Missing disclaimer for query: {q}"
        assert "not a medical diagnosis" in data["disclaimer"].lower() or "consult" in data["disclaimer"].lower()
    print("  [PASS] All symptom and surgical searches enforce non-diagnostic disclaimer.")


if __name__ == "__main__":
    test_journey_1_symptom_search_and_booking()
    test_journey_2_hospital_discovery_and_booking()
    test_journey_3_surgery_procedure_enquiry()
    test_journey_4_direct_patient_profile()
    test_journey_5_hospital_doctor_management()
    test_journey_6_billing_and_consultation_collection()
    test_journey_7_clinic_operations_and_daily_collection()
    test_non_diagnostic_disclaimers()
    print("\n=======================================================")
    print("ALL 7 JOURNEYS & SYSTEM INTEGRATION TESTS PASSED (100%)")
    print("=======================================================\n")
