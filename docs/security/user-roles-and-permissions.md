# 07: User Roles & Access Control Matrix (RBAC)

## 1. Six System Roles
1. `super_admin`: Platform governance, tenant review, subscription configurations, ARR/MRR access, ad approvals.
2. `patient`: Health ID card, cross-hospital booking, prescription OCR upload, pharmacy comparison, consent management.
3. `hospital`: Multi-tenant hospital administration, department queue, doctor onboarding, billing reports, offers.
4. `clinic`: Streamlined clinic queue, quick walk-in registration, daily collection tracker.
5. `doctor`: Consulting room interface, OPD waiting queue, patient medical history (consent required), digital prescription authoring.
6. `pharmacy`: Prescription quotation bidding, order preparation, counter pickup passcode validation.

## 2. Granular Permissions Matrix
| Action / Resource | Patient | Hospital | Clinic | Doctor | Pharmacy | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View Public Directory | Yes | Yes | Yes | Yes | Yes | Yes |
| Book Appointment | Yes | Yes (Walk-in) | Yes (Walk-in) | - | - | Yes |
| Update Appointment Status | Cancel only | Full (Own) | Full (Own) | In Consult/Done | - | Full |
| Authorize Prescription | - | - | - | Yes | - | - |
| Upload & Verify OCR Rx | Yes | - | - | - | - | - |
| View Patient History | Own only | With Consent | With Consent | With Consent | - | Restricted |
| Manage Consent Preferences | Own only | - | - | - | - | - |
| Submit Pharmacy Quote | - | - | - | - | Yes | - |
| Verify Pickup Code | - | - | - | - | Yes | - |
| Manage Doctors | - | Own Tenant | Own Tenant | - | - | Full |
| Create Promotional Offer | - | Own Tenant | Own Tenant | - | - | Full |
| Approve Promotional Offer | - | - | - | - | - | Yes |
| Toggle Public Publishing | - | - | - | - | - | Yes |
| Platform MRR / ARR Analytics | - | - | - | - | - | Yes |
