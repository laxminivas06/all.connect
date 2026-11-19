---
name: appointment-management
description: >-
  Appointment booking state machine, double-booking collision prevention,
  slot allocation algorithms, and cross-organization appointment synchronization.
---

# Appointment Management Skill

## Overview
Guides the appointment booking pipeline, calendar slot management, and double-booking collision detection across hospitals and clinics.

## Core Double-Booking Prevention Algorithm
In `backend/routes/appointments.py`:
```python
# Prevent collision on same doctor, date, and slot
existing = find_one("appointments", lambda a: (
    a.get("doctor_id") == req.doctor_id and
    a.get("appointment_date") == req.appointment_date and
    a.get("appointment_time") == req.appointment_time and
    a.get("status") not in ["Cancelled", "Refunded"]
))
if existing:
    raise HTTPException(
        status_code=400,
        detail=f"Slot '{req.appointment_time}' on {req.appointment_date} is already booked for Dr. {doctor['name']}."
    )
```

## Appointment Booking Wizard (`AppointmentBookingModal.jsx`)
1. **Step 1: Doctor & Specialization Selection**: Displays photo, qualifications, and consultation fee.
2. **Step 2: Date & Slot Selection**: Filters available slots dynamically based on doctor's schedule.
3. **Step 3: Appointment Type**: Supports `In-Person`, `Teleconsultation`, or `Follow-Up`.
4. **Step 4: Real-time Confirmation**: Displays generated ID `APT-2026-XXXXXX` and updates hospital dashboard queue automatically.
