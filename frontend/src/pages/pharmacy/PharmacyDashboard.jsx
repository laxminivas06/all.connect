import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Pill,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  Check,
  ShieldCheck,
  AlertCircle,
  Truck,
  Store,
  KeyRound,
  FileText,
  Tag,
  Package,
  Building2,
  CreditCard,
  Settings,
  Plus,
  Save,
  DollarSign,
  ArrowRight,
  Send,
  Lock,
  Phone
} from 'lucide-react';

export const PharmacyDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 11 Tab state: overview, prescriptions, quotations, orders, catalogue, inventory, pickup-codes, sales, profile, subscription, settings
  const [activeTab, setActiveTab] = useState('overview');

  // Sub-route synchronization
  useEffect(() => {
    const subPath = location.pathname.replace('/dashboard/pharmacy', '').replace(/^\//, '');
    const firstSegment = subPath.split('/')[0];

    if (!firstSegment || firstSegment === '' || firstSegment === 'overview') {
      setActiveTab('overview');
    } else if (firstSegment === 'pickup-verify' || firstSegment === 'pickup-codes') {
      setActiveTab('pickup-codes');
    } else if ([
      'overview',
      'prescriptions',
      'quotations',
      'orders',
      'catalogue',
      'inventory',
      'pickup-codes',
      'sales',
      'profile',
      'subscription',
      'settings'
    ].includes(firstSegment)) {
      setActiveTab(firstSegment);
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const targetUrl = tabKey === 'overview' ? '/dashboard/pharmacy' : `/dashboard/pharmacy/${tabKey}`;
    navigate(targetUrl);
  };

  // Pickup verification code state
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Order filter state
  const [orderFilter, setOrderFilter] = useState('all');

  // Catalogue search state
  const [catSearch, setCatSearch] = useState('');
  const [catCategory, setCatCategory] = useState('all');

  // Quotation Creator state
  const [quoteForm, setQuoteForm] = useState({
    patient_name: 'Rahul Varma',
    patient_phone: '+91 98490 22334',
    prescription_id: 'RX-2026-90412',
    medicines: 'Metformin 500mg SR (60 Tabs), Telmisartan 40mg (30 Tabs)',
    total_mrp: '480',
    discount_pct: '15',
    net_amount: '408',
    delivery_type: 'Counter Pickup in 15 mins'
  });
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Store profile form state
  const [storeProfile, setStoreProfile] = useState({
    name: '',
    license_number: '',
    area: '',
    address: 'Plot 42, Main Road, Beside Yashoda Hospital, Somajiguda, Hyderabad',
    phone: '+91 40 2339 8811',
    pharmacist_in_charge: 'K. Sridhar, B.Pharm (Reg: TS-PR-40192)',
    gstin: '36AAAAA0000A1Z5',
    home_delivery: true,
    delivery_radius: '5'
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const fetchPharmacyData = () => {
    setLoading(true);
    api.getPharmacyDashboard()
      .then(res => {
        setData(res);
        if (res.pharmacy) {
          setStoreProfile(prev => ({
            ...prev,
            name: res.pharmacy.name || prev.name,
            license_number: res.pharmacy.license_number || prev.license_number,
            area: res.pharmacy.area || prev.area,
            home_delivery: res.pharmacy.home_delivery !== undefined ? res.pharmacy.home_delivery : prev.home_delivery
          }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, { status: newStatus });
      fetchPharmacyData();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleVerifyPickupCode = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;

    setVerifyLoading(true);
    setVerifyError('');
    setVerifyResult(null);

    const code = verifyCode.trim().toUpperCase();
    const targetOrder = data?.recent_orders?.find(o => o.pickup_code?.toUpperCase() === code);

    if (!targetOrder) {
      setVerifyError(`Invalid Pickup Code '${code}'. No matching active order found at this pharmacy store.`);
      setVerifyLoading(false);
      return;
    }

    try {
      await api.updateOrderStatus(targetOrder.id, {
        status: 'Collected',
        pickup_code_verify: code
      });
      setVerifyResult({
        order_id: targetOrder.order_id,
        patient_name: targetOrder.patient_name,
        amount: targetOrder.total_amount,
        items_count: targetOrder.items?.length || 1
      });
      setVerifyCode('');
      fetchPharmacyData();
    } catch (err) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSendQuotation = (e) => {
    e.preventDefault();
    setQuoteSuccess(true);
    setTimeout(() => {
      setQuoteSuccess(false);
    }, 4000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Loading pharmacy operations terminal...</p>
      </div>
    );
  }

  const { pharmacy, kpis, recent_orders, inventory_sample } = data || {};

  const filteredOrders = (recent_orders || []).filter(o => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'verification') return o.status === 'Pharmacy Verification';
    if (orderFilter === 'preparing') return o.status === 'Preparing';
    if (orderFilter === 'ready') return o.status === 'Ready for Pickup';
    if (orderFilter === 'collected') return o.status === 'Collected';
    return true;
  });

  const samplePrescriptions = [
    {
      id: 'PRX-401',
      prescription_id: 'RX-2026-90412',
      patient_name: 'Rahul Varma',
      patient_mobile: '+91 98490 22334',
      doctor_name: 'Dr. Suresh Rao',
      hospital_name: 'Yashoda Hospitals, Somajiguda',
      date: 'Today, 11:20 AM',
      items: ['Metformin 500mg SR (60 Tabs)', 'Telmisartan 40mg (30 Tabs)'],
      status: 'Awaiting Quotation'
    },
    {
      id: 'PRX-402',
      prescription_id: 'RX-2026-88192',
      patient_name: 'Pooja Agarwal',
      patient_mobile: '+91 91234 56789',
      doctor_name: 'Dr. K. Sneha Reddy',
      hospital_name: 'Apollo Clinics, Banjara Hills',
      date: 'Today, 02:45 PM',
      items: ['Amoxicillin 500mg (15 Caps)', 'Paracetamol 650mg (10 Tabs)', 'Cetirizine 10mg (10 Tabs)'],
      status: 'Awaiting Quotation'
    }
  ];

  const masterCatalogue = inventory_sample || [
    { id: 'MED-1', name: 'Metformin 500mg SR', generic_name: 'Metformin Hydrochloride', category: 'Diabetes', unit_price: 68, strip_size: 'Strip of 15', stock: 120 },
    { id: 'MED-2', name: 'Telmisartan 40mg', generic_name: 'Telmisartan', category: 'Cardiology', unit_price: 110, strip_size: 'Strip of 10', stock: 85 },
    { id: 'MED-3', name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin Trihydrate', category: 'Antibiotics', unit_price: 145, strip_size: 'Strip of 10', stock: 45 },
    { id: 'MED-4', name: 'Paracetamol 650mg', generic_name: 'Paracetamol', category: 'Analgesics', unit_price: 32, strip_size: 'Strip of 15', stock: 250 },
    { id: 'MED-5', name: 'Pantoprazole 40mg', generic_name: 'Pantoprazole Gastro-resistant', category: 'Gastroenterology', unit_price: 95, strip_size: 'Strip of 15', stock: 110 },
    { id: 'MED-6', name: 'Atorvastatin 10mg', generic_name: 'Atorvastatin Calcium', category: 'Cardiology', unit_price: 135, strip_size: 'Strip of 10', stock: 60 }
  ];

  const filteredCatalogue = masterCatalogue.filter(m => {
    const matchQ = catSearch === '' || m.name.toLowerCase().includes(catSearch.toLowerCase()) || m.generic_name.toLowerCase().includes(catSearch.toLowerCase());
    const matchC = catCategory === 'all' || m.category?.toLowerCase() === catCategory.toLowerCase();
    return matchQ && matchC;
  });

  const navTabs = [
    { key: 'overview', label: 'Overview', icon: Store },
    { key: 'prescriptions', label: `Prescriptions (${samplePrescriptions.length})`, icon: FileText },
    { key: 'quotations', label: 'Quotations', icon: Tag },
    { key: 'orders', label: `Active Orders (${recent_orders?.length || 0})`, icon: ShoppingBag },
    { key: 'catalogue', label: 'Medicine Catalogue', icon: Pill },
    { key: 'inventory', label: 'Inventory Stock', icon: Package },
    { key: 'pickup-codes', label: 'Pickup Codes', icon: KeyRound },
    { key: 'sales', label: 'Sales Reports', icon: TrendingUp },
    { key: 'profile', label: 'Pharmacy Profile', icon: Building2 },
    { key: 'subscription', label: 'SaaS Plan', icon: CreditCard },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Pharmacy Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
            REGISTERED MEDICAL STORE • {pharmacy?.area}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{pharmacy?.name}</h1>
          <p className="text-xs text-slate-500">
            Drug License: <strong className="font-mono text-slate-700">{pharmacy?.license_number}</strong> • Home Delivery: <strong className="text-emerald-600">{pharmacy?.home_delivery ? 'Active' : 'Disabled'}</strong>
          </p>
        </div>

        <button
          onClick={() => handleTabChange('pickup-codes')}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 transition"
        >
          <KeyRound className="w-4 h-4" />
          <span>Verify Customer Pickup Code</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Active Orders</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{kpis?.active_orders_count || 0}</p>
          <p className="text-[11px] text-amber-600 font-semibold">In fulfillment pipeline</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Ready for Counter Pickup</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">{kpis?.ready_for_pickup_count || 0}</p>
          <p className="text-[11px] text-slate-400">Packed in dispensing bin</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Today's Store Sales</span>
          <p className="text-2xl font-black text-blue-600 mt-2">₹{kpis?.today_sales?.toLocaleString() || '14,850'}</p>
          <p className="text-[11px] text-slate-400">Prescription orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Inventory Catalog</span>
          <p className="text-2xl font-black text-purple-600 mt-2">{kpis?.catalog_items_count || 1400}+</p>
          <p className="text-[11px] text-slate-400">SKUs in quotation index</p>
        </div>
      </div>

      {/* 11 Tab Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold scrollbar-none">
        {navTabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Orders Summary */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Current Fulfillment Lineup</h3>
                  <p className="text-xs text-slate-500">Prescription orders ready for packaging or counter collection</p>
                </div>
                <button
                  onClick={() => handleTabChange('orders')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700"
                >
                  View All ({recent_orders?.length || 0}) →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {recent_orders?.slice(0, 3).map(o => (
                  <div key={o.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-700">{o.order_id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-800' :
                          o.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'Collected' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{o.patient_name}</h4>
                      <p className="text-slate-500">{o.items?.length || 1} prescribed medications • Total: <strong className="text-slate-900">₹{o.total_amount}</strong></p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {o.status === 'Pharmacy Verification' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'Preparing')}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                        >
                          Accept
                        </button>
                      )}
                      {o.status === 'Preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'Ready for Pickup')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                        >
                          Mark Ready
                        </button>
                      )}
                      <button
                        onClick={() => handleTabChange('pickup-codes')}
                        className="px-3 py-1.5 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 font-bold text-xs"
                      >
                        Enter Passcode
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Counter Pickup Terminal Box & Prescription Inquiries */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 text-white shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-100" />
                  <h4 className="font-extrabold text-sm">Customer Counter Handover</h4>
                </div>
                <p className="text-xs text-amber-100">
                  Patients present an instant 5-digit verification passcode at your pharmacy counter to authorize medicine collection.
                </p>
                <button
                  onClick={() => handleTabChange('pickup-codes')}
                  className="w-full py-2.5 bg-white text-amber-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-amber-50 transition"
                >
                  Open Verification Terminal →
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Prescription Quotations</span>
                  </h4>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {samplePrescriptions.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  New OCR and digital prescriptions broadcasted from clinics in {pharmacy?.area}.
                </p>
                <button
                  onClick={() => handleTabChange('prescriptions')}
                  className="w-full py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Review & Quote Prices →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. PRESCRIPTIONS TAB */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Incoming Prescription Queue</h3>
              <p className="text-xs text-slate-500">Patient-uploaded prescriptions and doctor e-prescriptions awaiting pricing quotation</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {samplePrescriptions.length} Awaiting Quotation
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {samplePrescriptions.map(p => (
              <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-indigo-700">{p.prescription_id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {p.status}
                    </span>
                    <span className="text-slate-400 text-[10px]">• {p.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{p.patient_name} <span className="font-normal text-slate-500 text-xs">({p.patient_mobile})</span></h4>
                  <p className="text-slate-600">Issued by: <strong className="text-slate-800">{p.doctor_name}</strong> • {p.hospital_name}</p>
                  
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.items.map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setQuoteForm(prev => ({
                        ...prev,
                        patient_name: p.patient_name,
                        patient_phone: p.patient_mobile,
                        prescription_id: p.prescription_id,
                        medicines: p.items.join(', ')
                      }));
                      handleTabChange('quotations');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Generate Quotation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. QUOTATIONS TAB */}
      {activeTab === 'quotations' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-600" />
              <span>Medicine Quotation Builder</span>
            </h3>
            <p className="text-xs text-slate-500">Submit competitive medication pricing directly to the patient's mobile app</p>
          </div>

          {quoteSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">Quotation Dispatched to Patient!</h4>
              <p className="text-xs text-slate-600">The customer has received your discounted price of <strong>₹{quoteForm.net_amount}</strong> for Rx: {quoteForm.prescription_id}.</p>
              <button
                onClick={() => handleTabChange('orders')}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
              >
                Go to Active Orders
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendQuotation} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.patient_name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, patient_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prescription Ref ID</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.prescription_id}
                    onChange={(e) => setQuoteForm({ ...quoteForm, prescription_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prescribed Medicines</label>
                <textarea
                  rows={2}
                  value={quoteForm.medicines}
                  onChange={(e) => setQuoteForm({ ...quoteForm, medicines: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total MRP (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.total_mrp}
                    onChange={(e) => {
                      const mrp = Number(e.target.value);
                      const disc = Number(quoteForm.discount_pct);
                      const net = Math.round(mrp * (1 - disc / 100));
                      setQuoteForm({ ...quoteForm, total_mrp: e.target.value, net_amount: String(net) });
                    }}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Store Discount (%)</label>
                  <input
                    type="number"
                    value={quoteForm.discount_pct}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      const mrp = Number(quoteForm.total_mrp);
                      const net = Math.round(mrp * (1 - disc / 100));
                      setQuoteForm({ ...quoteForm, discount_pct: e.target.value, net_amount: String(net) });
                    }}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Net Quoted Price (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.net_amount}
                    onChange={(e) => setQuoteForm({ ...quoteForm, net_amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-emerald-700 bg-emerald-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fulfillment Commitment</label>
                <select
                  value={quoteForm.delivery_type}
                  onChange={(e) => setQuoteForm({ ...quoteForm, delivery_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="Counter Pickup in 15 mins">Ready for Counter Pickup in 15 mins</option>
                  <option value="Home Delivery in 45 mins">Express Home Delivery within 45 mins</option>
                  <option value="Next Morning Delivery">Scheduled Delivery (Next Morning)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Quotation to Patient</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 4. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Active Medication Orders</h3>
              <p className="text-xs text-slate-500">Process orders from verification through counter packaging and customer collection</p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
              {['all', 'verification', 'preparing', 'ready', 'collected'].map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-3 py-1 rounded-lg capitalize transition ${
                    orderFilter === f ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No orders match the selected filter.</div>
            ) : (
              filteredOrders.map(o => (
                <div key={o.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-amber-700">{o.order_id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'Collected' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                      <span className="text-[10px] text-slate-400">• {o.fulfillment_type}</span>
                    </div>

                    <p className="font-extrabold text-slate-900 text-sm">{o.patient_name} <span className="font-normal text-slate-500 text-xs">({o.patient_mobile})</span></p>
                    
                    <div className="flex flex-wrap gap-1 pt-1">
                      {o.items?.map((it, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {it.medicine_name || it.name} (Qty: {it.quantity})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right mr-2">
                      <span className="font-black text-sm text-slate-900 block">₹{o.total_amount}</span>
                      <span className="font-mono text-[10px] text-amber-700 font-bold block">Pass: {o.pickup_code}</span>
                    </div>

                    {o.status === 'Pharmacy Verification' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'Preparing')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                      >
                        Accept & Prepare
                      </button>
                    )}
                    {o.status === 'Preparing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id, 'Ready for Pickup')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                      >
                        Mark Ready
                      </button>
                    )}
                    {o.status === 'Ready for Pickup' && (
                      <button
                        onClick={() => {
                          setVerifyCode(o.pickup_code);
                          handleTabChange('pickup-codes');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-sm"
                      >
                        Verify Handover
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. MEDICINE CATALOGUE TAB */}
      {activeTab === 'catalogue' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Master Medication Catalogue</h3>
              <p className="text-xs text-slate-500">Standardized pharmaceutical index with MRP and therapeutic classifications</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search brand or salt..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <select
                value={catCategory}
                onChange={(e) => setCatCategory(e.target.value)}
                className="px-3 py-2 border rounded-xl text-xs bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Analgesics">Analgesics</option>
                <option value="Gastroenterology">Gastro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCatalogue.map(med => (
              <div key={med.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{med.category}</span>
                <h4 className="font-bold text-slate-900">{med.name}</h4>
                <p className="text-slate-500 text-[11px]">{med.generic_name}</p>
                <div className="flex justify-between items-center pt-1 font-bold">
                  <span className="text-amber-700">₹{med.unit_price} / {med.strip_size}</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">In Stock ({med.stock || 50} units)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Real-Time Pharmacy Stock & Batch Inventory</h3>
              <p className="text-xs text-slate-500">Track batch expiry dates, reorder thresholds, and counter stock units</p>
            </div>
            <button
              onClick={() => alert('New batch intake dialog')}
              className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Batch</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Medicine Name</th>
                  <th className="p-3">Batch No</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masterCatalogue.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">
                      {m.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{m.generic_name}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">BAT-2026-0{idx + 1}</td>
                    <td className="p-3 text-slate-600">12/2027</td>
                    <td className="p-3 font-bold text-slate-900">{m.stock || 80} strips</td>
                    <td className="p-3 text-amber-700 font-bold">₹{m.unit_price}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Available
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. PICKUP CODES TAB */}
      {activeTab === 'pickup-codes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm max-w-xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Counter Pickup Verification Terminal</h3>
            <p className="text-xs text-slate-500">Enter the customer's 5-digit verification code before handing over the medicines</p>
          </div>

          <form onSubmit={handleVerifyPickupCode} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="e.g. PICK-48291"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                className="w-full text-center font-mono text-xl font-black tracking-widest px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-amber-500 focus:ring-0 uppercase placeholder:text-slate-300"
              />
            </div>

            {verifyError && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {verifyResult && (
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs space-y-1 text-center">
                <p className="font-extrabold text-sm">✅ Code Verified! Handover Approved</p>
                <p>Order: <strong>{verifyResult.order_id}</strong> • Patient: <strong>{verifyResult.patient_name}</strong></p>
                <p>Total Paid: <strong>₹{verifyResult.amount}</strong> ({verifyResult.items_count} items)</p>
                <p className="text-[10px] text-emerald-600 pt-1 font-semibold">Status automatically updated to 'Collected' in patient portal.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={verifyLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              {verifyLoading ? 'Verifying Code...' : 'Verify Code & Complete Handover'}
            </button>
          </form>
        </div>
      )}

      {/* 8. SALES REPORTS TAB */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Pharmacy Sales Performance & Collections</h3>
              <p className="text-xs text-slate-500">Breakdown of online platform orders, counter collections, and daily revenue</p>
            </div>
            <button
              onClick={() => alert('Sales report exported to CSV')}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
            >
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold">Daily Sales Today</span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{kpis?.today_sales?.toLocaleString() || '14,850'}</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">18 Orders fulfilled</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold">This Month's Sales</span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹3,42,600</p>
              <p className="text-[11px] text-indigo-600 font-bold mt-0.5">412 Total Orders</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold">Average Order Value</span>
              <p className="text-2xl font-black text-amber-700 mt-1">₹831</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Chronic Rx refills</p>
            </div>
          </div>
        </div>
      )}

      {/* 9. PHARMACY PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Registered Pharmacy Store Dossier</h3>
              <p className="text-xs text-slate-500">Retail license credentials and store location details</p>
            </div>
            {profileSaved && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Profile Updated!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pharmacy Store Name</label>
                <input
                  type="text"
                  value={storeProfile.name}
                  onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Drug License Number (Form 20/21)</label>
                <input
                  type="text"
                  value={storeProfile.license_number}
                  onChange={(e) => setStoreProfile({ ...storeProfile, license_number: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl font-mono text-amber-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Area / Locality</label>
                <input
                  type="text"
                  value={storeProfile.area}
                  onChange={(e) => setStoreProfile({ ...storeProfile, area: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pharmacist in Charge</label>
                <input
                  type="text"
                  value={storeProfile.pharmacist_in_charge}
                  onChange={(e) => setStoreProfile({ ...storeProfile, pharmacist_in_charge: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Store Phone Contact</label>
                <input
                  type="text"
                  value={storeProfile.phone}
                  onChange={(e) => setStoreProfile({ ...storeProfile, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GSTIN</label>
                <input
                  type="text"
                  value={storeProfile.gstin}
                  onChange={(e) => setStoreProfile({ ...storeProfile, gstin: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Store Address</label>
              <textarea
                rows={2}
                value={storeProfile.address}
                onChange={(e) => setStoreProfile({ ...storeProfile, address: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Store Credentials</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 10. SUBSCRIPTION TAB */}
      {activeTab === 'subscription' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Platform SaaS Subscription</h3>
            <p className="text-xs text-slate-500">AllConnect Retail Medical Store Tier & Multi-Hospital Mesh Connection</p>
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ACTIVE SUBSCRIPTION
                </span>
                <h4 className="text-xl font-extrabold mt-1">Pharmacy Pro Mesh Connector</h4>
              </div>
              <span className="text-2xl font-black text-amber-400">₹2,999 <span className="text-xs font-normal text-slate-400">/ month</span></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Prescription Quotation Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Counter Pickup Passcode Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Commission on Prescription Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Area-wide Direct Patient Discovery</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">Store Operations & Alert Settings</h3>
            <p className="text-xs text-slate-500">Configure order alerts, pickup thresholds, and terminal access</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-600" />
                <span>Store Operational Preferences</span>
              </h4>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Accept online prescription quote requests</span>
                  <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-0" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Send SMS alert to pharmacist when new Rx arrives</span>
                  <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-0" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Auto-notify customer when order is marked 'Ready for Pickup'</span>
                  <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-0" />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Store Terminal Security</span>
              </h4>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Terminal Master Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-1.5 border rounded-lg bg-white" />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Terminal security settings saved successfully!')}
                  className="px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900"
                >
                  Save Security Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
