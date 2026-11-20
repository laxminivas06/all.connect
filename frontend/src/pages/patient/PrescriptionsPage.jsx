import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PatientSubNav } from '../../components/patient/PatientSubNav';
import {
  FileText,
  Calendar,
  Building2,
  Stethoscope,
  Printer,
  Download,
  Search,
  AlertCircle,
  Pill,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';

export const PrescriptionsPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRx, setSelectedRx] = useState(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user && user.role === 'patient') {
        const res = await api.getMyPatientData();
        setPrescriptions(res.prescriptions || []);
      } else {
        const all = await api.getPrescriptions();
        setPrescriptions(Array.isArray(all) ? all : []);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
      setError(err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const filtered = prescriptions.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const docName = String(p.doctor_name || '').toLowerCase();
    const orgName = String(p.organization_name || '').toLowerCase();
    const diag = String(p.diagnosis || '').toLowerCase();
    const rxId = String(p.id || '').toLowerCase();
    return docName.includes(q) || orgName.includes(q) || diag.includes(q) || rxId.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PatientSubNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Digital Health Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Prescriptions & Medical Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Access certified digital prescriptions issued during your hospital and clinic consultations. Print or download anytime.
            </p>
          </div>

          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor, diagnosis, Rx ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading your prescriptions...</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((rx) => (
              <div
                key={rx.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      RX: {rx.id}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {rx.consultation_date || (rx.created_at ? rx.created_at.split('T')[0] : 'Recent')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {rx.doctor_name || 'Attending Physician'}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rx.organization_name || 'Hospital Consultation'}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Clinical Diagnosis</span>
                    <p className="font-bold text-slate-800 truncate">{rx.diagnosis || 'Standard General Checkup'}</p>
                  </div>

                  {Array.isArray(rx.medicines) && rx.medicines.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Prescribed Medicines ({rx.medicines.length})
                      </span>
                      <div className="space-y-1">
                        {rx.medicines.slice(0, 2).map((m, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] bg-slate-50/70 px-2.5 py-1 rounded-lg">
                            <span className="font-bold text-slate-800 truncate max-w-[140px]">{m.name}</span>
                            <span className="text-slate-500">{m.dosage}</span>
                          </div>
                        ))}
                        {rx.medicines.length > 2 && (
                          <p className="text-[10px] text-blue-600 font-bold pl-1">
                            +{rx.medicines.length - 2} more medications
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRx(rx)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Prescription</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRx(rx);
                      setTimeout(() => window.print(), 300);
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                    title="Print Prescription"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {searchQuery ? 'No Matching Prescriptions' : 'No prescriptions have been issued yet.'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `No prescriptions matched "${searchQuery}".`
                  : 'Prescriptions issued by your doctor during OPD appointments will automatically appear here once authorized.'}
              </p>
            </div>
            <Link
              to="/book-opd"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Search className="w-4 h-4" />
              <span>Book Doctor Consultation</span>
            </Link>
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Digital Prescription</h3>
                <p className="text-[11px] text-slate-400 font-mono">RX ID: {selectedRx.id}</p>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctor</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedRx.doctor_name}</span>
                  <span className="text-[11px] text-slate-500 block">{selectedRx.organization_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                  <span className="font-bold text-slate-700">{selectedRx.consultation_date || 'Recent'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Diagnosis:</span>
                <p className="font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedRx.diagnosis || 'Clinical OPD Evaluation'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1.5">Medicines:</span>
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
                      {selectedRx.medicines?.map((m, idx) => (
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

              {selectedRx.advice && (
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Doctor's Advice:</span>
                  <p className="text-slate-700 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-[11px]">
                    {selectedRx.advice}
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
                onClick={() => setSelectedRx(null)}
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

export default PrescriptionsPage;
