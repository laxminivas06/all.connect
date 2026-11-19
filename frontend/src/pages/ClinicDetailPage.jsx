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
  ChevronLeft
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const ClinicDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    api.getClinic(id)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xs text-slate-500 font-semibold animate-pulse">Loading clinic profile...</p>
      </div>
    );
  }

  const { clinic, doctors, offers } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <Link to="/clinics" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-teal-600 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Clinics Directory</span>
        </Link>

        {/* Clinic Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wide">
              {clinic.area}, Hyderabad
            </span>
            <h1 className="text-2xl font-black text-slate-900">{clinic.name}</h1>
            <p className="text-xs text-slate-500 italic">{clinic.tagline}</p>
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
                <span>{clinic.operating_hours}</span>
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 space-y-2 w-full sm:w-auto">
            <div className="flex items-center space-x-1 text-amber-600 font-extrabold text-sm justify-end">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{clinic.rating} ({clinic.reviews_count} reviews)</span>
            </div>
            <button
              onClick={() => {
                setSelectedDoctor(doctors[0] || null);
                setBookingModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              Book Consultation
            </button>
          </div>
        </div>

        {/* Clinic Offers */}
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
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctors */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Attending Physicians</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctors.map(d => (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    <Link to={`/doctors/${d.id}`} className="hover:text-teal-600 hover:underline">
                      {d.name}
                    </Link>
                  </h4>
                  <p className="text-xs text-teal-700 font-semibold">{d.specialization}</p>
                  <p className="text-[10px] text-slate-500">{d.qualifications}</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">₹{d.consultation_fee} Fee</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDoctor(d);
                    setBookingModalOpen(true);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  Book Slot
                </button>
              </div>
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
