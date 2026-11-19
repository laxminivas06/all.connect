import React, { useState } from 'react';
import {
  Tag,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  PauseCircle,
  PlayCircle,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const PromotionsTab = ({
  offers = [],
  onRefresh
}) => {
  const [filterView, setFilterView] = useState('all'); // 'all' | 'published' | 'expired'
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'Preventive Healthcare',
    description: '',
    original_price: 3000,
    discounted_price: 1499,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '2027-06-30',
    applicable_departments: ['General Medicine'],
    terms: 'Advance booking required. Non-refundable.'
  });

  const filteredOffers = offers.filter(o => {
    if (filterView === 'published') return o.workflow_status === 'published';
    if (filterView === 'expired') return o.workflow_status === 'expired' || o.workflow_status === 'suspended';
    return true;
  });

  const handleOpenCreate = () => {
    setEditingOfferId(null);
    setForm({
      title: '',
      category: 'Preventive Healthcare',
      description: 'Comprehensive discount package for preventive screening.',
      original_price: 3000,
      discounted_price: 1499,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '2027-06-30',
      applicable_departments: ['General Medicine'],
      terms: 'Advance booking required. Non-refundable.'
    });
    setPromoModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOfferId(offer.id);
    setForm({
      title: offer.title || '',
      category: offer.category || 'Preventive Healthcare',
      description: offer.description || '',
      original_price: offer.original_price || 3000,
      discounted_price: offer.discounted_price || 1499,
      start_date: offer.start_date || new Date().toISOString().split('T')[0],
      end_date: offer.end_date || '2027-06-30',
      applicable_departments: offer.applicable_departments || ['General Medicine'],
      terms: offer.terms || ''
    });
    setPromoModalOpen(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setPromoLoading(true);
    try {
      if (editingOfferId) {
        await api.updateOffer(editingOfferId, form);
      } else {
        await api.createOffer(form);
      }
      setPromoModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error saving campaign');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleToggleSuspend = async (offer) => {
    const nextStatus = offer.workflow_status === 'published' ? 'expired' : 'published';
    try {
      await api.updateOfferStatus(offer.id, { workflow_status: nextStatus });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error updating promotion status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    try {
      await api.deleteOffer(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error deleting promotion');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          {[
            { key: 'all', label: `All Promotions (${offers.length})` },
            { key: 'published', label: 'Published / Live' },
            { key: 'expired', label: 'Expired / Suspended' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterView(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterView === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 self-start sm:self-auto transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Promotion</span>
        </button>
      </div>

      {/* Promotions Cards Grid */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No promotions found</h4>
          <p className="text-xs text-slate-400 mt-1">Publish self-service offers to attract patients from the central marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    {o.discount_percentage || 50}% OFF
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    o.workflow_status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {o.workflow_status === 'published' ? 'Live / Published' : 'Suspended / Expired'}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{o.title}</h4>
                <span className="text-[11px] font-semibold text-blue-700 block">{o.category}</span>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{o.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-baseline space-x-2">
                  <span className="text-lg font-black text-slate-900">₹{o.discounted_price}</span>
                  <span className="text-xs text-slate-400 line-through">₹{o.original_price}</span>
                </div>

                <div className="text-[11px] text-slate-400">
                  <p>Valid: {o.start_date} to {o.end_date}</p>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleSuspend(o)}
                  className={`text-xs font-bold flex items-center gap-1 ${
                    o.workflow_status === 'published' ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'
                  }`}
                >
                  {o.workflow_status === 'published' ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Reactivate</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(o)}
                    className="text-xs font-bold text-slate-700 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Promotion */}
      {promoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                {editingOfferId ? 'Edit Promotional Offer' : 'Launch New Promotional Campaign'}
              </h3>
              <button onClick={() => setPromoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 50% Off Cardiac & Diabetes Screening Package"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discounted Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.discounted_price}
                    onChange={(e) => setForm({ ...form, discounted_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Terms & Conditions</label>
                <input
                  type="text"
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPromoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  {promoLoading ? 'Publishing...' : editingOfferId ? 'Update Offer' : 'Publish Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
