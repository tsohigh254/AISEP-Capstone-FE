"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  ApproveStartupRegistration, ApproveAdvisorRegistration, ApproveInvestorRegistration,
  RejectStartupRegistration, RejectAdvisorRegistration, RejectInvestorRegistration,
  GetPendingStartupKycById, GetPendingAdvisorById, GetPendingInvestorKycById,
  GetKYCCaseHistory,
  type KycCaseHistoryEntryDto,
} from "@/services/staff/registration.api";
import axios from "@/services/interceptor";
import { useAuth } from "@/context/context";
import { getIndustryName, getInvestorPreferredStageLabel } from "@/lib/investor-preferred-stages";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  Info,
  ChevronRight,
  Eye,
  MessageSquare,
  MoreVertical,
  Plus,
  Zap,
  Building2,
  User,
  GraduationCap,
  ShieldAlert,
  X,
  Star,
  Briefcase,
  Globe,
  BadgeCheck,
  Sparkles,
  CreditCard,
  Linkedin,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Target,
  TrendingUp,
  DollarSign,
  Layers,
  Users,
} from "lucide-react";
import Link from "next/link";
import { StaffAdvisorProfileDrawerView } from "@/components/staff/staff-advisor-profile-drawer-view";
import { StaffInvestorProfileDrawerView } from "@/components/staff/staff-investor-profile-drawer-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  KYCSubtype,
  AssessmentValue,
  KYC_SUBTYPE_CONFIGS,
  ASSESSMENT_LABELS,
  getSuggestedResult,
  SCORE_MAP,
  HARD_FAIL_VALUES,
  APPROVAL_THRESHOLDS,
} from "@/types/staff-kyc";
import type { IAdvisorDetail } from "@/types/startup-mentorship";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetAdvisorById } from "@/services/startup/startup-mentorship.api";
import { GetStartupById } from "@/services/investor/investor.api";
import { GetInvestorById } from "@/services/startup/startup.api";

// --- Types ---
type KYCStatus = "PENDING" | "IN_REVIEW" | "PENDING_MORE_INFO" | "APPROVED" | "REJECTED" | "FAILED";
type PreviewDocument = {
  url: string;
  name: string;
  fileType?: string | null;
};

// --- Helper Functions ---
const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUS_CFG: Record<KYCStatus | "FAILED", { label: string, badge: string, dot: string }> = {
  PENDING: { label: "Chờ xử lý", badge: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-400" },
  IN_REVIEW: { label: "Đang soát xét", badge: "bg-blue-50 text-blue-700 border-blue-200/80", dot: "bg-blue-400" },
  PENDING_MORE_INFO: { label: "Chờ bổ sung", badge: "bg-purple-50 text-purple-700 border-purple-200/80", dot: "bg-purple-400" },
  APPROVED: { label: "Đã duyệt", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-400" },
  REJECTED: { label: "Từ chối", badge: "bg-red-50 text-red-700 border-red-200/80", dot: "bg-red-400" },
  FAILED: { label: "Thẩm định thất bại", badge: "bg-red-50 text-red-700 border-red-200/80", dot: "bg-red-400" },
};

function normalizeDetailStatus(value: unknown): KYCStatus | "FAILED" {
  const raw = String(value || "").toUpperCase();
  if (["UNDER_REVIEW", "IN_REVIEW", "PENDING_REVIEW", "PENDINGKYC", "PENDING"].includes(raw)) return "IN_REVIEW";
  if (raw === "PENDING_MORE_INFO") return "PENDING_MORE_INFO";
  if (["APPROVED", "VERIFIED"].includes(raw)) return "APPROVED";
  if (raw === "REJECTED") return "REJECTED";
  if (["FAILED", "VERIFICATION_FAILED"].includes(raw)) return "FAILED";
  return "IN_REVIEW";
}

function getOpenableUrl(value?: string | null) {
  return value && /^https?:\/\//i.test(value) ? value : "";
}

function getExternalLink(value?: string | null) {
  if (!value || value === "—") return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function createPendingTab() {
  const popup = window.open("about:blank", "_blank");
  if (popup) {
    popup.opener = null;
  }
  return popup;
}

function openUrlInNewTab(url: string, popup?: Window | null) {
  if (popup && !popup.closed) {
    try {
      popup.location.replace(url);
      popup.focus?.();
      return;
    } catch {
      popup.close();
    }
  }
  const nextPopup = window.open(url, "_blank");
  if (nextPopup) {
    nextPopup.opener = null;
  }
}

async function getUrlStatus(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.status;
  } catch {
    return null;
  }
}

function getFileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const decoded = decodeURIComponent(pathname.split("/").pop() || "");
    return decoded || "tai-lieu";
  } catch {
    return "tai-lieu";
  }
}

function getPreviewDocument(data: any, entityId: string): PreviewDocument | null {
  if (!data) return null;

  if (entityId.startsWith("STARTUP-")) {
    const evidenceFiles = data.submissionSummary?.evidenceFiles || [];
    const file = evidenceFiles[0];
    const url = getOpenableUrl(file?.url);
    if (!url) return null;
    return {
      url,
      name: file?.fileName || getFileNameFromUrl(url),
      fileType: file?.fileType || null,
    };
  }

  if (entityId.startsWith("ADVISOR-")) {
    const evidenceFiles = data.submissionSummary?.evidenceFiles || [];
    const file = evidenceFiles[0];
    const url = getOpenableUrl(file?.url);
    if (!url) return null;
    return {
      url,
      name: file?.fileName || getFileNameFromUrl(url),
      fileType: file?.fileType || null,
    };
  }

  const fallbackUrl = getOpenableUrl(
    data?.idProofFileURL ||
    data?.investmentProofFileURL ||
    data?.proofFile ||
    data?.fileCertificateBusiness
  );

  if (!fallbackUrl) return null;

  return {
    url: fallbackUrl,
    name: getFileNameFromUrl(fallbackUrl),
    fileType: null,
  };
}

// --- Subtype Resolver ---
const getSubtypeById = (id: string): KYCSubtype => {
  if (id.startsWith("ADVISOR-")) return "ADVISOR";
  if (id.startsWith("INVESTOR-")) return "INDIVIDUAL_INVESTOR";
  if (id.endsWith("002")) return "STARTUP_NO_ENTITY";
  if (id.endsWith("003")) return "INSTITUTIONAL_INVESTOR";
  if (id.endsWith("004")) return "INDIVIDUAL_INVESTOR";
  if (id.endsWith("005")) return "ADVISOR";
  return "STARTUP_ENTITY";
};

