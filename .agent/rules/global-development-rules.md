# Global Development Rules & Engineering Standards

These rules govern all AI agents, engineers, and contributors working on the **Centralized Multi-Hospital Healthcare Ecosystem (AllConnect)**.

---

## 1. Core Architectural Tenets
1. **Never Duplicate Existing Modules**: Always inspect the existing frontend (`frontend/src/`) and backend (`backend/`) before creating any new components, endpoints, or data models.
2. **Never Create Broken or Placeholder Interactions**: Every major button, modal, form submission, and tab switch must have a functional implementation connected to backend REST APIs or properly validated state. Do not leave empty `onClick={() => {}}` handlers on core user actions.
3. **Role-Based Isolation**: The platform serves six distinct personas: **Patient, Hospital, Independent Clinic, Doctor, Pharmacy, and Super Admin**. Each has its own dedicated dashboard, permissions, and layout. Never combine them into a generic, cluttered dashboard.
4. **Backend-Enforced Tenant Isolation**: Multi-tenancy must be enforced at the API route and service layer, not solely by hiding frontend elements. Organization A (`hosp-001`) must never access records belonging to Organization B (`hosp-002`).
5. **No Synthetic Production Shortcuts**: While the development prototype utilizes thread-safe JSON files for immediate rapid iteration, all data access must pass through repository abstractions so that PostgreSQL migration requires zero business logic rewrite.

---

## 2. 12-Step Development Workflow
Whenever implementing a new feature or addressing a bug, strictly follow these twelve steps:

```
[1. Understand Feature] ──► [2. Read PROJECT-CONTEXT.md] ──► [3. Read MASTER-PROMPT.md]
           │
           ▼
[4. Consult Docs]       ──► [5. Load Specialized Skills]  ──► [6. Inspect Codebase]
           │
           ▼
[7. Formulate Plan]     ──► [8. Implement Code]           ──► [9. Connect E2E]
           │
           ▼
[10. Verify Workflows]  ──► [11. Update Docs/Tracking]    ──► [12. Provide Summary]
```

- **Step 1: Understand the Request**: Clarify business intent, affected user roles, and expected side effects.
- **Step 2: Read `PROJECT-CONTEXT.md`**: Confirm the master project identity and current architectural boundaries.
- **Step 3: Read `prompts/MASTER-PROMPT.md`**: Align with platform-wide data standards, IDs, and domain rules.
- **Step 4: Identify Relevant Documentation**: Consult the matching files in `docs/` (e.g., `14-APPOINTMENT-SYSTEM.md`).
- **Step 5: Identify & Load Specialized Skills**: Reference the corresponding skills in `.agent/skills/`.
- **Step 6: Inspect Codebase**: Verify existing schemas, database tables, and UI components.
- **Step 7: Plan the Implementation**: Establish file modifications, new endpoints, and data migrations.
- **Step 8: Implement Feature**: Write clean, modular, and maintainable TypeScript/JavaScript/Python.
- **Step 9: Connect Full-Stack**: Connect frontend components to backend endpoints and persistence layers.
- **Step 10: Test Workflows**: Execute integration tests (e.g., `python backend/test_flows.py`) to confirm zero regressions.
- **Step 11: Update Documentation**: Synchronize tracking in `development/` and relevant files in `docs/`.
- **Step 12: Summarize**: Provide a concise summary of changes, test results, and next actions.

---

## 3. Entity Naming & Identifier Conventions
All records generated across the system must use standardized, collision-free identifiers:
- **Patients**: `PAT-YYYY-NNNNNN` (e.g., `PAT-2026-000001`)
- **Centralized Health Identity**: `HC-YYYY-NNNNNN` (e.g., `HC-2026-000001`)
- **Hospitals**: `hosp-NNN` (e.g., `hosp-001`)
- **Clinics**: `clinic-NNN` (e.g., `clinic-001`)
- **Doctors**: `doc-NNN` (e.g., `doc-001`)
- **Pharmacies**: `pharm-NNN` (e.g., `pharm-001`)
- **Appointments**: `APT-YYYY-NNNNNN` (e.g., `APT-2026-000124`)
- **Prescriptions**: `PRE-YYYY-NNNNNN` (e.g., `PRE-2026-000125`)
- **Medicine Orders**: `MED-YYYY-NNNNNN` (e.g., `MED-2026-000145`)
- **Pickup Verification Passcodes**: `PICK-NNNNN` (e.g., `PICK-48291`)
- **Offers & Packages**: `off-NNN` (e.g., `off-001`)
- **Subscription Plans**: `plan-<type>` (`plan-starter`, `plan-professional`, `plan-enterprise`)

---

## 4. Code Quality & Formatting
- **Python**: PEP 8 compliance, explicit type annotations, Pydantic v2 schemas for all request/response models.
- **Frontend**: Functional React components with hooks, Tailwind utility classes, Lucide icons, and zero console warnings.
- **File System**: Forward slashes in web paths, atomic file writes on persistence, and safe error handling around file I/O.
