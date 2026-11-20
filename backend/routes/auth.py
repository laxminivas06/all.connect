from datetime import datetime, timedelta
import time
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Depends
from models.schemas import LoginRequest, PatientRegisterRequest, OrgRegisterRequest
from database.db import find_one, find_all, insert, update
from services.auth_utils import hash_password, verify_password, create_access_token, get_current_user_payload
from routes.admin import log_audit_event

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory brute-force tracker: username_key -> list of timestamp floats
_FAILED_LOGINS: Dict[str, List[float]] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_WINDOW_SECONDS = 900  # 15 minutes

def check_login_rate_limit(key: str):
    now = time.time()
    failures = _FAILED_LOGINS.get(key, [])
    # Keep only failures within window
    failures = [t for t in failures if now - t < LOCKOUT_WINDOW_SECONDS]
    _FAILED_LOGINS[key] = failures
    if len(failures) >= MAX_FAILED_ATTEMPTS:
        remaining_secs = int(LOCKOUT_WINDOW_SECONDS - (now - failures[0]))
        remaining_mins = max(1, remaining_secs // 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Account temporarily locked for {remaining_mins} minutes to protect against brute-force attacks."
        )

def record_failed_login(key: str):
    now = time.time()
    if key not in _FAILED_LOGINS:
        _FAILED_LOGINS[key] = []
    _FAILED_LOGINS[key].append(now)

def clear_failed_logins(key: str):
    if key in _FAILED_LOGINS:
        _FAILED_LOGINS.pop(key, None)

