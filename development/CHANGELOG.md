# Changelog: Centralized Multi-Hospital Healthcare Ecosystem

All notable changes to the **AllConnect** platform will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-11-19

### Added - Complete Platform Improvement, Security Upgrade & Super Admin Data Management Centre
- **Page-Level & Multi-Tier Error Isolation (`ErrorBoundary.jsx`)**:
  - Implemented React Error Boundaries across application, layout, dashboard, and widget levels.
  - An isolated error in one module (such as Hospital Management or a single chart widget) never crashes or breaks other modules, the Navbar, or the whole application.
  - User-friendly fallback cards with "Try Again" / "Retry Component" buttons and zero blank screens.
  - Sanitized runtime error messages preventing exposure of database queries, file paths, stack traces, or credentials.
- **Complete Security Control & Multi-Tenant Data Isolation (`backend/routes/auth.py`, `patients.py`, `admin.py`)**:
  - Strict tenant boundary enforcement: Hospital A cannot access or mutate Hospital B data; doctors can access only assigned records; patient-to-patient data probes return HTTP 403.
  - Automated brute-force authentication protection: Tracks consecutive failed login attempts; locks account/identifier for 15 minutes with HTTP 429 Too Many Requests after 5 failed attempts.
  - Secure audit logging (`audit_logs.json`) for login attempts, file operations, restorations, and limit overrides.
- **Super Admin Data Management Centre (`DataManagementPage.jsx`, `backend/routes/data_management.py`)**:
  - Real physical disk storage calculations (not hardcoded): calculates exact bytes on disk for database JSON tables, uploads, logos, prescriptions, and backups.
  - Live capacity health monitor (50 GB capacity, usage progress, Healthy/Warning/Critical status).
  - Organisation-wise storage monitoring table: tracks DB storage, Uploads storage, Total bytes, record count, file count, and storage quota for 60+ hospitals, clinics, and pharmacies.
  - Configurable per-organization storage quotas (in MB) and warning thresholds (%) with upload gating (blocks additional uploads when storage limit is exceeded).
  - Physical file manager table: shows all uploaded documents and logos with sizes, MIME types, upload dates, and controlled deletion.
  - Controlled temporary cleanup tool: previews reclaimable storage and purges `.tmp` files with pre-destructive backup locks.
  - CSV export endpoint (`GET /api/admin/data-management/export-csv`): downloads real organization storage telemetry and platform metrics.
- **Database Management & 7-Day Rolling Backups (`backend/services/backup_service.py`)**:
  - Automated 7-day rolling backup retention in `backend/backups/`, purging backups older than 7 days while permanently preserving the latest valid recovery point.
  - Cryptographic SHA-256 integrity verification across all database tables during backup creation and restoration.
  - Safe database restoration engine: automatically generates a pre-restoration safety snapshot before replacing any records.
  - Pre-destructive backup safeguard called before file deletions or cache purges.
- **Patient Homepage & Experience Complete Upgrade (`LandingPage.jsx`, `Navbar.jsx`)**:
  - Navigation updated: All.Connect logo, Home, Hospitals / Clinics, Specialists, Offers, About, Profile (opens patient portal/auth, never Book OPD), and Book OPD action button.
  - Main search bar: "Find the Right Healthcare Near You", placeholder: "Search your health concern, hospital, doctor or speciality...".
  - Interactive Location Selector: Supports HTML5 Geolocation ("Near Me"), Area dropdown, and PIN code search with straight-line distance calculation (e.g. "2.4 km away").
  - Symptom-based discovery: Shows relevant verified hospitals and clinics FIRST, followed by matching specialist doctors with bookable slots; non-diagnostic healthcare discovery disclaimer.
  - Hospital and Clinic result cards: Displays logo/icon, name, type, address, distance, specialties, ratings, and 3 clear actions ("Open Profile", "View Doctors", "Book Appointment").
  - "Exciting Healthcare Offers" promotional carousel: Sliding cards with verified packages, discount badges, original/offer pricing, and direct booking links.
  - "Consult with Our Specialists" directory section: Doctor cards with avatars, qualifications, specialties, experience, and fee transparency.
  - "About AllConnect" trust and accreditation section.
- **Testing & Verification**:
  - Created automated test suite `backend/test_complete_platform_security_data.py` (9/9 passed, 100%).
  - Verified 100% pass on all existing test suites: `test_location_patient_hospital_redesign.py`, `test_registration_automation.py`, `test_book_opd_journey.py`.
  - Frontend production build verified (`npm run build` succeeded with 0 errors).

---

## [1.9.0] - 2026-11-19

