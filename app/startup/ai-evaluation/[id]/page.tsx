"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, ArrowLeft, FileText, History, RefreshCw, BarChart3,
  ShieldCheck, CheckCircle2, AlertTriangle, TrendingUp,
  Zap, Users, Globe, Layout, Banknote,
  Clock, Download, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetLatestScore } from "@/services/ai/ai.api";
import type { AIScoreLatestResponse, SubMetricDto, ImprovementRecommendationDto } from "../types";

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

/* ─── Sub-metrics List ────────────────────────────────────── */

function SubMetricsList({ metrics }: { metrics: SubMetricDto[] }) {
  if (metrics.length === 0) return <p className="text-[12px] text-slate-400 italic">Không có dữ liệu chi tiết.</p>;
  return (
    <div className="space-y-3">
      {metrics.map((m, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0 w-20">
            <span className={cn("text-[14px] font-black",
              m.metricScore >= 7.5 ? "text-emerald-600" : m.metricScore >= 5 ? "text-amber-600" : "text-red-500"
            )}>{m.metricScore}</span>
            <span className="text-[11px] text-slate-400">/10</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-700">{m.metricName}</p>
            {m.explanation && <p className="text-[11px] text-slate-400 mt-0.5">{m.explanation}</p>}
          </div>
        </div>
      ))}
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
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  );
}

/* ─── Priority badge ───────────────────────────────────────── */

