# 08: Patient Workflow & Lifecycle

## 1. Overview
The patient represents the primary consumer persona. Through a single account, the patient interacts with multiple hospitals, polyclinics, specialists, and pharmacies.

## 2. End-to-End Patient Journey

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant WebApp as Web Client
    participant AuthAPI as Auth Router
    participant BookingAPI as Booking Router
    participant RxAPI as Prescriptions Router
    participant QuoteAPI as Quotation Router
    participant OrderAPI as Order Router

    Patient->>WebApp: Register with Demographics & Area
    WebApp->>AuthAPI: POST /api/auth/register-patient
    AuthAPI-->>WebApp: Returns PAT-2026-X & HC-2026-X + JWT
    
    Patient->>WebApp: Search Hospitals & Book Doctor Slot
    WebApp->>BookingAPI: POST /api/appointments/book
    BookingAPI-->>WebApp: Appointment Confirmed (APT-2026-X)

    Patient->>WebApp: Doctor Consulted -> Receives Digital Prescription
    WebApp->>RxAPI: GET /api/prescriptions
    RxAPI-->>WebApp: Returns PRE-2026-X with Medication Regimen

    Patient->>WebApp: Clicks "Find Medicines Near Me"
    WebApp->>QuoteAPI: POST /api/orders/request-quotations
    QuoteAPI-->>WebApp: Returns 6 Pharmacy Bids (Price, Dist, ETA)

    Patient->>WebApp: Selects Best Quote & Places Order
    WebApp->>OrderAPI: POST /api/orders/place-order
    OrderAPI-->>WebApp: Order MED-2026-X with Passcode PICK-XXXXX

    Patient->>WebApp: Visits Pharmacy, Shows PICK-XXXXX -> Receives Meds
```

## 3. UI Views for Patient
- `/dashboard/patient`: Telemetry, Quick Action Bar, Overview tab.
- `/dashboard/patient/appointments`: Schedule & statuses.
- `/dashboard/patient/prescriptions`: Digital prescriptions and simulated OCR upload modal.
- `/dashboard/patient/records`: Diagnostic lab reports and Consent sharing modal.
- `/dashboard/patient/orders`: Medicine orders and counter pickup passcodes.
