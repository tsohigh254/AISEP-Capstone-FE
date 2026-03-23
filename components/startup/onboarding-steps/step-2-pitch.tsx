"use client";

import { Rocket, Target, HelpCircle, ArrowRight, ArrowLeft, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const labelCls = "block text-[13px] font-semibold text-slate-700 mb-1.5";
const textareaCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 shadow-sm resize-none min-h-[100px]";

interface Step2Props {
  data: any;
  update: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step2({ data, update, onNext, onPrev }: Step2Props) {
  const isFormValid = data.problem.length >= 10 && data.solution.length >= 10;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
         <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Giải pháp & Giá trị</h2>
         <p className="text-[14px] text-slate-500 leading-relaxed">Hãy giúp AI hiểu rõ bài toán bạn đang giải quyết và cách tiếp cận độc đáo của Startup.</p>
      </div>

      <div className="space-y-6">
        {/* Problem */}
        <div className="space-y-1.5">
           <div className="flex items-center justify-between">
              <label className={labelCls}>Vấn đề cốt lõi <span className="text-red-400">*</span></label>
              <span className="text-[11px] text-slate-300 font-bold">{data.problem.length}/300</span>
           </div>
           <div className="relative group">
              <HelpCircle className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
              <textarea 
                className={textareaCls}
                value={data.problem}
                onChange={e => update({ ...data, problem: e.target.value.slice(0, 300) })}
                placeholder="Vấn đề lớn nhất mà khách hàng của bạn đang gặp phải là gì?"
              />
           </div>
        </div>

        {/* Solution */}
        <div className="space-y-1.5">
           <div className="flex items-center justify-between">
              <label className={labelCls}>Giải pháp độc đáo <span className="text-red-400">*</span></label>
              <span className="text-[11px] text-slate-300 font-bold">{data.solution.length}/300</span>
           </div>
           <div className="relative group">
              <Sparkles className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
              <textarea 
                className={textareaCls}
                value={data.solution}
                onChange={e => update({ ...data, solution: e.target.value.slice(0, 300) })}
                placeholder="Bạn giải quyết vấn đề đó như thế nào một cách khác biệt?"
              />
           </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-1.5">
           <label className={labelCls}>Khách hàng mục tiêu <span className="text-red-400">*</span></label>
           <div className="relative group">
              <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
              <input 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 shadow-sm"
                value={data.targetAudience}
                onChange={e => update({ ...data, targetAudience: e.target.value })}
                placeholder="Vd: SMEs tại Việt Nam, Nông dân vùng cao..."
              />
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
         <button 
          onClick={onPrev}
          className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5"
         >
            ← Quay lại
         </button>
         <button 
          onClick={onNext}
          disabled={!isFormValid}
          className={cn(
            "px-8 h-12 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 group shadow-sm",
            isFormValid 
              ? "bg-[#0f172a] text-white hover:bg-[#1e293b]" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
         >
            Tiếp tục
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
         </button>
      </div>
    </div>
  );
}
