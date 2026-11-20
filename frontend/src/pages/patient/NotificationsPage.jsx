import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PatientSubNav } from '../../components/patient/PatientSubNav';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

export const NotificationsPage = () => {
  const auth = useAuth() || {};
  const {
    notifications = [],
    unreadCount = 0,
    removeNotification = () => {},
    clearAllNotifications = () => {},
    refreshNotifications = () => {}
  } = auth;

  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, appointment
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      await api.markAllNotificationsRead();
      refreshNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOne = async (id) => {
    try {
      await removeNotification(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      setActionLoading(true);
      await clearAllNotifications();
      setConfirmClearAll(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.is_read;
    if (activeFilter === 'appointment') return n.type === 'appointment' || String(n.title).toLowerCase().includes('appointment');
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PatientSubNav unreadNotificationsCount={unreadCount} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Patient Alerts & Activity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time updates regarding appointment confirmations, schedule updates, digital prescriptions, and health alerts.
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <CheckCheck className="w-4 h-4 text-blue-600" />
                  <span>Mark All Read</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition border border-rose-200"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Clear All Confirmation Alert */}
        {confirmClearAll && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Are you sure you want to delete all notifications? This cannot be undone.</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'appointment', label: 'Appointments' }
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

        {/* Notification List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">You're All Caught Up</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No notifications match your current filter. We'll alert you here when new medical records or appointments update.
              </p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer group ${
                  n.is_read
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-blue-50/50 border-blue-200/90 shadow-2xs hover:bg-blue-50/80'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.is_read
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
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
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span>{n.created_at ? new Date(n.created_at).toLocaleString() : 'Recently'}</span>
                      {n.link && (
                        <Link
                          to={n.link}
                          className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Related Record →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOne(n.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition opacity-0 group-hover:opacity-100"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
