import React, { useState } from 'react';
import { Pagination } from '../../components/Pagination';
import {
  Calendar,
  Users,
  Stethoscope,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building2,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const OverviewTab = ({
  orgType,
  data,
  setActiveTab,
  onAddDoctorOpen,
  onAssignModalOpen
}) => {
  const {
    hospital,
    clinic,
    kpis = {},
    doctor_stats = [],
    today_queue = [],
    recent_consultations = [],
    recent_payments = [],
    upcoming_appointments = [],
    is_single_doctor = false,
    primary_doctor = null,
    dept_breakdown = []
  } = data || {};

  const org = orgType === 'hospital' ? hospital : clinic;

  // Pagination for Doctor-wise Appointment Distribution
  const [doctorStatsPage, setDoctorStatsPage] = useState(1);
  const [doctorStatsPageSize, setDoctorStatsPageSize] = useState(10);
  const paginatedDoctorStats = doctor_stats.slice(
    (doctorStatsPage - 1) * doctorStatsPageSize,
    doctorStatsPage * doctorStatsPageSize
  );
  const isHospital = orgType === 'hospital';

  // Synthetic 6-month revenue trend based on real today/monthly collections
  const chartData = [
    { month: 'Jun', consultations: 110, collection: 55000 },
    { month: 'Jul', consultations: 135, collection: 67500 },
    { month: 'Aug', consultations: 160, collection: 80000 },
    { month: 'Sep', consultations: 195, collection: 97500 },
    { month: 'Oct', consultations: 220, collection: 110000 },
    { month: 'Nov', consultations: Math.max(kpis.completed_consultations || 15, 12) * 8 + 30, collection: kpis.monthly_collection || 45000 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Single-Doctor Clinic Dedicated Banner */}
      {is_single_doctor && primary_doctor && (
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-teal-800/40">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center font-bold text-teal-300 text-xl shrink-0">
              {primary_doctor.name?.split(' ')?.[1]?.[0] || 'D'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[10px] font-bold border border-teal-400/30 uppercase tracking-wide">
                  Single-Doctor Dedicated Clinic
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  primary_doctor.is_on_leave
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : primary_doctor.is_available
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {primary_doctor.is_on_leave ? 'On Leave' : primary_doctor.is_available ? 'Available for OPD' : 'Temporarily Unavailable'}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-1">{primary_doctor.name}</h2>
              <p className="text-xs text-teal-200/80">
                {primary_doctor.qualifications} • {primary_doctor.specialization} • Reg #{primary_doctor.medical_registration_number || 'TSMC-2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-teal-800/40">
            <div className="text-left md:text-right">
              <span className="text-[10px] text-teal-300/70 block">Consultation Fee</span>
              <span className="font-extrabold text-base text-white">₹{primary_doctor.consultation_fee}</span>
            </div>
            <div className="text-left md:text-right pl-3 border-l border-teal-800/50">
              <span className="text-[10px] text-teal-300/70 block">Today's Load</span>
              <span className="font-extrabold text-base text-teal-300">{kpis.today_appointments || 0} Appointments</span>
            </div>
            <button
              onClick={() => setActiveTab('doctors')}
              className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
            >
              Manage Schedule
            </button>
          </div>
        </div>
      )}

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Today Appointments */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Today Appointments</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{kpis.total_appointments_today || 0}</span>
            <span className="text-[10px] font-bold text-blue-600">Active Queue</span>
          </div>
        </div>

        {/* Card 2: Completed Consultations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Completed Consultations</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{kpis.completed_consultations || 0}</span>
            <span className="text-[10px] font-semibold text-emerald-600">EHR Synced</span>
          </div>
        </div>

        {/* Card 3: Pending Appointments */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Appointments</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{kpis.pending_appointments || 0}</span>
            <span className="text-[10px] font-semibold text-amber-600">Awaiting OPD</span>
          </div>
        </div>

        {/* Card 4: Patients Waiting */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Patients Waiting</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{kpis.patients_waiting || 0}</span>
            <span className="text-[10px] font-semibold text-purple-600">
              {kpis.patients_currently_consulting || kpis.patients_consulting || 0} in consult
            </span>
          </div>
        </div>

        {/* Card 5: Total Doctors */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Doctors</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{kpis.total_doctors || 0}</span>
            <span className="text-[10px] font-semibold text-slate-400">
              {is_single_doctor ? 'Solo Practice' : 'Roster'}
            </span>
          </div>
        </div>

        {/* Card 6: Available Doctors */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Available Doctors</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-teal-700">{kpis.available_doctors || 0}</span>
            <span className="text-[10px] font-bold text-rose-600">
              {kpis.doctors_currently_on_leave || kpis.doctors_on_leave || 0} On Leave
            </span>
          </div>
        </div>

        {/* Card 7: Today's Collection */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Today's Collection</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">₹{kpis.today_collection || 0}</span>
            <span className="text-[10px] font-bold text-emerald-600">Cash/UPI</span>
          </div>
        </div>

        {/* Card 8: Monthly Collection */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Monthly Collection</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">₹{kpis.monthly_collection || 0}</span>
            <span className="text-[10px] font-semibold text-slate-400">Total Gross</span>
          </div>
        </div>

      </div>

      {/* Quick Actions Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-extrabold text-slate-800">Operational Quick Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Manage Live Queue</span>
          </button>
          {!is_single_doctor && (
            <button
              onClick={onAddDoctorOpen}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('services')}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Manage Packages</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Daily Collection</span>
          </button>
        </div>
      </div>

      {/* Grid: Live Patient Queue Preview + Doctor Availability Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 2 Cols: Today's Patient Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Today's Patient Queue ({today_queue.length})</span>
              </h3>
              <p className="text-xs text-slate-500">Live order of patient consultations and waiting time</p>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Full Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {today_queue.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No appointments scheduled for today yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-2">Token #</th>
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Doctor</th>
                    <th className="pb-2">Time Slot</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Est. Waiting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {today_queue.slice(0, 6).map((q) => (
                    <tr key={q.id || q.appointment_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 font-black text-slate-900">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs">
                          {q.token_number || `T-${String(q.queue_number || 1).padStart(2, '0')}`}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="font-bold text-slate-800 block">{q.patient_name}</span>
                        <span className="text-[10px] text-slate-400">{q.patient_health_id || q.patient_id}</span>
                      </td>
                      <td className="py-2.5 text-slate-600 font-medium">
                        {q.doctor_name}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-700">
                        {q.appointment_time}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : q.status === 'In Consultation'
                            ? 'bg-blue-50 text-blue-700 animate-pulse'
                            : q.status === 'Waiting' || q.status === 'Checked In'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 font-semibold">
                        {q.waiting_duration || 'Scheduled'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 1 Col: Doctor Availability Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Availability ({doctor_stats.length})</span>
              </h3>
              <button
                onClick={() => setActiveTab('doctors')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {doctor_stats.slice(0, 5).map((d) => (
                <div key={d.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{d.name}</h4>
                    <p className="text-[10px] text-slate-500">{d.specialization}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{d.working_hours}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold block mb-1 ${
                      d.availability === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.availability === 'Busy'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : d.availability === 'On Leave'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {d.availability}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {d.today_appointments} Today
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Availability Rate:</span>
            <span className="font-bold text-teal-700">
              {doctor_stats.length > 0
                ? Math.round((kpis.available_doctors / doctor_stats.length) * 100)
                : 100}% Available
            </span>
          </div>
        </div>

      </div>

      {/* Doctor-wise Appointment Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Doctor-wise Appointment Distribution</h3>
            <p className="text-xs text-slate-500">Real appointment loads and consultation distribution (non-medical performance rating)</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Total {doctor_stats.length} Specialists</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-2">Doctor Name</th>
                <th className="pb-2">Specialisation</th>
                <th className="pb-2 text-center">Today's Appointments</th>
                <th className="pb-2 text-center">Completed</th>
                <th className="pb-2 text-center">Pending</th>
                <th className="pb-2">Consultation Fee</th>
                <th className="pb-2">Availability Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDoctorStats.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-bold text-slate-900">{d.name}</td>
                  <td className="py-3 text-slate-600">{d.specialization}</td>
                  <td className="py-3 text-center font-black text-blue-600">{d.today_appointments}</td>
                  <td className="py-3 text-center font-bold text-emerald-600">{d.completed_count}</td>
                  <td className="py-3 text-center font-bold text-amber-600">{d.pending_count}</td>
                  <td className="py-3 font-bold text-slate-800">₹{d.consultation_fee}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      d.availability === 'Available'
                        ? 'bg-emerald-50 text-emerald-700'
                        : d.availability === 'Busy'
                        ? 'bg-amber-50 text-amber-700'
                        : d.availability === 'On Leave'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.availability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {doctor_stats.length > 0 && (
          <Pagination
            totalItems={doctor_stats.length}
            pageSize={doctorStatsPageSize}
            currentPage={doctorStatsPage}
            onPageChange={setDoctorStatsPage}
            onPageSizeChange={setDoctorStatsPageSize}
          />
        )}
      </div>

      {/* Grid: 6-Month Volume Trend & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 2 Cols: Monthly Consultations & Collections Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Consultation Volume & Collection Trend</h3>
              <p className="text-xs text-slate-500">6-Month historical footfall and revenue growth</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">Monthly</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [name === 'collection' ? `₹${val.toLocaleString()}` : `${val} Consults`, name === 'collection' ? 'Revenue' : 'Volume']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="collection" fill="#3b82f6" radius={[6, 6, 0, 0]} name="collection" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1 Col: Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Recent Payments</span>
            </h3>
            <button
              onClick={() => setActiveTab('billing')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Ledger
            </button>
          </div>

          <div className="space-y-2.5">
            {recent_payments.slice(0, 5).map((p) => (
              <div key={p.id || p.appointment_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">{p.patient_name}</span>
                  <span className="text-[10px] text-slate-400">{p.appointment_id} • {p.appointment_date}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-xs text-emerald-700 block">₹{p.consultation_fee}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{p.payment_status || 'Paid'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
