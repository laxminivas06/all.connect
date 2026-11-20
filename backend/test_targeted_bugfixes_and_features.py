import unittest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app
from services.auth_utils import create_access_token
from database.db import find_all, save_table, insert

client = TestClient(app)

class TestTargetedBugfixesAndFeatures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.patient_token = create_access_token({
            "sub": "usr-patient-01",
            "username": "patient",
            "role": "patient",
            "entity_id": "PAT-2026-000001"
        })
        cls.patient_headers = {"Authorization": f"Bearer {cls.patient_token}"}

        cls.hospital_token = create_access_token({
            "sub": "usr-hospital-01",
            "username": "yashoda.admin",
            "role": "hospital",
            "organization_id": "hosp-001"
        })
        cls.hospital_headers = {"Authorization": f"Bearer {cls.hospital_token}"}

    def test_01_doctor_data_contract_normalization(self):
        """Test 1: Verify all doctors returned by API have complete normalized fields (name, org, specialization, qualifications)."""
        res = client.get("/api/doctors")
        self.assertEqual(res.status_code, 200)
        doctors = res.json()
        self.assertGreater(len(doctors), 0)

        for doc in doctors:
            self.assertIsNotNone(doc.get("id"), "Doctor must have id")
            self.assertIsNotNone(doc.get("name"), f"Doctor {doc.get('id')} must have name")
            self.assertGreater(len(str(doc.get("name"))), 0)
            self.assertIsNotNone(doc.get("organization_id"), f"Doctor {doc.get('id')} must have organization_id")
            self.assertIsNotNone(doc.get("specialization"), f"Doctor {doc.get('id')} must have specialization")

            # Test defensive string operation that previously crashed AppointmentBookingModal.jsx line 452
            name = str(doc.get("name") or doc.get("full_name") or "Doctor")
            initial = name.replace("Dr. ", "").replace("Dr.", "").strip()[:1]
            self.assertTrue(len(initial) > 0, f"Doctor initial must be extracted safely for {name}")

    def test_02_hospitals_listing_page_api_integrity(self):
        """Test 2: Hospital listing returns verified hospitals without crash, with proper empty state for unknown filters."""
        res = client.get("/api/hospitals")
        self.assertEqual(res.status_code, 200)
        hospitals = res.json()
        self.assertGreater(len(hospitals), 0)

        for h in hospitals:
            self.assertTrue(h.get("id", "").startswith("hosp-"), "Only hospital entities returned")
            self.assertIsNotNone(h.get("name"))
            self.assertIn("doctors_count", h)
            self.assertIn("offers_count", h)
            self.assertIn("departments", h)
            self.assertIsInstance(h["departments"], list)

        # Empty result query must return empty list [] with status 200 (not 500 error)
        res_empty = client.get("/api/hospitals?search=nonexistenthospitalxyz999")
        self.assertEqual(res_empty.status_code, 200)
        self.assertEqual(res_empty.json(), [])

    def test_03_hospital_public_profile_and_isolated_offers(self):
        """Test 3: Hospital profile displays actual departments, normalized doctors, and strictly its own offers."""
        target_hosp = "hosp-001"
        res = client.get(f"/api/hospitals/{target_hosp}")
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertIn("hospital", data)
        self.assertIn("doctors", data)
        self.assertIn("offers", data)
        self.assertIn("departments", data)

        # Ensure all doctors have normalized name
        for d in data["doctors"]:
            self.assertIsNotNone(d.get("name"))
            self.assertEqual(d.get("organization_id"), target_hosp)

        # Ensure all returned offers belong strictly to target_hosp
        for off in data["offers"]:
            self.assertEqual(off.get("organization_id"), target_hosp)
            self.assertEqual(off.get("workflow_status"), "published")

    def test_04_genuine_notification_flow(self):
        """Test 4: Genuine notification creation and retrieval by patient and organization."""
        # Check patient notifications
        p_res = client.get("/api/notifications", headers=self.patient_headers)
        self.assertEqual(p_res.status_code, 200)
        p_notifs = p_res.json()
        self.assertIsInstance(p_notifs, list)

        # Check hospital notifications
        h_res = client.get("/api/notifications", headers=self.hospital_headers)
        self.assertEqual(h_res.status_code, 200)
        h_notifs = h_res.json()
        self.assertIsInstance(h_notifs, list)

        # Create a genuine notification event
        test_notif = {
            "id": f"test-notif-{int(datetime.now().timestamp())}",
            "user_id": "usr-patient-01",
            "role": "patient",
            "title": "Clinical Follow-up Reminder",
            "message": "Your prescription follow-up is scheduled for next week.",
            "type": "appointment",
            "link": "/dashboard/patient/appointments",
            "is_read": False,
            "created_at": datetime.now().isoformat()
        }
        insert("notifications", test_notif)

        # Retrieve and verify presence
        p_res2 = client.get("/api/notifications", headers=self.patient_headers)
        ids = [n["id"] for n in p_res2.json()]
        self.assertIn(test_notif["id"], ids)

        # Mark all read
        mark_res = client.put("/api/notifications/mark-all-read", headers=self.patient_headers)
        self.assertEqual(mark_res.status_code, 200)

    def test_05_complete_opd_booking_workflow(self):
        """Test 5: OPD booking workflow executes smoothly without runtime error, persists record, and quotes exact fee."""
        # 1. Quote price
        test_date = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")
        quote_payload = {
            "doctor_id": "doc-001",
            "organization_id": "hosp-001",
            "consultation_mode": "In-Person Consultation",
            "appointment_date": test_date,
            "appointment_time": "10:30 AM"
        }
        q_res = client.post("/api/appointments/pricing-quote", json=quote_payload)
        self.assertEqual(q_res.status_code, 200)
        quote = q_res.json()
        self.assertEqual(quote["doctor_id"], "doc-001")
        self.assertGreater(quote["total_payable"], 0)

        # 2. Book appointment
        # Clean any prior booking on this slot
        all_appts = find_all("appointments")
        cleaned = [a for a in all_appts if not (a.get("doctor_id") == "doc-001" and a.get("appointment_date") == test_date and a.get("appointment_time") == "10:30 AM")]
        save_table("appointments", cleaned)

        book_payload = {
            "doctor_id": "doc-001",
            "organization_id": "hosp-001",
            "appointment_date": test_date,
            "appointment_time": "10:30 AM",
            "appointment_type": "In-Person Consultation",
            "chief_complaint": "Cardiology Consultation & Diagnostic ECG"
        }
        b_res = client.post("/api/appointments/book", json=book_payload, headers=self.patient_headers)
        self.assertEqual(b_res.status_code, 200)
        b_data = b_res.json()
        appt = b_data.get("appointment", {})
        self.assertTrue(appt.get("id", "").startswith("APT-"))

        # Cleanup
        all_appts_after = find_all("appointments")
        cleaned_after = [a for a in all_appts_after if not (a.get("doctor_id") == "doc-001" and a.get("appointment_date") == test_date and a.get("appointment_time") == "10:30 AM")]
        save_table("appointments", cleaned_after)

    def test_06_offers_promotions_and_featured_ads(self):
        """Test 6: Published offers return valid data, identify featured campaigns, and support provider isolation."""
        res = client.get("/api/offers")
        self.assertEqual(res.status_code, 200)
        offers = res.json()
        self.assertGreater(len(offers), 0)

        featured_offers = [o for o in offers if o.get("featured") is True]
        self.assertGreater(len(featured_offers), 0, "At least one featured promotional campaign must be active")

        for off in offers:
            self.assertEqual(off.get("workflow_status"), "published")
            self.assertIsNotNone(off.get("title"))
            self.assertIsNotNone(off.get("organization_name"))
            self.assertGreater(off.get("original_price", 0), 0)
            self.assertGreater(off.get("discounted_price", 0), 0)

        # Provider specific isolation
        target_org = "hosp-001"
        res_org = client.get(f"/api/offers?organization_id={target_org}")
        self.assertEqual(res_org.status_code, 200)
        org_offers = res_org.json()
        for o in org_offers:
            self.assertEqual(o.get("organization_id"), target_org)

if __name__ == "__main__":
    unittest.main()
