"use client";

import {
  ShieldCheck,
  Activity,
  MessageSquareWarning,
  Users,
  CreditCard,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/context";

const QUICK_LINKS = [
  {
    icon: Activity,
    label: "Giám sát nền tảng",
    desc: "Theo dõi hoạt động và sức khỏe hệ thống theo thời gian thực",
    href: "/staff/activity",
    accent: "#3b82f6",
    gradient: "from-blue-500/10 via-blue-400/5 to-transparent",
    border: "hover:border-blue-200",
    iconBg: "bg-blue-500",
    badge: "Live",
    badgeColor: "bg-blue-100 text-blue-600",
  },
  {
    icon: ShieldCheck,
    label: "Xét duyệt KYC",
    desc: "Duyệt và xác minh hồ sơ định danh người dùng đang chờ",
    href: "/staff/kyc",
    accent: "#f59e0b",
    gradient: "from-amber-500/10 via-amber-400/5 to-transparent",
    border: "hover:border-amber-200",
    iconBg: "bg-amber-500",
    badge: "Ưu tiên",
    badgeColor: "bg-amber-100 text-amber-600",
  },
  {
    icon: MessageSquareWarning,
    label: "Khiếu nại & Tranh chấp",
    desc: "Tiếp nhận và xử lý khiếu nại phát sinh giữa các bên",
    href: "/staff/complaints",
    accent: "#f43f5e",
    gradient: "from-rose-500/10 via-rose-400/5 to-transparent",
    border: "hover:border-rose-200",
    iconBg: "bg-rose-500",
    badge: null,
    badgeColor: "",
  },
  {
    icon: AlertCircle,
    label: "Báo cáo sự cố",
    desc: "Ghi nhận, theo dõi và phối hợp giải quyết sự cố hệ thống",
    href: "/staff/issue-reports",
    accent: "#f97316",
    gradient: "from-orange-500/10 via-orange-400/5 to-transparent",
    border: "hover:border-orange-200",
    iconBg: "bg-orange-500",
    badge: null,
    badgeColor: "",
  },
  {
    icon: Users,
    label: "Vận hành tư vấn",
    desc: "Giám sát và quản lý các phiên tư vấn, mentor đang hoạt động",
    href: "/staff/consulting-ops",
    accent: "#10b981",
    gradient: "from-emerald-500/10 via-emerald-400/5 to-transparent",
    border: "hover:border-emerald-200",
    iconBg: "bg-emerald-500",
    badge: null,
    badgeColor: "",
  },
  {
    icon: CreditCard,
    label: "Vận hành thanh toán",
    desc: "Giám sát giao dịch, phê duyệt và xử lý yêu cầu giải ngân",
    href: "/staff/payment-ops",
    accent: "#6366f1",
    gradient: "from-indigo-500/10 via-indigo-400/5 to-transparent",
    border: "hover:border-indigo-200",
    iconBg: "bg-indigo-500",
    badge: null,
    badgeColor: "",
  },
];

export default function StaffWelcomePage() {
  const { user } = useAuth();
  const displayName = (user as any)?.fullName || user?.email?.split("@")[0] || "Nhân viên";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-full">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[420px] h-[220px] bg-[#eec54e]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-24 w-[300px] h-[180px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="max-w-[860px]">
            <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest mb-3">{today}</p>
            <h1 className="text-[32px] font-black text-white tracking-tight leading-tight mb-2">
              {greeting}, <span className="text-[#eec54e]">{displayName}</span> 👋
            </h1>
            <p className="text-[14px] text-slate-400 leading-relaxed max-w-[560px]">
              Chào mừng trở lại. Chọn một chức năng bên dưới để bắt đầu làm việc hôm nay.
            </p>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="mx-auto w-full max-w-[1280px] px-5 py-8 pb-16 sm:px-6 lg:px-8">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Chức năng chính</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${item.border}`}
              >
                {/* Gradient wash on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative p-5">
                  {/* Top row: icon + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`size-11 rounded-xl ${item.iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Label + desc */}
                  <p className="text-[14px] font-bold text-slate-800 mb-1 group-hover:text-slate-900">{item.label}</p>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{item.desc}</p>

                  {/* CTA arrow */}
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                    Mở chức năng
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
