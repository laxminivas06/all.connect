import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Activity,
  Building2,
  Stethoscope,
  Search,
  MapPin,
  Star,
  CheckCircle,
  Tag,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Clock,
  Sparkles,
  AlertCircle,
  Calendar,
  X,
  Navigation,
  Shield,
  Loader2,
  Users,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';
import { ProcedureEnquiryModal } from '../components/ProcedureEnquiryModal';

// Haversine formula to compute distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export const LandingPage = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Discovery State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [userCoords, setUserCoords] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Discovery results state
  const [discoveryResult, setDiscoveryResult] = useState(null);
  const [searchingDiscovery, setSearchingDiscovery] = useState(false);
  // Post-search facility selection: null | 'hospital' | 'clinic'
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);

  // Compact Advertisement notification state
  const [adTopVisible, setAdTopVisible] = useState(() => {
    return sessionStorage.getItem('dismissed_promo_completely') !== 'true' &&
      sessionStorage.getItem('closed_top_ad') !== 'true';
  });
  const [adBelowSearchVisible, setAdBelowSearchVisible] = useState(() => {
    return sessionStorage.getItem('dismissed_promo_completely') !== 'true' &&
      sessionStorage.getItem('closed_top_ad') === 'true';
  });

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [selectedOrgForProcedure, setSelectedOrgForProcedure] = useState(null);

  const searchResultsRef = useRef(null);

  const popularConcerns = [
    { label: 'Fever', query: 'fever' },
    { label: 'Cough', query: 'cough' },
    { label: 'Cold', query: 'cold' },
    { label: 'Headache', query: 'headache' },
    { label: 'Skin problems', query: 'skin problems' },
    { label: 'Dental problems', query: 'dental problems' },
    { label: 'Eye problems', query: 'eye problems' },
    { label: 'General consultation', query: 'general consultation' },
    { label: 'Cardiology', query: 'cardiology' },
    { label: 'Orthopaedics', query: 'orthopedics' }
  ];

  // Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Current Location'
        });
        setDetectingLocation(false);
      },
      () => {
        setUserCoords({
          lat: 17.4399,
          lng: 78.4983,
          label: 'Hyderabad'
        });
        setDetectingLocation(false);
      },
      { timeout: 6000 }
    );
  };

  useEffect(() => {
    handleDetectLocation();
    Promise.all([
      api.getHospitals(),
      api.getClinics(),
      api.getPublishedOffers()
    ]).then(([hList, cList, oList]) => {
      setHospitals(hList || []);
      setClinics(cList || []);
      setOffers(oList || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCloseTopAd = () => {
    setAdTopVisible(false);
    setAdBelowSearchVisible(true);
    sessionStorage.setItem('closed_top_ad', 'true');
  };

  const handleDismissAdCompletely = () => {
    setAdTopVisible(false);
    setAdBelowSearchVisible(false);
    sessionStorage.setItem('dismissed_promo_completely', 'true');
  };

  // Execute Main Search
  const handleExecuteSearch = async (term) => {
    const q = (term !== undefined ? term : searchQuery).trim();
    if (!q || q.length < 2) {
      setDiscoveryResult(null);
      setSelectedSearchOption(null);
      return;
    }

    setSearchingDiscovery(true);
    try {
      const res = await api.discoverySearchDoctors(q);
      setDiscoveryResult(res);
      // Requirement: Do not immediately display hospitals and clinics together.
      // Reset selected option so customer is presented with the 2 clear choices.
      setSelectedSearchOption(null);

      setTimeout(() => {
        if (searchResultsRef.current) {
          searchResultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Discovery search error:', err);
    } finally {
      setSearchingDiscovery(false);
    }
  };

  const handleSelectConcern = (query) => {
    setSearchQuery(query);
    handleExecuteSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDiscoveryResult(null);
    setSelectedSearchOption(null);
  };

  // Facility distance helper
  const getFacilityDistance = (fac) => {
    if (!userCoords || !fac.coordinates) return null;
    const dist = calculateDistance(
      userCoords.lat,
      userCoords.lng,
      fac.coordinates.lat || fac.latitude,
      fac.coordinates.lng || fac.longitude
    );
    return dist !== null ? `${dist} km away` : null;
  };

  // Primary active offer
  const activePromo = offers && offers.length > 0 ? offers[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* 7. ADVERTISEMENT PANEL – COMPACT NOTIFICATION STYLE (ABOVE SEARCH BAR) */}
      {activePromo && adTopVisible && (
        <aside aria-label="Special healthcare promotion" className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-b border-indigo-800/60 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  {activePromo.discount_percentage || 25}% OFF
                </span>
                <p className="truncate text-slate-200">
                  <strong className="text-white font-bold mr-1">{activePromo.title}</strong>
                  <span className="hidden sm:inline text-slate-300">• {activePromo.organization_name}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/offers"
                  className="px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[11px] shadow-xs transition"
                >
                  View Offer
                </Link>
                <button
                  onClick={handleCloseTopAd}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
                  title="Close advertisement"
                  aria-label="Close promotion banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. MAIN SEARCH – FIRST STEP OF HEALTHCARE DISCOVERY */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Hyderabad Centralized Healthcare Mesh & EHR Federation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Find the Right Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">Near You</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explain what healthcare you need. We'll connect you directly with verified hospitals, clinics, and specialists across Hyderabad.
          </p>

          {/* PRIMARY SEARCH BAR */}
          <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-slate-200 text-slate-800 flex items-center gap-2">
            <div className="flex-1 flex items-center px-3 min-w-0">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="Search what healthcare you need..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleExecuteSearch();
                  }
                }}
                className="w-full py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleExecuteSearch()}
              disabled={searchingDiscovery}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition shrink-0 disabled:opacity-50"
            >
              {searchingDiscovery ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick Health Concerns Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px] mr-1">Common Needs:</span>
            {popularConcerns.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectConcern(c.query)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-[11px] font-medium backdrop-blur-xs transition shadow-xs"
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Location status */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Serving Hyderabad • Automatic Location Distance Active</span>
          </div>
        </div>
      </section>

      {/* COMPACT ADVERTISEMENT CARD (BELOW SEARCH BAR IF TOP WAS CLOSED) */}
      {activePromo && adBelowSearchVisible && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                <Tag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-extrabold text-[10px]">
                    {activePromo.discount_percentage || 25}% OFF
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {activePromo.title}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {activePromo.description} • {activePromo.organization_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/offers"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                View Offer
              </Link>
              <button
                onClick={handleDismissAdCompletely}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                title="Dismiss completely"
                aria-label="Dismiss promotion"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. POST-SEARCH SECTION: TWO SEPARATE OPTIONS */}
      {discoveryResult && (
        <section ref={searchResultsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">
          
          {/* Search Result Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Healthcare Discovery Result
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Care options for &ldquo;{discoveryResult.query}&rdquo;
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-xs text-slate-500">Relevant Specialities:</span>
                  {(discoveryResult.matched_departments || discoveryResult.matched_specializations || []).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleClearSearch}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Clear Search
              </button>
            </div>

            {/* Non-diagnostic disclaimer */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {discoveryResult.disclaimer || 'Healthcare discovery suggestions, not a medical diagnosis. Clinical evaluation must be performed by a qualified medical professional.'}
              </span>
            </div>

            {/* TWO CLEAR OPTIONS AFTER SEARCH */}
            <div className="pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">
                Where would you prefer to receive care? Select an option:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* OPTION 1: FIND A HOSPITAL */}
                <button
                  type="button"
                  onClick={() => setSelectedSearchOption('hospital')}
                  className={`p-6 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                    selectedSearchOption === 'hospital'
                      ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs hover:border-blue-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedSearchOption === 'hospital' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-slate-900">Option 1: Find a Hospital</span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                        {discoveryResult.hospitals?.length || 0} Available
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Multi-speciality hospital campuses with 24x7 emergency care, inpatient beds, and surgical departments.
                    </p>
                    <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                      <span>View Relevant Hospitals</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* OPTION 2: FIND A CLINIC */}
                <button
                  type="button"
                  onClick={() => setSelectedSearchOption('clinic')}
                  className={`p-6 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                    selectedSearchOption === 'clinic'
                      ? 'bg-teal-50/80 border-teal-500 shadow-md ring-2 ring-teal-500'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs hover:border-teal-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedSearchOption === 'clinic' ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-700'
                  }`}>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-slate-900">Option 2: Find a Clinic</span>
                      <span className="text-xs font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                        {discoveryResult.clinics?.length || 0} Available
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Accessible neighborhood polyclinics with minimal waiting times and direct outpatient consultations.
                    </p>
                    <div className="pt-2 text-xs font-bold text-teal-600 flex items-center gap-1">
                      <span>View Relevant Clinics</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* IF CUSTOMER SELECTS HOSPITAL */}
          {selectedSearchOption === 'hospital' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Hospitals Offering Care for &ldquo;{discoveryResult.query}&rdquo;</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Displaying verified multi-speciality hospitals only. Click to open hospital profile and book.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {discoveryResult.hospitals?.length || 0} Hospitals Found
                </span>
              </div>

              {discoveryResult.hospitals && discoveryResult.hospitals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {discoveryResult.hospitals.map((h) => {
                    const distStr = getFacilityDistance(h);
                    return (
                      <div
                        key={h.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                                  {h.area || 'Hyderabad'}
                                </span>
                                {distStr && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                                    {distStr}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-base text-slate-900 mt-1.5">
                                {h.name}
                              </h4>
                              <p className="text-xs text-slate-500 italic mt-0.5">{h.tagline}</p>
                            </div>

                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {h.rating || 4.8}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-slate-600">
                            <p className="flex items-center gap-1.5 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{h.address || h.area}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{h.emergency_24x7 ? '24x7 Emergency Active' : 'OPD Scheduled'}</span>
                            </p>
                          </div>

                          {/* Relevant Departments */}
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                              Relevant Departments:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {(h.departments || []).slice(0, 3).map((dept) => (
                                <span key={dept} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700 font-medium">
                                  {dept}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Consultation fee & Sample slots */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                              <span className="font-black text-slate-900 text-sm">₹{h.consultation_fee || 600}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Available</span>
                              <span className="text-xs font-bold text-emerald-600">
                                {h.sample_slots ? h.sample_slots[0] : '10:00 AM Today'}
                              </span>
                            </div>
                          </div>

                          {/* Relevant Packages if available */}
                          {h.relevant_packages && h.relevant_packages.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
                              <span className="text-[10px] font-bold text-rose-700 uppercase block">Special Package Available:</span>
                              <p className="font-semibold text-slate-800 text-[11px] truncate">{h.relevant_packages[0].title}</p>
                              <span className="text-xs font-black text-rose-600">₹{h.relevant_packages[0].discounted_price}</span>
                            </div>
                          )}
                        </div>

                        {/* Hospital Profile & Booking Action */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <Link
                            to={`/hospitals/${h.id}`}
                            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Open Hospital Profile & Book</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
                  No hospitals specifically matched this search. Try selecting Option 2 (Find a Clinic) above.
                </div>
              )}
            </div>
          )}

          {/* IF CUSTOMER SELECTS CLINIC */}
          {selectedSearchOption === 'clinic' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-teal-600" />
                    <span>Clinics Offering Care for &ldquo;{discoveryResult.query}&rdquo;</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Displaying verified outpatient clinics only. Click to open clinic profile and book.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {discoveryResult.clinics?.length || 0} Clinics Found
                </span>
              </div>

              {discoveryResult.clinics && discoveryResult.clinics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {discoveryResult.clinics.map((c) => {
                    const distStr = getFacilityDistance(c);
                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                                  {c.area || 'Hyderabad'}
                                </span>
                                {distStr && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {distStr}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-base text-slate-900 mt-1.5">
                                {c.name}
                              </h4>
                              <p className="text-xs text-slate-500 italic mt-0.5">{c.tagline || 'Neighborhood Polyclinic'}</p>
                            </div>

                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {c.rating || 4.8}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-slate-600">
                            <p className="flex items-center gap-1.5 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{c.address || c.area}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="truncate">{c.operating_hours || '09:00 AM - 09:00 PM'}</span>
                            </p>
                          </div>

                          {/* Clinic Specialisations */}
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                              Specialisations & Services:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {(c.specialisations || c.departments || []).slice(0, 3).map((spec) => (
                                <span key={spec} className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-medium">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Consultation fee & Sample slots */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                              <span className="font-black text-slate-900 text-sm">₹{c.consultation_fee || 450}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Available</span>
                              <span className="text-xs font-bold text-teal-700">
                                {c.sample_slots ? c.sample_slots[0] : '10:00 AM Today'}
                              </span>
                            </div>
                          </div>

                          {/* Relevant Packages if available */}
                          {c.relevant_packages && c.relevant_packages.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs">
                              <span className="text-[10px] font-bold text-teal-800 uppercase block">Clinic Checkup Package:</span>
                              <p className="font-semibold text-slate-800 text-[11px] truncate">{c.relevant_packages[0].title}</p>
                              <span className="text-xs font-black text-teal-700">₹{c.relevant_packages[0].discounted_price}</span>
                            </div>
                          )}
                        </div>

                        {/* Clinic Profile & Booking Action */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <Link
                            to={`/clinics/${c.id}`}
                            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Open Clinic Profile & Book</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
                  No clinics specifically matched this search. Try selecting Option 1 (Find a Hospital) above.
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* BEFORE SEARCH: INITIAL HEALTHCARE DIRECTORY SHORTCUTS */}
      {!discoveryResult && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          
          {/* Two Fast Path Direct Cards: Hospital vs Clinic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/hospitals"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition">
                    Browse Hospitals
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {hospitals.length} Campuses
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Certified multi-speciality tertiary care hospitals across Hyderabad with 24x7 emergency and consultant specialists.
                </p>
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-1">
                  Explore Hospital Directory <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            <Link
              to="/clinics"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition">
                    Browse Neighborhood Clinics
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">
                    {clinics.length} Polyclinics
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Accessible local clinics and polyclinics with minimal waiting times and direct doctor appointments.
                </p>
                <span className="text-xs font-bold text-teal-600 flex items-center gap-1 pt-1">
                  Explore Clinic Directory <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* Featured Multi-Speciality Hospitals Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Accredited Hospital Network
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Top Multi-Speciality Hospitals
                </h3>
              </div>
              <Link to="/hospitals" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All Hospitals <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {hospitals.slice(0, 3).map((h) => {
                const distStr = getFacilityDistance(h);
                return (
                  <div
                    key={h.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                          {h.area || 'Hyderabad'}
                        </span>
                        {distStr && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            {distStr}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {h.rating || 4.8}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900">{h.name}</h4>
                      <p className="text-xs text-slate-500 italic line-clamp-1">{h.tagline}</p>

                      <div className="text-xs text-slate-600 space-y-1 pt-1">
                        <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{h.address}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{h.emergency_24x7 ? '24x7 Emergency Care Active' : 'OPD Consultations'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <Link
                        to={`/hospitals/${h.id}`}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Appointment</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Featured Neighborhood Clinics Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider">
                  Community Outpatient Care
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Featured Neighborhood Clinics
                </h3>
              </div>
              <Link to="/clinics" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View All Clinics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {clinics.slice(0, 3).map((c) => {
                const distStr = getFacilityDistance(c);
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                          {c.area || 'Hyderabad'}
                        </span>
                        {distStr && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {distStr}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {c.rating || 4.8}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500 italic line-clamp-1">{c.tagline || 'Community Polyclinic'}</p>

                      <div className="text-xs text-slate-600 space-y-1 pt-1">
                        <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{c.operating_hours || '09:00 AM - 09:00 PM'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <Link
                        to={`/clinics/${c.id}`}
                        className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Appointment</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trust & Verified Standards */}
          <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
            <div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                TRUST & ACCREDITATION STANDARDS
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                Why Patients Trust AllConnect in Hyderabad
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Verified Clinical Credentials</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every hospital, clinic, and doctor is verified by medical registration permits before publishing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <QrCode className="w-6 h-6 text-blue-400" />
                <h4 className="font-bold text-sm text-white">Universal Patient Health ID</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  One federated health ID stores prescriptions and records securely with full patient consent controls.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <Activity className="w-6 h-6 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Zero Fake Ratings & Transparent Fees</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Locked consultation fees with verified reviews strictly from real, completed OPD visits.
                </p>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctor={selectedDoctor}
        initialHospital={selectedHospitalForBooking}
      />

      {/* Procedure Enquiry Modal */}
      <ProcedureEnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        procedure={selectedProcedure}
        organization={selectedOrgForProcedure}
      />
    </div>
  );
};
export default LandingPage;