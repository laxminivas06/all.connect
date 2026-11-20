import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  Sparkles,
  X,
  Stethoscope,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

const SYMPTOM_DEPT_SYNONYMS = {
  fever: ['general medicine', 'pediatrics', 'internal medicine', 'infectious disease'],
  cough: ['general medicine', 'pulmonology', 'respiratory medicine', 'ent'],
  cold: ['general medicine', 'ent', 'pulmonology'],
  headache: ['general medicine', 'neurology'],
  heart: ['cardiology', 'cardiac sciences', 'cardiothoracic'],
  cardiac: ['cardiology', 'cardiac sciences'],
  chest: ['cardiology', 'pulmonology'],
  bone: ['orthopedics', 'joint replacement', 'spine care'],
  joint: ['orthopedics', 'rheumatology'],
  knee: ['orthopedics'],
  back: ['orthopedics', 'neurology'],
  skin: ['dermatology', 'cosmetology'],
  eye: ['ophthalmology'],
  dental: ['dentistry'],
  teeth: ['dentistry'],
  child: ['pediatrics', 'neonatology'],
  women: ['gynecology', 'obstetrics'],
  pregnancy: ['gynecology', 'obstetrics'],
  stomach: ['gastroenterology', 'general surgery'],
  diabetes: ['endocrinology', 'general medicine']
};

export const HospitalsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const areas = ['All', 'Malkajgiri', 'Secunderabad', 'Uppal', 'Tarnaka', 'Nacharam', 'Begumpet'];
  const departments = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Pulmonology', 'Oncology'];

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHospitals();
      // Ensure only valid hospitals are stored and displayed
      const onlyHospitals = (data || []).filter(h => h && !h.id?.startsWith('clinic-') && (h.organization_type === 'hospital' || !h.organization_type));
      setHospitals(onlyHospitals);
    } catch (err) {
      console.error('Failed to load hospitals list:', err);
      setError(err.message || 'Unable to load Hyderabad Hospital network. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    const qParam = searchParams.get('search') || searchParams.get('q');
    if (qParam !== null && qParam !== undefined) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  const matchesHospitalSearch = (h, query) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    const nameMatch = String(h?.name || '').toLowerCase().includes(q);
    const areaMatch = String(h?.area || '').toLowerCase().includes(q);
    const deptMatch = Array.isArray(h?.departments) && h.departments.some(d => String(d || '').toLowerCase().includes(q));

    let synonymMatch = false;
    for (const [symptom, depts] of Object.entries(SYMPTOM_DEPT_SYNONYMS)) {
      if (q.includes(symptom)) {
        if (Array.isArray(h?.departments) && h.departments.some(d => depts.some(target => String(d || '').toLowerCase().includes(target)))) {
          synonymMatch = true;
          break;
        }
      }
    }
    return nameMatch || areaMatch || deptMatch || synonymMatch;
  };

  const filteredHospitals = hospitals.filter(h => {
    if (!h) return false;
    const areaMatch = selectedArea === 'All' || String(h?.area || '').toLowerCase() === selectedArea.toLowerCase();
    const deptMatch = selectedDept === 'All' || (Array.isArray(h?.departments) && h.departments.includes(selectedDept));
    const emergencyMatch = !emergencyOnly || Boolean(h?.emergency_24x7);
    const searchMatch = matchesHospitalSearch(h, searchQuery);
    return areaMatch && deptMatch && emergencyMatch && searchMatch;
  });

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const handleResetFilters = () => {
    setSelectedArea('All');
    setSelectedDept('All');
    setEmergencyOnly(false);
    setSearchQuery('');
    setSearchParams({});
  };

  const handleBookHospitalOpd = (h) => {
    setSelectedHospital(h);
    setSelectedDoctor(null);
    setBookingModalOpen(true);
  };

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

        {/* Active Search / Symptom Filter Banner */}
        {searchQuery && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Care search for <strong>&ldquo;{searchQuery}&rdquo;</strong> — Showing only hospitals with relevant departments and specialists.
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className="self-start sm:self-auto px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded-lg text-blue-700 font-bold text-[11px] flex items-center gap-1 transition"
            >
              <X className="w-3 h-3" />
              Clear Search
            </button>
          </div>
        )}

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

        {/* Error State with Retry */}
        {error && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-rose-900">Unable to Load Hospital Data</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchHospitals}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading Hospitals</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredHospitals.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-900 text-lg">No hospitals found matching your criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find any verified hospitals in {selectedArea !== 'All' ? selectedArea : 'Hyderabad'} matching &ldquo;{searchQuery || selectedDept}&rdquo;.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Reset Filters & Show All
            </button>
          </div>
        )}

        {/* Hospitals Cards Grid */}
        {!loading && !error && filteredHospitals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map(h => (
              <div key={h.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition flex flex-col justify-between overflow-hidden">
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                        {h.area || 'Hyderabad'}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1.5 leading-snug">{h.name}</h3>
                      <p className="text-xs text-slate-500 italic mt-0.5">{h.tagline || 'Excellence in Tertiary & Multi-Speciality Care'}</p>
                    </div>

                    <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{h.rating || 4.8}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{h.address || `${h.area}, Hyderabad`}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{h.contact_phone || h.emergency_phone || '+91 40 2345 6789'}</span>
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
                      onClick={() => handleBookHospitalOpd(h)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      Book OPD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedHospital(null);
          setSelectedDoctor(null);
        }}
        initialDoctor={selectedDoctor}
        initialHospital={selectedHospital}
      />
    </div>
  );
};
export default HospitalsListPage;
