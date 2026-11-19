import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  CreditCard,
  Building2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Edit,
  DollarSign,
  ShieldCheck,
  Check
} from 'lucide-react';

export const HospitalSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [newPlan, setNewPlan] = useState('hospital_enterprise');
  const [newStatus, setNewStatus] = useState('active');

  const fetchSubscriptions = () => {
    setLoading(true);
    Promise.all([
      api.getAdminSubscriptions(),
      api.getAdminOrganizations()
    ]).then(([subsRes, orgsRes]) => {
      const hospSubs = (subsRes || []).filter(s => s.organization_id?.startsWith('hosp') || s.organization_type === 'Hospital');
      setSubscriptions(hospSubs);
      setHospitals((orgsRes || []).filter(o => o.id?.startsWith('hosp')));
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleUpdateSubscription = async () => {
    if (!selectedSub) return;
    try {
      await api.overrideOrgSubscription(selectedSub.organization_id, {
        plan_id: newPlan,
        status: newStatus,
        billing_cycle: selectedSub.billing_cycle || 'annual'
      });
      alert('Subscription successfully updated.');
      setSelectedSub(null);
      fetchSubscriptions();
    } catch (err) {
      alert(err.message || 'Error updating subscription');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <Link
            to="/dashboard/admin/hospitals"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Hospitals</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              SAAS REVENUE TIERS
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Hospital Subscription Management
          </h1>
          <p className="text-xs text-slate-500">
            Control software license tiers, annual renewals, seat limits, and feature toggles independently from verification status
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading subscription ledger...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Hospital Entity</th>
                  <th className="py-3 px-3">Current Plan</th>
                  <th className="py-3 px-3">Billing Cycle</th>
                  <th className="py-3 px-3">Amount Paid</th>
                  <th className="py-3 px-3">License Expiry</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map(sub => {
                  const isActive = sub.status === 'active';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{sub.organization_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">Org ID: {sub.organization_id}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 capitalize border border-purple-100">
                          {sub.plan_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 capitalize font-semibold text-slate-700">
                        {sub.billing_cycle || 'annual'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        ₹{(sub.amount_paid || 299999)?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono">
                        {sub.expires_at || '2027-01-10'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isActive ? 'Active (Paid)' : sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setNewPlan(sub.plan_id);
                            setNewStatus(sub.status);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition"
                        >
                          Modify Plan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modify Plan Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Modify Software SaaS Tier</h3>
                <p className="text-xs text-slate-500">{selectedSub.organization_name}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select SaaS Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 outline-none"
                >
                  <option value="hospital_enterprise">Hospital Enterprise (₹29,999 / mo - 100 Doctors)</option>
                  <option value="hospital_standard">Hospital Standard (₹14,999 / mo - 30 Doctors)</option>
                  <option value="clinic_pro">Clinic Pro (₹4,999 / mo - 5 Doctors)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">License Account Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 outline-none"
                >
                  <option value="active">Active & In Good Standing</option>
                  <option value="pending_payment">Payment Pending</option>
                  <option value="trial">Comped / Evaluation Trial</option>
                  <option value="expired">Expired / Grace Period</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubscription}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white transition"
              >
                Update Subscription
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
