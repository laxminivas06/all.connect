import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DocumentUploadControl } from '../../components/DocumentUploadControl';
import { InteractiveLocationPicker } from '../../components/InteractiveLocationPicker';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Save,
  Plus,
  X,
  FileText,
  History,
  Calendar,
  Sparkles,
  BedDouble,
  ShieldAlert
} from 'lucide-react';

export const ProfileDocumentsTab = ({ orgType = 'hospital', data, onRefresh }) => {
  const isHospital = orgType === 'hospital';
  const org = data?.hospital || data?.clinic || {};

  const [formData, setFormData] = useState({
    name: org.name || '',
    tagline: org.tagline || '',
    contact_phone: org.contact_phone || '',
    emergency_phone: org.emergency_phone || '',
    email: org.email || '',
    website: org.website || '',
    established_year: org.established_year || '',
    bed_capacity: org.bed_capacity || '',
    emergency_24x7: org.emergency_24x7 !== undefined ? org.emergency_24x7 : true,
    operating_hours: org.operating_hours || '',
    address: org.address || '',
    locality: org.locality || org.area || '',
    area: org.area || org.locality || '',
    city: org.city || 'Hyderabad',
    state: org.state || 'Telangana',
    pincode: org.pincode || '',
    country: org.country || 'India',
    latitude: org.latitude || org.coordinates?.lat || 17.4491,
    longitude: org.longitude || org.coordinates?.lng || 78.5311,
    lat: org.latitude || org.coordinates?.lat || 17.4491,
    lng: org.longitude || org.coordinates?.lng || 78.5311,
    departments: org.departments || []
  });

  const [newDept, setNewDept] = useState('');
  const [documents, setDocuments] = useState(org.verification_documents || []);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    if (org.name) {
      const detectedLat = org.latitude || org.coordinates?.lat || 17.4491;
      const detectedLng = org.longitude || org.coordinates?.lng || 78.5311;
      const locName = org.locality || org.area || '';
      setFormData({
        name: org.name || '',
        tagline: org.tagline || '',
        contact_phone: org.contact_phone || '',
        emergency_phone: org.emergency_phone || '',
        email: org.email || '',
        website: org.website || '',
        established_year: org.established_year || '',
        bed_capacity: org.bed_capacity || '',
        emergency_24x7: org.emergency_24x7 !== undefined ? org.emergency_24x7 : true,
        operating_hours: org.operating_hours || '',
        address: org.address || '',
        locality: locName,
        area: locName,
        city: org.city || 'Hyderabad',
        state: org.state || 'Telangana',
        pincode: org.pincode || '',
        country: org.country || 'India',
        latitude: detectedLat,
        longitude: detectedLng,
        lat: detectedLat,
        lng: detectedLng,
        departments: org.departments || []
      });
      setDocuments(org.verification_documents || []);
    }
  }, [org]);

  const handleAddDept = () => {
    if (!newDept.trim()) return;
    if (!formData.departments.includes(newDept.trim())) {
      setFormData({
        ...formData,
        departments: [...formData.departments, newDept.trim()]
      });
    }
    setNewDept('');
  };

  const handleRemoveDept = (deptToRemove) => {
    setFormData({
      ...formData,
      departments: formData.departments.filter(d => d !== deptToRemove)
    });
  };

  const handleDocChange = (docType, docData) => {
    // Check if doc with this type already exists
    const existingIndex = documents.findIndex(d => d.type === docType || d.document_type === docType);
    let updated;
    if (existingIndex >= 0) {
      if (docData === null) {
        // Removed
        updated = documents.filter((_, i) => i !== existingIndex);
      } else {
        // Replaced
        updated = [...documents];
        updated[existingIndex] = { ...docData, type: docType, document_type: docType };
      }
    } else if (docData) {
      // New
      updated = [...documents, { ...docData, type: docType, document_type: docType }];
    }
    setDocuments(updated || []);
  };

  const getDocValue = (docType) => {
    return documents.find(d => d.type === docType || d.document_type === docType) || null;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    const finalLat = parseFloat(formData.latitude || formData.lat) || 17.4491;
    const finalLng = parseFloat(formData.longitude || formData.lng) || 78.5311;
    const finalLocality = formData.locality || formData.area || '';

    const payload = {
      name: formData.name,
      tagline: formData.tagline,
      contact_phone: formData.contact_phone,
      emergency_phone: formData.emergency_phone,
      email: formData.email,
      website: formData.website,
      established_year: formData.established_year ? parseInt(formData.established_year) : undefined,
      bed_capacity: formData.bed_capacity ? parseInt(formData.bed_capacity) : undefined,
      emergency_24x7: formData.emergency_24x7,
      operating_hours: formData.operating_hours,
      address: formData.address,
      locality: finalLocality,
      area: finalLocality,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: formData.country || 'India',
      latitude: finalLat,
      longitude: finalLng,
      coordinates: {
        lat: finalLat,
        lng: finalLng
      },
      departments: formData.departments
    };

    try {
      if (isHospital) {
        await api.updateHospitalSettings(payload);
        if (documents.length > 0) {
          await api.updateHospitalDocuments({ verification_documents: documents });
        }
      } else {
        await api.updateClinicSettings(payload);
        if (documents.length > 0) {
          await api.updateClinicDocuments({ verification_documents: documents });
        }
      }
      setSaveSuccess('Profile and compliance details saved successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      setSaveError(err.message || 'Failed to update organization details.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accredited & Verified
          </span>
        );
      case 'pending_verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            Pending Accreditation Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Verification Needs Correction
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Draft / Unverified
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {isHospital ? 'Hospital Profile & Legal Documents' : 'Clinic Profile & Legal Documents'}
              </h1>
              {getStatusBadge(org.verification_status)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Public profile information, geolocation, clinical departments, and regulatory accreditation documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            Public Preview
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Profile & Docs'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{saveError}</span>
          </div>
          <button onClick={() => setSaveError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Form Grid */}
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General & Contact Information (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Building2 className="w-4 h-4 text-indigo-400" />
              General Organization Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Organization Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Yashoda Super Speciality Hospital"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Compassionate Healthcare with Cutting-Edge Technology"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="contact@hospital.org"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Official Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  General Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="+91 40 4567 8900"
                  />
                </div>
              </div>

              {isHospital && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    24x7 Emergency Helpline Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-rose-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.emergency_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="+91 40 4567 8999"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Established Year
                </label>
                <input
                  type="number"
                  value={formData.established_year}
                  onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. 1995"
                />
              </div>

              {isHospital && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Total Inpatient Bed Capacity
                  </label>
                  <div className="relative">
                    <BedDouble className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={formData.bed_capacity}
                      onChange={(e) => setFormData({ ...formData, bed_capacity: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="e.g. 450"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Operating Hours Description
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.operating_hours}
                  onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Open 24 Hours (Emergency) | OPD: 08:30 AM - 08:00 PM"
                />
              </div>
            </div>

            {isHospital && (
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={formData.emergency_24x7}
                    onChange={(e) => setFormData({ ...formData, emergency_24x7: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      24x7 Emergency & Trauma Center Operational
                    </div>
                    <p className="text-xs text-slate-400">
                      Enables emergency badge on patient discovery search and prioritized emergency listings.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Location & Geolocation Section with Interactive Map */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Physical Address & Interactive Location Selection</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select your exact hospital premises on the map or search. Coordinates are handled internally.
                </p>
              </div>
            </div>

            <InteractiveLocationPicker
              addressData={{
                address: formData.address,
                locality: formData.locality || formData.area,
                area: formData.area || formData.locality,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                country: formData.country || 'India',
                latitude: formData.latitude || formData.lat,
                longitude: formData.longitude || formData.lng
              }}
              onChange={(locData) => {
                setFormData(prev => ({
                  ...prev,
                  ...locData,
                  area: locData.locality || locData.area,
                  locality: locData.locality || locData.area,
                  latitude: locData.latitude,
                  longitude: locData.longitude,
                  lat: locData.latitude,
                  lng: locData.longitude
                }));
              }}
              onConfirm={() => {
                setSaveSuccess('Location verified and confirmed on map.');
              }}
              isConfirmed={true}
            />
          </div>

          {/* Clinical Departments & Specialities */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Accredited Clinical Departments & Specialities
            </h2>

            <div className="flex flex-wrap gap-2">
              {formData.departments.map((dept, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {dept}
                  <button
                    type="button"
                    onClick={() => handleRemoveDept(dept)}
                    className="hover:text-rose-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {formData.departments.length === 0 && (
                <p className="text-xs text-slate-500 italic">No clinical departments added yet.</p>
              )}
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDept();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Cardiology, Orthopedics..."
              />
              <button
                type="button"
                onClick={handleAddDept}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Regulatory & Compliance Documents (1 col) */}
        <div className="space-y-6">
          {/* Regulatory Warning & Notice */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Compliance & Verification
            </h2>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Regulatory Compliance Notice
              </div>
              <p className="text-amber-300/80 leading-relaxed">
                All clinical certificates undergo mandatory verification by the Super Admin compliance board. Replacing any active certificate automatically places this organization in <strong>Pending Verification</strong> status until cleared.
              </p>
            </div>

            {org.admin_remarks && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="text-slate-400 font-medium mb-1">Auditor Feedback:</div>
                <div className="text-slate-300 italic">{org.admin_remarks}</div>
              </div>
            )}

            {/* Document Upload Controls */}
            <div className="space-y-5 pt-2">
              <DocumentUploadControl
                label="Clinical Establishment License"
                description="State Health Directorate registration permit (PDF/JPG)"
                documentType="clinical_establishment_license"
                orgType={orgType}
                value={getDocValue('clinical_establishment_license')}
                onChange={(doc) => handleDocChange('clinical_establishment_license', doc)}
                required={true}
              />

              <DocumentUploadControl
                label="Fire Safety Compliance NOC"
                description="Fire Service Department authorization (PDF/JPG)"
                documentType="fire_safety_noc"
                orgType={orgType}
                value={getDocValue('fire_safety_noc')}
                onChange={(doc) => handleDocChange('fire_safety_noc', doc)}
              />

              <DocumentUploadControl
                label="Bio-Medical Waste Authorization"
                description="Pollution Control Board certificate (PDF/JPG)"
                documentType="pollution_control_bmw"
                orgType={orgType}
                value={getDocValue('pollution_control_bmw')}
                onChange={(doc) => handleDocChange('pollution_control_bmw', doc)}
              />

              <DocumentUploadControl
                label="Municipal Trade / Entity License"
                description="Municipal Corporation operational permit (PDF/JPG)"
                documentType="trade_license"
                orgType={orgType}
                value={getDocValue('trade_license')}
                onChange={(doc) => handleDocChange('trade_license', doc)}
              />
            </div>
          </div>

          {/* Verification History Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Accreditation Audit History
            </h3>

            {org.verification_history && org.verification_history.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {org.verification_history.map((hist, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-200">
                      <span className="capitalize">{hist.action ? hist.action.replace('_', ' ') : 'Status Updated'}</span>
                      <span className="text-[10px] text-slate-500">
                        {hist.timestamp ? new Date(hist.timestamp).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {hist.remarks && (
                      <p className="text-[11px] text-slate-400 mt-1">{hist.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No past accreditation entries.</p>
            )}
          </div>
        </div>
      </form>

      {/* Public Profile Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Public Profile Preview</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white">{formData.name || 'Organization Name'}</h4>
                  {getStatusBadge(org.verification_status)}
                </div>
                {formData.tagline && <p className="text-xs text-indigo-400">{formData.tagline}</p>}
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {formData.address || 'Address pending'}, {formData.area}, {formData.city} - {formData.pincode}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    {formData.contact_phone || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    {formData.email || 'N/A'}
                  </span>
                  {formData.operating_hours && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {formData.operating_hours}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Departments & Specialities</h5>
                <div className="flex flex-wrap gap-1.5">
                  {formData.departments.map((d, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700">
                      {d}
                    </span>
                  ))}
                  {formData.departments.length === 0 && (
                    <span className="text-xs text-slate-500">No departments specified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfileDocumentsTab;
