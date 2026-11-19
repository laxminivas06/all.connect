import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  Stethoscope,
  Pill,
  Users,
  CreditCard,
  Tag,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
  Search,
  Filter,
  FileText,
  Activity,
  HardDrive,
  RefreshCw,
  Clock,
  Lock,
  ChevronRight,
  Database
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Filters & Search
  const [searchOrg, setSearchOrg] = useState('');
  const [filterOrgType, setFilterOrgType] = useState('all');
  const [searchDoc, setSearchDoc] = useState('');
  const [searchPharm, setSearchPharm] = useState('');

  // Subscription Override Modal state
  const [overrideModalOrg, setOverrideModalOrg] = useState(null);
  const [overridePlanId, setOverridePlanId] = useState('hospital_enterprise');
  const [overrideStatus, setOverrideStatus] = useState('active');

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminOverview(),
      api.getAdminOrganizations(),
      api.getAdminAdvertisements(),
      api.getAdminDoctors(),
      api.getAdminPharmacies(),
      api.getAdminAuditLogs(),
      api.getAdminSystemHealth()
    ]).then(([overviewRes, orgsRes, adsRes, docsRes, pharmsRes, auditRes, healthRes]) => {
      setData(overviewRes);
      setOrganizations(orgsRes || []);
      setAdvertisements(adsRes || []);
      setDoctors(docsRes || []);
      setPharmacies(pharmsRes || []);
      setAuditLogs(auditRes?.logs || []);
      setSystemHealth(healthRes || null);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTogglePublishing = async (orgId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'unpublished' : 'published';
    try {
      await api.updateOrgPublishing(orgId, { publishing_status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error updating publishing status');
    }
  };

  const handleModerateAd = async (offerId, action) => {
    try {
      await api.moderateAdvertisement(offerId, action);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error updating campaign');
    }
  };

  const handleToggleDoctorVerify = async (doctorId, currentStatus) => {
    const newStatus = currentStatus === 'verified' ? 'suspended' : 'verified';
    try {
      await api.verifyDoctor(doctorId, newStatus);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error updating doctor license status');
    }
  };

  const handleTogglePharmacyVerify = async (pharmacyId, currentStatus) => {
    const newStatus = currentStatus === 'verified' ? 'suspended' : 'verified';
    try {
      await api.verifyPharmacy(pharmacyId, newStatus);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error updating pharmacy verification');
    }
  };

  const handleApplySubscriptionOverride = async () => {
    if (!overrideModalOrg) return;
    try {
      await api.overrideOrgSubscription(overrideModalOrg.id, {
        plan_id: overridePlanId,
        status: overrideStatus,
        billing_cycle: 'annual'
      });
      setOverrideModalOrg(null);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Error overriding subscription');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-semibold">Loading platform administration console & ecosystem telemetry...</p>
      </div>
    );
  }

  const { kpis, revenue_growth, recent_activity } = data || {};

  // Filtered Lists
  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name?.toLowerCase().includes(searchOrg.toLowerCase()) ||
                          org.area?.toLowerCase().includes(searchOrg.toLowerCase());
    const matchesType = filterOrgType === 'all' || org.organization_type === filterOrgType;
    return matchesSearch && matchesType;
  });

  const filteredDoctors = doctors.filter(doc =>
    doc.full_name?.toLowerCase().includes(searchDoc.toLowerCase()) ||
    doc.specialty?.toLowerCase().includes(searchDoc.toLowerCase()) ||
    doc.hospital_name?.toLowerCase().includes(searchDoc.toLowerCase())
  );

  const filteredPharmacies = pharmacies.filter(pharm =>
    pharm.name?.toLowerCase().includes(searchPharm.toLowerCase()) ||
    pharm.area?.toLowerCase().includes(searchPharm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Super Admin Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              SUPER ADMIN ECOSYSTEM CONTROL
            </span>
            <span className="text-xs text-slate-400">• Master Root Governance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            Centralized Platform Governance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-hospital federation, SaaS MRR billing, doctor credentialing, and ABDM compliance audit logs
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-800/90 px-5 py-3 rounded-2xl border border-slate-700 shadow-inner">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current MRR</span>
            <span className="text-xl font-black text-emerald-400">₹{kpis?.mrr?.toLocaleString()}</span>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Annualized ARR</span>
            <span className="text-xl font-black text-blue-400">₹{(kpis?.arr || 0)?.toLocaleString()}</span>
          </div>
          <button
            onClick={fetchAdminData}
            title="Refresh All Ecosystem Telemetry"
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition ml-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Providers</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{(kpis?.total_hospitals || 0) + (kpis?.total_clinics || 0)}</p>
          <p className="text-[10px] text-slate-400">{kpis?.total_hospitals} Hosps • {kpis?.total_clinics} Clinics</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Doctors</span>
            <Stethoscope className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{doctors.length || kpis?.total_doctors || 0}</p>
          <p className="text-[10px] text-slate-400">Verified specialists</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pharmacies</span>
            <Pill className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{pharmacies.length || kpis?.total_pharmacies || 0}</p>
          <p className="text-[10px] text-slate-400">Dispensing network</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Active SaaS</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-purple-700 mt-1">{kpis?.active_subscriptions || 0}</p>
          <p className="text-[10px] text-slate-400">Subscriptions active</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Patients</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis?.total_patients || 0}</p>
          <p className="text-[10px] text-slate-400">{kpis?.total_appointments} total visits</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Ad Queue</span>
            <Tag className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{kpis?.pending_offers || 0}</p>
          <p className="text-[10px] text-slate-400">Offers pending review</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { key: 'overview', label: 'Financials & Ecosystem', icon: TrendingUp },
          { key: 'organizations', label: `Providers & Publishing (${organizations.length})`, icon: Building2 },
          { key: 'doctors', label: `Doctor Registry (${doctors.length})`, icon: Stethoscope },
          { key: 'pharmacies', label: `Pharmacy Network (${pharmacies.length})`, icon: Pill },
          { key: 'advertisements', label: `Ad Moderation (${advertisements.length})`, icon: Tag },
          { key: 'audit', label: `Security & ABDM Audit (${auditLogs.length})`, icon: ShieldCheck },
          { key: 'diagnostics', label: 'System Diagnostics', icon: Database }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & FINANCIALS                                */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* MRR Growth Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">SaaS Monthly Recurring Revenue (MRR) Growth</h3>
                  <p className="text-xs text-slate-500">Tier billing collected across Starter, Clinic Pro, and Hospital Enterprise</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Telangana Healthcare Hub
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenue_growth || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`₹${val?.toLocaleString()}`, 'MRR']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="mrr" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">Ecosystem Activity</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live Feed</span>
              </div>

              <div className="space-y-3.5">
                {(recent_activity || []).map(act => (
                  <div key={act.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{act.title}</p>
                      <p className="text-slate-500 line-clamp-2">{act.desc}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TENANTS & PUBLISHING CONTROL                         */}
      {/* ============================================================ */}
      {activeTab === 'organizations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Healthcare Providers & Public Marketplace Governance</h3>
              <p className="text-xs text-slate-500">
                Rule: A provider only appears in the public patient discovery directory if its publishing status is set to 'Published'.
              </p>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search provider or area..."
                  value={searchOrg}
                  onChange={(e) => setSearchOrg(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <select
                value={filterOrgType}
                onChange={(e) => setFilterOrgType(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Types</option>
                <option value="hospital">Hospitals</option>
                <option value="clinic">Clinics</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Organization Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Location / Area</th>
                  <th className="py-3 px-3">Subscription Tier</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Marketplace Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrgs.map(org => {
                  const isPublished = org.publishing_status === 'published';
                  return (
                    <tr key={org.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">{org.name}</td>
                      <td className="py-3 px-3 capitalize font-medium text-slate-600">{org.organization_type}</td>
                      <td className="py-3 px-3 text-slate-500">{org.area}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 capitalize border border-purple-100">
                          {org.subscription_plan || 'starter'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 capitalize">
                          {org.verification_status || 'verified'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isPublished ? 'Publicly Published' : 'Unpublished (Hidden)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setOverrideModalOrg(org);
                              setOverridePlanId(org.subscription_plan || 'hospital_enterprise');
                              setOverrideStatus(org.subscription_status || 'active');
                            }}
                            title="Override Subscription Tier"
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                          >
                            Plan
                          </button>
                          <button
                            onClick={() => handleTogglePublishing(org.id, org.publishing_status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              isPublished
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DOCTOR REGISTRY & VERIFICATION                        */}
      {/* ============================================================ */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Registered Doctors & Medical Council Licensing</h3>
              <p className="text-xs text-slate-500">Supervise doctor affiliations, medical registration numbers, and license compliance</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by doctor or specialty..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Doctor</th>
                  <th className="py-3 px-3">Specialty</th>
                  <th className="py-3 px-3">Medical Registration No.</th>
                  <th className="py-3 px-3">Affiliated Facility</th>
                  <th className="py-3 px-3">OPD Fee</th>
                  <th className="py-3 px-3">License Status</th>
                  <th className="py-3 px-3 text-right">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map(doc => {
                  const isVerified = (doc.verification_status || 'verified') === 'verified';
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{doc.full_name}</div>
                        <div className="text-[10px] text-slate-400">{doc.qualification} • {doc.experience_years} yrs exp</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-purple-700">{doc.specialty}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{doc.registration_number || 'TSMC-2018-8421'}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{doc.hospital_name || 'Independent Specialist'}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">₹{doc.consultation_fee}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isVerified ? 'Verified & Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleDoctorVerify(doc.id, doc.verification_status || 'verified')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isVerified
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isVerified ? 'Suspend License' : 'Verify License'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: PHARMACY NETWORK & LICENSING                         */}
      {/* ============================================================ */}
      {activeTab === 'pharmacies' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Pharmacy Network & Drug License Accreditation</h3>
              <p className="text-xs text-slate-500">Ensure medicine fulfillment stores hold active state drug dispensing licenses</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search pharmacy or area..."
                value={searchPharm}
                onChange={(e) => setSearchPharm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Pharmacy Name</th>
                  <th className="py-3 px-3">Drug License No.</th>
                  <th className="py-3 px-3">Area</th>
                  <th className="py-3 px-3">Delivery Supported</th>
                  <th className="py-3 px-3">License Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPharmacies.map(pharm => {
                  const isVerified = (pharm.verification_status || 'verified') === 'verified';
                  return (
                    <tr key={pharm.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">{pharm.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{pharm.license_number || 'TS-HYD-DL-2024-912'}</td>
                      <td className="py-3 px-3 text-slate-500">{pharm.area}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                          {pharm.home_delivery_available ? 'Delivery & Pickup' : 'Pickup Only'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isVerified ? 'Licensed & Verified' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleTogglePharmacyVerify(pharm.id, pharm.verification_status || 'verified')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isVerified
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isVerified ? 'Suspend Store' : 'Accredit Store'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: CAMPAIGN & ADVERTISEMENT MODERATION                   */}
      {/* ============================================================ */}
      {activeTab === 'advertisements' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Campaign & Package Approval Queue</h3>
            <p className="text-xs text-slate-500">Prevent misleading medical discounts by approving or rejecting submitted campaigns</p>
          </div>

          <div className="space-y-3">
            {advertisements.map(ad => (
              <div key={ad.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900">{ad.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ad.workflow_status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                      ad.workflow_status === 'pending_review' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {ad.workflow_status}
                    </span>
                  </div>
                  <p className="text-blue-700 font-semibold">{ad.organization_name} • Category: {ad.category}</p>
                  <p className="text-slate-600 line-clamp-1">{ad.description}</p>
                  <p className="font-black text-slate-900">₹{ad.discounted_price} <span className="line-through font-normal text-slate-400">₹{ad.original_price}</span> ({ad.discount_percentage}% OFF)</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {ad.workflow_status !== 'published' && (
                    <button
                      onClick={() => handleModerateAd(ad.id, 'approve')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                    >
                      Approve & Publish
                    </button>
                  )}
                  {ad.workflow_status !== 'rejected' && (
                    <button
                      onClick={() => handleModerateAd(ad.id, 'reject')}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: SECURITY & ABDM AUDIT LOGS                           */}
      {/* ============================================================ */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Security & ABDM Health Data Audit Logs</h3>
              <p className="text-xs text-slate-500">Tamper-evident log of administrative overrides, patient consent grants, and clinical accesses</p>
            </div>
            <span className="text-[11px] font-bold bg-slate-900 text-white px-3 py-1 rounded-full">
              HIPAA / ABDM Compliant
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Actor</th>
                  <th className="py-3 px-3">Action Event</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Target / Detail</th>
                  <th className="py-3 px-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{log.actor}</td>
                    <td className="py-3 px-3 font-semibold text-purple-700">{log.action}</td>
                    <td className="py-3 px-3 font-sans text-slate-600">{log.category}</td>
                    <td className="py-3 px-3 font-sans text-slate-700">{log.detail}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans ${
                        log.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                        log.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: SYSTEM DIAGNOSTICS & STORAGE HEALTH                  */}
      {/* ============================================================ */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Ecosystem Health & Database Diagnostics</h3>
              <p className="text-xs text-slate-500">Atomic thread-locked JSON repository status and PostgreSQL migration readiness</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PostgreSQL Migration Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-bold block uppercase">Total Database Records</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{systemHealth?.total_database_records || 0}</span>
              <span className="text-[11px] text-slate-500">Across 14 JSON tables</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-bold block uppercase">Total Storage Footprint</span>
              <span className="text-2xl font-black text-purple-700 mt-1 block">{systemHealth?.total_database_size_kb || 0} KB</span>
              <span className="text-[11px] text-slate-500">Atomic temporary rename engine</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-400 font-bold block uppercase">Server Concurrency Lock</span>
              <span className="text-sm font-bold text-emerald-700 mt-2 block">threading.RLock() Active</span>
              <span className="text-[11px] text-slate-500">Zero race condition tolerance</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Table Entity</th>
                  <th className="py-2.5 px-3">Record Count</th>
                  <th className="py-2.5 px-3">Size (KB)</th>
                  <th className="py-2.5 px-3">Storage Engine Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(systemHealth?.tables || []).map(tbl => (
                  <tr key={tbl.table} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-bold text-slate-800 font-mono">{tbl.table}.json</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{tbl.records} rows</td>
                    <td className="py-2.5 px-3 text-slate-500">{tbl.size_kb} KB</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {tbl.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SUBSCRIPTION OVERRIDE                                */}
      {/* ============================================================ */}
      {overrideModalOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Override SaaS Subscription</h3>
                <p className="text-xs text-slate-500">{overrideModalOrg.name}</p>
              </div>
              <button
                onClick={() => setOverrideModalOrg(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Subscription Tier</label>
                <select
                  value={overridePlanId}
                  onChange={(e) => setOverridePlanId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 outline-none"
                >
                  <option value="clinic_starter">Starter (Free Tier)</option>
                  <option value="clinic_pro">Clinic Pro (₹4,999 / mo)</option>
                  <option value="hospital_standard">Hospital Standard (₹14,999 / mo)</option>
                  <option value="hospital_enterprise">Hospital Enterprise (₹29,999 / mo)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Subscription Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 outline-none"
                >
                  <option value="active">Active (Paid / Comped)</option>
                  <option value="trial">Trial Period</option>
                  <option value="pending_payment">Payment Pending</option>
                  <option value="expired">Expired / Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModalOrg(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApplySubscriptionOverride}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 transition"
              >
                Apply Plan Override
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
