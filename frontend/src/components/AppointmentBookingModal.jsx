import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, User, CheckCircle2, AlertCircle, Building2, Stethoscope, CreditCard } from 'lucide-react';

export const AppointmentBookingModal = ({
  isOpen,
  onClose,
  initialDoctor = null,
  initialHospital = null,
  initialDate = null,
  initialTime = null,
  onSuccess,
  onBookingSuccess
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingDoctorDetails, setFetchingDoctorDetails] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctor);
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(initialTime || '');
  const [appointmentType, setAppointmentType] = useState('In-Person');
  const [complaint, setComplaint] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessData(null);
      setStep(1);
      if (initialDate) setSelectedDate(initialDate);
      if (initialTime) setSelectedSlot(initialTime);

      const targetDocId = typeof initialDoctor === 'string' ? initialDoctor : initialDoctor?.id;
      if (targetDocId) {
        setFetchingDoctorDetails(true);
        api.getDoctor(targetDocId)
          .then(data => {
            const docObj = data.doctor || data;
            setSelectedDoctor(docObj);
            if (!initialTime) {
              setSelectedSlot(docObj.available_slots ? docObj.available_slots[0] : '10:00 AM');
            }
          })
          .catch(() => {
            if (typeof initialDoctor === 'object') setSelectedDoctor(initialDoctor);
          })
          .finally(() => setFetchingDoctorDetails(false));
      } else {
        setFetchingDoctorDetails(true);
        api.getDoctors()
          .then(docs => {
            setDoctorsList(docs || []);
            if (docs && docs.length > 0) {
              setSelectedDoctor(docs[0]);
              if (!initialTime) {
                setSelectedSlot(docs[0].available_slots ? docs[0].available_slots[0] : '10:00 AM');
              }
            }
          })
          .finally(() => setFetchingDoctorDetails(false));
      }
    }
  }, [isOpen, initialDoctor, initialDate, initialTime]);

  if (!isOpen) return null;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setError('Please select a doctor');
      return;
    }
    if (!selectedSlot) {
      setError('Please select an available time slot');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        doctor_id: selectedDoctor.id,
        organization_id: selectedDoctor.organization_id,
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        appointment_type: appointmentType,
        chief_complaint: complaint || 'General Consultation'
      };

      const res = await api.bookAppointment(payload);
      setSuccessData(res.appointment);
      setStep(2);
      if (onSuccess) onSuccess(res.appointment);
      if (onBookingSuccess) onBookingSuccess(res.appointment);
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Double booking detected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base">Book Doctor Appointment</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleBook} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Doctor Selection */}
            {!initialDoctor && doctorsList.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Doctor & Department</label>
                <select
                  value={selectedDoctor?.id || ''}
                  onChange={(e) => {
                    const doc = doctorsList.find(d => d.id === e.target.value);
                    setSelectedDoctor(doc);
                    if (doc?.available_slots) setSelectedSlot(doc.available_slots[0]);
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {doctorsList.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialization} ({doc.organization_name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected Doctor Summary Card with Skeleton Loader */}
            {fetchingDoctorDetails ? (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-pulse space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-2.5 bg-slate-200 rounded w-1/4" />
              </div>
            ) : selectedDoctor ? (
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{selectedDoctor.name}</p>
                  <p className="text-[11px] text-blue-700 font-medium">{selectedDoctor.specialization} • {selectedDoctor.organization_name}</p>
                  <p className="text-[10px] text-slate-500">{selectedDoctor.qualifications}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 block">₹{selectedDoctor.consultation_fee}</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Locked Fee</span>
                </div>
              </div>
            ) : null}

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Type</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="In-Person">In-Person OPD</option>
                  <option value="Teleconsultation">Video Consultation</option>
                  <option value="Follow-Up">Follow-Up Review</option>
                </select>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Select Available Time Slot</span>
                <span className="text-[10px] text-slate-400 font-normal">Real-time availability</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(selectedDoctor?.available_slots || ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '04:00 PM', '05:30 PM']).map(slot => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-2 text-xs rounded-xl border text-center font-medium transition ${
                      selectedSlot === slot
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Complaint */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chief Health Concern / Symptoms</label>
              <input
                type="text"
                placeholder="e.g. Chest discomfort, routine checkup, diabetes review"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || fetchingDoctorDetails}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Slot Reservation...' : fetchingDoctorDetails ? 'Loading Doctor Details...' : `Confirm & Pay ₹${selectedDoctor?.consultation_fee || 500}`}
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-2">
                🔒 Prevents double-booking automatically across the centralized mesh.
              </p>
            </div>
          </form>
        ) : (
          /* Confirmation Step */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">Appointment Confirmed!</h4>
              <p className="text-xs text-slate-500 mt-0.5">Your booking ID is <span className="font-mono font-bold text-blue-700">{successData?.appointment_id}</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold text-slate-800">{successData?.doctor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hospital / Clinic:</span>
                <span className="font-semibold text-slate-800">{successData?.organization_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-semibold text-slate-800">{successData?.appointment_date} at {successData?.appointment_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient Health ID:</span>
                <span className="font-mono font-semibold text-blue-600">{successData?.patient_health_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition"
            >
              Done & View Appointments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
