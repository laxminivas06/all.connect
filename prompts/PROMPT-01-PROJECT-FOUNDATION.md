# PROMPT 01: Project Foundation & Environment Setup

## Objective
Establish the foundational environment, directory structure, atomic persistence layer, and synthetic Hyderabad demo dataset for the Centralized Healthcare Ecosystem.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/00-PROJECT-OVERVIEW.md` and `docs/06-DATABASE-SCHEMA.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/healthcare-database-design/SKILL.md`
   - `.agent/skills/fastapi-development/SKILL.md`
4. **Inspect Existing Code**:
   - Check `backend/config.py`, `backend/database/db.py`, and `backend/database/seed.py`.
5. **Implement / Verify**:
   - Verify thread-safe atomic file writing with `.tmp` and `os.replace`.
   - Ensure the Hyderabad dataset populates 5 hospitals, 8 clinics, 15 doctors, 20 patients, 10 pharmacies, 30 appointments, 15 prescriptions, 15 orders, and 10 promotional offers.
6. **Test Implementation**:
   - Run `python backend/database/seed.py --force`.
   - Verify all 15 JSON tables in `backend/database/*.json`.
7. **Update Documentation**: Update `docs/06-DATABASE-SCHEMA.md` if any schemas were modified.
8. **Update Development Tracking**: Mark foundation items in `development/DEVELOPMENT-STATUS.md`.
