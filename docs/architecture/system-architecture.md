# 03: System Architecture & Data Flow

## 1. High-Level Architectural Diagram

```mermaid
graph TD
    User["End Users (Patient, Doctor, Admin, Staff)"] -->|HTTPS / REST| ViteFrontend["React + Vite Single Page Application"]
    ViteFrontend -->|Axios/Fetch with Bearer JWT| APIGateway["FastAPI Gateway (backend/main.py)"]
    
    subgraph FastAPI Application Layer
        APIGateway --> AuthMiddleware["Auth & Tenant Middleware (services/auth_utils.py)"]
        AuthMiddleware --> RouteHandlers["Route Controllers (routes/*.py)"]
        RouteHandlers --> PydanticValidation["Pydantic Schemas (models/schemas.py)"]
        RouteHandlers --> RepositoryLayer["Data Access Layer (database/db.py)"]
    end
    
    subgraph Data & Persistence Layer
        RepositoryLayer --> ThreadLock["Thread Lock Manager (per-table locks)"]
        ThreadLock --> AtomicWriter["Atomic File Writer (.tmp -> os.replace)"]
        AtomicWriter --> JSONTables["JSON Entity Tables (*.json)"]
        JSONTables -.->|Future Migration Target| PostgreSQL["PostgreSQL 16+ Database"]
    end
```

## 2. Multi-Tenancy Segregation Mechanism
- Every record created within a hospital or clinic context stores an immutable `organization_id` (e.g. `hosp-001`).
- The backend checks `current_user['organization_id']` against the requested resource.
- Cross-tenant data inspection is rejected with HTTP 403 Forbidden.

## 3. Storage Layer & Atomic File Writing
In `backend/database/db.py`:
- Each table (`hospitals.json`, `appointments.json`, etc.) is guarded by a dedicated `threading.Lock`.
- Data is written to `table.tmp` and then renamed via `os.replace` to ensure zero file corruption.
