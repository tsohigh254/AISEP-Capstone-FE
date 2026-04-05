"use client";

import { useRef, useState } from "react";
import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  error,
}: KycFileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: File[] = [];
    const currentFileCount = files.length;

    Array.from(newFiles).forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Dung lượng tệp "${file.name}" vượt quá ${maxSizeMB}MB.`);
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
      <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label} <span className="text-red-500">*</span>
      </label>

      {files.length < limit && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileChange(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-8 text-center transition-all",
            isDragOver
              ? "border-[#eec54e] bg-[#eec54e]/5"
              : error
                ? "border-red-200 bg-red-50/40"
                : "border-slate-200 bg-slate-50 hover:border-[#eec54e]/50 hover:bg-white",
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

          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white shadow-sm transition-all">
            <Upload className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mb-1 text-[13px] font-semibold text-slate-900">
            {files.length === 0 ? "Kéo thả hoặc nhấp để tải lên" : "Tải thêm tài liệu"}
          </p>
          <p className="text-[12px] font-medium text-slate-400">
            {description || `Hỗ trợ ${accept} (Tối đa ${maxSizeMB}MB)`}
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="max-w-[200px] truncate text-[13px] font-semibold text-slate-900">
                    {file.name}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <p className="px-2 text-right text-[11px] font-medium text-slate-400">
            Đã chọn {files.length}/{limit} tài liệu
          </p>
        </div>
      )}

      {error && (
        <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
