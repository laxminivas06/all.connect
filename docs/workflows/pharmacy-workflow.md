# 12: Pharmacy Marketplace & Quotation Workflow

## 1. Overview
The Pharmacy dashboard belongs to licensed chemists and medical stores (e.g. Apollo Pharmacy Malkajgiri, MedPlus Uppal). It processes patient quotation bids, manages medication preparation queues, and verifies customer counter pickup passcodes.

## 2. Order & Quotation Lifecycle
1. **Incoming Request**:
   - Nearby patients requesting quotes for prescribed medications trigger real-time quote calculation.
   - Pricing reflects pharmacy catalog prices with slight locality adjustments.
2. **Order Reception**:
   - When a patient selects the pharmacy and checks out, an order (`MED-2026-X`) is generated with status `Pharmacy Verification`.
   - The pharmacist reviews the prescribed items and clicks **Accept & Prepare**.
3. **Medication Preparation**:
   - Order status transitions to `Preparing`. Pharmacist packs medications into a dedicated dispensary bin.
4. **Ready for Pickup**:
   - Pharmacist marks the order **Ready for Pickup**.
   - Patient receives an alert that the order is ready at the pharmacy.
5. **Counter Handover & Verification Passcode**:
   - The patient arrives at the store counter and presents their 5-digit verification passcode (e.g., `PICK-48291`).
   - Pharmacist types this code into the **Verify Customer Pickup Passcode** terminal.
   - The system verifies the code matches the order, approves handover, and marks status as `Collected`.
