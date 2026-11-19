import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  Sparkles,
  Tag,
  Star,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
  X,
  Phone,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Activity
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';
import { ProcedureEnquiryModal } from '../components/ProcedureEnquiryModal';

export const BookOpdPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Search parameters from URL if any
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialFilter = queryParams.get('type') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedArea, setSelectedArea] = useState('All');
  const [activeFilterTab, setActiveFilterTab] = useState(initialFilter); // all, hospitals, clinics, doctors, procedures, packages
  
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  
  // All initial data
  const [allHospitals, setAllHospitals] = useState([]);
  const [allClinics, setAllClinics] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allPackages, setAllPackages] = useState([]);

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [selectedOrgForProcedure, setSelectedOrgForProcedure] = useState(null);

  // Booking confirmation card
  const [lastBooking, setLastBooking] = useState(null);

  const areas = ['All', 'Secunderabad', 'Malkajgiri', 'Uppal', 'Tarnaka', 'Nacharam', 'Begumpet', 'Banjara Hills', 'Somajiguda'];

  const quickChips = [
    { label: 'General Physician', query: 'general physician' },
    { label: 'Fever & Cold', query: 'fever' },
    { label: 'Cataract Surgery', query: 'cataract surgery' },
    { label: 'Knee Replacement', query: 'knee replacement' },
    { label: 'Cardiologist', query: 'cardiologist' },
    { label: 'Full Body Checkup', query: 'full body checkup' },
    { label: 'Skin & Dermatology', query: 'skin problems' },
    { label: 'Dental Care', query: 'dental problems' },
    { label: 'Orthopedic Consultation', query: 'orthopaedic consultation' },
  ];

  // Load initial catalog
  useEffect(() => {
    Promise.all([
      api.getHospitals(),
      api.getClinics(),
      api.getDoctors(),
      api.getPublishedOffers()
    ]).then(([hList, cList, dList, oList]) => {
      setAllHospitals(hList || []);
      setAllClinics(cList || []);
      setAllDoctors(dList || []);
      setAllPackages(oList || []);
    }).catch(err => console.error('Error fetching initial data:', err));
  }, []);

  // Run search
  const executeSearch = async (term) => {
    const q = (term !== undefined ? term : searchQuery).trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const res = await api.discoverySearchDoctors(q);
      setSearchResults(res);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleChipClick = (term) => {
    setSearchQuery(term);
    executeSearch(term);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Derive filtered datasets
  const displayedHospitals = (searchResults ? searchResults.hospitals : allHospitals).filter(h => {
    return selectedArea === 'All' || (h.area || '').toLowerCase() === selectedArea.toLowerCase();
  });

  const displayedClinics = (searchResults ? searchResults.clinics : allClinics).filter(c => {
    return selectedArea === 'All' || (c.area || '').toLowerCase() === selectedArea.toLowerCase();
  });

  const displayedDoctors = (searchResults ? searchResults.doctors : allDoctors).filter(d => {
    const orgArea = d.organization_details?.area || d.area || '';
    return selectedArea === 'All' || orgArea.toLowerCase() === selectedArea.toLowerCase();
  });

  const displayedPackages = searchResults ? (searchResults.packages || []) : allPackages;

  const totalResultsCount = 
    (activeFilterTab === 'all' ? (displayedHospitals.length + displayedClinics.length + displayedDoctors.length + displayedPackages.length + (searchResults?.is_procedure ? 1 : 0))
    : activeFilterTab === 'hospitals' ? displayedHospitals.length
    : activeFilterTab === 'clinics' ? displayedClinics.length
    : activeFilterTab === 'doctors' ? displayedDoctors.length
    : activeFilterTab === 'procedures' ? (searchResults?.is_procedure ? 1 : 0)
    : displayedPackages.length);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Step 1 Search Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl text-white space-y-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Step 1: Intelligent Healthcare Discovery & OPD Booking</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Find Care by What You Need
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Search by symptoms, procedures, clinical specialties, doctor names, or hospital facilities across Hyderabad. Real-time slot availability guaranteed.
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 flex items-center px-3 w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search hospitals, clinics, doctors, departments, symptoms or treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    executeSearch();
                  }
                }}
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto px-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 hidden sm:block" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full sm:w-auto text-xs px-3 py-2 bg-slate-100 rounded-xl font-medium text-slate-700 border-none focus:ring-2 focus:ring-blue-500"
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a === 'All' ? 'All Hyderabad Areas' : a}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => executeSearch()}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search OPD'}
              </button>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium text-[11px] mr-1">Popular:</span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip.query)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-[11px] font-medium backdrop-blur-sm transition"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Confirmation Alert (if recently booked) */}
        {lastBooking && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 text-sm">Appointment Confirmed!</h3>
                <p className="text-xs text-emerald-700">
                  Appointment ID: <strong className="font-mono">{lastBooking.appointment_id || lastBooking.id}</strong> with {lastBooking.doctor_name} at {lastBooking.hospital_name || lastBooking.organization_name}
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Scheduled for {lastBooking.appointment_date} at {lastBooking.appointment_time} &bull; Status: Confirmed
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/patient"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition shrink-0"
            >
              View in My Profile
            </Link>
          </div>
        )}

        {/* Step 2: Categorized Result Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: 'all', label: 'All Results' },
                { key: 'doctors', label: `Doctors (${displayedDoctors.length})` },
                { key: 'hospitals', label: `Hospitals (${displayedHospitals.length})` },
                { key: 'clinics', label: `Clinics (${displayedClinics.length})` },
                { key: 'procedures', label: 'Surgeries & Procedures' },
                { key: 'packages', label: `Checkup Packages (${displayedPackages.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilterTab(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeFilterTab === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {totalResultsCount} verified healthcare options
            </div>
          </div>

          {/* Non-Diagnostic Disclaimer Banner */}
          {searchResults && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Non-Diagnostic Health Discovery:</strong> {searchResults.disclaimer}
              </span>
            </div>
          )}

          {/* Procedure / Surgery Overview Box (if procedure query) */}
          {(activeFilterTab === 'all' || activeFilterTab === 'procedures') && searchResults?.procedure_info && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 border border-indigo-500/30 text-white shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Surgical Procedure Information</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">{searchResults.procedure_info.title}</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">{searchResults.procedure_info.description}</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedProcedure(searchResults.procedure_info);
                    setSelectedOrgForProcedure(allHospitals[0]);
                    setEnquiryModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg transition shrink-0 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Request Procedure Consultation</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Estimated Package Range</span>
                  <span className="text-lg font-black text-emerald-400">{searchResults.procedure_info.avg_cost}</span>
                  <span className="text-[10px] text-slate-500 block">Includes stay & OT charges</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Procedure Duration</span>
                  <span className="text-lg font-black text-white">{searchResults.procedure_info.duration}</span>
                  <span className="text-[10px] text-slate-500 block">Advanced modular OT suites</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Speciality Department</span>
                  <span className="text-lg font-black text-indigo-300">{searchResults.procedure_info.department}</span>
                  <span className="text-[10px] text-slate-500 block">Board-certified surgeons</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                <strong>Important Note:</strong> {searchResults.procedure_info.eligibility_disclaimer}
              </div>
            </div>
          )}

          {/* SECTION: AVAILABLE DOCTORS */}
          {(activeFilterTab === 'all' || activeFilterTab === 'doctors') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>Verified Medical Specialists & Available Slots ({displayedDoctors.length})</span>
                </h3>
              </div>

              {displayedDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedDoctors.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link to={`/doctors/${doc.id}`} className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition">
                              {doc.name}
                            </Link>
                            <p className="text-xs font-semibold text-blue-600">{doc.specialization}</p>
                            <p className="text-[11px] text-slate-400">{doc.qualification} &bull; {doc.experience_years} yrs exp</p>
                          </div>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {doc.rating || 4.8}
                          </span>
                        </div>

                        {/* Organization pill */}
                        {doc.organization_details && (
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <Link
                                to={doc.organization_details.type === 'hospital' ? `/hospitals/${doc.organization_details.id}` : `/clinics/${doc.organization_details.id}`}
                                className="font-semibold text-slate-800 hover:text-blue-600 truncate"
                              >
                                {doc.organization_details.name}
                              </Link>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                {doc.organization_details.type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{doc.organization_details.area || 'Hyderabad'}</span>
                            </div>
                          </div>
                        )}

                        {/* Available sample slots */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-teal-600" />
                            <span>Available Consultation Slots Today:</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {['10:00 AM', '11:15 AM', '04:30 PM'].map((sTime, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedDoctor(doc);
                                  setSelectedSlot(sTime);
                                  setBookingModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                              >
                                {sTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">OPD Fee</span>
                          <span className="text-lg font-black text-slate-900">₹{doc.consultation_fee || 500}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/doctors/${doc.id}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                          >
                            Profile
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDoctor(doc);
                              setBookingModalOpen(true);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                          >
                            Book Slot
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                  No direct doctors matching this filter in {selectedArea}.
                </div>
              )}
            </div>
          )}

          {/* SECTION: HOSPITALS */}
          {(activeFilterTab === 'all' || activeFilterTab === 'hospitals') && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Accredited Hospitals ({displayedHospitals.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedHospitals.map(hosp => (
                  <div
                    key={hosp.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                            {hosp.area}, Hyderabad
                          </span>
                          <h4 className="font-bold text-base text-slate-900 mt-1">{hosp.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{hosp.tagline || 'Super Speciality Hospital'}</p>
                        </div>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {hosp.rating || 4.8}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(hosp.departments || []).slice(0, 4).map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                            {d}
                          </span>
                        ))}
                        {(hosp.departments || []).length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-400">
                            +{(hosp.departments.length - 4)} more
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{hosp.contact_phone || 'General Helpdesk'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{hosp.operating_hours || 'OPD: 08:30 AM - 08:00 PM'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{hosp.bed_capacity || 400} Beds &bull; 24x7 ER</span>
                      <Link
                        to={`/hospitals/${hosp.id}`}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                      >
                        <span>View Hospital</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: CLINICS */}
          {(activeFilterTab === 'all' || activeFilterTab === 'clinics') && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Neighborhood Clinics & Family Practices ({displayedClinics.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedClinics.map(clinic => (
                  <div
                    key={clinic.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                            {clinic.area}, Hyderabad
                          </span>
                          <h4 className="font-bold text-base text-slate-900 mt-1">{clinic.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{clinic.tagline || 'Family & Primary Care Clinic'}</p>
                        </div>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {clinic.rating || 4.7}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(clinic.departments || []).map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-teal-50 text-teal-700">
                            {d}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{clinic.operating_hours || '08:00 AM - 09:30 PM'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Walk-in & Digital Appointments</span>
                      <Link
                        to={`/clinics/${clinic.id}`}
                        className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                      >
                        <span>View Clinic</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: HEALTH PACKAGES */}
          {(activeFilterTab === 'all' || activeFilterTab === 'packages') && displayedPackages.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-rose-500" />
                  <span>Published Health Checkup Packages ({displayedPackages.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {displayedPackages.map(pkg => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          {pkg.discount_percentage}% OFF
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">{pkg.category}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">{pkg.title}</h4>
                      <p className="text-[11px] font-medium text-blue-700">{pkg.organization_name}</p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{pkg.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-1.5">₹{pkg.original_price}</span>
                        <span className="text-lg font-black text-slate-900">₹{pkg.discounted_price}</span>
                      </div>

                      <button
                        onClick={() => setBookingModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                      >
                        Book Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDoctor={selectedDoctor}
        initialTime={selectedSlot}
        onBookingSuccess={(appt) => setLastBooking(appt)}
      />

      {/* Procedure Consultation Enquiry Modal */}
      <ProcedureEnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        procedure={selectedProcedure}
        organization={selectedOrgForProcedure}
      />
    </div>
  );
};
export default BookOpdPage;
