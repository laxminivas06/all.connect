# 11: Doctor Workstation & Consultation Workflow

## 1. Overview
The Doctor Workstation is a focused clinical interface for physicians and specialists (e.g. Dr. Rajesh Sharma, MD DM Cardiology). It organizes today's patient queue, consent-verified longitudinal medical records, and digital prescription authoring.

## 2. Clinical Consultation Steps
1. **Queue Inspection**: The doctor views scheduled patients sorted by appointment time. Patients marked `Checked In` or `Waiting` appear with prominent consultation badges.
2. **Reviewing Patient Records**:
   - The doctor clicks **View History**.
   - Backend checks patient consent (`patient.permitted_organizations`).
   - If permitted, displays past prescriptions, recorded allergies, chronic illnesses, and diagnostic lab reports.
   - If not permitted, displays warning that consent is restricted to demographic data only.
3. **Digital Prescription Authoring**:
   - The doctor clicks **Open Rx Editor**.
   - Inputs clinical diagnosis, symptoms, and vitals (Blood Pressure, Pulse, Weight).
   - Adds structured medicine items: name, dosage, frequency, duration, instructions.
   - Adds clinical diet/lifestyle advice and follow-up date.
4. **Digital Authorization & Publication**:
   - The doctor clicks **Sign & Authorize Prescription**.
   - Backend saves digital prescription `PRE-2026-X` with status `Authorized & Published`.
   - The associated appointment is transitioned to `Completed`.
   - The patient receives an in-app notification with a direct link to compare nearby pharmacy quotes.
