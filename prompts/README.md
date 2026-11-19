# Centralized Prompt Library & AI Development Instructions

This directory contains the standardized prompt library for the **Centralized Multi-Hospital Healthcare Ecosystem (AllConnect)**.

---

## 1. How AI Agents Must Use This Library
Every AI agent or software engineer tasked with building, extending, or maintaining an AllConnect module must follow this execution sequence:

```
[1. Read MASTER-PROMPT.md] ──► [2. Read Target PROMPT-XX.md] ──► [3. Load Related Skills]
            │
            ▼
[4. Inspect Codebase]      ──► [5. Implement Module]         ──► [6. Execute Integration Tests]
            │
            ▼
[7. Update Documentation]  ──► [8. Update Development Status]──► [9. Return Completion Report]
```

---

## 2. Library Index
- `MASTER-PROMPT.md`: Central source of truth for business vision, user roles, technical constraints, and data rules.
- `PROMPT-01-PROJECT-FOUNDATION.md`: Environment setup, directory structure, seed data.
- `PROMPT-02-FRONTEND-DEVELOPMENT.md`: React, Vite, Tailwind CSS, component standards.
- `PROMPT-03-BACKEND-DEVELOPMENT.md`: FastAPI architecture, schemas, and persistence layer.
- `PROMPT-04-AUTHENTICATION-AND-ROLES.md`: Role-based auth, PBKDF2 hashing, JWT tokens, 1-click demo switcher.
- `PROMPT-05-PATIENT-DASHBOARD.md`: Centralized Health ID, appointments, prescription vault, orders.
- `PROMPT-06-HOSPITAL-DASHBOARD.md`: Multi-tenant hospital SaaS, queue, specialists, billing analytics.
- `PROMPT-07-CLINIC-DASHBOARD.md`: Independent clinic SaaS, fast walk-in counter, daily collections.
- `PROMPT-08-DOCTOR-DASHBOARD.md`: Consulting workstation, OPD queue, digital prescription authoring.
- `PROMPT-09-PHARMACY-DASHBOARD.md`: Chemist terminal, quotation requests, pickup code verification.
- `PROMPT-10-SUPER-ADMIN-DASHBOARD.md`: Platform governance, publishing rules, SaaS MRR/ARR analytics.
- `PROMPT-11-APPOINTMENT-BOOKING.md`: Booking wizard, slot availability, double-booking prevention.
- `PROMPT-12-PRESCRIPTION-MANAGEMENT.md`: Digital authoring, simulated OCR extraction, patient verification.
- `PROMPT-13-MEDICINE-QUOTATION.md`: Reverse quotation discovery across Hyderabad, comparison table, ordering.
- `PROMPT-14-SUBSCRIPTION-SYSTEM.md`: SaaS tiers (Starter, Pro, Enterprise), doctor quota enforcement.
- `PROMPT-15-ADVERTISEMENT-MANAGEMENT.md`: Hospital campaign creation, Super Admin moderation workflow.
- `PROMPT-16-GOOGLE-MAPS-INTEGRATION.md`: Geographical proximity, Hyderabad coordinates, map placeholder.
- `PROMPT-17-SECURITY-IMPLEMENTATION.md`: Consent-based EHR redaction, multi-tenant isolation, passcode verification.
- `PROMPT-18-TESTING-AND-OPTIMIZATION.md`: E2E test verification, Vite bundle checks, regression prevention.
- `PROMPT-19-PRODUCTION-READINESS.md`: PostgreSQL migration roadmap, containerization, ABDM compliance.
