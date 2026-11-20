import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Save,
  Building2,
  Calendar,
  Clock,
  Search,
  Sparkles,
  Stethoscope,
  X
} from 'lucide-react';

export const DoctorPrescriptionsTab = ({ data, onSaveRx }) => {
  const doctor = data?.doctor || {};
  const appointments = data?.appointments || [];
  const existingRxList = data?.prescriptions || [];

  const [activeSubTab, setActiveSubTab] = useState('new'); // 'new' or 'history'
  const [selectedApptId, setSelectedApptId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [weight, setWeight] = useState('68');
  const [temperature, setTemperature] = useState('98.6°F');
  const [advice, setAdvice] = useState('Adequate hydration, warm saline gargles, avoid cold drinks, and report back if symptoms persist.');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [medicines, setMedicines] = useState([
    { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'Three times daily', duration: '5 days', instructions: 'After food' },
    { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }
  ]);

  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [previewRx, setPreviewRx] = useState(null);

  const handleSelectAppointment = (apptId) => {
    setSelectedApptId(apptId);
    const appt = appointments.find((a) => (a.id || a.appointment_id) === apptId);
    if (appt) {
      setPatientName(appt.patient_name || '');
      setSymptoms(appt.chief_complaint || '');
    }
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '1 tablet', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' }
    ]);
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx, field, value) => {
    const updated = [...medicines];
    updated[idx][field] = value;
    setMedicines(updated);
  };

  const handleSubmitRx = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setErrorNotice('Please provide a clinical diagnosis');
      return;
    }
    if (medicines.length === 0 || !medicines[0].name.trim()) {
      setErrorNotice('Please add at least one valid medication');
      return;
    }

    setSaving(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const rxPayload = {
        appointment_id: selectedApptId || `APT-${Date.now()}`,
        patient_name: patientName || 'Outpatient Consultation',
        doctor_name: doctor.name || 'Dr. Specialist',
        organization_name: doctor.organization_name || 'Healthcare Facility',
        consultation_date: new Date().toISOString().split('T')[0],
        diagnosis,
        symptoms,
        vitals: { bp, pulse, weight, temperature },
        medicines,
        advice,
        follow_up_date: followUpDate
      };

      if (onSaveRx) {
        await onSaveRx(rxPayload);
      }
      setSuccessNotice('Digital Medical Prescription generated and signed successfully!');
      setPreviewRx(rxPayload);
    } catch (err) {
      setErrorNotice(err.message || 'Failed to record prescription');
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
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Digital Prescription Suite & Clinical Orders</span>
          </h2>
          <p className="text-xs text-slate-500">
            Generate, sign, and issue standardized digital prescriptions with real-time patient portal sync
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('new')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'new' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Digital Rx
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'history' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Issued Rx History ({existingRxList.length})
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* NEW PRESCRIPTION FORM */}
      {activeSubTab === 'new' && (
        <form onSubmit={handleSubmitRx} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          {/* Patient Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Link to OPD Appointment</label>
              <select
                value={selectedApptId}
                onChange={(e) => handleSelectAppointment(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Today's Appointment (Optional)</option>
                {appointments.slice(0, 10).map((a) => (
                  <option key={a.id || a.appointment_id} value={a.id || a.appointment_id}>
                    {a.token_number || 'OPD'} - {a.patient_name} ({a.appointment_time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Patient Vitals at Triage</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Heart Rate (Pulse)</label>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="72 bpm"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Body Weight (kg)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="68 kg"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Temperature</label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="98.6°F"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis & Symptoms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Viral Pharyngitis / Hypertension Stage 1"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Chief Symptoms & Presentation</label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Sore throat, mild fever for 2 days, dry cough"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Medicines Dynamic Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700">Prescribed Medications</span>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase">
                  <tr>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Instructions</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-2.5">
                        <input
                          type="text"
                          required
                          value={m.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Paracetamol 650mg"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900 bg-white"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={m.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          placeholder="1 tab"
                          className="w-24 px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white"
                        />
                      </td>
                      <td className="p-2.5">
                        <select
                          value={m.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white"
                        >
                          <option value="Once Daily in Morning">Once Daily in Morning</option>
                          <option value="Once Daily at Bedtime">Once Daily at Bedtime</option>
                          <option value="Twice Daily after meals">Twice Daily after meals</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="As Needed / SOS">As Needed / SOS</option>
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={m.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          placeholder="5 days"
                          className="w-20 px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={m.instructions}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          placeholder="After food"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advice & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Clinical Advice & Lifestyle Instructions</label>
              <textarea
                rows={2}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Next Follow-Up Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Signing & Saving...' : 'Sign & Issue Digital Prescription'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ISSUED PRESCRIPTIONS HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Previously Issued Prescriptions</h3>
          {existingRxList.length === 0 ? (
            <p className="text-slate-400 text-xs italic py-8 text-center">No digital prescriptions issued yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {existingRxList.map((rx) => (
                <div key={rx.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      RX: {rx.id}
                    </span>
                    <span className="text-[11px] text-slate-400">{rx.consultation_date}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{rx.patient_name || 'Patient'}</h4>
                    <p className="text-xs text-slate-600 mt-0.5"><strong>Diagnosis:</strong> {rx.diagnosis}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPreviewRx(rx)}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
                    >
                      View Rx
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescription Preview Modal */}
      {previewRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Signed Digital Prescription</h3>
                <p className="text-[10px] text-slate-400 font-mono">ID: {previewRx.id || previewRx.appointment_id}</p>
              </div>
              <button onClick={() => setPreviewRx(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient</span>
                  <span className="font-bold text-slate-900">{previewRx.patient_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Date</span>
                  <span className="font-bold text-slate-800">{previewRx.consultation_date}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Diagnosis:</span>
                <p className="p-2 bg-slate-50 rounded-lg text-slate-800 font-medium">{previewRx.diagnosis}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Medications:</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px]">
                      <tr>
                        <th className="p-2">Medicine</th>
                        <th className="p-2">Dosage</th>
                        <th className="p-2">Frequency</th>
                        <th className="p-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRx.medicines?.map((m, i) => (
                        <tr key={i}>
                          <td className="p-2 font-bold text-slate-900">{m.name}</td>
                          <td className="p-2 text-slate-600">{m.dosage}</td>
                          <td className="p-2 text-slate-600">{m.frequency}</td>
                          <td className="p-2 text-slate-600">{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {previewRx.advice && (
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Doctor's Advice:</span>
                  <p className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-[11px]">{previewRx.advice}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Rx</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewRx(null)}
                className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
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

export default DoctorPrescriptionsTab;
