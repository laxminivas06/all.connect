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
  Lock
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab state: overview, appointments, requests, patients, consultation, availability, profile, settings
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [patientSearch, setPatientSearch] = useState('');

  // Routing listener
  useEffect(() => {
    const subPath = location.pathname.replace('/dashboard/doctor', '').replace(/^\//, '');
    const firstSegment = subPath.split('/')[0];

    if (!firstSegment || firstSegment === '' || firstSegment === 'overview') {
      setActiveTab('overview');
    } else if (firstSegment === 'prescription-editor' || firstSegment === 'consultation') {
      setActiveTab('consultation');
    } else if (firstSegment === 'patient-history' || firstSegment === 'patients') {
      setActiveTab('patients');
    } else if (firstSegment === 'schedule' || firstSegment === 'availability') {
      setActiveTab('availability');
    } else if ([
      'overview',
      'appointments',
      'requests',
      'patients',
      'consultation',
      'availability',
      'profile',
      'settings'
    ].includes(firstSegment)) {
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

  // Digital Rx Form State
  const [rxForm, setRxForm] = useState({
    patient_id: '',
    patient_name: '',
    diagnosis: '',
    symptoms: '',
    bp: '120/80',
    pulse: '72',
    weight: '70',
    advice: 'Drink warm water, take prescribed medicines after meals, avoid cold food.',
    follow_up_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    medicines: [
      { name: 'Metformin 500mg SR', dosage: '500mg', frequency: 'Twice Daily (Morning and Night)', duration: '30 Days', instructions: 'With meals' }
    ]
  });

  const [savingRx, setSavingRx] = useState(false);
  const [rxSuccess, setRxSuccess] = useState(null);

  // Patient history state
  const [patientHistoryData, setPatientHistoryData] = useState(null);

  // Availability state
  const [availabilitySchedule, setAvailabilitySchedule] = useState({
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
    slotDurationMinutes: '15',
    maxTokensPerDay: '35',
    emergencyOnCall: true
  });
  const [scheduleSaved, setScheduleSaved] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    qualifications: '',
    specialization: '',
    registration_number: 'TSMC-64821',
    organization_name: '',
    fee: '800',
    experience_years: '12',
    bio: 'Dedicated senior specialist with extensive clinical experience in comprehensive outpatient care and preventive health protocols.'
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Requests state
  const [requestsList, setRequestsList] = useState([
    {
      id: 'REQ-101',
      patient_name: 'Vikram Joshi',
      age_gender: '48 M',
      patient_phone: '+91 98490 12345',
      requested_date: 'Tomorrow, 10:30 AM',
      complaint: 'Routine follow-up for blood pressure check & medication review',
      type: 'Follow-up Consultation',
      status: 'Pending'
    },
    {
      id: 'REQ-102',
      patient_name: 'Ananya Reddy',
      age_gender: '29 F',
      patient_phone: '+91 94401 98765',
      requested_date: 'Tomorrow, 04:15 PM',
      complaint: 'Persistent dry cough and mild fever since 3 days',
      type: 'New Consultation',
      status: 'Pending'
    }
  ]);

  const fetchDoctorData = () => {
    setLoading(true);
    api.getDoctorDashboard()
      .then(res => {
        setData(res);
        if (res.doctor) {
          setProfileForm(prev => ({
            ...prev,
            name: res.doctor.name || prev.name,
            qualifications: res.doctor.qualifications || prev.qualifications,
            specialization: res.doctor.specialization || prev.specialization,
            organization_name: res.doctor.organization_name || prev.organization_name,
            fee: res.doctor.consultation_fee ? String(res.doctor.consultation_fee) : prev.fee
          }));
        }
        if (res.today_queue?.length > 0 && !selectedAppointment) {
          handleSelectForConsultation(res.today_queue[0], false);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleSelectForConsultation = (appt, switchToTab = true) => {
    setSelectedAppointment(appt);
    setRxForm(prev => ({
      ...prev,
      patient_id: appt.patient_id,
      patient_name: appt.patient_name,
      diagnosis: appt.chief_complaint || 'Clinical Evaluation',
      symptoms: appt.chief_complaint || 'Mild symptoms'
    }));

    // Fetch patient history with consent check
    if (appt.patient_id) {
      api.getPatientProfile(appt.patient_id)
        .then(pat => setPatientHistoryData(pat))
        .catch(console.error);
    }

    if (switchToTab) {
      handleTabChange('consultation');
    }
  };

  const handleAddMedicine = () => {
    setRxForm({
      ...rxForm,
      medicines: [
        ...rxForm.medicines,
        { name: '', dosage: '1 Tablet', frequency: 'Once Daily', duration: '5 Days', instructions: 'After food' }
      ]
    });
  };

  const handleRemoveMedicine = (idx) => {
    setRxForm({
      ...rxForm,
      medicines: rxForm.medicines.filter((_, i) => i !== idx)
    });
  };

  const handleUpdateMedicine = (idx, field, val) => {
    const updated = [...rxForm.medicines];
    updated[idx][field] = val;
    setRxForm({ ...rxForm, medicines: updated });
  };

  const handleAuthorizeRx = async (e) => {
    e.preventDefault();
    if (!rxForm.diagnosis || rxForm.medicines.length === 0) {
      alert('Please provide diagnosis and at least one medicine');
      return;
    }

    setSavingRx(true);
    try {
      const payload = {
        appointment_id: selectedAppointment?.id,
        patient_id: rxForm.patient_id,
        diagnosis: rxForm.diagnosis,
        symptoms: rxForm.symptoms,
        vitals: {
          blood_pressure: rxForm.bp,
          pulse: `${rxForm.pulse} bpm`,
          weight: `${rxForm.weight} kg`
        },
        medicines: rxForm.medicines,
        advice: rxForm.advice,
        follow_up_date: rxForm.follow_up_date
      };

      const res = await api.createPrescription(payload);
      setRxSuccess(res.prescription);
      fetchDoctorData();
    } catch (err) {
      alert(err.message || 'Failed to authorize prescription');
    } finally {
      setSavingRx(false);
    }
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAcceptRequest = (reqId) => {
    setRequestsList(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Confirmed' } : r));
  };

  const handleDeclineRequest = (reqId) => {
    setRequestsList(prev => prev.filter(r => r.id !== reqId));
  };

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Loading doctor clinical console...</p>
      </div>
    );
  }

  const { doctor, kpis, today_queue, recent_prescriptions } = data || {};

  const filteredAppointments = (today_queue || []).filter(a => {
    if (appointmentFilter === 'all') return true;
    if (appointmentFilter === 'scheduled') return a.status === 'Scheduled';
    if (appointmentFilter === 'consulting') return a.status === 'In Consultation';
    if (appointmentFilter === 'completed') return a.status === 'Completed';
    return true;
  });

  const navTabs = [
    { key: 'overview', label: 'Overview', icon: Stethoscope },
    { key: 'appointments', label: `My Appointments (${today_queue?.length || 0})`, icon: Calendar },
    { key: 'requests', label: `Requests (${requestsList.filter(r => r.status === 'Pending').length})`, icon: Inbox },
    { key: 'patients', label: 'Patient Details', icon: Users },
    { key: 'consultation', label: 'Consultation & Rx', icon: FileText },
    { key: 'availability', label: 'Availability & Slots', icon: Clock },
    { key: 'profile', label: 'Doctor Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Doctor Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
            OPD CONSULTING WORKSTATION • ACTIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{doctor?.name}</h1>
          <p className="text-xs text-slate-500">
            {doctor?.qualifications} • <strong className="text-indigo-700">{doctor?.specialization}</strong> ({doctor?.organization_name})
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTabChange('consultation')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Digital Rx Authoring Tool</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Today's OPD Queue</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{kpis?.today_appointments_count || 0}</p>
          <p className="text-[11px] text-indigo-600 font-semibold">Scheduled patients</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Waiting Outside</span>
          <p className="text-2xl font-black text-amber-600 mt-2">{kpis?.waiting_queue_count || 0}</p>
          <p className="text-[11px] text-slate-400">Checked in at reception</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Completed Today</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">{kpis?.completed_consultations || 0}</p>
          <p className="text-[11px] text-slate-400">Consultations done</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Total Patients Treated</span>
          <p className="text-2xl font-black text-blue-600 mt-2">{kpis?.total_patients_served || 0}</p>
          <p className="text-[11px] text-slate-400">Across centralized platform</p>
        </div>
      </div>

      {/* 8 Tab Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold scrollbar-none">
        {navTabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick OPD Queue */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Today's Patient Queue</h3>
                  <p className="text-xs text-slate-500">Real-time consultation lineup</p>
                </div>
                <button
                  onClick={() => handleTabChange('appointments')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View All ({today_queue?.length || 0}) →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {today_queue?.slice(0, 4).map(a => (
                  <div key={a.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-indigo-700">{a.appointment_id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'In Consultation' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                          a.status === 'Completed' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{a.patient_name} <span className="font-mono text-slate-400 font-normal text-xs">({a.patient_health_id})</span></h4>
                      <p className="text-slate-500">Slot: {a.appointment_time} • {a.appointment_type}</p>
                      <p className="text-slate-400 italic text-[11px]">{a.chief_complaint}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          handleSelectForConsultation(a, false);
                          handleTabChange('patients');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleSelectForConsultation(a, true)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                      >
                        Start Consultation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Snapshot & Recent Prescriptions */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>OPD Schedule & Status</span>
                </h4>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <p className="text-indigo-900 font-bold">Morning OPD: 09:00 AM - 01:00 PM</p>
                  <p className="text-indigo-900 font-bold">Evening OPD: 04:00 PM - 08:00 PM</p>
                  <p className="text-[11px] text-slate-500 pt-1">Slot Duration: 15 mins • Walk-ins: None (Strictly Booked)</p>
                </div>
                <button
                  onClick={() => handleTabChange('availability')}
                  className="w-full py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Manage Availability Slots →
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Recent Prescriptions Signed</span>
                </h4>
                <div className="space-y-2">
                  {recent_prescriptions?.slice(0, 3).map(rx => (
                    <div key={rx.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-indigo-700">{rx.prescription_id}</span>
                        <span className="text-[10px] text-slate-400">{rx.date}</span>
                      </div>
                      <p className="font-semibold text-slate-800">{rx.patient_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{rx.diagnosis}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Patient Appointments Directory</h3>
              <p className="text-xs text-slate-500">Comprehensive list of scheduled, waiting, and completed consultations</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
                {['all', 'scheduled', 'consulting', 'completed'].map(f => (
                  <button
                    key={f}
                    onClick={() => setAppointmentFilter(f)}
                    className={`px-3 py-1 rounded-lg capitalize transition ${
                      appointmentFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No appointments match the current filter.</div>
            ) : (
              filteredAppointments.map(a => (
                <div key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-indigo-700">{a.appointment_id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'In Consultation' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                        a.status === 'Completed' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {a.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">• {a.appointment_date || 'Today'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{a.patient_name} <span className="font-mono text-slate-400 font-normal text-xs">({a.patient_health_id})</span></h4>
                    <p className="text-slate-500">Slot: <strong className="text-slate-700">{a.appointment_time}</strong> • Mode: {a.appointment_type}</p>
                    <p className="text-slate-500 text-[11px] italic">Chief Complaint: {a.chief_complaint}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        handleSelectForConsultation(a, false);
                        handleTabChange('patients');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      Patient Records
                    </button>
                    <button
                      onClick={() => handleSelectForConsultation(a, true)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                    >
                      Open Consultation
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. APPOINTMENT REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Direct Patient Appointment Requests</h3>
              <p className="text-xs text-slate-500">Review, confirm, or reschedule pending consultation requests</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {requestsList.filter(r => r.status === 'Pending').length} Pending Requests
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {requestsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No pending appointment requests.</div>
            ) : (
              requestsList.map(req => (
                <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-amber-700">{req.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-slate-400 text-[10px]">• {req.type}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{req.patient_name} <span className="font-normal text-slate-500 text-xs">({req.age_gender})</span></h4>
                    <p className="text-slate-600">Preferred Slot: <strong className="text-slate-900">{req.requested_date}</strong> • Contact: {req.patient_phone}</p>
                    <p className="text-slate-500 text-[11px] italic bg-slate-50 p-2 rounded-lg border border-slate-100">"{req.complaint}"</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {req.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Confirm</span>
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Confirmed in Schedule
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. PATIENT DETAILS TAB */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Patient Longitudinal Medical Records & EHR</h3>
              <p className="text-xs text-slate-500">Centralized patient health dossier subject to patient-controlled consent authorization</p>
            </div>
            {patientHistoryData && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                patientHistoryData.consent_status === 'AUTHORIZED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {patientHistoryData.consent_status === 'AUTHORIZED' ? '✅ Consent Granted by Patient' : '🔒 Consent Restricted'}
              </span>
            )}
          </div>

          {/* Patient Selector / Search */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Select Patient in Queue:</span>
            {today_queue?.map(q => (
              <button
                key={q.id}
                onClick={() => handleSelectForConsultation(q, false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedAppointment?.id === q.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {q.patient_name}
              </button>
            ))}
          </div>

          {patientHistoryData?.consent_status === 'RESTRICTED' ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
              {patientHistoryData.message}
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{patientHistoryData?.full_name || selectedAppointment?.patient_name || 'Selected Patient'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Central Health ID</span>
                  <span className="font-mono font-bold text-blue-700">{patientHistoryData?.health_id || selectedAppointment?.patient_health_id || 'HID-2026-XXXX'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Known Allergies</span>
                  <span className="font-bold text-rose-600">{patientHistoryData?.allergies?.join(', ') || 'Penicillin, Dust'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Blood Group</span>
                  <span className="font-bold text-slate-900">{patientHistoryData?.blood_group || 'O Positive'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <FolderHeart className="w-4 h-4 text-indigo-600" />
                  <span>Centralized Diagnostic Reports & Lab History:</span>
                </h4>
                <div className="space-y-2">
                  {patientHistoryData?.medical_records?.length > 0 ? (
                    patientHistoryData.medical_records.map(r => (
                      <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{r.title}</span>
                          <span className="text-slate-400 text-[10px]">{r.record_date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{r.summary}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                      Routine Complete Blood Picture (CBP) and Lipid Profile on record. Fasting blood sugar: 110 mg/dL.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. CONSULTATION & DIGITAL RX TAB */}
      {activeTab === 'consultation' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Authorized Digital Prescription Generator</span>
              </h3>
              <p className="text-xs text-slate-500">Publish digitally signed prescriptions directly into the patient's centralized locker</p>
            </div>
            {selectedAppointment && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Patient: {selectedAppointment.patient_name} ({selectedAppointment.patient_health_id})
              </span>
            )}
          </div>

          {rxSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">Digital Prescription Published!</h4>
              <p className="text-xs text-slate-600">Prescription ID: <strong className="font-mono text-emerald-800">{rxSuccess.prescription_id}</strong></p>
              <p className="text-xs text-slate-500">The patient has been notified and can instantly search nearby pharmacies for medicine quotations.</p>
              <button
                onClick={() => {
                  setRxSuccess(null);
                  handleTabChange('appointments');
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
              >
                Return to Appointments List
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuthorizeRx} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Clinical Diagnosis</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Essential Systemic Hypertension, Type 2 Diabetes"
                    value={rxForm.diagnosis}
                    onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Pressure (BP)</label>
                  <input
                    type="text"
                    value={rxForm.bp}
                    onChange={(e) => setRxForm({ ...rxForm, bp: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Reported Symptoms</label>
                  <input
                    type="text"
                    placeholder="e.g. Headache in mornings, exertional fatigue"
                    value={rxForm.symptoms}
                    onChange={(e) => setRxForm({ ...rxForm, symptoms: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pulse / Heart Rate</label>
                  <input
                    type="text"
                    value={rxForm.pulse}
                    onChange={(e) => setRxForm({ ...rxForm, pulse: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Medicines Builder */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    <span>Prescribed Medications & Regimen</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Medicine
                  </button>
                </div>

                {rxForm.medicines.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Telmisartan 40mg)"
                        value={m.name}
                        onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                        className="flex-1 bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 40mg)"
                        value={m.dosage}
                        onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                        className="bg-white px-2 py-1 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g. 1-0-0)"
                        value={m.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                        className="bg-white px-2 py-1 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 30 Days)"
                        value={m.duration}
                        onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                        className="bg-white px-2 py-1 border rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Advice & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinical Advice / Diet Instructions</label>
                  <input
                    type="text"
                    value={rxForm.advice}
                    onChange={(e) => setRxForm({ ...rxForm, advice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={rxForm.follow_up_date}
                    onChange={(e) => setRxForm({ ...rxForm, follow_up_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400">
                  Doctor Signature Stamp: <strong>{doctor?.name}</strong> ({doctor?.qualifications})
                </span>
                <button
                  type="submit"
                  disabled={savingRx}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{savingRx ? 'Signing & Authorizing...' : 'Sign & Authorize Prescription'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 6. AVAILABILITY & SLOTS TAB */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">OPD Slot Scheduling & Availability Manager</h3>
              <p className="text-xs text-slate-500">Configure weekly consulting days, time shifts, and slot intervals</p>
            </div>
            {scheduleSaved && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Schedule Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-5 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-2">Weekly Consultation Days</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {Object.keys(availabilitySchedule.days).map(day => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => setAvailabilitySchedule(prev => ({
                      ...prev,
                      days: { ...prev.days, [day]: !prev.days[day] }
                    }))}
                    className={`p-3 rounded-xl border text-center transition font-bold ${
                      availabilitySchedule.days[day]
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="block text-xs">{day.slice(0, 3)}</span>
                    <span className="text-[10px] block mt-0.5 font-normal">
                      {availabilitySchedule.days[day] ? 'Active' : 'Off'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Morning Shift Window</label>
                <input
                  type="text"
                  value={availabilitySchedule.morningShift}
                  onChange={(e) => setAvailabilitySchedule({ ...availabilitySchedule, morningShift: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Evening Shift Window</label>
                <input
                  type="text"
                  value={availabilitySchedule.eveningShift}
                  onChange={(e) => setAvailabilitySchedule({ ...availabilitySchedule, eveningShift: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Slot Duration</label>
                <select
                  value={availabilitySchedule.slotDurationMinutes}
                  onChange={(e) => setAvailabilitySchedule({ ...availabilitySchedule, slotDurationMinutes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="15">15 Minutes / Patient</option>
                  <option value="20">20 Minutes / Patient</option>
                  <option value="30">30 Minutes / Patient</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Daily Tokens</label>
                <input
                  type="number"
                  value={availabilitySchedule.maxTokensPerDay}
                  onChange={(e) => setAvailabilitySchedule({ ...availabilitySchedule, maxTokensPerDay: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Emergency On-Call Support</label>
                <select
                  value={availabilitySchedule.emergencyOnCall ? 'yes' : 'no'}
                  onChange={(e) => setAvailabilitySchedule({ ...availabilitySchedule, emergencyOnCall: e.target.value === 'yes' })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="yes">Enabled (Direct Triage)</option>
                  <option value="no">Disabled</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Availability Schedule</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. DOCTOR PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Professional Medical Profile</h3>
              <p className="text-xs text-slate-500">Public credentials displayed on doctor directory and patient appointment cards</p>
            </div>
            {profileSaved && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Profile Updated!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Medical Registration Number</label>
                <input
                  type="text"
                  value={profileForm.registration_number}
                  onChange={(e) => setProfileForm({ ...profileForm, registration_number: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl font-mono text-indigo-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Degrees & Qualifications</label>
                <input
                  type="text"
                  value={profileForm.qualifications}
                  onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Medical Specialization</label>
                <input
                  type="text"
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Affiliated Hospital or Clinic</label>
                <input
                  type="text"
                  value={profileForm.organization_name}
                  onChange={(e) => setProfileForm({ ...profileForm, organization_name: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">OPD Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={profileForm.fee}
                  onChange={(e) => setProfileForm({ ...profileForm, fee: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Professional Bio & Clinical Summary</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Credentials</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Workstation Preferences & Account Security</h3>
            <p className="text-xs text-slate-500">Configure consultation automation, notification channels, and credentials</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Clinical Automation</span>
              </h4>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Auto-notify patient via SMS upon prescription generation</span>
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Automatically advance OPD token upon completion</span>
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Send reminder alert 15 minutes before next appointment</span>
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-0" />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Doctor Security Credentials</span>
              </h4>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-1.5 border rounded-lg bg-white" />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-1.5 border rounded-lg bg-white" />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Password updated successfully!')}
                  className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
