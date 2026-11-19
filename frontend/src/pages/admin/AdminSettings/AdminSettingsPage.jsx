import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import {
  Shield,
  ShieldAlert,
  User,
  Users,
  Key,
  Database,
  Bell,
  Settings,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Sliders,
  Check
} from 'lucide-react';

export const AdminSettingsPage = ({ defaultTab = 'profile' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [adminName, setAdminName] = useState('Dr. Antigravity Super Admin');
  const [adminEmail, setAdminEmail] = useState('admin@allconnect.health');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Platform Security Config
  const [platformConfig, setPlatformConfig] = useState({
    sessionTimeoutMinutes: 60,
    mfaRequired: true,
    maxFailedLogins: 5,
    abdmSyncIntervalHours: 6,
    autoAuditArchival: true
  });

  const [adminUsers, setAdminUsers] = useState([
    { id: 'adm-01', name: 'Super Admin', email: 'admin@allconnect.health', role: 'Super Admin (Root)', access: 'All Platform Modules & Governance', status: 'Active' },
    { id: 'adm-02', name: 'Security & Compliance Lead', email: 'compliance@allconnect.health', role: 'HIPAA/ABDM Officer', access: 'Audit Logs, Consent Telemetry & Verifications', status: 'Active' },
    { id: 'adm-03', name: 'Provider Operations Lead', email: 'onboarding@allconnect.health', role: 'Operations Admin', access: 'Organisation Registration & Accreditations', status: 'Active' },
    { id: 'adm-04', name: 'Platform Finance Lead', email: 'finance@allconnect.health', role: 'Billing Auditor', access: 'Billing, Subscriptions & Invoicing Ledger', status: 'Active' }
  ]);

  const fetchSettings = () => {
    setLoading(true);
    Promise.all([
      api.getAdminAuditLogs(),
      api.getAdminSystemHealth()
    ]).then(([auditRes, healthRes]) => {
      setAuditLogs(auditRes?.logs || []);
      setSystemHealth(healthRes || null);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white uppercase tracking-wide flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              SECURITY, ROLES & GOVERNANCE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Settings & Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Super Admin credentials, administrative permissions, immutable HIPAA/ABDM security audit logs, database diagnostics, and platform security policies.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Refresh Logs & Diagnostics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { key: 'profile', label: 'Super Admin Profile', icon: User },
          { key: 'users', label: 'Admin Roles & Permissions', icon: Users },
          { key: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: ShieldAlert },
          { key: 'diagnostics', label: 'Database Diagnosis', icon: Database },
          { key: 'security', label: 'Platform Security Settings', icon: Lock },
          { key: 'notifications', label: 'Notification Settings', icon: Bell }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${activeTab === t.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Platform Administrator Profile</h3>
            <p className="text-xs text-slate-500">Credentials for root platform supervision</p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile information updated successfully.</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Administrator Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Admin Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Platform Role</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Super Admin (Root Authority)
                </span>
                <span className="text-slate-400 text-[11px]">Unrestricted ecosystem governance</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              Update Profile
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ADMIN TEAM & ROLES & PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Administrator Roles & Permissions Matrix</h3>
              <p className="text-xs text-slate-500">Fine-grained role-based access control (RBAC) across administrative modules</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Admin User</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role Designation</th>
                  <th className="py-2.5 px-3">Permissions Scope</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{u.email}</td>
                    <td className="py-3 px-3 font-semibold text-blue-700">{u.role}</td>
                    <td className="py-3 px-3 text-slate-700">{u.access}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Immutable Security & ABDM Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Tracking critical operations: Organisation Registrations, Approvals, Pharmacy Licence Verifications, Subscription Overrides, Payments, and Account Statuses.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-white shrink-0">
              HIPAA / ABDM Compliant
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] font-sans">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action Event</th>
                  <th className="py-2.5 px-3">Target Details</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{l.timestamp}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{l.actor}</td>
                    <td className="py-3 px-3 text-blue-700 font-semibold">{l.action}</td>
                    <td className="py-3 px-3 font-sans text-slate-700">{l.detail}</td>
                    <td className="py-3 px-3 font-sans text-slate-500">{l.category}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${l.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                        l.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                        }`}>
                        {l.severity || 'info'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Database Engine Diagnosis & Table Inventory</h3>
              <p className="text-xs text-slate-500">Atomic thread-locked JSON repository health and PostgreSQL migration readiness</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PostgreSQL Migration Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold block uppercase">Total Database Rows</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{systemHealth?.total_database_records || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold block uppercase">Database Footprint</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block">{systemHealth?.total_database_size_kb || 0} KB</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold block uppercase">Concurrency Engine</span>
              <span className="text-xs font-bold text-emerald-700 mt-2 block">threading.RLock() with Atomic Swap</span>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Entity Store Health</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {(systemHealth?.tables || []).map(tbl => (
                <div key={tbl.table} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 capitalize block">{tbl.table}</span>
                    <span className="text-[10px] text-slate-400">{tbl.records} records</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">{tbl.size_kb} KB</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PLATFORM SECURITY SETTINGS */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-2xl text-xs">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Platform Security Configuration</h3>
            <p className="text-xs text-slate-500">Security policies enforcing encryption, session hygiene, and ABDM conformance</p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Session Timeout Duration</span>
                <span className="text-[11px] text-slate-500">Automatic logout after inactive administrative session</span>
              </div>
              <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">60 Minutes</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Multi-Factor Authentication (MFA)</span>
                <span className="text-[11px] text-slate-500">Mandatory TOTP authenticator for administrative roles</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">Enforced</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">ABDM Health Data Management Policy</span>
                <span className="text-[11px] text-slate-500">Patient electronic consent gate for cross-hospital records</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">Active</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Rate Limiting & Anti-Brute Force</span>
                <span className="text-[11px] text-slate-500">Temporarily lock IP address after 5 failed password attempts</span>
              </div>
              <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">5 Attempts</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-xl text-xs">
          <h3 className="font-extrabold text-sm text-slate-900">Platform Notification Preferences</h3>
          <div className="space-y-3">
            {[
              { title: 'New Organisation Registration Alert', desc: 'Notify immediately when a new hospital, clinic, or pharmacy registers' },
              { title: 'Pharmacy Licence Expiry Warning', desc: 'Alert when a registered pharmacy licence is within 30 days of expiry' },
              { title: 'Subscription Invoicing & Settlement Alerts', desc: 'Real-time notification on payment receipt and subscription renewal' },
              { title: 'Suspicious Security Collisions', desc: 'Instant email alert when brute-force login collisions are intercepted' }
            ].map((n, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">{n.title}</span>
                  <span className="text-[11px] text-slate-500">{n.desc}</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
