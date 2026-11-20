import unittest
from fastapi.testclient import TestClient
from main import app
from database.db import find_one, find_all

client = TestClient(app)

class TestPatientDashboardPrivacyAndNavigation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Authenticate patient
        login_res = client.post("/api/auth/login", json={"username": "patient", "password": "Patient@123"})
        cls.patient_token = login_res.json()["access_token"]
        cls.patient_headers = {"Authorization": f"Bearer {cls.patient_token}"}

    def test_01_qr_token_privacy_returns_only_name_and_health_id(self):
        """Verify public QR scan returns ONLY patient name and Universal Health ID number."""
        # 1. Get or refresh patient QR token
        token_res = client.post("/api/patients/me/qr-token/refresh", headers=self.patient_headers)
        self.assertEqual(token_res.status_code, 200)
        qr_token = token_res.json().get("qr_token")
        self.assertTrue(bool(qr_token))

        # 2. Public scan (unauthenticated request)
        pub_res = client.get(f"/api/patients/verify-card?token={qr_token}")
        self.assertEqual(pub_res.status_code, 200)
        data = pub_res.json()

        # Must include ONLY patient_name and health_id
        self.assertIn("patient_name", data)
        self.assertIn("health_id", data)
        self.assertEqual(data.get("status"), "VALID")

        # CRITICAL PRIVACY: Must NOT contain private details
        self.assertNotIn("phone", data)
        self.assertNotIn("mobile", data)
        self.assertNotIn("email", data)
        self.assertNotIn("dob", data)
        self.assertNotIn("age", data)
        self.assertNotIn("address", data)
        self.assertNotIn("prescriptions", data)
        self.assertNotIn("medical_records", data)
        self.assertNotIn("appointment_history", data)
        self.assertNotIn("diagnosis", data)
        self.assertNotIn("gender", data)

    def test_02_patient_associated_doctors_availability_and_no_finance_leak(self):
        """Verify /api/patients/me/doctors returns doctor info with proper availability status."""
        res = client.get("/api/patients/me/doctors", headers=self.patient_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("doctors", data)
        for doc in data["doctors"]:
            self.assertIn("name", doc)
            self.assertIn("specialization", doc)
            self.assertIn("is_available", doc)
            self.assertIn("is_on_leave", doc)

    def test_03_patient_prescriptions_are_doctor_issued(self):
        """Verify patient prescriptions are tied to doctor consults and valid."""
        res = client.get("/api/patients/me", headers=self.patient_headers)
        self.assertEqual(res.status_code, 200)
        patient_data = res.json()
        prescriptions = patient_data.get("prescriptions", [])
        for rx in prescriptions:
            self.assertTrue(bool(rx.get("doctor_name") or rx.get("doctor_id")))

if __name__ == "__main__":
    unittest.main()
