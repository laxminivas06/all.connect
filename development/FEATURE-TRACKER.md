# Feature Tracker: Centralized Multi-Hospital Healthcare Ecosystem

This document tracks all functional modules and features across the platform. Statuses are strictly classified as:
- **Completed**: Fully implemented in codebase, tested, and verified.
- **In Progress**: Active development underway.
- **Planned**: Scheduled for upcoming development milestones.

---

## 1. Patient Persona Features

| Feature ID | Feature Name | Description | Target Role | Verification | Status |
|---|---|---|---|---|:---:|
| `PAT-01` | Patient Registration & Unique ID | Generates unique format `PAT-YYYY-XXXXXX` on signup | Patient | Verified in `routes/auth.py` & automated tests | **Completed** |
| `PAT-02` | Patient Dashboard Overview | Quick vitals, upcoming/past appointments, active prescriptions, medicine orders | Patient | Verified in `PatientDashboard.jsx` | **Completed** |
| `PAT-03` | ABHA Digital Health Card Modal | Visual health card with QR preview, blood group, emergency contact | Patient | Verified in `HealthIdCardModal.jsx` | **Completed** |
| `PAT-04` | Unified Provider Discovery | Search & filter hospitals and clinics by department, specialty, city, rating | Patient | Verified in `HospitalsListPage.jsx` & `ClinicsListPage.jsx` | **Completed** |
| `PAT-05` | Provider Public Profile & Fee Transparency | Detailed view of facilities, department list, doctor roster, and OPD fees | Patient | Verified in `HospitalDetailPage.jsx` & `ClinicDetailPage.jsx` | **Completed** |
| `PAT-06` | Interactive Appointment Booking Modal | Slot selection, mode (In-Person/Video), department filtering, instant confirmation | Patient | Verified in `AppointmentBookingModal.jsx` | **Completed** |
| `PAT-07` | Medical Records & Prescription Viewer | View issued digital prescriptions and download/view PDF record mock | Patient | Verified in `PatientDashboard.jsx` | **Completed** |
| `PAT-08` | Direct Pharmacy Medicine Ordering | Browse pharmacy inventory, add medicines to cart, place home delivery / store pickup | Patient | Verified in `PharmacySearchPage.jsx` | **Completed** |
| `PAT-09` | Digital Prescription Upload to Pharmacy | Upload prescription image/file to fulfill restricted medication order | Patient | Verified in `PrescriptionUploadModal.jsx` | **Completed** |
| `PAT-10` | Healthcare Offers & Preventive Packages | Browse discounted screening packages, filter by category, claim coupon code | Patient | Verified in `OffersPage.jsx` | **Completed** |
| `PAT-11` | Consent Management for Record Sharing | Granular consent modal to authorize hospital access to historical EHR | Patient | Verified in `ConsentModal.jsx` | **Completed** |
| `PAT-12` | Intelligent Multidimensional Healthcare Search | Match hospitals, clinics, doctors, departments, symptoms, surgeries, and packages with disclaimers | Patient / Public | Verified in `LandingPage.jsx`, `BookOpdPage.jsx`, `routes/doctors.py` | **Completed** |
| `PAT-13` | Dedicated Guided Book OPD Experience | 6-step guided appointment booking flow with category filters and instant confirmation (`APT-YYYY-XXXXXX`) | Patient / Public | Verified in `BookOpdPage.jsx` & `test_book_opd_journey.py` | **Completed** |
| `PAT-14` | Surgical Procedure Catalog & Direct Enquiry | Surgeries catalog with pricing counsel and instant enquiry dispatch (`ENQ-2026-XXXXXX`) | Patient / Public | Verified in `ProcedureEnquiryModal.jsx` & `routes/doctors.py` | **Completed** |
| `PAT-15` | Dedicated Doctor Public Dossier | Photo, credentials, MCI registration, affiliated facility link, 7-day slot calendar with direct booking | Patient / Public | Verified in `DoctorDetailPage.jsx` & `/doctors/:id` | **Completed** |
| `PAT-16` | Direct Customer Profile Navigation | Instant access to `/dashboard/patient` without redirect loops | Patient | Verified in `Navbar.jsx` & `App.jsx` | **Completed** |
| `PAT-17` | Teleconsultation Video Room Integration | WebRTC live video consultation room with doctor | Patient | Mocked placeholder room ready | **Planned** |

