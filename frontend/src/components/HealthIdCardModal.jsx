import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import {
  X,
  Shield,
  Printer,
  RotateCw,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const HealthIdCardModal = ({ isOpen, onClose, patient }) => {
  const [tokenData, setTokenData] = useState(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen && patient) {
      loadToken();
    }
  }, [isOpen, patient]);

  const loadToken = async () => {
    setLoadingToken(true);
    setError('');
    try {
      const res = await api.getMyPatientQrToken();
      setTokenData(res);
    } catch (err) {
      const fallbackToken = patient.qr_token || `pvt_${patient.patient_id}_${patient.health_id?.replace(/[^a-zA-Z0-9]/g, '')}`;
      setTokenData({
        qr_token: fallbackToken,
        verification_path: `/verify-patient?token=${fallbackToken}`,
        card_status: 'ACTIVE'
      });
    } finally {
      setLoadingToken(false);
    }
  };

  const handleRefreshQr = async () => {
    setRefreshing(true);
    setError('');
    setRefreshSuccess(false);
    try {
      const res = await api.refreshMyPatientQrToken();
      setTokenData(res);
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Unable to rotate token. Please verify patient session.');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (!isOpen || !patient) return null;

  const origin = window.location.origin;
  const qrVerificationUrl = tokenData?.qr_token
    ? `${origin}/verify-patient?token=${tokenData.qr_token}`
    : `${origin}/verify-patient?token=pvt_${patient.patient_id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">Universal Health ID Card</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smart Card Visual */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {refreshSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>QR security token regenerated and active.</span>
            </div>
          )}

          {/* Professional, Compact Universal Health ID Card */}
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 shadow-xl border border-blue-500/30"
          >
            {/* Background design accents */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar: All.Connect Branding */}
            <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md">
                  +
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight text-white leading-tight">All.Connect</h4>
                  <p className="text-[10px] text-blue-300 font-medium">Universal Health ID • Hyderabad EHR Mesh</p>
                </div>
              </div>
              <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30 tracking-wider">
                ACTIVE
              </span>
            </div>

            {/* Body of Card: Patient Name, Universal Health ID, and Genuine Scannable QR Code */}
            <div className="mt-4 flex items-center justify-between gap-4 relative z-10">
              
              <div className="space-y-2 flex-1 min-w-0">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">
                    Patient Name
                  </span>
                  <p className="font-black text-base sm:text-lg text-white leading-tight truncate">
                    {patient.full_name}
                  </p>
                </div>
                
                <div>
                  <span className="text-[9px] text-blue-300 uppercase tracking-wider block font-bold">
                    Universal Health ID
                  </span>
                  <p className="font-mono text-sm font-black text-amber-300 tracking-wider">
                    {patient.health_id}
                  </p>
                </div>
              </div>

              {/* Scannable Privacy-Safe QR Code */}
              <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white text-slate-900 shadow-md text-center shrink-0">
                {loadingToken ? (
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <QRCodeSVG
                    value={qrVerificationUrl}
                    size={80}
                    level="M"
                    includeMargin={false}
                    className="mx-auto"
                  />
                )}
                <span className="text-[8px] font-extrabold text-slate-700 tracking-tighter mt-1 block">
                  SCAN TO VERIFY
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
              <span>Secure Token Verification</span>
              <span className="text-slate-300 font-mono text-[9px]">{patient.patient_id}</span>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] text-slate-600 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Scanning this QR code verifies only patient name and Universal Health ID number. Private records are protected.</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleRefreshQr}
              disabled={refreshing}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Rotating...' : 'Rotate QR Token'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintCard}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Health ID</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HealthIdCardModal;
