"use client";

import { Sparkles, Calendar, ShieldCheck, RefreshCw, FileDown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIScoreLatestResponse, UserRole } from "@/app/startup/ai-evaluation/types";

interface AIEvaluationHeaderProps {
  score?: AIScoreLatestResponse;
  userRole: UserRole;
  onRequest: () => void;
  onExport: () => void;
  onHistory: () => void;
  hasHistory: boolean;
  isProcessing: boolean;
  isExporting: boolean;
}

export function AIEvaluationHeader({ score, userRole, onRequest, onExport, onHistory, hasHistory, isProcessing, isExporting }: AIEvaluationHeaderProps) {
  const isStartup = userRole === "STARTUP_OWNER";

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#eec54e]/10 rounded-xl flex items-center justify-center">
            <Sparkles className="size-6 text-[#eec54e]" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AI Evaluation</h1>
        </div>
        {score && (
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4 opacity-70" />
              Ngày cập nhật: <b className="text-slate-900 dark:text-white">{new Date(score.calculatedAt).toLocaleDateString("vi-VN")}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" />
              Score ID: <b className="text-slate-900 dark:text-white">#{score.scoreId}</b>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {score && (
          <Button
            onClick={onExport}
            disabled={isExporting}
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-[14px] transition-all active:scale-95 gap-2"
          >
            {isExporting ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <FileDown className="size-4 text-red-500" />
            )}
            Xuất nội dung PDF
          </Button>
        )}

        {isStartup && (
          <Button
            onClick={onRequest}
            disabled={isProcessing}
            className="h-12 px-8 rounded-2xl bg-[#eec54e] hover:bg-[#d4ae3d] text-white font-black text-[14px] uppercase tracking-widest shadow-xl shadow-yellow-500/10 transition-all active:scale-95 gap-3"
          >
            {isProcessing ? (
              <RefreshCw className="size-5 animate-spin" />
            ) : (
              <Sparkles className="size-5" />
            )}
            {score ? "Cập nhật tài liệu & Đánh giá" : "Chọn tài liệu & Đánh giá AI"}
          </Button>
        )}

        {hasHistory && (
          <Button
            onClick={onHistory}
            variant="outline"
            className="h-12 px-6 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-[14px] transition-all active:scale-95 gap-2"
          >
            <History className="size-4 text-slate-400" />
            Lịch sử đánh giá
          </Button>
        )}
      </div>
    </div>
  );
}

export function AIEvaluationDisclaimer() {
  return (
    <div className="mt-12 p-6 rounded-[32px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
        Miễn trừ trách nhiệm: Kết quả đánh giá bằng AI chỉ mang tính chất tham khảo và hỗ trợ quyết định, không phải là lời khuyên đầu tư tài chính.
        AISEP không chịu trách nhiệm về các quyết định kinh doanh dựa trên báo cáo này.
      </p>
    </div>
  );
}
