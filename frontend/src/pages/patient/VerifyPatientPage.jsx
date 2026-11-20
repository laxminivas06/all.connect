import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Calendar,
  Lock,
  FileText,
  Activity,
  ArrowLeft,
  Loader2,
  Stethoscope,
  Clock
} from 'lucide-react';

export const VerifyPatientPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('No patient verification token provided in the scan request.');
      setLoading(false);
      return;
    }

    setLoading(true);
    api.verifyPatientCard(token)
      .then(res => {
        setVerificationData(res);
        setError('');
      })
      .catch(err => {
        setError(err.message || 'Invalid, revoked, or expired Patient ID verification token.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All.Connect Home</span>
          </Link>
          <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Patient Verification</span>
          </span>
        </div>

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-800">Verifying Digital Health ID...</h3>
            <p className="text-xs text-slate-500">Checking cryptographically signed patient identity token</p>
          </div>
        ) : error ? (
          <div className="p-10 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Verification Failed</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">{error}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border text-[11px] text-slate-500 max-w-sm mx-auto">
              If you are the card holder, please log in to your All.Connect portal and click <strong>Refresh QR Code</strong> to generate a fresh token.
            </div>
            <Link
              to="/profile"
              className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition"
            >
              Open Patient Portal
            </Link>
          </div>
        ) : verificationData ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in space-y-6 p-6 sm:p-8">
            
            {/* Verification Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    VERIFIED AUTHENTIC CARD
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {verificationData.patient_name}
                  </h2>
                  <p className="text-xs text-slate-500">Universal Healthcare Federation of Hyderabad</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Card Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block mt-0.5">
                  {verificationData.card_status || 'ACTIVE'}
                </span>
              </div>
            </div>

            {/* Core Patient Demographics Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Central Health ID</span>
                <span className="font-mono font-extrabold text-blue-700 text-sm">{verificationData.health_id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient ID</span>
                <span className="font-mono font-bold text-slate-800">{verificationData.patient_id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Gender</span>
                <span className="font-bold text-slate-800">{verificationData.gender || 'Not specified'}</span>
              </div>
              {verificationData.age && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Age</span>
                  <span className="font-bold text-slate-800">{verificationData.age} Years</span>
                </div>
              )}
              {verificationData.blood_group && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Group</span>
                  <span className="font-black text-rose-600">{verificationData.blood_group}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered Year</span>
                <span className="font-bold text-slate-800">{verificationData.registration_year || '2026'}</span>
              </div>
            </div>

            {/* PUBLIC CAMERA SCAN NOTICE (When scanned by a normal smartphone camera without provider login) */}
            {verificationData.is_safe_public_view && (
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Clinical Records Protected by Consent</span>
                </div>
                <p className="leading-relaxed">
                  This scan validates the authenticity of this patient&rsquo;s Digital Health ID Card. To view clinical records, diagnostic summaries, and prescription history, healthcare professionals must log in with authorized federation credentials and have patient consent.
                </p>
                {!user && (
                  <div className="pt-1">
                    <Link
                      to="/login"
                      className="inline-block px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition shadow-xs"
                    >
                      Healthcare Provider Login
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* AUTHORIZED CLINICAL DATA VIEW (When accessed by authorized healthcare provider with consent) */}
            {verificationData.authorized_access && (
              <div className="space-y-5 pt-2">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Authorized Clinical EHR Records</h3>
                </div>

                {/* Prescriptions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recent Digital Prescriptions ({verificationData.prescriptions?.length || 0})</span>
                  </h4>
                  {(!verificationData.prescriptions || verificationData.prescriptions.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No prescriptions recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {verificationData.prescriptions.slice(0, 3).map(p => (
                        <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{p.diagnosis || 'Clinical Prescription'}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{p.date || p.created_at?.slice(0, 10)}</span>
                          </div>
                          <p className="text-[11px] text-blue-700 font-medium">Prescribed by {p.doctor_name || 'Attending Physician'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Appointment History */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Consultation History ({verificationData.appointment_history?.length || 0})</span>
                  </h4>
                  {(!verificationData.appointment_history || verificationData.appointment_history.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No previous consultations recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {verificationData.appointment_history.slice(0, 3).map(a => (
                        <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800">{a.doctor_name}</p>
                            <p className="text-[11px] text-slate-500">{a.organization_name} • {a.appointment_date}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RESTRICTED CONSENT MESSAGE */}
            {verificationData.consent_status === 'RESTRICTED' && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Restricted Access: Patient Consent Required</span>
                </div>
                <p>
                  This patient is verified in the federation, but has not yet authorized medical record sharing with your organization. Please request consent through the organization dashboard.
                </p>
              </div>
            )}

            <div className="pt-2 text-center text-[11px] text-slate-400">
              Verified by All.Connect Centralized Healthcare Federation • Hyderabad
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default VerifyPatientPage;
