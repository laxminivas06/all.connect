import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

export const DoctorNotificationsTab = ({ data, onRefresh }) => {
  const notifications = data?.notifications || [];
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await api.markAllNotificationsRead();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSingle = async (id) => {
    try {
      await api.markNotificationRead(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.is_read;
    if (activeFilter === 'appointments') return n.type === 'appointment' || String(n.title).toLowerCase().includes('appointment');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Clinical Alerts & Practice Notifications</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time notifications for incoming patient bookings, schedule modifications, and laboratory results
          </p>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'appointments', label: 'Appointments' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeFilter === f.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-2xs space-y-2">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">No alerts in this category</h4>
            <p className="text-xs text-slate-400">You are completely up to date with clinical practice notifications.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkSingle(n.id)}
              className={`p-4 rounded-2xl border transition flex items-start gap-4 cursor-pointer ${
                n.is_read ? 'bg-white border-slate-200/80 hover:bg-slate-50' : 'bg-blue-50/50 border-blue-200/90 shadow-2xs'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.is_read ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white'
              }`}>
                <Calendar className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm ${n.is_read ? 'font-bold text-slate-800' : 'font-extrabold text-slate-900'}`}>
                    {n.title}
                  </h4>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : 'Recently'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorNotificationsTab;
