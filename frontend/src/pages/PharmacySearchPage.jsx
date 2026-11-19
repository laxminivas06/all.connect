import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Pill,
  Search,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export const PharmacySearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState([
    { name: 'Metformin 500mg SR', quantity: 2 },
    { name: 'Telmisartan 40mg', quantity: 1 }
  ]);
  const [selectedArea, setSelectedArea] = useState('Malkajgiri');
  const [prescriptionId, setPrescriptionId] = useState(null);

  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Order checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState('Store Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('Plot 42, Vani Nagar, Malkajgiri, Hyderabad');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const hyderabadAreas = ['Malkajgiri', 'Secunderabad', 'Uppal', 'Tarnaka', 'Nacharam', 'Begumpet'];

  useEffect(() => {
    // If navigated from prescription "Find Medicines Near Me"
    if (location.state?.medicines) {
      setMedicines(location.state.medicines);
      if (location.state.prescription_id) {
        setPrescriptionId(location.state.prescription_id);
      }
    }
  }, [location.state]);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', quantity: 1 }]);
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleUpdateMedicine = (idx, field, val) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };

  const handleFetchQuotations = async () => {
    const validMeds = medicines.filter(m => m.name.trim() !== '');
    if (validMeds.length === 0) {
      alert('Please specify at least one medicine');
      return;
    }

    setLoadingQuotes(true);
    try {
      const res = await api.requestQuotations({
        prescription_id: prescriptionId,
        medicines: validMeds,
        patient_area: selectedArea,
        patient_city: 'Hyderabad'
      });
      setQuotations(res.quotations);
      if (res.quotations.length > 0) {
        setSelectedQuote(res.quotations[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedQuote) return;
    setPlacingOrder(true);

    try {
      const payload = {
        pharmacy_id: selectedQuote.pharmacy_id,
        prescription_id: prescriptionId,
        items: selectedQuote.items,
        fulfillment_type: fulfillmentType,
        delivery_address: fulfillmentType === 'Home Delivery' ? deliveryAddress : null,
        notes: `Customer order via AllConnect quote engine (${selectedArea})`
      };

      const res = await api.placeOrder(payload);
      setOrderSuccess(res.order);
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600">
            <Pill className="w-4 h-4" />
            <span>CENTRALIZED PHARMACY DISCOVERY & QUOTATION ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Prescription Medicine Price Comparison</h1>
          <p className="text-xs text-slate-500">Discover stock availability and compare live price quotations across 10 registered pharmacies in Hyderabad</p>
        </div>

        {/* Input Medicines Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Prescribed Medicines List</span>
              </h2>
              <p className="text-xs text-slate-500">Add medicines manually or import from your digital prescription locker</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">Your Area:</span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white font-semibold text-slate-700"
              >
                {hyderabadAreas.map(a => (
                  <option key={a} value={a}>{a}, Hyderabad</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {medicines.map((m, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Medicine name (e.g. Metformin 500mg, Telmisartan 40mg)"
                  value={m.name}
                  onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={m.quantity}
                    onChange={(e) => handleUpdateMedicine(idx, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleAddMedicine}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Prescribed Item</span>
            </button>

            <button
              type="button"
              onClick={handleFetchQuotations}
              disabled={loadingQuotes}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 disabled:opacity-50 transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{loadingQuotes ? 'Querying Nearby Pharmacies...' : 'Request & Compare Quotations'}</span>
            </button>
          </div>
        </div>

        {/* Quotations Comparison Results */}
        {quotations.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Real-Time Pharmacy Quotation Comparison</span>
                </h3>
                <p className="text-xs text-slate-500">Ranked by stock availability, distance, and competitive pricing</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {quotations.length} Pharmacies Responded
              </span>
            </div>

            {/* Quotations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 rounded-l-xl">Pharmacy Name & Location</th>
                    <th className="py-3 px-4">Distance</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4">Medicine Cost</th>
                    <th className="py-3 px-4">Delivery Fee</th>
                    <th className="py-3 px-4">Estimated Time</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.map((q, idx) => {
                    const isBest = idx === 0;
                    return (
                      <tr
                        key={q.pharmacy_id}
                        className={`hover:bg-amber-50/40 transition ${selectedQuote?.pharmacy_id === q.pharmacy_id ? 'bg-amber-50/60 font-semibold' : ''}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            {isBest && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-white uppercase">
                                BEST VALUE
                              </span>
                            )}
                            <div>
                              <p className="font-extrabold text-slate-900 text-xs">{q.pharmacy_name}</p>
                              <p className="text-[10px] text-slate-400">{q.pharmacy_area}, Hyderabad</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {q.distance_km}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            q.availability === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {q.availability}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                          ₹{q.subtotal}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {q.home_delivery_available ? `₹${q.delivery_charge}` : 'Store Pickup Only'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {q.estimated_delivery_time}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedQuote(q);
                              setCheckoutModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
                          >
                            Order Now
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Safety policy: Prescription-required medicines undergo licensed pharmacist verification. No automatic generic substitution is performed without patient and doctor consent.
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Checkout & Pickup Code Modal */}
      {checkoutModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            
            {orderSuccess ? (
              /* Success Screen */
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">Medicine Order Placed!</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Order ID: <span className="font-mono font-bold text-amber-700">{orderSuccess.order_id}</span></p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">Pickup Verification Code</span>
                  <p className="font-mono text-3xl font-black text-amber-950 tracking-widest">{orderSuccess.pickup_code}</p>
                  <p className="text-[10px] text-amber-700">
                    Show this 5-digit verification code to {orderSuccess.pharmacy_name} during handover for instant verification.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pharmacy:</span>
                    <span className="font-semibold text-slate-800">{orderSuccess.pharmacy_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fulfillment Mode:</span>
                    <span className="font-semibold text-slate-800">{orderSuccess.fulfillment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Payable:</span>
                    <span className="font-bold text-slate-900 text-sm">₹{orderSuccess.total_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Pharmacy Verification</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setOrderSuccess(null);
                    navigate('/dashboard/patient/orders');
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition"
                >
                  View Order Status in Patient Dashboard
                </button>
              </div>
            ) : (
              /* Checkout Details */
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Confirm Medicine Order</h3>
                    <p className="text-xs text-slate-500">{selectedQuote.pharmacy_name}</p>
                  </div>
                  <button onClick={() => setCheckoutModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                {/* Fulfillment Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Fulfillment Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('Store Pickup')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        fulfillmentType === 'Store Pickup'
                          ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      <Store className="w-5 h-5 text-amber-600" />
                      <span>Store Pickup (No Fee)</span>
                      <span className="text-[10px] font-normal text-slate-400">{selectedQuote.estimated_pickup_time}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!selectedQuote.home_delivery_available}
                      onClick={() => setFulfillmentType('Home Delivery')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                        fulfillmentType === 'Home Delivery'
                          ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 disabled:opacity-40'
                      }`}
                    >
                      <Truck className="w-5 h-5 text-amber-600" />
                      <span>Home Delivery (+₹{selectedQuote.delivery_charge})</span>
                      <span className="text-[10px] font-normal text-slate-400">{selectedQuote.estimated_delivery_time}</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Address if Home Delivery */}
                {fulfillmentType === 'Home Delivery' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                {/* Order Summary Breakdown */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price Breakdown</span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Prescribed Items Subtotal:</span>
                    <span className="font-semibold text-slate-800">₹{selectedQuote.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery Charges:</span>
                    <span className="font-semibold text-slate-800">
                      {fulfillmentType === 'Home Delivery' ? `₹${selectedQuote.delivery_charge}` : '₹0 (Pickup)'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-extrabold text-sm text-slate-900">
                    <span>Total Order Amount:</span>
                    <span className="text-amber-700">
                      ₹{fulfillmentType === 'Home Delivery' ? selectedQuote.total_delivery : selectedQuote.total_pickup}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 disabled:opacity-50 transition"
                >
                  {placingOrder ? 'Submitting Order to Pharmacy...' : 'Place Order & Generate Pickup Code'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
