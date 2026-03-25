"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Building2, User, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

interface InvestorTypeStepProps {
  selected: "INSTITUTIONAL" | "INDIVIDUAL_ANGEL" | null;
  onSelect: (type: "INSTITUTIONAL" | "INDIVIDUAL_ANGEL") => void;
  onNext: () => void;
  onBack: () => void;
}

export function InvestorTypeStep({ selected, onSelect, onNext, onBack }: InvestorTypeStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Chào mừng Nhà đầu tư!</h1>
        <p className="text-[13px] text-slate-500 font-normal">Bạn tham gia AISEP với tư cách là cá nhân hay tổ chức?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[720px] mx-auto">
        
        {/* Institutional Card */}
        <button 
          onClick={() => onSelect("INSTITUTIONAL")}
          className={cn(
            "group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden text-left h-full flex flex-col",
            selected === "INSTITUTIONAL" 
              ? "border-[#eec54e] bg-white ring-2 ring-[#eec54e]/10 shadow-[0_8px_24px_rgba(238,197,78,0.12)]" 
              : "border-slate-200/80 bg-white hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500",
            selected === "INSTITUTIONAL" ? "bg-[#eec54e] text-slate-900 shadow-md" : "bg-slate-50 text-slate-400 group-hover:bg-[#eec54e]/20 group-hover:text-slate-900"
          )}>
            <Building2 className="w-6 h-6" />
          </div>
          
          <h3 className="text-[15px] font-bold text-slate-900 mb-2">Institutional Investor</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed font-normal flex-1">
            Quỹ đầu tư (VC), Doanh nghiệp (CVC), Vườn ươm (Accelerator) hoặc Tổ chức tài chính có tư cách pháp nhân.
          </p>

          <div className={cn(
            "absolute top-5 right-5 transition-all duration-500",
            selected === "INSTITUTIONAL" ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}>
            <div className="bg-[#eec54e] rounded-full p-0.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-white fill-emerald-500/0" />
            </div>
          </div>
        </button>

        {/* Individual Card */}
        <button 
          onClick={() => onSelect("INDIVIDUAL_ANGEL")}
          className={cn(
            "group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden text-left h-full flex flex-col",
            selected === "INDIVIDUAL_ANGEL" 
              ? "border-[#eec54e] bg-white ring-2 ring-[#eec54e]/10 shadow-[0_8px_24px_rgba(238,197,78,0.12)]" 
              : "border-slate-200/80 bg-white hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500",
            selected === "INDIVIDUAL_ANGEL" ? "bg-[#eec54e] text-slate-900 shadow-md" : "bg-slate-50 text-slate-400 group-hover:bg-[#eec54e]/20 group-hover:text-slate-900"
          )}>
            <User className="w-6 h-6" />
          </div>
          
          <h3 className="text-[15px] font-bold text-slate-900 mb-2">Individual / Angel</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed font-normal flex-1">
            Nhà đầu tư thiên thần, cá nhân có chuyên môn hoặc nhân vật có tầm ảnh hưởng tham gia đầu tư độc lập.
          </p>

          <div className={cn(
            "absolute top-5 right-5 transition-all duration-500",
            selected === "INDIVIDUAL_ANGEL" ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}>
            <div className="bg-[#eec54e] rounded-full p-0.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-white fill-emerald-500/0" />
            </div>
          </div>
        </button>

      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-6">
        <button 
          onClick={onBack}
          className="h-11 px-6 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold hover:bg-slate-100 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <button
          onClick={onNext}
          disabled={!selected}
          className="h-11 px-10 bg-[#0f172a] text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#1e293b] transition-all shadow-sm active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed group"
        >
          Tiếp tục thiết lập hồ sơ
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
