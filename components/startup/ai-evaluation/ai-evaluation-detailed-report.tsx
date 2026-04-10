"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { ImprovementRecommendationDto } from "@/app/startup/ai-evaluation/types";
import { cn } from "@/lib/utils";

interface AIEvaluationDetailedReportProps {
  recommendations: ImprovementRecommendationDto[];
}

export function AIEvaluationDetailedReport({ recommendations }: AIEvaluationDetailedReportProps) {
  // Group recommendations by priority
  const highPriority = recommendations.filter(r => r.priority === "High" || r.priority === "HIGH");
  const mediumPriority = recommendations.filter(r => r.priority === "Medium" || r.priority === "MEDIUM");
  const lowPriority = recommendations.filter(r => r.priority === "Low" || r.priority === "LOW");

  const sections = [
    {
      title: "Ưu tiên cao (High Priority)",
      items: highPriority.map(r => r.recommendationText ?? ""),
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50/50",
      border: "border-red-100",
      indicator: "bg-red-500"
    },
    {
      title: "Ưu tiên trung bình (Medium Priority)",
      items: mediumPriority.map(r => r.recommendationText ?? ""),
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      indicator: "bg-amber-500"
    },
    {
      title: "Ưu tiên thấp (Low Priority)",
      items: lowPriority.map(r => r.recommendationText ?? ""),
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      indicator: "bg-blue-500"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {sections.filter(s => s.items.length > 0).map((s) => (
        <div
          key={s.title}
          className={cn(
            "rounded-[32px] border p-8 space-y-6 flex flex-col",
            s.bg,
            s.border
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn("size-10 rounded-xl flex items-center justify-center", s.bg, "border border-white/50")}>
              <s.icon className={cn("size-5", s.color)} />
            </div>
            <h4 className="text-[16px] font-black text-slate-900 tracking-tight">{s.title}</h4>
          </div>

          <ul className="space-y-4 flex-1">
            {s.items.map((item, idx) => (
              <li key={idx} className="flex gap-4 items-start group">
                <div className={cn("size-1.5 rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform", s.indicator)} />
                <p className="text-[13px] text-slate-700 font-medium leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
