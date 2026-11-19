# PROMPT 13: Prescription-Based Pharmacy Quotation Engine

## Objective
Implement the reverse pharmacy quotation system where patients submit prescriptions, nearby pharmacies calculate itemized price bids, and orders are fulfilled via pickup passcodes.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/16-PHARMACY-QUOTATION-SYSTEM.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/pharmacy-marketplace/SKILL.md`
   - `.agent/skills/api-integration/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/pages/PharmacySearchPage.jsx` and `backend/routes/orders.py`.
5. **Implement / Verify**:
   - Input prescribed medicines and select Hyderabad area.
   - Endpoint `/api/orders/request-quotations` queries nearby pharmacies and returns comparison matrix:
     | Pharmacy | Distance | Availability | Medicine Price | Delivery Fee | ETA | Action |
   - Order checkout generates `MED-2026-X` and 5-digit encrypted pickup code `PICK-XXXXX`.
   - Pharmacy verifies code at store counter before dispensing medication.
6. **Test Implementation**:
   - Test quotation discovery and order checkout via `python backend/test_flows.py` (Flows 5 & 6).
7. **Update Documentation**: Update `docs/16-PHARMACY-QUOTATION-SYSTEM.md`.
8. **Update Development Tracking**: Mark items in `development/FEATURE-TRACKER.md`.
