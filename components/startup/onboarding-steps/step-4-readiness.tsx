"use client";

import { PieChart, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateReadiness } from "@/services/startup/startup-onboarding.mock";

interface Step4Props {
  data: any;
  onNext: () => void;
  onPrev: () => void;
}

export function Step4({ data, onNext, onPrev }: Step4Props) {
  const { score, missingItems } = calculateReadiness(data);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
         <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Phân tích sẵn sàng</h2>
         <p className="text-[14px] text-slate-500 leading-relaxed">Chúng tôi đã tổng hợp dữ liệu để đánh giá tiềm năng và độ hoàn thiện của dự án.</p>
      </div>

      {/* Score Visualization - Premium Style */}
      <div className="bg-[#0f172a] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
         <div className="relative z-10 flex flex-col items-center text-center gap-6">
            {/* Circular Progress */}
            <div className="relative size-36 flex items-center justify-center">
               <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="16"
                    className="stroke-white/5"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="18" cy="18" r="16"
                    className="stroke-[#eec54e] transition-all duration-[1500ms] ease-out shadow-2xl"
                    strokeWidth="3"
                    strokeDasharray={`${score}, 100`}
                    strokeLinecap="round"
                    fill="none"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[36px] font-black leading-none">{score}%</span>
                  <span className="text-[9px] font-bold text-[#eec54e] uppercase tracking-[0.2em] mt-1">Ready</span>
               </div>
               {/* Glowing effect */}
               <div className="absolute size-32 bg-[#eec54e]/10 blur-[40px] rounded-full -z-10" />
            </div>

            <div className="space-y-1.5">
               <h3 className="text-[18px] font-bold flex items-center justify-center gap-2">
                 {score === 100 ? "Tuyệt vời! Bạn đã sẵn sàng" : score >= 70 ? "Hồ sơ chất lượng cao" : "Cần bổ sung thông tin"}
                 {score >= 70 && <Sparkles className="w-4 h-4 text-[#eec54e]" />}
               </h3>
               <p className="text-[12px] text-slate-400 max-w-sm">Dựa trên 12 chỉ số về thị trường, giải pháp và tài liệu minh chứng.</p>
            </div>
         </div>
         {/* Decor */}
         <Trophy className="absolute -top-4 -left-4 size-24 text-white/5 -rotate-12" />
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Danh mục hoàn thiện</span>
         </div>
         <div className="grid grid-cols-1 gap-2">
            {missingItems.length > 0 ? missingItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl group transition-all">
                 <div className="size-7 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                 </div>
                 <p className="text-[13px] font-medium text-slate-600 truncate">Thiếu: <span className="font-bold text-slate-900">{item}</span></p>
              </div>
            )) : (
              <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 <p className="text-[13px] font-bold text-emerald-700">Tất cả chỉ số đều đạt chuẩn AISEP Pipeline!</p>
              </div>
            )}
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
          className="px-8 h-12 rounded-xl font-bold text-[13px] bg-[#0f172a] text-white hover:bg-[#1e293b] transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-95"
         >
            Hoàn tất Onboarding
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
         </button>
      </div>
    </div>
  );
}
