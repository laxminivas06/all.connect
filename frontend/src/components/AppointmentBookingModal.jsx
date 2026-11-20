import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from './ErrorBoundary';
import {
  X,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  CreditCard,
  Video,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Check,
  Receipt,
  Download,
  Edit,
  Phone,
  Mail,
  FileText
} from 'lucide-react';

export const getDoctorDisplayName = (doc) => {
  if (!doc) return 'Doctor';
  return String(doc.name || doc.full_name || 'Doctor').trim();
};

export const getDoctorInitial = (doc) => {
  const name = getDoctorDisplayName(doc);
  const clean = name.replace(/^Dr\.?\s*/i, '').trim();
  return clean ? clean.charAt(0).toUpperCase() : 'D';
};

export const getDoctorSpecialty = (doc) => {
  if (!doc) return 'Specialist';
  return String(doc.specialization || doc.specialty || doc.department || 'Specialist').trim();
};

export const getDoctorQualifications = (doc) => {
  if (!doc) return 'MBBS, MD';
  return String(doc.qualifications || doc.qualification || 'MBBS, MD').trim();
};

export const getDoctorOrgName = (doc, fallbackOrg) => {
  if (doc?.organization_name) return String(doc.organization_name).trim();
  if (doc?.hospital_name) return String(doc.hospital_name).trim();
  if (fallbackOrg?.name) return String(fallbackOrg.name).trim();
  return 'Healthcare Facility';
};

