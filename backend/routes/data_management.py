import os
import io
import csv
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from fastapi.responses import StreamingResponse

from config import BASE_DIR, DATABASE_DIR, UPLOADS_DIR
from database.db import find_all, find_one, update, insert
from services.auth_utils import get_current_user_payload
from routes.admin import check_super_admin, log_audit_event, SECURE_DOCS_DIR
from services.backup_service import (
    create_database_backup,
    restore_database_backup,
    list_all_backups,
    verify_backup_integrity,
    create_pre_destructive_backup,
    get_dir_size,
    BACKUPS_DIR
)

router = APIRouter(prefix="/api/admin/data-management", tags=["Super Admin Data Management"])

DEFAULT_PLATFORM_CAPACITY_BYTES = 50 * 1024 * 1024 * 1024  # 50 GB
DEFAULT_ORG_STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024  # 1 GB per organization default

def format_bytes(bytes_count: int) -> str:
    """Format bytes into readable string (B, KB, MB, GB)."""
    if bytes_count < 1024:
        return f"{bytes_count} B"
    elif bytes_count < 1024 * 1024:
        return f"{bytes_count / 1024:.2f} KB"
    elif bytes_count < 1024 * 1024 * 1024:
        return f"{bytes_count / (1024 * 1024):.2f} MB"
    else:
        return f"{bytes_count / (1024 * 1024 * 1024):.2f} GB"

def calculate_platform_storage_metrics() -> Dict[str, Any]:
    """Calculates live storage metrics from physical disk."""
    # 1. Database size (all .json in DATABASE_DIR)
    db_size = sum(f.stat().st_size for f in DATABASE_DIR.glob("*.json") if f.is_file())
    
    # 2. Uploads size
    uploads_total = get_dir_size(UPLOADS_DIR)
    logos_size = get_dir_size(UPLOADS_DIR / "organization_logos")
    prescriptions_size = get_dir_size(UPLOADS_DIR / "prescriptions")
    reports_size = get_dir_size(UPLOADS_DIR / "reports")
    ads_size = get_dir_size(UPLOADS_DIR / "advertisements")
    
    # 3. Secure documents size
    secure_docs_size = get_dir_size(SECURE_DOCS_DIR)

    # 4. Backups size
    backups_size = get_dir_size(BACKUPS_DIR)

    total_storage_used = db_size + uploads_total + secure_docs_size + backups_size
    platform_capacity = DEFAULT_PLATFORM_CAPACITY_BYTES
    storage_available = max(0, platform_capacity - total_storage_used)
    usage_percentage = (total_storage_used / platform_capacity) * 100

    # Determine platform health
    if usage_percentage >= 90:
        health_status = "Critical"
    elif usage_percentage >= 75:
        health_status = "Warning"
    elif usage_percentage >= 50:
        health_status = "Moderate"
    else:
        health_status = "Healthy"

    return {
        "platform_capacity_bytes": platform_capacity,
        "platform_capacity_formatted": format_bytes(platform_capacity),
        "total_used_bytes": total_storage_used,
        "total_used_formatted": format_bytes(total_storage_used),
        "available_bytes": storage_available,
        "available_formatted": format_bytes(storage_available),
        "usage_percentage": round(usage_percentage, 2),
        "health_status": health_status,
        "components": {
            "database": {
                "bytes": db_size,
                "formatted": format_bytes(db_size),
                "percentage_of_used": round((db_size / max(1, total_storage_used)) * 100, 2)
            },
            "uploads_general": {
                "bytes": uploads_total,
                "formatted": format_bytes(uploads_total),
                "percentage_of_used": round((uploads_total / max(1, total_storage_used)) * 100, 2)
            },
            "organization_logos": {
                "bytes": logos_size,
                "formatted": format_bytes(logos_size),
                "percentage_of_used": round((logos_size / max(1, total_storage_used)) * 100, 2)
            },
            "prescriptions_and_reports": {
                "bytes": prescriptions_size + reports_size,
                "formatted": format_bytes(prescriptions_size + reports_size),
                "percentage_of_used": round(((prescriptions_size + reports_size) / max(1, total_storage_used)) * 100, 2)
            },
            "accreditation_documents": {
                "bytes": secure_docs_size,
                "formatted": format_bytes(secure_docs_size),
                "percentage_of_used": round((secure_docs_size / max(1, total_storage_used)) * 100, 2)
            },
            "database_backups": {
                "bytes": backups_size,
                "formatted": format_bytes(backups_size),
                "percentage_of_used": round((backups_size / max(1, total_storage_used)) * 100, 2)
            }
        }
    }

