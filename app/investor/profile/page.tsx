"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InvestorShell } from "@/components/investor/investor-shell";
import {
  Globe,
  ExternalLink,
  Pencil,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Sparkles,
  Users,
  Loader2,
  Link2,
  BadgeCheck,
  Wifi,
  Target,
  BarChart3,
  Search,
  FileText,
  ChevronRight,
  Info,
} from "lucide-react";
import { GetInvestorProfile } from "@/services/investor/investor.api";

/* ════════════════════════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════════════════════════ */
type KycStatus = "NotSubmitted" | "Pending" | "Approved" | "Rejected";
type VerificationLabel =
  | "Verified Investor Entity"
  | "Verified Angel Investor"
  | "Basic Verified"
  | "Pending More Info"
  | "Verification Failed";

/* ════════════════════════════════════════════════════════════════════
   Mock enrichment data (fields not yet returned by the profile API)
   ════════════════════════════════════════════════════════════════════ */
const MOCK_ENRICHMENT = {
  investorType: "Venture Capital",
  organization: "Mekong Capital",
  acceptingConnections: true,
  recentlyActive: true,
  preferredIndustries: ["AI & Machine Learning", "FinTech", "HealthTech", "SaaS"],
  preferredStages: ["Seed", "Series A"],
  preferredGeographies: ["Vietnam", "Southeast Asia"],
  preferredMarketScope: ["B2B", "B2B2C"],
  supportOffered: ["Strategic Mentorship", "Network Access", "Follow-on Funding"],
  preferredProductMaturity: "MVP to Growth",
  preferredValidationLevel: "Market-validated with early revenue",
  preferredAiScoreMin: 65,
  preferredAiScoreMax: 100,
  aiScoreImportance: "High",
  preferredStrengths: ["Strong Technical Team", "Clear Market Differentiation", "Scalable Business Model"],
  // KYC
  kycStatus: "Pending" as KycStatus,
  kycRejectionReason: null as string | null,
  verificationLabel: "Basic Verified" as VerificationLabel,
  lastUpdated: "2026-03-14T09:30:00Z",
};

/* ════════════════════════════════════════════════════════════════════
   Completion groups
   ════════════════════════════════════════════════════════════════════ */
function calcCompleteness(profile: IInvestorProfile | null) {
  if (!profile) return { pct: 0, groups: [] };
  const groups = [
    {
      label: "Thông tin cơ bản",
      icon: Users,
      items: [
        { label: "Họ và tên", done: !!profile.fullName },
        { label: "Chức danh / Vai trò", done: !!profile.title },
        { label: "Tổ chức", done: !!profile.firmName },
        { label: "Vị trí", done: !!profile.location },
        { label: "Ảnh hồ sơ", done: !!profile.profilePhotoURL },
      ],
    },
    {
      label: "Luận điểm đầu tư",
      icon: Target,
      items: [
        { label: "Luận điểm đầu tư", done: !!profile.investmentThesis },
        { label: "Giới thiệu bản thân", done: !!profile.bio },
        { label: "Website", done: !!profile.website },
        { label: "LinkedIn", done: !!profile.linkedInURL },
      ],
    },
    {
      label: "Sở thích Matching",
      icon: Sparkles,
      items: [
        { label: "Lĩnh vực ưu tiên", done: MOCK_ENRICHMENT.preferredIndustries.length > 0 },
        { label: "Giai đoạn ưu tiên", done: MOCK_ENRICHMENT.preferredStages.length > 0 },
        { label: "Khoảng điểm AI", done: true },
      ],
    },
    {
      label: "Xác minh / KYC",
      icon: Shield,
      items: [
        { label: "Đã nộp KYC", done: MOCK_ENRICHMENT.kycStatus !== "NotSubmitted" },
        { label: "KYC được phê duyệt", done: MOCK_ENRICHMENT.kycStatus === "Approved" },
      ],
    },
  ];
  const allItems = groups.flatMap((g) => g.items);
  const doneCount = allItems.filter((i) => i.done).length;
  const pct = Math.round((doneCount / allItems.length) * 100);
  return { pct, groups };
}

/* ════════════════════════════════════════════════════════════════════
   KYC config
   ════════════════════════════════════════════════════════════════════ */
