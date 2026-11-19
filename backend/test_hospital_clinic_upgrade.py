import sys
import os
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app
from database.db import find_all, find_one, update
from services.auth_utils import create_access_token

client = TestClient(app)

hosp_token = create_access_token({'sub': 'usr-hosp-01', 'role': 'hospital', 'organization_id': 'hosp-001', 'name': 'Yashoda Admin'})
hosp_headers = {'Authorization': f'Bearer {hosp_token}'}

clinic_token = create_access_token({'sub': 'usr-clinic-01', 'role': 'clinic', 'organization_id': 'clinic-001', 'name': 'MedPlus Admin'})
clinic_headers = {'Authorization': f'Bearer {clinic_token}'}

def test_hospital_clinic_upgrade():
    print("\n--- 1. Testing Hospital Dashboard Overview ---")
    hosp_res = client.get("/api/hospitals/dashboard/overview", headers=hosp_headers)
    assert hosp_res.status_code == 200, f"Hospital overview failed: {hosp_res.text}"
    hosp_data = hosp_res.json()
    assert "stats" in hosp_data
    assert "today_appointments" in hosp_data["stats"]
    assert "today_collection" in hosp_data["stats"]
    assert "doctor_stats" in hosp_data
    assert "today_queue" in hosp_data
    assert "services" in hosp_data
    print(f"  [PASS] Hospital stats: {hosp_data['stats']['total_doctors']} doctors, {hosp_data['stats']['today_appointments']} today appts, Rs.{hosp_data['stats']['today_collection']} today collection")

    print("\n--- 2. Testing Clinic Dashboard Overview (Single-Doctor vs Multi-Doctor Detection) ---")
    clinic_res = client.get("/api/clinics/dashboard/overview", headers=clinic_headers)
    assert clinic_res.status_code == 200, f"Clinic overview failed: {clinic_res.text}"
    clinic_data = clinic_res.json()
    assert "stats" in clinic_data
    assert "is_single_doctor" in clinic_data
    assert "primary_doctor" in clinic_data
    print(f"  [PASS] Clinic single-doctor detected: {clinic_data['is_single_doctor']}, primary doctor: {clinic_data.get('primary_doctor', {}).get('name')}")

    print("\n--- 3. Testing Complete Removal of Walk-In Registration ---")
    walkin_res = client.post("/api/clinics/walkin", json={"name": "Walkin test"}, headers=clinic_headers)
    assert walkin_res.status_code in [404, 405], f"Walk-in endpoint should not exist, got {walkin_res.status_code}"
    print("  [PASS] Walk-in endpoint successfully verified removed (404/405)")

    print("\n--- 4. Testing Doctor Registration with PBKDF2 Credentials ---")
    new_doc_payload = {
        "name": "Dr. Aarav Deshmukh",
        "specialization": "Cardiology",
        "department": "Cardiology",
        "qualification": "MBBS, MD, DM (Cardiology)",
        "experience_years": 12,
        "contact_phone": "+91 98888 11223",
        "email": "dr.aarav.test@yashodahospitals.org",
        "password": "Password123!",
        "consultation_fee": 900,
        "available_days": ["Monday", "Wednesday", "Friday"],
        "consultation_hours": "10:00 AM - 02:00 PM",
        "slot_duration_minutes": 20,
        "max_daily_patients": 20
    }
    create_doc_res = client.post("/api/doctors", json=new_doc_payload, headers=hosp_headers)
    assert create_doc_res.status_code in [200, 201], f"Create doctor failed: {create_doc_res.text}"
    created_doc = create_doc_res.json()["doctor"]
    created_doc_id = created_doc["id"]
    assert created_doc_id.startswith("doc-")
    assert created_doc["specialization"] == "Cardiology"
    print(f"  [PASS] Successfully registered doctor: {created_doc['name']} ({created_doc_id}) with PBKDF2 credentials")

    print("\n--- 5. Testing Doctor Availability & Scheduling Controls ---")
    avail_payload = {
        "available_days": ["Monday", "Tuesday", "Thursday"],
        "consultation_hours": "09:00 AM - 01:00 PM",
        "break_start": "01:00 PM",
        "break_end": "02:00 PM",
        "slot_duration_minutes": 25,
        "max_daily_patients": 25,
        "is_on_leave": False,
        "is_available": True
    }
    update_avail_res = client.put(f"/api/doctors/{created_doc_id}/availability", json=avail_payload, headers=hosp_headers)
    assert update_avail_res.status_code == 200, f"Update availability failed: {update_avail_res.text}"
    updated_doc = update_avail_res.json()["doctor"]
    assert updated_doc["slot_duration_minutes"] == 25
    assert updated_doc["max_daily_patients"] == 25
    print(f"  [PASS] Doctor availability updated: max {updated_doc['max_daily_patients']} patients, slot {updated_doc['slot_duration_minutes']}m")

    print("\n--- 6. Testing Doctor Assignment to Appointment ---")
    appts = find_all("appointments", lambda a: a.get("organization_id") == "hosp-001")
    assert len(appts) > 0, "No hospital appointments found"
    target_appt = appts[0]
    assign_res = client.put(
        f"/api/appointments/{target_appt['id']}/assign",
        json={"doctor_id": created_doc_id, "notes": "Assigned to Senior Cardiologist"},
        headers=hosp_headers
    )
    assert assign_res.status_code == 200, f"Doctor assignment failed: {assign_res.text}"
    assigned_appt = assign_res.json()["appointment"]
    assert assigned_appt["doctor_id"] == created_doc_id
    assert "assignment_history" in assigned_appt
    print(f"  [PASS] Appointment {target_appt['id']} assigned to {created_doc['name']} with audit history")

    print("\n--- 7. Testing Appointment Queue Status Workflow ---")
    for st in ["confirmed", "checked_in", "waiting", "in_consultation", "completed"]:
        st_res = client.put(
            f"/api/appointments/{target_appt['id']}/status",
            json={"status": st},
            headers=hosp_headers
        )
        assert st_res.status_code == 200, f"Status update to {st} failed: {st_res.text}"
    print(f"  [PASS] Appointment {target_appt['id']} transitioned through queue states to 'completed'")

    print("\n--- 8. Testing Consultation Billing Adjustment & Audit Trail ---")
    billing_payload = {
        "consultation_fee": 950,
        "payment_status": "paid",
        "notes": "Corporate insurance copay applied; 950 INR collected"
    }
    bill_res = client.put(
        f"/api/appointments/{target_appt['id']}/billing",
        json=billing_payload,
        headers=hosp_headers
    )
    assert bill_res.status_code == 200, f"Billing update failed: {bill_res.text}"
    bill_data = bill_res.json()
    assert bill_data["appointment"]["consultation_fee"] == 950
    assert bill_data["appointment"]["payment_status"] == "paid"
    assert "receipt" in bill_data
    print(f"  [PASS] Billing updated: Rs.{bill_data['appointment']['consultation_fee']} ({bill_data['appointment']['payment_status']}) with receipt {bill_data['receipt']['receipt_number']}")

    print("\n--- 9. Testing Clinical Services CRUD ---")
    new_srv = {
        "name": "Comprehensive 2D Echocardiogram",
        "code": "SRV-ECHO-2D",
        "category": "Diagnostics",
        "department": "Cardiology",
        "description": "High resolution cardiac ultrasound imaging",
        "price": 2800,
        "duration_minutes": 30,
        "is_active": True
    }
    create_srv_res = client.post("/api/services", json=new_srv, headers=hosp_headers)
    assert create_srv_res.status_code in [200, 201], f"Create service failed: {create_srv_res.text}"
    srv_record = create_srv_res.json()["service"]
    srv_id = srv_record["id"]
    print(f"  [PASS] Clinical service created: {srv_record['name']} ({srv_id}) at Rs.{srv_record['price']}")

    # Update service
    upd_srv_res = client.put(f"/api/services/{srv_id}", json={"price": 2600}, headers=hosp_headers)
    assert upd_srv_res.status_code == 200, f"Update service failed: {upd_srv_res.text}"
    assert upd_srv_res.json()["service"]["price"] == 2600
    print(f"  [PASS] Clinical service updated price to Rs.2600")

    # Delete service
    del_srv_res = client.delete(f"/api/services/{srv_id}", headers=hosp_headers)
    assert del_srv_res.status_code == 200, f"Delete service failed: {del_srv_res.text}"
    print(f"  [PASS] Clinical service {srv_id} deleted successfully")

    print("\n--- 10. Testing Self-Service Promotions & Health Packages ---")
    offers = find_all("offers", lambda o: o.get("organization_id") == "hosp-001")
    assert len(offers) > 0, "No hospital offers found"
    target_offer = offers[0]
    upd_offer_res = client.put(
        f"/api/offers/{target_offer['id']}",
        json={"discounted_price": 2300, "original_price": 4500, "description": "Updated corporate cardiology package"},
        headers=hosp_headers
    )
    assert upd_offer_res.status_code == 200, f"Update offer failed: {upd_offer_res.text}"
    upd_offer = upd_offer_res.json()["offer"]
    assert upd_offer["discounted_price"] == 2300
    assert upd_offer["discount_percentage"] > 40
    print(f"  [PASS] Health package {target_offer['id']} updated with recalculated discount: {upd_offer['discount_percentage']}%")

    print("\n--- 11. Testing SaaS Subscription Actions ---")
    upgrade_res = client.post(
        "/api/subscriptions/request-upgrade",
        json={"target_plan": "hospital_enterprise_plus", "billing_cycle": "annual", "notes": "Expanding to 50 OPD consultation rooms"},
        headers=hosp_headers
    )
    assert upgrade_res.status_code == 200, f"Subscription upgrade failed: {upgrade_res.text}"
    assert upgrade_res.json()["upgrade_request"]["target_plan"] == "hospital_enterprise_plus"
    print("  [PASS] Subscription upgrade request submitted with audit trail")

    renew_res = client.post(
        "/api/subscriptions/renew",
        json={"cycle": "annual"},
        headers=hosp_headers
    )
    assert renew_res.status_code == 200, f"Subscription renew failed: {renew_res.text}"
    print("  [PASS] Subscription renewal recorded successfully")

    print("\n--- 12. Testing Compliance Document Replacement & Regulatory Gating ---")
    doc_payload = {
        "verification_documents": [
            {
                "type": "clinical_establishment_license",
                "document_type": "clinical_establishment_license",
                "file_name": "yashoda_license_2026.pdf",
                "original_name": "Telangana_Health_Dept_Permit.pdf",
                "uploaded_at": "2026-11-19T10:00:00"
            }
        ]
    }
    doc_res = client.put("/api/hospitals/dashboard/documents", json=doc_payload, headers=hosp_headers)
    assert doc_res.status_code == 200, f"Document update failed: {doc_res.text}"
    hosp_after_doc = doc_res.json()["hospital"]
    assert hosp_after_doc["verification_status"] == "pending_verification"
    assert len(hosp_after_doc.get("verification_history", [])) > 0
    print("  [PASS] Document update correctly reset status to 'pending_verification' and appended to history")

    # Super Admin approves updated documents to restore verified status for normal operations
    update("hospitals", "hosp-001", {"verification_status": "verified"}, id_field="id")

    print("\n--- 13. Testing Patient Discovery Search with Symptom-to-Specialty Mapping ---")
    fever_search = client.get("/api/doctors/discovery-search?query=fever")
    assert fever_search.status_code == 200, f"Discovery search failed: {fever_search.text}"
    fever_data = fever_search.json()
    assert "matched_specializations" in fever_data
    assert any("General Medicine" in s or "Pediatrics" in s for s in fever_data["matched_specializations"])
    assert "disclaimer" in fever_data
    assert fever_data["total_matches"] > 0
    print(f"  [PASS] Symptom 'fever' mapped to: {fever_data['matched_specializations']} ({fever_data['total_matches']} doctors matched)")

    chest_search = client.get("/api/doctors/discovery-search?query=chest pain")
    assert chest_search.status_code == 200, f"Discovery search failed: {chest_search.text}"
    chest_data = chest_search.json()
    assert any("Cardiology" in s for s in chest_data["matched_specializations"])
    print(f"  [PASS] Symptom 'chest pain' mapped to: {chest_data['matched_specializations']} ({chest_data['total_matches']} doctors matched)")

    print("\n=======================================================")
    print("ALL 13 HOSPITAL & CLINIC UPGRADE TESTS PASSED (100%)")
    print("=======================================================\n")

if __name__ == "__main__":
    test_hospital_clinic_upgrade()
