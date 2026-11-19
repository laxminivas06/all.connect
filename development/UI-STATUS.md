# UI Status & Component Inventory: Centralized Healthcare Ecosystem

This document tracks all frontend pages, dashboards, modals, and shared components implemented in `frontend/src/`. All components are built with **React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts**, fully responsive across mobile, tablet, and desktop breakpoints, and verified via `npm run build`.

---

## 1. Role-Based Dashboards & Sub-Routers

| Dashboard Component | File Path | Target Role | Key Capabilities & Features | Verification | Status |
|---|---|---|---|---|:---:|
| **Super Admin Sub-Router** | `pages/admin/SuperAdminRouter.jsx` | Super Admin | Modular router connecting 15+ dedicated administrative management pages | `npm run build` | **Completed** |
| **Super Admin Overview** | `pages/admin/SuperAdminOverview.jsx` | Super Admin | Central overview: MRR/ARR analytics, registration trends bar chart, live activity feed, quick action links | `npm run build` | **Completed** |
| **Hospital Management Directory** | `pages/admin/HospitalManagement/HospitalsListPage.jsx` | Super Admin | Search/filter table & cards, publishing toggle, account status, public links | `npm run build` | **Completed** |
| **Hospital Multi-Step Registration** | `pages/admin/HospitalManagement/HospitalRegisterPage.jsx` | Super Admin | 5-step wizard: Basic Info, Location, Configuration & Beds, Subscription, Accreditation | `npm run build` | **Completed** |
| **Hospital Dossier & Details** | `pages/admin/HospitalManagement/HospitalDetailPage.jsx` | Super Admin | 10-tab deep inspection: Profile, Departments, Doctors, Appointments, Billing, Documents | `npm run build` | **Completed** |
| **Hospital Approvals Queue** | `pages/admin/HospitalManagement/HospitalApprovalsPage.jsx` | Super Admin | Regulatory review queue, document validation, approve/reject with remarks modal | `npm run build` | **Completed** |
| **Hospital Subscriptions Page** | `pages/admin/HospitalManagement/HospitalSubscriptionsPage.jsx` | Super Admin | SaaS tier manager, upgrade/downgrade, renewal tracking, license status controls | `npm run build` | **Completed** |
| **Clinic Management Directory** | `pages/admin/ClinicManagement/ClinicsListPage.jsx` | Super Admin | Outpatient clinics list, operating hours, OPD fee ranges, publishing toggles | `npm run build` | **Completed** |
| **Clinic Rapid Registration** | `pages/admin/ClinicManagement/ClinicRegisterPage.jsx` | Super Admin | Primary care clinic onboarding form with unique ID generation | `npm run build` | **Completed** |
| **Doctor Registry & Credentialing** | `pages/admin/DoctorManagement/DoctorsListPage.jsx` | Super Admin | Multi-organization specialist registry, medical council registration IDs, verify/suspend | `npm run build` | **Completed** |
| **Doctor Specialist Onboarding** | `pages/admin/DoctorManagement/DoctorRegisterPage.jsx` | Super Admin | Register doctor with multiple hospital and visiting clinic affiliations | `npm run build` | **Completed** |
| **Patient Accounts Management** | `pages/admin/PatientManagement/PatientsListPage.jsx` | Super Admin | Privacy-preserved patient account administration; no clinical notes exposed | `npm run build` | **Completed** |
| **Pharmacy Network Directory** | `pages/admin/PharmacyManagement/PharmaciesListPage.jsx` | Super Admin | Drug license verification, store pickup vs home delivery, accreditation toggle | `npm run build` | **Completed** |
| **Pharmacy Store Onboarding** | `pages/admin/PharmacyManagement/PharmacyRegisterPage.jsx` | Super Admin | Register retail chemist with drug license certification | `npm run build` | **Completed** |
| **Subscription Plans Manager** | `pages/admin/SubscriptionPlans/SubscriptionPlansPage.jsx` | Super Admin | Plan creator & editor, monthly/annual pricing, doctor/staff caps, feature toggles | `npm run build` | **Completed** |
| **Promotions & Ad Moderation** | `pages/admin/PromotionsManagement/PromotionsManagerPage.jsx` | Super Admin | Complete campaign lifecycle: Under Review → Approved → Published → Expired | `npm run build` | **Completed** |
| **Billing & Revenue Telemetry** | `pages/admin/BillingRevenue/BillingRevenuePage.jsx` | Super Admin | Delineation of SaaS MRR from healthcare GMV, searchable transactions, export statement | `npm run build` | **Completed** |
| **Admin Settings & Security** | `pages/admin/AdminSettings/AdminSettingsPage.jsx` | Super Admin | Admin team roles, HIPAA/ABDM audit logs, database diagnostics, notifications | `npm run build` | **Completed** |
| **Patient Dashboard** | `pages/patient/PatientDashboard.jsx` | Patient | Route-synced console: Health ID card modal, appointments, prescriptions, medicine orders | `npm run build` | **Completed** |
| **Hospital Dashboard** | `pages/hospital/HospitalDashboard.jsx` | Hospital Admin | Route-synced console: Bed counters, department doctor roster, billing, offers, settings | `npm run build` | **Completed** |
| **Clinic Dashboard** | `pages/clinic/ClinicDashboard.jsx` | Clinic Admin | Route-synced console: Walk-in quick token check-in, doctor timetable, queue, revenue | `npm run build` | **Completed** |
| **Doctor Dashboard** | `pages/doctor/DoctorDashboard.jsx` | Doctor | Route-synced console: Consultation queue, prescription editor, patient EHR history | `npm run build` | **Completed** |
| **Pharmacy Dashboard** | `pages/pharmacy/PharmacyDashboard.jsx` | Pharmacist | Route-synced console: Quotations, order fulfillment pipeline, 6-digit pickup verification | `npm run build` | **Completed** |

