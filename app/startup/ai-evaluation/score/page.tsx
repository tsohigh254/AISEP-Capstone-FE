"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, BarChart3, FileText, History, RefreshCw, ArrowLeft,
  TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, ShieldCheck,
  Users, Globe, Layout, Zap, Banknote, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetLatestScore, GetEvaluationHistory, GetEvaluationReport } from "@/services/ai/ai.api";
import { GetStartupProfile } from "@/services/startup/startup.api";
import { mapCanonicalToReport } from "../canonical-mapper";
import { AIEvaluationReport } from "../types";

/* ─── Score Ring ────────────────────────────────────────────── */

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Tốt" : score >= 50 ? "Trung bình" : "Cần cải thiện";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          className="transition-all duration-1000" />
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" dominantBaseline="central"
          className="rotate-[90deg] origin-center text-[36px] font-black fill-slate-900">{score}</text>
        <text x={size / 2} y={size / 2 + 20} textAnchor="middle" dominantBaseline="central"
          className="rotate-[90deg] origin-center text-[11px] font-semibold fill-slate-400">/100</text>
      </svg>
      <span className={cn("px-3 py-1 rounded-full text-[12px] font-bold",
        score >= 75 ? "bg-emerald-50 text-emerald-600" : score >= 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
      )}>{label}</span>
    </div>
  );
}

/* ─── Category Score Bar ───────────────────────────────────── */

