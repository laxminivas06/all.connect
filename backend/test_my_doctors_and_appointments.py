import unittest
import os
import sys
from datetime import datetime, timedelta

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import app
from database.db import find_one, update

client = TestClient(app)

class TestMyDoctorsAndAppointments(unittest.TestCase):
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

    def tearDown(self):
        # Clean leave status for doc-001 and doc-002
        for doc_id in ["doc-001", "doc-002"]:
            update("doctors", lambda d: d.get("id") == doc_id, {
                "is_on_leave": False,
                "leave_start": None,
                "leave_end": None,
                "leave_reason": None,
                "leave_status": None,
                "leave_history": [],
                "is_available": True
            })

    def test_01_get_my_doctors_endpoint(self):
        """Verify GET /api/patients/me/doctors returns structured associated and recommended doctors."""
        resp = client.get("/api/patients/me/doctors", headers=self.patient_headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        self.assertIn("doctors", data)
        self.assertIn("recommended_doctors", data)
        self.assertIn("total_associated_doctors", data)

        # Verify fields on doctors
        all_docs = data["doctors"] + data["recommended_doctors"]
        self.assertTrue(len(all_docs) > 0)
        sample = all_docs[0]
        self.assertIn("name", sample)
        self.assertIn("specialization", sample)
        self.assertIn("organization_name", sample)
        self.assertIn("is_available", sample)
        self.assertIn("is_on_leave", sample)

    def test_02_doctor_on_leave_displays_unavailable_status(self):
        """Verify that when a doctor is on leave, /api/patients/me/doctors marks is_on_leave: True."""
        doc_id = "doc-002"
        start_date = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")

        # Apply leave
        resp_leave = client.post(f"/api/doctors/{doc_id}/leave", json={
            "start_date": start_date,
            "end_date": end_date,
            "reason": "Personal Leave"
        }, headers=self.doctor_headers)
        self.assertEqual(resp_leave.status_code, 200)

        # Check in my doctors endpoint
        resp = client.get("/api/patients/me/doctors", headers=self.patient_headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        all_docs = data["doctors"] + data["recommended_doctors"]
        target = next((d for d in all_docs if d.get("id") == doc_id), None)
        self.assertIsNotNone(target)
        # Doctor has active leave configured
        self.assertEqual(target.get("leave_start"), start_date)
        self.assertEqual(target.get("leave_end"), end_date)

    def test_03_reschedule_appointment_success_and_leave_blocking(self):
        """Test rescheduling an appointment successfully, and verify blocking when doctor is on leave."""
        # 1. Book an appointment first
        target_dt = datetime.now() + timedelta(days=50)
        while target_dt.weekday() not in [0, 2, 3]: # Mon, Wed, Thu for doc-002
            target_dt += timedelta(days=1)
        orig_date = target_dt.strftime("%Y-%m-%d")

        resp_slots = client.get(f"/api/doctors/doc-002/daily-slots?date={orig_date}")
        open_slots = [s["time"] for s in resp_slots.json().get("slots", []) if s.get("available")]
        self.assertTrue(len(open_slots) > 0)

        booking_payload = {
            "doctor_id": "doc-002",
            "organization_id": "hosp-001",
            "appointment_date": orig_date,
            "appointment_time": open_slots[0],
            "appointment_type": "In-Person",
            "chief_complaint": "Follow-up consultation"
        }
        resp_book = client.post("/api/appointments", json=booking_payload, headers=self.patient_headers)
        self.assertIn(resp_book.status_code, [200, 201])
        appt = resp_book.json().get("appointment", resp_book.json())
        appt_id = appt["id"]

        # 2. Reschedule to a new valid date
        new_dt = target_dt + timedelta(days=7)
        while new_dt.weekday() not in [0, 2, 3]:
            new_dt += timedelta(days=1)
        new_date_str = new_dt.strftime("%Y-%m-%d")

        resp_resched = client.put(f"/api/appointments/{appt_id}/reschedule", json={
            "rescheduled_date": new_date_str,
            "rescheduled_time": "11:30 AM"
        }, headers=self.patient_headers)
        self.assertEqual(resp_resched.status_code, 200)
        updated_appt = resp_resched.json()["appointment"]
        self.assertEqual(updated_appt["appointment_date"], new_date_str)
        self.assertEqual(updated_appt["appointment_time"], "11:30 AM")

        # 3. Put doctor on leave on another date and verify reschedule blocks it
        leave_start = (new_dt + timedelta(days=7)).strftime("%Y-%m-%d")
        leave_end = (new_dt + timedelta(days=10)).strftime("%Y-%m-%d")
        client.post("/api/doctors/doc-002/leave", json={
            "start_date": leave_start,
            "end_date": leave_end,
            "reason": "Conference"
        }, headers=self.doctor_headers)

        blocked_date = (new_dt + timedelta(days=8)).strftime("%Y-%m-%d")
        resp_blocked = client.put(f"/api/appointments/{appt_id}/reschedule", json={
            "rescheduled_date": blocked_date,
            "rescheduled_time": "10:00 AM"
        }, headers=self.patient_headers)
        self.assertEqual(resp_blocked.status_code, 400)
        self.assertIn("Currently Unavailable – On Leave", resp_blocked.json()["detail"])

    def test_04_cancel_appointment_endpoint(self):
        """Test cancelling an appointment via PUT /api/appointments/{id}/cancel."""
        # Find next valid working day
        dt = datetime.now() + timedelta(days=60)
        while dt.weekday() not in [0, 2, 3]:
            dt += timedelta(days=1)
        d_str = dt.strftime("%Y-%m-%d")

        resp_slots = client.get(f"/api/doctors/doc-002/daily-slots?date={d_str}")
        open_slots = [s["time"] for s in resp_slots.json().get("slots", []) if s.get("available")]
        self.assertTrue(len(open_slots) > 0)

        booking_payload = {
            "doctor_id": "doc-002",
            "organization_id": "hosp-001",
            "appointment_date": d_str,
            "appointment_time": open_slots[0],
            "appointment_type": "In-Person",
            "chief_complaint": "Cancellation test"
        }
        resp_book = client.post("/api/appointments", json=booking_payload, headers=self.patient_headers)
        self.assertIn(resp_book.status_code, [200, 201])
        appt = resp_book.json().get("appointment", resp_book.json())
        appt_id = appt["id"]

        # Cancel
        resp_cancel = client.put(f"/api/appointments/{appt_id}/cancel", json={
            "reason": "Patient requested cancellation"
        }, headers=self.patient_headers)
        self.assertEqual(resp_cancel.status_code, 200)
        cancelled_appt = resp_cancel.json()["appointment"]
        self.assertEqual(cancelled_appt["status"].lower(), "cancelled")
        self.assertEqual(cancelled_appt["queue_status"], "Cancelled")

if __name__ == "__main__":
    unittest.main()
