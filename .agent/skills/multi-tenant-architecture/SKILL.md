---
name: multi-tenant-architecture
description: >-
  Techniques for implementing multi-tenant data isolation, tenant-aware routing,
  organization ID scoping, and backend authorization checks.
---

# Multi-Tenant Architecture Skill

## Overview
Instructions for enforcing strict organization-level data isolation across all API endpoints, database queries, and frontend state.

## Tenant Scoping Strategy
Every tenant-specific record must explicitly store an `organization_id` attribute:
- Appointments: `appointment.organization_id == "hosp-001"`
- Doctors: `doctor.organization_id == "hosp-001"`
- Offers: `offer.organization_id == "hosp-001"`
- Subscriptions: `subscription.organization_id == "hosp-001"`

## Backend Tenant Enforcement Pattern
Never rely on client-supplied organization query params for sensitive operations. Always verify against the authenticated user's token:

```python
@router.get("/dashboard/overview")
def get_hospital_dashboard(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    if current_user["role"] not in ["hospital", "super_admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Scoped to authenticated tenant
    org_id = current_user.get("organization_id")
    appointments = find_all("appointments", lambda a: a.get("organization_id") == org_id)
    doctors = find_all("doctors", lambda d: d.get("organization_id") == org_id)
    ...
```

## Doctor Multi-Hospital Association
- A doctor record belongs to an `organization_id`.
- Doctors visiting multiple facilities have explicit credentials or mapped association permissions.

## Super Admin Exception
Only the `super_admin` role is permitted to execute unscoped platform-wide aggregation queries (such as system-wide MRR, ARR, and organization verification lists).