def get_org_storage_usage(org_id: str, org_type: str, org_name: str) -> Dict[str, Any]:
    """Calculate exact storage and record count for a specific organization."""
    # 1. Calculate record count & JSON storage in database
    db_records_count = 0
    db_records_bytes = 0

    tables_to_check = [
        ("appointments", "organization_id"),
        ("doctors", "organization_id"),
        ("services", "organization_id"),
        ("offers", "organization_id"),
        ("orders", "pharmacy_id" if org_type == "pharmacy" else "organization_id"),
        ("prescriptions", "organization_id")
    ]

    for table_name, id_field in tables_to_check:
        try:
            records = find_all(table_name, lambda r: str(r.get(id_field, "")) == str(org_id))
            db_records_count += len(records)
            import json
            for r in records:
                db_records_bytes += len(json.dumps(r).encode("utf-8"))
        except Exception:
            pass

    # 2. Calculate physical files associated with this org
    org_files = []
    uploads_bytes = 0

    # Search in SECURE_DOCS_DIR
    if SECURE_DOCS_DIR.exists():
        for f in SECURE_DOCS_DIR.iterdir():
            if f.is_file() and f.name.startswith(f"{org_id}_"):
                f_size = f.stat().st_size
                uploads_bytes += f_size
                org_files.append({
                    "filename": f.name,
                    "category": "Accreditation Document",
                    "size_bytes": f_size,
                    "size_formatted": format_bytes(f_size),
                    "created_at": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
                })

    # Search in organization_logos
    logos_dir = UPLOADS_DIR / "organization_logos"
    if logos_dir.exists():
        for f in logos_dir.iterdir():
            if f.is_file() and f.name.startswith(f"{org_id}_"):
                f_size = f.stat().st_size
                uploads_bytes += f_size
                org_files.append({
                    "filename": f.name,
                    "category": "Logo",
                    "size_bytes": f_size,
                    "size_formatted": format_bytes(f_size),
                    "created_at": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
                })

    total_storage_bytes = db_records_bytes + uploads_bytes

    # Fetch configured limit
    sub = find_one("subscriptions", lambda s: str(s.get("organization_id", "")) == str(org_id))
    limit_bytes = sub.get("storage_limit_bytes", DEFAULT_ORG_STORAGE_LIMIT_BYTES) if sub else DEFAULT_ORG_STORAGE_LIMIT_BYTES
    alert_threshold_pct = sub.get("storage_alert_threshold", 80) if sub else 80

    usage_pct = (total_storage_bytes / max(1, limit_bytes)) * 100

    if usage_pct >= 100:
        alert_status = "Limit Exceeded"
    elif usage_pct >= 90:
        alert_status = "Critical"
    elif usage_pct >= alert_threshold_pct:
        alert_status = "Warning"
    else:
        alert_status = "Normal"

    return {
        "org_id": org_id,
        "name": org_name,
        "type": org_type,
        "db_records_count": db_records_count,
        "db_storage_bytes": db_records_bytes,
        "db_storage_formatted": format_bytes(db_records_bytes),
        "uploads_files_count": len(org_files),
        "uploads_storage_bytes": uploads_bytes,
        "uploads_storage_formatted": format_bytes(uploads_bytes),
        "total_storage_bytes": total_storage_bytes,
        "total_storage_formatted": format_bytes(total_storage_bytes),
        "storage_limit_bytes": limit_bytes,
        "storage_limit_formatted": format_bytes(limit_bytes),
        "usage_percentage": round(usage_pct, 2),
        "alert_threshold_percentage": alert_threshold_pct,
        "alert_status": alert_status,
        "is_alert": usage_pct >= alert_threshold_pct,
        "is_upload_blocked": usage_pct >= 100,
        "files": org_files
    }

@router.get("/storage-overview")
def get_storage_overview(current_user: Dict[str, Any] = Depends(check_super_admin)):
    """Returns platform-wide live storage analytics and metrics."""
    return calculate_platform_storage_metrics()

