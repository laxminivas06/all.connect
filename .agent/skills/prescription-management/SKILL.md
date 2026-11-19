---
name: prescription-management
description: >-
  Digital prescription authoring by doctors, simulated OCR parsing of patient-uploaded scripts,
  structured medication regimens, and patient verification workflows.
---

# Prescription Management Skill

## Overview
Governs both doctor-authored digital prescriptions (`backend/routes/prescriptions.py`) and patient-uploaded prescription image OCR extraction (`PrescriptionUploadModal.jsx`).

## 1. Doctor-Generated Digital Prescriptions
When a doctor completes a consultation:
- Fields: Patient Health ID, Diagnosis, Symptoms, Vitals (BP, Pulse, Weight), interactive medicines array, advice, follow-up date.
- Structured Medicine Array:
  - `name`: e.g., "Telmisartan 40mg"
  - `dosage`: e.g., "40mg"
  - `frequency`: e.g., "Once Daily (Morning)"
  - `duration`: e.g., "30 Days"
  - `instructions`: e.g., "After breakfast with water"
- Generates unique ID: `PRE-YYYY-NNNNNN` (e.g., `PRE-2026-000101`).
- Signing: The doctor authorizes the prescription, which immediately notifies the patient and becomes available in their digital locker.

## 2. Simulated OCR Workflow for Patient Uploads
1. **Upload Trigger**: Patient captures image via camera simulation or selects file.
2. **OCR Parsing Engine**: Calls `/api/prescriptions/simulate-ocr` to extract doctor name, clinic name, raw handwriting text, and candidate medicine rows.
3. **Mandatory Patient Verification**:
   - The UI displays an editable verification grid.
   - The patient verifies and edits medicine names, dosages, and frequencies before saving.
   - *Clinical Rule*: Never assume OCR results are medically correct without human verification.
4. **Instant Action**: Includes a "Find Medicines Near Me" button that sends verified medicines directly to the pharmacy quotation engine.
