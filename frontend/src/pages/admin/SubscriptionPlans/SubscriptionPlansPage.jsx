import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
  CreditCard,
  PlusCircle,
  Edit,
  CheckCircle2,
  DollarSign,
  Users,
  Check,
  Calendar,
  RefreshCw,
  Sparkles,
  Building2,
  Stethoscope,
  Pill,
  Trash2,
  AlertCircle,
  Clock,
  Search,
  ArrowUpDown,
  X
} from 'lucide-react';

export const SubscriptionPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'active_subs'
  const [planFilter, setPlanFilter] = useState('all'); // 'all', 'hospital', 'clinic', 'pharmacy'
  const [subFilter, setSubFilter] = useState('all'); // 'all', 'active', 'expired', 'pending'
  const [subSearch, setSubSearch] = useState('');
  const [editingPlan, setEditingPlan] = useState(null);
  const [managingSub, setManagingSub] = useState(null);

  const fetchPlansData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminPlans(),
      api.getAdminSubscriptions()
    ]).then(([plansRes, subsRes]) => {
      setPlans(plansRes || []);
      setSubscriptions(subsRes || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlansData();
  }, []);

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      if (editingPlan.isNew) {
        await api.createAdminPlan(editingPlan);
      } else {
        await api.updateAdminPlan(editingPlan.id, editingPlan);
      }
      alert('Subscription plan successfully saved');
      setEditingPlan(null);
      fetchPlansData();
    } catch (err) {
      alert(err.message || 'Error saving plan');
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    const confirmDel = window.confirm(`Are you sure you want to delete or deactivate the plan "${planName}"?`);
    if (!confirmDel) return;

    try {
      await api.deleteAdminPlan(planId);
      alert(`Plan "${planName}" successfully deleted.`);
      fetchPlansData();
    } catch (err) {
      alert(err.message || 'Error deleting plan');
    }
  };

  const handleUpdateSubStatus = async (e) => {
    e.preventDefault();
    if (!managingSub) return;

    try {
      await api.updateSubscriptionStatus(managingSub.id, {
        status: managingSub.status,
        expires_at: managingSub.expires_at,
        renewal_date: managingSub.expires_at
      });
      alert('Subscription status and renewal date updated successfully');
      setManagingSub(null);
      fetchPlansData();
    } catch (err) {
      alert(err.message || 'Error updating subscription status');
    }
  };

  const filteredPlans = plans.filter(p => {
    if (planFilter === 'all') return true;
    const planType = (p.type || '').toLowerCase();
    return planType.includes(planFilter.toLowerCase());
  });

  const filteredSubs = subscriptions.filter(s => {
    const matchesSearch =
      s.organization_name?.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.organization_id?.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.plan_id?.toLowerCase().includes(subSearch.toLowerCase());

    const isExpired = s.status === 'expired' || (s.expires_at && new Date(s.expires_at) < new Date());
    let matchesStatus = true;
    if (subFilter === 'active') matchesStatus = s.status === 'active' && !isExpired;
    else if (subFilter === 'expired') matchesStatus = isExpired || s.status === 'expired';
    else if (subFilter === 'pending') matchesStatus = s.status === 'pending_payment';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
              SAAS REVENUE & SUBSCRIPTION GOVERNANCE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Subscription Plans & Provider Subscriptions
          </h1>
          <p className="text-xs text-slate-500">
            Configure software tiers, pricing, features, and renewal lifecycles across Hospitals, Clinics, and Pharmacies.
          </p>
        </div>

        <button
          onClick={() => setEditingPlan({
            isNew: true,
            id: `plan-custom-${Date.now()}`,
            name: 'New Custom Tier',
            type: 'hospital',
            monthly_price: 19999,
            annual_price: 199999,
            duration_months: 12,
            doctor_limit: 40,
            staff_limit: 50,
            appointment_limit: 5000,
            features: ['Marketplace Listing', 'OPD Queue Display', 'Digital Rx Writer', 'Financial Reports'],
            description: 'Custom multi-speciality healthcare tier configured by Super Admin'
          })}
          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'plans' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Configured Plans ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab('active_subs')}
            className={`px-4 py-2 rounded-xl transition ${activeTab === 'active_subs' ? 'bg-purple-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Subscribed Organisations ({subscriptions.length})
          </button>
        </div>

        {/* Sub-Filters for Plans */}
        {activeTab === 'plans' && (
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] mr-1">Filter Type:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'hospital', label: 'Hospitals' },
              { id: 'clinic', label: 'Clinics' },
              { id: 'pharmacy', label: 'Pharmacies' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPlanFilter(tab.id)}
                className={`px-3 py-1 rounded-lg transition ${planFilter === tab.id ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Sub-Filters for Subscribed Orgs */}
        {activeTab === 'active_subs' && (
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] mr-1">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'expired', label: 'Expired / Due' },
              { id: 'pending', label: 'Pending Payment' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSubFilter(tab.id)}
                className={`px-3 py-1 rounded-lg transition ${subFilter === tab.id ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: PLANS CONFIGURATION CARDS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(p => {
            const planType = (p.type || 'hospital').toLowerCase();
            const isHosp = planType.includes('hospital');
            const isClinic = planType.includes('clinic');
            const isPharm = planType.includes('pharmacy');

            return (
              <div key={p.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4 hover:shadow-md transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isHosp ? 'bg-blue-50 text-blue-700' : isClinic ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.type || 'General Tier'}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{p.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </div>

                  <div className="space-y-0.5 pt-1">
                    <span className="text-2xl font-black text-slate-900">₹{p.monthly_price?.toLocaleString()}</span>
                    <span className="text-xs text-slate-400"> / month</span>
                    <p className="text-[11px] text-purple-700 font-bold">Annual Pricing: ₹{p.annual_price?.toLocaleString()} / year</p>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Doctor Limit</span>
                      <span className="font-bold text-slate-800">{p.doctor_limit || 'Unlimited'} Doctors</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Staff Accounts</span>
                      <span className="font-bold text-slate-800">{p.staff_limit || 20} Staff</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Monthly Limit</span>
                      <span className="font-bold text-slate-800">{p.appointment_limit || 1000} consultations/orders</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Included Features</span>
                    {(p.features || []).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setEditingPlan(p)}
                    className="flex-1 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>
                  <button
                    onClick={() => handleDeletePlan(p.id, p.name)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                    title="Delete / Deactivate Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: SUBSCRIBED ORGANISATIONS LEDGER */}
      {activeTab === 'active_subs' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Search by organisation name, ID or plan..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              className="w-full text-xs outline-none bg-transparent"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Organisation Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Enrolled Tier</th>
                    <th className="py-3 px-3">Billing Cycle</th>
                    <th className="py-3 px-3">Amount Paid</th>
                    <th className="py-3 px-3">Renewal / Expiry Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubs.map(s => {
                    const isExpired = s.status === 'expired' || (s.expires_at && new Date(s.expires_at) < new Date());
                    const daysRemaining = s.expires_at ? Math.ceil((new Date(s.expires_at) - new Date()) / (1000 * 3600 * 24)) : 0;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{s.organization_name}</div>
                          <span className="text-[10px] font-mono text-slate-400">{s.organization_id}</span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium">{s.organization_type}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 capitalize">
                            {s.plan_id}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 capitalize font-semibold text-slate-700">{s.billing_cycle || 'annual'}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">₹{(s.amount_paid || 4999)?.toLocaleString()}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-mono text-slate-700 font-medium">{s.expires_at || '2027-01-10'}</div>
                          <span className={`text-[10px] ${daysRemaining < 30 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            s.status === 'active' && !isExpired
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isExpired || s.status === 'expired'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {isExpired ? 'Expired' : s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setManagingSub({
                              ...s,
                              status: s.status || 'active',
                              expires_at: s.expires_at || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
                            })}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-700 font-bold transition text-[11px]"
                          >
                            Update Status
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT / CREATE PLAN */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSavePlan} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingPlan.isNew ? 'Create New SaaS Software Plan' : 'Edit Plan Configuration'}
              </h3>
              <button type="button" onClick={() => setEditingPlan(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Provider Type</label>
                <select
                  value={editingPlan.type || 'hospital'}
                  onChange={(e) => setEditingPlan({ ...editingPlan, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="hospital">Hospital Tier</option>
                  <option value="clinic">Clinic Tier</option>
                  <option value="pharmacy">Pharmacy Tier</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Price (₹)</label>
                <input
                  type="number"
                  value={editingPlan.monthly_price || 0}
                  onChange={(e) => setEditingPlan({ ...editingPlan, monthly_price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-purple-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Annual Price (₹)</label>
                <input
                  type="number"
                  value={editingPlan.annual_price || 0}
                  onChange={(e) => setEditingPlan({ ...editingPlan, annual_price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-purple-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Doctor Seats Limit</label>
                <input
                  type="number"
                  value={editingPlan.doctor_limit || 10}
                  onChange={(e) => setEditingPlan({ ...editingPlan, doctor_limit: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Appointments / Orders Cap</label>
                <input
                  type="number"
                  value={editingPlan.appointment_limit || 1000}
                  onChange={(e) => setEditingPlan({ ...editingPlan, appointment_limit: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tier Summary Description</label>
              <textarea
                rows={2}
                value={editingPlan.description || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white transition"
              >
                Save Plan Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: UPDATE SUBSCRIPTION STATUS & RENEWAL DATE */}
      {managingSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateSubStatus} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Update Subscription Status
                </h3>
                <p className="text-xs text-slate-500">{managingSub.organization_name}</p>
              </div>
              <button type="button" onClick={() => setManagingSub(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subscription State</label>
                <select
                  value={managingSub.status}
                  onChange={(e) => setManagingSub({ ...managingSub, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                >
                  <option value="active">Active (Fully Paid)</option>
                  <option value="expired">Expired (Due for Renewal)</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Renewal / Expiry Date</label>
                <input
                  type="date"
                  required
                  value={managingSub.expires_at ? managingSub.expires_at.split('T')[0] : ''}
                  onChange={(e) => setManagingSub({ ...managingSub, expires_at: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
                <p className="font-bold">Subscription Info:</p>
                <p className="mt-0.5">Enrolled Plan: <span className="font-semibold">{managingSub.plan_id}</span></p>
                <p>Billing Cycle: <span className="font-semibold capitalize">{managingSub.billing_cycle || 'annual'}</span></p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setManagingSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white transition"
              >
                Save Subscription
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
