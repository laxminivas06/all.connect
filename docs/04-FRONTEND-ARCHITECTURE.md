# 04: Frontend Architecture & UI Design System

## 1. Directory Structure & Modular Breakdown
```
frontend/src/
├── components/          # Reusable UI widgets and interactive modals
│   ├── Navbar.jsx       # Universal topbar with 1-click Role Switcher & Notifications
│   ├── Sidebar.jsx      # Role-tailored navigation panel (desktop sticky / drawer)
│   ├── AppointmentBookingModal.jsx  # Multi-step slot booking wizard
│   ├── PrescriptionUploadModal.jsx  # Simulated OCR extraction & verification modal
│   ├── HealthIdCardModal.jsx        # Centralized Health Card with QR representation
│   └── ConsentModal.jsx             # Granular EHR consent sharing preferences
├── context/
│   └── AuthContext.jsx  # User session, JWT storage, instant demo login, unread alerts
├── pages/
│   ├── patient/         # Patient Dashboard & sub-views
│   ├── hospital/        # Multi-Tenant Hospital SaaS & analytics
│   ├── clinic/          # Independent Clinic SaaS & walk-in counter
│   ├── doctor/          # Doctor OPD workstation & digital prescription editor
│   ├── pharmacy/        # Pharmacy quotation manager & pickup code verification
│   ├── admin/           # Super Admin tenant governance & publishing moderation
│   └── *.jsx            # Public discovery pages (Landing, Hospitals, Clinics, Quotes, Offers)
├── services/
│   └── api.js           # Centralized REST client with automatic JWT token attachment
├── App.jsx              # Role-protected routing matrix
└── main.jsx
```

## 2. Authentication Flow & Role Routing
- `AuthContext.jsx` manages active user credentials, role state, and unread notification tallies.
- Protected layouts check `user.role === requiredRole` (with automatic pass-through for `super_admin`).
- Unauthenticated requests are redirected to `/login`.

## 3. Component Design System
- **Cards**: Pure white cards (`bg-white border-slate-200/80 rounded-2xl shadow-sm`).
- **Typography**: Clean sans-serif hierarchy with bold headers and muted slate metadata.
- **Charts**: Recharts responsive containers wrapping monthly collection bars and department breakdown pies.