---

## 2. Hospital & Clinic Management Platform Features (Unified Architecture)

| Feature ID | Feature Name | Description | Target Role | Verification | Status |
|---|---|---|---|---|:---:|
| `ORG-01` | Unified Responsive Management Dashboard | Supports 5 topologies: Multi/Single-Specialty Hospitals, Independent/Single/Multi-Doctor Clinics | Hospital/Clinic Admin | Verified in `OrganisationDashboard.jsx` | **Completed** |
| `ORG-02` | Real KPI Computation & Live Queue Preview | Today's appointments, completed, pending, waiting queue, doctor availability, revenue | Hospital/Clinic Admin | Verified in `OverviewTab.jsx` & `test_hospital_clinic_upgrade.py` | **Completed** |
| `ORG-03` | Single-Doctor Clinic Auto-Configuration | Suppresses doctor selection overhead, displays solo practitioner directly, auto-assigns slots | Clinic Admin | Verified in `routes/clinics.py` & `OverviewTab.jsx` | **Completed** |
| `ORG-04` | Doctor Management & PBKDF2 Onboarding | Add doctor with hashed credentials, generate `doc-XXX` ID, manage credentials & dossiers | Hospital/Clinic Admin | Verified in `DoctorsTab.jsx` & `routes/doctors.py` | **Completed** |
| `ORG-05` | Doctor Availability & Leave Controls | Routine shifts, slot duration (10-45m), break times, daily patient caps, emergency leave | Hospital/Clinic Admin | Verified in `DoctorsTab.jsx` & `routes/doctors.py` | **Completed** |
| `ORG-06` | Appointment Queue & Doctor Assignment | Sub-tabs: All, Today, Live Queue, Pending, Confirmed, Completed. Collision prevention assignment | Hospital/Clinic Admin | Verified in `AppointmentsTab.jsx` & `routes/appointments.py` | **Completed** |
| `ORG-07` | Walk-In Registration Removal | Walk-in forms and routes completely removed in favor of digital appointment queue | Hospital/Clinic Admin | Verified in `Sidebar.jsx`, `test_hospital_clinic_upgrade.py` | **Completed** |
| `ORG-08` | Clinical Services & Health Packages CRUD | Create/edit clinical services & promotional checkup packages with instant discount calculation | Hospital/Clinic Admin | Verified in `ServicesPackagesTab.jsx` & `routes/services.py` | **Completed** |
| `ORG-09` | Billing, Fee Adjustment & Receipts | OPD collections ledger, fee modification with mandatory audit notes, printable receipt modal | Hospital/Clinic Admin | Verified in `BillingTab.jsx` & `routes/appointments.py` | **Completed** |
| `ORG-10` | Self-Service Promotions Management | Autonomous package publishing, suspension, reactivation, and deletion | Hospital/Clinic Admin | Verified in `PromotionsTab.jsx` & `routes/offers.py` | **Completed** |
| `ORG-11` | SaaS Subscription & Quotas Monitoring | Doctor limits utilization, renewal countdown, request upgrade modal, renewal actions | Hospital/Clinic Admin | Verified in `SubscriptionTab.jsx` & `routes/subscriptions.py` | **Completed** |
| `ORG-12` | Regulatory Document Gating & Profile | PDF/JPG/PNG upload controls; document replacement resets status to pending verification | Hospital/Clinic Admin | Verified in `ProfileDocumentsTab.jsx` & `routes/hospitals.py` | **Completed** |
| `ORG-13` | System Settings & Password Management | OPD interval buffers, advance booking window, auto-confirmation, PBKDF2 password change | Hospital/Clinic Admin | Verified in `SettingsTab.jsx` & `routes/auth.py` | **Completed** |
| `ORG-14` | Symptom-to-Specialty Patient Discovery | Patient search maps natural language symptoms to clinical specialties with non-diagnostic disclaimer | Patient / Public | Verified in `LandingPage.jsx` & `routes/doctors.py` | **Completed** |

