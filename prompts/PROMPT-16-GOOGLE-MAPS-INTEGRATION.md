# PROMPT 16: Geolocation & Map Integration Interface

## Objective
Implement geolocation proximity filters, latitude/longitude coordinate schemas for Hyderabad entities, and prepare the interface for live Google Maps JavaScript API integration.

## Required Execution Steps
1. **Read `prompts/MASTER-PROMPT.md`**.
2. **Read `docs/24-KNOWN-LIMITATIONS.md`**.
3. **Load Specialized Skills**:
   - `.agent/skills/frontend-development/SKILL.md`
   - `.agent/skills/api-integration/SKILL.md`
4. **Inspect Existing Code**:
   - Review coordinates in `backend/database/hospitals.json` and `backend/database/pharmacies.json`.
5. **Implement / Verify**:
   - Pre-configured coordinates for Hyderabad locations:
     - Malkajgiri: `{lat: 17.4485, lng: 78.5324}`
     - Secunderabad: `{lat: 17.4399, lng: 78.4983}`
     - Begumpet: `{lat: 17.4411, lng: 78.4842}`
     - Uppal: `{lat: 17.3984, lng: 78.5582}`
     - Tarnaka: `{lat: 17.4285, lng: 78.5358}`
     - Nacharam: `{lat: 17.4362, lng: 78.5684}`
   - Provide clean map placeholder card with direct hooks for `@react-google-maps/api`.
6. **Test Implementation**:
   - Verify area filters work accurately across Hospitals, Clinics, and Pharmacies.
7. **Update Documentation**: Update `docs/24-KNOWN-LIMITATIONS.md`.
8. **Update Development Tracking**: Mark items in `development/FEATURE-TRACKER.md`.
