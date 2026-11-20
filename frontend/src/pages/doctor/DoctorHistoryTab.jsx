import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Building2,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';

export const DoctorHistoryTab = ({ data }) => {
  const appointments = data?.appointments || [];
  const completedAppointments = appointments.filter(
    (a) => String(a.status || '').toLowerCase() === 'completed'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week, month

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredHistory = completedAppointments.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(a.patient_name || '').toLowerCase().includes(q) ||
      String(a.appointment_id || a.id || '').toLowerCase().includes(q) ||
      String(a.chief_complaint || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (timeFilter === 'today') {
      return a.appointment_date === todayStr;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Consultation History & Completed Patient Visits</span>
          </h2>
          <p className="text-xs text-slate-500">
            Audit trail of discharged consultations, recorded treatments, and clinical outcomes
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today's Visits</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No completed consultations found</h4>
            <p className="text-xs text-slate-400">Completed visits will be catalogued here for future clinical reference.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase">
                <tr>
                  <th className="p-3">Visit Date & Time</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Token</th>
                  <th className="p-3">Clinical Presentation</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Fee Settled</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((appt) => (
                  <tr key={appt.id || appt.appointment_id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-bold text-slate-900">
                      {appt.appointment_date} <span className="text-slate-400 block text-[11px] font-normal">{appt.appointment_time}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-extrabold text-slate-900 block">{appt.patient_name}</span>
                      <span className="text-[11px] text-slate-400">{appt.patient_mobile || 'Ph: +91 9876543210'}</span>
                    </td>
                    <td className="p-3 font-mono font-black text-blue-600">{appt.token_number || 'T-01'}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{appt.chief_complaint || 'Standard Checkup'}</td>
                    <td className="p-3 text-slate-600">{appt.appointment_type || 'In-Person'}</td>
                    <td className="p-3 font-bold text-emerald-600">₹{appt.consultation_fee || 600}</td>
                    <td className="p-3 text-right">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorHistoryTab;
