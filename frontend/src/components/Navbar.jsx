import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Stethoscope,
  Tag,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Calendar,
  Building2,
  Users,
  Info,
  Home
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const auth = useAuth() || {};
  const { user = null, logout = () => {}, notifications = [], unreadCount = 0 } = auth;
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    const map = {
      super_admin: '/dashboard/admin',
      patient: '/dashboard/patient',
      hospital: '/dashboard/hospital',
      clinic: '/dashboard/clinic',
      doctor: '/dashboard/doctor',
      pharmacy: '/dashboard/pharmacy'
    };
    return map[user.role] || '/';
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isPatient = user?.role === 'patient';

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo & Mobile Sidebar Trigger */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Toggle Navigation Drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link to={isSuperAdmin ? "/dashboard/admin" : "/"} className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  AllConnect <span className="text-blue-600 font-extrabold text-xs px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded-md">HYD</span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium -mt-1 tracking-wide">
                  {isSuperAdmin ? 'Centralized Platform Administration' : 'Centralized Healthcare Ecosystem'}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-bold text-slate-600">
            {isSuperAdmin ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  Super Admin Management Console
                </span>
              </div>
            ) : (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition flex items-center gap-1.5 ${location.pathname === '/' ? 'text-blue-600 font-extrabold' : ''}`}
                >
                  <Home className="w-3.5 h-3.5" />
                  Home
                </Link>

                <Link
                  to="/hospitals"
                  className={`px-3 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition flex items-center gap-1.5 ${location.pathname.startsWith('/hospitals') ? 'text-blue-600 font-extrabold' : ''}`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Hospitals & Clinics
                </Link>

                <button
                  onClick={() => scrollToSection('specialists-section')}
                  className="px-3 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  Specialists
                </button>

                <Link
                  to="/offers"
                  className={`px-3 py-2 rounded-xl hover:text-rose-600 hover:bg-slate-50 transition flex items-center gap-1.5 ${location.pathname.startsWith('/offers') ? 'text-rose-600 font-extrabold' : ''}`}
                >
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  Offers
                </Link>

                <button
                  onClick={() => scrollToSection('about-trust-section')}
                  className="px-3 py-2 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  About
                </button>

                {/* Clear Action Button: Book OPD */}
                <Link
                  to="/book-opd"
                  className="ml-2 px-3.5 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book OPD</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Mobile Book OPD */}
            {!isSuperAdmin && (
              <Link
                to="/book-opd"
                className="md:hidden px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-600 text-white shadow flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book OPD</span>
              </Link>
            )}

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg relative transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">In-App Notifications</span>
                      <span className="text-[10px] text-slate-500">{notifications.length} total</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400">No new notifications</p>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition">
                            <p className="font-semibold text-slate-800">{n.title}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Profile navigation: opens patient portal or dashboard, never Book OPD */}
                {isPatient ? (
                  <Link
                    to="/profile"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      location.pathname.startsWith('/profile') || location.pathname.startsWith('/dashboard/patient')
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Profile</span>
                  </Link>
                ) : (
                  <Link
                    to={getDashboardPath()}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-1.5 transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                    <span>Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Link
                  to="/profile"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            {!isSuperAdmin && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && !isSuperAdmin && (
          <div className="md:hidden py-3 px-2 border-t border-slate-100 space-y-1">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-500" />
              Home
            </Link>
            <Link
              to="/hospitals"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Hospitals & Clinics
            </Link>
            <button
              onClick={() => { setShowMobileMenu(false); scrollToSection('specialists-section'); }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-teal-600" />
              Specialists
            </button>
            <Link
              to="/offers"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Tag className="w-4 h-4 text-rose-500" />
              Offers
            </Link>
            <button
              onClick={() => { setShowMobileMenu(false); scrollToSection('about-trust-section'); }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-slate-500" />
              About
            </button>
            <Link
              to="/profile"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <User className="w-4 h-4 text-blue-600" />
              Profile
            </Link>
            <Link
              to="/book-opd"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book OPD Appointment
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
