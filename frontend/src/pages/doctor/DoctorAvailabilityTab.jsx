import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Video,
  UserCheck,
  Building2,
  AlertTriangle,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

export const DoctorAvailabilityTab = ({ data, onSaveSchedule }) => {
  const doctor = data?.doctor || {};

  const [days, setDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: false
  });

  const [morningShift, setMorningShift] = useState('09:00 AM - 01:00 PM');
  const [eveningShift, setEveningShift] = useState('04:00 PM - 08:00 PM');
  const [breakStart, setBreakStart] = useState('01:00 PM');
  const [breakEnd, setBreakEnd] = useState('02:00 PM');
  const [slotDuration, setSlotDuration] = useState('15');
  const [dailyCapacity, setDailyCapacity] = useState('25');

  // Online & In-Person consultation availability toggles
  const [onlineConsultation, setOnlineConsultation] = useState(true);
  const [inPersonConsultation, setInPersonConsultation] = useState(true);
  const [temporaryUnavailable, setTemporaryUnavailable] = useState(
    doctor.is_on_leave || doctor.is_available === false
  );

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleToggleDay = (day) => {
    setDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const activeDays = Object.keys(days).filter((d) => days[d]);
      
      const payload = {
        available_days: activeDays,
        morning_shift: morningShift,
        evening_shift: eveningShift,
        break_time: `${breakStart} - ${breakEnd}`,
        slot_duration: parseInt(slotDuration, 10),
        max_daily_patients: parseInt(dailyCapacity, 10),
        online_consultation_available: onlineConsultation,
        in_person_consultation_available: inPersonConsultation,
        is_available: !temporaryUnavailable,
        temporary_unavailable: temporaryUnavailable
      };

      if (onSaveSchedule) {
        await onSaveSchedule(payload);
      }
      setNotice({
        type: 'success',
        message: 'Doctor availability, shift hours, and consultation modes updated successfully!'
      });
    } catch (err) {
      setNotice({
        type: 'error',
        message: err.message || 'Failed to update schedule'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>OPD Availability & Working Hours Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Define active clinic working days, morning and evening shifts, consultation modes, and slot capacity
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

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        
        {/* Temporary Unavailability Quick Toggle */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              {temporaryUnavailable ? (
                <PauseCircle className="w-4 h-4 text-amber-600" />
              ) : (
                <PlayCircle className="w-4 h-4 text-emerald-600" />
              )}
              Temporary Practice Unavailability
            </span>
            <p className="text-[11px] text-slate-500">
              Temporarily pause new outpatient appointments without altering confirmed schedule bookings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTemporaryUnavailable(!temporaryUnavailable)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              temporaryUnavailable
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {temporaryUnavailable ? 'Temporarily Paused' : 'Normal Active'}
          </button>
        </div>

        {/* Consultation Modes (In-Person & Online) */}
        <div className="space-y-3">
          <label className="font-extrabold text-sm text-slate-900 block">Consultation Modes Availability</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setInPersonConsultation(!inPersonConsultation)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                inPersonConsultation
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${inPersonConsultation ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">In-Person OPD Consultations</span>
                  <span className="text-[11px] text-slate-500">Patients visit hospital or clinic workstation</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${inPersonConsultation ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {inPersonConsultation ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div
              onClick={() => setOnlineConsultation(!onlineConsultation)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                onlineConsultation
                  ? 'border-teal-500 bg-teal-50/50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${onlineConsultation ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Online Video Consultations</span>
                  <span className="text-[11px] text-slate-500">Tele-consultation appointments</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${onlineConsultation ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {onlineConsultation ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="space-y-3">
          <label className="font-extrabold text-sm text-slate-900 block">Weekly Working Days *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {Object.keys(days).map((day) => {
              const isChecked = days[day];
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`p-3 rounded-2xl text-xs font-bold text-center border transition flex flex-col items-center gap-1.5 ${
                    isChecked
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px] font-black">{day.slice(0, 3).toUpperCase()}</span>
                  <span className="text-[10px]">{isChecked ? 'Active' : 'Off'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shift Timings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Morning Consultation Shift *</label>
            <input
              type="text"
              value={morningShift}
              onChange={(e) => setMorningShift(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Evening Consultation Shift *</label>
            <input
              type="text"
              value={eveningShift}
              onChange={(e) => setEveningShift(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Break Hours & Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Break Window</label>
            <input
              type="text"
              value={`${breakStart} - ${breakEnd}`}
              onChange={(e) => {
                const parts = e.target.value.split('-');
                if (parts[0]) setBreakStart(parts[0].trim());
                if (parts[1]) setBreakEnd(parts[1].trim());
              }}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Slot Duration</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="10">10 Minutes per patient</option>
              <option value="15">15 Minutes per patient (Recommended)</option>
              <option value="20">20 Minutes per patient</option>
              <option value="30">30 Minutes per patient</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Daily Safe Patient Quota</label>
            <input
              type="number"
              value={dailyCapacity}
              onChange={(e) => setDailyCapacity(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Availability...' : 'Save Availability & Schedule'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorAvailabilityTab;
