"use client";

import { AlertCircle, CheckCircle2, Loader2, Info, Lock } from "lucide-react";
import { AIEvaluationStatus } from "@/app/startup/ai-evaluation/types";
import { cn } from "@/lib/utils";

interface AIEvaluationStatusBannerProps {
  status: AIEvaluationStatus;
}

export function AIEvaluationStatusBanner({ status }: AIEvaluationStatusBannerProps) {
  const config = {
    NOT_REQUESTED: {
      icon: Info,
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      text: "text-blue-700",
      label: "Chào mừng! Hãy bắt đầu hành trình của bạn bằng cách yêu cầu một bản đánh giá từ AI SEP.",
    },
    VALIDATING: {
      icon: Loader2,
      bg: "bg-yellow-50/50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      label: "Đang kiểm tra hồ sơ và tài liệu...",
      pulse: true,
    },
    QUEUED: {
      icon: Loader2,
      bg: "bg-blue-50/50",
      border: "border-blue-200",
      text: "text-blue-700",
      label: "Yêu cầu của bạn đã được đưa vào hàng đợi xử lý...",
      pulse: true,
    },
    ANALYZING: {
      icon: Loader2,
      bg: "bg-purple-50/50",
      border: "border-purple-200",
      text: "text-purple-700",
      label: "AI đang phân tích dữ liệu startup của bạn...",
      pulse: true,
    },
    SCORING: {
      icon: Loader2,
      bg: "bg-indigo-50/50",
      border: "border-indigo-200",
      text: "text-indigo-700",
      label: "Đang tính toán điểm số các hạng mục...",
      pulse: true,
    },
    GENERATING_REPORT: {
      icon: Loader2,
      bg: "bg-emerald-50/50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      label: "Đang tổng hợp báo cáo chi tiết và đề xuất...",
      pulse: true,
    },
    COMPLETED: {
      icon: CheckCircle2,
      bg: "bg-emerald-50/30",
      border: "border-emerald-100",
      text: "text-emerald-600",
      label: "Báo cáo đánh giá AI đã hoàn tất và sẵn sàng để xem.",
    },
    FAILED: {
      icon: AlertCircle,
      bg: "bg-red-50/50",
      border: "border-red-100",
      text: "text-red-600",
      label: "Quá trình đánh giá thất bại. Vui lòng thử lại sau.",
    },
    INSUFFICIENT_DATA: {
      icon: AlertCircle,
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      text: "text-amber-700",
      label: "Thiếu dữ liệu: Vui lòng tải lên Pitch Deck và Business Plan để AISEP có thể thực hiện đánh giá.",
    },
    ACCESS_RESTRICTED: {
      icon: Lock,
      bg: "bg-slate-100",
      border: "border-slate-200",
      text: "text-slate-600",
      label: "Bạn không có quyền truy cập vào báo cáo chi tiết này.",
    },
  }[status] || { icon: Info, bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-500", label: "Đang xử lý..." };

  const Icon = config.icon;

  return (
    <div className={cn(
      "p-5 rounded-[24px] border flex items-center gap-4 animate-in fade-in duration-500 mb-8",
      config.bg,
      config.border
    )}>
      <div className={cn(
        "size-10 rounded-xl flex items-center justify-center shrink-0",
        config.pulse ? "animate-pulse" : ""
      )}>
        <Icon className={cn("size-6", config.text, config.pulse ? "animate-spin" : "")} />
      </div>
      <p className={cn("text-[14px] font-bold tracking-tight", config.text)}>
        {config.label}
      </p>
    </div>
  );
}
