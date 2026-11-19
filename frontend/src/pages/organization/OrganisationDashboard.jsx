import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// Tabs
import { OverviewTab } from './OverviewTab';
import { AppointmentsTab } from './AppointmentsTab';
import { DoctorsTab } from './DoctorsTab';
import { PatientsTab } from './PatientsTab';
import { ServicesPackagesTab } from './ServicesPackagesTab';
import { BillingTab } from './BillingTab';
import { PromotionsTab } from './PromotionsTab';
import { SubscriptionTab } from './SubscriptionTab';
import { ProfileDocumentsTab } from './ProfileDocumentsTab';
import { SettingsTab } from './SettingsTab';

import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Sparkles,
  TrendingUp,
  Tag,
  CreditCard,
  Building2,
  Settings,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Users,
  Clock,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';

export const OrganisationDashboard = ({ orgType = 'hospital' }) => {
  const isHospital = orgType === 'hospital';
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Compute active tab from route
  const basePath = isHospital ? '/dashboard/hospital' : '/dashboard/clinic';

  useEffect(() => {
    const subPath = location.pathname.replace(basePath, '').replace(/^\//, '');
    const firstSegment = subPath.split('/')[0];
    const validTabs = [
      'overview',
      'appointments',
      'queue',
      'doctors',
      'doctor-assignments',
      'doctor-availability',
      'patients',
      'services',
      'packages',
      'billing',
      'promotions',
      'subscription',
      'profile',
      'documents',
      'settings'
    ];

    if (!firstSegment || firstSegment === '') {
      setActiveTab('overview');
    } else if (validTabs.includes(firstSegment)) {
      setActiveTab(firstSegment);
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname, basePath]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = isHospital
        ? await api.getHospitalDashboard()
        : await api.getClinicDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load organization operational data.');
    } finally {
      setLoading(false);
    }
  }, [isHospital]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const targetUrl = tabKey === 'overview' ? basePath : `${basePath}/${tabKey}`;
    navigate(targetUrl);
  };

  const navItems = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'queue', label: 'Live Queue', icon: Clock },
    { key: 'doctors', label: 'Doctors', icon: Stethoscope },
    { key: 'doctor-assignments', label: 'Assignments', icon: UserCheck },
    { key: 'doctor-availability', label: 'Availability', icon: Calendar },
    { key: 'patients', label: 'Patients', icon: Users },
    { key: 'services', label: 'Services', icon: Sparkles },
    { key: 'packages', label: 'Packages', icon: Tag },
    { key: 'billing', label: isHospital ? 'Billing' : 'Collections', icon: TrendingUp },
    { key: 'promotions', label: 'Promotions', icon: Tag },
    { key: 'subscription', label: 'SaaS Plan', icon: CreditCard },
    { key: 'profile', label: isHospital ? 'Hospital Profile' : 'Clinic Profile', icon: Building2 },
    { key: 'documents', label: 'Documents', icon: ShieldCheck },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  // Tab Header Metadata matching Super Admin design system
  const tabMetadata = {
    overview: {
      title: isHospital ? 'Hospital Administrative Console' : 'Outpatient Practice Console',
      description: 'Real-time patient OPD queue, multi-specialist schedules, consultation revenue collections, and clinical compliance.'
    },
    appointments: {
      title: 'Outpatient Appointments Management',
      description: 'Manage outpatient consult schedules, confirmed patient bookings, status transitions, and doctor reassignments.'
    },
    queue: {
      title: 'Live OPD Consultation Queue',
      description: 'Monitor waiting room arrival times, token dispatch, active triage consultations, and patient discharge.'
    },
    doctors: {
      title: isHospital ? 'Medical Specialists & Roster' : 'Clinical Practitioners & Staff',
      description: 'Manage affiliated doctors, Medical Council registration numbers, clinical qualifications, and consultation fees.'
    },
    'doctor-assignments': {
      title: 'Doctor Clinical Assignments',
      description: 'Triage incoming patient appointment bookings and assign to qualified department specialists.'
    },
    'doctor-availability': {
      title: 'OPD Availability & Slot Calendars',
      description: 'Configure doctor OPD working hours, shift timings, slot duration, and token limits.'
    },
    patients: {
      title: 'Registered Patient Directory',
      description: 'View patient records, longitudinal visit history, and privacy-protected digital health records.'
    },
    services: {
      title: 'Clinical Services & Procedures',
      description: 'Manage medical services, diagnostic investigations, operating room packages, and standard pricing.'
    },
    packages: {
      title: 'Preventive Health Checkup Packages',
      description: 'Publish health packages, bundled pathology tests, corporate discounts, and wellness screenings.'
    },
    billing: {
      title: isHospital ? 'Billing, Invoices & Collections' : 'Daily Practice Collections',
      description: 'Track consultation fees, medical receipts, patient settlement status, and department revenue breakdowns.'
    },
    promotions: {
      title: 'Health Packages & Promotions',
      description: 'Create and broadcast verified healthcare offers, preventive discounts, and public campaigns.'
    },
    subscription: {
      title: isHospital ? 'Hospital Enterprise SaaS Subscription' : 'Clinic Practice SaaS Subscription',
      description: 'Manage platform tier, doctor capacity quotas, automated feature access, and subscription renewals.'
    },
    profile: {
      title: isHospital ? 'Hospital Profile & Premises Location' : 'Clinic Profile & Location',
      description: 'Update official hospital identity, emergency trauma hotlines, and interactive premises map location.'
    },
    documents: {
      title: 'Regulatory Documents & Accreditations',
      description: 'Upload and verify Clinical Establishment licenses, pollution control permits, and NABH certifications.'
    },
    settings: {
      title: 'Hospital System & Workstation Settings',
      description: 'Configure 24x7 emergency desk, operational shift hours, notification alerts, and data security.'
    }
  };

  const currentMeta = tabMetadata[activeTab] || tabMetadata.overview;
  const org = isHospital ? data?.hospital : data?.clinic;
  const kpis = data?.kpis || data?.stats || {};

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold">Loading {isHospital ? 'Hospital' : 'Clinic'} Management Dashboard...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">Failed to Load Dashboard</h2>
        <p className="text-xs text-rose-600">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Super Admin Design System - Top Hero Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wide flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              {isHospital ? 'HOSPITAL CLINICAL ADMINISTRATION' : 'OUTPATIENT CLINIC MANAGEMENT'}
            </span>
            <span className="text-xs text-slate-400">• {org?.name || 'Healthcare Facility'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {currentMeta.description}
          </p>
        </div>

        {/* Quick Hospital Telemetry Widget */}
        <div className="flex items-center space-x-3 bg-slate-800/90 px-5 py-3 rounded-2xl border border-slate-700 shadow-inner shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Collections</span>
            <span className="text-xl font-black text-emerald-400">₹{(kpis?.today_collection || 0).toLocaleString()}</span>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Load</span>
            <span className="text-xl font-black text-blue-400">{kpis?.total_appointments_today || 0} Consults</span>
          </div>
          <button
            onClick={fetchDashboardData}
            title="Refresh Telemetry"
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition ml-1"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Tab Switcher Strip (Clean Super Admin Style) */}
      <div className="lg:hidden bg-white rounded-2xl p-2 border border-slate-200/80 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleTabChange(item.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active Tab with Consistent System Styling */}
      {activeTab === 'overview' && (
        <OverviewTab
          orgType={orgType}
          data={data}
          setActiveTab={handleTabChange}
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'appointments' && (
        <AppointmentsTab
          orgType={orgType}
          data={data}
          initialFilter="all"
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'queue' && (
        <AppointmentsTab
          orgType={orgType}
          data={data}
          initialFilter="queue"
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'doctors' && (
        <DoctorsTab
          orgType={orgType}
          data={data}
          initialView="all"
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'doctor-assignments' && (
        <DoctorsTab
          orgType={orgType}
          data={data}
          initialView="assignments"
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'doctor-availability' && (
        <DoctorsTab
          orgType={orgType}
          data={data}
          initialView="availability"
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'patients' && (
        <PatientsTab
          orgType={orgType}
          data={data}
        />
      )}

      {activeTab === 'services' && (
        <ServicesPackagesTab
          orgType={orgType}
          data={data}
          initialSubTab="services"
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'packages' && (
        <ServicesPackagesTab
          orgType={orgType}
          data={data}
          initialSubTab="packages"
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'billing' && (
        <BillingTab
          orgType={orgType}
          data={data}
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'promotions' && (
        <PromotionsTab
          orgType={orgType}
          data={data}
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'subscription' && (
        <SubscriptionTab
          orgType={orgType}
          data={data}
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileDocumentsTab
          orgType={orgType}
          data={data}
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'documents' && (
        <ProfileDocumentsTab
          orgType={orgType}
          data={data}
          onRefresh={fetchDashboardData}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          orgType={orgType}
          data={data}
          onRefresh={fetchDashboardData}
        />
      )}

    </div>
  );
};

export default OrganisationDashboard;