@router.get("/organization-storage")
def list_organizations_storage(
    type: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(check_super_admin)
):
    """
    Returns organization-wise storage monitoring table.
    Supports filtering by type (hospital, clinic, pharmacy), search, and status.
    """
    hospitals = find_all("hospitals")
    clinics = find_all("clinics")
    pharmacies = find_all("pharmacies")

    org_list = []
    for h in hospitals:
        org_list.append((h["id"], "Hospital", h.get("name", "Hospital"), h.get("area", "Hyderabad"), h.get("city", "Hyderabad"), h.get("updated_at", h.get("created_at"))))
    for c in clinics:
        org_list.append((c["id"], "Clinic", c.get("name", "Clinic"), c.get("area", "Hyderabad"), c.get("city", "Hyderabad"), c.get("updated_at", c.get("created_at"))))
    for p in pharmacies:
        org_list.append((p["id"], "Pharmacy", p.get("name", "Pharmacy"), p.get("area", "Hyderabad"), p.get("city", "Hyderabad"), p.get("updated_at", p.get("created_at"))))

    results = []
    for org_id, org_type, org_name, area, city, last_update in org_list:
        if type and type.lower() != "all" and org_type.lower() != type.lower():
            continue
        if search:
            q = search.lower()
            if q not in org_id.lower() and q not in org_name.lower() and q not in area.lower():
                continue

        storage_data = get_org_storage_usage(org_id, org_type, org_name)
        storage_data["area"] = area
        storage_data["city"] = city
        storage_data["last_update"] = last_update or datetime.now().strftime("%Y-%m-%d %H:%M")

        if status and status.lower() != "all":
            if status.lower() == "warning" and storage_data["alert_status"] != "Warning":
                continue
            elif status.lower() == "critical" and storage_data["alert_status"] != "Critical":
                continue
            elif status.lower() == "exceeded" and storage_data["alert_status"] != "Limit Exceeded":
                continue
            elif status.lower() == "normal" and storage_data["alert_status"] != "Normal":
                continue

        results.append(storage_data)

    return {
        "total_organizations": len(results),
        "organizations": results
    }

@router.get("/organizations/{org_id}/storage-detail")
def get_organization_storage_detail(org_id: str, current_user: Dict[str, Any] = Depends(check_super_admin)):
    """Drilldown view for a specific organization's storage consumption."""
    org = find_one("hospitals", lambda h: h.get("id") == org_id)
    org_type = "Hospital"
    if not org:
        org = find_one("clinics", lambda c: c.get("id") == org_id)
        org_type = "Clinic"
    if not org:
        org = find_one("pharmacies", lambda p: p.get("id") == org_id)
        org_type = "Pharmacy"

    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    return get_org_storage_usage(org_id, org_type, org.get("name", "Organization"))

@router.put("/organizations/{org_id}/storage-limit")
def update_organization_storage_limit(
    org_id: str,
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(check_super_admin)
):
    """Configures storage quota limit and alert threshold for an organization."""
    new_limit_mb = payload.get("storage_limit_mb")
    alert_threshold_pct = payload.get("alert_threshold_percentage", 80)

    if not new_limit_mb or new_limit_mb <= 0:
        raise HTTPException(status_code=400, detail="Invalid storage limit specified (must be > 0 MB)")

    limit_bytes = int(new_limit_mb * 1024 * 1024)

    # Update subscription record
    sub = find_one("subscriptions", lambda s: str(s.get("organization_id", "")) == str(org_id))
    if sub:
        update("subscriptions", sub["id"], {
            "storage_limit_bytes": limit_bytes,
            "storage_limit_mb": new_limit_mb,
            "storage_alert_threshold": alert_threshold_pct,
            "updated_at": datetime.now().isoformat()
        }, id_field="id")
    else:
        # Create subscription entry with storage limit
        insert("subscriptions", {
            "id": f"sub-{org_id}",
            "organization_id": org_id,
            "plan": "custom",
            "storage_limit_bytes": limit_bytes,
            "storage_limit_mb": new_limit_mb,
            "storage_alert_threshold": alert_threshold_pct,
            "status": "active",
            "created_at": datetime.now().isoformat()
        })

    log_audit_event(
        actor=current_user.get("username", "super_admin"),
        action="UPDATE_STORAGE_LIMIT",
        target=org_id,
        category="Storage Governance",
        detail=f"Storage limit updated to {new_limit_mb} MB (threshold {alert_threshold_pct}%) for {org_id}"
    )

    return {
        "message": f"Storage limit updated to {new_limit_mb} MB successfully",
        "org_id": org_id,
        "storage_limit_bytes": limit_bytes,
        "alert_threshold_percentage": alert_threshold_pct
    }

