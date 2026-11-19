import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  Stethoscope,
  ChevronLeft,
  CheckCircle2,
  Building2,
  PlusCircle,
  Clock,
  DollarSign
} from 'lucide-react';

export const DoctorRegisterPage = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdDoctor, setCreatedDoctor] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    qualification: 'MBBS, MD',
    specialty: 'Cardiology',
    registration_number: '',
    experience_years: 12,
    consultation_fee: 700,
    hospital_id: 'hosp-001',
    hospital_name: 'Apollo Health City - Jubilee Hills',
    clinic_affiliations: [],
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    time_slots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
    verification_status: 'verified'
  });

  useEffect(() => {
    api.getAdminOrganizations().then(res => {
      const hosps = (res || []).filter(o => o.id?.startsWith('hosp'));
      const clns = (res || []).filter(o => o.id?.startsWith('clinic'));
      setHospitals(hosps);
      setClinics(clns);
      if (hosps.length > 0) {
        setFormData(prev => ({
          ...prev,
          hospital_id: hosps[0].id,
          hospital_name: hosps[0].name
        }));
      }
    }).catch(console.error);
  }, []);

  const handleHospitalChange = (e) => {
    const selectedId = e.target.value;
    const selectedHosp = hospitals.find(h => h.id === selectedId);
    setFormData({
      ...formData,
      hospital_id: selectedId,
      hospital_name: selectedHosp ? selectedHosp.name : 'Independent Practice'
    });
  };

  const handleClinicToggle = (clinicId) => {
    setFormData(prev => ({
      ...prev,
      clinic_affiliations: prev.clinic_affiliations.includes(clinicId)
        ? prev.clinic_affiliations.filter(c => c !== clinicId)
        : [...prev.clinic_affiliations, clinicId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name) {
      alert('Please enter doctor full name');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.registerDoctorAdmin(formData);
      setCreatedDoctor(res.doctor);
    } catch (err) {
      alert(err.message || 'Error registering doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdDoctor) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Doctor Credentialed Successfully</h2>
        <p className="text-xs text-slate-500 font-mono">Assigned Doctor ID: {createdDoctor.id}</p>
        <p className="text-xs text-slate-600">{createdDoctor.full_name} ({createdDoctor.specialty})</p>
        <div className="pt-2">
          <Link
            to="/dashboard/admin/doctors"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
          >
            Back to Doctor Registry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      
      {/* Back button */}
      <Link
        to="/dashboard/admin/doctors"
        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Doctors</span>
      </Link>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onboard Medical Specialist</h1>
          <p className="text-xs text-slate-500">
            Register specialist doctors with support for multiple hospital and clinic practice affiliations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Doctor Full Name (with Title) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Sudhir Reddy, MD"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Clinical Specialty *</label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Dermatology">Dermatology</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Medical Registration Number (State Council) *</label>
              <input
                type="text"
                required
                placeholder="e.g. TSMC-2019-9418"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Years of Clinical Experience</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 5 })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Hospital Affiliation</label>
              <select
                value={formData.hospital_id}
                onChange={handleHospitalChange}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Standard OPD Consultation Fee (₹)</label>
              <input
                type="number"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseInt(e.target.value) || 500 })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-indigo-700"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-2">Additional Visiting Clinic Affiliations (Multi-Practice Support)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {clinics.map(c => {
                const isChecked = formData.clinic_affiliations.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleClinicToggle(c.id)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                      isChecked
                        ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{c.area}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Link
              to="/dashboard/admin/doctors"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Onboarding...' : 'Onboard Specialist'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
