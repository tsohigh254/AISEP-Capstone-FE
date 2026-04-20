"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Bookmark,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Globe,
  Handshake,
  Layers,
  Lightbulb,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  AddToWatchlist,
  GetInvestorProfile,
  GetInvestorWatchlist,
  SearchStartups,
  GetStartupById,
  RemoveFromWatchlist,
} from "@/services/investor/investor.api";
import { GetStartupDocuments, ViewDocument } from "@/services/document/document.api";
import { GetEvaluationHistory, GetEvaluationReport } from "@/services/ai/ai.api";
import { Download, Eye, FileText as FileTextIcon, FolderOpen, RefreshCcw } from "lucide-react";
import { GetSentConnections, GetReceivedConnections } from "@/services/connection/connection.api";
import { ConnectStartupModal } from "@/components/investor/connect-startup-modal";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  "0": "Hạt giống (Idea)", "1": "Tiền ươm mầm (Pre-Seed)", "2": "Ươm mầm (Seed)",
  "3": "Series A", "4": "Series B", "5": "Series C+", "6": "Tăng trưởng (Growth)",
  Idea: "Hạt giống (Idea)", PreSeed: "Tiền ươm mầm (Pre-Seed)", Seed: "Ươm mầm (Seed)",
  SeriesA: "Series A", SeriesB: "Series B", SeriesC: "Series C+", Growth: "Tăng trưởng (Growth)",
};

const TABS = ["Tổng quan", "Kinh doanh", "Gọi vốn", "Đội ngũ & Xác thực", "Tài liệu", "Liên hệ"] as const;
type Tab = typeof TABS[number];

