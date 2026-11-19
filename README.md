# Centralized Multi-Hospital Healthcare Ecosystem (AllConnect)

A production-ready prototype of a **Centralized Multi-Hospital Healthcare Management & Discovery Platform** built with **FastAPI** (Python) and **React + Vite + Tailwind CSS**. The ecosystem connects multiple hospitals, independent clinics, doctors, pharmacies, and patients into one unified digital healthcare federation in **Hyderabad, Telangana**.

---

## 🌟 Key Features & Architecture

### 1. Six Distinct Role-Based Dashboards
1. **Patient Dashboard**: Centralized Health ID (`HC-2026-XXXXXX`), cross-hospital appointment booking, digital prescription locker with simulated OCR parsing, nearby pharmacy quotation comparison, active medicine order tracking, consent-based medical records management.
2. **Hospital Dashboard**: Multi-tenant SaaS management for large medical institutions (Yashoda, Apollo, KIMS). Real-time appointment queue, specialist management, revenue and billing analytics, and promotional campaign authoring.
3. **Independent Clinic Dashboard**: Streamlined interface for neighborhood polyclinics (MedPlus Care Clinic, Sri Balaji Clinic) with rapid walk-in registration, token issuance, and daily cash/UPI collection tracking.
4. **Doctor Dashboard**: Consultant workstation featuring live OPD waiting queue, consent-verified longitudinal medical history, and an interactive digital prescription generator with drug regimen authoring and instant publication.
5. **Pharmacy Dashboard**: Registered chemist interface for incoming quotation requests, order preparation pipelines, and counter pickup passcode verification (`PICK-XXXXX`).
6. **Super Admin Dashboard**: Platform-level control room for hospital/clinic approval, public publishing eligibility rules, SaaS subscription plans, MRR/ARR analytics, and promotional campaign moderation.

---

## 🔐 Demo Accounts (Prototype Credentials)

A **1-Click Role Switcher** is embedded in the navigation bar and login page. Alternatively, use the credentials below:

| Role | Username | Password | Organization / Persona | Key Responsibilities |
|---|---|---|---|---|
| **Super Admin** | `admin` | `Admin@123` | Platform Administrator | Approvals, Publishing Rules, SaaS MRR/ARR, Ad Moderation |
| **Patient** | `patient` | `Patient@123` | Laxmi Narayana Sharma | Centralized ID (`HC-2026-000001`), Booking, Medicine Quotes |
| **Hospital** | `hospital` | `Hospital@123` | Yashoda Super Speciality | OPD Queue, Doctors, Billing, Promotional Campaigns |
| **Clinic** | `clinic` | `Clinic@123` | MedPlus Care Family Clinic | Fast Walk-In Registration, Doctors, Daily Collections |
| **Doctor** | `doctor` | `Doctor@123` | Dr. Rajesh Sharma, MD DM | Patient Queue, Consent Viewer, Digital Prescription Editor |
| **Pharmacy** | `pharmacy` | `Pharmacy@123` | Apollo Pharmacy Malkajgiri | Quotation Engine, Order Pipeline, Pickup Passcode Checker |

*Note: Passwords are protected using standard PBKDF2-HMAC password hashing with cryptographically secure random salts.*

---

## 📍 Sample Hyderabad Data Summary

The ecosystem is pre-seeded with rich, realistic data across Hyderabad localities (**Malkajgiri, Secunderabad, Uppal, Tarnaka, Nacharam, Begumpet**):
- **5 Multi-Speciality Hospitals**: Yashoda Hospital Secunderabad, Apollo Reach Malkajgiri, KIMS Health City Begumpet, Sunshine Bone & Joint Begumpet, LifeLine MedCity Uppal.
- **8 Independent Clinics**: MedPlus Care Malkajgiri, Sri Balaji Polyclinic Uppal, Tarnaka Diagnostic & Day Care, Begumpet Diabetes Centre, Nacharam Polyclinic, Osmania Wellness, Metro Chest Clinic, Anand Ortho Clinic.
- **15 Doctors**: Specialists in Cardiology, Orthopedics, Pediatrics, Diabetology, Pulmonology, Neurology, and General Medicine.
- **20 Patients**: Diverse profiles with Centralized Health IDs (`HC-2026-XXXXXX`), unique Patient IDs (`PAT-2026-XXXXXX`), chronic conditions, allergies, and granular consent settings.
- **10 Pharmacies**: Apollo Pharmacy, MedPlus, Care Medicals, Royal Chemist, Sri Sai Pharmacy, etc.
- **30 Appointments**: Active, in-consultation, waiting queue, completed, and rescheduled records.
- **15 Prescriptions**: Structured digital doctor prescriptions and patient-uploaded OCR records.
- **15 Medicine Orders**: Comprehensive order lifecycles with encrypted pickup passcodes (`PICK-XXXXX`).
- **10 Promotional Campaigns**: Checkup packages and diagnostic discount campaigns with publishing moderation.

