import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Building2,
  MapPin,
  Star,
  CheckCircle,
  Search,
  Filter,
  Phone,
  Clock,
  Sparkles
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const HospitalsListPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const areas = ['All', 'Malkajgiri', 'Secunderabad', 'Uppal', 'Tarnaka', 'Nacharam', 'Begumpet'];
  const departments = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Pulmonology', 'Oncology'];

  useEffect(() => {
    api.getHospitals().then(data => {
      setHospitals(data);
    }).finally(() => setLoading(false));
  }, []);

  const filteredHospitals = hospitals.filter(h => {
    const areaMatch = selectedArea === 'All' || (h.area || '').toLowerCase() === selectedArea.toLowerCase();
    const deptMatch = selectedDept === 'All' || (h.departments || []).includes(selectedDept);
    const emergencyMatch = !emergencyOnly || h.emergency_24x7;
    const searchMatch = !searchQuery || (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.departments || []).some(d => (d || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return areaMatch && deptMatch && emergencyMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600">
              <Building2 className="w-4 h-4" />
              <span>HYDERABAD HEALTHCARE FEDERATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Multi-Speciality Hospitals</h1>
            <p className="text-xs text-slate-500">Discover participating tertiary and multi-speciality hospital campuses</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{filteredHospitals.length}</strong> hospitals
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search hospital name, department, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Area */}
            <div>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a === 'All' ? 'All Hyderabad Areas' : a}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Pill */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Only show 24x7 Emergency Care Facilities</span>
            </label>

            <span className="text-[11px] text-slate-400">Coordinates & live bed capacities synchronized</span>
          </div>
        </div>

        {/* Hospitals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition flex flex-col justify-between overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                      {h.area}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-1.5 leading-snug">{h.name}</h3>
                    <p className="text-xs text-slate-500 italic mt-0.5">{h.tagline}</p>
                  </div>

                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{h.rating}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{h.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{h.contact_phone}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{h.emergency_24x7 ? '24x7 Emergency Active' : 'OPD Only'}</span>
                  </p>
                </div>

                {/* Promotional package preview if any */}
                {h.offers && h.offers.length > 0 && (
                  <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-200/60 text-xs">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide block">Active Package:</span>
                    <p className="font-semibold text-slate-800 text-[11px] truncate">{h.offers[0].title}</p>
                    <p className="text-rose-600 font-bold text-xs">Special ₹{h.offers[0].discounted_price} <span className="line-through text-slate-400 font-normal text-[10px]">₹{h.offers[0].original_price}</span></p>
                  </div>
                )}

                {/* Departments */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(h.departments || []).slice(0, 4).map(d => (
                    <span key={d} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] text-slate-600 font-medium">
                      {d}
                    </span>
                  ))}
                  {((h.departments || []).length > 4) && (
                    <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                      +{h.departments.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 block text-[10px]">Active Specialists</span>
                  <span className="font-bold text-slate-800">{h.doctors_count || 3} Doctors</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/hospitals/${h.id}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => setBookingModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    Book OPD
                  </button>
                </div>
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