@router.get("/files")
def list_managed_files(
    category: Optional[str] = None,
    org_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(check_super_admin)
):
    """Lists files managed across secure documents and uploads."""
    file_list = []

    # 1. Secure documents
    if SECURE_DOCS_DIR.exists():
        for f in SECURE_DOCS_DIR.iterdir():
            if f.is_file():
                parts = f.name.split("_", 1)
                file_org_id = parts[0] if len(parts) > 1 else "platform"
                ext = f.suffix.lower()
                mime = "application/pdf" if ext == ".pdf" else (f"image/{ext[1:]}" if ext in [".jpg", ".jpeg", ".png", ".webp"] else "application/octet-stream")
                file_list.append({
                    "id": f.name,
                    "filename": f.name,
                    "organization_id": file_org_id,
                    "category": "Accreditation Document",
                    "size_bytes": f.stat().st_size,
                    "size_formatted": format_bytes(f.stat().st_size),
                    "created_at": datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                    "mime_type": mime,
                    "status": "Active"
                })

    # 2. Uploads: organization_logos
    logos_dir = UPLOADS_DIR / "organization_logos"
    if logos_dir.exists():
        for f in logos_dir.iterdir():
            if f.is_file():
                parts = f.name.split("_", 1)
                file_org_id = parts[0] if len(parts) > 1 else "platform"
                ext = f.suffix.lower()
                file_list.append({
                    "id": f.name,
                    "filename": f.name,
                    "organization_id": file_org_id,
                    "category": "Logo",
                    "size_bytes": f.stat().st_size,
                    "size_formatted": format_bytes(f.stat().st_size),
                    "created_at": datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                    "mime_type": f"image/{ext[1:]}" if ext else "image/png",
                    "status": "Active"
                })

    # Filter
    filtered = []
    for f in file_list:
        if category and category.lower() != "all" and f["category"].lower() != category.lower():
            continue
        if org_id and org_id.lower() != "all" and f["organization_id"].lower() != org_id.lower():
            continue
        if search:
            q = search.lower()
            if q not in f["filename"].lower() and q not in f["organization_id"].lower():
                continue
        filtered.append(f)

    return {
        "total_files": len(filtered),
        "files": sorted(filtered, key=lambda x: x["created_at"], reverse=True)
    }

@router.delete("/files/{filename}")
def delete_managed_file(
    filename: str,
    current_user: Dict[str, Any] = Depends(check_super_admin)
):
    """Safely deletes an obsolete file with pre-destructive backup safeguard."""
    # Prevent path traversal
    safe_name = os.path.basename(filename)
    target_path = None
    
    # Check in SECURE_DOCS_DIR
    sec_path = SECURE_DOCS_DIR / safe_name
    if sec_path.exists() and sec_path.is_file():
        target_path = sec_path
    
    # Check in organization_logos
    logo_path = UPLOADS_DIR / "organization_logos" / safe_name
    if not target_path and logo_path.exists() and logo_path.is_file():
        target_path = logo_path

    if not target_path:
        raise HTTPException(status_code=404, detail="File not found or already deleted")

    file_size = target_path.stat().st_size

    # Trigger pre-destructive safeguard backup
    create_pre_destructive_backup(reason=f"del_file_{safe_name[:10]}", actor=current_user.get("username", "super_admin"))

    # Remove file
    target_path.unlink()

    log_audit_event(
        actor=current_user.get("username", "super_admin"),
        action="FILE_DELETED",
        target=safe_name,
        category="Storage Governance",
        detail=f"File {safe_name} ({format_bytes(file_size)}) permanently deleted by super admin"
    )

    return {
        "status": "success",
        "message": f"File {safe_name} deleted successfully",
        "freed_bytes": file_size,
        "freed_formatted": format_bytes(file_size)
    }

@router.get("/backups")
def get_backup_history(current_user: Dict[str, Any] = Depends(check_super_admin)):
    """Returns 7-day rolling backup history with verification status."""
    backups = list_all_backups()
    return {
        "retention_policy": "7-day rolling automated retention (preserves latest valid recovery point)",
        "total_backups": len(backups),
        "backups": backups
    }

@router.post("/backups/create")
def trigger_manual_backup(
    payload: Dict[str, Any] = {},
    current_user: Dict[str, Any] = Depends(check_super_admin)
):
    """Triggers an immediate verified database backup."""
    label = payload.get("label", "manual")
    manifest = create_database_backup(label=label, trigger_actor=current_user.get("username", "super_admin"))
    
    log_audit_event(
        actor=current_user.get("username", "super_admin"),
        action="DATABASE_BACKUP_CREATED",
        target=manifest.get("backup_id", ""),
        category="Database Maintenance",
        detail=f"Created backup {manifest.get('backup_id')} ({manifest.get('total_tables')} tables, {format_bytes(manifest.get('total_bytes', 0))})"
    )

    return {
        "message": "Backup created and verified successfully",
        "backup": manifest
    }

