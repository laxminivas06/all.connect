---
name: fastapi-development
description: >-
  Advanced FastAPI practices for dependency injection, OAuth2/JWT security bearer schemes,
  CORS configurations, static mounts, and OpenAPI documentation generation.
---

# FastAPI Development Skill

## Overview
Guidelines for leveraging FastAPI's asynchronous, type-safe Python capabilities in the healthcare platform.

## Key Implementation Patterns

### 1. Dependency Injection for Security
```python
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_utils import decode_access_token

security_bearer = HTTPBearer(auto_error=False)

def get_current_user_payload(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication token required")
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload
```

### 2. Static Files & Upload Handlers
Mounting static directories for prescription scans, report PDFs, and logos in `main.py`:
```python
from fastapi.staticfiles import StaticFiles
from config import UPLOADS_DIR

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
```

### 3. FastAPI Performance & Reloading
- Run backend locally via:
  ```bash
  python backend/run.py
  # or: uvicorn main:app --host 127.0.0.1 --port 8000 --reload
  ```
- OpenAPI interactive Swagger documentation automatically available at `http://127.0.0.1:8000/docs`.

### 4. CORS Setup
Ensure CORS middleware allows full frontend headers, methods, and credentials:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
