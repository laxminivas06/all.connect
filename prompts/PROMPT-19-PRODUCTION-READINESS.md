# PROMPT 19: Production Migration & Ecosystem Hardening

## Objective
Establish the technical roadmap for migrating the JSON storage layer to PostgreSQL 16, configuring Docker containerization, integrating Razorpay, and preparing for official ABDM certification.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/21-DEPLOYMENT-GUIDE.md` and `docs/23-DEVELOPMENT-ROADMAP.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/healthcare-database-design/SKILL.md`
   - `.agent/skills/backend-development/SKILL.md`
4. **Inspect Existing Code**:
   - Review data layer in `backend/database/db.py` and configuration in `backend/config.py`.
5. **Implement / Verify Plan**:
   - PostgreSQL transition: Create SQLAlchemy 2.0 async models matching JSON schema.
   - Containerization: Multi-stage Dockerfiles for backend (FastAPI/Gunicorn) and frontend (Vite/Nginx).
   - Production secrets: Move `SECRET_KEY` and database URLs to environment variables.
   - ABDM Milestones: Define data contracts for M1 (ABHA creation), M2 (Health record linking), M3 (HIP/HIU flow).
6. **Test Implementation**:
   - Verify that data access abstractions continue to function without modifying route controller signatures.
7. **Update Documentation**: Update `docs/21-DEPLOYMENT-GUIDE.md`.
8. **Update Development Tracking**: Update `development/CHANGELOG.md`.
