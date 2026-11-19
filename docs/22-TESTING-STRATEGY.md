# 22: Testing Strategy & Automated Verification

## 1. Automated Integration Test Suite (`backend/test_flows.py`)
The platform includes an automated integration test runner executing via Starlette's `TestClient`:
```bash
python backend/test_flows.py
```
This tests:
1. `FLOW 1`: Patient registration & ID assignment (`PAT-2026-X` & `HC-2026-X`).
2. `FLOW 2`: Appointment booking & double-booking prevention.
3. `FLOW 3`: Doctor consultation queue & digital prescription authoring.
4. `FLOW 4`: Simulated OCR prescription extraction and saving.
5. `FLOW 5`: Multi-pharmacy reverse quotation discovery.
6. `FLOW 6`: Medicine order checkout & 5-digit pickup passcode validation.
7. `FLOW 7`: Hospital campaign approval workflow.
8. `FLOW 8`: SaaS subscription quota & publishing status toggle.
9. `FLOW 9`: Multi-hospital patient ID recognition & consent enforcement.
10. `FLOW 10`: Real-time revenue analytics & platform MRR/ARR calculation.

## 2. Frontend Build Verification
Execute production bundle test:
```bash
cd frontend
npm run build
```
Confirms clean JSX transforms, valid CSS output, and zero missing module references.
