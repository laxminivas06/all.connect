# 02: Product Requirements Document (PRD)

## 1. Functional Scope Matrix
| Feature Area | Patient | Hospital | Clinic | Doctor | Pharmacy | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Unified Health ID (`HC-2026-X`) | View / Share | Read (Consent) | Read (Consent) | Read (Consent) | Verification | Governance |
| Appointment Booking | Book / Cancel | Manage Queue | Fast Walk-In | OPD Queue | - | Monitor |
| Double Booking Prevention | Yes | Yes | Yes | Yes | - | Enforced |
| Digital Prescriptions | Locker | View | View | Authorize / Sign | View for Quote | Audit |
| Prescription OCR Parsing | Upload & Edit | - | - | - | - | - |
| Pharmacy Quotes Engine | Compare Quotes | - | - | - | Submit Quote | Monitor |
| Pickup Code Verification (`PICK-X`) | View Code | - | - | - | Verify & Handover | - |
| Promotional Offers | Browse / Book | Create Drafts | Create Drafts | - | - | Approve / Reject |
| Multi-Tenant Subscriptions | - | Manage | Manage | - | Manage | Configure / ARR |
| Public Directory Publishing | Browse | Subject to Rule | Subject to Rule | Verified | Verified | Toggle Control |

## 2. Non-Functional Requirements
- **Performance**: Sub-100ms API response time in local environment; bundle size optimized via Vite tree-shaking.
- **Reliability**: Atomic file persistence preventing corruption during simultaneous JSON read/write operations.
- **Security**: PBKDF2-HMAC password hashing (100,000 rounds), PyJWT bearer token authorization.
- **Accessibility**: Semantic HTML5, high-contrast text, full keyboard navigation support in modals.
