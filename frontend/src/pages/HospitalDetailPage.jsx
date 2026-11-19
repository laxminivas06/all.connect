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
  ChevronLeft
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const HospitalDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const { hospital, doctors, offers } = data;

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
            <div className="flex items-center space-x-2">
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
              <span>{hospital.rating}</span>
              <span className="text-[10px] text-slate-400 font-normal">({hospital.reviews_count} reviews)</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Bed Capacity</span>
              <span className="text-lg font-black text-slate-900">{hospital.bed_capacity} Inpatient Beds</span>
            </div>

            <button
              onClick={() => {
                setSelectedDoctor(doctors[0] || null);
                setBookingModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              Book OPD Appointment
            </button>
          </div>
        </div>

        {/* Independent Promotional & Advertisement Section */}
        {offers && offers.length > 0 && (
          <div className="bg-gradient-to-r from-rose-50/70 to-orange-50/70 p-6 rounded-3xl border border-rose-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-rose-600" />
                  <span>Hospital Published Campaigns & Health Packages</span>
                </h3>
                <p className="text-xs text-slate-500">Live published packages managed directly by {hospital.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {offers.map(off => (
                <div key={off.id} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {off.discount_percentage}% OFF
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{off.category}</span>
                    </div>
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

        {/* Doctors and Specialists List */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <span>Consultant Specialists & OPD Schedules</span>
              </h3>
              <p className="text-xs text-slate-500">Verified doctors practicing at this hospital campus</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{doctors.length} Doctors Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-blue-300 transition">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        <Link to={`/doctors/${doc.id}`} className="hover:text-blue-600 hover:underline">
                          {doc.name}
                        </Link>
                      </h4>
                      <p className="text-xs font-semibold text-blue-700">{doc.specialization} • {doc.department}</p>
                      <p className="text-[10px] text-slate-400">{doc.qualifications}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">₹{doc.consultation_fee}</span>
                      <span className="text-[10px] text-slate-400">OPD Fee</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{doc.bio}</p>

                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Available Slots:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.available_slots.slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{doc.experience_years} Years Exp.</span>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setBookingModalOpen(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    Select Slot & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Grid */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Clinical Specialties & Services</h3>
          <div className="flex flex-wrap gap-2">
            {(hospital.departments || []).map(d => (
              <span key={d} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
                {d}
              </span>
            ))}
          </div>
        </div>

      </div>

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctor={selectedDoctor}
      />
    </div>
  );
};
