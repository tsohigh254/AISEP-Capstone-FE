"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, Clock, CheckCircle2, AlertCircle,
  ArrowRight, Flag,
} from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { FormatBadge } from "@/components/advisor/consulting-format-badge";
import type { IConsultingSession, ConsultingSessionStatus } from "@/types/advisor-consulting";
import { getMockSessions } from "@/services/advisor/advisor-consulting.mock";
import { cn } from "@/lib/utils";
import { IssueReportModal, type IssueReportContext } from "@/components/shared/issue-report-modal";

/* ─── Vietnamese date helpers ────────────────────────────────── */

const VN_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function isSameWeek(d: Date, ref: Date) {
  const s = new Date(ref);
  const day = s.getDay();
  const diff = day === 0 ? 6 : day - 1;
  s.setDate(s.getDate() - diff);
  s.setHours(0, 0, 0, 0);
  const e = new Date(s);
  e.setDate(e.getDate() + 7);
  return d >= s && d < e;
}


/* ─── Status config ──────────────────────────────────────────── */

const STATUS_CFG: Record<ConsultingSessionStatus, { label: string; dot: string; badge: string }> = {
  PENDING_CONFIRMATION: { label: "Chờ xác nhận", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
  SCHEDULED: { label: "Đã xác nhận", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  COMPLETED: { label: "Hoàn thành", dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200/80" },
  CANCELLED: { label: "Đã huỷ", dot: "bg-red-400", badge: "bg-red-50 text-red-600 border-red-200/80" },
};

const DATE_ACCENT: Record<ConsultingSessionStatus, string> = {
  SCHEDULED: "border-l-emerald-500 bg-emerald-50/40",
  PENDING_CONFIRMATION: "border-l-amber-500 bg-amber-50/30",
  COMPLETED: "border-l-slate-400 bg-slate-50/50",
  CANCELLED: "border-l-red-400 bg-red-50/30",
};

/* ─── Tabs ───────────────────────────────────────────────────── */

type TabKey = "upcoming" | "completed";

/* ─── Page ───────────────────────────────────────────────────── */

export default function AdvisorSchedulePage() {
  const [sessions, setSessions] = useState<IConsultingSession[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [issueContext, setIssueContext] = useState<IssueReportContext | null>(null);

  const openIssue = (e: React.MouseEvent, session: IConsultingSession) => {
    e.preventDefault();
    e.stopPropagation();
    setIssueContext({
      entityType: "CONSULTING_SESSION",
      entityId: session.id,
      entityTitle: `Buổi tư vấn · ${session.objective}`,
      otherPartyName: session.startup.displayName,
    });
  };

  useEffect(() => { setSessions(getMockSessions()); }, []);

  const upcoming = sessions.filter(s => s.status === "PENDING_CONFIRMATION" || s.status === "SCHEDULED");
  const completed = sessions.filter(s => s.status === "COMPLETED" || s.status === "CANCELLED");
  const displayed = activeTab === "upcoming" ? upcoming : completed;

  const now = new Date();
  const thisWeek = upcoming.filter(s => isSameWeek(new Date(s.scheduledStartAt), now)).length;

  const stats = [
    { label: "Sắp tới", value: upcoming.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
    { label: "Tuần này", value: thisWeek, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
    { label: "Đã hoàn thành", value: completed.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
  ];

  return (
    <AdvisorShell>
      <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-400">

        {/* Page header */}
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight">Lịch tư vấn</h1>
          <p className="text-[13px] text-slate-500 mt-1">Theo dõi các buổi tư vấn sắp tới và đã hoàn thành.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-4 py-3.5 flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center ring-1 shrink-0", s.bg, s.ring)}>
                <s.icon className={cn("w-4 h-4", s.color)} />
              </div>
              <div>
                <p className="text-[20px] font-bold text-slate-900 leading-none">{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-1 inline-flex gap-1">
          {(["upcoming", "completed"] as TabKey[]).map(key => {
            const label = key === "upcoming" ? "Sắp tới" : "Đã hoàn thành";
            const count = key === "upcoming" ? upcoming.length : completed.length;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5",
                  activeTab === key
                    ? "bg-[#0f172a] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                {label}
                <span className={cn(
                  "text-[10px] rounded-full px-1.5 py-0.5 font-bold leading-none",
                  activeTab === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Session cards */}
        {displayed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-[13px] text-slate-500 font-medium">
              {activeTab === "upcoming" ? "Không có buổi tư vấn sắp tới" : "Chưa có buổi tư vấn nào hoàn thành"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayed.map(session => {
              const start = new Date(session.scheduledStartAt);
              const cfg = STATUS_CFG[session.status];

              return (
                <Link
                  key={session.id}
                  href={`/advisor/requests/${session.requestId}`}
                  className="group block bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-slate-300/80 transition-all duration-200 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Left date accent */}
                    <div className={cn(
                      "w-20 shrink-0 border-l-4 flex flex-col items-center justify-center py-4",
                      DATE_ACCENT[session.status]
                    )}>
                      <span className="text-[10px] text-slate-400 font-semibold">{VN_DAYS[start.getDay()]}</span>
                      <span className="text-[24px] font-bold text-slate-900 leading-none mt-0.5">{start.getDate()}</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Thg {start.getMonth() + 1}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-bold text-slate-900">{session.startup.displayName}</span>
                          <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-500 truncate mt-0.5">{session.objective}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-[12px] text-slate-600 flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatTime(session.scheduledStartAt)} - {formatTime(session.scheduledEndAt)}
                          </span>
                          <FormatBadge format={session.meetingMode} size="sm" />
                          {/* Confirmation dots */}
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px]">
                              {session.confirmation.advisorConfirmedAt
                                ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                : <Clock className="w-3 h-3 text-slate-300" />
                              }
                              <span className={session.confirmation.advisorConfirmedAt ? "text-emerald-600 font-medium" : "text-slate-400"}>Advisor</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px]">
                              {session.confirmation.startupConfirmedAt
                                ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                : <Clock className="w-3 h-3 text-slate-300" />
                              }
                              <span className={session.confirmation.startupConfirmedAt ? "text-emerald-600 font-medium" : "text-slate-400"}>Startup</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {session.status === "COMPLETED" && (
                          <button
                            onClick={(e) => openIssue(e, session)}
                            title="Báo cáo sự cố"
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
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
