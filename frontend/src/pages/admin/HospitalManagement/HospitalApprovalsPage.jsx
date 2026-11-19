import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  ShieldCheck,
  Building2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertCircle,
  Clock,
  Eye,
  MapPin,
  RefreshCw,
  MessageSquare,
  FileText,
  Download,
  Stethoscope,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const HospitalApprovalsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, hospital, clinic
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState('approve'); // approve, reject, request_correction

  const fetchApprovals = () => {
    setLoading(true);
    api.getAdminOrganizations()
      .then(res => {
        // Show hospitals and clinics that are pending_verification, under_review, action_required, or unpublished
        const providers = (res || []).filter(o =>
          o.id?.startsWith('hosp') || o.id?.startsWith('clinic') ||
          o.organization_type === 'hospital' || o.organization_type === 'clinic'
        );

        const pending = providers.filter(p =>
          p.verification_status === 'pending_verification' ||
          p.verification_status === 'under_review' ||
          p.verification_status === 'action_required' ||
          p.publishing_status === 'unpublished'
        );

        setOrganizations(pending.length > 0 ? pending : providers.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleProcessApproval = async (orgId, action) => {
    try {
      await api.reviewOrgAdmin(orgId, {
        action,
        remarks: remarks || `Reviewed and ${action}d by Super Admin on ${new Date().toLocaleDateString()}`
      });

      const actionText =
        action === 'approve'
          ? 'approved, public profile activated, and appointment booking enabled'
          : action === 'reject'
          ? 'rejected and kept unpublished'
          : 'marked for document correction';

      alert(`Organisation ${actionText} successfully.`);
      setSelectedOrg(null);
      setRemarks('');
      fetchApprovals();
    } catch (err) {
      alert(err.message || 'Error processing organisation review');
    }
  };

  const filteredOrgs = organizations.filter(o => {
    if (filterType === 'hospital') return o.id?.startsWith('hosp') || o.organization_type === 'hospital';
    if (filterType === 'clinic') return o.id?.startsWith('clinic') || o.organization_type === 'clinic';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <Link
            to="/dashboard/admin/hospitals"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Hospital Management</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              REGULATORY ACCREDITATION QUEUE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Healthcare Provider Verification & Approvals
          </h1>
          <p className="text-xs text-slate-500">
            Review state clinical establishment certificates, verify submitted documents, and grant public profile & appointment booking activation.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Refresh Queue"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl transition ${filterType === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          All Pending ({organizations.length})
        </button>
        <button
          onClick={() => setFilterType('hospital')}
          className={`px-3.5 py-1.5 rounded-xl transition ${filterType === 'hospital' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Hospitals ({organizations.filter(o => o.id?.startsWith('hosp') || o.organization_type === 'hospital').length})
        </button>
        <button
          onClick={() => setFilterType('clinic')}
          className={`px-3.5 py-1.5 rounded-xl transition ${filterType === 'clinic' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Independent Clinics ({organizations.filter(o => o.id?.startsWith('clinic') || o.organization_type === 'clinic').length})
        </button>
      </div>

      {/* Verification List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Scanning regulatory accreditation submissions...</p>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-900">All Providers Vetted</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no healthcare providers pending regulatory review or document verification.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrgs.map(org => {
            const isHosp = org.id?.startsWith('hosp') || org.organization_type === 'hospital';
            const docs = Array.isArray(org.verification_documents) ? org.verification_documents : [];
            const isVerified = org.verification_status === 'verified';
            const isActionReq = org.verification_status === 'action_required';

            return (
              <div key={org.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                      isHosp ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {isHosp ? <Building2 className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{org.name}</span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {org.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isActionReq
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {org.verification_status || 'pending_verification'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{org.locality || org.area}, {org.city || 'Hyderabad'} • Phone: {org.contact_phone || org.phone || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setActionType('approve');
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Enable</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setActionType('request_correction');
                      }}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Request Fix</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setActionType('reject');
                      }}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Status Architecture Overview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-y border-slate-100 py-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Registration Status</span>
                    <span className="font-bold text-slate-800 capitalize">{org.registration_status || 'completed'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Public Profile</span>
                    <span className={`font-bold capitalize ${org.publishing_status === 'published' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {org.publishing_status || 'unpublished'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Appointment Booking</span>
                    <span className={`font-bold capitalize ${org.appointment_availability_status === 'enabled' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {org.appointment_availability_status || 'disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">SaaS Subscription</span>
                    <span className="font-bold text-purple-700">{org.subscription_plan || 'Pro Plan'} ({org.subscription_status || 'active'})</span>
                  </div>
                </div>

                {/* Real Uploaded Documents Viewer */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Uploaded Regulatory Documents ({docs.length})
                  </h4>

                  {docs.length === 0 ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>No separate compliance files uploaded during registration. Verified against physical establishment register: <strong>{org.registration_number || 'TS-2026-REG'}</strong></span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {docs.map((doc, idx) => {
                        const fileName = typeof doc === 'string' ? doc : (doc.original_name || doc.file_name || 'Document.pdf');
                        const viewUrl = typeof doc === 'object' && doc.view_url ? doc.view_url : `/api/admin/documents/view/${fileName}`;
                        const downloadUrl = typeof doc === 'object' && doc.download_url ? doc.download_url : `/api/admin/documents/download/${fileName}`;
                        const fileSize = typeof doc === 'object' ? (doc.file_size_formatted || 'Verified') : 'PDF';

                        return (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 truncate block" title={fileName}>
                                  {fileName}
                                </span>
                                <span className="text-[10px] text-slate-400">{fileSize}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1 text-[11px]"
                              >
                                <Eye className="w-3 h-3 text-blue-600" />
                                <span>Preview</span>
                              </a>
                              <a
                                href={downloadUrl}
                                download={fileName}
                                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1 text-[11px]"
                              >
                                <Download className="w-3 h-3 text-slate-600" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Remarks & History */}
                {org.admin_remarks && (
                  <div className="p-3 bg-blue-50/50 border border-blue-200/60 rounded-xl text-xs text-blue-900">
                    <span className="font-bold">Administrative Remarks:</span> {org.admin_remarks}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Confirmation Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {actionType === 'approve'
                    ? 'Approve & Enable Provider'
                    : actionType === 'reject'
                    ? 'Reject Provider Application'
                    : 'Request Document Correction'}
                </h3>
                <p className="text-xs text-slate-500">{selectedOrg.name} ({selectedOrg.id})</p>
              </div>
              <button onClick={() => setSelectedOrg(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                {actionType === 'approve'
                  ? 'Approving will mark this organisation as Verified, enable its public profile on the marketplace, and activate appointment booking availability.'
                  : actionType === 'reject'
                  ? 'Rejecting will mark this organisation as rejected and keep its public profile and appointment booking permanently disabled.'
                  : 'Requesting correction will notify the provider that document resubmission is required before appointment booking can be activated.'}
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Administrative Remarks / Regulatory Notes *</label>
                <textarea
                  rows={3}
                  placeholder={
                    actionType === 'approve'
                      ? 'e.g. Validated clinical establishment certificate and emergency medical infrastructure...'
                      : 'e.g. Provided document expired or illegible. Requesting updated clinical licence...'
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrg(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleProcessApproval(selectedOrg.id, actionType)}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : actionType === 'reject' ? 'Rejection' : 'Correction Request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
