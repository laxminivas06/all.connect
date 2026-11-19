import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tag, Search, Sparkles, Building2, Stethoscope, ArrowRight } from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const categories = ['All', 'Health Package', 'Cardiac Care', 'Senior Care', 'Chronic Disease', 'Women Health', 'Endocrinology', 'Orthopedics', 'Child Care', 'Dermatology'];

  useEffect(() => {
    api.getPublishedOffers().then(data => {
      setOffers(data);
    }).finally(() => setLoading(false));
  }, []);

  const filteredOffers = offers.filter(o => {
    return selectedCategory === 'All' || o.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-600">
              <Tag className="w-4 h-4" />
              <span>PUBLISHED HOSPITAL & CLINIC CAMPAIGNS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Healthcare Packages & Diagnostic Offers</h1>
            <p className="text-xs text-slate-500">Official promotional packages verified and approved across participating Hyderabad healthcare providers</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{filteredOffers.length} Active Packages</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                    {offer.discount_percentage}% OFF
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{offer.category}</span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug">{offer.title}</h3>
                
                <p className="text-xs font-bold text-blue-700 flex items-center gap-1">
                  {offer.organization_type === 'hospital' ? <Building2 className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                  <span>{offer.organization_name}</span>
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">{offer.description}</p>

                {offer.terms && (
                  <p className="text-[10px] text-slate-400 italic">Terms: {offer.terms}</p>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through mr-1.5">₹{offer.original_price}</span>
                  <span className="text-xl font-black text-slate-900">₹{offer.discounted_price}</span>
                </div>

                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition"
                >
                  Book Package
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};
