"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Check, Upload, Loader2,
  AlertCircle, ShieldCheck, X, FileText, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IAdvisorKYCStatus, IAdvisorKYCSubmission } from "@/types/advisor-kyc";

/* ─── Constants ──────────────────────────────────────────────── */

const EXPERTISE_OPTIONS = [
  { value: "FUNDRAISING", label: "Gọi vốn" },
  { value: "PRODUCT_STRATEGY", label: "Chiến lược SP" },
  { value: "GO_TO_MARKET", label: "Go-to-market" },
  { value: "FINANCE", label: "Tài chính" },
  { value: "LEGAL_IP", label: "Pháp lý & SHTT" },
  { value: "OPERATIONS", label: "Vận hành" },
  { value: "TECHNOLOGY", label: "Công nghệ" },
  { value: "MARKETING", label: "Marketing" },
  { value: "HR_OR_TEAM_BUILDING", label: "Nhân sự" },
];

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_MB = 5;

/* ─── Props ──────────────────────────────────────────────────── */

interface KYCWizardProps {
  initialStatus: IAdvisorKYCStatus;
  isResubmit?: boolean;
  onCancel: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  onSaveStep: (data: Partial<IAdvisorKYCSubmission>) => Promise<void>;
}

/* ─── Helper ─────────────────────────────────────────────────── */

function buildInitialForm(status: IAdvisorKYCStatus, isResubmit: boolean): Partial<IAdvisorKYCSubmission> {
  // Khi resubmit: ưu tiên currentSubmission (mới nhất) > previousSubmission (cũ) > draftData
  const src = isResubmit 
    ? (status.currentSubmission || status.previousSubmission) 
    : (status.draftData || status.currentSubmission);
  return {
    fullName: src?.fullName ?? status.submissionSummary?.fullName ?? "",
    contactEmail: src?.contactEmail ?? "",
    declarationAccepted: src?.declarationAccepted ?? false,
    currentRoleTitle: src?.currentRoleTitle ?? "",
    currentOrganization: src?.currentOrganization ?? "",
    primaryExpertise: src?.primaryExpertise ?? "",
    secondaryExpertise: src?.secondaryExpertise ?? [],
    professionalProfileLink: src?.professionalProfileLink ?? "",
  };
}

/* ─── Component ──────────────────────────────────────────────── */

