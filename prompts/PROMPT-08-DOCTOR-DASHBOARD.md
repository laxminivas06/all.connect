# PROMPT 08: Doctor Workstation & Digital Prescription Editor

## Objective
Implement the Doctor Workstation, live OPD consulting queue, consent-verified medical records viewer, and the interactive digital prescription authoring and signing tool.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/11-DOCTOR-WORKFLOW.md` and `docs/15-PRESCRIPTION-SYSTEM.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/prescription-management/SKILL.md`
   - `.agent/skills/healthcare-security/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/pages/doctor/DoctorDashboard.jsx` and `backend/routes/doctors.py`.
5. **Implement / Verify**:
   - Scheduled queue with consultation status triggers (`Start Consult`, `Complete`).
   - Longitudinal medical history viewer enforcing patient consent permissions.
   - Digital Prescription Authoring Tool with structured medication regimen builder (dosage, frequency, duration, instructions), advice, and follow-up date.
   - On signing: generates `PRE-2026-X`, marks appointment `Completed`, and notifies patient.
6. **Test Implementation**:
   - Log in as `doctor` / `Doctor@123` and author a digital prescription.
7. **Update Documentation**: Update `docs/11-DOCTOR-WORKFLOW.md`.
8. **Update Development Tracking**: Record updates in `development/FEATURE-TRACKER.md`.
