"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, ArrowLeft, History, Search, ArrowUpDown,
  CheckCircle2, XCircle, Clock, ChevronRight, FileText,
  BarChart3, Filter,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIEvaluationReport, AIEvaluationStatus } from "../types";
import { GetStartupProfile } from "@/services/startup/startup.api";
import { GetEvaluationHistory } from "@/services/ai/ai.api";
import { mapStatusToUI, normalizeTo100 } from "../canonical-mapper";

/* ─── Status config ────────────────────────────────────────── */

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  COMPLETED:         { label: "Hoàn thành", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  FAILED:            { label: "Thất bại",   color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100" },
  QUEUED:            { label: "Đang chờ",   color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100" },
  ANALYZING:         { label: "Phân tích",  color: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-100" },
  INSUFFICIENT_DATA: { label: "Thiếu dữ liệu", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
};

/* ─── Page ─────────────────────────────────────────────────── */

export default function AIEvaluationHistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AIEvaluationStatus>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [reports, setReports] = useState<AIEvaluationReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      setLoading(true);
      setLoadError(null);
      try {
        const profileRes = await GetStartupProfile() as unknown as any;
        const startupId = profileRes?.data?.startupID ?? profileRes?.data?.StartupID;
        if (!startupId) {
          setReports([]);
          return;
        }
        const histRes = await GetEvaluationHistory(startupId) as unknown as any;
        const list = histRes?.data ?? histRes ?? [];
        const mapped = (list || []).map((r: any, idx: number) => {
          const status = mapStatusToUI(r.status ?? r.Status ?? r.StatusName ?? "");
          const overallScore = normalizeTo100(r.overallScore ?? r.OverallScore ?? r.overall_score ?? 0);
          const calculatedAt = r.updatedAt ?? r.updated_at ?? r.submittedAt ?? r.submitted_at ?? "";
          return {
            evaluationId: String(r.runId ?? r.RunId ?? r.id ?? r.Id ?? idx),
            startupId: String(r.startupId ?? r.StartupId ?? r.startupID ?? ""),
            status,
            overallScore,
            pitchDeckScore: 0,
            businessPlanScore: 0,
            teamScore: 0,
            marketScore: 0,
            productScore: 0,
            tractionScore: 0,
            financialScore: 0,
            calculatedAt,
            generatedAt: r.generatedAt ?? r.generated_at ?? "",
            isCurrent: idx === 0,
            configVersion: r.configVersion ?? r.config_version ?? "",
            modelVersion: r.modelVersion ?? r.model_version ?? "",
            promptVersion: r.promptVersion ?? r.prompt_version ?? "",
            snapshotLabel: r.snapshotLabel ?? r.label ?? "",
            warningMessages: [],
            executiveSummary: "",
            strengths: [],
            opportunities: [],
            risks: [],
            concerns: [],
            gaps: [],
            recommendations: [],
            subMetrics: { team: [], market: [], product: [], traction: [], financial: [] },
          } as AIEvaluationReport;
        });
        if (!cancelled) setReports(mapped);
      } catch (err: any) {
        console.error("Load evaluation history failed", err);
        setLoadError(err?.message ?? "Không thể tải lịch sử đánh giá");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, []);

  // Filter & sort
  const filtered = reports
    .filter(r => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.snapshotLabel.toLowerCase().includes(q) || r.evaluationId.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = a.calculatedAt;
      const dateB = b.calculatedAt;
      return sortOrder === "newest" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
    });

  const FILTER_TABS = [
    { label: "Tất cả", value: "all" as const },
    { label: "Hoàn thành", value: "COMPLETED" as const },
    { label: "Thất bại", value: "FAILED" as const },
  ];

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-500">

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow p-10 text-center mb-6">
            <Loader2 className="w-8 h-8 text-[#eec54e] mx-auto animate-spin mb-3" />
            <p className="text-sm text-slate-500">Đang tải lịch sử đánh giá...</p>
          </div>
        )}

        {loadError && (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4 mb-6">
            <p className="text-sm text-red-700">{loadError}</p>
          </div>
        )}
        {/* Back */}
        <button
          onClick={() => router.push("/startup/ai-evaluation")}
          className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Đánh giá AI
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#eec54e]/10 flex items-center justify-center">
                <History className="w-5 h-5 text-[#eec54e]" />
              </div>
              <h1 className="text-[22px] font-bold text-slate-900">Lịch sử đánh giá</h1>
            </div>
            <p className="text-[13px] text-slate-400">
              Xem lại tất cả các lượt đánh giá AI đã thực hiện cho startup của bạn.
            </p>
          </div>
          <button
            onClick={() => router.push("/startup/ai-evaluation/request")}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-slate-700 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Đánh giá mới
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã đánh giá..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1.5">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all",
                    statusFilter === tab.value
                      ? "bg-[#0f172a] text-white"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <button
              onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-[12px] font-semibold hover:bg-slate-100 transition-all"
            >
              <ArrowUpDown className="w-3 h-3" />
              {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}
            </button>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-[14px] font-bold text-slate-400 mb-1">
              {reports.length === 0 ? "Chưa có lịch sử đánh giá" : "Không tìm thấy kết quả"}
            </p>
            <p className="text-[12px] text-slate-300">
              {reports.length === 0 ? "Yêu cầu đánh giá AI để bắt đầu." : "Thử thay đổi bộ lọc hoặc từ khóa."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(report => {
              const badge = STATUS_BADGE[report.status] ?? STATUS_BADGE.COMPLETED;
              const isCompleted = report.status === "COMPLETED";
              return (
                <div
                  key={report.evaluationId}
                  onClick={() => {
                    if (isCompleted) router.push(`/startup/ai-evaluation/${report.evaluationId}`);
                  }}
                  className={cn(
                    "group bg-white rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 transition-all",
                    isCompleted ? "border-slate-200/80 hover:border-amber-200 hover:shadow-[0_2px_8px_rgba(238,197,78,0.12)] cursor-pointer" : "border-slate-200/80",
                    report.isCurrent && "ring-2 ring-[#eec54e]/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Score circle */}
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0",
                      isCompleted
                        ? report.overallScore >= 75 ? "bg-emerald-50" : report.overallScore >= 50 ? "bg-amber-50" : "bg-red-50"
                        : "bg-slate-50"
                    )}>
                      {isCompleted ? (
                        <>
                          <span className={cn("text-[18px] font-black leading-none",
                            report.overallScore >= 75 ? "text-emerald-600" : report.overallScore >= 50 ? "text-amber-600" : "text-red-500"
                          )}>{report.overallScore}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">/100</span>
                        </>
                      ) : (
                        <XCircle className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-semibold text-slate-400">{report.evaluationId.toUpperCase()}</span>
                        <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", badge.color, badge.bg, badge.border)}>
                          {isCompleted ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                          {badge.label}
                        </span>
                        {report.isCurrent && (
                          <span className="px-2 py-0.5 bg-[#eec54e]/20 text-[#b8940a] rounded-full text-[10px] font-bold">Mới nhất</span>
                        )}
                      </div>
                      <p className="text-[14px] font-bold text-slate-900 truncate">{report.snapshotLabel}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                        <span>{report.calculatedAt}</span>
                        <span>v{report.configVersion}</span>
                      </div>
                    </div>

                    {/* Scores row (completed only) */}
                    {isCompleted && (
                      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                        {[
                          { label: "Team", score: report.teamScore },
                          { label: "Market", score: report.marketScore },
                          { label: "Product", score: report.productScore },
                        ].map(m => (
                          <div key={m.label} className="text-center px-2">
                            <p className={cn("text-[13px] font-bold",
                              m.score >= 75 ? "text-emerald-600" : m.score >= 50 ? "text-amber-600" : "text-red-500"
                            )}>{m.score}</p>
                            <p className="text-[9px] text-slate-400">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Arrow */}
                    {isCompleted && (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </StartupShell>
  );
}