const MONOGRAM_PALETTES = [
  { bg: "bg-violet-500" }, { bg: "bg-blue-500" }, { bg: "bg-emerald-500" },
  { bg: "bg-rose-500" }, { bg: "bg-amber-500" }, { bg: "bg-cyan-500" },
  { bg: "bg-pink-500" }, { bg: "bg-indigo-500" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonogramPalette(id: number) {
  return MONOGRAM_PALETTES[id % MONOGRAM_PALETTES.length];
}

function getErrorCode(source: any): string | undefined {
  return source?.errorCode ?? source?.error?.code ?? source?.data?.errorCode ??
    source?.response?.data?.errorCode ?? source?.response?.data?.error?.code;
}

function getErrorMessage(source: any): string | undefined {
  return source?.message ?? source?.error?.message ?? source?.data?.message ?? source?.response?.data?.message;
}

function normalizeScore(raw: any): number | null {
  if (raw == null) return null;
  let n: number;
  if (typeof raw === "string") {
    const matched = raw.match(/-?\d+(?:\.\d+)?/);
    if (!matched) return null;
    n = Number(matched[0]);
  } else {
    n = Number(raw);
  }
  if (!Number.isFinite(n)) return null;
  if (n <= 1) return Math.round(n * 100);
  if (n <= 10) return Math.round(n * 10);
  return Math.round(n);
}

function extractAiScore(source: any): number | null {
  if (!source) return null;
  return normalizeScore(
    source?.score ??
    source?.Score ??
    source?.aiScore ??
    source?.AiScore ??
    source?.AIScore ??
    source?.ai_score ??
    source?.overallScore ??
    source?.OverallScore ??
    source?.overall_score ??
    source?.latestAiScore ??
    source?.latestScore ??
    source?.startupPotentialScore ??
    source?.startupScore ??
    source?.matchScore ??
    source?.MatchScore ??
    source?.ai?.score ??
    source?.ai?.aiScore ??
    source?.ai?.overallScore ??
    source?.aiEvaluation?.overallScore ??
    source?.overall_result?.overall_score ??
    source?.overall_result?.overallScore ??
    source?.report?.overall_result?.overall_score ??
    source?.report?.overall_result?.overallScore ??
    source?.report?.overallScore ??
    source?.report?.overall_score ??
    source?.data?.overall_result?.overall_score ??
    source?.data?.overall_result?.overallScore ??
    source?.data?.report?.overall_result?.overall_score ??
    source?.data?.report?.overall_result?.overallScore ??
    source?.data?.report?.overallScore ??
    source?.data?.report?.overall_score ??
    source?.potentialScore ??
    source?.PotentialScore ??
    source?.latestEvaluation?.overallScore ??
    source?.latestEvaluation?.overall_score ??
    source?.latestEvaluation?.report?.overall_result?.overall_score
  );
}

function extractLatestHistoryScore(items: any[]): number | null {
  if (!Array.isArray(items) || items.length === 0) return null;

  const isCompleted = (item: any) => {
    const s = String(item?.status ?? item?.Status ?? item?.statusName ?? item?.StatusName ?? "").toLowerCase();
    return s === "completed" || s === "partial_completed";
  };

  const getTime = (item: any) => {
    const t = new Date(item?.generatedAt ?? item?.calculatedAt ?? item?.createdAt ?? item?.updatedAt ?? item?.created_at ?? item?.updated_at ?? 0).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const sorted = [...items].filter(isCompleted).sort((a, b) => getTime(b) - getTime(a));
  for (const item of sorted) {
    const score = extractAiScore(item);
    if (score != null && score > 0) return score;
  }
  return null;
}

function extractLatestCompletedRunId(items: any[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const isCompleted = (item: any) => {
    const s = String(item?.status ?? item?.Status ?? item?.statusName ?? item?.StatusName ?? "").toLowerCase();
    return s === "completed" || s === "partial_completed";
  };

  const getTime = (item: any) => {
    const t = new Date(item?.generatedAt ?? item?.calculatedAt ?? item?.createdAt ?? item?.updatedAt ?? item?.created_at ?? item?.updated_at ?? 0).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const sorted = [...items].filter(isCompleted).sort((a, b) => getTime(b) - getTime(a));
  if (sorted.length === 0) return 0;
  const latest = sorted[0];
  return Number(latest?.evaluationId ?? latest?.runId ?? latest?.RunId ?? latest?.id ?? latest?.Id ?? latest?.run_id ?? 0) || 0;
}

// ─── Shared UI components ─────────────────────────────────────────────────────

function Tag({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "violet" | "amber" | "blue" }) {
  const cls = {
    default: "bg-slate-50 text-slate-600 border-slate-100",
    green:   "bg-emerald-50 text-emerald-700 border-emerald-100/60",
    violet:  "bg-violet-50 text-violet-600 border-violet-100/60",
    amber:   "bg-amber-50 text-amber-700 border-amber-100/60",
    blue:    "bg-sky-50 text-sky-600 border-sky-100/60",
  }[variant];
  return <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border", cls)}>{children}</span>;
}

function InfoPair({ label, value, isLink }: { label: string; value?: string | null; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-blue-600 hover:underline break-all">{value}</a>
      ) : (
        <p className="text-[13px] font-medium text-slate-700">{value}</p>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-5 pb-16">
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="h-28 bg-slate-200 animate-pulse" />
        <div className="px-7 pb-7 space-y-4">
          <div className="w-20 h-20 -mt-10 rounded-2xl bg-slate-300 animate-pulse border-[3px] border-white" />
          <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-6 w-24 bg-slate-100 animate-pulse rounded-md" />)}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {TABS.map(t => <div key={t} className="h-9 w-28 bg-slate-100 animate-pulse rounded-xl" />)}
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-48 animate-pulse" />
        </div>
        <div className="col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-48 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Tổng quan ───────────────────────────────────────────────────────────

function TabOverview({ p, displayStage, displayIndustry, foundedDateDisplay, teamSizeValue }: any) {
  const currentNeeds: string[] = Array.isArray(p.currentNeeds) ? p.currentNeeds : [];

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: AlertTriangle, label: "Vấn đề", text: p.problemStatement || "Chưa cập nhật vấn đề", color: "text-rose-500" },
            { icon: Lightbulb,     label: "Giải pháp", text: p.solutionSummary || "Chưa cập nhật giải pháp", color: "text-amber-500" },
          ].map(({ icon: Icon, label, text, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", color)} />
                <h3 className="text-[13px] font-semibold text-slate-700">{label}</h3>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
          <h3 className="text-[13px] font-semibold text-slate-700">Mô tả chi tiết</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed">{p.description || p.oneLiner || "Chưa cập nhật mô tả"}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            <h3 className="text-[13px] font-semibold text-slate-700">Nhu cầu hiện tại</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentNeeds.length > 0
              ? currentNeeds.map((n: string) => <span key={n} className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25">{n}</span>)
              : <span className="text-[12px] text-slate-400">Chưa có thông tin nhu cầu</span>}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-4">
        {/* Quick Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thông tin nhanh</h3>
          <div className="space-y-3">
            {[
              { icon: Layers,       label: "Giai đoạn", val: displayStage || "-" },
              { icon: Building2,    label: "Ngành",     val: displayIndustry || "-" },
              { icon: Globe,        label: "Thị trường", val: p.marketScope || "-" },
              { icon: CheckCircle2, label: "Sản phẩm",  val: p.productStatus || "-" },
              { icon: Calendar,     label: "Thành lập", val: foundedDateDisplay || "-" },
              { icon: Users,        label: "Team size",  val: teamSizeValue ? `${teamSizeValue} người` : "-" },
              { icon: MapPin,       label: "Địa điểm",  val: [p.location, p.country].filter(Boolean).join(", ") || "-" },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
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
    </div>
  );
}

// ─── Tab: Kinh doanh ──────────────────────────────────────────────────────────

function TabBusiness({ p }: any) {
  const currentNeeds: string[] = Array.isArray(p.currentNeeds) ? p.currentNeeds : [];
  const hasData = p.problemStatement || p.solutionSummary || p.marketScope || p.productStatus;

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
        <Lightbulb className="w-8 h-8 text-slate-200 mx-auto" />
        <p className="text-[13px] text-slate-400">Chưa có thông tin kinh doanh.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-8 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-5">
          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-400" /> Vấn đề & Giải pháp</h3>
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Vấn đề</p>
            <p className="text-[13px] text-slate-600 leading-relaxed">{p.problemStatement || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Giải pháp</p>
            <p className="text-[13px] text-slate-600 leading-relaxed">{p.solutionSummary || "-"}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" /> Nhu cầu hiện tại</h3>
          <div className="flex flex-wrap gap-2">
            {currentNeeds.length > 0
              ? currentNeeds.map((n: string) => <span key={n} className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25">{n}</span>)
              : <span className="text-[12px] text-slate-400">Chưa có</span>}
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thị trường</h3>
          <InfoPair label="Phạm vi thị trường" value={p.marketScope} />
          <InfoPair label="Trạng thái sản phẩm" value={p.productStatus} />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Gọi vốn ─────────────────────────────────────────────────────────────

function TabFunding({ p, displayStage }: any) {
  const targetFunding = Number(p.fundingAmountSought) || 0;
  const raisedAmount = Number(p.currentFundingRaised) || 0;
  const fundingProgress = targetFunding > 0 ? Math.round((raisedAmount / targetFunding) * 100) : 0;

  if (!targetFunding && !raisedAmount) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
        <DollarSign className="w-8 h-8 text-slate-200 mx-auto" />
        <p className="text-[13px] text-slate-400">Chưa có thông tin gọi vốn.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      {[
        { label: "Giai đoạn gọi vốn", value: displayStage || "-", icon: TrendingUp, sub: "Vòng hiện tại" },
        { label: "Số vốn cần", value: targetFunding > 0 ? `$${targetFunding.toLocaleString()}` : "-", icon: DollarSign, sub: "USD" },
        { label: "Đã huy động", value: raisedAmount > 0 ? `$${raisedAmount.toLocaleString()}` : "-", icon: CheckCircle2, sub: `${fundingProgress}% mục tiêu` },
      ].map(({ label, value, icon: Icon, sub }) => (
        <div key={label} className="col-span-12 sm:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">{value}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
        </div>
      ))}
      <div className="col-span-12 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <p className="text-[12px] font-medium text-slate-500 mb-3">Tiến độ huy động vốn</p>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#e6cc4c] rounded-full transition-all" style={{ width: `${fundingProgress}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-slate-400">${raisedAmount.toLocaleString()} đã huy động</span>
          <span className="text-[11px] text-slate-400">Mục tiêu ${targetFunding.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Đội ngũ & Xác thực ──────────────────────────────────────────────────

function TabTeam({ p }: any) {
  const members: any[] = Array.isArray(p.teamMembers) ? p.teamMembers : Array.isArray(p.team) ? p.team : [];

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-8 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-5">
          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Thành viên cốt cán ({members.length})
          </h3>
          <div className="divide-y divide-slate-100">
            {members.length > 0 ? members.map((m: any, idx: number) => (
              <div key={m.teamMemberID ?? m.id ?? idx} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  {(m.photoURL || m.PhotoURL) ? (
                    <Image src={m.photoURL ?? m.PhotoURL} alt={m.fullName ?? m.name ?? "Member"} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-[13px] font-bold">
                      {(m.fullName ?? m.FullName ?? m.name ?? "?")[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-slate-800">{m.fullName ?? m.FullName ?? m.name ?? "Thành viên"}</p>
                      {(m.isFounder || m.IsFounder) && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100/50 text-amber-700 text-[10px] font-bold border border-amber-200/50">FOUNDER</span>
                      )}
                    </div>
                    {(m.linkedInURL || m.LinkedInURL) && (
                      <a href={m.linkedInURL ?? m.LinkedInURL} target="_blank" rel="noreferrer" className="hover:bg-blue-50 p-1.5 rounded-lg transition-colors flex-shrink-0">
                        <Image src="/linkedin.svg" alt="LinkedIn" width={16} height={16} />
                      </a>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium">
                    {[m.title ?? m.Title, m.role ?? m.Role].filter(Boolean).join(" · ")}
                    {Number(m.yearsOfExperience) > 0 ? ` · ${m.yearsOfExperience} năm kinh nghiệm` : ""}
                  </p>
                  {(m.bio || m.Bio) && <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{m.bio ?? m.Bio}</p>}
                </div>
              </div>
            )) : <p className="text-[13px] text-slate-400 italic">Chưa có thông tin thành viên.</p>}
          </div>
        </div>

        {p.metricSummary && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
            <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e6cc4c]" /> Chỉ số traction
            </h3>
            <p className="text-[13px] text-slate-600 leading-relaxed font-mono bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{p.metricSummary}</p>
          </div>
        )}
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-4">
        {p.enterpriseCode && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Pháp lý</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-[12px] font-medium text-emerald-700">Đã đăng ký doanh nghiệp</span>
            </div>
            <InfoPair label="Mã số doanh nghiệp" value={p.enterpriseCode} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Liên hệ ─────────────────────────────────────────────────────────────

function TabContact({ p }: any) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
        <h3 className="text-[13px] font-semibold text-slate-700">Liên hệ trực tiếp</h3>
        <div className="space-y-3">
          <InfoPair label="Email" value={p.contactEmail} />
          <InfoPair label="Điện thoại" value={p.contactPhone} />
          <InfoPair label="Địa chỉ" value={[p.location, p.country].filter(Boolean).join(", ") || undefined} />
        </div>
      </div>
      <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
        <h3 className="text-[13px] font-semibold text-slate-700">Liên kết</h3>
        <div className="space-y-3">
          <InfoPair label="Website" value={p.website} isLink />
          <InfoPair label="LinkedIn" value={p.linkedInURL} isLink />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Tài liệu ───────────────────────────────────────────────────────────

function TabDocuments({ startupId }: { startupId: number }) {
  const [startupDocs, setStartupDocs] = useState<IDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  useEffect(() => {
    if (!startupId || startupId <= 0) return;
    let cancelled = false;
    (async () => {
      setDocsLoading(true);
      try {
        const res = await GetStartupDocuments(startupId);
        if (!cancelled && res?.isSuccess) setStartupDocs(res.data ?? []);
      } catch { /* silent */ }
      finally { if (!cancelled) setDocsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [startupId]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100/60">
            <FolderOpen className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-[16px] font-bold text-[#0f172a]">Tài liệu Data Room</h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">{startupDocs.length} tài liệu</span>
      </div>
      <div className="px-7 py-5">
        {docsLoading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCcw className="w-4 h-4 text-slate-300 animate-spin" />
            <span className="ml-2 text-[12px] text-slate-400">Đang tải...</span>
          </div>
        ) : startupDocs.length === 0 ? (
          <div className="text-center py-6">
            <FolderOpen className="w-6 h-6 text-slate-200 mx-auto mb-2" />
            <p className="text-[13px] text-slate-400">Chưa có tài liệu nào được chia sẻ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {startupDocs.map((doc) => {
              const docType = (doc.documentType ?? "").toLowerCase();
              const color = docType.includes("pitch") ? "text-red-500"
                : docType.includes("business") || docType.includes("financ") ? "text-green-500"
                : docType.includes("legal") ? "text-blue-500"
                : "text-slate-500";
              const label = docType.includes("pitch") ? "Pitch Deck"
                : docType.includes("business") ? "Business Plan"
                : docType.includes("financ") ? "Tài chính"
                : docType.includes("legal") ? "Pháp lý"
                : doc.documentType ?? "Khác";
              const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("vi-VN") : "—";

              return (
                <div key={doc.documentID} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-[#e6cc4c]/40 transition-all group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:bg-[#e6cc4c]/10 transition-colors flex-shrink-0">
                      <FileTextIcon className={cn("w-5 h-5", color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-slate-700 group-hover:text-[#0f172a] transition-colors truncate">{doc.title ?? "Untitled"}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{label} • {uploadDate} • v{doc.version ?? "1"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                    {doc.fileUrl && (
                      <a
                        href={/\.pdf(\?|$)/i.test(doc.fileUrl)
                          ? doc.fileUrl
                          : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.fileUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => { ViewDocument(doc.documentID).catch(() => {}); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                        title="Xem tài liệu"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("accessToken") ?? "";
                          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/${doc.documentID}/download`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!res.ok) throw new Error("Download failed");
                          const blob = await res.blob();
                          const cd = res.headers.get("content-disposition");
                          const match = cd?.match(/filename="?(.+?)"?$/);
                          const fileName = match?.[1] ?? `${doc.title ?? "document"}.pdf`;
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url; a.download = fileName;
                          document.body.appendChild(a); a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch { /* silent */ }
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all"
                      title="Tải xuống"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const startupId = Number(id);

  const [startup, setStartup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Tổng quan");

  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInvestor, setIsInvestor] = useState<boolean | null>(null);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "accepted">("none");
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [resolvedAiScore, setResolvedAiScore] = useState<number | null>(null);

  const fetchStartup = useCallback(async () => {
    if (!Number.isFinite(startupId) || startupId <= 0) {
      setError("Không tìm thấy thông tin startup.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await GetStartupById(startupId) as any;
      if ((res?.isSuccess || res?.success) && res.data) {
        const data = res.data;
        let score = extractAiScore(data);

        // Fallback: detail endpoint sometimes omits AI score while search endpoint has it.
        if ((score == null || score <= 0) && Number.isFinite(startupId) && startupId > 0) {
          try {
            const maxPages = 4;
            for (let page = 1; page <= maxPages && (score == null || score <= 0); page++) {
              const searchRes = await SearchStartups(undefined, page, 100) as any;
              const isSuccess = searchRes?.isSuccess || searchRes?.success || searchRes?.statusCode === 200;
              if (!isSuccess) continue;

              const items = searchRes?.data?.items || searchRes?.data?.data || searchRes?.items || [];
              if (!Array.isArray(items) || items.length === 0) continue;

              const matched = items.find((x: any) => Number(x?.startupID ?? x?.startupId ?? x?.StartupID ?? 0) === startupId);
              const fallbackScore = extractAiScore(matched);
              if (fallbackScore != null) {
                score = fallbackScore;
                break;
              }
            }
          } catch {
            // non-blocking fallback
          }
        }

        // Final fallback: resolve score from AI evaluation history by startupId.
        if ((score == null || score <= 0) && Number.isFinite(startupId) && startupId > 0) {
          try {
            const historyRes = await GetEvaluationHistory(startupId) as any;
            const historyItems = historyRes?.data ?? historyRes ?? [];
            const historyScore = extractLatestHistoryScore(historyItems);
            if (historyScore != null) score = historyScore;

            if (score == null || score <= 0) {
              const latestRunId = extractLatestCompletedRunId(historyItems);
              if (latestRunId > 0) {
                const reportRes = await GetEvaluationReport(latestRunId) as any;
                const reportPayload = reportRes?.data?.report ?? reportRes?.data ?? reportRes;
                const reportScore = extractAiScore(reportPayload);
                if (reportScore != null) score = reportScore;
              }
            }
          } catch {
            // non-blocking fallback
          }
        }

        setResolvedAiScore(score ?? 0);
        setStartup(data);
      } else {
        const code = getErrorCode(res);
        setError(code === "STARTUP_NOT_FOUND" || res?.statusCode === 404
          ? "Không tìm thấy startup."
          : getErrorMessage(res) || "Không tải được thông tin startup.");
      }
    } catch (err: any) {
      setError(getErrorCode(err) === "STARTUP_NOT_FOUND" || err?.response?.status === 404
        ? "Không tìm thấy startup."
        : getErrorMessage(err) || "Không tải được thông tin startup.");
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => { void fetchStartup(); }, [fetchStartup]);

  useEffect(() => {
    const checkRole = async () => {
      try { setIsInvestor(Boolean((await GetInvestorProfile())?.isSuccess)); }
      catch { setIsInvestor(false); }
    };

    const checkConnection = async () => {
      if (!Number.isFinite(startupId) || startupId <= 0) return;
      try {
        const [sentRes, receivedRes] = await Promise.all([
          GetSentConnections(1, 20, undefined, startupId) as any,
          GetReceivedConnections(1, 20, undefined, startupId) as any,
        ]);
        const getItems = (res: any) => {
          if (!res?.isSuccess && !res?.success) return [];
          const d = res.data as any;
          return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.items) ? d.items : [];
        };
        const allConns = [...getItems(sentRes), ...getItems(receivedRes)];
        const match = allConns[0] ?? allConns.find((c: any) => Number(c?.startupID ?? c?.startupId ?? c?.StartupID ?? null) === startupId);
        if (match) {
          const status = (match.connectionStatus || "").toLowerCase();
          if (status === "accepted" || status === "indiscussion") {
            setConnectionStatus("accepted");
            setConnectionId(match.connectionID);
          } else if (status === "requested") {
            setConnectionStatus("pending");
          }
        }
      } catch { /* non-blocking */ }
    };

    const checkWatchlist = async () => {
      if (!Number.isFinite(startupId) || startupId <= 0) return;
      try {
        const res = await GetInvestorWatchlist(1, 200) as any;
        if (!res?.isSuccess) return;
        const data = res.data as any;
        const items = Array.isArray(res.data) ? res.data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : [];
        if (items.some((r: any) => Number(r?.startupID ?? r?.startupId ?? r?.StartupID ?? null) === startupId)) setIsFollowing(true);
      } catch { /* non-blocking */ }
    };

    void checkRole();
    void checkConnection();
    void checkWatchlist();
  }, [startupId]);

  const notifyWatchlistUpdated = () => {
    try {
      if ((window as any).BroadcastChannel) {
        const bc = new BroadcastChannel("watchlist-updates");
        bc.postMessage({ type: "refresh" });
        bc.close();
      } else {
        localStorage.setItem("watchlist-refresh", Date.now().toString());
      }
    } catch { /* ignore */ }
  };

  const handleFollowClick = async () => {
    if (isProcessing || !Number.isFinite(startupId)) return;
    setIsProcessing(true);
    try {
      if (!isFollowing) {
        const res = await AddToWatchlist({ startupID: startupId }) as any;
        if (res?.isSuccess) { setIsFollowing(true); notifyWatchlistUpdated(); toast.success("Đã thêm vào danh sách theo dõi"); }
        else toast.error(getErrorMessage(res) || "Không thể thêm theo dõi");
      } else {
        const res = await RemoveFromWatchlist(startupId) as any;
        if (res?.isSuccess) { setIsFollowing(false); notifyWatchlistUpdated(); toast.success("Đã gỡ khỏi danh sách theo dõi"); }
        else toast.error(getErrorMessage(res) || "Không thể bỏ theo dõi");
      }
    } catch (e: any) { toast.error(getErrorMessage(e) || "Lỗi khi cập nhật danh sách theo dõi"); }
    finally { setIsProcessing(false); }
  };



  if (loading) return <ProfileSkeleton />;

  if (error || !startup) {
    return (
      <div className="max-w-[1100px] mx-auto flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-[16px] font-semibold text-slate-800">{error ?? "Không tìm thấy startup."}</p>
        <div className="flex gap-3">
          <button onClick={fetchStartup} className="inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2 text-[13px] font-medium text-white hover:bg-slate-700">Thử lại</button>
          <Link href="/investor/startups" className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-200">
            <Building2 className="w-4 h-4" /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const palette = getMonogramPalette(Number(startup.startupID ?? startupId));
  const companyName = startup.companyName ?? "Startup";
  const initials = companyName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const displayStage = STAGE_LABELS[startup.stage?.toString()] || STAGE_LABELS[startup.fundingStage?.toString()] || startup.fundingStage || startup.stage;
  const displayIndustry = startup.parentIndustryName
    ? `${startup.parentIndustryName} / ${startup.industryName || startup.industry || ""}`
    : (startup.industryName || startup.industry);
  const teamSizeValue = startup.teamSize ?? startup.TeamSize;
  const targetFunding = Number(startup.fundingAmountSought) || 0;
  const aiScore = resolvedAiScore ?? extractAiScore(startup) ?? 0;

  const foundedDateDisplay = startup.foundedDate
    ? new Date(startup.foundedDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  const tabProps = { p: startup, displayStage, displayIndustry, foundedDateDisplay, teamSizeValue };

  return (
    <div className="max-w-[1100px] mx-auto space-y-5 pb-16">
      {/* ── Hero Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="h-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative rounded-t-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] rounded-t-2xl" />
        </div>

        <div className="px-7 pb-7">
          {/* Logo */}
          <div className="-mt-10 mb-4 relative z-10">
            <div className={cn("w-20 h-20 rounded-2xl border-[3px] border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0 text-white font-bold text-[20px] tracking-tight", palette.bg)}>
              {startup.logoURL
                ? <img src={startup.logoURL} alt={companyName} className="w-full h-full object-cover" />
                : initials}
            </div>
          </div>

          {/* Name + oneLiner + action buttons */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">{companyName}</h1>
                {startup.profileStatus === "Approved" && (
                  <BadgeCheck className="w-5 h-5 text-teal-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-[13px] text-slate-500">{startup.oneLiner || "Chưa có khẩu hiệu"}</p>
            </div>

            {/* Action buttons + AI Score */}
            <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                {isInvestor === false ? (
                  <button onClick={() => toast.error("Chỉ Nhà đầu tư mới có thể theo dõi startup.")}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-slate-400">
                    <Bookmark className="w-4 h-4" /> Chỉ Nhà đầu tư
                  </button>
                ) : (
                  <button
                    onClick={() => { if (isFollowing) setShowUnfollowConfirm(true); else void handleFollowClick(); }}
                    disabled={isProcessing}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all disabled:opacity-60",
                      isFollowing
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-slate-200 bg-[#f8f8f6] text-[#171611] hover:bg-slate-100"
                    )}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
                    {isFollowing ? "Đã theo dõi" : "Theo dõi"}
                  </button>
                )}

                {connectionStatus === "accepted" ? (
                  <Link
                    href={`/investor/messaging${connectionId ? `?connectionId=${connectionId}` : ''}`}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  >
                    <Handshake className="w-4 h-4" />
                    Đã kết nối · Nhắn tin
                  </Link>
                ) : (
                  <button
                    onClick={() => { if (connectionStatus === "pending") { toast.info("Yêu cầu kết nối đang chờ phản hồi."); return; } setShowConnectModal(true); }}
                    disabled={connectionStatus === "pending"}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all disabled:opacity-60",
                      connectionStatus === "pending"
                        ? "border border-amber-200 bg-amber-50 text-amber-600"
                        : "bg-[#e6cc4c] text-[#171611] hover:brightness-95"
                    )}
                  >
                    <Handshake className="w-4 h-4" />
                    {connectionStatus === "pending" ? "Đang chờ phản hồi" : "Đề nghị kết nối"}
                  </button>
                )}
              </div>

              {/* AI Score — compact, dưới buttons */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e6cc4c]/30 bg-[#fdfbe9]">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A000]" />
                <span className="text-[11px] font-semibold text-[#C8A000] uppercase tracking-wide">Điểm AI</span>
                <span className="text-[15px] font-black text-[#171611] leading-none">{aiScore}</span>
                <span className="text-[11px] text-slate-400 font-medium">/100</span>
              </div>
            </div>
          </div>

          {/* Unfollow dialog */}
          <Dialog open={showUnfollowConfirm} onOpenChange={setShowUnfollowConfirm}>
            <DialogContent className="sm:max-w-[400px] p-0 rounded-2xl border-none shadow-2xl overflow-hidden bg-white">
              {/* Header – red tone */}
              <div className="bg-red-50 px-6 py-5 border-b border-red-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-red-200/30 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <DialogHeader>
                      <DialogTitle className="text-[17px] font-bold text-[#171611] leading-snug">
                        Xác nhận hủy theo dõi
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-neutral-500 font-medium mt-1">Hành động này không thể hoàn tác.</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <DialogDescription className="text-sm text-neutral-600 leading-relaxed">
                  Bạn có chắc muốn bỏ theo dõi{" "}
                  <span className="font-semibold text-[#171611]">"{companyName}"</span>{" "}
                  không? Startup này sẽ bị xóa khỏi danh sách theo dõi của bạn.
                </DialogDescription>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowUnfollowConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-colors"
                >
                  Giữ lại
                </button>
                <button
                  onClick={async () => { setShowUnfollowConfirm(false); await handleFollowClick(); }}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-60 disabled:shadow-none"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bỏ theo dõi"}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Connect modal */}
          <ConnectStartupModal
            open={showConnectModal}
            onOpenChange={setShowConnectModal}
            startup={{ id: startup.startupID ?? startupId, name: companyName, industry: displayIndustry || "—", stage: displayStage || "—" }}
            onSuccess={() => setConnectionStatus("pending")}
          />

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {displayStage && <Tag variant="green"><TrendingUp className="w-3 h-3" />{displayStage}</Tag>}
            <Tag><Building2 className="w-3 h-3 text-slate-400" />{displayIndustry || "Chưa có ngành"}</Tag>
            {startup.marketScope && <Tag variant="blue">{startup.marketScope}</Tag>}
            <span className="text-slate-200 text-[14px] mx-0.5">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="w-3 h-3" />{startup.location || "Chưa rõ vị trí"}</span>
            {startup.productStatus && <span className="inline-flex items-center gap-1 text-[11px] text-slate-400"><span className="text-slate-200">·</span> {startup.productStatus}</span>}
            {startup.enterpriseCode && <Tag variant="green"><CheckCircle2 className="w-3 h-3" />Đã đăng ký doanh nghiệp</Tag>}
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-slate-100">
            {[
              ...(foundedDateDisplay ? [{ icon: Calendar, label: "Thành lập", value: foundedDateDisplay }] : []),
              ...(targetFunding > 0 ? [{ icon: DollarSign, label: "Vốn gọi", value: `$${targetFunding.toLocaleString()}` }] : []),
              ...(teamSizeValue ? [{ icon: Users, label: "Quy mô", value: `${teamSizeValue} người` }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-700 leading-none">{value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap",
              activeTab === tab ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "Tổng quan" && <TabOverview {...tabProps} />}
      {activeTab === "Kinh doanh" && <TabBusiness p={startup} />}
      {activeTab === "Gọi vốn" && <TabFunding p={startup} displayStage={displayStage} />}
      {activeTab === "Đội ngũ & Xác thực" && <TabTeam p={startup} />}
      {activeTab === "Tài liệu" && <TabDocuments startupId={startupId} />}
      {activeTab === "Liên hệ" && <TabContact p={startup} />}
    </div>
  );
}
