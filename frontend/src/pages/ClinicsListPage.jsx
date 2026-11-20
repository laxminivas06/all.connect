import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Stethoscope,
  MapPin,
  Star,
  Search,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
  Navigation,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

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

export const ClinicsListPage = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedSpeciality, setSelectedSpeciality] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedClinicForBooking, setSelectedClinicForBooking] = useState(null);

  useEffect(() => {
    // Detect location automatically
    if (navigator.geolocation) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setDetectingLocation(false);
        },
        () => {
          setDetectingLocation(false);
        },
        { timeout: 5000 }
      );
    }

    api.getClinics()
      .then(data => {
        setClinics(data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const dynamicAreas = ['All', ...Array.from(new Set(clinics.map(c => c.area).filter(Boolean)))];

  // Dynamic specialities
  const allSpecialities = ['All', ...Array.from(new Set(clinics.flatMap(c => c.departments || []).filter(Boolean)))];

  const getDistanceStr = (clinic) => {
    if (!userCoords || !clinic.coordinates) return null;
    const dist = calculateDistance(
      userCoords.lat,
      userCoords.lng,
      clinic.coordinates.lat || clinic.latitude,
      clinic.coordinates.lng || clinic.longitude
    );
    return dist !== null ? `${dist} km away` : null;
  };

  const filteredClinics = clinics.filter(c => {
    const areaMatch = selectedArea === 'All' || (c.area || '').toLowerCase() === selectedArea.toLowerCase();
    const specMatch = selectedSpeciality === 'All' || (c.departments || []).some(d => d.toLowerCase() === selectedSpeciality.toLowerCase());
    const searchMatch = !searchQuery || (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.departments || []).some(d => (d || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.area || '').toLowerCase().includes(searchQuery.toLowerCase());
    return areaMatch && specMatch && searchMatch;
  });

  const sortedClinics = [...filteredClinics].sort((a, b) => {
    if (!userCoords) return 0;
    const distA = calculateDistance(userCoords.lat, userCoords.lng, a.coordinates?.lat || a.latitude, a.coordinates?.lng || a.longitude) ?? 9999;
    const distB = calculateDistance(userCoords.lat, userCoords.lng, b.coordinates?.lat || b.latitude, b.coordinates?.lng || b.longitude) ?? 9999;
    return distA - distB;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
              <Stethoscope className="w-4 h-4" />
              <span>PRIMARY CARE & NEIGHBORHOOD CLINIC DIRECTORY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Independent Clinics & Polyclinics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Accessible local outpatient clinics with minimal waiting times, verified doctors, and direct OPD slot booking
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 self-start sm:self-auto">
            {sortedClinics.length} Clinics Available
          </span>
        </div>

        {/* Search & Filter Bar: Location & Speciality */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search clinic name, medical department, or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full sm:w-auto text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-700 cursor-pointer"
            >
              {dynamicAreas.map(a => (
                <option key={a} value={a}>{a === 'All' ? 'All Localities' : a}</option>
              ))}
            </select>

            <select
              value={selectedSpeciality}
              onChange={(e) => setSelectedSpeciality(e.target.value)}
              className="w-full sm:w-auto text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-700 cursor-pointer"
            >
              {allSpecialities.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Specialities' : s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clinics Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading neighborhood clinics...</p>
          </div>
        ) : sortedClinics.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No clinics matched your criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Try selecting another locality or speciality</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClinics.map(c => {
              const distStr = getDistanceStr(c);
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header badge & Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                          {c.area || 'Hyderabad'}
                        </span>
                        {distStr && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {distStr}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{c.rating || 4.8}</span>
                      </div>
                    </div>

                    {/* Clinic Name & Tagline */}
                    <div>
                      <h2 className="font-extrabold text-base text-slate-900 group-hover:text-teal-600 transition">
                        {c.name}
                      </h2>
                      <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">
                        {c.tagline || 'Community Polyclinic & Outpatient Centre'}
                      </p>
                    </div>

                    {/* Clinic Details */}
                    <div className="space-y-2 text-xs text-slate-600 pt-1">
                      <p className="flex items-center gap-2 text-slate-500 text-xs">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{c.address || c.area}</span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-500 text-xs">
                        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="truncate">{c.operating_hours || '09:00 AM - 09:00 PM'}</span>
                      </p>
                    </div>

                    {/* Available Services / Departments */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(c.departments || []).map(d => (
                        <span key={d} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: View Clinic Profile & Book Appointment */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      to={`/clinics/${c.id}`}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/clinics/${c.id}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Appointment</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialHospital={selectedClinicForBooking}
      />
    </div>
  );
};
export default ClinicsListPage;