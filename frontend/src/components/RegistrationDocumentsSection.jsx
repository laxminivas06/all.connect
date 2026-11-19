import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

const MAX_DOC_BYTES = 100 * 1024; // 100 KB
const MAX_DOCS_COUNT = 5;
const ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

const COMMON_DOC_NAMES = [
  'Clinical Establishment Registration',
  'Pharmacy Licence',
  'Trade Licence',
  'Organisation Registration Certificate',
  'GSTIN Registration Certificate',
  'Pharmacist Registration Certificate',
  'Premises Ownership / Lease Deed',
  'Supporting Document'
];

export const RegistrationDocumentsSection = ({
  documents = [],
  onChange,
  orgType = 'hospital'
}) => {
  const [docNameInput, setDocNameInput] = useState('');
  const [error, setError] = useState('');
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const fileInputRefs = useRef({});

  const canAddMore = documents.length < MAX_DOCS_COUNT;

  // Add new empty slot or slot with chosen document name
  const handleAddNewEntry = (defaultName = '') => {
    if (!canAddMore) {
      setError('Maximum 5 files limit reached. Please remove a file to add another.');
      return;
    }
    setError('');

    const newDoc = {
      id: `doc-entry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      document_name: defaultName || docNameInput.trim() || 'Supporting Document',
      file: null,
      file_name: '',
      original_name: '',
      file_type: '',
      size_bytes: 0,
      size_formatted: '',
      preview_url: '',
      status: 'pending_verification' // explicitly NOT verified
    };

    onChange([...documents, newDoc]);
    setDocNameInput('');
  };

  const handleFileSelect = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    // 1. Format check
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`Invalid file format '${ext}'. Allowed: PDF (.pdf), JPG (.jpg, .jpeg), PNG (.png), and WEBP (.webp).`);
      if (fileInputRefs.current[idx]) fileInputRefs.current[idx].value = '';
      return;
    }

    // 2. Strict 100 KB check
    if (file.size > MAX_DOC_BYTES) {
      const sizeKB = (file.size / 1024).toFixed(1);
      setError(`File '${file.name}' (${sizeKB} KB) exceeds the strict 100 KB limit. Please upload a file under 100 KB.`);
      if (fileInputRefs.current[idx]) fileInputRefs.current[idx].value = '';
      return;
    }

    const isPdf = ext === '.pdf';
    setUploadingIdx(idx);

    // Read preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const previewUrl = event.target?.result;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_name', documents[idx]?.document_name || 'Supporting Document');
        formData.append('org_type', orgType);

        const res = await api.uploadOrgDocument(formData);
        const serverDoc = res.document || {};

        const updated = [...documents];
        updated[idx] = {
          ...updated[idx],
          file_name: serverDoc.file_name || file.name,
          original_name: file.name,
          file_type: ext.replace('.', ''),
          size_bytes: file.size,
          size_formatted: `${(file.size / 1024).toFixed(1)} KB`,
          preview_url: isPdf ? '' : previewUrl,
          view_url: serverDoc.view_url || '',
          download_url: serverDoc.download_url || '',
          status: 'pending_verification' // explicitly NOT auto-verified
        };
        onChange(updated);
      } catch (err) {
        console.warn('Document server upload fallback:', err);
        // Fallback store with local preview
        const updated = [...documents];
        updated[idx] = {
          ...updated[idx],
          file_name: file.name,
          original_name: file.name,
          file_type: ext.replace('.', ''),
          size_bytes: file.size,
          size_formatted: `${(file.size / 1024).toFixed(1)} KB`,
          preview_url: isPdf ? '' : previewUrl,
          status: 'pending_verification'
        };
        onChange(updated);
      } finally {
        setUploadingIdx(null);
      }
    };

    if (isPdf) {
      // PDF does not need image data URL
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateName = (idx, name) => {
    const updated = [...documents];
    updated[idx].document_name = name;
    onChange(updated);
  };

  const handleRemove = (idx) => {
    setError('');
    const updated = documents.filter((_, i) => i !== idx);
    onChange(updated);
  };

  const handleTriggerFile = (idx) => {
    if (fileInputRefs.current[idx]) {
      fileInputRefs.current[idx].click();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Registration Documents & Supporting Images</span>
          </h3>
          <p className="text-xs text-slate-500">
            Upload verified licenses, certificates, and facility photos (PDF, JPG, PNG, WEBP).
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-black px-3 py-1 rounded-full border ${
            documents.length >= MAX_DOCS_COUNT
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {documents.length} / {MAX_DOCS_COUNT} Files Uploaded
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Suggestions for Document Names */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 block">
          Add Document by Custom Category:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_DOC_NAMES.slice(0, orgType === 'pharmacy' ? 5 : 6).map((name) => (
            <button
              key={name}
              type="button"
              disabled={!canAddMore}
              onClick={() => handleAddNewEntry(name)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + {name}
            </button>
          ))}
        </div>
      </div>

      {/* Document Entries List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No documents added yet</p>
            <p className="text-[11px] text-slate-400">
              Click any quick category above or add a custom document name below. (Max 5 files, 100 KB each)
            </p>
            <button
              type="button"
              onClick={() => handleAddNewEntry(orgType === 'pharmacy' ? 'Pharmacy Licence' : 'Clinical Establishment Registration')}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Primary Licence / Certificate</span>
            </button>
          </div>
        ) : (
          documents.map((doc, idx) => {
            const isPdf = doc.file_type === 'pdf' || (doc.file_name && doc.file_name.toLowerCase().endsWith('.pdf'));
            const isUploaded = Boolean(doc.file_name);

            return (
              <div
                key={doc.id || idx}
                className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3 transition hover:border-slate-300"
              >
                {/* Hidden File Input */}
                <input
                  ref={el => fileInputRefs.current[idx] = el}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => handleFileSelect(idx, e)}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  
                  {/* Document Name Field */}
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Document #{idx + 1} Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter document name (e.g. Clinical Establishment Registration)"
                      value={doc.document_name}
                      onChange={(e) => handleUpdateName(idx, e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  {/* Actions: Upload, Replace, Remove */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {!isUploaded ? (
                      <button
                        type="button"
                        onClick={() => handleTriggerFile(idx)}
                        disabled={uploadingIdx === idx}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
                      >
                        <Upload className={`w-3.5 h-3.5 ${uploadingIdx === idx ? 'animate-spin' : ''}`} />
                        <span>{uploadingIdx === idx ? 'Uploading...' : 'Upload File'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTriggerFile(idx)}
                        disabled={uploadingIdx === idx}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${uploadingIdx === idx ? 'animate-spin' : ''}`} />
                        <span>Replace</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Details & Preview Row */}
                {isUploaded && (
                  <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      {isPdf ? (
                        <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 shrink-0 font-black text-[9px]">
                          <FileText className="w-4 h-4" />
                          <span>PDF</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {doc.preview_url ? (
                            <img src={doc.preview_url} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0 space-y-0.5">
                        <p className="font-bold text-slate-800 truncate text-xs">
                          {doc.original_name || doc.file_name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Size: <strong className="text-slate-600">{doc.size_formatted}</strong> • Format: {doc.file_type?.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Super Admin Verification</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Named Entry Field */}
      {canAddMore && (
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="Type other custom document name..."
            value={docNameInput}
            onChange={(e) => setDocNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNewEntry();
              }
            }}
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="button"
            onClick={() => handleAddNewEntry()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Document Slot</span>
          </button>
        </div>
      )}

      {!canAddMore && (
        <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-semibold text-center">
          Maximum limit of 5 registration documents reached.
        </p>
      )}

    </div>
  );
};
