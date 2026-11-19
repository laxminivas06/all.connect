# 00: Project Overview

## 1. What the Platform Does
The **Centralized Multi-Hospital Healthcare Ecosystem (AllConnect)** is a unified healthcare management and discovery platform that connects multiple independent hospitals, neighborhood clinics, doctors, diagnostic centers, medical stores/pharmacies, and patients across **Hyderabad, Telangana** through one digital ecosystem.

## 2. Why It Exists
Healthcare services are fragmented. Today, a patient visiting different hospitals or clinics must create separate accounts, download proprietary apps, manually transport physical paper prescriptions, and search for medicines at pharmacies blindly. Meanwhile, healthcare providers lack interoperable connections to nearby pharmacies or universal patient records. AllConnect solves this by federating these services into one multi-tenant SaaS and discovery marketplace.

## 3. Technology Stack Summary
- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide React icons, Recharts.
- **Backend**: Python 3.10+, FastAPI, RESTful architecture, PyJWT, Pydantic v2.
- **Persistence Layer**: Thread-safe atomic JSON file repository with structured schemas, pre-engineered for seamless migration to PostgreSQL.
- **Sample Geography**: Hyderabad (Malkajgiri, Secunderabad, Uppal, Tarnaka, Nacharam, Begumpet).

## 4. Primary Stakeholders & Roles
1. **Patients**: Universal health identity, cross-hospital discovery, appointments, digital prescriptions, medicine quote comparison.
2. **Hospitals**: Enterprise SaaS management for appointments, departments, doctors, billing, and promotional packages.
3. **Clinics**: Streamlined SaaS for walk-in registrations, doctor schedules, and daily collections.
4. **Doctors**: Clinical workstation for OPD queues, patient medical histories, and digital prescription authoring.
5. **Pharmacies**: Quotation bidding, prescription verification, order fulfillment, and pickup code verification.
6. **Super Admin**: Platform governance, subscription tiers, organization approvals, and public publishing control.

## 5. Architectural Non-Negotiables
- One centralized patient account across all participating hospitals.
- Full tenant-level data isolation for every hospital and clinic.
- Consent-based sharing for patient medical records.
- Super Admin approval required before publishing promotional advertisements.
