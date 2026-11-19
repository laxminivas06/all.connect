---
name: backend-development
description: >-
  Procedures for implementing scalable Python FastAPI endpoints, Pydantic schemas, thread-safe
  persistence, and role-based route protection in the AllConnect ecosystem.
---

# Backend Development Skill

## Overview
Guides the creation of secure, modular, and REST-compliant endpoints in `backend/` using Python 3.10+, FastAPI, and Pydantic.

## Key Development Rules
1. **Separation of Concerns**: Route handlers in `backend/routes/` handle request parsing and response formatting; business logic resides in services or data handlers; persistence resides in `backend/database/db.py`.
2. **Pydantic Validation**: All incoming JSON payloads must be validated by schemas defined in `backend/models/schemas.py`.
3. **Role & Tenant Enforcement**: Verify user role and tenant IDs using FastAPI dependency injection (`get_current_user_payload`).
4. **Thread-Safe Data Layer**: Never write directly to JSON files with raw Python `open()`. Always call `find_all()`, `find_one()`, `insert()`, `update()`, or `delete()` from `backend/database/db.py`.

## Implementation Patterns

### 1. Creating a New Router Module
```python
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from database.db import find_all, find_one, insert, update
from services.auth_utils import get_current_user_payload
from models.schemas import MyRequestSchema

router = APIRouter(prefix="/api/my-resource", tags=["My Resource"])

@router.get("")
def list_resources(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    # Check permissions
    if current_user["role"] not in ["hospital", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    return find_all("my_table")

@router.post("")
def create_resource(req: MyRequestSchema, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    record = {
        "id": f"res-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "organization_id": current_user.get("organization_id"),
        **req.model_dump(),
        "created_at": datetime.now().isoformat()
    }
    insert("my_table", record)
    return record
```

### 2. Registering in `main.py`
Always include newly authored routers in `backend/main.py`:
```python
from routes import my_resource
app.include_router(my_resource.router)
```

## Testing & Quality Control
- Test endpoints using `TestClient(app)` in `backend/test_flows.py`.
- Verify input sanitization, error messages, and HTTP status codes (200, 400, 401, 403, 404).
