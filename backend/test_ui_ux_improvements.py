import unittest
import json
from fastapi.testclient import TestClient
from main import app
from database.db import load_table, save_table, insert, find_one
from services.auth_utils import create_access_token

client = TestClient(app)

class TestUIUXImprovements(unittest.TestCase):
    def setUp(self):
        # Create test patient and admin tokens
        self.patient_token = create_access_token({
            "sub": "test-patient-001",
            "username": "test_patient",
            "role": "patient",
            "entity_id": "test-pat-001"
        })
        self.patient_headers = {"Authorization": f"Bearer {self.patient_token}"}

        self.hospital_token = create_access_token({
            "sub": "test-hospital-admin",
            "username": "yashoda_admin",
            "role": "hospital",
            "organization_id": "hosp-001",
            "entity_id": "hosp-001"
        })
        self.hospital_headers = {"Authorization": f"Bearer {self.hospital_token}"}

    def test_01_notification_deletion(self):
        # 1. Insert a test notification for our test patient
        test_notif = {
            "id": "notif-test-001",
            "user_id": "test-patient-001",
            "role": "patient",
            "title": "Test Notification 1",
            "message": "Appointment scheduled successfully",
            "is_read": False,
            "created_at": "2026-11-20T10:00:00"
        }
        insert("notifications", test_notif)

        # Verify it shows up in get notifications
        res = client.get("/api/notifications", headers=self.patient_headers)
        self.assertEqual(res.status_code, 200)
        notif_ids = [n["id"] for n in res.json()]
        self.assertIn("notif-test-001", notif_ids)

        # 2. Test single notification deletion
        del_res = client.delete("/api/notifications/notif-test-001", headers=self.patient_headers)
        self.assertEqual(del_res.status_code, 200)
        self.assertIn("deleted successfully", del_res.json().get("message", ""))

        # Verify it no longer exists
        res_after = client.get("/api/notifications", headers=self.patient_headers)
        notif_ids_after = [n["id"] for n in res_after.json()]
        self.assertNotIn("notif-test-001", notif_ids_after)

        # 3. Test clear all notifications
        insert("notifications", {
            "id": "notif-test-002",
            "user_id": "test-patient-001",
            "role": "patient",
            "title": "Test 2",
            "message": "Reminder",
            "is_read": False,
            "created_at": "2026-11-20T10:05:00"
        })
        insert("notifications", {
            "id": "notif-test-003",
            "user_id": "test-patient-001",
            "role": "patient",
            "title": "Test 3",
            "message": "Prescription Ready",
            "is_read": False,
            "created_at": "2026-11-20T10:10:00"
        })

        clear_res = client.delete("/api/notifications", headers=self.patient_headers)
        self.assertEqual(clear_res.status_code, 200)
        self.assertTrue(clear_res.json().get("deleted_count", 0) >= 2)

        # Verify empty for this user
        res_empty = client.get("/api/notifications", headers=self.patient_headers)
        user_notifs = [n for n in res_empty.json() if n.get("user_id") == "test-patient-001"]
        self.assertEqual(len(user_notifs), 0)

    def test_02_intelligent_medical_keyword_and_synonym_search(self):
        # Test search with synonym keyword 'heart'
        res = client.get("/api/doctors/discovery-search?query=heart")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("Cardiology", data.get("matched_departments", []))
        self.assertTrue(len(data.get("doctors", [])) > 0)
        # Verify non-diagnostic disclaimer
        self.assertIn("Healthcare discovery suggestions, not a medical diagnosis", data.get("disclaimer", ""))

        # Test search with keyword 'fracture'
        res_ortho = client.get("/api/doctors/discovery-search?query=fracture")
        self.assertEqual(res_ortho.status_code, 200)
        data_ortho = res_ortho.json()
        self.assertIn("Orthopedics", data_ortho.get("matched_departments", []))
        self.assertTrue(len(data_ortho.get("doctors", [])) > 0)

        # Test search with keyword 'skin'
        res_derm = client.get("/api/doctors/discovery-search?query=skin")
        self.assertEqual(res_derm.status_code, 200)
        data_derm = res_derm.json()
        self.assertIn("Dermatology", data_derm.get("matched_departments", []))

    def test_03_doctor_creation_with_structured_fields(self):
        # Hospital admin creates doctor with structured keywords & conditions
        new_doc_payload = {
            "name": "Dr. Aarav Nambiar",
            "email": "dr.aarav.test@yashoda.org",
            "phone": "+91 98490 99881",
            "qualifications": "MBBS, MS (General Surgery), MCh",
            "specialization": "General Surgery",
            "department": "General Surgery",
            "experience_years": 11,
            "consultation_fee": 750,
            "consultation_type": "Both",
            "medical_keywords": ["hernia", "appendix", "gallstones", "laparoscopy"],
            "conditions_treated": ["Inguinal Hernia", "Acute Appendicitis", "Cholelithiasis"],
            "available_days": ["Monday", "Wednesday", "Friday"],
            "working_hours": "10:00 AM - 04:00 PM"
        }

        res = client.post("/api/hospitals/dashboard/doctors", json=new_doc_payload, headers=self.hospital_headers)
        self.assertEqual(res.status_code, 200)
        created_doc = res.json().get("doctor", {})
        self.assertEqual(created_doc.get("specialization"), "General Surgery")
        self.assertIn("hernia", created_doc.get("medical_keywords", []))
        self.assertIn("Inguinal Hernia", created_doc.get("conditions_treated", []))
        self.assertEqual(created_doc.get("consultation_type"), "Both")

        # Now test that searching "hernia" prioritizes this newly created doctor
        search_res = client.get("/api/doctors/discovery-search?query=hernia")
        self.assertEqual(search_res.status_code, 200)
        doc_names = [d["name"] for d in search_res.json().get("doctors", [])]
        self.assertTrue(any("Aarav Nambiar" in name for name in doc_names))

if __name__ == "__main__":
    unittest.main()
