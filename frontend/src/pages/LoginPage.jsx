import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  ShieldCheck,
  User,
  Building2,
  Stethoscope,
  Pill,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const LoginPage = () => {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    {
      role: 'Super Admin',
      key: 'super_admin',
      user: 'admin',
      desc: 'Platform Owner, ARR/MRR, tenant approvals, publishing controls',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
    },
    {
      role: 'Patient',
      key: 'patient',
      user: 'patient',
      desc: 'Unified Health ID, hospital discovery, appointments, medicine quotes',
      icon: User,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
    },
    {
      role: 'Hospital Admin',
      key: 'hospital',
      user: 'hospital',
      desc: 'Yashoda Super Speciality SaaS: Queue, doctors, revenue, campaigns',
      icon: Building2,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    },
    {
      role: 'Independent Clinic',
      key: 'clinic',
      user: 'clinic',
      desc: 'MedPlus Care Clinic: Fast walk-ins, daily collections, packages',
      icon: Stethoscope,
      color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
    },
    {
      role: 'Doctor',
      key: 'doctor',
      user: 'doctor',
      desc: 'Dr. Rajesh Sharma, MD DM: OPD queue, consent history, digital Rx',
      icon: Stethoscope,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
    },
    {
      role: 'Pharmacy Store',
      key: 'pharmacy',
      user: 'pharmacy',
      desc: 'Apollo Pharmacy Malkajgiri: Quotations, pickup verification code',
      icon: Pill,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
    }
  ];

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(username, password);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey) => {
    setLoading(true);
    setError('');
    try {
      const loggedUser = await loginAs(roleKey);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    const map = {
      super_admin: '/dashboard/admin',
      patient: '/dashboard/patient',
      hospital: '/dashboard/hospital',
      clinic: '/dashboard/clinic',
      doctor: '/dashboard/doctor',
      pharmacy: '/dashboard/pharmacy'
    };
    navigate(map[role] || '/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">AllConnect Health</span>
        </Link>
        <h2 className="text-xl font-extrabold text-slate-800">Unified Portal Sign In</h2>
        <p className="text-xs text-slate-500">Access your role-specific dashboard with secure credentials</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80 space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username or Email</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. patient, doctor, hospital, or admin"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">Forgot password?</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Instant 1-Click Demo Accounts</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Password: [Role]@123</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map(demo => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.key}
                    type="button"
                    onClick={() => handleDemoLogin(demo.key)}
                    disabled={loading}
                    className={`p-3 rounded-xl border text-left transition flex items-start space-x-2.5 ${demo.color}`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">{demo.role}</span>
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </div>
                      <p className="text-[10px] opacity-80 mt-0.5 truncate">{demo.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Register Patient or Healthcare Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
