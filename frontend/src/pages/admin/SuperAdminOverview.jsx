import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
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
  PlusCircle,
  Activity,
  ArrowUpRight,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const SuperAdminOverview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    setLoading(true);
    api.getAdminOverview()
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-semibold">Loading platform administration overview...</p>
      </div>
    );
  }

  const { kpis, revenue_growth, recent_activity, recent_registrations } = data || {};

  const registrationTrends = [
    { month: 'Aug', hospitals: 3, clinics: 4, doctors: 6 },
    { month: 'Sep', hospitals: 4, clinics: 5, doctors: 8 },
    { month: 'Oct', hospitals: 4, clinics: 7, doctors: 11 },
    { month: 'Nov', hospitals: 5, clinics: 8, doctors: 13 },
    { month: 'Dec', hospitals: 5, clinics: 8, doctors: 15 },
    { month: 'Jan', hospitals: kpis?.total_hospitals || 5, clinics: kpis?.total_clinics || 8, doctors: kpis?.total_doctors || 15 }
  ];

  const subDistribution = [
    { name: 'Hospital Enterprise', value: 3, color: '#3b82f6' },
    { name: 'Hospital Standard', value: 2, color: '#6366f1' },
    { name: 'Clinic Pro', value: 4, color: '#0d9488' },
    { name: 'Pharmacy Retail', value: 3, color: '#f59e0b' },
    { name: 'Starter / Free', value: 2, color: '#94a3b8' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              CENTRAL SAAS PLATFORM CONSOLE
            </span>
            <span className="text-xs text-slate-400">• Hyderabad Centralized Mesh</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            Platform Master Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time multi-tenant monitoring: subscriptions, revenue collections, provider accreditations, and platform security.
          </p>
        </div>

        {/* Financial Highlights */}
        <div className="flex items-center space-x-3 bg-slate-800/90 px-5 py-3 rounded-2xl border border-slate-700 shadow-inner">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SaaS MRR</span>
            <span className="text-xl font-black text-emerald-400">₹{kpis?.mrr?.toLocaleString()}</span>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Annualized ARR</span>
            <span className="text-xl font-black text-blue-400">₹{(kpis?.arr || 0)?.toLocaleString()}</span>
          </div>
          <button
            onClick={fetchOverview}
            title="Refresh All Statistics"
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition ml-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          to="/dashboard/admin/register-organisation"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Organisation</span>
        </Link>
        <Link
          to="/dashboard/admin/hospitals"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Hospitals</span>
        </Link>
        <Link
          to="/dashboard/admin/clinics"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <Stethoscope className="w-4 h-4 text-teal-600" />
          <span>Clinics</span>
        </Link>
        <Link
          to="/dashboard/admin/pharmacies"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <Pill className="w-4 h-4 text-amber-600" />
          <span>Pharmacies</span>
        </Link>
        <Link
          to="/dashboard/admin/billing"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Billing & Revenue</span>
        </Link>
        <Link
          to="/dashboard/admin/settings"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
        >
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Security & Audit</span>
        </Link>
      </div>

      {/* CORE PLATFORM MACRO KPIS (PRIMARY FOCUS) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Patients Overall */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Patients Overall</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{kpis?.total_patients || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Auto-registered via patient portal</p>
          <Link to="/dashboard/admin/patients" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-2">
            <span>View directory</span> <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. Total Doctors Overall */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Doctors Overall</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{kpis?.total_doctors || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Managed directly by hospitals & clinics</p>
          <span className="text-xs font-semibold text-slate-400 block mt-2">
            No Super Admin credentials required
          </span>
        </div>

        {/* 3. Total Appointments */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Appointments</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{kpis?.total_appointments || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">In-person & video consultations</p>
          <span className="text-xs font-semibold text-teal-600 block mt-2">
            Across participating network
          </span>
        </div>

        {/* 4. Active Subscriptions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">{kpis?.active_subscriptions || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active platform SaaS licenses</p>
          <Link to="/dashboard/admin/subscriptions" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-2">
            <span>Manage plans</span> <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* SECONDARY PROVIDER KPIS & OPERATIONAL REVENUE */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Registered Hospitals */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Hospitals</span>
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis?.total_hospitals || 0}</p>
          <Link to="/dashboard/admin/hospitals" className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5 mt-1">
            <span>View list</span> <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Registered Clinics (Secondary KPI) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Clinics (Sec.)</span>
            <Stethoscope className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis?.total_clinics || 0}</p>
          <Link to="/dashboard/admin/clinics" className="text-[11px] font-semibold text-teal-600 hover:underline flex items-center gap-0.5 mt-1">
            <span>View list</span> <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Registered Pharmacies */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pharmacies</span>
            <Pill className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{kpis?.total_pharmacies || 0}</p>
          <Link to="/dashboard/admin/pharmacies" className="text-[11px] font-semibold text-amber-600 hover:underline flex items-center gap-0.5 mt-1">
            <span>Licences</span> <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold text-amber-800 uppercase">Pending Review</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{kpis?.pending_verifications || 0}</p>
          <Link to="/dashboard/admin/hospitals/approvals" className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-0.5 mt-1">
            <span>Review</span> <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Expired Subscriptions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Expired Subs</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-700 mt-1">{kpis?.expired_subscriptions || 0}</p>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">Requires renewal</span>
        </div>

        {/* Outstanding Payments */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-bold text-rose-800 uppercase">Outstanding</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-rose-600 mt-1">₹{(kpis?.outstanding_payments_amount || 0)?.toLocaleString()}</p>
          <Link to="/dashboard/admin/billing" className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-0.5 mt-1">
            <span>{kpis?.outstanding_payments || 2} Invoices</span> <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* PLATFORM REVENUE SUMMARY BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-6 border border-emerald-900/40 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Platform Monitization Breakdown
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1">
            Total Subscription Revenue Received: ₹{(kpis?.total_subscription_revenue_received || 387995)?.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Clear separation: Software license income received directly by AllConnect vs. hospital/clinic healthcare transaction GMV (₹{(kpis?.total_consultation_volume || 0)?.toLocaleString()}).
          </p>
        </div>
        <Link
          to="/dashboard/admin/billing"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 shrink-0"
        >
          <span>View Detailed Revenue Reports</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MRR Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">SaaS Recurring Revenue (MRR) Growth</h3>
              <p className="text-xs text-slate-500">Platform subscription fees received from registered hospitals, clinics & pharmacies</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Live Billing
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue_growth || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`₹${val?.toLocaleString()}`, 'SaaS MRR']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Subscription Tiers</h3>
            <p className="text-xs text-slate-500">Distribution across active provider accounts</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {subDistribution.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Registrations & Live Platform Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Registrations</h3>
              <p className="text-xs text-slate-500">Newly onboarded hospitals, clinics, and pharmacies</p>
            </div>
            <Link
              to="/dashboard/admin/register-organisation"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>+ Register New</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-xl">Organisation</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Category / Specialty</th>
                  <th className="px-3 py-2.5">Location</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recent_registrations || [
                  { id: 'hosp-001', name: 'Yashoda Super Speciality Hospital', type: 'Hospital', category: 'Multi-speciality Hospital', location: 'Secunderabad', status: 'verified', date: '2026-01-02' },
                  { id: 'clinic-001', name: 'MedPlus Care Family Clinic', type: 'Clinic', category: 'General Medicine', location: 'Malkajgiri', status: 'verified', date: '2026-01-10' },
                  { id: 'pharm-001', name: 'Apollo Pharmacy - Malkajgiri', type: 'Pharmacy', category: 'Retail Chemist', location: 'Malkajgiri', status: 'verified', date: '2026-01-05' }
                ]).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.id}</span>
                      <span className="truncate max-w-[180px]">{item.name}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.type === 'Hospital' ? 'bg-blue-100 text-blue-800' : item.type === 'Clinic' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 truncate max-w-[150px]">{item.category}</td>
                    <td className="px-3 py-2.5 text-slate-600">{item.location}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px]">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Platform Activity</h3>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">Live</span>
          </div>

          <div className="space-y-3.5">
            {(recent_activity || []).map(act => (
              <div key={act.id} className="flex items-start space-x-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
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
  );
};
