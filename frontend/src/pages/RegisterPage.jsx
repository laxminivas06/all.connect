import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Shield,
  ArrowRight
} from 'lucide-react';

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('patient'); // patient or org
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    full_name: '',
    email: '',
    mobile: '+91 98480 ',
    dob: '1995-06-15',
    gender: 'Male',
    blood_group: 'B+',
    address: '',
    area: 'Malkajgiri',
    city: 'Hyderabad',
    pincode: '500047',
    password: ''
  });

  // Org form state
  const [orgForm, setOrgForm] = useState({
    organization_name: '',
    organization_type: 'hospital',
    email: '',
    phone: '+91 40 ',
    address: '',
    area: 'Secunderabad',
    pincode: '500003',
    departments: 'General Medicine, Cardiology, Pediatrics',
    password: ''
  });

  const hyderabadAreas = ['Malkajgiri', 'Secunderabad', 'Uppal', 'Tarnaka', 'Nacharam', 'Begumpet'];

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!patientForm.full_name || !patientForm.email || !patientForm.password) {
      setError('Please fill in all mandatory fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.registerPatient(patientForm);
      setSuccessResult({
        type: 'patient',
        patient_id: res.patient_id,
        health_id: res.health_id,
        name: patientForm.full_name
      });
      // Authenticate
      await login(patientForm.email.split('@')[0].toLowerCase(), patientForm.password);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...orgForm,
        departments: orgForm.departments.split(',').map(d => d.trim()).filter(Boolean)
      };
      const res = await api.registerOrg(payload);
      setSuccessResult({
        type: 'org',
        org_id: res.organization_id,
        name: orgForm.organization_name,
        verification_status: res.verification_status,
        message: res.message
      });
    } catch (err) {
      setError(err.message || 'Organization registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">AllConnect</span>
          </Link>
          <h2 className="text-xl font-extrabold text-slate-800">Healthcare Registration Portal</h2>
          <p className="text-xs text-slate-500">Join the unified multi-hospital ecosystem in Hyderabad</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-200 p-1 rounded-2xl flex text-xs font-bold">
          <button
            onClick={() => { setActiveTab('patient'); setError(''); setSuccessResult(null); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'patient' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient Registration (Get Health ID)</span>
          </button>
          <button
            onClick={() => { setActiveTab('org'); setError(''); setSuccessResult(null); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'org' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Healthcare Provider Onboarding</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80">
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successResult ? (
            /* Success Display */
            <div className="text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              {successResult.type === 'patient' ? (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">Welcome, {successResult.name}!</h3>
                  <p className="text-xs text-slate-500">Your unique identities have been registered across participating hospitals:</p>

                  <div className="bg-slate-900 text-white p-5 rounded-2xl text-left space-y-2 border border-blue-500/30 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-blue-300 font-bold uppercase">Centralized Healthcare ID</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Active</span>
                    </div>
                    <p className="font-mono text-xl font-black text-amber-300">{successResult.health_id}</p>
                    <p className="font-mono text-xs text-slate-300">Patient ID: {successResult.patient_id}</p>
                    <p className="text-[10px] text-slate-400 pt-1">
                      Present this Health ID at Yashoda, Apollo, KIMS, or any registered clinic in Hyderabad for seamless record access.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/dashboard/patient')}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Patient Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">Registration Submitted!</h3>
                  <p className="text-xs text-slate-600">{successResult.message}</p>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-left space-y-1">
                    <p className="font-bold">Next Steps for Organization:</p>
                    <p>1. Super Admin will verify credentials and assign subscription tier.</p>
                    <p>2. Upon approval, your organization will be published in the public search directory.</p>
                  </div>
                  <Link
                    to="/login"
                    className="block w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md transition"
                  >
                    Go to Login
                  </Link>
                </div>
              )}
            </div>
          ) : activeTab === 'patient' ? (
            /* Patient Registration Form */
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Sharma"
                    value={patientForm.full_name}
                    onChange={(e) => setPatientForm({ ...patientForm, full_name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@gmail.com"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={patientForm.mobile}
                    onChange={(e) => setPatientForm({ ...patientForm, mobile: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={patientForm.dob}
                    onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={patientForm.blood_group}
                    onChange={(e) => setPatientForm({ ...patientForm, blood_group: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hyderabad Area</label>
                  <select
                    value={patientForm.area}
                    onChange={(e) => setPatientForm({ ...patientForm, area: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {hyderabadAreas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Door No, Street Name, Landmark"
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={patientForm.password}
                    onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition"
              >
                {loading ? 'Generating Universal Health ID...' : 'Complete Registration & Get Health ID'}
              </button>
            </form>
          ) : (
            /* Healthcare Provider Onboarding Form */
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrgForm({ ...orgForm, organization_type: 'hospital' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      orgForm.organization_type === 'hospital' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Multi-Speciality Hospital
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrgForm({ ...orgForm, organization_type: 'clinic' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      orgForm.organization_type === 'clinic' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Independent Clinic
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Healthcare Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Care Multi-Speciality Clinic"
                  value={orgForm.organization_name}
                  onChange={(e) => setOrgForm({ ...orgForm, organization_name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@clinic.org"
                    value={orgForm.email}
                    onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={orgForm.phone}
                    onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hyderabad Area</label>
                  <select
                    value={orgForm.area}
                    onChange={(e) => setOrgForm({ ...orgForm, area: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {hyderabadAreas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={orgForm.pincode}
                    onChange={(e) => setOrgForm({ ...orgForm, pincode: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Departments (Comma separated)</label>
                <input
                  type="text"
                  value={orgForm.departments}
                  onChange={(e) => setOrgForm({ ...orgForm, departments: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Password</label>
                <input
                  type="password"
                  required
                  value={orgForm.password}
                  onChange={(e) => setOrgForm({ ...orgForm, password: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition"
              >
                {loading ? 'Submitting Registration...' : 'Submit Organization for Verification'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
