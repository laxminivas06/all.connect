# PROMPT 04: Role-Based Authentication & Session Handling

## Objective
Implement secure authentication using PBKDF2-HMAC password hashing, PyJWT token issuance, and protected dashboard routing across the six platform roles.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/07-USER-ROLES-AND-PERMISSIONS.md` and `docs/19-SECURITY-AND-PRIVACY.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/healthcare-security/SKILL.md`
   - `.agent/skills/backend-development/SKILL.md`
4. **Inspect Existing Code**:
   - Review `backend/services/auth_utils.py`, `backend/routes/auth.py`, and `frontend/src/context/AuthContext.jsx`.
5. **Implement / Verify**:
   - `/api/auth/login` validates credentials and returns JWT with role and tenant claims.
   - `/api/auth/demo-accounts` provides the 6 prototype credentials.
   - `AuthContext.jsx` provides `loginAs(roleKey)` for instantaneous 1-click persona switching.
6. **Test Implementation**:
   - Run integration tests in `backend/test_flows.py`.
7. **Update Documentation**: Update `docs/07-USER-ROLES-AND-PERMISSIONS.md`.
8. **Update Development Tracking**: Mark authentication items in `development/FEATURE-TRACKER.md`.
