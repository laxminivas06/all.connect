---
name: patient-management
description: >-
  Patient journey management: centralized identity generation, cross-hospital discovery,
  appointment lifecycle, digital health cards, and consent preference management.
---

# Patient Management Skill

## Overview
Covers the end-to-end patient experience within `frontend/src/pages/patient/` and `backend/routes/patients.py`.

## Patient Identity Generation
On registration via `/api/auth/register-patient`:
1. Increments sequence counter.
2. Generates:
   - Unique Patient ID: `PAT-2026-NNNNNN`
   - Universal Healthcare ID: `HC-2026-NNNNNN`
3. Initializes empty or default permitted organizations list.
4. Creates user account with hashed password and role `patient`.

## Patient Dashboard Modules
1. **Universal Identity Card (`HealthIdCardModal.jsx`)**:
   - Renders a printable/savable digital identity card with simulated QR code, blood group, emergency contact, and Hyderabad area.
2. **Appointments Tracker**:
   - Displays real-time status: `Confirmed`, `Checked In`, `Waiting`, `In Consultation`, `Completed`.
3. **Prescriptions Locker**:
   - Displays digital doctor prescriptions and uploaded OCR records.
   - Includes one-click action: "Find Medicines Near Me".
4. **Consent Control Center (`ConsentModal.jsx`)**:
   - Allows patients to selectively toggle which registered hospitals and clinics can view their past medical records.
5. **Medicine Orders & Pickup Pass**:
   - Shows active orders, pharmacy details, and large 5-digit verification codes (`PICK-XXXXX`).
