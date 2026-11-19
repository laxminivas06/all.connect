import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Settings,
  Clock,
  Calendar,
  Bell,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Users,
  KeyRound,
  X
} from 'lucide-react';

export const SettingsTab = ({ orgType = 'hospital', data, onRefresh }) => {
  const isHospital = orgType === 'hospital';
  const org = data?.hospital || data?.clinic || {};

  // Settings State
  const [settings, setSettings] = useState({
    slot_duration_minutes: org.settings?.slot_duration_minutes || 20,
    buffer_minutes: org.settings?.buffer_minutes || 5,
    max_advance_days: org.settings?.max_advance_days || 14,
    auto_confirm_appointments: org.settings?.auto_confirm_appointments !== undefined ? org.settings.auto_confirm_appointments : true,
    allow_doctor_leave_request: org.settings?.allow_doctor_leave_request !== undefined ? org.settings.allow_doctor_leave_request : true,
    allow_doctor_schedule_edit: org.settings?.allow_doctor_schedule_edit !== undefined ? org.settings.allow_doctor_schedule_edit : true,
    notify_patient_sms: org.settings?.notify_patient_sms !== undefined ? org.settings.notify_patient_sms : true,
    notify_admin_email: org.settings?.notify_admin_email !== undefined ? org.settings.notify_admin_email : true,
    queue_delay_alert_threshold: org.settings?.queue_delay_alert_threshold || 30
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  // Password Change State
  const [pwdData, setPwdData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdError, setPwdError] = useState(null);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg(null);
    setSettingsError(null);

    try {
      if (isHospital) {
        await api.updateHospitalSettings({ settings });
      } else {
        await api.updateClinicSettings({ settings });
      }
      setSettingsMsg('Operational preferences updated successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      setSettingsError(err.message || 'Failed to update preferences.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    setPwdError(null);

    if (pwdData.new_password.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (pwdData.new_password !== pwdData.confirm_password) {
      setPwdError('New password and confirmation do not match.');
      return;
    }

    setChangingPwd(true);
    try {
      await api.changePassword({
        current_password: pwdData.current_password,
        new_password: pwdData.new_password
      });
      setPwdMsg('Password updated successfully. Please use your new password next time you sign in.');
      setPwdData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwdError(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isHospital ? 'Hospital System & Operational Settings' : 'Clinic System & Operational Settings'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure OPD slot intervals, doctor schedule permissions, queue delay alerts, and account security.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          {savingSettings ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {settingsMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{settingsMsg}</span>
          </div>
          <button onClick={() => setSettingsMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {settingsError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{settingsError}</span>
          </div>
          <button onClick={() => setSettingsError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Appointment & Queue Rules */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Calendar className="w-4 h-4 text-indigo-400" />
              OPD Booking & Queue Engine Rules
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Default Consultation Slot (Minutes)
                  </label>
                  <select
                    value={settings.slot_duration_minutes}
                    onChange={(e) => setSettings({ ...settings, slot_duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={10}>10 Minutes (Express OPD)</option>
                    <option value={15}>15 Minutes (Standard)</option>
                    <option value={20}>20 Minutes (Default)</option>
                    <option value={30}>30 Minutes (Comprehensive)</option>
                    <option value={45}>45 Minutes (Specialised)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Slot Transition Buffer (Minutes)
                  </label>
                  <select
                    value={settings.buffer_minutes}
                    onChange={(e) => setSettings({ ...settings, buffer_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={0}>0 Minutes (Immediate)</option>
                    <option value={5}>5 Minutes (Recommended)</option>
                    <option value={10}>10 Minutes (Sanitization)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Maximum Advance Booking Horizon (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={settings.max_advance_days}
                  onChange={(e) => setSettings({ ...settings, max_advance_days: parseInt(e.target.value) || 14 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Patients cannot reserve slots further than {settings.max_advance_days} days into the future.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={settings.auto_confirm_appointments}
                    onChange={(e) => setSettings({ ...settings, auto_confirm_appointments: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Auto-Confirm Online Slot Bookings</div>
                    <p className="text-xs text-slate-400">
                      Instantly confirms patient bookings without requiring manual administrator triage.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Doctor Schedule Permissions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Users className="w-4 h-4 text-emerald-400" />
              Doctor Self-Service Permissions
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={settings.allow_doctor_schedule_edit}
                  onChange={(e) => setSettings({ ...settings, allow_doctor_schedule_edit: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-white">Allow Doctors to Adjust Routine OPD Hours</div>
                  <p className="text-xs text-slate-400">
                    Doctors can configure their routine shift timings from their individual doctor portal.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={settings.allow_doctor_leave_request}
                  onChange={(e) => setSettings({ ...settings, allow_doctor_leave_request: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-white">Allow Emergency Unavailability Toggles</div>
                  <p className="text-xs text-slate-400">
                    Allows doctors to immediately mark temporary unavailability or emergency sick leave.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Notifications & Security */}
        <div className="space-y-6">
          {/* Notifications & Queue Alerts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Bell className="w-4 h-4 text-amber-400" />
              Patient Notification & Delay Alerts
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={settings.notify_patient_sms}
                  onChange={(e) => setSettings({ ...settings, notify_patient_sms: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-white">SMS Queue Updates & Token Alerts</div>
                  <p className="text-xs text-slate-400">
                    Dispatches SMS to patient when 3 tokens remain ahead of them in queue.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={settings.notify_admin_email}
                  onChange={(e) => setSettings({ ...settings, notify_admin_email: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-white">Administrator Daily Digest by Email</div>
                  <p className="text-xs text-slate-400">
                    Sends morning schedule summary and evening collection reports to contact email.
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Queue Delay Alert Threshold (Minutes)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={settings.queue_delay_alert_threshold}
                    onChange={(e) => setSettings({ ...settings, queue_delay_alert_threshold: parseInt(e.target.value) || 30 })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Highlights queue red when average patient waiting duration exceeds this threshold.
                </span>
              </div>
            </div>
          </div>

          {/* Account Security & Password Change */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Lock className="w-4 h-4 text-rose-400" />
              Security & Credential Management
            </h2>

            {pwdMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{pwdMsg}</span>
              </div>
            )}

            {pwdError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={pwdData.current_password}
                    onChange={(e) => setPwdData({ ...pwdData, current_password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password * (Min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwdData.new_password}
                    onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwdData.confirm_password}
                    onChange={(e) => setPwdData({ ...pwdData, confirm_password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPwd}
                className="w-full mt-2 py-2 px-4 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition disabled:opacity-50"
              >
                {changingPwd ? 'Updating Password...' : 'Change Account Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsTab;
