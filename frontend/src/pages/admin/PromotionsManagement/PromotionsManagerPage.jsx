import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  Percent,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  Pill,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';

export const PromotionsManagerPage = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, hospital, clinic, pharmacy, flagged
  const [search, setSearch] = useState('');

  const fetchPromotions = () => {
    setLoading(true);
    api.getAdminAdvertisements()
      .then(res => setAdvertisements(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSuspendForPolicy = async (offerId) => {
    const confirmAction = window.confirm('Are you sure you want to suspend this promotional campaign for a policy or legal violation?');
    if (!confirmAction) return;

    try {
      await api.moderateAdvertisement(offerId, 'suspend');
      alert('Campaign suspended for policy review.');
      fetchPromotions();
    } catch (err) {
      alert(err.message || 'Error updating promotion status');
    }
  };

  const handleReactivate = async (offerId) => {
    try {
      await api.moderateAdvertisement(offerId, 'approve');
      alert('Campaign restored.');
      fetchPromotions();
    } catch (err) {
      alert(err.message || 'Error restoring campaign');
    }
  };

  // Metrics
  const activeCampaigns = advertisements.filter(a => a.workflow_status === 'published' || a.workflow_status === 'active');
  const distinctOrgs = new Set(advertisements.map(a => a.organization_id)).size;
  const avgDiscount = advertisements.length > 0
    ? Math.round(advertisements.reduce((acc, curr) => acc + (curr.discount_percentage || 0), 0) / advertisements.length)
    : 35;
  const suspendedCount = advertisements.filter(a => a.workflow_status === 'expired' || a.workflow_status === 'rejected').length;

  const filteredAds = advertisements.filter(ad => {
    const matchesSearch =
      ad.title?.toLowerCase().includes(search.toLowerCase()) ||
      ad.organization_name?.toLowerCase().includes(search.toLowerCase()) ||
      ad.category?.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;
    if (filterType === 'hospital') matchesFilter = ad.organization_type === 'hospital' || ad.organization_id?.startsWith('hosp');
    else if (filterType === 'clinic') matchesFilter = ad.organization_type === 'clinic' || ad.organization_id?.startsWith('clinic');
    else if (filterType === 'pharmacy') matchesFilter = ad.organization_type === 'pharmacy' || ad.organization_id?.startsWith('pharm');
    else if (filterType === 'flagged') matchesFilter = ad.workflow_status === 'expired' || ad.workflow_status === 'rejected';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-500" />
              INDEPENDENT PROVIDER CAMPAIGNS
            </span>
            <span className="text-xs text-slate-400">• Policy Oversight</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Platform Promotions & Advertisements Monitor
          </h1>
          <p className="text-xs text-slate-500">
            Hospitals, clinics, and pharmacies independently create and publish their own health packages and promotional offers. Super Admin monitors platform advertising for compliance with truth-in-advertising standards.
          </p>
        </div>

        <button
          onClick={fetchPromotions}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Refresh Feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Policy Governance Info Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Autonomous Organisation Publishing</span>
          <span className="text-blue-800/90 text-[11px]">
            Organisations control their own promotional packages and publish directly to the public marketplace without prior Super Admin bottleneck approval. Moderation and removal capabilities are strictly reserved for reported policy violations or statutory requirements.
          </span>
        </div>
      </div>

      {/* Platform Advertising KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Active Campaigns</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{activeCampaigns.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Live in Patient Marketplace</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Advertising Providers</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{distinctOrgs}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Hospitals, clinics & stores</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Avg. Package Discount</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{avgDiscount}%</p>
          <span className="text-[10px] text-slate-500 font-semibold">Preventive health savings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Policy Suspended</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{suspendedCount}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Flagged or expired</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'all', label: `All Campaigns (${advertisements.length})` },
            { key: 'hospital', label: 'Hospital Offers' },
            { key: 'clinic', label: 'Clinic Packages' },
            { key: 'pharmacy', label: 'Pharmacy Deals' },
            { key: 'flagged', label: `Policy Suspended (${suspendedCount})` }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterType === t.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search campaigns by title, provider, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Campaigns Listing */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading promotions...</p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Tag className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No promotional campaigns found matching filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAds.map(ad => {
            const isSuspended = ad.workflow_status === 'expired' || ad.workflow_status === 'rejected';

            return (
              <div key={ad.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3.5 hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {ad.category || 'Preventive Health'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSuspended ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                      {isSuspended ? 'Suspended' : 'Live & Published'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 mt-2 leading-snug">
                    {ad.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{ad.organization_name}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {ad.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block line-through">₹{ad.original_price?.toLocaleString()}</span>
                      <span className="text-base font-black text-slate-900">₹{ad.discounted_price?.toLocaleString()}</span>
                    </div>
                    <span className="px-2 py-1 rounded-xl bg-purple-50 text-purple-700 font-extrabold text-xs">
                      {ad.discount_percentage || 30}% OFF
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Valid: {ad.start_date || '2026-02-01'} to {ad.end_date || '2026-12-31'}</span>
                    <span className="font-mono text-[10px]">{ad.id}</span>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    {isSuspended ? (
                      <button
                        onClick={() => handleReactivate(ad.id)}
                        className="w-full py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                      >
                        Restore Campaign
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspendForPolicy(ad.id)}
                        className="w-full py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Suspend for Policy Violation</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