---

## ⚡ Quick Start & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the Backend API (FastAPI)
```bash
# In the project root directory
python backend/run.py
```
*The FastAPI backend starts on `http://127.0.0.1:8000`. Automatic OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.*

### 2. Start the Frontend Application (Vite + React)
```bash
# In a separate terminal
cd frontend
npm run dev
```
*The React frontend will be accessible at `http://localhost:5173`.*

### 3. Run Automated End-to-End Verification
```bash
python backend/test_flows.py
```
*Validates all 10 core healthcare workflows in sequence.*

---

## 🏗️ Architecture & Directory Layout

```
all_connect/
├── backend/
│   ├── main.py                   # FastAPI initialization, CORS, static uploads
│   ├── config.py                 # Settings, paths, JWT secrets
│   ├── run.py                    # Server launcher
│   ├── test_flows.py             # Automated end-to-end test suite
│   ├── database/
│   │   ├── db.py                 # Thread-safe JSON database layer with atomic writes
│   │   ├── seed.py               # Seed generator for Hyderabad healthcare data
│   │   └── *.json                # Modular JSON tables (users, hospitals, clinics, etc.)
│   ├── models/
│   │   └── schemas.py            # Pydantic structured validation models
│   ├── routes/
│   │   ├── auth.py               # Registration, login, demo accounts
│   │   ├── patients.py           # Universal Health ID, consent controls
│   │   ├── hospitals.py          # Hospital discovery, SaaS queue, billing
│   │   ├── clinics.py            # Clinic directory, walk-in registration
│   │   ├── doctors.py            # Doctor consult queue, schedule
│   │   ├── appointments.py       # Booking & double-booking prevention
│   │   ├── prescriptions.py      # Digital Rx authoring & simulated OCR
│   │   ├── pharmacies.py         # Pharmacy inventory & catalog
│   │   ├── orders.py             # Quotation comparison & order fulfillment
│   │   ├── offers.py             # Hospital campaigns & packages
│   │   ├── subscriptions.py      # SaaS tiers (Starter, Pro, Enterprise)
│   │   ├── notifications.py      # In-app role notifications
│   │   └── admin.py              # Super Admin controls, publishing toggle
│   └── services/
│       └── auth_utils.py         # PBKDF2 password hashing & JWT handling
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation & 1-click Role Switcher
│   │   │   ├── Sidebar.jsx       # 6-role tailored dashboard navigation
│   │   │   ├── AppointmentBookingModal.jsx # Real-time slot booking wizard
│   │   │   ├── PrescriptionUploadModal.jsx # OCR extraction & verification
│   │   │   ├── HealthIdCardModal.jsx       # Printable Health Card with QR
│   │   │   └── ConsentModal.jsx            # Granular record sharing consent
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Role state, demo switcher, notifications
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Centralized discovery marketplace
│   │   │   ├── LoginPage.jsx     # Unified login & demo accounts
│   │   │   ├── RegisterPage.jsx  # Patient ID generation & provider signup
│   │   │   ├── HospitalsListPage.jsx / HospitalDetailPage.jsx
│   │   │   ├── ClinicsListPage.jsx / ClinicDetailPage.jsx
│   │   │   ├── PharmacySearchPage.jsx # Quotation comparison & order checkout
│   │   │   ├── OffersPage.jsx    # Promotional checkup packages
│   │   │   ├── patient/PatientDashboard.jsx
│   │   │   ├── hospital/HospitalDashboard.jsx
│   │   │   ├── clinic/ClinicDashboard.jsx
│   │   │   ├── doctor/DoctorDashboard.jsx
│   │   │   ├── pharmacy/PharmacyDashboard.jsx
│   │   │   └── admin/SuperAdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js            # REST API client with JWT interception
│   │   ├── App.jsx               # Protected role-based routing
│   │   └── main.jsx
│   └── package.json
├── start_backend.bat             # Windows shortcut to launch backend
└── start_frontend.bat            # Windows shortcut to launch frontend
```

---

## 🛡️ Privacy & Compliance Architecture
1. **Consent-Based Access**: Healthcare providers cannot view longitudinal patient history unless the patient has explicitly included them in their authorized organization list.
2. **Organization-Level Isolation**: Multi-tenant data structures ensure Hospital A cannot inspect the private records, queue, or billing analytics of Hospital B.
3. **No Automatic Generic Substitution**: Drug safety checks ensure that prescribed medicines are strictly quoted and fulfilled with licensed pharmacist oversight.
4. **PostgreSQL Migration Readiness**: All JSON storage entities follow normalized relational schemas with typed primary keys (`PAT-`, `HC-`, `APT-`, `PRE-`, `MED-`, `PICK-`), facilitating effortless migration to PostgreSQL.
