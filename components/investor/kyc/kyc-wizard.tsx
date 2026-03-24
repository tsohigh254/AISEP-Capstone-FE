"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Check, Upload, Loader2,
  AlertCircle, ShieldCheck, X, FileText, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IInvestorKYCStatus, IInvestorKYCSubmission } from "@/types/investor-kyc";

/* ─── Constants ──────────────────────────────────────────────── */

const INVESTOR_TYPES = [
  { value: "INDIVIDUAL_ANGEL", label: "Nhà đầu tư thiên thần (Cá nhân)" },
  { value: "VENTURE_CAPITAL", label: "Quỹ đầu tư mạo hiểm (VC)" },
  { value: "PRIVATE_EQUITY", label: "Quỹ đầu tư tư nhân (PE)" },
  { value: "FAMILY_OFFICE", label: "Văn phòng gia đình (Family Office)" },
  { value: "CORPORATE_VC", label: "Quỹ đầu tư doanh nghiệp (CVC)" },
  { value: "ACCELERATOR_INCUBATOR", label: "Vườn ươm / Tăng tốc khởi nghiệp" },
];

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_MB = 10;

/* ─── Props ──────────────────────────────────────────────────── */

interface KYCWizardProps {
  initialStatus: IInvestorKYCStatus;
  isResubmit?: boolean;
  onCancel: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  onSaveStep: (data: Partial<IInvestorKYCSubmission>) => Promise<void>;
}

/* ─── Helper ─────────────────────────────────────────────────── */

function buildInitialForm(status: IInvestorKYCStatus, isResubmit: boolean): Partial<IInvestorKYCSubmission> {
  const src = isResubmit ? status.previousSubmission : status.draftData;
  return {
    fullName: src?.fullName ?? status.submissionSummary?.fullName ?? "",
    contactEmail: src?.contactEmail ?? "",
    declarationAccepted: src?.declarationAccepted ?? false,
    investorType: src?.investorType ?? "",
    currentRoleTitle: src?.currentRoleTitle ?? "",
    organizationName: src?.organizationName ?? "",
    linkedinOrWebsite: src?.linkedinOrWebsite ?? "",
  };
}

/* ─── Component ──────────────────────────────────────────────── */

