"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Briefcase, Globe, Linkedin, FileText,
  Camera, X, CheckCircle2, Sparkles, ArrowRight,
  ChevronRight, AlertCircle, Check, Loader2,
  AlertTriangle
} from "lucide-react";
import { CreateAdvisorProfile, UpdateAdvisorProfile, GetAdvisorProfile } from "@/services/advisor/advisor.api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/auth-guard";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

/* ─── Completeness ───────────────────────────────────────────── */

type FormState = {
  fullName: string;
  title: string;
  company: string;
  yearsOfExperience: number | null;
  website: string;
  linkedinUrl: string;
  primaryExpertise: string;
  secondaryExpertises: string[];
  bio: string;
  mentorshipPhilosophy: string;
};

function calcCompleteness(f: FormState): number {
  const checks = [
    Boolean(f.fullName.trim()),
    Boolean(f.title.trim()),
    Boolean(f.company.trim()),
    f.yearsOfExperience !== null && f.yearsOfExperience >= 0,
    Boolean(f.website.trim() || f.linkedinUrl.trim()),
    Boolean(f.primaryExpertise),
    Boolean(f.bio.trim()),
    Boolean(f.mentorshipPhilosophy.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function AdvisorOnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const handleSkip = () => {
    localStorage.setItem("aisep_advisor_onboarding_skipped", "true");
    toast.info("Đã bỏ qua quy trình thiết lập hồ sơ.");
    router.replace("/advisor");
  };

  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    title: "",
    company: "",
    yearsOfExperience: null,
    website: "",
    linkedinUrl: "",
    primaryExpertise: "",
    secondaryExpertises: [],
    bio: "",
    mentorshipPhilosophy: "",
  });

  const completeness = calcCompleteness(form);

  /* ── Load existing profile ───────────────────────────────── */
  useEffect(() => {
    // 1. Check localStorage first (fast)
    const skipped = localStorage.getItem("aisep_advisor_onboarding_skipped") === "true";
    const completed = localStorage.getItem("aisep_advisor_onboarding_completed") === "true";
    if (skipped || completed) {
      router.replace("/advisor");
      return;
    }

    // 2. Check API for profile status
    setPageLoading(true);
    setLoadError(false);
    GetAdvisorProfile().then((res: any) => {
      if (res?.isSuccess && res.data) {
        const d = res.data;
        const items: any[] = Array.isArray(d.items) ? d.items : [];

        const filled = [d.fullName, d.title, d.company, items[0]?.category, d.bio, d.mentorshipPhilosophy]
          .every(Boolean) && (d.website || d.linkedInURL) && items[0]?.yearsOfExperience !== undefined;
        if (filled) {
          localStorage.setItem("aisep_advisor_onboarding_completed", "true");
          router.replace("/advisor");
          return;
        }

        // INCOMPLETE → pre-fill form
        setForm({
          fullName: d.fullName || "",
          title: d.title || "",
          company: d.company || "",
          yearsOfExperience: items[0]?.yearsOfExperience ?? null,
          website: d.website || "",
          linkedinUrl: d.linkedInURL || "",
          primaryExpertise: items[0]?.category || "",
          secondaryExpertises: items.slice(1, 4).map((i: any) => i.category).filter(Boolean),
          bio: d.bio || "",
          mentorshipPhilosophy: d.mentorshipPhilosophy || "",
        });
        if (d.profilePhotoURL) setPhotoPreview(d.profilePhotoURL);
        setHasProfile(true);
      }
      // No profile → form stays empty, hasProfile stays false
    }).catch(() => {
      // 404 = no profile (expected), other errors = load error
      setLoadError(false); // treat all catch as "no profile yet"
    }).finally(() => {
      setPageLoading(false);
    });
  }, []);

  /* ── Helpers ─────────────────────────────────────────────── */
  const set = (key: keyof FormState, val: unknown) =>
    setForm(p => ({ ...p, [key]: val }));

  const clearErr = (key: string) =>
    setErrors(p => { const n = { ...p }; delete n[key]; return n; });

  const toggleSecondary = (val: string) => {
    const curr = form.secondaryExpertises;
    set("secondaryExpertises", curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val]);
  };

  /* ── Photo ───────────────────────────────────────────────── */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ── Validation ──────────────────────────────────────────── */
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ và tên";
    if (!form.title.trim()) e.title = "Vui lòng nhập chức vụ hiện tại";
    if (!form.company.trim()) e.company = "Vui lòng nhập công ty hoặc tổ chức";
    if (form.yearsOfExperience === null || form.yearsOfExperience < 0 || form.yearsOfExperience > 60)
      e.yearsOfExperience = "Vui lòng nhập số năm kinh nghiệm hợp lệ (0–60)";
    if (!form.website.trim() && !form.linkedinUrl.trim())
      e.publicLink = "Vui lòng cung cấp ít nhất một liên kết công khai";
    if (form.website.trim() && !form.website.startsWith("http"))
      e.website = "Website phải bắt đầu bằng https://";
    if (form.linkedinUrl.trim() && !form.linkedinUrl.startsWith("http"))
      e.linkedinUrl = "LinkedIn URL phải bắt đầu bằng https://";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.primaryExpertise) e.primaryExpertise = "Vui lòng chọn chuyên môn chính";
    if (!form.bio.trim()) e.bio = "Vui lòng nhập phần giới thiệu bản thân";
    if (!form.mentorshipPhilosophy.trim()) e.mentorshipPhilosophy = "Vui lòng nhập triết lý cố vấn";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Navigation ──────────────────────────────────────────── */
  const handleNext = () => {
    if (validateStep1()) {
      setErrors({});
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ── Submit ──────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        title: form.title || undefined,
        bio: form.bio || undefined,
        linkedInURL: form.linkedinUrl || undefined,
        mentorshipPhilosophy: form.mentorshipPhilosophy || undefined,
        profilePhotoFile: profilePhoto ?? undefined,
        advisorIndustryFocus: [], // TODO: map industry selections to { industryId } if needed
      };
      const res = hasProfile
        ? await UpdateAdvisorProfile(payload)
        : await CreateAdvisorProfile(payload);
      if (res.isSuccess !== false) {
        localStorage.setItem("aisep_advisor_onboarding_completed", "true");
        toast.success(hasProfile ? "Hồ sơ đã được cập nhật!" : "Hồ sơ đã được tạo thành công!");
        router.replace("/advisor");
      } else {
        toast.error((res as any).message || "Lưu hồ sơ thất bại, vui lòng thử lại.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Input class ─────────────────────────────────────────── */
  const inputClass = (key: string) => cn(
    "w-full h-11 px-4 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white",
    "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
    errors[key] ? "border-red-300 bg-red-50/40" : "border-slate-200"
  );

  const ErrNote = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{errors[name]}
      </p>
    ) : null;

  /* ── Loading ──────────────────────────────────────────────── */
  if (pageLoading) {
    return (
      <AuthGuard allowedRoles={["Advisor"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#eec54e]" />
          <p className="text-[13px] text-slate-400 font-semibold">Đang tải hồ sơ...</p>
        </div>
      </AuthGuard>
    );
  }

  /* ── Load error ──────────────────────────────────────────── */
  if (loadError) {
    return (
      <AuthGuard allowedRoles={["Advisor"]}>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-slate-800">Không thể tải dữ liệu</p>
            <p className="text-[13px] text-slate-400 mt-1">Vui lòng kiểm tra kết nối và thử lại.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#0f172a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1e293b] transition-colors"
          >
            Thử lại
          </button>
        </div>
      </AuthGuard>
    );
  }

  /* ── JSX ─────────────────────────────────────────────────── */
  return (
    <AuthGuard allowedRoles={["Advisor"]}>
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">

      {/* Header */}
      <div className="max-w-2xl w-full text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#eec54e]" />
          <span className="text-[11px] font-bold text-slate-500">Hoàn thiện hồ sơ Advisor</span>
        </div>
        <h1 className="text-[28px] font-bold text-slate-900 mb-2">Trở thành Cố vấn trên AISEP</h1>
        <p className="text-[13px] text-slate-400">Chia sẻ kinh nghiệm của bạn để giúp các Startup phát triển vượt bậc.</p>
      </div>

      {/* Step indicators */}
      <div className="max-w-2xl w-full mb-6">
        <div className="flex items-center gap-3">
          {[
            { n: 1, label: "Thông tin cơ bản" },
            { n: 2, label: "Chuyên môn & Bio" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all",
                step === n ? "bg-[#eec54e]/10" : step > n ? "bg-emerald-50" : "bg-white border border-slate-200"
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
                  {label}
                </span>
              </div>
              {n < 2 && <div className={cn("flex-1 h-px", step > 1 ? "bg-[#eec54e]" : "bg-slate-200")} />}
            </div>
          ))}
        </div>

        {/* Completeness bar */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Mức độ hoàn thiện hồ sơ</span>
            <span className="font-semibold text-slate-600">{completeness}%</span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#eec54e] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">

        {/* Submit error */}
        {errors.submit && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-600 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors.submit}
          </div>
        )}

        {/* ── STEP 1 ────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">

            {/* Photo */}
            <div className="flex flex-col items-center gap-2 mb-2">
              <div
                className="relative w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-slate-300 transition-colors overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  : <Camera className="w-7 h-7 text-slate-300 group-hover:text-slate-400 transition-colors" />
                }
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">Ảnh đại diện (tùy chọn)</span>
            </div>

            {/* Name + Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Họ và tên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => { set("fullName", e.target.value); clearErr("fullName"); }}
                    placeholder="Nguyễn Văn A"
                    className={cn(inputClass("fullName"), "pl-10")}
                  />
                </div>
                <ErrNote name="fullName" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Chức vụ <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => { set("title", e.target.value); clearErr("title"); }}
                    placeholder="CEO, Founder, Expert..."
                    className={cn(inputClass("title"), "pl-10")}
                  />
                </div>
                <ErrNote name="title" />
              </div>
            </div>

            {/* Company + Years */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Công ty / Tổ chức <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => { set("company", e.target.value); clearErr("company"); }}
                    placeholder="AI Tech Ventures"
                    className={cn(inputClass("company"), "pl-10")}
                  />
                </div>
                <ErrNote name="company" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Số năm kinh nghiệm <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="number"
                    value={form.yearsOfExperience ?? ""}
                    onChange={e => { set("yearsOfExperience", e.target.value === "" ? null : parseInt(e.target.value)); clearErr("yearsOfExperience"); }}
                    placeholder="8"
                    min="0" max="60"
                    className={cn(inputClass("yearsOfExperience"), "pl-10")}
                  />
                </div>
                <ErrNote name="yearsOfExperience" />
              </div>
            </div>

            {/* Website + LinkedIn */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Liên kết công khai <span className="text-red-400">*</span>
                <span className="text-slate-400 font-normal ml-1 text-[12px]">— ít nhất một trong hai</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      value={form.website}
                      onChange={e => { set("website", e.target.value); clearErr("publicLink"); clearErr("website"); }}
                      placeholder="https://example.com"
                      className={cn(inputClass("website"), "pl-10")}
                    />
                  </div>
                  <ErrNote name="website" />
                </div>
                <div>
                  <div className="relative">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      value={form.linkedinUrl}
                      onChange={e => { set("linkedinUrl", e.target.value); clearErr("publicLink"); clearErr("linkedinUrl"); }}
                      placeholder="https://linkedin.com/in/username"
                      className={cn(inputClass("linkedinUrl"), "pl-10")}
                    />
                  </div>
                  <ErrNote name="linkedinUrl" />
                </div>
              </div>
              <ErrNote name="publicLink" />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowSkipDialog(true)}
                className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Bỏ qua lúc này
              </button>
              <button
                onClick={handleNext}
                className="bg-[#0f172a] text-white text-[13px] font-bold px-6 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 group"
              >
                Tiếp tục <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">

            {/* Primary expertise */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Chuyên môn chính <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EXPERTISE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => {
                      set("primaryExpertise", opt.value);
                      set("secondaryExpertises", form.secondaryExpertises.filter(v => v !== opt.value));
                      clearErr("primaryExpertise");
                    }}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-[12px] font-semibold text-center transition-all",
                      form.primaryExpertise === opt.value
                        ? "border-[#eec54e] bg-[#fdf8e6] text-slate-800"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.primaryExpertise && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.primaryExpertise}
                </p>
              )}
            </div>

            {/* Secondary expertise */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Chuyên môn phụ
                <span className="text-slate-400 font-normal text-[12px] ml-1">— Tùy chọn, tối đa 3</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.filter(o => o.value !== form.primaryExpertise).map(opt => {
                  const selected = form.secondaryExpertises.includes(opt.value);
                  const atMax = form.secondaryExpertises.length >= 3 && !selected;
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

            {/* Bio */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Giới thiệu bản thân (Bio) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300" />
                <textarea
                  value={form.bio}
                  onChange={e => { set("bio", e.target.value); clearErr("bio"); }}
                  placeholder="Tóm tắt kinh nghiệm và giá trị bạn mang lại cho Startup..."
                  rows={4}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white resize-none",
                    "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
                    errors.bio ? "border-red-300 bg-red-50/40" : "border-slate-200"
                  )}
                />
              </div>
              <div className="flex justify-between">
                <ErrNote name="bio" />
                <span className="text-[11px] text-slate-300 mt-1 ml-auto">{form.bio.length}/1000</span>
              </div>
            </div>

            {/* Mentorship Philosophy */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Triết lý cố vấn <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300" />
                <textarea
                  value={form.mentorshipPhilosophy}
                  onChange={e => { set("mentorshipPhilosophy", e.target.value); clearErr("mentorshipPhilosophy"); }}
                  placeholder="Bạn mong muốn hỗ trợ Startup như thế nào? Cách làm việc của bạn ra sao?"
                  rows={4}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white resize-none",
                    "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
                    errors.mentorshipPhilosophy ? "border-red-300 bg-red-50/40" : "border-slate-200"
                  )}
                />
              </div>
              <div className="flex justify-between">
                <ErrNote name="mentorshipPhilosophy" />
                <span className="text-[11px] text-slate-300 mt-1 ml-auto">{form.mentorshipPhilosophy.length}/1000</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => { setStep(1); setErrors({}); }}
                className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#0f172a] text-white text-[13px] font-bold px-6 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : <><CheckCircle2 className="w-4 h-4" /> Hoàn tất hồ sơ</>
                }
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px] text-slate-300 font-semibold text-center">
        Powered by AISEP Pipeline • Secure Profile Verification
      </p>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
         <DialogContent className="sm:max-w-[440px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="p-8 space-y-6">
               <div className="size-16 rounded-[24px] bg-amber-50 flex items-center justify-center border border-amber-100 mx-auto">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
               </div>
               
               <div className="text-center space-y-2">
                  <DialogTitle className="text-[18px] font-bold text-slate-900">Thiết lập hồ sơ sau?</DialogTitle>
                  <DialogDescription className="text-[13px] text-slate-500 leading-relaxed px-4">
                     Bạn có thể bắt đầu khám phá Workspace ngay bây giờ. Đừng quên hoàn thiện hồ sơ sau để nhận được nhiều yêu cầu tư vấn hơn từ các Startup nhé!
                     <span className="block font-bold mt-2 text-slate-900 text-[12px]">Lưu ý: Bạn có thể cập nhật trong phần Cài đặt hồ sơ.</span>
                  </DialogDescription>
               </div>

               <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setShowSkipDialog(false)}
                    className="py-3 rounded-xl font-bold text-[13px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                  >
                     Tiếp tục làm
                  </button>
                  <button 
                    onClick={handleSkip}
                    className="py-3 rounded-xl font-bold text-[13px] bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 transition-all active:scale-95"
                  >
                     Đồng ý, bỏ qua
                  </button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
    </AuthGuard>
  );
}
