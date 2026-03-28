"use client";

import { HelpCircle, Sparkles, Target, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardFormData } from "./step-1-identity";

const labelCls = "block text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5";
const textareaCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 outline-none transition-all bg-white focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 shadow-sm resize-none";

interface Step2Props {
  data: OnboardFormData;
  update: (data: OnboardFormData) => void;
  onNext: () => void;
  onPrev: () => void;
  loading?: boolean;
}

export function Step2({ data, update, onNext, onPrev, loading }: Step2Props) {
  const isValid =
    data.problem.trim().length >= 10 &&
    data.solution.trim().length >= 10 &&
    data.targetAudience.trim().length > 0;

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-400">

      {/* Header */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-[#eec54e] uppercase tracking-widest">Bước 2 / 2</p>
        <h2 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight">
          Kể câu chuyện của bạn
        </h2>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Viết thật tự nhiên — không cần hoàn hảo. AI sẽ giúp bạn trau chuốt sau.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-5">

        {/* Problem */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={labelCls}>
              Vấn đề bạn đang giải quyết <span className="text-red-400 normal-case">*</span>
            </label>
            <span className={cn(
              "text-[11px] font-semibold tabular-nums transition-colors",
              data.problem.length >= 270 ? "text-amber-500" : "text-slate-400"
            )}>
              {data.problem.length}/300
            </span>
          </div>
          <div className="relative group">
            <HelpCircle className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
            <textarea
              className={cn(textareaCls, "min-h-[90px]")}
              value={data.problem}
              onChange={e => update({ ...data, problem: e.target.value.slice(0, 300) })}
              placeholder="Khách hàng của bạn đang gặp vấn đề gì lớn?"
            />
          </div>
        </div>

        {/* Solution */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={labelCls}>
              Giải pháp của bạn <span className="text-red-400 normal-case">*</span>
            </label>
            <span className={cn(
              "text-[11px] font-semibold tabular-nums transition-colors",
              data.solution.length >= 270 ? "text-amber-500" : "text-slate-400"
            )}>
              {data.solution.length}/300
            </span>
          </div>
          <div className="relative group">
            <Sparkles className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
            <textarea
              className={cn(textareaCls, "min-h-[90px]")}
              value={data.solution}
              onChange={e => update({ ...data, solution: e.target.value.slice(0, 300) })}
              placeholder="Bạn giải quyết bằng cách nào khác biệt?"
            />
          </div>
        </div>

        {/* Target */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={labelCls}>
              Khách hàng mục tiêu <span className="text-red-400 normal-case">*</span>
            </label>
            <span className={cn(
              "text-[11px] font-semibold tabular-nums transition-colors",
              data.targetAudience.length >= 135 ? "text-amber-500" : "text-slate-400"
            )}>
              {data.targetAudience.length}/150
            </span>
          </div>
          <div className="relative group">
            <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 outline-none transition-all bg-white focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 shadow-sm"
              value={data.targetAudience}
              onChange={e => update({ ...data, targetAudience: e.target.value.slice(0, 150) })}
              placeholder="Vd: SMEs tại Việt Nam, sinh viên đại học..."
            />
          </div>
        </div>
      </div>

      {/* Encouragement */}
      {isValid && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 animate-in fade-in duration-300">
          <span className="text-[16px]">🎉</span>
          <p className="text-[12px] text-emerald-700 font-medium">
            Tuyệt! Bạn đã sẵn sàng tạo hồ sơ.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-medium hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button
          onClick={onNext}
          disabled={!isValid || loading}
          className={cn(
            "inline-flex items-center gap-1.5 px-6 h-11 rounded-xl font-semibold text-[13px] transition-all shadow-sm",
            isValid && !loading
              ? "bg-[#0f172a] text-white hover:bg-[#1e293b]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tạo hồ sơ...
            </>
          ) : (
            <>
              Hoàn tất
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
