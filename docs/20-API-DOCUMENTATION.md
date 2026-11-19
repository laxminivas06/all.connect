# 20: Comprehensive REST API Documentation

Base URI: `http://127.0.0.1:8000/api`  
Interactive OpenAPI Swagger: `http://127.0.0.1:8000/docs`

---

## 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/login` | Authenticate with username/password; returns JWT token and user profile | No |
| `POST` | `/api/auth/register-patient` | Register new patient; generates `PAT-2026-X` & `HC-2026-X` | No |
| `POST` | `/api/auth/register-organization` | Onboard new hospital or clinic (starts under review) | No |
| `GET` | `/api/auth/me` | Fetch active user credentials and role-specific profile | Yes |
| `GET` | `/api/auth/demo-accounts` | Retrieve the 6 prototype credentials for 1-click login | No |

---

## 2. Patients (`/api/patients`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/patients/me` | Retrieve patient telemetry, appointments, prescriptions, records, and orders | Yes (Patient) |
| `PUT` | `/api/patients/consent` | Update permitted hospitals/clinics list for EHR sharing | Yes (Patient) |
| `GET` | `/api/patients/{patient_id}` | Retrieve patient profile (enforces consent check) | Yes |

---

## 3. Hospitals & Clinics (`/api/hospitals`, `/api/clinics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/hospitals` | Public listing of published hospitals (filters: area, department, emergency) | No |
| `GET` | `/api/hospitals/{id}` | Public profile of hospital (departments, doctors, packages, hours) | No |
| `GET` | `/api/hospitals/dashboard/overview` | Hospital SaaS KPI metrics, appointments queue, revenue, charts | Yes (Hospital/Admin) |
| `POST` | `/api/hospitals/dashboard/doctors` | Onboard new specialist (enforces subscription quota) | Yes (Hospital/Admin) |
| `GET` | `/api/clinics` | Public listing of published independent clinics | No |
| `GET` | `/api/clinics/{id}` | Public profile of independent clinic | No |
| `GET` | `/api/clinics/dashboard/overview` | Clinic SaaS KPI metrics, queue, daily collections | Yes (Clinic/Admin) |
| `POST` | `/api/clinics/dashboard/walkin` | Rapid walk-in registration, instant token, and counter cash recording | Yes (Clinic/Admin) |

---

## 4. Appointments & Prescriptions (`/api/appointments`, `/api/prescriptions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/appointments` | List appointments for active user / organization | Yes |
| `POST` | `/api/appointments/book` | Book doctor slot (strictly checks and prevents double bookings) | Yes |
| `PUT` | `/api/appointments/{id}/status` | Transition status (`Checked In`, `In Consultation`, `Completed`, etc.) | Yes |
| `GET` | `/api/prescriptions` | Retrieve digital & OCR prescriptions | Yes |
| `POST` | `/api/prescriptions/create` | Doctor authors & digitally signs prescription (`PRE-2026-X`) | Yes (Doctor/Admin) |
| `POST` | `/api/prescriptions/simulate-ocr` | Simulated OCR extraction of paper prescription | No |
| `POST` | `/api/prescriptions/upload-ocr` | Save patient-verified OCR prescription | Yes (Patient) |

---

## 5. Pharmacies & Orders (`/api/pharmacies`, `/api/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/pharmacies` | Public list of registered medical stores | No |
| `GET` | `/api/pharmacies/dashboard/overview` | Pharmacy KPI metrics, incoming quotes, active orders, sales | Yes (Pharmacy/Admin) |
| `POST` | `/api/orders/request-quotations` | Reverse quotation discovery across nearby Hyderabad pharmacies | No |
| `POST` | `/api/orders/place-order` | Place medicine order; generates `MED-2026-X` & `PICK-XXXXX` | Yes |
| `PUT` | `/api/orders/{id}/status` | Advance order status; validates pickup passcode on counter collection | Yes (Pharmacy/Admin) |

---

## 6. Subscriptions, Offers & Admin (`/api/subscriptions`, `/api/offers`, `/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/subscriptions/plans` | List SaaS subscription tiers (Starter, Pro, Enterprise) | No |
| `GET` | `/api/offers` | Public list of approved and published health checkup packages | No |
| `POST` | `/api/offers/create` | Hospital/clinic creates promotional campaign (starts in review) | Yes (Org/Admin) |
| `GET` | `/api/admin/overview` | Super Admin platform telemetry (MRR, ARR, tenant counts) | Yes (Super Admin) |
| `GET` | `/api/admin/organizations` | List all hospitals & clinics with publishing toggles | Yes (Super Admin) |
| `PUT` | `/api/admin/organizations/{id}/publishing` | Control public directory publishing status (`published`/`unpublished`) | Yes (Super Admin) |
| `PUT` | `/api/admin/advertisements/{id}/moderate` | Moderate campaigns (`approve`, `reject`, `suspend`) | Yes (Super Admin) |