@router.post("/backups/{backup_id}/restore")
def restore_backup(
    backup_id: str,
    current_user: Dict[str, Any] = Depends(check_super_admin)
):
    """Safely restores database from backup with pre-restoration snapshot."""
    try:
        result = restore_database_backup(backup_id, trigger_actor=current_user.get("username", "super_admin"))
        log_audit_event(
            actor=current_user.get("username", "super_admin"),
            action="DATABASE_RESTORED",
            target=backup_id,
            category="Database Maintenance",
            detail=f"Database restored from backup {backup_id}. Safety snapshot created: {result.get('safety_snapshot_id')}",
            severity="warning"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database restoration failed: {str(e)}")

@router.get("/cleanup/preview")
def preview_cleanup(current_user: Dict[str, Any] = Depends(check_super_admin)):
    """Scans for temporary or stale files and previews cleanup potential."""
    stale_files = []
    total_bytes = 0

    # Look for .tmp files in database dir
    for f in DATABASE_DIR.glob("*.tmp"):
        size = f.stat().st_size
        stale_files.append({"path": str(f.name), "category": "Temporary DB Table", "size_bytes": size, "size_formatted": format_bytes(size)})
        total_bytes += size

    # Look for orphan temp files in UPLOADS_DIR
    for f in UPLOADS_DIR.glob("**/*.tmp"):
        size = f.stat().st_size
        stale_files.append({"path": str(f.name), "category": "Temporary Upload Cache", "size_bytes": size, "size_formatted": format_bytes(size)})
        total_bytes += size

    return {
        "stale_files_count": len(stale_files),
        "total_reclaimable_bytes": total_bytes,
        "total_reclaimable_formatted": format_bytes(total_bytes),
        "files": stale_files
    }

@router.post("/cleanup/execute")
def execute_cleanup(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(check_super_admin)
):
    """Executes safe cleanup of temporary files with pre-cleanup backup."""
    if not payload.get("confirm"):
        raise HTTPException(status_code=400, detail="Confirmation required to execute cleanup")

    # Safeguard backup first
    create_pre_destructive_backup(reason="cleanup", actor=current_user.get("username", "super_admin"))

    deleted_count = 0
    reclaimed_bytes = 0

    for f in DATABASE_DIR.glob("*.tmp"):
        try:
            reclaimed_bytes += f.stat().st_size
            f.unlink()
            deleted_count += 1
        except Exception:
            pass

    for f in UPLOADS_DIR.glob("**/*.tmp"):
        try:
            reclaimed_bytes += f.stat().st_size
            f.unlink()
            deleted_count += 1
        except Exception:
            pass

    log_audit_event(
        actor=current_user.get("username", "super_admin"),
        action="SYSTEM_CLEANUP_EXECUTED",
        target="temporary_storage",
        category="Storage Governance",
        detail=f"Cleaned up {deleted_count} temporary files, reclaimed {format_bytes(reclaimed_bytes)}"
    )

    return {
        "status": "success",
        "deleted_count": deleted_count,
        "reclaimed_bytes": reclaimed_bytes,
        "reclaimed_formatted": format_bytes(reclaimed_bytes)
    }

@router.get("/export-csv")
def export_storage_analytics_csv(current_user: Dict[str, Any] = Depends(check_super_admin)):
    """Exports organization storage and telemetry data as a real CSV file."""
    hospitals = find_all("hospitals")
    clinics = find_all("clinics")
    pharmacies = find_all("pharmacies")

    output = io.StringIO()
    writer = csv.writer(output)

    # Write CSV Header
    writer.writerow([
        "Organization ID",
        "Organization Name",
        "Type",
        "Area",
        "City",
        "DB Records Count",
        "DB Storage (Bytes)",
        "Uploads Files Count",
        "Uploads Storage (Bytes)",
        "Total Storage (Bytes)",
        "Storage Limit (Bytes)",
        "Usage Percentage (%)",
        "Alert Status"
    ])

    all_orgs = [(h["id"], "Hospital", h.get("name"), h.get("area"), h.get("city")) for h in hospitals] + \
               [(c["id"], "Clinic", c.get("name"), c.get("area"), c.get("city")) for c in clinics] + \
               [(p["id"], "Pharmacy", p.get("name"), p.get("area"), p.get("city")) for p in pharmacies]

    for org_id, org_type, name, area, city in all_orgs:
        usage = get_org_storage_usage(org_id, org_type, name or "")
        writer.writerow([
            usage["org_id"],
            usage["name"],
            usage["type"],
            area or "Hyderabad",
            city or "Hyderabad",
            usage["db_records_count"],
            usage["db_storage_bytes"],
            usage["uploads_files_count"],
            usage["uploads_storage_bytes"],
            usage["total_storage_bytes"],
            usage["storage_limit_bytes"],
            usage["usage_percentage"],
            usage["alert_status"]
        ])

    output.seek(0)
    filename = f"allconnect_storage_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
