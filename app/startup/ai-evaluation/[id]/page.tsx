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
  Clock, Tag, Cpu, BookOpen, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SubMetric, Recommendation, AIEvaluationReport, AIEvaluationStatus } from "../types";
import { GetEvaluationReport, GetEvaluationStatus } from "@/services/ai/ai.api";
import { mapCanonicalToReport, mapStatusToUI } from "../canonical-mapper";

/* ─── Score Bar ────────────────────────────────────────────── */

function ScoreBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const color = score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-red-400";
  const textColor = score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold text-slate-700">{label}</span>
          <span className={cn("text-[13px] font-black", textColor)}>{score}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${score}%` }} />
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
          // If backend indicates report valid, map and return
          if (payload.isReportValid || payload.IsReportValid) {
            const canonical = payload.report ?? payload.Report ?? payload;
            const mapped = mapCanonicalToReport(runId, canonical);
            if (!cancelled) setReport(mapped);
            return true;
          }
          // If payload.Report exists and looks complete, map anyway
          if (payload.report) {
            const mapped = mapCanonicalToReport(runId, payload.report);
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
          const reportPayload = rres?.data?.report ?? rres?.data ?? rres;
          setRawPayload(reportPayload);
          const mapped = mapCanonicalToReport(runId, reportPayload);
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
    .some((n) => Number(n) > 0);
  const hasTeamMetrics = Array.isArray(report.subMetrics?.team) && report.subMetrics.team.length > 0;
  const hasMarketMetrics = Array.isArray(report.subMetrics?.market) && report.subMetrics.market.length > 0;
  const hasProductMetrics = Array.isArray(report.subMetrics?.product) && report.subMetrics.product.length > 0;
  const hasTractionMetrics = Array.isArray(report.subMetrics?.traction) && report.subMetrics.traction.length > 0;
  const hasFinancialMetrics = Array.isArray(report.subMetrics?.financial) && report.subMetrics.financial.length > 0;
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
                report.overallScore >= 75 ? "bg-emerald-50" : report.overallScore >= 50 ? "bg-amber-50" : "bg-red-50"
              )}>
                <span className={cn("text-[28px] font-black leading-none",
                  report.overallScore >= 75 ? "text-emerald-600" : report.overallScore >= 50 ? "text-amber-600" : "text-red-500"
                )}>{report.overallScore}</span>
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

                {/* Document scores */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="px-4 py-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Layout className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[11px] text-blue-500 font-semibold">Pitch Deck</span>
                    </div>
                    <span className="text-[22px] font-black text-blue-700">{report.pitchDeckScore}</span>
                  </div>
                  <div className="px-4 py-3 bg-violet-50/50 rounded-xl border border-violet-100">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-[11px] text-violet-500 font-semibold">Business Plan</span>
                    </div>
                    <span className="text-[22px] font-black text-violet-700">{report.businessPlanScore}</span>
                  </div>
                </div>

                {/* Category bars */}
                <div className="space-y-4">
                  <ScoreBar icon={<Users className="w-4 h-4 text-blue-400" />} label="Đội ngũ" score={report.teamScore} />
                  <ScoreBar icon={<Globe className="w-4 h-4 text-emerald-400" />} label="Thị trường" score={report.marketScore} />
                  <ScoreBar icon={<Layout className="w-4 h-4 text-violet-400" />} label="Sản phẩm" score={report.productScore} />
                  <ScoreBar icon={<Zap className="w-4 h-4 text-amber-400" />} label="Traction" score={report.tractionScore} />
                  <ScoreBar icon={<Banknote className="w-4 h-4 text-slate-400" />} label="Tài chính" score={report.financialScore} />
                </div>
              </div>
            )}

            {/* Warnings */}
            {report.warningMessages.filter(msg => !msg.includes("SOURCE_ISOLATION")).length > 0 && (
              <div className="px-5 py-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-amber-800 mb-1">Cảnh báo</p>
                    <ul className="space-y-1">
                      {report.warningMessages
                        .filter(msg => !msg.includes("SOURCE_ISOLATION"))
                        .map((msg, i) => (
                          <li key={i} className="text-[12px] text-amber-700">• {msg}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Breakdown Sections */}
            {hasTeamMetrics && (
              <ExpandableSection
                title="Đội ngũ — Chi tiết"
                icon={<Users className="w-4 h-4 text-blue-500" />}
                iconColor="bg-blue-50"
                defaultOpen
              >
                <SubMetricsList metrics={report.subMetrics.team} />
              </ExpandableSection>
            )}

            {hasMarketMetrics && (
              <ExpandableSection
                title="Thị trường — Chi tiết"
                icon={<Globe className="w-4 h-4 text-emerald-500" />}
                iconColor="bg-emerald-50"
              >
                <SubMetricsList metrics={report.subMetrics.market} />
              </ExpandableSection>
            )}

            {hasProductMetrics && (
              <ExpandableSection
                title="Sản phẩm — Chi tiết"
                icon={<Layout className="w-4 h-4 text-violet-500" />}
                iconColor="bg-violet-50"
              >
                <SubMetricsList metrics={report.subMetrics.product} />
              </ExpandableSection>
            )}

            {hasTractionMetrics && (
              <ExpandableSection
                title="Traction — Chi tiết"
                icon={<Zap className="w-4 h-4 text-amber-500" />}
                iconColor="bg-amber-50"
              >
                <SubMetricsList metrics={report.subMetrics.traction} />
              </ExpandableSection>
            )}

            {hasFinancialMetrics && (
              <ExpandableSection
                title="Tài chính — Chi tiết"
                icon={<Banknote className="w-4 h-4 text-slate-500" />}
                iconColor="bg-slate-100"
              >
                <SubMetricsList metrics={report.subMetrics.financial} />
              </ExpandableSection>
            )}

            {/* Key Strengths */}
            {hasStrengths && (
              <ExpandableSection
                title="Điểm mạnh"
                icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                iconColor="bg-emerald-50"
                defaultOpen
              >
                <div className="space-y-2.5">
                  {report.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] text-slate-600 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Risks / Concerns */}
            {hasRisksOrConcerns && (
              <ExpandableSection
                title="Rủi ro & Mối quan ngại"
                icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                iconColor="bg-amber-50"
                defaultOpen
              >
                <div className="space-y-4">
                  {report.risks.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-red-500 uppercase tracking-wide mb-2">Rủi ro</p>
                      <div className="space-y-2">
                        {report.risks.map((r, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[12px] text-slate-600 leading-relaxed">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.concerns.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide mb-2">Mối quan ngại</p>
                      <div className="space-y-2">
                        {report.concerns.map((c, i) => (
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
            {report.gaps.length > 0 && (
              <ExpandableSection
                title="Thiếu hụt & Thông tin cần bổ sung"
                icon={<Info className="w-4 h-4 text-blue-500" />}
                iconColor="bg-blue-50"
              >
                <div className="space-y-2">
                  {report.gaps.map((g, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <p className="text-[12px] text-slate-600 leading-relaxed">{g}</p>
                    </div>
                  ))}
                </div>
              </ExpandableSection>
            )}

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <ExpandableSection
                title="Khuyến nghị cải thiện"
                icon={<Sparkles className="w-4 h-4 text-[#eec54e]" />}
                iconColor="bg-[#eec54e]/10"
                defaultOpen
              >
                <p className="text-[11px] text-slate-400 mb-4 italic">Các khuyến nghị dưới đây được tạo bởi AI và mang tính hỗ trợ.</p>
                <div className="space-y-3">
                  {report.recommendations.map((rec, i) => {
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
                          <div className="flex items-start gap-1.5">
                            <Zap className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-slate-500">{rec.impact}</p>
                          </div>
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
