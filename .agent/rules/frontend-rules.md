# Frontend Development Rules & UI Guidelines

Guidelines for maintaining and extending the React + Vite + Tailwind CSS frontend in `frontend/src/`.

---

## 1. Tech Stack & Library Constraints
- **Framework**: React 18+ with Vite as build tool.
- **Routing**: `react-router-dom` v6 with declarative route trees and protected layout wrappers.
- **Styling**: Tailwind CSS with custom medical palettes (`medblue`, `medteal`, `slate`).
- **Icons**: `lucide-react`. Never use raw inline SVGs when an equivalent Lucide icon exists.
- **Data Visualization**: `recharts` for all charts (ResponsiveContainer, BarChart, LineChart, PieChart).
- **No Heavy External UI Component Libraries**: Maintain full control over HTML5/Tailwind primitives to prevent bundle bloat and vendor lock-in.

---

## 2. Component Organization & Architecture
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

---

## 3. UI/UX & Interaction Principles
1. **Always Handle the 4 Component States**:
   - **Loading State**: Subtle pulsating skeleton or spinner (e.g. `animate-pulse text-xs text-slate-500`).
   - **Error State**: Rose/red alert banners with explicit recovery actions.
   - **Empty State**: Clear icon, descriptive text, and a call-to-action button (e.g., "+ Book New Appointment").
   - **Success State**: Toast or visual confirmation dialog with generated IDs highlighted.
2. **Medical SaaS Aesthetics**:
   - Palette: Deep Medical Blue (`slate-900`, `blue-700`), Medical Teal (`teal-600`), Soft Cyan (`cyan-500`), clean white cards, subtle borders (`border-slate-200/80`).
   - Avoid garish neon gradients or oversized bouncy animations. Design like a top-tier clinical platform.
3. **Responsive by Default**:
   - Navigation adapts cleanly: sticky desktop sidebar (`w-64`) on large viewports, hamburger drawer on mobile.
   - Data tables must have overflow containers (`overflow-x-auto`) to avoid breaking mobile viewports.
4. **Form Validation & Double Click Prevention**:
   - Disable submission buttons while requests are in flight (`disabled={loading}`).
   - Validate required fields before submitting to prevent unnecessary API round-trips.
