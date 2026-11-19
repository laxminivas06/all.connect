import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Upload, Camera, Sparkles, Check, AlertCircle, Plus, Trash2, Pill, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrescriptionUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDone, setOcrDone] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const [doctorName, setDoctorName] = useState('Dr. K. Srinivas Rao, MBBS MD');
  const [clinicName, setClinicName] = useState('Sai Ram Heart & Chest Clinic (External)');
  const [consultDate, setConsultDate] = useState(new Date().toISOString().split('T')[0]);
  const [advice, setAdvice] = useState('Drink warm fluids, steam inhalation twice daily.');
  const [rawText, setRawText] = useState('');

  const [medicines, setMedicines] = useState([
    { name: 'Metformin 500mg SR', dosage: '500mg', frequency: 'Twice Daily (Morning and Dinner)', duration: '30 Days', instructions: 'After food' },
    { name: 'Telmisartan 40mg', dosage: '40mg', frequency: 'Once Daily (Morning)', duration: '30 Days', instructions: 'Fixed hour' }
  ]);

  if (!isOpen) return null;

  const handleSimulateOcr = async () => {
    setOcrLoading(true);
    setError('');
    try {
      const res = await api.simulateOcr({});
      setDoctorName(res.extracted_doctor);
      setClinicName(res.extracted_clinic);
      setMedicines(res.suggested_medicines);
      setRawText(res.raw_text);
      setOcrDone(true);
    } catch {
      setError('Simulated OCR service temporary error. Please try again.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1 Tablet', frequency: 'Once Daily', duration: '5 Days', instructions: 'After meals' }]);
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleUpdateMedicine = (idx, field, val) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };

  const handleSavePrescription = async (findMedsNow = false) => {
    if (medicines.length === 0) {
      setError('Please add at least one medicine');
      return;
    }
    setSaveLoading(true);
    setError('');

    try {
      const payload = {
        doctor_name: doctorName,
        organization_name: clinicName,
        consultation_date: consultDate,
        medicines: medicines,
        advice: advice,
        image_base64_or_name: 'prescription_scan_camera_2026.jpg'
      };

      const res = await api.uploadOcrPrescription(payload);
      if (onSuccess) onSuccess(res.prescription);
      onClose();

      if (findMedsNow) {
        navigate('/pharmacy-search', { state: { medicines: medicines, prescription_id: res.prescription.id } });
      }
    } catch (err) {
      setError(err.message || 'Failed to save prescription');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-700 to-blue-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-teal-200" />
            <h3 className="font-bold text-base">Prescription Capture & Smart OCR Verification</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OCR Trigger Section */}
          <div className="border-2 border-dashed border-teal-200 bg-teal-50/40 rounded-xl p-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Simulate Camera / Prescription Scan
                </p>
                <p className="text-[11px] text-slate-500">Run the healthcare OCR engine to extract medicines and dosages automatically.</p>
              </div>
              <button
                type="button"
                onClick={handleSimulateOcr}
                disabled={ocrLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
              >
                {ocrLoading ? 'Scanning Prescription...' : 'Trigger OCR Analysis'}
              </button>
            </div>
          </div>

          {ocrDone && rawText && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">OCR Raw Extracted Handwriting:</span>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">{rawText}</pre>
            </div>
          )}

          {/* Extracted / Editable Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Prescribing Doctor</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hospital / Clinic Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Verified Medicine Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Extracted Medicines (Patient Verification Required)</span>
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="text-xs text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-2">
              {medicines.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Medicine name (e.g. Paracetamol 650mg)"
                      value={m.name}
                      onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                      className="flex-1 font-semibold text-slate-800 bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition"
                      title="Delete medicine row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={m.dosage}
                      onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                      className="bg-white px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="Frequency (e.g. Twice Daily)"
                      value={m.frequency}
                      onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                      className="bg-white px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 10 Days)"
                      value={m.duration}
                      onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                      className="bg-white px-2 py-1 border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Diet / Clinical Advice</label>
            <input
              type="text"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-slate-500 text-center sm:text-left">
            ⚠️ Healthcare safety rule: Always verify extracted medicines before ordering.
          </p>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSavePrescription(false)}
              disabled={saveLoading}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
            >
              Save to Locker
            </button>
            <button
              type="button"
              onClick={() => handleSavePrescription(true)}
              disabled={saveLoading}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify & Find Medicines</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
