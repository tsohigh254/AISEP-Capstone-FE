"use client";

import { TrendingUp, Target, Users, Layout, CircleDollarSign } from "lucide-react";
import type { AIScoreLatestResponse } from "@/app/startup/ai-evaluation/types";
import { cn } from "@/lib/utils";

interface AIEvaluationSummaryProps {
  score: AIScoreLatestResponse;
}

export function AIEvaluationSummary({ score }: AIEvaluationSummaryProps) {
  const metrics = [
    { label: "Team", score: score.teamScore, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Market", score: score.marketScore, icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Product", score: score.productScore, icon: Layout, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Traction", score: score.tractionScore, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Financial", score: score.financialScore, icon: CircleDollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Score Card */}
        <div className="md:col-span-4 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20 flex flex-col justify-center border border-slate-800">
          <div className="absolute -top-12 -right-12 size-48 bg-[#eec54e]/10 rounded-full blur-[60px]" />
          <div className="relative z-10 space-y-4 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#eec54e]">Potential Score</p>
            <div className="flex items-baseline justify-center gap-2">
              <h2 className="text-7xl font-black tracking-tighter text-white">{score.overallScore}</h2>
              <span className="text-2xl font-bold text-slate-600">/100</span>
            </div>
          </div>
        </div>

        {/* Placeholder for additional cards */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Đánh giá ngày</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {new Date(score.calculatedAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Khuyến nghị</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {score.recommendations.length} đề xuất
            </p>
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
