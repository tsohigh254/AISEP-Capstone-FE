"use client";

import { ArrowRight, Brain, CheckCircle2, LayoutDashboard, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Step3Props {
  completeness: number;
}

const ACTIONS = [
  {
    label: "Vào Workspace",
    desc: "Quản lý hồ sơ và tiến trình",
    icon: LayoutDashboard,
    href: "/startup",
    primary: true,
  },
  {
    label: "Tìm Cố vấn",
    desc: "Kết nối với chuyên gia phù hợp",
    icon: Search,
    href: "/startup/experts",
  },
  {
    label: "Đánh giá bằng AI",
    desc: "Nhận phân tích tiềm năng Startup ngay",
    icon: Brain,
    href: "/startup/ai-evaluation/request",
  },
];

export function Step3({ completeness }: Step3Props) {
  return (
    <div className="space-y-8 text-center animate-in zoom-in-95 fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="size-20 rounded-[28px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-100">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-1">
          <h2 className="text-[26px] font-black text-slate-900 tracking-tight">
            Hồ sơ đã được tạo!
          </h2>
          <p className="text-[13px] text-slate-500 max-w-xs mx-auto leading-relaxed">
            Chào mừng bạn đến với hệ sinh thái AISEP. Hành trình của bạn bắt đầu từ đây.
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="relative size-10">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" className="stroke-slate-200" strokeWidth="3" fill="none" />
            <circle
              cx="18"
              cy="18"
              r="14"
              className="stroke-[#eec54e] transition-all duration-1000 ease-out"
              strokeWidth="3"
              strokeDasharray={`${completeness * 0.88}, 100`}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-900">
            {completeness}%
          </span>
        </div>
        <div className="text-left">
          <p className="text-[13px] font-bold text-slate-900">Độ hoàn thiện hồ sơ</p>
          <p className="text-[11px] text-slate-500">
            {completeness < 100
              ? "Vào Startup Profile để bổ sung thêm"
              : "Hồ sơ đầy đủ, sẵn sàng kết nối!"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 text-left">
        {ACTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200",
                item.primary
                  ? "bg-[#0f172a] border-[#0f172a] text-white hover:scale-[1.01] shadow-lg shadow-slate-200"
                  : "bg-white border-slate-200 hover:border-[#eec54e] hover:shadow-md hover:scale-[1.01]"
              )}
            >
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                  item.primary ? "bg-white/10" : "bg-slate-50 group-hover:bg-[#eec54e]/10"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    item.primary ? "text-[#eec54e]" : "text-slate-400 group-hover:text-[#eec54e]"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-[13px] font-bold",
                    item.primary ? "text-white" : "text-slate-900"
                  )}
                >
                  {item.label}
                </p>
                <p
                  className={cn(
                    "text-[11px]",
                    item.primary ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  {item.desc}
                </p>
              </div>
              <div
                className={cn(
                  "size-7 rounded-full border flex items-center justify-center shrink-0 transition-all",
                  item.primary
                    ? "border-white/20 group-hover:bg-[#eec54e] group-hover:border-[#eec54e] group-hover:text-[#0f172a]"
                    : "border-slate-200 group-hover:bg-[#eec54e] group-hover:border-[#eec54e] group-hover:text-white"
                )}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
