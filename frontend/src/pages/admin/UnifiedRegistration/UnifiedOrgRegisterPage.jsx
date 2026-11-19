import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { LogoUploadControl } from '../../../components/LogoUploadControl';
import { InteractiveLocationPicker } from '../../../components/InteractiveLocationPicker';
import { RegistrationDocumentsSection } from '../../../components/RegistrationDocumentsSection';
import {
  Building2,
  Stethoscope,
  Pill,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
  Globe,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Calendar,
  Check,
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';

export const UnifiedOrgRegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read preselected type from URL (?type=hospital | clinic | pharmacy)
  const initialType = searchParams.get('type') || 'hospital';
  const [orgType, setOrgType] = useState(initialType);

  // Multi-step form step (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Global submission states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // -------------------------------------------------------------
  // FORM STATE ACROSS ALL 6 STEPS
  // -------------------------------------------------------------
  const [formData, setFormData] = useState({
    // Step 1: Type & Category
    organization_type: initialType,
    category: 'Multi-speciality Hospital', // or Primary Care, Retail Pharmacy
    
    // Step 2: Basic Information
    name: '',
    logo_url: '',
    logo_meta: null,
    cover_image_url: '',
    website: '', // OPTIONAL
    contact_phone: '',
    email: '',
    registration_number: '',
    description: '',
    bed_capacity: 150, // hospital specific
    emergency_24x7: true,
    operating_hours: '09:00 AM - 08:00 PM',
    home_delivery: true, // pharmacy specific

    // Step 3: Location (No lat/lng displayed to admin)
    address: '',
    locality: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    country: 'India',
    latitude: 17.4239,
    longitude: 78.4483,
    location_confirmed: false,

    // Step 4: Documents (Max 5 files, Max 100 KB each)
    documents: [],

    // Step 5: Subscription Plan
    subscription_plan: 'hospital_enterprise',
    billing_cycle: 'annual',
    payment_status: 'Paid',
    admin_remarks: 'Awaiting accreditation review by Super Admin'
  });

  // Sync orgType with URL parameter
  useEffect(() => {
    const t = searchParams.get('type');
    if (t && ['hospital', 'clinic', 'pharmacy'].includes(t)) {
      setOrgType(t);
      setFormData(prev => ({
        ...prev,
        organization_type: t,
        category: t === 'hospital' ? 'Multi-speciality Hospital' : (t === 'clinic' ? 'Outpatient Clinic' : 'Retail Medical Store'),
        subscription_plan: t === 'hospital' ? 'hospital_enterprise' : (t === 'clinic' ? 'clinic_pro' : 'pharmacy_pro')
      }));
    }
  }, [searchParams]);

  const handleTypeSelect = (type) => {
    setOrgType(type);
    setSearchParams({ type });
    setFormData(prev => ({
      ...prev,
      organization_type: type,
      category: type === 'hospital' ? 'Multi-speciality Hospital' : (type === 'clinic' ? 'Outpatient Clinic' : 'Retail Medical Store'),
      subscription_plan: type === 'hospital' ? 'hospital_enterprise' : (type === 'clinic' ? 'clinic_pro' : 'pharmacy_pro')
    }));
  };

  // -------------------------------------------------------------
  // STEP VALIDATION HANDLERS
  // -------------------------------------------------------------
  const validateStep = (step) => {
    setError(null);

    if (step === 1) {
      if (!formData.organization_type) {
        setError('Please select an organisation type.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.name.trim()) {
        setError('Organisation name is required.');
        return false;
      }
      if (!formData.contact_phone.trim()) {
        setError('Official contact phone number is required.');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Official email address is required.');
        return false;
      }
      // Note: Website is explicitly OPTIONAL - no validation check
      return true;
    }

    if (step === 3) {
      if (!formData.address.trim()) {
        setError('Please select a location on the map or enter the full street address.');
        return false;
      }
      if (!formData.locality.trim()) {
        setError('Locality or area name is required.');
        return false;
      }
      if (!formData.city.trim()) {
        setError('City is required.');
        return false;
      }
      if (!formData.pincode.trim()) {
        setError('PIN code is required.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      // Step 4 Documents check: max 5 files, max 100 KB
      if (formData.documents.length > 5) {
        setError('Maximum 5 uploaded files allowed.');
        return false;
      }
      for (const d of formData.documents) {
        if (d.size_bytes > 100 * 1024) {
          setError(`Document '${d.original_name || d.document_name}' exceeds the 100 KB limit.`);
          return false;
        }
      }
      return true;
    }

    if (step === 5) {
      if (!formData.subscription_plan) {
        setError('Please select a subscription plan.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(6, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -------------------------------------------------------------
  // FINAL SUBMISSION
  // -------------------------------------------------------------
  const handleSubmitRegistration = async () => {
    setLoading(true);
    setError(null);

    // Format verification documents array
    const formattedDocs = formData.documents.map(d => ({
      document_name: d.document_name,
      file_name: d.file_name,
      original_name: d.original_name,
      file_type: d.file_type,
      size_bytes: d.size_bytes,
      size_formatted: d.size_formatted,
      view_url: d.view_url,
      download_url: d.download_url,
      status: 'pending_verification'
    }));

    const payload = {
      organization_type: formData.organization_type,
      name: formData.name.trim(),
      hospital_category: formData.category,
      specialty: formData.category,
      category: formData.category,
      logo_url: formData.logo_url || '',
      logo_size_bytes: formData.logo_meta?.size_bytes || 0,
      cover_image_url: formData.cover_image_url || '',
      website: formData.website ? formData.website.trim() : '', // Optional!
      contact_phone: formData.contact_phone.trim(),
      phone: formData.contact_phone.trim(),
      email: formData.email.trim(),
      registration_number: formData.registration_number.trim() || `REG-${Date.now().toString().slice(-6)}`,
      license_number: formData.registration_number.trim() || `TS-DL-${Date.now().toString().slice(-6)}`,
      description: formData.description.trim() || `${formData.name} - Quality healthcare services`,
      bed_capacity: Number(formData.bed_capacity) || 100,
      emergency_24x7: Boolean(formData.emergency_24x7),
      operating_hours: formData.operating_hours,
      home_delivery_available: Boolean(formData.home_delivery),

      // Location fields (no lat/lng displayed, sent internally)
      address: formData.address.trim(),
      locality: formData.locality.trim(),
      area: formData.locality.trim(),
      city: formData.city.trim() || 'Hyderabad',
      state: formData.state.trim() || 'Telangana',
      pincode: formData.pincode.trim(),
      country: formData.country.trim() || 'India',
      latitude: formData.latitude || 17.4239,
      longitude: formData.longitude || 78.4483,

      // Supporting Documents
      verification_documents: formattedDocs,

      // Subscription & Governance
      subscription_plan: formData.subscription_plan,
      billing_cycle: formData.billing_cycle,
      payment_status: formData.payment_status,
      verification_status: 'pending_verification',
      publishing_status: 'unpublished',
      appointment_availability_status: 'disabled',
      admin_remarks: formData.admin_remarks || 'Submitted for Super Admin verification'
    };

    try {
      const res = await api.registerOrganizationUnified(payload);
      setSuccessResult({
        type: formData.organization_type,
        data: res.organization || res.hospital || res.clinic || res.pharmacy,
        message: res.message
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Type', subtitle: 'Select Classification' },
    { num: 2, title: 'Basic Info', subtitle: 'Name, Logo & Contact' },
    { num: 3, title: 'Location', subtitle: 'Interactive Map' },
    { num: 4, title: 'Documents', subtitle: 'Max 5 Files (100 KB)' },
    { num: 5, title: 'Subscription', subtitle: 'Plan & Billing' },
    { num: 6, title: 'Review', subtitle: 'Verify & Submit' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                CENTRAL ORGANISATION ONBOARDING
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Register New Healthcare Organisation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Automated onboarding workflow with Leaflet interactive map address detection, logo upload, custom document slots, and regulatory governance.
            </p>
          </div>

          <Link
            to="/dashboard/admin"
            className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5 shrink-0"
          >
            <span>Platform Overview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Responsive Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[560px] sm:min-w-0">
          {stepsList.map((st, idx) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <React.Fragment key={st.num}>
                <div
                  onClick={() => {
                    // Allow jumping back to previously completed steps
                    if (st.num < currentStep) setCurrentStep(st.num);
                  }}
                  className={`flex items-center space-x-2.5 ${st.num < currentStep ? 'cursor-pointer' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-600/30'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                  </div>
                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        isCurrent ? 'text-blue-700 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {st.title}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden md:block">
                      {st.subtitle}
                    </span>
                  </div>
                </div>

                {idx < stepsList.length - 1 && (
                  <div className="flex-1 mx-3 h-0.5 bg-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentStep > st.num ? 'bg-emerald-500' : 'bg-transparent'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-bold animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {successResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              REGISTRATION SUBMITTED
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {formData.name} Registered!
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Assigned ID: <strong className="font-mono text-slate-900">{successResult.data?.id || 'ORG-XXXX'}</strong>.
              <br />
              Status is marked as <strong className="text-amber-700">pending_verification</strong> and appointments are <strong className="text-rose-600">disabled</strong> pending Super Admin regulatory approval.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                to="/dashboard/admin/approvals"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                Go to Approvals Queue
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessResult(null);
                  setCurrentStep(1);
                  setFormData(prev => ({
                    ...prev,
                    name: '',
                    logo_url: '',
                    logo_meta: null,
                    website: '',
                    contact_phone: '',
                    email: '',
                    address: '',
                    documents: []
                  }));
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
              >
                Register Another Organisation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 1: ORGANISATION TYPE SELECTION */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Step 1: Select Organisation Classification</span>
            </h2>
            <p className="text-xs text-slate-500">
              The chosen classification configures specific regulatory documents, subscription plans, and operational dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Hospital Card */}
            <div
              onClick={() => handleTypeSelect('hospital')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                orgType === 'hospital'
                  ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  orgType === 'hospital' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Hospital</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-speciality or single-speciality tertiary care facility with inpatient bed capacity.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/80 mt-4 flex justify-between items-center text-xs font-bold text-blue-700">
                <span>Enterprise Suite</span>
                {orgType === 'hospital' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
            </div>

            {/* Clinic Card */}
            <div
              onClick={() => handleTypeSelect('clinic')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                orgType === 'clinic'
                  ? 'border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  orgType === 'clinic' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Outpatient Clinic</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Independent, single-doctor, or multi-doctor outpatient clinic & consultation centre.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/80 mt-4 flex justify-between items-center text-xs font-bold text-teal-700">
                <span>Clinic Pro Mesh</span>
                {orgType === 'clinic' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </div>
            </div>

            {/* Pharmacy Card */}
            <div
              onClick={() => handleTypeSelect('pharmacy')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                orgType === 'pharmacy'
                  ? 'border-amber-600 bg-amber-50/40 shadow-md ring-2 ring-amber-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  orgType === 'pharmacy' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Pharmacy / Medical Store</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Licensed retail pharmacy, prescription medicine dispensing & counter pickup terminal.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/80 mt-4 flex justify-between items-center text-xs font-bold text-amber-700">
                <span>Retail Store Tier</span>
                {orgType === 'pharmacy' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </div>
            </div>

          </div>

          {/* Sub-Category Selection */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Specific Clinical Classification / Specialty
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {orgType === 'hospital' && (
                <>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="hospital_cat"
                      checked={formData.category === 'Multi-speciality Hospital'}
                      onChange={() => setFormData({ ...formData, category: 'Multi-speciality Hospital' })}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-800">Multi-Speciality Hospital</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="hospital_cat"
                      checked={formData.category === 'Single-speciality Hospital'}
                      onChange={() => setFormData({ ...formData, category: 'Single-speciality Hospital' })}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-800">Single-Speciality Hospital (Eye, Ortho, Cardio, Maternity)</span>
                  </label>
                </>
              )}

              {orgType === 'clinic' && (
                <>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="clinic_cat"
                      checked={formData.category === 'Primary Care & Family Medicine'}
                      onChange={() => setFormData({ ...formData, category: 'Primary Care & Family Medicine' })}
                      className="text-teal-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-800">Family Medicine & General Practice Clinic</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="clinic_cat"
                      checked={formData.category === 'Specialist Consultation Centre'}
                      onChange={() => setFormData({ ...formData, category: 'Specialist Consultation Centre' })}
                      className="text-teal-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-800">Specialist Polyclinic / Dental / Eye Care</span>
                  </label>
                </>
              )}

              {orgType === 'pharmacy' && (
                <>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="pharm_cat"
                      checked={formData.category === 'Retail Chemist & Druggist'}
                      onChange={() => setFormData({ ...formData, category: 'Retail Chemist & Druggist' })}
                      className="text-amber-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-800">Retail Chemist & Druggist Store</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="pharm_cat"
                      checked={formData.category === 'Hospital Attached Pharmacy'}
                      onChange={() => setFormData({ ...formData, category: 'Hospital Attached Pharmacy' })}
                      className="text-amber-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-800">Campus / Hospital-Attached Pharmacy</span>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 2: BASIC INFORMATION */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Step 2: Basic Information & Logo Upload</span>
              </h2>
              <p className="text-xs text-slate-500">
                Core identity details. Website URL is completely optional.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
              {formData.organization_type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            
            {/* Organisation Name */}
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Organisation Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={
                  orgType === 'hospital' ? 'e.g. Yashoda Super Speciality Hospital' :
                  orgType === 'clinic' ? 'e.g. MedPlus Family Health Clinic' : 'e.g. Apollo Pharmacy - Begumpet'
                }
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Logo Upload (Strict <= 100 KB) */}
            <div className="md:col-span-2">
              <LogoUploadControl
                logoUrl={formData.logo_url}
                logoFileMeta={formData.logo_meta}
                onLogoChange={(meta) => {
                  setFormData({
                    ...formData,
                    logo_url: meta?.url || '',
                    logo_meta: meta
                  });
                }}
                label={`${formData.organization_type.charAt(0).toUpperCase() + formData.organization_type.slice(1)} Logo`}
                subtitle="PNG, JPG, JPEG, or WEBP (Strictly max 100 KB)"
              />
            </div>

            {/* Official Email */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. info@yashoda.health"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Official Contact Phone */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Official Contact Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +91 40 2780 1234"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Website URL (OPTIONAL) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 block">Website URL</label>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <input
                type="url"
                placeholder="https://www.example.com (Leave empty if no website)"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-700"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Registration will succeed whether a website is entered or left blank.
              </p>
            </div>

            {/* Registration / Licence Number */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {orgType === 'pharmacy' ? 'State Drug Licence Number (Form 20/21)' : 'Establishment Registration Number'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={orgType === 'pharmacy' ? 'e.g. TS/DCA/2026/40192' : 'e.g. TS-DHS-2026-0042'}
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Hospital Bed Capacity if hospital */}
            {orgType === 'hospital' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Inpatient Bed Capacity</label>
                <input
                  type="number"
                  min="10"
                  value={formData.bed_capacity}
                  onChange={(e) => setFormData({ ...formData, bed_capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Pharmacy Home Delivery Toggle */}
            {orgType === 'pharmacy' && (
              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="homedelivery"
                  checked={formData.home_delivery}
                  onChange={(e) => setFormData({ ...formData, home_delivery: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-0"
                />
                <label htmlFor="homedelivery" className="font-bold text-slate-700 cursor-pointer">
                  Enable Home Delivery for Local Prescription Orders
                </label>
              </div>
            )}

            {/* Description / Summary */}
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Description / Tagline</label>
              <textarea
                rows={2}
                placeholder="Brief clinical description or patient service highlights..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 3: LOCATION (GOOGLE MAPS INTERACTIVE SELECTION) */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Step 3: Interactive Location Selection & Address Detection</span>
            </h2>
            <p className="text-xs text-slate-500">
              Search any location or tap the map to position the organisation pin. Address, locality, city, state and PIN code are automatically detected.
            </p>
          </div>

          <InteractiveLocationPicker
            addressData={formData}
            onChange={(locData) => {
              setFormData(prev => ({
                ...prev,
                ...locData,
                location_confirmed: true
              }));
            }}
            onConfirm={() => {
              setFormData(prev => ({ ...prev, location_confirmed: true }));
            }}
            isConfirmed={formData.location_confirmed}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 4: REGISTRATION DOCUMENTS & SUPPORTING IMAGES */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 4 && (
        <RegistrationDocumentsSection
          documents={formData.documents}
          onChange={(newDocs) => setFormData({ ...formData, documents: newDocs })}
          orgType={formData.organization_type}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 5: SUBSCRIPTION PLAN */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Step 5: Select SaaS Subscription Tier</span>
            </h2>
            <p className="text-xs text-slate-500">
              Configure software access tier and billing schedule for this provider.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center space-x-3 bg-slate-100 p-1.5 rounded-2xl w-fit text-xs font-bold">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, billing_cycle: 'monthly' })}
              className={`px-4 py-1.5 rounded-xl transition ${
                formData.billing_cycle === 'monthly' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, billing_cycle: 'annual' })}
              className={`px-4 py-1.5 rounded-xl transition ${
                formData.billing_cycle === 'annual' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Billing (Save 20%)
            </button>
          </div>

          {/* Plan Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orgType === 'hospital' && (
              <>
                <div
                  onClick={() => setFormData({ ...formData, subscription_plan: 'hospital_enterprise' })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                    formData.subscription_plan === 'hospital_enterprise'
                      ? 'border-blue-600 bg-blue-50/40 shadow-md'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                        Enterprise
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">Hospital Enterprise Mesh</h4>
                    </div>
                    <span className="text-lg font-black text-blue-700">
                      {formData.billing_cycle === 'annual' ? '₹2,99,999/yr' : '₹29,999/mo'}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 mt-3 space-y-1">
                    <li>• Unlimited Doctors & Department OPD Queues</li>
                    <li>• Universal Health ID Federation</li>
                    <li>• Live Token Countdown & Consultation Receipts</li>
                  </ul>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, subscription_plan: 'hospital_standard' })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                    formData.subscription_plan === 'hospital_standard'
                      ? 'border-blue-600 bg-blue-50/40 shadow-md'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        Standard
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">Single-Speciality Hospital Tier</h4>
                    </div>
                    <span className="text-lg font-black text-slate-900">
                      {formData.billing_cycle === 'annual' ? '₹1,29,999/yr' : '₹12,999/mo'}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 mt-3 space-y-1">
                    <li>• Up to 15 Consultant Specialists</li>
                    <li>• Single Department Live Queue</li>
                    <li>• Digital Rx Integration</li>
                  </ul>
                </div>
              </>
            )}

            {orgType === 'clinic' && (
              <div
                onClick={() => setFormData({ ...formData, subscription_plan: 'clinic_pro' })}
                className="sm:col-span-2 p-5 rounded-2xl border-2 border-teal-600 bg-teal-50/40 shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 uppercase">
                      Clinic Pro
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">Outpatient Clinic Pro Tier</h4>
                  </div>
                  <span className="text-lg font-black text-teal-700">
                    {formData.billing_cycle === 'annual' ? '₹49,990/yr' : '₹4,999/mo'}
                  </span>
                </div>
                <ul className="text-xs text-slate-600 mt-3 space-y-1">
                  <li>• Single or Multi-Doctor Clinic Mode Auto-detection</li>
                  <li>• Doctor Availability & Leave Controls</li>
                  <li>• Daily Patient Fee Collections & Printable Receipts</li>
                </ul>
              </div>
            )}

            {orgType === 'pharmacy' && (
              <div
                onClick={() => setFormData({ ...formData, subscription_plan: 'pharmacy_pro' })}
                className="sm:col-span-2 p-5 rounded-2xl border-2 border-amber-600 bg-amber-50/40 shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">
                      Pharmacy Pro
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">Retail Medical Store Mesh Connector</h4>
                  </div>
                  <span className="text-lg font-black text-amber-700">
                    {formData.billing_cycle === 'annual' ? '₹29,990/yr' : '₹2,999/mo'}
                  </span>
                </div>
                <ul className="text-xs text-slate-600 mt-3 space-y-1">
                  <li>• Prescription Quotation Builder</li>
                  <li>• Instant Counter Pickup Passcode Verification</li>
                  <li>• Zero Commission on Medicine Sales</li>
                </ul>
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="pt-2 text-xs">
            <label className="font-bold text-slate-700 block mb-1">Onboarding Payment Status</label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="paystatus"
                  checked={formData.payment_status === 'Paid'}
                  onChange={() => setFormData({ ...formData, payment_status: 'Paid' })}
                  className="text-emerald-600 focus:ring-0"
                />
                <span className="font-bold text-emerald-800">Paid / Subscribed</span>
              </label>
              <label className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="radio"
                  name="paystatus"
                  checked={formData.payment_status === 'Pending Payment'}
                  onChange={() => setFormData({ ...formData, payment_status: 'Pending Payment' })}
                  className="text-amber-600 focus:ring-0"
                />
                <span className="font-bold text-amber-800">Pending Invoice Settlement</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 6: COMPLETE REVIEW & SUBMISSION */}
      {/* ------------------------------------------------------------- */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Step 6: Review Registration & Confirm Submission</span>
              </h2>
              <p className="text-xs text-slate-500">
                Verify all information before final submission to the Super Admin approvals queue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Box 1: Organisation & Logo */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Identity & Contact</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-blue-600 font-bold hover:underline text-[11px]"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center space-x-3 pt-1">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 font-bold shrink-0">
                    No Logo
                  </div>
                )}
                <div>
                  <h4 className="font-black text-sm text-slate-900">{formData.name}</h4>
                  <p className="text-slate-500">{formData.category} ({formData.organization_type})</p>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200/60 text-slate-700">
                <p>Phone: <strong>{formData.contact_phone}</strong></p>
                <p>Email: <strong>{formData.email}</strong></p>
                <p>Website: {formData.website ? <strong className="text-blue-600">{formData.website}</strong> : <span className="text-slate-400 italic">None provided (Optional)</span>}</p>
                <p>Reg/Licence: <strong className="font-mono">{formData.registration_number || 'Auto'}</strong></p>
              </div>
            </div>

            {/* Box 2: Address & Location */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Selected Location</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-blue-600 font-bold hover:underline text-[11px]"
                >
                  Edit
                </button>
              </div>

              <p className="font-bold text-slate-900 text-xs">{formData.address}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Locality / Area</span>
                  <span className="font-bold text-slate-800">{formData.locality}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">City & State</span>
                  <span className="font-bold text-slate-800">{formData.city}, {formData.state}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">PIN Code</span>
                  <span className="font-mono font-bold text-blue-700">{formData.pincode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Country</span>
                  <span className="font-bold text-slate-800">{formData.country}</span>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Leaflet Map Position Verified</span>
              </div>
            </div>

            {/* Box 3: Documents Uploaded */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Supporting Documents ({formData.documents.length}/5)</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-blue-600 font-bold hover:underline text-[11px]"
                >
                  Edit
                </button>
              </div>

              {formData.documents.length === 0 ? (
                <p className="text-slate-400 italic">No supporting documents uploaded.</p>
              ) : (
                <div className="space-y-1.5">
                  {formData.documents.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                      <span className="font-bold text-slate-800 truncate">{d.document_name}</span>
                      <span className="text-slate-400 font-mono text-[10px] shrink-0">{d.size_formatted}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Box 4: Subscription */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Subscription Details</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="text-blue-600 font-bold hover:underline text-[11px]"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-1 pt-1">
                <p>Plan: <strong className="uppercase font-mono text-blue-700">{formData.subscription_plan}</strong></p>
                <p>Billing Cycle: <strong className="capitalize">{formData.billing_cycle}</strong></p>
                <p>Payment: <strong className="text-emerald-700">{formData.payment_status}</strong></p>
              </div>
            </div>

          </div>

          {/* Regulatory Gating Notice */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-extrabold flex items-center gap-1.5 text-amber-800">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Regulatory Accreditation Review Notice:</span>
            </p>
            <p className="text-amber-800/90 leading-relaxed">
              Upon submission, this organisation will be created in <strong className="font-mono">pending_verification</strong> status and <strong className="font-mono">disabled</strong> appointment booking availability. It will appear immediately in the Super Admin Regulatory Approvals Queue for credential inspection before public patient marketplace activation.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FORM NAVIGATION BAR (BACK & NEXT / SUBMIT BUTTONS) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-2 transition ml-auto"
          >
            <span>Continue to {stepsList[currentStep]?.title || 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmitRegistration}
            className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition ml-auto disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Submitting Registration...' : 'Confirm & Register Organisation'}</span>
          </button>
        )}
      </div>

    </div>
  );
};
