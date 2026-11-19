# Healthcare Security, Privacy & Data Protection Rules

Strict security, authentication, and regulatory constraints for the Centralized Healthcare Ecosystem.

---

## 1. Authentication & Password Security
- **No Plaintext Passwords**: Never store raw passwords in memory or database files.
- **Hashing Standard**: Passwords must be hashed using `hashlib.pbkdf2_hmac` with `SHA-256`, a minimum of `100,000` iterations, and a cryptographically secure random 16-byte salt (`os.urandom(16)`).
- **JWT Cryptographic Integrity**: Standard HMAC-SHA256 signing using an environment-backed `SECRET_KEY`. Include expiration timestamps (`exp`) and token issuer validation.

---

## 2. Patient Privacy & Granular Consent Control
- **Consent-First Record Access**:
  - A patient's full medical history, diagnostic reports, and digital prescriptions must **never** be globally visible to all participating organizations.
  - When an organization or doctor requests `/api/patients/{patient_id}`, the backend checks if `organization_id` is present in `patient.permitted_organizations`.
  - If consent is not granted, the backend returns only non-sensitive demographic attributes and explicitly sets `consent_status: "RESTRICTED"`.
- **Super Admin Medical Record Privacy**:
  - The Super Admin oversees platform tenant governance, subscriptions, and advertisement moderation.
  - Platform administrators must **not** have unrestricted access to private patient clinical records by default.

---

## 3. Multi-Tenant Data Isolation
- **Organization Boundary Checks**:
  - Hospital staff accounts possess an `organization_id` claim in their JWT token.
  - Endpoints retrieving appointments, billing collections, or private doctor records must enforce `organization_id == current_user['organization_id']`.
  - A tenant must never receive, modify, or delete another hospital's operational records.

---

## 4. Medication Dispensing & Order Security
- **Counter Pickup Passcode Verification**:
  - Every medicine order generates a unique encrypted pickup code (e.g., `PICK-48291`).
  - Pharmacy personnel must enter and verify this passcode in the terminal before dispensing medications and marking orders as `Collected`.
- **No Automatic Drug Substitution**:
  - Prescriptions must be quoted and dispensed strictly as prescribed. Automatic brand or molecule replacement without licensed clinical oversight is prohibited.

---

## 5. File Upload Validation
- Uploaded prescription scans and diagnostic lab reports must be validated for:
  - Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`.
  - Safe file size limits (maximum 10 MB per document).
  - Sanitized filenames preventing path traversal vulnerabilities (`..`, `/`, `\`).
