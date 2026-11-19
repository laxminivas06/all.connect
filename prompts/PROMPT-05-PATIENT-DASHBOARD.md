# PROMPT 05: Patient Dashboard & Centralized Identity

## Objective
Implement the comprehensive patient dashboard, Centralized Health ID card (`HC-2026-X`), appointment tracker, prescription locker, medicine orders, and consent controls.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/08-PATIENT-WORKFLOW.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/patient-management/SKILL.md`
   - `.agent/skills/frontend-development/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/pages/patient/PatientDashboard.jsx` and `backend/routes/patients.py`.
5. **Implement / Verify**:
   - Display patient identity header with Universal Health ID and Patient ID.
   - Five sub-view tabs: Overview, Appointments, Prescriptions, Medicine Orders, Diagnostic Records.
   - Interactive modals for Booking, OCR Upload, Health Card with simulated QR code, and Consent Management.
6. **Test Implementation**:
   - Verify patient dashboard via `patient` demo account at `/dashboard/patient`.
7. **Update Documentation**: Update `docs/08-PATIENT-WORKFLOW.md`.
8. **Update Development Tracking**: Mark patient dashboard features in `development/FEATURE-TRACKER.md`.
