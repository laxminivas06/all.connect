---
name: pharmacy-marketplace
description: >-
  Prescription-based medicine price comparison, multi-pharmacy quotation engine,
  fulfillment modes (store pickup / home delivery), and counter pickup passcode validation.
---

# Pharmacy Marketplace & Quotation Skill

## Overview
Guides the discovery of nearby pharmacies, quotation generation, comparison tables, and secure counter pickup verification in `frontend/src/pages/PharmacySearchPage.jsx`, `backend/routes/pharmacies.py`, and `backend/routes/orders.py`.

## Core Workflows

### 1. Quotation Request Flow
1. Patient selects a prescription or inputs prescribed medicine names.
2. Selects their Hyderabad locality (Malkajgiri, Secunderabad, Uppal, etc.).
3. Calls `/api/orders/request-quotations`.
4. The system queries nearby registered pharmacies, calculates itemized totals, delivery fees, availability status (`Available` vs `Partial`), and ETAs.

### 2. Quotation Comparison Interface
Displays results in a professional comparison matrix:
- **Pharmacy Name & Locality**
- **Distance** (km)
- **Stock Availability** (Available / Partial)
- **Medicine Price** (₹)
- **Delivery Fee** (₹ or Store Pickup Only)
- **Estimated Time** (mins)
- **Action**: "Order Now"

### 3. Order Placement & Pickup Code Handover
1. Order ID: `MED-YYYY-NNNNNN` (e.g., `MED-2026-000141`).
2. Pickup Passcode: A 5-digit verification code (`PICK-XXXXX`).
3. Pharmacy Dashboard Verification:
   - Pharmacist opens "Verify Customer Pickup Passcode" tab.
   - Enters the customer's passcode (`PICK-XXXXX`).
   - The backend validates the code and transitions order status to `Collected`.
   - *Rule*: Prevents incorrect medication handover.
