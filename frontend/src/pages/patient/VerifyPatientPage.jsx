import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Lock
} from 'lucide-react';

export const VerifyPatientPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ID Verification</span>
          </span>
        </div>

        {loading ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-800">Verifying Digital Health ID...</h3>
            <p className="text-xs text-slate-500">Checking secure patient verification token</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Verification Failed</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">{error}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 max-w-sm mx-auto">
              If you are the card holder, sign in to your All.Connect portal to view your card or rotate your QR code.
            </div>
            <Link
              to="/profile"
              className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition"
            >
              Open Health Profile
            </Link>
          </div>
        ) : verificationData ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in space-y-6 p-6 sm:p-8 text-center">
            
            {/* Verification Success Icon */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                VERIFIED AUTHENTIC CARD
              </span>
              <p className="text-xs text-slate-400 pt-1">All.Connect Centralized Healthcare Federation</p>
            </div>

            {/* ONLY DISPLAY: 1. Patient Name, 2. Universal Health ID Number */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Patient Legal Name
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {verificationData.patient_name || 'Verified Patient'}
                </h2>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-blue-600 uppercase font-extrabold tracking-wider block">
                  Universal Health ID Number
                </span>
                <span className="font-mono font-black text-blue-800 text-base sm:text-lg block mt-0.5">
                  {verificationData.health_id || 'HC-PENDING'}
                </span>
              </div>
            </div>

            {/* Privacy Confirmation Notice */}
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-slate-600 flex items-center gap-2.5 text-left">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-[11px] leading-relaxed">
                Privacy Protected: Scans verify identity and card authenticity only. Personal contact details and clinical records are never exposed.
              </span>
            </div>

            <div className="pt-1 text-[11px] text-slate-400">
              Hyderabad EHR Mesh • Telangana
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default VerifyPatientPage;
