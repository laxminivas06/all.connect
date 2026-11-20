import React, { useState } from 'react';
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Award,
  DollarSign,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const DoctorProfileTab = ({ data, onSaveProfile }) => {
  const doctor = data?.doctor || {};

  const [form, setForm] = useState({
    name: doctor.name || '',
    qualifications: doctor.qualifications || 'MBBS, MD',
    specialization: doctor.specialization || 'Cardiology',
    department: doctor.department || 'Cardiology',
    experience_years: doctor.experience_years || '12',
    consultation_fee: doctor.consultation_fee || '600',
    video_consultation_fee: doctor.video_consultation_fee || '500',
    registration_number: doctor.registration_number || 'TSMC-64821',
    languages: doctor.languages || 'English, Telugu, Hindi',
    bio: doctor.bio || 'Consultant specialist providing comprehensive outpatient care.'
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      if (onSaveProfile) {
        await onSaveProfile(form);
      }
      setNotice({ type: 'success', message: 'Doctor clinical profile updated successfully!' });
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Doctor Credentials & Professional Practice Profile</span>
          </h2>
          <p className="text-xs text-slate-500">
            Certified qualifications, Medical Council registration number, consultation fees, and public bio
          </p>
        </div>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Legal & Display Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Medical Registration Number (TSMC) *</label>
            <input
              type="text"
              required
              value={form.registration_number}
              onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Specialization *</label>
            <input
              type="text"
              required
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Medical Qualifications *</label>
            <input
              type="text"
              required
              value={form.qualifications}
              onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
              placeholder="e.g. MBBS, MD, DM (Cardiology)"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Experience (Years) *</label>
            <input
              type="number"
              required
              value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Spoken Languages</label>
            <input
              type="text"
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">OPD Consultation Fee (₹) *</label>
            <input
              type="number"
              required
              value={form.consultation_fee}
              onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tele/Video Consultation Fee (₹) *</label>
            <input
              type="number"
              required
              value={form.video_consultation_fee}
              onChange={(e) => setForm({ ...form, video_consultation_fee: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="font-bold text-slate-700 block mb-1">Doctor Biography & Practice Highlights</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfileTab;
