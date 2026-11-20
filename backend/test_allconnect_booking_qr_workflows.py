import unittest
import json
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from database.db import load_table, save_table, insert, find_one, find_all
from services.auth_utils import create_access_token

client = TestClient(app)

class TestAllConnectBookingAndQRWorkflows(unittest.TestCase):
    def setUp(self):
        self.patient_token = create_access_token({
            "sub": "user-pat-001",
            "username": "rahul_sharma",
            "role": "patient",
            "entity_id": "PAT-2026-000001"
        })
        self.patient_headers = {"Authorization": f"Bearer {self.patient_token}"}

        self.doctor_token = create_access_token({
            "sub": "user-doc-005",
            "username": "dr_venkat_rao",
            "role": "doctor",
            "entity_id": "doc-005",
            "organization_id": "clinic-001"
        })
        self.doctor_headers = {"Authorization": f"Bearer {self.doctor_token}"}

    def test_01_search_redirection_clinic_and_hospital_isolation(self):
        """Test 1: Search Cough returns ONLY clinics when facility_type=clinic and ONLY hospitals when facility_type=hospital."""
        # 1. Search Clinic
        res_clinic = client.get("/api/doctors/discovery-search?q=cough&facility_type=clinic")
        self.assertEqual(res_clinic.status_code, 200)
        data_c = res_clinic.json()
        self.assertEqual(len(data_c.get("hospitals", [])), 0, "No hospitals should appear in clinic results")
        self.assertGreater(len(data_c.get("clinics", [])), 0, "Relevant clinics for cough must be returned")
        for c in data_c["clinics"]:
            self.assertEqual(c.get("organization_type"), "clinic")

        # 2. Search Hospital
        res_hosp = client.get("/api/doctors/discovery-search?q=cough&facility_type=hospital")
        self.assertEqual(res_hosp.status_code, 200)
        data_h = res_hosp.json()
        self.assertEqual(len(data_h.get("clinics", [])), 0, "No clinics should appear in hospital results")
        self.assertGreater(len(data_h.get("hospitals", [])), 0, "Relevant hospitals for cough must be returned")
        for h in data_h["hospitals"]:
            self.assertEqual(h.get("organization_type"), "hospital")

    def test_02_provider_specific_offers_isolation(self):
        """Test 2: View Offer for Hospital A shows ONLY Hospital A offers. Clinic A shows ONLY Clinic A offers."""
        # Hospital hosp-001 (Yashoda)
        res_yashoda = client.get("/api/offers?organization_id=hosp-001")
        self.assertEqual(res_yashoda.status_code, 200)
        offers_y = res_yashoda.json()
        self.assertGreater(len(offers_y), 0)
        for o in offers_y:
            self.assertEqual(o.get("organization_id"), "hosp-001")
            self.assertNotEqual(o.get("organization_id"), "clinic-001")

        # Clinic clinic-001 (MedPlus Care)
        res_medplus = client.get("/api/offers?organization_id=clinic-001")
        self.assertEqual(res_medplus.status_code, 200)
        offers_m = res_medplus.json()
        self.assertGreater(len(offers_m), 0)
        for o in offers_m:
            self.assertEqual(o.get("organization_id"), "clinic-001")
            self.assertNotEqual(o.get("organization_id"), "hosp-001")

        # Verify public profile endpoints also isolate offers strictly
        hosp_profile = client.get("/api/hospitals/hosp-001").json()
        for o in hosp_profile.get("offers", []):
            self.assertEqual(o.get("organization_id"), "hosp-001")

        clinic_profile = client.get("/api/clinics/clinic-001").json()
        for o in clinic_profile.get("offers", []):
            self.assertEqual(o.get("organization_id"), "clinic-001")

    def test_03_appointment_schedule_daily_slots_and_pricing_quote(self):
        """Test 3: Step-by-step appointment pricing quote and slot calculation without upfront price."""
        target_doc_id = "doc-005"
        
        # 1. Doctor Schedule Info
        sched_res = client.get(f"/api/doctors/{target_doc_id}/schedule")
        self.assertEqual(sched_res.status_code, 200)
        sched = sched_res.json()
        self.assertIn("consultation_modes", sched)
        self.assertIn("max_daily_capacity", sched)
        self.assertIn("available_days", sched)

        # 2. Daily Slots & Capacity calculation for upcoming valid date
        test_date = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")
        slots_res = client.get(f"/api/doctors/{target_doc_id}/daily-slots?date={test_date}&mode=In-Person")
        self.assertEqual(slots_res.status_code, 200)
        slots_data = slots_res.json()
        self.assertIn("slots", slots_data)
        self.assertIn("total_capacity", slots_data)
        self.assertIn("day_status", slots_data)
        self.assertGreater(len(slots_data["slots"]), 0)

        # 3. Step 5: Official Pricing Quote from backend
        quote_payload = {
            "doctor_id": target_doc_id,
            "organization_id": "clinic-001",
            "consultation_mode": "In-Person",
            "appointment_date": test_date,
            "appointment_time": "10:00 AM"
        }
        quote_res = client.post("/api/appointments/pricing-quote", json=quote_payload)
        self.assertEqual(quote_res.status_code, 200)
        quote = quote_res.json()
        self.assertIn("consultation_fee", quote)
        self.assertIn("total_payable", quote)
        self.assertEqual(quote["doctor_id"], target_doc_id)
        self.assertEqual(quote["appointment_time"], "10:00 AM")

    def test_04_appointment_capacity_and_collision_prevention(self):
        """Test 4: Maximum daily appointment capacity prevents further bookings and unavailable slots cannot be booked."""
        from database.db import find_all, save_table
        target_doc_id = "doc-005"
        test_date = (datetime.now() + timedelta(days=6)).strftime("%Y-%m-%d")
        slot_time = "11:15 AM"

        # Pre-cleanup any leftover test appointments for this doctor on test_date
        all_appts = find_all("appointments")
        cleaned_appts = [a for a in all_appts if not (a.get("doctor_id") == target_doc_id and a.get("appointment_date") == test_date and a.get("appointment_time") == slot_time)]
        save_table("appointments", cleaned_appts)

        # Book first appointment for this slot
        payload = {
            "doctor_id": target_doc_id,
            "organization_id": "clinic-001",
            "appointment_date": test_date,
            "appointment_time": slot_time,
            "appointment_type": "In-Person Consultation",
            "chief_complaint": "Routine Health Evaluation"
        }
        res1 = client.post("/api/appointments/book", json=payload, headers=self.patient_headers)
        self.assertEqual(res1.status_code, 200)

        # Attempt to book the EXACT SAME slot -> Must be rejected with HTTP 400 (Double Booking Prevention)
        res_duplicate = client.post("/api/appointments/book", json=payload, headers=self.patient_headers)
        self.assertEqual(res_duplicate.status_code, 400)
        self.assertIn("already booked", res_duplicate.json().get("detail", "").lower())

        # Cleanup created appointment
        all_appts_after = find_all("appointments")
        cleaned_after = [a for a in all_appts_after if not (a.get("doctor_id") == target_doc_id and a.get("appointment_date") == test_date and a.get("appointment_time") == slot_time)]
        save_table("appointments", cleaned_after)

        # Attempt to book a past date -> Must be rejected with HTTP 400
        past_payload = {**payload, "appointment_date": "2024-01-01"}
        res_past = client.post("/api/appointments/book", json=past_payload, headers=self.patient_headers)
        self.assertEqual(res_past.status_code, 400)
        self.assertIn("past date", res_past.json().get("detail", "").lower())

    def test_05_digital_id_qr_token_generation_and_secure_verification(self):
        """Test 5: Digital ID QR code generation, safe public verification, and authorized provider verification."""
        # 1. Patient fetches their secure QR token
        token_res = client.get("/api/patients/me/qr-token", headers=self.patient_headers)
        self.assertEqual(token_res.status_code, 200)
        token_data = token_res.json()
        self.assertIn("qr_token", token_data)
        self.assertIn("verification_path", token_data)
        self.assertEqual(token_data.get("card_status"), "ACTIVE")
        qr_token = token_data["qr_token"]

        # 2. Public / Unauthorized scanner (e.g. smartphone camera without login)
        # CRITICAL SECURITY REQUIREMENT: No medical records, prescriptions, or phone exposed!
        public_res = client.get(f"/api/patients/verify-card?token={qr_token}")
        self.assertEqual(public_res.status_code, 200)
        pub = public_res.json()
        self.assertEqual(pub.get("status"), "VALID")
        self.assertEqual(pub.get("card_status"), "ACTIVE")
        self.assertIn("patient_name", pub)
        self.assertIn("health_id", pub)
        # Verify private medical data is NOT exposed
        self.assertNotIn("prescriptions", pub)
        self.assertNotIn("medical_records", pub)
        self.assertNotIn("phone", pub)
        self.assertNotIn("mobile", pub)

        # 3. Authorized Provider Scan (Doctor logged in)
        doctor_scan_res = client.get(f"/api/patients/verify-card?token={qr_token}", headers=self.doctor_headers)
        self.assertEqual(doctor_scan_res.status_code, 200)
        doc_data = doctor_scan_res.json()
        self.assertEqual(doc_data.get("status"), "VALID")
        self.assertTrue(doc_data.get("authorized_access", False))
        self.assertIn("prescriptions", doc_data)
        self.assertIn("medical_records", doc_data)

        # 4. Refresh / Rotate QR Token
        refresh_res = client.post("/api/patients/me/qr-token/refresh", headers=self.patient_headers)
        self.assertEqual(refresh_res.status_code, 200)
        new_token = refresh_res.json().get("qr_token")
        self.assertNotEqual(qr_token, new_token)

        # 5. Old token should now be rejected as revoked/invalid
        old_token_verify = client.get(f"/api/patients/verify-card?token={qr_token}")
        self.assertEqual(old_token_verify.status_code, 404)

        # 6. New token should verify successfully
        new_token_verify = client.get(f"/api/patients/verify-card?token={new_token}")
        self.assertEqual(new_token_verify.status_code, 200)

if __name__ == "__main__":
    unittest.main()
