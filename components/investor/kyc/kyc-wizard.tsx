"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Check, Upload, Loader2,
  AlertCircle, ShieldCheck, X, FileText, CheckCircle2, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IInvestorKYCStatus, IInvestorKYCSubmission } from "@/types/investor-kyc";

/* ─── Constants ──────────────────────────────────────────────── */

const SUBMITTER_ROLES = [
  { value: "PARTNER", label: "Đối tác (Partner)" },
  { value: "INVESTMENT_MANAGER", label: "Quản lý đầu tư" },
  { value: "ANALYST", label: "Chuyên viên phân tích" },
  { value: "LEGAL_REPRESENTATIVE", label: "Đại diện pháp luật" },
  { value: "AUTHORIZED_PERSON", label: "Người được ủy quyền" },
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

function buildInitialForm(status: IInvestorKYCStatus): Partial<IInvestorKYCSubmission> {
  const s = status.submissionSummary;
  return {
    fullName: s?.fullName ?? "",
    contactEmail: s?.contactEmail ?? "",
    declarationAccepted: false,
    investorCategory: (s?.investorCategory as any) ?? "INDIVIDUAL_ANGEL",
    currentRoleTitle: s?.currentRoleTitle ?? "",
    organizationName: s?.organizationName ?? "",
    location: s?.location ?? "",
    website: s?.website ?? "",
    linkedInURL: s?.linkedInURL ?? "",
    taxIdOrBusinessCode: s?.taxIdOrBusinessCode ?? "",
    submitterRole: (s?.submitterRole as any) ?? undefined,
  };
}

/* ─── Component ──────────────────────────────────────────────── */

export function KYCWizard({ initialStatus, isResubmit = false, onCancel, onSubmit, onSaveStep }: KYCWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [formData, setFormData] = useState<Partial<IInvestorKYCSubmission>>(() => buildInitialForm(initialStatus));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Files
  const [idFile, setIdFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [dragOverId, setDragOverId] = useState(false);
  const [dragOverProof, setDragOverProof] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const flagged = initialStatus.flaggedFields ?? [];
  const isFlagged = (f: string) => flagged.includes(f);
  const requiresNewEvidence = Boolean(isResubmit && initialStatus.requiresNewEvidence);
  const existingFiles = initialStatus.submissionSummary?.evidenceFiles ?? [];
  const hasExistingEvidence = existingFiles.length > 0;
  const isInstitutional = formData.investorCategory === "INSTITUTIONAL";

  /* ── Auto-save ─────────────────────────────────────────────── */
  useEffect(() => {
    if (isResubmit) return; // Không auto-save khi resubmit — tránh reset workflowStatus
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
    if (!formData.currentRoleTitle?.trim()) e.currentRoleTitle = "Vui lòng nhập chức vụ của bạn";
    if (!formData.organizationName?.trim()) e.organizationName = "Vui lòng nhập tên tổ chức / quỹ";

    if (!idFile) {
      if (requiresNewEvidence) {
        e.idOrBusinessLicenseFile = "Vui lòng tải lên tài liệu mới theo yêu cầu của Staff";
      } else if (!hasExistingEvidence) {
        e.idOrBusinessLicenseFile = "Vui lòng tải lên ít nhất 1 tài liệu";
      }
    }

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
    if (type === "ID") { setIdFile(file); clearErr("idOrBusinessLicenseFile"); }
    else { setProofFile(file); clearErr("investmentProofFile"); }
  };

  /* ── Navigation ────────────────────────────────────────────── */
  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleBack = () => { setStep(1); setErrors({}); };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("investorCategory", formData.investorCategory ?? "INDIVIDUAL_ANGEL");
      fd.append("fullName", formData.fullName ?? "");
      fd.append("contactEmail", formData.contactEmail ?? "");
      if (formData.organizationName) fd.append("organizationName", formData.organizationName);
      if (formData.currentRoleTitle) fd.append("currentRoleTitle", formData.currentRoleTitle);
      if (formData.location) fd.append("location", formData.location);
      if (formData.website) fd.append("website", formData.website);
      if (formData.linkedInURL) fd.append("linkedInURL", formData.linkedInURL);
      if (formData.submitterRole) fd.append("submitterRole", formData.submitterRole);
      if (formData.taxIdOrBusinessCode) fd.append("taxIdOrBusinessCode", formData.taxIdOrBusinessCode);

      if (idFile) {
        fd.append("evidenceFiles", idFile);
        fd.append("evidenceFileKinds", "ID_PROOF");
      }
      if (proofFile) {
        fd.append("evidenceFiles", proofFile);
        fd.append("evidenceFileKinds", "INVESTMENT_PROOF");
      }

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
              Bước {step} / 2 — {step === 1 ? "Thông tin cá nhân & Cam kết" : "Hồ sơ & Tài liệu"}
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
                  {n === 1 ? "Định danh" : "Hồ sơ & Tài liệu"}
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

            {/* Declaration */}
            <div className="space-y-3">
              <label className={cn(
                "flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all group shadow-sm",
                formData.declarationAccepted
                  ? "bg-[#eec54e]/5 border-[#eec54e]/40 ring-1 ring-[#eec54e]/10"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white",
                errors.declaration && "border-red-200 bg-red-50/40"
              )}>
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                    formData.declarationAccepted ? "border-[#eec54e] bg-[#eec54e] shadow-inner" : "border-slate-300 bg-white"
                  )}
                  onClick={e => { e.preventDefault(); set("declarationAccepted", !formData.declarationAccepted); clearErr("declaration"); }}
                >
                  {formData.declarationAccepted && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div onClick={e => { e.preventDefault(); set("declarationAccepted", !formData.declarationAccepted); clearErr("declaration"); }}>
                  <p className="text-[14px] font-bold text-slate-800 leading-snug">Tôi cam kết mọi thông tin cung cấp là chính xác và trung thực.</p>
                  <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed font-medium italic">
                    Việc cung cấp thông tin sai lệch có thể dẫn đến từ chối hồ sơ hoặc khóa tài khoản theo quy định của AISEP.
                  </p>
                </div>
              </label>
              <ErrNote name="declaration" />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button onClick={onCancel} className="flex items-center gap-1.5 text-[13px] text-slate-400 font-bold hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại
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

            {/* Submitter Role (Institutional only) */}
            {isInstitutional && (
              <div>
                <FieldLabel name="submitterRole" required>Vai trò của bạn trong tổ chức</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {SUBMITTER_ROLES.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => { set("submitterRole", opt.value); clearErr("submitterRole"); }}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-[11px] font-bold text-center transition-all",
                        formData.submitterRole === opt.value
                          ? "border-[#171611] bg-[#171611] text-white"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-400",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <ErrNote name="submitterRole" />
              </div>
            )}

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

            {/* LinkedIn + Website (tách riêng) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel name="linkedInURL">LinkedIn Profile</FieldLabel>
                <input
                  value={formData.linkedInURL ?? ""}
                  onChange={e => { set("linkedInURL", e.target.value); clearErr("linkedInURL"); }}
                  placeholder="https://linkedin.com/in/yourname"
                  className={inputClass("linkedInURL")}
                />
                <FlagNote name="linkedInURL" /><ErrNote name="linkedInURL" />
              </div>
              <div>
                <FieldLabel name="website">{isInstitutional ? "Website tổ chức" : "Website cá nhân"}</FieldLabel>
                <input
                  value={formData.website ?? ""}
                  onChange={e => { set("website", e.target.value); clearErr("website"); }}
                  placeholder="https://..."
                  className={inputClass("website")}
                />
                <FlagNote name="website" /><ErrNote name="website" />
              </div>
            </div>

            {/* Location + Tax ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FieldLabel name="location">Địa điểm</FieldLabel>
                <input
                  value={formData.location ?? ""}
                  onChange={e => set("location", e.target.value)}
                  placeholder="VD: TP. Hồ Chí Minh"
                  className={inputClass("location")}
                />
              </div>
              <div>
                <FieldLabel name="taxIdOrBusinessCode">Mã số thuế / Mã số doanh nghiệp</FieldLabel>
                <input
                  value={formData.taxIdOrBusinessCode ?? ""}
                  onChange={e => set("taxIdOrBusinessCode", e.target.value)}
                  placeholder="Nhập MST (nếu có)"
                  className={inputClass("taxIdOrBusinessCode")}
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Tài liệu xác minh
                {(!isResubmit || requiresNewEvidence) && <span className="text-red-400 ml-1">*</span>}
                {isResubmit && !requiresNewEvidence && <span className="text-slate-400 font-normal text-[12px] ml-1">— Tải mới hoặc giữ file cũ</span>}
                {isFlagged("idOrBusinessLicenseFile") && <span className="ml-2 text-[11px] font-bold text-orange-500">[Cần cập nhật]</span>}
              </label>

              {/* Banner resubmit */}
              {isResubmit && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
                  <p className="text-[12px] font-bold text-amber-800">
                    {requiresNewEvidence ? "Bạn cần thay thế tài liệu minh chứng" : "Staff không yêu cầu thay tài liệu hiện tại"}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-amber-700">
                    {requiresNewEvidence
                      ? "Tài liệu lần trước chỉ để đối chiếu. Staff yêu cầu tải lên bộ tài liệu mới."
                      : "Bạn có thể chỉ sửa thông tin văn bản và gửi lại mà không cần tải file mới."}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ID / License */}
                <div>
                  <p className="text-[12px] font-semibold text-slate-500 mb-2">
                    {isInstitutional ? "Giấy phép KD / Giấy tờ tổ chức" : "CCCD / Hộ chiếu"}
                    <span className="text-[10px] font-normal text-slate-400 ml-1">(ID_PROOF)</span>
                  </p>
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
                        <button type="button" onClick={e => { e.stopPropagation(); setIdFile(null); }} className="mt-2 text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1 mx-auto">
                          <X className="w-3 h-3" /> Gỡ bỏ
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2">
                          <Upload className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-[12px] font-bold text-slate-500">Tải lên tài liệu định danh</p>
                        <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (Max {MAX_MB}MB)</p>
                      </div>
                    )}
                  </div>
                  <ErrNote name="idOrBusinessLicenseFile" />
                </div>

                {/* Investment Proof */}
                <div>
                  <p className="text-[12px] font-semibold text-slate-500 mb-2">
                    Bằng chứng đầu tư
                    <span className="text-[10px] font-normal text-slate-400 ml-1">(INVESTMENT_PROOF — tùy chọn)</span>
                  </p>
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
                        <button type="button" onClick={e => { e.stopPropagation(); setProofFile(null); }} className="mt-2 text-[10px] font-bold text-red-400 hover:text-red-500 flex items-center gap-1 mx-auto">
                          <X className="w-3 h-3" /> Gỡ bỏ
                        </button>
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

              {/* Cảnh báo thay file không được yêu cầu */}
              {isResubmit && !requiresNewEvidence && hasExistingEvidence && (idFile || proofFile) && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden mt-4">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <p className="text-[12px] font-bold text-amber-800">Lưu ý — Staff không yêu cầu thay đổi tài liệu</p>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    <p className="text-[12px] leading-relaxed text-amber-700">
                      Tài liệu bạn nộp ở lần trước <span className="font-semibold">không bị đánh dấu lỗi</span> và vẫn hợp lệ cho lần gửi lại này.
                    </p>
                    <ul className="space-y-1.5 text-[12px] text-amber-700">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>Nếu bạn <span className="font-semibold">tiếp tục gửi</span>, file mới sẽ thay thế hoàn toàn file cũ — không thể hoàn tác.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>Nếu bạn <span className="font-semibold">không chắc</span>, hãy xóa file vừa chọn — hệ thống sẽ giữ lại tài liệu cũ.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Existing files from previous submission */}
              {hasExistingEvidence && (
                <div className="space-y-2 mt-5">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-semibold text-slate-500">
                      {isResubmit ? "Tài liệu lần nộp trước" : "Tài liệu đã đính kèm"}
                    </p>
                    {isResubmit && (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Chỉ để tham khảo
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {existingFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-slate-700 truncate">{file.fileName || "Tài liệu"}</p>
                            <p className="text-[10px] text-slate-400">{file.kind} · {new Date(file.uploadedAt).toLocaleDateString("vi-VN")}</p>
                          </div>
                        </div>
                        {file.url && (
                          <a href={file.url} target="_blank" rel="noreferrer"
                            className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                            Xem <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button onClick={handleBack} className="flex items-center gap-1.5 text-[13px] text-slate-400 font-bold hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại Bước 1
              </button>
              <div className="flex items-center gap-2.5">
                {!isResubmit && (
                  <button onClick={handleSaveDraft} disabled={isSavingDraft}
                    className="bg-white border border-slate-200 text-slate-500 text-[13px] font-bold px-5 h-11 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                    {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Lưu nháp
                  </button>
                )}
                <button onClick={handleSubmit} disabled={isSubmitting || (requiresNewEvidence && !idFile)}
                  className="bg-[#171611] text-white text-[13px] font-bold px-8 h-11 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-black/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                    : <><ShieldCheck className="w-4 h-4" /> {isResubmit ? "Gửi bản cập nhật" : "Hoàn tất và Gửi hồ sơ"}</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