export function KYCWizard({ initialStatus, isResubmit = false, onCancel, onSubmit, onSaveStep }: KYCWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [formData, setFormData] = useState<Partial<IInvestorKYCSubmission>>(() => buildInitialForm(initialStatus, isResubmit));
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Files
  const [idFile, setIdFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  const [dragOverId, setDragOverId] = useState(false);
  const [dragOverProof, setDragOverProof] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const flagged = initialStatus.flaggedFields ?? [];
  const isFlagged = (f: string) => flagged.includes(f);

  /* ── Auto-save ─────────────────────────────────────────────── */
  useEffect(() => {
    if (step !== 1 || (!formData.fullName && !formData.contactEmail)) return;
    const t = setTimeout(async () => {
      setAutoSaveState("saving");
      try { 
        await onSaveStep(formData); 
        setAutoSaveState("saved"); 
        setTimeout(() => setAutoSaveState("idle"), 3000); 
      } catch { 
        setAutoSaveState("idle"); 
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [formData.fullName, formData.contactEmail, formData.declarationAccepted]);

  /* ── Field update ──────────────────────────────────────────── */
  const set = (key: keyof IInvestorKYCSubmission, val: unknown) =>
    setFormData(p => ({ ...p, [key]: val }));

  const clearErr = (key: string) =>
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });

  /* ── Manual save draft ─────────────────────────────────────── */
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try { 
      await onSaveStep(formData); 
      toast.success("Đã lưu bản nháp thành công"); 
    } catch { 
      toast.error("Lưu bản nháp thất bại"); 
    } finally { 
      setIsSavingDraft(false); 
    }
  };

  /* ── Validation ────────────────────────────────────────────── */
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName?.trim()) e.fullName = "Vui lòng nhập họ và tên đầy đủ";
    if (!formData.contactEmail?.trim()) e.contactEmail = "Vui lòng nhập email liên lạc";
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) e.contactEmail = "Email không đúng định dạng";
    if (!formData.declarationAccepted) e.declaration = "Vui lòng xác nhận cam kết bảo mật";
    setErrors(e); 
    return !Object.keys(e).length;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!formData.investorType) e.investorType = "Vui lòng chọn loại hình nhà đầu tư";
    if (!formData.currentRoleTitle?.trim()) e.currentRoleTitle = "Vui lòng nhập chức vụ của bạn";
    if (!formData.organizationName?.trim()) e.organizationName = "Vui lòng nhập tên công ty/quỹ";
    if (!formData.linkedinOrWebsite?.trim()) e.linkedinOrWebsite = "Vui lòng nhập LinkedIn hoặc Website";
    
    if (!idFile && !isResubmit) e.idOrBusinessLicenseFile = "Vui lòng tải lên giấy phép KD hoặc CCCD";
    
    setErrors(e); 
    return !Object.keys(e).length;
  };

  /* ── File Handling ─────────────────────────────────────────── */
  const handleFile = (file: File, type: "ID" | "PROOF") => {
    if (!ACCEPTED_TYPES.includes(file.type)) { 
      toast.error("Định dạng file không hỗ trợ (Chỉ PDF, JPG, PNG)"); 
      return; 
    }
    if (file.size > MAX_MB * 1024 * 1024) { 
      toast.error(`Dung lượng file vượt quá ${MAX_MB}MB`); 
      return; 
    }
    
    if (type === "ID") {
      setIdFile(file);
      clearErr("idOrBusinessLicenseFile");
    } else {
      setProofFile(file);
      clearErr("investmentProofFile");
    }
  };

  /* ── Navigation ────────────────────────────────────────────── */
  const handleNext = () => { 
    if (validateStep1()) { 
      setStep(2); 
      window.scrollTo({ top: 0, behavior: "smooth" }); 
    } 
  };
  const handleBack = () => { 
    setStep(1); 
    setErrors({}); 
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      if (idFile) fd.append("idOrBusinessLicenseFile", idFile);
      if (proofFile) fd.append("investmentProofFile", proofFile);
      
      await onSubmit(fd);
    } catch { 
      toast.error("Không thể gửi hồ sơ. Vui lòng thử lại sau."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  /* ── Styled Helpers ─────────────────────────────────────────── */
  const inputClass = (name: string) => cn(
    "w-full h-11 px-4 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white",
    "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
    isFlagged(name) ? "border-orange-300 bg-orange-50/40" : "border-slate-200",
    errors[name] && "border-red-300 bg-red-50/40"
  );

  const FieldLabel = ({ children, name, required }: { children: React.ReactNode; name: string; required?: boolean }) => (
    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
      {isFlagged(name) && <span className="ml-2 text-[11px] font-bold text-orange-500">[Cần cập nhật]</span>}
    </label>
  );

  const FlagNote = ({ name }: { name: string }) =>
    isFlagged(name) ? (
      <p className="text-orange-500 text-[11px] font-semibold flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" /> Ban thẩm định yêu cầu chỉnh sửa trường này
      </p>
    ) : null;

  const ErrNote = ({ name }: { name: string }) =>
    errors[name] ? <p className="text-red-500 text-[11px] mt-1">{errors[name]}</p> : null;

  /* ── JSX ───────────────────────────────────────────────────── */
  return (
    <div className="space-y-5 animate-in fade-in duration-400">

      {/* Reviewer remarks banner (resubmit) */}
      {isResubmit && initialStatus.remarks && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="bg-orange-50/60 border-b border-orange-100 px-6 py-3.5 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <p className="text-[13px] font-bold text-orange-700">Yêu cầu từ Ban thẩm định</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-[13px] text-slate-600 leading-relaxed font-normal">{initialStatus.remarks}</p>
          </div>
        </div>
      )}

      {/* Header card with step progress */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
              {isResubmit ? "Cập nhật hồ sơ xác thực" : "Xác thực Nhà đầu tư"}
            </h1>
            <p className="text-[13px] text-slate-400 mt-1 font-medium">
              Bước {step} / 2 — {step === 1 ? "Thông tin cá nhân & Cam kết" : "Hồ sơ tổ chức & Pháp lý"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-medium">
            {autoSaveState === "saving" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#eec54e]" /> Đang lưu...</>}
            {autoSaveState === "saved" && <><Check className="w-3.5 h-3.5 text-emerald-500" /> Đã lưu bản nháp</>}
          </div>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-3 mb-5">
          {[1, 2].map(n => (
            <React.Fragment key={n}>
              <div className={cn(
                "flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all",
                step === n ? "bg-[#eec54e]/10 border border-[#eec54e]/20" : step > n ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-100"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                  step > n ? "bg-emerald-500 text-white" : step === n ? "bg-[#171611] text-white" : "bg-slate-200 text-slate-400"
                )}>
                  {step > n ? <Check className="w-3 h-3" /> : n}
                </div>
                <span className={cn(
                  "text-[12px] font-bold tracking-tight",
                  step === n ? "text-slate-800" : step > n ? "text-emerald-700" : "text-slate-400"
                )}>
                  {n === 1 ? "Định danh" : "Hồ sơ Quỹ / PE"}
                </span>
              </div>
              {n < 2 && <div className={cn("hidden sm:block flex-1 h-px", step > 1 ? "bg-[#eec54e]" : "bg-slate-100")} />}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#eec54e] rounded-full transition-all duration-500 ease-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 md:p-8">

        {/* ── STEP 1 ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <FieldLabel name="fullName" required>Họ và tên đầy đủ</FieldLabel>
              <input
                value={formData.fullName ?? ""}
                onChange={e => { set("fullName", e.target.value); clearErr("fullName"); }}
                placeholder="Nhập theo CMND / CCCD"
                className={inputClass("fullName")}
              />
              <FlagNote name="fullName" /><ErrNote name="fullName" />
            </div>

            <div>
              <FieldLabel name="contactEmail" required>Email liên lạc</FieldLabel>
              <input
                type="email"
                value={formData.contactEmail ?? ""}
                onChange={e => { set("contactEmail", e.target.value); clearErr("contactEmail"); }}
                placeholder="investor@example.com"
                className={inputClass("contactEmail")}
              />
              <FlagNote name="contactEmail" /><ErrNote name="contactEmail" />
            </div>

            {/* Declaration Checkbox */}
            <div className="space-y-3">
              <label
                className={cn(
                  "flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all group shadow-sm",
                  formData.declarationAccepted
                    ? "bg-[#eec54e]/5 border-[#eec54e]/40 ring-1 ring-[#eec54e]/10"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md",
                  errors.declaration && "border-red-200 bg-red-50/40"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                    formData.declarationAccepted ? "border-[#eec54e] bg-[#eec54e] shadow-inner" : "border-slate-300 bg-white"
                  )}
                  onClick={(e) => { 
                    e.preventDefault();
                    set("declarationAccepted", !formData.declarationAccepted); 
                    clearErr("declaration"); 
                  }}
                >
                  {formData.declarationAccepted && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div onClick={(e) => {
                  e.preventDefault();
                  set("declarationAccepted", !formData.declarationAccepted); 
                  clearErr("declaration");
                }}>
                  <p className="text-[14px] font-bold text-slate-800 leading-snug">Tôi cam kết mọi thông tin cung cấp là chính xác và trung thực.</p>
                  <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed font-medium italic">
                    Việc cung cấp thông tin sai lệch có thể dẫn đến việc từ chối hồ sơ hoặc khóa tài khoản vĩnh viễn theo quy định của AISEP.
                  </p>
                </div>
              </label>
              <ErrNote name="declaration" />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button onClick={onCancel} className="flex items-center gap-1.5 text-[13px] text-slate-400 font-bold hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại Hub
              </button>
              <button onClick={handleNext}
                className="bg-[#171611] text-white text-[13px] font-bold px-8 h-12 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 group shadow-lg shadow-black/5 active:scale-95">
                Tiếp tục hồ sơ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">

            {/* Investor Type Selection */}
            <div>
              <FieldLabel name="investorType" required>Loại hình đầu tư chuyên nghiệp</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {INVESTOR_TYPES.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { set("investorType", opt.value); clearErr("investorType"); }}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-[12px] font-bold text-center transition-all flex flex-col items-center justify-center gap-1",
                      formData.investorType === opt.value
                        ? "border-[#eec54e] bg-[#fdf8e6] text-slate-900 border-2"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-800",
                      isFlagged("investorType") && formData.investorType !== opt.value && "border-orange-100"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FlagNote name="investorType" /><ErrNote name="investorType" />
            </div>

            {/* Org + Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel name="organizationName" required>Tên tổ chức / Quỹ / Công ty</FieldLabel>
                <input
                  value={formData.organizationName ?? ""}
                  onChange={e => { set("organizationName", e.target.value); clearErr("organizationName"); }}
                  placeholder="VD: VinaCapital Ventures"
                  className={inputClass("organizationName")}
                />
                <FlagNote name="organizationName" /><ErrNote name="organizationName" />
              </div>
              <div>
                <FieldLabel name="currentRoleTitle" required>Chức vụ hiện tại</FieldLabel>
                <input
                  value={formData.currentRoleTitle ?? ""}
                  onChange={e => { set("currentRoleTitle", e.target.value); clearErr("currentRoleTitle"); }}
                  placeholder="VD: Partner, Investment Manager..."
                  className={inputClass("currentRoleTitle")}
                />
                <FlagNote name="currentRoleTitle" /><ErrNote name="currentRoleTitle" />
              </div>
            </div>

            {/* Website / LinkedIn */}
            <div>
              <FieldLabel name="linkedinOrWebsite" required>LinkedIn / Website tổ chức</FieldLabel>
              <input
                value={formData.linkedinOrWebsite ?? ""}
                onChange={e => { set("linkedinOrWebsite", e.target.value); clearErr("linkedinOrWebsite"); }}
                placeholder="https://linkedin.com/company/..."
                className={inputClass("linkedinOrWebsite")}
              />
              <FlagNote name="linkedinOrWebsite" /><ErrNote name="linkedinOrWebsite" />
            </div>

            {/* File Upload Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ID / License */}
              <div>
                <FieldLabel name="idOrBusinessLicenseFile" required>Giấy phép KD / CCCD đại diện</FieldLabel>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all",
                    dragOverId ? "border-[#eec54e] bg-[#eec54e]/5" : idFile ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400",
                    errors.idOrBusinessLicenseFile && "border-red-200 bg-red-50/40"
                  )}
                  onDragOver={e => { e.preventDefault(); setDragOverId(true); }}
                  onDragLeave={() => setDragOverId(false)}
                  onDrop={e => { e.preventDefault(); setDragOverId(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0], "ID"); }}
                  onClick={() => document.getElementById("kyc-id-input")?.click()}
                >
                  <input id="kyc-id-input" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0], "ID"); e.target.value = ""; }} />
                  
                  {idFile ? (
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center mx-auto mb-2 text-emerald-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-[12px] font-bold text-emerald-700 truncate max-w-[150px]">{idFile.name}</p>
                      <button type="button" onClick={e => { e.stopPropagation(); setIdFile(null); }} className="mt-2 text-[10px] font-bold text-red-400 hover:text-red-500">Gỡ bỏ</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-[12px] font-bold text-slate-500">Tải lên tài liệu pháp lý</p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max {MAX_MB}MB)</p>
                    </div>
                  )}
                </div>
                <ErrNote name="idOrBusinessLicenseFile" />
              </div>

              {/* Investment Proof */}
              <div>
                <FieldLabel name="investmentProofFile">Bằng chứng đầu tư (Tùy chọn)</FieldLabel>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all",
                    dragOverProof ? "border-[#eec54e] bg-[#eec54e]/5" : proofFile ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-400",
                  )}
                  onDragOver={e => { e.preventDefault(); setDragOverProof(true); }}
                  onDragLeave={() => setDragOverProof(false)}
                  onDrop={e => { e.preventDefault(); setDragOverProof(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0], "PROOF"); }}
                  onClick={() => document.getElementById("kyc-proof-input")?.click()}
                >
                  <input id="kyc-proof-input" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0], "PROOF"); e.target.value = ""; }} />
                  
                  {proofFile ? (
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center mx-auto mb-2 text-emerald-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-[12px] font-bold text-emerald-700 truncate max-w-[150px]">{proofFile.name}</p>
                      <button type="button" onClick={e => { e.stopPropagation(); setProofFile(null); }} className="mt-2 text-[10px] font-bold text-red-400 hover:text-red-500">Gỡ bỏ</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-[12px] font-bold text-slate-500">Chứng nhận cổ đông / Deals</p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max {MAX_MB}MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button onClick={handleBack} className="flex items-center gap-1.5 text-[13px] text-slate-400 font-bold hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại Bước 1
              </button>
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={handleSaveDraft} 
                  disabled={isSavingDraft}
                  className="bg-white border border-slate-200 text-slate-500 text-[13px] font-bold px-5 h-11 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Lưu nháp
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-[#171611] text-white text-[13px] font-bold px-8 h-11 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-black/5 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Hoàn tất và Gửi hồ sơ</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
