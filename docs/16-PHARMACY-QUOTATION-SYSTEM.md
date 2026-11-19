# 16: Pharmacy Quotation & Ordering Engine

## 1. System Overview
The Pharmacy Quotation Engine eliminates blind pharmacy visits by allowing patients to receive competitive price quotations, delivery fee options, and stock availability statuses from registered pharmacies in Hyderabad.

## 2. Dynamic Quotation Matrix
When a patient requests quotes for prescribed medicines, the system queries nearby pharmacies and returns a comparison matrix:
- **Price**: Total medicine cost based on the pharmacy's unit prices.
- **Distance**: Calculated proximity to patient's specified Hyderabad locality.
- **Availability**: `Available` (all prescribed medicines in stock) or `Partial` (some items pending).
- **Delivery**: Store Pickup (Free) or Home Delivery (with estimated charge, e.g., ₹25-₹40).
- **Turnaround ETA**: Combined preparation and transit time (e.g. 20-35 mins).

## 3. Order Placement & Pickup Code Handover
1. Order ID created: `MED-2026-NNNNNN`
2. Encrypted Pickup Code generated: `PICK-NNNNN`
3. Verification: Counter handover requires the customer to present the code, which the pharmacist enters into the terminal to authorize dispensing.
4. *Safety Guardrail*: No automatic medicine substitution is permitted.
