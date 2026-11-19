import json
import os
import threading
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional
from config import DATABASE_DIR

_locks: Dict[str, threading.Lock] = {}
_global_lock = threading.Lock()

def _get_lock(table_name: str) -> threading.Lock:
    with _global_lock:
        if table_name not in _locks:
            _locks[table_name] = threading.Lock()
        return _locks[table_name]

def _get_file_path(table_name: str) -> Path:
    return DATABASE_DIR / f"{table_name}.json"

def load_table(table_name: str) -> List[Dict[str, Any]]:
    path = _get_file_path(table_name)
    lock = _get_lock(table_name)
    with lock:
        if not path.exists():
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return []
                return json.loads(content)
        except Exception as e:
            print(f"Error loading {table_name}: {e}")
            return []

def save_table(table_name: str, data: List[Dict[str, Any]]) -> bool:
    path = _get_file_path(table_name)
    lock = _get_lock(table_name)
    with lock:
        try:
            temp_path = path.with_suffix(".tmp")
            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            if temp_path.exists():
                if path.exists():
                    os.replace(temp_path, path)
                else:
                    temp_path.rename(path)
            return True
        except Exception as e:
            print(f"Error saving {table_name}: {e}")
            return False

def find_all(table_name: str, filter_fn: Optional[Callable[[Dict[str, Any]], bool]] = None) -> List[Dict[str, Any]]:
    items = load_table(table_name)
    if filter_fn is None:
        return items
    return [item for item in items if filter_fn(item)]

def find_one(table_name: str, filter_fn: Callable[[Dict[str, Any]], bool]) -> Optional[Dict[str, Any]]:
    items = load_table(table_name)
    for item in items:
        if filter_fn(item):
            return item
    return None

def find_by_id(table_name: str, id_value: str, id_field: str = "id") -> Optional[Dict[str, Any]]:
    return find_one(table_name, lambda x: str(x.get(id_field)) == str(id_value))

def insert(table_name: str, record: Dict[str, Any]) -> Dict[str, Any]:
    items = load_table(table_name)
    items.append(record)
    save_table(table_name, items)
    return record

def update(table_name: str, id_value: str, updates: Dict[str, Any], id_field: str = "id") -> Optional[Dict[str, Any]]:
    items = load_table(table_name)
    updated_item = None
    for i, item in enumerate(items):
        if str(item.get(id_field)) == str(id_value):
            items[i] = {**item, **updates}
            updated_item = items[i]
            break
    if updated_item:
        save_table(table_name, items)
    return updated_item

def delete(table_name: str, id_value: str, id_field: str = "id") -> bool:
    items = load_table(table_name)
    initial_len = len(items)
    items = [x for x in items if str(x.get(id_field)) != str(id_value)]
    if len(items) != initial_len:
        save_table(table_name, items)
        return True
    return False
