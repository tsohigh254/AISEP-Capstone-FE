"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Camera, User, Briefcase, Globe, Linkedin, FileText,
  Sparkles, Check, ShieldCheck, KeyRound, AlertCircle,
  Loader2, CheckCircle2, Eye, EyeOff, CreditCard, Info,
  BadgeCheck, Pencil, Star, Clock, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { ChangePassword } from "@/services/auth/auth.api";
import {
  CreateAdvisorProfile,
  UpdateAdvisorProfile,
  GetAdvisorProfile,
  UpdateAdvisorAvailability,
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
    !f.isBookable || (f.hourlyRate !== null && f.hourlyRate > 0),
    !f.isBookable || (f.supportedDurations.length > 0),
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

function AdvisorProfileClientInner({ initialEditing = false }: { initialEditing?: boolean }) {
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

  const [profileStatus, setProfileStatus] = useState<string>("Draft");
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
  const [savedIndustries, setSavedIndustries] = useState<any[]>([]);

  /* Password dialog */
  const [showPwDialog, setShowPwDialog] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ old: false, next: false, confirm: false });
  const [pwError, setPwError] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);

  const completeness = calcCompleteness({ ...form, primaryExpertise });

  const [isEditing, setIsEditing] = useState(initialEditing);
  const [activeViewTab, setActiveViewTab] = useState<"Tổng quan" | "Chuyên môn & Dịch vụ" | "Liên hệ">("Tổng quan");

  const EXPERTISE_LABEL: Record<string, string> = {
    FUNDRAISING: "Gọi vốn",
    PRODUCT_STRATEGY: "Chiến lược SP",
    GO_TO_MARKET: "Go-to-market",
    FINANCE: "Tài chính",
    LEGAL_IP: "Pháp lý & SHTT",
    OPERATIONS: "Vận hành",
    TECHNOLOGY: "Công nghệ",
    MARKETING: "Marketing",
    HR_OR_TEAM_BUILDING: "Nhân sự",
  };
  const VIEW_TABS = ["Tổng quan", "Chuyên môn & Dịch vụ", "Liên hệ"] as const;

  /* ── Load profile ──────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const res: any = await GetAdvisorProfile();
        
        // Backend đã return HTTP 200 OK + "isSuccess": true. Data null nếu chưa có.
        if (res.isSuccess) {
          if (res.data) {
            const d: any = res.data;              console.log("=== API RESPONSE: GET /api/advisors/me ===", d);            
            
            const expArray: string[] = Array.isArray(d.expertise) ? d.expertise : [];
            const apiDurations = Array.isArray(d.supportedDurations) ? d.supportedDurations : [60];
            
            setForm({
              name: d.fullName || "",
              title: d.title || "",
              company: d.company || "",
              yearsOfExperience: d.yearsOfExperience ?? null,
              website: d.website || "",
              linkedInURL: d.linkedInURL || "",
              bio: d.bio || "",
              mentorshipPhilosophy: d.mentorshipPhilosophy || "",
              googleMeetLink: d.googleMeetLink || "",
              msTeamsLink: d.msTeamsLink || "",
              isBookable: d.hourlyRate ? true : false,
              hourlyRate: d.hourlyRate ?? null,
              supportedDurations: Array.from(new Set(apiDurations.map((v: any) => Number(v))) as Set<number>).sort((a: number, b: number) => a - b),
            });
            if (d.profilePhotoURL) setPhotoPreview(d.profilePhotoURL);
            
            setPrimaryExpertise(expArray[0] || "");
            setSecondaryExpertises(expArray.slice(1, 4).filter(Boolean));
            
            setSavedIndustries(d.industryFocus || []);
            setHasProfile(true);
            setProfileStatus(d.profileStatus || "Draft");
          } else {
            // isSuccess: true, nhưng data: null -> User mới chưa có Profile
            setHasProfile(false);
          }
        } else {
          // Các mã lỗi chủ động bắt được kiểu như isSuccess: false
          setLoadError(true);
        }
      } catch (error: any) {
        // Lỗi không lường trước (5xx)
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
    
    if (form.isBookable && (!form.hourlyRate || form.hourlyRate <= 0)) {
      toast.error("Vui lòng nhập phí tư vấn khi bật tính năng cho phép đặt lịch!");
      return;
    }
    
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    if (form.website && !urlRegex.test(form.website)) {
      toast.error("Định dạng Website không hợp lệ!"); return;
    }
    let formattedLinkedIn = form.linkedInURL;
    if (formattedLinkedIn && !formattedLinkedIn.startsWith("http://") && !formattedLinkedIn.startsWith("https://")) {
      formattedLinkedIn = `https://${formattedLinkedIn}`;
    }

    if (formattedLinkedIn && !formattedLinkedIn.includes("linkedin.com/")) {
      toast.error("Đường dẫn LinkedIn không hợp lệ!"); return;
    }
    if (form.googleMeetLink && !form.googleMeetLink.includes("meet.google.com/")) {
      toast.error("Đường dẫn Google Meet không hợp lệ!"); return;
    }
    if (form.msTeamsLink && !form.msTeamsLink.includes("teams.microsoft.com/") && !form.msTeamsLink.includes("teams.live.com/")) {
      toast.error("Đường dẫn MS Teams không hợp lệ!"); return;
    }

    setIsSaving(true);
    const payload = {
      title: form.title || undefined,
      company: form.company || undefined,
      bio: form.bio || undefined,
      experienceYears: form.yearsOfExperience ?? undefined,
      website: form.website || undefined,
      linkedInURL: formattedLinkedIn || undefined,
      googleMeetLink: form.googleMeetLink || undefined,
      msTeamsLink: form.msTeamsLink || undefined,
      mentorshipPhilosophy: form.mentorshipPhilosophy || undefined,
      profilePhotoFile: profilePhoto ?? undefined,
      items: primaryExpertise
        ? [
            { category: primaryExpertise, yearsOfExperience: form.yearsOfExperience },
            ...secondaryExpertises.map(c => ({ category: c }))
          ]
        : [],
      servicePricing: {
        isBookable: form.isBookable,
        hourlyRate: form.hourlyRate,
        currency: "VND" as const,
        supportedDurations: form.supportedDurations,
      },
      advisorIndustryFocus: savedIndustries.map((item: any) => ({ industryId: item.industryId })),
    };
    try {
      let res: any;
      if (hasProfile) {
        res = await UpdateAdvisorProfile(form.name, payload);
      } else {
        res = await CreateAdvisorProfile(form.name, payload);
      }

      if (res && res.isSuccess === false) {
        // Validation error from backend
        const errorMsg = res.data?.[0]?.messages?.[0] || res.message || "Lưu hồ sơ thất bại";
        toast.error(`Lỗi: ${errorMsg}`);
        return;
      }

      setHasProfile(true);
      toast.success("Lưu hồ sơ thành công");
      router.push("/advisor/profile");
    } catch (error: any) {
      toast.error("Lưu hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Change Availability ───────────────────────────────────── */
  const [isTogglingAvail, setIsTogglingAvail] = useState(false);
  const handleToggleAvailability = async () => {
    if (profileStatus !== "Approved") return;
    
    // Optimistic UI
    const prev = form.isBookable;
    setForm(p => ({ ...p, isBookable: !prev }));
    setIsTogglingAvail(true);
    
    try {
      const res: any = await UpdateAdvisorAvailability({ isAcceptingNewMentees: !prev });
      if (res && res.isSuccess === false) {
        setForm(p => ({ ...p, isBookable: prev }));
        const errorMsg = res.message || res.data?.[0]?.messages?.[0] || "Không thể bật nhận tư vấn";
        toast.error(`Lỗi: ${errorMsg}`);
      } else {
        toast.success(!prev ? "Đã BẬT nhận yêu cầu tư vấn" : "Đã TẮT nhận yêu cầu tư vấn");
      }
    } catch (e: any) {
      setForm(p => ({ ...p, isBookable: prev }));
      toast.error(e?.response?.data?.message || "Có lỗi xảy ra khi thay đổi trạng thái khả dụng.");
    } finally {
      setIsTogglingAvail(false);
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

  /* ── Empty Profile CTA ─────────────────────────────────────── */
  if (hasProfile === false && form.name === "") {
    return (
      <AdvisorShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center border border-amber-200/50 shadow-sm">
            <Sparkles className="w-9 h-9 text-amber-500" />
          </div>
          <div className="text-center max-w-md">
            <h2 className="text-[22px] font-bold text-slate-900 mb-2">Chào mừng bạn đến với AISEP</h2>
            <p className="text-[14px] text-slate-500 leading-relaxed">
              Bạn chưa có hồ sơ cố vấn. Hãy tạo hồ sơ ngay để các Startup có thể tìm thấy và kết nối với bạn nhé!
            </p>
          </div>
          <button
            onClick={() => setForm(p => ({ ...p, name: " " }))} 
            className="px-6 py-3 bg-[#eec54e] text-white text-[14px] font-semibold rounded-xl hover:bg-[#d4ae3d] hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-[#eec54e]/20"
          >
            Bắt đầu tạo hồ sơ
          </button>
        </div>
      </AdvisorShell>
    );
  }

  /* ── JSX ───────────────────────────────────────────────────── */
  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto pb-16 animate-in fade-in duration-400">

        {!isEditing ? (
          /* ══ VIEW MODE ══════════════════════════════════════ */
          <>
            {/* Hero card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mb-5">
              <div className="relative h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] rounded-t-2xl" />
                <div className="absolute top-4 right-5">
                  <button
                    onClick={() => router.push("/advisor/profile/edit")}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white text-[11px] font-medium hover:bg-black/50 transition-colors"
                    title="Bật/tắt nhận mentee trong cài đặt hồ sơ"
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", form.isBookable ? "bg-emerald-400" : "bg-slate-400")} />
                    {form.isBookable ? "Đang nhận mentee" : "Tạm ngưng nhận mentee"}
                    <ChevronRight className="w-3 h-3 text-white/50" />
                  </button>
                </div>
              </div>
              <div className="px-7 pb-7">
                <div className="-mt-10 mb-4 relative z-10">
                  <div className="w-20 h-20 rounded-2xl border-[3px] border-white shadow-md overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-[20px]">
                    {photoPreview
                      ? <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
                      : <span>{form.name ? form.name.charAt(0).toUpperCase() : "?"}</span>
                    }
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">{form.name || "Chưa có tên"}</h1>
                      {profileStatus === "Approved" && <BadgeCheck className="w-5 h-5 text-teal-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[13px] text-slate-500">
                      {[form.title, form.company].filter(Boolean).join(" · ") || "Chưa cập nhật thông tin"}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/advisor/profile/edit")}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex-shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                  {[primaryExpertise, ...secondaryExpertises].filter(Boolean).map((e, i) => (
                    <span key={e} className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border",
                      i === 0 ? "bg-amber-50 text-amber-700 border-amber-100/60" : "bg-slate-50 text-slate-600 border-slate-100"
                    )}>
                      {i === 0 && <Star className="w-3 h-3" />}
                      {EXPERTISE_LABEL[e] || e}
                    </span>
                  ))}
                  {form.yearsOfExperience != null && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-100">
                      <Clock className="w-3 h-3" />{form.yearsOfExperience} năm KN
                    </span>
                  )}
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border",
                    form.isBookable ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", form.isBookable ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                    {form.isBookable ? "Đang nhận mentee" : "Tạm ngưng nhận"}
                  </span>
                  <span className={cn(
                    "ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border",
                    profileStatus === "Approved" ? "bg-teal-50 text-teal-700 border-teal-100"
                      : profileStatus === "PendingReview" ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-slate-50 text-slate-500 border-slate-100"
                  )}>
                    {profileStatus === "Approved" ? "Đã xét duyệt" : profileStatus === "PendingReview" ? "Đang chờ duyệt" : "Chưa gửi duyệt"}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-slate-500">Độ hoàn thiện hồ sơ</span>
                    <span className={cn("text-[12px] font-semibold", completeness === 100 ? "text-emerald-600" : "text-slate-700")}>{completeness}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", completeness === 100 ? "bg-emerald-500" : "bg-[#eec54e]")} style={{ width: `${completeness}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex w-fit items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-5">
              {VIEW_TABS.map(tab => (
                <button key={tab} onClick={() => setActiveViewTab(tab)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-medium transition-all",
                    activeViewTab === tab ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  )}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab: Tổng quan */}
            {activeViewTab === "Tổng quan" && (
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 lg:col-span-8 space-y-5">
                  {form.bio ? (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <h3 className="text-[13px] font-semibold text-slate-700">Giới thiệu bản thân</h3>
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-500 whitespace-pre-line">{form.bio}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-[13px] text-slate-400">Chưa có phần giới thiệu bản thân.</p>
                      <button onClick={() => router.push("/advisor/profile/edit")} className="mt-2 text-[12px] text-amber-600 hover:underline">+ Thêm ngay</button>
                    </div>
                  )}
                  {form.mentorshipPhilosophy && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h3 className="text-[13px] font-semibold text-slate-700">Triết lý cố vấn</h3>
                      </div>
                      <p className="text-[13px] leading-relaxed text-slate-500 whitespace-pre-line">{form.mentorshipPhilosophy}</p>
                    </div>
                  )}
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Thông tin nhanh</h3>
                    <div className="space-y-3">
                      {form.title && (
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0"><Briefcase className="w-3.5 h-3.5 text-slate-400" /></div>
                          <div><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Chức vụ</p><p className="text-[12px] font-medium text-slate-700">{form.title}</p></div>
                        </div>
                      )}
                      {form.company && (
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0"><Globe className="w-3.5 h-3.5 text-slate-400" /></div>
                          <div><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Công ty</p><p className="text-[12px] font-medium text-slate-700">{form.company}</p></div>
                        </div>
                      )}
                      {form.yearsOfExperience != null && (
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0"><Clock className="w-3.5 h-3.5 text-slate-400" /></div>
                          <div><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Kinh nghiệm</p><p className="text-[12px] font-medium text-slate-700">{form.yearsOfExperience} năm</p></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => router.push("/advisor/profile/edit")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-slate-800">
                    <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Chuyên môn & Dịch vụ */}
            {activeViewTab === "Chuyên môn & Dịch vụ" && (
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 lg:col-span-8 space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="text-[13px] font-semibold text-slate-700">Chuyên môn</h3>
                    </div>
                    {[primaryExpertise, ...secondaryExpertises].filter(Boolean).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {[primaryExpertise, ...secondaryExpertises].filter(Boolean).map((e, i) => (
                          <span key={e} className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border",
                            i === 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                          )}>
                            {i === 0 && <Star className="w-3 h-3" />}
                            {EXPERTISE_LABEL[e] || e}
                            {i === 0 && <span className="text-[9px] font-normal opacity-60 ml-0.5">(Chính)</span>}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-[13px] text-slate-400">Chưa chọn chuyên môn.</p>}
                  </div>
                  {form.hourlyRate && form.hourlyRate > 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <h3 className="text-[13px] font-semibold text-slate-700">Dịch vụ & Mức phí</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-[18px] font-bold text-slate-900">{form.hourlyRate.toLocaleString("vi-VN")}đ</span>
                        <span className="text-[13px] text-slate-400">/ giờ</span>
                        <div className="flex gap-2 ml-auto">
                          {form.supportedDurations.map(d => (
                            <span key={d} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[12px] font-bold">{d}m</span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                              <th className="px-4 py-3 text-left font-bold">Thời lượng</th>
                              <th className="px-4 py-3 text-right font-bold text-slate-500">Giá buổi</th>
                              <th className="px-4 py-3 text-right font-bold text-emerald-600">Thực nhận dự kiến</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {form.supportedDurations.map(d => {
                              const price = Math.round((form.hourlyRate! * d) / 60);
                              const payout = price - Math.round(price * 0.15);
                              return (
                                <tr key={d} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-bold text-slate-700">{d} phút</td>
                                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{price.toLocaleString("vi-VN")} đ</td>
                                  <td className="px-4 py-3 text-right"><span className="inline-flex items-center justify-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold">{payout.toLocaleString("vi-VN")} đ</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-[13px] text-slate-400">Chưa cài đặt mức phí tư vấn.</p>
                      <button onClick={() => router.push("/advisor/profile/edit")} className="mt-2 text-[12px] text-amber-600 hover:underline">+ Thiết lập ngay</button>
                    </div>
                  )}
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Trạng thái nhận tư vấn</h3>
                    <div className={cn("flex items-center gap-3 p-3 rounded-xl", form.isBookable ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-100")}>
                      <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", form.isBookable ? "bg-emerald-500" : "bg-slate-300")} />
                      <div>
                        <p className={cn("text-[12px] font-semibold", form.isBookable ? "text-emerald-700" : "text-slate-600")}>{form.isBookable ? "Đang nhận yêu cầu" : "Tạm đóng yêu cầu"}</p>
                        <p className="text-[11px] text-slate-400">{form.isBookable ? "Startup có thể gửi yêu cầu tư vấn" : "Không nhận yêu cầu mới"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Liên hệ */}
            {activeViewTab === "Liên hệ" && (
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12 lg:col-span-8 space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <h3 className="text-[13px] font-semibold text-slate-700">Liên kết công khai</h3>
                    </div>
                    <div className="space-y-3">
                      {form.website && <div><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-0.5">Website</p><a href={form.website} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-blue-600 hover:underline">{form.website}</a></div>}
                      {form.linkedInURL && <div><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-0.5">LinkedIn</p><a href={form.linkedInURL} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-blue-600 hover:underline">{form.linkedInURL}</a></div>}
                      {!form.website && !form.linkedInURL && <p className="text-[13px] text-slate-400">Chưa có liên kết công khai.</p>}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <h3 className="text-[13px] font-semibold text-slate-700">Link họp trực tuyến</h3>
                    </div>
                    <p className="text-[12px] text-slate-400 mb-3">Chỉ chia sẻ với Startup sau khi xác nhận lịch chính thức.</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <Image src="/google-meet.svg" alt="Google Meet" width={18} height={18} />
                        <p className="text-[12px] font-medium text-slate-600">{form.googleMeetLink ? "Đã cài đặt" : "Chưa cài đặt"}</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <Image src="/ms-teams.svg" alt="MS Teams" width={18} height={18} />
                        <p className="text-[12px] font-medium text-slate-600">{form.msTeamsLink ? "Đã cài đặt" : "Chưa cài đặt"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-2">
                    <h3 className="text-[12px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Thao tác nhanh</h3>
                    <button type="button" onClick={() => router.push("/advisor/kyc")}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-left">
                      <div className="w-8 h-8 rounded-lg bg-[#eec54e]/10 flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4 text-[#eec54e]" /></div>
                      <div><p className="text-[12px] font-semibold text-slate-700">Xác thực KYC</p><p className="text-[11px] text-slate-400">Nhận badge Verified Advisor</p></div>
                    </button>
                    <button type="button" onClick={() => setShowPwDialog(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-left">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><KeyRound className="w-4 h-4 text-blue-500" /></div>
                      <div><p className="text-[12px] font-semibold text-slate-700">Đổi mật khẩu</p><p className="text-[11px] text-slate-400">Cập nhật mật khẩu đăng nhập</p></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ══ EDIT MODE ══════════════════════════════════════ */
          <>
            {/* Page header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[22px] font-bold text-slate-900">Chỉnh sửa hồ sơ</h1>
              </div>
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
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 h-9 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" /> Thay đổi ảnh
                  </button>
                  <p className="text-[11px] text-slate-400 mt-1.5">JPG, PNG — tối đa 5MB</p>
                  <input type="file" ref={fileInputRef} onChange={handlePhoto} accept="image/jpeg, image/png" className="hidden" />
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
                    onKeyDown={e => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                    }}
                    onChange={e => {
                      let val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                      if (val !== null) {
                        if (val > 60) val = 60;
                        if (val < 0) val = 0;
                      }
                      setForm(p => ({ ...p, yearsOfExperience: val }));
                    }}
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
                    <img src="/linkedin.svg" alt="LinkedIn" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" />
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
                    maxLength={1000}
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
                    maxLength={1000}
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
                     <Image src="/google-meet.svg" alt="Google Meet" width={18} height={18} />
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
                     <Image src="/ms-teams.svg" alt="Microsoft Teams" width={18} height={18} />
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
                      {profileStatus !== "Approved" 
                        ? "Hồ sơ của bạn chưa được Admin phê duyệt. Tính năng nhận yêu cầu đang bị khóa." 
                        : "Khi bật, Startup có thể tìm thấy bạn và gửi yêu cầu đặt lịch tư vấn trực tiếp."}
                    </p>
                  </div>

                  {/* Custom Toggle Switch */}
                  <button
                    type="button"
                    disabled={profileStatus !== "Approved" || isTogglingAvail}
                    onClick={handleToggleAvailability}
                    className={cn(
                      "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#eec54e] focus:ring-offset-2",
                      profileStatus !== "Approved" ? "bg-slate-300 opacity-50 cursor-not-allowed" : (form.isBookable ? "bg-[#eec54e]" : "bg-slate-200")
                    )}
                  >
                    {isTogglingAvail ? (
                      <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white z-10" />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        form.isBookable ? "translate-x-5" : "translate-x-0",
                        isTogglingAvail && "opacity-0"
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
                        type="text"
                        value={form.hourlyRate ? form.hourlyRate.toLocaleString("vi-VN") : ""}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setForm(p => ({ ...p, hourlyRate: raw === "" ? null : parseInt(raw, 10) }));
                        }}
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
                        const selected = form.supportedDurations.some(v => Number(v) === d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              if (selected && form.supportedDurations.length === 1) {
                                toast.error("Vui lòng chọn ít nhất 1 thời lượng hỗ trợ!");
                                return;
                              }
                              setForm(p => {
                                const newDurations = selected
                                  ? p.supportedDurations.filter(v => Number(v) !== d)
                                  : [...p.supportedDurations, d];
                                return {
                                  ...p,
                                  supportedDurations: Array.from(new Set(newDurations.map((v: any) => Number(v))) as Set<number>).sort((a: number, b: number) => a - b)
                                };
                              });
                            }}
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
                type="button"
                onClick={(e) => { e.preventDefault(); router.push("/advisor/profile"); }}
                className="px-5 h-10 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (isSaving) return;
                  const target = e.currentTarget;
                  setTimeout(() => target.blur(), 0);
                  handleSave(); 
                }}
                className={cn("bg-[#0f172a] text-white text-[13px] font-bold px-6 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2", isSaving && "opacity-50 cursor-not-allowed pointer-events-none")}
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
                  type="button"
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
                  type="button"
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
          </>
        )}
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
              <button
                type="button" 
                onClick={() => { setShowPwDialog(false); setPwError(""); setPwForm({ old: "", next: "", confirm: "" }); }}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-all">
                Hủy
              </button>
              <button
                type="button"
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

export default function AdvisorProfileClient({ initialEditing }: { initialEditing?: boolean } = {}) {
  return (
    <Suspense>
      <AdvisorProfileClientInner initialEditing={initialEditing} />
    </Suspense>
  );
}
