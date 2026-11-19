# API Status & Endpoint Inventory: Centralized Healthcare Ecosystem

This document provides a comprehensive inventory of all 58 REST API endpoints implemented in the FastAPI backend (`backend/routes/`). All listed endpoints are fully functional, integrated with the JSON database layer, and verified through automated integration tests (`test_flows.py`).

---

## 1. Authentication & Identity (`routes/auth.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `POST` | `/api/auth/login` | Authenticate user credentials & issue JWT | `LoginRequest` (`username`, `password`) | Public | Integration Test #1 | **Completed** |
| `POST` | `/api/auth/register-patient` | Register patient & issue unique `PAT-YYYY-XXXXXX` | `PatientRegisterRequest` | Public | Integration Test #1 | **Completed** |
| `POST` | `/api/auth/register-organization` | Register Hospital/Clinic/Pharmacy organization | `OrgRegisterRequest` | Public | Manual & Form Test | **Completed** |
| `GET` | `/api/auth/me` | Fetch active user profile from JWT session | Bearer Token | Authenticated | Verified in UI | **Completed** |
| `GET` | `/api/auth/demo-accounts` | List demo credentials for 1-click role switcher | None | Public | Verified in UI | **Completed** |

---

## 2. Patients & Consent Management (`routes/patients.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/patients/me` | Retrieve current patient's clinical records, vitals, history | Bearer Token | Patient | Integration Test #2 | **Completed** |
| `PUT` | `/api/patients/consent` | Update electronic record sharing consent preferences | `ConsentUpdateRequest` | Patient | Integration Test #2, #9 | **Completed** |
| `GET` | `/api/patients/{patient_id}` | Retrieve public/consented patient profile by ID | Path: `patient_id` | Doctor / Hospital / Admin | Verified in UI | **Completed** |

---

## 3. Hospitals & Bed Management (`routes/hospitals.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/hospitals` | Discover published hospitals with city/specialty filters | Query: `city`, `specialty`, `search` | Public | Integration Test #3 | **Completed** |
| `GET` | `/api/hospitals/{hospital_id}` | Retrieve public hospital profile, departments, doctors | Path: `hospital_id` | Public | Integration Test #3 | **Completed** |
| `GET` | `/api/hospitals/dashboard/overview` | Fetch hospital admin KPIs, bed occupancy, doctor roster | Bearer Token | Hospital Admin | Integration Test #3, #10 | **Completed** |
| `POST` | `/api/hospitals/dashboard/doctors` | Add doctor to hospital department roster | `DoctorCreateRequest` | Hospital Admin | Verified in UI | **Completed** |
| `PUT` | `/api/hospitals/dashboard/settings` | Update hospital emergency contacts, beds, facilities | `HospitalSettingsUpdateRequest` | Hospital Admin | Verified in UI | **Completed** |

---

## 4. Independent Clinics & Walk-Ins (`routes/clinics.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/clinics` | Discover registered independent clinics | Query: `city`, `specialty`, `search` | Public | Integration Test #4 | **Completed** |
| `GET` | `/api/clinics/{clinic_id}` | Public profile, visiting specialists, OPD timings | Path: `clinic_id` | Public | Integration Test #4 | **Completed** |
| `GET` | `/api/clinics/dashboard/overview` | Clinic admin metrics, active doctor timetable, queue | Bearer Token | Clinic Admin | Integration Test #4 | **Completed** |
| `POST` | `/api/clinics/dashboard/walkin` | Check in walk-in patient & issue instantaneous token | `WalkinPatientRequest` | Clinic Admin | Integration Test #4 | **Completed** |

---

## 5. Doctors & Schedule (`routes/doctors.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/doctors` | Directory of verified doctors with filters | Query: `specialty`, `org_id`, `search` | Public | Integration Test #5 | **Completed** |
| `GET` | `/api/doctors/{doctor_id}` | Public profile, bio, slots, reviews | Path: `doctor_id` | Public | Integration Test #5 | **Completed** |
| `GET` | `/api/doctors/dashboard/overview` | Doctor schedule, today's appointments, completed visits | Bearer Token | Doctor | Integration Test #5 | **Completed** |

---

## 6. Appointments & Scheduling (`routes/appointments.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/appointments` | Retrieve appointments scoped to logged-in user role | Bearer Token | Authenticated | Integration Test #2 | **Completed** |
| `POST` | `/api/appointments/book` | Book consultation slot (with double-booking check) | `AppointmentBookRequest` | Patient | Integration Test #2 | **Completed** |
| `PUT` | `/api/appointments/{appointment_id}/status` | Update consultation state (`in-progress`, `completed`, `cancelled`) | Path: `appointment_id`, `status` | Doctor / Hospital / Clinic | Integration Test #3 | **Completed** |

---

## 7. Prescriptions & OCR (`routes/prescriptions.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/prescriptions` | List prescriptions scoped to caller role | Bearer Token | Authenticated | Integration Test #3 | **Completed** |
| `GET` | `/api/prescriptions/{prescription_id}` | Retrieve single structured digital prescription | Path: `prescription_id` | Authenticated | Integration Test #3 | **Completed** |
| `POST` | `/api/prescriptions/create` | Issue digital prescription with structured medication items | `PrescriptionCreateRequest` | Doctor | Integration Test #3 | **Completed** |
| `POST` | `/api/prescriptions/simulate-ocr` | Extract digitized medications from uploaded Rx image mock | `PrescriptionOCRSimulateRequest` | Patient / Pharmacy | Integration Test #4 | **Completed** |
| `POST` | `/api/prescriptions/upload-ocr` | Save scanned Rx record to patient's electronic health file | Form data / Base64 payload | Patient | Integration Test #4 | **Completed** |

