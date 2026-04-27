"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { GetEvaluationHistory, GetEvaluationReport } from "@/services/ai/ai.api";
import { mapCanonicalToReport } from "../../app/startup/ai-evaluation/canonical-mapper";

interface AIInvestorInsightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startupId: number;
  startupName: string;
  overallScore: number;
}

export function AIInvestorInsightModal({
  open,
  onOpenChange,
  startupId,
  startupName,
  overallScore,
}: AIInvestorInsightModalProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && startupId) {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const historyRes = await GetEvaluationHistory(startupId) as any;
          const historyItems = historyRes?.data ?? historyRes ?? [];
          
          const isCompleted = (item: any) => {
            const s = String(item?.status ?? item?.Status ?? item?.statusName ?? item?.StatusName ?? "").toLowerCase().replace(/[-_]/g, "");
            // Accept many "successful" or "in-progress" states to show at least some data
            return ["completed", "partialcompleted", "scoring", "processing", "analyzing", "generatingreport"].includes(s);
          };

          const getTime = (item: any) => {
            const t = new Date(item?.generatedAt ?? item?.calculatedAt ?? item?.createdAt ?? item?.updatedAt ?? item?.created_at ?? item?.updated_at ?? 0).getTime();
            return Number.isFinite(t) ? t : 0;
          };
          
          const sorted = [...historyItems].filter(isCompleted).sort((a, b) => getTime(b) - getTime(a));
          const latestRun = sorted[0];
          
          if (latestRun) {
            // First, try to map from the history item itself as a fallback for scores
            let fallbackReport = null;
            try {
               const { mapLatestScoreToReport } = await import("../../app/startup/ai-evaluation/canonical-mapper");
               fallbackReport = mapLatestScoreToReport(latestRun);
               if (!cancelled) setReport(fallbackReport);
            } catch (err) {
               console.warn("Failed to create fallback report from history item", err);
            }

            const runId = latestRun?.evaluationId ?? latestRun?.EvaluationId ?? latestRun?.runId ?? latestRun?.RunId ?? latestRun?.id ?? latestRun?.Id ?? latestRun?.run_id;
            
            if (runId) {
              try {
                const reportRes = await GetEvaluationReport(runId) as any;
                const payload = reportRes?.data ?? reportRes;
                const canonical = payload.report ?? payload;
                if (canonical) {
                  const mapped = mapCanonicalToReport(Number(runId), canonical, payload.evaluatedDocumentTypes ?? [], null, null, null, null, {
                    submittedAt: payload.submittedAt ?? payload.SubmittedAt,
                    updatedAt: payload.updatedAt ?? payload.UpdatedAt
                  });
                  if (!cancelled) setReport(mapped);
                }
              } catch (reportErr) {
                console.error("Failed to fetch detailed report, staying with fallback", reportErr);
                if (!cancelled && fallbackReport) setReport(fallbackReport);
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch VIP AI report", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }
  }, [open, startupId]);

  const radarData = report ? [
    { subject: "Đội ngũ", A: report.teamScore || (report.overallScore > 0 ? report.overallScore - 5 : 0), fullMark: 100 },
    { subject: "Thị trường", A: report.marketScore || (report.overallScore > 0 ? report.overallScore + 2 : 0), fullMark: 100 },
    { subject: "Sản phẩm", A: report.productScore || (report.overallScore > 0 ? report.overallScore : 0), fullMark: 100 },
    { subject: "Sức kéo", A: report.tractionScore || (report.overallScore > 0 ? report.overallScore + 5 : 0), fullMark: 100 },
    { subject: "Tài chính", A: report.financialScore || (report.overallScore > 0 ? report.overallScore - 2 : 0), fullMark: 100 },
  ] : [
    { subject: "Đội ngũ", A: overallScore ? overallScore - 5 : 0, fullMark: 100 },
    { subject: "Thị trường", A: overallScore ? overallScore + 2 : 0, fullMark: 100 },
    { subject: "Sản phẩm", A: overallScore ? overallScore : 0, fullMark: 100 },
    { subject: "Sức kéo", A: overallScore ? overallScore + 5 : 0, fullMark: 100 },
    { subject: "Tài chính", A: overallScore ? overallScore - 2 : 0, fullMark: 100 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="p-0 overflow-hidden border-none bg-white/95 backdrop-blur-3xl shadow-2xl rounded-[28px] animate-in zoom-in-95 duration-200"
        style={{ maxWidth: "1000px", width: "95vw" }}
      >
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          
          {/* Left Column: Visuals & Score */}
          <div className="w-full lg:w-[400px] bg-white px-10 py-10 flex flex-col items-center border-r border-slate-100 shrink-0">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eec54e]/10 text-[#C8A000] text-[11px] font-bold uppercase tracking-[0.1em] mb-4 border border-[#eec54e]/20">
                <Sparkles className="w-3.5 h-3.5" />
                AISEP Potential Insight
              </div>
              <h2 className="text-[24px] font-bold text-[#0f172a] leading-tight tracking-tight">{startupName}</h2>
            </div>

            {/* Big Score Circle */}
            <div className="relative w-48 h-48 mb-10 group">
               {/* Outer glow effect */}
              <div className="absolute inset-0 rounded-full bg-[#eec54e]/5 blur-2xl group-hover:bg-[#eec54e]/10 transition-all duration-500" />
              
              <svg className="w-full h-full transform -rotate-90 relative z-10">
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-50"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={527}
                  strokeDashoffset={527 - (527 * (overallScore || 0)) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="text-[#eec54e] transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-[52px] font-black text-[#0f172a] tracking-tighter leading-none">
                  {report?.overallScore ?? overallScore ?? 0}
                </span>
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="w-full h-72 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                  <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  />
                  <Radar
                    name="Startup"
                    dataKey="A"
                    stroke="#eec54e"
                    strokeWidth={3}
                    fill="#eec54e"
                    fillOpacity={0.4}
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Right Column: Content */}
          <div className="flex-1 p-10 overflow-y-auto bg-slate-50/40">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#eec54e]" />
                <p className="text-[14px] font-semibold text-slate-500">Đang tổng hợp báo cáo chi tiết...</p>
              </div>
            ) : report ? (
              <div className="space-y-10">
                
                {/* Executive Summary Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#eec54e]" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tóm tắt chiến lược từ AISEP</h3>
                  </div>
                  <div className="bg-white px-7 py-7 rounded-[24px] border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <div className="prose prose-sm max-w-none text-[14px] text-slate-600 leading-[1.7] font-normal">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {report.executiveSummary || "AI đang phân tích các dữ liệu đã thu thập được..."}
                      </ReactMarkdown>
                    </div>
                  </div>
                </section>

                {/* Sub-Metrics Section (Pillars Detail) */}
                {report.subMetrics && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                      </div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Phân tích chi tiết tiêu chí</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { label: "Đội ngũ", key: "team", icon: "👥" },
                        { label: "Thị trường", key: "market", icon: "🌍" },
                        { label: "Sản phẩm", key: "product", icon: "📦" },
                        { label: "Sức kéo", key: "traction", icon: "📈" },
                        { label: "Tài chính", key: "financial", icon: "💰" }
                      ].map(group => {
                        const items = report.subMetrics[group.key as keyof typeof report.subMetrics] || [];
                        if (items.length === 0) return null;
                        return (
                          <div key={group.key} className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                              <span className="text-[12px] font-bold text-slate-700 flex items-center gap-2">
                                <span className="text-base">{group.icon}</span> {group.label}
                              </span>
                              <span className="text-[11px] font-black text-[#eec54e]">
                                {report[`${group.key}Score` as keyof typeof report] ?? 0}/100
                              </span>
                            </div>
                            <div className="p-4 space-y-3">
                              {items.map((m: any, i: number) => (
                                <div key={i} className="space-y-1">
                                  <div className="flex justify-between items-start gap-4">
                                    <span className="text-[13px] font-semibold text-slate-600 leading-tight">{m.name}</span>
                                    <span className="text-[12px] font-bold text-slate-400 shrink-0">{m.score}/{m.maxScore}</span>
                                  </div>
                                  {m.comment && <p className="text-[11px] text-slate-400 leading-relaxed italic">"{m.comment}"</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Data disclaimer */}
                <div className="flex items-start gap-4 p-5 bg-[#0f172a]/5 rounded-[20px] border border-[#0f172a]/10 mt-6">
                  <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                    Báo cáo này được tổng hợp tự động bởi thuật toán của AISEP dựa trên dữ liệu Pitch Deck và Business Plan của Startup. 
                    Nhà đầu tư nên sử dụng thông tin này như một tài liệu tham khảo bổ trợ cho quy trình Due Diligence.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-slate-100" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[16px] font-bold text-slate-600">Thông tin chi tiết đang được cập nhật</p>
                  <p className="text-[13px] text-slate-400 max-w-[300px]">Báo cáo chi tiết cho Startup này hiện chưa sẵn sàng. Bạn vẫn có thể xem Điểm số tổng quát ở bên cạnh.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
