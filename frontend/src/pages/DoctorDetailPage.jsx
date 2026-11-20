import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Stethoscope,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Star,
  ShieldCheck,
  Award,
  DollarSign,
  Phone,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const DoctorDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getDoctor(id)
      .then(res => {
        setData(res);
        if (res.slot_calendar && res.slot_calendar.length > 0) {
          setSelectedDate(res.slot_calendar[0]);
        }
      })
      .catch(err => setError(err.message || 'Failed to load doctor profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xs text-slate-500 font-semibold animate-pulse">Loading verified doctor profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 text-center max-w-sm space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-800">Doctor Not Found</h3>
          <p className="text-xs text-slate-500">{error || 'This doctor profile is unavailable or inactive.'}</p>
          <Link to="/book-opd" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Explore Healthcare Providers
          </Link>
        </div>
      </div>
    );
  }

  const { doctor, organization, services, slot_calendar } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb / Back Link */}
        <Link
          to="/book-opd"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Book OPD & Healthcare Discovery</span>
        </Link>

        {/* Doctor Header Dossier */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-blue-500/20 shrink-0">
              {doctor.photo_url ? (
                <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                doctor.name ? doctor.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'DR'
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{doctor.name}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Practitioner
                </span>
              </div>

              <p className="text-sm font-bold text-blue-600">{doctor.specialization}</p>
              <p className="text-xs text-slate-500">{doctor.qualification} &bull; {doctor.department}</p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <strong>{doctor.experience_years} Years</strong> Experience
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <strong>{doctor.rating || 4.8}</strong> ({doctor.reviews_count || 120} Reviews)
                </span>
                {doctor.registration_number && (
                  <span className="text-slate-400">Reg: {doctor.registration_number}</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Fast Book Button */}
          <div className="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-4 min-w-[200px]">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Consultation Fee</span>
              <span className="text-3xl font-black text-slate-900">₹{doctor.consultation_fee || 500}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Per Outpatient Visit</span>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Slot</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Doctor Profile & Schedule (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* About the Doctor */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>About {doctor.name}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {doctor.bio || `${doctor.name} is a verified senior specialist in ${doctor.specialization || 'Clinical Medicine'} with over ${doctor.experience_years || 5} years of specialized experience in clinical diagnostics, outpatient care, and patient management.`}
              </p>

              {/* Consultation Modes & Working Hours Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Consultation Modes</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                      In-Person OPD
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200">
                      Online Video OPD
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Working Days & Hours</span>
                  <p className="font-extrabold text-slate-900 text-xs">
                    {(doctor.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-500">{doctor.consultation_hours || '10:00 AM - 05:00 PM'}</p>
                </div>
              </div>
            </div>

            {/* Associated Hospital or Clinic */}
            {organization && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Associated Practice Location</span>
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{organization.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {organization.address || `${organization.area}, Hyderabad`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {organization.operating_hours || 'Mon - Sat: 08:30 AM - 08:00 PM'}
                    </p>
                  </div>

                  <Link
                    to={organization.id.startsWith('hosp') ? `/hospitals/${organization.id}` : `/clinics/${organization.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition shrink-0"
                  >
                    View Facility Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Bookable Real-Time Slots Calendar */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Available Consultation Slots</span>
              </h3>

              {slot_calendar && slot_calendar.length > 0 ? (
                <div className="space-y-4">
                  {/* Day Picker Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {slot_calendar.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                          selectedDate?.date === day.date
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {day.display}
                      </button>
                    ))}
                  </div>

                  {/* Slots Grid for Selected Day */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-500">
                        Available slots for {selectedDate.display}:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {selectedDate.slots.map((s, idx) => (
                          <button
                            key={idx}
                            disabled={!s.available}
                            onClick={() => {
                              setSelectedSlot(s.time);
                              setBookingModalOpen(true);
                            }}
                            className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                              s.available
                                ? 'bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200 cursor-pointer'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                            {s.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                  Doctor is currently offline or on routine leave. Please contact {organization?.name || 'facility'} for emergency triage.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Clinical Services & Policies (1 col) */}
          <div className="space-y-6">
            {/* Clinical Services */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Clinical Services Offered</span>
              </h3>

              {services && services.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {services.map((srv) => (
                    <div key={srv.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{srv.name}</p>
                        <p className="text-[11px] text-slate-400">{srv.duration_minutes || 20} mins duration</p>
                      </div>
                      <span className="font-extrabold text-slate-900">₹{srv.consultation_fee || srv.price || 500}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">General OPD & Specialized Clinical Consultations</p>
              )}
            </div>

            {/* Transparency & Disclaimer Box */}
            <div className="p-4 rounded-3xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Verified Consultation Policy
              </div>
              <p className="text-[11px] text-blue-800/80 leading-relaxed">
                Appointment booking is instantly confirmed in the hospital or clinic queue. Fees are payable during the visit or through digital patient checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctor={doctor}
        initialDate={selectedDate?.date}
        initialTime={selectedSlot}
      />
    </div>
  );
};
export default DoctorDetailPage;
