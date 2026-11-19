# 06: Database Schema & Entity Relationships

## 1. Entity Definitions & Primary Keys

### `users` (`backend/database/users.json`)
- `id` (string, PK): `usr-admin-01`, `usr-patient-01`, etc.
- `username` (string, Unique): Login handle
- `email` (string, Unique): Email address
- `role` (string): `super_admin`, `patient`, `hospital`, `clinic`, `doctor`, `pharmacy`
- `full_name` (string): Display name
- `hashed_password` (string): `<salt_hex>$<key_hex>`
- `organization_id` (string, Nullable): Foreign key to hospital or clinic
- `entity_id` (string, Nullable): Foreign key to patient, doctor, or pharmacy

### `patients` (`backend/database/patients.json`)
- `id` (string, PK): Identical to `patient_id`
- `patient_id` (string, Unique): `PAT-2026-NNNNNN`
- `health_id` (string, Unique): `HC-2026-NNNNNN`
- `user_id` (string, FK): Reference to `users.id`
- `full_name`, `email`, `mobile`, `dob`, `age`, `gender`, `blood_group`
- `address`, `area`, `city`, `pincode`
- `emergency_contact`: `{"name": string, "phone": string}`
- `allergies`: `string[]`
- `chronic_conditions`: `string[]`
- `permitted_organizations`: `string[]` (IDs of authorized hospitals/clinics)

### `hospitals` & `clinics`
- `id` (string, PK): `hosp-001`, `clinic-001`
- `name`, `tagline`, `address`, `area`, `city`, `pincode`
- `contact_phone`, `emergency_phone`, `email`
- `departments`: `string[]`
- `rating`: float, `reviews_count`: int
- `subscription_plan`: `starter`, `professional`, `enterprise`
- `subscription_status`: `active`, `pending_payment`, `trial`, `suspended`
- `verification_status`: `verified`, `under_review`, `suspended`
- `publishing_status`: `published`, `unpublished`

### `doctors`
- `id` (string, PK): `doc-001`
- `name`, `email`, `phone`, `qualifications`, `specialization`, `department`
- `experience_years`: int, `consultation_fee`: float
- `organization_id`: string (FK), `organization_name`: string
- `available_days`: `string[]`, `available_slots`: `string[]`

### `appointments`
- `id` (string, PK): `APT-2026-NNNNNN`
- `patient_id`, `patient_name`, `patient_health_id`, `patient_mobile`
- `doctor_id`, `doctor_name`, `organization_id`, `organization_name`
- `appointment_date` (`YYYY-MM-DD`), `appointment_time` (`HH:MM AM/PM`)
- `appointment_type`: `In-Person`, `Teleconsultation`, `Walk-In`
- `consultation_fee`: float, `payment_status`: string
- `status`: `Pending`, `Confirmed`, `Checked In`, `Waiting`, `In Consultation`, `Completed`, `Cancelled`, `Rescheduled`

### `prescriptions`
- `id` (string, PK): `PRE-2026-NNNNNN`
- `patient_id`, `patient_name`, `patient_health_id`
- `doctor_id`, `doctor_name`, `organization_name`
- `diagnosis`, `symptoms`, `vitals`: `{"blood_pressure": str, "pulse": str, "weight": str}`
- `medicines`: Array of `{"name": str, "dosage": str, "frequency": str, "duration": str, "instructions": str}`
- `advice`: str, `follow_up_date`: str
- `status`: `Authorized & Published`, `Patient Uploaded (OCR Verified)`

### `orders`
- `id` (string, PK): `MED-2026-NNNNNN`
- `patient_id`, `pharmacy_id`, `pharmacy_name`
- `items`: `{"medicine_name": str, "quantity": int, "unit_price": float, "total": float}[]`
- `subtotal`, `delivery_charge`, `total_amount`
- `fulfillment_type`: `Store Pickup` or `Home Delivery`
- `pickup_code`: `PICK-NNNNN`
- `status`: `New Order`, `Pharmacy Verification`, `Accepted`, `Preparing`, `Ready for Pickup`, `Collected`, `Out for Delivery`, `Delivered`
