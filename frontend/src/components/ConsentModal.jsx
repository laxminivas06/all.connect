import React, { useState } from 'react';
import { api } from '../services/api';
import { X, ShieldCheck, Building2, Check, AlertTriangle } from 'lucide-react';

export const ConsentModal = ({ isOpen, onClose, currentConsents = [], availableOrgs = [], onUpdated }) => {
  const [selectedOrgs, setSelectedOrgs] = useState(currentConsents);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const toggleOrg = (orgId) => {
    if (selectedOrgs.includes(orgId)) {
      setSelectedOrgs(selectedOrgs.filter(id => id !== orgId));
    } else {
      setSelectedOrgs([...selectedOrgs, orgId]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateConsent({ permitted_organizations: selectedOrgs });
      setMessage('Record-sharing permissions updated successfully.');
      if (onUpdated) onUpdated(selectedOrgs);
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1000);
    } catch {
      setMessage('Failed to update consents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-teal-300" />
            <h3 className="font-bold text-sm">Medical Record Sharing & Consent Controls</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <p className="font-bold text-slate-800 mb-0.5">🔒 Patient-Controlled Privacy Protection</p>
            <p>
              Your medical history, diagnostic reports, and previous prescriptions will ONLY be accessible by healthcare providers checked below. Unchecked organizations will only see your basic demographic info.
            </p>
          </div>

          {message && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold text-center">
              {message}
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {availableOrgs.map((org) => {
              const isChecked = selectedOrgs.includes(org.id);
              return (
                <div
                  key={org.id}
                  onClick={() => toggleOrg(org.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                    isChecked ? 'bg-blue-50/70 border-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isChecked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{org.name}</p>
                      <p className="text-[10px] text-slate-500">{org.type} • {org.area}, Hyderabad</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md transition"
            >
              {loading ? 'Saving...' : 'Save Consent Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