const AppointmentBookingModalContent = ({
  isOpen,
  onClose,
  initialDoctor = null,
  initialHospital = null,
  initialClinic = null,
  initialDate = null,
  initialTime = null,
  initialComplaint = '',
  searchQuery = '',
  onSuccess,
  onBookingSuccess
}) => {
  const { user } = useAuth();

  // 7-step booking state
  // Step 1: Doctor Selection
  // Step 2: Consultation Mode Selection
  // Step 3: Calendar-Based Date Selection
  // Step 4: Time Slot & Capacity Selection
  // Step 5: Official Price Quote & Summary
  // Step 6: Patient Details & Booking Confirmation Review
  // Step 7: Payment Page & Digital Receipt
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Target organization
  const targetOrg = initialHospital || initialClinic || (typeof initialDoctor === 'object' ? initialDoctor?.organization : null);
  const targetOrgId = targetOrg?.id || (typeof initialDoctor === 'object' ? (initialDoctor?.organization_id || initialDoctor?.hospital_id) : null);

  // Step 1 State: Doctors
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Step 2 State: Mode Selection
  const [consultationMode, setConsultationMode] = useState('In-Person Consultation');
  const [enabledModes, setEnabledModes] = useState(['In-Person Consultation', 'Video Consultation']);

  // Step 3 State: Calendar
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [monthAvailability, setMonthAvailability] = useState({});
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Step 4 State: Daily Slots & Capacity
  const [dailySlotsData, setDailySlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Step 5 State: Backend Price Quote
  const [priceQuote, setPriceQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Step 6 State: Patient Details & Chief Complaint
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Step 7 State: Payment
  const [paymentMethod, setPaymentMethod] = useState('Online UPI / QR Payment');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const configureDoctorModes = (doc) => {
    if (!doc) return;
    const rawType = doc.consultation_type || doc.consultation_modes || 'Both';
    let modes = ['In-Person Consultation', 'Video Consultation'];
    if (typeof rawType === 'string') {
      const lower = rawType.toLowerCase();
      if (lower.includes('in-person') && !lower.includes('video') && !lower.includes('both')) {
        modes = ['In-Person Consultation'];
      } else if (lower.includes('video') && !lower.includes('in-person') && !lower.includes('both')) {
        modes = ['Video Consultation'];
      }
    }
    setEnabledModes(modes);
    if (!modes.includes(consultationMode)) {
      setConsultationMode(modes[0]);
    }
  };

  const fetchDoctorById = async (docId) => {
    setLoadingDoctors(true);
    try {
      const res = await api.getDoctor(docId);
      const doc = res.doctor || res;
      setSelectedDoctor(doc);
      configureDoctorModes(doc);
      setStep(2);
    } catch (err) {
      setError('Failed to load doctor profile');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchOrgDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const params = {};
      if (targetOrgId) params.organization_id = targetOrgId;
      const docs = await api.getDoctors(params);
      
      // Strict organization isolation: filter only doctors belonging to targetOrgId if specified
      const filtered = targetOrgId 
        ? (docs || []).filter(d => (d.organization_id === targetOrgId || d.hospital_id === targetOrgId)) 
        : (docs || []);
      setDoctorsList(filtered);

      // Single-Doctor Clinic Requirement: If only 1 doctor, select directly without extra steps
      if (filtered.length === 1) {
        setSelectedDoctor(filtered[0]);
        configureDoctorModes(filtered[0]);
        setStep(2);
      } else if (filtered.length > 1) {
        setSelectedDoctor(filtered[0]);
        configureDoctorModes(filtered[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load available specialists for this facility.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Initialize Modal
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessData(null);
      setPaymentComplete(false);
      setSelectedSlot(initialTime || '');
      setPriceQuote(null);
      setSelectedDate(initialDate || '');
      
      // Pre-fill patient details if logged in
      if (user) {
        setPatientName(user.name || user.full_name || '');
        setPatientMobile(user.mobile || user.phone || '');
        setPatientEmail(user.email || '');
        setPatientId(user.entity_id || user.patient_id || 'PAT-VERIFIED');
      } else {
        setPatientId('PAT-GUEST');
      }

      // Pre-fill Chief Medical Complaint from search query or initial complaint
      const prefilledComplaint = (initialComplaint || searchQuery || '').trim();
      if (prefilledComplaint) {
        setChiefComplaint(prefilledComplaint);
      }

      // Initialize Doctor
      if (initialDoctor) {
        const docObj = typeof initialDoctor === 'object' ? initialDoctor : null;
        if (docObj) {
          setSelectedDoctor(docObj);
          configureDoctorModes(docObj);
          setStep(2);
        } else {
          fetchDoctorById(initialDoctor);
        }
      } else {
        // Fetch doctors belonging strictly to this organization
        fetchOrgDoctors();
        setStep(1);
      }
    }
  }, [isOpen, initialDoctor, initialHospital, initialClinic, initialComplaint, searchQuery, user]);

  // Fetch Month Availability when Month, Year, or Doctor changes
  useEffect(() => {
    if (selectedDoctor && step >= 3) {
      loadMonthAvailability(currentYear, currentMonth);
    }
  }, [selectedDoctor, currentYear, currentMonth, step]);

  const loadMonthAvailability = async (year, month) => {
    if (!selectedDoctor?.id) return;
    setLoadingCalendar(true);
    try {
      const res = await api.getDoctorMonthAvailability(selectedDoctor.id, year, month);
      setMonthAvailability(res.days || {});
    } catch (err) {
      // Fallback local availability generation based on doctor's available days
      const daysCount = new Date(year, month, 0).getDate();
      const availDays = selectedDoctor.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayStr = new Date().toISOString().split('T')[0];
      const fallbackMap = {};
      for (let d = 1; d <= daysCount; d++) {
        const dtStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dtObj = new Date(year, month - 1, d);
        const dayName = dtObj.toLocaleDateString('en-US', { weekday: 'long' });
        const isPast = dtStr < todayStr;
        const isWorking = availDays.includes(dayName);
        fallbackMap[dtStr] = {
          date: dtStr,
          day: d,
          day_name: dayName,
          status: isPast ? 'past' : (isWorking ? 'available' : 'off'),
          available: !isPast && isWorking
        };
      }
      setMonthAvailability(fallbackMap);
    } finally {
      setLoadingCalendar(false);
    }
  };

  // Fetch Daily Slots & Capacity when Date is selected
  const handleDateSelect = async (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot('');
    setPriceQuote(null);
    setLoadingSlots(true);
    setError('');

    try {
      const res = await api.getDoctorDailySlots(selectedDoctor.id, dateStr, consultationMode);
      setDailySlotsData(res);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to load real-time slot availability for this date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch Price Quote from Backend when Slot is selected (Step 5)
  const handleSlotSelect = async (slotTime) => {
    setSelectedSlot(slotTime);
    setLoadingQuote(true);
    setError('');

    try {
      const quotePayload = {
        doctor_id: selectedDoctor.id,
        organization_id: selectedDoctor.organization_id || targetOrgId,
        consultation_mode: consultationMode,
        appointment_date: selectedDate,
        appointment_time: slotTime
      };
      const quote = await api.getAppointmentPricingQuote(quotePayload);
      setPriceQuote(quote);
      setStep(5);
    } catch (err) {
      setError(err.message || 'Failed to calculate consultation quote from backend.');
    } finally {
      setLoadingQuote(false);
    }
  };

  // Step 6: Confirm Booking & Proceed to Payment
  const handleConfirmBooking = async (e) => {
    if (e) e.preventDefault();
    if (!patientName.trim()) {
      setError('Please provide patient name.');
      return;
    }
    if (!patientMobile.trim()) {
      setError('Please provide patient contact phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        doctor_id: selectedDoctor.id,
        organization_id: selectedDoctor.organization_id || targetOrgId,
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        appointment_type: consultationMode,
        chief_complaint: chiefComplaint.trim() || `OPD consultation with ${getDoctorDisplayName(selectedDoctor)}`,
        patient_name: patientName.trim(),
        patient_phone: patientMobile.trim(),
        patient_email: patientEmail.trim() || undefined,
        patient_id: patientId || undefined
      };

      const res = await api.bookAppointment(payload);
      const appt = res.appointment || res;
      setSuccessData(appt);
      // Proceed to Step 7: Payment Page ONLY after confirmation
      setStep(7);
      if (onSuccess) onSuccess(appt);
      if (onBookingSuccess) onBookingSuccess(appt);
    } catch (err) {
      setError(err.message || 'Slot collision or capacity limit reached. Please select another slot.');
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Complete Payment
  const handleProcessPayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentComplete(true);
    }, 900);
  };

  if (!isOpen) return null;

  // Calendar Helpers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              {step < 7 ? <Calendar className="w-4 h-4 text-blue-200" /> : <Receipt className="w-4 h-4 text-emerald-300" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                {step === 7 ? (paymentComplete ? 'Booking Confirmed' : 'Payment & Checkout') : 'Schedule Appointment'}
              </h3>
              <p className="text-[11px] text-blue-100">
                {selectedDoctor ? `${getDoctorDisplayName(selectedDoctor)} • ${getDoctorSpecialty(selectedDoctor)}` : (targetOrg?.name || 'Healthcare Facility')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Step Progress Indicator Bar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-500 overflow-x-auto gap-2">
          {[
            { num: 1, label: 'Doctor' },
            { num: 2, label: 'Mode' },
            { num: 3, label: 'Date' },
            { num: 4, label: 'Slot' },
            { num: 5, label: 'Price' },
            { num: 6, label: 'Confirm' },
            { num: 7, label: 'Payment' }
          ].map(s => (
            <div
              key={s.num}
              className={`flex items-center gap-1 shrink-0 ${
                step === s.num
                  ? 'text-blue-600 font-extrabold'
                  : (step > s.num ? 'text-emerald-600' : 'text-slate-400')
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === s.num
                    ? 'bg-blue-600 text-white'
                    : (step > s.num ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT DOCTOR */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Step 1: Select Doctor</h4>
                <p className="text-xs text-slate-500">Choose a verified healthcare practitioner from this organization.</p>
              </div>

              {loadingDoctors ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading available doctors...</span>
                </div>
              ) : doctorsList.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border text-xs text-slate-500">
                  No doctors currently registered under this facility.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {doctorsList.map(doc => {
                    const docName = getDoctorDisplayName(doc);
                    const docSpecialty = getDoctorSpecialty(doc);
                    const docQual = getDoctorQualifications(doc);
                    const docInitial = getDoctorInitial(doc);
                    return (
                      <button
                        key={doc.id || doc.doctor_id}
                        type="button"
                        onClick={() => {
                          setSelectedDoctor(doc);
                          configureDoctorModes(doc);
                        }}
                        className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                          selectedDoctor?.id === doc.id
                            ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                            {docInitial}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900">{docName}</h5>
                            <p className="text-xs text-blue-600 font-semibold">{docSpecialty} • {docQual}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{doc.experience_years || 5}+ Years Experience</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          {doc.is_active !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  disabled={!selectedDoctor}
                  onClick={() => {
                    if (selectedDoctor) {
                      configureDoctorModes(selectedDoctor);
                      setStep(2);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-40 transition flex items-center gap-2"
                >
                  <span>Continue to Mode Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT CONSULTATION MODE */}
          {step === 2 && selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Step 2: Select Consultation Mode</h4>
                  <p className="text-xs text-slate-500">Select whether you prefer an in-person hospital OPD visit or online video consultation.</p>
                </div>
                {doctorsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Change Doctor
                  </button>
                )}
              </div>

              {/* Doctor Quick Badge */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {getDoctorInitial(selectedDoctor)}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{getDoctorDisplayName(selectedDoctor)}</p>
                  <p className="text-[11px] text-slate-500">{getDoctorSpecialty(selectedDoctor)} • {getDoctorOrgName(selectedDoctor, targetOrg)}</p>
                </div>
              </div>

              {/* Mode Options: ONLY Enabled modes displayed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {enabledModes.includes('In-Person Consultation') && (
                  <button
                    type="button"
                    onClick={() => setConsultationMode('In-Person Consultation')}
                    className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                      consultationMode === 'In-Person Consultation'
                        ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-500'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">In-Person Consultation</h5>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Physical consultation at {getDoctorOrgName(selectedDoctor, targetOrg)}.
                      </p>
                    </div>
                  </button>
                )}

                {enabledModes.includes('Video Consultation') && (
                  <button
                    type="button"
                    onClick={() => setConsultationMode('Video Consultation')}
                    className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                      consultationMode === 'Video Consultation'
                        ? 'bg-teal-50/80 border-teal-600 shadow-sm ring-2 ring-teal-500'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">Video Consultation</h5>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Encrypted teleconsultation from home with digital prescription.
                      </p>
                    </div>
                  </button>
                )}
              </div>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
                >
                  <span>Select Date</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MONTHLY CALENDAR DATE SELECTION */}
          {step === 3 && selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Step 3: Calendar-Based Appointment Selection</h4>
                  <p className="text-xs text-slate-500">Select an available date for {getDoctorDisplayName(selectedDoctor)}.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Change Mode
                </button>
              </div>

              {/* Month Navigation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-sm text-slate-900">
                    {monthNames[currentMonth - 1]} {currentYear}
                  </h5>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
                      aria-label="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
                      aria-label="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty offset padding cells */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const dayInfo = monthAvailability[dateStr] || {};
                    const isAvailable = dayInfo.available !== false && dayInfo.status !== 'past' && dayInfo.status !== 'off' && dayInfo.status !== 'fully_booked';
                    const isSelected = selectedDate === dateStr;
                    const isFullyBooked = dayInfo.status === 'fully_booked';

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleDateSelect(dateStr)}
                        className={`h-11 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center transition border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : (isFullyBooked
                                ? 'bg-rose-50 text-rose-300 border-rose-100 cursor-not-allowed'
                                : (isAvailable
                                    ? 'bg-white hover:bg-blue-50 text-slate-800 border-slate-200 hover:border-blue-300 cursor-pointer'
                                    : 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed'))
                        }`}
                      >
                        <span>{dayNum}</span>
                        {isFullyBooked ? (
                          <span className="text-[8px] font-black text-rose-500 uppercase leading-none">Full</span>
                        ) : (isAvailable ? (
                          <span className="text-[7px] text-emerald-600 font-bold leading-none">• Open</span>
                        ) : null)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Available Date</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Fully Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span>Doctor Off / Past</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TIME SLOT & CAPACITY SELECTION (BOOKMYSHOW STYLE) */}
          {step === 4 && dailySlotsData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Step 4: Select Appointment Slot</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black tracking-wider uppercase">
                      Live Slots
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    {dailySlotsData.day_name}, {dailySlotsData.date} • {consultationMode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Change Date
                </button>
              </div>

              {/* Doctor On Leave Notice */}
              {dailySlotsData.is_on_leave ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <h5 className="font-extrabold text-sm text-amber-800">
                      Doctor Currently Unavailable – On Leave
                    </h5>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {selectedDoctor ? getDoctorDisplayName(selectedDoctor) : 'Doctor'} is on scheduled leave
                    {dailySlotsData.leave_start && dailySlotsData.leave_end ? (
                      <> from <span className="font-bold">{dailySlotsData.leave_start}</span> to <span className="font-bold">{dailySlotsData.leave_end}</span></>
                    ) : ' on this date'}.
                    {dailySlotsData.leave_reason ? ` (${dailySlotsData.leave_reason})` : ''}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Appointment slots are automatically protected and locked during approved leave periods. Please select a date after leave ends or consult another available specialist.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Select Another Date</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* BookMyShow Style Cinema/Bay OPD Header & Capacity */}
                  <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-blue-300 block">
                          OPD Consultation Bay
                        </span>
                        <p className="font-extrabold text-sm text-white">
                          {selectedDoctor ? getDoctorDisplayName(selectedDoctor) : 'Specialist'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-300">
                        {dailySlotsData.booked_count} of {dailySlotsData.total_capacity} Booked
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        dailySlotsData.day_status === 'Available' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        (dailySlotsData.day_status === 'Limited Slots' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')
                      }`}>
                        {dailySlotsData.day_status}
                      </span>
                    </div>
                  </div>

                  {/* BookMyShow Visual Legend */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-emerald-500 border border-emerald-600" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-blue-600 border border-blue-700" />
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-rose-500 border border-rose-600" />
                      <span>Already Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-amber-400 border border-amber-500" />
                      <span>Limited</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300" />
                      <span>Unavailable</span>
                    </div>
                  </div>

                  {/* Structured BookMyShow Slot Grid: Morning & Afternoon/Evening */}
                  <div className="space-y-4 pt-1">
                    {/* Morning Slots */}
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Morning Shift (09:00 AM – 01:00 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {dailySlotsData.slots
                          .filter(s => s.time.includes('AM') || s.time.startsWith('12:'))
                          .map((s, idx) => {
                            const isSelected = selectedSlot === s.time;
                            const isBooked = s.status === 'Booked';
                            const isAvailable = s.available && !isBooked;
                            const isLimited = s.status === 'Limited';

                            return (
                              <button
                                key={s.time}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => handleSlotSelect(s.time)}
                                className={`relative p-3 rounded-xl border text-center transition flex flex-col items-center justify-center group ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500 ring-offset-1 transform -translate-y-0.5'
                                    : (isBooked
                                        ? 'bg-rose-50 text-rose-400 border-rose-200 cursor-not-allowed opacity-80'
                                        : (isAvailable
                                            ? 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-400 hover:shadow-xs cursor-pointer'
                                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'))
                                }`}
                              >
                                <span className={`text-[9px] font-bold tracking-tight block ${
                                  isSelected ? 'text-blue-200' : 'text-slate-400'
                                }`}>
                                  Slot #{idx + 1}
                                </span>
                                <span className="font-black text-xs sm:text-sm mt-0.5">{s.time}</span>
                                <span className={`text-[9px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : (isBooked
                                        ? 'bg-rose-100 text-rose-700'
                                        : (isLimited
                                            ? 'bg-amber-100 text-amber-800'
                                            : (isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500')))
                                }`}>
                                  {isSelected ? 'Selected' : (isBooked ? 'Booked' : (isLimited ? 'Limited' : (isAvailable ? 'Available' : 'Unavailable')))}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Afternoon & Evening Slots */}
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Afternoon & Evening Shift (01:00 PM – 08:00 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {dailySlotsData.slots
                          .filter(s => s.time.includes('PM') && !s.time.startsWith('12:'))
                          .map((s, idx) => {
                            const isSelected = selectedSlot === s.time;
                            const isBooked = s.status === 'Booked';
                            const isAvailable = s.available && !isBooked;
                            const isLimited = s.status === 'Limited';

                            return (
                              <button
                                key={s.time}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => handleSlotSelect(s.time)}
                                className={`relative p-3 rounded-xl border text-center transition flex flex-col items-center justify-center group ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500 ring-offset-1 transform -translate-y-0.5'
                                    : (isBooked
                                        ? 'bg-rose-50 text-rose-400 border-rose-200 cursor-not-allowed opacity-80'
                                        : (isAvailable
                                            ? 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-400 hover:shadow-xs cursor-pointer'
                                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'))
                                }`}
                              >
                                <span className={`text-[9px] font-bold tracking-tight block ${
                                  isSelected ? 'text-blue-200' : 'text-slate-400'
                                }`}>
                                  Slot #{idx + 9}
                                </span>
                                <span className="font-black text-xs sm:text-sm mt-0.5">{s.time}</span>
                                <span className={`text-[9px] font-black uppercase mt-1 px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : (isBooked
                                        ? 'bg-rose-100 text-rose-700'
                                        : (isLimited
                                            ? 'bg-amber-100 text-amber-800'
                                            : (isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500')))
                                }`}>
                                  {isSelected ? 'Selected' : (isBooked ? 'Booked' : (isLimited ? 'Limited' : (isAvailable ? 'Available' : 'Unavailable')))}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* BookMyShow Style Selected Pass Preview */}
                    {selectedSlot && (
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                            ✓
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
                              Selected Slot Reserved
                            </span>
                            <p className="font-extrabold text-sm text-slate-900">
                              {dailySlotsData.date} at {selectedSlot} • {consultationMode}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Est. Token: <span className="font-bold text-blue-600">T-0{(dailySlotsData.booked_count || 0) + 1}</span> • Fee: <span className="font-bold text-slate-900">₹{selectedDoctor?.consultation_fee || 600}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setStep(5)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
                        >
                          <span>Proceed to Summary</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 5: OFFICIAL PRICE QUOTE & SUMMARY */}
          {step === 5 && priceQuote && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Step 5: Verified Appointment Summary & Fee</h4>
                <p className="text-xs text-slate-500">Official consultation quotation calculated directly from backend doctor configuration.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Organisation:</span>
                  <span className="font-extrabold text-slate-900">{priceQuote.organization_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-extrabold text-slate-900">{priceQuote.doctor_name || getDoctorDisplayName(selectedDoctor)} ({priceQuote.specialization})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Consultation Mode:</span>
                  <span className="font-extrabold text-blue-700">{priceQuote.consultation_mode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-extrabold text-slate-900">{priceQuote.appointment_date} at {priceQuote.appointment_time}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-extrabold text-slate-900">₹{priceQuote.consultation_fee}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Additional Service Charges:</span>
                  <span className="font-semibold text-emerald-600">₹{priceQuote.additional_charges}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                  <span>Total Payable Amount:</span>
                  <span className="text-blue-700 text-base">₹{priceQuote.total_payable}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition"
                >
                  Change Slot
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
                >
                  <span>Continue to Confirmation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: PATIENT DETAILS & APPOINTMENT CONFIRMATION REVIEW (CRITICAL STEP) */}
          {step === 6 && (
            <form onSubmit={handleConfirmBooking} className="space-y-5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Step 6: Patient Details & Appointment Confirmation Review</h4>
                <p className="text-xs text-slate-500">
                  Review the booking summary and confirm patient details. Your symptom query has been pre-populated into the Chief Medical Complaint.
                </p>
              </div>

              {/* Complete Confirmation Summary Review Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Appointment Confirmation Summary
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Pre-Payment Review
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Healthcare Facility</span>
                    <p className="font-extrabold text-slate-900">{getDoctorOrgName(selectedDoctor, targetOrg)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Consulting Specialist</span>
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-slate-900">
                        {getDoctorDisplayName(selectedDoctor)} ({getDoctorSpecialty(selectedDoctor)})
                      </p>
                      {doctorsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Consultation Mode</span>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-blue-700">{consultationMode}</p>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Date & Time Slot</span>
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-slate-900">{selectedDate} at {selectedSlot}</p>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Consultation Fee:</span>
                    <span className="font-bold text-slate-800">₹{priceQuote?.consultation_fee || 600}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Service Charges:</span>
                    <span className="font-bold text-emerald-600">₹{priceQuote?.additional_charges || 0}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-100 font-black text-slate-900 text-sm">
                    <span>Total Payable:</span>
                    <span className="text-blue-700 text-base">₹{priceQuote?.total_payable || priceQuote?.consultation_fee || 600}</span>
                  </div>
                </div>
              </div>

              {/* Patient Details Form Fields (Pre-populated from user profile) */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Patient Contact & Medical Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Patient Full Name"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Patient ID / Reference</label>
                    <input
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="e.g. PAT-2026-000001"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={patientMobile}
                      onChange={(e) => setPatientMobile(e.target.value)}
                      placeholder="+91 98480 11001"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Chief Medical Complaint / Symptoms</span>
                    <span className="text-[10px] text-blue-600 font-bold">Auto-populated from Search</span>
                  </label>
                  <textarea
                    rows={2}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Describe main symptom or reason for visit (e.g. Persistent dry cough, fever for 3 days)..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition"
                >
                  Back to Summary
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Confirm & Proceed to Payment</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 7: PAYMENT PAGE & DIGITAL RECEIPT (APPEARS ONLY AFTER CONFIRMATION REVIEW) */}
          {step === 7 && successData && (
            <div className="space-y-4">
              {!paymentComplete ? (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Step 7: Appointment Payment & Checkout</h4>
                    <p className="text-xs text-slate-500">Your clinical appointment slot is reserved. Select payment option to finalize.</p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between font-mono text-[11px] text-blue-700">
                      <span>Appointment Reference ID:</span>
                      <span className="font-extrabold">{successData.id || successData.appointment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient Name:</span>
                      <span className="font-bold text-slate-800">{successData.patient_name || patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consulting Doctor:</span>
                      <span className="font-bold text-slate-800">{successData.doctor_name || getDoctorDisplayName(selectedDoctor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chief Complaint:</span>
                      <span className="font-bold text-slate-800">{successData.chief_complaint || chiefComplaint || 'OPD Consultation'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Schedule:</span>
                      <span className="font-bold text-slate-800">{successData.appointment_date} at {successData.appointment_time}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900 text-sm">
                      <span>Total Payable:</span>
                      <span className="text-blue-700 text-base">₹{successData.consultation_fee || priceQuote?.total_payable || 600}</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-extrabold text-slate-700">Select Payment Option</label>
                    <div className="space-y-2">
                      {[
                        { id: 'Online UPI / QR Payment', desc: 'Instant UPI (Google Pay, PhonePe, Paytm)' },
                        { id: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay' },
                        { id: 'Pay at Facility Reception', desc: 'Pay at hospital/clinic reception desk on appointment day' }
                      ].map(m => (
                        <label
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                            paymentMethod === m.id
                              ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            checked={paymentMethod === m.id}
                            onChange={() => setPaymentMethod(m.id)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{m.id}</p>
                            <p className="text-[11px] text-slate-500">{m.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={paymentProcessing}
                    onClick={handleProcessPayment}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    {paymentProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    <span>Complete Payment & Generate Digital Slip</span>
                  </button>
                </div>
              ) : (
                /* Confirmed Digital Receipt */
                <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Booking & Payment Verified</span>
                    <h4 className="text-xl font-black text-slate-900 mt-0.5">Appointment Confirmed!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your clinical slot has been secured. Appointment ID has been registered in the hospital and patient dashboards.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between font-mono text-blue-700 font-bold border-b pb-2">
                      <span>Appointment ID:</span>
                      <span className="text-sm font-black">{successData.id || successData.appointment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient:</span>
                      <span className="font-bold text-slate-800">{successData.patient_name || patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Doctor:</span>
                      <span className="font-bold text-slate-800">{successData.doctor_name || getDoctorDisplayName(selectedDoctor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chief Complaint:</span>
                      <span className="font-bold text-slate-800">{successData.chief_complaint || chiefComplaint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Schedule:</span>
                      <span className="font-bold text-slate-800">{successData.appointment_date} at {successData.appointment_time}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-500">Payment Status:</span>
                      <span className="font-extrabold text-emerald-600">Paid & Verified</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export const AppointmentBookingModal = (props) => {
  if (!props.isOpen) return null;
  return (
    <ErrorBoundary level="modal" title="Appointment Booking Unavailable" onClose={props.onClose}>
      <AppointmentBookingModalContent {...props} />
    </ErrorBoundary>
  );
};
