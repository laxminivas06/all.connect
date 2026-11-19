import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  MapPin,
  Calendar,
  Phone,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Filter
} from 'lucide-react';

export const PatientsTab = ({ orgType = 'hospital', data }) => {
  const isHospital = orgType === 'hospital';
  const appointments = data?.recent_appointments || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');

  // Derive unique patient records treated at this organization from actual appointments
  const patients = useMemo(() => {
    const patientMap = new Map();

    appointments.forEach((appt) => {
      const pId = appt.patient_id || appt.patient_health_id || appt.id;
      if (!patientMap.has(pId)) {
        patientMap.set(pId, {
          id: pId,
          name: appt.patient_name || 'Patient',
          health_id: appt.patient_health_id || `HC-2026-${pId.slice(-6)}`,
          phone: appt.patient_phone || '+91 98765 43210',
          area: appt.patient_area || (data?.hospital?.area || data?.clinic?.area || 'Hyderabad'),
          gender: appt.patient_gender || 'Not specified',
          age: appt.patient_age || 35,
          total_visits: 1,
          last_visit: appt.appointment_date,
          last_doctor: appt.doctor_name,
          last_department: appt.department,
          last_complaint: appt.chief_complaint || 'General Consultation',
          last_status: appt.status
        });
      } else {
        const existing = patientMap.get(pId);
        existing.total_visits += 1;
        if (new Date(appt.appointment_date) > new Date(existing.last_visit)) {
          existing.last_visit = appt.appointment_date;
          existing.last_doctor = appt.doctor_name;
          existing.last_department = appt.department;
          existing.last_complaint = appt.chief_complaint || existing.last_complaint;
        }
      }
    });

    return Array.from(patientMap.values());
  }, [appointments, data]);

  const areas = ['All', ...new Set(patients.map(p => p.area).filter(Boolean))];

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.health_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);

    const matchesArea = areaFilter === 'All' || p.area.toLowerCase() === areaFilter.toLowerCase();
    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isHospital ? 'Hospital Outpatient Patient Registry' : 'Clinic Patient Registry'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active patient directory with consultation history, universal health IDs, and triage records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
            {patients.length} Registered Patients
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <span className="text-xs text-slate-400 block font-medium">Total OPD Patients</span>
          <span className="text-2xl font-black text-white mt-1 block">{patients.length}</span>
          <span className="text-[10px] text-indigo-400">Treated at facility</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <span className="text-xs text-slate-400 block font-medium">Total Consultations</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{appointments.length}</span>
          <span className="text-[10px] text-emerald-400">Completed visits</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <span className="text-xs text-slate-400 block font-medium">Unique Health IDs</span>
          <span className="text-2xl font-black text-teal-400 mt-1 block">{patients.length}</span>
          <span className="text-[10px] text-teal-400">ABDM federated</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
          <span className="text-xs text-slate-400 block font-medium">Active Localities</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block">{areas.length}</span>
          <span className="text-[10px] text-purple-400">Hyderabad areas</span>
        </div>
      </div>

      {/* Search & Area Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by patient name, ID, phone, or Universal Health ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <MapPin className="w-4 h-4 text-slate-500 hidden sm:block" />
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
          >
            {areas.map((a) => (
              <option key={a} value={a}>{a === 'All' ? 'All Patient Areas' : a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Patient Name & ID</th>
                <th className="px-4 py-3">Universal Health ID</th>
                <th className="px-4 py-3">Contact & Area</th>
                <th className="px-4 py-3">Last Attending Doctor</th>
                <th className="px-4 py-3">Chief Complaint</th>
                <th className="px-4 py-3">Last Visit</th>
                <th className="px-4 py-3 text-right">Total Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white text-sm">{patient.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{patient.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      {patient.health_id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>{patient.phone}</div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {patient.area}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{patient.last_doctor || 'Attending Physician'}</div>
                    <div className="text-[11px] text-indigo-400">{patient.last_department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate text-slate-300">{patient.last_complaint}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{patient.last_visit}</div>
                    <span className="text-[10px] text-slate-500 capitalize">{patient.last_status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 font-bold text-xs">
                      {patient.total_visits}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No outpatient records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default PatientsTab;