// --- History Tab ---
const ACTION_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  APPROVED:            { label: "Đã duyệt",         dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  REJECTED:            { label: "Từ chối",           dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200/80" },
  REQUESTED_MORE_INFO: { label: "Yêu cầu bổ sung",  dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
  UNDER_REVIEW:        { label: "Đang soát xét",    dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200/80" },
  SUPERSEDED:          { label: "Đã thay thế",      dot: "bg-slate-300",   badge: "bg-slate-50 text-slate-500 border-slate-200/80" },
};

const RESULT_LABEL_MAP: Record<string, string> = {
  VERIFIED_COMPANY: "Doanh nghiệp đã xác minh",
  VERIFIED_FOUNDING_TEAM: "Đội ngũ sáng lập đã xác minh",
  VERIFIED_ADVISOR: "Advisor đã xác minh",
  VERIFIED_INVESTOR: "Nhà đầu tư đã xác minh",
  BASIC_VERIFIED: "Xác minh cơ bản",
  PENDING_MORE_INFO: "Cần bổ sung thông tin",
  VERIFICATION_FAILED: "Xác minh thất bại",
  REJECTED: "Từ chối",
  NONE: "",
};

function getResultLabelText(value?: string | null) {
  if (!value) return "";
  return RESULT_LABEL_MAP[value] ?? value;
}

function formatHistoryDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function HistoryTab({ entityId, entityType }: {
  entityId: number;
  entityType: "STARTUP" | "ADVISOR" | "INVESTOR";
}) {
  const { data, isLoading } = useQuery<KycCaseHistoryEntryDto[]>({
    queryKey: ["kyc-case-history", entityId, entityType],
    queryFn: async () => {
      const res = await GetKYCCaseHistory(entityId, entityType);
      const envelope = res as unknown as IBackendRes<KycCaseHistoryEntryDto[]>;
      return envelope.data ?? [];
    },
    enabled: !isNaN(entityId),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-4 border-[#eec54e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto">
          <History className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-[14px] font-semibold text-slate-500">Chưa có lịch sử xử lý</p>
        <p className="text-[12px] text-slate-400">MSG143 — Hồ sơ này chưa từng được review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-6">
      <h2 className="text-[13px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <History className="w-4 h-4 text-slate-400" />
        Lịch sử xử lý
        <span className="ml-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-bold">
          {data.length}
        </span>
      </h2>

      <div className="relative">
        {data.map((entry, idx) => {
          const isLast = idx === data.length - 1;
          const cfg = ACTION_CFG[entry.action] ?? ACTION_CFG.UNDER_REVIEW;
          const resultLabelText = getResultLabelText(entry.resultLabel);
          return (
            <div key={idx} className="flex gap-4 pb-6 last:pb-0">
              {/* Spine */}
              <div className="flex flex-col items-center pt-1 shrink-0">
                <div className={cn("w-3 h-3 rounded-full z-10 ring-2 ring-white", cfg.dot)} />
                {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
                    {cfg.label}
                  </span>
                  {entry.version > 0 && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      v{entry.version}
                    </span>
                  )}
                  {resultLabelText && (
                    <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                      {resultLabelText}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[12px] text-slate-500 mb-2">
                  {entry.submittedAt && (
                    <span>
                      <span className="font-medium text-slate-400">Nộp hồ sơ:</span>{" "}
                      {formatHistoryDate(entry.submittedAt)}
                    </span>
                  )}
                  {entry.reviewedAt && (
                    <span>
                      <span className="font-medium text-slate-400">Review:</span>{" "}
                      {formatHistoryDate(entry.reviewedAt)}
                    </span>
                  )}
                  {entry.reviewedByEmail && (
                    <span className="sm:col-span-2">
                      <span className="font-medium text-slate-400">Staff:</span>{" "}
                      {entry.reviewedByEmail}
                    </span>
                  )}
                  {entry.requiresNewEvidence && (
                    <span className="sm:col-span-2 text-amber-600 font-medium">
                      ⚠ Yêu cầu nộp lại tài liệu minh chứng
                    </span>
                  )}
                </div>

                {entry.remarks && (
                  <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                      Nhận xét / Ghi chú
                    </p>
                    <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {entry.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Profile Drawer ─────────────────────────────────────────── */

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

const STAGE_LABEL: Record<string, string> = {
  "0": "Idea", "1": "Pre-seed", "2": "Seed",
  "3": "Series A", "4": "Series B", "5": "Series C", "6": "Growth",
  Idea: "Idea", PreSeed: "Pre-seed", Seed: "Seed",
  SeriesA: "Series A", SeriesB: "Series B", SeriesC: "Series C", Growth: "Growth",
};

const STARTUP_PROFILE_TABS = ["Tổng quan", "Kinh doanh", "Gọi vốn", "Đội ngũ", "Liên hệ"] as const;
type StartupProfileTab = typeof STARTUP_PROFILE_TABS[number];

const PROFILE_STAGE_LABELS: Record<string, string> = {
  "0": "Hạt giống (Idea)", "1": "Tiền ươm mầm (Pre-Seed)", "2": "Ươm mầm (Seed)",
  "3": "Series A", "4": "Series B", "5": "Series C+", "6": "Tăng trưởng (Growth)",
  Idea: "Hạt giống (Idea)", PreSeed: "Tiền ươm mầm (Pre-Seed)", Seed: "Ươm mầm (Seed)",
  SeriesA: "Series A", SeriesB: "Series B", SeriesC: "Series C+", Growth: "Tăng trưởng (Growth)",
};

function calcAdvisorDrawerCompleteness(advisor: IAdvisorDetail) {
  const checks = [
    Boolean(advisor.fullName?.trim()),
    Boolean(advisor.title?.trim()),
    Boolean(advisor.company?.trim()),
    advisor.yearsOfExperience != null && advisor.yearsOfExperience >= 0,
    Boolean(advisor.linkedInURL?.trim()),
    Boolean(advisor.expertise?.length),
    Boolean((advisor.biography || advisor.bio)?.trim()),
    Boolean((advisor.mentorshipPhilosophy || advisor.philosophy)?.trim()),
    advisor.hourlyRate > 0,
    Boolean(advisor.supportedDurations?.length),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function ProfileDrawer({ entityId, entityType, open, onClose }: {
  entityId: number;
  entityType: "ADVISOR" | "STARTUP" | "INVESTOR";
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState<"overview" | "expertise" | "contact">("overview");
  const [startupTab, setStartupTab] = React.useState<StartupProfileTab>("Tổng quan");

  const advisorQuery = useQuery({
    queryKey: ["drawer-advisor", entityId],
    queryFn: async () => { const r = await GetAdvisorById(entityId); return (r as any)?.data ?? r; },
    enabled: open && entityType === "ADVISOR",
  });

  const startupQuery = useQuery({
    queryKey: ["drawer-startup", entityId],
    queryFn: async () => { const r = await GetStartupById(entityId); return (r as any)?.data ?? r; },
    enabled: open && entityType === "STARTUP",
  });

  const investorQuery = useQuery({
    queryKey: ["drawer-investor", entityId],
    queryFn: async () => { const r = await GetInvestorById(entityId); return (r as any)?.data ?? r; },
    enabled: open && entityType === "INVESTOR",
  });

  const isLoading = advisorQuery.isLoading || startupQuery.isLoading || investorQuery.isLoading;
  const advisor = advisorQuery.data;
  const startup = startupQuery.data;
  const investor = investorQuery.data;

  // Reset tab when entity changes
  React.useEffect(() => {
    setStartupTab("Tổng quan");
  }, [entityId, entityType]);

  const drawerTitle = entityType === "ADVISOR" ? "Hồ sơ Advisor"
    : entityType === "STARTUP" ? "Hồ sơ Startup"
    : "Hồ sơ Investor";

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      {/* Full-screen modal panel */}
      <div className={cn(
        "fixed inset-0 z-[60] flex flex-col bg-white transition-all duration-300",
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {/* Floating close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Body — no dialog header, starts directly with content */}
        <div className={cn("flex-1 min-h-0", entityType === "STARTUP" && startup ? "flex flex-col overflow-hidden" : "overflow-y-auto")}>
          {isLoading && (
            <div className="flex items-center justify-center h-40">
              <p className="text-[13px] text-slate-400">Đang tải...</p>
            </div>
          )}

          {!isLoading && !advisor && !startup && !investor && (
            <div className="flex flex-col items-center justify-center gap-2 h-40 text-center px-6">
              <p className="text-[14px] font-semibold text-slate-700">Chưa có hồ sơ</p>
              <p className="text-[12px] text-slate-400">Người dùng chưa tạo hồ sơ hoặc xảy ra lỗi.</p>
            </div>
          )}

          {/* ── ADVISOR ── */}
          {entityType === "ADVISOR" && advisor && (
            <StaffAdvisorProfileDrawerView advisor={advisor} />
          )}

          {false && entityType === "ADVISOR" && advisor && (() => {
            const expertise: string[] = advisor.expertise ?? [];
            const [primary, ...secondary] = expertise;
            const isAvailable = advisor.availabilityHint === "Available";
            return (
              <div className="p-6 space-y-5">
                {/* Hero */}
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center text-white font-bold text-[18px] shrink-0",
                    !advisor.profilePhotoURL && "bg-gradient-to-br from-amber-400 to-amber-600"
                  )}>
                    {advisor.profilePhotoURL
                      ? <img src={advisor.profilePhotoURL} alt={advisor.fullName} className="w-full h-full object-cover" />
                      : <span>{advisor.fullName?.charAt(0)?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-[17px] font-bold text-slate-900">{advisor.fullName}</h2>
                      {advisor.isVerified && <BadgeCheck className="w-4 h-4 text-teal-500" />}
                    </div>
                    <p className="text-[12px] text-slate-500">{[advisor.title, advisor.company].filter(Boolean).join(" · ")}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {primary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                          <Star className="w-2.5 h-2.5" />{EXPERTISE_LABEL[primary] ?? primary}
                        </span>
                      )}
                      {secondary.map((e) => (
                        <span key={e} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-100">
                          {EXPERTISE_LABEL[e] ?? e}
                        </span>
                      ))}
                      {advisor.yearsOfExperience != null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100">
                          <Clock className="w-2.5 h-2.5" />{advisor.yearsOfExperience} năm KN
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-100">
                  {(["overview", "expertise", "contact"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={cn(
                      "px-3 py-1.5 text-[12px] font-medium rounded-t-lg transition-colors",
                      tab === t ? "bg-[#0f172a] text-white" : "text-slate-500 hover:text-slate-700"
                    )}>
                      {t === "overview" ? "Tổng quan" : t === "expertise" ? "Chuyên môn" : "Liên hệ"}
                    </button>
                  ))}
                </div>
                {tab === "overview" && (
                  <div className="space-y-4">
                    {(advisor.biography || advisor.bio) && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Giới thiệu</p>
                        <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">{advisor.biography || advisor.bio}</p>
                      </div>
                    )}
                    {(advisor.mentorshipPhilosophy || advisor.philosophy) && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Triết lý cố vấn</p>
                        <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">{advisor.mentorshipPhilosophy || advisor.philosophy}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {advisor.averageRating > 0 && (
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Đánh giá</p>
                          <p className="text-[14px] font-bold text-slate-800">{advisor.averageRating.toFixed(1)} <span className="text-[11px] font-normal text-slate-400">({advisor.reviewCount})</span></p>
                        </div>
                      )}
                      {advisor.completedSessions > 0 && (
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Phiên tư vấn</p>
                          <p className="text-[14px] font-bold text-slate-800">{advisor.completedSessions}</p>
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-3 rounded-xl text-[12px] font-medium",
                      isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                    )}>
                      <span className={cn("w-2 h-2 rounded-full", isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                      {isAvailable ? "Đang nhận mentee" : "Tạm ngưng nhận mentee"}
                    </div>
                  </div>
                )}
                {tab === "expertise" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {expertise.map((e, i) => (
                        <span key={e} className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border",
                          i === 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {i === 0 && <Star className="w-3 h-3" />}{EXPERTISE_LABEL[e] ?? e}
                          {i === 0 && <span className="text-[9px] opacity-60">(Chính)</span>}
                        </span>
                      ))}
                    </div>
                    {advisor.hourlyRate > 0 && (
                      <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-slate-700">Mức phí</span>
                          <span className="text-[15px] font-bold text-slate-900">{advisor.hourlyRate.toLocaleString("vi-VN")}đ/giờ</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {(advisor.supportedDurations ?? []).map((d: number) => {
                            const price = Math.round((advisor.hourlyRate * d) / 60);
                            return (
                              <div key={d} className="px-4 py-2.5 flex justify-between text-[12px]">
                                <span className="text-slate-500">{d} phút</span>
                                <span className="font-semibold text-slate-800">{price.toLocaleString("vi-VN")}đ</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {tab === "contact" && (
                  <div className="space-y-3">
                    {advisor.linkedInURL && (
                      <a href={advisor.linkedInURL} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[13px] text-blue-600 hover:underline">
                        <Linkedin className="w-3.5 h-3.5" />{advisor.linkedInURL}
                      </a>
                    )}
                    {!advisor.linkedInURL && <p className="text-[13px] text-slate-400">Chưa có liên kết.</p>}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── STARTUP ── */}
          {entityType === "STARTUP" && startup && (() => {
            const p = startup;
            const displayStage = PROFILE_STAGE_LABELS[String(p.stage)] ?? p.stage ?? "—";
            const displayIndustry = Array.isArray(p.industry) ? p.industry.join(", ") : (p.industry ?? p.industryName ?? "—");
            const teamMembers: any[] = Array.isArray(p.teamMembers) ? p.teamMembers : Array.isArray(p.team) ? p.team : [];
            const currentNeeds: string[] = Array.isArray(p.currentNeeds) ? p.currentNeeds : [];
            const targetFunding = Number(p.fundingAmountSought) || 0;
            const raisedAmount = Number(p.currentFundingRaised) || 0;
            const fundingProgress = targetFunding > 0 ? Math.round((raisedAmount / targetFunding) * 100) : 0;

            return (
              <div className="flex flex-col h-full">
                {/* Cover + Avatar header */}
                <div className="relative shrink-0">
                  <div className="h-40 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900" />
                  <div className="max-w-5xl mx-auto px-10">
                    <div className="flex items-end gap-5 -mt-12 pb-5">
                      <div className={cn(
                        "w-24 h-24 rounded-2xl border-4 border-white overflow-hidden flex items-center justify-center text-white font-bold text-[26px] shrink-0 shadow-lg",
                        !p.logoURL && "bg-gradient-to-br from-blue-500 to-blue-600"
                      )}>
                        {p.logoURL
                          ? <img src={p.logoURL} alt={p.companyName} className="w-full h-full object-cover" />
                          : <span>{p.companyName?.charAt(0)?.toUpperCase()}</span>}
                      </div>
                      <div className="pb-2 flex-1 min-w-0">
                        <h1 className="text-[24px] font-bold text-slate-900 leading-tight">{p.companyName}</h1>
                        {p.tagline && <p className="text-[14px] text-slate-500 mt-0.5">{p.tagline}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {displayStage !== "—" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#fdfbe9] text-[#171611] border border-[#e6cc4c]/40">
                              {displayStage}
                            </span>
                          )}
                          {displayIndustry !== "—" && (
                            <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-blue-50 text-blue-700 border border-blue-100">{displayIndustry}</span>
                          )}
                          {(p.marketScope || p.targetMarket) && (
                            <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-slate-100 text-slate-600 border border-slate-200">{p.marketScope ?? p.targetMarket}</span>
                          )}
                          {(p.location || p.country) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                              <MapPin className="w-3 h-3" />{[p.location, p.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 bg-white shrink-0">
                  <div className="max-w-5xl mx-auto px-10 flex gap-1 overflow-x-auto no-scrollbar">
                    {STARTUP_PROFILE_TABS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setStartupTab(t)}
                        className={cn(
                          "px-4 py-3.5 text-[14px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors",
                          startupTab === t ? "border-[#0f172a] text-[#0f172a]" : "border-transparent text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <div className="max-w-5xl mx-auto px-10 py-7">

                    {/* ── Tổng quan ── */}
                    {startupTab === "Tổng quan" && (
                      <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12 lg:col-span-8 space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { icon: AlertTriangle, label: "Vấn đề", text: p.problemStatement || "Chưa cập nhật", color: "text-rose-500" },
                              { icon: Lightbulb, label: "Giải pháp", text: p.solutionSummary || "Chưa cập nhật", color: "text-amber-500" },
                            ].map(({ icon: Icon, label, text, color }) => (
                              <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Icon className={cn("w-4 h-4", color)} />
                                  <h3 className="text-[13px] font-semibold text-slate-700">{label}</h3>
                                </div>
                                <p className="text-[13px] text-slate-500 leading-relaxed">{text}</p>
                              </div>
                            ))}
                          </div>
                          {(p.description || p.oneLiner) && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-2">
                              <h3 className="text-[13px] font-semibold text-slate-700">Mô tả chi tiết</h3>
                              <p className="text-[13px] text-slate-500 leading-relaxed">{p.description || p.oneLiner}</p>
                            </div>
                          )}
                          {currentNeeds.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[13px] font-semibold text-slate-700">Nhu cầu hiện tại</h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {currentNeeds.map((n: string) => (
                                  <span key={n} className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25">{n}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Thông tin nhanh</h3>
                            {[
                              { icon: Layers, label: "Giai đoạn", val: displayStage },
                              { icon: Building2, label: "Ngành", val: displayIndustry },
                              { icon: Globe, label: "Thị trường", val: p.marketScope || p.targetMarket || "—" },
                              { icon: CheckCircle2, label: "Sản phẩm", val: p.productStatus || "—" },
                              { icon: MapPin, label: "Địa điểm", val: [p.location, p.country].filter(Boolean).join(", ") || "—" },
                            ].map(({ icon: Icon, label, val }) => (
                              <div key={label} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                                  <p className="text-[12px] font-medium text-slate-700 truncate">{val}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Kinh doanh ── */}
                    {startupTab === "Kinh doanh" && (
                      <div className="space-y-5">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400" /> Vấn đề & Giải pháp
                          </h3>
                          <div className="space-y-1">
                            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Vấn đề</p>
                            <p className="text-[13px] text-slate-600 leading-relaxed">{p.problemStatement || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Giải pháp</p>
                            <p className="text-[13px] text-slate-600 leading-relaxed">{p.solutionSummary || "—"}</p>
                          </div>
                        </div>
                        {currentNeeds.length > 0 && (
                          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
                            <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                              <Target className="w-4 h-4 text-slate-400" /> Nhu cầu hiện tại
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {currentNeeds.map((n: string) => (
                                <span key={n} className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25">{n}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          {p.marketScope && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-1">
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Phạm vi thị trường</p>
                              <p className="text-[13px] font-medium text-slate-700">{p.marketScope}</p>
                            </div>
                          )}
                          {p.productStatus && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-1">
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Trạng thái sản phẩm</p>
                              <p className="text-[13px] font-medium text-slate-700">{p.productStatus}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Gọi vốn ── */}
                    {startupTab === "Gọi vốn" && (
                      <div className="space-y-5">
                        {targetFunding > 0 || raisedAmount > 0 ? (
                          <>
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { label: "Giai đoạn", value: displayStage, icon: TrendingUp },
                                { label: "Số vốn cần", value: targetFunding > 0 ? `$${targetFunding.toLocaleString()}` : "—", icon: DollarSign },
                                { label: "Đã huy động", value: raisedAmount > 0 ? `$${raisedAmount.toLocaleString()}` : "—", icon: CheckCircle2 },
                              ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-4">
                                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                                    <Icon className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-1">{label}</p>
                                  <p className="text-[18px] font-bold text-[#0f172a]">{value}</p>
                                </div>
                              ))}
                            </div>
                            {targetFunding > 0 && (
                              <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                                <p className="text-[12px] font-medium text-slate-500 mb-3">Tiến độ huy động vốn</p>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#e6cc4c] rounded-full" style={{ width: `${fundingProgress}%` }} />
                                </div>
                                <div className="flex justify-between mt-2">
                                  <span className="text-[11px] text-slate-400">${raisedAmount.toLocaleString()} đã huy động</span>
                                  <span className="text-[11px] text-slate-400">{fundingProgress}% · Mục tiêu ${targetFunding.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center">
                            <DollarSign className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-[13px] text-slate-400">Chưa có thông tin gọi vốn.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Đội ngũ ── */}
                    {startupTab === "Đội ngũ" && (
                      <div className="space-y-5">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" /> Thành viên cốt cán ({teamMembers.length})
                          </h3>
                          <div className="divide-y divide-slate-100">
                            {teamMembers.length > 0 ? teamMembers.map((m: any, idx: number) => (
                              <div key={m.teamMemberID ?? m.id ?? idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                                  {(m.photoURL || m.PhotoURL) ? (
                                    <img src={m.photoURL ?? m.PhotoURL} alt={m.fullName ?? "Member"} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-slate-500 text-[13px] font-bold">
                                      {(m.fullName ?? m.FullName ?? m.name ?? "?")[0]?.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <p className="text-[14px] font-semibold text-slate-800">{m.fullName ?? m.FullName ?? m.name ?? "Thành viên"}</p>
                                    {(m.isFounder || m.IsFounder) && (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-100/50 text-amber-700 text-[10px] font-bold border border-amber-200/50">FOUNDER</span>
                                    )}
                                  </div>
                                  <p className="text-[12px] text-slate-500 font-medium">
                                    {[m.title ?? m.Title, m.role ?? m.Role].filter(Boolean).join(" · ")}
                                    {Number(m.yearsOfExperience) > 0 ? ` · ${m.yearsOfExperience} năm` : ""}
                                  </p>
                                  {(m.bio || m.Bio) && <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">{m.bio ?? m.Bio}</p>}
                                </div>
                              </div>
                            )) : <p className="text-[13px] text-slate-400 italic">Chưa có thông tin thành viên.</p>}
                          </div>
                        </div>
                        {p.enterpriseCode && (
                          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
                            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Pháp lý</h3>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-[12px] font-medium text-emerald-700">Đã đăng ký doanh nghiệp</span>
                            </div>
                            <p className="text-[13px] font-medium text-slate-700">MST: {p.enterpriseCode}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Liên hệ ── */}
                    {startupTab === "Liên hệ" && (
                      <div className="grid grid-cols-2 gap-5">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                          <h3 className="text-[13px] font-semibold text-slate-700">Liên hệ trực tiếp</h3>
                          {p.contactEmail && (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Email</p>
                              <p className="text-[13px] font-medium text-slate-700">{p.contactEmail}</p>
                            </div>
                          )}
                          {p.contactPhone && (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Điện thoại</p>
                              <p className="text-[13px] font-medium text-slate-700">{p.contactPhone}</p>
                            </div>
                          )}
                          {(p.location || p.country) && (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Địa chỉ</p>
                              <p className="text-[13px] font-medium text-slate-700">{[p.location, p.country].filter(Boolean).join(", ")}</p>
                            </div>
                          )}
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
                          <h3 className="text-[13px] font-semibold text-slate-700">Liên kết</h3>
                          {p.website && (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Website</p>
                              <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-blue-600 hover:underline break-all">{p.website}</a>
                            </div>
                          )}
                          {p.linkedInURL && (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">LinkedIn</p>
                              <a href={p.linkedInURL} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-blue-600 hover:underline break-all">{p.linkedInURL}</a>
                            </div>
                          )}
                          {!p.website && !p.linkedInURL && (
                            <p className="text-[13px] text-slate-400">Chưa có liên kết.</p>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── INVESTOR ── */}
          {entityType === "INVESTOR" && investor && (
            <StaffInvestorProfileDrawerView investor={investor} />
          )}

          {false && entityType === "INVESTOR" && investor && (
            <div className="p-8 max-w-3xl mx-auto space-y-6">
              {/* Hero */}
              <div className="flex items-start gap-5">
                <div className={cn(
                  "w-20 h-20 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center text-white font-bold text-[22px] shrink-0",
                  !investor.profilePhotoURL && "bg-gradient-to-br from-violet-500 to-violet-600"
                )}>
                  {investor.profilePhotoURL
                    ? <img src={investor.profilePhotoURL} alt={investor.fullName} className="w-full h-full object-cover" />
                    : <span>{investor.fullName?.charAt(0)?.toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[17px] font-bold text-slate-900">{investor.fullName}</h2>
                  <p className="text-[12px] text-slate-500">{[investor.title, investor.firmName || investor.organization].filter(Boolean).join(" · ")}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {investor.investorType && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-100">{investor.investorType}</span>
                    )}
                    {investor.country && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100">
                        <MapPin className="w-2.5 h-2.5" />{investor.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {investor.bio && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Giới thiệu</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{investor.bio}</p>
                </div>
              )}
              {investor.investmentThesis && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Định hướng đầu tư</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{investor.investmentThesis}</p>
                </div>
              )}
              {(investor.preferredStages?.length > 0 || investor.preferredIndustries?.length > 0) && (
                <div className="space-y-3">
                  {investor.preferredStages?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Giai đoạn ưu tiên</p>
                      <div className="flex flex-wrap gap-1.5">
                        {investor.preferredStages.map((s: IStageRef | string) => (
                          <span key={getInvestorPreferredStageLabel(s)} className="px-2 py-0.5 rounded-md text-[11px] bg-slate-50 text-slate-600 border border-slate-100">{getInvestorPreferredStageLabel(s)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {investor.preferredIndustries?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Ngành ưu tiên</p>
                      <div className="flex flex-wrap gap-1.5">
                        {investor.preferredIndustries.map((ind: IIndustryRef | string) => (
                          <span key={getIndustryName(ind)} className="px-2 py-0.5 rounded-md text-[11px] bg-slate-50 text-slate-600 border border-slate-100">{getIndustryName(ind)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-xl text-[12px] font-medium",
                investor.acceptingConnections ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
              )}>
                <span className={cn("w-2 h-2 rounded-full", investor.acceptingConnections ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                {investor.acceptingConnections ? "Đang nhận kết nối" : "Tạm ngưng kết nối"}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function KYCDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { id } = React.use(params);
  const realId = id.split("-")[1];
  const numericId = parseInt(realId);

  const [activeTab, setActiveTab] = useState<"INFO" | "HISTORY">("INFO");
  const [detectedSubtype, setDetectedSubtype] = useState<KYCSubtype>(getSubtypeById(id));

  const historyEntityType = id.startsWith("ADVISOR-") ? "ADVISOR" : id.startsWith("INVESTOR-") ? "INVESTOR" : "STARTUP";
  const { data: historyData } = useQuery<KycCaseHistoryEntryDto[]>({
    queryKey: ["kyc-case-history", numericId, historyEntityType],
    queryFn: async () => {
      const res = await GetKYCCaseHistory(numericId, historyEntityType);
      const envelope = res as unknown as IBackendRes<KycCaseHistoryEntryDto[]>;
      return envelope.data ?? [];
    },
    enabled: !isNaN(numericId),
    staleTime: 30_000,
  });

  // Use React Query for data fetching
  const { data: rawData, isLoading: loading } = useQuery({
    queryKey: ["kyc-detail", id],
    queryFn: async () => {
      let res;
      if (id.startsWith("STARTUP-")) {
        res = await GetPendingStartupKycById(numericId);
      } else if (id.startsWith("ADVISOR-")) {
        res = await GetPendingAdvisorById(numericId);
      } else if (id.startsWith("INVESTOR-")) {
        res = await GetPendingInvestorKycById(numericId);
      }
      const data = (res as any)?.data;
      return data;
    },
    enabled: !!id && !isNaN(numericId),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const realData = useMemo(() => {
    if (!rawData) return rawData;

    // 1. Chuẩn hóa dữ liệu Startup
    if (id.startsWith("STARTUP-")) {
      const summary = rawData.submissionSummary;
      const evidenceFiles = summary?.evidenceFiles || [];
      const primaryEvidence = evidenceFiles[0];

      return {
        ...rawData,
        companyName: summary?.legalFullName || summary?.projectName || rawData.companyName,
        businessCode: summary?.enterpriseCode || rawData.businessCode,
        fullNameOfApplicant: summary?.representativeFullName || rawData.fullNameOfApplicant,
        submitterRole: summary?.representativeRole || rawData.submitterRole,
        roleOfApplicant: summary?.representativeRole || rawData.roleOfApplicant,
        contactEmail: summary?.workEmail || summary?.contactEmail || rawData.contactEmail,
        website: summary?.publicLink || rawData.website,
        fileCertificateBusiness: primaryEvidence?.url || rawData.fileCertificateBusiness,
        avatarUrl: rawData.logoURL || null,
      };
    }

    // 2. Chuẩn hóa dữ liệu Advisor
    if (id.startsWith("ADVISOR-")) {
      // Helper map chuyên môn sang Tiếng Việt
      const formatExpertise = (val: any) => {
        if (!val) return null;
        const EXPERTISE_LABELS: Record<string, string> = {
          FUNDRAISING: "Gọi vốn",
          PRODUCT_STRATEGY: "Chiến lược sản phẩm",
          GO_TO_MARKET: "Go-to-market",
          FINANCE: "Tài chính",
          LEGAL_IP: "Pháp lý & SHTT",
          OPERATIONS: "Vận hành",
          TECHNOLOGY: "Công nghệ",
          MARKETING: "Marketing",
          HR_OR_TEAM_BUILDING: "Nhân sự",
        };
        if (Array.isArray(val)) {
          return val.map(v => EXPERTISE_LABELS[v] || v).join(", ");
        }
        return EXPERTISE_LABELS[val] || val;
      };

      const expertiseArr = rawData.expertise ? rawData.expertise.split(",") : [];

      return {
        ...rawData,
        title: rawData.title || rawData.currentRoleTitle,
        linkedin: rawData.linkedInURL || rawData.professionalProfileLink,
        primaryExpertise: formatExpertise(expertiseArr[0]),
        secondaryExpertise: formatExpertise(expertiseArr.slice(1)),
        currentOrganization: rawData.currentOrganization || "—",
        avatarUrl: rawData.profilePhotoURL || null,
      };
    }

    // 3. Chuẩn hóa dữ liệu Investor
    if (id.startsWith("INVESTOR-")) {
      const summary = rawData.submissionSummary;
      return {
        ...rawData,
        profileFullName: rawData.fullName,
        fullName: summary?.fullName || rawData.fullName,
        contactEmail: summary?.contactEmail || rawData.email,
        title: summary?.currentRoleTitle || null,
        currentOrganization: summary?.organizationName || rawData.firmName || null,
        location: summary?.location || null,
        linkedin: summary?.linkedInURL || null,
        website: summary?.website || null,
        submitterRole: summary?.submitterRole || null,
        taxIdOrBusinessCode: summary?.taxIdOrBusinessCode || null,
        investorEvidenceFiles: summary?.evidenceFiles ?? [],
        workflowStatus: rawData.workflowStatus,
        avatarUrl: rawData.profilePhotoURL || null,
      };
    }

    return rawData;
  }, [rawData, id]);

  const subtype = detectedSubtype;
  const config = KYC_SUBTYPE_CONFIGS[subtype];

  const entityName = useMemo(() => {
    if (!realData) return "Đang tải dữ liệu...";
    if (id.startsWith("STARTUP-")) {
      return realData.submissionSummary?.legalFullName || realData.submissionSummary?.projectName || realData.companyName || "N/A";
    }
    if (id.startsWith("ADVISOR-")) return realData.fullName || "N/A";
    if (id.startsWith("INVESTOR-")) {
      const isInstitutional = realData.submissionSummary?.investorCategory === "INSTITUTIONAL";
      if (isInstitutional) return realData.currentOrganization || realData.profileFullName || realData.fullName || "N/A";
      return realData.profileFullName || realData.fullName || "N/A";
    }
    return "N/A";
  }, [realData, id]);

  const detailStatus = useMemo(
    () => normalizeDetailStatus(realData?.workflowStatus || realData?.profileStatus),
    [realData]
  );

  const detailSubmittedAt = useMemo(
    () => realData?.submittedAt || realData?.updatedAt || null,
    [realData]
  );

  const [isSuccess, setIsSuccess] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [requiresNewEvidence, setRequiresNewEvidence] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);

  useEffect(() => {
    if (realData) {
      if (id.startsWith("STARTUP-")) {
        setDetectedSubtype(realData.submissionSummary?.startupVerificationType === "WITHOUT_LEGAL_ENTITY" ? "STARTUP_NO_ENTITY" : "STARTUP_ENTITY");
      } else if (id.startsWith("ADVISOR-")) {
        setDetectedSubtype("ADVISOR");
      } else if (id.startsWith("INVESTOR-")) {
        const category = realData.submissionSummary?.investorCategory || realData.investorCategory || realData.investorType;
        setDetectedSubtype(category === "INSTITUTIONAL" ? "INSTITUTIONAL_INVESTOR" : "INDIVIDUAL_INVESTOR");
      }
    }
  }, [realData, id]);

  const avatarGradient = useMemo(() => getAvatarGradient(entityName), [entityName]);

  // Initialize assessments
  const [assessments, setAssessments] = useState<Record<string, AssessmentValue>>({});

  // Reset assessments when subtype changes to ensure "Confirm" button activates for the correct fields
  useEffect(() => {
    if (config) {
      setAssessments(Object.fromEntries(config.fields.map((f: any) => [f.id, f.options[0]])));
    }
  }, [subtype]);

  useEffect(() => {
    if (id.startsWith("STARTUP-") || id.startsWith("INVESTOR-")) {
      setRequiresNewEvidence(Boolean(realData?.requiresNewEvidence));
    }
  }, [id, realData?.requiresNewEvidence]);

  const updateAssessment = (fieldId: string, val: AssessmentValue) => {
    setAssessments(prev => ({ ...prev, [fieldId]: val }));
  };

  const result = useMemo(() => getSuggestedResult(subtype, assessments), [subtype, assessments]);
  const isComplete = useMemo(() => {
    if (!config) return false;
    return config.fields.every(f => assessments[f.id] !== undefined);
  }, [config, assessments]);
  const fileFieldRequiresNewEvidence = useMemo(() => {
    if (!config) return false;
    if (!(id.startsWith("STARTUP-") || id.startsWith("ADVISOR-") || id.startsWith("INVESTOR-"))) return false;
    return config.fields.some(
      (field) =>
        field.type === "file" &&
        assessments[field.id] !== undefined &&
        HARD_FAIL_VALUES.includes(assessments[field.id]),
    );
  }, [assessments, config, id]);
  const effectiveRequiresNewEvidence =
    (id.startsWith("STARTUP-") || id.startsWith("ADVISOR-") || id.startsWith("INVESTOR-")) &&
    (fileFieldRequiresNewEvidence || requiresNewEvidence);

  const currentPreviewSource = useMemo(
    () => getPreviewDocument(realData, id),
    [realData, id]
  );
  const startupEvidenceFiles = useMemo(
    () => (id.startsWith("STARTUP-") ? realData?.submissionSummary?.evidenceFiles || [] : []),
    [id, realData]
  );
  const advisorEvidenceFiles = useMemo(
    () => (id.startsWith("ADVISOR-") ? realData?.submissionSummary?.evidenceFiles || [] : []),
    [id, realData]
  );

  const activePreviewDoc = useMemo(() => {
    if (!previewDoc) return currentPreviewSource;
    return previewDoc;
  }, [previewDoc, currentPreviewSource]);

  const handleOpenAttachment = async (
    mode: "open" | "preview" = "open",
    targetFileId?: string
  ) => {
    if (id.startsWith("STARTUP-")) {
      const currentEvidenceFiles = realData?.submissionSummary?.evidenceFiles || [];
      const currentFile =
        currentEvidenceFiles.find((item: { id?: string }) => item.id === targetFileId) ||
        currentEvidenceFiles[0];
      const currentUrl = getOpenableUrl(currentFile?.url);
      const currentPreview: PreviewDocument = {
        url: currentUrl,
        name: currentFile?.fileName || getFileNameFromUrl(currentUrl),
        fileType: currentFile?.fileType || null,
      };

      if (!currentUrl) {
        toast.error("Không tìm thấy link xem tài liệu.");
        return;
      }

      if (mode === "preview") {
        setPreviewDoc(currentPreview);
      } else {
        const popup = createPendingTab();
        openUrlInNewTab(currentUrl, popup);
      }

      const currentStatus = await getUrlStatus(currentUrl);
      if (currentStatus !== 401 && currentStatus !== 403) {
        return;
      }

      try {
        const refreshed = await GetPendingStartupKycById(numericId);
        const refreshedEnvelope = refreshed as unknown as IBackendRes<any>;
        const refreshedData = refreshedEnvelope?.data;

        if (refreshedData) {
          queryClient.setQueryData(["kyc-detail", id], refreshedData);

          const refreshedEvidenceFiles = refreshedData.submissionSummary?.evidenceFiles || [];
          const refreshedFile =
            refreshedEvidenceFiles.find((item: { id?: string }) => item.id === (targetFileId || currentFile?.id)) ||
            refreshedEvidenceFiles[0];
          const refreshedUrl = getOpenableUrl(refreshedFile?.url);
          const refreshedStatus = refreshedUrl ? await getUrlStatus(refreshedUrl) : null;

          if (refreshedUrl && refreshedStatus !== 401 && refreshedStatus !== 403) {
            const refreshedPreview: PreviewDocument = {
              url: refreshedUrl,
              name: refreshedFile?.fileName || getFileNameFromUrl(refreshedUrl),
              fileType: refreshedFile?.fileType || null,
            };

            if (mode === "preview") {
              setPreviewDoc(refreshedPreview);
            } else {
              const popup = createPendingTab();
              openUrlInNewTab(refreshedUrl, popup);
            }
            return;
          }
        }

        toast.error("Link xem tài liệu đã hết hạn hoặc không còn khả dụng.");
      } catch {
        toast.error("Không thể làm mới link xem tài liệu. Vui lòng thử lại.");
      }

      return;
    }

    if (id.startsWith("ADVISOR-")) {
      const currentEvidenceFiles = realData?.submissionSummary?.evidenceFiles || [];
      const currentFile =
        currentEvidenceFiles.find((item: { id?: string }) => item.id === targetFileId) ||
        currentEvidenceFiles[0];
      let currentUrl = getOpenableUrl(currentFile?.url);

      if (!currentUrl) {
        toast.error("Không tìm thấy link xem tài liệu.");
        return;
      }

      const currentPreview: PreviewDocument = {
        url: currentUrl,
        name: currentFile?.fileName || getFileNameFromUrl(currentUrl),
        fileType: currentFile?.fileType || null,
      };

      if (mode === "preview") {
        setPreviewDoc(currentPreview);
      } else {
        const popup = createPendingTab();
        openUrlInNewTab(currentUrl, popup);
      }

      const currentStatus = await getUrlStatus(currentUrl);
      if (currentStatus !== 401 && currentStatus !== 403) {
        return;
      }

      toast.info("Link hết hạn, đang thử làm mới tài liệu...");

      try {
        const refreshed = await GetPendingAdvisorById(numericId);
        const refreshedEnvelope = refreshed as unknown as IBackendRes<any>;
        const refreshedData = refreshedEnvelope?.data;

        if (refreshedData) {
          queryClient.setQueryData(["kyc-detail", id], refreshedData);

          const refreshedEvidenceFiles = refreshedData.submissionSummary?.evidenceFiles || [];
          const refreshedFile =
            refreshedEvidenceFiles.find((item: { id?: string }) => item.id === (targetFileId || currentFile?.id)) ||
            refreshedEvidenceFiles[0];
            
          let refreshedUrl = getOpenableUrl(refreshedFile?.url);

          const refreshedStatus = refreshedUrl ? await getUrlStatus(refreshedUrl) : null;

          if (refreshedUrl && refreshedStatus !== 401 && refreshedStatus !== 403) {
            const refreshedPreview: PreviewDocument = {
              url: refreshedUrl,
              name: refreshedFile?.fileName || getFileNameFromUrl(refreshedUrl),
              fileType: refreshedFile?.fileType || null,
            };

            if (mode === "preview") {
              setPreviewDoc(refreshedPreview);
            } else {
              const popup = createPendingTab();
              openUrlInNewTab(refreshedUrl, popup);
            }
            return;
          }
        }

        toast.error("Link xem tài liệu của Advisor đã hết hạn hoặc không còn khả dụng.");
      } catch {
        toast.error("Không thể làm mới link xem tài liệu của Advisor. Vui lòng thử lại.");
      }

      return;
    }

    if (id.startsWith("INVESTOR-")) {
      const currentEvidenceFiles = (realData?.investorEvidenceFiles || []) as { id: number; url: string; fileName: string | null; kind: string }[];
      const currentFile =
        currentEvidenceFiles.find((item) => String(item.id) === targetFileId) ||
        currentEvidenceFiles[0];
      const currentUrl = getOpenableUrl(currentFile?.url);

      if (!currentUrl) {
        toast.error("Không tìm thấy link xem tài liệu.");
        return;
      }

      const currentPreview: PreviewDocument = {
        url: currentUrl,
        name: currentFile?.fileName || getFileNameFromUrl(currentUrl),
        fileType: null,
      };

      if (mode === "preview") {
        setPreviewDoc(currentPreview);
      } else {
        const popup = createPendingTab();
        openUrlInNewTab(currentUrl, popup);
      }

      const currentStatus = await getUrlStatus(currentUrl);
      if (currentStatus !== 401 && currentStatus !== 403) {
        return;
      }

      toast.info("Link hết hạn, đang thử làm mới tài liệu...");

      try {
        const refreshed = await GetPendingInvestorKycById(numericId);
        const refreshedEnvelope = refreshed as unknown as IBackendRes<any>;
        const refreshedData = refreshedEnvelope?.data;

        if (refreshedData) {
          queryClient.setQueryData(["kyc-detail", id], refreshedData);

          const refreshedEvidenceFiles = (refreshedData.submissionSummary?.evidenceFiles || []) as { id: number; url: string; fileName: string | null; kind: string }[];
          const refreshedFile =
            refreshedEvidenceFiles.find((item) => String(item.id) === (targetFileId || String(currentFile?.id))) ||
            refreshedEvidenceFiles[0];
          const refreshedUrl = getOpenableUrl(refreshedFile?.url);
          const refreshedStatus = refreshedUrl ? await getUrlStatus(refreshedUrl) : null;

          if (refreshedUrl && refreshedStatus !== 401 && refreshedStatus !== 403) {
            const refreshedPreview: PreviewDocument = {
              url: refreshedUrl,
              name: refreshedFile?.fileName || getFileNameFromUrl(refreshedUrl),
              fileType: null,
            };

            if (mode === "preview") {
              setPreviewDoc(refreshedPreview);
            } else {
              const popup = createPendingTab();
              openUrlInNewTab(refreshedUrl, popup);
            }
            return;
          }
        }

        toast.error("Link xem tài liệu của Investor đã hết hạn hoặc không còn khả dụng.");
      } catch {
        toast.error("Không thể làm mới link xem tài liệu của Investor. Vui lòng thử lại.");
      }

      return;
    }

    const fallbackUrl = getOpenableUrl(
      realData?.idProofFileURL ||
      realData?.investmentProofFileURL ||
      realData?.fileCertificateBusiness
    );

    if (!fallbackUrl) {
      toast.error("Không tìm thấy file tệp đính kèm.");
      return;
    }

    const fallbackPreview: PreviewDocument = {
      url: fallbackUrl,
      name: getFileNameFromUrl(fallbackUrl),
      fileType: null,
    };

    if (mode === "preview") {
      setPreviewDoc(fallbackPreview);
      return;
    }

    const popup = createPendingTab();
    openUrlInNewTab(fallbackUrl, popup);
  };

  const isPreviewImage = useMemo(() => {
    if (!activePreviewDoc?.url) return false;
    if (activePreviewDoc.fileType?.startsWith("image/")) return true;
    if (/\.(png|jpe?g|gif|bmp|svg|webp)$/i.test(activePreviewDoc.name || "")) return true;
    return /\.(png|jpe?g|gif|bmp|svg|webp)(\?|$)/i.test(activePreviewDoc.url);
  }, [activePreviewDoc]);

  const isPreviewPdf = useMemo(() => {
    if (!activePreviewDoc?.url) return false;
    if (activePreviewDoc.fileType?.toLowerCase().includes("pdf")) return true;
    if (/\.pdf(\?|$|\/)/i.test(activePreviewDoc.url)) return true;
    if (/\.pdf$/i.test(activePreviewDoc.name || "")) return true;
    return false;
  }, [activePreviewDoc]);

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#eec54e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isSuccess) {
// ... (success view remains same)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20" />
          <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
        </div>
        <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Xử lý thành công!</h2>
        <p className="text-[14px] text-slate-500 mt-2 text-center max-w-sm">
          Hồ sơ <span className="font-bold text-slate-900">{entityName}</span> đã được cập nhật nhãn <span className="font-bold text-emerald-600">{result.suggestedLabel}</span>. 
          Thông báo đã được gửi tới người dùng.
        </p>
        <div className="flex items-center gap-4 mt-10">
          <Link 
            href="/staff/kyc"
            className="px-6 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-[#1e293b] transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Về danh sách
          </Link>
          <button 
            onClick={() => setIsSuccess(false)}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            Xem lại hồ sơ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-7 pb-16 space-y-5 animate-in fade-in duration-400">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/staff/kyc"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-[13px] font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>
        <div className="flex items-center gap-2">
          {(id.startsWith("ADVISOR-") || id.startsWith("STARTUP-") || id.startsWith("INVESTOR-")) && (
            <button
              onClick={() => {
                if (id.startsWith("STARTUP-")) {
                  const profileId = rawData?.startupID ?? rawData?.startupId ?? numericId;
                  router.push(`/staff/profiles/startup/${profileId}`);
                } else {
                  setProfileDrawerOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Xem hồ sơ
            </button>
          )}
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Page Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">


        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm overflow-hidden", !realData?.avatarUrl && `bg-gradient-to-br ${avatarGradient}`)}>
              {realData?.avatarUrl
                ? <img src={realData.avatarUrl} alt={entityName} className="w-full h-full object-cover" />
                : entityName.charAt(0).toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-bold text-slate-900 leading-tight font-plus-jakarta-sans">{entityName}</h1>
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", STATUS_CFG[detailStatus].badge)}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CFG[detailStatus].dot)} />
                  {STATUS_CFG[detailStatus].label}
                </span>
                {result.hasHardFail && (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Vi phạm nghiêm trọng
                  </span>
                )}
              </div>
              <p className="text-[13px] text-slate-500 mt-1">{config.label}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Nộp: {new Date().toLocaleDateString('vi-VN')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">#{id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-slate-100 no-scrollbar overflow-x-auto">
            {[ { id: "INFO", label: "Soát xét hồ sơ" }, { id: "HISTORY", label: "Lịch sử xử lý" } ].map((tab) => (
              <button 
                key={tab.id}
                className={cn("px-4 py-2 text-[13px] font-bold whitespace-nowrap border-b-2 -mb-px transition-colors font-plus-jakarta-sans", 
                  activeTab === tab.id ? "border-[#0f172a] text-[#0f172a]" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "INFO" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Thẩm định chi tiết
                </h2>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Khu vực xử lý</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">Thông tin</th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">Dữ liệu</th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 w-64 text-right">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {config.fields.map((field) => {
                      let realValue: React.ReactNode = field.value || "—";
                      
                      if (realData) {
                        // Priority 1: Direct ID matches
                        if (field.id === "legalName") realValue = realData.companyName || "—";
                        else if (field.id === "projectName") realValue = realData.companyName || "—";
                        else if (field.id === "taxId" || field.id === "orgTaxId") realValue = realData.businessCode || realData.taxIdOrBusinessCode || "—";
                        
                        else if (field.id === "submitterName") realValue = realData.fullNameOfApplicant || realData.fullName || "—";
                        else if (field.id === "repName") realValue = realData.fullNameOfApplicant || realData.fullName || "—";
                        else if (field.id === "investorName" || field.id === "advisorName") realValue = realData.fullName || "—";
                        
                        else if (field.id === "workEmail" || field.id === "contactEmail" || field.id === "email") {
                          realValue = realData.contactEmail || realData.email || "—";
                        }
                        
                        else if (field.id === "submitterRole" || field.id === "repRole") {
                          const roleMap: Record<string, string> = {
                            PARTNER: "Đối tác (Partner)",
                            INVESTMENT_MANAGER: "Quản lý đầu tư",
                            ANALYST: "Chuyên viên phân tích",
                            LEGAL_REPRESENTATIVE: "Đại diện pháp luật",
                            AUTHORIZED_PERSON: "Người được ủy quyền",
                          };
                          const raw = realData.submitterRole || realData.roleOfApplicant || "";
                          realValue = roleMap[raw] || raw || "—";
                        }
                        
                        else if (field.id === "officialLink" || field.id === "website" || field.id === "publicLink") {
                          realValue = realData.website || "—";
                        }
                        
                        else if (field.id === "linkedin") {
                          realValue = realData.linkedin || realData.linkedInURL || realData.linkedinURL || "—";
                        }
                        
                        else if (field.id === "primaryExpertise") {
                          realValue = realData.primaryExpertise || realData.expertise || (realData.industryFocus && realData.industryFocus[0]?.industry) || "—";
                        }
                        
                        else if (field.id === "orgLegalName" || field.id === "firmName" || field.id === "org") {
                          realValue = realData.currentOrganization || realData.organizationName || realData.firmName || "—";
                        }

                        else if (field.id === "title") {
                          realValue = realData.title || "—";
                        }

                        // Fallback/Generic handle
                        if (realValue === "—") {
                          // Try to find property by name (case insensitive)
                          const key = Object.keys(realData).find(k => k.toLowerCase() === field.id.toLowerCase());
                          if (key) {
                            const val = (realData as any)[key];
                            if (val && typeof val !== "object") realValue = String(val);
                          }
                        }
                        
                        if (field.type === "file") {
                           if (id.startsWith("STARTUP-")) {
                             realValue = startupEvidenceFiles.length > 0
                               ? `${startupEvidenceFiles.length} tài liệu đính kèm`
                               : "Chưa tải lên";
                           } else if (id.startsWith("ADVISOR-")) {
                             const hasFiles = advisorEvidenceFiles.length > 0;
                             realValue = hasFiles
                               ? `${advisorEvidenceFiles.length} tài liệu đính kèm`
                               : "Chưa tải lên";
                           } else if (id.startsWith("INVESTOR-")) {
                             const files = realData.investorEvidenceFiles || [];
                             realValue = files.length > 0 ? `${files.length} tài liệu đính kèm` : "Chưa tải lên";
                           }
                        }
                      }

                      return (
                      <tr key={field.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-5 align-top">
                          <p className="text-[13px] font-semibold text-slate-700">{field.label}</p>
                        </td>
                        <td className="px-6 py-5 align-top">
                           {field.type === "text" && (
                            <p className="text-[13px] text-slate-600 leading-relaxed font-normal">{realValue}</p>
                           )}
                           {field.type === "link" && (
                            getExternalLink(typeof realValue === "string" ? realValue : "") ? (
                              <a
                                href={getExternalLink(typeof realValue === "string" ? realValue : "")}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 font-medium hover:underline"
                              >
                                Mở liên kết
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-[13px] text-slate-400">Không có liên kết</span>
                            )
                           )}
                          {field.type === "file" && (
                            id.startsWith("STARTUP-") ? (
                              startupEvidenceFiles.length > 0 ? (
                                <div className="space-y-2">
                                  {startupEvidenceFiles.map((file: { id?: string; fileName?: string; fileType?: string | null; url?: string | null }, fileIndex: number) => (
                                    <div
                                      key={file.id || `${field.id}-${fileIndex}`}
                                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors group-hover:bg-white"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-red-500" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-700 text-[12px] truncate">
                                          {file.fileName || `${field.label} ${fileIndex + 1}`}
                                        </p>
                                        <button
                                          onClick={() => void handleOpenAttachment("preview", file.id)}
                                          className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                        >
                                          Xem tài liệu
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[13px] text-slate-400">Không có tài liệu</span>
                              )
                            ) : id.startsWith("ADVISOR-") ? (
                              advisorEvidenceFiles.length > 0 ? (
                                <div className="space-y-2">
                                  {advisorEvidenceFiles.map((file: { id?: string; fileName?: string; fileType?: string | null; url?: string | null }, fileIndex: number) => (
                                    <div
                                      key={file.id || `${field.id}-${fileIndex}`}
                                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors group-hover:bg-white"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-red-500" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-700 text-[12px] truncate">
                                          {file.fileName || `${field.label} ${fileIndex + 1}`}
                                        </p>
                                        <button
                                          onClick={() => void handleOpenAttachment("preview", file.id)}
                                          className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                        >
                                          Xem tài liệu
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-red-500" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-700 text-[12px] truncate">
                                      {field.label}
                                    </p>
                                    <button 
                                      onClick={() => void handleOpenAttachment("preview")}
                                      className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                    >
                                      {realValue === "Chưa tải lên" ? "Không có tài liệu" : "Xem tài liệu"}
                                    </button>
                                  </div>
                                </div>
                              )
                            ) : id.startsWith("INVESTOR-") ? (
                              (() => {
                                const investorFiles = (realData.investorEvidenceFiles || []) as { id: number; url: string; fileName: string | null; kind: string }[];
                                return investorFiles.length > 0 ? (
                                  <div className="space-y-2">
                                    {investorFiles.map((file, fileIndex) => (
                                      <div key={file.id || fileIndex} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors group-hover:bg-white">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                          <FileText className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-semibold text-slate-700 text-[12px] truncate">
                                            {file.fileName || file.kind || field.label}
                                          </p>
                                          <button
                                            onClick={() => void handleOpenAttachment("preview", String(file.id))}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                          >
                                            Xem tài liệu
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[13px] text-slate-400">Không có tài liệu</span>
                                );
                              })()
                            ) : (
                              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-700 text-[12px] truncate">
                                    {field.label}
                                  </p>
                                  <button
                                    onClick={() => void handleOpenAttachment("preview")}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                  >
                                    {realValue === "Chưa tải lên" ? "Không có tài liệu" : "Xem tài liệu"}
                                  </button>
                                </div>
                              </div>
                            )
                           )}
                        </td>
                        <td className="px-6 py-5 align-top text-right">
                          <div className="space-y-2 inline-block text-left w-full">
                            <select 
                              value={assessments[field.id]}
                              onChange={(e) => updateAssessment(field.id, e.target.value as AssessmentValue)}
                              className={cn(
                                "w-full px-3 py-2 rounded-xl text-[12px] font-medium border outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e]",
                                HARD_FAIL_VALUES.includes(assessments[field.id]) 
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : SCORE_MAP[assessments[field.id]] >= 2
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-700"
                              )}
                            >
                              {field.options.map(opt => (
                                <option key={opt} value={opt}>{ASSESSMENT_LABELS[opt]}</option>
                              ))}
                            </select>
                            <div className="flex items-center justify-between px-1">
                               <span className={cn("text-[10px] font-bold uppercase tracking-wide", 
                                  SCORE_MAP[assessments[field.id]] >= 2 ? "text-emerald-500" :
                                  SCORE_MAP[assessments[field.id]] >= 1 ? "text-blue-500" :
                                  SCORE_MAP[assessments[field.id]] < 0 ? "text-red-500" : "text-slate-400"
                               )}>
                                {SCORE_MAP[assessments[field.id]] > 0 ? `+${SCORE_MAP[assessments[field.id]]}` : SCORE_MAP[assessments[field.id]]} điểm
                               </span>
                               {HARD_FAIL_VALUES.includes(assessments[field.id]) && (
                                 <span className="text-[10px] font-bold text-red-600 uppercase italic">Vi phạm nghiêm trọng</span>
                               )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evidence Preview Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    Xem trước minh chứng
                  </h2>
                {activePreviewDoc?.url ? (
                  <a
                    href={activePreviewDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    download={activePreviewDoc.name || "tai-lieu"}
                    className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải xuống
                  </a>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Tải xuống
                    </span>
                  )}
                </div>
                {id.startsWith("STARTUP-") && startupEvidenceFiles.length > 1 && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-slate-700">
                        Chọn tài liệu để xem trước
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {startupEvidenceFiles.length} tệp
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {startupEvidenceFiles.map((file: { id?: string; fileName?: string; url?: string | null }, fileIndex: number) => {
                        const fileUrl = getOpenableUrl(file.url);
                        const isActive =
                          Boolean(fileUrl && activePreviewDoc?.url === fileUrl) ||
                          (!fileUrl && activePreviewDoc?.name === (file.fileName || `Tài liệu ${fileIndex + 1}`));

                        return (
                          <button
                            key={file.id || `preview-file-${fileIndex}`}
                            type="button"
                            onClick={() => void handleOpenAttachment("preview", file.id)}
                            className={cn(
                              "inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[#0f172a] bg-[#0f172a] text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100",
                            )}
                          >
                            <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                            <span className="max-w-[220px] truncate text-[12px] font-medium">
                              {file.fileName || `Tài liệu ${fileIndex + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {id.startsWith("ADVISOR-") && advisorEvidenceFiles.length > 1 && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-slate-700">
                        Chọn tài liệu để xem trước
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {advisorEvidenceFiles.length} tệp
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {advisorEvidenceFiles.map((file: { id?: string; fileName?: string; url?: string | null }, fileIndex: number) => {
                        const fileUrl = getOpenableUrl(file.url);
                        const isActive =
                          Boolean(fileUrl && activePreviewDoc?.url === fileUrl) ||
                          (!fileUrl && activePreviewDoc?.name === (file.fileName || `Tài liệu ${fileIndex + 1}`));

                        return (
                          <button
                            key={file.id || `preview-file-${fileIndex}`}
                            type="button"
                            onClick={() => void handleOpenAttachment("preview", file.id)}
                            className={cn(
                              "inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[#0f172a] bg-[#0f172a] text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100",
                            )}
                          >
                            <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                            <span className="max-w-[220px] truncate text-[12px] font-medium">
                              {file.fileName || `Tài liệu ${fileIndex + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {id.startsWith("INVESTOR-") && (realData?.investorEvidenceFiles || []).length > 1 && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-slate-700">
                        Chọn tài liệu để xem trước
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {(realData?.investorEvidenceFiles || []).length} tệp
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(realData?.investorEvidenceFiles as { id: number; url: string; fileName: string | null; kind: string }[]).map((file, fileIndex) => {
                        const fileUrl = getOpenableUrl(file.url);
                        const isActive = Boolean(fileUrl && activePreviewDoc?.url === fileUrl);
                        return (
                          <button
                            key={file.id || `investor-preview-${fileIndex}`}
                            type="button"
                            onClick={() => void handleOpenAttachment("preview", String(file.id))}
                            className={cn(
                              "inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[#0f172a] bg-[#0f172a] text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100",
                            )}
                          >
                            <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                            <span className="max-w-[220px] truncate text-[12px] font-medium">
                              {file.fileName || file.kind || `Tài liệu ${fileIndex + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="aspect-[4/3] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden transition-colors hover:border-slate-300">
                  {activePreviewDoc?.url ? (
                    isPreviewImage ? (
                      <img
                        src={activePreviewDoc.url}
                        alt={activePreviewDoc.name}
                        className="w-full h-full object-contain bg-white"
                      />
                    ) : isPreviewPdf ? (
                      <iframe
                        key={activePreviewDoc.url}
                        title={activePreviewDoc.name}
                        src={activePreviewDoc.url}
                        className="w-full h-full bg-white"
                      />
                    ) : (
                      <iframe
                        key={activePreviewDoc.url}
                        title={activePreviewDoc.name}
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(activePreviewDoc.url)}&embedded=true`}
                        className="w-full h-full bg-white"
                      />
                    )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center group">
                    <FileText className="w-10 h-10 text-slate-200 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-[13px] text-slate-400 italic">Chọn một tài liệu để xem trước nội dung</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-5">
            {/* Action Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Kết quả soát xét
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Điểm hệ thống</span>
                  <span className={cn("text-[18px] font-bold", result.totalScore >= 6 ? "text-emerald-600" : "text-amber-600")}>
                    {result.totalScore} <span className="text-[12px] font-medium text-slate-400">/ {config.fields.length * 2}</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Gợi ý nhãn</span>
                  <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border", 
                    result.suggestedDecision === "APPROVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200/80" :
                    result.suggestedDecision === "REJECT" ? "bg-red-50 text-red-700 border-red-200/80" :
                    "bg-amber-50 text-amber-700 border-amber-200/80"
                  )}>
                    <Zap className="w-3 h-3" />
                    {result.suggestedLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Ghi chú nội bộ</p>
                  <textarea 
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Nhập ghi chú quan trọng..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none h-24 transition-all"
                  />
                </div>

                {(id.startsWith("STARTUP-") || id.startsWith("ADVISOR-") || id.startsWith("INVESTOR-")) && result.suggestedDecision !== "APPROVE" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">
                      Yêu cầu minh chứng khi gửi lại
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fileFieldRequiresNewEvidence) {
                          setRequiresNewEvidence((prev) => !prev);
                        }
                      }}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left transition-all",
                        effectiveRequiresNewEvidence
                          ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                        fileFieldRequiresNewEvidence && "cursor-not-allowed",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800">
                            {effectiveRequiresNewEvidence
                              ? "Bắt đối tượng tải lại bộ minh chứng mới"
                              : "Cho phép giữ lại minh chứng cũ"}
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                            {fileFieldRequiresNewEvidence
                              ? "Trường tài liệu đang bị đánh fail hoặc nghi vấn nghiêm trọng. Bắt buộc phải tải bộ file mới khi gửi lại hồ sơ."
                              : effectiveRequiresNewEvidence
                              ? "Bật khi vấn đề nằm ở tài liệu minh chứng. Bắt buộc phải tải bộ file mới khi gửi lại hồ sơ."
                              : "Dùng khi staff chỉ yêu cầu sửa thông tin chữ hoặc liên kết. Có thể gửi lại mà không cần tải file mới."}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "mt-0.5 inline-flex h-6 min-w-11 items-center rounded-full border px-1 transition-colors",
                            effectiveRequiresNewEvidence
                              ? "justify-end border-amber-300 bg-amber-100"
                              : "justify-start border-slate-200 bg-slate-100",
                          )}
                        >
                          <span
                            className={cn(
                              "block h-4 w-4 rounded-full transition-colors",
                              effectiveRequiresNewEvidence ? "bg-amber-500" : "bg-white shadow-sm",
                            )}
                          />
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                <button 
                  disabled={!isComplete}
                  onClick={() => setShowConfirm(true)}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95",
                    isComplete ? "bg-[#0f172a] text-white hover:bg-[#1e293b]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận kết quả
                </button>
              </div>
            </div>

            {/* Timeline Row */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h3 className="text-[13px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Lịch sử xử lý
              </h3>
              <div className="relative">
                {!historyData || historyData.length === 0 ? (
                  <p className="text-[12px] text-slate-400">Chưa có lịch sử xử lý.</p>
                ) : (
                  historyData.map((entry, idx) => {
                    const isLast = idx === historyData.length - 1;
                    const cfg = ACTION_CFG[entry.action] ?? ACTION_CFG.UNDER_REVIEW;
                    return (
                      <div key={idx} className="flex gap-3 pb-5 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 z-10", cfg.dot)} />
                          {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] text-slate-700 font-medium leading-tight">{cfg.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {entry.reviewedByEmail || "Hệ thống"}
                            {entry.reviewedAt ? ` · ${formatHistoryDate(entry.reviewedAt)}` : entry.submittedAt ? ` · ${formatHistoryDate(entry.submittedAt)}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Logic Guide */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h3 className="text-[13px] font-semibold text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#eec54e]" />
                Hướng dẫn gán nhãn
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[11px] font-bold text-emerald-600 uppercase">Đã xác thực</span>
                     <span className="text-[11px] font-bold text-slate-400">Min {APPROVAL_THRESHOLDS[subtype].verified}đ</span>
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Không có cảnh báo đỏ hoặc vi phạm nghiêm trọng.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[11px] font-bold text-blue-600 uppercase">Cơ bản</span>
                     <span className="text-[11px] font-bold text-slate-400">Min {APPROVAL_THRESHOLDS[subtype].basic}đ</span>
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Cho phép sai sót nhỏ không ảnh hưởng cốt lõi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <HistoryTab entityId={numericId} entityType={id.startsWith("ADVISOR-") ? "ADVISOR" : id.startsWith("INVESTOR-") ? "INVESTOR" : "STARTUP"} />
      )}

      {/* Decision Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md gap-0 overflow-hidden rounded-2xl border-none p-0 shadow-xl"
        >
          <div className="p-6 space-y-3">
                <DialogTitle className="sr-only">Xác nhận phê duyệt</DialogTitle>
                <DialogDescription className="sr-only">
                  Xác nhận áp dụng nhãn đánh giá cho hồ sơ hiện tại.
                </DialogDescription>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-slate-900">Xác nhận phê duyệt</h3>
                  <button onClick={() => setShowConfirm(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <XCircle className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Bạn đang chuẩn bị áp dụng nhãn <span className="font-bold text-slate-900 border-b border-[#eec54e]">{result.suggestedLabel}</span> cho hồ sơ <span className="font-bold text-slate-900">{entityName}</span>.
                </p>

                <div className="p-4 rounded-xl bg-[#0f172a] text-white flex items-center justify-between shadow-lg shadow-black/5">
                   <div>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Điểm số</p>
                     <p className="text-[24px] font-bold mt-0.5 tracking-tight">{result.totalScore}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Phân loại</p>
                     <span className={cn("inline-block mt-1 px-3 py-1 rounded-lg text-[12px] font-bold tracking-tight",
                        result.suggestedDecision === "APPROVE" ? "bg-emerald-500" : "bg-amber-500"
                     )}>
                       {result.suggestedLabel}
                     </span>
                   </div>
                </div>

                <div className="flex items-center justify-end gap-3">
               <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
                 Hủy bỏ
               </button>
               <button 
                  className={cn("px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all shadow-sm active:scale-95",
                    result.suggestedDecision === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={async () => {
                    try {
                        const staffId = user?.userId || 1;
                        const numericId = Number(realId);
                        const isApprove = result.suggestedDecision === "APPROVE";
                        
                        if (id.startsWith("STARTUP-")) {
                            if (isApprove) {
                              await ApproveStartupRegistration(
                                staffId,
                                numericId,
                                result.totalScore,
                                internalNote || undefined,
                                false
                              );
                            } else {
                              await RejectStartupRegistration(
                                staffId,
                                numericId,
                                internalNote || "Không đạt",
                                effectiveRequiresNewEvidence
                              );
                            }
                        } else if (id.startsWith("ADVISOR-")) {
                            if (isApprove) await ApproveAdvisorRegistration(staffId, numericId, result.totalScore);
                            else await RejectAdvisorRegistration(staffId, numericId, internalNote || "Không đạt", effectiveRequiresNewEvidence);
                        } else if (id.startsWith("INVESTOR-")) {
                            const isInst = subtype === "INSTITUTIONAL_INVESTOR";
                            if (isApprove) await ApproveInvestorRegistration(staffId, numericId, result.totalScore, isInst, internalNote || undefined);
                            else await RejectInvestorRegistration(staffId, numericId, internalNote || "Không đạt", effectiveRequiresNewEvidence);
                        }

                        toast.success(isApprove ? "Đã duyệt hồ sơ thành công" : "Đã từ chối hồ sơ");
                        queryClient.invalidateQueries({ queryKey: ["kyc-detail", id] });
                        queryClient.invalidateQueries({ queryKey: ["kyc-pending-startups"] });
                        queryClient.invalidateQueries({ queryKey: ["kyc-pending-advisors"] });
                        queryClient.invalidateQueries({ queryKey: ["kyc-pending-investors"] });
                        queryClient.invalidateQueries({ queryKey: ["kyc-history"] });
                        queryClient.invalidateQueries({
                          queryKey: [
                            "kyc-case-history",
                            numericId,
                            id.startsWith("ADVISOR-")
                              ? "ADVISOR"
                              : id.startsWith("INVESTOR-")
                                ? "INVESTOR"
                                : "STARTUP",
                          ],
                        });
                        setIsSuccess(true);
                        setShowConfirm(false);
                    } catch (err: any) {
                        const rawMsg: string = err.response?.data?.message || err.message || "";
                        let toastMsg: string;
                        if (rawMsg === "No active KYC submission found." || rawMsg === "No active KYC submission found for this investor.") {
                            toastMsg = "Không tìm thấy hồ sơ KYC đang chờ duyệt.";
                        } else if (rawMsg === "Profile not found") {
                            toastMsg = "Không tìm thấy hồ sơ startup.";
                        } else if (rawMsg === "Advisor profile does not exist") {
                            toastMsg = "Không tìm thấy hồ sơ advisor.";
                        } else if (rawMsg === "Investor profile does not exist") {
                            toastMsg = "Không tìm thấy hồ sơ investor.";
                        } else {
                            toastMsg = rawMsg || "Có lỗi xảy ra khi xử lý hồ sơ. Vui lòng thử lại.";
                        }
                        toast.error(toastMsg);
                    }
                  }}
               >
                 {result.suggestedDecision === "APPROVE" ? "Phê duyệt" : "Từ chối"} hồ sơ
               </button>
                </div>
          </div>
        </DialogContent>
      </Dialog>
      <ProfileDrawer
        entityId={
          id.startsWith("STARTUP-") ? (rawData?.startupID ?? rawData?.startupId ?? numericId)
          : id.startsWith("ADVISOR-") ? (rawData?.advisorID ?? rawData?.advisorId ?? numericId)
          : (rawData?.investorID ?? rawData?.investorId ?? numericId)
        }
        entityType={id.startsWith("ADVISOR-") ? "ADVISOR" : id.startsWith("INVESTOR-") ? "INVESTOR" : "STARTUP"}
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />
    </div>
  );
}
