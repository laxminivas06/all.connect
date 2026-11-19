# PROMPT 09: Pharmacy Dashboard & Quotation Management

## Objective
Implement the Pharmacy SaaS Dashboard for registered medical stores (Apollo Pharmacy, MedPlus, etc.) to review quotation requests, manage order pipelines, and verify counter pickup passcodes.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/12-PHARMACY-WORKFLOW.md` and `docs/16-PHARMACY-QUOTATION-SYSTEM.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/pharmacy-marketplace/SKILL.md`
   - `.agent/skills/healthcare-security/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/pages/pharmacy/PharmacyDashboard.jsx` and `backend/routes/pharmacies.py`.
5. **Implement / Verify**:
   - Prescription order queue with progress triggers: `Pharmacy Verification` -> `Preparing` -> `Ready for Pickup`.
   - Counter Pickup Passcode Verification terminal: Pharmacist enters customer's 5-digit code (`PICK-XXXXX`), verifies match, and marks order `Collected`.
   - Medication inventory catalog view with unit pricing and stock indicators.
6. **Test Implementation**:
   - Log in as `pharmacy` / `Pharmacy@123` and test passcode verification.
7. **Update Documentation**: Update `docs/12-PHARMACY-WORKFLOW.md`.
8. **Update Development Tracking**: Record updates in `development/FEATURE-TRACKER.md`.
