import unittest
import os
import sys
import json
from datetime import datetime, timedelta

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import app

client = TestClient(app)

class TestProfileAndStandardizedBooking(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Authenticate patient
        resp = client.post("/api/auth/login", json={"username": "patient", "password": "Patient@123"})
        assert resp.status_code == 200, f"Patient login failed: {resp.text}"
        cls.patient_token = resp.json()["access_token"]
        cls.patient_headers = {"Authorization": f"Bearer {cls.patient_token}"}
        cls.patient_user = resp.json()["user"]

        # Authenticate hospital admin
        resp = client.post("/api/auth/login", json={"username": "hospital", "password": "Hospital@123"})
        assert resp.status_code == 200, f"Hospital login failed: {resp.text}"
        cls.hospital_token = resp.json()["access_token"]
        cls.hospital_headers = {"Authorization": f"Bearer {cls.hospital_token}"}

    def _find_available_date_and_slot(self, doc_id, target_weekday=0, days_forward=30):
        """Helper to find an available future date and open slot for a doctor."""
        d = datetime.now() + timedelta(days=days_forward)
        while d.weekday() != target_weekday:
            d += timedelta(days=1)
        
        # Check slots for this day; if all booked, advance 7 days
        for _ in range(10):
            date_str = d.strftime("%Y-%m-%d")
            resp = client.get(f"/api/doctors/{doc_id}/daily-slots?date={date_str}&mode=In-Person%20Consultation")
            if resp.status_code == 200:
                slots = resp.json().get("slots", [])
                open_slots = [s["time"] for s in slots if s.get("available")]
                if open_slots:
                    return date_str, open_slots[0]
            d += timedelta(days=7)
        return d.strftime("%Y-%m-%d"), "10:00 AM"

    def test_01_profile_loading_and_update(self):
        """Test 1: Verify patient profile loads authenticated data and updates persist to backend."""
        # Unauthenticated request must return 401
        unauth_resp = client.get("/api/patients/me")
        self.assertEqual(unauth_resp.status_code, 401, "Unauthenticated access to /api/patients/me must be rejected with 401")

        # Authenticated patient profile retrieval
        resp = client.get("/api/patients/me", headers=self.patient_headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("patient", data)
        patient = data["patient"]
        self.assertTrue(patient["patient_id"].startswith("PAT-") or patient["patient_id"].startswith("pat-"))
        self.assertIn("health_id", patient)

        # Profile update via PUT /api/patients/me
        updated_phone = "+91 98480 99999"
        updated_address = "Flat 402, Green Meadows, Banjara Hills, Hyderabad"
        updated_allergies = ["Penicillin", "Dust mite"]
        put_resp = client.put(
            "/api/patients/me",
            headers=self.patient_headers,
            json={
                "full_name": "Laxmi Narayana Sharma",
                "phone": updated_phone,
                "address": updated_address,
                "allergies": updated_allergies,
                "blood_group": "O+",
                "dob": "1992-05-15",
                "gender": "Male"
            }
        )
        self.assertEqual(put_resp.status_code, 200)
        updated_patient = put_resp.json()["patient"]
        self.assertEqual(updated_patient["full_name"], "Laxmi Narayana Sharma")
        self.assertEqual(updated_patient["phone"], updated_phone)
        self.assertEqual(updated_patient["blood_group"], "O+")
        self.assertEqual(updated_patient["dob"], "1992-05-15")
        self.assertIn("Dust mite", updated_patient["allergies"])

        # Verify session synchronization in /api/auth/me
        me_resp = client.get("/api/auth/me", headers=self.patient_headers)
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.json()["user"]["full_name"], "Laxmi Narayana Sharma")

    def test_02_patient_data_isolation(self):
        """Test 2: Verify patient data isolation (never exposes another patient's records)."""
        # Register a second patient
        ts = int(datetime.now().timestamp())
        reg_resp = client.post(
            "/api/auth/register-patient",
            json={
                "full_name": f"Isolated Patient {ts}",
                "email": f"isolated_{ts}@example.com",
                "mobile": "+91 99999 88888",
                "dob": "1995-04-20",
                "gender": "Female",
                "address": "Street 5, Jubilee Hills",
                "area": "Jubilee Hills",
                "city": "Hyderabad",
                "pincode": "500033",
                "password": "Password@123"
            }
        )
        self.assertEqual(reg_resp.status_code, 200)
        token2 = reg_resp.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        # Second patient fetches /api/patients/me
        resp2 = client.get("/api/patients/me", headers=headers2)
        self.assertEqual(resp2.status_code, 200)
        p2_data = resp2.json()["patient"]
        self.assertEqual(p2_data["full_name"], f"Isolated Patient {ts}")
        self.assertEqual(p2_data["email"], f"isolated_{ts}@example.com")
        self.assertNotEqual(p2_data["patient_id"], "PAT-2026-000001", "New patient must have isolated unique patient ID")

    def test_03_hospital_appointment_booking(self):
        """Test 3: Verify standardized appointment booking with verified quote and chief complaint."""
        booking_date, booking_slot = self._find_available_date_and_slot("doc-001", target_weekday=0, days_forward=40)

        # Get price quote first (Step 5)
        quote_resp = client.post(
            "/api/appointments/pricing-quote",
            headers=self.patient_headers,
            json={
                "doctor_id": "doc-001",
                "organization_id": "hosp-001",
                "consultation_mode": "In-Person Consultation",
                "appointment_date": booking_date,
                "appointment_time": booking_slot
            }
        )
        self.assertEqual(quote_resp.status_code, 200)
        quote = quote_resp.json()
        self.assertIn("consultation_fee", quote)
        self.assertGreater(quote["total_payable"], 0)

        # Confirm booking with Pre-Filled Chief Complaint (Step 6)
        booking_resp = client.post(
            "/api/appointments",
            headers=self.patient_headers,
            json={
                "doctor_id": "doc-001",
                "organization_id": "hosp-001",
                "appointment_date": booking_date,
                "appointment_time": booking_slot,
                "appointment_type": "In-Person Consultation",
                "patient_name": "Laxmi Narayana Sharma",
                "patient_phone": "+91 98480 99999",
                "chief_complaint": "Persistent dry cough for 4 days with throat irritation"
            }
        )
        self.assertEqual(booking_resp.status_code, 200, f"Booking failed: {booking_resp.text}")
        appt = booking_resp.json()["appointment"]
        self.assertIn("appointment_id", appt)
        self.assertEqual(appt["chief_complaint"], "Persistent dry cough for 4 days with throat irritation")
        self.assertEqual(appt["status"].lower(), "confirmed")

    def test_04_clinic_appointment_booking(self):
        """Test 4: Verify appointment booking at clinic with doctor isolation."""
        # Fetch clinic doctors (doc-021 belongs to clinic-001)
        docs_resp = client.get("/api/doctors?organization_id=clinic-001")
        self.assertEqual(docs_resp.status_code, 200)
        clinic_docs = docs_resp.json()
        self.assertTrue(len(clinic_docs) >= 1)
        doc = clinic_docs[0]

        booking_date, booking_slot = self._find_available_date_and_slot(doc["id"], target_weekday=1, days_forward=45)

        booking_resp = client.post(
            "/api/appointments",
            headers=self.patient_headers,
            json={
                "doctor_id": doc["id"],
                "organization_id": "clinic-001",
                "appointment_date": booking_date,
                "appointment_time": booking_slot,
                "appointment_type": "In-Person Consultation",
                "patient_name": "Laxmi Narayana Sharma",
                "patient_phone": "+91 98480 99999",
                "chief_complaint": "General health checkup and fever"
            }
        )
        self.assertEqual(booking_resp.status_code, 200, f"Booking clinic failed: {booking_resp.text}")
        appt = booking_resp.json()["appointment"]
        self.assertEqual(appt["organization_id"], "clinic-001")
        self.assertEqual(appt["chief_complaint"], "General health checkup and fever")

    def test_05_single_doctor_clinic_auto_select(self):
        """Test 5: Verify single-doctor clinic only returns the assigned doctor."""
        docs_resp = client.get("/api/doctors?organization_id=clinic-001")
        self.assertEqual(docs_resp.status_code, 200)
        docs = docs_resp.json()
        for d in docs:
            self.assertEqual(d.get("organization_id") or d.get("hospital_id"), "clinic-001")

    def test_06_consultation_availability_and_capacity(self):
        """Test 6: Verify doctor daily slots and capacity calculations."""
        d = datetime.now() + timedelta(days=20)
        while d.weekday() != 2: # Wednesday
            d += timedelta(days=1)
        next_wed = d.strftime("%Y-%m-%d")

        slots_resp = client.get(f"/api/doctors/doc-001/daily-slots?date={next_wed}&mode=In-Person%20Consultation")
        self.assertEqual(slots_resp.status_code, 200)
        data = slots_resp.json()
        self.assertIn("slots", data)
        self.assertIn("total_capacity", data)
        self.assertIn("booked_count", data)
        self.assertTrue(len(data["slots"]) > 0)

    def test_07_pre_filled_chief_complaint_from_search(self):
        """Test 7: Verify appointment stores search-derived symptom in chief complaint."""
        booking_date, booking_slot = self._find_available_date_and_slot("doc-001", target_weekday=3, days_forward=50)

        symptom = "Cough"
        booking_resp = client.post(
            "/api/appointments",
            headers=self.patient_headers,
            json={
                "doctor_id": "doc-001",
                "organization_id": "hosp-001",
                "appointment_date": booking_date,
                "appointment_time": booking_slot,
                "appointment_type": "In-Person Consultation",
                "patient_name": "Laxmi Narayana Sharma",
                "patient_phone": "+91 98480 99999",
                "chief_complaint": symptom
            }
        )
        self.assertEqual(booking_resp.status_code, 200, f"Booking with symptom failed: {booking_resp.text}")
        appt = booking_resp.json()["appointment"]
        self.assertEqual(appt["chief_complaint"], "Cough")

    def test_08_cancel_appointment(self):
        """Test 8: Verify patient can cancel their appointment."""
        booking_date, booking_slot = self._find_available_date_and_slot("doc-001", target_weekday=4, days_forward=55)

        # Book an appointment
        booking_resp = client.post(
            "/api/appointments",
            headers=self.patient_headers,
            json={
                "doctor_id": "doc-001",
                "organization_id": "hosp-001",
                "appointment_date": booking_date,
                "appointment_time": booking_slot,
                "appointment_type": "In-Person Consultation",
                "patient_name": "Laxmi Narayana Sharma",
                "patient_phone": "+91 98480 99999",
                "chief_complaint": "Mild headache"
            }
        )
        self.assertEqual(booking_resp.status_code, 200, f"Booking for cancel failed: {booking_resp.text}")
        appt_id = booking_resp.json()["appointment"]["id"]

        # Cancel it
        cancel_resp = client.put(f"/api/appointments/{appt_id}/cancel", headers=self.patient_headers, json={"reason": "Patient rescheduled"})
        self.assertEqual(cancel_resp.status_code, 200)
        self.assertEqual(cancel_resp.json()["appointment"]["status"], "cancelled")

    def test_09_offers_and_procedure_packages(self):
        """Test 9: Verify offers and procedure packages load accurately."""
        resp = client.get("/api/offers")
        self.assertEqual(resp.status_code, 200)
        offers = resp.json()
        self.assertTrue(len(offers) > 0)
        first_offer = offers[0]
        self.assertIn("title", first_offer)
        self.assertIn("organization_id", first_offer)

    def test_10_hospitals_departments_safety(self):
        """Test 10: Verify hospitals list never crashes with NoneType departments."""
        resp = client.get("/api/hospitals")
        self.assertEqual(resp.status_code, 200)
        hospitals = resp.json()
        self.assertTrue(len(hospitals) >= 10)
        for h in hospitals:
            self.assertIsInstance(h.get("departments"), list, f"Hospital {h.get('id')} has non-list departments")

if __name__ == "__main__":
    unittest.main()
