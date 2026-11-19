# 17: SaaS Subscriptions & Revenue Model

## 1. System Overview
The subscription management system powers the B2B monetization of the AllConnect ecosystem. Hospitals and independent clinics subscribe to access operational SaaS features, doctor quotas, and analytical dashboards.

## 2. Subscription Tiers
1. **Starter Plan** (`plan-starter`):
   - Price: ₹4,999/month (or ₹49,999/year)
   - Doctor Quota: Up to 5 doctors
   - Staff Quota: Up to 5 accounts
   - Designed for: Primary care clinics and day-care polyclinics.
2. **Professional Plan** (`plan-professional`):
   - Price: ₹12,999/month (or ₹129,999/year)
   - Doctor Quota: Up to 20 doctors
   - Staff Quota: Up to 25 accounts
   - Includes: Digital Rx editor, full billing telemetry, promotional campaigns.
3. **Enterprise Plan** (`plan-enterprise`):
   - Price: ₹29,999/month (or ₹299,999/year)
   - Doctor Quota: Up to 100 doctors
   - Staff Quota: Up to 150 accounts
   - Includes: Multi-branch coordination, custom BI reports, dedicated manager.

## 3. Financial Telemetry
- **MRR (Monthly Recurring Revenue)**: Sum of monthly plan fees + annualized portions.
- **ARR (Annual Recurring Revenue)**: $\text{MRR} \times 12$.
- **Quota Enforcement**: Backend rejects doctor additions exceeding the tenant's plan quota.