---

## 2. Public Discovery & Customer Facing Pages

| Page Component | File Path | Route | Description & Features | Verification | Status |
|---|---|---|---|---|:---:|
| **Landing Page** | `pages/public/LandingPage.jsx` | `/` | Hero section, unified healthcare search bar, feature highlights, mobile app mockups | `npm run build` | **Completed** |
| **Hospital Discovery** | `pages/public/HospitalsListPage.jsx` | `/hospitals` | Search by city/specialty/name, bed availability filter, distance sorting, public ratings | `npm run build` | **Completed** |
| **Hospital Profile** | `pages/public/HospitalDetailPage.jsx` | `/hospitals/:id` | Department list, affiliated doctors, consultation fee schedule, facility gallery, booking trigger | `npm run build` | **Completed** |
| **Clinic Discovery** | `pages/public/ClinicsListPage.jsx` | `/clinics` | Outpatient clinic directory, area filters, OPD fees, visiting specialist roster | `npm run build` | **Completed** |
| **Clinic Profile** | `pages/public/ClinicDetailPage.jsx` | `/clinics/:id` | Operating hours, specialist schedule, direct consultation booking, Google Maps mockup | `npm run build` | **Completed** |
| **Pharmacy Marketplace**| `pages/public/PharmacySearchPage.jsx`| `/pharmacy` | Medicine search, multi-pharmacy quotation comparison, prescription upload trigger, cart & checkout | `npm run build` | **Completed** |
| **Offers & Campaigns** | `pages/public/OffersPage.jsx` | `/offers` | Preventive health checkup packages, category pills, discount percentage badges, booking integration | `npm run build` | **Completed** |
| **Login Page** | `pages/auth/LoginPage.jsx` | `/login` | Email/username login form, demo credentials prefill helper, role redirection | `npm run build` | **Completed** |
| **Register Page** | `pages/auth/RegisterPage.jsx` | `/register` | Multi-field registration (full name, DOB, blood group, address), auto-generates universal Patient ID | `npm run build` | **Completed** |

---

## 3. Interactive Modals & Overlays

| Modal Component | File Path | Trigger / Context | Key Features | Verification | Status |
|---|---|---|---|---|:---:|
| **Appointment Booking Modal** | `components/modals/AppointmentBookingModal.jsx` | Doctor / Hospital / Clinic profiles | Date picker, time slot selector, In-Person / Video mode toggle, chief complaint input, conflict detection | `npm run build` | **Completed** |
| **Health ID Card Modal** | `components/modals/HealthIdCardModal.jsx` | Patient Dashboard | ABHA digital health card preview with QR code, blood group, emergency contact, download mock | `npm run build` | **Completed** |
| **Prescription Upload Modal** | `components/modals/PrescriptionUploadModal.jsx` | Pharmacy / Patient Dashboard | Drag-and-drop prescription upload, simulated OCR extraction preview, multi-quote request trigger | `npm run build` | **Completed** |
| **Consent Management Modal** | `components/modals/ConsentModal.jsx` | Patient Dashboard | Granular toggles to permit or restrict hospital/clinic access to historical medical records | `npm run build` | **Completed** |
| **Subscription Override Modal**| `pages/admin/SuperAdminDashboard.jsx` | Super Admin Console | Admin override of organization SaaS plan (`clinic_pro`, `hospital_enterprise`) & account status | `npm run build` | **Completed** |

---

## 4. Navigation & Layout

| Component | File Path | Description | Verification | Status |
|---|---|---|---|:---:|
| **Navbar** | `components/Navbar.jsx` | Top navigation with brand logo, public links, mobile hamburger drawer toggle, notification bell badge, user profile pill, and **1-Click Demo Role Switcher** dropdown | `npm run build` | **Completed** |
| **Sidebar & Mobile Drawer** | `components/Sidebar.jsx` | Fully responsive sidebar: fixed sticky desktop navigation and touch-friendly mobile off-canvas drawer with backdrop overlay for all 6 roles | `npm run build` | **Completed** |
| **AuthContext** | `context/AuthContext.jsx` | React context providing global auth state, demo switch handler, JWT persistence, and role guards | `npm run build` | **Completed** |
