import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Tag, Search, Sparkles, Building2, Stethoscope, ArrowRight, Calendar, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const OffersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orgFilter = searchParams.get('organization_id') || searchParams.get('org') || '';

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState(null);

  const categories = ['All', 'Health Package', 'Cardiac Care', 'Senior Care', 'Chronic Disease', 'Women Health', 'Endocrinology', 'Orthopedics', 'Child Care', 'Dermatology'];

  useEffect(() => {
    const params = {};
    if (orgFilter) params.organization_id = orgFilter;
    
    api.getPublishedOffers(params).then(data => {
      let list = data || [];
      if (orgFilter) {
        list = list.filter(o => o.organization_id === orgFilter);
      }
      setOffers(list);
    }).finally(() => setLoading(false));
  }, [orgFilter]);

  const filteredOffers = offers.filter(o => {
    const catMatch = selectedCategory === 'All' || o.category?.toLowerCase() === selectedCategory.toLowerCase();
    const orgMatch = !orgFilter || o.organization_id === orgFilter;
    return catMatch && orgMatch;
  });

  const targetOrgName = filteredOffers[0]?.organization_name || (orgFilter ? 'Healthcare Provider' : null);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-600">
              <Tag className="w-4 h-4" />
              <span>{orgFilter ? 'PROVIDER-SPECIFIC CAMPAIGNS' : 'PUBLISHED HEALTHCARE CAMPAIGNS'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {orgFilter && targetOrgName ? `${targetOrgName} Offers` : 'Healthcare Packages & Diagnostic Offers'}
            </h1>
            <p className="text-xs text-slate-500">
              {orgFilter 
                ? `Exclusive verified promotional packages published exclusively by ${targetOrgName}.`
                : 'Official promotional packages verified and approved across participating Hyderabad healthcare providers'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {orgFilter && (
              <button
                onClick={() => setSearchParams({})}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                View All Provider Offers
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500">{filteredOffers.length} Active Packages</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === c
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading promotional packages...</div>
        ) : filteredOffers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <Tag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No active offers found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no published promotional packages matching this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map(offer => (
              <div key={offer.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                      {offer.discount_percentage || Math.round(((offer.original_price - offer.discounted_price) / offer.original_price) * 100)}% OFF
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{offer.category}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">{offer.title}</h3>
                  
                  <p className="text-xs font-bold text-blue-700 flex items-center gap-1">
                    {offer.organization_type === 'hospital' ? <Building2 className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                    <span>{offer.organization_name}</span>
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{offer.description}</p>

                  {/* Validity Info */}
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Valid until: {offer.end_date || offer.valid_until || '2027-12-31'}</span>
                  </div>

                  {offer.terms && (
                    <p className="text-[10px] text-slate-400 italic">Terms: {offer.terms}</p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-1.5">₹{offer.original_price}</span>
                    <span className="text-xl font-black text-slate-900">₹{offer.discounted_price}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOfferForDetails(offer)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setBookingModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Offer Details Modal */}
      {selectedOfferForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Offer Details</span>
              <button onClick={() => setSelectedOfferForDetails(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {selectedOfferForDetails.discount_percentage}% OFF
              </span>
              <h3 className="font-extrabold text-lg text-slate-900 mt-2">{selectedOfferForDetails.title}</h3>
              <p className="text-xs font-bold text-blue-700 mt-1">{selectedOfferForDetails.organization_name}</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedOfferForDetails.description}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Original Price:</span>
                <span className="line-through text-slate-400">₹{selectedOfferForDetails.original_price}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>Offer Price:</span>
                <span className="text-rose-600">₹{selectedOfferForDetails.discounted_price}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px] text-amber-800">
                <span>Valid Until:</span>
                <span>{selectedOfferForDetails.end_date || '2027-12-31'}</span>
              </div>
            </div>
            {selectedOfferForDetails.terms && (
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/50 text-[11px] text-amber-900">
                <strong>Terms & Conditions:</strong> {selectedOfferForDetails.terms}
              </div>
            )}
            <button
              onClick={() => {
                setSelectedOfferForDetails(null);
                setBookingModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
            >
              Book This Package
            </button>
          </div>
        </div>
      )}

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};
