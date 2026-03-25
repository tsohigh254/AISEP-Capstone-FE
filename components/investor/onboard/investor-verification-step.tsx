"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, ArrowRight, ShieldCheck, Upload, 
  X, FileText, CheckCircle2, AlertCircle, Info 
} from "lucide-react";
import { IInvestorKYCSubmission } from "@/types/investor-kyc";

const SUBMITTER_ROLES = [
  { value: "PARTNER", label: "Partner" },
  { value: "INVESTMENT_MANAGER", label: "Investment Manager" },
  { value: "ANALYST", label: "Analyst" },
  { value: "LEGAL_REPRESENTATIVE", label: "Legal Representative" },
  { value: "AUTHORIZED_PERSON", label: "Authorized Person" }
];

interface InvestorVerificationStepProps {
  data: Partial<IInvestorKYCSubmission>;
  onChange: (data: Partial<IInvestorKYCSubmission>) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
  files: {
    idFile: File | null;
    setIdFile: (f: File | null) => void;
    proofFile: File | null;
    setProofFile: (f: File | null) => void;
  };
}

export function InvestorVerificationStep({ data, onChange, onNext, onBack, errors, files }: InvestorVerificationStepProps) {
  const set = (key: keyof IInvestorKYCSubmission, val: any) => onChange({ ...data, [key]: val });
  const isInstitutional = data.investorCategory === "INSTITUTIONAL";

  const inputClass = (name: string) => cn(
    "w-full h-11 px-4 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white",
    "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
    errors[name] ? "border-red-300 bg-red-50/10" : "border-slate-200 shadow-sm shadow-black/[0.01]"
  );

  const Label = ({ children, required, icon: Icon }: any) => (
    <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 mb-1.5 ml-0.5 uppercase tracking-tight">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      {children}
      {required && <span className="text-red-500 ml-1 font-black">*</span>}
    </label>
  );

  /* ── Institutional Branch ──────────────────────────────────── */
  const InstitutionalForm = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <Label required>Tên pháp lý tổ chức</Label>
          <input 
            value={data.legalOrganizationName || ""}
            onChange={e => set("legalOrganizationName", e.target.value)}
            placeholder="Ví dụ: Công ty TNHH AISEP Việt Nam"
            className={inputClass("legalOrganizationName")}
          />
          {errors.legalOrganizationName && <p className="text-red-500 text-[11px] font-bold">{errors.legalOrganizationName}</p>}
        </div>
        <div className="space-y-1">
          <Label required>Mã số doanh nghiệp / Thuế</Label>
          <input 
            value={data.taxIdOrBusinessCode || ""}
            onChange={e => set("taxIdOrBusinessCode", e.target.value)}
            placeholder="Mã số thuế 10 số"
            className={inputClass("taxIdOrBusinessCode")}
          />
          {errors.taxIdOrBusinessCode && <p className="text-red-500 text-[11px] font-bold">{errors.taxIdOrBusinessCode}</p>}
        </div>
      </div>

      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Info className="w-3.5 h-3.5" /> Thông tin người nộp hồ sơ
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <Label required>Họ tên người đại diện</Label>
            <input 
              value={data.fullName || ""}
              onChange={e => set("fullName", e.target.value)}
              className={inputClass("fullName")}
            />
          </div>
          <div className="space-y-1">
            <Label required>Vai trò trong tổ chức</Label>
            <select 
              value={data.submitterRole || ""}
              onChange={e => set("submitterRole", e.target.value as any)}
              className={inputClass("submitterRole")}
            >
              <option value="">-- Chọn vai trò --</option>
              {SUBMITTER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Individual Branch ────────────────────────────────────── */
  const IndividualForm = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <Label required>Họ và tên đầy đủ</Label>
          <input 
            value={data.fullName || ""}
            onChange={e => set("fullName", e.target.value)}
            placeholder="Nhập theo CMND / CCCD"
            className={inputClass("fullName")}
          />
        </div>
        <div className="space-y-1">
          <Label required>Email liên hệ</Label>
          <input 
            value={data.contactEmail || ""}
            onChange={e => set("contactEmail", e.target.value)}
            className={inputClass("contactEmail")}
          />
        </div>
      </div>
    </div>
  );

  /* ── File Upload Helper ────────────────────────────────────── */
  const FileBox = ({ label, file, setFile, error, help }: any) => (
    <div className="space-y-2">
      <Label required>{label}</Label>
      <p className="text-[11px] text-slate-400 font-medium italic">{help}</p>
      <div 
        onClick={() => {}} // Handle separately
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden",
          file ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300",
          error && "border-red-200 bg-red-50/40"
        )}
      >
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
        />
        {file ? (
          <div className="text-center animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-lg bg-white border border-emerald-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[12px] font-bold text-emerald-700 truncate max-w-[200px]">{file.name}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-bold uppercase tracking-tight">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-3 text-[10px] font-black text-red-500 uppercase tracking-tighter hover:underline">Gỡ bỏ file</button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Upload className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[13px] font-bold text-slate-500">Click hoặc kéo thả tài liệu</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">PDF, JPG, PNG (Tối đa 10MB)</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-[11px] font-bold">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#eec54e]/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-[#eec54e]" />
        </div>
        <div>
          <h2 className="text-[24px] font-black text-[#171611] tracking-tight leading-tight">Xác thực Danh tính (KYC)</h2>
          <p className="text-[14px] text-slate-500 font-medium">Bảo vệ quyền lợi và nâng cao uy tín cho tài khoản của bạn.</p>
        </div>
      </div>

      {isInstitutional ? <InstitutionalForm /> : <IndividualForm />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <FileBox 
          label={isInstitutional ? "Giấy phép kinh doanh / Thành lập" : "CCCD / Hộ chiếu"}
          file={files.idFile}
          setFile={files.setIdFile}
          error={errors.idOrBusinessLicenseFile}
          help={isInstitutional ? "Bản scan đăng ký kinh doanh hợp lệ." : "Mặt trước CMND/CCCD hoặc trang thông tin Hộ chiếu."}
        />
        <FileBox 
          label="Bằng chứng hoạt động đầu tư"
          file={files.proofFile}
          setFile={files.setProofFile}
          error={errors.investmentProofFile}
          help="Portfolio, Deal highlights hoặc Profile từ tổ chức chuyên môn."
        />
      </div>

      {/* Declaration Checkbox */}
      <div className="pt-4">
        <label
          className={cn(
            "flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all group shadow-sm",
            data.declarationAccepted
              ? "bg-emerald-50/20 border-emerald-200 ring-1 ring-emerald-500/10"
              : "bg-slate-50 border-slate-200 hover:border-slate-300",
            errors.declaration && "border-red-200 bg-red-50/40"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all text-white",
              data.declarationAccepted ? "border-emerald-500 bg-emerald-500 shadow-inner" : "border-slate-300 bg-white"
            )}
            onClick={(e) => { 
                e.preventDefault();
                set("declarationAccepted", !data.declarationAccepted); 
            }}
          >
            {data.declarationAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
          </div>
          <div onClick={(e) => {
              e.preventDefault();
              set("declarationAccepted", !data.declarationAccepted); 
          }}>
            <p className="text-[13px] font-bold text-slate-700 leading-snug">Tôi cam kết mọi thông tin cung cấp là hoàn toàn chính xác.</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-medium">
              Tôi hiểu rằng việc cung cấp thông tin sai lệch có thể dẫn đến việc từ chối hồ sơ hoặc khóa tài khoản vĩnh viễn theo quy định của AISEP.
            </p>
          </div>
        </label>
        {errors.declaration && <p className="text-red-500 text-[11px] font-bold mt-2 ml-1">{errors.declaration}</p>}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Bước 3
        </button>
        <button
          onClick={onNext}
          className="h-11 px-8 bg-slate-900 text-white rounded-xl text-[13px] font-bold flex items-center gap-2.5 hover:bg-slate-800 transition-all shadow-lg shadow-black/5 group active:scale-95"
        >
          Tiếp tục: Kiểm tra hồ sơ
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}
