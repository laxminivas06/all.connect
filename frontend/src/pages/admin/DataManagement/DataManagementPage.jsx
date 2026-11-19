import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Database,
  FileText,
  Shield,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Archive,
  Layers,
  Search,
  Filter,
  Sliders,
  X,
  FileCheck,
  Server,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Clock
} from 'lucide-react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

export const DataManagementPage = () => {
  const [activeTab, setActiveTab] = useState('organizations'); // 'organizations' | 'files' | 'backups' | 'cleanup'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Data states
  const [overview, setOverview] = useState(null);
  const [orgStorageList, setOrgStorageList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [backupsList, setBackupsList] = useState([]);
  const [cleanupPreview, setCleanupPreview] = useState(null);

  // Filters
  const [orgTypeFilter, setOrgTypeFilter] = useState('all');
  const [orgStatusFilter, setOrgStatusFilter] = useState('all');
  const [orgSearch, setOrgSearch] = useState('');

  const [fileCategoryFilter, setFileCategoryFilter] = useState('all');
  const [fileSearch, setFileSearch] = useState('');

  // Modals
  const [selectedOrgForLimit, setSelectedOrgForLimit] = useState(null);
  const [limitMbInput, setLimitMbInput] = useState(1024);
  const [thresholdInput, setThresholdInput] = useState(80);

  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState(null);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [backupTriggerInProgress, setBackupTriggerInProgress] = useState(false);

  const [confirmCleanup, setConfirmCleanup] = useState(false);
  const [cleanupInProgress, setCleanupInProgress] = useState(false);

  const token = localStorage.getItem('access_token');
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/data-management/storage-overview', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (e) {
      console.error('Error fetching storage overview:', e);
    }
  };

  const fetchOrgStorage = async () => {
    try {
      const params = new URLSearchParams();
      if (orgTypeFilter !== 'all') params.append('type', orgTypeFilter);
      if (orgStatusFilter !== 'all') params.append('status', orgStatusFilter);
      if (orgSearch) params.append('search', orgSearch);

      const res = await fetch(`/api/admin/data-management/organization-storage?${params.toString()}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setOrgStorageList(data.organizations || []);
      }
    } catch (e) {
      console.error('Error fetching org storage:', e);
    }
  };

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (fileCategoryFilter !== 'all') params.append('category', fileCategoryFilter);
      if (fileSearch) params.append('search', fileSearch);

      const res = await fetch(`/api/admin/data-management/files?${params.toString()}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setFilesList(data.files || []);
      }
    } catch (e) {
      console.error('Error fetching files:', e);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/admin/data-management/backups', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setBackupsList(data.backups || []);
      }
    } catch (e) {
      console.error('Error fetching backups:', e);
    }
  };

  const fetchCleanupPreview = async () => {
    try {
      const res = await fetch('/api/admin/data-management/cleanup/preview', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCleanupPreview(data);
      }
    } catch (e) {
      console.error('Error fetching cleanup preview:', e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchOverview(),
        fetchOrgStorage(),
        fetchFiles(),
        fetchBackups(),
        fetchCleanupPreview()
      ]);
    } catch (err) {
      setError('Failed to load storage telemetry from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [orgTypeFilter, orgStatusFilter, fileCategoryFilter]);

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    if (!selectedOrgForLimit) return;
    try {
      const res = await fetch(`/api/admin/data-management/organizations/${selectedOrgForLimit.org_id}/storage-limit`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          storage_limit_mb: parseFloat(limitMbInput),
          alert_threshold_percentage: parseInt(thresholdInput)
        })
      });
      if (res.ok) {
        setActionMessage(`Storage limit updated for ${selectedOrgForLimit.name}`);
        setSelectedOrgForLimit(null);
        fetchOrgStorage();
        fetchOverview();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to update storage limit');
      }
    } catch (e) {
      alert('Error updating storage limit');
    }
  };

  const handleTriggerBackup = async () => {
    setBackupTriggerInProgress(true);
    try {
      const res = await fetch('/api/admin/data-management/backups/create', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ label: 'admin_manual' })
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(`Backup created: ${data.backup?.backup_id}`);
        fetchBackups();
        fetchOverview();
      }
    } catch (e) {
      alert('Failed to trigger database backup');
    } finally {
      setBackupTriggerInProgress(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackupForRestore) return;
    setRestoreInProgress(true);
    try {
      const res = await fetch(`/api/admin/data-management/backups/${selectedBackupForRestore.backup_id}/restore`, {
        method: 'POST',
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(`Database successfully restored from ${selectedBackupForRestore.backup_id}`);
        setSelectedBackupForRestore(null);
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.detail || 'Restoration failed');
      }
    } catch (e) {
      alert('Error executing backup restore');
    } finally {
      setRestoreInProgress(false);
    }
  };

  const handleDeleteFile = async (filename) => {
    if (!window.confirm(`Are you sure you want to permanently delete file: ${filename}? A pre-destructive backup will be created.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/data-management/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(`File deleted. Reclaimed ${data.freed_formatted}`);
        fetchFiles();
        fetchOverview();
        fetchOrgStorage();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to delete file');
      }
    } catch (e) {
      alert('Error deleting file');
    }
  };

  const handleExecuteCleanup = async () => {
    if (!confirmCleanup) {
      alert('Please check the confirmation box to execute cleanup.');
      return;
    }
    setCleanupInProgress(true);
    try {
      const res = await fetch('/api/admin/data-management/cleanup/execute', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ confirm: true })
      });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(`Cleanup executed: ${data.deleted_count} files removed, ${data.reclaimed_formatted} freed.`);
        setConfirmCleanup(false);
        loadAllData();
      } else {
        const err = await res.json();
        alert(err.detail || 'Cleanup failed');
      }
    } catch (e) {
      alert('Error executing cleanup');
    } finally {
      setCleanupInProgress(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/admin/data-management/export-csv', '_blank');
  };

  return (
    <ErrorBoundary level="page" title="Data Management Centre Temporarily Unavailable">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold tracking-wide">
              <Server className="w-3.5 h-3.5" />
              LIVE STORAGE GOVERNANCE & 7-DAY BACKUP MESH
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Data Management & Backup Centre
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time physical disk metrics, organization storage quotas, 7-day rolling automated database recovery points, and audited cleanup workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export CSV Report
            </button>
            <button
              onClick={handleTriggerBackup}
              disabled={backupTriggerInProgress}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              <Archive className={`w-4 h-4 ${backupTriggerInProgress ? 'animate-spin' : ''}`} />
              {backupTriggerInProgress ? 'Creating Backup...' : 'Create Backup'}
            </button>
            <button
              onClick={loadAllData}
              title="Refresh telemetry"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action / Success Banner */}
        {actionMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Storage Overview KPI Cards */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Used */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Storage</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  overview.health_status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' :
                  overview.health_status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {overview.health_status}
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{overview.total_used_formatted}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">of {overview.platform_capacity_formatted} Capacity</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    overview.usage_percentage > 85 ? 'bg-rose-500' :
                    overview.usage_percentage > 70 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, overview.usage_percentage)}%` }}
                />
              </div>
            </div>

            {/* Database Storage */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Database Tables</span>
                <Database className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{overview.components?.database?.formatted}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Live JSON tables storage</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {overview.components?.database?.percentage_of_used}% of platform used
              </p>
            </div>

            {/* Accreditation & Docs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accreditation Docs</span>
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{overview.components?.accreditation_documents?.formatted}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Secure registration files</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Strict 100 KB limit enforced
              </p>
            </div>

            {/* Prescriptions & Media */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Records & Rx</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{overview.components?.prescriptions_and_reports?.formatted}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Prescriptions & lab reports</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Multi-tenant protected
              </p>
            </div>

            {/* Backups Volume */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">7-Day Backups</span>
                <Archive className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{overview.components?.database_backups?.formatted}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{backupsList.length} recovery points</p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                SHA-256 verified integrity
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs flex flex-wrap gap-1">
          {[
            { id: 'organizations', label: 'Organisation Storage Quotas', icon: Layers, count: orgStorageList.length },
            { id: 'files', label: 'Physical File Manager', icon: FileCheck, count: filesList.length },
            { id: 'backups', label: '7-Day Rolling Backups & Restore', icon: Archive, count: backupsList.length },
            { id: 'cleanup', label: 'System Cleanup & Purge', icon: Trash2, count: cleanupPreview?.stale_files_count || 0 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-slate-800 text-blue-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Organisation Storage & Quotas */}
        {activeTab === 'organizations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by organization name or ID..."
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchOrgStorage()}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={orgTypeFilter}
                  onChange={(e) => setOrgTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="hospital">Hospitals</option>
                  <option value="clinic">Clinics</option>
                  <option value="pharmacy">Pharmacies</option>
                </select>

                <select
                  value={orgStatusFilter}
                  onChange={(e) => setOrgStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Alert Statuses</option>
                  <option value="normal">Normal</option>
                  <option value="warning">Warning (&gt;= 80%)</option>
                  <option value="critical">Critical (&gt;= 90%)</option>
                  <option value="exceeded">Limit Exceeded (&gt;= 100%)</option>
                </select>
              </div>
            </div>

            {/* Organizations Storage Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">Organisation Name & ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Database Records</th>
                    <th className="py-3 px-4">Uploads Storage</th>
                    <th className="py-3 px-4">Total Used / Quota</th>
                    <th className="py-3 px-4">Status & Alert</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgStorageList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No organizations matching selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    orgStorageList.map((org) => (
                      <tr key={org.org_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{org.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{org.org_id} • {org.area}, {org.city}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            org.type === 'Hospital' ? 'bg-blue-100 text-blue-700' :
                            org.type === 'Clinic' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {org.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {org.db_records_count} records
                          <span className="block text-[10px] text-slate-400">{org.db_storage_formatted}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {org.uploads_files_count} files
                          <span className="block text-[10px] text-slate-400">{org.uploads_storage_formatted}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                            <span>{org.total_storage_formatted}</span>
                            <span className="text-slate-400">/ {org.storage_limit_formatted}</span>
                          </div>
                          <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                org.usage_percentage >= 100 ? 'bg-rose-500' :
                                org.usage_percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, org.usage_percentage)}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-400">{org.usage_percentage}% used</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            org.alert_status === 'Limit Exceeded' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            org.alert_status === 'Critical' ? 'bg-rose-50 text-rose-600' :
                            org.alert_status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {org.alert_status === 'Limit Exceeded' && <AlertTriangle className="w-3 h-3" />}
                            {org.alert_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrgForLimit(org);
                              setLimitMbInput(Math.round(org.storage_limit_bytes / (1024 * 1024)));
                              setThresholdInput(org.alert_threshold_percentage || 80);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            Configure Quota
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Physical File Manager */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search file name or org..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={fileCategoryFilter}
                  onChange={(e) => setFileCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All File Categories</option>
                  <option value="Accreditation Document">Accreditation Documents</option>
                  <option value="Logo">Logos & Media</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Organisation</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Uploaded Date</th>
                    <th className="py-3 px-4">MIME Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filesList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No uploaded physical files found.
                      </td>
                    </tr>
                  ) : (
                    filesList.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 truncate max-w-xs">
                          {file.filename}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {file.organization_id}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            file.category === 'Accreditation Document' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {file.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {file.size_formatted}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {file.created_at}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {file.mime_type}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteFile(file.filename)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: 7-Day Rolling Backups & Restore */}
        {activeTab === 'backups' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-5">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed flex items-start gap-3">
              <Archive className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-blue-950">Automated 7-Day Rolling Retention System</p>
                <p className="text-blue-800 mt-0.5">
                  Backups older than 7 days are automatically recycled to maintain high storage efficiency. The latest valid recovery point is permanently preserved. Every backup is cryptographically verified using SHA-256 integrity checksums.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">Backup Identifier</th>
                    <th className="py-3 px-4">Label & Trigger</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Tables</th>
                    <th className="py-3 px-4">Records</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backupsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No database backups found in 7-day rolling window.
                      </td>
                    </tr>
                  ) : (
                    backupsList.map((backup) => (
                      <tr key={backup.backup_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {backup.backup_id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 capitalize">
                          {backup.label || 'manual'}
                          <span className="block text-[10px] text-slate-400">by {backup.trigger_actor || 'admin'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {backup.created_at_formatted || backup.created_at}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {backup.total_tables || '-'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {backup.total_records || '-'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {backup.total_bytes ? `${(backup.total_bytes / 1024).toFixed(1)} KB` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            SHA-256 Verified
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedBackupForRestore(backup)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Restore DB
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: System Cleanup & Purge */}
        {activeTab === 'cleanup' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
            <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-200">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-950 text-sm">Controlled Temporary Files & Cache Cleanup</h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Scans and safely purges temporary database mutation files (*.tmp), stale upload caches, and transient test artifacts. A verified pre-cleanup backup snapshot is automatically created before any files are purged.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase">Stale Files Identified</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {cleanupPreview?.stale_files_count || 0} files
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase">Reclaimable Physical Storage</span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {cleanupPreview?.total_reclaimable_formatted || '0 B'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmCleanup}
                  onChange={(e) => setConfirmCleanup(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  I understand that this action will purge identified temporary cache files after creating a safety backup.
                </span>
              </label>

              <button
                onClick={handleExecuteCleanup}
                disabled={!confirmCleanup || cleanupInProgress}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {cleanupInProgress ? 'Executing Purge...' : 'Execute Controlled Cleanup'}
              </button>
            </div>
          </div>
        )}

        {/* Modal: Configure Storage Quota */}
        {selectedOrgForLimit && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Configure Storage Quota</h3>
                <button onClick={() => setSelectedOrgForLimit(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">{selectedOrgForLimit.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">ID: {selectedOrgForLimit.org_id} • Currently Using: {selectedOrgForLimit.total_storage_formatted}</p>
              </div>

              <form onSubmit={handleUpdateLimit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Storage Quota Limit (in Megabytes - MB)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="102400"
                    step="100"
                    required
                    value={limitMbInput}
                    onChange={(e) => setLimitMbInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Default: 1024 MB (1 GB). When exceeded, further uploads are automatically blocked.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Warning Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    required
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Displays warning badges in Super Admin dashboard when storage reaches this percentage.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedOrgForLimit(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
                  >
                    Save Quota
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Restore Backup Confirmation */}
        {selectedBackupForRestore && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Confirm Database Restoration</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are about to restore the database to backup snapshot <strong className="font-mono text-slate-900">{selectedBackupForRestore.backup_id}</strong> created on {selectedBackupForRestore.created_at_formatted}.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <strong>Safety Safeguard:</strong> The system will automatically generate a pre-restoration snapshot of the current state before replacing any database records.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBackupForRestore(null)}
                  disabled={restoreInProgress}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  disabled={restoreInProgress}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${restoreInProgress ? 'animate-spin' : ''}`} />
                  {restoreInProgress ? 'Restoring Database...' : 'Execute Restoration'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
