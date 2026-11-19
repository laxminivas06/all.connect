# PROMPT 17: Security Hardening & Consent Enforcement

## Objective
Enforce granular patient record sharing consent, organization-level data segregation, PBKDF2 password hashing, and token expiration verification.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/19-SECURITY-AND-PRIVACY.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/healthcare-security/SKILL.md`
   - `.agent/skills/backend-development/SKILL.md`
4. **Inspect Existing Code**:
   - Review consent checks in `backend/routes/patients.py` and password hashing in `backend/services/auth_utils.py`.
5. **Implement / Verify**:
   - `/api/patients/{patient_id}` checks `current_user.organization_id in patient.permitted_organizations`.
   - If not permitted, return demographic data with `consent_status: "RESTRICTED"`.
   - Ensure Super Admin has tenant oversight but lacks unrestricted access to private medical histories by default.
6. **Test Implementation**:
   - Test consent restriction via `python backend/test_flows.py` (Flow 9).
7. **Update Documentation**: Update `docs/19-SECURITY-AND-PRIVACY.md`.
8. **Update Development Tracking**: Mark items in `development/FEATURE-TRACKER.md`.