function CategoryBar({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
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

/* ─── Page ─────────────────────────────────────────────────── */

export default function StartupPotentialScorePage() {
  const router = useRouter();
  const [report, setReport] = useState<AIEvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await GetLatestScore() as unknown as any;
        const payload = res?.data ?? res;
        const runId = payload?.runId ?? payload?.RunId ?? payload?.id ?? payload?.evaluationId ?? 0;
        const canonical = payload?.report ?? payload?.Report ?? payload;
        let mapped = mapCanonicalToReport(Number(runId) || 0, canonical);

        // If latest score is effectively empty (0) or no canonical report, try fallback to history
        const isEmptyScore = !mapped || (mapped.overallScore === 0 && (!canonical || Object.keys(canonical).length === 0));
        if (isEmptyScore) {
          try {
            const prof = await GetStartupProfile() as unknown as any;
            const startupId = prof?.data?.id ?? prof?.id ?? 0;
            if (startupId) {
              const hres = await GetEvaluationHistory(Number(startupId)) as unknown as any;
              const history = hres?.data ?? hres ?? [];
              const completed = (history || []).find((h: any) => ((h?.status ?? h?.Status ?? "") + "").toLowerCase().includes("completed"));
              if (completed) {
                const pythonRunId = completed?.evaluationId ?? completed?.id ?? completed?.evaluation_run_id ?? completed?.evaluation_run_id ?? completed?.evaluationId ?? 0;
                if (pythonRunId) {
                  const rres = await GetEvaluationReport(Number(pythonRunId));
                  const reportPayload = (rres as any)?.data ?? rres;
                  const mapped2 = mapCanonicalToReport(Number(pythonRunId) || 0, reportPayload);
                  if (!cancelled) {
                    setReport(mapped2);
                    setLoading(false);
                  }
                  return;
                }
              }
            }
          } catch (innerErr) {
            console.warn("History fallback failed", innerErr);
          }
        }

        if (!cancelled) setReport(mapped);
      } catch (err) {
        console.error("GetLatestScore failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!report && !loading) {
    return (
      <StartupShell>
        <div className="max-w-[800px] mx-auto pb-20 pt-10 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-[16px] font-bold text-slate-700 mb-1">Chưa có kết quả đánh giá AI</p>
          <p className="text-[13px] text-slate-400 mb-5">Yêu cầu đánh giá AI để nhận điểm tiềm năng startup.</p>
          <button
            onClick={() => router.push("/startup/ai-evaluation/request")}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#eec54e] text-slate-900 text-[13px] font-bold hover:bg-[#e6b800] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Yêu cầu đánh giá AI
          </button>
        </div>
      </StartupShell>
    );
  }

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[800px] mx-auto pb-20 pt-10 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-[#eec54e] animate-spin" />
          </div>
          <p className="text-[16px] font-bold text-slate-700 mb-1">Đang tải điểm tiềm năng...</p>
          <p className="text-[13px] text-slate-400">Vui lòng chờ trong giây lát.</p>
        </div>
      </StartupShell>
    );
  }

  // Top 3 strengths, top 2 concerns for summary
  const topStrengths = report.strengths.slice(0, 3);
  const topConcerns = [...report.risks, ...report.concerns].slice(0, 3);

  return (
    <StartupShell>
      <div className="max-w-[900px] mx-auto pb-20 animate-in fade-in duration-500">

        {/* Back */}
        <button
          onClick={() => router.push("/startup/ai-evaluation")}
          className="no-print flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Đánh giá AI
        </button>

        {/* ── Hero Score ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8 mb-6 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Startup Potential Score</p>

          <ScoreRing score={report.overallScore} size={160} />

          <p className="text-[13px] text-slate-400 mt-4">
            Đánh giá ngày <span className="font-semibold text-slate-500">{report.calculatedAt.split(" ")[0]}</span>
            {" · "}
            <span className="text-slate-400">{report.snapshotLabel}</span>
          </p>

          {/* Document scores */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
              <Layout className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[12px] text-blue-600 font-semibold">Pitch Deck: {report.pitchDeckScore}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-xl">
              <Banknote className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[12px] text-violet-600 font-semibold">Business Plan: {report.businessPlanScore}</span>
            </div>
          </div>
        </div>

        {/* ── Category Breakdown ─────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 mb-6">
          <p className="text-[14px] font-bold text-slate-800 mb-5">Điểm theo lĩnh vực</p>
          <div className="space-y-4">
            <CategoryBar icon={<Users className="w-4 h-4 text-blue-400" />} label="Đội ngũ" score={report.teamScore} />
            <CategoryBar icon={<Globe className="w-4 h-4 text-emerald-400" />} label="Thị trường" score={report.marketScore} />
            <CategoryBar icon={<Layout className="w-4 h-4 text-violet-400" />} label="Sản phẩm" score={report.productScore} />
            <CategoryBar icon={<Zap className="w-4 h-4 text-amber-400" />} label="Traction" score={report.tractionScore} />
            <CategoryBar icon={<Banknote className="w-4 h-4 text-slate-400" />} label="Tài chính" score={report.financialScore} />
          </div>
        </div>

        {/* ── Summary Insight ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 mb-6">
          <p className="text-[14px] font-bold text-slate-800 mb-3">Tổng quan</p>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-5">{report.executiveSummary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="space-y-2.5">
              <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Điểm mạnh nổi bật
              </p>
              {topStrengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-1 flex-shrink-0" />
                  <p className="text-[12px] text-slate-600 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>

            {/* Concerns */}
            <div className="space-y-2.5">
              <p className="text-[12px] font-bold text-amber-600 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Điểm cần lưu ý
              </p>
              {topConcerns.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-400 mt-1 flex-shrink-0" />
                  <p className="text-[12px] text-slate-600 leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Action Row ─────────────────────────────────── */}
        <div className="no-print flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/startup/ai-evaluation/${report.evaluationId}`)}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-slate-700 transition-all"
          >
            <FileText className="w-4 h-4" />
            Xem báo cáo chi tiết
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-semibold hover:bg-slate-200 transition-all"
          >
            <Download className="w-4 h-4" />
            Xuất PDF
          </button>
          <button
            onClick={() => router.push("/startup/ai-evaluation/history")}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-semibold hover:bg-slate-200 transition-all"
          >
            <History className="w-4 h-4" />
            Lịch sử đánh giá
          </button>
          <button
            onClick={() => router.push("/startup/ai-evaluation/request")}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-semibold hover:bg-slate-200 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Đánh giá mới
          </button>
        </div>

        {/* ── Disclaimer ─────────────────────────────────── */}
        <div className="mt-6 px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Báo cáo này được tạo ra chỉ nhằm mục đích hỗ trợ quyết định và chuẩn bị. Đây không phải lời khuyên đầu tư và không thay thế cho đánh giá chính thức từ chuyên gia.
            </p>
          </div>
        </div>

      </div>
    </StartupShell>
  );
}
