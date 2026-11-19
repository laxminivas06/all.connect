---
name: clinic-management
description: >-
  Streamlined independent clinic SaaS: rapid walk-in registration, token issuance,
  waiting lounge queues, and daily counter collection tracking.
---

# Clinic Management Skill

## Overview
Guides the development of the Clinic SaaS Dashboard in `frontend/src/pages/clinic/` and `backend/routes/clinics.py`, optimized specifically for smaller independent polyclinics and day-care centers.

## Distinct Clinic Requirements (vs. Hospital)
- **Do Not Simply Clone the Hospital Dashboard**: Independent clinics prioritize fast counter walk-ins and simple queue movement rather than complex multi-department hospital administration.
- **Fast Walk-In Registration**:
  - Receptionists take patient name, phone, age, complaint, and select an attending doctor.
  - The system checks if the patient exists; if not, generates a new `PAT-2026-XXXXXX` and `HC-2026-XXXXXX`.
  - Instantly issues an appointment token (`APT-2026-XXXXXX`), places the patient in the queue as `Checked In`, and marks counter cash/UPI fee collection.
- **Daily Counter Collection**:
  - Direct calculation of today's walk-in and booked fees collected at the reception desk.
- **Clinic Packages**:
  - Publish simple neighborhood packages (e.g., "Family Diabetes Check - ₹499", "Vaccination Review - ₹399").
