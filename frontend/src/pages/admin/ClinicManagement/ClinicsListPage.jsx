import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  Stethoscope,
  PlusCircle,
  Search,
  MapPin,
  Phone,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  Building2,
  DollarSign,
  ChevronRight,
  Globe
} from 'lucide-react';

export const ClinicsListPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const fetchClinics = () => {
    setLoading(true);
    api.getAdminOrganizations()
      .then(res => {
        const clns = (res || []).filter(o => o.id?.startsWith('clinic') || o.organization_type === 'clinic');
        setClinics(clns);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleToggleAccountStatus = async (clinicId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.toggleClinicStatus(clinicId, newStatus);
      fetchClinics();
    } catch (err) {
      alert(err.message || 'Error updating clinic account status');
    }
  };

  const handleReview = async (clinicId, action) => {
    try {
      await api.reviewOrgAdmin(clinicId, { action, remarks: `Reviewed by Super Admin on ${new Date().toLocaleDateString()}` });
      fetchClinics();
    } catch (err) {
      alert(err.message || 'Error updating approval status');
    }
  };

  const filteredClinics = clinics.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                          c.area?.toLowerCase().includes(search.toLowerCase()) ||
                          c.locality?.toLowerCase().includes(search.toLowerCase()) ||
                          c.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.verification_status === filterStatus || c.account_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wide">
              CLINIC MANAGEMENT
            </span>
            <span className="text-xs text-slate-400">• Outpatient & Daycare Clinics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Registered Clinics ({clinics.length})
          </h1>
          <p className="text-xs text-slate-500">
            View and manage participating independent outpatient clinics, accreditations, subscriptions, and account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/admin/hospitals/approvals"
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Verifications</span>
          </Link>
          <Link
            to="/dashboard/admin/register-organisation?type=clinic"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-teal-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Clinic</span>
          </Link>
        </div>
      </div>

      {/* Search & Actions Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by clinic name, locality, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending Review</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Cards
            </button>
          </div>
          <button
            onClick={fetchClinics}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-7 h-7 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading clinics...</p>
        </div>
      ) : filteredClinics.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No clinics found matching criteria</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Clinic & ID</th>
                  <th className="py-3 px-3">Specialty / Category</th>
                  <th className="py-3 px-3">Locality & Contact</th>
                  <th className="py-3 px-3">SaaS Plan</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClinics.map(cln => {
                  const isActive = cln.account_status !== 'suspended';
                  const isVerified = cln.verification_status === 'verified';

                  return (
                    <tr key={cln.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cln.logo_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=100&q=80'}
                            alt={cln.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{cln.name}</div>
                            <div className="text-[10px] font-mono text-teal-600 font-semibold">{cln.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800">{cln.specialty || 'General Medicine'}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{cln.locality || cln.area}, {cln.city || 'Hyderabad'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{cln.contact_phone || cln.phone}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 capitalize border border-teal-100">
                          {(cln.subscription_plan || 'clinic_pro').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {cln.verification_status || 'verified'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/clinics/${cln.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition"
                            title="View Public Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/dashboard/admin/billing?org_type=clinic`}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            title="View Payments"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </Link>
                          {cln.verification_status !== 'verified' && (
                            <button
                              onClick={() => handleReview(cln.id, 'approve')}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleAccountStatus(cln.id, cln.account_status || 'active')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                              isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClinics.map(cln => {
            const isActive = cln.account_status !== 'suspended';

            return (
              <div key={cln.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={cln.logo_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=100&q=80'}
                      alt={cln.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 font-mono block">{cln.id}</span>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">{cln.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{cln.specialty || 'Primary Care'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isActive ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cln.locality || cln.area}, {cln.city || 'Hyderabad'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cln.contact_phone || cln.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Plan</span>
                    <span className="font-bold text-teal-600 capitalize">{(cln.subscription_plan || 'Clinic Pro').replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                    <span className="font-bold text-emerald-600 capitalize">{cln.verification_status || 'Verified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment</span>
                    <span className="font-bold text-slate-700">Paid</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <Link
                    to={`/clinics/${cln.id}`}
                    target="_blank"
                    className="flex-1 py-2 rounded-xl bg-teal-50 text-teal-700 text-center font-bold text-xs hover:bg-teal-100 transition"
                  >
                    Public View
                  </Link>
                  <button
                    onClick={() => handleToggleAccountStatus(cln.id, cln.account_status || 'active')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isActive ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
