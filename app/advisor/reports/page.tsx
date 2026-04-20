"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search, Inbox, FileText, Clock, ChevronRight,
  AlertCircle, Filter, MoreHorizontal, History, Edit3, Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { FormatBadge } from "@/components/advisor/consulting-format-badge";
import type { IConsultationReport, ConsultationReportStatus } from "@/types/advisor-report";
import type { IConsultingSession } from "@/types/advisor-consulting";
import { getAdvisorReports } from "@/services/advisor/advisor-report.api";
import { GetAdvisorMentorships } from "@/services/advisor/advisor.api";
import { IssueReportModal, type IssueReportContext } from "@/components/shared/issue-report-modal";

/* ─── Constants ──────────────────────────────────────────────── */
type TabKey = "all" | "pending" | ConsultationReportStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ báo cáo" },
  { key: "Draft", label: "Bản nháp" },
  { key: "NeedsMoreInfo", label: "Cần bổ sung" },
  { key: "Passed", label: "Đã hoàn tất" },
];

const STATUS_LABEL: Record<ConsultationReportStatus, string> = {
  Draft: "Bản nháp",
  Passed: "Đã hoàn tất",
  Failed: "Không đạt",
  NeedsMoreInfo: "Cần bổ sung",
  PendingReview: "Đang xét duyệt",
};

