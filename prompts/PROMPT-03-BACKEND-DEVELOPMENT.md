# PROMPT 03: Backend Architecture & REST Services

## Objective
Implement the modular FastAPI backend application with CORS middleware, static file serving, Pydantic schemas, and route controllers.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/05-BACKEND-ARCHITECTURE.md` and `docs/20-API-DOCUMENTATION.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/backend-development/SKILL.md`
   - `.agent/skills/fastapi-development/SKILL.md`
4. **Inspect Existing Code**:
   - Review `backend/main.py`, `backend/models/schemas.py`, and `backend/routes/`.
5. **Implement / Verify**:
   - Register all 13 modular routers in `backend/main.py`.
   - Ensure CORS middleware permits `*` for frontend development.
   - Serve static uploads on `/uploads`.
6. **Test Implementation**:
   - Run `python backend/run.py` and inspect Swagger docs at `http://127.0.0.1:8000/docs`.
7. **Update Documentation**: Synchronize `docs/20-API-DOCUMENTATION.md`.
8. **Update Development Tracking**: Record endpoint statuses in `development/API-STATUS.md`.
