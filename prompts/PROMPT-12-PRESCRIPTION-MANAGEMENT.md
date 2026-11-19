# PROMPT 12: Prescription Management & Simulated OCR Workflow

## Objective
Implement digital doctor prescription authoring, simulated camera/file upload for paper prescriptions, structured OCR extraction, and patient verification.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/15-PRESCRIPTION-SYSTEM.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/prescription-management/SKILL.md`
   - `.agent/skills/healthcare-security/SKILL.md`
4. **Inspect Existing Code**:
   - Review `frontend/src/components/PrescriptionUploadModal.jsx` and `backend/routes/prescriptions.py`.
5. **Implement / Verify**:
   - Simulated OCR endpoint `/api/prescriptions/simulate-ocr` extracting doctor names, clinics, raw handwriting text, and suggested medicines.
   - Patient verification table allowing editing of medicine names, dosages, and frequencies before saving.
   - Direct action button: "Verify & Find Medicines" that navigates to `/pharmacy-search` with extracted medicines pre-populated.
6. **Test Implementation**:
   - Test prescription upload and simulated OCR via `python backend/test_flows.py` (Flow 4).
7. **Update Documentation**: Update `docs/15-PRESCRIPTION-SYSTEM.md`.
8. **Update Development Tracking**: Mark items in `development/FEATURE-TRACKER.md`.
