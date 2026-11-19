import React, { useState } from 'react';
import {
  Stethoscope,
  PlusCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  Edit,
  Trash2,
  Phone,
  Mail,
  Award,
  DollarSign,
  Coffee,
  X,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';

export const DoctorsTab = ({
  doctors = [],
  appointments = [],
  isSingleDoctor = false,
  orgType = 'hospital',
  data = null,
  initialView = 'all',
  onRefresh,
  addDoctorOpen,
  setAddDoctorOpen
}) => {
  const effectiveDoctors = doctors.length > 0 ? doctors : (data?.doctors || []);
  const effectiveAppointments = appointments.length > 0 ? appointments : (data?.recent_appointments || []);
  const singleDoc = isSingleDoctor || data?.is_single_doctor;

  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState(
    initialView === 'assignments' && effectiveDoctors.length > 0 ? effectiveDoctors[0] : null
  );
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(initialView === 'availability');
  const [selectedDoctorForAvail, setSelectedDoctorForAvail] = useState(
    initialView === 'availability' && effectiveDoctors.length > 0 ? effectiveDoctors[0] : null
  );

  // Add Doctor Form State
  const [doctorForm, setDoctorForm] = useState({
    name: 'Dr. ',
    profile_photo_url: '',
    qualifications: 'MBBS, MD',
    specialization: 'General Medicine',
    department: 'General Medicine',
    medical_registration_number: 'TSMC-',
    experience_years: 6,
    contact_number: '+91 98490 ',
    email: '',
    consultation_fee: 600,
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    working_hours: '09:30 AM - 05:30 PM',
    break_times: '01:00 PM - 02:00 PM',
    appointment_duration: 15,
    slot_limits: 25,
    services_offered: 'Comprehensive outpatient clinical review, diagnosis, and prescription management.',
    description: 'Experienced specialist dedicated to patient-centered evidence-based care.',
    password: 'Doctor@123'
  });
  const [addDoctorLoading, setAddDoctorLoading] = useState(false);

  // Availability Form State
  const [availForm, setAvailForm] = useState({
    is_available: true,
    is_on_leave: false,
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    working_hours: '09:30 AM - 05:30 PM',
    break_times: '01:00 PM - 02:00 PM',
    appointment_duration: 15,
    slot_limits: 25
  });
  const [availLoading, setAvailLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleOpenAvailability = (doc) => {
    setSelectedDoctorForAvail(doc);
    setAvailForm({
      is_available: doc.is_available !== false,
      is_on_leave: doc.is_on_leave === true,
      available_days: doc.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      working_hours: doc.working_hours || '09:30 AM - 05:30 PM',
      break_times: doc.break_times || '01:00 PM - 02:00 PM',
      appointment_duration: doc.appointment_duration || 15,
      slot_limits: doc.slot_limits || 25
    });
    setAvailabilityModalOpen(true);
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorForAvail) return;
    setAvailLoading(true);
    try {
      await api.updateDoctorAvailability(selectedDoctorForAvail.id, availForm);
      setAvailabilityModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error updating doctor availability');
    } finally {
      setAvailLoading(false);
    }
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    setAddDoctorLoading(true);
    try {
      await api.createDoctor(doctorForm);
      setAddDoctorOpen(false);
      setDoctorForm({
        name: 'Dr. ',
        profile_photo_url: '',
        qualifications: 'MBBS, MD',
        specialization: 'General Medicine',
        department: 'General Medicine',
        medical_registration_number: 'TSMC-',
        experience_years: 6,
        contact_number: '+91 98490 ',
        email: '',
        consultation_fee: 600,
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        working_hours: '09:30 AM - 05:30 PM',
        break_times: '01:00 PM - 02:00 PM',
        appointment_duration: 15,
        slot_limits: 25,
        services_offered: 'Comprehensive outpatient clinical review, diagnosis, and prescription management.',
        description: 'Experienced specialist dedicated to patient-centered evidence-based care.',
        password: 'Doctor@123'
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to add doctor');
    } finally {
      setAddDoctorLoading(false);
    }
  };

  const toggleDay = (day) => {
    setAvailForm(prev => {
      const exists = prev.available_days.includes(day);
      return {
        ...prev,
        available_days: exists
          ? prev.available_days.filter(d => d !== day)
          : [...prev.available_days, day]
      };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Doctor Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span>Doctor Management & Clinical Roster</span>
          </h3>
          <p className="text-xs text-slate-500">
            {singleDoc
              ? 'Dedicated solo physician practice profile and schedule controls'
              : `Manage clinical credentials, OPD hours, and schedules for ${effectiveDoctors.length} doctors`}
          </p>
        </div>

        <button
          onClick={() => setAddDoctorOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 self-start sm:self-auto transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Doctor Cards Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {effectiveDoctors.map(doc => {
          const docAppts = effectiveAppointments.filter(a => a.doctor_id === doc.id);
          const completedCount = docAppts.filter(a => a.status === 'Completed').length;
          const pendingCount = docAppts.filter(a => ['Pending', 'Confirmed', 'Waiting', 'In Consultation'].includes(a.status)).length;

          return (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
              <div className="p-5 space-y-4">
                
                {/* Top Badge & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-extrabold text-base shrink-0 overflow-hidden">
                      {doc.profile_photo_url ? (
                        <img src={doc.profile_photo_url} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        doc.name?.split(' ')?.[1]?.[0] || 'D'
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-blue-700 font-semibold">{doc.specialization}</p>
                      <p className="text-[10px] text-slate-400">Reg: {doc.medical_registration_number || 'TSMC-Verified'}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doc.is_on_leave
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : doc.is_available !== false
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {doc.is_on_leave ? 'On Leave' : doc.is_available !== false ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Experience:</span>
                    <span className="font-bold text-slate-800">{doc.experience_years || 5} Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Consultation Fee:</span>
                    <span className="font-extrabold text-slate-900">₹{doc.consultation_fee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">OPD Hours:</span>
                    <span className="font-medium text-slate-700 text-[11px] truncate">{doc.working_hours || '09:30 AM - 05:30 PM'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Duration:</span>
                    <span className="font-medium text-slate-700">{doc.appointment_duration || 15} mins / patient</span>
                  </div>
                </div>

                {/* Performance Counters */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                    <span className="text-xs font-black text-blue-700 block">{pendingCount}</span>
                    <span className="text-[10px] text-blue-600 font-semibold">Pending / Active</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-xs font-black text-emerald-700 block">{completedCount}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Completed Consults</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDoctorForDetails(doc)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition"
                >
                  View Dossier
                </button>
                <button
                  onClick={() => handleOpenAvailability(doc)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                >
                  Update Schedule
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Doctor */}
      {addDoctorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <span>Register Specialist Doctor Account</span>
              </h3>
              <button
                onClick={() => setAddDoctorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. Rajesh Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.qualifications}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualifications: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="MBBS, MD (Medicine), DM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Specialisation *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Cardiology, Pediatrics, Dermatology"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Registration Number (State/NMC) *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.medical_registration_number}
                    onChange={(e) => setDoctorForm({ ...doctorForm, medical_registration_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. TSMC-45892"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={doctorForm.experience_years}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience_years: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={doctorForm.consultation_fee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slot Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={doctorForm.appointment_duration}
                    onChange={(e) => setDoctorForm({ ...doctorForm, appointment_duration: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.contact_number}
                    onChange={(e) => setDoctorForm({ ...doctorForm, contact_number: e.target.value, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Email (Login Username) *</label>
                  <input
                    type="email"
                    required
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="doctor@healthcare.org"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={doctorForm.working_hours}
                    onChange={(e) => setDoctorForm({ ...doctorForm, working_hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="09:30 AM - 05:30 PM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Login Password *</label>
                  <input
                    type="password"
                    required
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                    placeholder="Secure password (hashed via PBKDF2)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Bio & Description</label>
                <textarea
                  rows={2}
                  value={doctorForm.description}
                  onChange={(e) => setDoctorForm({ ...doctorForm, description: e.target.value, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Security & Encryption Guarantee</span>
                </p>
                <p className="text-[11px] text-blue-700">
                  A unique Doctor ID will be automatically generated. Passwords are never stored in plaintext and are protected via 100,000 PBKDF2 iterations.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddDoctorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addDoctorLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  {addDoctorLoading ? 'Registering Doctor...' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Doctor Availability & Schedules */}
      {availabilityModalOpen && selectedDoctorForAvail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Update Availability: {selectedDoctorForAvail.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedDoctorForAvail.specialization}</p>
              </div>
              <button
                onClick={() => setAvailabilityModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
              
              {/* Toggles for Availability and Leave */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">OPD Active:</span>
                  <input
                    type="checkbox"
                    checked={availForm.is_available}
                    onChange={(e) => setAvailForm({ ...availForm, is_available: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">On Leave:</span>
                  <input
                    type="checkbox"
                    checked={availForm.is_on_leave}
                    onChange={(e) => setAvailForm({ ...availForm, is_on_leave: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Working Days Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Available Consultation Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map(day => {
                    const active = availForm.available_days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          active
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={availForm.working_hours}
                    onChange={(e) => setAvailForm({ ...availForm, working_hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Break Times</label>
                  <input
                    type="text"
                    value={availForm.break_times}
                    onChange={(e) => setAvailForm({ ...availForm, break_times: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={availForm.appointment_duration}
                    onChange={(e) => setAvailForm({ ...availForm, appointment_duration: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Slot Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={availForm.slot_limits}
                    onChange={(e) => setAvailForm({ ...availForm, slot_limits: parseInt(e.target.value) || 25 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAvailabilityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  {availLoading ? 'Saving...' : 'Save Availability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Doctor Dossier */}
      {selectedDoctorForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>Specialist Credential Dossier</span>
              </h3>
              <button
                onClick={() => setSelectedDoctorForDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                  {selectedDoctorForDetails.name?.split(' ')?.[1]?.[0] || 'D'}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedDoctorForDetails.name}</h4>
                  <p className="text-xs text-blue-600 font-bold">{selectedDoctorForDetails.specialization}</p>
                  <p className="text-slate-500 text-[11px]">{selectedDoctorForDetails.qualifications}</p>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedDoctorForDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">State Medical Council Reg #:</span>
                  <span className="font-bold text-slate-900">{selectedDoctorForDetails.medical_registration_number || 'TSMC-Verified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Consultation Fee:</span>
                  <span className="font-extrabold text-emerald-700">₹{selectedDoctorForDetails.consultation_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-bold text-slate-900">{selectedDoctorForDetails.experience_years} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">OPD Days:</span>
                  <span className="font-semibold text-slate-700">{selectedDoctorForDetails.available_days?.join(', ') || 'Mon - Sat'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Working Hours:</span>
                  <span className="font-semibold text-slate-700">{selectedDoctorForDetails.working_hours}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Clinical Bio:</span>
                <p className="text-slate-700 leading-relaxed italic">{selectedDoctorForDetails.description || selectedDoctorForDetails.bio}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedDoctorForDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
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
