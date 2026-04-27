"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, ArrowLeft, FileText, History, RefreshCw, BarChart3,
  Loader2,
  ShieldCheck, CheckCircle2, AlertTriangle, XCircle, TrendingUp,
  ChevronDown, ChevronUp, Zap, Info, Users, Globe, Layout, Banknote,
  Clock, Tag, Cpu, BookOpen, Download, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatScore100, scoreChipColorClass } from "@/lib/ai-evaluation-score-ui";
import { SubMetric, Recommendation, AIEvaluationReport, AIEvaluationStatus } from "../types";
import { GetEvaluationReport, GetEvaluationStatus } from "@/services/ai/ai.api";
import { mapCanonicalToReport, mapStatusToUI } from "../canonical-mapper";

/* ─── Score Bar ────────────────────────────────────────────── */

function ScoreBar({ label, score, icon }: { label: string; score: number | null; icon: React.ReactNode }) {
  const n = score == null || Number.isNaN(Number(score)) ? null : Number(score);
  const color = n == null ? "bg-slate-200" : n >= 75 ? "bg-emerald-400" : n >= 50 ? "bg-amber-400" : "bg-red-400";
  const textClass = scoreChipColorClass(score);
  const widthPct = n == null ? 0 : Math.min(100, Math.max(0, n));
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold text-slate-700">{label}</span>
          <span className={cn("text-[13px] font-black tabular-nums", textClass)}>{formatScore100(score)}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${widthPct}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Expandable Section ───────────────────────────────────── */

function ExpandableSection({ title, icon, iconColor, children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; iconColor: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", iconColor)}>{icon}</div>
          <span className="text-[14px] font-bold text-slate-800">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  );
}

/* ─── Sub-metrics Table ────────────────────────────────────── */

function SubMetricsList({ metrics }: { metrics: SubMetric[] }) {
  if (metrics.length === 0) return <p className="text-[12px] text-slate-400 italic">Không có dữ liệu chi tiết.</p>;
  return (
    <div className="space-y-3">
      {metrics.map((m, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0 w-20">
            <span className={cn("text-[14px] font-black",
              m.score / m.maxScore >= 0.75 ? "text-emerald-600" : m.score / m.maxScore >= 0.5 ? "text-amber-600" : "text-red-500"
            )}>{m.score}</span>
            <span className="text-[11px] text-slate-400">/{m.maxScore}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-700">{m.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{m.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Priority badge ───────────────────────────────────────── */

const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  HIGH:   { label: "Cao",        color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100" },
  MEDIUM: { label: "Trung bình", color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100" },
  LOW:    { label: "Thấp",       color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100" },
};

/* ─── Page ─────────────────────────────────────────────────── */

export default function AIDetailedReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const idStr = Array.isArray(id) ? id[0] : (id ?? "");

  const [report, setReport] = useState<AIEvaluationReport | null>(null);
  const [rawPayload, setRawPayload] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [evalStatus, setEvalStatus] = useState<AIEvaluationStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<"merged" | "pitch_deck" | "business_plan">("merged");
  const searchParams = useSearchParams();
  const showDebug = !!(searchParams && (searchParams.get("debug") === "1" || searchParams.get("debug") === "true"));

  useEffect(() => {
    if (!idStr) return;
    const runId = parseInt(String(idStr), 10);
    if (isNaN(runId)) {
      setIsLoading(false);
      setLoadError("ID đánh giá không hợp lệ.");
      return;
    }

    let cancelled = false;

        async function fetchOnce() {
      try {
        const res = await GetEvaluationReport(runId) as unknown as any;
        if (res && (res.success || res.isSuccess)) {
          const payload = res.data ?? res;
          if (!cancelled) setRawPayload(payload);
          const evalDocTypes = payload.evaluatedDocumentTypes ?? payload.EvaluatedDocumentTypes ?? [];
          // If backend indicates report valid, map and return
          if (payload.isReportValid || payload.IsReportValid) {
            const canonical = payload.report ?? payload.Report ?? payload;
            const pdScore = payload.pitchDeckOverallScore ?? payload.PitchDeckOverallScore ?? null;
            const bpScore = payload.businessPlanOverallScore ?? payload.BusinessPlanOverallScore ?? null;
            const rawPD = payload.pitchDeckReport ?? payload.PitchDeckReport ?? null;
            const rawBP = payload.businessPlanReport ?? payload.BusinessPlanReport ?? null;
            const mapped = mapCanonicalToReport(runId, canonical, evalDocTypes, pdScore, bpScore, rawPD, rawBP, {
              submittedAt: payload.submittedAt ?? payload.SubmittedAt,
              updatedAt: payload.updatedAt ?? payload.UpdatedAt
            });
            if (!cancelled) setReport(mapped);
            return true;
          }
          // If payload.Report exists and looks complete, map anyway
          if (payload.report) {
            const mapped = mapCanonicalToReport(runId, payload.report, evalDocTypes, payload.pitchDeckOverallScore ?? null, payload.businessPlanOverallScore ?? null, payload.pitchDeckReport ?? null, payload.businessPlanReport ?? null, {
              submittedAt: payload.submittedAt ?? payload.SubmittedAt,
              updatedAt: payload.updatedAt ?? payload.UpdatedAt
            });
            if (!cancelled) setReport(mapped);
            return true;
          }
          return false;
        }
        // If backend returned an error-like object, surface message
        setLoadError(res?.message ?? "Không thể tải báo cáo");
        try {
          const status = await GetEvaluationStatus(runId) as unknown as any;
          // attach status info to error state if available
          if (status?.data) setLoadError(prev => (prev ? prev + ": " : "") + JSON.stringify(status.data));
        } catch {}
        return true;
      } catch (err: any) {
        console.error(err);
        setLoadError(err?.message ?? "Lỗi kết nối");
        try {
          const status = await GetEvaluationStatus(runId) as unknown as any;
          if (status?.data) setLoadError(prev => (prev ? prev + ": " : "") + JSON.stringify(status.data));
        } catch {}
        return true;
      }
    }

    (async () => {
      setIsLoading(true);
      try {
        let done = false;
        for (let i = 0; i < 12 && !done; i++) {
          done = await fetchOnce();
          if (done) break;
          await new Promise((r) => setTimeout(r, 2500));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  const currentReport = 
    selectedTab === "pitch_deck" 
      ? (report?.pitchDeckReport ?? null)
      : (selectedTab === "business_plan" 
          ? (report?.businessPlanReport ?? null)
          : report);

  if (isLoading) {
    return (
      <StartupShell>
        <div className="max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-500">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow p-10 text-center">
            <Loader2 className="w-8 h-8 text-[#eec54e] mx-auto animate-spin mb-3" />
            <p className="text-sm text-slate-500">Đang tải báo cáo...</p>
          </div>
        </div>
      </StartupShell>
    );
  }

  if (!report) {
  const runId = parseInt(String(idStr), 10);
    const checkStatus = async () => {
      if (isNaN(runId)) return;
      setStatusLoading(true);
      setLoadError(null);
      try {
        const sres = await GetEvaluationStatus(runId) as unknown as any;
        const spayload = sres?.data ?? sres ?? {};
        const newStatus = mapStatusToUI(spayload?.status ?? spayload?.Status ?? spayload?.StatusName ?? spayload?.statusName ?? "");
        setEvalStatus(newStatus);
        if (newStatus === "COMPLETED") {
          const rres = await GetEvaluationReport(runId) as unknown as any;
          const rdata = rres?.data ?? rres ?? {};
          const reportPayload = rdata?.report ?? rdata;
          const evalDocTypes = rdata?.evaluatedDocumentTypes ?? rdata?.EvaluatedDocumentTypes ?? [];
          setRawPayload(reportPayload);
          const mapped = mapCanonicalToReport(runId, reportPayload, evalDocTypes, rdata?.pitchDeckOverallScore ?? null, rdata?.businessPlanOverallScore ?? null, rdata?.pitchDeckReport ?? null, rdata?.businessPlanReport ?? null, {
            submittedAt: rdata?.submittedAt ?? rdata?.SubmittedAt,
            updatedAt: rdata?.updatedAt ?? rdata?.UpdatedAt
          });
          setReport(mapped);
        } else if (newStatus === "FAILED") {
          setLoadError("Đánh giá đã thất bại. Vui lòng kiểm tra lịch sử hoặc thử lại.");
        }
      } catch (err: any) {
        setLoadError(err?.message ?? "Lỗi khi kiểm tra trạng thái");
      } finally {
        setStatusLoading(false);
      }
    };

    return (
      <StartupShell>
        <div className="max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-500">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow p-10 text-center">
            <History className="w-8 h-8 text-[#eec54e] mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-2">Báo cáo chưa có hoặc chưa sẵn sàng cho ID này.</p>
            {loadError && <p className="text-sm text-red-600 mb-2">{loadError}</p>}
            {evalStatus && <p className="text-sm text-slate-600 mb-2">Trạng thái hiện tại: <strong>{evalStatus}</strong></p>}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={checkStatus} disabled={statusLoading} className="h-10 px-4 rounded-xl bg-[#eec54e] text-slate-900 text-[13px] font-bold">{statusLoading ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}</button>
              <button onClick={() => router.push('/startup/ai-evaluation')} className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-semibold">Quay lại</button>
            </div>
          </div>
        </div>
      </StartupShell>
    );
  }

  // Only show sections if the AI actually returned content for them
  const hasExecutive = !!(report.executiveSummary && String(report.executiveSummary).trim().length > 0);
  const hasAnyScore = [report.overallScore, report.pitchDeckScore, report.businessPlanScore, report.teamScore, report.marketScore, report.productScore, report.tractionScore, report.financialScore]
    .some((n) => n != null && Number(n) > 0);
  const hasTeamMetrics = Array.isArray(report.subMetrics?.team) && report.subMetrics.team.length > 0;
  const hasMarketMetrics = Array.isArray(report.subMetrics?.market) && report.subMetrics.market.length > 0;
  const hasProductMetrics = Array.isArray(report.subMetrics?.product) && report.subMetrics.product.length > 0;
  const hasTractionMetrics = Array.isArray(report.subMetrics?.traction) && report.subMetrics.traction.length > 0;
  const hasFinancialMetrics = Array.isArray(report.subMetrics?.financial) && report.subMetrics.financial.length > 0;
  const hasOtherMetrics = Array.isArray(report.subMetrics?.other) && report.subMetrics.other.length > 0;
  const hasStrengths = Array.isArray(report.strengths) && report.strengths.length > 0;
  const hasRisksOrConcerns = (Array.isArray(report.risks) && report.risks.length > 0) || (Array.isArray(report.concerns) && report.concerns.length > 0);
  const hasGaps = Array.isArray(report.gaps) && report.gaps.length > 0;
  const hasRecommendations = Array.isArray(report.recommendations) && report.recommendations.length > 0;
  const hasWarnings = Array.isArray(report.warningMessages) && report.warningMessages.length > 0;

  const metaRows = [
    { icon: <Clock className="w-3.5 h-3.5 text-slate-400" />, label: "Ngày đánh giá", value: report.calculatedAt },
    { icon: <FileText className="w-3.5 h-3.5 text-slate-400" />, label: "Ngày tạo báo cáo", value: report.generatedAt },
    { icon: <Cpu className="w-3.5 h-3.5 text-slate-400" />, label: "Model version", value: report.modelVersion },
    { icon: <Tag className="w-3.5 h-3.5 text-slate-400" />, label: "Prompt version", value: report.promptVersion },
    { icon: <Info className="w-3.5 h-3.5 text-slate-400" />, label: "Config version", value: report.configVersion },
    { icon: <BookOpen className="w-3.5 h-3.5 text-slate-400" />, label: "Report ID", value: report.evaluationId },
  ].filter((row) => row.value != null && String(row.value).trim() !== "");

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-500">

        {/* Back */}
        <button
          onClick={() => router.push("/startup/ai-evaluation")}
          className="no-print flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Đánh giá AI
        </button>

        {/* ── Report Header ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono font-semibold text-slate-400">{report.evaluationId.toUpperCase()}</span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Hoàn thành
                </span>
                {report.isCurrent && (
                  <span className="px-2 py-0.5 bg-[#eec54e]/20 text-[#b8940a] rounded-full text-[10px] font-bold">Mới nhất</span>
                )}
              </div>
              <h1 className="text-[20px] font-bold text-slate-900 mb-1">{report.snapshotLabel}</h1>
              <p className="text-[12px] text-slate-400">
                Đánh giá ngày {report.calculatedAt} · Tạo báo cáo {report.generatedAt}
              </p>
            </div>

            {/* Overall score */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex flex-col items-center justify-center",
                report.overallScore == null ? "bg-slate-100"
                  : report.overallScore >= 75 ? "bg-emerald-50" : report.overallScore >= 50 ? "bg-amber-50" : "bg-red-50"
              )}>
                <span className={cn(
                  "text-[28px] font-black leading-none tabular-nums",
                  report.overallScore == null ? "text-slate-500"
                    : report.overallScore >= 75 ? "text-emerald-600" : report.overallScore >= 50 ? "text-amber-600" : "text-red-500"
                )}>{formatScore100(report.overallScore)}</span>
                <span className="text-[10px] text-slate-400 font-semibold">/100</span>
              </div>
            </div>
          </div>

          {/* Disclaimer chip */}
          <div className="mt-4 flex items-start gap-2 px-3 py-2 bg-blue-50/50 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-blue-600 leading-relaxed">
              Báo cáo này được tạo bởi AI và chỉ mang tính hỗ trợ quyết định. Không phải lời khuyên đầu tư.
            </p>
          </div>
        </div>

        {/* ── 2-column layout ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main (2/3) ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Executive Summary */}
            {hasExecutive && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#eec54e]" />
                  <p className="text-[14px] font-bold text-slate-800">Tổng quan đánh giá</p>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed">{report.executiveSummary}</p>
              </div>
            )}

            {/* Score Breakdown */}
            {hasAnyScore && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4 text-[#eec54e]" />
                  <p className="text-[14px] font-bold text-slate-800">Điểm tổng quan</p>
                </div>

                {/* Document scores (Tabs) */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    onClick={() => {
                      if (report.pitchDeckScore != null) {
                        setSelectedTab(selectedTab === "pitch_deck" ? "merged" : "pitch_deck");
                      }
                    }}
                    disabled={report.pitchDeckScore == null}
                    className={cn(
                      "flex flex-col items-start px-4 py-3 rounded-xl border transition-all duration-300 relative overflow-hidden",
                      report.pitchDeckScore == null ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer",
                      selectedTab === "pitch_deck" 
                        ? "bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500" 
                        : "bg-white border-slate-100 hover:bg-blue-50/30 hover:border-blue-200"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layout className={cn("w-3.5 h-3.5", selectedTab === "pitch_deck" ? "text-blue-500" : "text-blue-400")} />
                      <span className={cn("text-[11px] font-bold uppercase tracking-tight", selectedTab === "pitch_deck" ? "text-blue-600" : "text-slate-400")}>Pitch Deck</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-[26px] font-black tabular-nums", selectedTab === "pitch_deck" ? "text-blue-700" : "text-slate-700")}>
                        {formatScore100(report.pitchDeckScore)}
                      </span>
                      <span className="text-[12px] font-bold text-slate-300">/100</span>
                    </div>
                    {selectedTab === "pitch_deck" && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      if (report.businessPlanScore != null) {
                        setSelectedTab(selectedTab === "business_plan" ? "merged" : "business_plan");
                      }
                    }}
                    disabled={report.businessPlanScore == null}
                    className={cn(
                      "flex flex-col items-start px-4 py-3 rounded-xl border transition-all duration-300 relative overflow-hidden",
                      report.businessPlanScore == null ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer",
                      selectedTab === "business_plan" 
                        ? "bg-violet-50 border-violet-200 shadow-sm ring-1 ring-violet-500" 
                        : "bg-white border-slate-100 hover:bg-violet-50/30 hover:border-violet-200"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className={cn("w-3.5 h-3.5", selectedTab === "business_plan" ? "text-violet-500" : "text-violet-400")} />
                      <span className={cn("text-[11px] font-bold uppercase tracking-tight", selectedTab === "business_plan" ? "text-violet-600" : "text-slate-400")}>Business Plan</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-[26px] font-black tabular-nums", selectedTab === "business_plan" ? "text-violet-700" : "text-slate-700")}>
                        {formatScore100(report.businessPlanScore)}
                      </span>
                      <span className="text-[12px] font-bold text-slate-300">/100</span>
                    </div>
                    {selectedTab === "business_plan" && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Tab Indicator */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", selectedTab === "merged" ? "bg-amber-400" : (selectedTab === "pitch_deck" ? "bg-blue-500" : "bg-violet-500"))} />
                    <span className="text-[12px] font-bold text-slate-700">
                      {selectedTab === "merged" ? "Báo cáo tổng hợp" : (selectedTab === "pitch_deck" ? "Chi tiết Pitch Deck" : "Chi tiết Business Plan")}
                    </span>
                  </div>
                  {selectedTab !== "merged" && (
                    <button onClick={() => setSelectedTab("merged")} className="text-[11px] font-bold text-blue-500 hover:underline">Quay lại báo cáo gộp</button>
                  )}
                </div>

                {/* Category bars */}
                <div className="space-y-4">
                  <ScoreBar icon={<Users className="w-4 h-4 text-blue-400" />} label="Đội ngũ" score={currentReport?.teamScore ?? 0} />
                  <ScoreBar icon={<Globe className="w-4 h-4 text-emerald-400" />} label="Thị trường" score={currentReport?.marketScore ?? 0} />
                  <ScoreBar icon={<Layout className="w-4 h-4 text-violet-400" />} label="Sản phẩm" score={currentReport?.productScore ?? 0} />
                  <ScoreBar icon={<Zap className="w-4 h-4 text-amber-400" />} label="Traction" score={currentReport?.tractionScore ?? 0} />
                  <ScoreBar icon={<Banknote className="w-4 h-4 text-slate-400" />} label="Tài chính" score={currentReport?.financialScore ?? 0} />
                </div>
              </div>
            )}



            {/* Detailed Breakdown Sections */}
            {currentReport?.subMetrics.team && currentReport.subMetrics.team.length > 0 && (
              <ExpandableSection
                title="Đội ngũ — Chi tiết"
                icon={<Users className="w-4 h-4 text-blue-500" />}
                iconColor="bg-blue-50"
                defaultOpen
              >
                <SubMetricsList metrics={currentReport.subMetrics.team} />
              </ExpandableSection>
            )}

            {currentReport?.subMetrics.market && currentReport.subMetrics.market.length > 0 && (
              <ExpandableSection
                title="Thị trường — Chi tiết"
                icon={<Globe className="w-4 h-4 text-emerald-500" />}
                iconColor="bg-emerald-50"
              >
                <SubMetricsList metrics={currentReport.subMetrics.market} />
              </ExpandableSection>
            )}

            {currentReport?.subMetrics.product && currentReport.subMetrics.product.length > 0 && (
              <ExpandableSection
                title="Sản phẩm — Chi tiết"
                icon={<Layout className="w-4 h-4 text-violet-500" />}
                iconColor="bg-violet-50"
              >
                <SubMetricsList metrics={currentReport.subMetrics.product} />
              </ExpandableSection>
            )}

            {currentReport?.subMetrics.traction && currentReport.subMetrics.traction.length > 0 && (
              <ExpandableSection
                title="Traction — Chi tiết"
                icon={<Zap className="w-4 h-4 text-amber-500" />}
                iconColor="bg-amber-50"
              >
                <SubMetricsList metrics={currentReport.subMetrics.traction} />
              </ExpandableSection>
            )}

            {currentReport?.subMetrics.financial && currentReport.subMetrics.financial.length > 0 && (
              <ExpandableSection
                title="Tài chính — Chi tiết"
                icon={<Banknote className="w-4 h-4 text-slate-500" />}
                iconColor="bg-slate-100"
              >
                <SubMetricsList metrics={currentReport.subMetrics.financial} />
              </ExpandableSection>
            )}

            {hasOtherMetrics && (
              <ExpandableSection
                title="Khác — Chi tiết"
                icon={<Layers className="w-4 h-4 text-slate-500" />}
                iconColor="bg-slate-100"
              >
                <SubMetricsList metrics={report.subMetrics.other} />
              </ExpandableSection>
            )}

            {/* Key Strengths */}
            {currentReport?.strengths && currentReport.strengths.length > 0 && (
              <ExpandableSection
                title="Điểm mạnh"
                icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                iconColor="bg-emerald-50"
                defaultOpen
              >
                <div className="space-y-2.5">
                  {currentReport.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] text-slate-600 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Risks / Concerns */}
            {((currentReport?.risks && currentReport.risks.length > 0) || (currentReport?.concerns && currentReport.concerns.length > 0)) && (
              <ExpandableSection
                title="Rủi ro & Mối quan ngại"
                icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                iconColor="bg-amber-50"
                defaultOpen
              >
                <div className="space-y-4">
                  {currentReport?.risks && currentReport.risks.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-red-500 uppercase tracking-wide mb-2">Rủi ro</p>
                      <div className="space-y-2">
                        {currentReport.risks.map((r, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[12px] text-slate-600 leading-relaxed">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentReport?.concerns && currentReport.concerns.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide mb-2">Mối quan ngại</p>
                      <div className="space-y-2">
                        {currentReport.concerns.map((c, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[12px] text-slate-600 leading-relaxed">{c}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ExpandableSection>
            )}

            {/* Gaps / Missing Info */}
            {currentReport?.gaps && currentReport.gaps.length > 0 && (
              <ExpandableSection
                title="Thiếu hụt & Thông tin cần bổ sung"
                icon={<Info className="w-4 h-4 text-blue-500" />}
                iconColor="bg-blue-50"
              >
                <div className="space-y-2">
                  {currentReport.gaps.map((g, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <p className="text-[12px] text-slate-600 leading-relaxed">{g}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Recommendations */}
            {currentReport?.recommendations && currentReport.recommendations.length > 0 && (
              <ExpandableSection
                title="Khuyến nghị cải thiện"
                icon={<Sparkles className="w-4 h-4 text-[#eec54e]" />}
                iconColor="bg-[#eec54e]/10"
                defaultOpen
              >
                <p className="text-[11px] text-slate-400 mb-4 italic">Các khuyến nghị dưới đây được tạo bởi AI và mang tính hỗ trợ.</p>
                <div className="space-y-3">
                  {currentReport.recommendations.map((rec, i) => {
                      const key = String(rec?.priority ?? "").toUpperCase();
                      const pcfg = PRIORITY_CFG[key] ?? PRIORITY_CFG.MEDIUM;
                      return (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", pcfg.color, pcfg.bg, pcfg.border)}>
                              {pcfg.label}
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold">{rec.category}</span>
                          </div>
                          <p className="text-[13px] font-semibold text-slate-700 mb-2">{rec.text}</p>
                          {rec.impact && (
                            <div className="flex items-start gap-1.5 opacity-70">
                              <Zap className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                              <p className="text-[11px] text-slate-500">{rec.impact}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </ExpandableSection>
            )}
            {showDebug && (
              <ExpandableSection
                title="Raw report payload (debug)"
                icon={<Cpu className="w-4 h-4 text-slate-400" />}
                iconColor="bg-slate-50"
              >
                <div className="max-h-[360px] overflow-auto text-[12px] bg-slate-50 p-3 rounded-md border border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-2 italic">Raw canonical payload returned by the AI/backend and the frontend's mapped model (for debugging).</p>
                  <div className="mb-3">
                    <p className="text-[12px] font-semibold mb-1">Canonical payload</p>
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(rawPayload ?? {}, null, 2)}</pre>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold mb-1">Mapped report</p>
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(report ?? {}, null, 2)}</pre>
                  </div>
                </div>
              </ExpandableSection>
            )}
          </div>

          {/* ── Sidebar (1/3) ──────────────────────────── */}
          <div className="space-y-5">

            {/* Metadata */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 sticky top-24">
              <p className="text-[13px] font-bold text-slate-800 mb-4">Thông tin báo cáo</p>
              <div className="space-y-3">
                {metaRows.map((row, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5">{row.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-400">{row.label}</p>
                      <p className="text-[12px] font-semibold text-slate-700 truncate">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="no-print mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-2 h-9 px-4 rounded-xl bg-[#0f172a] text-white text-[12px] font-semibold hover:bg-slate-700 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất PDF
                </button>
                <button
                  onClick={() => router.push("/startup/ai-evaluation")}
                  className="w-full flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-50 text-slate-700 text-[12px] font-semibold hover:bg-slate-100 transition-all"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Quay lại đánh giá AI
                </button>
                <button
                  onClick={() => router.push("/startup/ai-evaluation/history")}
                  className="w-full flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-50 text-slate-700 text-[12px] font-semibold hover:bg-slate-100 transition-all"
                >
                  <History className="w-3.5 h-3.5" />
                  Lịch sử đánh giá
                </button>
                <button
                  onClick={() => router.push("/startup/ai-evaluation/request")}
                  className="w-full flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-50 text-slate-700 text-[12px] font-semibold hover:bg-slate-100 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Đánh giá mới
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Báo cáo này được tạo ra chỉ nhằm mục đích hỗ trợ quyết định và chuẩn bị. Đây không phải lời khuyên đầu tư và không thay thế cho đánh giá chính thức từ chuyên gia.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </StartupShell>
  );
}
