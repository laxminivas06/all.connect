import unittest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestDoctorPortalImprovements(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Authenticate as doctor
        resp_doc = client.post("/api/auth/login", json={"username": "doctor", "password": "Doctor@123"})
        cls.doctor_token = resp_doc.json()["access_token"]
        cls.doctor_headers = {"Authorization": f"Bearer {cls.doctor_token}"}

        # Authenticate as patient
        resp_pat = client.post("/api/auth/login", json={"username": "patient", "password": "Patient@123"})
        cls.patient_token = resp_pat.json()["access_token"]
        cls.patient_headers = {"Authorization": f"Bearer {cls.patient_token}"}

    def test_01_search_patients_endpoint(self):
        """Test GET /api/patients/search by query."""
        resp = client.get("/api/patients/search?query=Laxmi", headers=self.doctor_headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("patients", data)
        self.assertTrue(len(data["patients"]) > 0)
        patient = data["patients"][0]
        self.assertIn("id", patient)
        self.assertIn("full_name", patient)

    def test_02_search_patients_by_id(self):
        """Test search by patient ID prefix."""
        resp = client.get("/api/patients/search?query=PAT-", headers=self.doctor_headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(len(data["patients"]) > 0)

    def test_03_create_prescription_with_instructions_and_quantities(self):
        """Test POST /api/prescriptions/create with additional instructions and medicine quantities."""
        rx_payload = {
            "appointment_id": "appt-seed-001",
            "patient_id": "PAT-2026-000001",
            "doctor_id": "doc-001",
            "diagnosis": "Acute Bronchitis and allergic rhinitis",
            "vitals": "BP: 120/80 mmHg | HR: 74 bpm | SpO2: 98%",
            "symptoms": ["Dry Cough", "Throat Irritation"],
            "medicines": [
                {
                    "name": "Amoxicillin 500mg",
                    "dosage": "500mg",
                    "frequency": "1-0-1",
                    "duration": "5 Days",
                    "quantity": "10 Tablets",
                    "instructions": "Take after meals"
                },
                {
                    "name": "Cetirizine 10mg",
                    "dosage": "10mg",
                    "frequency": "0-0-1",
                    "duration": "7 Days",
                    "quantity": "7 Tablets",
                    "instructions": "Take at night before bed"
                }
            ],
            "additional_instructions": "Perform complete CBC and chest X-ray PA view. Steam inhalation twice daily. Follow up after 5 days if cough persists.",
            "follow_up_date": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "advice": "Drink warm water and avoid cold beverages."
        }
        resp = client.post("/api/prescriptions/create", json=rx_payload, headers=self.doctor_headers)
        self.assertIn(resp.status_code, [200, 201])
        data = resp.json()
        rx = data.get("prescription", data)
        self.assertEqual(rx["patient_id"], "PAT-2026-000001")
        self.assertEqual(rx["additional_instructions"], rx_payload["additional_instructions"])
        self.assertEqual(len(rx["medicines"]), 2)
        self.assertEqual(rx["medicines"][0]["quantity"], "10 Tablets")

    def test_04_doctor_profile_and_availability(self):
        """Test doctor profile returns availability and normalized fields."""
        resp = client.get("/api/doctors/doc-001")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        doc = data.get("doctor", data)
        self.assertIn("is_available", doc)
        self.assertTrue(doc["is_available"])
        self.assertIn("available_days", doc)

    def test_05_prescription_with_clinical_id_tests_and_recommendations(self):
        """Test POST /api/prescriptions/create with dedicated clinical_id, additional tests, and recommendations."""
        payload = {
            "patient_id": "PAT-2026-000001",
            "clinical_id": "CLN-2026-TEST-009",
            "diagnosis": "Viral Pharyngitis",
            "symptoms": ["Sore throat", "Fever"],
            "medicines": [
                {
                    "name": "Paracetamol 650mg",
                    "dosage": "650mg",
                    "frequency": "TID",
                    "duration": "3 days",
                    "quantity": "9 tablets",
                    "instructions": "After food"
                }
            ],
            "tests": ["Complete Blood Count (CBC)", "Rapid Throat Swab"],
            "additional_tests": "Complete Blood Count (CBC), Rapid Throat Swab",
            "recommendations": "Warm saline gargle 3 times daily. Hydration 2.5L/day. Follow up in 5 days.",
            "advice": "Warm saline gargle 3 times daily. Hydration 2.5L/day."
        }
        resp = client.post("/api/prescriptions/create", json=payload, headers=self.doctor_headers)
        self.assertIn(resp.status_code, [200, 201])
        data = resp.json()
        rx = data.get("prescription", data)
        self.assertEqual(rx["patient_id"], "PAT-2026-000001")
        self.assertEqual(rx.get("clinical_id"), "CLN-2026-TEST-009")
        self.assertEqual(rx.get("recommendations"), payload["recommendations"])

if __name__ == "__main__":
    unittest.main()
