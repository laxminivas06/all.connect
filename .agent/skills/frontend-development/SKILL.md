---
name: frontend-development
description: >-
  Expert instructions for developing responsive, high-performance healthcare frontend interfaces
  using React, Vite, Tailwind CSS, Lucide icons, and Recharts in the AllConnect ecosystem.
---

# Frontend Development Skill

## Overview
This skill guides the design and implementation of responsive, accessible, commercial-grade frontend interfaces in `frontend/src/` for the six platform roles.

## Core Rules & Architecture
1. **Never Duplicate Components**: Before creating a modal, card, or button, inspect `frontend/src/components/`.
2. **Handle Four Component States**:
   - `loading`: Subtle pulsating skeleton loaders or spinners.
   - `error`: Distinct rose/red alert banners with actionable troubleshooting hints.
   - `empty`: Centered illustration/icon with informative copy and a creation CTA.
   - `success`: Visual confirmation modals or badges displaying generated transaction IDs.
3. **No Non-Functional Buttons**: Never leave empty `onClick={() => {}}` handlers on primary action triggers.
4. **Tailwind Palette Standards**:
   - Primary: Medical Deep Blue (`bg-blue-600`, `hover:bg-blue-700`, `text-blue-900`)
   - Secondary / Primary Care: Medical Teal (`bg-teal-600`, `hover:bg-teal-700`)
   - Neutral & Cards: Soft White (`bg-slate-50`), Pure White Cards (`bg-white border-slate-200/80`)
   - Accent & Pharmacy: Amber / Warm Gold (`bg-amber-600`)
   - Campaigns & Emergency: Rose (`bg-rose-600`)

## Common Implementation Workflows

### 1. Connecting a View to API
```jsx
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export const MyComponent = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMyEndpoint()
      .then(res => setItems(res))
      .catch(err => setError(err.message || 'Failed to fetch items'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-xs animate-pulse">Loading...</div>;
  if (error) return <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center p-8 text-xs text-slate-400">No records found.</div>
      ) : (
        items.map(item => <div key={item.id}>{item.name}</div>)
      )}
    </div>
  );
};
```

### 2. Form Submissions with Loading Indicators
Always bind `disabled={submitting}` to primary action buttons to prevent accidental double-submits.

## Verification Checklist
- [ ] No JSX syntax errors or broken imports.
- [ ] Responsive across mobile (<640px), tablet (640-1024px), and desktop (>1024px).
- [ ] `npm run build` succeeds without compiler warnings or broken chunk references.
