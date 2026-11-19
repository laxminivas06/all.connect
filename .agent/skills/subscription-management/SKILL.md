---
name: subscription-management
description: >-
  SaaS subscription engine: tiers (Starter, Professional, Enterprise), doctor/staff quota enforcement,
  MRR/ARR calculation, and Super Admin public publishing visibility controls.
---

# Subscription Management Skill

## Overview
Guides the subscription engine, tenant limits, recurring revenue tracking, and public publishing eligibility in `backend/routes/subscriptions.py` and `frontend/src/pages/admin/SuperAdminDashboard.jsx`.

## Subscription Tiers & Feature Limits
1. **Starter Plan** (`plan-starter`):
   - Monthly: ₹4,999 | Annual: ₹49,999
   - Quotas: Up to 5 doctors, 5 staff accounts, 500 appointments/month.
   - Ideal for: Independent clinics and primary polyclinics.
2. **Professional Plan** (`plan-professional`):
   - Monthly: ₹12,999 | Annual: ₹129,999
   - Quotas: Up to 20 doctors, 25 staff accounts, 3,000 appointments/month.
   - Includes: Digital prescriptions editor, full billing & invoices, promotional campaigns.
3. **Enterprise Plan** (`plan-enterprise`):
   - Monthly: ₹29,999 | Annual: ₹299,999
   - Quotas: Up to 100 doctors, 150 staff accounts, 50,000 appointments/month.
   - Includes: Multi-branch coordination, custom analytics, 24x7 dedicated support.

## Public Publishing Status vs. Subscription Status
*Crucial Architecture Requirement*: Maintain separate fields:
- `subscription_status`: `active`, `pending_payment`, `trial`, `suspended`
- `verification_status`: `verified`, `under_review`, `suspended`
- `publishing_status`: `published`, `unpublished`

An organization is **only** visible in public patient search results if `publishing_status == 'published'`. Super Admin maintains unilateral control to toggle publishing at `/api/admin/organizations/:id/publishing`.
