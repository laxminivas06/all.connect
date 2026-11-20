import React from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Stethoscope,
  HeartPulse,
  Activity,
  ArrowRight,
  UserCheck,
  Video,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Inbox,
  AlertTriangle
} from 'lucide-react';

export const DoctorOverviewTab = ({
  data,
  setActiveTab,
  onRefresh,
  onBeginConsult,
  onCallNext,
  onQuickComplete
}) => {
  const doctor = data?.doctor || {};
  const kpis = data?.kpis || {};
  const todayQueue = data?.today_queue || [];
  const recentConsultations = data?.recent_consultations || [];
  const upcomingAppointments = data?.upcoming_appointments || [];
  const notifications = data?.notifications || [];

  const inConsultationAppt = todayQueue.find(
    (a) => a.status === 'In Consultation' || a.queue_status === 'In Consultation'
  );
  const nextInLineAppt = todayQueue.find(
    (a) => a.status === 'Next in Line' || a.queue_status === 'Next in Line'
  ) || todayQueue.find(
    (a) => a.status === 'Waiting' || a.queue_status === 'Waiting'
  );

  return (
    <div className="space-y-6">
      {/* 8 Real-time KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Today's Appointments</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.today_appointments || 0}</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">OPD Day</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Upcoming Consults</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600">{kpis.upcoming_appointments || 0}</span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Scheduled</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Completed Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{kpis.completed_consultations || 0}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Treated</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{kpis.pending_requests || 0}</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Awaiting</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Patients</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.total_patients_treated || 0}</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Clinical</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Waiting Outside</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600">{kpis.patients_waiting_outside || 0}</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">In Lounge</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">In Consultation</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">{kpis.patients_in_consultation || (inConsultationAppt ? 1 : 0)}</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">In Bay</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Cancelled / No-Show</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-600">{kpis.cancelled_appointments || 0}</span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Archived</span>
          </div>
        </div>
      </div>

      {/* Consultation Bay Live Focus Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Consultation Bay */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-blue-300">OPD Consultation Bay #01</span>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                ACTIVE TRIAGE
              </span>
            </div>

            {inConsultationAppt ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400">TOKEN: {inConsultationAppt.token_number || 'T-01'}</span>
                    <h3 className="text-xl font-black text-white mt-0.5">{inConsultationAppt.patient_name}</h3>
                    <p className="text-xs text-slate-300">{inConsultationAppt.chief_complaint || 'General Medical Consultation'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-mono">ID: {inConsultationAppt.appointment_id || inConsultationAppt.id}</span>
                    <span className="text-xs font-bold text-emerald-400">{inConsultationAppt.appointment_time}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Mode</span>
                    <span className="font-bold text-white">{inConsultationAppt.appointment_type || 'In-Person'}</span>
                  </div>
                  <div className="border-x border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block">Phone</span>
                    <span className="font-bold text-white truncate block">{inConsultationAppt.patient_mobile || 'Registered'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Fee Status</span>
                    <span className="font-bold text-emerald-400">Paid (₹{inConsultationAppt.consultation_fee || 600})</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-200">Consultation Bay Ready</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  No patient currently inside the consultation room. Call the next patient from the waiting queue.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
            {inConsultationAppt ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('prescriptions')}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Issue Digital Rx</span>
                </button>
                <button
                  type="button"
                  onClick={() => onQuickComplete && onQuickComplete(inConsultationAppt.id || inConsultationAppt.appointment_id)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
              </>
            ) : nextInLineAppt ? (
              <button
                type="button"
                onClick={() => onBeginConsult && onBeginConsult(nextInLineAppt.id || nextInLineAppt.appointment_id)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Call Next: {nextInLineAppt.patient_name} ({nextInLineAppt.token_number || 'T-01'})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition text-center"
              >
                View Full Appointment Schedule
              </button>
            )}
          </div>
        </div>

        {/* Next in Line Preview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Next Patient in Waiting Room</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                WAITING QUEUE
              </span>
            </div>

            {nextInLineAppt ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">TOKEN: {nextInLineAppt.token_number || 'T-02'}</span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{nextInLineAppt.patient_name}</h3>
                    <p className="text-xs text-slate-500">{nextInLineAppt.chief_complaint || 'Routine Checkup'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800">{nextInLineAppt.appointment_time}</span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full block mt-1">
                      {nextInLineAppt.status || 'Waiting'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Expected Waiting Time:</span>
                  <span className="font-extrabold text-slate-800">~10 - 15 mins</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">Waiting Room Clear</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No upcoming patients are currently checked in or waiting outside the bay.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
            {nextInLineAppt && (
              <button
                type="button"
                onClick={() => onBeginConsult && onBeginConsult(nextInLineAppt.id || nextInLineAppt.appointment_id)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Begin Consultation Now</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              Open Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Today's Live Schedule Timeline Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Today's Consultation Schedule</h3>
            <p className="text-xs text-slate-500">Live outpatient token flow and patient progress</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View Full Appointments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {todayQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No consultations registered on today's schedule yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase">
                <tr>
                  <th className="p-3">Token</th>
                  <th className="p-3">Patient Details</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayQueue.slice(0, 6).map((item) => {
                  const stat = item.status || 'Confirmed';
                  return (
                    <tr key={item.id || item.appointment_id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-mono font-black text-blue-600">{item.token_number || 'T-01'}</td>
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900 block">{item.patient_name}</span>
                        <span className="text-[11px] text-slate-400">{item.patient_mobile || 'Ph: +91 9876543210'}</span>
                      </td>
                      <td className="p-3 font-bold text-slate-700">{item.appointment_time}</td>
                      <td className="p-3 text-slate-600">{item.appointment_type || 'In-Person'}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                          stat === 'In Consultation' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          stat === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          stat === 'Next in Line' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {stat}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {stat !== 'Completed' && stat !== 'In Consultation' && (
                          <button
                            type="button"
                            onClick={() => onBeginConsult && onBeginConsult(item.id || item.appointment_id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px]"
                          >
                            Call Bay
                          </button>
                        )}
                        {stat === 'In Consultation' && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('prescriptions')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[11px]"
                          >
                            Rx
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorOverviewTab;