---

## 4. Doctor Persona Features

| Feature ID | Feature Name | Description | Target Role | Verification | Status |
|---|---|---|---|---|:---:|
| `DOC-01` | Doctor Clinical Dashboard & Overview | Today's patient schedule, queue status, completed visits, revenue stats | Doctor | Verified in `DoctorDashboard.jsx` | **Completed** |
| `DOC-02` | Digital Prescription Writing Engine | Structured Rx builder: medicines, dosages, frequencies, duration, instructions, signing | Doctor | Verified in `DoctorDashboard.jsx` | **Completed** |
| `DOC-03` | Patient Medical History Viewer | Review patient's past diagnoses, ongoing medications, and allergies with consent check | Doctor | Verified in `DoctorDashboard.jsx` | **Completed** |
| `DOC-04` | Consultation Status Updater | Transition appointment states: `scheduled` → `in-progress` → `completed` | Doctor | Verified in `routes/appointments.py` | **Completed** |
| `DOC-05` | Schedule & Leave Calendar | Set weekly consultation slots and mark leaves or blackout hours | Doctor | Verified in `DoctorDashboard.jsx` | **Completed** |
| `DOC-06` | Doctor Appointment Requests Triage | Review, confirm, or decline pending appointment requests | Doctor | Verified in `DoctorDashboard.jsx` | **Completed** |
| `DOC-07` | Doctor Professional Profile Dossier | Edit registration number, degrees, specialization, consultation fee, and bio | Doctor | Verified in `DoctorDashboard.jsx` | **Completed** |
| `DOC-08` | Doctor Workstation Automation Settings | Configure automatic SMS notifications, token advance, and credential security | Doctor | Verified in `DoctorDashboard.jsx` | **Completed** |
| `DOC-09` | AI-Powered Clinical Notes Assistant | Speech-to-text ambient clinical scribe for auto-drafting prescriptions | Doctor | LLM integration hook planned | **Planned** |

---

## 5. Pharmacy Persona Features

