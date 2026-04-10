"use client";

import { History, Eye } from "lucide-react";
import type { AIScoreLatestResponse } from "@/app/startup/ai-evaluation/types";
import { cn } from "@/lib/utils";

interface AIEvaluationHistoryProps {
  scores: AIScoreLatestResponse[];
  currentId: number;
  onSelect: (id: number) => void;
}

export function AIEvaluationHistoryList({ scores, currentId, onSelect }: AIEvaluationHistoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <History className="size-5 text-slate-400" />
        </div>
        <h3 className="text-[18px] font-black text-slate-900 dark:text-white tracking-tight">Lịch sử đánh giá (Evaluation History)</h3>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                <th className="px-8 py-4">Thời gian</th>
                <th className="px-8 py-4">Score ID</th>
                <th className="px-8 py-4">Điểm tổng quát</th>
                <th className="px-8 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {scores.map((s) => (
                <tr
                  key={s.scoreId}
                  className={cn(
                    "group transition-colors",
                    s.scoreId === currentId ? "bg-[#eec54e]/5" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {new Date(s.calculatedAt).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">{new Date(s.calculatedAt).toLocaleTimeString("vi-VN")}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                      #{s.scoreId}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-slate-900 text-[#eec54e] flex items-center justify-center font-black text-xs">
                        {s.overallScore}
                      </div>
                      {s.scoreId === currentId && (
                        <span className="text-[9px] font-black text-[#eec54e] uppercase bg-[#eec54e]/10 px-1.5 py-0.5 rounded">Đang xem</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => onSelect(s.scoreId)}
                      disabled={s.scoreId === currentId}
                      className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[#eec54e] hover:text-[#d4ae3d] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Eye className="size-4" />
                      Xem lại
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
