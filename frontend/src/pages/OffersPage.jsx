import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Tag,
  Search,
  Sparkles,
  Building2,
  Stethoscope,
  ArrowRight,
  Calendar,
  AlertCircle,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Percent,
  MapPin,
  Clock,
  Filter,
  CheckCircle2,
  ExternalLink,
  Flame
} from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

const OFFER_CATEGORY_BANNERS = {
  'Health Package': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  'Cardiac Care': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  'Senior Care': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
  'Chronic Disease': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
  'Women Health': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
  'Endocrinology': 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1200&q=80',
  'Orthopedics': 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
  'Child Care': 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=1200&q=80',
  'Dermatology': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
  'Default': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
};

const getOfferBanner = (offer) => {
  if (offer?.banner_image) return offer.banner_image;
  if (offer?.image_url) return offer.image_url;
  return OFFER_CATEGORY_BANNERS[offer?.category] || OFFER_CATEGORY_BANNERS['Default'];
};

export const OffersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orgFilter = searchParams.get('organization_id') || searchParams.get('org') || '';

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'hospital' | 'clinic'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Pop-up States
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCarouselIndex, setAdCarouselIndex] = useState(0);
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState(null);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedOrgForBooking, setSelectedOrgForBooking] = useState(null);

  const categories = ['All', 'Health Package', 'Cardiac Care', 'Senior Care', 'Chronic Disease', 'Women Health', 'Endocrinology', 'Orthopedics', 'Child Care', 'Dermatology'];
  const areas = ['All', 'Malkajgiri', 'Secunderabad', 'Uppal', 'Tarnaka', 'Nacharam', 'Begumpet', 'Jubilee Hills', 'Banjara Hills', 'Somajiguda'];

  useEffect(() => {
    fetchOffers();
  }, [orgFilter]);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (orgFilter) params.organization_id = orgFilter;
      const data = await api.getPublishedOffers(params);
      let list = (data || []).filter(o => o && o.workflow_status === 'published' && o.organization_type !== 'pharmacy');
      if (orgFilter) {
        list = list.filter(o => o.organization_id === orgFilter);
      }
      setOffers(list);

      // Check if advertisement popup has been seen in this browser session
      const adSeen = sessionStorage.getItem('allconnect_offers_ad_seen_v2');
      const featured = list.filter(o => o.featured);
      if (!adSeen && featured.length > 0 && !orgFilter) {
        setAdModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load published offers:', err);
      setError(err.message || 'Failed to retrieve published promotional campaigns.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAd = () => {
    sessionStorage.setItem('allconnect_offers_ad_seen_v2', 'true');
    setAdModalOpen(false);
  };

  // Featured Offers for controlled carousel ad popup
  const featuredOffers = offers.filter(o => o.featured);
  const activeAd = featuredOffers[adCarouselIndex] || featuredOffers[0] || offers[0];

  const handleNextAd = (e) => {
    if (e) e.stopPropagation();
    if (featuredOffers.length > 1) {
      setAdCarouselIndex((prev) => (prev + 1) % featuredOffers.length);
    }
  };

  const handlePrevAd = (e) => {
    if (e) e.stopPropagation();
    if (featuredOffers.length > 1) {
      setAdCarouselIndex((prev) => (prev - 1 + featuredOffers.length) % featuredOffers.length);
    }
  };

  // Filtered offers for browsing section
  const filteredOffers = offers.filter(o => {
    if (!o) return false;
    const typeMatch = typeFilter === 'All' || (o.organization_type || '').toLowerCase() === typeFilter.toLowerCase();
    const catMatch = selectedCategory === 'All' || (o.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const areaMatch = selectedArea === 'All' || (o.area || '').toLowerCase().includes(selectedArea.toLowerCase());
    const orgMatch = !orgFilter || o.organization_id === orgFilter;
    
    let searchMatch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = String(o.title || '').toLowerCase().includes(q);
      const orgNameMatch = String(o.organization_name || '').toLowerCase().includes(q);
      const descMatch = String(o.description || '').toLowerCase().includes(q);
      searchMatch = titleMatch || orgNameMatch || descMatch;
    }
    return typeMatch && catMatch && areaMatch && orgMatch && searchMatch;
  });

  const targetOrgName = filteredOffers[0]?.organization_name || (orgFilter ? 'Healthcare Provider' : null);

  const handleBookOffer = (offer) => {
    const orgObj = {
      id: offer.organization_id,
      name: offer.organization_name,
      organization_type: offer.organization_type
    };
    setSelectedOrgForBooking(orgObj);
    setSelectedOfferForDetails(null);
    setAdModalOpen(false);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-600">
              <Flame className="w-4 h-4 fill-rose-600 text-rose-600 animate-pulse" />
              <span>{orgFilter ? 'EXCLUSIVE FACILITY CAMPAIGN' : 'FEATURED HEALTHCARE PROMOTIONS'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {orgFilter && targetOrgName ? `${targetOrgName} Offers` : 'Speciality Packages & Diagnostic Offers'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {orgFilter 
                ? `Exclusive verified promotional packages published exclusively by ${targetOrgName}.`
                : 'Verified seasonal diagnostic health checkups and clinical treatment packages across Hyderabad.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {featuredOffers.length > 0 && !orgFilter && (
              <button
                onClick={() => setAdModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Ad ({featuredOffers.length})</span>
              </button>
            )}

            {orgFilter && (
              <button
                onClick={() => setSearchParams({})}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Show All Providers
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500 px-2 py-1 bg-white rounded-lg border border-slate-200">
              {filteredOffers.length} Active Packages
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          
          {/* Top Filter Row: Type Pills & Search Box */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Type Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              {[
                { id: 'All', label: 'All Offers' },
                { id: 'hospital', label: 'Hospital Packages', icon: Building2 },
                { id: 'clinic', label: 'Clinic Offers', icon: Stethoscope }
              ].map(tab => {
                const isSelected = typeFilter === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTypeFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search packages, checkups, or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Filter Row: Category Pills & Location Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition ${
                    selectedCategory === c
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Location Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white font-medium text-slate-700"
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a === 'All' ? 'All Locations' : a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading verified healthcare promotions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl space-y-3 max-w-lg mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-rose-900">Campaigns Temporarily Unavailable</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={fetchOffers}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
            >
              Retry Loading Offers
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOffers.length === 0 && (
          <div className="p-14 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <Tag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-lg">No promotional packages match your filter</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active offers in category &ldquo;{selectedCategory}&rdquo; for {typeFilter !== 'All' ? typeFilter : 'all providers'}.
            </p>
            <button
              onClick={() => {
                setTypeFilter('All');
                setSelectedCategory('All');
                setSelectedArea('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* OFFERS BROWSING SECTION */}
        {!loading && !error && filteredOffers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map(offer => {
              const bannerImg = getOfferBanner(offer);
              const discountPct = offer.discount_percentage || Math.round(((offer.original_price - offer.discounted_price) / offer.original_price) * 100);
              const isHospital = offer.organization_type === 'hospital';

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Card Banner Image with Badges */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                      <img
                        src={bannerImg}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          <span>{discountPct}% OFF</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/80 text-white backdrop-blur-md uppercase tracking-wider">
                          {offer.category || 'Speciality'}
                        </span>
                      </div>

                      {/* Bottom Banner Title & Provider Info */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[11px] font-bold text-blue-200 flex items-center gap-1">
                          {isHospital ? <Building2 className="w-3.5 h-3.5 text-blue-300" /> : <Stethoscope className="w-3.5 h-3.5 text-teal-300" />}
                          <span className="truncate">{offer.organization_name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Card Details Body */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-2">
                        {offer.title}
                      </h3>
                      
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {offer.description}
                      </p>

                      {/* Validity Period */}
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/60 font-semibold w-fit">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Valid until: {offer.end_date || offer.valid_until || '31 Dec 2027'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Actions Footer */}
                  <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-slate-900">₹{offer.discounted_price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{offer.original_price}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        Save ₹{offer.original_price - offer.discounted_price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOfferForDetails(offer)}
                        className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleBookOffer(offer)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition flex items-center gap-1.5"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. PREMIUM FEATURED ADVERTISEMENT-STYLE POP-UP MODAL                      */}
      {/* ========================================================================= */}
      {adModalOpen && activeAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 relative animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col justify-between">
            
            {/* Close Button - Prominent, accessible, touch-friendly */}
            <button
              onClick={handleCloseAd}
              className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center shadow-lg transition"
              aria-label="Close Advertisement"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Controlled Carousel Navigation for Multiple Ads */}
            {featuredOffers.length > 1 && (
              <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 bg-slate-900/75 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Featured {adCarouselIndex + 1} of {featuredOffers.length}</span>
              </div>
            )}

            <div>
              {/* Large Promotional Banner Image */}
              <div className="relative h-60 sm:h-72 w-full bg-slate-950 overflow-hidden">
                <img
                  src={getOfferBanner(activeAd)}
                  alt={activeAd.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Carousel Left / Right Arrows (Only if multiple featured ads) */}
                {featuredOffers.length > 1 && (
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2.5 pointer-events-none">
                    <button
                      type="button"
                      onClick={handlePrevAd}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextAd}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Floating Discount & Savings Highlight */}
                <div className="absolute bottom-4 left-5 right-5 text-white space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-md">
                      {activeAd.discount_percentage || Math.round(((activeAd.original_price - activeAd.discounted_price) / activeAd.original_price) * 100)}% DISCOUNT
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white font-extrabold text-[11px] shadow-sm">
                      Save ₹{activeAd.original_price - activeAd.discounted_price}
                    </span>
                  </div>
                  
                  {/* Provider Name */}
                  <div className="flex items-center gap-1.5 text-xs text-blue-200 font-bold pt-1">
                    {activeAd.organization_type === 'hospital' ? <Building2 className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                    <span>{activeAd.organization_name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 ml-1" />
                  </div>
                </div>
              </div>

              {/* Advertisement Copy & Value Highlights */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {activeAd.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {activeAd.description}
                  </p>
                </div>

                {/* Offer Pricing Highlight */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Special Promotional Rate</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-rose-600">₹{activeAd.discounted_price}</span>
                      <span className="text-sm text-slate-400 line-through">₹{activeAd.original_price}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Validity</span>
                    <span className="text-xs font-bold text-amber-700 flex items-center justify-end gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activeAd.end_date || activeAd.valid_until || '31 Dec 2027'}</span>
                    </span>
                  </div>
                </div>

                {activeAd.terms && (
                  <p className="text-[11px] text-slate-400 italic">
                    * Terms: {activeAd.terms}
                  </p>
                )}
              </div>
            </div>

            {/* Pop-up Action Footer */}
            <div className="p-6 pt-3 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedOfferForDetails(activeAd);
                  setAdModalOpen(false);
                }}
                className="w-full sm:w-1/2 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                View Full Inclusions
              </button>
              <button
                type="button"
                onClick={() => handleBookOffer(activeAd)}
                className="w-full sm:w-1/2 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-2"
              >
                <span>Book This Package Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL OFFER DETAILS MODAL                                                  */}
      {/* ========================================================================= */}
      {selectedOfferForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {selectedOfferForDetails.discount_percentage}% OFF
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {selectedOfferForDetails.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedOfferForDetails(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-extrabold text-xl text-slate-900">
                {selectedOfferForDetails.title}
              </h3>
              <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mt-1.5">
                {selectedOfferForDetails.organization_type === 'hospital' ? <Building2 className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                <span>{selectedOfferForDetails.organization_name}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {selectedOfferForDetails.description}
              </p>
            </div>

            {/* Inclusions and Departments */}
            {selectedOfferForDetails.applicable_departments && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Applicable Departments / Tests</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOfferForDetails.applicable_departments.map(d => (
                    <span key={d} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Standard Price:</span>
                <span className="line-through text-slate-400 font-semibold">₹{selectedOfferForDetails.original_price}</span>
              </div>
              <div className="flex justify-between font-extrabold text-base text-slate-900 border-t border-slate-200/80 pt-2">
                <span>Promotional Price:</span>
                <span className="text-rose-600">₹{selectedOfferForDetails.discounted_price}</span>
              </div>
              <div className="flex justify-between text-[11px] text-amber-800 pt-1">
                <span>Offer Validity:</span>
                <span className="font-bold">{selectedOfferForDetails.end_date || '31 Dec 2027'}</span>
              </div>
            </div>

            {selectedOfferForDetails.terms && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <strong>Terms & Conditions:</strong> {selectedOfferForDetails.terms}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedOfferForDetails(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs transition"
              >
                Close
              </button>
              <button
                onClick={() => handleBookOffer(selectedOfferForDetails)}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5"
              >
                <span>Book This Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedOrgForBooking(null);
        }}
        initialHospital={selectedOrgForBooking?.organization_type === 'hospital' ? selectedOrgForBooking : null}
        initialClinic={selectedOrgForBooking?.organization_type === 'clinic' ? selectedOrgForBooking : null}
      />
    </div>
  );
};
export default OffersPage;
