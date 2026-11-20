import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Stethoscope,
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle,
  Tag,
  ChevronLeft,
  Search,
  User,
  Calendar,
  ShieldCheck,
  X,
  AlertCircle,
  Sparkles,
  Video,
  CheckCircle2,
  ArrowRight,
  Info,
  Layers,
  HeartPulse
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';
import { matchesDoctorQuery } from '../utils/symptomMapper';

export const ClinicDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || searchParams.get('q') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Doctor search & filter state
  const [searchDoctorQuery, setSearchDoctorQuery] = useState(initialQuery);
  const [selectedSpeciality, setSelectedSpeciality] = useState('All');
  const [modeFilter, setModeFilter] = useState('All'); // 'All' | 'In-Person' | 'Video'

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Advertisement modal for clinic offer
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [activePromoOffer, setActivePromoOffer] = useState(null);

  useEffect(() => {
    api.getClinic(id)
      .then(res => {
        setData(res);
        // If clinic has a featured offer and hasn't been dismissed in this session
        const cOffers = (res.offers || []).filter(o => o.organization_id === res.clinic?.id);
        const feat = cOffers.find(o => o.featured) || cOffers[0];
        const dismissed = sessionStorage.getItem(`allconnect_ad_seen_${id}`);
        if (feat && !dismissed && !initialQuery) {
          setActivePromoOffer(feat);
          setShowPromoModal(true);
        }
      })
      .catch(err => setError(err.message || 'Clinic not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDismissPromo = () => {
    setShowPromoModal(false);
    sessionStorage.setItem(`allconnect_ad_seen_${id}`, 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xs text-slate-500 font-semibold animate-pulse">Loading clinic profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 text-center max-w-sm space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-800">Clinic Not Found</h3>
          <p className="text-xs text-slate-500">{error || 'The requested clinic is unavailable.'}</p>
          <Link to="/clinics" className="inline-block px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
            Back to Clinics Directory
          </Link>
        </div>
      </div>
    );
  }

  const { clinic, doctors = [], offers = [] } = data;
  // Strictly filter offers belonging to this clinic
  const clinicOffers = (offers || []).filter(o => o.organization_id === clinic?.id);
  const isSingleDoctor = doctors.length === 1 || clinic.is_single_doctor;

  // Available specialities in this clinic
  const clinicSpecialities = Array.from(new Set([
    ...(clinic.departments || []),
    ...doctors.map(d => d.specialization).filter(Boolean),
    ...doctors.map(d => d.department).filter(Boolean)
  ])).filter(Boolean);

  const filterCategories = ['All', ...clinicSpecialities];

  // Filter clinic doctors (ONLY doctors belonging to this clinic)
  const filteredDoctors = doctors.filter(doc => {
    const matchesSpec =
      selectedSpeciality === 'All' ||
      (doc.specialization || '').toLowerCase().includes(selectedSpeciality.toLowerCase()) ||
      (doc.department || '').toLowerCase().includes(selectedSpeciality.toLowerCase());

    const matchesQ = matchesDoctorQuery(doc, searchDoctorQuery);

    const docModes = String(doc.consultation_type || doc.consultation_modes || 'Both').toLowerCase();
    const matchesMode =
      modeFilter === 'All' ||
      (modeFilter === 'In-Person' && (docModes.includes('in-person') || docModes.includes('both'))) ||
      (modeFilter === 'Video' && (docModes.includes('video') || docModes.includes('both')));

    return matchesSpec && matchesQ && matchesMode;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link to="/clinics" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-teal-600 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Clinics Directory</span>
        </Link>

        {/* ================================================================= */}
        {/* 1. CLINIC OVERVIEW */}
        {/* ================================================================= */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
          {/* Header Cover Banner */}
          <div className="h-40 sm:h-48 bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 relative p-6 flex flex-col justify-between text-white">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                {clinic.category || 'Outpatient Community Polyclinic'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Verified Clinic
              </span>
            </div>

            <div className="z-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                  {clinic.name}
                </h1>
                <p className="text-xs sm:text-sm text-teal-200 font-medium italic mt-0.5">
                  {clinic.tagline || 'Neighborhood Primary & Specialist Outpatient Care'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black text-sm backdrop-blur-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{clinic.rating || 4.8}</span>
                  <span className="text-[10px] text-teal-200 font-normal">({clinic.reviews_count || 45} reviews)</span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-radial from-teal-500/10 to-transparent pointer-events-none" />
          </div>

          {/* Overview Info Body */}
          <div className="p-6 sm:p-8 space-y-5">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {clinic.description || `${clinic.name} offers comprehensive outpatient medical care, routine diagnostics, and verified specialist consultations in Hyderabad.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Address & Area</span>
                  <span className="font-semibold text-slate-800">{clinic.address}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{clinic.area}, Hyderabad</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Hours</span>
                  <span className="font-semibold text-slate-800">{clinic.operating_hours || '09:00 AM - 09:00 PM'}</span>
                  <span className="block text-[11px] text-teal-700 font-bold mt-0.5">Walk-ins & Appointments</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <span className="font-semibold text-slate-800">{clinic.contact_phone || '+91 40 2789 0123'}</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Quick OPD Desk</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. SPECIALITIES AND SERVICES */}
        {/* ================================================================= */}
        <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <span>CLINICAL SPECIALITIES & SERVICES</span>
              </span>
              <h2 className="text-xl font-black text-slate-900">Offered Specialities</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {isSingleDoctor ? 'Solo Practitioner Clinic' : `${doctors.length} Doctors Registered`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterCategories.map(spec => (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpeciality(spec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedSpeciality === spec
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-2 ring-teal-600'
                    : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200/60'
                }`}
              >
                <Stethoscope className={`w-3.5 h-3.5 ${selectedSpeciality === spec ? 'text-white' : 'text-teal-600'}`} />
                <span>{spec === 'All' ? 'All Clinic Specialities' : spec}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. AVAILABLE DOCTORS (SINGLE-DOCTOR vs MULTI-DOCTOR CLINIC) */}
        {/* ================================================================= */}
        <section id="clinic-doctors-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>DOCTORS DIRECTORY</span>
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black text-slate-900">
                {isSingleDoctor ? 'Attending Physician & Appointment Booking' : `Available Clinic Doctors (${filteredDoctors.length})`}
              </h2>
              <span className="text-xs text-slate-500">
                Practicing exclusively at {clinic.name}
              </span>
            </div>
          </div>

          {/* SINGLE-DOCTOR CLINIC: Display the doctor directly without redundant steps */}
          {isSingleDoctor && doctors.length > 0 ? (
            (() => {
              const doc = doctors[0];
              const docName = doc.name || doc.full_name || 'Doctor';
              const docSpecialty = doc.specialization || doc.specialty || doc.department || 'General Physician';
              const docQuals = doc.qualifications || doc.qualification || 'MBBS, MD';
              const fee = doc.consultation_fee || 500;

              return (
                <div className="bg-teal-50/50 border border-teal-200/80 rounded-3xl p-6 sm:p-7 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-teal-100 text-teal-700 font-extrabold text-2xl flex items-center justify-center shrink-0 overflow-hidden border border-teal-200 shadow-sm">
                        {doc.profile_photo_url || doc.photo_url ? (
                          <img src={doc.profile_photo_url || doc.photo_url} alt={docName} className="w-full h-full object-cover" />
                        ) : (
                          docName.replace(/^Dr\.?\s*/i, '').trim().charAt(0).toUpperCase() || 'D'
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link to={`/doctors/${doc.id}`} className="font-black text-xl text-slate-900 hover:text-teal-600 transition">
                            {docName}
                          </Link>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            Accepting Patients
                          </span>
                        </div>
                        <p className="text-xs font-bold text-teal-800">{docSpecialty}</p>
                        <p className="text-[11px] text-slate-500">{docQuals} &bull; {doc.experience_years || 8} Years Clinical Experience</p>
                      </div>
                    </div>

                    <div className="sm:text-right bg-white p-3.5 rounded-2xl border border-teal-100 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                      <span className="text-xl font-black text-slate-900">₹{fee}</span>
                      <span className="text-[10px] text-teal-600 font-bold block">In-Person & Video OPD</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.bio || `${docName} is the attending practitioner at ${clinic.name}, providing dedicated primary consultations and outpatient treatment.`}
                  </p>

                  {/* Available Consultation Slots Today */}
                  <div className="p-4 bg-white rounded-2xl border border-teal-100 space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>Next Available Consultation Slots:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(doc.available_slots || ['09:30 AM', '10:30 AM', '11:30 AM', '04:30 PM', '06:00 PM']).map(slot => (
                        <span key={slot} className="px-3 py-1.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs font-mono font-bold text-teal-900">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: View Profile & Book Appointment */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-teal-200 hover:bg-white text-teal-800 font-bold text-xs transition text-center"
                    >
                      View Full Doctor Profile
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setBookingModalOpen(true);
                      }}
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment with {docName}</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            /* MULTI-DOCTOR CLINIC: Intelligent search and directory */
            <div className="space-y-5">
              {/* Intelligent Search Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search symptom (e.g. Cold, Fever, Cough, Headache), doctor name, or speciality..."
                    value={searchDoctorQuery}
                    onChange={(e) => setSearchDoctorQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  {searchDoctorQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchDoctorQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50/60 border border-teal-100 rounded-xl text-[11px] text-teal-900">
                  <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    <strong>Non-Diagnostic Clinic Search:</strong> Symptoms map to available outpatient doctors. No automatic medical diagnosis is provided.
                  </span>
                </div>
              </div>

              {/* Consultation Mode Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500">Mode:</span>
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
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Multi-Doctor Cards Grid */}
              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map(doc => {
                    const docName = doc.name || doc.full_name || 'Doctor';
                    const docSpecialty = doc.specialization || doc.specialty || doc.department || 'Specialist';
                    const docQuals = doc.qualifications || doc.qualification || 'MBBS, MD';
                    const fee = doc.consultation_fee || 500;

                    return (
                      <div
                        key={doc.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-lg shrink-0 overflow-hidden shadow-xs">
                              {doc.profile_photo_url || doc.photo_url ? (
                                <img src={doc.profile_photo_url || doc.photo_url} alt={docName} className="w-full h-full object-cover" />
                              ) : (
                                docName.replace(/^Dr\.?\s*/i, '').trim().charAt(0).toUpperCase() || 'D'
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <Link
                                    to={`/doctors/${doc.id}`}
                                    className="font-extrabold text-sm text-slate-900 hover:text-teal-600 transition block truncate"
                                  >
                                    {docName}
                                  </Link>
                                  <p className="text-xs font-semibold text-teal-700">{docSpecialty}</p>
                                  <p className="text-[10px] text-slate-500">{docQuals}</p>
                                </div>
                                <span className="text-xs font-bold text-amber-600 flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  {doc.rating || 4.8}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-bold">Consultation Fee:</span>
                              <span className="font-bold text-teal-700">₹{fee}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-bold">Consultation Modes:</span>
                              <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                                <Video className="w-3 h-3 text-teal-600" />
                                <span>In-Person & Video</span>
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-bold">Next Slot:</span>
                              <span className="text-emerald-600 font-bold text-[11px]">Today Open</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
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
                            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
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
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  No doctors found matching &ldquo;{searchDoctorQuery}&rdquo; at this clinic.
                </div>
              )}
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* 4. OFFERS AND PROMOTIONS (CLINIC-SPECIFIC OFFERS ONLY) */}
        {/* ================================================================= */}
        {clinicOffers.length > 0 && (
          <section className="bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-teal-900/60 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>CLINIC PROMOTIONS</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Special Packages at {clinic.name}
                </h2>
                <p className="text-xs text-slate-300">
                  Subsidized primary consultation packages and preventive checks.
                </p>
              </div>

              <Link
                to={`/offers?organization_id=${clinic.id}`}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                <span>View All Offers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clinicOffers.map(off => (
                <div
                  key={off.id}
                  className="bg-white/5 border border-white/10 hover:border-teal-400/50 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition backdrop-blur-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
                        {off.discount_percentage}% OFF
                      </span>
                      <span className="text-[10px] text-teal-200 font-bold uppercase">{clinic.name}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-white">{off.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{off.description}</p>
                    <p className="text-[11px] text-amber-300 font-semibold pt-1">
                      Valid until: {off.end_date || '2027-12-31'}
                    </p>
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
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-md transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Featured Advertisement Pop-up Modal for Clinic */}
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
            <div className="p-6 bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white relative space-y-3">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500 text-white uppercase tracking-wider">
                FEATURED PROMOTION • {activePromoOffer.discount_percentage}% OFF
              </span>
              <h3 className="text-xl font-black text-white">{activePromoOffer.title}</h3>
              <p className="text-xs text-teal-200">{clinic.name}</p>
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
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition"
                >
                  Book Package Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctor={selectedDoctor}
        initialClinic={clinic}
        initialComplaint={searchDoctorQuery || initialQuery}
      />
    </div>
  );
};

export default ClinicDetailPage;
