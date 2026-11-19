---
name: react-architecture
description: >-
  Architectural patterns for scalable React applications, state management via Context API,
  role-based routing, layout inheritance, and reusable component design.
---

# React Architecture Skill

## Overview
Defines component hierarchy, state flow, and routing structures across the AllConnect frontend.

## Architecture & Layout Patterns

### 1. Role-Based Route Protection (`App.jsx`)
```jsx
const ProtectedDashboardLayout = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (user.role !== requiredRole && user.role !== 'super_admin') {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={requiredRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
```

### 2. Global State via `AuthContext.jsx`
- Maintains `user`, `token`, `notifications`, `unreadCount`.
- Exposes `login()`, `logout()`, and `loginAs(roleKey)` for rapid persona testing.
- Syncs state changes with `localStorage`.

### 3. Modals and Portal Management
- Modals must be controlled via props (`isOpen`, `onClose`, `onSuccess`).
- Include backdrop blur (`backdrop-blur-sm bg-slate-900/60`).
- Ensure keyboard `Escape` or clicking the close button triggers cleanup.

## Component Reusability Standards
- Isolate domain-specific logic into custom hooks or services (`api.js`).
- Pass callback functions (`onSuccess`) to refresh parent dashboard telemetry without hard page reloads.
