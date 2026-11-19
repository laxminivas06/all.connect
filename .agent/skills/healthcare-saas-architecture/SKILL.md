---
name: healthcare-saas-architecture
description: >-
  System architecture principles for building a multi-tenant healthcare SaaS and centralized
  marketplace connecting hospitals, clinics, diagnostic centers, and pharmacies.
---

# Healthcare SaaS Architecture Skill

## Overview
Defines how multiple independent medical organizations coexist on one centralized platform while maintaining operational independence, separate branding, distinct dashboards, and private clinical workflows.

## SaaS Architectural Blueprint
The AllConnect platform combines two distinct business models:
1. **Vertical B2B SaaS**: Subscription-driven management systems for hospitals, clinics, and pharmacies.
2. **Horizontal B2C Marketplace**: Centralized patient discovery engine for finding doctors, comparing medicine prices, and managing cross-hospital records.

```
                      ┌─────────────────────────────────┐
                      │   Public Discovery Marketplace  │
                      │ (Patients, Booking, Quotations) │
                      └────────────────┬────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│ Hospital SaaS │              │  Clinic SaaS  │              │ Pharmacy SaaS │
│ (Enterprise)  │              │   (Starter)   │              │ (Marketplace) │
└───────┬───────┘              └───────┬───────┘              └───────┬───────┘
        │                              │                              │
        └──────────────────────────────┴──────────────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              [Multi-Tenant Data Mesh]      [Super Admin Platform]
```

## Key Architectural Rules
1. **Never Mix Private Operational Data**:
   - Hospital A cannot view Hospital B's waiting queue, revenue collections, or doctor utilization figures.
2. **Separate Independent Public Profiles**:
   - Every registered organization has a public profile (`/hospitals/:id` or `/clinics/:id`) showcasing its own cover image, doctors, operating hours, ratings, and promotional checkup packages.
3. **SaaS Subscription Integration**:
   - Organizations choose from Starter, Professional, or Enterprise plans.
   - Doctor and staff accounts are bounded by plan limits (e.g. Starter: 5 doctors; Enterprise: 100 doctors).
4. **Independent Campaign Modules**:
   - Each hospital publishes its own promotional health packages (e.g. "Full Body Checkup - ₹999") subject to Super Admin approval.
