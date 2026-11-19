import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  Pill,
  Search,
  PlusCircle,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  DollarSign,
  Edit,
  Eye,
  AlertCircle,
  FileText,
  Calendar,
  X,
  Compass
} from 'lucide-react';

export const PharmaciesListPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modals state
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view', 'edit', 'verify'
  const [editForm, setEditForm] = useState({});

  const fetchPharmacies = () => {
    setLoading(true);
    api.getAdminPharmacies()
      .then(res => setPharmacies(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleToggleAccountStatus = async (pharmacyId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.togglePharmacyStatus(pharmacyId, newStatus);
      fetchPharmacies();
    } catch (err) {
      alert(err.message || 'Error updating pharmacy account status');
    }
  };

  const handleOpenEdit = (pharm) => {
    setSelectedPharmacy(pharm);
    setEditForm({
      name: pharm.name || '',
      license_number: pharm.license_number || '',
      license_validity: pharm.license_validity || '2028-01-01',
      locality: pharm.locality || pharm.area || '',
      address: pharm.address || '',
      pincode: pharm.pincode || '',
      phone: pharm.phone || '',
      subscription_plan: pharm.subscription_plan || 'pharmacy_pro',
      payment_status: pharm.payment_status || 'Paid',
      verification_status: pharm.verification_status || 'verified'
    });
    setModalMode('edit');
  };

  const handleOpenVerify = (pharm) => {
    setSelectedPharmacy(pharm);
    setEditForm({
      license_number: pharm.license_number || '',
      license_validity: pharm.license_validity || '2028-01-01',
      remarks: pharm.admin_remarks || 'State DCA drug licence verified against regulatory database'
    });
    setModalMode('verify');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedPharmacy) return;
    try {
      await api.updatePharmacyAdmin(selectedPharmacy.id, editForm);
      setModalMode(null);
      fetchPharmacies();
    } catch (err) {
      alert(err.message || 'Failed to update pharmacy');
    }
  };

  const handleSaveVerify = async (e) => {
    e.preventDefault();
    if (!selectedPharmacy) return;
    try {
      await api.verifyPharmacyLicense(selectedPharmacy.id, {
        status: 'verified',
        license_number: editForm.license_number,
        license_validity: editForm.license_validity,
        remarks: editForm.remarks
      });
      setModalMode(null);
      fetchPharmacies();
    } catch (err) {
      alert(err.message || 'Failed to verify pharmacy licence');
    }
  };

  const filteredPharmacies = pharmacies.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                          p.area?.toLowerCase().includes(search.toLowerCase()) ||
                          p.locality?.toLowerCase().includes(search.toLowerCase()) ||
                          p.license_number?.toLowerCase().includes(search.toLowerCase()) ||
                          p.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.verification_status === filterStatus || p.account_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide">
              PHARMACY MANAGEMENT
            </span>
            <span className="text-xs text-slate-400">• Retail Chemists & Drug Dispensaries</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Pharmacies Network ({pharmacies.length})
          </h1>
          <p className="text-xs text-slate-500">
            Verify state drug licences, update licence validities, manage subscriptions, view payment history, and oversee account activation.
          </p>
        </div>

        <Link
          to="/dashboard/admin/register-organisation?type=pharmacy"
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Pharmacy</span>
        </Link>
      </div>

      {/* Search & Actions Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search pharmacy name, locality, or licence number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Licence Verified</option>
            <option value="pending">Pending Verification</option>
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
            onClick={fetchPharmacies}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-7 h-7 text-amber-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading pharmacies...</p>
        </div>
      ) : filteredPharmacies.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Pill className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No pharmacies found matching criteria</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Pharmacy & ID</th>
                  <th className="py-3 px-3">Drug Licence</th>
                  <th className="py-3 px-3">Licence Validity</th>
                  <th className="py-3 px-3">Locality & Phone</th>
                  <th className="py-3 px-3">SaaS Plan</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Licence Status</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPharmacies.map(pharm => {
                  const isActive = pharm.account_status !== 'suspended' && pharm.is_active !== false;
                  const isVerified = pharm.verification_status === 'verified';

                  return (
                    <tr key={pharm.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pharm.logo_url || 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=100&q=80'}
                            alt={pharm.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{pharm.name}</div>
                            <div className="text-[10px] font-mono text-amber-600 font-semibold">{pharm.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {pharm.license_number}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-700">
                          {pharm.license_validity || '2028-06-30'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{pharm.locality || pharm.area}, {pharm.pincode}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{pharm.phone}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 capitalize border border-amber-200">
                          {(pharm.subscription_plan || 'Pharmacy Pro').replace('_', ' ')}
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
                          {pharm.verification_status || 'verified'}
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
                          <button
                            onClick={() => { setSelectedPharmacy(pharm); setModalMode('view'); }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="View Pharmacy Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(pharm)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Edit Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenVerify(pharm)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                            title="Verify Drug Licence"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/dashboard/admin/billing?org_type=pharmacy`}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            title="View Payments"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleToggleAccountStatus(pharm.id, pharm.account_status || (pharm.is_active ? 'active' : 'suspended'))}
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
          {filteredPharmacies.map(pharm => {
            const isActive = pharm.account_status !== 'suspended' && pharm.is_active !== false;

            return (
              <div key={pharm.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={pharm.logo_url || 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=100&q=80'}
                      alt={pharm.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 font-mono block">{pharm.id}</span>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">{pharm.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">Lic: {pharm.license_number}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isActive ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{pharm.locality || pharm.area}, {pharm.city || 'Hyderabad'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{pharm.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Validity: {pharm.license_validity || '2028-06-30'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(pharm)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-center font-bold text-xs hover:bg-slate-200 transition"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleOpenVerify(pharm)}
                    className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition"
                  >
                    Verify Licence
                  </button>
                  <button
                    onClick={() => handleToggleAccountStatus(pharm.id, pharm.account_status || (pharm.is_active ? 'active' : 'suspended'))}
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

      {/* VIEW DETAILS MODAL */}
      {modalMode === 'view' && selectedPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Pharmacy Dossier</h3>
              <button onClick={() => setModalMode(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <img src={selectedPharmacy.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedPharmacy.name}</h4>
                  <p className="font-mono text-amber-600 font-bold">{selectedPharmacy.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div><span className="text-slate-400 block text-[10px]">Licence No</span> <span className="font-mono font-bold text-slate-800">{selectedPharmacy.license_number}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Validity</span> <span className="font-bold text-slate-800">{selectedPharmacy.license_validity || '2028-06-30'}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Phone</span> <span className="font-bold text-slate-800">{selectedPharmacy.phone}</span></div>
                <div><span className="text-slate-400 block text-[10px]">PIN Code</span> <span className="font-bold text-slate-800">{selectedPharmacy.pincode}</span></div>
                <div className="col-span-2"><span className="text-slate-400 block text-[10px]">Full Address</span> <span className="font-medium text-slate-700">{selectedPharmacy.address}, {selectedPharmacy.locality || selectedPharmacy.area}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Coordinates</span> <span className="font-mono text-slate-600">{selectedPharmacy.latitude || selectedPharmacy.coordinates?.lat}, {selectedPharmacy.longitude || selectedPharmacy.coordinates?.lng}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Licence Status</span> <span className="font-bold text-emerald-600 capitalize">{selectedPharmacy.verification_status || 'Verified'}</span></div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {modalMode === 'edit' && selectedPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Update Pharmacy Details</h3>
              <button type="button" onClick={() => setModalMode(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Pharmacy Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Drug Licence No</label>
                  <input
                    type="text"
                    required
                    value={editForm.license_number}
                    onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Licence Validity Date</label>
                  <input
                    type="date"
                    required
                    value={editForm.license_validity}
                    onChange={(e) => setEditForm({ ...editForm, license_validity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Locality / Area</label>
                  <input
                    type="text"
                    required
                    value={editForm.locality}
                    onChange={(e) => setEditForm({ ...editForm, locality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-sm">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VERIFY LICENCE MODAL */}
      {modalMode === 'verify' && selectedPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSaveVerify} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-lg font-black text-slate-900">Verify State Drug Licence</h3>
              </div>
              <button type="button" onClick={() => setModalMode(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Validating compliance for <span className="font-bold text-slate-800">{selectedPharmacy.name}</span> ({selectedPharmacy.id}).
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Confirmed Licence Number</label>
                <input
                  type="text"
                  required
                  value={editForm.license_number}
                  onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Licence Expiry / Validity Date</label>
                <input
                  type="date"
                  required
                  value={editForm.license_validity}
                  onChange={(e) => setEditForm({ ...editForm, license_validity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Verification Remarks</label>
                <textarea
                  rows={2}
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none text-xs"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={() => setModalMode(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Verified</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
