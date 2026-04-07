"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, ArrowRight, Target, BarChart4, 
  ShieldCheck, Brain, Star 
} from "lucide-react";
import { IInvestorOnboardData } from "@/types/investor-kyc";

const MATURITY_OPTIONS = ["Idea", "MVP", "Early Traction", "Growth", "Scale-up"];
const VALIDATION_OPTIONS = ["Problem validated", "MVP tested", "Paying users", "Revenue traction", "Repeatable growth"];
const AI_SCORE_IMPORTANCE = [
  { value: "LOW", label: "Thấp" },
  { value: "MEDIUM", label: "Trung bình" },
  { value: "HIGH", label: "Cao" },
  { value: "CRITICAL", label: "Quyết định" }
];
const STRENGTH_OPTIONS = [
  "Founder quality", "Market size", "Team execution", "Product differentiation", 
  "Business model", "Technology moat", "Scalability", "Traction"
];

interface InvestorPreferencesStepProps {
  data: Partial<IInvestorOnboardData>;
  onChange: (data: Partial<IInvestorOnboardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function InvestorPreferencesStep({ data, onChange, onNext, onBack }: InvestorPreferencesStepProps) {
  const set = (key: keyof IInvestorOnboardData, val: any) => onChange({ ...data, [key]: val });

  const toggleList = (key: keyof IInvestorOnboardData, val: string) => {
    const list = (data[key] as string[]) || [];
    if (list.includes(val)) set(key, list.filter(v => v !== val));
    else set(key, [...list, val]);
  };

  const Label = ({ children, icon: Icon }: any) => (
    <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-tight">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      {children}
    </label>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="flex items-center gap-4 mb-2">
        <div className="w-11 h-11 rounded-xl bg-[#eec54e]/10 flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-[#eec54e]" />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight">Tiêu chí Kết nối & Matching</h2>
          <p className="text-[13px] text-slate-400 font-medium font-bold uppercase tracking-widest mt-0.5">Cấu hình cách AISEP gợi ý Startup cho bạn.</p>
        </div>
      </div>

      {/* Product Maturity */}
      <div className="space-y-4">
        <Label icon={BarChart4}>Mức độ hoàn thiện sản phẩm</Label>
        <div className="flex flex-wrap gap-2.5">
          {MATURITY_OPTIONS.map(opt => (
            <button 
              key={opt}
              type="button"
              onClick={() => toggleList("preferredProductMaturity", opt)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[13px] font-bold border transition-all active:scale-95 shadow-sm shadow-black/[0.02]",
                (data.preferredProductMaturity || []).includes(opt)
                  ? "bg-[#eec54e] border-[#eec54e] text-[#171611] shadow-lg shadow-[#eec54e]/20"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Validation Level */}
      <div className="space-y-4">
        <Label icon={ShieldCheck}>Mức độ kiểm chứng thị trường</Label>
        <div className="flex flex-wrap gap-2.5">
          {VALIDATION_OPTIONS.map(opt => (
            <button 
              key={opt}
              type="button"
              onClick={() => toggleList("preferredValidationLevel", opt)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[13px] font-bold border transition-all active:scale-95 shadow-sm shadow-black/[0.02]",
                (data.preferredValidationLevel || []).includes(opt)
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-black/10"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* AI Score Importance */}
        <div className="space-y-4">
          <Label icon={Brain}>Mức độ quan trọng của AI Score</Label>
          <div className="grid grid-cols-2 gap-3">
            {AI_SCORE_IMPORTANCE.map(opt => (
              <button 
                key={opt.value}
                type="button"
                onClick={() => set("aiScoreImportance", opt.value)}
                className={cn(
                  "px-4 py-3 rounded-xl text-[12px] font-bold border transition-all flex flex-col items-center justify-center gap-0.5",
                  data.aiScoreImportance === opt.value
                    ? "border-[#eec54e] bg-[#fdf8e6] text-[#171611] ring-1 ring-[#eec54e]/50"
                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 shadow-sm"
                )}
              >
                <span className="opacity-50 text-[10px] uppercase font-black tracking-tighter">Mức độ</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Strengths */}
        <div className="space-y-4">
          <Label icon={Star}>Thế mạnh kỳ vọng ở Startup</Label>
          <div className="flex flex-wrap gap-2">
            {STRENGTH_OPTIONS.map(opt => (
              <button 
                key={opt}
                type="button"
                onClick={() => toggleList("preferredStrengths", opt)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all uppercase tracking-tight",
                  (data.preferredStrengths || []).includes(opt)
                    ? "bg-slate-800 border-slate-800 text-white shadow-md shadow-black/10"
                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 shadow-sm"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Bước 2
        </button>
        <button
          onClick={onNext}
          className="h-11 px-8 bg-slate-900 text-white rounded-xl text-[13px] font-bold flex items-center gap-2.5 hover:bg-slate-800 transition-all shadow-lg shadow-black/5 group active:scale-95"
        >
          Tiếp tục: Xác thực tài khoản
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}
