# Database Status & Storage Entity Inventory: Centralized Healthcare Ecosystem

This document details the data layer of the **AllConnect** platform, mapping all active JSON collections in `backend/database/*.json`, their primary keys, relational foreign keys, demo record counts, and future PostgreSQL 16 migration specifications.

---

## 1. Storage Architecture Overview

- **Storage Engine**: Thread-safe atomic JSON file repository (`backend/database/db.py`).
- **Concurrency Control**: Re-entrant thread lock (`threading.RLock()`) combined with atomic write pattern (`.tmp` write followed by `os.replace`).
- **Location**: `backend/database/*.json`
- **Total Registered Collections**: 14 active entities
- **Total Demo Seed Records**: ~234 records
- **PostgreSQL Migration Target**: PostgreSQL 16 with SQLAlchemy 2.0 ORM and Alembic migrations.

---

## 2. Entity Collection Inventory

| Table / Collection | JSON File | Primary Key Format | Foreign Keys | Record Count | Description |
|---|---|---|---|:---:|---|
| **Users** | `users.json` | `usr-XXXXX` | `organization_id`, `entity_id` | 7 | System accounts across 6 personas with PBKDF2 hashed passwords |
| **Patients** | `patients.json` | `PAT-YYYY-XXXXXX` | `user_id` | 21 | Patient demographics, Universal Health ID (`HC-YYYY-XXXXXX`), emergency contacts, allergies |
| **Hospitals** | `hospitals.json` | `hosp-XXX` | None | 5 | Multi-tenant hospital profiles, bed counts, departments, facilities, publishing status |
| **Clinics** | `clinics.json` | `clinic-XXX` | None | 8 | Independent outpatient clinic profiles, OPD fees, timings, publishing status |
| **Doctors** | `doctors.json` | `doc-XXX` | `hospital_id` / `clinic_id` | 15 | Specialist profiles, state registration numbers, OPD slot schedule, consultation fees |
| **Appointments** | `appointments.json` | `APT-YYYY-XXXXXX` | `patient_id`, `doctor_id`, `organization_id` | 31 | Consultation bookings, date/time slots, status (`scheduled`, `completed`, etc.) |
| **Prescriptions** | `prescriptions.json` | `PRE-YYYY-XXXXXX` | `patient_id`, `doctor_id`, `appointment_id` | 17 | Structured digital prescriptions with medication dosage schedules and OCR extracts |
| **Pharmacies** | `pharmacies.json` | `pharm-XXX` | None | 10 | Retail & hospital pharmacies, drug license numbers, store coordinates, delivery radii |
| **Orders** | `orders.json` | `MED-YYYY-XXXXXX` | `patient_id`, `pharmacy_id`, `prescription_id` | 16 | Medicine orders, line items, fulfillment mode, and 6-digit pickup verification passcodes |
| **Offers & Campaigns**| `offers.json` | `off-XXX` | `organization_id` | 11 | Discounted health checkup packages, workflow moderation status (`published`, `pending_review`) |
| **Subscriptions** | `subscriptions.json` | `sub-XXX` | `organization_id` | 6 | SaaS organization subscriptions, active plan ID, billing cycle, renewal expiry |
| **Subscription Plans**| `plans.json` | `plan-XXX` | None | 3 | Tier definitions: `clinic_starter`, `clinic_pro`, `hospital_standard`, `hospital_enterprise` |
| **Notifications** | `notifications.json` | `notif-XXX` | `user_id` | 15 | In-app alerts, timestamps, read flags, and navigation target URLs |
| **Medical Records** | `medical_records.json`| `rec-XXX` | `patient_id` | 3 | Historical laboratory diagnostic reports, scan summaries, discharge cards |

---

## 3. Concurrency & Data Safety Verification

1. **Double-Booking Deflection**:
   - Atomic pre-check in `routes/appointments.py` scans active appointments on matching `(doctor_id, appointment_date, time_slot)` within a synchronized lock block.
   - Tested and verified against parallel collision attempts in `test_flows.py` (Flow 2).
2. **Atomic Write Protection**:
   - Write transactions write to a `.tmp` file, flush to OS disk buffers, and atomically swap via `os.replace()`, preventing corrupt partial writes on unexpected termination.
3. **Data Integrity Seeder**:
   - `seed_database(force=False)` checks existing record counts on server boot to avoid overwriting live records, with `force=True` available for clean test resets.
