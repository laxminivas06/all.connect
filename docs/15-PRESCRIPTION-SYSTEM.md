# 15: Prescription Management & OCR Extraction

## 1. System Overview
The prescription system supports two distinct methods for managing clinical prescriptions:
1. **Doctor-Generated Digital Prescriptions**: Authored by verified physicians during outpatient consultations.
2. **Patient-Uploaded Paper Prescriptions**: Captured via camera or file upload, parsed through simulated OCR, and verified by the patient.

## 2. Structured Prescription Payload
Prescriptions are stored with clinical metadata:
```json
{
  "id": "PRE-2026-000101",
  "patient_id": "PAT-2026-000001",
  "patient_name": "Laxmi Narayana Sharma",
  "health_id": "HC-2026-000001",
  "doctor_id": "doc-001",
  "doctor_name": "Dr. Rajesh Sharma",
  "organization_name": "Yashoda Super Speciality Hospital",
  "consultation_date": "2026-01-18",
  "diagnosis": "Essential Systemic Hypertension",
  "vitals": {"blood_pressure": "144/92 mmHg", "pulse": "78 bpm"},
  "medicines": [
    {
      "name": "Telmisartan 40mg",
      "dosage": "40mg",
      "frequency": "Once Daily (Morning)",
      "duration": "30 Days",
      "instructions": "Take at fixed hour. Monitor BP weekly."
    }
  ],
  "advice": "Low sodium diet, 30 minutes brisk walking daily.",
  "status": "Authorized & Published"
}
```

## 3. Simulated OCR Engine Architecture
- Endpoint: `/api/prescriptions/simulate-ocr`
- Extracts:
  - Doctor qualifications & clinic headers.
  - Raw handwriting transcription lines.
  - Candidate structured medicines list (name, dosage, frequency).
- *Safety Protocol*: The extracted candidate list is presented to the patient in an editable UI grid (`PrescriptionUploadModal.jsx`) for human verification prior to saving or submitting for quotation.
