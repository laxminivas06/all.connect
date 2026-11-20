import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const ClinicDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Doctor search & speciality filter
  const [searchDoctorQuery, setSearchDoctorQuery] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('All');

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    api.getClinic(id)
      .then(res => setData(res))
      .catch(err => setError(err.message || 'Clinic not found'))
      .finally(() => setLoading(false));
  }, [id]);

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
  const isSingleDoctor = doctors.length === 1 || clinic.is_single_doctor;

  // Available specialities in this clinic
  const clinicSpecialities = Array.from(new Set([
    ...(clinic.departments || []),
    ...doctors.map(d => d.specialization).filter(Boolean),
    ...doctors.map(d => d.department).filter(Boolean)
  ]));

  const filterCategories = ['All', ...clinicSpecialities];

  // Filter clinic doctors (ONLY doctors belonging to this clinic)
  const filteredDoctors = doctors.filter(doc => {
    const q = searchDoctorQuery.toLowerCase().trim();
    const matchesSpec =
      selectedSpeciality === 'All' ||
      (doc.specialization || '').toLowerCase().includes(selectedSpeciality.toLowerCase()) ||
      (doc.department || '').toLowerCase().includes(selectedSpeciality.toLowerCase());

    const matchesQ =
      !q ||
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.specialization || '').toLowerCase().includes(q) ||
      (doc.qualifications || '').toLowerCase().includes(q) ||
      (doc.medical_keywords || []).some(k => (k || '').toLowerCase().includes(q)) ||
      (doc.conditions_treated || []).some(c => (c || '').toLowerCase().includes(q));

    return matchesSpec && matchesQ;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link to="/clinics" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-teal-600 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Clinics Directory</span>
        </Link>

        {/* Clinic Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wide">
                {clinic.area}, Hyderabad
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified Community Polyclinic
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{clinic.name}</h1>
            <p className="text-xs sm:text-sm text-slate-500 italic">{clinic.tagline || 'Neighborhood Outpatient Centre'}</p>
            
            <div className="pt-1 text-xs text-slate-600 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{clinic.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{clinic.contact_phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{clinic.operating_hours || '09:00 AM - 09:00 PM'}</span>
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 space-y-2 w-full sm:w-auto shrink-0">
            <div className="flex items-center space-x-1 text-amber-600 font-extrabold text-sm justify-start sm:justify-end">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{clinic.rating || 4.8} ({clinic.reviews_count || 45} reviews)</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Attending Doctors</span>
              <span className="text-sm font-black text-slate-800">
                {isSingleDoctor ? 'Solo Physician Clinic' : `${doctors.length} Physicians On Duty`}
              </span>
            </div>
          </div>
        </div>

        {/* Clinic Services & Specialities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Clinic Specialities & Services:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {clinicSpecialities.map(spec => (
              <span key={spec} className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-xl">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Clinic Offers if any */}
        {offers && offers.length > 0 && (
          <div className="p-6 rounded-3xl bg-teal-50/70 border border-teal-200 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600" />
              <span>Clinic Health Packages & Checkups</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offers.map(off => (
                <div key={off.id} className="bg-white p-4 rounded-2xl border border-teal-100 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{off.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{off.description}</p>
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-400 line-through mr-1">₹{off.original_price}</span>
                      <span className="font-bold text-sm text-slate-900">₹{off.discounted_price}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctors[0] || null);
                      setBookingModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. INDIVIDUAL CLINIC BOOKING WORKFLOW */}
        <section id="clinic-booking-workflow-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span>CLINIC-SPECIFIC APPOINTMENT BOOKING</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isSingleDoctor ? 'Consult Attending Physician' : 'Consult Clinic Specialists'}
            </h2>
            <p className="text-xs text-slate-500">
              Direct OPD slot booking for doctors practicing at {clinic.name}.
            </p>
          </div>

          {/* SINGLE DOCTOR CLINIC WORKFLOW: Display doctor directly without unnecessary steps */}
          {isSingleDoctor && doctors.length > 0 ? (
            (() => {
              const doc = doctors[0];
              return (
                <div className="bg-teal-50/50 border border-teal-200 rounded-3xl p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 font-extrabold text-xl flex items-center justify-center shrink-0 overflow-hidden border border-teal-200">
                        {doc.profile_photo_url ? (
                          <img src={doc.profile_photo_url} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-teal-600" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-lg text-slate-900">{doc.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            OPD Active
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-teal-700">{doc.specialization}</p>
                        <p className="text-[11px] text-slate-500">{doc.qualifications || 'MBBS, MD'} • {doc.experience_years || 8} yrs experience</p>
                      </div>
                    </div>

                    <div className="sm:text-right bg-white p-3 rounded-2xl border border-teal-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                      <span className="text-lg font-black text-slate-900">₹{doc.consultation_fee || 450}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{doc.bio}</p>

                  {/* Available Slots */}
                  <div className="space-y-2 pt-2 border-t border-teal-100">
                    <span className="text-xs font-bold text-slate-700 block">Available Slots Today:</span>
                    <div className="flex flex-wrap gap-2">
                      {(doc.available_slots || ['09:30 AM', '10:30 AM', '11:30 AM', '04:30 PM', '06:00 PM']).map(slot => (
                        <span key={slot} className="px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-xs font-mono font-semibold text-slate-700 shadow-xs">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setBookingModalOpen(true);
                      }}
                      className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2 tracking-wide"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment with {doc.name}</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            /* MULTIPLE DOCTOR CLINIC WORKFLOW: with speciality filters and search */
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search doctor name or speciality..."
                    value={searchDoctorQuery}
                    onChange={(e) => setSearchDoctorQuery(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedSpeciality}
                  onChange={(e) => setSelectedSpeciality(e.target.value)}
                  className="text-xs px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-700 cursor-pointer"
                >
                  {filterCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Specialities' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map(doc => (
                    <div
                      key={doc.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900">{doc.name}</h4>
                            <p className="text-xs font-semibold text-teal-700">{doc.specialization}</p>
                            <p className="text-[10px] text-slate-500">{doc.qualifications || 'MBBS, MD'}</p>
                          </div>
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {doc.rating || 4.8}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee</span>
                            <span className="font-black text-slate-900">₹{doc.consultation_fee || 450}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Slot</span>
                            <span className="text-xs font-bold text-teal-700">
                              {doc.available_slots ? doc.available_slots[0] : '10:00 AM Today'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {doc.experience_years || 5} Years Experience
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctor(doc);
                            setBookingModalOpen(true);
                          }}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
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
                  No doctors found matching &ldquo;{searchDoctorQuery}&rdquo; at this clinic.
                </div>
              )}
            </div>
          )}
        </section>

      </div>

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctor={selectedDoctor}
        initialHospital={clinic}
      />
    </div>
  );
};
export default ClinicDetailPage;