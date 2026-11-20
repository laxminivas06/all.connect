import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PatientSubNav } from '../../components/patient/PatientSubNav';
import {
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  CreditCard,
  QrCode,
  MapPin,
  RotateCcw,
  User,
  ArrowRight,
  Printer,
  X,
  Phone,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected horizontal category tab
  // Options: 'upcoming', 'completed', 'cancelled', 'pending'
  const [selectedCategory, setSelectedCategory] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [detailsModalAppt, setDetailsModalAppt] = useState(null);
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState(null);
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [prescriptionModalData, setPrescriptionModalData] = useState(null);

  // Reschedule form state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);

  // Cancel form state
  const [cancelReason, setCancelReason] = useState('Personal / Schedule conflict');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Horizontal scroll container ref
  const categoryScrollRef = useRef(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user && user.role === 'patient') {
        const res = await api.getMyPatientData();
        setAppointments(res.appointments || []);
        setPrescriptions(res.prescriptions || []);
      } else {
        const appts = await api.getAppointments();
        setAppointments(Array.isArray(appts) ? appts : []);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError(err.message || 'Failed to retrieve appointments list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Scroll category bar smoothly left or right
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Categorize appointments
  const upcomingList = appointments.filter((a) => {
    const s = String(a.status || '').toLowerCase();
    return ['confirmed', 'waiting', 'in consultation', 'checked in'].includes(s);
  });

  const completedList = appointments.filter((a) => {
    const s = String(a.status || '').toLowerCase();
    return s === 'completed';
  });

  const cancelledList = appointments.filter((a) => {
    const s = String(a.status || '').toLowerCase();
    return s === 'cancelled';
  });

  const pendingList = appointments.filter((a) => {
    const s = String(a.status || '').toLowerCase();
    return ['pending', 'requested', 'rescheduled'].includes(s);
  });

  // Filter based on active category and search
  const getActiveList = () => {
    let list = [];
    if (selectedCategory === 'upcoming') list = upcomingList;
    else if (selectedCategory === 'completed') list = completedList;
    else if (selectedCategory === 'cancelled') list = cancelledList;
    else if (selectedCategory === 'pending') list = pendingList;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((a) => {
      const docName = String(a.doctor_name || '').toLowerCase();
      const hospName = String(a.hospital_name || a.organization_name || '').toLowerCase();
      const apptId = String(a.appointment_id || a.id || '').toLowerCase();
      const dept = String(a.department || a.specialization || '').toLowerCase();
      const token = String(a.token_number || '').toLowerCase();
      return (
        docName.includes(q) ||
        hospName.includes(q) ||
        apptId.includes(q) ||
        dept.includes(q) ||
        token.includes(q)
      );
    });
  };

  const activeAppointments = getActiveList();

  // Category tab definitions
  const categories = [
    { id: 'upcoming', label: 'Upcoming Appointments', count: upcomingList.length, color: 'blue' },
    { id: 'completed', label: 'Completed Consultations', count: completedList.length, color: 'emerald' },
    { id: 'cancelled', label: 'Cancelled Appointments', count: cancelledList.length, color: 'rose' },
    { id: 'pending', label: 'Pending Requests', count: pendingList.length, color: 'amber' }
  ];

  // Actions
  const handleOpenReschedule = (appt) => {
    setRescheduleModalAppt(appt);
    setRescheduleDate(appt.appointment_date || '');
    setRescheduleTime(appt.appointment_time || '10:00 AM');
    setRescheduleError(null);
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please choose a valid date and time slot');
      return;
    }
    setRescheduling(true);
    setRescheduleError(null);
    try {
      const apptId = rescheduleModalAppt.appointment_id || rescheduleModalAppt.id;
      await api.rescheduleAppointment(apptId, {
        rescheduled_date: rescheduleDate,
        rescheduled_time: rescheduleTime
      });
      setRescheduleModalAppt(null);
      await fetchAppointments();
    } catch (err) {
      setRescheduleError(err.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduling(false);
    }
  };

  const handleOpenCancel = (appt) => {
    setCancelModalAppt(appt);
    setCancelReason('Schedule conflict');
    setCancelError(null);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setCancelling(true);
    setCancelError(null);
    try {
      const apptId = cancelModalAppt.appointment_id || cancelModalAppt.id;
      await api.cancelAppointment(apptId, { reason: cancelReason });
      setCancelModalAppt(null);
      await fetchAppointments();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const getPrescriptionForAppt = (appt) => {
    if (!appt) return null;
    const apptId = appt.appointment_id || appt.id;
    return prescriptions.find(
      (p) =>
        p.appointment_id === apptId ||
        (p.doctor_id && p.doctor_id === appt.doctor_id && p.consultation_date === appt.appointment_date)
    );
  };

  const handleOpenPrescription = (appt) => {
    // Retrieve genuine doctor-issued prescription only
    const matchedRx = getPrescriptionForAppt(appt);
    if (matchedRx) {
      setPrescriptionModalData(matchedRx);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      {/* Patient Sub Navigation */}
      <PatientSubNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 space-y-6 overflow-x-hidden">
        {/* Header Station */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Patient Consultation Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Appointments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Track upcoming consultations, review past prescriptions, manage booking status, and reschedule appointments directly across all registered hospitals and clinics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/book-opd"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              <span>Book New OPD</span>
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION: HORIZONTAL NAVIGATION – LEFT-TO-RIGHT SCROLLING */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-2xs relative">
          <div className="flex items-center justify-between gap-2">
            {/* Scroll Left Button (Desktop) */}
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Horizontal Scrolling Track */}
            <div
              ref={categoryScrollRef}
              className="w-full overflow-x-auto scroll-smooth no-scrollbar flex items-center gap-2.5 py-1 px-1 touch-pan-x"
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition shrink-0 select-none ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.01]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button (Desktop) */}
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor, hospital, token or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{activeAppointments.length}</strong> {selectedCategory} consultations
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Retrieving your appointments...</p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* APPOINTMENTS LIST / RESPONSIVE UNIFORM CARDS */}
        {/* ------------------------------------------------------------- */}
        {!loading && activeAppointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {activeAppointments.map((appt) => {
              const status = String(appt.status || 'Confirmed').toLowerCase();
              const isCompleted = status === 'completed';
              const isCancelled = status === 'cancelled';
              const canModify = !isCompleted && !isCancelled;
              const hasIssuedRx = Boolean(getPrescriptionForAppt(appt));

              const statusBadge = (() => {
                switch (status) {
                  case 'completed':
                    return { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                  case 'confirmed':
                    return { label: 'Confirmed', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
                  case 'checked in':
                    return { label: 'Checked In', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
                  case 'waiting':
                    return { label: 'Waiting', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
                  case 'in consultation':
                    return { label: 'In Consultation', cls: 'bg-purple-50 text-purple-700 border-purple-200' };
                  case 'cancelled':
                    return { label: 'Cancelled', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
                  case 'rescheduled':
                    return { label: 'Rescheduled', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
                  case 'pending':
                  case 'requested':
                  default:
                    return { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
                }
              })();

              const doctorInitials = (appt.doctor_name || 'Dr. Specialist')
                .replace(/^Dr\.?\s*/i, '')
                .trim()
                .charAt(0)
                .toUpperCase() || 'D';

              return (
                <div
                  key={appt.id || appt.appointment_id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between h-full space-y-4"
                >
                  <div className="space-y-4">
                    {/* Card Top Row: Tokens, ID, Status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {appt.token_number && (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-600 text-white shadow-2xs">
                            Token: {appt.token_number}
                          </span>
                        )}
                        <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {appt.appointment_id || appt.id}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${statusBadge.cls}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Doctor and Hospital Details */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 shrink-0">
                        {doctorInitials}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h3 className="font-extrabold text-base text-slate-900 truncate">
                          {appt.doctor_name || 'Specialist Consultation'}
                        </h3>
                        <p className="text-xs font-bold text-blue-600">
                          {appt.specialization || appt.department || 'General Medicine'}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {appt.hospital_name || appt.organization_name || 'Hospital Facility'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Schedule & Information Meta Grid */}
                    <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">
                          Appointment Date
                        </span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{appt.appointment_date || 'Date TBD'}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">
                          Appointment Time
                        </span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{appt.appointment_time || 'Time TBD'}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">
                          Consultation Mode
                        </span>
                        <span className="font-bold text-slate-700 mt-0.5 block truncate">
                          {appt.appointment_type || 'In-Person Consultation'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block text-[10px] uppercase">
                          Appointment Status
                        </span>
                        <span className="font-extrabold text-slate-900 mt-0.5 block truncate">
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>

                    {appt.chief_complaint && (
                      <p className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100 italic truncate">
                        <strong>Reason:</strong> {appt.chief_complaint}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {/* View Details Button (Always Available) */}
                    <button
                      type="button"
                      onClick={() => setDetailsModalAppt(appt)}
                      className="flex-1 min-w-[120px] py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>View Details</span>
                    </button>

                    {/* Reschedule (shown ONLY for pending/upcoming, NEVER for completed or cancelled) */}
                    {canModify && (
                      <button
                        type="button"
                        onClick={() => handleOpenReschedule(appt)}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                        <span>Reschedule</span>
                      </button>
                    )}

                    {/* Cancel (shown ONLY for pending/upcoming, NEVER for completed or cancelled) */}
                    {canModify && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancel(appt)}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs text-center transition flex items-center justify-center gap-1.5 border border-rose-200"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel</span>
                      </button>
                    )}

                    {/* View Prescription: ONLY for completed AND ONLY when doctor has actually issued a prescription */}
                    {isCompleted && hasIssuedRx && (
                      <button
                        type="button"
                        onClick={() => handleOpenPrescription(appt)}
                        className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Prescription</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && activeAppointments.length === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                No {selectedCategory} consultations
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `No consultations matched your search query "${searchQuery}".`
                  : `You have no ${selectedCategory} appointments currently on file.`}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/book-opd"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <Search className="w-4 h-4" />
                <span>Book OPD Consultation</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: APPOINTMENT DETAILS & DIGITAL PASS */}
      {/* ------------------------------------------------------------- */}
      {detailsModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Digital OPD Pass</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {detailsModalAppt.appointment_id || detailsModalAppt.id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalAppt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Token Badge */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 text-center space-y-1 shadow-md shadow-blue-500/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">OPD Queue Token</span>
              <div className="text-3xl font-black">{detailsModalAppt.token_number || 'T-01'}</div>
              <p className="text-xs text-blue-100">Please present this pass at the hospital reception counter</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Doctor</span>
                <span className="font-bold text-slate-800">{detailsModalAppt.doctor_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Facility</span>
                <span className="font-bold text-slate-800">{detailsModalAppt.hospital_name || detailsModalAppt.organization_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Date & Time</span>
                <span className="font-bold text-slate-800">{detailsModalAppt.appointment_date} at {detailsModalAppt.appointment_time}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-blue-600">{detailsModalAppt.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Patient</span>
                <span className="font-bold text-slate-800">{detailsModalAppt.patient_name || user?.name}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Payment</span>
                <span className="font-bold text-emerald-600">{detailsModalAppt.payment_status || 'Confirmed'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailsModalAppt(null)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: RESCHEDULE APPOINTMENT */}
      {/* ------------------------------------------------------------- */}
      {rescheduleModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Reschedule Consultation</h3>
                  <p className="text-[10px] text-slate-400">Select a new date and time slot</p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleModalAppt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Appointment Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Time Slot *</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="09:30 AM">09:30 AM (Morning Shift)</option>
                  <option value="10:00 AM">10:00 AM (Morning Shift)</option>
                  <option value="10:30 AM">10:30 AM (Morning Shift)</option>
                  <option value="11:30 AM">11:30 AM (Morning Shift)</option>
                  <option value="02:30 PM">02:30 PM (Afternoon Shift)</option>
                  <option value="03:30 PM">03:30 PM (Afternoon Shift)</option>
                  <option value="04:30 PM">04:30 PM (Afternoon Shift)</option>
                  <option value="05:30 PM">05:30 PM (Evening Shift)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: CANCEL APPOINTMENT */}
      {/* ------------------------------------------------------------- */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Cancel Appointment</h3>
                  <p className="text-[10px] text-slate-400">Initiate cancellation and refund</p>
                </div>
              </div>
              <button
                onClick={() => setCancelModalAppt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cancelError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to cancel your consultation with{' '}
                <strong>{cancelModalAppt.doctor_name}</strong> on{' '}
                <strong>{cancelModalAppt.appointment_date}</strong>?
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Schedule conflict">Schedule conflict</option>
                  <option value="Feeling better / Symptoms resolved">Feeling better / Symptoms resolved</option>
                  <option value="Consulting another doctor">Consulting another doctor</option>
                  <option value="Transportation issue">Transportation issue</option>
                  <option value="Personal emergency">Personal emergency</option>
                </select>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl text-[11px] text-rose-800 border border-rose-200 font-medium">
                Note: Any paid consultation fee will be credited back via our automated refund gateway.
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelModalAppt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: VIEW DIGITAL PRESCRIPTION */}
      {/* ------------------------------------------------------------- */}
      {prescriptionModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Digital Medical Prescription</h3>
                  <p className="text-[10px] text-slate-400 font-mono">RX: {prescriptionModalData.id}</p>
                </div>
              </div>
              <button
                onClick={() => setPrescriptionModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attending Doctor</span>
                  <span className="font-extrabold text-slate-900 text-sm">{prescriptionModalData.doctor_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Consult</span>
                  <span className="font-bold text-slate-700">{prescriptionModalData.consultation_date}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Clinical Diagnosis:</span>
                <p className="font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {prescriptionModalData.diagnosis}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1.5">Prescribed Medications:</span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <tr>
                        <th className="p-2.5">Medicine</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Frequency</th>
                        <th className="p-2.5">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescriptionModalData.medicines?.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                          <td className="p-2.5 text-slate-600">{m.dosage}</td>
                          <td className="p-2.5 text-slate-600">{m.frequency}</td>
                          <td className="p-2.5 text-slate-600">{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {prescriptionModalData.advice && (
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Doctor's Advice:</span>
                  <p className="text-slate-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-[11px]">
                    {prescriptionModalData.advice}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Rx</span>
              </button>
              <button
                type="button"
                onClick={() => setPrescriptionModalData(null)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