const KYC_CONFIG: Record<KycStatus, {
  label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }>;
  helper: string; ctaLabel: string; ctaStyle: string;
}> = {
  NotSubmitted: {
    label: "Chưa nộp", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200",
    icon: FileText, helper: "Nộp KYC để mở khóa xác minh đầy đủ và xây dựng uy tín với startup.",
    ctaLabel: "Nộp hồ sơ KYC", ctaStyle: "bg-[#0f172a] text-white hover:bg-[#1e293b]",
  },
  Pending: {
    label: "Đang xem xét", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100",
    icon: Clock, helper: "Tài liệu của bạn đang được đội tuân thủ xem xét. Thường mất 2–5 ngày làm việc.",
    ctaLabel: "Xem trạng thái KYC", ctaStyle: "bg-amber-600 text-white hover:bg-amber-700",
  },
  Approved: {
    label: "Đã phê duyệt", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
    icon: CheckCircle2, helper: "Danh tính của bạn đã được xác minh. Hồ sơ của bạn hiện hiển thị huy hiệu Đã xác minh.",
    ctaLabel: "Xem hồ sơ KYC", ctaStyle: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  Rejected: {
    label: "Bị từ chối", color: "text-red-600", bg: "bg-red-50", border: "border-red-100",
    icon: XCircle, helper: "Hồ sơ KYC của bạn không được chấp thuận. Vui lòng xem lý do và nộp lại.",
    ctaLabel: "Nộp lại KYC", ctaStyle: "bg-red-600 text-white hover:bg-red-700",
  },
};

const VERIFICATION_CONFIG: Record<VerificationLabel, { color: string; bg: string; border: string }> = {
  "Verified Investor Entity":  { color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200/60" },
  "Verified Angel Investor":  { color: "text-sky-700",     bg: "bg-sky-50",      border: "border-sky-200/60" },
  "Basic Verified":           { color: "text-slate-600",   bg: "bg-slate-100",   border: "border-slate-200" },
  "Pending More Info":        { color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200/60" },
  "Verification Failed":      { color: "text-red-700",     bg: "bg-red-50",      border: "border-red-200/60" },
};

/* ════════════════════════════════════════════════════════════════════
   Reusable tiny components
   ════════════════════════════════════════════════════════════════════ */
function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          <Icon className="w-[17px] h-[17px] text-slate-500" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-[#0f172a] tracking-[-0.01em]">{title}</h2>
          {subtitle && <p className="text-[12px] text-slate-400 font-normal mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function InfoRow({ label, value, className = "" }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em]">{label}</span>
      <span className="text-[14px] text-slate-700 font-normal">{value || <span className="text-slate-300 italic">Chưa cung cấp</span>}</span>
    </div>
  );
}

function PillGroup({ items, style = "default" }: {
  items: string[];
  style?: "default" | "stage" | "soft";
}) {
  const styleMap = {
    default: "bg-slate-50 text-slate-600 border-slate-100",
    stage:   "bg-emerald-50 text-emerald-700 border-emerald-100/70",
    soft:    "bg-slate-50 text-slate-500 border-slate-100 font-normal",
  };
  if (!items.length) return <span className="text-[13px] text-slate-300 italic">Chưa xác định</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={`inline-flex items-center px-2.5 py-[3px] rounded-md text-[12px] font-medium border ${styleMap[style]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function ThesisRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] mb-2">{label}</p>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════════════ */
export default function InvestorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<IInvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = (await GetInvestorProfile()) as unknown as IBackendRes<IInvestorProfile>;
        if (res.success && res.data) setProfile(res.data);
        else setProfile(null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const e = MOCK_ENRICHMENT;
  const kycCfg = KYC_CONFIG[e.kycStatus];
  const KycIcon = kycCfg.icon;
  const verCfg = VERIFICATION_CONFIG[e.verificationLabel];
  const { pct: completePct, groups: completeGroups } = calcCompleteness(profile);

  const displayName  = profile?.fullName  || profile?.firmName  || "—";
  const initials     = displayName !== "—" ? displayName.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase() : "IN";
  const lastUpdated  = e.lastUpdated ? new Date(e.lastUpdated).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" }) : null;

  if (loading) {
    return (
      <InvestorShell>
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin mb-3" />
          <p className="text-[14px]">Đang tải hồ sơ...</p>
        </div>
      </InvestorShell>
    );
  }

  return (
    <InvestorShell>
      <div className="space-y-7">

        {/* ─── Incomplete banner ─── */}
        {completePct < 80 && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-50 border border-amber-100">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-amber-800">Hồ sơ của bạn hoàn thiện {completePct}%</p>
              <p className="text-[12px] text-amber-600 font-normal mt-0.5">
                Hồ sơ đầy đủ giúp cải thiện chất lượng matching và tăng uy tín với startup. Bổ sung thông tin còn thiếu để nhận gợi ý tốt hơn.
              </p>
            </div>
            <button
              onClick={() => router.push("/investor/profile/edit")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0"
            >
              Hoàn thiện ngay
            </button>
          </div>
        )}

        {/* ─── Page Header ─── */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-[-0.025em] leading-tight">
              Hồ sơ Nhà đầu tư
            </h1>
            <p className="text-[14px] text-slate-400 mt-1.5 font-normal">
              Quản lý danh tính, luận điểm đầu tư và sở thích matching của bạn
              {lastUpdated && (
                <span className="ml-2 text-slate-300">· Cập nhật {lastUpdated}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/investor/profile")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all"
            >
              <Eye className="w-4 h-4" />
              Xem hồ sơ công khai
            </button>
            <button
              onClick={() => router.push("/investor/profile/edit")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] shadow-sm transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>

        {/* ─── Main 2-column layout ─── */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* ════════════════════════════════════
              LEFT COLUMN — main content
              ════════════════════════════════════ */}
          <div className="col-span-12 lg:col-span-8 space-y-5">

            {/* ── SECTION 1: Identity ── */}
            <SectionCard>
              {/* Hero banner */}
              <div className="h-20 rounded-t-2xl bg-gradient-to-r from-slate-50 via-slate-100/40 to-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:28px_28px]" />
              </div>

              <div className="px-6 pb-6 -mt-9 relative">
                <div className="flex items-end gap-4 mb-5">
                  {/* Avatar */}
                  {profile?.profilePhotoURL ? (
                    <img src={profile.profilePhotoURL} alt={displayName} className="w-[72px] h-[72px] rounded-2xl object-cover border-[3px] border-white shadow-md" />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-2xl bg-slate-100 border-[3px] border-white shadow-md flex items-center justify-center">
                      <span className="text-slate-500 font-semibold text-[22px] tracking-tight">{initials}</span>
                    </div>
                  )}

                  <div className="flex-1 pb-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h2 className="text-[20px] font-semibold text-[#0f172a] tracking-[-0.02em] leading-tight truncate">
                        {displayName}
                      </h2>
                      {/* Verification label */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-lg text-[11px] font-semibold border ${verCfg.color} ${verCfg.bg} ${verCfg.border}`}>
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {e.verificationLabel}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[13px] text-slate-500 font-normal">
                      {(profile?.title || e.investorType) && (
                        <span>{profile?.title || e.investorType}</span>
                      )}
                      {profile?.firmName && (
                        <><span className="text-slate-200">·</span><span className="font-medium text-slate-700">{profile.firmName}</span></>
                      )}
                      {!profile?.firmName && e.organization && (
                        <><span className="text-slate-200">·</span><span>{e.organization}</span></>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status chips */}
                <div className="flex items-center flex-wrap gap-2 mb-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                    e.acceptingConnections
                      ? "text-emerald-700 bg-emerald-50 border-emerald-100/70"
                      : "text-slate-500 bg-slate-50 border-slate-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${e.acceptingConnections ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {e.acceptingConnections ? "Đang nhận kết nối" : "Không nhận kết nối"}
                  </span>
                  {e.recentlyActive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border text-sky-700 bg-sky-50 border-sky-100/70">
                      <Wifi className="w-3 h-3" />
                      Hoạt động gần đây
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border text-slate-500 bg-slate-50 border-slate-200">
                    {e.investorType}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-5">
                  <InfoRow label="Vị trí" value={profile?.location ? `${profile.location}${profile.country ? `, ${profile.country}` : ""}` : null} />
                  <InfoRow label="Tổ chức" value={profile?.firmName || e.organization} />
                  <InfoRow label="Chức danh" value={profile?.title || e.investorType} />
                  <InfoRow label="Loại nhà đầu tư" value={e.investorType} />
                </div>

                {/* External links */}
                <div className="flex flex-wrap items-center gap-3">
                  {profile?.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:text-slate-800 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      {profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      <ExternalLink className="w-3 h-3 text-slate-300" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-normal text-slate-300 bg-slate-50 border border-slate-100 border-dashed">
                      <Globe className="w-3.5 h-3.5" />
                      Chưa có website
                    </span>
                  )}
                  {profile?.linkedInURL && (
                    <a
                      href={profile.linkedInURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-sky-600 bg-sky-50 border border-sky-100/70 hover:bg-sky-100/50 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      LinkedIn
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  )}
                </div>

                {/* Bio */}
                {profile?.bio && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] mb-2">Giới thiệu</p>
                    <p className="text-[14px] text-slate-600 leading-[1.7] font-normal">{profile.bio}</p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* ── SECTION 2: Public Investment Thesis ── */}
            <SectionCard>
              <SectionHeader
                icon={Target}
                title="Luận điểm đầu tư (Công khai)"
                subtitle="Hiển thị với startup trên nền tảng"
                action={
                  <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md bg-emerald-50 text-[10px] font-semibold text-emerald-600 border border-emerald-100/60 uppercase tracking-[0.04em]">
                    <Eye className="w-3 h-3" />
                    Công khai
                  </span>
                }
              />
              <div className="px-6 py-5 space-y-5">
                {/* Thesis summary */}
                {profile?.investmentThesis ? (
                  <div className="bg-slate-50/60 rounded-xl px-5 py-4 border border-slate-100/60">
                    <p className="text-[13px] text-slate-600 leading-[1.75] font-normal italic">
                      "{profile.investmentThesis}"
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50/40 rounded-xl px-5 py-4 border border-dashed border-slate-200">
                    <p className="text-[13px] text-slate-300 italic">Chưa có luận điểm đầu tư.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <ThesisRow label="Lĩnh vực ưu tiên">
                    <PillGroup items={e.preferredIndustries} />
                  </ThesisRow>
                  <ThesisRow label="Giai đoạn ưu tiên">
                    <PillGroup items={e.preferredStages} style="stage" />
                  </ThesisRow>
                  <div className="grid grid-cols-2 gap-4">
                    <ThesisRow label="Khu vực địa lý">
                      <PillGroup items={e.preferredGeographies} style="soft" />
                    </ThesisRow>
                    <ThesisRow label="Phạm vi thị trường">
                      <PillGroup items={e.preferredMarketScope} style="soft" />
                    </ThesisRow>
                  </div>
                  <ThesisRow label="Hỗ trợ cung cấp">
                    <PillGroup items={e.supportOffered} />
                  </ThesisRow>
                </div>
              </div>
            </SectionCard>

            {/* ── SECTION 3: Matching Preferences ── */}
            <SectionCard>
              <SectionHeader
                icon={Sparkles}
                title="Sở thích Matching"
                subtitle="Dùng bởi AI engine AISEP — không hiển thị trên hồ sơ công khai"
                action={
                  <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md bg-[#0f172a] text-[10px] font-semibold text-[#e6cc4c] uppercase tracking-[0.04em]">
                    Hệ thống AI
                  </span>
                }
              />
              <div className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] mb-1.5">Độ trưởng thành SP</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-[12px] font-medium text-violet-600 border border-violet-100/70">
                      {e.preferredProductMaturity}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] mb-1.5">Mức xác thực</p>
                    <p className="text-[13px] text-slate-700 font-normal">{e.preferredValidationLevel}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] mb-1.5">Khoảng điểm AI</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0f172a]">
                        <Sparkles className="w-3.5 h-3.5 text-[#e6cc4c]" />
                        {e.preferredAiScoreMin} – {e.preferredAiScoreMax}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#e6cc4c]"
                          style={{
                            marginLeft: `${e.preferredAiScoreMin}%`,
                            width: `${e.preferredAiScoreMax - e.preferredAiScoreMin}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] mb-1.5">Tầm quan trọng AI</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold border ${
                      e.aiScoreImportance === "High"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-100/70"
                        : e.aiScoreImportance === "Medium"
                        ? "text-amber-700 bg-amber-50 border-amber-100/70"
                        : "text-slate-500 bg-slate-50 border-slate-200"
                    }`}>
                      {e.aiScoreImportance === "High" ? "Quan trọng cao" : e.aiScoreImportance === "Medium" ? "Quan trọng trung bình" : "Quan trọng thấp"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.04em] mb-2">Điểm mạnh startup ưu tiên</p>
                  <PillGroup items={e.preferredStrengths} />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ════════════════════════════════════
              RIGHT COLUMN — status & actions
              ════════════════════════════════════ */}
          <div className="col-span-12 lg:col-span-4 space-y-4">

            {/* ── SECTION 4: Verification & KYC ── */}
            <SectionCard>
              <div className="px-5 pt-5 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#0f172a] flex items-center justify-center shrink-0">
                    <Shield className="w-[17px] h-[17px] text-[#e6cc4c]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#0f172a] tracking-[-0.01em]">Tin cậy & Xác minh</h3>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Trạng thái danh tính và KYC</p>
                  </div>
                </div>

                {/* Verification label */}
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.05em] mb-2">Nhãn xác minh</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${verCfg.color} ${verCfg.bg} ${verCfg.border}`}>
                    <BadgeCheck className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-semibold">{e.verificationLabel}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 -mx-5 mb-4" />

                {/* KYC status */}
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.05em] mb-2">Trạng thái KYC</p>
                <div className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border ${kycCfg.bg} ${kycCfg.border} mb-3`}>
                  <KycIcon className={`w-4 h-4 shrink-0 ${kycCfg.color}`} />
                  <span className={`text-[13px] font-semibold ${kycCfg.color}`}>{kycCfg.label}</span>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed font-normal mb-4">{kycCfg.helper}</p>

                {/* Rejection reason */}
                {e.kycStatus === "Rejected" && e.kycRejectionReason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 mb-4">
                    <p className="text-[11px] font-semibold text-red-600 uppercase tracking-[0.04em] mb-1">Lý do từ chối</p>
                    <p className="text-[12px] text-red-700 font-normal">{e.kycRejectionReason}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-4">
                <button className={`w-full h-9 rounded-xl text-[13px] font-semibold transition-colors ${kycCfg.ctaStyle}`}>
                  {kycCfg.ctaLabel}
                </button>
              </div>
            </SectionCard>

            {/* ── SECTION 5: Profile Completeness ── */}
            <SectionCard>
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-[17px] h-[17px] text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#0f172a] tracking-[-0.01em]">Độ hoàn thiện hồ sơ</h3>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Cải thiện chất lượng gợi ý</p>
                  </div>
                </div>

                {/* Overall progress */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-slate-500 font-medium">Tổng thể</span>
                  <span className="text-[13px] font-semibold text-[#0f172a]">{completePct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 mb-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      completePct >= 80 ? "bg-emerald-400" :
                      completePct >= 50 ? "bg-[#e6cc4c]" :
                      "bg-rose-400"
                    }`}
                    style={{ width: `${completePct}%` }}
                  />
                </div>

                {/* Per-group progress */}
                <div className="space-y-3">
                  {completeGroups.map((group) => {
                    const done = group.items.filter((i) => i.done).length;
                    const total = group.items.length;
                    const groupPct = Math.round((done / total) * 100);
                    const GroupIcon = group.icon;
                    const missing = group.items.filter((i) => !i.done);
                    return (
                      <div key={group.label} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <GroupIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[12px] font-medium text-slate-600">{group.label}</span>
                          </div>
                          <span className={`text-[11px] font-semibold ${
                            groupPct === 100 ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {groupPct === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" /> : `${done}/${total}`}
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${groupPct === 100 ? "bg-emerald-400" : "bg-slate-300"}`}
                            style={{ width: `${groupPct}%` }}
                          />
                        </div>
                        {missing.length > 0 && (
                          <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                            Còn thiếu: {missing.map((m) => m.label).join(", ")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {completePct < 100 && (
                  <button
                    onClick={() => router.push("/investor/profile/edit")}
                    className="w-full mt-5 h-9 rounded-xl text-[13px] font-semibold text-[#0f172a] bg-[#e6cc4c] hover:bg-[#d4b84a] transition-colors"
                  >
                    Hoàn thiện hồ sơ
                  </button>
                )}
              </div>
            </SectionCard>

            {/* ── SECTION 6: Quick Actions ── */}
            <SectionCard>
              <div className="px-5 pt-5 pb-5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.05em] mb-3">Thao tác nhanh</p>
                <div className="space-y-1">
                  {[
                    { label: "Chỉnh sửa hồ sơ",        icon: Pencil,     href: "/investor/profile/edit" },
                    { label: "Xem hồ sơ công khai",      icon: Eye,        href: "/investor/profile" },
                    { label: "Xem trạng thái KYC",       icon: Shield,     href: "/investor/profile" },
                    { label: "Khám phá Startup",          icon: Search,     href: "/investor/startups" },
                    { label: "Xem gợi ý AI",              icon: Sparkles,   href: "/investor/recommendations" },
                  ].map(({ label, icon: Icon, href }) => (
                    <button
                      key={label}
                      onClick={() => router.push(href)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors group"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        {label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* ── SECTION 7: Trust / Platform Note ── */}
            <div className="bg-slate-900/[0.03] rounded-2xl border border-slate-200/60 px-5 py-4 space-y-2.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.05em]">Về hồ sơ của bạn</p>
              {[
                "Hồ sơ đầy đủ giúp AI matching với startup tốt hơn.",
                "Xác minh danh tính giúp tăng uy tín với founders khi họ xem hồ sơ của bạn.",
                "Sở thích matching chỉ được dùng bởi engine gợi ý — không hiển thị với startup.",
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-slate-400 mt-[6px] shrink-0" />
                  <p className="text-[12px] text-slate-500 font-normal leading-[1.6]">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InvestorShell>
  );
}