export function KYCWizard({ initialStatus, isResubmit = false, onCancel, onSubmit, onSaveStep }: KYCWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [formData, setFormData] = useState<Partial<IAdvisorKYCSubmission>>(() => buildInitialForm(initialStatus, isResubmit));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const flagged = initialStatus.flaggedFields ?? [];
  const isFlagged = (f: string) => flagged.includes(f);

  const requiresNewEvidenceRaw = initialStatus.requiresNewEvidence ?? (initialStatus as any).RequiresNewEvidence;
  const requiresNewEvidence = Boolean(isResubmit && requiresNewEvidenceRaw);
  const evidenceFieldFlagged = isResubmit && flagged.includes("basicExpertiseProofFile");
  const existingEvidenceFiles = initialStatus.submissionSummary?.evidenceFiles || [];
  const hasExistingEvidence = existingEvidenceFiles.length > 0;

  /* ── Auto-save ─────────────────────────────────────────────── */
  useEffect(() => {
    if (isResubmit) return; // Không auto-save khi resubmit — tránh reset workflowStatus về DRAFT
    if (step !== 1 || (!formData.fullName && !formData.contactEmail)) return;
    const t = setTimeout(async () => {
      setAutoSaveState("saving");
      try { await onSaveStep(formData); setAutoSaveState("saved"); setTimeout(() => setAutoSaveState("idle"), 3000); }
      catch { setAutoSaveState("idle"); }
    }, 1500);
    return () => clearTimeout(t);
  }, [formData.fullName, formData.contactEmail, formData.declarationAccepted]);

  /* ── Field update ──────────────────────────────────────────── */
  const set = (key: keyof IAdvisorKYCSubmission, val: unknown) =>
    setFormData(p => ({ ...p, [key]: val }));

  const clearErr = (key: string) =>
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });

  const toggleSecondary = (val: string) => {
    const curr = formData.secondaryExpertise ?? [];
    set("secondaryExpertise", curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val]);
  };

  /* ── Manual save draft (step 2) ───────────────────────────── */
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try { await onSaveStep(formData); toast.success("Đã lưu bản nháp"); }
    catch { toast.error("Lưu nháp thất bại"); }
    finally { setIsSavingDraft(false); }
  };

  /* ── Validation ────────────────────────────────────────────── */
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName?.trim()) e.fullName = "Vui lòng nhập họ và tên";
    if (!formData.contactEmail?.trim()) e.contactEmail = "Vui lòng nhập email";
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) e.contactEmail = "Email không hợp lệ";
    if (!formData.declarationAccepted) e.declaration = "Bạn phải đồng ý với cam kết";
    setErrors(e); return !Object.keys(e).length;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!formData.currentRoleTitle?.trim()) e.currentRoleTitle = "Vui lòng nhập vị trí";
    if (!formData.currentOrganization?.trim()) e.currentOrganization = "Vui lòng nhập tổ chức";
    if (!formData.primaryExpertise) e.primaryExpertise = "Vui lòng chọn chuyên môn chính";
    if (!formData.professionalProfileLink?.trim()) e.professionalProfileLink = "Vui lòng nhập link LinkedIn";
    else if (!/^https?:\/\//i.test(formData.professionalProfileLink.trim())) e.professionalProfileLink = "Link phải bắt đầu bằng https://";
    if (!proofFile) {
      if (requiresNewEvidence || evidenceFieldFlagged) {
        e.basicExpertiseProofFile = "Vui lòng tải lên bằng chứng mới theo yêu cầu của Staff";
      } else if (!hasExistingEvidence) {
        e.basicExpertiseProofFile = "Vui lòng tải lên bằng chứng";
      }
    }
    setErrors(e); return !Object.keys(e).length;
  };

  /* ── File ──────────────────────────────────────────────────── */
  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) { toast.error("Chỉ chấp nhận PDF, JPG, PNG"); return; }
    if (file.size > MAX_MB * 1024 * 1024) { toast.error(`File không được vượt quá ${MAX_MB}MB`); return; }
    setProofFile(file);
    clearErr("basicExpertiseProofFile");
  };

  /* ── Navigation ────────────────────────────────────────────── */
  const handleNext = () => { if (validateStep1()) { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const handleBack = () => { setStep(1); setErrors({}); };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      // Map FE field names → BE DTO field names
      const fieldNameMap: Record<string, string> = {
        currentRoleTitle: "title",
        professionalProfileLink: "linkedInURL",
      };
      Object.entries(formData).forEach(([k, v]) => {
        const beKey = fieldNameMap[k] || k;
        if (Array.isArray(v)) v.forEach(i => fd.append(`${beKey}[]`, i));
        else if (v !== undefined && v !== null) fd.append(beKey, String(v));
      });
      if (proofFile) fd.append("basicExpertiseProofFile", proofFile);
      await onSubmit(fd);
    } catch { toast.error("Gửi hồ sơ thất bại. Vui lòng thử lại."); }
    finally { setIsSubmitting(false); }
  };

  /* ── Input class helper ────────────────────────────────────── */
  const inputClass = (name: string) => cn(
    "w-full h-11 px-4 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white",
    "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
    isFlagged(name) ? "border-orange-300 bg-orange-50/40" : "border-slate-200",
    errors[name] && "border-red-300 bg-red-50/40"
  );

  /* ── Sub-components ────────────────────────────────────────── */
  const FieldLabel = ({ children, name, required }: { children: React.ReactNode; name: string; required?: boolean }) => (
    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
      {isFlagged(name) && <span className="ml-2 text-[11px] font-bold text-orange-500">[Cần sửa]</span>}
    </label>
  );

  const FlagNote = ({ name }: { name: string }) =>
    isFlagged(name) ? (
      <p className="text-orange-500 text-[11px] font-semibold flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" /> Reviewer đã đánh dấu — vui lòng cập nhật
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
            <p className="text-[13px] font-bold text-orange-700">Ghi chú từ Reviewer</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-[13px] text-slate-600 leading-relaxed">{initialStatus.remarks}</p>
          </div>
        </div>
      )}

      {/* Header card with step progress */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900">
              {isResubmit ? "Cập nhật hồ sơ xác thực" : "Xác thực Advisor"}
            </h1>
            <p className="text-[13px] text-slate-400 mt-1">
              Bước {step} / 2 — {step === 1 ? "Thông tin định danh" : "Hồ sơ chuyên môn"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            {autoSaveState === "saving" && <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#eec54e]" /> Đang lưu...</>}
            {autoSaveState === "saved" && <><Check className="w-3.5 h-3.5 text-emerald-500" /> Đã lưu</>}
          </div>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-3 mb-5">
          {[1, 2].map(n => (
            <React.Fragment key={n}>
              <div className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all",
                step === n ? "bg-[#eec54e]/10" : step > n ? "bg-emerald-50" : "bg-slate-50"
              )}>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                  step > n ? "bg-emerald-500 text-white" : step === n ? "bg-[#0f172a] text-white" : "bg-slate-200 text-slate-400"
                )}>
                  {step > n ? <Check className="w-3 h-3" /> : n}
                </div>
                <span className={cn(
                  "text-[12px] font-semibold",
                  step === n ? "text-slate-800" : step > n ? "text-emerald-600" : "text-slate-400"
                )}>
                  {n === 1 ? "Định danh" : "Chuyên môn"}
                </span>
              </div>
              {n < 2 && <div className={cn("flex-1 h-px", step > 1 ? "bg-[#eec54e]" : "bg-slate-100")} />}
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">

        {/* ── STEP 1 ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
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
              <FieldLabel name="contactEmail" required>Email liên hệ</FieldLabel>
              <input
                type="email"
                value={formData.contactEmail ?? ""}
                onChange={e => { set("contactEmail", e.target.value); clearErr("contactEmail"); }}
                placeholder="advisor@example.com"
                className={inputClass("contactEmail")}
              />
              <FlagNote name="contactEmail" /><ErrNote name="contactEmail" />
            </div>

            {/* Declaration */}
            <label
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all group",
                formData.declarationAccepted
                  ? "bg-[#eec54e]/5 border-[#eec54e]/40"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300",
                errors.declaration && "border-red-200 bg-red-50/40"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                  formData.declarationAccepted ? "border-[#eec54e] bg-[#eec54e]" : "border-slate-300"
                )}
                onClick={() => { set("declarationAccepted", !formData.declarationAccepted); clearErr("declaration"); }}
              >
                {formData.declarationAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <div onClick={() => { set("declarationAccepted", !formData.declarationAccepted); clearErr("declaration"); }}>
                <p className="text-[13px] font-semibold text-slate-700 leading-snug">Tôi cam kết thông tin cung cấp là hoàn toàn chính xác.</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Thông tin sai lệch có thể dẫn đến khóa tài khoản vĩnh viễn.</p>
              </div>
            </label>
            <ErrNote name="declaration" />

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button onClick={onCancel} className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>
              <button onClick={handleNext}
                className="bg-[#0f172a] text-white text-[13px] font-bold px-6 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 group">
                Tiếp tục <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">

            {/* Role + Org */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel name="currentRoleTitle" required>Vị trí hiện tại</FieldLabel>
                <input
                  value={formData.currentRoleTitle ?? ""}
                  onChange={e => { set("currentRoleTitle", e.target.value); clearErr("currentRoleTitle"); }}
                  placeholder="VD: Head of Product, CTO..."
                  className={inputClass("currentRoleTitle")}
                />
                <FlagNote name="currentRoleTitle" /><ErrNote name="currentRoleTitle" />
              </div>
              <div>
                <FieldLabel name="currentOrganization" required>Tổ chức / Công ty</FieldLabel>
                <input
                  value={formData.currentOrganization ?? ""}
                  onChange={e => { set("currentOrganization", e.target.value); clearErr("currentOrganization"); }}
                  placeholder="VD: TechGlobal Corp"
                  className={inputClass("currentOrganization")}
                />
                <FlagNote name="currentOrganization" /><ErrNote name="currentOrganization" />
              </div>
            </div>

            {/* Primary expertise */}
            <div>
              <FieldLabel name="primaryExpertise" required>Chuyên môn chính</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {EXPERTISE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => { 
                      set("primaryExpertise", opt.value); 
                      if ((formData.secondaryExpertise || []).includes(opt.value)) {
                        set("secondaryExpertise", (formData.secondaryExpertise || []).filter(v => v !== opt.value));
                      }
                      clearErr("primaryExpertise"); 
                    }}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-[12px] font-semibold text-center transition-all",
                      formData.primaryExpertise === opt.value
                        ? "border-[#eec54e] bg-[#fdf8e6] text-slate-800"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
                      isFlagged("primaryExpertise") && formData.primaryExpertise !== opt.value && "border-orange-100"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FlagNote name="primaryExpertise" /><ErrNote name="primaryExpertise" />
            </div>

            {/* Secondary expertise */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Chuyên môn phụ <span className="text-slate-400 font-normal text-[12px]">— Tùy chọn, tối đa 3</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.filter(o => o.value !== formData.primaryExpertise).map(opt => {
                  const selected = (formData.secondaryExpertise ?? []).includes(opt.value);
                  const atMax = (formData.secondaryExpertise ?? []).length >= 3 && !selected;
                  return (
                    <button key={opt.value} type="button" disabled={atMax}
                      onClick={() => toggleSecondary(opt.value)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all",
                        selected
                          ? "bg-[#0f172a] text-white border-[#0f172a]"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700",
                        atMax && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      {selected && <Check className="inline w-3 h-3 mr-1" />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <FieldLabel name="professionalProfileLink" required>Link Profile LinkedIn</FieldLabel>
              <input
                value={formData.professionalProfileLink ?? ""}
                onChange={e => { set("professionalProfileLink", e.target.value); clearErr("professionalProfileLink"); }}
                placeholder="https://linkedin.com/in/yourname"
                className={inputClass("professionalProfileLink")}
              />
              <FlagNote name="professionalProfileLink" /><ErrNote name="professionalProfileLink" />
            </div>

            {/* Proof file */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Bằng chứng chuyên môn
                {(!isResubmit || requiresNewEvidence || evidenceFieldFlagged) && <span className="text-red-400 ml-1">*</span>}
                {isResubmit && !requiresNewEvidence && !evidenceFieldFlagged && <span className="text-slate-400 font-normal text-[12px] ml-1">— Tải mới hoặc giữ file cũ</span>}
                {isFlagged("basicExpertiseProofFile") && <span className="ml-2 text-[11px] font-bold text-orange-500">[Cần sửa]</span>}
              </label>

              {isResubmit && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
                  <p className="text-[12px] font-bold text-amber-800">
                    {requiresNewEvidence || evidenceFieldFlagged
                      ? "Bạn cần thay bộ minh chứng cho lần gửi lại"
                      : "Staff không yêu cầu thay bộ minh chứng hiện tại"}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-amber-700">
                    {requiresNewEvidence || evidenceFieldFlagged
                      ? "Tài liệu của lần trước chỉ để bạn đối chiếu. Với lần gửi lại này, staff yêu cầu thay bộ minh chứng nên hệ thống chỉ nhận file mới bạn tải lên bên dưới."
                      : "Tài liệu của lần trước được hiển thị để bạn đối chiếu. Bạn có thể chỉ sửa thông tin văn bản hoặc liên kết và gửi lại mà không cần tải file mới."}
                  </p>
                </div>
              )}

              <div
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all",
                  dragOver
                    ? "border-[#eec54e] bg-[#eec54e]/5"
                    : proofFile
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300",
                  isFlagged("basicExpertiseProofFile") && !proofFile && "border-orange-200 bg-orange-50/40",
                  errors.basicExpertiseProofFile && "border-red-200 bg-red-50/40"
                )}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                onClick={() => document.getElementById("kyc-file-input")?.click()}
              >
                <input id="kyc-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ""; }} />

                {proofFile ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-white border border-emerald-200 flex items-center justify-center mx-auto mb-2.5">
                      <FileText className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-[13px] font-semibold text-emerald-700 mb-0.5 max-w-[200px] truncate mx-auto">{proofFile.name}</p>
                    <p className="text-[11px] text-emerald-500">{(proofFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={e => { e.stopPropagation(); setProofFile(null); }}
                      className="mt-2.5 flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 transition-colors mx-auto">
                      <X className="w-3 h-3" /> Xóa file
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2.5">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-600 mb-1">Click hoặc kéo thả file vào đây</p>
                    <p className="text-[11px] text-slate-400">PDF, JPG, PNG — tối đa {MAX_MB}MB</p>
                  </div>
                )}
              </div>
              <ErrNote name="basicExpertiseProofFile" />

              {isResubmit && proofFile && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 mt-4">
                  <p className="text-[12px] font-bold text-emerald-800">
                    Sẽ gửi tệp mới này đi
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-emerald-700">
                    {requiresNewEvidence
                      ? "Chỉ các tệp mới bạn vừa chọn mới được gửi trong lần resubmit này. Tài liệu nộp trước sẽ không tự động đi kèm."
                      : "Bạn đã chọn thay thế minh chứng bằng tệp vừa tải lên."}
                  </p>
                </div>
              )}

              {isResubmit && !requiresNewEvidence && !evidenceFieldFlagged && hasExistingEvidence && proofFile && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden mt-4">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <p className="text-[12px] font-bold text-amber-800">
                      Lưu ý — Staff không yêu cầu thay đổi minh chứng
                    </p>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    <p className="text-[12px] leading-relaxed text-amber-700">
                      Tài liệu bạn nộp ở lần trước <span className="font-semibold">không bị đánh dấu lỗi</span> và vẫn hợp lệ cho lần gửi lại này. Bạn đang chủ động thay thế bằng file mới.
                    </p>
                    <ul className="space-y-1.5 text-[12px] text-amber-700">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>Nếu bạn <span className="font-semibold">tiếp tục gửi</span>, file mới sẽ thay thế hoàn toàn file cũ — không thể hoàn tác sau khi nộp.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>Nếu bạn <span className="font-semibold">không chắc</span>, hãy xóa file vừa chọn — hệ thống sẽ tự động giữ lại tài liệu cũ khi gửi.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {hasExistingEvidence && (
                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-semibold text-slate-500">
                      {isResubmit ? "Tài liệu của lần nộp trước" : "Tài liệu đã đính kèm"}
                    </p>
                    {isResubmit && (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Chỉ để tham khảo
                      </span>
                    )}
                  </div>
                  {isResubmit && (
                    <p className="text-[12px] text-slate-400">
                      {requiresNewEvidence || evidenceFieldFlagged
                        ? "Tệp này thuộc phiên bản trước đã bị trả lại hoặc cần bổ sung. Nó sẽ không được gửi sang phiên bản mới nếu bạn không tải lại tệp."
                        : "Tệp này thuộc phiên bản trước. Nếu bạn không tải tệp mới, hệ thống sẽ giữ lại minh chứng này khi bạn gửi lại hồ sơ."}
                    </p>
                  )}
                  <div className="space-y-2">
                    {existingEvidenceFiles.map((file) => (
                      <div
                        key={file.id || file.fileName}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                      >
                        <div className="min-w-0">
                          {isResubmit && (
                            <div className="mb-1 flex items-center gap-2">
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                Phiên bản trước
                              </span>
                            </div>
                          )}
                          <p className="truncate text-[13px] font-semibold text-slate-800">
                            {file.fileName || "Tệp đính kèm"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Chứng minh chuyên môn
                            {file.uploadedAt && ` · ${new Date(file.uploadedAt).toLocaleDateString("vi-VN")}`}
                          </p>
                        </div>
                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
                          >
                            {isResubmit ? "Xem file cũ" : "Xem file"}
                          </a>
                        ) : (
                          <span className="shrink-0 text-[12px] text-slate-400">
                            Chưa có liên kết
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FlagNote name="basicExpertiseProofFile" /><ErrNote name="basicExpertiseProofFile" />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button onClick={handleBack} className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>
              <div className="flex items-center gap-2.5">
                {!isResubmit && (
                  <button onClick={handleSaveDraft} disabled={isSavingDraft}
                    className="text-[13px] font-semibold text-slate-500 hover:text-slate-700 px-4 h-10 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-1.5 disabled:opacity-50">
                    {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                    Lưu nháp
                  </button>
                )}
                <button onClick={handleSubmit} disabled={isSubmitting || ((requiresNewEvidence || evidenceFieldFlagged) && !proofFile)}
                  className="bg-[#0f172a] text-white text-[13px] font-bold px-6 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {isSubmitting ? "Đang gửi..." : isResubmit ? "Gửi bản cập nhật" : "Hoàn tất xác thực Advisor"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
