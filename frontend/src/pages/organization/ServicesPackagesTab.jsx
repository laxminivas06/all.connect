import React, { useState } from 'react';
import {
  Tag,
  PlusCircle,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const ServicesPackagesTab = ({
  services = [],
  packages = [],
  doctors = [],
  orgType = 'hospital',
  data = null,
  initialSubTab = 'packages',
  onRefresh
}) => {
  const effectiveServices = services.length > 0 ? services : (data?.services || []);
  const effectivePackages = packages.length > 0 ? packages : (data?.offers || []);
  const effectiveDoctors = doctors.length > 0 ? doctors : (data?.doctors || []);

  // Split services into Clinical Services vs Procedures cleanly
  const clinicalServices = effectiveServices.filter(s => {
    const cat = (s.category || '').toLowerCase();
    return cat.includes('consultation') || cat.includes('clinical') || (!cat.includes('procedure') && !cat.includes('surgery') && !cat.includes('diagnostic'));
  });

  const procedureServices = effectiveServices.filter(s => {
    const cat = (s.category || '').toLowerCase();
    return cat.includes('procedure') || cat.includes('surgery') || cat.includes('diagnostic') || cat.includes('scan') || cat.includes('therapy');
  });

  // 'services' | 'procedures' | 'packages'
  const [activeSubSection, setActiveSubSection] = useState(
    initialSubTab === 'packages' ? 'packages' : initialSubTab === 'procedures' ? 'procedures' : 'services'
  );

  // Package Form State
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageForm, setPackageForm] = useState({
    title: '',
    category: 'General Health Checkup',
    description: '',
    original_price: 2500,
    discounted_price: 1299,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '2027-12-31',
    applicable_departments: ['General Medicine'],
    terms: 'Fasting 10-12 hours required if blood tests included. Prior appointment required.'
  });
  const [packageLoading, setPackageLoading] = useState(false);

  // Service Form State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'Consultation',
    department: 'General Medicine',
    associated_doctor_id: '',
    associated_doctor_name: '',
    consultation_fee: 500,
    duration_minutes: 15,
    availability: 'Monday to Saturday (09:00 AM - 06:00 PM)',
    description: 'Clinical examination and prescription management.',
    terms: 'Advance booking required.'
  });
  const [serviceLoading, setServiceLoading] = useState(false);

  // Package Handlers
  const handleOpenAddPackage = () => {
    setEditingPackageId(null);
    setPackageForm({
      title: '',
      category: 'General Health Checkup',
      description: 'Comprehensive screening and senior specialist review.',
      original_price: 2500,
      discounted_price: 1299,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '2027-12-31',
      applicable_departments: ['General Medicine'],
      terms: 'Fasting 10-12 hours required if blood tests included.'
    });
    setPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg) => {
    setEditingPackageId(pkg.id);
    setPackageForm({
      title: pkg.title || '',
      category: pkg.category || 'General Health Checkup',
      description: pkg.description || '',
      original_price: pkg.original_price || 2000,
      discounted_price: pkg.discounted_price || 999,
      start_date: pkg.start_date || new Date().toISOString().split('T')[0],
      end_date: pkg.end_date || '2027-12-31',
      applicable_departments: pkg.applicable_departments || ['General Medicine'],
      terms: pkg.terms || ''
    });
    setPackageModalOpen(true);
  };

  const handlePackageSubmit = async (e) => {
    e.preventDefault();
    setPackageLoading(true);
    try {
      if (editingPackageId) {
        await api.updateOffer(editingPackageId, packageForm);
      } else {
        await api.createOffer(packageForm);
      }
      setPackageModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error saving package');
    } finally {
      setPackageLoading(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      await api.deleteOffer(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error deleting package');
    }
  };

  const handleTogglePackageStatus = async (pkg) => {
    const nextStatus = pkg.workflow_status === 'published' ? 'expired' : 'published';
    try {
      await api.updateOfferStatus(pkg.id, { workflow_status: nextStatus });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error toggling package status');
    }
  };

  // Service Handlers
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceForm({
      name: '',
      category: 'Consultation',
      department: 'General Medicine',
      associated_doctor_id: doctors[0]?.id || '',
      associated_doctor_name: doctors[0]?.name || '',
      consultation_fee: 500,
      duration_minutes: 15,
      availability: 'Monday to Saturday (09:00 AM - 06:00 PM)',
      description: 'Clinical examination and prescription management.',
      terms: 'Advance booking required.'
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (srv) => {
    setEditingServiceId(srv.id);
    setServiceForm({
      name: srv.name || '',
      category: srv.category || 'Consultation',
      department: srv.department || 'General Medicine',
      associated_doctor_id: srv.associated_doctor_id || '',
      associated_doctor_name: srv.associated_doctor_name || '',
      consultation_fee: srv.consultation_fee || 500,
      duration_minutes: srv.duration_minutes || 15,
      availability: srv.availability || 'Monday to Saturday',
      description: srv.description || '',
      terms: srv.terms || ''
    });
    setServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceLoading(true);
    try {
      if (editingServiceId) {
        await api.updateService(editingServiceId, serviceForm);
      } else {
        await api.createService(serviceForm);
      }
      setServiceModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error saving service');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this clinical service?')) return;
    try {
      await api.deleteService(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error deleting service');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubSection('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubSection === 'services'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Clinical Services ({clinicalServices.length})
          </button>
          <button
            onClick={() => setActiveSubSection('procedures')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubSection === 'procedures'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Procedures ({procedureServices.length})
          </button>
          <button
            onClick={() => setActiveSubSection('packages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubSection === 'packages'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Packages ({effectivePackages.length})
          </button>
        </div>

        {activeSubSection === 'packages' ? (
          <button
            onClick={handleOpenAddPackage}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 self-start sm:self-auto transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Health Package</span>
          </button>
        ) : activeSubSection === 'procedures' ? (
          <button
            onClick={() => {
              setEditingServiceId(null);
              setServiceForm({
                name: '',
                category: 'Procedures',
                department: 'General Surgery',
                associated_doctor_id: '',
                associated_doctor_name: '',
                consultation_fee: 1500,
                duration_minutes: 30,
                availability: 'Monday to Saturday (09:00 AM - 04:00 PM)',
                description: 'Procedural medical intervention, minor surgery, or diagnostic examination.',
                terms: 'Prior evaluation and appointment required.'
              });
              setServiceModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 self-start sm:self-auto transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Procedure</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingServiceId(null);
              setServiceForm({
                name: '',
                category: 'Clinical Services',
                department: 'General Medicine',
                associated_doctor_id: '',
                associated_doctor_name: '',
                consultation_fee: 500,
                duration_minutes: 15,
                availability: 'Monday to Saturday (09:00 AM - 06:00 PM)',
                description: 'Clinical examination and prescription management.',
                terms: 'Advance booking required.'
              });
              setServiceModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 self-start sm:self-auto transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Clinical Service</span>
          </button>
        )}
      </div>

      {/* SUB-SECTION 1: HEALTH PACKAGES */}
      {activeSubSection === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>Hospitals and clinics can independently publish preventive screening packages visible in the public marketplace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {effectivePackages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      {pkg.discount_percentage || 50}% OFF
                    </span>
                    <button
                      onClick={() => handleTogglePackageStatus(pkg)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                        pkg.workflow_status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {pkg.workflow_status === 'published' ? 'Active / Published' : 'Suspended / Draft'}
                    </button>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{pkg.title}</h4>
                  <span className="text-[11px] font-semibold text-blue-700 block">{pkg.category}</span>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{pkg.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline space-x-2">
                    <span className="text-lg font-black text-slate-900">₹{pkg.discounted_price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{pkg.original_price}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p>Validity: {pkg.start_date} to {pkg.end_date}</p>
                    <p className="truncate">Terms: {pkg.terms}</p>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEditPackage(pkg)}
                    className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: CLINICAL SERVICES */}
      {activeSubSection === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>Independent clinical outpatient consultations, general medical evaluations, and follow-up bays.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {clinicalServices.length === 0 ? (
              <div className="p-12 text-center">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No clinical services defined yet</h4>
                <p className="text-xs text-slate-400 mt-1">Add your organization's outpatient consultation services.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Service Name</th>
                      <th className="py-3 px-4">Category / Dept</th>
                      <th className="py-3 px-4">Associated Doctor</th>
                      <th className="py-3 px-4">Consultation Fee</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clinicalServices.map(srv => (
                      <tr key={srv.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 text-sm block">{srv.name}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">{srv.description}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{srv.category || 'Clinical Services'}</span>
                          <span className="text-[10px] text-slate-400">{srv.department}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {srv.associated_doctor_name || 'Department OPD'}
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                          ₹{srv.consultation_fee}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {srv.duration_minutes || 15} mins
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {srv.availability}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditService(srv)}
                            className="text-slate-600 hover:text-blue-600 font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: PROCEDURES */}
      {activeSubSection === 'procedures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>Medical interventions, surgical day-care procedures, diagnostic imaging, and therapeutic services.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {procedureServices.length === 0 ? (
              <div className="p-12 text-center">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No procedures defined yet</h4>
                <p className="text-xs text-slate-400 mt-1">Add surgical and diagnostic procedures performed at your facility.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Procedure Name</th>
                      <th className="py-3 px-4">Category / Dept</th>
                      <th className="py-3 px-4">Attending Specialist</th>
                      <th className="py-3 px-4">Procedure Fee</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {procedureServices.map(srv => (
                      <tr key={srv.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 text-sm block">{srv.name}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">{srv.description}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-indigo-700 block">{srv.category || 'Procedures'}</span>
                          <span className="text-[10px] text-slate-400">{srv.department}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {srv.associated_doctor_name || 'Department Specialist'}
                        </td>
                        <td className="py-3 px-4 font-black text-indigo-700 text-sm">
                          ₹{srv.consultation_fee}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {srv.duration_minutes || 30} mins
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {srv.availability}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditService(srv)}
                            className="text-slate-600 hover:text-blue-600 font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="text-rose-600 hover:text-rose-800 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Package Create / Edit */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                {editingPackageId ? 'Edit Health Checkup Package' : 'Create Preventive Health Package'}
              </h3>
              <button onClick={() => setPackageModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePackageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  value={packageForm.title}
                  onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                  placeholder="e.g. Master Executive Health Checkup Package"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Category *</label>
                <select
                  value={packageForm.category}
                  onChange={(e) => setPackageForm({ ...packageForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="General Health Checkup">General Health Checkup</option>
                  <option value="Full Body Checkup">Full Body Checkup</option>
                  <option value="Diabetes Screening">Diabetes Screening</option>
                  <option value="Basic Health Package">Basic Health Package</option>
                  <option value="Cardiac Screening">Cardiac Screening</option>
                  <option value="Dental Consultation Package">Dental Consultation Package</option>
                  <option value="Special Consultation Package">Special Consultation Package</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Included Tests *</label>
                <textarea
                  rows={3}
                  required
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  placeholder="List all diagnostic tests, doctor consultations, and screening evaluations included..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={packageForm.original_price}
                    onChange={(e) => setPackageForm({ ...packageForm, original_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discounted Offer Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={packageForm.discounted_price}
                    onChange={(e) => setPackageForm({ ...packageForm, discounted_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={packageForm.start_date}
                    onChange={(e) => setPackageForm({ ...packageForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={packageForm.end_date}
                    onChange={(e) => setPackageForm({ ...packageForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Terms & Conditions</label>
                <input
                  type="text"
                  value={packageForm.terms}
                  onChange={(e) => setPackageForm({ ...packageForm, terms: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPackageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={packageLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  {packageLoading ? 'Saving...' : editingPackageId ? 'Update Package' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Clinical Service / Procedure Create / Edit */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                {editingServiceId ? 'Edit Service / Procedure' : serviceForm.category === 'Procedures' ? 'Add Procedure' : 'Add Clinical Service'}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service / Procedure Name *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g. 2D Echocardiography & Color Doppler"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Clinical Services">Clinical Services</option>
                    <option value="Procedures">Procedures</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="General Consultation">General Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={serviceForm.department}
                    onChange={(e) => setServiceForm({ ...serviceForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated Doctor</label>
                <select
                  value={serviceForm.associated_doctor_id}
                  onChange={(e) => {
                    const doc = doctors.find(d => d.id === e.target.value);
                    setServiceForm({
                      ...serviceForm,
                      associated_doctor_id: e.target.value,
                      associated_doctor_name: doc ? doc.name : ''
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General OPD / Any Available Specialist</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation / Service Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={serviceForm.consultation_fee}
                    onChange={(e) => setServiceForm({ ...serviceForm, consultation_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    value={serviceForm.duration_minutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Availability Schedule</label>
                <input
                  type="text"
                  value={serviceForm.availability}
                  onChange={(e) => setServiceForm({ ...serviceForm, availability: e.target.value })}
                  placeholder="e.g. Monday to Friday (10:00 AM - 04:00 PM)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceLoading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
                >
                  {serviceLoading ? 'Saving...' : editingServiceId ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
