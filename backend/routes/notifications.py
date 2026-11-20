from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from database.db import find_all, find_one, update, delete, load_table, save_table
from services.auth_utils import get_current_user_payload

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
def get_user_notifications(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    role = current_user.get("role")
    user_id = current_user.get("sub")
    entity_id = current_user.get("entity_id")
    org_id = current_user.get("organization_id")

    def is_user_notification(n):
        n_uid = n.get("user_id")
        n_role = n.get("role")
        n_org = n.get("organization_id")
        n_eid = n.get("entity_id")
        
        # 1. Direct user_id or entity_id match
        if n_uid and (n_uid == user_id or (entity_id and n_uid == entity_id)):
            return True
        if n_eid and (n_eid == entity_id or n_eid == user_id):
            return True
            
        # 2. Organization match (for hospital/clinic/doctor affiliated with that org)
        if org_id and n_org and n_org == org_id:
            return True
            
        # 3. Role-level notifications (broadcast to role)
        if not n_uid and not n_org:
            if n_role == role or n_role == "all":
                return True
                
        return False

    notifs = find_all("notifications", is_user_notification)
    return sorted(notifs, key=lambda x: x.get("created_at", ""), reverse=True)

@router.put("/{notif_id}/read")
def mark_notification_read(notif_id: str, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    updated = update("notifications", notif_id, {"is_read": True}, id_field="id")
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read", "notification": updated}

@router.put("/mark-all-read")
def mark_all_read(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    role = current_user.get("role")
    user_id = current_user.get("sub")
    entity_id = current_user.get("entity_id")
    org_id = current_user.get("organization_id")

    def is_user_notification(n):
        n_uid = n.get("user_id")
        n_role = n.get("role")
        n_org = n.get("organization_id")
        n_eid = n.get("entity_id")
        if n_uid and (n_uid == user_id or (entity_id and n_uid == entity_id)):
            return True
        if n_eid and (n_eid == entity_id or n_eid == user_id):
            return True
        if org_id and n_org and n_org == org_id:
            return True
        if not n_uid and not n_org:
            if n_role == role or n_role == "all":
                return True
        return False

    notifs = find_all("notifications", is_user_notification)
    for n in notifs:
        update("notifications", n["id"], {"is_read": True}, id_field="id")
    return {"message": "All notifications marked as read"}

@router.delete("/{notif_id}")
def delete_notification(notif_id: str, current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    role = current_user.get("role")
    user_id = current_user.get("sub")
    notif = find_one("notifications", lambda n: str(n.get("id")) == str(notif_id))
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    # Authorization check
    if notif.get("user_id") and notif.get("user_id") != user_id and role != "Super Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this notification")
    
    deleted = delete("notifications", notif_id, id_field="id")
    if not deleted:
        raise HTTPException(status_code=404, detail="Notification could not be deleted")
    return {"message": "Notification deleted successfully", "id": notif_id}

@router.delete("")
def delete_all_notifications(current_user: Dict[str, Any] = Depends(get_current_user_payload)):
    role = current_user.get("role")
    user_id = current_user.get("sub")
    
    all_notifs = load_table("notifications")
    initial_count = len(all_notifs)
    # Keep notifications that DO NOT belong to this user / role
    remaining = [
        n for n in all_notifs 
        if not (n.get("user_id") == user_id or (not n.get("user_id") and n.get("role") == role))
    ]
    save_table("notifications", remaining)
    deleted_count = initial_count - len(remaining)
    return {"message": f"Successfully deleted {deleted_count} notifications", "deleted_count": deleted_count}
