import React, { useState, useEffect } from 'react';
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
  Shield
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
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Discovery State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [pinCodeInput, setPinCodeInput] = useState('');
  const [userCoords, setUserCoords] = useState(null); // { lat, lng, label }
  const [detectingLocation, setDetectingLocation] = useState(false);

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

  // Offers Carousel index
  const [offerSlideIndex, setOfferSlideIndex] = useState(0);

  const popularSymptoms = [
    { label: 'Fever', query: 'fever' },
    { label: 'Cough & Cold', query: 'cough' },
    { label: 'Headache', query: 'headache' },
    { label: 'Skin Problems', query: 'skin problems' },
    { label: 'Dental Care', query: 'dental problems' },
    { label: 'Eye Checkup', query: 'eye problems' },
    { label: 'Cardiologist', query: 'cardiologist' },
    { label: 'Dermatologist', query: 'dermatologist' },
    { label: 'General Physician', query: 'general physician' }
  ];

  // Geolocation trigger
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
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
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        // Default to central Hyderabad coordinates
        setUserCoords({
          lat: 17.4399,
          lng: 78.4983,
          label: 'Hyderabad Centre'
        });
        setDetectingLocation(false);
      },
      { timeout: 5000 }
    );
  };

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
      // Scroll to discovery result
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
      api.getPublishedOffers(),
      api.getDoctors()
    ]).then(([hList, cList, oList, dList]) => {
      setHospitals(hList || []);
      setClinics(cList || []);
      setOffers(oList || []);
      setSpecialists((dList || []).filter(d => d.is_active));
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

  const filteredHospitals = hospitals.filter(h => {
    const areaMatch = selectedArea === 'All' || (h.area || '').toLowerCase() === selectedArea.toLowerCase();
    const pinMatch = !pinCodeInput || (h.pincode || '').includes(pinCodeInput.trim());
    const queryMatch = !searchQuery || (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.departments || []).some(d => (d || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (h.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return areaMatch && pinMatch && queryMatch;
  });

  const filteredClinics = clinics.filter(c => {
    const areaMatch = selectedArea === 'All' || (c.area || '').toLowerCase() === selectedArea.toLowerCase();
    const pinMatch = !pinCodeInput || (c.pincode || '').includes(pinCodeInput.trim());
    const queryMatch = !searchQuery || (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.departments || []).some(d => (d || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return areaMatch && pinMatch && queryMatch;
  });

  // Carousel controls
  const nextOfferSlide = () => {
    if (offers.length === 0) return;
    setOfferSlideIndex((prev) => (prev + 1) % offers.length);
  };
  const prevOfferSlide = () => {
    if (offers.length === 0) return;
    setOfferSlideIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero & Main Search Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Hyderabad Centralized Healthcare Mesh & EHR Federation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Find the Right Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">Near You</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Search multi-speciality hospitals, neighborhood clinics, top specialists, symptoms, or surgical procedures across Hyderabad. Book instant verified OPD slots with transparent fees.
          </p>

          {/* Main Intelligent Search Bar */}
          <div className="max-w-4xl mx-auto bg-white p-2 sm:p-3 rounded-2xl shadow-2xl border border-slate-200/80 text-slate-800 flex flex-col md:flex-row items-center gap-2">
            
            {/* Search Input */}
            <div className="flex-1 flex items-center px-3 w-full border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search your health concern, hospital, doctor or speciality..."
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
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dynamic Location & PIN Code Selector */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto px-2">
              <div className="relative">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="text-xs px-3 py-2 bg-slate-100 rounded-xl font-medium text-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                >
                  {dynamicAreas.map(a => (
                    <option key={a} value={a}>{a === 'All' ? 'All Areas' : a}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                maxLength={6}
                placeholder="PIN Code"
                value={pinCodeInput}
                onChange={(e) => setPinCodeInput(e.target.value)}
                className="w-20 text-xs px-2.5 py-2 bg-slate-100 rounded-xl font-mono text-slate-700 placeholder-slate-400 border-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                title="Detect current location for distance calculation"
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                  userCoords
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <Navigation className={`w-3.5 h-3.5 ${detectingLocation ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">{userCoords ? 'Near Me' : 'Location'}</span>
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

          {/* Symptom to Specialty Quick Chips */}
          <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px] mr-1">Common Health Concerns:</span>
            {popularSymptoms.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSymptomClick(sym.query)}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-[11px] font-medium backdrop-blur-xs transition"
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Symptom & Specialty Discovery Results */}
        {discoveryResult && (
          <section id="discovery-results-section" className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 border border-indigo-500/30 shadow-2xl text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/50 pb-5">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Symptom-to-Speciality Discovery Results</span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">
                  Healthcare Matches for &ldquo;{discoveryResult.query}&rdquo;
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">Relevant Clinical Specialities:</span>
                  {(discoveryResult.matched_specializations || []).map((spec, idx) => (
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
                Clear Discovery Search
              </button>
            </div>

            {/* Non-Diagnostic Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Non-Diagnostic Provider Matching:</strong> {discoveryResult.disclaimer || 'Search correlations suggest relevant clinical specialties and verified facilities. Does not replace emergency care or clinical medical evaluation.'}
              </span>
            </div>

            {/* 1. RELEVANT HOSPITALS & CLINICS FIRST */}
            {((discoveryResult.hospitals && discoveryResult.hospitals.length > 0) || (discoveryResult.clinics && discoveryResult.clinics.length > 0)) && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Verified Hospitals & Clinics for this Concern</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...(discoveryResult.hospitals || []), ...(discoveryResult.clinics || [])].map((facility) => {
                    const isHospital = facility.id.startsWith('hosp');
                    const distStr = getFacilityDistance(facility);
                    return (
                      <div
                        key={facility.id}
                        className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isHospital ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              }`}>
                                {isHospital ? 'Hospital' : 'Clinic'}
                              </span>
                              <h4 className="font-bold text-base text-white mt-1 group-hover:text-blue-300 transition">
                                {facility.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span>{facility.area || facility.city}</span>
                                {distStr && <span className="text-teal-400 font-bold ml-1">• {distStr}</span>}
                              </p>
                            </div>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 text-xs font-semibold border border-amber-400/20">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {facility.rating || 4.8}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {(facility.departments || []).slice(0, 3).map((dept) => (
                              <span key={dept} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                          <Link
                            to={isHospital ? `/hospitals/${facility.id}` : `/clinics/${facility.id}`}
                            className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
                          >
                            Open Profile
                          </Link>
                          <Link
                            to={`/book-opd?hospital_id=${facility.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Book OPD
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. MATCHING SPECIALIST DOCTORS NEXT */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>Affiliated Specialist Doctors ({(discoveryResult.doctors || []).length})</span>
              </h3>

              {(discoveryResult.doctors || []).length > 0 ? (
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
                            <p className="text-[11px] text-slate-400">{doc.qualifications || doc.qualification} &bull; {doc.experience_years} yrs exp</p>
                          </div>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 text-xs font-semibold border border-amber-400/20">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {doc.rating || 4.8}
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

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-medium">Fee</span>
                          <span className="text-base font-black text-white">₹{doc.consultation_fee || 500}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctor(doc);
                            setBookingModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Book Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  No individual doctors on duty right now. Book directly with participating hospitals or clinics above.
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. PROMOTIONAL CAROUSEL: "Exciting Healthcare Offers" */}
        {offers.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-rose-600 text-xs font-bold uppercase tracking-wide">
                  <Tag className="w-4 h-4" />
                  VERIFIED PROMOTIONAL CAMPAIGNS
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  Exciting Healthcare Offers
                </h2>
                <p className="text-xs text-slate-500">Curated, accredited health packages and preventive checkups from top facilities</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevOfferSlide}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs"
                  aria-label="Previous Offer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextOfferSlide}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs"
                  aria-label="Next Offer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <Link
                  to="/offers"
                  className="ml-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All ({offers.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Carousel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {offers.slice(offerSlideIndex, offerSlideIndex + 3).concat(
                offers.slice(0, Math.max(0, (offerSlideIndex + 3) - offers.length))
              ).slice(0, 3).map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        {offer.discount_percentage || 25}% OFF
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 capitalize">{offer.category || 'Package'}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-2.5 line-clamp-1">{offer.title}</h3>
                    <p className="text-[11px] font-medium text-blue-700">{offer.organization_name}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{offer.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-1.5">₹{offer.original_price}</span>
                      <span className="text-lg font-black text-slate-900">₹{offer.discounted_price}</span>
                    </div>

                    <button
                      onClick={() => setBookingModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition"
                    >
                      Book Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. MULTI-SPECIALITY HOSPITALS SECTION */}
        <section id="hospitals-clinics" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Multi-Speciality Hospitals in Hyderabad</span>
              </h2>
              <p className="text-xs text-slate-500">Each hospital operates an independent management console with centralized patient discovery</p>
            </div>
            <Link to="/hospitals" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Explore All Hospitals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((h) => {
              const distStr = getFacilityDistance(h);
              return (
                <div
                  key={h.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                            {h.area || 'Hyderabad'}
                          </span>
                          {distStr && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                              {distStr}
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 mt-1.5 group-hover:text-blue-600 transition">
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
                        <span>{h.emergency_24x7 ? '24x7 Emergency Care Active' : 'OPD Consultations'}</span>
                      </p>
                    </div>

                    {/* Departments */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(h.departments || []).slice(0, 4).map((d) => (
                        <span key={d} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] text-slate-600 font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/hospitals/${h.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                    >
                      Open Profile
                    </Link>
                    <Link
                      to={`/hospitals/${h.id}#doctors`}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition hidden sm:inline-block"
                    >
                      View Doctors
                    </Link>
                    <Link
                      to={`/book-opd?hospital_id=${h.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition"
                    >
                      Book OPD
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. CONSULT WITH OUR SPECIALISTS SECTION */}
        <section id="specialists-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-teal-600 text-xs font-bold uppercase tracking-wide">
                <Users className="w-4 h-4" />
                ACCREDITED CLINICAL DIRECTORY
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Consult with Our Specialists
              </h2>
              <p className="text-xs text-slate-500">Board-certified specialists across top hospitals & clinics in Hyderabad</p>
            </div>
            <Link to="/book-opd" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Explore All Specialists <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {specialists.slice(0, 8).map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                      <p className="text-xs font-semibold text-teal-600">{doc.specialization}</p>
                      <p className="text-[11px] text-slate-400">{doc.qualifications || 'MBBS, MD'} • {doc.experience_years || 5} yrs exp</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {doc.rating || 4.9}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    {doc.organization_name || 'Hospital / Clinic'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Fee</span>
                    <span className="text-sm font-black text-slate-900">₹{doc.consultation_fee || 600}</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setBookingModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. ABOUT ALLCONNECT & TRUST SECTION */}
        <section id="about-trust-section" className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              TRUST & ACCREDITATION STANDARDS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              About AllConnect Healthcare Ecosystem
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              AllConnect is Hyderabad&apos;s centralized healthcare mesh uniting multi-speciality hospitals, independent clinics, specialists, diagnostic labs, and pharmacies on a single federated SaaS platform.
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
