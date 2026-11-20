import React, { useState } from 'react';
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  ShieldCheck,
  Building2,
  AlertTriangle
} from 'lucide-react';

export const DoctorLeaveTab = ({ data, onApplyLeave, onCancelLeave, onRefresh }) => {
  const doctor = data?.doctor || {};
  const isOnLeave = Boolean(doctor.is_on_leave);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('Medical Cardiology Conference');
  const [applying, setApplying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setNotice({ type: 'error', message: 'Please select both leave start and end dates' });
      return;
    }
    if (startDate > endDate) {
      setNotice({ type: 'error', message: 'End date cannot be prior to start date' });
      return;
    }

    setApplying(true);
    setNotice(null);
    try {
      if (onApplyLeave) {
        await onApplyLeave({
          start_date: startDate,
          end_date: endDate,
          reason
        });
      }
      setNotice({ type: 'success', message: `Leave scheduled from ${startDate} to ${endDate}. Patient appointments will be automatically blocked during this period.` });
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to submit leave request' });
    } finally {
      setApplying(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel active leave and resume OPD clinical availability?')) return;
    setCancelling(true);
    setNotice(null);
    try {
      if (onCancelLeave) {
        await onCancelLeave();
      }
      setNotice({ type: 'success', message: 'Leave cancelled! Doctor availability has been restored for patient booking.' });
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to cancel leave' });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Doctor Leave & Vacation Administration</span>
          </h2>
          <p className="text-xs text-slate-500">
            Schedule upcoming medical conferences, leaves, or clinical sabbaticals with automated patient schedule gating
          </p>
        </div>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Active Leave Banner */}
      {isOnLeave ? (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>Doctor Currently Unavailable – On Leave</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Practice Temporarily Paused
            </h3>
            <p className="text-xs text-amber-100 max-w-xl">
              Scheduled Leave Window: <strong>{doctor.leave_start}</strong> to <strong>{doctor.leave_end}</strong>
              {doctor.leave_reason && ` (${doctor.leave_reason})`}. All patient slot bookings during this period are automatically blocked.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="px-5 py-2.5 rounded-xl bg-white text-amber-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition shrink-0 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>{cancelling ? 'Restoring...' : 'Resume Practice Now'}</span>
          </button>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Clinical Schedule Active: Doctor is currently on duty and accepting OPD bookings.</span>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-emerald-600 text-white rounded-full uppercase">
            Available
          </span>
        </div>
      )}

      {/* Schedule Leave Form */}
      <form onSubmit={handleApply} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <h3 className="font-extrabold text-base text-slate-900">Schedule New Clinical Leave</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Leave Start Date *</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Leave End Date *</label>
            <input
              type="date"
              required
              min={startDate || new Date().toISOString().split('T')[0]}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="font-bold text-slate-700 block mb-1">Reason for Leave *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="Medical Cardiology Conference">Medical Conference / CME Program</option>
            <option value="Annual Clinical Leave">Annual Sabbatical / Vacation</option>
            <option value="Personal / Family Sabbatical">Personal / Family Leave</option>
            <option value="Emergency Medical Sabbatical">Medical Emergency</option>
          </select>
        </div>

        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 font-medium">
          When this leave is submitted, the system automatically marks the doctor as <strong>"Doctor Currently Unavailable – On Leave"</strong> in search results and hospital booking calendars during these dates.
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={applying}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>{applying ? 'Submitting Leave...' : 'Schedule Approved Leave'}</span>
          </button>
        </div>
      </form>

      {/* Past Leave History */}
      {doctor.leave_history && doctor.leave_history.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Recorded Leave History</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
            {doctor.leave_history.map((l, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">{l.start_date} to {l.end_date}</span>
                  <span className="text-slate-500 text-[11px]">{l.reason}</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  l.status === 'Cancelled' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                }`}>
                  {l.status || 'Approved'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorLeaveTab;
