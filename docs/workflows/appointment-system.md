# 14: Appointment Scheduling & Collision Prevention

## 1. System Overview
The appointment booking system synchronizes patient-scheduled consultations and clinic walk-in registrations across all participating hospitals and clinics, while strictly preventing double bookings on any doctor's schedule.

## 2. Double-Booking Collision Prevention Rule
When an appointment request is received:
```python
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

## 3. Supported Appointment Types
- **In-Person**: Traditional hospital or clinic OPD consultation.
- **Teleconsultation**: Remote video consultation session.
- **Follow-Up**: Review session following initial diagnosis or test results.
- **Walk-In**: Emergency or immediate counter registration at primary clinics.

## 4. State Transitions
`Pending` ──► `Confirmed` ──► `Checked In` ──► `Waiting` ──► `In Consultation` ──► `Completed` (or `Cancelled` / `Rescheduled`).
