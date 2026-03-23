"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Camera, User, Briefcase, Globe, Linkedin, FileText,
  Sparkles, Check, ShieldCheck, KeyRound, AlertCircle,
  Loader2, CheckCircle2, Eye, EyeOff, CreditCard, Info,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { ChangePassword } from "@/services/auth/auth.api";
import {
  CreateAdvisorProfile,
  UpdateAdvisorProfile,
  GetAdvisorProfile,
} from "@/services/advisor/advisor.api";

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

function calcCompleteness(f: {
  name: string; title: string; company: string;
  yearsOfExperience: number | null; website: string; linkedInURL: string;
  googleMeetLink: string; msTeamsLink: string;
  primaryExpertise: string; bio: string; mentorshipPhilosophy: string;
  isBookable: boolean; hourlyRate: number | null; supportedDurations: number[];
}) {
  const checks = [
    Boolean(f.name?.trim()),
    Boolean(f.title?.trim()),
    Boolean(f.company?.trim()),
    f.yearsOfExperience !== null && f.yearsOfExperience >= 0,
    Boolean(f.website?.trim() || f.linkedInURL?.trim()),
    Boolean(f.primaryExpertise),
    Boolean(f.bio?.trim()),
    Boolean(f.mentorshipPhilosophy?.trim()),
    Boolean(f.googleMeetLink?.trim()),
    Boolean(f.msTeamsLink?.trim()),
    f.hourlyRate !== null && f.hourlyRate > 0,
    f.supportedDurations.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ─── Sub-components ─────────────────────────────────────────── */

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <p className="text-[14px] font-bold text-slate-800">{title}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const inputClass = (hasError = false) => cn(
  "w-full h-11 px-4 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white",
  "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  hasError ? "border-red-300 bg-red-50/40" : "border-slate-200"
);

/* ─── Main Component ─────────────────────────────────────────── */

export default function AdvisorProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── State ─────────────────────────────────────────────────── */
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", title: "", company: "",
    yearsOfExperience: null as number | null,
    website: "", linkedInURL: "",
    bio: "", mentorshipPhilosophy: "",
    googleMeetLink: "", msTeamsLink: "",
    isBookable: false,
    hourlyRate: null as number | null,
    supportedDurations: [60] as number[],
  });

  const [primaryExpertise, setPrimaryExpertise] = useState("");
  const [secondaryExpertises, setSecondaryExpertises] = useState<string[]>([]);

  /* Password dialog */
  const [showPwDialog, setShowPwDialog] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ old: false, next: false, confirm: false });
  const [pwError, setPwError] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);

  const completeness = calcCompleteness({ ...form, primaryExpertise });

  /* ── Load profile ──────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await GetAdvisorProfile();
        if (res.isSuccess && res.data) {
          const d: any = res.data;
          const items: any[] = Array.isArray(d.items) ? d.items : [];
          setForm({
            name: d.fullName || "",
            title: d.title || "",
            company: d.company || "",
            yearsOfExperience: items[0]?.yearsOfExperience ?? null,
            website: d.website || "",
            linkedInURL: d.linkedInURL || "",
            bio: d.bio || "",
            mentorshipPhilosophy: d.mentorshipPhilosophy || "",
            googleMeetLink: d.googleMeetLink || "",
            msTeamsLink: d.msTeamsLink || "",
            isBookable: d.servicePricing?.isBookable ?? false,
            hourlyRate: d.servicePricing?.hourlyRate ?? null,
            supportedDurations: d.servicePricing?.supportedDurations ?? [60],
          });
          if (d.profilePhotoURL) setPhotoPreview(d.profilePhotoURL);
          setPrimaryExpertise(items[0]?.category || "");
          setSecondaryExpertises(items.slice(1, 4).map((i: any) => i.category).filter(Boolean));
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      } catch {
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    if (searchParams.get("tab") === "password") setShowPwDialog(true);
  }, []);

  /* ── Photo ─────────────────────────────────────────────────── */
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ── Save profile ──────────────────────────────────────────── */
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên Advisor"); return; }
    setIsSaving(true);
    const payload = {
      fullName: form.name,
      title: form.title || undefined,
      bio: form.bio || undefined,
      linkedInURL: form.linkedInURL || undefined,
      mentorshipPhilosophy: form.mentorshipPhilosophy || undefined,
      profilePhotoFile: profilePhoto ?? undefined,
      advisorIndustryFocus: [], // TODO: map industry selections to { industryId } if needed
    };
    try {
      if (hasProfile) {
        await UpdateAdvisorProfile(payload);
      } else {
        await CreateAdvisorProfile(payload);
        setHasProfile(true);
      }
      toast.success("Lưu hồ sơ thành công");
    } catch {
      toast.error("Lưu hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Change password ───────────────────────────────────────── */
  const handleChangePw = async () => {
    setPwError("");
    if (pwForm.next !== pwForm.confirm) { setPwError("Mật khẩu mới và xác nhận không khớp"); return; }
    setIsChangingPw(true);
    try {
      const res = await ChangePassword(pwForm.old, pwForm.next, pwForm.confirm);
      if (res.isSuccess) {
        toast.success("Đổi mật khẩu thành công");
        setShowPwDialog(false);
        setPwForm({ old: "", next: "", confirm: "" });
      } else {
        setPwError(res.message || "Đổi mật khẩu không thành công");
      }
    } catch {
      setPwError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsChangingPw(false);
    }
  };

  /* ── Loading skeleton ──────────────────────────────────────── */
  if (isLoading) {
    return (
      <AdvisorShell>
        <div className="flex items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#eec54e]" />
          <p className="text-[13px] text-slate-400 font-semibold">Đang tải hồ sơ...</p>
        </div>
      </AdvisorShell>
    );
  }

  /* ── Load error ──────────────────────────────────────────── */
  if (loadError) {
    return (
      <AdvisorShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-slate-800">Không thể tải hồ sơ</p>
            <p className="text-[13px] text-slate-400 mt-1">Vui lòng kiểm tra kết nối và thử lại.</p>
          </div>
          <button
            onClick={() => { setLoadError(false); setIsLoading(true); window.location.reload(); }}
            className="px-5 py-2.5 bg-[#0f172a] text-white text-[13px] font-semibold rounded-xl hover:bg-[#1e293b] transition-colors"
          >
            Thử lại
          </button>
        </div>
      </AdvisorShell>
    );
  }

  /* ── JSX ───────────────────────────────────────────────────── */
  return (
    <AdvisorShell>
      <div className="max-w-[1000px] mx-auto pb-16 animate-in fade-in duration-400">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-slate-900">Hồ sơ Advisor</h1>
          <p className="text-[13px] text-slate-400 mt-1">Thông tin hiển thị công khai trên nền tảng AISEP.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT (2/3) ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <SectionCard title="Thông tin cơ bản" icon={User}>
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                    {photoPreview
                      ? <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="text-[22px] font-bold text-slate-400">
                          {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                        </span>
                    }
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 h-9 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" /> Thay đổi ảnh
                  </button>
                  <p className="text-[11px] text-slate-400 mt-1.5">JPG, PNG — tối đa 5MB</p>
                  <input type="file" ref={fileInputRef} onChange={handlePhoto} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                    Họ và tên <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className={cn(inputClass(), "pl-10")} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Chức vụ</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="CEO, Founder, Expert..."
                      className={cn(inputClass(), "pl-10")} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Công ty / Tổ chức</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                      placeholder="AI Tech Ventures"
                      className={cn(inputClass(), "pl-10")} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Số năm kinh nghiệm</label>
                  <input
                    type="number" min={0} max={60}
                    value={form.yearsOfExperience ?? ""}
                    onChange={e => setForm(p => ({ ...p, yearsOfExperience: e.target.value === "" ? null : parseInt(e.target.value) }))}
                    placeholder="8"
                    className={inputClass()} />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://example.com"
                      className={cn(inputClass(), "pl-10")} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">LinkedIn URL</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input value={form.linkedInURL} onChange={e => setForm(p => ({ ...p, linkedInURL: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className={cn(inputClass(), "pl-10")} />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Bio */}
            <SectionCard title="Giới thiệu & Triết lý" icon={FileText}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                    Giới thiệu bản thân (Bio)
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tóm tắt kinh nghiệm và giá trị bạn mang lại cho Startup..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 resize-none transition-all"
                  />
                  <p className="text-[11px] text-slate-300 text-right mt-1">{form.bio.length}/1000</p>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                    Triết lý cố vấn
                  </label>
                  <textarea
                    value={form.mentorshipPhilosophy}
                    onChange={e => setForm(p => ({ ...p, mentorshipPhilosophy: e.target.value }))}
                    placeholder="Bạn mong muốn hỗ trợ Startup như thế nào? Cách làm việc của bạn ra sao?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 resize-none transition-all"
                  />
                  <p className="text-[11px] text-slate-300 text-right mt-1">{form.mentorshipPhilosophy.length}/1000</p>
                </div>
              </div>
            </SectionCard>
 
             {/* Meeting Links */}
             <SectionCard title="Link họp trực tuyến" icon={Globe}>
               <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
                 <ShieldCheck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                 <div className="flex-1">
                   <p className="text-[12px] font-medium text-blue-800">Thông tin bảo mật</p>
                   <p className="text-[11px] text-blue-700 leading-relaxed">
                     Các đường dẫn này sẽ được giữ bí mật và chỉ chia sẻ với Startup sau khi buổi tư vấn được xác nhận lịch chính thức.
                   </p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                     <Image src="https://thesvg.org/icons/google-meet/default.svg" alt="Google Meet" width={18} height={18} unoptimized />
                     Google Meet Link
                   </label>
                   <input
                     value={form.googleMeetLink}
                     onChange={e => setForm(p => ({ ...p, googleMeetLink: e.target.value }))}
                     placeholder="https://meet.google.com/xxx-yyyy-zzz"
                     className={inputClass()}
                   />
                 </div>
                 <div>
                   <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                     <Image src="https://thesvg.org/icons/microsoft-teams/default.svg" alt="Microsoft Teams" width={18} height={18} unoptimized />
                     MS Teams Link
                   </label>
                   <input
                     value={form.msTeamsLink}
                     onChange={e => setForm(p => ({ ...p, msTeamsLink: e.target.value }))}
                     placeholder="https://teams.microsoft.com/l/meetup-join/..."
                     className={inputClass()}
                   />
                 </div>
               </div>
             </SectionCard>

            {/* Expertise */}
            <SectionCard title="Chuyên môn" icon={Sparkles}>
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">Chuyên môn chính</label>
                  <div className="grid grid-cols-3 gap-2">
                    {EXPERTISE_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => {
                          setPrimaryExpertise(opt.value);
                          setSecondaryExpertises(prev => prev.filter(v => v !== opt.value));
                        }}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-[12px] font-semibold text-center transition-all",
                          primaryExpertise === opt.value
                            ? "border-[#eec54e] bg-[#fdf8e6] text-slate-800"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                    Chuyên môn phụ
                    <span className="text-slate-400 font-normal text-[12px] ml-1">— Tối đa 3</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERTISE_OPTIONS.map(opt => {
                      const selected = secondaryExpertises.includes(opt.value);
                      const isPrimary = opt.value === primaryExpertise;
                      const atMax = secondaryExpertises.length >= 3 && !selected;
                      
                      return (
                        <button 
                          key={opt.value} 
                          type="button" 
                          disabled={isPrimary || atMax}
                          onClick={() => setSecondaryExpertises(prev =>
                            prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value]
                          )}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all flex items-center gap-1.5",
                            selected 
                              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700",
                            isPrimary && "opacity-40 grayscale cursor-not-allowed bg-slate-50 border-slate-100",
                            atMax && !isPrimary && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {selected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                          {opt.label}
                          {isPrimary && <span className="text-[9px] font-normal opacity-70 ml-0.5">(Chính)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Service & Pricing */}
            <SectionCard title="Dịch vụ & Mức phí" icon={CreditCard}>
              <div className="space-y-6">
                {/* Bookable Toggle & Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[14px] font-bold text-slate-800">Nhận yêu cầu tư vấn</p>
                      {form.isBookable ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider animate-pulse">Đang mở</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Đang tắt</span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                      Khi bật, Startup có thể tìm thấy bạn và gửi yêu cầu đặt lịch tư vấn trực tiếp.
                    </p>
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <button 
                    type="button"
                    onClick={() => {
                      // Basic eligibility check
                      const canEnable = Boolean(form.name && form.title && form.company && primaryExpertise && (form.website || form.linkedInURL));
                      if (!canEnable && !form.isBookable) {
                        toast.error("Vui lòng hoàn thiện hồ sơ cơ bản (Tên, Chức vụ, Chuyên môn) để bật nhận tư vấn.");
                        return;
                      }
                      setForm(p => ({ ...p, isBookable: !p.isBookable }));
                    }}
                    className={cn(
                      "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#eec54e] focus:ring-offset-2",
                      form.isBookable ? "bg-[#eec54e]" : "bg-slate-200"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        form.isBookable ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      Đơn giá theo giờ (Hourly Rate)
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        min={0}
                        step={1000}
                        value={form.hourlyRate ?? ""}
                        onChange={e => setForm(p => ({ ...p, hourlyRate: e.target.value === "" ? null : parseFloat(e.target.value) }))}
                        placeholder="Ví dụ: 500.000"
                        className={cn(inputClass(), "pr-20")}
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold uppercase">
                        VNĐ / giờ
                      </div>
                    </div>
                  </div>

                  {/* Durations */}
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                      Thời lượng hỗ trợ
                      <span className="text-slate-400 font-normal text-[12px] ml-1.5">— Phút</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[30, 60, 90, 120].map(d => {
                        const selected = form.supportedDurations.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setForm(p => ({
                              ...p,
                              supportedDurations: selected 
                                ? p.supportedDurations.filter(v => v !== d)
                                : [...p.supportedDurations, d].sort((a, b) => a - b)
                            }))}
                            className={cn(
                              "px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-all",
                              selected 
                                ? "bg-[#171611] text-white border-[#171611] shadow-sm" 
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                            )}
                          >
                            {d}m
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Price Preview Table */}
                {form.hourlyRate && form.hourlyRate > 0 && form.supportedDurations.length > 0 && (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-[#eec54e]" />
                      <p className="text-[13px] font-bold text-slate-800 tracking-tight">Xem trước phân bổ doanh thu</p>
                      <Info className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <div className="rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                            <th className="px-4 py-3 text-left font-bold">Thời lượng</th>
                            <th className="px-4 py-3 text-right font-bold text-slate-500">Giá buổi (100%)</th>
                            <th className="px-4 py-3 text-right font-bold text-blue-400/80">Phí nền tảng (15%)</th>
                            <th className="px-4 py-3 text-right font-bold text-emerald-600">Thực nhận dự kiến</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {form.supportedDurations.map(d => {
                            const price = Math.round((form.hourlyRate! * d) / 60);
                            const fee = Math.round(price * 0.15);
                            const payout = price - fee;
                            
                            const fmt = (val: number) => val.toLocaleString('vi-VN');
                            
                            return (
                              <tr key={d} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-700">{d} phút</td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(price)} đ</td>
                                <td className="px-4 py-3 text-right text-slate-400">-{fmt(fee)} đ</td>
                                <td className="px-4 py-3 text-right">
                                  <span className="inline-flex items-center justify-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold">
                                    {fmt(payout)} đ
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100/50 flex items-start gap-2.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                      <p className="text-[11px] text-amber-700 leading-relaxed italic">
                        Lưu ý: Mức thực nhận trên là dự kiến dựa trên phí nền tảng hiện tại (15%). Số tiền thanh toán cuối cùng có thể thay đổi tùy thuộc vào các chương trình khuyến mãi hoặc chính sách thuế tại thời điểm thanh toán.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Save button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => router.push("/advisor")}
                className="px-5 h-10 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSave} disabled={isSaving}
                className="bg-[#0f172a] text-white text-[13px] font-bold px-6 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : <><CheckCircle2 className="w-4 h-4" /> Lưu thay đổi</>}
              </button>
            </div>
          </div>

          {/* ── RIGHT (1/3) ─────────────────────────────────── */}
          <div className="space-y-5 lg:sticky lg:top-24 h-fit">

            {/* Completeness */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[14px] font-bold text-slate-800 mb-4">Mức độ hoàn thiện</p>

              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-[12px] text-slate-500">
                  <span>Hồ sơ của bạn</span>
                  <span className={cn("font-bold", completeness === 100 ? "text-emerald-600" : "text-slate-700")}>{completeness}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", completeness === 100 ? "bg-emerald-500" : "bg-[#eec54e]")}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>

              <ul className="space-y-2">
                {[
                  { label: "Họ và tên", done: Boolean(form.name?.trim()) },
                  { label: "Chức vụ", done: Boolean(form.title?.trim()) },
                  { label: "Công ty / Tổ chức", done: Boolean(form.company?.trim()) },
                  { label: "Số năm kinh nghiệm", done: form.yearsOfExperience !== null },
                  { label: "Ít nhất 1 liên kết công khai", done: Boolean(form.website?.trim() || form.linkedInURL?.trim()) },
                  { label: "Chuyên môn chính", done: Boolean(primaryExpertise) },
                  { label: "Giới thiệu bản thân", done: Boolean(form.bio?.trim()) },
                  { label: "Triết lý cố vấn", done: Boolean(form.mentorshipPhilosophy?.trim()) },
                  { label: "Link Google Meet", done: Boolean(form.googleMeetLink?.trim()) },
                  { label: "Link MS Teams", done: Boolean(form.msTeamsLink?.trim()) },
                  { label: "Đơn giá tư vấn", done: form.hourlyRate !== null && form.hourlyRate > 0 },
                  { label: "Thời lượng hỗ trợ", done: form.supportedDurations.length > 0 },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all",
                      item.done ? "bg-[#eec54e] border-[#eec54e]" : "border-slate-200"
                    )}>
                      {item.done && <Check className="w-2.5 h-2.5 text-[#171611]" />}
                    </div>
                    <span className={cn("text-[12px]", item.done ? "text-slate-600 font-semibold" : "text-slate-400")}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[14px] font-bold text-slate-800 mb-3">Thao tác nhanh</p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/advisor/kyc")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#eec54e]/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#eec54e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-700">Xác thực KYC</p>
                    <p className="text-[11px] text-slate-400">Nhận badge Verified Advisor</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowPwDialog(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-700">Đổi mật khẩu</p>
                    <p className="text-[11px] text-slate-400">Cập nhật mật khẩu đăng nhập</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Password Dialog ──────────────────────────────────── */}
      {showPwDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[16px] font-bold text-slate-900">Đổi mật khẩu</p>
                <p className="text-[12px] text-slate-400">Cập nhật mật khẩu đăng nhập của bạn</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Mật khẩu cũ", key: "old" as const, placeholder: "Nhập mật khẩu hiện tại" },
                { label: "Mật khẩu mới", key: "next" as const, placeholder: "Tối thiểu 8 ký tự" },
                { label: "Xác nhận mật khẩu mới", key: "confirm" as const, placeholder: "Nhập lại mật khẩu mới" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={pwShow[key] ? "text" : "password"}
                      value={pwForm[key]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 transition-all"
                    />
                    <button type="button" onClick={() => setPwShow(p => ({ ...p, [key]: !p[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                      {pwShow[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              {pwError && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-[12px] text-red-600">{pwError}</p>
                </div>
              )}

              <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50/60 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-600">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowPwDialog(false); setPwError(""); setPwForm({ old: "", next: "", confirm: "" }); }}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-all">
                Hủy
              </button>
              <button
                onClick={handleChangePw}
                disabled={!pwForm.old || !pwForm.next || !pwForm.confirm || isChangingPw}
                className="flex-1 h-10 bg-[#0f172a] text-white text-[13px] font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isChangingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang đổi...</> : "Đổi mật khẩu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdvisorShell>
  );
}
