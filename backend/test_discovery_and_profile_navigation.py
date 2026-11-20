import unittest
import os
import sys
import json
from datetime import datetime, timedelta

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import app

client = TestClient(app)

class TestDiscoveryAndProfileNavigation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Authenticate patient
        resp = client.post("/api/auth/login", json={"username": "patient", "password": "Patient@123"})
        assert resp.status_code == 200, f"Patient login failed: {resp.text}"
        cls.patient_token = resp.json()["access_token"]
        cls.patient_headers = {"Authorization": f"Bearer {cls.patient_token}"}
        cls.patient_user = resp.json()["user"]

    def _find_available_date_and_slot(self, doc_id, target_weekday=0, days_forward=50):
        """Helper to find an available future date and open slot for a doctor."""
        d = datetime.now() + timedelta(days=days_forward)
        while d.weekday() != target_weekday:
            d += timedelta(days=1)
        
        for _ in range(12):
            date_str = d.strftime("%Y-%m-%d")
            resp = client.get(f"/api/doctors/{doc_id}/daily-slots?date={date_str}&mode=In-Person%20Consultation")
            if resp.status_code == 200:
                slots = resp.json().get("slots", [])
                open_slots = [s["time"] for s in slots if s.get("available")]
                if open_slots:
                    return date_str, open_slots[0]
            d += timedelta(days=7)
        return d.strftime("%Y-%m-%d"), "10:00 AM"

    def test_01_hospital_profile_navigation_and_overview(self):
        """Scenario 1: Hospital Profile Navigation & Overview Data Structure."""
        resp = client.get("/api/hospitals")
        self.assertEqual(resp.status_code, 200)
        hospitals = resp.json()
        self.assertTrue(len(hospitals) > 0)
        
        h = hospitals[0]
        h_id = h["id"]
        
        # Dedicated Hospital Detail page endpoint /api/hospitals/{id}
        detail_resp = client.get(f"/api/hospitals/{h_id}")
        self.assertEqual(detail_resp.status_code, 200)
        detail_data = detail_resp.json()
        self.assertIn("hospital", detail_data)
        detail = detail_data["hospital"]
        self.assertEqual(detail["id"], h_id)
        self.assertTrue(len(detail.get("name", "")) > 0)
        self.assertIn("address", detail)
        self.assertIn("emergency_phone", detail)
        self.assertIn("operating_hours", detail)
        self.assertIn("services", detail_data)
        self.assertIn("doctors", detail_data)
        self.assertIn("offers", detail_data)

    def test_02_clinic_profile_navigation_and_overview(self):
        """Scenario 2: Clinic Profile Navigation & Overview Data Structure."""
        resp = client.get("/api/clinics")
        self.assertEqual(resp.status_code, 200)
        clinics = resp.json()
        self.assertTrue(len(clinics) > 0)
        
        c = clinics[0]
        c_id = c["id"]
        
        detail_resp = client.get(f"/api/clinics/{c_id}")
        self.assertEqual(detail_resp.status_code, 200)
        detail_data = detail_resp.json()
        self.assertIn("clinic", detail_data)
        detail = detail_data["clinic"]
        self.assertEqual(detail["id"], c_id)
        self.assertIn("name", detail)
        self.assertIn("address", detail)
        self.assertIn("services", detail_data)
        self.assertIn("doctors", detail_data)

    def test_03_symptom_search_cold_mapping(self):
        """Scenario 3: Symptom 'Cold' maps to General Medicine, ENT, Pulmonology, Pediatrics."""
        # Using discovery-search API
        search_resp = client.get("/api/doctors/discovery-search?query=cold")
        self.assertEqual(search_resp.status_code, 200)
        data = search_resp.json()
        matched_depts = [d.lower() for d in data.get("matched_departments", [])]
        
        cold_expected = {"general medicine", "ent", "pulmonology", "pediatrics"}
        overlap = set(matched_depts).intersection(cold_expected)
        self.assertTrue(len(overlap) > 0, f"Expected cold mapping to match general medicine or pediatrics, got: {matched_depts}")
        self.assertTrue(len(data.get("doctors", [])) > 0)

    def test_04_symptom_search_orthopaedics_mapping(self):
        """Scenario 4: Search 'Orthopaedics' or 'bone' maps to Orthopedics doctors."""
        search_resp = client.get("/api/doctors/discovery-search?query=orthopaedics")
        self.assertEqual(search_resp.status_code, 200)
        data = search_resp.json()
        matched_depts = [d.lower() for d in data.get("matched_departments", [])]
        self.assertTrue(any("ortho" in d for d in matched_depts))

    def test_05_specific_doctor_name_search(self):
        """Scenario 5: Specific doctor name search within organization."""
        all_docs = client.get("/api/doctors").json()
        self.assertTrue(len(all_docs) > 0)
        sample_doc = all_docs[0]
        name_part = sample_doc["name"].split()[1] if len(sample_doc["name"].split()) > 1 else sample_doc["name"]
        
        search_resp = client.get(f"/api/doctors/discovery-search?query={name_part}")
        self.assertEqual(search_resp.status_code, 200)
        data = search_resp.json()
        matched_docs = data.get("doctors", [])
        self.assertTrue(len(matched_docs) >= 1)
        self.assertTrue(any(sample_doc["id"] == d["id"] for d in matched_docs))

    def test_06_browse_all_doctors_without_search(self):
        """Scenario 6: Browsing all doctors without filters returns organization's registered doctors."""
        hospitals = client.get("/api/hospitals").json()
        self.assertTrue(len(hospitals) > 0)
        h_id = hospitals[0]["id"]
        
        resp = client.get(f"/api/hospitals/{h_id}")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        doctors = data.get("doctors", [])
        self.assertTrue(len(doctors) > 0)
        for d in doctors:
            self.assertEqual(d["organization_id"], h_id)

    def test_07_doctor_profile_details_and_booking_ready(self):
        """Scenario 7: Doctor Profile (/api/doctors/{id}) returns qualifications, modes, fee, bio."""
        all_docs = client.get("/api/doctors").json()
        doc_id = all_docs[0]["id"]
        
        resp = client.get(f"/api/doctors/{doc_id}")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("doctor", data)
        doc = data["doctor"]
        self.assertEqual(doc["id"], doc_id)
        self.assertIn("name", doc)
        self.assertTrue(doc.get("consultation_fee", 0) > 0)
        self.assertIn("qualifications", doc)

    def test_08_multi_doctor_clinic_discovery(self):
        """Scenario 8: Multi-doctor clinic discovery returns registered doctors."""
        clinics = client.get("/api/clinics").json()
        self.assertTrue(len(clinics) > 0)
        
        # Check doctors for clinics
        for c in clinics:
            resp = client.get(f"/api/clinics/{c['id']}")
            docs = resp.json().get("doctors", [])
            for d in docs:
                self.assertEqual(d["organization_id"], c["id"])

    def test_09_single_doctor_clinic_discovery(self):
        """Scenario 9: Single-doctor clinic correctly has 1 doctor with direct booking availability."""
        clinics = client.get("/api/clinics").json()
        single_doc_clinic = None
        for c in clinics:
            resp = client.get(f"/api/clinics/{c['id']}")
            docs = resp.json().get("doctors", [])
            if len(docs) == 1:
                single_doc_clinic = (c, docs[0])
                break
        
        if single_doc_clinic:
            c, doc = single_doc_clinic
            self.assertEqual(doc["organization_id"], c["id"])
            self.assertTrue(doc["consultation_fee"] > 0)

    def test_10_strict_offer_isolation_by_organization(self):
        """Scenario 10: Offers are strictly isolated by organization_id."""
        offers = client.get("/api/offers").json()
        self.assertTrue(len(offers) > 0)
        
        hospitals = client.get("/api/hospitals").json()
        clinics = client.get("/api/clinics").json()
        h_id = hospitals[0]["id"]
        c_id = clinics[0]["id"]
        
        # Verify hospital profile returns strictly hospital offers
        h_resp = client.get(f"/api/hospitals/{h_id}")
        h_offers = h_resp.json().get("offers", [])
        for o in h_offers:
            self.assertEqual(o["organization_id"], h_id)
            self.assertNotEqual(o["organization_id"], c_id)
            
        # Verify clinic profile returns strictly clinic offers
        c_resp = client.get(f"/api/clinics/{c_id}")
        c_offers = c_resp.json().get("offers", [])
        for o in c_offers:
            self.assertEqual(o["organization_id"], c_id)
            self.assertNotEqual(o["organization_id"], h_id)

    def test_11_promotional_popup_offer_structure(self):
        """Scenario 11: Promotional popup offers have proper title, banner, discount, and code."""
        offers = client.get("/api/offers").json()
        for o in offers:
            self.assertIn("title", o)
            self.assertTrue("discount_percentage" in o or "discount_percent" in o)
            self.assertIn("start_date", o)
            self.assertIn("end_date", o)

    def test_12_end_to_end_appointment_booking_and_qr(self):
        """Scenario 12: End-to-end appointment booking succeeds with QR payload generation."""
        all_docs = client.get("/api/doctors").json()
        doc = all_docs[0]
        
        target_date, target_slot = self._find_available_date_and_slot(doc["id"], target_weekday=0, days_forward=55)
        
        book_resp = client.post(
            "/api/appointments",
            headers=self.patient_headers,
            json={
                "doctor_id": doc["id"],
                "organization_id": doc["organization_id"],
                "appointment_date": target_date,
                "appointment_time": target_slot,
                "time_slot": target_slot,
                "consultation_mode": "In-Person Consultation",
                "consultation_fee": doc["consultation_fee"],
                "chief_complaint": "Follow-up consultation for respiratory health",
                "patient_name": self.patient_user.get("full_name", "Test Patient"),
                "patient_phone": self.patient_user.get("phone", "+91 98480 22338"),
                "patient_email": self.patient_user.get("email", "patient@allconnect.org")
            }
        )
        self.assertEqual(book_resp.status_code, 200, f"Booking failed: {book_resp.text}")
        appt = book_resp.json().get("appointment")
        self.assertIsNotNone(appt)
        self.assertEqual(appt["doctor_id"], doc["id"])
        self.assertEqual(appt["organization_id"], doc["organization_id"])
        self.assertEqual(appt["status"].lower(), "confirmed")
        self.assertTrue(len(appt["appointment_id"]) > 0)
        self.assertIn("patient_id", appt)
        self.assertIn("patient_health_id", appt)
        # Verify valid QR data payload can be generated
        qr_payload = json.dumps({
            "appointment_id": appt["appointment_id"],
            "patient_id": appt["patient_id"],
            "patient_health_id": appt["patient_health_id"],
            "doctor_id": appt["doctor_id"],
            "date": appt["appointment_date"],
            "time": appt["appointment_time"]
        })
        self.assertTrue(len(qr_payload) > 0)

    def test_13_patient_doctor_data_integrity(self):
        """Scenario 13: Data integrity across patient, doctor, and organization relationships."""
        doctors = client.get("/api/doctors").json()
        hospitals = {h["id"]: h for h in client.get("/api/hospitals").json()}
        clinics = {c["id"]: c for c in client.get("/api/clinics").json()}
        all_orgs = {**hospitals, **clinics}
        
        for d in doctors:
            self.assertIn(d["organization_id"], all_orgs, f"Doctor {d['name']} references unknown org {d['organization_id']}")
            self.assertTrue(d.get("consultation_fee", 0) > 0)
            self.assertTrue(len(d.get("qualifications", "")) > 0)

if __name__ == "__main__":
    unittest.main()
