import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  FileText,
  User,
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  QrCode,
  ArrowRight,
  Settings,
  Heart,
  Phone,
  MapPin,
  Building2,
  Stethoscope,
  ChevronRight,
  Printer,
  Sparkles,
  Save,
  Lock,
  Compass
} from 'lucide-react';
import { HealthIdCardModal } from '../../components/HealthIdCardModal';
import { ConsentModal } from '../../components/ConsentModal';

export const PatientPortalPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, prescriptions, records, settings

  // Modals
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    emergency_contact: '',
    address: '',
    blood_group: '',
    allergies: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Sync sub-routes or query params to tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['appointments', 'prescriptions', 'records', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      const pathSegment = location.pathname.split('/')[2];
      if (pathSegment === 'prescriptions') setActiveTab('prescriptions');
      else if (pathSegment === 'records') setActiveTab('records');
      else if (pathSegment === 'settings') setActiveTab('settings');
      else setActiveTab('appointments');
    }
  }, [location]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const res = await api.getMyPatientData();
      setData(res);
      if (res?.patient) {
        setProfileForm({
          full_name: res.patient.full_name || '',
          phone: res.patient.phone || '',
          emergency_contact: res.patient.emergency_contact || '',
          address: res.patient.address || '',
          blood_group: res.patient.blood_group || '',
          allergies: Array.isArray(res.patient.allergies) ? res.patient.allergies.join(', ') : (res.patient.allergies || '')
        });
      }
    } catch (err) {
      console.error('Failed to load patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);
    try {
      const payload = {
        ...profileForm,
        allergies: profileForm.allergies ? profileForm.allergies.split(',').map(s => s.trim()) : []
      };
      await api.updateMyPatientProfile(payload);
      setProfileMessage('Personal profile and healthcare preferences updated successfully!');
      fetchPatientData();
    } catch (err) {
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(apptId, { reason: 'Patient cancelled via portal' });
      fetchPatientData();
    } catch (err) {
      alert(err.message || 'Error cancelling appointment');
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading your health profile and appointments...</p>
      </div>
    );
  }

  const { patient, metrics, appointments = [], prescriptions = [], medical_records = [] } = data || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* Top Patient Identity & Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Verified Patient Health Profile
            </span>
            <span className="text-xs text-slate-400">• Hyderabad</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {patient?.full_name || 'My Patient Profile'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Access your OPD bookings, digital prescriptions, health ID card, and longitudinal medical records
          </p>

          {/* Key Demographics Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Universal Health ID</span>
              <span className="font-mono font-bold text-blue-400">{patient?.health_id || 'HC-2026-000001'}</span>
            </div>
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient ID</span>
              <span className="font-mono font-bold text-slate-200">{patient?.patient_id || 'PAT-001'}</span>
            </div>
            {patient?.blood_group && (
              <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Blood Group</span>
                <span className="font-bold text-rose-400">{patient.blood_group}</span>
              </div>
            )}
            {patient?.age && (
              <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Age / Gender</span>
                <span className="font-bold text-slate-200">{patient.age} yrs • {patient.gender}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Return to Discovery & Health Card */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full md:w-auto shrink-0">
          <Link
            to="/book-opd"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition"
          >
            <Search className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
          <button
            type="button"
            onClick={() => setCardModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>Digital ID Card</span>
          </button>
        </div>
      </div>

      {/* Consumer Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        {[
          { key: 'appointments', label: `My Appointments (${appointments.length})`, icon: Calendar },
          { key: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: FileText },
          { key: 'records', label: `Medical Records (${medical_records.length})`, icon: Heart },
          { key: 'settings', label: 'Profile & Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: APPOINTMENTS & BOOKINGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Consultation Bookings</span>
            </h2>
            <Link
              to="/book-opd"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Explore Specialists</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No Appointments Booked Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Find the right doctor, clinic or hospital and book your OPD consultation in seconds.
                </p>
              </div>
              <Link
                to="/book-opd"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <Search className="w-4 h-4" />
                <span>Search & Book OPD Now</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appt) => {
                const isConfirmed = appt.status === 'confirmed';
                const isCompleted = appt.status === 'completed';
                const isCancelled = appt.status === 'cancelled';

                return (
                  <div
                    key={appt.id || appt.appointment_id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          ID: {appt.appointment_id || appt.id}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                          {appt.doctor_name || 'Specialist Consultation'}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appt.hospital_name || appt.organization_name || 'Hospital'}</span>
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isConfirmed
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Appointment Date</span>
                        <span className="font-extrabold text-slate-800">{appt.appointment_date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Time Slot</span>
                        <span className="font-extrabold text-slate-800">{appt.slot_time || appt.appointment_time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-bold text-slate-600">
                        Fee: ₹{appt.consultation_fee || 600}
                      </span>
                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(appt.id || appt.appointment_id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PRESCRIPTIONS & DIGITAL RX */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Digital Prescriptions & Medical Advice</span>
          </h2>

          {prescriptions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Prescriptions Issued Yet</h3>
              <p className="text-xs text-slate-500">
                Prescriptions generated by consulting doctors during your appointments will appear here with medication schedules and digital signatures.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id || rx.prescription_id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-700">
                          {rx.prescription_id || rx.id}
                        </span>
                        <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                          Digitally Signed
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                        Prescribed by {rx.doctor_name || 'Attending Physician'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {rx.hospital_name || rx.organization_name} • Date: {rx.created_at?.split('T')?.[0] || '2026-11-19'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Rx</span>
                    </button>
                  </div>

                  {/* Medicines Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-3 py-2 rounded-l-lg">Medicine / Drug Name</th>
                          <th className="px-3 py-2">Dosage</th>
                          <th className="px-3 py-2">Frequency</th>
                          <th className="px-3 py-2 rounded-r-lg">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(rx.medications || rx.medicines || []).map((med, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">{med.name || med.medicine_name}</td>
                            <td className="px-3 py-2.5 text-slate-600">{med.dosage || '1 tablet'}</td>
                            <td className="px-3 py-2.5 text-slate-600">{med.frequency || '1-0-1'}</td>
                            <td className="px-3 py-2.5 text-slate-500">{med.instructions || med.advice || 'After meals'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rx.advice && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                      <span className="font-bold block">Physician Clinical Advice:</span>
                      <p className="mt-0.5 text-slate-700">{rx.advice}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: MEDICAL RECORDS & EHR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Longitudinal Health Records & Consent</span>
            </h2>
            <button
              type="button"
              onClick={() => setConsentModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manage Data Sharing</span>
            </button>
          </div>

          {medical_records.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Diagnostic Records Uploaded</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Diagnostic reports, lab summaries, and medical records from hospital visits will be indexed here under your Universal Health ID.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medical_records.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                        {rec.record_type || 'Diagnostic Report'}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">{rec.title}</h4>
                      <p className="text-xs text-slate-500">{rec.organization_name} • {rec.created_at?.split('T')?.[0]}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    {rec.summary || rec.findings || 'Clinical diagnostic findings archived in patient health mesh.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: PROFILE & SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Profile & Healthcare Settings</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage your personal demographics, emergency contact numbers, and communication preferences.
            </p>
          </div>

          {profileMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileMessage}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={profileForm.emergency_contact}
                  onChange={(e) => setProfileForm({ ...profileForm, emergency_contact: e.target.value })}
                  placeholder="+91 98490 12345"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                <select
                  value={profileForm.blood_group}
                  onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Blood Group</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Plot/Flat number, Street, Area, City"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Known Allergies / Chronic Conditions</label>
                <input
                  type="text"
                  value={profileForm.allergies}
                  onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Peanuts, Dust allergy"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals */}
      {cardModalOpen && (
        <HealthIdCardModal
          patient={patient}
          isOpen={cardModalOpen}
          onClose={() => setCardModalOpen(false)}
        />
      )}

      {consentModalOpen && (
        <ConsentModal
          patient={patient}
          isOpen={consentModalOpen}
          onClose={() => {
            setConsentModalOpen(false);
            fetchPatientData();
          }}
        />
      )}

    </div>
  );
};

export default PatientPortalPage;
