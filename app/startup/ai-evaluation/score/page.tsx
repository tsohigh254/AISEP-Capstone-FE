"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, BarChart3, FileText, History, RefreshCw, ArrowLeft,
  TrendingUp, AlertTriangle, CheckCircle2, ShieldCheck,
  Users, Globe, Layout, Zap, Banknote, Download, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetLatestScore } from "@/services/ai/ai.api";
import type { AIScoreLatestResponse } from "../types";

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
  const [score, setScore] = useState<AIScoreLatestResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await GetLatestScore();
        const data = (res as any)?.data ?? null;
        if (data) setScore(data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchScore();
  }, []);

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[900px] mx-auto pb-20 pt-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  if (!score) {
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

  // Group sub-metrics by category for strengths/concerns summary
  const topRecommendations = score.recommendations.slice(0, 3);
  const highPriorityRecs = score.recommendations.filter(r => r.priority === "High" || r.priority === "HIGH");

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

          <ScoreRing score={score.overallScore} size={160} />

          <p className="text-[13px] text-slate-400 mt-4">
            Đánh giá ngày <span className="font-semibold text-slate-500">{new Date(score.calculatedAt).toLocaleDateString("vi-VN")}</span>
          </p>
        </div>

        {/* ── Category Breakdown ─────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 mb-6">
          <p className="text-[14px] font-bold text-slate-800 mb-5">Điểm theo lĩnh vực</p>
          <div className="space-y-4">
            <CategoryBar icon={<Users className="w-4 h-4 text-blue-400" />} label="Đội ngũ" score={score.teamScore} />
            <CategoryBar icon={<Globe className="w-4 h-4 text-emerald-400" />} label="Thị trường" score={score.marketScore} />
            <CategoryBar icon={<Layout className="w-4 h-4 text-violet-400" />} label="Sản phẩm" score={score.productScore} />
            <CategoryBar icon={<Zap className="w-4 h-4 text-amber-400" />} label="Traction" score={score.tractionScore} />
            <CategoryBar icon={<Banknote className="w-4 h-4 text-slate-400" />} label="Tài chính" score={score.financialScore} />
          </div>
        </div>

        {/* ── Recommendations Summary ────────────────────── */}
        {topRecommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 mb-6">
            <p className="text-[14px] font-bold text-slate-800 mb-3">Khuyến nghị cải thiện hàng đầu</p>
            <div className="space-y-3">
              {topRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#eec54e] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] text-slate-600 leading-relaxed">{rec.recommendationText}</p>
                    {rec.expectedImpact && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{rec.expectedImpact}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Row ─────────────────────────────────── */}
        <div className="no-print flex flex-wrap items-center gap-3">
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
