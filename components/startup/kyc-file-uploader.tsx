"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface KycFileUploaderProps {
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  limit?: number;
  onChange?: (files: File[]) => void;
  error?: string;
}

export function KycFileUploader({
  label = "Tải tài liệu lên",
  description,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  limit = 1,
  onChange,
  error
}: KycFileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const validFiles: File[] = [];
    const currentFileCount = files.length;
    
    Array.from(newFiles).forEach(file => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Dung lượng file "${file.name}" vượt quá ${maxSizeMB}MB`);
        return;
      }
      if (validFiles.length + currentFileCount < limit) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  return (
    <div className="space-y-3">
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2">
        {label} <span className="text-red-500">*</span>
      </label>
      
      {/* Upload Zone */}
      {files.length < limit && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileChange(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-8 flex flex-col items-center text-center",
            isDragOver 
              ? "border-[#eec54e] bg-[#eec54e]/5" 
              : error 
                ? "border-red-200 bg-red-50/40" 
                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-[#eec54e]/50"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files)}
            accept={accept}
            multiple={limit > 1}
            className="hidden"
          />
          <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 transition-all">
            <Upload className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-[13px] font-semibold text-slate-900 mb-1">
            {files.length === 0 ? "Kéo thả hoặc nhấp để tải lên" : "Tải thêm tài liệu"}
          </p>
          <p className="text-[12px] text-slate-400 font-medium">
            {description || `Hỗ trợ ${accept} (Tối đa ${maxSizeMB}MB)`}
          </p>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between group animate-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-slate-400 text-right px-2 font-medium">
            Đã chọn {files.length}/{limit} tài liệu
          </p>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1.5 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
