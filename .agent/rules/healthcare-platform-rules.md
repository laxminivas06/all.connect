# Healthcare Platform Business Rules & Operational Logic

Core operational logic and state machines governing the AllConnect Healthcare Ecosystem.

---

## 1. Universal Patient Identity Rule
- Every patient receives a centralized platform identity upon registration:
  - **Patient ID**: `PAT-YYYY-NNNNNN` (e.g., `PAT-2026-000001`)
  - **Centralized Health ID**: `HC-YYYY-NNNNNN` (e.g., `HC-2026-000001`)
- This ID remains identical across all participating hospitals (Yashoda, Apollo, KIMS) and clinics (MedPlus, Balaji).
- *Compliance Note*: This platform ID is an ecosystem identity and must never be misrepresented as a statutory government ABHA ID.

---

## 2. Appointment Booking & Double-Booking Prevention Rule
- When an appointment is requested for Doctor $D$, Date $Date$, and Slot $S$:
  1. The system verifies Doctor $D$ is active and associated with the target organization.
  2. The system checks all existing appointments where `doctor_id == D`, `appointment_date == Date`, `appointment_time == S`, and `status != 'Cancelled'`.
  3. If a collision is found, the system **rejects** the request with HTTP 400: *"Slot 'S' on Date is already booked for Dr. D. Please select another slot."*
  4. Double bookings are prohibited across both online patient bookings and clinic walk-in entries.

### Appointment Status State Machine:
```
[Pending] ──► [Confirmed] ──► [Checked In] ──► [Waiting] ──► [In Consultation] ──► [Completed]
    │              │                │              │
    ▼              ▼                ▼              ▼
[Cancelled]   [Cancelled]      [Cancelled]    [Cancelled]
```

---

## 3. Organization Publishing Eligibility Rule
Registration of a hospital, clinic, or pharmacy does **not** automatically publish it into the public search directory. Visibility is governed by four distinct statuses:

1. **`subscription_status`**: `active`, `pending_payment`, `trial`, `suspended`
2. **`verification_status`**: `verified`, `under_review`, `suspended`
3. **`account_status`**: `active`, `inactive`
4. **`publishing_status`**: `published`, `unpublished`

- **Rule**: An organization only appears in public patient searches (`/api/hospitals`, `/api/clinics`, `/api/pharmacies`) if `publishing_status == 'published'`.
- The Super Admin maintains manual override authority to toggle any tenant's public visibility at any time.

---

## 4. Promotional Offers & Advertisement Workflow
Every hospital and clinic possesses an independent promotional campaign module.
```
[Draft] ──► [Submit for Review (Pending Review)] ──► [Super Admin Moderation]
                                                              │
                     ┌────────────────────────────────────────┴──────────────────┐
                     ▼                                                           ▼
                [Approved]                                                  [Rejected]
                     │
                     ▼
           [Published to Public] ──► [Expired]
```
- Only offers with `workflow_status == 'published'` appear in public search directories and patient portals.
- Misleading promotions can be suspended or rejected by the Super Admin at any time.

---

## 5. Prescription-Based Quotation & Fulfillment Workflow
```
[Patient Selects Prescription / Medicine List] ──► [Query Nearby Pharmacies by Location]
                         │
                         ▼
        [Compare Prices, Availability & Delivery ETAs]
                         │
                         ▼
            [Patient Selects Pharmacy & Checkout]
                         │
                         ├─────────────────────────────────────────┐
                         ▼                                         ▼
                 [Store Pickup]                            [Home Delivery]
                         │                                         │
                         ▼                                         ▼
             [Generate PICK-XXXXX Code]               [Address Dispatch Pipeline]
                         │                                         │
                         ▼                                         ▼
            [Pharmacist Enters Pickup Code]            [Out for Delivery]
                         │                                         │
                         ▼                                         ▼
                  [Mark Collected]                          [Mark Delivered]
```
