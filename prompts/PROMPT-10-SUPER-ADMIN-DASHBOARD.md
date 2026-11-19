# PROMPT 10: Super Admin Dashboard & Governance

## Objective
Implement the Super Admin control room for ecosystem governance, recurring revenue analytics (MRR/ARR), tenant review, public publishing controls, and advertisement moderation.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/13-SUPER-ADMIN-WORKFLOW.md` and `docs/17-SUBSCRIPTION-AND-BILLING.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/subscription-management/SKILL.md`
   - `.agent/skills/multi-tenant-architecture/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/pages/admin/SuperAdminDashboard.jsx` and `backend/routes/admin.py`.
5. **Implement / Verify**:
   - Platform KPI cards (Total hospitals, clinics, doctors, pharmacies, patients, active subscriptions).
   - Real-time MRR and ARR telemetry with Recharts growth lines.
   - Tenant directory with toggles for **Public Directory Publishing Status** (`published` / `unpublished`).
   - Campaign moderation queue: Review submitted offers and click **Approve & Publish** or **Reject**.
6. **Test Implementation**:
   - Log in as `admin` / `Admin@123` and test publishing toggles and ad approvals.
7. **Update Documentation**: Update `docs/13-SUPER-ADMIN-WORKFLOW.md`.
8. **Update Development Tracking**: Record updates in `development/FEATURE-TRACKER.md`.
