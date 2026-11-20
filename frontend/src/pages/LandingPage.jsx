import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Activity,
  Building2,
  Stethoscope,
  Pill,
  Search,
  MapPin,
  Star,
  CheckCircle,
  Tag,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Clock,
  HeartPulse,
  Sparkles,
  AlertCircle,
  Calendar,
  X,
  UserCheck,
  Phone,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Check,
  Users,
  Info,
  Shield,
  Loader2
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';
import { ProcedureEnquiryModal } from '../components/ProcedureEnquiryModal';
import { ErrorBoundary } from '../components/ErrorBoundary';

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
  const [userCoords, setUserCoords] = useState(null); // { lat, lng, label }
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospitalForBooking, setSelectedHospitalForBooking] = useState(null);

  // Symptom-to-Specialty Discovery State
  const [discoveryResult, setDiscoveryResult] = useState(null);
  const [searchingDiscovery, setSearchingDiscovery] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [selectedOrgForProcedure, setSelectedOrgForProcedure] = useState(null);

  // Large Advertisement Banner Slider state
  const [offerSlideIndex, setOfferSlideIndex] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  // Hospital Carousel ref
  const hospitalCarouselRef = useRef(null);

  const popularSymptoms = [
    { label: 'Fever & Infection', query: 'fever' },
    { label: 'Cough & Cold', query: 'cough' },
    { label: 'Headache & Migraine', query: 'headache' },
    { label: 'Skin & Acne', query: 'skin' },
    { label: 'Joint & Bone Pain', query: 'bone' },
    { label: 'Heart & Chest Pain', query: 'heart' },
    { label: 'Eye Checkup', query: 'eye' },
    { label: 'Stomach & Acidity', query: 'stomach' },
    { label: 'Pediatrics / Child', query: 'child' }
  ];

  // Automatic Geolocation detection on mount
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Current Location'
        });
        setDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setLocationError('Location permission denied. Please select your area manually.');
        // Fallback default coordinates (Central Hyderabad)
        setUserCoords({
          lat: 17.4399,
          lng: 78.4983,
          label: 'Hyderabad Central'
        });
        setDetectingLocation(false);
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    // Automatically attempt geolocation detection on load
    handleDetectLocation();
  }, []);

  const handleDiscoverySearch = async (searchTerm) => {
    const term = (searchTerm !== undefined ? searchTerm : searchQuery).trim();
    if (!term || term.length < 2) {
      setDiscoveryResult(null);
      return;
    }
    setSearchingDiscovery(true);
    try {
      const res = await api.discoverySearchDoctors(term);
      setDiscoveryResult(res);
      setTimeout(() => {
        const el = document.getElementById('discovery-results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Discovery search failed:', err);
    } finally {
      setSearchingDiscovery(false);
    }
  };

  const handleSymptomClick = (query) => {
    setSearchQuery(query);
    handleDiscoverySearch(query);
  };

  const clearDiscoverySearch = () => {
    setSearchQuery('');
    setDiscoveryResult(null);
  };

  useEffect(() => {
    Promise.all([
      api.getHospitals(),
      api.getClinics(),
      api.getPublishedOffers()
    ]).then(([hList, cList, oList]) => {
      setHospitals(hList || []);
      setClinics(cList || []);
      setOffers(oList || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Compute dynamic areas from facilities
  const dynamicAreas = ['All', ...Array.from(new Set([
    ...hospitals.map(h => h.area).filter(Boolean),
    ...clinics.map(c => c.area).filter(Boolean)
  ]))];

  // Helper to compute distance string for a facility
  const getFacilityDistance = (facility) => {
    if (!userCoords || !facility.coordinates) return null;
    const dist = calculateDistance(
      userCoords.lat,
      userCoords.lng,
      facility.coordinates.lat || facility.latitude,
      facility.coordinates.lng || facility.longitude
    );
    return dist !== null ? `${dist} km away` : null;
  };

  // Filtered & Distance-sorted Facilities
  const filteredHospitals = hospitals.filter(h => {
    const areaMatch = selectedArea === 'All' || (h.area || '').toLowerCase() === selectedArea.toLowerCase();
    const queryMatch = !searchQuery || (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.departments || []).some(d => (d || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return areaMatch && queryMatch;
  });

  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (!userCoords) return 0;
    const distA = calculateDistance(userCoords.lat, userCoords.lng, a.coordinates?.lat || a.latitude, a.coordinates?.lng || a.longitude) ?? 9999;
    const distB = calculateDistance(userCoords.lat, userCoords.lng, b.coordinates?.lat || b.latitude, b.coordinates?.lng || b.longitude) ?? 9999;
    return distA - distB;
  });

  const filteredClinics = clinics.filter(c => {
    const areaMatch = selectedArea === 'All' || (c.area || '').toLowerCase() === selectedArea.toLowerCase();
    const queryMatch = !searchQuery || (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.departments || []).some(d => (d || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return areaMatch && queryMatch;
  });

  const sortedClinics = [...filteredClinics].sort((a, b) => {
    if (!userCoords) return 0;
    const distA = calculateDistance(userCoords.lat, userCoords.lng, a.coordinates?.lat || a.latitude, a.coordinates?.lng || a.longitude) ?? 9999;
    const distB = calculateDistance(userCoords.lat, userCoords.lng, b.coordinates?.lat || b.latitude, b.coordinates?.lng || b.longitude) ?? 9999;
    return distA - distB;
  });

  // Automatic Banner Slider timer (5s interval) with pause on hover
  useEffect(() => {
    if (offers.length <= 1 || isBannerHovered) return;
    const interval = setInterval(() => {
      setOfferSlideIndex(prev => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [offers.length, isBannerHovered]);

  const nextOfferSlide = () => {
    if (offers.length === 0) return;
    setOfferSlideIndex((prev) => (prev + 1) % offers.length);
  };
  const prevOfferSlide = () => {
    if (offers.length === 0) return;
    setOfferSlideIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  // Hospital Carousel Scroll Handlers
  const scrollHospitalCarousel = (direction) => {
    if (hospitalCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      hospitalCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. FIRST INTERFACE – LOCATION & SEARCH */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Hyderabad Centralized Healthcare Mesh & EHR Federation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Find the Right Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">Near You</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Search multi-speciality hospitals, neighborhood clinics, symptoms, or surgical procedures across Hyderabad. Book instant verified OPD slots with transparent locked fees.
          </p>

          {/* Location Status & Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs">
            {detectingLocation ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Detecting nearby location...</span>
              </div>
            ) : userCoords ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Showing healthcare facilities near {userCoords.label}</span>
              </div>
            ) : locationError ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{locationError}</span>
              </div>
            ) : null}
          </div>

          {/* Main Intelligent Search Bar */}
          <div className="max-w-4xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-200/80 text-slate-800 flex flex-col md:flex-row items-center gap-2.5">
            
            {/* Search Input */}
            <div className="flex-1 flex items-center px-3 w-full border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search health concern, hospital, doctor, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDiscoverySearch();
                  }
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearDiscoverySearch}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Area Dropdown & Location Retry Button */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto px-2">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-100 rounded-xl font-medium text-slate-700 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  title="Select locality"
                >
                  {dynamicAreas.map(a => (
                    <option key={a} value={a}>{a === 'All' ? 'All Areas (Hyderabad)' : a}</option>
                  ))}
                </select>
              </div>

              {/* Automatic Location Re-trigger Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                title="Detect current location for accurate distances"
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  detectingLocation
                    ? 'bg-blue-50 border-blue-300 text-blue-700 opacity-80'
                    : userCoords
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <Navigation className={`w-3.5 h-3.5 ${detectingLocation ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">{detectingLocation ? 'Detecting...' : userCoords ? 'Nearby' : 'Locate'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDiscoverySearch()}
                disabled={searchingDiscovery}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0 disabled:opacity-50"
              >
                {searchingDiscovery ? 'Searching...' : 'Search'}
              </button>

              <Link
                to="/book-opd"
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition shrink-0 hidden sm:flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book OPD</span>
              </Link>
            </div>
          </div>

          {/* Common Health Concerns Chips */}
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px] mr-1">Common Health Concerns:</span>
            {popularSymptoms.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSymptomClick(sym.query)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-[11px] font-medium backdrop-blur-xs transition shadow-xs"
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Symptom & Discovery Results (Intelligent Medical Search Engine) */}
        {discoveryResult && (
          <section id="discovery-results-section" className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 border border-indigo-500/30 shadow-2xl text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/50 pb-5">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Intelligent Medical Discovery Results</span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  Healthcare Matches for &ldquo;{discoveryResult.query}&rdquo;
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">Matched Departments & Specialities:</span>
                  {(discoveryResult.matched_departments || discoveryResult.matched_specializations || []).map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={clearDiscoverySearch}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
              >
                <X className="w-4 h-4 text-slate-400" />
                Clear Results
              </button>
            </div>

            {/* Non-Diagnostic Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {discoveryResult.disclaimer || 'Healthcare discovery suggestions, not a medical diagnosis. Actual clinical diagnosis, surgical candidacy, and treatment suitability must be determined by a qualified medical professional.'}
              </span>
            </div>

            {/* Matched Available Doctors (With fee revealed ONLY in Book Slot step) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Recommended Doctors for this Health Concern ({discoveryResult.doctors?.length || 0})</span>
              </h3>

              {discoveryResult.doctors && discoveryResult.doctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discoveryResult.doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                              {doc.name}
                            </h4>
                            <p className="text-xs font-medium text-teal-400">{doc.specialization}</p>
                            <p className="text-[11px] text-slate-400">{doc.qualifications || doc.qualification} &bull; {doc.experience_years || 5} yrs exp</p>
                          </div>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 text-xs font-semibold border border-amber-400/20">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {doc.rating || 4.9}
                          </span>
                        </div>

                        {doc.organization_details && (
                          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-300 truncate">
                                {doc.organization_details.name}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                                {doc.organization_details.type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{doc.organization_details.area || 'Hyderabad'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Doctor card action: NO upfront fee, clean BOOK SLOT CTA */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>OPD Available Today</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctor(doc);
                            setBookingModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Slot</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  No individual doctors on duty for this query. You can book directly with participating hospitals or clinics below.
                </div>
              )}
            </div>
          </section>
        )}

        {/* 2. LARGE PREMIUM SLIDING ADVERTISEMENT BANNER */}
        {offers.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-rose-600 text-xs font-bold uppercase tracking-wide">
                <Tag className="w-4 h-4" />
                FEATURED HEALTHCARE CAMPAIGNS & ACCREDITED PACKAGES
              </div>
              <Link
                to="/offers"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All Offers ({offers.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Single Large Interactive Banner */}
            <div
              className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white border border-slate-800 transition-all"
              onMouseEnter={() => setIsBannerHovered(true)}
              onMouseLeave={() => setIsBannerHovered(false)}
            >
              {(() => {
                const currentOffer = offers[offerSlideIndex] || offers[0];
                return (
                  <div className="p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 min-h-[300px]">
                    {/* Left Details */}
                    <div className="max-w-2xl space-y-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white uppercase tracking-wider shadow-sm">
                          {currentOffer.discount_percentage || 25}% OFF SPECIAL
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-teal-300 border border-white/20 capitalize">
                          {currentOffer.category || 'Preventive Healthcare'}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold">
                          {currentOffer.organization_name}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                        {currentOffer.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                        {currentOffer.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-white">
                            ₹{currentOffer.discounted_price}
                          </span>
                          <span className="text-sm sm:text-base text-slate-400 line-through">
                            ₹{currentOffer.original_price}
                          </span>
                        </div>

                        <button
                          onClick={() => setBookingModalOpen(true)}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-teal-500/25 transition flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book This Package</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Visual Highlights Card */}
                    <div className="w-full md:w-auto p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 shrink-0">
                      <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Federated Hospital Package</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Full Clinical Evaluation Included</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Federated EHR Digital Records Sync</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Guaranteed Priority OPD Slot</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Valid across Hyderabad</span>
                        <span className="text-emerald-400 font-bold">Instant Confirmation</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Navigation Arrows */}
              <button
                onClick={prevOfferSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition shadow-md"
                aria-label="Previous Offer Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextOfferSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition shadow-md"
                aria-label="Next Offer Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots Pagination */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {offers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setOfferSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      offerSlideIndex === idx ? 'w-6 bg-teal-400' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. MULTI-SPECIALITY HOSPITALS – HORIZONTAL SLIDING CAROUSEL */}
        <section id="hospitals-carousel-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wide">
                <Building2 className="w-4 h-4" />
                ACCREDITED MULTI-SPECIALITY HOSPITALS
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Top Hospitals in Hyderabad
              </h2>
              <p className="text-xs text-slate-500">Swipe or navigate through certified hospitals with 24x7 emergency and federated OPD</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => scrollHospitalCarousel('left')}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs"
                aria-label="Slide Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollHospitalCarousel('right')}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs"
                aria-label="Slide Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link
                to="/hospitals"
                className="ml-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All ({hospitals.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Horizontal Scrolling Track with Touch Swiping */}
          <div
            ref={hospitalCarouselRef}
            className="flex overflow-x-auto gap-5 snap-x snap-mandatory scroll-smooth pb-4 pt-1 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedHospitals.map((h) => {
              const distStr = getFacilityDistance(h);
              return (
                <div
                  key={h.id}
                  className="min-w-[300px] sm:min-w-[340px] md:min-w-[380px] snap-start bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group shrink-0"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                            {h.area || 'Hyderabad'}
                          </span>
                          {distStr && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                              {distStr}
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 mt-2 group-hover:text-blue-600 transition">
                          {h.name}
                        </h3>
                        <p className="text-xs text-slate-500 italic mt-0.5">{h.tagline || 'Leading Multi-Speciality Facility'}</p>
                      </div>

                      <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{h.rating || 4.8}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{h.address || h.area}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{h.emergency_24x7 ? '24x7 Emergency Care Active' : 'OPD Consultations Active'}</span>
                      </p>
                    </div>

                    {/* Departments */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(h.departments || []).slice(0, 3).map((d) => (
                        <span key={d} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] text-slate-600 font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Direct Book Appointment button */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/hospitals/${h.id}`}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                    >
                      Facility Profile
                    </Link>
                    <Link
                      to={`/book-opd?hospital_id=${h.id}`}
                      className="flex-1 text-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
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

        {/* 4. NEIGHBORHOOD CLINICS SECTION WITH DIRECT "BOOK OPD" CTA */}
        <section id="clinics-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-teal-600 text-xs font-bold uppercase tracking-wide">
                <Stethoscope className="w-4 h-4" />
                PRIMARY & NEIGHBORHOOD CLINICS
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Local Polyclinics with Minimal Waiting Time
              </h2>
              <p className="text-xs text-slate-500">Accessible outpatient clinics in your neighborhood with direct appointment booking</p>
            </div>

            <Link
              to="/clinics"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Explore All Clinics ({clinics.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {sortedClinics.slice(0, 4).map((c) => {
              const distStr = getFacilityDistance(c);
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          {c.area}
                        </span>
                        {distStr && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {distStr}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{c.rating || 4.8}</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-teal-600 transition">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 italic line-clamp-1">{c.tagline || 'Neighborhood Polyclinic'}</p>

                    <div className="space-y-1 text-xs text-slate-600 pt-1">
                      <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.address || c.area}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{c.operating_hours || '09:00 AM - 09:00 PM'}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(c.departments || []).slice(0, 3).map(d => (
                        <span key={d} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Single Primary Action: BOOK OPD */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      to={`/book-opd?clinic_id=${c.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5 tracking-wide"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>BOOK OPD</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. ABOUT ALLCONNECT & TRUST SECTION */}
        <section id="about-trust-section" className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              TRUST & ACCREDITATION STANDARDS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              About AllConnect Healthcare Ecosystem
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              AllConnect is Hyderabad&apos;s centralized healthcare mesh uniting multi-speciality hospitals, independent clinics, diagnostic labs, and pharmacies on a single federated SaaS platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Verified Provider Credentials</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every participating hospital, clinic, and doctor is verified by platform administrators using clinical registration permits before publishing.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <QrCode className="w-6 h-6 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Universal Patient Health ID</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One digital health ID (HC-2026-XXXX) stores your medical history, prescriptions, and lab reports with patient consent controls.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <Activity className="w-6 h-6 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Zero Fake Ratings & Locked Fees</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consultation fees and health packages are transparently disclosed upfront with verified reviews from real completed appointments.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Appointment Booking Modal */}
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