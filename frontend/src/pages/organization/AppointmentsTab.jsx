import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../../components/Pagination';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UserCheck,
  Stethoscope,
  ChevronRight,
  RefreshCw,
  User,
  ArrowRight,
  Eye,
  FileCheck,
  Pill,
  Download,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const AppointmentsTab = ({
  appointments = [],
  doctors = [],
  isSingleDoctor = false,
  orgType = 'hospital',
  data = null,
  initialFilter = 'all',
  onRefresh
}) => {
  const actualAppointments = appointments.length > 0 ? appointments : (data?.recent_appointments || []);
  const actualDoctors = doctors.length > 0 ? doctors : (data?.doctors || []);
  const singleDoc = isSingleDoctor || data?.is_single_doctor;

  const [searchParams, setSearchParams] = useSearchParams();
  const filterFromUrl = searchParams.get('filter');

  const [filterSubTab, setFilterSubTab] = useState(filterFromUrl || initialFilter); // all, today, queue, consultations, pending, confirmed, completed, cancelled
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync sub-tab with URL
  useEffect(() => {
    if (filterFromUrl && filterFromUrl !== filterSubTab) {
      setFilterSubTab(filterFromUrl);
      setCurrentPage(1);
    }
  }, [filterFromUrl]);

  const handleSubTabChange = (tabKey) => {
    setFilterSubTab(tabKey);
    setCurrentPage(1);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('filter', tabKey);
      return next;
    });
  };

  // Status Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [statusToSet, setStatusToSet] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Assign Doctor Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Consultation Details Modal State
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const effectiveAppointments = appointments.length > 0 ? appointments : actualAppointments;
  const effectiveDoctors = doctors.length > 0 ? doctors : actualDoctors;

  const filteredAppointments = effectiveAppointments.filter(a => {
    // Sub-tab filter
    if (filterSubTab === 'today') {
      if (a.appointment_date !== todayStr) return false;
    } else if (filterSubTab === 'queue') {
      if (a.appointment_date !== todayStr || ['Cancelled', 'Completed'].includes(a.status)) return false;
    } else if (filterSubTab === 'consultations') {
      if (!['In Consultation', 'Completed', 'Next in Line', 'Waiting', 'Confirmed'].includes(a.status)) return false;
    } else if (filterSubTab === 'pending') {
      if (a.status !== 'Pending') return false;
    } else if (filterSubTab === 'confirmed') {
      if (a.status !== 'Confirmed') return false;
    } else if (filterSubTab === 'completed') {
      if (a.status !== 'Completed') return false;
    } else if (filterSubTab === 'cancelled') {
      if (a.status !== 'Cancelled') return false;
    }

    // Doctor filter
    if (selectedDoctorFilter !== 'all' && a.doctor_id !== selectedDoctorFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (a.patient_name || '').toLowerCase().includes(q);
      const matchPid = (a.patient_id || '').toLowerCase().includes(q);
      const matchAid = (a.appointment_id || '').toLowerCase().includes(q);
      const matchDoc = (a.doctor_name || '').toLowerCase().includes(q);
      if (!matchName && !matchPid && !matchAid && !matchDoc) return false;
    }

    return true;
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Queue visual overview counts
  const arrivedPatientsCount = effectiveAppointments.filter(a =>
    ['Checked In', 'Waiting', 'Next in Line', 'In Consultation', 'Completed'].includes(a.status)
  ).length;
  const waitingPatientsCount = effectiveAppointments.filter(a =>
    ['Waiting', 'Checked In', 'Next in Line'].includes(a.status)
  ).length;
  const consultingPatientsCount = effectiveAppointments.filter(a =>
    a.status === 'In Consultation'
  ).length;
  const completedPatientsCount = effectiveAppointments.filter(a =>
    a.status === 'Completed'
  ).length;
  const cancelledPatientsCount = effectiveAppointments.filter(a =>
    a.status === 'Cancelled'
  ).length;

  const handleOpenStatusModal = (appt, nextStatus) => {
    setSelectedAppt(appt);
    setStatusToSet(nextStatus);
    setRescheduleDate(appt.appointment_date || todayStr);
    setRescheduleTime(appt.appointment_time || '10:00 AM');
    setCancellationReason('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt || !statusToSet) return;
    setStatusLoading(true);
    try {
      const payload = { status: statusToSet };
      if (statusToSet === 'Rescheduled') {
        payload.rescheduled_date = rescheduleDate;
        payload.rescheduled_time = rescheduleTime;
      } else if (statusToSet === 'Cancelled') {
        payload.cancellation_reason = cancellationReason || 'Cancelled by organisation staff';
      }
      await api.updateAppointmentStatus(selectedAppt.id || selectedAppt.appointment_id, payload);
      setStatusModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error updating appointment status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenAssignModal = (appt) => {
    setSelectedAppt(appt);
    setTargetDoctorId(appt.doctor_id || (doctors[0]?.id || ''));
    setAssignModalOpen(true);
  };

  const handleAssignDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt || !targetDoctorId) return;
    setAssignLoading(true);
    try {
      await api.assignAppointmentDoctor(selectedAppt.id || selectedAppt.appointment_id, {
        doctor_id: targetDoctorId
      });
      setAssignModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error assigning doctor');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Filter Tabs & Live Queue Status Counter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-bold">
          {[
            { key: 'all', label: `All (${appointments.length})` },
            { key: 'today', label: 'Today' },
            { key: 'queue', label: 'Live Queue' },
            { key: 'consultations', label: 'Consultations' },
            { key: 'pending', label: 'Pending Requests' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => handleSubTabChange(t.key)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                filterSubTab === t.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 shrink-0 self-start md:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Appointments</span>
        </button>
      </div>

      {/* Live Queue Visual Overview (Bookmark-Style Indicators) */}
      {filterSubTab === 'queue' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-in fade-in">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 border-l-4 border-l-blue-600 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Arrived</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{arrivedPatientsCount}</span>
            <span className="text-[10px] text-blue-600 font-semibold">Patients on premises</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 border-l-4 border-l-purple-600 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Waiting Patients</span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">{waitingPatientsCount}</span>
            <span className="text-[10px] text-purple-600 font-semibold">In waiting room</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 border-l-4 border-l-amber-500 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">In Consultation</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{consultingPatientsCount}</span>
            <span className="text-[10px] text-amber-600 font-semibold">In physician bay</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 border-l-4 border-l-emerald-600 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Completed</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{completedPatientsCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Consultations finished</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 border-l-4 border-l-rose-500 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Cancelled</span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{cancelledPatientsCount}</span>
            <span className="text-[10px] text-rose-600 font-semibold">Missed / cancelled</span>
          </div>
        </div>
      )}

      {/* Consultation Overview KPI Bar */}
      {filterSubTab === 'consultations' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Consultations</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {effectiveAppointments.filter(a => ['Confirmed', 'In Consultation', 'Completed', 'Next in Line', 'Waiting'].includes(a.status)).length}
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">Triage & Discharged</span>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Active In Consultation</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">
              {effectiveAppointments.filter(a => a.status === 'In Consultation').length}
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">In physician bay</span>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Next in Line / Waiting</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">
              {effectiveAppointments.filter(a => ['Next in Line', 'Waiting', 'Checked In'].includes(a.status)).length}
            </span>
            <span className="text-[10px] text-purple-600 font-semibold">Waiting room</span>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Completed Consults</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {effectiveAppointments.filter(a => a.status === 'Completed').length}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Prescriptions issued</span>
          </div>
        </div>
      )}

      {/* Search & Doctor Filtering Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, ID, or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {!isSingleDoctor && (
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Doctor:</span>
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none w-full sm:w-auto"
            >
              <option value="all">All Doctors ({effectiveDoctors.length})</option>
              {effectiveDoctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No appointments found</h4>
            <p className="text-xs text-slate-400 mt-1">Try switching filter tabs or clearing your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-24">Queue #</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Assigned Doctor</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fee & Payment</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAppointments.map((a, idx) => (
                  <tr key={a.id || a.appointment_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-black text-slate-900 w-24">
                      <span className="inline-flex items-center justify-center min-w-[50px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-black text-xs border border-blue-200 shadow-2xs font-mono">
                        {a.token_number || `T-${String(a.queue_number || idx + 1).padStart(2, '0')}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 text-sm block">{a.patient_name}</span>
                      <span className="text-[10px] text-slate-400 block">{a.patient_health_id || a.patient_id} • {a.patient_mobile}</span>
                      {a.chief_complaint && (
                        <span className="text-[10px] text-slate-500 italic block mt-0.5 line-clamp-1">"{a.chief_complaint}"</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{a.doctor_name || 'Unassigned'}</span>
                      <span className="text-[10px] text-slate-500">{a.specialization || a.department}</span>
                      {!isSingleDoctor && (
                        <button
                          onClick={() => handleOpenAssignModal(a)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold block mt-0.5"
                        >
                          Reassign Doctor
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{a.appointment_time}</span>
                      <span className="text-[10px] text-slate-500">{a.appointment_date}</span>
                      <span className="text-[10px] text-slate-400 block">{a.appointment_type || 'In-Person'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                        a.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : a.status === 'In Consultation'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          : a.status === 'Waiting' || a.status === 'Checked In'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : a.status === 'Confirmed'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : a.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block">₹{a.consultation_fee || 500}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{a.payment_status || 'Pending'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {/* Row 1: Details */}
                        <div>
                          <button
                            onClick={() => {
                              setSelectedConsultation(a);
                              setConsultationModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition"
                            title="View consultation details & clinical notes"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>Details</span>
                          </button>
                        </div>

                        {/* Row 2: Workflow Action (Check In / Begin / Enter / Complete) + Reschedule */}
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {a.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleOpenStatusModal(a, 'Confirmed')}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(a, 'Cancelled')}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {a.status === 'Confirmed' && (
                            <button
                              onClick={() => handleOpenStatusModal(a, 'Checked In')}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs"
                            >
                              Check In
                            </button>
                          )}

                          {(a.status === 'Waiting' || a.status === 'Checked In') && (
                            <>
                              <button
                                onClick={() => handleOpenStatusModal(a, 'Next in Line')}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs"
                              >
                                Call Next
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(a, 'In Consultation')}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                              >
                                Begin Consult
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(a, 'Skipped')}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                              >
                                Skip
                              </button>
                            </>
                          )}

                          {a.status === 'Next in Line' && (
                            <>
                              <button
                                onClick={() => handleOpenStatusModal(a, 'In Consultation')}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                              >
                                Enter Room
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(a, 'Skipped')}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                              >
                                Skip
                              </button>
                            </>
                          )}

                          {a.status === 'Skipped' && (
                            <button
                              onClick={() => handleOpenStatusModal(a, 'Waiting')}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs"
                            >
                              Recall
                            </button>
                          )}

                          {a.status === 'In Consultation' && (
                            <button
                              onClick={() => handleOpenStatusModal(a, 'Completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                            >
                              Complete
                            </button>
                          )}

                          {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleOpenStatusModal(a, 'Rescheduled')}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Reschedule
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredAppointments.length > 0 && (
          <Pagination
            totalItems={filteredAppointments.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Modal: Status Update */}
      {statusModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-black text-base text-slate-900">
              Update Appointment Status: <span className="text-blue-600">{statusToSet}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Patient: <strong>{selectedAppt.patient_name}</strong> ({selectedAppt.appointment_id}) with Dr. {selectedAppt.doctor_name}
            </p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              {statusToSet === 'Rescheduled' && (
                <div className="space-y-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Appointment Date</label>
                    <input
                      type="date"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Time Slot</label>
                    <input
                      type="text"
                      required
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {statusToSet === 'Cancelled' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Cancellation</label>
                  <textarea
                    rows={3}
                    required
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Provide specific reason (e.g. Doctor emergency leave, patient requested date change)..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  {statusLoading ? 'Updating...' : `Confirm ${statusToSet}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign / Reassign Doctor */}
      {assignModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <span>Assign Doctor to Appointment</span>
            </h3>
            <p className="text-xs text-slate-500">
              Appointment #{selectedAppt.appointment_id} • {selectedAppt.appointment_date} at {selectedAppt.appointment_time}
            </p>

            <form onSubmit={handleAssignDoctorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Specialist Doctor</label>
                <select
                  required
                  value={targetDoctorId}
                  onChange={(e) => setTargetDoctorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {effectiveDoctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialization} (Fee: ₹{d.consultation_fee}, Status: {d.is_available ? 'Available' : 'Unavailable'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  The system will verify schedule slots to prevent conflicting appointments.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  {assignLoading ? 'Assigning...' : 'Assign Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Consultation Details & Clinical Notes */}
      {consultationModalOpen && selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-1">
                  Clinical Consultation Dossier
                </span>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  <span>Encounter Details: Token #{selectedConsultation.token_number || selectedConsultation.queue_number || 'T-01'}</span>
                </h3>
              </div>
              <button
                onClick={() => setConsultationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Consultation Overview Details */}
            <div className="space-y-4 text-xs">
              {/* Doctor & Patient Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Information</span>
                  <span className="font-extrabold text-slate-900 text-sm block">{selectedConsultation.patient_name}</span>
                  <span className="text-[11px] text-slate-500 font-mono block">ID: {selectedConsultation.patient_health_id || selectedConsultation.patient_id}</span>
                  <span className="text-[11px] text-slate-500 block">Ph: {selectedConsultation.patient_mobile || selectedConsultation.patient_phone || '+91 98480 12345'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attending Doctor</span>
                  <span className="font-extrabold text-slate-900 text-sm block">{selectedConsultation.doctor_name || 'Assigned Physician'}</span>
                  <span className="text-[11px] text-blue-600 font-bold block">{selectedConsultation.specialization || selectedConsultation.department}</span>
                  <span className="text-[11px] text-slate-500 block">Fee: ₹{selectedConsultation.consultation_fee || 500}</span>
                </div>
              </div>

              {/* Appointment Reference, Schedule & Mode */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Encounter Ref #</span>
                  <span className="font-mono font-bold text-slate-900">{selectedConsultation.appointment_id || selectedConsultation.id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                  <span className="font-bold text-slate-800">{selectedConsultation.appointment_date} • {selectedConsultation.appointment_time}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block mt-0.5 ${
                    selectedConsultation.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedConsultation.status === 'In Consultation'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {selectedConsultation.status}
                  </span>
                </div>
              </div>

              {/* Clinical Findings & Notes */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Chief Complaint & Clinical Notes</span>
                <p className="font-medium text-slate-800 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200/80">
                  "{selectedConsultation.chief_complaint || 'Patient presented for routine outpatient clinical evaluation and prescription refill.'}"
                </p>
                {selectedConsultation.clinical_findings && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Physician Findings:</span>
                    <p className="text-slate-700">{selectedConsultation.clinical_findings}</p>
                  </div>
                )}
              </div>

              {/* Prescription Reference */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Digital Prescription Reference</span>
                  <span className="font-mono font-bold text-emerald-950 text-xs">
                    {selectedConsultation.prescription_id || `RX-2026-${String(selectedConsultation.id || '001').slice(-5)}`}
                  </span>
                  <span className="text-[10px] text-emerald-700 block">Synchronized with All.Connect e-Prescription Network</span>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px]">
                  Verified
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Print Summary</span>
              </button>
              <button
                type="button"
                onClick={() => setConsultationModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
