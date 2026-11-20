import React, { useState } from 'react';
import {
  FolderHeart,
  Search,
  FileText,
  Calendar,
  Building2,
  Users,
  Download,
  Eye,
  X,
  ShieldCheck,
  Activity,
  AlertCircle
} from 'lucide-react';

export const DoctorRecordsTab = ({ data }) => {
  const patients = data?.patients || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordFilter, setRecordFilter] = useState('all');

  // Diagnostic records
  const sampleRecords = [
    {
      id: 'REC-2026-081',
      patient_name: 'Aditya Sharma',
      patient_id: 'PAT-2026-000001',
      record_type: 'Lab Investigation',
      title: 'Complete Lipid Profile & HbA1c',
      date: '2026-11-15',
      facility: 'MaxCure Super Speciality Hospital',
      doctor: 'Dr. Rajesh Sharma',
      summary: 'Total Cholesterol: 195 mg/dL, Triglycerides: 140 mg/dL, HbA1c: 5.6% (Normoglycemic)',
      status: 'Verified'
    },
    {
      id: 'REC-2026-082',
      patient_name: 'Priya Verma',
      patient_id: 'PAT-2026-000002',
      record_type: 'Radiology',
      title: 'Chest X-Ray (PA View)',
      date: '2026-11-12',
      facility: 'Apollo Hospitals Jubilee Hills',
      doctor: 'Dr. Priya Patel',
      summary: 'Clear bilateral lung fields. Normal cardiothoracic ratio. No focal consolidations.',
      status: 'Verified'
    },
    {
      id: 'REC-2026-083',
      patient_name: 'Vikram Reddy',
      patient_id: 'PAT-2026-000003',
      record_type: 'Cardiology',
      title: '12-Lead Electrocardiogram (ECG)',
      date: '2026-11-10',
      facility: 'CARE Hospitals Banjara Hills',
      doctor: 'Dr. Rajesh Sharma',
      summary: 'Normal sinus rhythm, HR 72 bpm. Normal PR and QRS intervals. No ST-segment elevation.',
      status: 'Verified'
    },
    {
      id: 'REC-2026-084',
      patient_name: 'Aditya Sharma',
      patient_id: 'PAT-2026-000001',
      record_type: 'Pathology',
      title: 'Complete Blood Count (CBC) & ESR',
      date: '2026-11-05',
      facility: 'MaxCure Super Speciality Hospital',
      doctor: 'Dr. Sneha Reddy',
      summary: 'Hemoglobin: 14.8 g/dL, Platelets: 240,000 /mcL, Total WBC: 7,200 /mcL. Normal indices.',
      status: 'Verified'
    }
  ];

  const filteredRecords = sampleRecords.filter((rec) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rec.patient_name.toLowerCase().includes(q) ||
      rec.title.toLowerCase().includes(q) ||
      rec.id.toLowerCase().includes(q) ||
      rec.patient_id.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (recordFilter !== 'all' && rec.record_type.toLowerCase() !== recordFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-blue-600" />
            <span>Patient Medical Records & Diagnostic Reports</span>
          </h2>
          <p className="text-xs text-slate-500">
            Certified laboratory analyses, pathology tests, and imaging records for clinical evaluation
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <select
            value={recordFilter}
            onChange={(e) => setRecordFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="lab investigation">Lab Investigations</option>
            <option value="radiology">Radiology & Imaging</option>
            <option value="cardiology">Cardiology ECG</option>
            <option value="pathology">Pathology CBC</option>
          </select>
        </div>
      </div>

      {/* Records Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {rec.id}
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {rec.status}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900">{rec.title}</h3>
                <p className="text-xs text-blue-600 font-bold mt-0.5">
                  Patient: {rec.patient_name} <span className="font-mono text-slate-400">({rec.patient_id})</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rec.facility} • {rec.date}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Clinical Findings</span>
                <p className="font-medium text-slate-700">{rec.summary}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedRecord(rec)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Record</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderHeart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{selectedRecord.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {selectedRecord.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Patient</span>
                  <span className="font-bold text-slate-900">{selectedRecord.patient_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Test Date</span>
                  <span className="font-bold text-slate-900">{selectedRecord.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Facility</span>
                  <span className="font-bold text-slate-800">{selectedRecord.facility}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Attending Doctor</span>
                  <span className="font-bold text-slate-800">{selectedRecord.doctor}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Diagnostic Report Observations:</span>
                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-slate-800 leading-relaxed font-mono text-[11px]">
                  {selectedRecord.summary}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center gap-2 text-emerald-800 text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Diagnostic Integrity: Digitally authenticated by accredited hospital laboratory.</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRecordsTab;
