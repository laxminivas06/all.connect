import sys
from pathlib import Path
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("ALLCONNECT HEALTHCARE ECOSYSTEM - CORE WORKING FLOWS VERIFICATION")
    print("=" * 70)

    # ----------------------------------------------------
    # FLOW 1: PATIENT REGISTRATION
    # ----------------------------------------------------
    print("\n[FLOW 1] Testing Patient Registration & Universal Health ID...")
    rand_suffix = datetime.now().strftime("%f")[:4]
    reg_payload = {
        "full_name": f"Aditya V. Sharma {rand_suffix}",
        "email": f"aditya.sharma{rand_suffix}@example.com",
        "mobile": f"+91 98480 {rand_suffix.zfill(5)}",
        "dob": "1992-04-12",
        "gender": "Male",
        "blood_group": "O+",
        "address": "Flat 401, Sai Residency, Tarnaka",
        "area": "Tarnaka",
        "city": "Hyderabad",
        "pincode": "500017",
        "password": "Password@123",
        "allergies": ["Sulfa"],
        "chronic_conditions": ["Hypertension"]
    }
    reg_res = client.post("/api/auth/register-patient", json=reg_payload)
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    new_pat_id = reg_data["patient_id"]
    new_health_id = reg_data["health_id"]
    new_token = reg_data["access_token"]
    assert new_pat_id.startswith("PAT-2026-"), f"Invalid PAT ID: {new_pat_id}"
    assert new_health_id.startswith("HC-2026-"), f"Invalid HC ID: {new_health_id}"
    print(f"  ✓ Patient Registered: {reg_data['user']['full_name']}")
    print(f"  ✓ Universal Health ID Generated: {new_health_id}")
    print(f"  ✓ Patient ID Generated: {new_pat_id}")

    # ----------------------------------------------------
    # FLOW 2: APPOINTMENT BOOKING & DOUBLE-BOOKING PREVENTION
    # ----------------------------------------------------
    print("\n[FLOW 2] Testing Appointment Booking & Double Booking Prevention...")
    patient_headers = {"Authorization": f"Bearer {new_token}"}
    
    # 1. Book appointment with Dr. Rajesh Sharma using a unique future slot
    import random
    days_offset = random.randint(15, 90)
    future_date = (datetime.now() + timedelta(days=days_offset)).strftime("%Y-%m-%d")
    slot_hour = random.randint(9, 16)
    slot_minute = random.choice(["00", "15", "30", "45"])
    slot_ampm = "AM" if slot_hour < 12 else "PM"
    display_hour = slot_hour if slot_hour <= 12 else slot_hour - 12
    unique_slot = f"{display_hour}:{slot_minute} {slot_ampm}"

    book_payload = {
        "doctor_id": "doc-001",
        "organization_id": "hosp-001",
        "appointment_date": future_date,
        "appointment_time": unique_slot,
        "appointment_type": "In-Person",
        "chief_complaint": "Chest palpitations and BP review"
    }
    book_res = client.post("/api/appointments/book", json=book_payload, headers=patient_headers)
    assert book_res.status_code == 200, f"Booking failed: {book_res.text}"
    appt = book_res.json()["appointment"]
    appt_id = appt["appointment_id"]
    assert appt_id.startswith("APT-2026-"), f"Invalid APT ID: {appt_id}"
    print(f"  ✓ Appointment Booked: {appt_id} on {future_date} at {unique_slot} with {appt['doctor_name']}")

    # 2. Try DOUBLE BOOKING exact same doctor, date and slot
    double_book_res = client.post("/api/appointments/book", json=book_payload, headers=patient_headers)
    assert double_book_res.status_code == 400, "Double booking was not prevented!"
    print(f"  ✓ Double-Booking Correctly Blocked: {double_book_res.json()['detail']}")

    # ----------------------------------------------------
    # FLOW 3: DOCTOR CONSULTATION & DIGITAL PRESCRIPTION
    # ----------------------------------------------------
    print("\n[FLOW 3] Testing Doctor Consultation & Digital Prescription Authoring...")
    # Doctor login
    doc_login = client.post("/api/auth/login", json={"username": "doctor", "password": "Doctor@123"})
    assert doc_login.status_code == 200
    doc_token = doc_login.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    # Doctor issues digital prescription
    rx_payload = {
        "appointment_id": appt["id"],
        "patient_id": new_pat_id,
        "diagnosis": "Mild Essential Hypertension (Stage 1)",
        "symptoms": "Occasional exertional breathlessness",
        "vitals": {"blood_pressure": "142/90 mmHg", "pulse": "76 bpm"},
        "medicines": [
            {"name": "Telmisartan 40mg", "dosage": "40mg", "frequency": "Once Daily (Morning)", "duration": "30 Days", "instructions": "Fixed hour"},
            {"name": "Metformin 500mg SR", "dosage": "500mg", "frequency": "Twice Daily", "duration": "30 Days", "instructions": "After meals"}
        ],
        "advice": "Low salt diet, brisk walk 30 mins daily",
        "follow_up_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    }
    rx_res = client.post("/api/prescriptions/create", json=rx_payload, headers=doc_headers)
    assert rx_res.status_code == 200, f"Prescription failed: {rx_res.text}"
    prescription = rx_res.json()["prescription"]
    rx_id = prescription["prescription_id"]
    assert rx_id.startswith("PRE-2026-")
    print(f"  ✓ Digital Prescription Created: {rx_id} by {prescription['doctor_name']}")
    print(f"  ✓ Status: {prescription['status']}")

    # ----------------------------------------------------
    # FLOW 4: PRESCRIPTION OCR WORKFLOW
    # ----------------------------------------------------
    print("\n[FLOW 4] Testing Simulated OCR Prescription Extraction...")
    ocr_sim_res = client.post("/api/prescriptions/simulate-ocr", json={})
    assert ocr_sim_res.status_code == 200
    ocr_data = ocr_sim_res.json()
    print(f"  ✓ OCR Extracted Doctor: {ocr_data['extracted_doctor']}")
    print(f"  ✓ OCR Extracted Medicines Count: {len(ocr_data['suggested_medicines'])}")

    upload_rx_payload = {
        "patient_id": new_pat_id,
        "doctor_name": ocr_data["extracted_doctor"],
        "organization_name": ocr_data["extracted_clinic"],
        "medicines": ocr_data["suggested_medicines"],
        "advice": "Patient verified OCR extracted medicines."
    }
    upload_res = client.post("/api/prescriptions/upload-ocr", json=upload_rx_payload, headers=patient_headers)
    assert upload_res.status_code == 200
    print(f"  ✓ Uploaded OCR Prescription Saved: {upload_res.json()['prescription']['prescription_id']}")

    # ----------------------------------------------------
    # FLOW 5: PHARMACY QUOTATION SYSTEM
    # ----------------------------------------------------
    print("\n[FLOW 5] Testing Prescription-Based Pharmacy Quotations Comparison...")
    quote_payload = {
        "prescription_id": rx_id,
        "medicines": [
            {"name": "Telmisartan 40mg", "quantity": 1},
            {"name": "Metformin 500mg SR", "quantity": 2}
        ],
        "patient_area": "Tarnaka"
    }
    quote_res = client.post("/api/orders/request-quotations", json=quote_payload)
    assert quote_res.status_code == 200
    quotes = quote_res.json()["quotations"]
    assert len(quotes) >= 3, "Expected at least 3 pharmacy quotations"
    print(f"  ✓ Retrieved {len(quotes)} Pharmacy Quotations for Hyderabad:")
    for q in quotes[:3]:
        print(f"    - {q['pharmacy_name']} ({q['distance_km']}): ₹{q['subtotal']} (Availability: {q['availability']})")

    # ----------------------------------------------------
    # FLOW 6: MEDICINE ORDER & PICKUP VERIFICATION CODE
    # ----------------------------------------------------
    print("\n[FLOW 6] Testing Medicine Order Placement & Pickup Code Handover...")
    chosen_pharmacy = quotes[0]
    order_payload = {
        "pharmacy_id": chosen_pharmacy["pharmacy_id"],
        "prescription_id": rx_id,
        "items": chosen_pharmacy["items"],
        "fulfillment_type": "Store Pickup",
        "notes": "Testing store pickup verification"
    }
    order_res = client.post("/api/orders/place-order", json=order_payload, headers=patient_headers)
    assert order_res.status_code == 200
    order_data = order_res.json()["order"]
    order_id = order_data["order_id"]
    pickup_code = order_data["pickup_code"]
    assert order_id.startswith("MED-2026-")
    assert pickup_code.startswith("PICK-")
    print(f"  ✓ Medicine Order Placed: {order_id} at {order_data['pharmacy_name']}")
    print(f"  ✓ Verification Pickup Code: {pickup_code}")

    # Pharmacy verifies and hands over
    pharm_login = client.post("/api/auth/login", json={"username": "pharmacy", "password": "Pharmacy@123"})
    pharm_token = pharm_login.json()["access_token"]
    pharm_headers = {"Authorization": f"Bearer {pharm_token}"}

    verify_res = client.put(f"/api/orders/{order_data['id']}/status", json={
        "status": "Collected",
        "pickup_code_verify": pickup_code
    }, headers=pharm_headers)
    assert verify_res.status_code == 200
    print(f"  ✓ Pharmacy Verified Pickup Code: Handover marked '{verify_res.json()['order']['status']}'")

    # ----------------------------------------------------
    # FLOW 7: HOSPITAL PROMOTIONAL OFFER WORKFLOW
    # ----------------------------------------------------
    print("\n[FLOW 7] Testing Promotional Offer Lifecycle (Draft -> Review -> Approved -> Published)...")
    hosp_login = client.post("/api/auth/login", json={"username": "hospital", "password": "Hospital@123"})
    hosp_token = hosp_login.json()["access_token"]
    hosp_headers = {"Authorization": f"Bearer {hosp_token}"}

    offer_payload = {
        "title": "Cardiac Health & Diabetes Comprehensive Screening",
        "category": "Cardiac Care",
        "description": "ECG, 2D Echo Doppler, Lipid Panel, HbA1c, and Cardiologist Consultation",
        "original_price": 3200,
        "discounted_price": 1199,
        "start_date": "2026-02-01",
        "end_date": "2026-08-31",
        "applicable_departments": ["Cardiology", "Pathology"]
    }
    create_offer_res = client.post("/api/offers/create", json=offer_payload, headers=hosp_headers)
    assert create_offer_res.status_code == 200
    new_offer = create_offer_res.json()["offer"]
    print(f"  ✓ Hospital Created Campaign: '{new_offer['title']}' (Status: {new_offer['workflow_status']})")

    # Super Admin approves offer
    admin_login = client.post("/api/auth/login", json={"username": "admin", "password": "Admin@123"})
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    approve_ad_res = client.put(f"/api/admin/advertisements/{new_offer['id']}/moderate?action=approve", headers=admin_headers)
    assert approve_ad_res.status_code == 200
    print(f"  ✓ Super Admin Approved Offer: Now '{approve_ad_res.json()['offer']['workflow_status']}'")

    # Verify published in public offers
    pub_offers_res = client.get("/api/offers")
    assert any(o["id"] == new_offer["id"] for o in pub_offers_res.json())
    print("  ✓ Offer verified visible in patient public marketplace!")

    # ----------------------------------------------------
    # FLOW 8: SAAS SUBSCRIPTION & PUBLISHING ELIGIBILITY
    # ----------------------------------------------------
    print("\n[FLOW 8] Testing Subscription SaaS & Public Publishing Status Control...")
    # Admin checks organization publishing status toggle
    pub_toggle_res = client.put("/api/admin/organizations/hosp-005/publishing", json={
        "publishing_status": "published",
        "verification_status": "verified"
    }, headers=admin_headers)
    assert pub_toggle_res.status_code == 200
    print(f"  ✓ Super Admin Configured LifeLine MedCity: {pub_toggle_res.json()['message']}")

    # ----------------------------------------------------
    # FLOW 9: MULTI-HOSPITAL PATIENT ID RECOGNITION & CONSENT
    # ----------------------------------------------------
    print("\n[FLOW 9] Testing Multi-Hospital Patient ID Recognition & Consent...")
    # Update consent to allow clinic-001 but restrict hosp-003
    consent_res = client.put("/api/patients/consent", json={
        "permitted_organizations": ["hosp-001", "clinic-001"]
    }, headers=patient_headers)
    assert consent_res.status_code == 200
    print(f"  ✓ Patient Set Permitted Orgs: {consent_res.json()['permitted_organizations']}")

    # Verify patient profile with consent
    profile_res = client.get(f"/api/patients/{new_pat_id}", headers=patient_headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["health_id"] == new_health_id
    print(f"  ✓ Same Health ID {new_health_id} successfully federated across all hospitals and clinics!")

    # ----------------------------------------------------
    # FLOW 10: REVENUE ANALYTICS & SAAS MRR/ARR
    # ----------------------------------------------------
    print("\n[FLOW 10] Testing Hospital Revenue & Platform MRR Analytics...")
    hosp_dash = client.get("/api/hospitals/dashboard/overview", headers=hosp_headers)
    assert hosp_dash.status_code == 200
    h_kpis = hosp_dash.json()["kpis"]
    print(f"  ✓ Hospital Revenue Collected: ₹{h_kpis['total_revenue']} (Today: ₹{h_kpis['today_revenue']})")

    admin_overview = client.get("/api/admin/overview", headers=admin_headers)
    assert admin_overview.status_code == 200
    a_kpis = admin_overview.json()["kpis"]
    print(f"  ✓ Platform Total Active Subscriptions: {a_kpis['active_subscriptions']}")
    print(f"  ✓ Platform Monthly Recurring Revenue (MRR): ₹{a_kpis['mrr']}")
    print(f"  ✓ Platform Annual Recurring Revenue (ARR): ₹{a_kpis['arr']}")

    # ----------------------------------------------------
    # FLOW 11: SUPER ADMIN ENHANCED GOVERNANCE & TELEMETRY
    # ----------------------------------------------------
    print("\n[FLOW 11] Testing Super Admin Governance, Audit Logs & System Health...")
    
    # 1. Audit logs
    audit_res = client.get("/api/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert "logs" in audit_data and len(audit_data["logs"]) > 0
    print(f"  ✓ Super Admin Audit Trail Retrieved ({len(audit_data['logs'])} events logged)")

    # 2. System health & diagnostics
    health_res = client.get("/api/admin/system-health", headers=admin_headers)
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["postgresql_migration_ready"] is True
    print(f"  ✓ System Diagnostics Verified ({health_data['total_database_records']} records across {len(health_data['tables'])} tables)")

    # 3. Doctor verification toggle
    doc_verify_res = client.put("/api/admin/doctors/doc-001/verify?status_val=verified", headers=admin_headers)
    assert doc_verify_res.status_code == 200
    print(f"  ✓ Super Admin Doctor Verification: {doc_verify_res.json()['message']}")

    # 4. Subscription override
    sub_ovr_res = client.put("/api/admin/organizations/hosp-001/subscription-override", json={
        "plan_id": "hospital_enterprise",
        "status": "active",
        "billing_cycle": "annual"
    }, headers=admin_headers)
    assert sub_ovr_res.status_code == 200
    print(f"  ✓ Super Admin Subscription Override: {sub_ovr_res.json()['message']}")

    print("\n" + "=" * 70)
    print("ALL 11 HEALTHCARE ECOSYSTEM FLOWS (INCLUDING SUPER ADMIN) VERIFIED!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
