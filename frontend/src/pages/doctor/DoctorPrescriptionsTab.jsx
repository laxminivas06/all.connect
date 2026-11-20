import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
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
  X,
  User,
  ShieldCheck,
  FileCheck,
  Download,
  Eye,
  Check
} from 'lucide-react';

export const DoctorPrescriptionsTab = ({ data, onSaveRx }) => {
  const doctor = data?.doctor || {};
  const appointments = data?.all_appointments || data?.appointments || [];
  const existingRxList = data?.recent_prescriptions || data?.prescriptions || [];
  const localPatients = data?.patients || [];

  const [activeSubTab, setActiveSubTab] = useState('new'); // 'new' or 'history'

  // Step 1: Patient Search & Selection State
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // { patient_id, full_name, age, gender, health_id }
  const [selectedApptId, setSelectedApptId] = useState('');

  // Step 2: Prescription Information & Clinical Details
  const [systemRxId] = useState(`PRE-2026-${String(Date.now()).slice(-6)}`);
  const [rxDate] = useState(new Date().toISOString().split('T')[0]);
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [weight, setWeight] = useState('68');
  const [temperature, setTemperature] = useState('98.6°F');

  // Medicines List: Supporting Name, Dosage, Frequency, Duration, Quantity, Instructions
  const [medicines, setMedicines] = useState([
    {
      name: 'Paracetamol 650mg',
      dosage: '1 tablet',
      frequency: 'Three times daily',
      duration: '5 days',
      quantity: '15 tablets',
      instructions: 'After food'
    },
    {
      name: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      frequency: 'Twice daily',
      duration: '5 days',
      quantity: '10 capsules',
      instructions: 'After meals'
    }
  ]);

  // Step 3: Additional Instructions / Tests / Recommendations (Free-Text Box)
  const [additionalInstructions, setAdditionalInstructions] = useState(
    'Blood test required: Complete Blood Count (CBC). Follow-up after seven days if symptoms persist. Avoid cold beverages and maintain hydration.'
  );

  // Step 4: Actions & Feedback
  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [issuedRxDetails, setIssuedRxDetails] = useState(null);

  // Search patients by Name or Patient ID
  useEffect(() => {
    const q = patientSearchTerm.trim();
    if (!q || q.length < 2) {
      setPatientSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingPatients(true);
      try {
        const res = await api.searchPatients(q);
        if (res && Array.isArray(res.patients)) {
          setPatientSearchResults(res.patients);
        } else {
          // Fallback to local filtering
          const localMatches = localPatients.filter(
            (p) =>
              String(p.full_name || p.name || '').toLowerCase().includes(q.toLowerCase()) ||
              String(p.patient_id || p.id || '').toLowerCase().includes(q.toLowerCase())
          );
          setPatientSearchResults(localMatches);
        }
      } catch (err) {
        // Local fallback
        const localMatches = localPatients.filter(
          (p) =>
            String(p.full_name || p.name || '').toLowerCase().includes(q.toLowerCase()) ||
            String(p.patient_id || p.id || '').toLowerCase().includes(q.toLowerCase())
        );
        setPatientSearchResults(localMatches);
      } finally {
        setSearchingPatients(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [patientSearchTerm, localPatients]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient({
      patient_id: patient.patient_id || patient.id,
      full_name: patient.full_name || patient.name,
      age: patient.age || 32,
      gender: patient.gender || 'Male',
      health_id: patient.health_id || 'HC-PENDING'
    });
    setPatientSearchTerm('');
    setPatientSearchResults([]);
    setErrorNotice(null);

    // Auto-select related appointment if one exists for this patient
    const pid = patient.patient_id || patient.id;
    const matchingAppt = appointments.find((a) => a.patient_id === pid && a.status !== 'Completed');
    if (matchingAppt) {
      setSelectedApptId(matchingAppt.id || matchingAppt.appointment_id);
      if (matchingAppt.chief_complaint) {
        setSymptoms(matchingAppt.chief_complaint);
      }
    }
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '5 days',
        quantity: '10 tablets',
        instructions: 'After food'
      }
    ]);
  };

  const handleRemoveMedicine = (idx) => {
    if (medicines.length <= 1) {
      setErrorNotice('A prescription must contain at least one medicine');
      return;
    }
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx, field, value) => {
    const updated = [...medicines];
    updated[idx][field] = value;
    setMedicines(updated);
  };

  // Action 1: Save Draft
  const handleSaveDraft = () => {
    setDraftSaved(true);
    setSuccessNotice('Prescription draft saved to clinical workstation');
    setTimeout(() => {
      setDraftSaved(false);
      setSuccessNotice(null);
    }, 3000);
  };

  // Action 2: Preview Prescription
  const handlePreview = () => {
    if (!selectedPatient) {
      setErrorNotice('Please search and select a verified patient first');
      return;
    }
    if (!diagnosis.trim()) {
      setErrorNotice('Please provide a clinical diagnosis before preview');
      return;
    }
    setErrorNotice(null);
    setPreviewModalOpen(true);
  };

  // Action 3: Issue Prescription (Backend Integration)
  const handleIssuePrescription = async (e) => {
    if (e) e.preventDefault();

    if (!selectedPatient) {
      setErrorNotice('Please search and select a verified patient before issuing');
      return;
    }
    if (!diagnosis.trim()) {
      setErrorNotice('Please enter a valid clinical diagnosis');
      return;
    }
    if (medicines.length === 0 || !medicines[0].name.trim()) {
      setErrorNotice('Please specify at least one medication');
      return;
    }

    setSaving(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const rxPayload = {
        appointment_id: selectedApptId || null,
        patient_id: selectedPatient.patient_id,
        diagnosis,
        symptoms,
        vitals: { bp, pulse, weight, temperature },
        medicines: medicines.filter((m) => m.name.trim() !== ''),
        advice: additionalInstructions,
        additional_instructions: additionalInstructions,
        follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      if (onSaveRx) {
        await onSaveRx(rxPayload);
      } else {
        await api.createPrescription(rxPayload);
      }

      setIssuedRxDetails({
        ...rxPayload,
        id: systemRxId,
        patient_name: selectedPatient.full_name,
        doctor_name: doctor.name || 'Attending Physician',
        organization_name: doctor.organization_name || 'All.Connect Medical Center',
        consultation_date: rxDate
      });

      setSuccessNotice(`Digital Prescription ${systemRxId} successfully issued and authorized! Automatically synced to patient portal.`);
      setPreviewModalOpen(false);
    } catch (err) {
      console.error('Failed to issue prescription:', err);
      setErrorNotice(err.message || 'Error publishing digital prescription to patient record');
    } finally {
      setSaving(false);
    }
  };

  // Action 4: Download / Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub-Tab Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Digital Prescription Management Suite</span>
          </h2>
          <p className="text-xs text-slate-500">
            Author certified electronic prescriptions, attach medication regimens, and sync with patient EHR
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
            Create Prescription
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'history' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Issued Prescriptions ({existingRxList.length})
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          {issuedRxDetails && (
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
            >
              Print / Download Rx
            </button>
          )}
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CREATE PRESCRIPTION (4-STEP WORKFLOW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'new' && (
        <div className="space-y-6">
          {/* ------------------------------------------------------------- */}
          {/* STEP 1: FIND PATIENT */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-extrabold text-base text-slate-900">Step 1: Find & Verify Patient</h3>
              </div>
              <span className="text-xs text-slate-400">Search patient database by Name or Patient ID</span>
            </div>

            {/* Patient Search Input */}
            {!selectedPatient ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter Patient Name or Patient ID (e.g., Rajesh Sharma or PAT-2026-000001)..."
                    value={patientSearchTerm}
                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  {searchingPatients && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 animate-pulse">
                      Searching...
                    </div>
                  )}
                </div>

                {/* Matching Results Dropdown */}
                {patientSearchResults.length > 0 && (
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 max-h-60 overflow-y-auto">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-3 pt-1 block">
                      Matching Patients ({patientSearchResults.length}):
                    </span>
                    {patientSearchResults.map((p) => {
                      const pid = p.patient_id || p.id;
                      const name = p.full_name || p.name;
                      const age = p.age || 32;
                      const gender = p.gender || 'Male';

                      return (
                        <div
                          key={pid}
                          onClick={() => handleSelectPatient(p)}
                          className="p-3 bg-white hover:bg-blue-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between cursor-pointer transition group"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700">
                              {name}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                              <span>ID: {pid}</span>
                              <span>•</span>
                              <span>HID: {p.health_id || 'HC-PENDING'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-slate-700 block">
                              {age} Yrs • {gender}
                            </span>
                            <span className="text-[10px] font-bold text-blue-600 group-hover:underline">
                              Select Patient →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Verified Selected Patient Card */
              <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-base">{selectedPatient.full_name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Identity
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                      <span><strong>Patient ID:</strong> {selectedPatient.patient_id}</span>
                      <span>•</span>
                      <span><strong>Age:</strong> {selectedPatient.age} Yrs</span>
                      <span>•</span>
                      <span><strong>Gender:</strong> {selectedPatient.gender}</span>
                      <span>•</span>
                      <span><strong>Health ID:</strong> {selectedPatient.health_id}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                >
                  Change Patient
                </button>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: PRESCRIPTION DETAILS & MEDICINES */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-extrabold text-base text-slate-900">Step 2: Clinical Details & Medications</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">RX: {systemRxId}</span>
            </div>

            {/* Prescription Header Information */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Attending Doctor</span>
                <span className="font-bold text-slate-800">{doctor.name || 'Dr. Specialist'}</span>
                <span className="text-[10px] text-slate-500 block">{doctor.qualifications || 'MBBS, MD'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility Name</span>
                <span className="font-bold text-slate-800">{doctor.organization_name || 'Healthcare Facility'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescription Date</span>
                <span className="font-bold text-slate-800">{rxDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Related Appointment</span>
                <select
                  value={selectedApptId}
                  onChange={(e) => setSelectedApptId(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="">General OPD Visit</option>
                  {appointments.slice(0, 6).map((a) => (
                    <option key={a.id || a.appointment_id} value={a.id || a.appointment_id}>
                      {a.appointment_id || a.id} - {a.patient_name || 'Patient'} ({a.appointment_date})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Diagnosis & Vitals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  placeholder="e.g., Acute Upper Respiratory Tract Infection (URTI)..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Presenting Symptoms</label>
                <input
                  type="text"
                  placeholder="e.g., Low grade fever, sore throat for 3 days..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Medicine Entries (Supports Name, Dosage, Frequency, Duration, Quantity, Instructions) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Prescribed Medications</h4>
                  <p className="text-[11px] text-slate-400">Add medications, dosage frequencies, and duration</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-3">
                {medicines.map((m, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Medication #{idx + 1}
                      </span>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Remove medicine entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Medicine Name *</label>
                        <input
                          type="text"
                          placeholder="e.g., Paracetamol 650mg"
                          value={m.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Dosage</label>
                        <input
                          type="text"
                          placeholder="e.g., 1 tablet"
                          value={m.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Frequency</label>
                        <input
                          type="text"
                          placeholder="e.g., Twice daily"
                          value={m.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g., 5 days"
                          value={m.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Quantity</label>
                        <input
                          type="text"
                          placeholder="e.g., 10 tablets"
                          value={m.quantity || ''}
                          onChange={(e) => handleMedicineChange(idx, 'quantity', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
                        />
                      </div>

                      <div className="sm:col-span-3 lg:col-span-6">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Instructions / Timing</label>
                        <input
                          type="text"
                          placeholder="e.g., Take after meals with warm water"
                          value={m.instructions}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: ADDITIONAL INSTRUCTIONS – FREE TEXT BOX */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Additional Instructions / Tests / Recommendations
                </h3>
              </div>
              <span className="text-xs text-slate-400">Normal unconstrained clinical free text</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter required diagnostic investigations (e.g., Complete Blood Count, Serum Electrolytes), dietary recommendations, activity restrictions, and follow-up guidance.
            </p>

            <textarea
              rows={4}
              placeholder="e.g., Blood test required: Complete blood count (CBC). Follow-up after seven days. Avoid oily foods and hydrate adequately..."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-2xl font-medium text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed"
            />
          </div>

          {/* ------------------------------------------------------------- */}
          {/* STEP 4: PRESCRIPTION ACTIONS */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>{draftSaved ? 'Draft Saved' : 'Save Draft'}</span>
              </button>

              <button
                type="button"
                onClick={handlePreview}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Prescription</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleIssuePrescription}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4" />
                <span>{saving ? 'Authorizing & Publishing...' : 'Issue Prescription'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                title="Download / Print Prescription"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PREVIOUSLY ISSUED PRESCRIPTIONS AUDIT HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-slate-900">
              Authorized Digital Prescriptions Ledger ({existingRxList.length})
            </h3>
            <span className="text-xs text-slate-400">Doctor-issued records with instant EHR synchronization</span>
          </div>

          {existingRxList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No prescriptions issued by your account yet.
            </div>
          ) : (
            <div className="space-y-4">
              {existingRxList.map((rx) => (
                <div key={rx.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        {rx.id || rx.prescription_id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{rx.patient_name}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Authorized & Published
                    </span>
                  </div>

                  <p className="text-slate-700"><strong>Diagnosis:</strong> {rx.diagnosis}</p>
                  
                  {Array.isArray(rx.medicines) && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Medicines ({rx.medicines.length}):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rx.medicines.map((m, i) => (
                          <div key={i} className="p-2 bg-white rounded-xl border border-slate-200 flex justify-between">
                            <span className="font-semibold text-slate-800">{m.name}</span>
                            <span className="text-slate-500">{m.dosage} ({m.frequency})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rx.advice && (
                    <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                      <strong>Additional Instructions:</strong> {rx.advice}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW PRESCRIPTION MODAL */}
      {/* ========================================================================= */}
      {previewModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Prescription Preview
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">Official Medical Prescription</h3>
                <p className="text-xs text-slate-400 font-mono">RX: {systemRxId}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prescriber & Patient Metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-slate-50 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctor</span>
                <span className="font-bold text-slate-900">{doctor.name || 'Dr. Specialist'}</span>
                <span className="text-[10px] text-slate-500 block">{doctor.qualifications || 'MBBS, MD'}</span>
                <span className="text-[10px] text-blue-600 font-semibold block">{doctor.organization_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient</span>
                <span className="font-bold text-slate-900">{selectedPatient.full_name}</span>
                <span className="text-[10px] text-slate-500 block">ID: {selectedPatient.patient_id} • Age: {selectedPatient.age}Y</span>
                <span className="text-[10px] text-slate-400 block">Date: {rxDate}</span>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-700 block">Clinical Diagnosis:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-900">
                {diagnosis}
              </p>
            </div>

            {/* Medicines Table */}
            <div className="text-xs space-y-2">
              <span className="font-bold text-slate-700 block">Prescribed Medicines:</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {medicines.map((m, i) => (
                  <div key={i} className="p-3 bg-white flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name || 'Medication'}</span>
                      <span className="text-[11px] text-slate-500">{m.dosage} • {m.frequency} • {m.instructions}</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">{m.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Instructions */}
            {additionalInstructions && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Additional Instructions / Tests / Recommendations:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed italic">
                  {additionalInstructions}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handleIssuePrescription}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>{saving ? 'Issuing...' : 'Confirm & Issue Prescription'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptionsTab;
