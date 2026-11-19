import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import {
  Upload,
  FileText,
  File,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  X
} from 'lucide-react';

export const DocumentUploadControl = ({
  label = 'Upload Verification Document',
  description = 'Allowed formats: PDF, JPG, PNG (Max 10 MB)',
  documentType = 'registration_document',
  orgType = 'hospital',
  value = null, // Document metadata object or null
  onChange,
  required = false
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Frontend Validation
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setError(`Invalid file type '${ext}'. Please upload a PDF, JPG, or PNG document.`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 10 MB limit.`);
      return;
    }

    // Start Upload
    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('org_type', orgType);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 20 : prev));
    }, 150);

    try {
      const res = await api.uploadAdminDocument(formData);
      clearInterval(progressTimer);
      setProgress(100);

      const uploadedDoc = res.document || {
        original_name: file.name,
        file_name: file.name,
        file_size: file.size,
        file_size_formatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        content_type: file.type,
        view_url: `/api/admin/documents/view/${file.name}`,
        download_url: `/api/admin/documents/download/${file.name}`,
        uploaded_at: new Date().toISOString()
      };

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        if (onChange) onChange(uploadedDoc);
      }, 300);
    } catch (err) {
      clearInterval(progressTimer);
      setUploading(false);
      setProgress(0);
      setError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (value?.file_name) {
      try {
        await api.deleteAdminDocument(value.file_name);
      } catch (err) {
        console.warn('Document cleanup notice:', err);
      }
    }
    setError(null);
    if (onChange) onChange(null);
  };

  const isPdf = value?.original_name?.toLowerCase().endsWith('.pdf') || value?.file_name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {value && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Verified & Stored
          </span>
        )}
      </div>

      {description && <p className="text-[11px] text-slate-400">{description}</p>}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Upload Error:</span> {error}
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UPLOADING STATE */}
      {uploading && (
        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              Securing & Encrypting Document...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* STATE 1: NO DOCUMENT UPLOADED */}
      {!uploading && !value && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-5 text-center cursor-pointer transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 flex items-center justify-center mx-auto mb-2 transition">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
            Click to Upload Document
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Supported formats: PDF, JPG, PNG (up to 10 MB)
          </p>
        </div>
      )}

      {/* STATE 2: DOCUMENT UPLOADED & STORED */}
      {!uploading && value && (
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* File Metadata */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate" title={value.original_name || value.file_name}>
                {value.original_name || value.file_name}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                <span className="font-semibold uppercase">{isPdf ? 'PDF Document' : 'Image'}</span>
                <span>•</span>
                <span>{value.file_size_formatted || `${((value.file_size || 0) / 1024).toFixed(1)} KB`}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Preview, Download, Replace, Remove */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {/* Preview Button */}
            {value.view_url && (
              <a
                href={value.view_url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                title="Preview document in new tab"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Preview</span>
              </a>
            )}

            {/* Download Button */}
            {value.download_url && (
              <a
                href={value.download_url}
                download={value.original_name || 'document'}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                title="Download document"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download</span>
              </a>
            )}

            {/* Replace Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
              title="Replace this document"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>Replace</span>
            </button>

            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
              title="Remove document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
