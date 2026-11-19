import React from 'react';
import { X, QrCode, Shield, Heart, Phone, MapPin, Printer } from 'lucide-react';

export const HealthIdCardModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Universal Digital Health Card</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Smart Card Visual */}
        <div className="p-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-5 shadow-xl border border-blue-500/30">
            {/* Background watermarks */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white select-none">
              AC
            </div>

            {/* Top Bar of Card */}
            <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  +
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-white leading-tight">AllConnect Centralized</h4>
                  <p className="text-[9px] text-blue-300 font-medium">Healthcare Federation • Hyderabad</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Body of Card */}
            <div className="mt-4 grid grid-cols-3 gap-3 relative z-10">
              <div className="col-span-2 space-y-1.5">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Patient Identity</span>
                <p className="font-extrabold text-base text-white leading-tight">{patient.full_name}</p>
                
                <div className="pt-1">
                  <span className="text-[9px] text-blue-300 uppercase tracking-wider block">Central Health ID:</span>
                  <p className="font-mono text-sm font-black text-amber-300 tracking-wider">{patient.health_id}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Patient ID: {patient.patient_id}</p>
                </div>

                <div className="pt-2 flex items-center space-x-3 text-[11px] text-slate-300">
                  <span>Age: <strong>{patient.age}y</strong></span>
                  <span>•</span>
                  <span>Gender: <strong>{patient.gender}</strong></span>
                  <span>•</span>
                  <span>Blood: <strong className="text-rose-400">{patient.blood_group}</strong></span>
                </div>
              </div>

              {/* QR Code Simulation */}
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white text-slate-900 shadow-sm text-center">
                <QrCode className="w-16 h-16 text-slate-900" />
                <span className="text-[8px] font-bold text-slate-500 tracking-tighter mt-1">SCAN FOR EHR</span>
              </div>
            </div>

            {/* Emergency & Area Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                {patient.area}, Hyderabad
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <Phone className="w-3 h-3 text-emerald-400" />
                {patient.emergency_contact?.phone || patient.mobile}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-blue-900 flex items-center gap-1">
              <span>💡 Centralized Cross-Hospital Recognition:</span>
            </p>
            <p>
              Present this Health ID at any participating hospital or clinic in Hyderabad. Healthcare providers can only access records that you have explicitly authorized in your consent settings.
            </p>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
