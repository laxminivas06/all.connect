import React, { useState } from 'react';
import {
  Users,
  Search,
  User,
  Calendar,
  FileText,
  Clock,
  Phone,
  ShieldCheck,
  Building2,
  Heart,
  ChevronRight,
  X,
  Stethoscope,
  Activity,
  AlertCircle
} from 'lucide-react';

export const DoctorPatientsTab = ({ data, onSelectPatient }) => {
  const patients = data?.patients || [];
  const appointments = data?.appointments || [];
  const prescriptions = data?.prescriptions || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientDossier, setSelectedPatientDossier] = useState(null);

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = String(p.full_name || p.name || '').toLowerCase();
    const pid = String(p.patient_id || p.id || '').toLowerCase();
    const hid = String(p.health_id || '').toLowerCase();
    const phone = String(p.phone || p.mobile || '').toLowerCase();
    return name.includes(q) || pid.includes(q) || hid.includes(q) || phone.includes(q);
  });

  const handleOpenDossier = (patient) => {
    const pid = patient.patient_id || patient.id;
    const patientAppts = appointments.filter((a) => a.patient_id === pid);
    const patientRx = prescriptions.filter((pr) => pr.patient_id === pid);

    setSelectedPatientDossier({
      ...patient,
      appointments: patientAppts,
      prescriptions: patientRx
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Patient Registry & Clinical Dossiers</span>
          </h2>
          <p className="text-xs text-slate-500">
            Patients who have scheduled or attended OPD consultations under your care
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, phone, health ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-3">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">No Patients Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `No patient matches "${searchQuery}".` : 'No patient records registered under your profile yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((p) => {
            const pid = p.patient_id || p.id;
            const patientAppts = appointments.filter((a) => a.patient_id === pid);
            const patientRx = prescriptions.filter((pr) => pr.patient_id === pid);
            const initials = (p.full_name || p.name || 'P')
              .replace(/^Dr\.?\s*/i, '')
              .trim()
              .charAt(0)
              .toUpperCase();

            return (
              <div
                key={pid}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-base text-slate-900 truncate">
                        {p.full_name || p.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        ID: {p.patient_id || p.id}
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-block mt-1">
                        HID: {p.health_id || 'HC-PENDING'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Age & Gender</span>
                      <span className="font-bold text-slate-800">{p.age ? `${p.age} Yrs` : '32 Yrs'} • {p.gender || 'Male'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                      <span className="font-extrabold text-rose-600">{p.blood_group || 'O+'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultations</span>
                      <span className="font-bold text-blue-600">{patientAppts.length} Visits</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescriptions</span>
                      <span className="font-bold text-emerald-600">{patientRx.length} Issued</span>
                    </div>
                  </div>

                  {p.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.phone || p.mobile}</span>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenDossier(p)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open Clinical Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Patient Dossier Modal */}
      {selectedPatientDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                  {(selectedPatientDossier.full_name || selectedPatientDossier.name || 'P').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedPatientDossier.full_name || selectedPatientDossier.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">Patient ID: {selectedPatientDossier.patient_id || selectedPatientDossier.id} • HID: {selectedPatientDossier.health_id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientDossier(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demographics & Vitals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Age / Gender</span>
                <span className="font-bold text-slate-800">{selectedPatientDossier.age || 32} Yrs / {selectedPatientDossier.gender || 'Male'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
                <span className="font-bold text-rose-600">{selectedPatientDossier.blood_group || 'O+'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile</span>
                <span className="font-bold text-slate-800 truncate block">{selectedPatientDossier.phone || selectedPatientDossier.mobile || 'Registered'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">City</span>
                <span className="font-bold text-slate-800">{selectedPatientDossier.city || 'Hyderabad'}</span>
              </div>
            </div>

            {/* Allergies & Chronic Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80">
                <span className="font-bold text-amber-900 block mb-1">Known Allergies:</span>
                <p className="text-amber-800">
                  {Array.isArray(selectedPatientDossier.allergies) && selectedPatientDossier.allergies.length > 0
                    ? selectedPatientDossier.allergies.join(', ')
                    : 'No known drug allergies reported'}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/80">
                <span className="font-bold text-blue-900 block mb-1">Chronic Conditions:</span>
                <p className="text-blue-800">
                  {Array.isArray(selectedPatientDossier.chronic_conditions) && selectedPatientDossier.chronic_conditions.length > 0
                    ? selectedPatientDossier.chronic_conditions.join(', ')
                    : 'None documented'}
                </p>
              </div>
            </div>

            {/* Consultation History */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-sm text-slate-900">Consultation History ({selectedPatientDossier.appointments?.length || 0})</h4>
              {selectedPatientDossier.appointments?.length === 0 ? (
                <p className="text-slate-400 italic">No past appointments logged.</p>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {selectedPatientDossier.appointments.map((a) => (
                    <div key={a.id || a.appointment_id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 block">{a.appointment_date} at {a.appointment_time}</span>
                        <span className="text-[11px] text-slate-500">{a.chief_complaint || 'OPD Consultation'}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPatientDossier(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientsTab;
