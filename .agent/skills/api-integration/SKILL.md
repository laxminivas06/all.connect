---
name: api-integration
description: >-
  Frontend-to-backend REST API integration standards, error parsing, token refresh/interception,
  and mock/simulation boundary transparency.
---

# API Integration Skill

## Overview
Standards for maintaining robust, typed communication between the React frontend client (`frontend/src/services/api.js`) and the FastAPI backend.

## Client Request Architecture
All HTTP communications pass through the centralized `request()` wrapper in `api.js`:
- Injects JWT authorization header automatically from `localStorage.getItem('allconnect_token')`.
- Handles JSON serialization and Content-Type negotiation.
- Parses backend error details into user-readable Error exceptions:
  ```js
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || response.statusText);
  }
  ```

## Simulation Boundary Transparency
*Mandatory Rule*: Never claim an external API (such as Razorpay, Twilio SMS, or Google Maps) is live in production when it is currently running as a prototype simulation.
- Mark simulated workflows clearly (e.g. "Simulated OCR Analysis", "Escrow Payment Simulation").
- Design interfaces with standard data shapes so real SDKs can be plugged in later with zero frontend refactoring.
