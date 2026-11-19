import os
import shutil
import json
import hashlib
import zipfile
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from config import BASE_DIR, DATABASE_DIR, UPLOADS_DIR

BACKUPS_DIR = BASE_DIR / "backups"
BACKUPS_DIR.mkdir(parents=True, exist_ok=True)

def calculate_file_sha256(filepath: Path) -> str:
    """Calculate SHA256 checksum of a file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def get_dir_size(path: Path) -> int:
    """Calculate total size of directory in bytes."""
    total = 0
    if not path.exists():
        return 0
    for root, _, files in os.walk(path):
        for f in files:
            fp = Path(root) / f
            try:
                total += fp.stat().st_size
            except OSError:
                pass
    return total

def create_database_backup(label: str = "manual", trigger_actor: str = "super_admin") -> Dict[str, Any]:
    """
    Creates a verified, timestamped backup of all database tables.
    Includes a manifest with table record counts, file sizes, and SHA256 hashes.
    """
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_id = f"backup_{timestamp_str}_{label}"
    backup_folder = BACKUPS_DIR / backup_id
    backup_folder.mkdir(parents=True, exist_ok=True)

    tables_manifest = {}
    total_records = 0
    total_bytes = 0

    # Copy all .json tables from DATABASE_DIR
    for json_file in DATABASE_DIR.glob("*.json"):
        dest_file = backup_folder / json_file.name
        shutil.copy2(json_file, dest_file)
        
        file_size = dest_file.stat().st_size
        file_hash = calculate_file_sha256(dest_file)
        
        record_count = 0
        try:
            with open(dest_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    record_count = len(data)
                elif isinstance(data, dict):
                    record_count = len(data.keys())
        except Exception:
            record_count = 0

        total_records += record_count
        total_bytes += file_size

        tables_manifest[json_file.name] = {
            "size_bytes": file_size,
            "record_count": record_count,
            "sha256": file_hash
        }

    # Verify backup integrity
    verification_passed = True
    verification_errors = []

    for table_name, info in tables_manifest.items():
        table_path = backup_folder / table_name
        if not table_path.exists():
            verification_passed = False
            verification_errors.append(f"Missing file in backup: {table_name}")
            continue
        curr_hash = calculate_file_sha256(table_path)
        if curr_hash != info["sha256"]:
            verification_passed = False
            verification_errors.append(f"Checksum mismatch for table {table_name}")

    manifest_data = {
        "backup_id": backup_id,
        "label": label,
        "trigger_actor": trigger_actor,
        "created_at": datetime.now().isoformat(),
        "created_at_formatted": datetime.now().strftime("%d %b %Y, %I:%M %p"),
        "total_tables": len(tables_manifest),
        "total_records": total_records,
        "total_bytes": total_bytes,
        "verification_status": "verified" if verification_passed else "failed",
        "verification_errors": verification_errors,
        "tables": tables_manifest
    }

    with open(backup_folder / "manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    # Maintain 7-day rolling retention
    enforce_rolling_retention(retention_days=7)

    return manifest_data

def verify_backup_integrity(backup_id: str) -> Tuple[bool, List[str]]:
    """Verify integrity of an existing backup."""
    backup_folder = BACKUPS_DIR / backup_id
    manifest_file = backup_folder / "manifest.json"
    
    if not backup_folder.exists() or not manifest_file.exists():
        return False, ["Backup folder or manifest not found"]

    try:
        with open(manifest_file, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    except Exception as e:
        return False, [f"Manifest is corrupted: {str(e)}"]

    errors = []
    tables = manifest.get("tables", {})
    for table_name, info in tables.items():
        table_path = backup_folder / table_name
        if not table_path.exists():
            errors.append(f"Table file missing: {table_name}")
            continue
        try:
            curr_hash = calculate_file_sha256(table_path)
            if curr_hash != info.get("sha256"):
                errors.append(f"Integrity hash mismatch in {table_name}")
            # Ensure valid JSON
            with open(table_path, "r", encoding="utf-8") as tf:
                json.load(tf)
        except Exception as e:
            errors.append(f"File validation error in {table_name}: {str(e)}")

    return len(errors) == 0, errors

def restore_database_backup(backup_id: str, trigger_actor: str = "super_admin") -> Dict[str, Any]:
    """
    Restores the database from a verified backup.
    Automatically takes a pre-restoration safety snapshot before restoring.
    """
    # 1. Verify target backup integrity first
    is_valid, errors = verify_backup_integrity(backup_id)
    if not is_valid:
        raise ValueError(f"Cannot restore from invalid or corrupted backup: {', '.join(errors)}")

    backup_folder = BACKUPS_DIR / backup_id
    with open(backup_folder / "manifest.json", "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # 2. Create pre-restoration safety snapshot of current state
    safety_snapshot = create_database_backup(label="pre_restore_safety", trigger_actor=trigger_actor)

    # 3. Restore all table JSON files into DATABASE_DIR
    restored_tables = []
    for table_name in manifest.get("tables", {}).keys():
        src_file = backup_folder / table_name
        dest_file = DATABASE_DIR / table_name
        if src_file.exists():
            shutil.copy2(src_file, dest_file)
            restored_tables.append(table_name)

    return {
        "status": "success",
        "message": f"Successfully restored database from backup {backup_id}",
        "restored_from": backup_id,
        "restored_tables_count": len(restored_tables),
        "safety_snapshot_id": safety_snapshot.get("backup_id"),
        "timestamp": datetime.now().isoformat()
    }

def enforce_rolling_retention(retention_days: int = 7) -> List[str]:
    """
    Purges backups older than retention_days, while ALWAYS preserving at least
    the most recent valid backup.
    """
    cutoff_time = datetime.now() - timedelta(days=retention_days)
    all_backups = list_all_backups()
    
    if len(all_backups) <= 1:
        # Never delete the only backup
        return []

    # Sort descending by creation date
    all_backups_sorted = sorted(all_backups, key=lambda b: b.get("created_at", ""), reverse=True)
    most_recent = all_backups_sorted[0]
    
    purged_ids = []
    for b in all_backups_sorted[1:]:
        created_str = b.get("created_at", "")
        try:
            created_dt = datetime.fromisoformat(created_str)
            if created_dt < cutoff_time:
                backup_path = BACKUPS_DIR / b["backup_id"]
                if backup_path.exists():
                    shutil.rmtree(backup_path)
                    purged_ids.append(b["backup_id"])
        except Exception:
            pass

    return purged_ids

def list_all_backups() -> List[Dict[str, Any]]:
    """List all available backups sorted by newest first."""
    backups = []
    if not BACKUPS_DIR.exists():
        return []

    for entry in BACKUPS_DIR.iterdir():
        if entry.is_dir():
            manifest_file = entry / "manifest.json"
            if manifest_file.exists():
                try:
                    with open(manifest_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        data["folder_size_bytes"] = get_dir_size(entry)
                        backups.append(data)
                except Exception:
                    pass
            else:
                # Folder without manifest, calculate raw size
                size = get_dir_size(entry)
                backups.append({
                    "backup_id": entry.name,
                    "label": "unindexed",
                    "created_at": datetime.fromtimestamp(entry.stat().st_mtime).isoformat(),
                    "created_at_formatted": datetime.fromtimestamp(entry.stat().st_mtime).strftime("%d %b %Y, %I:%M %p"),
                    "total_bytes": size,
                    "verification_status": "unverified"
                })

    return sorted(backups, key=lambda x: x.get("created_at", ""), reverse=True)

def create_pre_destructive_backup(reason: str, actor: str = "super_admin") -> Dict[str, Any]:
    """Safeguard helper called before deletions or destructive operations."""
    return create_database_backup(label=f"pre_delete_{reason[:15]}", trigger_actor=actor)
