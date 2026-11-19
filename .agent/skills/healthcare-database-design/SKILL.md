---
name: healthcare-database-design
description: >-
  Data modeling standards for healthcare entities, JSON repository abstractions,
  normalized relational design, and zero-downtime PostgreSQL migration readiness.
---

# Healthcare Database Design Skill

## Overview
Standards for maintaining structured, normalized healthcare records in `backend/database/` and ensuring frictionless migration to PostgreSQL.

## Entity Relational Model

```
┌────────────────┐       1:1       ┌────────────────┐
│     Users      ├─────────────────►    Patients    │
│  (Credentials) │                 │  (HC-2026-X)   │
└───────┬────────┘                 └───────┬────────┘
        │                                  │
        │ 1:1                              │ 1:N
        ▼                                  ▼
┌────────────────┐                 ┌────────────────┐
│ Organizations  │ 1:N             │  Appointments  │
│(Hosp / Clinic) ├─────────────────►  (APT-2026-X)  │
└───────┬────────┘                 └───────┬────────┘
        │                                  │
        │ 1:N                              │ 1:1
        ▼                                  ▼
┌────────────────┐       1:N       ┌────────────────┐
│    Doctors     ├─────────────────►  Prescriptions │
│   (doc-001)    │                 │  (PRE-2026-X)  │
└────────────────┘                 └───────┬────────┘
                                           │
                                           │ 1:N (Quoted)
                                           ▼
┌────────────────┐       1:N       ┌────────────────┐
│   Pharmacies   ├─────────────────►  Orders / Meds │
│  (pharm-001)   │                 │  (MED-2026-X)  │
└────────────────┘                 └────────────────┘
```

## Atomic JSON Repository API (`backend/database/db.py`)
All persistent reads and writes must pass through the repository API:
- `find_all(table_name, filter_fn=None)`: Retrieves matching records.
- `find_one(table_name, filter_fn)`: Retrieves the first matching entity.
- `find_by_id(table_name, id_value, id_field="id")`: Direct primary key lookup.
- `insert(table_name, record)`: Appends record and saves atomically.
- `update(table_name, id_value, updates, id_field="id")`: Updates matching entity.
- `delete(table_name, id_value, id_field="id")`: Removes entity safely.

## PostgreSQL Migration Architecture
When transitioning to PostgreSQL:
1. Replace `backend/database/db.py` internals with SQLAlchemy / asyncpg engine.
2. The route handlers and business services require **zero changes** because they interact solely via `find_all`, `find_one`, `insert`, and `update`.