const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  High:   { label: "Cao",      color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100" },
  HIGH:   { label: "Cao",      color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100" },
  Medium: { label: "Trung bình", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  MEDIUM: { label: "Trung bình", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  Low:    { label: "Thấp",     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100" },
  LOW:    { label: "Thấp",     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100" },
};

/* ─── Page ─────────────────────────────────────────────────── */

export default function AIDetailedReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [score, setScore] = useState<AIScoreLatestResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // For now, we load the latest score data.
        // The [id] in the URL is the scoreId — we can extend later to load specific score by ID.
        const res = await GetLatestScore();
        const data = (res as any)?.data ?? null;
        if (data) setScore(data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[1100px] mx-auto pb-20 pt-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  if (!score) {
    return (
      <StartupShell>
        <div className="max-w-[1100px] mx-auto pb-20 pt-10 text-center">
          <p className="text-[16px] font-bold text-slate-700 mb-1">Không tìm thấy báo cáo</p>
          <p className="text-[13px] text-slate-400 mb-5">Báo cáo đánh giá AI chưa có hoặc không tồn tại.</p>
          <button onClick={() => router.push("/startup/ai-evaluation")} className="text-[13px] text-amber-600 font-semibold">
            Quay lại
          </button>
        </div>
      </StartupShell>
    );
  }

  // Group sub-metrics by category
  const groupedMetrics: Record<string, SubMetricDto[]> = {};
  for (const m of score.subMetrics) {
    const cat = m.category.toLowerCase();
    if (!groupedMetrics[cat]) groupedMetrics[cat] = [];
    groupedMetrics[cat].push(m);
  }

  const categoryConfig = [
    { key: "team", label: "Đội ngũ — Chi tiết", icon: <Users className="w-4 h-4 text-blue-500" />, iconColor: "bg-blue-50", score: score.teamScore },
    { key: "market", label: "Thị trường — Chi tiết", icon: <Globe className="w-4 h-4 text-emerald-500" />, iconColor: "bg-emerald-50", score: score.marketScore },
    { key: "product", label: "Sản phẩm — Chi tiết", icon: <Layout className="w-4 h-4 text-violet-500" />, iconColor: "bg-violet-50", score: score.productScore },
    { key: "traction", label: "Traction — Chi tiết", icon: <Zap className="w-4 h-4 text-amber-500" />, iconColor: "bg-amber-50", score: score.tractionScore },
    { key: "financial", label: "Tài chính — Chi tiết", icon: <Banknote className="w-4 h-4 text-slate-500" />, iconColor: "bg-slate-100", score: score.financialScore },
  ];

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
                <span className="text-[11px] font-mono font-semibold text-slate-400">#{score.scoreId}</span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Hoàn thành
                </span>
              </div>
              <h1 className="text-[20px] font-bold text-slate-900 mb-1">Báo cáo đánh giá AI chi tiết</h1>
              <p className="text-[12px] text-slate-400">
                Đánh giá ngày {new Date(score.calculatedAt).toLocaleDateString("vi-VN")} {new Date(score.calculatedAt).toLocaleTimeString("vi-VN")}
              </p>
            </div>

            {/* Overall score */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex flex-col items-center justify-center",
                score.overallScore >= 75 ? "bg-emerald-50" : score.overallScore >= 50 ? "bg-amber-50" : "bg-red-50"
              )}>
                <span className={cn("text-[28px] font-black leading-none",
                  score.overallScore >= 75 ? "text-emerald-600" : score.overallScore >= 50 ? "text-amber-600" : "text-red-500"
                )}>{score.overallScore}</span>
                <span className="text-[10px] text-slate-400 font-semibold">/100</span>
              </div>
            </div>
          </div>

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

            {/* Score Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-[#eec54e]" />
                <p className="text-[14px] font-bold text-slate-800">Điểm tổng quan</p>
              </div>

              <div className="space-y-4">
                <ScoreBar icon={<Users className="w-4 h-4 text-blue-400" />} label="Đội ngũ" score={score.teamScore} />
                <ScoreBar icon={<Globe className="w-4 h-4 text-emerald-400" />} label="Thị trường" score={score.marketScore} />
                <ScoreBar icon={<Layout className="w-4 h-4 text-violet-400" />} label="Sản phẩm" score={score.productScore} />
                <ScoreBar icon={<Zap className="w-4 h-4 text-amber-400" />} label="Traction" score={score.tractionScore} />
                <ScoreBar icon={<Banknote className="w-4 h-4 text-slate-400" />} label="Tài chính" score={score.financialScore} />
              </div>
            </div>

            {/* Detailed Breakdown Sections */}
            {categoryConfig.map(cat => (
              <ExpandableSection
                key={cat.key}
                title={cat.label}
                icon={cat.icon}
                iconColor={cat.iconColor}
                defaultOpen={cat.key === "team"}
              >
                <SubMetricsList metrics={groupedMetrics[cat.key] ?? []} />
              </ExpandableSection>
            ))}

            {/* Recommendations */}
            {score.recommendations.length > 0 && (
              <ExpandableSection
                title="Khuyến nghị cải thiện"
                icon={<Sparkles className="w-4 h-4 text-[#eec54e]" />}
                iconColor="bg-[#eec54e]/10"
                defaultOpen
              >
                <p className="text-[11px] text-slate-400 mb-4 italic">Các khuyến nghị dưới đây được tạo bởi AI và mang tính hỗ trợ.</p>
                <div className="space-y-3">
                  {score.recommendations.map((rec, i) => {
                    const pcfg = PRIORITY_CFG[rec.priority] ?? PRIORITY_CFG.Medium;
                    return (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", pcfg.color, pcfg.bg, pcfg.border)}>
                            {pcfg.label}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">{rec.category}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-slate-700 mb-2">{rec.recommendationText}</p>
                        {rec.expectedImpact && (
                          <div className="flex items-start gap-1.5">
                            <Zap className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-slate-500">{rec.expectedImpact}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                {[
                  { icon: <Clock className="w-3.5 h-3.5 text-slate-400" />, label: "Ngày đánh giá", value: new Date(score.calculatedAt).toLocaleDateString("vi-VN") },
                  { icon: <FileText className="w-3.5 h-3.5 text-slate-400" />, label: "Score ID", value: `#${score.scoreId}` },
                  { icon: <BarChart3 className="w-3.5 h-3.5 text-slate-400" />, label: "Startup ID", value: `#${score.startupId}` },
                ].map((row, i) => (
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
                  onClick={() => router.push("/startup/ai-evaluation/score")}
                  className="w-full flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-50 text-slate-700 text-[12px] font-semibold hover:bg-slate-100 transition-all"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Quay lại điểm tiềm năng
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
