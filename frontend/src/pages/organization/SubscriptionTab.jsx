import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const SubscriptionTab = ({
  subscription = null,
  orgType = 'hospital',
  onRefresh
}) => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);

  useEffect(() => {
    setLoadingPlans(true);
    api.getSubscriptionPlans()
      .then(res => setPlans(res || []))
      .catch(console.error)
      .finally(() => setLoadingPlans(false));
  }, []);

  const planName = subscription?.plan_id || subscription?.plan_name || 'Enterprise SaaS Tier';
  const billingCycle = subscription?.billing_cycle || 'annual';
  const expiryDate = subscription?.end_date || subscription?.expires_at || '2027-11-19';
  const startDate = subscription?.start_date || subscription?.started_at || '2026-11-19';
  const status = subscription?.status || 'active';
  const doctorLimit = subscription?.doctor_limit || 25;
  const utilizedDoctors = subscription?.doctors_utilized || 2;

  // Calculate days remaining
  const daysRemaining = Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));

  const handleRenew = async () => {
    if (!confirm(`Renew subscription for another ${billingCycle === 'annual' ? '1 year' : '1 month'}?`)) return;
    setRenewLoading(true);
    try {
      await api.renewSubscription();
      alert('Subscription renewal request processed successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error renewing subscription');
    } finally {
      setRenewLoading(false);
    }
  };

  const handleRequestUpgrade = async (plan) => {
    setSelectedPlanForUpgrade(plan);
    setUpgradeModalOpen(true);
  };

  const submitUpgradeRequest = async (e) => {
    e.preventDefault();
    setUpgradeLoading(true);
    try {
      await api.requestSubscriptionUpgrade({ plan_id: selectedPlanForUpgrade.id });
      alert(`Upgrade request to ${selectedPlanForUpgrade.name} sent to Super Admin!`);
      setUpgradeModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error requesting upgrade');
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Current Active Plan Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-500/30 uppercase tracking-wide">
                Current Active Plan
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white capitalize">
              {planName.replace('_', ' ')}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Full centralized hospital discovery, autonomous patient OPD queue management, digital EHR prescriptions, and marketing campaign distribution.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Start: <strong>{startDate}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Renewal / Expiry: <strong>{expiryDate}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <span>{daysRemaining} Days Remaining</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleRenew}
              disabled={renewLoading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition"
            >
              {renewLoading ? 'Renewing...' : 'Renew Subscription'}
            </button>
            <button
              onClick={() => {
                const target = plans.find(p => p.id !== subscription?.plan_id) || plans[0];
                if (target) handleRequestUpgrade(target);
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
            >
              Request Plan Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Plan Quotas & Utilization */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">Doctor Specialists Limit</span>
            <span className="font-extrabold text-blue-700">{utilizedDoctors} / {doctorLimit}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${Math.min(100, (utilizedDoctors / doctorLimit) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block">{doctorLimit - utilizedDoctors} slots available for expansion</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">Monthly Appointments Cap</span>
            <span className="font-extrabold text-emerald-700">Unlimited</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          </div>
          <span className="text-[10px] text-slate-400 block">Zero per-booking transaction charges</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">Billing Cycle</span>
            <span className="font-extrabold text-purple-700 capitalize">{billingCycle} Billing</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-full" />
          </div>
          <span className="text-[10px] text-slate-400 block">Auto-renewal enabled for uninterrupted listing</span>
        </div>
      </div>

      {/* Available Tiers in Marketplace */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Compare Platform Subscription Tiers</h3>
        <p className="text-xs text-slate-500">Review upgrade options designed specifically for healthcare providers in Hyderabad.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {p.type?.toUpperCase()}
                </span>
                <h4 className="font-extrabold text-base text-slate-900">{p.name}</h4>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">₹{p.monthly_price?.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold block">₹{p.annual_price?.toLocaleString()} billed annually</span>

                <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Up to {p.doctor_limit || 15} specialist doctor accounts</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Centralized patient discovery & search indexing</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Autonomous promotional packages distribution</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>HIPAA/ABDM digital prescription synchronization</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleRequestUpgrade(p)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 font-bold text-xs transition"
              >
                Request This Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Upgrade Request */}
      {upgradeModalOpen && selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-base text-slate-900">
              Confirm Upgrade Request: {selectedPlanForUpgrade.name}
            </h3>
            <p className="text-xs text-slate-500">
              Platform administration will review your request and invoice the pro-rated difference.
            </p>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 space-y-1">
              <div className="flex justify-between font-bold">
                <span>Selected Plan:</span>
                <span>{selectedPlanForUpgrade.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Pricing:</span>
                <span className="font-bold">₹{selectedPlanForUpgrade.monthly_price}</span>
              </div>
              <div className="flex justify-between">
                <span>Doctor Specialists Cap:</span>
                <span className="font-bold">{selectedPlanForUpgrade.doctor_limit || 20} Doctors</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={submitUpgradeRequest}
                disabled={upgradeLoading}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                {upgradeLoading ? 'Submitting...' : 'Submit Upgrade Request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
