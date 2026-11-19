import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Edit,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const BillingTab = ({
  appointments = [],
  doctors = [],
  kpis = {},
  onRefresh
}) => {
  const [dateFilter, setDateFilter] = useState('all'); // all, today, this_month
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [searchPatient, setSearchPatient] = useState('');

  // Edit Fee Modal
  const [editBillingModalOpen, setEditBillingModalOpen] = useState(false);
  const [selectedApptForBilling, setSelectedApptForBilling] = useState(null);
  const [newFee, setNewFee] = useState(500);
  const [newPaymentStatus, setNewPaymentStatus] = useState('Paid');
  const [newPaymentMode, setNewPaymentMode] = useState('Cash / Counter');
  const [billingNotes, setBillingNotes] = useState('');
  const [billingLoading, setBillingLoading] = useState(false);

  // Printable Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptAppt, setReceiptAppt] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7);

  // Filter appointments for billing
  const billingAppointments = appointments.filter(a => {
    if (dateFilter === 'today' && a.appointment_date !== todayStr) return false;
    if (dateFilter === 'this_month' && !(a.appointment_date || '').startsWith(currentMonthStr)) return false;
    if (selectedDoctor !== 'all' && a.doctor_id !== selectedDoctor) return false;
    if (searchPatient.trim()) {
      const q = searchPatient.toLowerCase();
      const matchP = (a.patient_name || '').toLowerCase().includes(q);
      const matchId = (a.appointment_id || '').toLowerCase().includes(q);
      if (!matchP && !matchId) return false;
    }
    return true;
  });

  // Calculate doctor-wise collections
  const doctorCollections = {};
  appointments.forEach(a => {
    if (a.status === 'Completed' || a.payment_status === 'Paid' || (a.payment_status || '').includes('Paid')) {
      const dName = a.doctor_name || 'Unassigned';
      doctorCollections[dName] = (doctorCollections[dName] || 0) + (a.consultation_fee || 0);
    }
  });

  const handleOpenEditBilling = (appt) => {
    setSelectedApptForBilling(appt);
    setNewFee(appt.consultation_fee || 500);
    setNewPaymentStatus(appt.payment_status === 'Pending' ? 'Paid' : (appt.payment_status || 'Paid'));
    setNewPaymentMode(appt.payment_mode || 'Cash / Counter');
    setBillingNotes('');
    setEditBillingModalOpen(true);
  };

  const handleEditBillingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApptForBilling) return;
    setBillingLoading(true);
    try {
      await api.updateAppointmentBilling(selectedApptForBilling.id || selectedApptForBilling.appointment_id, {
        consultation_fee: newFee,
        payment_status: newPaymentStatus,
        payment_mode: newPaymentMode,
        payment_notes: billingNotes || 'Updated by organisation accountant'
      });
      setEditBillingModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error updating billing');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleOpenReceipt = (appt) => {
    setReceiptAppt(appt);
    setReceiptModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Appointment ID', 'Date', 'Patient Name', 'Doctor Name', 'Fee', 'Payment Status', 'Payment Mode'];
    const rows = billingAppointments.map(a => [
      a.appointment_id || a.id,
      a.appointment_date,
      `"${a.patient_name}"`,
      `"${a.doctor_name}"`,
      a.consultation_fee || 0,
      a.payment_status || 'Pending',
      `"${a.payment_mode || 'Cash'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Collection_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Platform SaaS Revenue Delineation Banner */}
      <div className="bg-emerald-900 text-emerald-100 p-4 rounded-2xl flex items-center justify-between text-xs border border-emerald-800/60 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white block">Provider Healthcare Revenue Ledger</span>
            <span className="text-emerald-300">
              100% of patient consultation collections belong directly to your healthcare organisation.
              This is strictly segregated from AllConnect platform SaaS subscription billing.
            </span>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 shrink-0 flex items-center space-x-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 6 Primary Billing KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Today's Collection</span>
          <span className="text-lg font-black text-emerald-700 mt-1 block">₹{kpis.today_collection || 0}</span>
          <span className="text-[10px] text-slate-400">Cash/UPI Counter</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Monthly Collection</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">₹{kpis.monthly_collection || 0}</span>
          <span className="text-[10px] text-slate-400">Completed OPD</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Completed Consults</span>
          <span className="text-lg font-black text-blue-700 mt-1 block">{kpis.completed_consultations || 0}</span>
          <span className="text-[10px] text-slate-400">Total Treated</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Avg Consultation Fee</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">₹550</span>
          <span className="text-[10px] text-slate-400">Per Patient</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Package Revenue</span>
          <span className="text-lg font-black text-purple-700 mt-1 block">₹{kpis.package_collections || 14990}</span>
          <span className="text-[10px] text-slate-400">Screening Packages</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Pending Payments</span>
          <span className="text-lg font-black text-amber-700 mt-1 block">₹{kpis.pending_payments || 0}</span>
          <span className="text-[10px] text-slate-400">Unsettled Invoices</span>
        </div>
      </div>

      {/* Doctor-wise Collection Summary Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Doctor-wise OPD Collections</h4>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(doctorCollections).map(([doc, amt]) => (
            <div key={doc} className="p-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">{doc}:</span>
              <span className="text-xs font-black text-emerald-700">₹{amt.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          {[
            { key: 'all', label: 'All Dates' },
            { key: 'today', label: 'Today Only' },
            { key: 'this_month', label: 'This Month' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                dateFilter === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient or ID..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
          >
            <option value="all">All Specialists</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Billing Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Invoice / Appt ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Consulting Doctor</th>
                <th className="py-3 px-4">Payable Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billingAppointments.map(a => (
                <tr key={a.id || a.appointment_id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {a.appointment_id || a.id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 block">{a.appointment_date}</span>
                    <span className="text-[10px] text-slate-400">{a.appointment_time}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{a.patient_name}</span>
                    <span className="text-[10px] text-slate-400">{a.patient_health_id || a.patient_id}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {a.doctor_name}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900 text-sm">
                    ₹{a.consultation_fee || 500}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      a.payment_status === 'Paid' || (a.payment_status || '').includes('Paid')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : a.payment_status === 'Refunded'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {a.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {a.payment_mode || 'Counter Cash'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenReceipt(a)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Receipt
                    </button>
                    <button
                      onClick={() => handleOpenEditBilling(a)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs"
                    >
                      Edit Fee
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Fee / Payment Status */}
      {editBillingModalOpen && selectedApptForBilling && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Edit Consultation Fee & Billing</span>
            </h3>
            <p className="text-xs text-slate-500">
              Invoice #{selectedApptForBilling.appointment_id} • Patient: {selectedApptForBilling.patient_name}
            </p>

            <form onSubmit={handleEditBillingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payable Fee (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newFee}
                  onChange={(e) => setNewFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status *</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={newPaymentMode}
                  onChange={(e) => setNewPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Cash / Counter">Cash / Counter</option>
                  <option value="Online UPI Gateway">Online UPI Gateway</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                  <option value="Insurance / Corporate">Insurance / Corporate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Audit Adjustment Reason</label>
                <textarea
                  rows={2}
                  value={billingNotes}
                  onChange={(e) => setBillingNotes(e.target.value)}
                  placeholder="e.g. Senior citizen concession, revised procedure fee..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  All fee modifications are logged to the regulatory HIPAA/ABDM audit ledger.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditBillingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={billingLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                >
                  {billingLoading ? 'Saving...' : 'Save & Record Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Payment Receipt */}
      {receiptModalOpen && receiptAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                OPD Consultation Payment Receipt
              </h3>
              <button onClick={() => setReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <h4 className="font-extrabold text-sm text-slate-900">{receiptAppt.organization_name || 'Healthcare Organization'}</h4>
                <p className="text-[10px] text-slate-400">Centralized Healthcare Mesh Network • Hyderabad, Telangana</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt / Appt #:</span>
                  <span className="font-mono font-bold text-slate-900">{receiptAppt.appointment_id || receiptAppt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-bold text-slate-800">{receiptAppt.appointment_date} at {receiptAppt.appointment_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-bold text-slate-900">{receiptAppt.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Health ID:</span>
                  <span className="font-mono font-bold text-slate-700">{receiptAppt.patient_health_id || receiptAppt.patient_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-bold text-slate-900">{receiptAppt.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialisation:</span>
                  <span className="text-slate-700">{receiptAppt.specialization || receiptAppt.department}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-sm font-black">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-700">₹{receiptAppt.consultation_fee}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Payment Mode:</span>
                  <span>{receiptAppt.payment_mode || 'Cash'}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Payment Status:</span>
                  <span className="font-bold text-emerald-600">{receiptAppt.payment_status || 'Paid'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400">System Generated e-Receipt</span>
              <div className="space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
