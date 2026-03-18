"use client";

import { CheckCircle2, Zap, AlertTriangle, AlertCircle } from "lucide-react";
import { AIEvaluationReport } from "@/app/startup/ai-evaluation/types";
import { cn } from "@/lib/utils";

interface AIEvaluationDetailedReportProps {
  report: AIEvaluationReport;
}

export function AIEvaluationDetailedReport({ report }: AIEvaluationDetailedReportProps) {
  const sections = [
    {
      title: "Ưu điểm nổi bật (Strengths)",
      items: report.strengths,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      indicator: "bg-emerald-500"
    },
    {
      title: "Cơ hội thị trường (Opportunities)",
      items: report.opportunities,
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      indicator: "bg-blue-500"
    },
    {
      title: "Rủi ro cần lưu ý (Risks)",
      items: report.risks,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      indicator: "bg-amber-500"
    },
    {
      title: "Quan ngại từ AI (Concerns)",
      items: report.concerns,
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-50/50",
      border: "border-red-100",
      indicator: "bg-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {sections.map((s) => (
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
            {s.items.length === 0 && (
              <p className="text-xs text-slate-400 italic">Chưa có thông tin phân tích.</p>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
