from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SubscriptionAssignRequest
from database.db import find_all, find_one, insert, update
from services.auth_utils import get_current_user_payload

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.get("/plans")
def list_subscription_plans():
    return find_all("plans")

@router.get("/current")
def get_current_subscription(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    org_id = current_user.get("organization_id")
    if not org_id:
        raise HTTPException(status_code=400, detail="No organization associated with this user")

    sub = find_one("subscriptions", lambda s: s.get("organization_id") == org_id)
    if not sub:
        # Default starter trial
        sub = {
            "id": f"sub-{org_id}",
            "organization_id": org_id,
            "organization_name": current_user.get("full_name", "Medical Centre"),
            "plan_id": "plan-starter",
            "plan_name": "Starter Plan",
            "billing_cycle": "monthly",
            "amount_paid": 4999,
            "status": "active",
            "start_date": "2026-01-01",
            "end_date": "2026-02-01",
            "doctor_limit": 5,
            "doctors_utilized": 2,
            "publishing_allowed": True
        }

    # Count real utilized doctors
    doctors = find_all("doctors", lambda d: d.get("organization_id") == org_id)
    sub["doctors_utilized"] = len(doctors)

    return sub

@router.post("/subscribe")
def subscribe_or_upgrade(req: SubscriptionAssignRequest, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    plan = find_one("plans", lambda p: p.get("id") == req.plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")

    table = "hospitals" if req.organization_type == "hospital" else "clinics"
    org = find_one(table, lambda o: o.get("id") == req.organization_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    amount = plan["annual_price"] if req.billing_cycle == "annual" else plan["monthly_price"]
    end_date = (datetime.now() + timedelta(days=365 if req.billing_cycle == "annual" else 30)).strftime("%Y-%m-%d")

    sub_id = f"sub-{req.organization_id}"
    sub_record = {
        "id": sub_id,
        "organization_id": req.organization_id,
        "organization_name": org.get("name", "Organization"),
        "organization_type": req.organization_type,
        "plan_id": plan["id"],
        "plan_name": plan["name"],
        "billing_cycle": req.billing_cycle,
        "amount_paid": amount,
        "status": "active",
        "start_date": datetime.now().strftime("%Y-%m-%d"),
        "end_date": end_date,
        "auto_renew": True,
        "doctor_limit": plan.get("doctor_limit", 10),
        "publishing_allowed": True
    }

    existing_sub = find_one("subscriptions", lambda s: s.get("organization_id") == req.organization_id)
    if existing_sub:
        update("subscriptions", existing_sub["id"], sub_record, id_field="id")
    else:
        insert("subscriptions", sub_record)

    # Update organization's subscription plan and status
    update(table, org["id"], {
        "subscription_plan": plan["type"],
        "subscription_status": "active"
    }, id_field="id")

    return {
        "message": f"Successfully subscribed to {plan['name']}!",
        "subscription": sub_record
    }

@router.post("/request-upgrade")
def request_subscription_upgrade(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    org_id = current_user.get("organization_id")
    target_plan_id = payload.get("plan_id") or payload.get("target_plan") or ""
    plan = find_one("plans", lambda p: p.get("id") == target_plan_id or p.get("type") == target_plan_id or target_plan_id in p.get("id", "") or target_plan_id in p.get("name", "").lower())
    if not plan:
        # Fallback to enterprise
        plan = find_one("plans", lambda p: p.get("id") == "plan-enterprise")
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    req_data = {
        "id": f"upg-req-{datetime.now().timestamp()}",
        "organization_id": org_id,
        "plan_id": plan.get("id"),
        "target_plan": payload.get("target_plan") or plan.get("name"),
        "billing_cycle": payload.get("billing_cycle", "annual"),
        "notes": payload.get("notes", ""),
        "created_at": datetime.now().isoformat()
    }

    insert("notifications", {
        "id": f"notif-upgrade-req-{datetime.now().timestamp()}",
        "user_id": "usr-admin-01",
        "role": "super_admin",
        "title": "Subscription Upgrade Request",
        "message": f"Organization '{org_id}' requested upgrade to '{plan.get('name')}'.",
        "type": "subscription",
        "link": "/dashboard/admin/subscriptions",
        "is_read": False,
        "created_at": datetime.now().isoformat()
    })
    return {
        "message": f"Upgrade request to {plan.get('name')} submitted successfully to platform administration.",
        "upgrade_request": req_data
    }

@router.post("/renew")
def renew_subscription(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user_payload)
):
    org_id = current_user.get("organization_id")
    sub = find_one("subscriptions", lambda s: s.get("organization_id") == org_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Active subscription not found")

    days = 365 if sub.get("billing_cycle") == "annual" else 30
    new_expiry = (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
    updated = update("subscriptions", sub["id"], {
        "end_date": new_expiry,
        "status": "active",
        "last_renewed_at": datetime.now().isoformat()
    }, id_field="id")
    return {"message": f"Subscription renewed until {new_expiry}", "subscription": updated}

