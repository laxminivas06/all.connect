# AllConnect: Centralized Multi-Hospital Healthcare Ecosystem
## Master Project Context & AI Reference Guide

---

## 1. What We Are Building
**AllConnect** is an integrated multi-tenant Healthcare SaaS and patient-facing healthcare discovery marketplace in **Hyderabad, Telangana**. It federates multiple independent hospitals, small clinics, doctors, diagnostic centers, and pharmacies into one unified platform.

---

## 2. Why We Are Building It
Healthcare delivery in urban India is highly fragmented. Patients are forced to juggle disparate hospital applications, transport physical paper prescriptions, and search blindly for prescribed medicines across local pharmacies. AllConnect unifies these services under a single **Centralized Health Identity** (`HC-2026-X` / `PAT-2026-X`), providing reverse quotation bidding for pharmacies, consent-based medical records, and multi-tenant SaaS dashboards for healthcare providers.

---

## 3. Technology Stack & Directory Structure
- **Frontend (`frontend/`)**: React 18, Vite, Tailwind CSS, React Router v6, Lucide React icons, Recharts.
- **Backend (`backend/`)**: Python 3.10+, FastAPI, PyJWT, Pydantic v2.
- **Persistence (`backend/database/`)**: Thread-safe atomic JSON file repository with structured entities, engineered for zero-rewrite PostgreSQL migration.
- **Knowledge Base**:
  - `.agent/rules/`: Global engineering standards, security rules, and healthcare domain logic.
  - `.agent/skills/`: 19 Antigravity-compatible specialized skill modules (`SKILL.md`).
  - `docs/`: 25 comprehensive architectural, workflow, and API documentation files.
  - `prompts/`: Standardized prompt library anchored by `MASTER-PROMPT.md`.
  - `development/`: Progress, feature, API, and bug tracking files.

---

## 4. Six Distinct User Roles & Dashboards
1. **Patient Dashboard (`/dashboard/patient`)**: Health Card (`HC-2026-X`), appointments, digital prescriptions, simulated OCR scanner, pharmacy quotation comparator, pickup passcodes (`PICK-XXXXX`), consent management.
2. **Hospital Dashboard (`/dashboard/hospital`)**: Multi-tenant SaaS for Yashoda, Apollo, KIMS. Queue movements, doctor onboarding, billing telemetry, and promotional campaign creation.
3. **Independent Clinic Dashboard (`/dashboard/clinic`)**: Primary care console for MedPlus & Balaji Clinics. Rapid walk-in registration, instant tokens, waiting queue, and counter cash collections.
4. **Doctor Dashboard (`/dashboard/doctor`)**: Specialist workstation for Dr. Rajesh Sharma. Live OPD queue, consent-verified EHR history, and interactive digital prescription authoring.
5. **Pharmacy Dashboard (`/dashboard/pharmacy`)**: Chemist console for Apollo Pharmacy Malkajgiri. Incoming quotation requests, order pipelines, and counter pickup passcode validation.
6. **Super Admin Dashboard (`/dashboard/admin`)**: Platform governance. Hospital/clinic verification, public directory publishing toggles (`published`/`unpublished`), SaaS plan subscriptions & override modal, doctor & pharmacy license accreditation, HIPAA/ABDM audit logs, and live database diagnostics.

---

## 5. Current Implementation Status

### ✅ Implemented & Verified Features (Completed)
- [x] Multi-tenant FastAPI backend with CORS, Pydantic schemas, and PBKDF2 hashing.
- [x] Pre-seeded Hyderabad dataset (5 hospitals, 8 clinics, 15 doctors, 20 patients, 10 pharmacies, 30 appointments, 15 prescriptions, 15 orders, 10 promotional offers).
- [x] Responsive React frontend with unified navbar and 1-click Role Switcher.
- [x] Centralized Patient Registration generating `PAT-2026-X` and `HC-2026-X`.
- [x] Doctor Appointment Booking with double-booking collision prevention.
- [x] Doctor Consultation with Digital Prescription Authoring (`PRE-2026-X`).
- [x] Simulated OCR paper prescription scanning with mandatory patient verification.
- [x] Reverse Pharmacy Quotation Engine comparing prices, distance, availability, and delivery ETAs.
- [x] Medicine Order Placement with 5-digit counter pickup codes (`PICK-XXXXX`).
- [x] Pharmacy Pickup Passcode Verification terminal authorizing medication handover.
- [x] Hospital Promotional Campaign creation and Super Admin moderation workflow.
- [x] Super Admin Public Directory Publishing Status controls (`published`/`unpublished`).
- [x] Super Admin 7-tab governance console: MRR/ARR analytics, provider publishing, doctor registry & verification, pharmacy accreditation, campaign moderation, HIPAA/ABDM security audit logs, and live system health diagnostics.
- [x] Granular Patient Consent Management for cross-hospital record sharing.
- [x] Automated integration test suite (`backend/test_flows.py`) validating all 11 core and administrative flows.

### ⏳ Planned Enhancements (Pending)
- [ ] PostgreSQL 16 migration with SQLAlchemy async sessions.
- [ ] Production OCR integration (Google Cloud Document AI / AWS Textract).
- [ ] Real payment gateway integration (Razorpay / Cashfree).
- [ ] WebSockets for live OPD waiting room queue updates.
- [ ] Official ABDM (Ayushman Bharat Digital Mission) sandbox certification.

---

## 6. How AI Agents Must Execute Work
1. Read this `PROJECT-CONTEXT.md` first.
2. Read `prompts/MASTER-PROMPT.md` for architectural invariants.
3. Read relevant module documentation in `docs/`.
4. Load specialized skills from `.agent/skills/`.
5. Inspect existing code in `frontend/src/` and `backend/` before writing any new code.
6. Run integration tests (`python backend/test_flows.py`) and frontend build (`npm run build`).
7. Update tracking in `development/` and documentation in `docs/`.
