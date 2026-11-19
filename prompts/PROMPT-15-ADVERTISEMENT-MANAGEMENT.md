# PROMPT 15: Promotional Offers & Campaign Moderation Workflow

## Objective
Implement independent hospital/clinic promotional campaign creation, Super Admin moderation (`approve`, `reject`, `suspend`), and public package carousels.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/18-ADVERTISEMENT-AND-OFFERS.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/hospital-management/SKILL.md`
   - `.agent/skills/subscription-management/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/pages/OffersPage.jsx`, `backend/routes/offers.py`, and `backend/routes/admin.py`.
5. **Implement / Verify**:
   - Hospital/clinic authors campaign -> saved with `workflow_status: pending_review`.
   - Super Admin approves campaign -> status updated to `published`.
   - Public endpoint `/api/offers` only returns campaigns where `workflow_status == 'published'`.
   - Public carousels and direct "Book Package" interaction triggering `AppointmentBookingModal`.
6. **Test Implementation**:
   - Test campaign creation and moderation via `python backend/test_flows.py` (Flow 7).
7. **Update Documentation**: Update `docs/18-ADVERTISEMENT-AND-OFFERS.md`.
8. **Update Development Tracking**: Mark items in `development/FEATURE-TRACKER.md`.
