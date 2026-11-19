import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Sparkles,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Stethoscope,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const ProcedureEnquiryModal = ({ isOpen, onClose, procedure, organization, doctor }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    preferred_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.enquireProcedure({
        ...formData,
        procedure_name: procedure?.title || procedure?.name || 'Surgical Procedure',
        organization_id: organization?.id || doctor?.organization_id || 'hosp-001',
        doctor_id: doctor?.id || ''
      });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to submit procedure enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Request Procedure Consultation</h3>
              <p className="text-xs text-slate-400">Clinical Evaluation & Cost Counselling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Enquiry Submitted Successfully!</h4>
              <p className="text-xs text-emerald-400 font-mono mt-1">Ref ID: {result.enquiry?.enquiry_id}</p>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                {result.message} A senior patient coordinator will contact you to review medical eligibility and schedule pre-operative consultation.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Procedure Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{procedure?.title || procedure?.name || 'Surgical Procedure'}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {procedure?.department || 'Speciality Surgery'}
                </span>
              </div>
              {procedure?.avg_cost && (
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <span>Est. Cost:</span>
                  <span className="font-semibold text-emerald-400">{procedure.avg_cost}</span>
                  <span className="text-slate-500">({procedure.duration || 'Daycare'})</span>
                </div>
              )}
              {organization && (
                <div className="text-slate-400 text-[11px] flex items-center gap-1 pt-1 border-t border-slate-800/60">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{organization.name}</span>
                </div>
              )}
            </div>

            {/* Non-Diagnostic Surgery Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Clinical Notice:</strong> Actual surgical candidacy, implant selection, and clinical eligibility must be determined by a qualified specialist surgeon through pre-operative examination.
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Patient Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. Ramesh Reddy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={formData.patient_phone}
                      onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={formData.patient_email}
                    onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="ramesh@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Clinical Questions or Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Inquiring about insurance coverage or robotic surgery options..."
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting Enquiry...' : 'Submit Consultation Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default ProcedureEnquiryModal;
