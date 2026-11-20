import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const HospitalDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Doctor search & speciality filter state
  const [searchCareQuery, setSearchCareQuery] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('All');

  // Booking modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    api.getHospital(id)
      .then(res => setData(res))
      .catch(err => setError(err.message || 'Hospital profile not found'))
      .finally(() => setLoading(false));
  }, [id]);

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

  // Compute available speciality categories in this hospital
  const hospitalSpecialities = Array.from(new Set([
    ...(hospital.departments || []),
    ...doctors.map(d => d.specialization).filter(Boolean),
    ...doctors.map(d => d.department).filter(Boolean)
  ]));

  // Standard category order
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

  // Merge unique categories available in this hospital
  const availableCategories = [
    'All',
    ...Array.from(new Set([
      ...standardCategories.filter(sc => hospitalSpecialities.some(hs => hs.toLowerCase().includes(sc.toLowerCase()))),
      ...hospitalSpecialities
    ]))
  ];

  // Filter hospital doctors by search and speciality (ONLY doctors belonging to this hospital)
  const filteredDoctors = doctors.filter(doc => {
    const q = searchCareQuery.toLowerCase().trim();
    const matchesSpeciality =
      selectedSpeciality === 'All' ||
      (doc.specialization || '').toLowerCase().includes(selectedSpeciality.toLowerCase()) ||
      (doc.department || '').toLowerCase().includes(selectedSpeciality.toLowerCase());

    const matchesQuery =
      !q ||
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.specialization || '').toLowerCase().includes(q) ||
      (doc.department || '').toLowerCase().includes(q) ||
      (doc.qualifications || '').toLowerCase().includes(q) ||
      (doc.medical_keywords || []).some(k => (k || '').toLowerCase().includes(q)) ||
      (doc.conditions_treated || []).some(c => (c || '').toLowerCase().includes(q));

    return matchesSpeciality && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link to="/hospitals" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Hospitals Directory</span>
        </Link>

        {/* Hospital Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                {hospital.area}, Hyderabad
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified & Published
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{hospital.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 italic">{hospital.tagline}</p>

            <div className="pt-1 space-y-1 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{hospital.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span>OPD: {hospital.contact_phone} • Emergency: <strong className="text-rose-600">{hospital.emergency_phone}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{hospital.operating_hours}</span>
              </p>
            </div>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2 shrink-0">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{hospital.rating || 4.8}</span>
              <span className="text-[10px] text-slate-400 font-normal">({hospital.reviews_count || 120} reviews)</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bed Capacity</span>
              <span className="text-base font-black text-slate-900">{hospital.bed_capacity || 250} Inpatient Beds</span>
            </div>
          </div>
        </div>

        {/* Hospital Packages if any */}
        {offers && offers.length > 0 && (
          <div className="bg-gradient-to-r from-rose-50/70 to-orange-50/70 p-6 rounded-3xl border border-rose-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-600" />
              <span>Hospital Health Packages & Promotions</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {offers.map(off => (
                <div key={off.id} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {off.discount_percentage}% OFF
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 mt-2">{off.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{off.description}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 line-through text-[10px] mr-1">₹{off.original_price}</span>
                      <span className="text-base font-black text-slate-900">₹{off.discounted_price}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctors[0] || null);
                        setBookingModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-sm transition"
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. INDIVIDUAL HOSPITAL BOOKING WORKFLOW */}
        <section id="hospital-doctor-booking-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Section Header */}
          <div className="border-b border-slate-100 pb-5 space-y-1">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span>HOSPITAL-SPECIFIC APPOINTMENT BOOKING</span>
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Find the right doctor for your healthcare needs.
            </h2>
            <p className="text-xs text-slate-500">
              Consult certified medical specialists practicing exclusively at {hospital.name}.
            </p>
          </div>

          {/* Search Box: care needed, doctor name, speciality, department */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search what care you need, doctor name, speciality, or department..."
              value={searchCareQuery}
              onChange={(e) => setSearchCareQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchCareQuery && (
              <button
                onClick={() => setSearchCareQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Speciality Categories: horizontally scrollable chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Filter by Speciality:</span>
              <span className="text-slate-400">{filteredDoctors.length} doctors found</span>
            </div>
            <div
              className="flex overflow-x-auto gap-2 pb-2 pt-1 no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {availableCategories.map((spec) => {
                const isSelected = selectedSpeciality === spec;
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpeciality(spec)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {spec === 'All' ? 'All Specialists' : spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doctor Cards: Belonging to this hospital ONLY */}
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredDoctors.map(doc => (
                <div
                  key={doc.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      {/* Doctor photo / avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-lg shrink-0 overflow-hidden">
                        {doc.profile_photo_url ? (
                          <img src={doc.profile_photo_url} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-blue-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-base text-slate-900 truncate">
                              {doc.name}
                            </h4>
                            <p className="text-xs font-semibold text-blue-700">{doc.specialization}</p>
                            <p className="text-[11px] text-slate-500">{doc.qualifications || 'MBBS, MD'}</p>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {doc.rating || 4.8}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{doc.bio}</p>

                    {/* Conditions treated tags */}
                    {doc.conditions_treated && doc.conditions_treated.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {doc.conditions_treated.slice(0, 3).map((c, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Availability and Fee details */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                        <span className="text-sm font-black text-slate-900">₹{doc.consultation_fee || 600}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Available Slot</span>
                        <span className="text-xs font-bold text-emerald-600">
                          {doc.available_slots ? doc.available_slots[0] : '10:00 AM Today'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button: Book Appointment */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{doc.experience_years || 5} Years Experience</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setBookingModalOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              No doctors found matching &ldquo;{searchCareQuery || selectedSpeciality}&rdquo; at {hospital.name}.
            </div>
          )}
        </section>

      </div>

      {/* Hospital Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctor={selectedDoctor}
        initialHospital={hospital}
      />
    </div>
  );
};
export default HospitalDetailPage;