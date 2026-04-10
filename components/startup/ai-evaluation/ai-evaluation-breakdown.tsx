"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { AIScoreLatestResponse, SubMetricDto } from "@/app/startup/ai-evaluation/types";
import { cn } from "@/lib/utils";

interface AIEvaluationBreakdownProps {
  score: AIScoreLatestResponse;
}

export function AIEvaluationBreakdown({ score }: AIEvaluationBreakdownProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Group sub-metrics by category
  const grouped: Record<string, SubMetricDto[]> = {};
  for (const m of score.subMetrics) {
    const cat = m.category.toLowerCase();
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(m);
  }

  const sections = [
    { key: "team", label: "Đội ngũ sáng lập", score: score.teamScore },
    { key: "market", label: "Thị trường & Đối thủ", score: score.marketScore },
    { key: "product", label: "Sản phẩm & Công nghệ", score: score.productScore },
    { key: "traction", label: "Tăng trưởng & Traction", score: score.tractionScore },
    { key: "financial", label: "Tài chính & Hiệu quả", score: score.financialScore },
  ];

  return (
    <div className="space-y-4 mb-10">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-[18px] font-black text-slate-900 dark:text-white tracking-tight">Chi tiết điểm số (Score Breakdown)</h3>
      </div>

      {sections.map((section) => {
        const isExpanded = expandedSection === section.key;
        const metrics = grouped[section.key] ?? [];
        return (
          <div
            key={section.key}
            className={cn(
              "bg-white dark:bg-slate-900 rounded-[28px] border transition-all overflow-hidden",
              isExpanded ? "border-[#eec54e]/50 ring-4 ring-[#eec54e]/5" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
            )}
          >
            <button
              onClick={() => setExpandedSection(isExpanded ? null : section.key)}
              className="w-full px-8 py-6 flex items-center justify-between group"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-900 dark:text-white">
                  {section.score}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">{section.label}</h4>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#eec54e] rounded-full transition-all duration-700"
                      style={{ width: `${section.score}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="ml-8 p-2 rounded-xl group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
                {isExpanded ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {metrics.map((metric, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{metric.metricName}</span>
                        <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {metric.metricScore}/10
                        </span>
                      </div>
                      {metric.explanation && (
                        <p className="text-[12px] text-slate-500 italic leading-relaxed">"{metric.explanation}"</p>
                      )}
                    </div>
                  ))}
                  {metrics.length === 0 && (
                    <p className="col-span-2 text-center text-xs text-slate-400 font-medium py-4">Chưa có dữ liệu phân tích chi tiết cho hạng mục này.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
