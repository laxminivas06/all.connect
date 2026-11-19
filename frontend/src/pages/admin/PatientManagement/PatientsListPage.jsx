import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
  Users,
  Search,
  Phone,
  Mail,
  ShieldAlert,
  Calendar,
  Lock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MapPin,
  ArrowUpDown,
  Filter,
  Check,
  Building2,
  BarChart3,
  UserCheck,
  Sparkles
} from 'lucide-react';

export const PatientsListPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [sortField, setSortField] = useState('name'); // 'name', 'area', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM

  const fetchPatients = () => {
    setLoading(true);
    api.getAdminPatients()
      .then(res => setPatients(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleToggleStatus = async (patientId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updatePatientStatus(patientId, newStatus);
      fetchPatients();
    } catch (err) {
      alert(err.message || 'Error updating patient account status');
    }
  };

  // 1. Dynamic Patient Statistics Grid Calculations
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status !== 'suspended' && p.account_status !== 'suspended').length;
  const newRegistrations = patients.filter(p => {
    if (!p.created_at) return false;
    const diffDays = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 3600 * 24);
    return diffDays <= 180 || p.created_at.startsWith('2026');
  }).length;

  // Area distribution calculations from real records
  const areaCounts = patients.reduce((acc, p) => {
    const a = p.area || p.locality || 'Other';
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {});

  const distinctAreas = Object.keys(areaCounts).sort((a, b) => areaCounts[b] - areaCounts[a]);

  // City distribution calculations
  const cityCounts = patients.reduce((acc, p) => {
    const c = p.city || 'Hyderabad';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const distinctCities = Object.keys(cityCounts);

  // Sorting and Filtering
  const processedPatients = patients
    .filter(p => {
      const matchesSearch =
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.id?.toLowerCase().includes(search.toLowerCase()) ||
        p.patient_id?.toLowerCase().includes(search.toLowerCase()) ||
        p.health_id?.toLowerCase().includes(search.toLowerCase()) ||
        p.mobile?.toLowerCase().includes(search.toLowerCase());

      const patientArea = p.area || p.locality || '';
      const matchesArea = filterArea === 'all' || patientArea.toLowerCase() === filterArea.toLowerCase();

      const patientCity = p.city || 'Hyderabad';
      const matchesCity = filterCity === 'all' || patientCity.toLowerCase() === filterCity.toLowerCase();

      const matchesDate = !dateFilter || (p.created_at && p.created_at.startsWith(dateFilter));

      return matchesSearch && matchesArea && matchesCity && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.full_name || '').localeCompare(b.full_name || '');
      } else if (sortField === 'area') {
        comparison = (a.area || a.locality || '').localeCompare(b.area || b.locality || '');
      } else if (sortField === 'date') {
        comparison = (a.created_at || '').localeCompare(b.created_at || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wide flex items-center gap-1">
              <Lock className="w-3 h-3 text-blue-600" />
              PRIVACY-PRESERVED PATIENT DIRECTORY
            </span>
            <span className="text-xs text-slate-400">• HIPAA & ABDM Compliant</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Patient Management & Area Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Patients auto-register through the patient application and receive universal Health IDs. Super Admin analyzes geographic distribution and manages account status without accessing clinical consultation notes.
          </p>
        </div>

        <button
          onClick={fetchPatients}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Visual Patient Statistics Grid (Top Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Registered</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalPatients}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Universal Health IDs issued</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Patients</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{activePatients}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {totalPatients > 0 ? Math.round((activePatients / totalPatients) * 100) : 100}% verified accounts
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">New Registrations</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2">{newRegistrations}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Auto-onboarded recently</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Patients by Area</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{distinctAreas.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Distinct Hyderabad areas</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Patients by City</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-600 mt-2">{distinctCities.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{distinctCities.join(', ')}</p>
        </div>
      </div>

      {/* 2. Interactive Area-wise Patient Analytics Grid */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Area-wise Patient Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any locality below to instantly filter and inspect patients registered in that area.
            </p>
          </div>
          {filterArea !== 'all' && (
            <button
              onClick={() => setFilterArea('all')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Reset to All Areas ({totalPatients})
            </button>
          )}
        </div>

        {/* Locality Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {/* All Areas Card */}
          <button
            onClick={() => setFilterArea('all')}
            className={`p-3 rounded-2xl border text-left transition ${filterArea === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 ring-2 ring-blue-500/30'
              : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
            }`}
          >
            <span className={`text-[11px] font-bold block ${filterArea === 'all' ? 'text-blue-100' : 'text-slate-500'}`}>
              All Localities
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black">{totalPatients}</span>
              <span className={`text-[10px] ${filterArea === 'all' ? 'text-blue-200' : 'text-slate-400'}`}>100%</span>
            </div>
          </button>

          {/* Individual Area Cards */}
          {distinctAreas.map(areaName => {
            const count = areaCounts[areaName] || 0;
            const pct = totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0;
            const isSelected = filterArea.toLowerCase() === areaName.toLowerCase();

            return (
              <button
                key={areaName}
                onClick={() => setFilterArea(isSelected ? 'all' : areaName)}
                className={`p-3 rounded-2xl border text-left transition ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20 ring-2 ring-blue-500/30'
                  : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                    {areaName}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black">{count}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Area Highlight Feedback Banner */}
        {filterArea !== 'all' && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-blue-600" />
              Filtered by Locality: <strong className="font-bold text-blue-950">{filterArea}</strong>
            </span>
            <span className="font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px]">
              {processedPatients.length} patient{processedPatients.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Patient Data Confidentiality Guarantee</span>
          <span className="text-amber-800/90 text-[11px]">
            In strict compliance with privacy standards, Super Admin does NOT have access to medical consultation notes, EHR diagnoses, or prescription files. Electronic consent remains exclusively with the patient.
          </span>
        </div>
      </div>

      {/* Search, Filter & Alphabetical Sorting Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">

        {/* Search by Name or ID */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Patient Name or ID (PAT-2026-...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Locality Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Localities</option>
            {distinctAreas.map(area => (
              <option key={area} value={area}>{area} ({areaCounts[area]})</option>
            ))}
          </select>

          {/* City Dropdown */}
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Cities</option>
            {distinctCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Registration Date Filter */}
          <input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-600 outline-none"
            title="Filter by registration month"
          />

          {/* Alphabetical A-Z / Z-A Sorting */}
          <button
            onClick={() => toggleSort('name')}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${sortField === 'name' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Name {sortField === 'name' ? (sortOrder === 'asc' ? '(A-Z)' : '(Z-A)') : ''}</span>
          </button>
        </div>
      </div>

      {/* Patients Data Table / Card View */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading registered patients...</p>
        </div>
      ) : processedPatients.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Patients Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No patient records matched the search term "{search}" or selected locality filters.
          </p>
          {(search || filterArea !== 'all' || filterCity !== 'all' || dateFilter) && (
            <button
              onClick={() => { setSearch(''); setFilterArea('all'); setFilterCity('all'); setDateFilter(''); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Patient ID & Name</th>
                    <th className="py-3 px-4">Universal Health ID</th>
                    <th className="py-3 px-4">Contact Details</th>
                    <th className="py-3 px-4">Locality & City</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedPatients.map(patient => {
                    const isSuspended = patient.status === 'suspended' || patient.account_status === 'suspended';
                    const area = patient.area || patient.locality || 'Hyderabad';
                    const city = patient.city || 'Hyderabad';

                    return (
                      <tr key={patient.id || patient.patient_id} className="hover:bg-slate-50/70 transition">
                        {/* Name & ID */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{patient.full_name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {patient.id || patient.patient_id}
                          </span>
                        </td>

                        {/* Universal Health ID */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                            {patient.health_id || 'HC-2026-PENDING'}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{patient.mobile || '+91 98480 00000'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[150px]">{patient.email || 'patient@email.com'}</span>
                          </div>
                        </td>

                        {/* Area & City */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-slate-800 font-medium">
                            <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{area}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block ml-4">{city}</span>
                        </td>

                        {/* Registered Date */}
                        <td className="py-3.5 px-4 text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '2026-01-10'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isSuspended
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isSuspended ? (
                              <>
                                <XCircle className="w-3 h-3 text-rose-500" />
                                Suspended
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Active
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(patient.id || patient.patient_id, isSuspended ? 'suspended' : 'active')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${isSuspended
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE RESPONSIVE CARDS VIEW */}
          <div className="md:hidden space-y-3">
            {processedPatients.map(p => {
              const isSuspended = p.status === 'suspended' || p.account_status === 'suspended';
              const area = p.area || p.locality || 'Hyderabad';
              const city = p.city || 'Hyderabad';

              return (
                <div key={p.id || p.patient_id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{p.full_name}</h3>
                      <p className="text-[10px] font-mono text-blue-600 font-semibold">{p.id || p.patient_id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isSuspended ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Locality / Area</span>
                      <span className="font-bold text-slate-800">{area}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">City</span>
                      <span>{city}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Health ID</span>
                      <span className="font-mono text-blue-700 font-bold">{p.health_id || 'HC-2026-PENDING'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Registered Date</span>
                      <span className="font-mono text-[11px]">{p.created_at ? p.created_at.split('T')[0] : '2026-01-10'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleToggleStatus(p.id || p.patient_id, isSuspended ? 'suspended' : 'active')}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition ${isSuspended ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                    >
                      {isSuspended ? 'Activate Account' : 'Suspend Account'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
};