const STATUS_CFG: Record<ConsultationReportStatus, { dot: string; badge: string }> = {
  Draft: { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200/80" },
  Passed: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  Failed: { dot: "bg-red-400", badge: "bg-red-50 text-red-600 border-red-200/80" },
  NeedsMoreInfo: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-600 border-blue-200/80" },
  PendingReview: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
};

/* ─── Helpers ────────────────────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─── Components ─────────────────────────────────────────────── */

function ReportCard({ report, onReport }: { report: IConsultationReport; onReport: (report: IConsultationReport) => void }) {
  const cfg = STATUS_CFG[report.reviewStatus] ?? STATUS_CFG['Draft'];
  const avatarGradient = getAvatarColor(report.startup.displayName);
  
  return (
    <Link 
      href={`/advisor/reports/${report.sessionId || report.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200"
    >
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-4 min-w-0">
            {/* Avatar */}
            {report.startup.logoUrl ? (
              <img
                src={report.startup.logoUrl}
                alt={report.startup.displayName}
                className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm transition-transform group-hover:scale-105 border border-slate-100"
              />
            ) : (
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[15px] font-bold shrink-0 shadow-sm transition-transform group-hover:scale-105", avatarGradient)}>
                {report.startup.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border",
                  cfg.badge
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                  {STATUS_LABEL[report.reviewStatus] ?? STATUS_LABEL['Draft']}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                  Cập nhật {formatDate(report.lastEditedAt)}
                </span>
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#0f172a] transition-colors truncate">
                {report.title}
              </h3>
              <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1 font-medium">
                Startup: <strong className="text-slate-700">{report.startup.displayName}</strong> &middot; {formatDate(report.sessionDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {report.reviewStatus === "Passed" && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReport(report); }}
                title="Báo cáo sự cố"
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0f172a] group-hover:text-white transition-all shadow-sm">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PendingSessionCard({ session }: { session: IConsultingSession }) {
  return (
    <div className="bg-amber-50/40 rounded-2xl border-2 border-amber-200 px-6 py-5 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200/50 uppercase tracking-widest">
            Cần viết báo cáo
          </span>
          <span className="text-[11px] text-amber-600 font-semibold">
            Hoàn thành {formatDate(session.completedAt || "")}
          </span>
        </div>
        <h3 className="text-[15px] font-bold text-slate-900 truncate">
          {session.objective}
        </h3>
        <p className="text-[13px] text-slate-600 mt-1">
          Startup: <strong className="text-slate-900">{session.startup.displayName}</strong>
        </p>
      </div>
      <Link 
        href={`/advisor/reports/create?sessionId=${session.id}`}
        className="px-5 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-[#1e293b] transition-all shadow-sm shadow-slate-200 whitespace-nowrap flex items-center gap-2"
      >
        <Edit3 className="w-4 h-4" />
        Viết báo cáo
      </Link>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function AdvisorReportsPage() {
  const [reports, setReports] = useState<IConsultationReport[]>([]);
  const [pendingSessions, setPendingSessions] = useState<IConsultingSession[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [issueContext, setIssueContext] = useState<IssueReportContext | null>(null);

  const openIssue = (report: IConsultationReport) => {
    const rid = Number(report.id);
    if (!Number.isFinite(rid) || rid <= 0) return;
    setIssueContext({
      entityType: "AdvisorReport",
      entityId: rid,
      entityTitle: `Báo cáo · ${report.title}`,
      otherPartyName: report.startup.displayName,
    });
  };

  useEffect(() => {
    async function init() {
      try {
        const [repData, completedRes, inProgressRes] = await Promise.all([
          getAdvisorReports(),
          GetAdvisorMentorships({ status: 'Completed', page: 1, pageSize: 100 }).catch(() => ({ data: {} })),
          GetAdvisorMentorships({ status: 'InProgress', page: 1, pageSize: 100 }).catch(() => ({ data: {} })),
        ]);

        const extractItems = (res: any) =>
          (res as any).data?.data?.items ||
          (res as any).data?.data?.data ||
          (res as any).data?.items ||
          [];

        const completedItems = extractItems(completedRes);
        const inProgressItems = extractItems(inProgressRes);
        const now = Date.now();

        // InProgress nhưng thời gian họp đã qua → advisor được phép viết báo cáo
        const pastInProgress = inProgressItems.filter((s: any) => {
          const start = s.scheduledStartAt ? new Date(s.scheduledStartAt).getTime() : 0;
          const duration = (s.durationMinutes || s.duration || 60) * 60 * 1000;
          return start + duration <= now;
        });

        const allItems = [...completedItems, ...pastInProgress];

        const mapSession = (s: any): IConsultingSession => ({
          id: s.mentorshipID?.toString() || s.id?.toString(),
          requestId: s.mentorshipID?.toString() || s.id?.toString(),
          objective: s.challengeDescription || s.topicsDiscussed || "Tư vấn khởi nghiệp",
          startup: { displayName: s.startupName || s.startup?.name || "Startup" } as any,
          scheduledStartAt: s.scheduledStartAt || "",
          scheduledEndAt: s.scheduledEndAt || "",
          timezone: s.timezone || "Asia/Ho_Chi_Minh",
          status: s.status || "COMPLETED",
          meetingMode: s.meetingMode || "GOOGLE_MEET",
          confirmation: s.confirmation || { startupConfirmedAt: null, advisorConfirmedAt: null, fullyConfirmed: false },
          completedAt: s.completedAt || s.createdAt || new Date().toISOString(),
        });

        const sesData: IConsultingSession[] = allItems.map(mapSession);

        // Filter sessions that don't have reports yet
        const existingSessionIds = new Set(repData.map(r => r.sessionId));
        const pending = sesData.filter(s => !existingSessionIds.has(s.id));

        setReports(repData);
        setPendingSessions(pending);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (activeTab !== "all" && activeTab !== "pending") {
      list = list.filter(r => r.reviewStatus === activeTab);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.startup.displayName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reports, activeTab, search]);

  const showPending = activeTab === "all" || activeTab === "pending";

  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto space-y-6 animate-in fade-in duration-400">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Báo cáo tư vấn</h1>
            <p className="text-[13px] text-slate-500 mt-1 font-medium">Lưu trữ và theo dõi các báo cáo kết quả tư vấn của bạn.</p>
          </div>
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text"
              placeholder="Tìm theo tiêu đề, startup..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-11 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all bg-white placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200/60 mb-2 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            let count = 0;
            if (tab.key === "all") count = reports.length + pendingSessions.length;
            else if (tab.key === "pending") count = pendingSessions.length;
            else count = reports.filter(r => r.reviewStatus === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2.5 text-[13px] font-bold whitespace-nowrap border-b-2 -mb-px transition-all flex items-center gap-2",
                  activeTab === tab.key
                    ? "border-[#0f172a] text-[#0f172a]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-black leading-none",
                    activeTab === tab.key ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Section */}
            {showPending && !search && pendingSessions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <h2 className="text-[13px] font-bold text-amber-700 uppercase tracking-[0.1em]">Cần phản hồi sớm</h2>
                  </div>
                  <span className="text-[11px] text-amber-600 font-semibold italic">Phản hồi sớm để tránh quá hạn báo cáo</span>
                </div>
                <div className="grid gap-4">
                  {pendingSessions.map(ses => (
                    <PendingSessionCard key={ses.id} session={ses} />
                  ))}
                </div>
              </div>
            )}

            {/* Existing Reports Section */}
            <div className="space-y-4">
              {(activeTab === "all" || activeTab === "pending") && !search && reports.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.1em]">Danh sách lưu trữ</h2>
                </div>
              )}
              
              <div className="grid gap-3">
                {filteredReports.map(rep => (
                  <ReportCard key={rep.id} report={rep} onReport={openIssue} />
                ))}
              </div>

              {filteredReports.length === 0 && (activeTab !== "all" && activeTab !== "pending" || search) && (
                <div className="bg-white rounded-2xl border border-slate-200/80 py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900">Không tìm thấy báo cáo nào</h3>
                  <p className="text-[13px] text-slate-500 mt-1 px-10">
                    {search ? `Không có báo cáo nào khớp với từ khóa "${search}"` : "Bạn chưa có báo cáo nào ở trạng thái này."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <IssueReportModal
        isOpen={!!issueContext}
        onClose={() => setIssueContext(null)}
        context={issueContext ?? undefined}
      />
    </AdvisorShell>
  );
}
