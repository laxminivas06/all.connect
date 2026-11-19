# 10: Independent Clinic Management Workflow

## 1. Overview
The Independent Clinic console is optimized for neighborhood primary care centers, polyclinics, and family doctors (e.g. MedPlus Care Family Clinic, Sri Balaji Polyclinic). It eliminates enterprise complexity, focusing on walk-in speed, instant queue assignment, and cash collections.

## 2. Rapid Walk-In Patient Workflow
1. Walk-in patient arrives without prior online appointment.
2. Receptionist opens **Register Walk-in Patient** modal.
3. Inputs:
   - Full Name
   - Mobile Number
   - Age & Gender
   - Attending Doctor
   - Chief Complaint
4. Backend checks if patient exists in system:
   - If not found, automatically registers patient with universal Health ID (`HC-2026-X`) and Patient ID (`PAT-2026-X`).
   - Generates appointment `APT-2026-X` with status `Checked In`.
   - Records counter payment receipt (`Paid - Counter Cash`).
5. Patient receives token and sits in waiting lounge.

## 3. Daily Cash/UPI Collection Tracking
- The dashboard calculates real-time daily consultation revenue collected directly at the clinic reception desk.
- Summarizes completed consultations, waiting patients, and doctor availability in one clean view.
