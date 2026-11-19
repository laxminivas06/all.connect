# 09: Hospital SaaS Management Workflow

## 1. Overview
The Hospital SaaS console is an enterprise administrative environment for multi-speciality institutions (Yashoda, Apollo, KIMS). It allows hospital administrators to manage day-to-day outpatient queue movements, staff doctors, billing receipts, and promotional health packages.

## 2. Daily Operational Lifecycles

### A. OPD Queue Progression
1. Reception views incoming scheduled patients (`Confirmed`).
2. Upon patient arrival at hospital reception, staff clicks **Mark Arrived** -> Status transitions to `Checked In`.
3. When the consultation room opens, staff clicks **Start Consult** -> Status transitions to `In Consultation`.
4. When the doctor publishes the digital prescription, status transitions to `Completed`.
5. If the patient does not attend, staff marks `Cancelled`, updating payment status to refund.

### B. Doctor Onboarding & Quota Check
1. Hospital Admin clicks **+ Add Specialist**.
2. Form captures doctor details, department, fees, and available days.
3. Backend checks tenant subscription limits (`doctors_count < doctor_limit`).
4. Generates doctor profile and associated login user account (`Doctor@123`).

### C. Campaign Authoring
1. Hospital Admin drafts health packages (e.g. Master Executive Health Checkup).
2. Sets title, category, original price, discounted price, and validity dates.
3. Submits campaign: status is set to `pending_review` until approved by Super Admin.
