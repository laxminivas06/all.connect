# PROMPT 06: Multi-Tenant Hospital SaaS Dashboard

## Objective
Implement the enterprise Hospital SaaS console for Yashoda, Apollo, KIMS, and other tertiary medical institutions with OPD queues, specialist onboarding, billing analytics, and campaign authoring.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/09-HOSPITAL-WORKFLOW.md` and `docs/03-SYSTEM-ARCHITECTURE.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/hospital-management/SKILL.md`
   - `.agent/skills/multi-tenant-architecture/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/pages/hospital/HospitalDashboard.jsx` and `backend/routes/hospitals.py`.
5. **Implement / Verify**:
   - Scoped data access: Only load appointments and doctors matching `current_user['organization_id']`.
   - Recharts telemetry: Monthly revenue progression and department distribution.
   - Status triggers: Move appointments through `Checked In`, `In Consultation`, and `Completed`.
   - Specialist onboarding form with subscription quota check.
   - Promotional campaign creation modal.
6. **Test Implementation**:
   - Log in as `hospital` / `Hospital@123` and test queue transitions and specialist creation.
7. **Update Documentation**: Update `docs/09-HOSPITAL-WORKFLOW.md`.
8. **Update Development Tracking**: Record updates in `development/FEATURE-TRACKER.md`.
