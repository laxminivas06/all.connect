import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  Building2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  EyeOff,
  Edit,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  MoreVertical,
  Globe,
  Calendar,
  DollarSign
} from 'lucide-react';

export const HospitalsListPage = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const fetchHospitals = () => {
    setLoading(true);
    api.getAdminOrganizations()
      .then(res => {
        const hosps = (res || []).filter(o => o.id?.startsWith('hosp') || o.organization_type === 'hospital');
        setHospitals(hosps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleTogglePublishing = async (hospId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'unpublished' : 'published';
    try {
      await api.updateOrgPublishing(hospId, { publishing_status: newStatus });
      fetchHospitals();
    } catch (err) {
      alert(err.message || 'Error updating publishing status');
    }
  };

  const handleToggleAccountStatus = async (hospId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.toggleHospitalStatus(hospId, newStatus);
      fetchHospitals();
    } catch (err) {
      alert(err.message || 'Error updating account status');
    }
  };

  const handleReview = async (hospId, action) => {
    try {
      await api.reviewOrgAdmin(hospId, { action, remarks: `Reviewed by Super Admin on ${new Date().toLocaleDateString()}` });
      fetchHospitals();
    } catch (err) {
      alert(err.message || 'Error updating approval status');
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name?.toLowerCase().includes(search.toLowerCase()) ||
                          h.id?.toLowerCase().includes(search.toLowerCase()) ||
                          h.area?.toLowerCase().includes(search.toLowerCase()) ||
                          h.locality?.toLowerCase().includes(search.toLowerCase());
    const cat = h.hospital_category || h.hospital_type || '';
    const matchesCategory = filterCategory === 'all' || cat.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesStatus = filterStatus === 'all' || h.verification_status === filterStatus || h.account_status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              HOSPITAL MANAGEMENT
            </span>
            <span className="text-xs text-slate-400">• Multi-Hospital Platform</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Registered Hospitals ({hospitals.length})
          </h1>
          <p className="text-xs text-slate-500">
            Central repository for viewing and managing participating hospitals, accreditations, subscriptions, and account states.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/dashboard/admin/hospitals/approvals"
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Verifications</span>
          </Link>
          <Link
            to="/dashboard/admin/register-organisation?type=hospital"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Hospital</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by hospital name, ID, or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="multi-speciality">Multi-Speciality</option>
            <option value="single-speciality">Single-Speciality</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending Review</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
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
            onClick={fetchHospitals}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading registered hospitals...</p>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No hospitals match your search criteria</p>
          <button onClick={() => { setSearch(''); setFilterCategory('all'); setFilterStatus('all'); }} className="text-xs text-blue-600 font-bold hover:underline">
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Hospital & ID</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Locality & Contact</th>
                  <th className="py-3 px-3">SaaS Plan</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHospitals.map(hosp => {
                  const isActive = hosp.account_status !== 'suspended';
                  const isVerified = hosp.verification_status === 'verified';
                  const category = hosp.hospital_category || hosp.hospital_type || 'Multi-Speciality Hospital';

                  return (
                    <tr key={hosp.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Name & ID & Logo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={hosp.logo_url || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=100&q=80'}
                            alt={hosp.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm leading-tight">{hosp.name}</div>
                            <div className="text-[10px] font-mono text-blue-600 font-semibold">{hosp.id}</div>
                            {hosp.registered_at && (
                              <div className="text-[9px] text-slate-400">Reg: {hosp.registered_at}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60 inline-block">
                          {category}
                        </span>
                      </td>

                      {/* Locality & Contact */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{hosp.locality || hosp.area}, {hosp.city || 'Hyderabad'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{hosp.contact_phone || hosp.phone}</span>
                          {hosp.website && (
                            <a href={hosp.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5" /> Web
                            </a>
                          )}
                        </div>
                      </td>

                      {/* SaaS Plan */}
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 capitalize border border-blue-100">
                          {(hosp.subscription_plan || 'hospital_enterprise').replace('_', ' ')}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          hosp.subscription?.status === 'active' || hosp.subscription_status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {hosp.subscription?.status === 'active' || hosp.subscription_status === 'active' ? 'Paid' : 'Pending'}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {hosp.verification_status || 'verified'}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/dashboard/admin/hospitals/${hosp.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/dashboard/admin/billing?org_type=hospital`}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            title="View Payment History"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </Link>
                          {hosp.verification_status !== 'verified' ? (
                            <button
                              onClick={() => handleReview(hosp.id, 'approve')}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                              title="Approve Hospital"
                            >
                              Approve
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleToggleAccountStatus(hosp.id, hosp.account_status || 'active')}
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
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHospitals.map(hosp => {
            const isActive = hosp.account_status !== 'suspended';
            const isVerified = hosp.verification_status === 'verified';
            const category = hosp.hospital_category || hosp.hospital_type || 'Multi-Speciality Hospital';

            return (
              <div key={hosp.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={hosp.logo_url || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=100&q=80'}
                      alt={hosp.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 font-mono block">{hosp.id}</span>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">{hosp.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{hosp.locality || hosp.area}, {hosp.city || 'Hyderabad'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hosp.contact_phone || hosp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{hosp.website || 'Official portal registered'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">SaaS Plan</span>
                    <span className="font-bold text-blue-600 capitalize">{(hosp.subscription_plan || 'Enterprise').replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Verification</span>
                    <span className="font-bold text-emerald-600 capitalize">{hosp.verification_status || 'Verified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment</span>
                    <span className="font-bold text-slate-700">Paid</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <Link
                    to={`/dashboard/admin/hospitals/${hosp.id}`}
                    className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-700 text-center font-bold text-xs hover:bg-blue-100 transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleToggleAccountStatus(hosp.id, hosp.account_status || 'active')}
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
