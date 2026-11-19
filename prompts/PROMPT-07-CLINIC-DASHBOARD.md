# PROMPT 07: Independent Clinic SaaS Dashboard

## Objective
Implement the streamlined Independent Clinic SaaS dashboard for neighborhood polyclinics (MedPlus, Balaji), featuring rapid walk-in registration, instant token issuance, and daily collections.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/10-CLINIC-WORKFLOW.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/clinic-management/SKILL.md`
   - `.agent/skills/healthcare-ux-design/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/pages/clinic/ClinicDashboard.jsx` and `backend/routes/clinics.py`.
5. **Implement / Verify**:
   - Streamlined OPD waiting lounge queue.
   - Quick Walk-In Patient Registration modal with instant token and cash/UPI recording.
   - Daily counter collection calculation.
6. **Test Implementation**:
   - Log in as `clinic` / `Clinic@123` and test rapid walk-in entry.
7. **Update Documentation**: Update `docs/10-CLINIC-WORKFLOW.md`.
8. **Update Development Tracking**: Record updates in `development/FEATURE-TRACKER.md`.
