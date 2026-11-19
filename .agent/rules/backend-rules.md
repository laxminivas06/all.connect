# Backend Development Rules & FastAPI Standards

Guidelines for authoring, modifying, and testing the Python FastAPI backend in `backend/`.

---

## 1. Architectural Architecture
```
backend/
├── main.py                   # FastAPI initialization, CORS middleware, router registration
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

---

## 2. API Design & Endpoint Rules
1. **RESTful Resource URIs**: Use clean pluralized nouns (`/api/hospitals`, `/api/prescriptions`).
2. **Pydantic Validation**: Every request payload must be backed by a Pydantic model in `models/schemas.py`. Never parse raw untyped dictionaries from requests.
3. **HTTP Status Codes**:
   - `200 OK`: Successful retrieval or update.
   - `201 Created`: Explicit entity creation where appropriate.
   - `400 Bad Request`: Input validation failures, double-booking detection, invalid pickup passcodes.
   - `401 Unauthorized`: Missing or expired JWT token.
   - `403 Forbidden`: Insufficient role permissions or unauthorized tenant access.
   - `404 Not Found`: Entity with specified ID does not exist.
4. **Token Handling**:
   - Bearer authentication via standard `Authorization: Bearer <token>` header.
   - Tokens carry payload: `sub` (user_id), `username`, `role`, `organization_id`, `entity_id`.

---

## 3. Data Persistence Layer Rules
1. **Thread Safety & Atomic Writes**:
   - Every file write must acquire a per-table lock (`threading.Lock`).
   - Writes must write to `.tmp` first, then atomically rename via `os.replace` to prevent corrupted JSON.
2. **PostgreSQL Migration Compatibility**:
   - Keep queries structured around repository functions: `find_all()`, `find_one()`, `insert()`, `update()`, `delete()`.
   - Never embed JSON file paths inside route handlers.
   - Treat IDs as primary keys and foreign keys (`patient_id`, `doctor_id`, `organization_id`).
3. **No Direct Mutation of State**:
   - Return clean deep copies of records to avoid in-memory reference race conditions.
