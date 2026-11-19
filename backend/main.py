import os
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Setup import path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from config import UPLOADS_DIR
from database.seed import seed_database

# Prevent route registration crash on hosts with conflicting multipart package
try:
    import fastapi.dependencies.utils as _fdu
    _fdu.ensure_multipart_is_installed = lambda: None
except Exception:
    pass

from routes import (
    auth,
    patients,
    hospitals,
    clinics,
    doctors,
    appointments,
    prescriptions,
    pharmacies,
    orders,
    offers,
    subscriptions,
    notifications,
    admin,
    services,
    data_management
)

# Seed database with realistic demo data on startup if not present
seed_database(force=False)

app = FastAPI(
    title="Centralized Multi-Hospital Healthcare Ecosystem API",
    description="Multi-tenant Healthcare SaaS + Unified Patient Discovery Marketplace",
    version="2.0.0"
)

# CORS Middleware to allow React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(hospitals.router)
app.include_router(clinics.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(prescriptions.router)
app.include_router(pharmacies.router)
app.include_router(orders.router)
app.include_router(offers.router)
app.include_router(subscriptions.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(services.router)
app.include_router(data_management.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": "Centralized Multi-Hospital Healthcare Ecosystem",
        "city": "Hyderabad",
        "documentation": "/docs",
        "roles_supported": [
            "Patient",
            "Hospital",
            "Independent Clinic",
            "Doctor",
            "Pharmacy",
            "Super Admin"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
