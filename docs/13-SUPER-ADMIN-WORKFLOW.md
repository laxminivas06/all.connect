# 13: Super Admin Governance Workflow

## 1. Overview
The Super Admin dashboard belongs to the platform owner. It provides ecosystem-wide monitoring, financial recurring revenue telemetry (MRR/ARR), tenant lifecycle approvals, public publishing visibility controls, doctor medical council licensing, pharmacy accreditation, subscription overrides, advertisement moderation, HIPAA/ABDM security audit trails, and live database health telemetry.

## 2. Core Administrative Operations

### A. Hospital & Clinic Tenant Governance & Publishing Controls
1. Healthcare facilities submit onboarding applications through `/register` or administrative onboarding.
2. Initial status: `verification_status: under_review` and `publishing_status: unpublished`.
3. Super Admin verifies licenses and facility credentials.
4. Admin can override or comp subscription plans via the **Subscription Override Modal** (e.g., granting `hospital_enterprise` or extending trial periods).
5. Super Admin toggles **Publish to Public**:
   - The organization instantly becomes discoverable in `/hospitals` or `/clinics`.
   - If toggled to **Unpublish**, the organization and its doctors are immediately withdrawn from public patient discovery while retaining internal EHR data integrity.

### B. Doctor Registry & Medical Council Credentialing
1. Aggregates all doctors practicing across participating hospitals and independent clinics.
2. Super Admin inspects doctor specialties, experience, and state medical council registration numbers (e.g. `TSMC-2018-8421`).
3. Admin controls:
   - **Verify License**: Confirms official medical accreditation (`verified`).
   - **Suspend License**: Instantly disables doctor consultation booking across the platform (`suspended`).

### C. Pharmacy Network & Drug License Accreditation
1. Tracks retail and hospital pharmacy chains (e.g., Apollo, MedCity, Care).
2. Verifies drug dispensing license certificates (`TS-HYD-DL-2024-912`) and fulfillment capabilities (store pickup and home delivery).
3. One-click toggle between **Accredited** and **Suspended**.

### D. Promotional Campaign & Offer Moderation
1. Hospitals submit discounted health checkup and diagnostic screening packages.
2. Campaigns enter the **Ad & Offer Moderation** queue with status `pending_review`.
3. Super Admin reviews discounted rates against standard market fees to prevent deceptive practices:
   - **Approve & Publish**: Campaign becomes publicly visible on `/offers` and patient discovery.
   - **Reject**: Offer is rejected with feedback.
   - **Suspend**: Immediately halts an active promotional offer.

### E. Security & ABDM Health Data Audit Logs
1. Dedicated audit trail viewer tracking:
   - Organization publishing status changes
   - Promotional campaign approvals / rejections
   - Patient consent grants and EHR access events
   - Digital prescription creation and pharmacy dispensation
   - Counter pickup 6-digit passcode validations
   - Double-booking concurrency blocks and brute-force rate-limiting
2. Filters by severity (`info`, `warning`, `critical`) conforming to HIPAA Security Rule and ABDM Health Data Management Policy.

### F. System Diagnostics & Storage Health
1. Real-time telemetry monitoring:
   - Total records and byte footprints across all 14 atomic JSON entities
   - Re-entrant thread lock status (`threading.RLock()`)
   - Automated backup swap integrity (`.tmp` + `os.replace`)
   - PostgreSQL 16 migration readiness validation.

### G. Financial SaaS MRR & ARR Analytics
- Aggregates recurring payments from active Starter (₹4,999/mo), Professional (₹12,999/mo), and Enterprise (₹29,999/mo) plans.
- Visualizes monthly growth trends using interactive Recharts line charts.
