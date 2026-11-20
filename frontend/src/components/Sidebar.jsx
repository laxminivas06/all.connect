import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  FolderHeart,
  ShoppingBag,
  CreditCard,
  Users,
  Settings,
  Tag,
  Stethoscope,
  Building2,
  ShieldAlert,
  QrCode,
  PlusCircle,
  Pill,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  LogOut,
  Clock,
  Sparkles,
  X,
  UserCheck,
  DollarSign,
  Shield,
  ShieldCheck,
  Inbox,
  User,
  KeyRound,
  Package,
  HardDrive,
  Bell
} from 'lucide-react';

export const Sidebar = ({ role, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navConfigs = {
    patient: [
      { to: '/dashboard/patient', end: true, label: 'Overview', icon: LayoutDashboard },
      { to: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar },
      { to: '/dashboard/patient/prescriptions', label: 'Prescriptions & OCR', icon: FileText },
      { to: '/dashboard/patient/records', label: 'Records & Consent', icon: FolderHeart },
      { to: '/dashboard/patient/orders', label: 'Medicine Orders', icon: ShoppingBag },
      { to: '/dashboard/patient/offers', label: 'Discounts & Offers', icon: Tag },
      { to: '/dashboard/patient/health-card', label: 'Digital Health ID', icon: QrCode }
    ],
    hospital: [
      { to: '/dashboard/hospital', end: true, label: 'Overview', icon: LayoutDashboard },
      { to: '/dashboard/hospital/appointments', label: 'Appointments', icon: Calendar },
      { to: '/dashboard/hospital/queue', label: 'Live Queue', icon: Clock },
      { to: '/dashboard/hospital/doctors', label: 'Doctors', icon: Stethoscope },
      { to: '/dashboard/hospital/doctor-assignments', label: 'Assignments', icon: UserCheck },
      { to: '/dashboard/hospital/doctor-availability', label: 'Availability', icon: Calendar },
      { to: '/dashboard/hospital/patients', label: 'Patients', icon: Users },
      { to: '/dashboard/hospital/services', label: 'Services', icon: Sparkles },
      { to: '/dashboard/hospital/packages', label: 'Packages', icon: Tag },
      { to: '/dashboard/hospital/billing', label: 'Billing & Revenue', icon: TrendingUp },
      { to: '/dashboard/hospital/promotions', label: 'Promotions', icon: Tag },
      { to: '/dashboard/hospital/subscription', label: 'SaaS Plan', icon: CreditCard },
      { to: '/dashboard/hospital/profile', label: 'Hospital Profile', icon: Building2 },
      { to: '/dashboard/hospital/documents', label: 'Documents', icon: ShieldCheck },
      { to: '/dashboard/hospital/settings', label: 'Settings', icon: Settings }
    ],
    clinic: [
      { to: '/dashboard/clinic', end: true, label: 'Overview', icon: LayoutDashboard },
      { to: '/dashboard/clinic/appointments', label: 'Appointments', icon: Calendar },
      { to: '/dashboard/clinic/queue', label: 'Live Queue', icon: Clock },
      { to: '/dashboard/clinic/doctors', label: 'Doctors', icon: Stethoscope },
      { to: '/dashboard/clinic/doctor-assignments', label: 'Assignments', icon: UserCheck },
      { to: '/dashboard/clinic/doctor-availability', label: 'Availability', icon: Calendar },
      { to: '/dashboard/clinic/patients', label: 'Patients', icon: Users },
      { to: '/dashboard/clinic/services', label: 'Services', icon: Sparkles },
      { to: '/dashboard/clinic/packages', label: 'Packages', icon: Tag },
      { to: '/dashboard/clinic/billing', label: 'Daily Collection', icon: TrendingUp },
      { to: '/dashboard/clinic/promotions', label: 'Promotions', icon: Tag },
      { to: '/dashboard/clinic/subscription', label: 'SaaS Plan', icon: CreditCard },
      { to: '/dashboard/clinic/profile', label: 'Clinic Profile', icon: Building2 },
      { to: '/dashboard/clinic/documents', label: 'Documents', icon: ShieldCheck },
      { to: '/dashboard/clinic/settings', label: 'Settings', icon: Settings }
    ],
    doctor: [
      { to: '/dashboard/doctor', end: true, label: 'Dashboard', icon: LayoutDashboard },
      { to: '/dashboard/doctor/patients', label: 'Patient Management', icon: Users },
      { to: '/dashboard/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
      { to: '/dashboard/doctor/availability', label: 'Doctor Availability', icon: Clock },
      { to: '/dashboard/doctor/leave', label: 'Leave Management', icon: Calendar },
      { to: '/dashboard/doctor/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/doctor/profile', label: 'My Profile', icon: User }
    ],
    pharmacy: [
      { to: '/dashboard/pharmacy', end: true, label: 'Overview', icon: LayoutDashboard },
      { to: '/dashboard/pharmacy/prescriptions', label: 'Prescriptions', icon: FileText },
      { to: '/dashboard/pharmacy/quotations', label: 'Quotations', icon: Tag },
      { to: '/dashboard/pharmacy/orders', label: 'Active Orders', icon: ShoppingBag },
      { to: '/dashboard/pharmacy/catalogue', label: 'Medicine Catalogue', icon: Pill },
      { to: '/dashboard/pharmacy/inventory', label: 'Inventory', icon: Package },
      { to: '/dashboard/pharmacy/pickup-codes', label: 'Pickup Codes', icon: KeyRound },
      { to: '/dashboard/pharmacy/sales', label: 'Sales Reports', icon: TrendingUp },
      { to: '/dashboard/pharmacy/profile', label: 'Pharmacy Profile', icon: Building2 },
      { to: '/dashboard/pharmacy/subscription', label: 'Subscription', icon: CreditCard },
      { to: '/dashboard/pharmacy/settings', label: 'Settings', icon: Settings }
    ],
    super_admin: [
      { to: '/dashboard/admin', end: true, label: 'Platform Overview', icon: LayoutDashboard },
      { to: '/dashboard/admin/register-organisation', label: 'Register Organisation', icon: PlusCircle },
      { to: '/dashboard/admin/hospitals', label: 'Hospital Management', icon: Building2 },
      { to: '/dashboard/admin/clinics', label: 'Clinic Management', icon: Sparkles },
      { to: '/dashboard/admin/pharmacies', label: 'Pharmacy Management', icon: Pill },
      { to: '/dashboard/admin/patients', label: 'Patient Management', icon: Users },
      { to: '/dashboard/admin/subscriptions', label: 'Subscription Plans', icon: CreditCard },
      { to: '/dashboard/admin/billing', label: 'Billing & Revenue', icon: DollarSign },
      { to: '/dashboard/admin/promotions', label: 'Promotions & Ads', icon: Tag },
      { to: '/dashboard/admin/data-management', label: 'Data & 7-Day Backups', icon: HardDrive },
      { to: '/dashboard/admin/settings', label: 'Settings & Security', icon: Shield }
    ]
  };

  const navItems = navConfigs[role] || navConfigs.patient;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-500/20">
            AC
          </div>
          <div>
            <span className="text-xs font-black text-white tracking-wide uppercase block">
              {role.replace('_', ' ')}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Control Console</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Badge */}
      <div className="mx-3 mt-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
        <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Active User'}</p>
        <p className="text-[10px] text-blue-400 truncate">{user?.email || 'Logged in'}</p>
        {user?.entity_id && (
          <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">ID: {user.entity_id}</p>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 text-[10px] text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Hyderabad Healthcare Mesh</span>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 flex-col min-h-screen border-r border-slate-800 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
