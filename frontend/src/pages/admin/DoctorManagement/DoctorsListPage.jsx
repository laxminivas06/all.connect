import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import {
  Stethoscope,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  RefreshCw,
  Phone,
  Calendar,
  Filter
} from 'lucide-react';

export const DoctorsListPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');

  const fetchDoctors = () => {
    setLoading(true);
    api.getAdminDoctors()
      .then(res => setDoctors(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleVerification = async (doctorId, currentStatus) => {
    const newStatus = currentStatus === 'verified' ? 'suspended' : 'verified';
    try {
      await api.verifyDoctor(doctorId, newStatus);
      fetchDoctors();
    } catch (err) {
      alert(err.message || 'Error updating doctor license status');
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                          doc.specialty?.toLowerCase().includes(search.toLowerCase()) ||
                          doc.hospital_name?.toLowerCase().includes(search.toLowerCase()) ||
                          doc.registration_number?.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = filterSpecialty === 'all' || doc.specialty?.toLowerCase().includes(filterSpecialty.toLowerCase());
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase tracking-wide">
              DOCTOR CREDENTIALING
            </span>
            <span className="text-xs text-slate-400">• Multi-Organization Specialist Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Registered Doctors ({doctors.length})
          </h1>
          <p className="text-xs text-slate-500">
            A doctor may practice across multiple hospitals and clinics. Manage medical council licenses and clinical affiliations.
          </p>
        </div>

        <Link
          to="/dashboard/admin/doctors/register"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Specialist</span>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or medical registration no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Specialties</option>
            <option value="cardiology">Cardiology</option>
            <option value="neurology">Neurology</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="medicine">General Medicine</option>
            <option value="pediatrics">Pediatrics</option>
          </select>
        </div>

        <button
          onClick={fetchDoctors}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition self-end sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading doctor registry...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Doctor & Experience</th>
                  <th className="py-3 px-3">Specialty</th>
                  <th className="py-3 px-3">Medical Registration No.</th>
                  <th className="py-3 px-3">Primary Hospital / Clinic</th>
                  <th className="py-3 px-3">Consultation Fee</th>
                  <th className="py-3 px-3">Licensing Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map(doc => {
                  const isVerified = (doc.verification_status || 'verified') === 'verified';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{doc.full_name}</div>
                        <div className="text-[10px] text-slate-400">{doc.qualification} • {doc.experience_years} yrs clinical experience</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-indigo-700">
                        {doc.specialty}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 font-semibold">
                        {doc.registration_number || 'TSMC-2018-8421'}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{doc.hospital_name || 'Independent Practice'}</div>
                        {doc.clinic_affiliations && doc.clinic_affiliations.length > 0 && (
                          <div className="text-[10px] text-teal-700 font-medium">+ {doc.clinic_affiliations.length} clinic branches</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        ₹{doc.consultation_fee}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isVerified ? 'Licensed & Verified' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleVerification(doc.id, doc.verification_status || 'verified')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isVerified
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isVerified ? 'Suspend License' : 'Verify License'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
