import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Dedicated Sub-Page Tabs
import { DoctorOverviewTab } from './DoctorOverviewTab';
import { DoctorAppointmentsTab } from './DoctorAppointmentsTab';
import { DoctorPatientsTab } from './DoctorPatientsTab';
import { DoctorRecordsTab } from './DoctorRecordsTab';
import { DoctorPrescriptionsTab } from './DoctorPrescriptionsTab';
import { DoctorHistoryTab } from './DoctorHistoryTab';
import { DoctorAvailabilityTab } from './DoctorAvailabilityTab';
import { DoctorLeaveTab } from './DoctorLeaveTab';
import { DoctorNotificationsTab } from './DoctorNotificationsTab';
import { DoctorProfileTab } from './DoctorProfileTab';
import { DoctorSettingsTab } from './DoctorSettingsTab';

import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderHeart,
  FileText,
  FileCheck,
  Clock,
  Bell,
  User,
  Settings,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const basePath = '/dashboard/doctor';

  // Synchronize route with activeTab
  useEffect(() => {
    const subPath = location.pathname.replace(basePath, '').replace(/^\//, '');
    const firstSegment = subPath.split('/')[0];
    const validTabs = [
      'overview',
      'appointments',
      'patients',
      'records',
      'prescriptions',
      'history',
      'availability',
      'leave',
      'notifications',
      'profile',
      'settings'
    ];

    if (!firstSegment || firstSegment === '') {
      setActiveTab('overview');
    } else if (validTabs.includes(firstSegment)) {
      setActiveTab(firstSegment);
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const targetUrl = tabKey === 'overview' ? basePath : `${basePath}/${tabKey}`;
    navigate(targetUrl);
  };

  const fetchDoctorData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await api.getDoctorDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
      setError(err.message || 'Failed to load clinical workstation data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorData();
  }, [fetchDoctorData]);

  // Actions
  const handleUpdateAppointmentStatus = async (apptId, newStatus, reason = '') => {
    try {
      await api.updateAppointmentStatus(apptId, {
        status: newStatus,
        cancellation_reason: reason
      });
      await fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to update appointment status');
    }
  };

  const handleApplyLeave = async (leaveData) => {
    const docId = data?.doctor?.id || user?.doctor_id || 'doc-001';
    await api.applyDoctorLeave(docId, leaveData);
    await fetchDoctorData(true);
  };

  const handleCancelLeave = async () => {
    const docId = data?.doctor?.id || user?.doctor_id || 'doc-001';
    await api.cancelDoctorLeave(docId);
    await fetchDoctorData(true);
  };

  const handleSaveAvailability = async (availData) => {
    const docId = data?.doctor?.id || user?.doctor_id || 'doc-001';
    await api.updateDoctorAvailability(docId, availData);
    await fetchDoctorData(true);
  };

  const handleSaveProfile = async (profileData) => {
    const docId = data?.doctor?.id || user?.doctor_id || 'doc-001';
    await api.updateDoctorProfile(docId, profileData);
    await fetchDoctorData(true);
  };

  const handleSavePrescription = async (rxData) => {
    await api.createPrescription(rxData);
    if (rxData.appointment_id) {
      await api.updateAppointmentStatus(rxData.appointment_id, { status: 'Completed' });
    }
    await fetchDoctorData(true);
  };

  const handleToggleOnDuty = async () => {
    const doc = data?.doctor || {};
    const docId = doc.id || user?.doctor_id || 'doc-001';
    if (doc.is_on_leave) {
      await handleCancelLeave();
    } else {
      // Toggle to on leave for today
      const today = new Date().toISOString().split('T')[0];
      await handleApplyLeave({
        start_date: today,
        end_date: today,
        reason: 'Temporary offline / On Leave'
      });
    }
  };

  // Nav Items matching the 11 modules
  const navItems = [
    { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'appointments', label: 'My Appointments', icon: Calendar },
    { key: 'patients', label: 'Patient Management', icon: Users },
    { key: 'records', label: 'Medical Records', icon: FolderHeart },
    { key: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { key: 'history', label: 'Consultation History', icon: FileCheck },
    { key: 'availability', label: 'Doctor Availability', icon: Clock },
    { key: 'leave', label: 'Leave Management', icon: Calendar },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  // Metadata per page matching the Hospital Admin Console design system
  const tabMetadata = {
    overview: {
      title: 'Doctor Clinical Workstation',
      description: 'Real-time outpatient consultation bay, live token dispatch queue, and patient triage metrics.'
    },
    appointments: {
      title: 'Outpatient Appointments & Schedule',
      description: 'Manage confirmed patient visits, triage pending booking requests, and transition consultation statuses.'
    },
    patients: {
      title: 'Patient Directory & Clinical Dossiers',
      description: 'Review longitudinal medical dossiers, past consultation logs, and recorded allergy histories.'
    },
    records: {
      title: 'Diagnostic Reports & Investigation Records',
      description: 'Certified laboratory tests, pathology examinations, and diagnostic imaging documents.'
    },
    prescriptions: {
      title: 'Digital Prescription Generator & Rx Orders',
      description: 'Author, electronically sign, and issue certified digital prescriptions with instant pharmacy routing.'
    },
    history: {
      title: 'Consultation History & Treatment Audit',
      description: 'Comprehensive historical log of treated patients, clinical outcomes, and past consultations.'
    },
    availability: {
      title: 'OPD Shift Hours & Slot Capacities',
      description: 'Configure weekly clinic working days, morning and evening shifts, and daily patient quotas.'
    },
    leave: {
      title: 'Doctor Leave & Vacation Administration',
      description: 'Schedule CME conferences, personal leaves, and medical sabbaticals with automatic patient schedule gating.'
    },
    notifications: {
      title: 'Clinical Alerts & Practice Messages',
      description: 'Real-time practice alerts for new bookings, schedule changes, and urgent patient messages.'
    },
    profile: {
      title: 'Medical Credentials & Doctor Profile',
      description: 'Certified qualifications, State Medical Council registration, OPD consultation fees, and practice bio.'
    },
    settings: {
      title: 'Consultation Suite & Practice Settings',
      description: 'Manage clinic room location, patient queue alerts, and login security credentials.'
    }
  };

  const currentMeta = tabMetadata[activeTab] || tabMetadata.overview;
  const doc = data?.doctor || {};
  const kpis = data?.kpis || {};
  const isOnLeave = Boolean(doc.is_on_leave);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold">Loading Doctor Clinical Console...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">Failed to Load Doctor Console</h2>
        <p className="text-xs text-rose-600">{error}</p>
        <button
          onClick={() => fetchDoctorData()}
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
      {/* ------------------------------------------------------------- */}
      {/* HERO BANNER MATCHING HOSPITAL ADMIN CONSOLE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wide flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              DOCTOR CLINICAL ADMINISTRATION
            </span>
            <span className="text-xs text-slate-400">
              • Dr. {doc.name || user?.name || 'Physician'} ({doc.registration_number || 'TSMC-TS2026'})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {currentMeta.description}
          </p>
        </div>

        {/* Telemetry and Duty Toggle Widget */}
        <div className="flex items-center space-x-3 bg-slate-800/90 px-5 py-3 rounded-2xl border border-slate-700 shadow-inner shrink-0 flex-wrap sm:flex-nowrap gap-y-2">
          {/* Live Duty Status Toggle */}
          <div className="pr-3 border-r border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Availability</span>
            <button
              type="button"
              onClick={handleToggleOnDuty}
              className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                isOnLeave
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              }`}
              title="Click to toggle between On Duty and On Leave"
            >
              <span className={`w-2 h-2 rounded-full ${isOnLeave ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{isOnLeave ? 'On Leave' : 'On Duty'}</span>
            </button>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Load</span>
            <span className="text-xl font-black text-blue-400">{kpis.today_appointments || 0} Consults</span>
          </div>

          <div className="border-l border-slate-700 pl-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">In Waiting</span>
            <span className="text-xl font-black text-purple-400">{kpis.patients_waiting_outside || 0} Outside</span>
          </div>

          <button
            onClick={() => fetchDoctorData(true)}
            title="Refresh Telemetry"
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition ml-1"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE / TABLET HORIZONTAL TAB SWITCHER STRIP */}
      {/* ------------------------------------------------------------- */}
      <div className="lg:hidden bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleTabChange(item.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RENDER INDEPENDENT PAGE FOR THE ACTIVE MODULE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <DoctorOverviewTab
          data={data}
          setActiveTab={handleTabChange}
          onRefresh={() => fetchDoctorData(true)}
          onBeginConsult={(apptId) => handleUpdateAppointmentStatus(apptId, 'In Consultation')}
          onCallNext={(apptId) => handleUpdateAppointmentStatus(apptId, 'Next in Line')}
          onQuickComplete={(apptId) => handleUpdateAppointmentStatus(apptId, 'Completed')}
        />
      )}

      {activeTab === 'appointments' && (
        <DoctorAppointmentsTab
          data={data}
          setActiveTab={handleTabChange}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onRefresh={() => fetchDoctorData(true)}
          onOpenRx={() => handleTabChange('prescriptions')}
        />
      )}

      {activeTab === 'patients' && (
        <DoctorPatientsTab
          data={data}
          onSelectPatient={() => {}}
        />
      )}

      {activeTab === 'records' && (
        <DoctorRecordsTab
          data={data}
        />
      )}

      {activeTab === 'prescriptions' && (
        <DoctorPrescriptionsTab
          data={data}
          onSaveRx={handleSavePrescription}
        />
      )}

      {activeTab === 'history' && (
        <DoctorHistoryTab
          data={data}
        />
      )}

      {activeTab === 'availability' && (
        <DoctorAvailabilityTab
          data={data}
          onSaveSchedule={handleSaveAvailability}
        />
      )}

      {activeTab === 'leave' && (
        <DoctorLeaveTab
          data={data}
          onApplyLeave={handleApplyLeave}
          onCancelLeave={handleCancelLeave}
          onRefresh={() => fetchDoctorData(true)}
        />
      )}

      {activeTab === 'notifications' && (
        <DoctorNotificationsTab
          data={data}
          onRefresh={() => fetchDoctorData(true)}
        />
      )}

      {activeTab === 'profile' && (
        <DoctorProfileTab
          data={data}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {activeTab === 'settings' && (
        <DoctorSettingsTab
          data={data}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
