# PROMPT 14: SaaS Subscription Engine & Quota Enforcement

## Objective
Implement multi-tenant subscription tiers (Starter, Professional, Enterprise), doctor/staff quota enforcement, and recurring revenue analytics (MRR/ARR).

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/17-SUBSCRIPTION-AND-BILLING.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/subscription-management/SKILL.md`
   - `.agent/skills/multi-tenant-architecture/SKILL.md`
4. **Inspect Existing Code**:
   - Review `backend/routes/subscriptions.py` and `backend/routes/admin.py`.
5. **Implement / Verify**:
   - Plans catalogue endpoint `/api/subscriptions/plans`.
   - Subscription upgrade/renewal endpoint `/api/subscriptions/subscribe`.
   - Quota enforcement in `/api/hospitals/dashboard/doctors` preventing addition of specialists exceeding plan limits.
   - Calculation of MRR and ARR for the Super Admin platform dashboard.
6. **Test Implementation**:
   - Test plan assignment and MRR telemetry via `python backend/test_flows.py` (Flow 8 & 10).
7. **Update Documentation**: Update `docs/17-SUBSCRIPTION-AND-BILLING.md`.
8. **Update Development Tracking**: Mark items in `development/FEATURE-TRACKER.md`.
