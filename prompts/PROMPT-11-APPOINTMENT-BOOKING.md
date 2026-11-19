# PROMPT 11: Appointment Booking & Collision Prevention Engine

## Objective
Implement the interactive appointment booking wizard, real-time slot selection, double-booking collision prevention, and automatic hospital synchronization.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/14-APPOINTMENT-SYSTEM.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/appointment-management/SKILL.md`
   - `.agent/skills/backend-development/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/components/AppointmentBookingModal.jsx` and `backend/routes/appointments.py`.
5. **Implement / Verify**:
   - Step 1: Select doctor, specialization, and facility.
   - Step 2: Date picker and slot pills reflecting doctor's real-time working schedule.
   - Step 3: Type selection (`In-Person`, `Teleconsultation`, `Follow-Up`).
   - Backend collision check: Rejects request if doctor is already booked for that date & slot.
   - Automatically adds facility to patient's `permitted_organizations` if not already present.
6. **Test Implementation**:
   - Test double booking via `python backend/test_flows.py` (Flow 2).
7. **Update Documentation**: Update `docs/14-APPOINTMENT-SYSTEM.md`.
8. **Update Development Tracking**: Mark items in `development/FEATURE-TRACKER.md`.
