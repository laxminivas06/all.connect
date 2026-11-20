import unittest
import os
import sys
from datetime import datetime, timedelta

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import app
from database.db import find_one, update

client = TestClient(app)

class TestDoctorPortalAndLeaveManagement(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Patient login
        resp_p = client.post("/api/auth/login", json={"username": "patient", "password": "Patient@123"})
        assert resp_p.status_code == 200, f"Patient login failed: {resp_p.text}"
        cls.patient_token = resp_p.json()["access_token"]
        cls.patient_headers = {"Authorization": f"Bearer {cls.patient_token}"}
        cls.patient_user = resp_p.json()["user"]

        # Doctor login
        resp_d = client.post("/api/auth/login", json={"username": "doctor", "password": "Doctor@123"})
        assert resp_d.status_code == 200, f"Doctor login failed: {resp_d.text}"
        cls.doctor_token = resp_d.json()["access_token"]
        cls.doctor_headers = {"Authorization": f"Bearer {cls.doctor_token}"}
        cls.doctor_user = resp_d.json()["user"]

        # Hospital login
        resp_h = client.post("/api/auth/login", json={"username": "hospital", "password": "Hospital@123"})
        assert resp_h.status_code == 200, f"Hospital login failed: {resp_h.text}"
        cls.hospital_token = resp_h.json()["access_token"]
        cls.hospital_headers = {"Authorization": f"Bearer {cls.hospital_token}"}

        # Clinic login
        resp_c = client.post("/api/auth/login", json={"username": "clinic", "password": "Clinic@123"})
        assert resp_c.status_code == 200, f"Clinic login failed: {resp_c.text}"
        cls.clinic_token = resp_c.json()["access_token"]
        cls.clinic_headers = {"Authorization": f"Bearer {cls.clinic_token}"}

    def tearDown(self):
        # Always make sure doc-002 (Dr. Priya Patel) has clean leave status after tests
        update("doctors", lambda d: d.get("id") == "doc-002", {
            "is_on_leave": False,
            "leave_start": None,
            "leave_end": None,
            "leave_reason": None,
            "leave_status": None,
            "leave_history": [],
            "is_available": True
        })

    def test_01_doctor_dashboard_overview_metrics(self):
        """Verify doctor dashboard overview returns 8 KPI metrics, queue list, and patient dossier."""
        resp = client.get("/api/doctors/dashboard/overview", headers=self.doctor_headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        kpis = data.get("kpis", {})

        # Check all 8 required KPI metric keys
        required_kpis = [
            "total_appointments",
            "today_appointments",
            "patients_waiting_outside",
            "patients_in_consultation",
            "completed_consultations",
            "total_patients_treated",
            "cancelled_appointments",
            "upcoming_appointments"
        ]
        for key in required_kpis:
            self.assertIn(key, kpis, f"Missing KPI metric: {key}")
            self.assertIsInstance(kpis[key], (int, float))

        # Check queue structure
        self.assertIn("today_queue", data)
        self.assertIn("patients", data)
        self.assertIn("doctor", data)

    def test_02_apply_doctor_leave_and_verify_slots_blocked(self):
        """Test applying doctor leave and verifying daily slots report on-leave status."""
        doc_id = "doc-002"
        # Dates for leave: 30 days to 33 days from now
        start_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=33)).strftime("%Y-%m-%d")
        reason = "Attending Medical Cardiology Conference"

        # Apply leave via API
        resp = client.post(f"/api/doctors/{doc_id}/leave", json={
            "start_date": start_date,
            "end_date": end_date,
            "reason": reason
        }, headers=self.doctor_headers)
        self.assertEqual(resp.status_code, 200)
        result = resp.json()
        self.assertEqual(result.get("success"), True)
        self.assertEqual(result.get("leave", {}).get("start_date"), start_date)
        self.assertEqual(result.get("leave", {}).get("end_date"), end_date)

        # Check slots on a date within the leave window
        test_leave_date = (datetime.now() + timedelta(days=31)).strftime("%Y-%m-%d")
        resp_slots = client.get(f"/api/doctors/{doc_id}/daily-slots?date={test_leave_date}")
        self.assertEqual(resp_slots.status_code, 200)
        slot_data = resp_slots.json()
        self.assertTrue(slot_data.get("is_on_leave"))
        self.assertIn("Doctor Currently Unavailable", slot_data.get("leave_message", ""))
        self.assertEqual(slot_data.get("day_status"), "Doctor on Leave")

        # All slots on that day should be marked available: False
        for slot in slot_data.get("slots", []):
            self.assertFalse(slot.get("available"))

    def test_03_booking_blocked_during_doctor_leave(self):
        """Verify appointment booking request returns 400 with leave message during doctor leave."""
        doc_id = "doc-002"
        start_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=33)).strftime("%Y-%m-%d")

        # Ensure leave is active
        client.post(f"/api/doctors/{doc_id}/leave", json={
            "start_date": start_date,
            "end_date": end_date,
            "reason": "Personal Leave"
        }, headers=self.doctor_headers)

        target_date = (datetime.now() + timedelta(days=31)).strftime("%Y-%m-%d")
        booking_payload = {
            "doctor_id": doc_id,
            "organization_id": "hosp-001",
            "appointment_date": target_date,
            "appointment_time": "10:00 AM",
            "appointment_type": "In-Person",
            "chief_complaint": "Routine Checkup"
        }

        resp = client.post("/api/appointments", json=booking_payload, headers=self.patient_headers)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Doctor Currently Unavailable – On Leave", resp.json().get("detail", ""))

    def test_04_availability_auto_restored_after_leave_window(self):
        """Verify slots after leave period are open and available."""
        doc_id = "doc-002"
        start_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=33)).strftime("%Y-%m-%d")

        client.post(f"/api/doctors/{doc_id}/leave", json={
            "start_date": start_date,
            "end_date": end_date,
            "reason": "Conference"
        }, headers=self.doctor_headers)

        # Find a future working day well after the leave window
        after_leave_date = datetime.now() + timedelta(days=40)
        # Find next Monday (0), Wednesday (2), or Thursday (3)
        while after_leave_date.weekday() not in [0, 2, 3]:
            after_leave_date += timedelta(days=1)
        after_date_str = after_leave_date.strftime("%Y-%m-%d")

        resp_slots = client.get(f"/api/doctors/{doc_id}/daily-slots?date={after_date_str}")
        self.assertEqual(resp_slots.status_code, 200)
        slot_data = resp_slots.json()
        self.assertFalse(slot_data.get("is_on_leave", False))
        # At least one slot should be open
        available_slots = [s for s in slot_data.get("slots", []) if s.get("available")]
        self.assertTrue(len(available_slots) > 0, f"Expected available slots after leave on {after_date_str}")

    def test_05_cancel_doctor_leave_restores_availability(self):
        """Verify cancelling doctor leave immediately restores availability."""
        doc_id = "doc-002"
        start_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=33)).strftime("%Y-%m-%d")

        client.post(f"/api/doctors/{doc_id}/leave", json={
            "start_date": start_date,
            "end_date": end_date,
            "reason": "Family Function"
        }, headers=self.doctor_headers)

        # Cancel leave
        resp_cancel = client.put(f"/api/doctors/{doc_id}/leave/cancel", headers=self.doctor_headers)
        self.assertEqual(resp_cancel.status_code, 200)
        self.assertTrue(resp_cancel.json().get("success"))

        # Verify slots on previously blocked date are no longer on leave
        # Pick a working day
        target_date = datetime.now() + timedelta(days=30)
        while target_date.weekday() not in [0, 2, 3]:
            target_date += timedelta(days=1)
        target_date_str = target_date.strftime("%Y-%m-%d")

        resp_slots = client.get(f"/api/doctors/{doc_id}/daily-slots?date={target_date_str}")
        self.assertEqual(resp_slots.status_code, 200)
        slot_data = resp_slots.json()
        self.assertFalse(slot_data.get("is_on_leave", False))

    def test_06_token_number_generation_and_queue_workflow(self):
        """Verify appointment booking creates sequential token number T-XX and queue status transitions."""
        # Find next valid working day with open slots for doc-002 (Mon=0, Wed=2, Thu=3)
        target_dt = datetime.now() + timedelta(days=45)
        open_slots = []
        target_date = ""
        for _ in range(60):
            if target_dt.weekday() in [0, 2, 3]:
                candidate_date = target_dt.strftime("%Y-%m-%d")
                resp_slots = client.get(f"/api/doctors/doc-002/daily-slots?date={candidate_date}")
                candidate_slots = [s["time"] for s in resp_slots.json().get("slots", []) if s.get("available")]
                if candidate_slots:
                    target_date = candidate_date
                    open_slots = candidate_slots
                    break
            target_dt += timedelta(days=1)

        self.assertTrue(len(open_slots) > 0, f"Expected open slots for doc-002 on {target_date}")
        slot_time = open_slots[0]

        booking_payload = {
            "doctor_id": "doc-002",
            "organization_id": "hosp-001",
            "appointment_date": target_date,
            "appointment_time": slot_time,
            "appointment_type": "In-Person",
            "chief_complaint": "Queue testing"
        }

        resp_book = client.post("/api/appointments", json=booking_payload, headers=self.patient_headers)
        self.assertIn(resp_book.status_code, [200, 201])
        book_data = resp_book.json()
        appt = book_data.get("appointment", book_data)
        appt_id = appt["id"]

        # Verify token number format T-XX
        token = appt.get("token_number")
        self.assertIsNotNone(token)
        self.assertTrue(token.startswith("T-"), f"Token number should start with T-, got {token}")

        # Test queue status transition: Waiting -> Next in Line
        resp_status1 = client.put(f"/api/appointments/{appt_id}/status", json={"status": "Next in Line"}, headers=self.doctor_headers)
        self.assertEqual(resp_status1.status_code, 200)
        self.assertEqual(resp_status1.json().get("appointment", {}).get("queue_status"), "Next in Line")

        # Next: In Consultation
        resp_status2 = client.put(f"/api/appointments/{appt_id}/status", json={"status": "In Consultation"}, headers=self.doctor_headers)
        self.assertEqual(resp_status2.status_code, 200)
        self.assertEqual(resp_status2.json().get("appointment", {}).get("queue_status"), "In Consultation")

        # Next: Completed
        resp_status3 = client.put(f"/api/appointments/{appt_id}/status", json={"status": "Completed"}, headers=self.doctor_headers)
        self.assertEqual(resp_status3.status_code, 200)
        self.assertEqual(resp_status3.json().get("appointment", {}).get("queue_status"), "Completed")

    def test_07_hospital_and_clinic_kpis_include_doctors_on_leave(self):
        """Verify hospital and clinic overview KPI endpoints compute doctors_on_leave and patients_consulting."""
        # Hospital overview dashboard
        resp_h = client.get("/api/hospitals/dashboard/overview", headers=self.hospital_headers)
        self.assertEqual(resp_h.status_code, 200)
        h_data = resp_h.json()
        h_kpis = h_data.get("kpis", {})
        self.assertIn("doctors_on_leave", h_kpis)
        self.assertIn("patients_consulting", h_kpis)
        self.assertIn("patients_waiting", h_kpis)
        self.assertIn("total_doctors", h_kpis)

        # Clinic overview dashboard
        resp_c = client.get("/api/clinics/dashboard/overview", headers=self.clinic_headers)
        self.assertEqual(resp_c.status_code, 200)
        c_data = resp_c.json()
        c_kpis = c_data.get("kpis", {})
        self.assertIn("doctors_on_leave", c_kpis)
        self.assertIn("patients_consulting", c_kpis)
        self.assertIn("patients_waiting", c_kpis)
        self.assertIn("total_doctors", c_kpis)

if __name__ == "__main__":
    unittest.main()
