import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Lock,
  Bell,
  Building2,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DoctorSettingsTab = ({ data }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState(null);

  const [roomNumber, setRoomNumber] = useState('OPD Consultation Suite #04');
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [alertNotice, setAlertNotice] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordNotice(null);
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordNotice({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword({
        current_password: oldPassword,
        new_password: newPassword
      });
      setPasswordNotice({ type: 'success', message: 'Doctor credentials updated successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordNotice({ type: 'error', message: err.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveAlerts = (e) => {
    e.preventDefault();
    setAlertNotice('Workstation alert preferences saved!');
    setTimeout(() => setAlertNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Doctor Console Settings & Clinical Security</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure consultation suite room assignment, patient queue alerts, and password security
          </p>
        </div>
      </div>

      {/* Workstation & Alerts */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Workstation Configuration</h3>

        {alertNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertNotice}</span>
          </div>
        )}

        <form onSubmit={handleSaveAlerts} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Consultation Bay / Room Location *</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full sm:w-96 px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="font-extrabold text-slate-700 block text-xs">Real-Time Patient Queue Alerts</span>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sms"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="sms" className="font-medium text-slate-700">SMS notification on emergency appointments</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="email"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="email" className="font-medium text-slate-700">Daily appointment schedule briefing via Email</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="wa"
                checked={notifyWhatsApp}
                onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
              <label htmlFor="wa" className="font-medium text-slate-700">WhatsApp instant ping when next patient checks into bay</label>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Save Workstation Settings
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">Security & Password</h3>

        {passwordNotice && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              passwordNotice.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {passwordNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{passwordNotice.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            {passwordLoading ? 'Updating Password...' : 'Save Password'}
          </button>
        </form>
      </div>

      {/* Sign Out Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900">Sign Out of Doctor Console</h4>
          <p className="text-xs text-slate-500">Securely conclude your clinical workstation session</p>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSettingsTab;
