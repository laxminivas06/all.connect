# Bug Tracker: Centralized Multi-Hospital Healthcare Ecosystem

This document records all detected issues, edge cases, root causes, applied remediations, and their current resolution status.

---

## 1. Summary Metrics

- **Total Logged Issues**: 8
- **Resolved**: 8
- **Open / In Progress**: 0
- **Mitigated**: 0

---

## 2. Issue Tracking Log

### BUG-001: Appointment Slot Double-Booking Race Condition
- **Severity**: Critical
- **Affected Component**: `backend/routes/appointments.py`, `backend/database/db.py`
- **Description**: Rapid simultaneous booking requests for the same doctor at the same date and time slot could allow concurrent writes to create duplicate bookings.
- **Root Cause**: Unsynchronized read-modify-write cycle in file-based JSON repository without slot-level validation locks.
- **Resolution**:
  - Implemented an atomic slot conflict check in `routes/appointments.py`.
  - Filtered existing active appointments matching `doctor_id`, `appointment_date`, and `time_slot` with statuses `["scheduled", "confirmed", "in-progress"]`.
  - Added thread-level `threading.RLock()` in `backend/database/db.py` across all write transactions.
- **Status**: **Resolved** (Verified with concurrent booking unit tests)

---

### BUG-002: Pharmacy Pickup Passcode Validation Failure
- **Severity**: High
- **Affected Component**: `backend/routes/orders.py`, `frontend/src/pages/dashboards/PharmacyDashboard.jsx`
- **Description**: Handing over a medicine order without requiring or verifying the patient's pickup code permitted unauthorized parcel collection.
- **Root Cause**: The order status update endpoint accepted transitions directly to `delivered` without checking the 6-digit secret pickup passcode.
- **Resolution**:
  - Added `pickup_passcode` verification logic in `routes/orders.py` when transitioning an order from `ready_for_pickup` to `delivered`.
  - Added password verification modal and numeric validation on the `PharmacyDashboard.jsx` UI.
- **Status**: **Resolved** (Verified in automated flow test #6)

---

### BUG-003: Sandboxed Package Installation Restriction on Windows
- **Severity**: Medium
- **Affected Component**: Frontend Build / Node.js Toolchain
- **Description**: Running `npm install` inside Standard Sandbox Mode failed with `403 Forbidden` due to network isolation blocking the npm registry.
- **Root Cause**: Operating system sandbox policy restricts external network access by default.
- **Resolution**:
  - Applied terminal execution rule: package installations requiring registry downloads must be executed with `BypassSandbox: true`.
  - Installed all dependencies cleanly; subsequent development commands (`npm run build`, `npm run dev`) run in standard sandbox mode.
- **Status**: **Resolved**

---

### BUG-004: Python Backend Import Resolution in Subdirectories
- **Severity**: Medium
- **Affected Component**: `backend/run.py`, `backend/test_flows.py`
- **Description**: Running `python backend/test_flows.py` from the project root produced `ModuleNotFoundError: No module named 'main'`.
- **Root Cause**: Python's `sys.path` did not automatically include the `backend/` directory when scripts were invoked from workspace root.
- **Resolution**:
  - Added programmatic path insertion (`sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))))` at the entry point of all backend execution scripts.
- **Status**: **Resolved** (Verified across all test runners)

---

### BUG-005: Unfiltered Tenant Query Exposure in Provider Endpoints
- **Severity**: High
- **Affected Component**: `backend/routes/hospitals.py`, `backend/routes/clinics.py`
- **Description**: A clinic administrator querying staff members could potentially view records belonging to another clinic if the query lacked an explicit organization filter.
- **Root Cause**: Missing tenant scoping on query parameters.
- **Resolution**:
  - Enforced mandatory `organization_id` matching in all provider-specific service handlers.
  - Returns HTTP 403 Forbidden if a logged-in user attempts to access or modify records with a mismatched `organization_id`.
- **Status**: **Resolved**

---

### BUG-006: React Router Infinite Redirect Loop on Unauthenticated Route
- **Severity**: Medium
- **Affected Component**: `frontend/src/App.jsx`
- **Description**: Accessing a protected dashboard without an active token redirected to `/login`, which immediately triggered a state change loop if the token was malformed.
- **Root Cause**: Inconsistent parsing of corrupted `localStorage` auth state in `AuthContext.jsx`.
- **Resolution**:
  - Wrapped `localStorage.getItem("allconnect_user")` in a `try/catch` block with fallback to `null`.
  - Cleared corrupted storage keys immediately if JSON parsing failed.
- **Status**: **Resolved**

---

### BUG-007: Prescription Medicine Dosage Formatting Inconsistency
- **Severity**: Low
- **Affected Component**: `backend/models/schemas.py`, `frontend/src/pages/dashboards/DoctorDashboard.jsx`
- **Description**: Doctors entering prescription details without specifying duration units (e.g. days vs weeks) resulted in unstructured prescription display on the patient portal.
- **Root Cause**: Free-text string field without structured schema validation.
- **Resolution**:
  - Enforced structured Pydantic model `PrescriptionItem` containing `medicine_name`, `dosage`, `frequency`, `duration_days`, and `instructions`.
  - Updated Doctor UI to provide dropdown selectors for standard frequencies (OD, BD, TDS, QID).
- **Status**: **Resolved**

---

### BUG-008: JSON File Write Corruption during Sudden Termination
- **Severity**: High
- **Affected Component**: `backend/database/db.py`
- **Description**: If the backend process was interrupted during a file write, the JSON file could be left half-written and corrupted.
- **Root Cause**: Direct write using `open(filepath, "w")` without an atomic rename step.
- **Resolution**:
  - Implemented atomic file writing pattern: data is written to a temporary file (`.tmp`) first, flushed and fsynced, then atomically renamed to the target filename via `os.replace()`.
- **Status**: **Resolved**
