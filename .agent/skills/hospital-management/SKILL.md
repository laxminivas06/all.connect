---
name: hospital-management
description: >-
  Enterprise hospital SaaS management: OPD queue pipelines, doctor scheduling,
  revenue/billing analytics with Recharts, and promotional checkup campaign authoring.
---

# Hospital Management Skill

## Overview
Guides the authoring and maintenance of the Hospital SaaS Dashboard in `frontend/src/pages/hospital/` and `backend/routes/hospitals.py`.

## Core Modules & Capabilities

### 1. OPD Queue Management
Hospital staff can update patient progress through standard states:
- `Confirmed`: Patient scheduled.
- `Checked In`: Patient arrived at reception desk.
- `In Consultation`: Patient called into doctor's room.
- `Completed`: Consultation finished; fee accounted.
- `Cancelled`: Appointment refunded or cancelled.

### 2. Specialist & Doctor Onboarding
- Adding specialists is bound by subscription limits (`doctor_limit` in plan).
- Checks `len(current_doctors) < plan_limit`; rejects with HTTP 400 if limit exceeded.
- Automatically generates doctor profile and companion user login credentials.

### 3. Revenue & Billing Analytics
- Real-time calculations:
  - `total_revenue`: Sum of `consultation_fee` for all `Completed` appointments.
  - `today_revenue`: Sum of fees for today's completed visits.
  - `pending_revenue`: Sum of fees for upcoming confirmed appointments.
- Graphical charts using Recharts:
  - Monthly revenue & volume bar chart.
  - Department distribution pie chart.

### 4. Promotional Campaign Manager
- Hospitals author health packages (e.g. "Full Body Checkup - ₹999", "Healthy Heart Screening - ₹1299").
- Submitted campaigns enter `pending_review` and are only displayed publicly once approved by Super Admin.
