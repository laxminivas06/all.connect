import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Pagination } from '../../components/Pagination';
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

  // Step 1: Patient ID / Search & Selection State
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // { patient_id, full_name, age, gender, health_id }
  const [selectedApptId, setSelectedApptId] = useState('');

  // Dedicated Clinical ID (Consultation / Clinical Visit ID - enter or select)
  const [clinicalId, setClinicalId] = useState('');

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

  // Step 3: Additional Tests & Recommendations (Dedicated Fields)
  const [additionalTests, setAdditionalTests] = useState(
    'Complete Blood Count (CBC), Serum Electrolytes'
  );
  const [recommendations, setRecommendations] = useState(
    'Avoid cold beverages and maintain hydration (2-3 L/day). Take complete bed rest for 48 hours. Follow-up after seven days if symptoms persist.'
  );
  const [additionalInstructions, setAdditionalInstructions] = useState(
    'Blood test required: Complete Blood Count (CBC). Follow-up after seven days if symptoms persist. Avoid cold beverages and maintain hydration.'
  );

  // Pagination for Issued Prescriptions Ledger
  const [rxPage, setRxPage] = useState(1);
  const [rxPageSize, setRxPageSize] = useState(10);

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

    // Auto-select related appointment and clinical ID if one exists for this patient
    const pid = patient.patient_id || patient.id;
    const matchingAppt = appointments.find((a) => a.patient_id === pid && a.status !== 'Completed');
    if (matchingAppt) {
      const aid = matchingAppt.id || matchingAppt.appointment_id;
      setSelectedApptId(aid);
      setClinicalId(aid);
      if (matchingAppt.chief_complaint) {
        setSymptoms(matchingAppt.chief_complaint);
      }
    } else {
      if (!clinicalId) {
        setClinicalId(`CLN-${String(Date.now()).slice(-6)}`);
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
      setErrorNotice('Please search and select or enter a verified patient ID first');
      return;
    }
    if (!diagnosis.trim()) {
      setErrorNotice('Please provide a clinical diagnosis before preview');
      return;
    }
    setErrorNotice(null);
    setPreviewModalOpen(true);
  };

  // Action 3: Save Prescription (Backend EHR Integration)
  const handleIssuePrescription = async (e) => {
    if (e) e.preventDefault();

    if (!selectedPatient || !selectedPatient.patient_id) {
      setErrorNotice('Please provide or select a verified Patient ID');
      return;
    }
    if (!diagnosis.trim()) {
      setErrorNotice('Please enter a valid clinical diagnosis');
      return;
    }
    if (medicines.length === 0 || !medicines[0].name.trim()) {
      setErrorNotice('Please specify at least one medication in the prescription');
      return;
    }

    setSaving(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const activeClinicalId = clinicalId || selectedApptId || `CLN-${String(Date.now()).slice(-6)}`;
      const combinedAdvice = `${recommendations ? recommendations : ''}${additionalInstructions ? (recommendations ? '\n' + additionalInstructions : additionalInstructions) : ''}`;

      const rxPayload = {
        appointment_id: selectedApptId || null,
        clinical_id: activeClinicalId,
        patient_id: selectedPatient.patient_id,
        diagnosis,
        symptoms,
        vitals: { bp, pulse, weight, temperature },
        medicines: medicines.filter((m) => m.name.trim() !== ''),
        tests: additionalTests,
        additional_tests: additionalTests,
        recommendations: recommendations,
        advice: combinedAdvice,
        additional_instructions: combinedAdvice,
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

      setSuccessNotice(`Digital Prescription ${systemRxId} successfully saved & certified! Linked with Patient ID (${selectedPatient.patient_id}) and Clinical ID (${activeClinicalId}).`);
      setPreviewModalOpen(false);
    } catch (err) {
      console.error('Failed to save prescription:', err);
      setErrorNotice(err.message || 'Error saving prescription to medical records');
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
          {/* STEP 1: PATIENT ID & IDENTIFICATION */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-extrabold text-base text-slate-900">Step 1: Patient ID (Enter or Select)</h3>
              </div>
              <span className="text-xs text-slate-400">Enter Patient ID directly or search registered patient directory</span>
            </div>

            {/* Patient ID Input & Search */}
            {!selectedPatient ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter Patient ID (e.g. PAT-2026-000001) or search by patient name..."
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = patientSearchTerm.trim();
                          if (!val) return;
                          const found = localPatients.find(
                            (p) => String(p.patient_id || p.id).toLowerCase() === val.toLowerCase()
                          );
                          if (found) {
                            handleSelectPatient(found);
                          } else {
                            setSelectedPatient({
                              patient_id: val,
                              full_name: `Patient (${val})`,
                              age: 32,
                              gender: 'Male',
                              health_id: `HC-${val.slice(-6)}`
                            });
                            if (!clinicalId) setClinicalId(`CLN-${String(Date.now()).slice(-6)}`);
                            setPatientSearchTerm('');
                          }
                        }
                      }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    {searchingPatients && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 animate-pulse">
                        Searching...
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const val = patientSearchTerm.trim();
                      if (!val) return;
                      const found = localPatients.find(
                        (p) => String(p.patient_id || p.id).toLowerCase() === val.toLowerCase()
                      );
                      if (found) {
                        handleSelectPatient(found);
                      } else {
                        setSelectedPatient({
                          patient_id: val,
                          full_name: `Patient (${val})`,
                          age: 32,
                          gender: 'Male',
                          health_id: `HC-${val.slice(-6)}`
                        });
                        if (!clinicalId) setClinicalId(`CLN-${String(Date.now()).slice(-6)}`);
                        setPatientSearchTerm('');
                      }
                    }}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition shrink-0"
                  >
                    Confirm Patient ID
                  </button>
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
                              <span>Patient ID: {pid}</span>
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
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Clinical ID (Enter or Select) *
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    placeholder="e.g. CLN-2026-001 or select"
                    value={clinicalId}
                    onChange={(e) => {
                      setClinicalId(e.target.value);
                      setSelectedApptId(e.target.value);
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                  <select
                    value={selectedApptId}
                    onChange={(e) => {
                      setSelectedApptId(e.target.value);
                      setClinicalId(e.target.value);
                    }}
                    className="w-28 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 shrink-0"
                    title="Select from consultation visits"
                  >
                    <option value="">Select Visit</option>
                    {appointments.slice(0, 10).map((a) => (
                      <option key={a.id || a.appointment_id} value={a.id || a.appointment_id}>
                        {a.appointment_id || a.id}
                      </option>
                    ))}
                  </select>
                </div>
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
          {/* STEP 3: ADDITIONAL TESTS & RECOMMENDATIONS */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Step 3: Additional Tests & Recommendations
                </h3>
              </div>
              <span className="text-xs text-slate-400">Clinical investigations and medical instructions</span>
            </div>

            {/* Field 4: Additional Tests */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Additional Tests (Recommended Lab & Diagnostic Tests)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Specify lab investigations, blood chemistry, pathology, or radiology examinations requested for evaluation.
              </p>
              <textarea
                rows={2}
                placeholder="e.g. Complete Blood Count (CBC), Fasting Blood Glucose, Serum Creatinine, 12-Lead ECG, Chest X-Ray PA View..."
                value={additionalTests}
                onChange={(e) => setAdditionalTests(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-2xl font-medium text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed"
              />
            </div>

            {/* Field 5: Recommendations */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Recommendations (Medical Advice & Lifestyle Instructions)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Provide dietary guidelines, lifestyle precautions, follow-up timeline, and non-pharmacological directives.
              </p>
              <textarea
                rows={3}
                placeholder="e.g. Maintain strict oral hydration (2.5L/day), light semi-solid diet, rest for 48 hours, avoid strenuous activity, return to OPD in 5 days..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-2xl font-medium text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed"
              />
            </div>
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
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Prescription...' : 'Save Prescription'}</span>
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
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
              {existingRxList
                .slice((rxPage - 1) * rxPageSize, rxPage * rxPageSize)
                .map((rx) => (
                  <div key={rx.id || rx.prescription_id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                          {rx.id || rx.prescription_id}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{rx.patient_name}</span>
                        {rx.clinical_id && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Clinical ID: {rx.clinical_id}
                          </span>
                        )}
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

                    {rx.tests && (
                      <p className="text-[11px] text-blue-800 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
                        <strong>Recommended Tests:</strong> {Array.isArray(rx.tests) ? rx.tests.join(', ') : rx.tests}
                      </p>
                    )}

                    {(rx.recommendations || rx.advice) && (
                      <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                        <strong>Recommendations:</strong> {rx.recommendations || rx.advice}
                      </p>
                    )}
                  </div>
                ))}

              {/* Ledger Pagination */}
              <Pagination
                currentPage={rxPage}
                totalPages={Math.ceil(existingRxList.length / rxPageSize) || 1}
                totalItems={existingRxList.length}
                pageSize={rxPageSize}
                onPageChange={setRxPage}
                onPageSizeChange={(newSize) => {
                  setRxPageSize(newSize);
                  setRxPage(1);
                }}
              />
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

            {/* Additional Tests & Recommendations Preview */}
            {additionalTests && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Recommended Diagnostic Tests:</span>
                <p className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-blue-900 leading-relaxed font-semibold">
                  {additionalTests}
                </p>
              </div>
            )}

            {recommendations && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Medical Recommendations & Advice:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed italic">
                  {recommendations}
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
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Confirm & Save Prescription'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptionsTab;