| Feature ID | Feature Name | Description | Target Role | Verification | Status |
|---|---|---|---|---|:---:|
| `PHARM-01` | Pharmacy Operations Dashboard | Pending orders, orders ready for pickup, low stock alerts, revenue metrics | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-02` | Medicine Inventory Catalog | Stock level tracker, pricing, batch number, expiry date, low-stock flags | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-03` | Order Fulfillment Workflow | Status pipeline: `verification` → `preparing` → `ready_for_pickup` → `collected` | Pharmacist | Verified in `routes/orders.py` & `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-04` | Secure Pickup Passcode Verification | Validates 6-digit pickup passcode before handing over medicine package | Pharmacist | Verified in `routes/orders.py` & `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-05` | Prescription Verification Queue | Pharmacist review & quotation generator for incoming patient prescriptions | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-06` | Medicine Quotation Builder | Build net price quotes with MRP and store discount % for patient prescriptions | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-07` | Master Pharmaceutical Index | Categorized therapeutic catalogue with brand and salt search | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-08` | Pharmacy Sales & Revenue Reports | Daily and monthly sales analytics with export capabilities | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-09` | Pharmacy Store Dossier & License | Drug license (Form 20/21) credentials, pharmacist in charge, delivery radius | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-10` | SaaS Subscription Management | Pharmacy Pro Mesh subscription status, billing cycle, feature access | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |
| `PHARM-11` | Store Operations Settings | Real-time order alerts, SMS notifications, and terminal master security | Pharmacist | Verified in `PharmacyDashboard.jsx` | **Completed** |

---

## 6. Super Admin Persona Features

| Feature ID | Feature Name | Description | Target Role | Verification | Status |
|---|---|---|---|---|:---:|
| `ADM-01` | System Overview & Macro Analytics | Global ecosystem counters: active hospitals, clinics, doctors, patients, GMV | Super Admin | Verified in `SuperAdminOverview.jsx` | **Completed** |
| `ADM-02` | Healthcare Provider Verification | Review registration credentials and approve/reject hospital and clinic licenses | Super Admin | Verified in `HospitalApprovalsPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-03` | Marketplace Publishing Controls | Toggle provider visibility (`published` vs `unpublished`) in patient discovery | Super Admin | Verified in `HospitalsListPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-04` | SaaS Subscription Tier Governance | Monitor hospital/clinic subscriptions, payment statuses, and tier tiers | Super Admin | Verified in `SubscriptionPlansPage.jsx` & `HospitalSubscriptionsPage.jsx` | **Completed** |
| `ADM-05` | Security & HIPAA/ABDM Audit Logs | System-wide immutable security log viewer tracking sensitive data access | Super Admin | Verified in `AdminSettingsPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-06` | System Health & Performance Monitoring | JSON database latency, memory footprint, and API error telemetry | Super Admin | Verified in `AdminSettingsPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-07` | Dedicated Super Admin Sub-Router | Modular sub-router mapping 15+ dedicated subpages under `/dashboard/admin/*` | Super Admin | Verified in `SuperAdminRouter.jsx` & `App.jsx` | **Completed** |
| `ADM-08` | 5-Step Hospital Registration Wizard | Interactive wizard with GPS geo-coordinates, bed capacity, and accreditation files | Super Admin | Verified in `HospitalRegisterPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-09` | 10-Tab Deep Hospital Dossier | Deep inspection across Overview, Profile, Departments, Doctors, Subscriptions, etc. | Super Admin | Verified in `HospitalDetailPage.jsx` | **Completed** |
| `ADM-10` | Hospital Regulatory Approvals Queue | Review pending accreditations with remark modals and approve/reject actions | Super Admin | Verified in `HospitalApprovalsPage.jsx` | **Completed** |
| `ADM-11` | Clinic Management & Rapid Onboarding | Searchable outpatient clinics directory and 4-step rapid onboarding wizard | Super Admin | Verified in `ClinicsListPage.jsx` & `ClinicRegisterPage.jsx` | **Completed** |
| `ADM-12` | Aggregated Doctor Metrics (Self-Governed Providers) | Macro metric on Super Admin overview; doctors managed independently by hospitals & clinics | Super Admin | Verified in `SuperAdminOverview.jsx` & `routes/admin.py` | **Completed** |
| `ADM-13` | Privacy-Preserving Patient Directory | Patient accounts manager enforcing HIPAA/ABDM confidentiality without exposing notes | Super Admin | Verified in `PatientsListPage.jsx` | **Completed** |
| `ADM-14` | Pharmacies Network & Drug License Check | Retail pharmacy network, licence verification modal, and expiry date updater | Super Admin | Verified in `PharmaciesListPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-15` | Autonomous Promotion Monitor & Policy Takedown | Real-time campaign compliance monitor with emergency suspension powers | Super Admin | Verified in `PromotionsManagerPage.jsx` & `routes/offers.py` | **Completed** |
| `ADM-16` | SaaS MRR/ARR vs Healthcare GMV Segregation | Clear financial delineation of platform SaaS recurring revenue from provider GMV | Super Admin | Verified in `BillingRevenuePage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-17` | Unified Organisation Registration | Central 3-type switcher (Hospital, Clinic, Pharmacy) stripping operational bloat | Super Admin | Verified in `UnifiedOrgRegisterPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-18` | Multi-View Billing Suite & Provider Ledgers | 9-tab financial suite (Hospital, Clinic, Pharmacy, Settled, Pending, CSV Export) | Super Admin | Verified in `BillingRevenuePage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-19` | Dynamic HIPAA/ABDM Audit Logging | Real-time immutable logging on registration, licence verify, and status toggles | Super Admin | Verified in `AdminSettingsPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-20` | Patient Area-Wise Analytics & Statistics Grid | Dynamic top statistics cards + interactive Hyderabad locality counts & 1-click filtering | Super Admin | Verified in `PatientsListPage.jsx` | **Completed** |
| `ADM-21` | Real Document Upload & Preview/Download | Real file upload controls (PDF, JPG, PNG up to 10MB) with secure storage and preview/download | Super Admin | Verified in `DocumentUploadControl.jsx` & `routes/admin.py` | **Completed** |
| `ADM-22` | Regulatory Verification & Appointment Gate | Enforces `pending_verification` on signup; blocks bookings until approved by Super Admin | Super Admin, Appts | Verified in `appointments.py`, `admin.py`, `HospitalApprovalsPage.jsx` | **Completed** |
| `ADM-23` | Subscription Plans & Subscribed Orgs | Create, edit, delete plans; track active/expired subscribers with renewal countdowns | Super Admin | Verified in `SubscriptionPlansPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-24` | Leaflet & OpenStreetMap Interactive Location Engine | Keyless Leaflet interactive map with OpenStreetMap tiles, custom SVG marker, draggable pin, autocomplete, geolocation, and dynamic address autodetection; coordinates strictly hidden from administrator | Super Admin, Hospitals, Clinics, Pharmacies | Verified in `InteractiveLocationPicker.jsx` & `test_registration_automation.py` | **Completed** |
| `ADM-25` | Optional Website URL on Registration | Website URL made fully non-mandatory across all 3 organization types without blocking submission | Super Admin, All Orgs | Verified in `UnifiedOrgRegisterPage.jsx` & `routes/admin.py` | **Completed** |
| `ADM-26` | Organisation Logo Upload (Strict <= 100 KB) | File upload control with PNG, JPG, JPEG, WEBP validation, preview, replace, remove, and strict 100 KB binary limit | Super Admin, All Orgs | Verified in `LogoUploadControl.jsx`, `routes/admin.py`, and `test_registration_automation.py` | **Completed** |
| `ADM-27` | Custom Document Uploads (Max 5, <= 100 KB) | Dynamic custom document naming, max 5 file upload slots, strict 100 KB validation per file, PDF/image previews, replacement, and pending verification status | Super Admin, All Orgs | Verified in `RegistrationDocumentsSection.jsx`, `routes/admin.py`, and `test_registration_automation.py` | **Completed** |
| `ADM-28` | Platform Data Management & Storage Centre | Real disk calculations (database, uploads, logos, records, backups) with capacity health monitoring | Super Admin | Verified in `DataManagementPage.jsx`, `routes/data_management.py`, and `test_complete_platform_security_data.py` | **Completed** |
| `ADM-29` | Organisation Storage Quotas & Upload Gating | Per-organization storage tracking, configurable quota limits (MB) & warning alerts, upload rejection on limit exceed | Super Admin | Verified in `DataManagementPage.jsx`, `routes/data_management.py`, `routes/admin.py` | **Completed** |
| `ADM-30` | 7-Day Rolling Backups & SHA-256 Recovery | Automated 7-day backup retention, SHA-256 integrity verification, safe restore with pre-restoration safety snapshots | Super Admin | Verified in `backup_service.py`, `DataManagementPage.jsx`, `test_complete_platform_security_data.py` | **Completed** |
| `ADM-31` | Controlled System Cleanup & Purge Safeguard | Preview and safe purge of temporary cache (*.tmp) with pre-cleanup verified backup snapshots | Super Admin | Verified in `DataManagementPage.jsx`, `routes/data_management.py` | **Completed** |
| `ADM-32` | CSV Storage & Platform Telemetry Export | Full export of organization storage consumption and telemetry metrics as downloadable CSV | Super Admin | Verified in `routes/data_management.py` & `DataManagementPage.jsx` | **Completed** |
| `SEC-01` | Multi-Tenant Data Isolation & Patient Privacy | Strict organization scoping on clinical records and cross-patient probe rejection (HTTP 403) | Security / Auth | Verified in `routes/patients.py`, `routes/hospitals.py`, `test_complete_platform_security_data.py` | **Completed** |
| `SEC-02` | Brute-Force Authentication Protection | Rate limiting failed logins; locks identifier for 15 minutes after 5 consecutive failures (HTTP 429) | Security / Auth | Verified in `routes/auth.py` & `test_complete_platform_security_data.py` | **Completed** |
| `ERR-01` | Multi-Level React Error Boundaries | App, Layout, Page, and Widget level isolation with retry buttons, sanitized messages, and zero blank screens | All Personas | Verified in `ErrorBoundary.jsx`, `App.jsx`, `InteractiveLocationPicker.jsx` | **Completed** |
| `HOM-01` | Upgraded Patient Healthcare Discovery & Navigation | "Find the Right Healthcare Near You", distance calculations, non-diagnostic discovery, verified facilities displayed first, "Exciting Healthcare Offers" carousel, specialist directory | Patient / Public | Verified in `LandingPage.jsx`, `Navbar.jsx`, `test_complete_platform_security_data.py` | **Completed** |
| `HOS-16` | Super Admin Visual Alignment for Hospital Admin | Redesigned Hospital Admin right-side content area with Super Admin design system (slate-900 top banner, clean white cards, crisp borders, persistent telemetry widget) | Hospital Admin | Verified in `OrganisationDashboard.jsx` & `test_location_patient_hospital_redesign.py` | **Completed** |
| `PAT-09` | Consumer Healthcare Web Portal (No Admin Dashboard) | Stripped admin sidebars for patients; modern consumer discovery and health portal with dedicated Profile & Settings (`PatientPortalPage.jsx` & `PUT /api/patients/me`) | Patient Portal | Verified in `PatientPortalPage.jsx` & `App.jsx` | **Completed** |
| `LOC-01` | Accurate Dynamic Reverse Geocoding & Yemjal Fix | Removed hardcoded Hyderabad location mappings and Dilsukhnagar defaults; accurate coordinate geocoding (Yemjal resolves to Yemjal), with persistent retrieval in hospital edit | Location / Hospital | Verified in `InteractiveLocationPicker.jsx` & `test_location_patient_hospital_redesign.py` | **Completed** |

---

## 7. Cross-Cutting & Platform Infrastructure Features

| Feature ID | Feature Name | Description | Modules | Verification | Status |
|---|---|---|---|---|:---:|
| `INF-01` | Role-Based Access Control (RBAC) | Strict JWT authentication and role-specific dashboard routing | Auth, All | Verified in `AuthContext.jsx` & `auth_utils.py` | **Completed** |
| `INF-02` | Streamlined Responsive Navigation Header | Clean navigation without unwanted public shortcuts or role-switching bloat | Frontend | Verified in `Navbar.jsx` | **Completed** |
| `INF-03` | Thread-Safe Atomic JSON Data Store | Concurrency-safe JSON database with auto-seeding on boot | Backend | Verified in `db.py` & `seed.py` | **Completed** |
| `INF-04` | In-App Notification Engine | Real-time alerts for booking confirmation, order updates, and approvals | Backend/Frontend | Verified in `routes/notifications.py` | **Completed** |
| `INF-05` | Double-Booking Prevention | Concurrency lock prevents overlapping appointments for same doctor slot | Appointments | Verified in `routes/appointments.py` | **Completed** |
| `INF-06` | Touch-Friendly Mobile Navigation Drawer | Off-canvas drawer with backdrop overlay for all 6 personas on mobile | Frontend Layout | Verified in `Sidebar.jsx`, `Navbar.jsx`, `App.jsx` | **Completed** |
| `INF-07` | PostgreSQL Migration Driver | Future schema migration scripts and SQLAlchemy ORM models | Database | Verified in `docs/15-POSTGRESQL-MIGRATION-PLAN.md` | **Planned** |
| `INF-08` | Razorpay / Stripe Payment Gateway | Real payment gateway processing for consultation fees and medicine orders | Billing | Mock gateway functional; live API key integration ready | **Planned** |
