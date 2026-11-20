import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle,
  Tag,
  Stethoscope,
  Calendar,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  Search,
  User,
  X,
  Video,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Filter,
  DollarSign,
  Award,
  Layers,
  HeartPulse,
  Info
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';
import { matchesDoctorQuery } from '../utils/symptomMapper';

export const HospitalDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Doctor search & filter state
  const [searchCareQuery, setSearchCareQuery] = useState(initialQuery);
  const [selectedSpeciality, setSelectedSpeciality] = useState('All');
  const [modeFilter, setModeFilter] = useState('All'); // 'All' | 'In-Person' | 'Video'
  const [availabilityFilter, setAvailabilityFilter] = useState('All'); // 'All' | 'Available'

  // Booking modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Advertisement modal for featured hospital offer
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [activePromoOffer, setActivePromoOffer] = useState(null);

  useEffect(() => {
    api.getHospital(id)
      .then(res => {
        setData(res);
        // If hospital has a featured offer and hasn't been dismissed in this session
        const hOffers = (res.offers || []).filter(o => o.organization_id === res.hospital?.id);
        const feat = hOffers.find(o => o.featured) || hOffers[0];
        const dismissed = sessionStorage.getItem(`allconnect_ad_seen_${id}`);
        if (feat && !dismissed && !initialQuery) {
          setActivePromoOffer(feat);
          setShowPromoModal(true);
        }
      })
      .catch(err => setError(err.message || 'Hospital profile not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDismissPromo = () => {
    setShowPromoModal(false);
    sessionStorage.setItem(`allconnect_ad_seen_${id}`, 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xs text-slate-500 font-semibold animate-pulse">Loading hospital profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 text-center max-w-sm space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-800">Hospital Not Found</h3>
          <p className="text-xs text-slate-500">{error || 'The requested hospital profile is unavailable or unpublished.'}</p>
          <Link to="/hospitals" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const { hospital, doctors = [], offers = [] } = data;
  // Strictly filter only offers belonging to this hospital
  const hospitalOffers = (offers || []).filter(o => o.organization_id === hospital?.id);

  // Compute available speciality categories in this hospital
  const hospitalSpecialities = Array.from(new Set([
    ...(hospital.departments || []),
    ...doctors.map(d => d.specialization).filter(Boolean),
    ...doctors.map(d => d.department).filter(Boolean)
  ])).filter(Boolean);

  // Standard category display list
  const standardCategories = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Pediatrics',
    'Neurology',
    'Ophthalmology',
    'Gynecology',
    'ENT',
    'Dentistry'
  ];

  // Merge unique categories actually available in this hospital
  const availableCategories = [
    'All',
    ...Array.from(new Set([
      ...standardCategories.filter(sc => hospitalSpecialities.some(hs => hs.toLowerCase().includes(sc.toLowerCase()))),
      ...hospitalSpecialities
    ]))
  ];

  // Filter hospital doctors by search, speciality, mode, and availability
  // (STRICT: ONLY doctors belonging to this hospital)
  const filteredDoctors = doctors.filter(doc => {
    // 1. Speciality filter
    const matchesSpeciality =
      selectedSpeciality === 'All' ||
      (doc.specialization || '').toLowerCase().includes(selectedSpeciality.toLowerCase()) ||
      (doc.department || '').toLowerCase().includes(selectedSpeciality.toLowerCase());

    // 2. Intelligent search match (symptoms, doctor name, speciality, department, keywords)
    const matchesQuery = matchesDoctorQuery(doc, searchCareQuery);

    // 3. Consultation Mode filter
    const docModes = String(doc.consultation_type || doc.consultation_modes || 'Both').toLowerCase();
    const matchesMode =
      modeFilter === 'All' ||
      (modeFilter === 'In-Person' && (docModes.includes('in-person') || docModes.includes('both'))) ||
      (modeFilter === 'Video' && (docModes.includes('video') || docModes.includes('both')));

    // 4. Availability filter
    const matchesAvailability =
      availabilityFilter === 'All' ||
      (availabilityFilter === 'Available' && doc.is_active !== false);

    return matchesSpeciality && matchesQuery && matchesMode && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb / Back Link */}
        <Link to="/hospitals" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Hospitals Directory</span>
        </Link>

        {/* ================================================================= */}
        {/* A. HOSPITAL OVERVIEW */}
        {/* ================================================================= */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
          {/* Header Banner Graphic / Cover */}
          <div className="h-44 sm:h-52 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative p-6 flex flex-col justify-between text-white">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                {hospital.category || 'Multi-Speciality Healthcare Centre'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Hospital
              </span>
            </div>

            <div className="z-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                  {hospital.name}
                </h1>
                <p className="text-xs sm:text-sm text-blue-200 font-medium italic mt-0.5">
                  {hospital.tagline || 'Leading Patient-Centric Clinical Ecosystem'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black text-sm backdrop-blur-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{hospital.rating || 4.8}</span>
                  <span className="text-[10px] text-blue-200 font-normal">({hospital.reviews_count || 120} reviews)</span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
          </div>

          {/* Overview Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Description & Contact Info (2 cols) */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">About the Hospital</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {hospital.description || `${hospital.name} is a premier accredited medical institution in Hyderabad, providing state-of-the-art diagnostic, outpatient, and surgical care with world-class medical specialists.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Address & Location</span>
                      <span className="font-semibold text-slate-800">{hospital.address}</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">{hospital.area}, Hyderabad, Telangana</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Hours</span>
                      <span className="font-semibold text-slate-800">{hospital.operating_hours || 'Mon - Sat: 08:00 AM - 09:00 PM'}</span>
                      <span className="block text-[11px] text-emerald-600 font-bold mt-0.5">24x7 Emergency Services Available</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                      <span className="font-semibold text-slate-800">OPD: {hospital.contact_phone || '+91 40 2345 6789'}</span>
                      <span className="block text-[11px] text-rose-600 font-bold mt-0.5">Emergency: {hospital.emergency_phone || '108 / +91 40 2345 9999'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility Capacity</span>
                      <span className="font-semibold text-slate-800">{hospital.bed_capacity || 250} Inpatient Beds</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">{doctors.length} Registered Medical Specialists</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Services Panel (1 col) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Available Hospital Services</span>
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {(hospital.services || [
                      '24x7 Emergency & Trauma Care',
                      'Intensive Care Units (ICU & CCU)',
                      'Advanced Modular Operation Theatres',
                      'Comprehensive Radiology & Diagnostics',
                      'In-House 24x7 Digital Pharmacy',
                      'Fully Equipped Cardiac Ambulance Fleet'
                    ]).map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[11px]">{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 text-center">
                  <a
                    href="#hospital-doctors-section"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Explore Hospital Doctors</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* B. SPECIALITIES AND DEPARTMENTS */}
        {/* ================================================================= */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-blue-600" />
                <span>CLINICAL EXCELLENCE</span>
              </span>
              <h2 className="text-xl font-black text-slate-900">Hospital Specialities & Departments</h2>
              <p className="text-xs text-slate-500">
                Tap on any clinical department to instantly filter and consult available specialists.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 self-start sm:self-auto">
              {hospitalSpecialities.length} Active Clinical Departments
            </span>
          </div>

          {/* Dedicated Specialities Chips Grid */}
          <div className="flex flex-wrap gap-2 pt-1">
            {availableCategories.map((spec) => {
              const isSelected = selectedSpeciality === spec;
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    setSelectedSpeciality(spec);
                    const el = document.getElementById('hospital-doctors-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-600'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/60'
                  }`}
                >
                  <Stethoscope className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  <span>{spec === 'All' ? 'All Specialities' : spec}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* C. DOCTORS DIRECTORY (SEPARATE WITH INTELLIGENT DISCOVERY) */}
        {/* ================================================================= */}
        <section id="hospital-doctors-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>DOCTORS DIRECTORY</span>
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black text-slate-900">
                Consult Hospital Specialists ({filteredDoctors.length})
              </h2>
              <span className="text-xs text-slate-500">
                Exclusively practicing at {hospital.name}
              </span>
            </div>
          </div>

          {/* Intelligent Search Input */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search symptom (e.g. Cold, Fever, Cough, Chest pain), doctor name, speciality, or department..."
                value={searchCareQuery}
                onChange={(e) => setSearchCareQuery(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {searchCareQuery && (
                <button
                  type="button"
                  onClick={() => setSearchCareQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  aria-label="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Non-diagnostic disclaimer alert */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-900">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                <strong>Non-Diagnostic Care Search:</strong> Symptoms map directly to verified clinical departments and doctors. No automated medical diagnosis is made.
              </span>
            </div>
          </div>

          {/* Filtering Controls: Speciality, Consultation Mode, Availability */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500">Consultation Mode:</span>
              {[
                { id: 'All', label: 'All Modes' },
                { id: 'In-Person', label: 'In-Person OPD' },
                { id: 'Video', label: 'Video Consultation' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModeFilter(m.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                    modeFilter === m.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">Availability:</span>
              {[
                { id: 'All', label: 'All Doctors' },
                { id: 'Available', label: 'Accepting Patients' }
              ].map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvailabilityFilter(a.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                    availabilityFilter === a.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Search & Filters Pill Display */}
          {(searchCareQuery || selectedSpeciality !== 'All' || modeFilter !== 'All' || availabilityFilter !== 'All') && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-bold">Active Filters:</span>
              {searchCareQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold">
                  Query: &ldquo;{searchCareQuery}&rdquo;
                  <button onClick={() => setSearchCareQuery('')} className="hover:text-blue-950"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedSpeciality !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold">
                  Dept: {selectedSpeciality}
                  <button onClick={() => setSelectedSpeciality('All')} className="hover:text-indigo-950"><X className="w-3 h-3" /></button>
                </span>
              )}
              {modeFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 font-bold">
                  Mode: {modeFilter}
                  <button onClick={() => setModeFilter('All')} className="hover:text-teal-950"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchCareQuery('');
                  setSelectedSpeciality('All');
                  setModeFilter('All');
                  setAvailabilityFilter('All');
                }}
                className="text-xs font-bold text-rose-600 hover:underline ml-2"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Doctor Cards Grid */}
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredDoctors.map(doc => {
                const docName = doc.name || doc.full_name || 'Doctor';
                const docSpecialty = doc.specialization || doc.specialty || doc.department || 'Specialist';
                const docQualifications = doc.qualifications || doc.qualification || 'MBBS, MD';
                const consultationFee = doc.consultation_fee || 600;

                return (
                  <div
                    key={doc.id}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        {/* Doctor Photograph / Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-xl shrink-0 overflow-hidden shadow-xs">
                          {doc.profile_photo_url || doc.photo_url ? (
                            <img src={doc.profile_photo_url || doc.photo_url} alt={docName} className="w-full h-full object-cover" />
                          ) : (
                            docName.replace(/^Dr\.?\s*/i, '').trim().charAt(0).toUpperCase() || 'D'
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                to={`/doctors/${doc.id}`}
                                className="font-black text-base text-slate-900 hover:text-blue-600 transition truncate block"
                              >
                                {docName}
                              </Link>
                              <p className="text-xs font-bold text-blue-700">{docSpecialty}</p>
                              <p className="text-[11px] text-slate-500">{docQualifications} &bull; {doc.department || 'General OPD'}</p>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {doc.rating || 4.8}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {doc.bio || `${docName} has over ${doc.experience_years || 5} years of specialized clinical experience at ${hospital.name}.`}
                      </p>

                      {/* Doctor Details Bar: Fee, Modes, Next Available */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-500 font-bold">Consultation Fee:</span>
                          <span className="font-black text-slate-900 text-sm text-blue-700">₹{consultationFee}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">Consultation Modes:</span>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                              In-Person
                            </span>
                            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold text-[10px] border border-teal-200">
                              Video OPD
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-500 font-bold">Next Available Slot:</span>
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>Today / Tomorrow Available</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: View Profile & Book Appointment */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2.5">
                      <Link
                        to={`/doctors/${doc.id}`}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
                      >
                        View Profile
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setBookingModalOpen(true);
                        }}
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Appointment</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <p className="font-bold text-slate-700 text-sm">No doctors found matching your selection.</p>
              <p>Try searching for a different symptom or clearing the active filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchCareQuery('');
                  setSelectedSpeciality('All');
                  setModeFilter('All');
                  setAvailabilityFilter('All');
                }}
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                View All Doctors at {hospital.name}
              </button>
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* D. OFFERS AND PROMOTIONS (COMPLETELY SEPARATE PROMOTIONAL SECTION) */}
        {/* ================================================================= */}
        {hospitalOffers.length > 0 && (
          <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>HOSPITAL PROMOTIONS & PACKAGES</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Exclusive Care Packages & Offers at {hospital.name}
                </h2>
                <p className="text-xs text-slate-300">
                  Subsidized comprehensive health packages and outpatient promotions.
                </p>
              </div>

              <Link
                to={`/offers?organization_id=${hospital.id}`}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                <span>All Offers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hospitalOffers.map(off => (
                <div
                  key={off.id}
                  className="bg-white/5 border border-white/10 hover:border-blue-400/50 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition hover:shadow-lg backdrop-blur-sm"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
                        {off.discount_percentage}% OFF
                      </span>
                      <span className="text-[10px] text-blue-200 font-bold uppercase">
                        {off.category || 'Special Package'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-white">{off.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{off.description}</p>

                    <div className="pt-1 text-[11px] text-slate-400 space-y-1">
                      <p className="flex items-center gap-1 text-amber-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Valid until: {off.end_date || '2027-12-31'}</span>
                      </p>
                      {off.applicable_departments && (
                        <p className="text-blue-200">
                          Applies to: {off.applicable_departments.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      {off.original_price && (
                        <span className="text-xs text-slate-400 line-through mr-1 block">₹{off.original_price}</span>
                      )}
                      <span className="text-xl font-black text-white">₹{off.discounted_price}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(doctors[0] || null);
                        setBookingModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition"
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Featured Advertisement Pop-up Modal */}
      {showPromoModal && activePromoOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 relative animate-in zoom-in-95">
            <button
              onClick={handleDismissPromo}
              className="absolute right-4 top-4 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
              aria-label="Close Advertisement"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Header */}
            <div className="p-6 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white relative space-y-3">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
                FEATURED PROMOTION • {activePromoOffer.discount_percentage}% OFF
              </span>
              <h3 className="text-xl font-black text-white">{activePromoOffer.title}</h3>
              <p className="text-xs text-blue-100">{hospital.name}</p>
            </div>

            {/* Banner Body */}
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">{activePromoOffer.description}</p>
              
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 line-through text-[11px] block">Standard: ₹{activePromoOffer.original_price}</span>
                  <span className="text-xl font-black text-slate-900">Offer: ₹{activePromoOffer.discounted_price}</span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                  Save ₹{(activePromoOffer.original_price || 0) - (activePromoOffer.discounted_price || 0)}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDismissPromo}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDismissPromo();
                    setSelectedDoctor(doctors[0] || null);
                    setBookingModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition"
                >
                  Book Package Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctor={selectedDoctor}
        initialHospital={hospital}
        initialComplaint={searchCareQuery || initialQuery}
      />
    </div>
  );
};

export default HospitalDetailPage;
