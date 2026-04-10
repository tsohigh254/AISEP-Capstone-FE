"use client";

import { Lightbulb, ArrowRight, Zap } from "lucide-react";
import type { ImprovementRecommendationDto } from "@/app/startup/ai-evaluation/types";
import { cn } from "@/lib/utils";

interface AIEvaluationRecommendationsProps {
  recommendations: ImprovementRecommendationDto[];
}

export function AIEvaluationRecommendations({ recommendations }: AIEvaluationRecommendationsProps) {
  return (
    <div className="space-y-6 mb-12">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-yellow-400 flex items-center justify-center">
          <Lightbulb className="size-5 text-white" />
        </div>
        <h3 className="text-[18px] font-black text-slate-900 dark:text-white tracking-tight">Đề xuất cải thiện (Actionable Recommendations)</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="group bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 p-8 flex flex-col md:flex-row gap-8 hover:border-[#eec54e]/30 transition-all hover:shadow-xl hover:shadow-black/5"
          >
            <div className="md:w-1/3 space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                  rec.priority === "High" || rec.priority === "HIGH" ? "bg-red-50 text-red-600" :
                  rec.priority === "Medium" || rec.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                )}>
                  Priority: {rec.priority}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{rec.category}</span>
              </div>
              <h4 className="text-[16px] font-black text-slate-900 dark:text-white leading-tight pr-4">
                {rec.recommendationText}
              </h4>
            </div>

            {rec.expectedImpact && (
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex items-start gap-4">
                <div className="size-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <Zap className="size-4 text-[#eec54e]" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tác động dự kiến (Impact)</p>
                  <p className="text-[14px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.expectedImpact}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <button className="size-12 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-[#eec54e] group-hover:border-[#eec54e] transition-all group/btn">
                <ArrowRight className="size-5 text-slate-400 group-hover/btn:text-white transition-colors" />
              </button>
            </div>
          </div>
        ))}
        {recommendations.length === 0 && (
          <div className="p-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
            <p className="text-sm text-slate-400 font-bold italic">Chưa có đề xuất cụ thể dựa trên dữ liệu hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
}
