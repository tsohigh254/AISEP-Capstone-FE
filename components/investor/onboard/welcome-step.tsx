"use client";

import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 max-w-[480px] mx-auto text-center py-6">
      
      {/* Icon Area */}
      <div className="relative inline-block">
        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm relative z-10">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center z-20">
          <ShieldCheck className="w-4 h-4 text-[#eec54e]" />
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-3">
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight leading-tight">
          Chào mừng!
        </h1>
        <p className="text-[13px] text-slate-500 font-normal leading-relaxed">
          Chào mừng bạn đến với cộng đồng AISEP. Hãy dành 2 phút để thiết lập hồ sơ Investor cơ bản và bắt đầu kết nối với những Startup tiềm năng nhất.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 pt-4">
        <button
          onClick={onNext}
          className="h-11 bg-[#0f172a] text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-[13px] hover:bg-[#1e293b] transition-all shadow-sm active:scale-[0.98] group"
        >
          Bắt đầu thiết lập hồ sơ
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};