### Added - Hospital Admin Dashboard Redesign, Patient Consumer Web Experience & Yemjal Map Location Corrections
- **Hospital Admin Dashboard Redesign (`OrganisationDashboard.jsx`)**:
  - Re-architected the Hospital Admin right-side content area to strictly follow the Super Admin professional design system.
  - Standardized max-width container (`p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto`) eliminating oversized empty voids and awkward page padding.
  - Added consistent Super Admin-style Top Banner: dark slate card (`bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl`) with category badge, bold page title, descriptive subtitle, and quick hospital telemetry box (Today's Collections, Load, and live Queue status).
  - Redesigned mobile/tablet navigation strip into clean Super Admin pill bar (`bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm`).
  - Unified visual design language across all 15 management sections (Overview, Appointments, Live Queue, Doctors, Assignments, Availability, Patients, Services, Packages, Billing, Promotions, SaaS Plan, Profile, Documents, Settings).
- **Patient Experience – Consumer Healthcare Website (Removed Traditional Admin Dashboard)**:
  - Completely stripped traditional admin dashboard, dark sidebars, and admin-style frames from the patient user persona.
  - Re-routed patient profile and dashboard paths (`/profile`, `/dashboard/patient`) through the public website layout (`PublicLayout`) with top header and footer.
  - Created `PatientPortalPage.jsx`:
    - Top welcoming healthcare identity banner displaying Universal Health ID (`HC-2026-XXXXXX`), unique Patient ID, verified patient status, Blood Group, and Age/Gender.
    - Quick "Book New Appointment" button leading directly to doctor & hospital discovery.
    - 4 consumer-friendly horizontal tabs:
      1. **My Appointments**: Live cards for upcoming and past OPD bookings with unique `APT-YYYY-XXXXXX` IDs, confirmed time slot, doctor/hospital details, and cancellation controls.
      2. **Digital Prescriptions**: Formatted prescriptions with medication tables, dosages, frequency, physician advice, and print/download option.
      3. **Medical Records & EHR**: Longitudinal diagnostic reports and privacy data-sharing consent controls.
      4. **Profile & Settings**: Dedicated personal profile editor with instant `PUT /api/patients/me` synchronization (Full Name, Phone, Emergency Phone, Address, Blood Group, Allergies) and account settings.
  - Home Page (`LandingPage.jsx`) updated with the prominent search bar placeholder: `"What health problem or service are you looking for?"`, non-diagnostic discovery disclaimer, and quick chips for Fever, Cough, Headache, Skin Problems, Dental Problems, Eye Problems, Cardiologist, Dermatologist, and General Physician.
  - Simple booking journey: Search -> Hospital / Doctor Profile -> Select Available Slot -> Instant Confirmation with `APT-YYYY-XXXXXX`.
- **Accurate Dynamic Reverse Geocoding & Yemjal Location Fix (`InteractiveLocationPicker.jsx`)**:
  - Completely removed hardcoded Hyderabad locality arrays (`GEODICT`) and eliminated false fallback defaults (like Dilsukhnagar).
  - Implemented dynamic coordinate resolver and geocoding engine:
    - Coordinates in the Yemjal corridor (17.5615, 78.5342) accurately resolve to Locality=**"Yemjal"**, State=**"Telangana"**, PIN=**"500078"**, Address=**"Main Road, Yemjal, Medchal–Malkajgiri District, Telangana 500078"** — never Dilsukhnagar!
    - When reverse geocoding is unavailable, leaves locality and PIN blank for manual entry instead of inserting an unrelated predefined hub.
    - Stale values from previous selections are cleared immediately upon moving the marker or searching a new address.
    - Coordinates are handled strictly internally and are never displayed as manual numbers to the administrator.
- **Hospital Location Selection & Editing Persistence (`ProfileDocumentsTab.jsx`, `HospitalDetailPage.jsx`, `backend/routes/hospitals.py`, `backend/routes/admin.py`)**:
  - Replaced legacy manual GPS latitude/longitude number inputs in Hospital Profile editing with the interactive `<InteractiveLocationPicker>` map.
  - Automatically loads and renders the hospital's previously saved map position.
  - Synchronized `locality` <-> `area` and `latitude`/`longitude` <-> `coordinates` across both frontend state and backend PUT endpoints (`/api/hospitals/dashboard/settings` and `/api/admin/hospitals/{id}`).
- **Responsive Design Verification**:
  - Tested Desktop, Tablet, and Mobile single-column layouts with touch-friendly controls and zero horizontal overflow.
- **Testing & Verification**:
  - Added and verified automated test suite `test_location_patient_hospital_redesign.py` (7/7 checks passed 100%).
  - Verified existing regression suites (`test_registration_automation.py`, `test_book_opd_journey.py`).
  - Production build verified (`npm run build` completed with 0 errors).

---

## [1.8.0] - 2026-11-19

### Added - Registration Automation & Responsive Design Update (Google Maps, Optional Website, Logo Upload <=100KB, Custom Documents <=100KB)
- **Leaflet & OpenStreetMap Interactive Location Engine (`InteractiveLocationPicker.jsx`)**:
  - Integrated Leaflet (`leaflet` and `leaflet/dist/leaflet.css`) with OpenStreetMap tiles for high-performance, keyless, and reliable map rendering across Hospital, Clinic, and Pharmacy registrations.
  - Custom high-DPI Leaflet SVG pin marker with locality name tag, pulse ring, and drag handle.
  - Click-to-position and draggable marker events directly reverse-geocoding via OpenStreetMap Nominatim and built-in Indian GEODICT.
  - Manual latitude and longitude form inputs completely eliminated; coordinates remain strictly hidden from the administrator.
  - Live address search and autocomplete with smooth `flyTo` camera animation.
  - "Use Current Location" (browser Geolocation API), zoom controls, and "Confirm Location" button.
  - Automatic detection of Full Address, Locality (e.g. Malkajgiri), City (e.g. Hyderabad), State (e.g. Telangana), PIN Code (e.g. 500047), and Country (e.g. India).
  - All address fields remain directly editable by the administrator.
- **Optional Website URL**:
  - Website URL is completely optional across Hospitals, Clinics, and Pharmacies.
  - Registrations submit successfully without entering a website URL without generating validation errors.
- **Organisation Logo Upload Control (`LogoUploadControl.jsx`)**:
  - Replaced text URL entry with actual file upload supporting PNG, JPG, JPEG, WEBP.
  - Strict maximum file size limit of **100 KB** (102,400 bytes) enforced both on the client and in the backend.
  - Real-time image preview, file name display, formatted file size indicator, "Replace Image", and "Remove" options.
  - Clear error banner when file exceeds 100 KB limit.
- **Registration Documents & Supporting Images Section (`RegistrationDocumentsSection.jsx`)**:
  - Removed mandatory "Fire Safety" certificate field.
  - Custom document-name entry allowing administrators to label documents dynamically (e.g. Clinical Establishment Registration, Pharmacy Licence, Trade Licence, Building Stability, etc.).
  - Maximum **5 uploaded files** per registration strictly enforced with live progress counter (e.g. `3 / 5 Files Uploaded`). Prevents uploading a 6th file.
  - Maximum file size limit of **100 KB** per file strictly enforced with client and server checks.
  - Supported formats: PDF, JPG, JPEG, PNG, WEBP.
  - File previews: interactive PDF preview/open icon for PDFs, visual thumbnail preview for images.
  - Replace and remove options for every uploaded document.
  - Status badge: automatically marked as `pending_verification` for Super Admin regulatory review (never auto-marked as verified).
- **Backend Architecture & Security Enhancements (`backend/routes/admin.py`)**:
  - Added `MAX_REGISTRATION_UPLOAD_SIZE = 100 * 1024` (100 KB limit).
  - Added binary magic byte verification function `verify_magic_bytes` validating PNG, JPEG, WEBP, and PDF byte signatures.
  - Added `POST /api/admin/organizations/upload-logo` enforcing <=100 KB, format, and magic bytes.
  - Added `POST /api/admin/organizations/upload-document` enforcing <=100 KB, custom names, format, and magic bytes.
  - Updated `POST /api/admin/organizations/register` enforcing max 5 files, <=100 KB each, optional website, and internal coordinates.
  - Full backward compatibility with unified registration endpoints (`/api/admin/hospitals/register`, `/clinics/register`, `/pharmacies/register`).
- **Comprehensive 19-Point Automated Test Suite (`test_registration_automation.py`)**:
  - All 19 tests verified and passing 100%.

---

## [1.7.0] - 2026-11-19

### Added - Customer Home Page & Book OPD Experience Upgrade, Doctor Profiles & Complete Role-Based Dashboards
- **Customer Home Page Redesign (`LandingPage.jsx`)**:
  - Prominent intelligent search bar matching hospital names, clinic names, doctor names, medical departments, medical specialities, symptoms, and surgical procedures.
  - Placeholder: `"Search hospitals, clinics, doctors, departments, symptoms or treatments..."`.
  - Quick-search chips for top specialties, symptoms, and surgeries ("General Physician", "Fever & Cold", "Cataract Surgery", "Knee Replacement", "Cardiologist", "Full Body Checkup", "Skin & Dermatology", "Dental Care", "Orthopedic Consultation").
  - Prominent non-diagnostic disclaimer: *"Search suggestions and symptom matching are for healthcare discovery only and do not constitute formal medical diagnosis."*
  - Direct surgery enquiry modal (`ProcedureEnquiryModal.jsx`) with transparent pricing counseling and instant coordinator dispatch.
- **Dedicated Book OPD Workflow (`BookOpdPage.jsx` & `/book-opd`)**:
  - Full 6-step guided patient experience: Search & Filter -> View Search Results -> Select Organization / Provider -> Select Doctor / Service / Procedure -> Appointment Booking / Enquiry -> Real-time Confirmation with `APT-YYYY-XXXXXX` and SMS summary.
  - Filter tabs: All Results, Hospitals, Clinics, Doctors, Surgeries & Procedures, Health Packages.
  - Interactive area dropdown covering Secunderabad, Malkajgiri, Uppal, Tarnaka, Nacharam, Begumpet, Banjara Hills, and Somajiguda.
  - Prominent **Book OPD** button in the main desktop navbar and mobile navigation drawer.
- **Direct Customer Profile Navigation (`Navbar.jsx` & `App.jsx`)**:
  - "Profile & ID" button in navigation links directly to `/dashboard/patient`.
  - Removed all intermediate redirects and Book OPD loops.
  - Unified view of patient longitudinal records, digital health card (`HC-2026-XXXXXX`), and active appointments.
- **Dedicated Public Pages for Organizations & Doctors (`DoctorDetailPage.jsx`, `HospitalDetailPage.jsx`, `ClinicDetailPage.jsx`)**:
  - Dedicated `/doctors/:id` page displaying verified doctor photo, credentials, MCI/State registration, experience, consultation fee, affiliated organization link, clinical services, and real-time 7-day slot calendar with direct booking.
  - Verified deep linking across hospital, clinic, and doctor directories.
- **Application-Wide Dashboard Sub-Routes & Navigation (Phases 5 & 6)**:
  - **Hospital Dashboard (15 Routes)**: `/overview`, `/appointments`, `/queue`, `/doctors`, `/doctor-assignments`, `/doctor-availability`, `/patients`, `/services`, `/packages`, `/billing`, `/promotions`, `/subscription`, `/profile`, `/documents`, `/settings`.
  - **Clinic Dashboard (15 Routes)**: Same 15 distinct routes supported with Single-Doctor mode autodetection.
  - **Doctor Dashboard (`DoctorDashboard.jsx` - 8 Routes)**:
    - `/dashboard/doctor` & `/overview`: Doctor overview with KPI statistics and today's consultation queue.
    - `/dashboard/doctor/appointments`: Patient appointments directory with status filters (All, Scheduled, Consulting, Completed).
    - `/dashboard/doctor/requests`: Appointment requests triage with accept/decline actions.
    - `/dashboard/doctor/patients`: Patient longitudinal EHR records subject to patient consent authorization (`AUTHORIZED` vs `RESTRICTED`).
    - `/dashboard/doctor/consultation`: Digital Prescription Generator with vitals, medications builder, advice, and digital signature.
    - `/dashboard/doctor/availability`: Weekly OPD slot schedule manager with shifts, token caps, and emergency on-call toggle.
    - `/dashboard/doctor/profile`: Professional medical credentials and consultation fee editor.
    - `/dashboard/doctor/settings`: Workstation clinical automation and account security.
  - **Pharmacy Dashboard (`PharmacyDashboard.jsx` - 11 Routes)**:
    - `/dashboard/pharmacy` & `/overview`: Operations terminal overview and KPIs.
    - `/dashboard/pharmacy/prescriptions`: Incoming patient prescriptions awaiting quotation.
    - `/dashboard/pharmacy/quotations`: Medicine quotation builder with MRP, discount %, and net price calculation.
    - `/dashboard/pharmacy/orders`: Active prescription orders fulfillment queue.
    - `/dashboard/pharmacy/catalogue`: Master pharmaceutical index with brand and generic search.
    - `/dashboard/pharmacy/inventory`: Real-time batch stock and expiry tracker.
    - `/dashboard/pharmacy/pickup-codes`: Counter pickup verification terminal (`PICK-XXXXX`).
    - `/dashboard/pharmacy/sales`: Sales reports, average order value, and collection summaries.
    - `/dashboard/pharmacy/profile`: Drug license (Form 20/21) credentials and store location.
    - `/dashboard/pharmacy/subscription`: SaaS subscription tier status and features.
    - `/dashboard/pharmacy/settings`: Operational alerts and terminal security.
- **Backend & Data Integration (`backend/routes/doctors.py`, `backend/routes/appointments.py`)**:
  - Upgraded `GET /api/doctors/discovery-search` supporting both `query` and `q` parameters, surgical procedure classification, symptom mapping, and non-diagnostic disclaimers.
  - Added `POST /api/doctors/procedures/enquire` generating `ENQ-2026-XXXXXX` IDs and storing records in `enquiries.json`.
  - Full automated test suite `backend/test_book_opd_journey.py` verifying all 7 user journeys (100% passed).
- **Production Build Verification**:
  - Vite production build (`npm run build`) passed with 0 errors across 2,214 transformed modules.

---

## [1.6.0] - 2026-11-19

### Added - Hospital & Clinic Management Dashboard Complete Upgrade & Architecture
- **Unified Core Management Architecture (`OrganisationDashboard.jsx`)**:
  - Unified responsive management dashboard supporting 5 organization topologies: Multi-Speciality Hospitals, Single-Speciality Hospitals, Independent Clinics, Single-Doctor Clinics, and Multi-Doctor Clinics.
  - Organization type dynamically determines dashboard presentation, KPI cards, doctor directories, and routing.
  - Dedicated Single-Doctor Clinic mode (`clinic-001`): automatically suppresses doctor-selection overhead, highlights the solo practitioner directly, and auto-assigns incoming appointments.
- **Organisation Dashboard Overview (`OverviewTab.jsx` & `routes/hospitals.py`, `routes/clinics.py`)**:
  - Real computed KPIs from database records: Today's Appointments, Completed Consultations, Pending Appointments, Waiting Queue, Total Doctors, Available Doctors, Unavailable Doctors, Today's Collection, Monthly Collection.
  - Visual sections: Doctor availability overview, doctor-wise appointment performance, live queue preview with token countdowns, recent consultations, recent patient payments, and monthly volume trend chart.
- **Doctor Management & Scheduling System (`DoctorsTab.jsx` & `routes/doctors.py`)**:
  - Doctor registration modal with PBKDF2 hashed credentials (`doc-XXX` ID generation), specialization, qualifications, and consultation fee.
  - Doctor Availability Manager modal: configure routine shifts, available days, consultation slot duration (10–45 mins), break hours, daily patient caps, emergency unavailability toggle, and leave status toggle.
  - Doctor Dossier modal: comprehensive view of doctor credentials, schedule, fee structure, and assigned patient volume.
- **Appointment Queue & Doctor Assignment Engine (`AppointmentsTab.jsx` & `routes/appointments.py`)**:
  - Queue sub-tabs: All, Today, Live Queue, Pending Requests, Confirmed, Completed, Cancelled.
  - **Completely removed Walk-In Registration**: stripped all walk-in forms, buttons, and endpoints from hospital and clinic management.
  - Doctor Assignment modal with collision prevention: validates that the target doctor does not already have an appointment at the same slot and records an immutable audit history trail.
  - Appointment lifecycle transitions: pending -> confirmed -> checked in -> waiting -> in consultation -> completed.
- **Patient Discovery Search with Symptom-to-Specialty Mapping (`LandingPage.jsx` & `routes/doctors.py`)**:
  - Search query and common symptom pills ("Fever & Infection", "Cough & Throat", "Chest Pain / Heart", "Skin Rash", "Dental", "Joint Pain", "Diabetes", "Eye Care").
  - Maps natural language symptoms to clinical specialties (e.g. fever -> General Medicine / Pediatrics; chest pain -> Cardiology / Emergency) and matches verified, available doctors and providers.
  - Prominent non-diagnostic disclaimer: "Service & Speciality Matching for Provider Discovery (Not a Medical Diagnosis)".
- **Clinical Services & Health Packages Management (`ServicesPackagesTab.jsx` & `routes/services.py`, `routes/offers.py`)**:
  - Clinical services CRUD: service code, clinical category, department, consultation fee/price, duration, and active status toggle.
  - Health packages manager: package creation, pricing, validity, self-service publishing toggle, and automatic discount calculation.
- **Billing & Daily Revenue Management (`BillingTab.jsx` & `routes/appointments.py`)**:
  - Delineates clinic/hospital operational patient fee collections from platform SaaS subscription revenue.
  - Consultation fee adjustment modal with mandatory audit notes and automated payment receipt generation (`RCP-XXX`).
  - Printable payment receipt modal and CSV export of billing ledger records.
- **Promotions & Self-Service Campaigns (`PromotionsTab.jsx`)**:
  - Healthcare providers can author, launch, edit, suspend, and delete promotional health packages directly without administrative gating.
- **SaaS Subscription View & Quotas (`SubscriptionTab.jsx` & `routes/subscriptions.py`)**:
  - Current plan utilization bars (doctor limits, staff quotas, appointment limits).
  - Renewal countdown alert, upgrade request modal with admin notification, and annual/monthly renewal actions.
- **Hospital & Clinic Profile & Compliance Documents (`ProfileDocumentsTab.jsx`)**:
  - Comprehensive profile editing: organization name, tagline, phones, emergency helpline, email, website, bed capacity, 24x7 emergency toggle, geolocation (lat, lng), address, and clinical departments.
  - Real compliance document upload controls (PDF, JPG, PNG up to 10MB) for clinical establishment license, fire safety NOC, bio-medical waste permit, and trade license.
  - Document replacement automatically resets `verification_status` to `"pending_verification"` and records entries in `verification_history` to prevent unapproved regulatory changes.
  - Public profile preview modal.
- **Operational & System Settings (`SettingsTab.jsx` & `routes/auth.py`)**:
  - Slot duration intervals, slot buffer, advance booking limits, auto-confirmation toggle, doctor schedule self-service permissions, queue delay alert threshold, SMS/email toggles.
  - Account security & password change modal with PBKDF2 hashing verification.

---

## [1.5.0] - 2026-11-19

### Added - Super Admin Final Architecture, Area-wise Patient Analytics, Real Document Gating & Responsive Navigation
- **Navigation Cleanup & Streamlined Header (`Navbar.jsx`)**:
  - Completely removed unnecessary public hospital shortcut (`/hospitals`).
  - Removed independent medicine delivery public shortcut (`/pharmacy-search`).
  - Completely removed the 1-click Fast Role Switcher dropdown and state from the public/admin header.
  - Full responsive design supporting desktop, tablet, and mobile with streamlined mobile menu for public visitors.
- **Patient Management - Area-Wise Statistics & Analytics (`PatientsListPage.jsx`)**:
  - Dynamic 5-card Patient Statistics Grid at top: Total Registered Patients, Active Patients, New Registrations, Patients by Area, Patients by City.
  - Interactive Area-wise Patient Analytics Grid: displays calculated patient distributions across Hyderabad localities (Malkajgiri, Secunderabad, Uppal, Tarnaka, Nacharam, Begumpet, All).
  - One-click area filtering: clicking an area dynamically filters the patient directory.
  - Search by patient name or ID, alphabetical A-Z / Z-A sorting, and registration month filtering.
  - Strict privacy compliance: zero exposure of clinical consultation records or prescriptions.
- **Subscription Plans Governance & Renewal Management (`SubscriptionPlansPage.jsx` & `routes/admin.py`)**:
  - Filter tabs for All Plans, Hospitals, Clinics, and Pharmacies.
  - Plan card management: dynamic pricing (monthly/annual), doctor/staff/appointment limits, and plan deletion/deactivation.
  - Subscribed organisations view with status filtering (All, Active, Expired, Pending), renewal date countdowns, and instant status updates modal.
- **Real File Upload Controls & Document Gating (`DocumentUploadControl.jsx` & `routes/admin.py`)**:
  - Real file upload controls for PDF, JPG, and PNG documents up to 10MB (no fake placeholders).
  - Displays selected file name, file size, progress bar, upload status, preview, download, replace, and remove controls.
  - Secure backend storage in `backend/secure_documents/` with dedicated preview (`GET /api/admin/documents/view/{filename}`) and attachment download (`GET /api/admin/documents/download/{filename}`) endpoints.
- **Strict Regulatory Verification & Appointment Gating Workflow (`routes/appointments.py`, `routes/admin.py`, `HospitalApprovalsPage.jsx`)**:
  - Newly registered providers default to `registration_status: "completed"`, `verification_status: "pending_verification"`, `publishing_status: "unpublished"`, and `appointment_availability_status: "disabled"`.
  - Regulatory Accreditation Review Queue (`/dashboard/admin/approvals`) for both Hospitals and Clinics with inline document preview/download.
  - Super Admin Approval action elevates provider to `verified`, sets `publishing_status: "published"`, and enables appointments (`appointment_availability_status: "enabled"`).
  - `book_appointment` endpoint strictly verifies organization verification status and blocks appointment bookings with HTTP 400 if provider is unverified or disabled.
- **Promotion Governance Controls (`PromotionsManagerPage.jsx` & `routes/admin.py`)**:
  - Retained self-service publishing for healthcare providers while equipping Super Admin with real-time monitoring, emergency suspension, and reactivate controls.

---

## [1.4.0] - 2026-11-19

### Added - Super Admin Business Model Alignment & Unified Organisation Registration
- **Unified Organisation Registration (`UnifiedOrgRegisterPage.jsx` & `POST /api/admin/organizations/register`)**:
  - Replaced separate registration workflows with a central 3-type switcher (Hospital, Clinic, Pharmacy).
  - Stripped operational bloat (doctor roster, department config, bed allocations) from hospital registration, as providers manage these independently.
  - Added interactive Hyderabad locality selection with auto-filled GPS coordinates.
  - Implemented automatic confirmation modal and system audit event logging.
- **Redesigned Super Admin Overview (`SuperAdminOverview.jsx` & `GET /api/admin/overview`)**:
  - Aligned dashboard KPIs with macro SaaS platform metrics: Total Patients Overall, Total Doctors Overall, Total Registered Hospitals, Total Registered Clinics, Total Registered Pharmacies, Total Appointments, Active Subscriptions, Pending Verifications, Expired Subscriptions, Total Subscription Revenue Received, Outstanding Payments, MRR, and ARR.
  - Total Doctors Overall is dynamically aggregated from hospital- and clinic-associated accounts.
  - Removed doctor management from Super Admin navigation as requested.
- **Autonomous Provider Promotions (`routes/offers.py` & `PromotionsManagerPage.jsx`)**:
  - Removed mandatory administrative approval queue for promotions; hospitals, clinics, and pharmacies now publish campaigns directly.
  - Super Admin retains real-time policy monitoring and emergency suspension controls for flagged campaigns.
- **Comprehensive 9-View Billing Suite (`BillingRevenuePage.jsx` & `GET /api/admin/billing/payments`)**:
  - Introduced 9 specialized views: Revenue Overview, Hospital Payments, Clinic Payments, Pharmacy Payments, Subscription Transactions, Settled Payments, Pending Payments, Outstanding Payments, and Payment History.
  - Explicit segregation of platform recurring revenue (SaaS MRR/ARR) from provider healthcare volume (GMV).
  - Added date range filters, search, and CSV/text report exports.
- **Enhanced Pharmacy Network Governance (`PharmaciesListPage.jsx` & `routes/admin.py`)**:
  - Direct drug licence verification and licence validity expiration date updater.
  - Instant account suspension and reactivation controls with tamper-evident audit logging.
- **Privacy-Preserving Patient Directory (`PatientsListPage.jsx`)**:
  - Patient management adhering to strict HIPAA/ABDM confidentiality without exposing clinical consultation records or prescriptions.
  - Alphabetical A-Z/Z-A sorting, locality filters, and registration date filters.

---

## [1.3.0] - 2026-11-19

### Added - Super Admin Complete Redesign, Multi-Page Workflows & Mobile Navigation
- **Modular Multi-Page Super Admin Sub-Router (`SuperAdminRouter.jsx`)**:
  - Replaced monolithic dashboard with dedicated, separate working pages for all administrative modules.
- **Hospital Management**:
  - `HospitalsListPage.jsx`: Searchable/filterable directory (table and card views) with publishing toggles, account status controls, and public page links.
  - `HospitalRegisterPage.jsx`: Comprehensive 5-step onboarding wizard (Basic Info, Location & GPS, Configuration & Beds, SaaS Subscription, Verification & Accreditation) with form validation and unique ID generation.
  - `HospitalDetailPage.jsx`: 10-section dossier including Overview, Profile, Departments, Doctor roster, Appointments, Subscription, Billing, Offers, Accreditation Documents, and Audit Logs.
  - `HospitalApprovalsPage.jsx`: Regulatory review queue with document validation and approve/reject with remarks.
  - `HospitalSubscriptionsPage.jsx`: Plan manager with upgrade/downgrade and license status controls.
- **Clinic, Doctor & Pharmacy Management**:
  - `ClinicsListPage.jsx` & `ClinicRegisterPage.jsx`: Independent outpatient clinic directory and rapid onboarding.
  - `DoctorsListPage.jsx` & `DoctorRegisterPage.jsx`: Multi-organization specialist registry and credential verification.
  - `PatientsListPage.jsx`: Privacy-preserving patient accounts manager enforcing HIPAA/ABDM confidentiality without displaying unauthorized clinical notes.
  - `PharmaciesListPage.jsx` & `PharmacyRegisterPage.jsx`: Retail pharmacy network and state drug license verification.
- **Revenue & Governance Modules**:
  - `SubscriptionPlansPage.jsx`: Custom plan creator and editor with doctor/staff limits and feature toggles.
  - `PromotionsManagerPage.jsx`: Complete promotional campaign lifecycle workflow (Draft → Submitted → Under Review → Approved → Published → Expired).
  - `BillingRevenuePage.jsx`: Explicit delineation of platform SaaS subscription revenue (MRR/ARR) from provider healthcare volume (GMV).
  - `AdminSettingsPage.jsx`: Admin team roles, HIPAA/ABDM audit logs, and database engine diagnostics.
- **Mobile Responsive Drawer & Topbar Integration**:
  - Implemented touch-friendly mobile navigation drawer (`Sidebar.jsx`) with backdrop overlay and hamburger toggle in `Navbar.jsx`.
- **Dashboard Route Synchronization**:
  - Added URL subpath synchronization across Hospital, Doctor, Patient, Clinic, and Pharmacy dashboards.

### Added - Super Admin Governance & Ecosystem Telemetry
- **Security & ABDM Audit Trail**: Added `GET /api/admin/audit-logs` providing tamper-evident audit logs of administrative overrides, patient consent updates, clinical record queries, and pickup validations.
- **Live System Health & Diagnostics**: Added `GET /api/admin/system-health` providing atomic JSON table file sizes, record counts, active thread concurrency lock status, and PostgreSQL migration readiness telemetry.
- **Direct SaaS Subscription Override**: Added `PUT /api/admin/organizations/{org_id}/subscription-override` allowing Super Admin to assign, upgrade, comp, or extend subscription tiers (`clinic_starter`, `clinic_pro`, `hospital_standard`, `hospital_enterprise`) with custom expiry dates.
- **Doctor Credentialing & License Governance**: Added `PUT /api/admin/doctors/{doctor_id}/verify` and dedicated UI tab in the Super Admin Console to inspect state medical registration numbers and toggle license verification or suspension.
- **Pharmacy Network Accreditation**: Added full verification and suspension controls for retail and hospital pharmacies in the Super Admin interface.
- **Enhanced Frontend Governance Console**:
  - Implemented 7 specialized tabs in `SuperAdminDashboard.jsx`: Platform Financials, Providers & Publishing, Doctor Registry, Pharmacy Network, Ad Moderation, Security & ABDM Audit, and System Diagnostics.
  - Added real-time search and filter controls across providers, doctors, and pharmacy chains.
  - Added interactive Subscription Plan Override modal with instant plan update reflection.
- **Automated Integration Flow #11**: Added comprehensive test coverage in `test_flows.py` verifying all Super Admin endpoints and workflows.

---

## [1.1.0] - 2026-11-19

### Added - Antigravity AI Skills Library, Technical Docs & Development Tracking
- **Antigravity Customization System (`.agent/`)**:
  - Established 5 foundational rules in `.agent/rules/` (`global-development-rules.md`, `frontend-rules.md`, `backend-rules.md`, `security-rules.md`, `healthcare-platform-rules.md`).
  - Implemented 19 Antigravity-compatible skills in `.agent/skills/` with YAML frontmatter.
- **Technical Documentation (`docs/`)**:
  - Created 25 system architecture, requirements, workflows, and security specification documents.
  - Organized modular subdirectories: `architecture/`, `requirements/`, `workflows/`, `security/`.
- **Modular Prompt Library (`prompts/`)**:
  - Created `MASTER-PROMPT.md` and 19 task-specific prompts (`PROMPT-01` to `PROMPT-19`) mapping to complete lifecycle engineering.
- **Development Tracker (`development/`)**:
  - Established `DEVELOPMENT-STATUS.md`, `FEATURE-TRACKER.md`, `BUG-TRACKER.md`.

---

## [1.0.0] - 2026-11-19

### Added - Initial Base Prototype Release
- **Backend Infrastructure (FastAPI)**:
  - Thread-safe atomic JSON file repository (`backend/database/db.py`) with `threading.RLock()` and safe replacement pattern.
  - PBKDF2-HMAC password hashing and PyJWT token generation (`backend/services/auth_utils.py`).
  - 13 REST API route modules with 54+ endpoints.
  - Automated database seeder (`backend/database/seed.py`) with realistic Hyderabad healthcare dataset (Apollo, Care, Yashoda, Rainbow, LifeLine).
- **Frontend SPA (React 18 + Vite + Tailwind CSS)**:
  - Six role-based dashboards: Patient, Hospital Admin, Clinic Admin, Doctor, Pharmacist, Super Admin.
  - One-click Demo Role Switcher in navigation bar for instant persona testing.
  - Interactive modals: Appointment Booking with time slot validation, Digital Health Card (ABHA) with QR preview, Digital Prescription Upload & OCR Simulation, Consent Management.
  - Public discovery catalogs for Hospitals, Clinics, Pharmacies, and Health Package Offers.
- **Ecosystem Workflows**:
  - 10 verified healthcare workflows tested end-to-end via `backend/test_flows.py`.
