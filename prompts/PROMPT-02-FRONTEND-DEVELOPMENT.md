# PROMPT 02: Frontend Architecture & UI Component Foundation

## Objective
Establish the React 18 + Vite + Tailwind CSS frontend application, core design system, responsive navigation, and reusable modal components.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/04-FRONTEND-ARCHITECTURE.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/frontend-development/SKILL.md`
   - `.agent/skills/react-architecture/SKILL.md`
   - `.agent/skills/healthcare-ux-design/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/components/Navbar.jsx`, `Sidebar.jsx`, and `App.jsx`.
5. **Implement / Verify**:
   - Navbar with responsive branding, unread notification count, and 1-click Role Switcher.
   - Sidebar with role-tailored navigation tabs for all 6 personas.
   - Core modals: `AppointmentBookingModal.jsx`, `PrescriptionUploadModal.jsx`, `HealthIdCardModal.jsx`, `ConsentModal.jsx`.
6. **Test Implementation**:
   - Run `cd frontend && npm run build` to ensure zero compilation or JSX errors.
7. **Update Documentation**: Update `docs/04-FRONTEND-ARCHITECTURE.md`.
8. **Update Development Tracking**: Record completed components in `development/UI-STATUS.md`.
