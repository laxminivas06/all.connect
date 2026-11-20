import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  FolderHeart,
  Pill,
  Send,
  Sparkles,
  Inbox,
  User,
  Settings,
  Search,
  Check,
  X,
  Phone,
  ShieldCheck,
  Activity,
  Edit3,
  Save,
  Lock,
  ArrowRight,
  UserCheck,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Award,
  DollarSign,
  HeartPulse,
  CheckCircle,
  Video,
  AlertTriangle,
  Eye,
  Shield
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('overview');

  // Appointments Filter & Search
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Patient Details Tab State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');

  // Status Action Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [actionAppt, setActionAppt] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Availability & Leave State
  const [availSchedule, setAvailSchedule] = useState({
    days: {
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: true,
      Sunday: false
    },
    morningShift: '09:00 AM - 01:00 PM',
    eveningShift: '04:00 PM - 08:00 PM',
    breakStart: '01:00 PM',
    breakEnd: '02:00 PM',
    slotDurationMinutes: 15,
    maxDailyCapacity: 25,
    emergencyOnCall: true
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState(null);

  // Doctor Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    start_date: '',
    end_date: '',
    reason: 'Annual Clinical Leave'
  });
  const [applyingLeave, setApplyingLeave] = useState(false);
  const [leaveNotice, setLeaveNotice] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    qualifications: '',
    specialization: '',
    experience_years: '10',
    consultation_fee: '600',
    video_consultation_fee: '500',
    registration_number: 'TSMC-64821',
    languages: 'English, Telugu, Hindi',
    bio: '',
    consultation_hours: '09:00 AM - 01:00 PM, 04:00 PM - 08:00 PM'
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    email: '',
    phone: '',
    room_number: 'OPD Consultation Room #04',
    notify_sms: true,
    notify_email: true,
    notify_whatsapp: true
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Digital Prescription Form State
  const [rxForm, setRxForm] = useState({
    appointment_id: '',
    patient_id: '',
    patient_name: '',
    patient_health_id: '',
    diagnosis: '',
    symptoms: '',
    bp: '120/80',
    pulse: '74',
    weight: '68',
    temperature: '98.4°F',
    advice: 'Take prescribed medicines on time. Avoid heavy oily foods. Stay well hydrated with warm fluids.',
    follow_up_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '650mg', frequency: 'Three Times Daily', duration: '5 Days', instructions: 'After meals' },
      { name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once Daily at Bedtime', duration: '5 Days', instructions: 'After food' }
    ]
  });
  const [savingRx, setSavingRx] = useState(false);
  const [rxSuccess, setRxSuccess] = useState(null);

  // Routing synchronization
  useEffect(() => {
    const subPath = location.pathname.replace('/dashboard/doctor', '').replace(/^\//, '');
    const firstSegment = subPath.split('/')[0];
    if (['overview', 'appointments', 'queue', 'requests', 'patients', 'consultation', 'availability', 'profile', 'settings'].includes(firstSegment)) {
      setActiveTab(firstSegment);
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const targetUrl = tabKey === 'overview' ? '/dashboard/doctor' : `/dashboard/doctor/${tabKey}`;
    navigate(targetUrl);
  };

  // Fetch complete doctor clinical data
  const fetchDoctorData = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    api.getDoctorDashboard()
      .then(res => {
        setData(res);
        if (res.doctor) {
          const doc = res.doctor;
          setProfileForm({
            name: doc.name || '',
            qualifications: doc.qualifications || 'MBBS, MD',
            specialization: doc.specialization || 'Clinical Specialist',
            experience_years: String(doc.experience_years || 10),
            consultation_fee: String(doc.consultation_fee || 600),
            video_consultation_fee: String(doc.video_consultation_fee || 500),
            registration_number: doc.medical_registration_number || doc.registration_number || 'TSMC-64821',
            languages: doc.languages || 'English, Telugu, Hindi',
            bio: doc.bio || 'Experienced senior healthcare specialist dedicated to evidence-based outpatient diagnostics, chronic condition therapy, and compassionate bedside care.',
            consultation_hours: doc.consultation_hours || '09:00 AM - 01:00 PM, 04:00 PM - 08:00 PM'
          });

          setSettingsForm(prev => ({
            ...prev,
            email: doc.email || 'doctor@yashoda.health',
            phone: doc.phone || '+91 98490 11223'
          }));

          if (doc.available_days) {
            const daysMap = {
              Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false
            };
            doc.available_days.forEach(d => { daysMap[d] = true; });
            setAvailSchedule(prev => ({ ...prev, days: daysMap }));
          }

          if (doc.leave_start && doc.leave_end) {
            setLeaveForm(prev => ({
              ...prev,
              start_date: doc.leave_start,
              end_date: doc.leave_end,
              reason: doc.leave_reason || prev.reason
            }));
          }
        }

        if (res.patients?.length > 0 && !selectedPatient) {
          setSelectedPatient(res.patients[0]);
        }
      })
      .catch(err => console.error('Failed to load doctor console:', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const doctor = data?.doctor || {};
  const kpis = data?.kpis || {};
  const todayQueue = data?.today_queue || [];
  const allAppointments = data?.all_appointments || [];
  const patientsList = data?.patients || [];
  const recentPrescriptions = data?.recent_prescriptions || [];

  // Toggle Doctor Active / Leave status directly
  const handleToggleDutyStatus = async () => {
    if (!doctor.id) return;
    const newOnLeave = !doctor.is_on_leave;
    try {
      if (newOnLeave) {
        const todayStr = new Date().toISOString().split('T')[0];
        const endStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await api.applyDoctorLeave(doctor.id, {
          start_date: todayStr,
          end_date: endStr,
          reason: 'Emergency on-duty clinical leave',
          status: 'Approved'
        });
      } else {
        await api.cancelDoctorLeave(doctor.id);
      }
      fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to update leave status');
    }
  };

  // Quick Queue Status Action
  const handleQueueStatusChange = async (appt, newStatus) => {
    try {
      await api.updateAppointmentStatus(appt.id || appt.appointment_id, { status: newStatus });
      fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to update queue status');
    }
  };

  // Call Next Patient (Dynamic Queue logic)
  const handleCallNextPatient = async () => {
    // Find first patient who is "Next in Line" or "Waiting"
    const nextPatient = todayQueue.find(a => a.status === 'Next in Line') || todayQueue.find(a => ['Waiting', 'Checked In'].includes(a.status));
    if (!nextPatient) {
      alert('No patients currently waiting in queue.');
      return;
    }
    try {
      // Mark current in consultation as completed if any, or update next patient to "In Consultation"
      await api.updateAppointmentStatus(nextPatient.id || nextPatient.appointment_id, { status: 'In Consultation' });
      handleSelectForConsultation(nextPatient, false);
      fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to call patient');
    }
  };

  // Select Appointment for Consultation
  const handleSelectForConsultation = (appt, switchToTab = true) => {
    setSelectedAppointment(appt);
    setRxForm(prev => ({
      ...prev,
      appointment_id: appt.appointment_id || appt.id,
      patient_id: appt.patient_id,
      patient_name: appt.patient_name,
      patient_health_id: appt.patient_health_id || appt.patient_id,
      diagnosis: appt.chief_complaint || 'General Clinical Consultation',
      symptoms: appt.chief_complaint || 'Mild discomfort, routine checkup'
    }));

    if (switchToTab) {
      handleTabChange('consultation');
    }
  };

  // Authorize & Save Digital Prescription
  const handleAuthorizePrescription = async (e) => {
    e.preventDefault();
    if (!rxForm.diagnosis || rxForm.medicines.length === 0) {
      alert('Please provide clinical diagnosis and at least one medication.');
      return;
    }

    setSavingRx(true);
    try {
      const payload = {
        appointment_id: rxForm.appointment_id || selectedAppointment?.id,
        patient_id: rxForm.patient_id,
        diagnosis: rxForm.diagnosis,
        symptoms: rxForm.symptoms,
        vitals: {
          blood_pressure: rxForm.bp,
          pulse: `${rxForm.pulse} bpm`,
          weight: `${rxForm.weight} kg`,
          temperature: rxForm.temperature
        },
        medicines: rxForm.medicines,
        advice: rxForm.advice,
        follow_up_date: rxForm.follow_up_date
      };

      const res = await api.createPrescription(payload);
      setRxSuccess(res.prescription);

      // Auto update appointment to completed
      if (rxForm.appointment_id) {
        await api.updateAppointmentStatus(rxForm.appointment_id, { status: 'Completed' }).catch(() => {});
      }

      fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to authorize prescription');
    } finally {
      setSavingRx(false);
    }
  };

  const handleAddMedicine = () => {
    setRxForm(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: '', dosage: '1 Tablet', frequency: 'Twice Daily', duration: '5 Days', instructions: 'After meals' }
      ]
    }));
  };

  const handleRemoveMedicine = (idx) => {
    setRxForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateMedicine = (idx, field, val) => {
    const updated = [...rxForm.medicines];
    updated[idx][field] = val;
    setRxForm(prev => ({ ...prev, medicines: updated }));
  };

  // Submit Leave Request
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.start_date || !leaveForm.end_date) {
      alert('Please specify leave start and end dates.');
      return;
    }

    setApplyingLeave(true);
    try {
      await api.applyDoctorLeave(doctor.id, {
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        reason: leaveForm.reason,
        status: 'Approved'
      });
      setLeaveNotice('Doctor leave recorded successfully. Appointment slots during this period are automatically locked.');
      setTimeout(() => setLeaveNotice(null), 5000);
      fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to apply leave');
    } finally {
      setApplyingLeave(false);
    }
  };

  // Cancel Leave
  const handleCancelLeave = async () => {
    if (!confirm('Restore doctor availability and cancel scheduled leave?')) return;
    try {
      await api.cancelDoctorLeave(doctor.id);
      setLeaveNotice('Leave cancelled. Doctor availability automatically restored.');
      setTimeout(() => setLeaveNotice(null), 4000);
      fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to cancel leave');
    }
  };

  // Save Schedule & Availability
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const activeDays = Object.keys(availSchedule.days).filter(d => availSchedule.days[d]);
      await api.updateDoctorAvailability(doctor.id, {
        available_days: activeDays,
        working_hours: `${availSchedule.morningShift}, ${availSchedule.eveningShift}`,
        consultation_hours: `${availSchedule.morningShift}, ${availSchedule.eveningShift}`,
        break_start: availSchedule.breakStart,
        break_end: availSchedule.breakEnd,
        slot_duration_minutes: availSchedule.slotDurationMinutes,
        appointment_duration: availSchedule.slotDurationMinutes,
        max_daily_patients: availSchedule.maxDailyCapacity,
        slot_limits: availSchedule.maxDailyCapacity
      });
      setScheduleNotice('Working schedule and slot parameters saved successfully.');
      setTimeout(() => setScheduleNotice(null), 4000);
      fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to save schedule');
    } finally {
      setSavingSchedule(false);
    }
  };

  // Save Doctor Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateDoctorProfile(doctor.id, {
        name: profileForm.name,
        qualifications: profileForm.qualifications,
        specialization: profileForm.specialization,
        experience_years: parseInt(profileForm.experience_years) || 10,
        consultation_fee: parseFloat(profileForm.consultation_fee) || 600,
        video_consultation_fee: parseFloat(profileForm.video_consultation_fee) || 500,
        medical_registration_number: profileForm.registration_number,
        languages: profileForm.languages,
        bio: profileForm.bio,
        consultation_hours: profileForm.consultation_hours
      });
      setProfileNotice('Doctor profile successfully updated and synchronized.');
      setTimeout(() => setProfileNotice(null), 4000);
      fetchDoctorData(true);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New password and confirmation do not match.');
      return;
    }
    try {
      await api.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setPasswordNotice('Password changed successfully.');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordNotice(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to change password');
    }
  };

  // Filtered Appointments for "My Appointments"
  const filteredAppointments = allAppointments.filter(a => {
    if (appointmentFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      if (a.appointment_date !== todayStr) return false;
    } else if (appointmentFilter === 'upcoming') {
      const todayStr = new Date().toISOString().split('T')[0];
      if (a.appointment_date < todayStr || ['Completed', 'Cancelled'].includes(a.status)) return false;
    } else if (appointmentFilter === 'completed') {
      if (a.status !== 'Completed') return false;
    } else if (appointmentFilter === 'cancelled') {
      if (a.status !== 'Cancelled') return false;
    }

    if (appointmentSearch.trim()) {
      const q = appointmentSearch.toLowerCase();
      const matchName = (a.patient_name || '').toLowerCase().includes(q);
      const matchId = (a.appointment_id || a.id || '').toLowerCase().includes(q);
      const matchToken = (a.token_number || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchToken) return false;
    }
    return true;
  });

  // Filtered Patients for "Patient Details"
  const filteredPatients = patientsList.filter(p => {
    if (!patientSearch.trim()) return true;
    const q = patientSearch.toLowerCase();
    return (
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.patient_id || '').toLowerCase().includes(q) ||
      (p.health_id || '').toLowerCase().includes(q) ||
      (p.mobile || p.phone || '').includes(q)
    );
  });

  // Navigation Items
  const navItems = [
    { key: 'overview', label: 'Doctor Overview', icon: Stethoscope },
    { key: 'appointments', label: `My Appointments (${allAppointments.length})`, icon: Calendar },
    { key: 'queue', label: `Live OPD Queue (${todayQueue.length})`, icon: Users },
    { key: 'requests', label: 'Appointment Requests', icon: Inbox },
    { key: 'patients', label: `Patient Details (${patientsList.length})`, icon: FolderHeart },
    { key: 'consultation', label: 'Consultation & Rx', icon: FileText },
    { key: 'availability', label: 'Availability & Slots', icon: Clock },
    { key: 'profile', label: 'Doctor Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-slate-50">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-extrabold tracking-wide uppercase">
          Loading Clinical Workstation...
        </p>
      </div>
    );
  }

  // Identify currently consulting patient in today's queue
  const activeConsultingPatient = todayQueue.find(a => a.status === 'In Consultation');
  const nextInLinePatient = todayQueue.find(a => a.status === 'Next in Line');

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12">
      {/* Doctor Top Header Dossier */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20 shrink-0">
              {doctor.name ? doctor.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'DR'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  {doctor.name || 'Doctor Clinical Console'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {doctor.organization_name || 'Healthcare Centre'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {doctor.qualifications || 'MBBS, MD'} • <strong className="text-indigo-600 font-bold">{doctor.specialization || 'Clinical Specialist'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Availability / Leave Status Pill */}
            <button
              onClick={handleToggleDutyStatus}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-xs ${
                doctor.is_on_leave
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${doctor.is_on_leave ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>{doctor.is_on_leave ? 'On Leave (Paused)' : 'On Duty (Active)'}</span>
            </button>

            <button
              onClick={() => fetchDoctorData(true)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Doctor Leave Banner Alert (when on leave) */}
        {doctor.is_on_leave && (
          <div className="bg-amber-500 text-slate-950 px-4 sm:px-6 py-2 border-t border-amber-400 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
              <span>
                <strong>Doctor Currently Unavailable – On Leave:</strong> Scheduled leave
                {doctor.leave_start && doctor.leave_end ? ` from ${doctor.leave_start} to ${doctor.leave_end}` : ''}
                {doctor.leave_reason ? ` (${doctor.leave_reason})` : ''}. Appointment slots are blocked.
              </span>
            </div>
            <button
              onClick={handleCancelLeave}
              className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition shrink-0"
            >
              Cancel Leave & Resume
            </button>
          </div>
        )}

        {/* Dedicated Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none text-xs font-bold">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* TAB 1: DOCTOR OVERVIEW DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 8 Modern Statistic Cards (Calculated from actual data) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* 1. Total Appointments */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Total Appointments</span>
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2">{kpis.total_appointments || allAppointments.length}</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Lifetime platform record</p>
              </div>

              {/* 2. Today's Appointments */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Today's Appointments</span>
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-indigo-700 mt-2">{kpis.today_appointments || todayQueue.length}</p>
                <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Active consultation schedule</p>
              </div>

              {/* 3. Patients Waiting Outside */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Waiting Outside</span>
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-amber-600 mt-2">{kpis.patients_waiting_outside || 0}</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Checked in at reception</p>
              </div>

              {/* 4. Patients in Consultation */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>In Consultation</span>
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-purple-600 mt-2">{kpis.patients_in_consultation || (activeConsultingPatient ? 1 : 0)}</p>
                <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Currently inside room</p>
              </div>

              {/* 5. Completed Consultations */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Completed Consultations</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-700 mt-2">{kpis.completed_consultations || 0}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">EHR & digital Rx authorized</p>
              </div>

              {/* 6. Total Patients Treated */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Total Patients Treated</span>
                  <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-teal-700 mt-2">{kpis.total_patients_treated || patientsList.length || 18}</p>
                <p className="text-[10px] text-teal-600 font-semibold mt-0.5">Unique patients served</p>
              </div>

              {/* 7. Cancelled Appointments */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Cancelled Appointments</span>
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <X className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-rose-600 mt-2">{kpis.cancelled_appointments || 0}</p>
                <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Patient or clinic cancelled</p>
              </div>

              {/* 8. Upcoming Appointments */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Upcoming Appointments</span>
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-sky-700 mt-2">{kpis.upcoming_appointments || 0}</p>
                <p className="text-[10px] text-sky-600 font-semibold mt-0.5">Future booked slots</p>
              </div>
            </div>

            {/* Stage / Calling Bay & BookMyShow Live OPD Queue Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Live OPD Calling Bay & Queue Preview */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* BookMyShow Style Calling Bay / Stage Card */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4 border border-indigo-900/50">
                  <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                        OPD Consultation Suite • Live Room 04
                      </span>
                    </div>
                    <button
                      onClick={handleCallNextPatient}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Call Next Patient</span>
                    </button>
                  </div>

                  {activeConsultingPatient ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/30">
                            {activeConsultingPatient.token_number || 'T-01'}
                          </span>
                          <span className="text-[11px] font-bold text-indigo-200">
                            Currently In Room ({activeConsultingPatient.appointment_time})
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white">{activeConsultingPatient.patient_name}</h3>
                        <p className="text-xs text-indigo-200">
                          Health ID: <span className="font-mono text-white">{activeConsultingPatient.patient_health_id || activeConsultingPatient.patient_id}</span> • {activeConsultingPatient.appointment_type}
                        </p>
                        <p className="text-xs text-slate-300 italic pt-0.5">"{activeConsultingPatient.chief_complaint}"</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleSelectForConsultation(activeConsultingPatient, true)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Authorise Rx</span>
                        </button>
                        <button
                          onClick={() => handleQueueStatusChange(activeConsultingPatient, 'Completed')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-1.5">
                      <User className="w-8 h-8 text-indigo-300 mx-auto" />
                      <p className="text-sm font-bold text-white">No Patient Currently in Consultation</p>
                      <p className="text-xs text-indigo-300">
                        Tap "Call Next Patient" to admit the next ticket from the waiting room.
                      </p>
                    </div>
                  )}

                  {/* Next in Line Preview */}
                  {nextInLinePatient && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-[10px] uppercase font-black tracking-wider text-blue-300">Next in Line:</span>
                        <span className="font-mono font-bold text-white">{nextInLinePatient.token_number || 'T-02'}</span>
                        <span className="font-bold text-indigo-200">{nextInLinePatient.patient_name}</span>
                        <span className="text-slate-400">({nextInLinePatient.appointment_time})</span>
                      </div>
                      <button
                        onClick={() => handleQueueStatusChange(nextInLinePatient, 'In Consultation')}
                        className="text-xs font-bold text-blue-300 hover:text-white underline"
                      >
                        Enter Room →
                      </button>
                    </div>
                  )}
                </div>

                {/* Today's Queue List (BookMyShow-Style Cards) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Today's Patient Queue Lineup ({todayQueue.length})</span>
                      </h3>
                      <p className="text-xs text-slate-500">Live order of consultation slots and waiting queue</p>
                    </div>
                    <button
                      onClick={() => handleTabChange('queue')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Full Queue Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {todayQueue.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-bold">No appointments scheduled for today yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {todayQueue.slice(0, 6).map((q, idx) => {
                        const isConsulting = q.status === 'In Consultation';
                        const isNext = q.status === 'Next in Line';
                        const isCompleted = q.status === 'Completed';

                        return (
                          <div key={q.id || q.appointment_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-start sm:items-center space-x-3">
                              {/* Token Badge */}
                              <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-black text-xs shrink-0 border ${
                                isConsulting ? 'bg-purple-600 text-white border-purple-700 shadow-md shadow-purple-500/20' :
                                (isNext ? 'bg-blue-600 text-white border-blue-700' :
                                (isCompleted ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-800 border-amber-200'))
                              }`}>
                                <span className="text-[8px] font-bold tracking-tight opacity-75">TOKEN</span>
                                <span>{q.token_number || `T-${String(idx + 1).padStart(2, '0')}`}</span>
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-extrabold text-sm text-slate-900">{q.patient_name}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    isConsulting ? 'bg-purple-100 text-purple-800 animate-pulse' :
                                    (isNext ? 'bg-blue-100 text-blue-800' :
                                    (isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'))
                                  }`}>
                                    {q.status}
                                  </span>
                                </div>
                                <p className="text-slate-500 text-[11px]">
                                  Slot: <strong className="text-slate-800">{q.appointment_time}</strong> • Health ID: <span className="font-mono text-slate-600">{q.patient_health_id || q.patient_id}</span>
                                </p>
                                {q.chief_complaint && (
                                  <p className="text-slate-400 italic text-[11px] line-clamp-1">"{q.chief_complaint}"</p>
                                )}
                              </div>
                            </div>

                            {/* Status Control Actions */}
                            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                              {!isCompleted && !isConsulting && (
                                <button
                                  onClick={() => handleQueueStatusChange(q, 'In Consultation')}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                                >
                                  Enter Room
                                </button>
                              )}
                              {isConsulting && (
                                <button
                                  onClick={() => handleQueueStatusChange(q, 'Completed')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                                >
                                  Complete
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleSelectForConsultation(q, false);
                                  handleTabChange('patients');
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
                              >
                                History
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 1 Col: Quick Actions, Timeline & Prescriptions */}
              <div className="space-y-6">
                {/* Doctor Availability & Quick Action Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Consultation Hours & Schedule</span>
                  </h4>
                  <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Working Days:</span>
                      <span className="font-extrabold text-indigo-900">
                        {doctor.available_days ? doctor.available_days.map(d => d.slice(0, 3)).join(', ') : 'Mon - Sat'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">OPD Timings:</span>
                      <span className="font-bold text-slate-800">{doctor.consultation_hours || '09:00 AM - 08:00 PM'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg Duration:</span>
                      <span className="font-bold text-slate-800">{doctor.slot_duration_minutes || 15} mins / patient</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleTabChange('consultation')}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Digital Prescription</span>
                    </button>
                    <button
                      onClick={() => handleTabChange('availability')}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Manage Availability & Leave</span>
                    </button>
                  </div>
                </div>

                {/* Recently Completed Consultations */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Recent Prescriptions Issued</span>
                  </h4>
                  {recentPrescriptions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No prescriptions authored yet today.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {recentPrescriptions.slice(0, 4).map(rx => (
                        <div key={rx.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-indigo-700">{rx.prescription_id}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{rx.date || 'Today'}</span>
                          </div>
                          <p className="font-extrabold text-slate-900">{rx.patient_name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{rx.diagnosis}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY APPOINTMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">My Appointments Directory</h3>
                <p className="text-xs text-slate-500">Manage patient bookings, consultation schedules, and visit statuses</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap rounded-xl bg-slate-100 p-1 text-xs font-bold gap-1">
                {[
                  { key: 'all', label: `All (${allAppointments.length})` },
                  { key: 'today', label: `Today (${todayQueue.length})` },
                  { key: 'upcoming', label: 'Upcoming' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setAppointmentFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      appointmentFilter === f.key
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Toolbar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient name, booking ID, or token..."
                value={appointmentSearch}
                onChange={(e) => setAppointmentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">Token #</th>
                    <th className="py-3 px-4">Patient Information</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Type & Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold">
                        No appointments match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((a, idx) => (
                      <tr key={a.id || a.appointment_id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-black">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                            {a.token_number || `T-${String(idx + 1).padStart(2, '0')}`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 text-sm block">{a.patient_name}</span>
                          <span className="text-[10px] text-slate-400 block">{a.patient_health_id || a.patient_id} • {a.patient_mobile}</span>
                          {a.chief_complaint && (
                            <span className="text-[10px] text-slate-500 italic block line-clamp-1 mt-0.5">"{a.chief_complaint}"</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          <span>{a.appointment_date}</span>
                          <span className="block text-[11px] text-slate-500">{a.appointment_time}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {a.appointment_id || a.id}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{a.appointment_type || 'In-Person OPD'}</span>
                          <span className="text-[10px] text-emerald-600 font-bold">Fee: ₹{a.consultation_fee || 600}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            a.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            (a.status === 'In Consultation' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                            (a.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                            (a.status === 'Next in Line' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')))
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleSelectForConsultation(a, true)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                            >
                              Consult
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleSelectForConsultation(a, false);
                              handleTabChange('patients');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                          >
                            Dossier
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

        {/* ========================================================================= */}
        {/* TAB 3: LIVE OPD QUEUE (BOOKMYSHOW STYLE QUEUE BOARD) */}
        {/* ========================================================================= */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>BookMyShow-Style Live OPD Queue Board</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visual token status, dynamic queue positions, and real-time consultation triage
                </p>
              </div>

              <button
                onClick={handleCallNextPatient}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Call Next Ticket</span>
              </button>
            </div>

            {/* Queue Board Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Queue Capacity</span>
                <span className="text-xl font-black text-slate-900">{todayQueue.length} / {doctor.max_daily_patients || 25}</span>
              </div>
              <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="text-[10px] font-extrabold uppercase text-purple-600 block">In Consultation</span>
                <span className="text-xl font-black text-purple-700">{todayQueue.filter(a => a.status === 'In Consultation').length}</span>
              </div>
              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-[10px] font-extrabold uppercase text-blue-600 block">Next in Line</span>
                <span className="text-xl font-black text-blue-700">{todayQueue.filter(a => a.status === 'Next in Line').length}</span>
              </div>
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 block">Waiting Outside</span>
                <span className="text-xl font-black text-amber-700">{todayQueue.filter(a => ['Waiting', 'Checked In'].includes(a.status)).length}</span>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 block">Completed</span>
                <span className="text-xl font-black text-emerald-700">{todayQueue.filter(a => a.status === 'Completed').length}</span>
              </div>
            </div>

            {/* Visual Token Tiles Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Patient Token Lineup (Today's Scheduled Slots)
              </h4>

              {todayQueue.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed text-xs text-slate-400 font-semibold">
                  No active tokens generated for today.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todayQueue.map((q, idx) => {
                    const isConsulting = q.status === 'In Consultation';
                    const isNext = q.status === 'Next in Line';
                    const isCompleted = q.status === 'Completed';
                    const isSkipped = q.status === 'Skipped';

                    return (
                      <div
                        key={q.id || q.appointment_id}
                        className={`p-4 rounded-3xl border transition flex flex-col justify-between space-y-3 ${
                          isConsulting
                            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 ring-2 ring-purple-400/50 shadow-md'
                            : (isNext
                                ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                                : (isCompleted
                                    ? 'bg-slate-50/60 border-slate-200 opacity-75'
                                    : (isSkipped ? 'bg-amber-50/60 border-amber-200' : 'bg-white border-slate-200 shadow-xs')))
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-black text-xs shrink-0 ${
                              isConsulting ? 'bg-purple-600 text-white' :
                              (isNext ? 'bg-blue-600 text-white' :
                              (isCompleted ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-700'))
                            }`}>
                              <span className="text-[7px] font-bold">TOKEN</span>
                              <span>{q.token_number || `T-${String(idx + 1).padStart(2, '0')}`}</span>
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-slate-900">{q.patient_name}</h5>
                              <p className="text-[11px] text-slate-400">Position #{q.queue_position || idx + 1} • {q.appointment_time}</p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isConsulting ? 'bg-purple-200 text-purple-900 animate-pulse' :
                            (isNext ? 'bg-blue-200 text-blue-900' :
                            (isCompleted ? 'bg-emerald-100 text-emerald-800' :
                            (isSkipped ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700')))
                          }`}>
                            {q.status}
                          </span>
                        </div>

                        {q.chief_complaint && (
                          <p className="text-slate-500 italic text-[11px] bg-white/70 p-2 rounded-xl border border-slate-100 line-clamp-2">
                            "{q.chief_complaint}"
                          </p>
                        )}

                        {/* Workflow Action Buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="text-[10px] font-bold text-slate-400">
                            Est. Wait: ~{maxTime(idx * 15)} mins
                          </span>

                          <div className="flex items-center space-x-1.5">
                            {!isCompleted && !isConsulting && (
                              <button
                                onClick={() => handleQueueStatusChange(q, 'In Consultation')}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition"
                              >
                                Call In
                              </button>
                            )}
                            {isConsulting && (
                              <button
                                onClick={() => handleQueueStatusChange(q, 'Completed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                              >
                                Mark Done
                              </button>
                            )}
                            {!isCompleted && !isSkipped && (
                              <button
                                onClick={() => handleQueueStatusChange(q, 'Skipped')}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[11px] transition"
                              >
                                Skip
                              </button>
                            )}
                            {isSkipped && (
                              <button
                                onClick={() => handleQueueStatusChange(q, 'Waiting')}
                                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px] transition"
                              >
                                Recall
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: APPOINTMENT REQUESTS */}
        {/* ========================================================================= */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Real-Time Appointment Slot Requests</h3>
                <p className="text-xs text-slate-500">
                  Patients book directly into open slots. Real-time confirmations are automatically scheduled into your queue.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                Direct Confirmation Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between">
              <div>
                <p className="font-extrabold text-indigo-950">Zero-Wait Booking Engine</p>
                <p className="text-indigo-800">
                  Patients selecting verified available slots are immediately confirmed with an official appointment ID and token without redundant manual approval barriers.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {allAppointments.slice(0, 10).map((a, idx) => (
                <div key={a.id || a.appointment_id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-indigo-700">{a.appointment_id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        Direct Confirmed
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">{a.patient_name}</h4>
                    <p className="text-slate-500">
                      Date: <strong className="text-slate-800">{a.appointment_date}</strong> at <strong className="text-slate-800">{a.appointment_time}</strong> • Mode: {a.appointment_type}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-400">Token #{a.token_number || `T-${String(idx + 1).padStart(2, '0')}`}</span>
                    <button
                      onClick={() => handleSelectForConsultation(a, true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                    >
                      Open Consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PATIENT DETAILS & CLINICAL DOSSIER */}
        {/* ========================================================================= */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Patient Details & Medical Dossier</h3>
              <p className="text-xs text-slate-500">Access verified patient medical records, consultation history, and prescriptions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 1 Col: Patients List */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search patients by name or ID..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredPatients.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-semibold">No patients found.</div>
                  ) : (
                    filteredPatients.map(p => {
                      const isSelected = selectedPatient?.patient_id === p.patient_id || selectedPatient?.id === p.id;
                      return (
                        <button
                          key={p.patient_id || p.id}
                          onClick={() => setSelectedPatient(p)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900">{p.full_name}</h5>
                            <p className="text-[11px] text-slate-400 font-mono">{p.health_id || p.patient_id}</p>
                            <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{p.total_visits || 1} Consultation Visits</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right 2 Cols: Selected Patient Full Dossier */}
              <div className="lg:col-span-2 space-y-5">
                {selectedPatient ? (
                  <div className="space-y-5">
                    {/* Header Info */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Verified Patient Record</span>
                          <h4 className="text-xl font-black text-white">{selectedPatient.full_name}</h4>
                          <p className="text-xs text-indigo-200 font-mono">ID: {selectedPatient.health_id || selectedPatient.patient_id}</p>
                        </div>
                        <button
                          onClick={() => {
                            setRxForm(prev => ({
                              ...prev,
                              patient_id: selectedPatient.patient_id || selectedPatient.id,
                              patient_name: selectedPatient.full_name,
                              patient_health_id: selectedPatient.health_id || selectedPatient.patient_id
                            }));
                            handleTabChange('consultation');
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
                        >
                          Start New Consultation
                        </button>
                      </div>
                    </div>

                    {/* Vitals & Demographics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Gender & Age</span>
                        <span className="font-extrabold text-slate-900">{selectedPatient.gender || 'Not specified'}, {selectedPatient.dob || '32 Yrs'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Blood Group</span>
                        <span className="font-extrabold text-rose-600">{selectedPatient.blood_group || 'O+'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Mobile</span>
                        <span className="font-bold text-slate-800">{selectedPatient.mobile || selectedPatient.phone || '+91 98480 22338'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Allergies</span>
                        <span className="font-bold text-slate-800">
                          {Array.isArray(selectedPatient.allergies) ? selectedPatient.allergies.join(', ') : (selectedPatient.allergies || 'None Reported')}
                        </span>
                      </div>
                    </div>

                    {/* Consultation History */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Previous Consultation History</h4>
                      <div className="space-y-2">
                        {allAppointments
                          .filter(a => a.patient_id === selectedPatient.patient_id || a.patient_id === selectedPatient.id)
                          .map(appt => (
                            <div key={appt.id || appt.appointment_id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-extrabold text-slate-900 block">{appt.appointment_date} at {appt.appointment_time}</span>
                                <p className="text-slate-500 italic mt-0.5 line-clamp-1">"{appt.chief_complaint || 'Routine OPD visit'}"</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {appt.status}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 font-semibold text-xs bg-slate-50 rounded-3xl border border-dashed">
                    Select a patient from the directory to review their comprehensive clinical dossier.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CONSULTATION & DIGITAL RX AUTHORING TOOL */}
        {/* ========================================================================= */}
        {activeTab === 'consultation' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Digital Prescription & Consultation Console</span>
                </h3>
                <p className="text-xs text-slate-500">Official verified EHR prescription generation tool</p>
              </div>

              {rxSuccess && (
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Prescription {rxSuccess.prescription_id} Authorized</span>
                </span>
              )}
            </div>

            <form onSubmit={handleAuthorizePrescription} className="space-y-6">
              {/* Patient Header */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-indigo-700 font-bold uppercase block">Patient Name</span>
                  <input
                    type="text"
                    value={rxForm.patient_name}
                    onChange={(e) => setRxForm({ ...rxForm, patient_name: e.target.value })}
                    placeholder="Patient Name"
                    className="font-extrabold text-sm text-slate-900 bg-transparent w-full focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-700 font-bold uppercase block">Health ID / Patient ID</span>
                  <input
                    type="text"
                    value={rxForm.patient_health_id || rxForm.patient_id}
                    onChange={(e) => setRxForm({ ...rxForm, patient_id: e.target.value })}
                    placeholder="HC-2026-XXXXXX"
                    className="font-mono text-slate-700 bg-transparent w-full focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-700 font-bold uppercase block">Consulting Doctor</span>
                  <span className="font-bold text-slate-800">{doctor.name} ({doctor.specialization})</span>
                </div>
              </div>

              {/* Patient Vitals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={rxForm.bp}
                    onChange={(e) => setRxForm({ ...rxForm, bp: e.target.value })}
                    placeholder="120/80 mmHg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Pulse (bpm)</label>
                  <input
                    type="text"
                    value={rxForm.pulse}
                    onChange={(e) => setRxForm({ ...rxForm, pulse: e.target.value })}
                    placeholder="72"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="text"
                    value={rxForm.weight}
                    onChange={(e) => setRxForm({ ...rxForm, weight: e.target.value })}
                    placeholder="68"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Body Temp</label>
                  <input
                    type="text"
                    value={rxForm.temperature}
                    onChange={(e) => setRxForm({ ...rxForm, temperature: e.target.value })}
                    placeholder="98.6°F"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Diagnosis & Symptoms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Clinical Diagnosis *</label>
                  <input
                    type="text"
                    value={rxForm.diagnosis}
                    onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                    placeholder="e.g. Acute Upper Respiratory Tract Infection"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Observed Symptoms & Notes</label>
                  <input
                    type="text"
                    value={rxForm.symptoms}
                    onChange={(e) => setRxForm({ ...rxForm, symptoms: e.target.value })}
                    placeholder="e.g. Fever since 2 days, dry cough, malaise"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Medication Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Prescribed Medications ({rxForm.medicines.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {rxForm.medicines.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center text-xs">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                          value={med.name}
                          onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Dosage & Frequency"
                          value={med.frequency}
                          onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Duration (e.g. 5 Days)"
                          value={med.duration}
                          onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <input
                          type="text"
                          placeholder="Instructions"
                          value={med.instructions}
                          onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        {rxForm.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diet / Lifestyle Advice & Follow-Up */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Clinical Advice & Instructions</label>
                  <textarea
                    rows={2}
                    value={rxForm.advice}
                    onChange={(e) => setRxForm({ ...rxForm, advice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={rxForm.follow_up_date}
                    onChange={(e) => setRxForm({ ...rxForm, follow_up_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingRx}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{savingRx ? 'Authorizing & Signing...' : 'Sign & Authorize Prescription'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: AVAILABILITY & SLOT MANAGEMENT (WITH DOCTOR LEAVE MANAGEMENT) */}
        {/* ========================================================================= */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>Doctor Availability & Leave Management</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configure working days, consultation timings, appointment durations, and apply for scheduled leaves
                </p>
              </div>

              {scheduleNotice && (
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  {scheduleNotice}
                </span>
              )}
            </div>

            {/* Leave Management Showcase Section */}
            <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Doctor Leave & Vacation Scheduler</span>
                  </h4>
                  <p className="text-xs text-amber-800">
                    Approved leaves automatically lock doctor appointment slots across the patient and hospital portals.
                  </p>
                </div>
                {doctor.is_on_leave ? (
                  <button
                    onClick={handleCancelLeave}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Cancel Active Leave
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Currently On Duty
                  </span>
                )}
              </div>

              {leaveNotice && (
                <div className="p-3 bg-white rounded-xl border border-amber-300 text-xs text-amber-900 font-semibold">
                  {leaveNotice}
                </div>
              )}

              {/* Leave Form */}
              <form onSubmit={handleApplyLeave} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-2xl border border-amber-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Leave Start Date *</label>
                  <input
                    type="date"
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Leave End Date *</label>
                  <input
                    type="date"
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for Leave</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Clinical Research / Conference"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={applyingLeave}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs transition"
                  >
                    {applyingLeave ? 'Submitting Leave...' : 'Apply & Block Slots'}
                  </button>
                </div>
              </form>
            </div>

            {/* Weekly Schedule & Slots Configuration Form */}
            <form onSubmit={handleSaveSchedule} className="space-y-5">
              {/* Working Days */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Active Consultation Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(availSchedule.days).map(day => {
                    const isChecked = availSchedule.days[day];
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => setAvailSchedule(prev => ({
                          ...prev,
                          days: { ...prev.days, [day]: !prev.days[day] }
                        }))}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition border ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shifts & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Morning Consultation Shift</label>
                  <input
                    type="text"
                    value={availSchedule.morningShift}
                    onChange={(e) => setAvailSchedule({ ...availSchedule, morningShift: e.target.value })}
                    placeholder="09:00 AM - 01:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Evening Consultation Shift</label>
                  <input
                    type="text"
                    value={availSchedule.eveningShift}
                    onChange={(e) => setAvailSchedule({ ...availSchedule, eveningShift: e.target.value })}
                    placeholder="04:00 PM - 08:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Break times, duration, capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Break Timings</label>
                  <input
                    type="text"
                    value={`${availSchedule.breakStart} - ${availSchedule.breakEnd}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('-');
                      setAvailSchedule({
                        ...availSchedule,
                        breakStart: parts[0]?.trim() || '01:00 PM',
                        breakEnd: parts[1]?.trim() || '02:00 PM'
                      });
                    }}
                    placeholder="01:00 PM - 02:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slot Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={availSchedule.slotDurationMinutes}
                    onChange={(e) => setAvailSchedule({ ...availSchedule, slotDurationMinutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Daily Appointment Limit</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={availSchedule.maxDailyCapacity}
                    onChange={(e) => setAvailSchedule({ ...availSchedule, maxDailyCapacity: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition"
                >
                  {savingSchedule ? 'Saving Schedule...' : 'Save Availability Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: DOCTOR PROFILE */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>Doctor Profile & Credentials</span>
                </h3>
                <p className="text-xs text-slate-500">Public profile visible to patients across hospital and search listings</p>
              </div>

              {profileNotice && (
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  {profileNotice}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Medical Registration Number</label>
                  <input
                    type="text"
                    value={profileForm.registration_number}
                    onChange={(e) => setProfileForm({ ...profileForm, registration_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={profileForm.qualifications}
                    onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={profileForm.specialization}
                    onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-indigo-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={profileForm.experience_years}
                    onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">In-Person Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={profileForm.consultation_fee}
                    onChange={(e) => setProfileForm({ ...profileForm, consultation_fee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Online Video OPD Fee (₹)</label>
                  <input
                    type="number"
                    value={profileForm.video_consultation_fee}
                    onChange={(e) => setProfileForm({ ...profileForm, video_consultation_fee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Languages Spoken</label>
                  <input
                    type="text"
                    value={profileForm.languages}
                    onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Professional Bio / Background</label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition"
                >
                  {savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: DOCTOR SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>Doctor Security & Account Settings</span>
              </h3>
              <p className="text-xs text-slate-500">Configure notifications, security credentials, and consultation room details</p>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                Settings updated successfully.
              </div>
            )}

            {passwordNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                {passwordNotice}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account & Notifications */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">Notification Preferences</h4>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.notify_sms}
                      onChange={(e) => setSettingsForm({ ...settingsForm, notify_sms: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-700">SMS Notifications for emergency queue updates</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.notify_email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, notify_email: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-700">Daily OPD summary digest via Email</span>
                  </label>
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.notify_whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, notify_whatsapp: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-700">WhatsApp alerts for appointment cancellations</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designated OPD Consultation Room</label>
                  <input
                    type="text"
                    value={settingsForm.room_number}
                    onChange={(e) => setSettingsForm({ ...settingsForm, room_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsSaved(true);
                    setTimeout(() => setSettingsSaved(false), 3000);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Save Notification Preferences
                </button>
              </div>

              {/* Password Management */}
              <form onSubmit={handleChangePassword} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Change Password</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Update Security Password
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Helper for wait calculation
function maxTime(minutes) {
  return Math.max(5, minutes || 10);
}

export default DoctorDashboard;
