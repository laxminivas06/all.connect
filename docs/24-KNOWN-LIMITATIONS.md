# 24: Known Prototype Limitations & Technical Boundaries

## 1. Storage Boundaries
- **JSON Storage**: Suitable for the development prototype and functional verification. Not intended for high-concurrency production deployments. Must be migrated to PostgreSQL 16 before commercial deployment.
- **In-Memory Locks**: Table locks (`threading.Lock`) operate across single-process instances. Distributed multi-process scaling requires Redis distributed locks or ACID database transactions.

## 2. Third-Party Integrations
- **OCR Engine**: Currently runs a high-precision simulated OCR workflow with candidate extraction for human verification. Commercial deployment requires integration with Google Cloud Document AI or AWS Textract.
- **Payment Gateway**: Consultation fee payments and medicine orders simulate online UPI gateways and counter cash recording. Commercial deployment requires Razorpay / Cashfree integration.
- **Maps & Geolocation**: Locations use hardcoded coordinates across Hyderabad (Malkajgiri, Secunderabad, Begumpet, Uppal, Tarnaka, Nacharam). Integration with Google Maps JavaScript API is prepared for when API credentials are provided.

## 3. Regulatory Boundaries
- **Ecosystem Identity**: The platform Universal Health ID (`HC-2026-X`) connects participating facilities on AllConnect and must not be confused with India's official national ABHA ID until formal ABDM sandbox certification is completed.
