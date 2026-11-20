import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  ShoppingBag,
  FolderHeart,
  QrCode,
  ShieldCheck,
  Plus,
  Camera,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pill,
  ArrowRight,
  Printer,
  ChevronRight,
  Building2,
  Stethoscope,
  User,
  Settings
} from 'lucide-react';
import { AppointmentBookingModal } from '../../components/AppointmentBookingModal';
import { PrescriptionUploadModal } from '../../components/PrescriptionUploadModal';
import { HealthIdCardModal } from '../../components/HealthIdCardModal';
import { ConsentModal } from '../../components/ConsentModal';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, appointments, prescriptions, records, orders

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname.split('/dashboard/patient/')[1];
    if (path) {
      const cleanPath = path.split('/')[0];
      if (cleanPath === 'appointments') setActiveTab('appointments');
      else if (cleanPath === 'prescriptions') setActiveTab('prescriptions');
      else if (cleanPath === 'records') setActiveTab('records');
      else if (cleanPath === 'orders') setActiveTab('orders');
      else if (cleanPath === 'health-card') {
        setActiveTab('overview');
        setCardModalOpen(true);
      }
      else if (cleanPath === 'offers') {
        navigate('/offers');
      }
    } else if (location.pathname === '/dashboard/patient') {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const fetchDashboardData = () => {
    setLoading(true);
    api.getMyPatientData()
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-slate-500 font-semibold animate-pulse">Loading patient health record mesh...</p>
      </div>
    );
  }

  const { patient, metrics, appointments, prescriptions, orders, medical_records, available_organizations } = data || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Patient Identity Header */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              CENTRAL PATIENT IDENTITY
            </span>
            <span className="text-xs text-slate-400">• Hyderabad</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome, {patient?.full_name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <span className="text-slate-400 text-[10px] uppercase block">Universal Health ID:</span>
              <span className="font-mono font-bold text-amber-300">{patient?.health_id}</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <span className="text-slate-400 text-[10px] uppercase block">Patient ID:</span>
              <span className="font-mono font-bold text-slate-200">{patient?.patient_id}</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <span className="text-slate-400 text-[10px] uppercase block">Blood Group:</span>
              <span className="font-bold text-rose-300">{patient?.blood_group}</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-2 relative z-10 shrink-0">
          <button
            onClick={() => setCardModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Digital Health ID Card</span>
          </button>
          <button
            onClick={() => setConsentModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Manage EHR Consent ({patient?.permitted_organizations?.length || 0} Orgs)</span>
          </button>
        </div>
      </div>

      {/* Primary Dashboard Shortcuts Grid: Exactly 3 Clean Cards (Prescriptions, Health Profile, Settings) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Prescriptions */}
        <Link
          to="/prescriptions"
          className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-teal-600 group-hover:text-white transition-all">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-600 transition">
                Prescriptions
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Access certified doctor-issued digital prescriptions, dosages, and medical advice.
              </p>
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
            <span>View Prescriptions</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Health Profile */}
        <Link
          to="/profile"
          className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition">
                Health Profile
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Manage your personal demographics, health ID, emergency contacts & records.
              </p>
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Manage Health Profile</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Settings */}
        <Link
          to="/settings"
          className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition">
                Settings
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Configure security credentials, notification channels, and account preferences.
              </p>
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
            <span>Account Settings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Quick Interactive Actions Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBookingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Prescription (Smart OCR)</span>
          </button>
          <button
            onClick={() => navigate('/pharmacy-search')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
          >
            <Search className="w-4 h-4" />
            <span>Find Medicines & Quotes</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          {['overview', 'appointments', 'prescriptions', 'orders', 'records'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                activeTab === tab ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Upcoming Appointments</span>
              </h2>
              <button onClick={() => setActiveTab('appointments')} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {appointments?.filter(a => a.status !== 'Cancelled').slice(0, 3).map(a => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-slate-900">{a.doctor_name}</p>
                    <p className="text-[11px] text-blue-700 font-medium">{a.specialization} • {a.organization_name}</p>
                    <p className="text-[10px] text-slate-400">{a.appointment_date} at {a.appointment_time}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      a.status === 'Checked In' ? 'bg-blue-100 text-blue-800' :
                      a.status === 'Waiting' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {a.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">₹{a.consultation_fee}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Orders with Pickup Codes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>Medicine Orders & Pickup Codes</span>
              </h2>
              <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-amber-600 hover:text-amber-700">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {orders?.slice(0, 3).map(o => (
                <div key={o.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-slate-900">{o.order_id}</span>
                    <p className="text-xs text-slate-700 font-semibold">{o.pharmacy_name}</p>
                    <p className="text-[11px] text-slate-500">{o.items?.length || 2} items • ₹{o.total_amount}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl">
                      <span className="text-[9px] uppercase tracking-wider text-amber-800 block font-bold">Verification Code:</span>
                      <span className="font-mono text-sm font-black text-amber-950">{o.pickup_code}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900">Your Appointment History</h2>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Book New
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments?.map(a => (
              <div key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-700">{a.appointment_id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      a.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                      a.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{a.doctor_name} ({a.department})</h4>
                  <p className="text-xs text-slate-600">{a.organization_name}</p>
                  <p className="text-[11px] text-slate-400">Scheduled: {a.appointment_date} at {a.appointment_time} • {a.appointment_type}</p>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">Fee: ₹{a.consultation_fee}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">{a.payment_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Digital Prescriptions & OCR Vault</h2>
              <p className="text-xs text-slate-500">Authorized medical records issued by doctors or verified by you</p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Upload Prescription</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions?.map(pr => (
              <div key={pr.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-teal-800">{pr.prescription_id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      {pr.type === 'digital' ? 'Doctor Issued' : 'OCR Verified'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 mt-2">{pr.doctor_name}</h4>
                  <p className="text-xs text-slate-500">{pr.organization_name} • {pr.consultation_date}</p>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs mt-2 space-y-1">
                    <span className="font-bold text-slate-700 block">Diagnosis: {pr.diagnosis}</span>
                    {pr.vitals?.blood_pressure && (
                      <span className="text-[11px] text-slate-500 block">Vitals: BP {pr.vitals.blood_pressure}</span>
                    )}
                  </div>

                  {/* Medicines List */}
                  <div className="mt-3 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Prescribed Medicines:</span>
                    {pr.medicines?.map((m, idx) => (
                      <div key={idx} className="p-1.5 bg-white rounded-lg border border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{m.name}</span>
                        <span className="text-[10px] text-slate-500">{m.dosage} ({m.frequency})</span>
                      </div>
                    ))}
                  </div>

                  {pr.advice && (
                    <p className="text-[11px] text-slate-500 italic mt-2">Advice: {pr.advice}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Follow-up: {pr.follow_up_date || 'As required'}
                  </span>
                  <button
                    onClick={() => {
                      navigate('/pharmacy-search', { state: { medicines: pr.medicines, prescription_id: pr.id } });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Find Medicines Near Me</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Medicine Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Medicine Orders & Pickup Pass</h2>
              <p className="text-xs text-slate-500">Track order preparation, ready for pickup, and delivery milestones</p>
            </div>
            <button
              onClick={() => navigate('/pharmacy-search')}
              className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
            >
              Order New Medicines
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {orders?.map(o => (
              <div key={o.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-700">{o.order_id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {o.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{o.pharmacy_name}</h4>
                  <p className="text-xs text-slate-500">{o.fulfillment_type} • Placed on {new Date(o.created_at).toLocaleDateString()}</p>
                  
                  <div className="flex flex-wrap gap-1 pt-1">
                    {o.items?.map((it, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {it.medicine_name || it.name} (x{it.quantity})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                    <span className="text-[9px] uppercase tracking-wider text-amber-800 font-bold block">Pickup Code:</span>
                    <span className="font-mono text-base font-black text-amber-950">{o.pickup_code}</span>
                  </div>
                  <span className="font-black text-sm text-slate-900">Total: ₹{o.total_amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Diagnostic Records & Reports */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Diagnostic Reports & Medical History</h2>
              <p className="text-xs text-slate-500">Reports saved under your Centralized Healthcare ID</p>
            </div>
            <button
              onClick={() => setConsentModalOpen(true)}
              className="text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              Consent Permissions
            </button>
          </div>

          <div className="space-y-3">
            {medical_records?.map(r => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{r.title}</span>
                  <span className="text-[10px] text-slate-400">{r.record_date}</span>
                </div>
                <p className="text-[11px] text-blue-700 font-medium">{r.organization_name} • {r.record_type}</p>
                <p className="text-xs text-slate-600 pt-1">{r.summary}</p>
                {r.doctor_notes && (
                  <p className="text-[11px] text-slate-500 italic">Physician Note: {r.doctor_notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <PrescriptionUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <HealthIdCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        patient={patient}
      />
      <ConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        currentConsents={patient?.permitted_organizations || []}
        availableOrgs={available_organizations || []}
        onUpdated={() => fetchDashboardData()}
      />
    </div>
  );
};
