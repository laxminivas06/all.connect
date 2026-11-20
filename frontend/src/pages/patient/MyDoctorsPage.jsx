import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PatientSubNav } from '../../components/patient/PatientSubNav';
import { AppointmentBookingModal } from '../../components/AppointmentBookingModal';
import {
  Stethoscope,
  Calendar,
  Building2,
  Clock,
  ShieldCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Star,
  MapPin,
  User,
  Filter,
  Sparkles,
  Phone,
  Video,
  Award
} from 'lucide-react';

export const MyDoctorsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all'); // all, available, on_leave

  // Booking Modal
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user && user.role === 'patient') {
        const res = await api.getMyDoctors();
        setDoctors(res.doctors || []);
        setRecommendedDoctors(res.recommended_doctors || []);
      } else {
        // Fallback for public preview or unauthenticated
        const allDocs = await api.getDoctors();
        setRecommendedDoctors(Array.isArray(allDocs) ? allDocs.slice(0, 8) : []);
      }
    } catch (err) {
      console.error('Failed to fetch patient doctors:', err);
      setError(err.message || 'Failed to load your doctor directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [user]);

  const handleOpenBooking = (doc) => {
    if (doc.is_on_leave || !doc.is_available) {
      return; // Disallow booking with unavailable doctors
    }
    setSelectedDoctorForBooking(doc);
    setBookingModalOpen(true);
  };

  // Filter doctors
  const displayDoctors = doctors.filter((doc) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (doc.name && doc.name.toLowerCase().includes(q)) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
      (doc.organization_name && doc.organization_name.toLowerCase().includes(q)) ||
      (doc.department && doc.department.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterAvailability === 'available') {
      return !doc.is_on_leave && doc.is_available !== false;
    }
    if (filterAvailability === 'on_leave') {
      return doc.is_on_leave;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Patient Sub Navigation */}
      <PatientSubNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 space-y-6">
        {/* Header Station */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>Dedicated Clinical Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Doctors
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Specialists and physicians associated with your healthcare profile and past consultations. View live schedule availability, leave periods, or schedule your next OPD visit.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Link
              to="/book-opd"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              <span>Explore All Specialists</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Doctors' },
              { id: 'available', label: 'Available' },
              { id: 'on_leave', label: 'On Leave' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterAvailability(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterAvailability === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading your associated doctors...</p>
          </div>
        )}

        {/* Doctor Grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
        {!loading && displayDoctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayDoctors.map((doc) => {
              const isOnLeave = Boolean(doc.is_on_leave);
              const isAvailable = Boolean(doc.is_available) && !isOnLeave;
              const doctorInitials = (doc.name || 'Doctor')
                .replace(/^Dr\.?\s*/i, '')
                .trim()
                .charAt(0)
                .toUpperCase() || 'D';

              return (
                <div
                  key={doc.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition flex flex-col justify-between shadow-2xs hover:shadow-md ${
                    isOnLeave ? 'border-amber-200/90 bg-gradient-to-b from-amber-50/20 to-white' : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 shrink-0 relative">
                          {doctorInitials}
                          <span
                            className={`w-3.5 h-3.5 rounded-full absolute -bottom-1 -right-1 border-2 border-white ${
                              isOnLeave ? 'bg-amber-500' : isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                        </div>

                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition">
                            {doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}
                          </h3>
                          <p className="text-xs font-bold text-blue-600 mt-0.5">
                            {doc.specialization || doc.department || 'Specialist'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {doc.qualifications || 'MBBS, MD'}
                          </p>
                        </div>
                      </div>

                      {/* Associated Visits Badge */}
                      {doc.total_consultations > 0 && (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          {doc.total_consultations} {doc.total_consultations === 1 ? 'Visit' : 'Visits'}
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isOnLeave ? (
                        <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-800">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Currently Unavailable – On Leave</span>
                          </div>
                          {doc.leave_start && doc.leave_end && (
                            <p className="text-[11px] text-amber-700 pl-5 font-semibold">
                              On leave: {doc.leave_start} to {doc.leave_end}
                            </p>
                          )}
                          {doc.leave_reason && (
                            <p className="text-[10px] text-amber-600/90 pl-5 italic">
                              "{doc.leave_reason}"
                            </p>
                          )}
                        </div>
                      ) : isAvailable ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Available for Appointments</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Currently Offline</span>
                        </div>
                      )}
                    </div>

                    {/* Facility & Experience Details */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Facility:
                        </span>
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">
                          {doc.organization_name || doc.hospital_name || 'Healthcare Facility'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          Experience:
                        </span>
                        <span className="font-bold text-slate-800">
                          {doc.experience_years ? `${doc.experience_years} Years` : '10+ Years Experience'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Consultation Fee:
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          ₹{doc.consultation_fee || 500}
                        </span>
                      </div>

                      {doc.last_consultation_date && (
                        <div className="flex items-center justify-between text-slate-600 pt-1">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            Last Visit:
                          </span>
                          <span className="font-bold text-blue-600">
                            {doc.last_consultation_date}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/doctors/${doc.id}`}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Profile</span>
                    </Link>

                    {isOnLeave ? (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs text-center cursor-not-allowed border border-slate-200"
                        title="Doctor is currently on leave. Booking is disabled."
                      >
                        On Leave
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(doc)}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book OPD</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State when no doctors associated or search yields 0 */}
        {!loading && displayDoctors.length === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {searchQuery ? 'No Matching Doctors Found' : 'No Doctors Associated Yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `No doctors matched your search "${searchQuery}". Try adjusting your keywords or clearing the filter.`
                  : 'Doctors you consult with through AllConnect will be automatically saved here for quick follow-ups and appointment booking.'}
              </p>
            </div>

            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterAvailability('all');
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Clear Search & Filter
              </button>
            ) : (
              <Link
                to="/book-opd"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <Search className="w-4 h-4" />
                <span>Search & Book a Doctor Now</span>
              </Link>
            )}
          </div>
        )}

        {/* Recommended Specialists Section (if associated list is small) */}
        {!loading && recommendedDoctors.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Recommended Verified Specialists</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Top-rated consultants across accredited Hyderabad healthcare facilities
                </p>
              </div>

              <Link
                to="/book-opd"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedDoctors.map((doc) => {
                const isOnLeave = Boolean(doc.is_on_leave);
                const isAvailable = Boolean(doc.is_available) && !isOnLeave;
                const initials = (doc.name || 'Doctor')
                  .replace(/^Dr\.?\s*/i, '')
                  .trim()
                  .charAt(0)
                  .toUpperCase() || 'D';

                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}
                          </h4>
                          <p className="text-xs text-blue-600 font-bold truncate">
                            {doc.specialization || doc.department || 'Specialist'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {doc.organization_name || doc.hospital_name}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isOnLeave ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Currently Unavailable – On Leave
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Available Today
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        to={`/doctors/${doc.id}`}
                        className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs text-center transition"
                      >
                        Profile
                      </Link>
                      {isOnLeave ? (
                        <button
                          type="button"
                          disabled
                          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs text-center cursor-not-allowed"
                        >
                          On Leave
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenBooking(doc)}
                          className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-xs transition"
                        >
                          Book OPD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Booking Modal */}
      {bookingModalOpen && selectedDoctorForBooking && (
        <AppointmentBookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedDoctorForBooking(null);
          }}
          initialDoctor={selectedDoctorForBooking}
          onSuccess={() => {
            fetchDoctors();
            navigate('/my-appointments');
          }}
        />
      )}
    </div>
  );
};

export default MyDoctorsPage;