@router.post("/login")
def login(req: LoginRequest):
    user_key = req.username.strip().lower()
    check_login_rate_limit(user_key)

    user = find_one("users", lambda u: u.get("username") == req.username.strip() or u.get("email") == req.username.strip().lower())
    if not user:
        record_failed_login(user_key)
        log_audit_event(
            actor="Anonymous",
            action="LOGIN_FAILED",
            target=user_key,
            category="Authentication",
            detail=f"Failed login attempt for nonexistent user identifier: {user_key}",
            severity="warning"
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    if not verify_password(req.password, user.get("hashed_password", "")):
        record_failed_login(user_key)
        log_audit_event(
            actor=user.get("username", "Unknown"),
            action="LOGIN_FAILED",
            target=user.get("id", "Unknown"),
            category="Authentication",
            detail=f"Incorrect password attempt for user {user.get('username')}",
            severity="warning"
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account has been suspended. Please contact platform admin.")

    # Successful login: reset failed counter
    clear_failed_logins(user_key)

    log_audit_event(
        actor=user.get("username", "User"),
        action="LOGIN_SUCCESS",
        target=user.get("id", ""),
        category="Authentication",
        detail=f"User {user.get('username')} ({user.get('role')}) logged in successfully",
        severity="info"
    )

    token_data = {
        "sub": user["id"],
        "username": user["username"],
        "role": user["role"],
        "organization_id": user.get("organization_id"),
        "entity_id": user.get("entity_id"),
        "full_name": user.get("full_name")
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user.get("email"),
            "role": user["role"],
            "full_name": user.get("full_name"),
            "name": user.get("full_name") or user.get("username"),
            "phone": user.get("phone"),
            "organization_id": user.get("organization_id"),
            "entity_id": user.get("entity_id")
        }
    }

@router.post("/register-patient")
def register_patient(req: PatientRegisterRequest):
    existing_user = find_one("users", lambda u: u.get("username") == req.email or u.get("email") == req.email.lower())
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    patients = find_all("patients")
    next_num = len(patients) + 1
    patient_id = f"PAT-2026-{next_num:06d}"
    health_id = f"HC-2026-{next_num:06d}"

    user_id = f"usr-patient-{next_num:02d}"

    user_record = {
        "id": user_id,
        "username": req.email.split("@")[0].lower(),
        "email": req.email.lower(),
        "role": "patient",
        "full_name": req.full_name,
        "hashed_password": hash_password(req.password),
        "organization_id": None,
        "entity_id": patient_id,
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    insert("users", user_record)

    patient_record = {
        "id": patient_id,
        "patient_id": patient_id,
        "health_id": health_id,
        "user_id": user_id,
        "full_name": req.full_name,
        "email": req.email.lower(),
        "mobile": req.mobile,
        "dob": req.dob,
        "age": 2026 - int(req.dob.split("-")[0]) if "-" in req.dob else 30,
        "gender": req.gender,
        "blood_group": req.blood_group or "B+",
        "address": req.address,
        "area": req.area,
        "city": req.city,
        "pincode": req.pincode,
        "emergency_contact": {"name": "Primary Contact", "phone": req.mobile},
        "allergies": req.allergies or [],
        "chronic_conditions": req.chronic_conditions or [],
        "permitted_organizations": [],
        "created_at": datetime.now().isoformat()
    }
    insert("patients", patient_record)

    # Welcome notification
    insert("notifications", {
        "id": f"notif-welcome-{next_num}",
        "user_id": user_id,
        "role": "patient",
        "title": "Welcome to Centralized Healthcare",
        "message": f"Your centralized Health ID {health_id} and Patient ID {patient_id} have been generated.",
        "type": "system",
        "link": "/dashboard/patient",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    })

    token_data = {
        "sub": user_id,
        "username": user_record["username"],
        "role": "patient",
        "organization_id": None,
        "entity_id": patient_id,
        "full_name": req.full_name
    }
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "patient_id": patient_id,
        "health_id": health_id,
        "user": user_record
    }

@router.post("/register-organization")
def register_organization(req: OrgRegisterRequest):
    table_name = "hospitals" if req.organization_type == "hospital" else "clinics"
    orgs = find_all(table_name)
    next_num = len(orgs) + 1
    prefix = "hosp" if req.organization_type == "hospital" else "clinic"
    org_id = f"{prefix}-{next_num:03d}"

    org_record = {
        "id": org_id,
        "name": req.organization_name,
        "organization_type": req.organization_type,
        "tagline": "Healthcare Services",
        "address": req.address,
        "area": req.area,
        "city": "Hyderabad",
        "pincode": req.pincode,
        "coordinates": {"lat": 17.4399, "lng": 78.4983},
        "contact_phone": req.phone,
        "emergency_phone": req.phone,
        "email": req.email.lower(),
        "website": "",
        "rating": 4.5,
        "reviews_count": 0,
        "departments": req.departments,
        "operating_hours": "09:00 AM - 08:00 PM",
        "subscription_plan": "starter",
        "subscription_status": "trial",
        "verification_status": "under_review",
        "publishing_status": "unpublished",
        "created_at": datetime.now().isoformat()
    }
    insert(table_name, org_record)

    user_id = f"usr-{prefix}-{next_num:02d}"
    user_record = {
        "id": user_id,
        "username": req.email.split("@")[0].lower(),
        "email": req.email.lower(),
        "role": req.organization_type,
        "full_name": f"{req.organization_name} Administrator",
        "hashed_password": hash_password(req.password),
        "organization_id": org_id,
        "entity_id": org_id,
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    insert("users", user_record)

    # Super admin notification
    insert("notifications", {
        "id": f"notif-new-org-{org_id}",
        "user_id": "usr-admin-01",
        "role": "super_admin",
        "title": f"New {req.organization_type.capitalize()} Registration Pending Approval",
        "message": f"{req.organization_name} ({req.area}) submitted registration. Verification required.",
        "type": "organization",
        "link": "/dashboard/admin/organizations",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    })

    return {
        "message": "Registration submitted successfully. Account is currently under review by Super Admin.",
        "organization_id": org_id,
        "verification_status": "under_review",
        "publishing_status": "unpublished"
    }

@router.get("/me")
def get_me(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    user = find_one("users", lambda u: u.get("id") == current_user["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    extra_details = {}
    if user["role"] == "patient":
        patient = find_one("patients", lambda p: p.get("patient_id") == user.get("entity_id") or p.get("user_id") == user["id"])
        extra_details["patient_profile"] = patient
    elif user["role"] in ["hospital", "clinic"]:
        table = "hospitals" if user["role"] == "hospital" else "clinics"
        org = find_one(table, lambda o: o.get("id") == user.get("organization_id"))
        extra_details["organization_profile"] = org
    elif user["role"] == "doctor":
        doc = find_one("doctors", lambda d: d.get("id") == user.get("entity_id"))
        extra_details["doctor_profile"] = doc
    elif user["role"] == "pharmacy":
        pharm = find_one("pharmacies", lambda p: p.get("id") == user.get("entity_id"))
        extra_details["pharmacy_profile"] = pharm

    return {
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user.get("email"),
            "role": user["role"],
            "full_name": user.get("full_name"),
            "name": user.get("full_name") or user.get("username"),
            "phone": user.get("phone"),
            "organization_id": user.get("organization_id"),
            "entity_id": user.get("entity_id")
        },
        **extra_details
    }

@router.get("/demo-accounts")
def get_demo_accounts():
    return [
        {"role": "Super Admin", "role_key": "super_admin", "username": "admin", "password": "Admin@123", "description": "Platform owner, approvals, SaaS subscriptions, publishing controls"},
        {"role": "Patient", "role_key": "patient", "username": "patient", "password": "Patient@123", "description": "Unified Health ID, hospital/clinic discovery, appointments, medicine quotes"},
        {"role": "Hospital", "role_key": "hospital", "username": "hospital", "password": "Hospital@123", "description": "Yashoda Super Speciality SaaS: OPD queue, doctors, billing, promotional campaigns"},
        {"role": "Independent Clinic", "role_key": "clinic", "username": "clinic", "password": "Clinic@123", "description": "MedPlus Care Clinic SaaS: streamlined walk-in queue, doctor schedules, clinic packages"},
        {"role": "Doctor", "role_key": "doctor", "username": "doctor", "password": "Doctor@123", "description": "Dr. Rajesh Sharma, MD DM: consultation queue, consent patient viewer, digital Rx tool"},
        {"role": "Pharmacy", "role_key": "pharmacy", "username": "pharmacy", "password": "Pharmacy@123", "description": "Apollo Pharmacy Malkajgiri: quotation requests, orders queue, pickup verification code"}
    ]

@router.post("/change-password")
def change_password(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    user_id = current_user.get("sub")
    user = find_one("users", lambda u: u.get("id") == user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_pw = payload.get("old_password")
    new_pw = payload.get("new_password")
    if not new_pw or len(new_pw) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    if not verify_password(old_pw, user.get("hashed_password", "")):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    update("users", user["id"], {"hashed_password": hash_password(new_pw)}, id_field="id")
    return {"message": "Password updated successfully"}

