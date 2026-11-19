import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  Building2,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  Bed,
  CreditCard,
  ShieldCheck,
  Tag,
  DollarSign,
  FileCheck,
  Calendar,
  Activity,
  Eye,
  EyeOff,
  Edit,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Users
} from 'lucide-react';

export const HospitalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getHospitalPublic(id),
      api.getAdminDoctors(),
      api.getAdminAdvertisements()
    ]).then(([hospRes, docsRes, adsRes]) => {
      setHospital(hospRes);
      setEditForm(hospRes);
      const affDocs = (docsRes || []).filter(d => d.hospital_id === id);
      setDoctors(affDocs);
      const affOffers = (adsRes || []).filter(o => o.organization_id === id);
      setOffers(affOffers);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleTogglePublishing = async () => {
    const newStatus = hospital.publishing_status === 'published' ? 'unpublished' : 'published';
    try {
      await api.updateOrgPublishing(hospital.id, { publishing_status: newStatus });
      setHospital(prev => ({ ...prev, publishing_status: newStatus }));
    } catch (err) {
      alert(err.message || 'Error updating publishing status');
    }
  };

  const handleSaveDetails = async () => {
    try {
      await api.updateHospitalAdmin(hospital.id, editForm);
      setHospital(editForm);
      setIsEditing(false);
      alert('Hospital details successfully updated');
    } catch (err) {
      alert(err.message || 'Error updating details');
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Building2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-semibold">Loading hospital dossier...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-slate-700">Hospital not found</p>
        <Link to="/dashboard/admin/hospitals" className="text-xs text-purple-600 font-bold hover:underline">
          Return to All Hospitals
        </Link>
      </div>
    );
  }

  const isPublished = hospital.publishing_status === 'published';

  const tabs = [
    { key: 'overview', label: 'Overview & KPIs', icon: Activity },
    { key: 'profile', label: 'Hospital Profile', icon: Building2 },
    { key: 'departments', label: 'Departments', icon: Stethoscope },
    { key: 'doctors', label: `Doctors (${doctors.length})`, icon: Users },
    { key: 'subscription', label: 'Subscription & Limits', icon: CreditCard },
    { key: 'billing', label: 'Billing & Payments', icon: DollarSign },
    { key: 'offers', label: `Promotions (${offers.length})`, icon: Tag },
    { key: 'documents', label: 'Accreditation Documents', icon: FileCheck },
    { key: 'activity', label: 'Audit & Activity', icon: Clock }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Back button */}
      <Link
        to="/dashboard/admin/hospitals"
        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Hospitals Directory</span>
      </Link>

      {/* Hospital Identity Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <img
            src={hospital.logo_url || "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80"}
            alt={hospital.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                {hospital.id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                {isPublished ? 'Marketplace Published' : 'Hidden from Directory'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 uppercase">
                {hospital.subscription_plan || 'Enterprise'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{hospital.name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{hospital.address}, {hospital.area}, {hospital.city || 'Hyderabad'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <Link
            to={`/hospitals/${hospital.id}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Page</span>
          </Link>
          <button
            onClick={handleTogglePublishing}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${isPublished ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
          >
            {isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${activeTab === t.key
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Beds</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{hospital.total_beds || 150}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">{hospital.available_beds || 45} Available Now</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">ICU Capacity</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{hospital.icu_beds_total || 30}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{hospital.icu_beds_available || 8} Available</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Affiliated Doctors</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">{doctors.length}</span>
              <span className="text-[10px] text-slate-500 font-semibold">Active in hospital</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Clinical Rating</span>
              <span className="text-2xl font-black text-amber-500 mt-1 block">★ {hospital.rating || 4.8}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{hospital.review_count || 120} Patient Reviews</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Hospital Mission & Scope</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {hospital.description || "Leading multi-speciality tertiary healthcare institute providing comprehensive diagnostics, emergency care, inpatient surgical theatres, and advanced outpatient consultations in Hyderabad, Telangana."}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: HOSPITAL PROFILE & EDIT */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">Organization Profile Details</h3>
            <button
              onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-700 text-white hover:bg-purple-800 transition flex items-center gap-1.5"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Official Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Registration Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={editForm.registration_number || ''}
                onChange={(e) => setEditForm({ ...editForm, registration_number: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Contact Phone</label>
              <input
                type="text"
                disabled={!isEditing}
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Emergency 24x7 Hotline</label>
              <input
                type="text"
                disabled={!isEditing}
                value={editForm.emergency_phone || '1066'}
                onChange={(e) => setEditForm({ ...editForm, emergency_phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 disabled:bg-slate-50 font-bold text-rose-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Clinical Departments & Centers of Excellence</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(hospital.departments || []).map(dept => (
              <div key={dept} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-purple-700 shrink-0" />
                <span className="font-bold text-xs text-slate-800">{dept}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Affiliated Specialist Doctors ({doctors.length})</h3>
              <p className="text-xs text-slate-500">Doctors associated with this hospital</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Managed directly by Hospital via its dashboard
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900">{doc.full_name}</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    {doc.verification_status || 'verified'}
                  </span>
                </div>
                <p className="text-blue-700 font-semibold">{doc.specialty} • {doc.qualification}</p>
                <p className="text-slate-500 font-mono text-[10px]">Medical Council No: {doc.registration_number || 'TSMC-8412'}</p>
                <p className="font-bold text-slate-900 pt-1">OPD Fee: ₹{doc.consultation_fee}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUBSCRIPTION & LIMITS */}
      {activeTab === 'subscription' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Hospital Software SaaS Subscription</h3>
          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Current SaaS Tier</span>
                <span className="text-xl font-black text-slate-900 capitalize">{hospital.subscription_plan || 'Hospital Enterprise'}</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Active & Enforced
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-purple-200/60">
              <div>
                <span className="text-slate-500 block">Doctor Seat Limit</span>
                <span className="font-bold text-slate-900">100 Doctors</span>
              </div>
              <div>
                <span className="text-slate-500 block">Monthly Appointments</span>
                <span className="font-bold text-slate-900">Unlimited</span>
              </div>
              <div>
                <span className="text-slate-500 block">Billing Cycle</span>
                <span className="font-bold text-slate-900 capitalize">Annual Billing</span>
              </div>
              <div>
                <span className="text-slate-500 block">Renewal Date</span>
                <span className="font-bold text-slate-900">2027-01-10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BILLING & PAYMENTS */}
      {activeTab === 'billing' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Subscription & Software Invoices</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Invoice ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-mono font-bold">INV-2026-H001</td>
                <td className="py-3 px-3 text-slate-500">2026-01-10</td>
                <td className="py-3 px-3 font-medium">Enterprise SaaS Annual License</td>
                <td className="py-3 px-3 font-black text-slate-900">₹299,999.00</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Paid</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 7: OFFERS & CAMPAIGNS */}
      {activeTab === 'offers' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Hospital Promotional Packages ({offers.length})</h3>
          <div className="space-y-3">
            {offers.map(off => (
              <div key={off.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{off.title}</h4>
                  <p className="text-slate-500">{off.description}</p>
                  <p className="font-bold text-purple-700 mt-1">₹{off.discounted_price} (Original: ₹{off.original_price})</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${off.workflow_status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                  {off.workflow_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ACCREDITATION DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Regulatory Accreditation Dossier</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { name: 'Telangana Clinical Establishment Registration', ref: 'TS-CEA-HYD-912' },
              { name: 'Fire Safety NOC Clearance', ref: 'FS-NOC-2025-4421' },
              { name: 'Pollution Control Bio-Medical Waste Clearance', ref: 'PCB-BMW-HYD-0041' },
              { name: 'NABH Accreditation Certificate', ref: 'NABH-H-2024-0182' }
            ].map(doc => (
              <div key={doc.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{doc.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">Ref: {doc.ref}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT & ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Hospital Platform Audit Log</h3>
          <div className="space-y-2 text-xs font-mono text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
              <span>[2026-11-19 14:45] Super Admin toggled marketplace status to 'published'</span>
              <span className="text-slate-400">admin</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
              <span>[2026-11-10 10:15] Annual SaaS Enterprise subscription renewed</span>
              <span className="text-slate-400">system</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
              <span>[2026-01-10 09:00] Initial hospital registration and clinical verification</span>
              <span className="text-slate-400">admin</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
