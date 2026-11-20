import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  PlusCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  Edit,
  Trash2,
  Phone,
  Mail,
  Award,
  DollarSign,
  Coffee,
  X,
  Lock,
  Search,
  Filter,
  ArrowLeft,
  Save,
  UserCheck,
  ChevronRight,
  Eye,
  RefreshCw,
  Video,
  MapPin,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

export const DoctorsTab = ({
  doctors = [],
  appointments = [],
  isSingleDoctor = false,
  orgType = 'hospital',
  data = null,
  initialView = 'all',
  onRefresh,
  addDoctorOpen,
  setAddDoctorOpen
}) => {
  const effectiveDoctors = doctors.length > 0 ? doctors : (data?.doctors || []);
  const effectiveAppointments = appointments.length > 0 ? appointments : (data?.recent_appointments || []);
  const singleDoc = isSingleDoctor || data?.is_single_doctor;

  // View mode: 'all' | 'assignments' | 'availability'
  const [viewMode, setViewMode] = useState(initialView);
  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState(null);
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modals for Availability & Reassignment
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedDoctorForAvail, setSelectedDoctorForAvail] = useState(null);
  const [availForm, setAvailForm] = useState({
    is_available: true,
    is_on_leave: false,
    leave_start: '',
    leave_end: '',
    leave_reason: '',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    working_hours: '09:30 AM - 05:30 PM',
    break_times: '01:00 PM - 02:00 PM',
    appointment_duration: 15,
    slot_limits: 25
  });
  const [availLoading, setAvailLoading] = useState(false);

  // Assignment Modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedApptForAssign, setSelectedApptForAssign] = useState(null);
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [reassignLoading, setReassignLoading] = useState(false);
  const [assignmentDetailsModalOpen, setAssignmentDetailsModalOpen] = useState(false);
  const [selectedAssignmentDetails, setSelectedAssignmentDetails] = useState(null);

  // Add Doctor Form State
  const departmentPresets = {
    'Cardiology': {
      keywords: 'heart, chest pain, palpitations, cardiac, bp, blood pressure, cholesterol, angina, ecg, bypass',
      conditions: 'Coronary Artery Disease, Hypertension, Arrhythmia, Heart Failure, Angina Pectoris'
    },
    'General Medicine': {
      keywords: 'fever, cough, cold, weakness, fatigue, infection, headache, flu, chills, viral, malaise, body ache',
      conditions: 'Viral Fever, Respiratory Infection, Diabetes Management, Hypertension, General Checkup'
    },
    'General Surgery': {
      keywords: 'hernia, appendix, appendicitis, gallstones, piles, fistula, fissure, biopsy, swelling, cyst, abscess',
      conditions: 'Inguinal Hernia, Acute Appendicitis, Cholelithiasis, Anorectal Fissure, Soft Tissue Cysts'
    },
    'Orthopedics': {
      keywords: 'bone, joint, knee, fracture, back pain, arthritis, sprain, spine, shoulder, disc, ortho, ligament',
      conditions: 'Osteoarthritis, Ligament Tear, Knee Pain, Lumbar Spondylosis, Sports Injury, Bone Fractures'
    },
    'Pediatrics': {
      keywords: 'child, infant, baby, newborn, vaccination, pediatric, growth, immunization, kids',
      conditions: 'Childhood Viral Infections, Growth Monitoring, Routine Immunization, Pediatric Allergy, Colic'
    },
    'Dermatology': {
      keywords: 'skin, acne, rash, itching, hair fall, dandruff, eczema, psoriasis, dermatologist, allergy',
      conditions: 'Acne Vulgaris, Eczema, Psoriasis, Alopecia Areata, Fungal Infections, Contact Dermatitis'
    },
    'Neurology': {
      keywords: 'brain, nerve, migraine, stroke, paralysis, seizure, epilepsy, numbness, dizziness, tremors',
      conditions: 'Migraine, Epilepsy, Peripheral Neuropathy, Stroke Rehabilitation, Essential Tremors'
    },
    'Ophthalmology': {
      keywords: 'eye, vision, cataract, glaucoma, squint, blurry, specs, retina, cornea, lasik, dry eye',
      conditions: 'Cataract, Refractive Errors, Glaucoma, Dry Eye Syndrome, Diabetic Retinopathy'
    },
    'ENT': {
      keywords: 'ear, nose, throat, sinusitis, tonsils, hearing, tinnitus, hoarseness, dizziness, ear pain',
      conditions: 'Chronic Sinusitis, Tonsillitis, Deviated Nasal Septum, Otitis Media, Allergic Rhinitis'
    },
    'Gastroenterology': {
      keywords: 'stomach, acidity, digestion, liver, jaundice, endoscopy, gas, gastritis, reflux, ibs, ulcer',
      conditions: 'GERD, Non-Alcoholic Fatty Liver, Chronic Gastritis, Irritable Bowel Syndrome, Peptic Ulcers'
    },
    'Gynecology': {
      keywords: 'pregnancy, periods, menstrual, pcod, pcos, uterine, delivery, cramps, infertility, fibroid',
      conditions: 'PCOS / PCOD, Antenatal Care, Menstrual Irregularities, Uterine Fibroids, High Risk Pregnancy'
    },
    'Urology': {
      keywords: 'kidney, stone, urine, prostate, urinary tract, uti, bladder, hematuria',
      conditions: 'Renal Calculi, Benign Prostatic Hyperplasia, Recurrent UTI, Urinary Incontinence'
    },
    'Pulmonology': {
      keywords: 'asthma, breathing, lungs, bronchitis, pneumonia, wheezing, shortness of breath, respiratory',
      conditions: 'Bronchial Asthma, COPD, Pneumonia, Allergic Bronchitis, Sleep Apnea'
    },
    'Psychiatry': {
      keywords: 'anxiety, depression, sleep, stress, mental health, mood, insomnia, panic',
      conditions: 'Generalized Anxiety Disorder, Major Depressive Disorder, Insomnia, Panic Disorder'
    }
  };

  const [doctorForm, setDoctorForm] = useState({
    name: 'Dr. ',
    profile_photo_url: '',
    qualifications: 'MBBS, MD',
    specialization: 'General Medicine',
    department: 'General Medicine',
    medical_registration_number: 'TSMC-',
    experience_years: 6,
    contact_number: '+91 98490 ',
    email: '',
    consultation_fee: 600,
    consultation_type: 'Both',
    medical_keywords: 'fever, cough, cold, weakness, fatigue, infection, headache, flu, chills, viral',
    conditions_treated: 'Viral Fever, Respiratory Infection, Diabetes Management, Hypertension',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    working_hours: '09:30 AM - 05:30 PM',
    consultation_hours: '09:30 AM - 01:30 PM',
    break_times: '01:00 PM - 02:00 PM',
    appointment_duration: 15,
    slot_limits: 25,
    services_offered: 'Comprehensive outpatient clinical review, diagnosis, and prescription management.',
    description: 'Experienced specialist dedicated to patient-centered evidence-based care.',
    password: 'Doctor@123'
  });
  const [addDoctorLoading, setAddDoctorLoading] = useState(false);

  const departmentsList = useMemo(() => {
    const set = new Set();
    effectiveDoctors.forEach(d => {
      if (d.department) set.add(d.department);
      if (d.specialization) set.add(d.specialization);
    });
    return ['All', ...Array.from(set)];
  }, [effectiveDoctors]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return effectiveDoctors.filter(doc => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        (doc.name || '').toLowerCase().includes(q) ||
        (doc.id || '').toLowerCase().includes(q) ||
        (doc.specialization || '').toLowerCase().includes(q) ||
        (doc.department || '').toLowerCase().includes(q) ||
        (doc.medical_registration_number || '').toLowerCase().includes(q) ||
        (doc.phone || doc.contact_number || '').includes(q);

      const matchDept = selectedDeptFilter === 'All' ||
        doc.department === selectedDeptFilter ||
        doc.specialization === selectedDeptFilter;

      let matchStatus = true;
      if (selectedStatusFilter === 'Available') {
        matchStatus = doc.is_available !== false && !doc.is_on_leave;
      } else if (selectedStatusFilter === 'Unavailable') {
        matchStatus = doc.is_available === false;
      } else if (selectedStatusFilter === 'On Leave') {
        matchStatus = Boolean(doc.is_on_leave);
      }

      return matchQuery && matchDept && matchStatus;
    });
  }, [effectiveDoctors, searchQuery, selectedDeptFilter, selectedStatusFilter]);

  // Derived Assignments Table Data
  const assignmentsList = useMemo(() => {
    return effectiveAppointments.map((appt, idx) => {
      const assignedDoc = effectiveDoctors.find(d => d.id === appt.doctor_id) || {};
      return {
        assignment_id: `ASG-${String(appt.id || appt.appointment_id || idx + 1).slice(-6)}`,
        appointment_id: appt.id || appt.appointment_id,
        doctor_id: appt.doctor_id || assignedDoc.id || 'doc-unassigned',
        doctor_name: appt.doctor_name || assignedDoc.name || 'Unassigned Doctor',
        department: appt.department || assignedDoc.department || 'General Medicine',
        specialization: appt.specialization || assignedDoc.specialization || 'OPD',
        assigned_date: appt.appointment_date,
        assigned_time: appt.appointment_time,
        patient_name: appt.patient_name,
        patient_id: appt.patient_id || appt.patient_health_id,
        chief_complaint: appt.chief_complaint || 'Routine OPD Evaluation',
        status: appt.status || 'Confirmed',
        assignment_history: appt.assignment_history || [],
        raw_appointment: appt
      };
    });
  }, [effectiveAppointments, effectiveDoctors]);

  const filteredAssignments = useMemo(() => {
    return assignmentsList.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        item.assignment_id.toLowerCase().includes(q) ||
        item.doctor_name.toLowerCase().includes(q) ||
        item.doctor_id.toLowerCase().includes(q) ||
        item.patient_name.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q);

      const matchDept = selectedDeptFilter === 'All' || item.department === selectedDeptFilter;
      const matchStatus = selectedStatusFilter === 'All' || item.status === selectedStatusFilter;

      return matchQuery && matchDept && matchStatus;
    });
  }, [assignmentsList, searchQuery, selectedDeptFilter, selectedStatusFilter]);

  // Actions
  const handleOpenDoctorProfile = (doc) => {
    setSelectedDoctorForDetails(doc);
    setEditFormData({
      name: doc.name || '',
      qualifications: doc.qualifications || '',
      department: doc.department || 'General Medicine',
      specialization: doc.specialization || doc.department || '',
      medical_registration_number: doc.medical_registration_number || '',
      experience_years: doc.experience_years || 5,
      consultation_fee: doc.consultation_fee || 500,
      consultation_type: doc.consultation_type || 'Both',
      phone: doc.phone || doc.contact_number || '',
      email: doc.email || '',
      working_hours: doc.working_hours || '09:30 AM - 05:30 PM',
      available_days: doc.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      services_offered: doc.services_offered || '',
      bio: doc.bio || doc.description || '',
      is_available: doc.is_available !== false,
      is_on_leave: doc.is_on_leave === true,
      leave_start: doc.leave_start || '',
      leave_end: doc.leave_end || '',
      leave_reason: doc.leave_reason || ''
    });
    setIsEditingDoctor(false);
  };

  const handleSaveDoctorProfile = async (e) => {
    e.preventDefault();
    if (!selectedDoctorForDetails) return;
    setEditLoading(true);
    try {
      await api.updateDoctorProfile(selectedDoctorForDetails.id, editFormData);
      setSelectedDoctorForDetails(prev => ({ ...prev, ...editFormData }));
      setIsEditingDoctor(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update doctor profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenAvailability = (doc) => {
    setSelectedDoctorForAvail(doc);
    setAvailForm({
      is_available: doc.is_available !== false,
      is_on_leave: doc.is_on_leave === true,
      leave_start: doc.leave_start || '',
      leave_end: doc.leave_end || '',
      leave_reason: doc.leave_reason || '',
      available_days: doc.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      working_hours: doc.working_hours || '09:30 AM - 05:30 PM',
      break_times: doc.break_times || '01:00 PM - 02:00 PM',
      appointment_duration: doc.appointment_duration || doc.slot_duration_minutes || 15,
      slot_limits: doc.slot_limits || doc.max_daily_patients || 25
    });
    setAvailabilityModalOpen(true);
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorForAvail) return;
    setAvailLoading(true);
    try {
      await api.updateDoctorAvailability(selectedDoctorForAvail.id, availForm);
      setAvailabilityModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error updating doctor availability');
    } finally {
      setAvailLoading(false);
    }
  };

  const handleQuickToggleAvailability = async (doc) => {
    try {
      const nextAvailable = doc.is_available === false;
      await api.updateDoctorAvailability(doc.id, { is_available: nextAvailable });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to toggle doctor availability');
    }
  };

  const handleOpenReassignModal = (item) => {
    setSelectedApptForAssign(item);
    setTargetDoctorId(item.doctor_id || (effectiveDoctors[0]?.id || ''));
    setReassignModalOpen(true);
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApptForAssign || !targetDoctorId) return;
    setReassignLoading(true);
    try {
      await api.assignAppointmentDoctor(selectedApptForAssign.appointment_id, {
        doctor_id: targetDoctorId
      });
      setReassignModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to reassign appointment to doctor');
    } finally {
      setReassignLoading(false);
    }
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    setAddDoctorLoading(true);
    try {
      await api.createDoctor(doctorForm);
      if (setAddDoctorOpen) setAddDoctorOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to add doctor');
    } finally {
      setAddDoctorLoading(false);
    }
  };

  const toggleDay = (day) => {
    setAvailForm(prev => {
      const exists = prev.available_days.includes(day);
      return {
        ...prev,
        available_days: exists
          ? prev.available_days.filter(d => d !== day)
          : [...prev.available_days, day]
      };
    });
  };

  // -------------------------------------------------------------
  // VIEW: DEDICATED DOCTOR PROFILE DETAILS PAGE
  // -------------------------------------------------------------
  if (selectedDoctorForDetails) {
    const doc = selectedDoctorForDetails;
    const isAvail = doc.is_available !== false && !doc.is_on_leave;
    const docAppts = effectiveAppointments.filter(a => a.doctor_id === doc.id);
    const completedConsults = docAppts.filter(a => a.status === 'Completed').length;
    const activeConsults = docAppts.filter(a => ['Pending', 'Confirmed', 'Waiting', 'In Consultation'].includes(a.status)).length;

    return (
      <div className="space-y-6 animate-in fade-in">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDoctorForDetails(null)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Doctors Table</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">{doc.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  doc.is_on_leave
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : isAvail
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {doc.is_on_leave ? 'On Leave' : isAvail ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Doctor ID: <span className="font-mono font-bold text-blue-600">{doc.id}</span> • {doc.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingDoctor ? (
              <button
                onClick={() => setIsEditingDoctor(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingDoctor(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                Cancel Edit
              </button>
            )}
            <button
              onClick={() => handleOpenAvailability(doc)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Update Schedule</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        {!isEditingDoctor ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Photo & Primary Credentials */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-50 border-2 border-blue-200 text-blue-700 flex items-center justify-center font-black text-2xl overflow-hidden shadow-xs">
                  {doc.profile_photo_url ? (
                    <img src={doc.profile_photo_url} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    doc.name?.split(' ')?.[1]?.[0] || 'D'
                  )}
                </div>

                <div>
                  <h3 className="font-black text-lg text-slate-900">{doc.name}</h3>
                  <p className="text-xs font-bold text-blue-600">{doc.specialization || doc.department}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.qualifications || 'MBBS, MD'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
                    <span className="font-black text-slate-900">{doc.experience_years || 5} Years</span>
                  </div>
                  <div className="border-l border-slate-100 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                    <span className="font-black text-emerald-700">₹{doc.consultation_fee || 500}</span>
                  </div>
                  <div className="border-l border-slate-100 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Modes</span>
                    <span className="font-bold text-slate-800">{doc.consultation_type || 'Both'}</span>
                  </div>
                </div>
              </div>

              {/* Consultation KPI counters */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">OPD Performance</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                    <span className="text-xs font-semibold text-blue-600 block">Active Load</span>
                    <span className="text-xl font-black text-blue-800">{activeConsults}</span>
                    <span className="text-[10px] text-blue-500">In queue / today</span>
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                    <span className="text-xs font-semibold text-emerald-600 block">Discharged</span>
                    <span className="text-xl font-black text-emerald-800">{completedConsults}</span>
                    <span className="text-[10px] text-emerald-600">Completed visits</span>
                  </div>
                </div>
              </div>

              {/* Leave Status Card */}
              {doc.is_on_leave && (
                <div className="p-5 bg-rose-50/80 rounded-3xl border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Doctor Currently On Leave</span>
                  </div>
                  <p className="text-xs text-rose-800">
                    {doc.leave_start && doc.leave_end ? `Dates: ${doc.leave_start} to ${doc.leave_end}` : 'Leave period active'}
                  </p>
                  {doc.leave_reason && (
                    <p className="text-[11px] text-rose-600 italic">Reason: {doc.leave_reason}</p>
                  )}
                  <p className="text-[10px] text-rose-500">New appointment bookings are blocked during this leave period.</p>
                </div>
              )}
            </div>

            {/* Right Column: Full Clinical & Professional Profile */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Clinical Credentials & Registration Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[11px]">Medical Registration Number</span>
                    <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{doc.medical_registration_number || 'TSMC-TS2026-Verified'}</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> State Medical Council Verified
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[11px]">Department & Speciality</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{doc.department}</span>
                    <span className="text-[11px] text-slate-500">{doc.specialization}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[11px]">Contact Phone</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{doc.phone || doc.contact_number || '+91 98490 12345'}</span>
                    <span className="text-[10px] text-slate-400">Used for clinic operations</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[11px]">Official Email</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">{doc.email || `${doc.id}@healthcare.org`}</span>
                    <span className="text-[10px] text-slate-400">Practitioner login account</span>
                  </div>
                </div>

                {/* Schedule and Hours */}
                <div className="space-y-3 pt-2">
                  <h5 className="font-bold text-xs text-slate-800">OPD Consultation Schedule</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/70">
                      <span className="text-slate-500 font-medium block text-[11px]">Available Days</span>
                      <span className="font-bold text-blue-900 mt-1 block">
                        {Array.isArray(doc.available_days) ? doc.available_days.join(', ') : 'Monday - Saturday'}
                      </span>
                    </div>

                    <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/70">
                      <span className="text-slate-500 font-medium block text-[11px]">Working Hours</span>
                      <span className="font-bold text-blue-900 mt-1 block">
                        {doc.working_hours || '09:30 AM - 05:30 PM'}
                      </span>
                    </div>

                    <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/70">
                      <span className="text-slate-500 font-medium block text-[11px]">Slot Duration</span>
                      <span className="font-bold text-blue-900 mt-1 block">
                        {doc.appointment_duration || 15} mins / patient
                      </span>
                    </div>
                  </div>
                </div>

                {/* Services Provided */}
                <div className="space-y-2 pt-2">
                  <h5 className="font-bold text-xs text-slate-800">Clinical Services & Specialties</h5>
                  <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                    {doc.services_offered || 'General Outpatient consultations, evidence-based medication prescription, health screening, diagnosis, and longitudinal treatment management.'}
                  </p>
                </div>

                {/* Clinical Bio */}
                <div className="space-y-2 pt-2">
                  <h5 className="font-bold text-xs text-slate-800">Practitioner Bio</h5>
                  <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed italic">
                    "{doc.bio || doc.description || 'Experienced medical practitioner committed to providing high-quality outpatient clinical care.'}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT DOCTOR FORM */
          <form onSubmit={handleSaveDoctorProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Edit Doctor Profile: {doc.name}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">ID: {doc.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications *</label>
                <input
                  type="text"
                  required
                  value={editFormData.qualifications}
                  onChange={(e) => setEditFormData({ ...editFormData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medical Registration Number *</label>
                <input
                  type="text"
                  required
                  value={editFormData.medical_registration_number}
                  onChange={(e) => setEditFormData({ ...editFormData, medical_registration_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editFormData.consultation_fee}
                  onChange={(e) => setEditFormData({ ...editFormData, consultation_fee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="1"
                  value={editFormData.experience_years}
                  onChange={(e) => setEditFormData({ ...editFormData, experience_years: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Modes</label>
                <select
                  value={editFormData.consultation_type}
                  onChange={(e) => setEditFormData({ ...editFormData, consultation_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Both">Both (In-Person OPD & Video)</option>
                  <option value="In-Person">In-Person OPD Only</option>
                  <option value="Video">Video Consultation Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Services Provided</label>
              <textarea
                rows={2}
                value={editFormData.services_offered}
                onChange={(e) => setEditFormData({ ...editFormData, services_offered: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Bio & Profile Overview</label>
              <textarea
                rows={3}
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingDoctor(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editLoading ? 'Saving Profile...' : 'Save Doctor Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN VIEW: TABLE-BASED MANAGEMENT (Doctors / Assignments / Availability)
  // -------------------------------------------------------------
  return (
    <div className="space-y-5">
      {/* View Switcher Strip & Add Doctor Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctors Directory ({effectiveDoctors.length})</span>
          </button>

          <button
            onClick={() => setViewMode('assignments')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              viewMode === 'assignments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Doctor Assignments ({effectiveAppointments.length})</span>
          </button>

          <button
            onClick={() => setViewMode('availability')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              viewMode === 'availability'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Doctor Availability</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}
          {setAddDoctorOpen && (
            <button
              onClick={() => setAddDoctorOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              viewMode === 'all'
                ? 'Search doctor by name, ID, registration, phone...'
                : viewMode === 'assignments'
                ? 'Search assignment by ID, doctor, or patient...'
                : 'Search doctor availability...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Dept:</span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {viewMode === 'assignments' ? (
                <>
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Consultation">In Consultation</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </>
              ) : (
                <>
                  <option value="All">All Statuses</option>
                  <option value="Available">Available Only</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="On Leave">On Leave</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. DOCTORS DIRECTORY: TABLE-BASED MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'all' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No doctors match your filters</h4>
              <p className="text-xs text-slate-400">Try clearing your search query or selecting All departments.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Doctor ID</th>
                    <th className="py-3 px-4">Photo</th>
                    <th className="py-3 px-4">Doctor Name</th>
                    <th className="py-3 px-4">Department / Speciality</th>
                    <th className="py-3 px-4">Contact Number</th>
                    <th className="py-3 px-4">Medical Reg #</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Availability Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map(doc => {
                    const isAvail = doc.is_available !== false && !doc.is_on_leave;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                        {/* 1. Doctor ID */}
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {doc.id}
                        </td>

                        {/* 2. Photo Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {doc.profile_photo_url ? (
                              <img src={doc.profile_photo_url} alt={doc.name} className="w-full h-full object-cover" />
                            ) : (
                              doc.name?.split(' ')?.[1]?.[0] || 'D'
                            )}
                          </div>
                        </td>

                        {/* 3. Doctor Name */}
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 block text-sm">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.qualifications || 'MBBS, MD'}</span>
                        </td>

                        {/* 4. Department / Speciality */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{doc.department}</span>
                          <span className="text-[10px] text-blue-600">{doc.specialization}</span>
                        </td>

                        {/* 5. Contact Number */}
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {doc.phone || doc.contact_number || '+91 98490 12345'}
                        </td>

                        {/* 6. Medical Registration Number */}
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {doc.medical_registration_number || 'TSMC-Verified'}
                        </td>

                        {/* 7. Experience */}
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {doc.experience_years || 5} Years
                        </td>

                        {/* 8. Availability Status */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            doc.is_on_leave
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isAvail
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${doc.is_on_leave ? 'bg-rose-500' : isAvail ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span>{doc.is_on_leave ? 'On Leave' : isAvail ? 'Available' : 'Unavailable'}</span>
                          </span>
                        </td>

                        {/* 9. Action - View Details */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenDoctorProfile(doc)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DOCTOR ASSIGNMENTS: TABLE FORMAT */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No clinical assignments found</h4>
              <p className="text-xs text-slate-400">Incoming patient appointments will appear here for doctor triage.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Assignment ID</th>
                    <th className="py-3 px-4">Doctor ID</th>
                    <th className="py-3 px-4">Doctor Name</th>
                    <th className="py-3 px-4">Department / Speciality</th>
                    <th className="py-3 px-4">Assigned Date</th>
                    <th className="py-3 px-4">Assigned Appointments / Work</th>
                    <th className="py-3 px-4">Assignment Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.map(item => (
                    <tr key={item.assignment_id} className="hover:bg-slate-50/70 transition">
                      {/* 1. Assignment ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{item.assignment_id}</span>
                      </td>

                      {/* 2. Doctor ID */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {item.doctor_id}
                      </td>

                      {/* 3. Doctor Name */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 block text-sm">{item.doctor_name}</span>
                        <span className="text-[10px] text-slate-400">Attending Specialist</span>
                      </td>

                      {/* 4. Department / Speciality */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{item.department}</span>
                        <span className="text-[10px] text-blue-600">{item.specialization}</span>
                      </td>

                      {/* 5. Assigned Date */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{item.assigned_date}</span>
                        <span className="text-[10px] text-slate-400">{item.assigned_time || 'OPD Shift'}</span>
                      </td>

                      {/* 6. Assigned Appointments / Work */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.patient_name}</span>
                        <span className="text-[10px] text-slate-500 italic block line-clamp-1">"{item.chief_complaint}"</span>
                      </td>

                      {/* 7. Assignment Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'In Consultation'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* 8. Action (Reassign / View) */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedAssignmentDetails(item);
                            setAssignmentDetailsModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleOpenReassignModal(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition"
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DOCTOR AVAILABILITY: TABLE-BASED MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'availability' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No doctor availability records found</h4>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Doctor ID</th>
                    <th className="py-3 px-4">Doctor Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Working Days</th>
                    <th className="py-3 px-4">Working Hours</th>
                    <th className="py-3 px-4">Available Slots</th>
                    <th className="py-3 px-4">Availability Status</th>
                    <th className="py-3 px-4">Leave Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map(doc => {
                    const isAvail = doc.is_available !== false && !doc.is_on_leave;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                        {/* 1. Doctor ID */}
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {doc.id}
                        </td>

                        {/* 2. Doctor Name */}
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 block text-sm">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.qualifications}</span>
                        </td>

                        {/* 3. Department */}
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {doc.department}
                        </td>

                        {/* 4. Working Days */}
                        <td className="py-3 px-4 text-slate-700">
                          <span className="line-clamp-1 font-medium">
                            {Array.isArray(doc.available_days) ? doc.available_days.map(d => d.slice(0, 3)).join(', ') : 'Mon - Sat'}
                          </span>
                        </td>

                        {/* 5. Working Hours */}
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {doc.working_hours || '09:30 AM - 05:30 PM'}
                        </td>

                        {/* 6. Available Slots */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900">
                            {doc.slot_limits || doc.max_daily_patients || 25} slots
                          </span>
                          <span className="text-[10px] text-slate-400 block">({doc.appointment_duration || 15}m / patient)</span>
                        </td>

                        {/* 7. Availability Status Toggle */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleQuickToggleAvailability(doc)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1.5 ${
                              isAvail
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click to toggle Available / Unavailable"
                          >
                            <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{isAvail ? 'Available' : 'Unavailable'}</span>
                          </button>
                        </td>

                        {/* 8. Leave Status */}
                        <td className="py-3 px-4">
                          {doc.is_on_leave ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 block text-center">
                              On Leave
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Active On-Duty</span>
                          )}
                        </td>

                        {/* 9. Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenAvailability(doc)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                          >
                            Update Schedule
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REASSIGN DOCTOR */}
      {/* ------------------------------------------------------------- */}
      {reassignModalOpen && selectedApptForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Reassign Appointment Doctor</h3>
                <p className="text-xs text-slate-500">Appointment ID: <span className="font-mono font-bold text-blue-600">{selectedApptForAssign.appointment_id}</span></p>
              </div>
              <button
                onClick={() => setReassignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{selectedApptForAssign.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Currently Assigned:</span>
                  <span className="font-bold text-blue-700">{selectedApptForAssign.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-medium text-slate-700">{selectedApptForAssign.assigned_date} • {selectedApptForAssign.assigned_time}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select New Attending Doctor *</label>
                <select
                  required
                  value={targetDoctorId}
                  onChange={(e) => setTargetDoctorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Qualified Specialist --</option>
                  {effectiveDoctors.map(doc => {
                    const isBusyOnLeave = doc.is_on_leave || doc.is_available === false;
                    return (
                      <option key={doc.id} value={doc.id} disabled={isBusyOnLeave}>
                        {doc.name} — {doc.specialization || doc.department} {isBusyOnLeave ? '(Unavailable / On Leave)' : `(Fee: ₹${doc.consultation_fee})`}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Prevents scheduling conflicts by disabling doctors currently on leave.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassignLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                >
                  {reassignLoading ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ASSIGNMENT DETAILS */}
      {/* ------------------------------------------------------------- */}
      {assignmentDetailsModalOpen && selectedAssignmentDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Assignment Details</h3>
                <span className="font-mono text-xs text-blue-600 font-bold">{selectedAssignmentDetails.assignment_id}</span>
              </div>
              <button
                onClick={() => setAssignmentDetailsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedAssignmentDetails.doctor_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Attending Doctor:</span>
                  <span className="font-bold text-slate-900">{selectedAssignmentDetails.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-bold text-blue-600">{selectedAssignmentDetails.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-bold text-slate-900">{selectedAssignmentDetails.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Schedule:</span>
                  <span className="font-bold text-slate-800">{selectedAssignmentDetails.assigned_date} • {selectedAssignmentDetails.assigned_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chief Complaint:</span>
                  <span className="font-medium text-slate-800 italic">{selectedAssignmentDetails.chief_complaint}</span>
                </div>
              </div>

              {selectedAssignmentDetails.assignment_history && selectedAssignmentDetails.assignment_history.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reassignment Audit Trail</span>
                  <div className="space-y-1 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-[11px]">
                    {selectedAssignmentDetails.assignment_history.map((hist, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>Reassigned from {hist.from_doctor} to {hist.to_doctor}</span>
                        <span className="text-[10px] text-slate-400">{new Date(hist.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setAssignmentDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: UPDATE DOCTOR AVAILABILITY & SCHEDULES */}
      {/* ------------------------------------------------------------- */}
      {availabilityModalOpen && selectedDoctorForAvail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Update Availability: {selectedDoctorForAvail.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedDoctorForAvail.specialization || selectedDoctorForAvail.department}</p>
              </div>
              <button
                onClick={() => setAvailabilityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
              {/* Toggles for Availability and Leave */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">OPD Active:</span>
                  <input
                    type="checkbox"
                    checked={availForm.is_available}
                    onChange={(e) => setAvailForm({ ...availForm, is_available: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">On Leave:</span>
                  <input
                    type="checkbox"
                    checked={availForm.is_on_leave}
                    onChange={(e) => setAvailForm({ ...availForm, is_on_leave: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Leave Details Panel if on leave */}
              {availForm.is_on_leave && (
                <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3">
                  <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider block">
                    Doctor Leave Period & Reason
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Leave Start Date</label>
                      <input
                        type="date"
                        value={availForm.leave_start}
                        onChange={(e) => setAvailForm({ ...availForm, leave_start: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Leave End Date</label>
                      <input
                        type="date"
                        value={availForm.leave_end}
                        onChange={(e) => setAvailForm({ ...availForm, leave_end: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Leave Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Annual Medical Conference / Personal Leave"
                      value={availForm.leave_reason}
                      onChange={(e) => setAvailForm({ ...availForm, leave_reason: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Working Days Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Available Consultation Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map(day => {
                    const active = availForm.available_days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${active
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={availForm.working_hours}
                    onChange={(e) => setAvailForm({ ...availForm, working_hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Break Times</label>
                  <input
                    type="text"
                    value={availForm.break_times}
                    onChange={(e) => setAvailForm({ ...availForm, break_times: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={availForm.appointment_duration}
                    onChange={(e) => setAvailForm({ ...availForm, appointment_duration: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Patient Slot Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={availForm.slot_limits}
                    onChange={(e) => setAvailForm({ ...availForm, slot_limits: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAvailabilityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  {availLoading ? 'Saving...' : 'Save Availability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD NEW DOCTOR */}
      {/* ------------------------------------------------------------- */}
      {addDoctorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <span>Register Specialist Doctor Account</span>
              </h3>
              <button
                onClick={() => setAddDoctorOpen && setAddDoctorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. Rajesh Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.qualifications}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="MBBS, MD (Medicine), DM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Department *</label>
                  <select
                    value={doctorForm.department}
                    onChange={(e) => {
                      const dept = e.target.value;
                      const preset = departmentPresets[dept];
                      setDoctorForm(prev => ({
                        ...prev,
                        department: dept,
                        specialization: dept,
                        medical_keywords: preset ? preset.keywords : prev.medical_keywords,
                        conditions_treated: preset ? preset.conditions : prev.conditions_treated
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Object.keys(departmentPresets).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Specialisation *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Interventional Cardiology, Pediatric Surgery"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.medical_registration_number}
                    onChange={(e) => setDoctorForm({ ...doctorForm, medical_registration_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. TSMC-45892"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Type *</label>
                  <select
                    value={doctorForm.consultation_type}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultation_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Both">Both (In-Person OPD & Video)</option>
                    <option value="In-Person">In-Person OPD Only</option>
                    <option value="Video">Video Consultation Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={doctorForm.experience_years}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience_years: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={doctorForm.consultation_fee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slot Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={doctorForm.appointment_duration}
                    onChange={(e) => setDoctorForm({ ...doctorForm, appointment_duration: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.contact_number}
                    onChange={(e) => setDoctorForm({ ...doctorForm, contact_number: e.target.value, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Email (Login Username) *</label>
                  <input
                    type="email"
                    required
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="doctor@healthcare.org"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Login Password *</label>
                <input
                  type="password"
                  required
                  value={doctorForm.password}
                  onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="Doctor@123"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddDoctorOpen && setAddDoctorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addDoctorLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  {addDoctorLoading ? 'Registering Doctor...' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsTab;
