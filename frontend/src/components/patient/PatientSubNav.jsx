import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  FileText,
  Bell,
  User,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientSubNav = ({ unreadNotificationsCount = 0 }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      to: '/my-doctors',
      label: 'My Doctors',
      icon: Stethoscope,
      match: (path) => path.startsWith('/my-doctors') || path === '/dashboard/patient/doctors'
    },
    {
      to: '/my-appointments',
      label: 'My Appointments',
      icon: Calendar,
      match: (path) => path.startsWith('/my-appointments') || path === '/appointments' || path === '/dashboard/patient/appointments'
    },
    {
      to: '/prescriptions',
      label: 'Prescriptions',
      icon: FileText,
      match: (path) => path.startsWith('/prescriptions') || path === '/dashboard/patient/prescriptions'
    },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      match: (path) => path.startsWith('/notifications') || path === '/dashboard/patient/notifications'
    },
    {
      to: '/profile',
      label: 'Health Profile',
      icon: User,
      match: (path) => path.startsWith('/profile') || path === '/dashboard/patient/profile'
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      match: (path) => path.startsWith('/settings') || path === '/dashboard/patient/settings'
    }
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200/90 sticky top-16 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          <nav className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(location.pathname);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white text-blue-700'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="hidden lg:flex items-center gap-2 shrink-0 pl-4 border-l border-slate-200 text-xs">
              <span className="text-slate-400 font-medium">Signed in as</span>
              <span className="font-bold text-slate-800 truncate max-w-[140px]">
                {user.name || user.username}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PatientSubNav;
