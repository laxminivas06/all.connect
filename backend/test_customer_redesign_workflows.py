import unittest
import json
from fastapi.testclient import TestClient
from main import app
from database.db import load_table, save_table, insert, find_one
from services.auth_utils import create_access_token

client = TestClient(app)

class TestCustomerRedesignWorkflows(unittest.TestCase):
    def setUp(self):
        self.patient_token = create_access_token({
            "sub": "user-pat-001",
            "username": "rahul_sharma",
            "role": "patient",
            "entity_id": "PAT-2026-000001"
        })
        self.patient_headers = {"Authorization": f"Bearer {self.patient_token}"}

    def test_01_search_fever_for_hospitals(self):
        """Workflow 1: Search symptom 'fever' selecting Hospital option only returns hospitals with enriched doctors, fees, and slots."""
        res = client.get("/api/doctors/discovery-search?q=fever&facility_type=hospital")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("hospitals", data)
        self.assertIn("clinics", data)
        # Clinics should be empty when facility_type is hospital
        self.assertEqual(len(data["clinics"]), 0)
        self.assertGreater(len(data["hospitals"]), 0)
        
        # Check enrichment
        hosp = data["hospitals"][0]
        self.assertIn("relevant_doctors", hosp)
        self.assertIn("consultation_fee", hosp)
        self.assertIn("sample_slots", hosp)
        self.assertIn("relevant_packages", hosp)
        self.assertEqual(hosp.get("organization_type"), "hospital")

    def test_02_search_cough_for_clinics(self):
        """Workflow 2: Search symptom 'cough' selecting Clinic option only returns clinics with enriched doctors, fees, and slots."""
        res = client.get("/api/doctors/discovery-search?q=cough&facility_type=clinic")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("hospitals", data)
        self.assertIn("clinics", data)
        # Hospitals should be empty when facility_type is clinic
        self.assertEqual(len(data["hospitals"]), 0)
        self.assertGreater(len(data["clinics"]), 0)

        # Check enrichment
        clinic = data["clinics"][0]
        self.assertIn("available_doctors", clinic)
        self.assertIn("consultation_fee", clinic)
        self.assertIn("sample_slots", clinic)
        self.assertIn("relevant_packages", clinic)
        self.assertEqual(clinic.get("organization_type"), "clinic")

    def test_03_hospital_doctors_isolation(self):
        """Workflow 3: Hospital doctor listings return only doctors belonging to that specific hospital."""
        hosp_res = client.get("/api/hospitals/hosp-001")
        self.assertEqual(hosp_res.status_code, 200)
        
        doctors_res = client.get("/api/doctors?organization_id=hosp-001")
        self.assertEqual(doctors_res.status_code, 200)
        doctors = doctors_res.json()
        self.assertGreater(len(doctors), 0)
        for doc in doctors:
            self.assertEqual(doc.get("organization_id"), "hosp-001")
            # Verify no clinic doctors are mixed in
            self.assertFalse(doc.get("organization_id", "").startswith("clinic-"))

    def test_04_clinic_doctors_isolation(self):
        """Workflow 4: Clinic doctor listings return only doctors belonging to that specific clinic."""
        clinic_res = client.get("/api/clinics/clinic-001")
        self.assertEqual(clinic_res.status_code, 200)
        
        doctors_res = client.get("/api/doctors?organization_id=clinic-001")
        self.assertEqual(doctors_res.status_code, 200)
        doctors = doctors_res.json()
        self.assertGreater(len(doctors), 0)
        for doc in doctors:
            self.assertEqual(doc.get("organization_id"), "clinic-001")
            # Verify no hospital doctors are mixed in
            self.assertFalse(doc.get("organization_id", "").startswith("hosp-"))

    def test_05_appointment_booking_and_unique_id(self):
        """Workflow 5: Complete appointment booking generates unique Appointment ID and persists in backend."""
        # Find a doctor from clinic-001
        doc_res = client.get("/api/doctors?organization_id=clinic-001")
        self.assertEqual(doc_res.status_code, 200)
        doctors = doc_res.json()
        self.assertGreater(len(doctors), 0)
        target_doc = doctors[0]

        booking_payload = {
            "doctor_id": target_doc["id"],
            "organization_id": "clinic-001",
            "appointment_date": "2026-12-10",
            "appointment_time": "12:15 PM",
            "appointment_type": "In-Person",
            "chief_complaint": "Testing redesign customer booking flow"
        }

        res = client.post("/api/appointments/book", json=booking_payload, headers=self.patient_headers)
        self.assertEqual(res.status_code, 200)
        resp_data = res.json()
        appt = resp_data.get("appointment", {})
        self.assertIn("id", appt)
        self.assertTrue(appt["id"].startswith("APT-") or len(appt["id"]) > 5)
        self.assertEqual(appt["doctor_id"], target_doc["id"])
        self.assertEqual(appt["organization_id"], "clinic-001")

        # Verify retrieval via appointments list
        get_res = client.get("/api/appointments", headers=self.patient_headers)
        self.assertEqual(get_res.status_code, 200)
        fetched_list = get_res.json()
        appt_ids = [a["id"] for a in fetched_list]
        self.assertIn(appt["id"], appt_ids)

    def test_06_pharmacy_excluded_from_customer_discovery(self):
        """Workflow 6: Verify discovery search response does not contain pharmacy / medical shop endpoints or models."""
        res = client.get("/api/doctors/discovery-search?q=paracetamol")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        # The customer discovery response schema strictly returns doctors, hospitals, clinics, packages, specialities
        self.assertNotIn("pharmacies", data)
        self.assertNotIn("medical_shops", data)

if __name__ == "__main__":
    unittest.main()
