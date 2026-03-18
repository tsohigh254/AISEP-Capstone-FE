"use client";

import { TrendingUp, Target, Users, Layout, CircleDollarSign } from "lucide-react";
import { AIEvaluationReport } from "@/app/startup/ai-evaluation/types";
import { cn } from "@/lib/utils";

interface AIEvaluationSummaryProps {
  report: AIEvaluationReport;
}

export function AIEvaluationSummary({ report }: AIEvaluationSummaryProps) {
  const metrics = [
    { label: "Team", score: report.teamScore, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Market", score: report.marketScore, icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Product", score: report.productScore, icon: Layout, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Traction", score: report.tractionScore, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Financial", score: report.financialScore, icon: CircleDollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Document Scores Section */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layout className="size-24 -rotate-12" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-red-500" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Pitch Deck Score</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{report.pitchDeckScore}</h2>
                <span className="text-xl font-bold text-slate-400">/100</span>
              </div>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                Đánh giá dựa trên cấu trúc, thiết kế và khả năng truyền tải thông điệp gọi vốn.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <CircleDollarSign className="size-24 -rotate-12" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Business Plan Score</p>
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{report.businessPlanScore}</h2>
                <span className="text-xl font-bold text-slate-400">/100</span>
              </div>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                Đánh giá dựa trên mô hình kinh doanh, kế hoạch tài chính và tính khả thi.
              </p>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="md:col-span-4 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20 flex flex-col justify-center border border-slate-800">
          <div className="absolute -top-12 -right-12 size-48 bg-[#eec54e]/10 rounded-full blur-[60px]" />
          <div className="relative z-10 space-y-4 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#eec54e]">Potential Score (AVG)</p>
            <div className="flex items-baseline justify-center gap-2">
              <h2 className="text-7xl font-black tracking-tighter text-white">{report.overallScore}</h2>
              <span className="text-2xl font-bold text-slate-600">/100</span>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
                <span>{report.pitchDeckScore}</span>
                <span className="opacity-30">+</span>
                <span>{report.businessPlanScore}</span>
                <span className="opacity-30">/ 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3 hover:shadow-xl hover:shadow-black/5 transition-all group">
            <div className={cn("size-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", m.bg)}>
              <m.icon className={cn("size-5", m.color)} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{m.score}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
