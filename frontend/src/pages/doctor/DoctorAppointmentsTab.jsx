import React, { useState, useRef } from 'react';
import {
  Calendar,
  Clock,
  User,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  UserCheck,
  FileText,
  AlertCircle,
  Phone,
  Building2,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  Check,
  Ban
} from 'lucide-react';

export const DoctorAppointmentsTab = ({
  data,
  setActiveTab,
  onUpdateStatus,
  onRefresh,
  onOpenRx
}) => {
  const appointments = data?.appointments || [];
  const [activeCategory, setActiveCategory] = useState('all'); // all, upcoming, pending, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection modal
  const [rejectModalAppt, setRejectModalAppt] = useState(null);
  const [rejectReason, setRejectReason] = useState('Doctor scheduled in emergency procedure');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Horizontal scroll container ref
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Categorize
  const upcomingList = appointments.filter((a) => {
    const s = String(a.status || '').toLowerCase();
    return ['confirmed', 'waiting', 'in consultation', 'checked in', 'next in line'].includes(s);
  });

  const pendingList = appointments.filter((a) => {
    const s = String(a.status || '').toLowerCase();
    return ['pending', 'requested', 'rescheduled'].includes(s);
  });

  const completedList = appointments.filter((a) => {
    const s = String(a.status || '').toLowerCase();
    return s === 'completed';
  });

  const cancelledList = appointments.filter((a) => {
    const s = String(a.status || '').toLowerCase();
    return s === 'cancelled' || s === 'rejected';
  });

  const categories = [
    { id: 'all', label: 'All Appointments', count: appointments.length },
    { id: 'upcoming', label: 'Upcoming Consults', count: upcomingList.length },
    { id: 'pending', label: 'Pending Requests', count: pendingList.length },
    { id: 'completed', label: 'Completed', count: completedList.length },
    { id: 'cancelled', label: 'Cancelled / Rejected', count: cancelledList.length }
  ];

  const getFilteredList = () => {
    let list = appointments;
    if (activeCategory === 'upcoming') list = upcomingList;
    else if (activeCategory === 'pending') list = pendingList;
    else if (activeCategory === 'completed') list = completedList;
    else if (activeCategory === 'cancelled') list = cancelledList;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((a) => {
      const pName = String(a.patient_name || '').toLowerCase();
      const pId = String(a.patient_id || '').toLowerCase();
      const aId = String(a.appointment_id || a.id || '').toLowerCase();
      const tok = String(a.token_number || '').toLowerCase();
      const ph = String(a.patient_mobile || '').toLowerCase();
      return pName.includes(q) || pId.includes(q) || aId.includes(q) || tok.includes(q) || ph.includes(q);
    });
  };

  const filteredAppointments = getFilteredList();

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalAppt) return;
    setRejectLoading(true);
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(rejectModalAppt.id || rejectModalAppt.appointment_id, 'Cancelled', rejectReason);
      }
      setRejectModalAppt(null);
    } catch (err) {
      alert(err.message || 'Failed to reject appointment');
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition shrink-0 select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
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

      {/* Search & Meta Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, phone, token, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-900">{filteredAppointments.length}</strong> {activeCategory} consultations
        </div>
      </div>

      {/* Appointments List / Grid */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">No {activeCategory} appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `No records matched "${searchQuery}".` : 'No appointment records found in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAppointments.map((appt) => {
            const stat = appt.status || 'Confirmed';
            const isPending = ['pending', 'requested'].includes(stat.toLowerCase());
            const isInConsult = stat === 'In Consultation';
            const isCompleted = stat === 'Completed';
            const isCancelled = stat === 'Cancelled' || stat === 'cancelled';

            return (
              <div
                key={appt.id || appt.appointment_id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Token & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-600 text-white shadow-2xs">
                        {appt.token_number || 'T-01'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {appt.appointment_id || appt.id}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isInConsult
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : isCancelled
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {stat}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      {(appt.patient_name || 'Patient').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-base text-slate-900 truncate">{appt.patient_name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{appt.patient_mobile || 'Ph: +91 9876543210'}</span>
                        {appt.patient_id && <span className="font-mono text-[10px] text-slate-400">({appt.patient_id})</span>}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Details Strip */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                      <span className="font-bold text-slate-800">{appt.appointment_date} at {appt.appointment_time}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Mode</span>
                      <span className="font-bold text-slate-700">{appt.appointment_type || 'In-Person'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Settlement</span>
                      <span className="font-extrabold text-emerald-600">₹{appt.consultation_fee || 600}</span>
                    </div>
                  </div>

                  {appt.chief_complaint && (
                    <p className="text-xs text-slate-600 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/70 italic">
                      <strong>Complaint:</strong> {appt.chief_complaint}
                    </p>
                  )}
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  {/* For Pending Requests: Accept / Reject */}
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus && onUpdateStatus(appt.id || appt.appointment_id, 'Confirmed')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectModalAppt(appt)}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* For Confirmed: Call to Bay */}
                  {!isPending && !isCompleted && !isCancelled && !isInConsult && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus && onUpdateStatus(appt.id || appt.appointment_id, 'In Consultation')}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Call Into Consultation Bay</span>
                    </button>
                  )}

                  {/* When In Consultation */}
                  {isInConsult && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenRx && onOpenRx(appt)}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Issue Rx</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus && onUpdateStatus(appt.id || appt.appointment_id, 'Completed')}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        Mark Completed
                      </button>
                    </>
                  )}

                  {/* When Completed */}
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => onOpenRx && onOpenRx(appt)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>View Rx</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Appointment Modal */}
      {rejectModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Reject Appointment Request</h3>
                  <p className="text-[10px] text-slate-400">ID: {rejectModalAppt.appointment_id || rejectModalAppt.id}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalAppt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <p className="text-slate-600">
                You are rejecting the appointment request for <strong>{rejectModalAppt.patient_name}</strong> on <strong>{rejectModalAppt.appointment_date}</strong>.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Rejection *</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Doctor scheduled in emergency procedure">Doctor scheduled in emergency procedure</option>
                  <option value="Exceeds daily safe clinical capacity">Exceeds daily safe clinical capacity</option>
                  <option value="Condition outside clinical specialization scope">Condition outside clinical specialization scope</option>
                  <option value="Doctor emergency leave">Doctor emergency leave</option>
                </select>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl text-[11px] text-rose-800 border border-rose-200 font-medium">
                The patient will be notified automatically and provided alternate slots or re-routed to another specialist.
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalAppt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentsTab;
