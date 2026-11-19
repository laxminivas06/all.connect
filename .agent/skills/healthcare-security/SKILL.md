---
name: healthcare-security
description: >-
  Security procedures for patient consent enforcement, medical history redaction,
  PBKDF2-HMAC password encryption, and HIPAA/DISHA data protection alignment.
---

# Healthcare Security Skill

## Overview
Guidelines for securing protected health information (PHI), clinical diagnostic records, and authentication tokens across the ecosystem.

## 1. Consent-Based Record Redaction
When any healthcare organization or doctor requests patient profile information, enforce granular consent checking:

```python
# Check if caller is authorized
permitted = patient.get("permitted_organizations", [])
is_authorized = (
    current_user["role"] == "super_admin" or
    current_user["role"] == "patient" or
    current_user.get("organization_id") in permitted
)

if not is_authorized:
    return {
        "patient_id": patient["patient_id"],
        "health_id": patient["health_id"],
        "full_name": patient["full_name"],
        "gender": patient["gender"],
        "age": patient["age"],
        "consent_status": "RESTRICTED",
        "message": "Patient has not granted permission for this organization to view full medical history."
    }
```

## 2. Password Hashing Specification
In `backend/services/auth_utils.py`:
- Use `hashlib.pbkdf2_hmac("sha256", password, salt, 100000)`.
- Never use simple single-round MD5 or SHA-1.
- Store formatted string: `<salt_hex>$<key_hex>`.

## 3. Token Security & Lifetime
- JWT tokens signed with HS256 and environment secret.
- Expiration set to 24 hours (`ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24`).
- Validate signatures on every request using FastAPI's `Security(security_bearer)`.

## 4. Medication Order Verification Codes
- To prevent medication pickup fraud, every order generates a pseudo-random verification code (`PICK-XXXXX`).
- Pharmacists must type and verify this code before the order is marked `Collected`.
