"use client";

import { Lock, FileWarning, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AIEvaluationAccessRestricted() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-8 animate-in zoom-in-95 duration-700">
      <div className="size-24 rounded-[32px] bg-slate-100 flex items-center justify-center relative">
        <Lock className="size-10 text-slate-300" />
        <div className="absolute -top-2 -right-2 size-6 bg-red-500 rounded-full border-4 border-white flex items-center justify-center" />
      </div>
      <div className="space-y-4 max-w-md">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Truy cập bị hạn chế</h2>
        <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
          Bạn không có đủ quyền hạn để xem báo cáo đánh giá AI chi tiết của Startup này. Vui lòng nâng cấp gói thành viên hoặc yêu cầu quyền truy cập từ chủ sở hữu.
        </p>
      </div>
      <Button className="h-12 px-8 rounded-2xl bg-[#171611] text-white font-black text-sm uppercase tracking-widest">
        Nâng cấp ngay
      </Button>
    </div>
  );
}

export function AIEvaluationEmpty({ onRequest }: { onRequest: () => void }) {
  const steps = [
    { id: "01", title: "Chọn tài liệu", desc: "Tải lên Pitch Deck & Business Plan mới nhất." },
    { id: "02", title: "AI Phân tích", desc: "Hệ thống AISEP quét và chấm điểm 5 khía cạnh cốt lõi." },
    { id: "03", title: "Nhận báo cáo", desc: "Xem chi tiết ưu/nhược điểm và lộ trình khuyến nghị." },
  ];

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#eec54e]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-12">
        {/* Hero Illustration Area */}
        <div className="relative group">
          <div className="size-32 bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl shadow-black/5 flex items-center justify-center relative translate-y-0 group-hover:-translate-y-2 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
            <Sparkles className="size-16 text-[#eec54e] drop-shadow-sm" />
          </div>
        </div>
        
        {/* Text Content */}
        <div className="space-y-4 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Nâng tầm Startup với <span className="text-[#eec54e]">AI Evaluation</span>
          </h2>
          <p className="text-[17px] text-slate-500 font-medium leading-relaxed">
            Hệ thống AI tiên tiến của AISEP sẽ phân tích sâu hồ sơ của bạn, chấm điểm tiềm năng và đưa ra các khuyến nghị chiến lược để thu hút nhà đầu tư.
          </p>
        </div>

        {/* Requirements & How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {steps.map((step) => (
            <div key={step.id} className="p-6 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all text-left space-y-3 group">
              <span className="text-[11px] font-black text-[#eec54e] bg-[#eec54e]/10 px-2 py-0.5 rounded uppercase tracking-widest">{step.id}</span>
              <h4 className="text-[15px] font-black text-slate-900 dark:text-white">{step.title}</h4>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Documents Required Warning */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-900/5 dark:bg-white/5 p-4 rounded-[32px] border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-white/10">
            <FileWarning className="size-4 text-red-500" />
            <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Pitch Deck</span>
          </div>
          <div className="flex items-center gap-2">
            <FileWarning className="size-4 text-blue-500" />
            <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Business Plan</span>
          </div>
          <div className="pl-4 text-[11px] text-slate-500 font-medium">
            (Cần thiết để AI có thể đánh giá)
          </div>
        </div>

        <Button 
          onClick={onRequest}
          className="h-16 px-12 rounded-[24px] bg-[#eec54e] hover:bg-[#d4ae3d] text-white font-black text-[16px] uppercase tracking-widest shadow-2xl shadow-yellow-500/30 gap-4 transition-all hover:scale-105 active:scale-95 group"
        >
          <Sparkles className="size-6 group-hover:rotate-12 transition-transform" />
          Bắt đầu đánh giá ngay
        </Button>
      </div>
    </div>
  );
}

export function AIEvaluationLoader() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-20 bg-slate-100 rounded-[24px] w-full" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="h-64 bg-slate-900 rounded-[32px] md:col-span-1" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:col-span-3">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[24px]" />)}
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-[28px]" />)}
      </div>
    </div>
  );
}
