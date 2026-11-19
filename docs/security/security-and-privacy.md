# 19: Security, Privacy & Indian Data Protection Alignment

## 1. Compliance Architecture Overview
AllConnect is designed with Indian healthcare principles (DISHA guidelines, Digital Personal Data Protection Act - DPDP) and international HIPAA privacy standards in mind:
1. **Consent-Driven Access**: The patient owns their clinical data. Cross-hospital access requires explicit authorization in the patient's consent settings.
2. **Tenant Isolation**: Strict logical segregation prevents cross-tenant access to private operational and billing data.
3. **No Statutory Identity Confusion**: Platform Health IDs (`HC-2026-X`) are clearly labeled as ecosystem identifiers, never confused with official government ABHA IDs.

## 2. Authentication & Data Protection Standards
- **PBKDF2-HMAC Hashing**: 100,000 rounds of SHA-256 with cryptographically generated 16-byte random salts.
- **PyJWT Tokens**: Signed with HMAC-SHA256, carrying user role and organization claims.
- **Dispensing Security**: 5-digit verification passcodes (`PICK-XXXXX`) are required for pharmacy counter medication handovers.
- **Synthetic Prototype Data**: All pre-seeded patient, doctor, and hospital records in the development environment are synthetic.
