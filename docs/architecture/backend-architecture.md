# 05: Backend Architecture & REST Standards

## 1. Directory Structure & Architecture
```
backend/
├── main.py                   # FastAPI initialization, CORS, router inclusion
├── config.py                 # Paths, secret keys, token expiration configurations
├── run.py                    # Server launch runner (uvicorn)
├── test_flows.py             # E2E integration verification suite
├── database/
│   ├── db.py                 # Thread-safe file persistence layer with atomic write operations
│   ├── seed.py               # Auto-seeder populating Hyderabad healthcare demo dataset
│   └── *.json                # Entity tables (users, hospitals, clinics, appointments, etc.)
├── models/
│   └── schemas.py            # Pydantic v2 validation models
├── routes/
│   ├── auth.py               # Registration, login, demo accounts, profile inspection
│   ├── patients.py           # Universal Health ID, consent preferences, patient records
│   ├── hospitals.py          # Hospital profile, SaaS OPD queue, revenue, settings
│   ├── clinics.py            # Clinic directory, walk-in registration, collections
│   ├── doctors.py            # Doctor OPD workstation, schedule, consult history
│   ├── appointments.py       # Slot booking, double-booking prevention, status pipeline
│   ├── prescriptions.py      # Digital prescription authoring, simulated OCR parsing
│   ├── pharmacies.py         # Registered pharmacy discovery, inventory catalog
│   ├── orders.py             # Medicine quotation comparison, orders, pickup code verification
│   ├── offers.py             # Hospital/clinic packages, approval workflow
│   ├── subscriptions.py      # SaaS tier assignment (Starter, Pro, Enterprise)
│   ├── notifications.py      # Role-targeted alerts, mark-as-read
│   └── admin.py              # Super Admin controls, publishing toggle, moderation
├── services/
│   └── auth_utils.py         # PBKDF2 password hashing & PyJWT token management
└── uploads/                  # Storage directory for prescriptions, logos, and reports
```

## 2. API Routing Rules
- All endpoints prefixed with `/api/`.
- Strict typing and request validation using Pydantic models.
- Standardized error envelopes with descriptive `detail` messages.
- Static file serving on `/uploads` for documents and scans.
