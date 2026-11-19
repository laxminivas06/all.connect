---
name: performance-optimization
description: >-
  Performance engineering for healthcare applications: Vite bundle splitting,
  JSON lock contention minimization, React render memoization, and API response caching.
---

# Performance Optimization Skill

## Overview
Techniques for maintaining sub-second response times, minimal bundle sizes, and efficient I/O operations across the AllConnect ecosystem.

## Frontend Optimization Techniques
1. **Tree-Shaking Lucide Icons**: Import individual icon primitives rather than wildcards:
   ```javascript
   // Recommended
   import { Activity, Building2 } from 'lucide-react';
   ```
2. **Recharts Rendering Isolation**:
   - Wrap analytics charts inside containers with explicit pixel heights or responsive parent flexboxes (`h-64 w-full`).
   - Use `useMemo` for heavy array transformations before passing data to charts.
3. **Optimistic UI Updates**:
   - Immediately update button states and local arrays upon modal confirmation, followed by background synchronization.

## Backend & Database Optimization Techniques
1. **Per-Table Lock Granularity**:
   - Instead of a single global database lock, use per-table locks in `backend/database/db.py`:
     ```python
     def _get_lock(table_name: str) -> threading.Lock:
         with _global_lock:
             if table_name not in _locks:
                 _locks[table_name] = threading.Lock()
             return _locks[table_name]
     ```
2. **Atomic File Write Buffering**:
   - Write to `.tmp` files and perform atomic OS-level renames to keep disk lock duration under 5 milliseconds per transaction.
3. **Lazy Auto-Seeding**:
   - Seed scripts check if tables already contain data before attempting expensive re-generation.
