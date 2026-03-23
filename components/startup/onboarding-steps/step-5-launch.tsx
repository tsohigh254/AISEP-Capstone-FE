"use client";

import { Rocket, Brain, Search, LayoutDashboard, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Step5() {
  return (
    <div className="space-y-10 text-center animate-in zoom-in-95 fade-in duration-700">
      <div className="flex justify-center">
         <div className="size-20 rounded-[32px] bg-emerald-500 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-100 relative">
            <CheckCircle2 className="w-10 h-10 text-white" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
         </div>
      </div>
      
      <div className="space-y-2">
         <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Sẵn sàng cất cánh!</h2>
         <p className="text-[14px] text-slate-500 max-w-sm mx-auto leading-relaxed">
            Chúc mừng bạn đã hoàn tất thiết lập hồ sơ. Hãy bắt đầu hành trình khai phá tiềm năng cùng AISEP.
         </p>
      </div>

      <div className="grid grid-cols-1 gap-3 text-left">
         {[
           { 
             label: "Đánh giá Startup bằng AI", 
             desc: "Phân tích và cho điểm tiềm năng dự án ngay", 
             icon: Brain, 
             href: "/startup/ai-evaluation/request",
             primary: true 
           },
           { 
             label: "Tìm kiếm Cố vấn", 
             desc: "Kết nối với mạng lưới chuyên gia cố vấn", 
             icon: Search, 
             href: "/startup/experts" 
           },
           { 
             label: "Truy cập Workspace", 
             desc: "Quản lý công việc và báo cáo tiến trình", 
             icon: LayoutDashboard, 
             href: "/startup" 
           }
         ].map((item, i) => {
           const Icon = item.icon;
           return (
             <Link 
              key={i} 
              href={item.href}
              className={cn(
                "group flex items-center gap-4 p-5 rounded-2xl border transition-all",
                item.primary 
                  ? "bg-[#0f172a] border-[#0f172a] text-white shadow-lg shadow-slate-200 hover:scale-[1.02]" 
                  : "bg-white border-slate-100 hover:border-[#eec54e]/30 hover:bg-amber-50/5 hover:scale-[1.02]"
              )}
             >
                <div className={cn(
                  "size-12 rounded-xl flex items-center justify-center transition-all",
                  item.primary ? "bg-white/10" : "bg-slate-50 group-hover:bg-[#eec54e]/10"
                )}>
                   <Icon className={cn("w-6 h-6", item.primary ? "text-[#eec54e]" : "text-slate-400 group-hover:text-[#eec54e]")} />
                </div>
                <div className="flex-1">
                   <p className="text-[14px] font-bold">{item.label}</p>
                   <p className={cn("text-[11px]", item.primary ? "text-slate-400" : "text-slate-500")}>{item.desc}</p>
                </div>
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center border transition-all",
                  item.primary ? "border-white/20 group-hover:bg-[#eec54e] group-hover:text-[#0f172a]" : "border-slate-100 group-hover:bg-[#eec54e] group-hover:text-white"
                )}>
                   <ArrowRight className="w-3.5 h-3.5" />
                </div>
             </Link>
           );
         })}
      </div>
    </div>
  );
}
