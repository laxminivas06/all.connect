# PROMPT 18: Testing Automation & Bundle Optimization

## Objective
Execute regression testing across all 10 core healthcare flows, perform Vite production bundle checks, and optimize render cycles.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/22-TESTING-STRATEGY.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/testing-and-quality/SKILL.md`
   - `.agent/skills/performance-optimization/SKILL.md`
4. **Inspect Existing Code**:
   - Review `backend/test_flows.py` and `frontend/vite.config.js`.
5. **Implement / Verify**:
   - Run `python backend/test_flows.py` to confirm all 10 core flows pass.
   - Run `cd frontend && npm run build` to confirm bundle compilation passes under 10 seconds.
   - Verify Lucide React icon imports are tree-shaken and Recharts wrappers have defined heights.
6. **Test Implementation**:
   - Both test suites must complete with exit code 0.
7. **Update Documentation**: Update `docs/22-TESTING-STRATEGY.md`.
8. **Update Development Tracking**: Update `development/DEVELOPMENT-STATUS.md`.
