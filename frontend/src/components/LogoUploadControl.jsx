import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Camera
} from 'lucide-react';
import { api } from '../services/api';

const MAX_LOGO_BYTES = 100 * 1024; // 100 KB
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export const LogoUploadControl = ({
  logoUrl,
  logoFileMeta,
  onLogoChange,
  label = 'Organisation Logo',
  subtitle = 'PNG, JPG, or WEBP up to 100 KB'
}) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // 1. Format validation
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isValidExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    if (!ALLOWED_LOGO_TYPES.includes(file.type) && !isValidExt) {
      setError(`Unsupported format '${ext}'. Allowed formats: PNG, JPG, JPEG, and WEBP.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Strict 100 KB size validation
    if (file.size > MAX_LOGO_BYTES) {
      const sizeKB = (file.size / 1024).toFixed(1);
      setError(`Logo size (${sizeKB} KB) exceeds the strict 100 KB limit. Please select a compressed image under 100 KB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Local data preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const previewUrl = event.target?.result;
      
      // Try immediate upload to server
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.uploadOrgLogo(formData);
        
        onLogoChange({
          url: res.view_url || previewUrl,
          file_name: res.file_name || file.name,
          original_name: file.name,
          size_bytes: file.size,
          size_formatted: `${(file.size / 1024).toFixed(1)} KB`
        });
      } catch (uploadErr) {
        // Fallback to local data URL if offline/unauthorized, but store metadata
        console.warn('Server logo upload fallback:', uploadErr);
        onLogoChange({
          url: previewUrl,
          file_name: file.name,
          original_name: file.name,
          size_bytes: file.size,
          size_formatted: `${(file.size / 1024).toFixed(1)} KB`
        });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onLogoChange(null);
  };

  const handleTriggerPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 block">{label}</label>
        <span className="text-[10px] text-slate-400 font-semibold">{subtitle}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {logoUrl ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <img
                src={logoUrl}
                alt="Logo Preview"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-bold text-slate-900 truncate">
                {logoFileMeta?.original_name || logoFileMeta?.file_name || 'organisation_logo'}
              </p>
              <p className="text-[10px] text-slate-500">
                Size: <strong className="text-emerald-700">{logoFileMeta?.size_formatted || '< 100 KB'}</strong> • Status: Valid
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Uploaded & Ready
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleTriggerPicker}
              disabled={uploading}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleTriggerPicker}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 sm:p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
            <Camera className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            Click to upload {label.toLowerCase()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            PNG, JPG, JPEG, or WEBP (Max 100 KB)
          </p>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
