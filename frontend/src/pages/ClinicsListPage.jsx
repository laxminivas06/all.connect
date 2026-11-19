import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Stethoscope,
  MapPin,
  Star,
  Search,
  Clock,
  ArrowRight,
  Phone
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const ClinicsListPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const areas = ['All', 'Malkajgiri', 'Secunderabad', 'Uppal', 'Tarnaka', 'Nacharam', 'Begumpet'];

  useEffect(() => {
    api.getClinics().then(data => {
      setClinics(data);
    }).finally(() => setLoading(false));
  }, []);

  const filteredClinics = clinics.filter(c => {
    const areaMatch = selectedArea === 'All' || (c.area || '').toLowerCase() === selectedArea.toLowerCase();
    const searchMatch = !searchQuery || (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.departments || []).some(d => (d || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return areaMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-600">
              <Stethoscope className="w-4 h-4" />
              <span>PRIMARY & NEIGHBORHOOD CARE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Independent Clinics & Polyclinics</h1>
            <p className="text-xs text-slate-500">Accessible local outpatient clinics with minimal waiting times and trusted doctors</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredClinics.length} Clinics available
          </span>
        </div>

        {/* Search & Area Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search clinic name, department, or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full sm:w-auto text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {areas.map(a => (
                <option key={a} value={a}>{a === 'All' ? 'All Hyderabad Localities' : a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clinics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredClinics.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {c.area}
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{c.rating}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{c.name}</h3>
                <p className="text-xs text-slate-500 italic line-clamp-1">{c.tagline}</p>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{c.operating_hours}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {(c.departments || []).map(d => (
                    <span key={d} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/clinics/${c.id}`}
                  className="text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
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
