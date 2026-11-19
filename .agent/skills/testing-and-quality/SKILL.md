---
name: testing-and-quality
description: >-
  Quality assurance protocols, automated FastAPI test suites via TestClient,
  Vite production build verification, and regression prevention.
---

# Testing and Quality Assurance Skill

## Overview
Protocols for verifying end-to-end functionality, preventing regressions, and validating workflows before marking any feature completed.

## 1. Automated Integration Verification
Run the master workflow verification suite:
```bash
python backend/test_flows.py
```
This tests all 10 core flows in sequence:
- Flow 1: Patient Registration & ID Generation
- Flow 2: Appointment Booking & Double Booking Block
- Flow 3: Doctor Consultation & Digital Prescription
- Flow 4: Simulated Prescription OCR
- Flow 5: Multi-Pharmacy Quotations Comparison
- Flow 6: Medicine Order & Pickup Code Handover
- Flow 7: Hospital Campaign Approval Workflow
- Flow 8: Subscription Assignment & Publishing Toggle
- Flow 9: Multi-Hospital Patient ID Recognition & Consent
- Flow 10: Revenue Calculations & Platform Analytics

## 2. Frontend Production Build Check
Before committing changes, execute:
```bash
cd frontend
npm run build
```
Confirms that JSX transforms, Tailwind utility generation, and Vite bundle minification succeed with zero syntax errors.