---

## 8. Pharmacies & Inventory (`routes/pharmacies.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/pharmacies` | Discover verified pharmacies by city and pincode | Query: `city`, `pincode`, `search` | Public | Integration Test #5 | **Completed** |
| `GET` | `/api/pharmacies/{pharmacy_id}` | Pharmacy profile, opening hours, medicine stock list | Path: `pharmacy_id` | Public | Integration Test #5 | **Completed** |
| `GET` | `/api/pharmacies/dashboard/overview` | Pharmacy admin inventory, orders, revenue, low stock | Bearer Token | Pharmacist | Integration Test #6 | **Completed** |

---

## 9. Medicine Orders & Quotations (`routes/orders.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/orders` | List medicine orders scoped to patient or pharmacy | Bearer Token | Patient / Pharmacy | Integration Test #6 | **Completed** |
| `POST` | `/api/orders/request-quotations` | Multi-pharmacy quotation request for prescription items | `QuotationRequest` | Patient | Integration Test #5 | **Completed** |
| `POST` | `/api/orders/place-order` | Place direct medicine order (pickup or delivery) | `OrderCreateRequest` | Patient | Integration Test #6 | **Completed** |
| `PUT` | `/api/orders/{order_id}/status` | Update fulfillment status with pickup passcode validation | `OrderStatusUpdateRequest` | Pharmacist | Integration Test #6 | **Completed** |

---

## 10. Healthcare Offers & Packages (`routes/offers.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/offers` | Public catalog of active, approved promotional offers | Query: `category` | Public | Integration Test #7 | **Completed** |
| `GET` | `/api/offers/all` | Master offer directory for Super Admin moderation | Bearer Token | Super Admin | Integration Test #7 | **Completed** |
| `GET` | `/api/offers/my` | Retrieve offers created by current provider organization | Bearer Token | Hospital / Clinic / Pharmacy | Integration Test #7 | **Completed** |
| `POST` | `/api/offers/create` | Create new healthcare screening / checkup offer | `OfferCreateRequest` | Hospital / Clinic / Pharmacy | Integration Test #7 | **Completed** |
| `PUT` | `/api/offers/{offer_id}/status` | Pause, resume, or archive published offer | Path: `offer_id`, `status` | Provider Admin | Integration Test #7 | **Completed** |

---

## 11. SaaS Subscriptions (`routes/subscriptions.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/subscriptions/plans` | Tier catalog (Standard, Hospital Enterprise, Clinic Pro) | None | Public | Integration Test #8 | **Completed** |
| `GET` | `/api/subscriptions/current` | Active plan, billing cycle, renewal date, limits | Bearer Token | Organization Admin | Integration Test #8 | **Completed** |
| `POST` | `/api/subscriptions/subscribe` | Upgrade, renew, or switch organization tier | `SubscriptionUpgradeRequest` | Organization Admin | Integration Test #8 | **Completed** |

---

## 12. In-App Notifications (`routes/notifications.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/notifications` | Fetch unread and read notifications for current user | Bearer Token | Authenticated | Verified in UI | **Completed** |
| `PUT` | `/api/notifications/{notif_id}/read` | Mark single notification as read | Path: `notif_id` | Authenticated | Verified in UI | **Completed** |
| `PUT` | `/api/notifications/mark-all-read` | Mark all user notifications as read | Bearer Token | Authenticated | Verified in UI | **Completed** |

---

## 13. Super Admin Platform Governance (`routes/admin.py`)

| Method | Endpoint | Description | Request Body / Params | Role / Auth | Verification | Status |
|---|---|---|---|---|---|:---:|
| `GET` | `/api/admin/overview` | Macro metrics: GMV, total organizations, active beds | Bearer Token | Super Admin | Integration Test #10 | **Completed** |
| `GET` | `/api/admin/organizations` | Directory of registered healthcare facilities | Bearer Token | Super Admin | Integration Test #8 | **Completed** |
| `PUT` | `/api/admin/organizations/{org_id}/publishing` | Toggle marketplace visibility (`published`/`unpublished`) | `OrgPublishingUpdateRequest` | Super Admin | Integration Test #8 | **Completed** |
| `GET` | `/api/admin/advertisements` | Moderation queue for promotional offers | Bearer Token | Super Admin | Integration Test #7 | **Completed** |
| `PUT` | `/api/admin/advertisements/{offer_id}/moderate` | Approve, reject, or flag promotional offer | Query: `action` | Super Admin | Integration Test #7 | **Completed** |
| `GET` | `/api/admin/pharmacies` | Master list of pharmacies with license status | Bearer Token | Super Admin | Verified in UI | **Completed** |
| `PUT` | `/api/admin/pharmacies/{pharmacy_id}/verify` | Approve or suspend pharmacy drug license | Query: `status_val` | Super Admin | Verified in UI | **Completed** |
| `GET` | `/api/admin/doctors` | Master doctor registry with medical registration IDs | Bearer Token | Super Admin | Integration Test #11 | **Completed** |
| `PUT` | `/api/admin/doctors/{doctor_id}/verify` | Verify or suspend doctor medical council license | Query: `status_val` | Super Admin | Integration Test #11 | **Completed** |
| `GET` | `/api/admin/audit-logs` | HIPAA/ABDM tamper-evident security audit trail | Bearer Token | Super Admin | Integration Test #11 | **Completed** |
| `GET` | `/api/admin/system-health` | Live database telemetry, table sizes & lock status | Bearer Token | Super Admin | Integration Test #11 | **Completed** |
| `PUT` | `/api/admin/organizations/{org_id}/subscription-override` | Super Admin override of subscription tier & status | `SubscriptionOverrideRequest` | Super Admin | Integration Test #11 | **Completed** |
