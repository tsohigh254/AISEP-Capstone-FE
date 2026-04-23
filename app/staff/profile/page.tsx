"use client";

import { useState } from "react";
import { useAuth } from "@/context/context";
import { cn } from "@/lib/utils";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Settings, 
  Lock,
  Camera,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileText,
  Brain,
  Activity,
  History,
  ShieldAlert,
  Edit2
} from "lucide-react";
import Link from "next/link";

const TABS = ["Tổng quan", "Bảo mật", "Hoạt động"] as const;
type Tab = typeof TABS[number];

function Tag({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "violet" | "amber" | "blue" | "dark" }) {
    const cls = {
        default: "bg-slate-50 text-slate-600 border-slate-100",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100/60",
        violet: "bg-violet-50 text-violet-600 border-violet-100/60",
        amber: "bg-amber-50 text-amber-700 border-amber-100/60",
        blue: "bg-sky-50 text-sky-600 border-sky-100/60",
        dark: "bg-slate-900 text-white border-slate-800",
    }[variant];
    return <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border", cls)}>{children}</span>;
}

function InfoPair({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="space-y-0.5">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-[13px] font-medium text-slate-700">{value}</p>
        </div>
    );
}

export default function StaffProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("Tổng quan");
    
    const displayName = (user as any)?.fullName || user?.email?.split("@")[0] || "Nhân viên";
    const userEmail = user?.email || "admin@aisep.com";
    const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    // Mock activities
    const recentActivities = [
        { title: "Đã duyệt hồ sơ KYC", target: "Start-up Alpha", time: "2 giờ trước", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
        { title: "Mở khiếu nại mới", target: "Tranh chấp #129", time: "5 giờ trước", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
        { title: "Cập nhật hệ thống", target: "Phân quyền AI", time: "Hôm qua", icon: Settings, color: "text-blue-500", bg: "bg-blue-50" },
    ];

    return (
        <div className="max-w-6xl mx-auto w-full space-y-5 animate-in fade-in duration-500 pb-12">

            {/* ── Hero Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Cover */}
                <div className="h-40 bg-gradient-to-br from-[#171611] via-slate-900 to-slate-800 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="absolute top-4 right-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Đang trực tuyến
                        </div>
                    </div>
                </div>

                <div className="px-7 pb-7 relative">
                    {/* Avatar row */}
                    <div className="-mt-12 mb-4">
                        <div className="relative inline-block group">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#eec54e] to-[#F0A500] border-[4px] border-white shadow-xl overflow-hidden flex items-center justify-center text-white font-black text-3xl uppercase tracking-tighter">
                                {initials || "S"}
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white text-slate-600 rounded-lg flex items-center justify-center shadow-lg border border-slate-100 hover:text-[#eec54e] transition-all cursor-pointer">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Name + Status */}
                    <div className="mb-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-[24px] font-bold text-[#171611] tracking-tight">{displayName}</h1>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md border border-emerald-100 uppercase tracking-widest">Đã xác minh</span>
                        </div>
                        <p className="text-[13px] text-slate-500 mt-1 font-medium">Nhân Viên Vận Hành · Quản trị viên hệ thống (STAFF_ADMIN)</p>
                    </div>

                    {/* Quick Info Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <Tag variant="violet"><ShieldCheck className="w-3 h-3" />ID: #ST-2026-001</Tag>
                        <Tag variant="blue"><Mail className="w-3 h-3" />{userEmail}</Tag>
                        <Tag variant="amber"><Clock className="w-3 h-3" />Gia nhập: 22/03/2026</Tag>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md text-[11px] text-slate-400 border border-slate-100 font-medium">
                            <MapPin className="w-3 h-3" />
                            Hà Nội, Việt Nam
                        </div>
                    </div>

                    {/* Stats Summary row */}
                    <div className="pt-5 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                        <div>
                            <p className="text-[20px] font-black text-[#171611]">248</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hồ sơ đã duyệt</p>
                        </div>
                        <div>
                            <p className="text-[20px] font-black text-[#171611]">45</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Issues xử lý</p>
                        </div>
                        <div>
                            <p className="text-[20px] font-black text-[#171611]">12</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Giải quyết tranh chấp</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-x-auto max-w-full">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
                            activeTab === tab
                                ? "bg-[#171611] text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        )}
                    >
                        {tab === "Tổng quan" && <User className="w-3.5 h-3.5" />}
                        {tab === "Bảo mật" && <ShieldCheck className="w-3.5 h-3.5" />}
                        {tab === "Hoạt động" && <Activity className="w-3.5 h-3.5" />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            {activeTab === "Tổng quan" && (
                <div className="grid grid-cols-12 gap-5">
                    {/* Left side */}
                    <div className="col-span-12 lg:col-span-8 space-y-5">
                        {/* Info Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[14px] font-bold text-[#171611] flex items-center gap-2 uppercase tracking-wider">
                                    <User className="w-4 h-4 text-[#eec54e]" />
                                    Thông tin chi tiết
                                </h3>
                                <button className="text-[12px] font-bold text-[#eec54e] hover:underline flex items-center gap-1 cursor-pointer">
                                    <Edit2 className="w-3 h-3" /> Chỉnh sửa
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                <InfoPair label="Họ và tên" value={displayName} />
                                <InfoPair label="Email công việc" value={userEmail} />
                                <InfoPair label="Số điện thoại" value="+84 987 654 321" />
                                <InfoPair label="Vai trò hệ thống" value="Quản trị viên (Staff Admin)" />
                                <InfoPair label="Phòng ban" value="Vận hành & Giám sát" />
                                <InfoPair label="Khu vực quản lý" value="Toàn quốc" />
                            </div>
                        </div>

                        {/* Description/Bio */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                            <h3 className="text-[14px] font-bold text-[#171611] flex items-center gap-2 uppercase tracking-wider">
                                <FileText className="w-4 h-4 text-[#eec54e]" />
                                Ghi chú công việc
                            </h3>
                            <p className="text-[13px] text-slate-500 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                Chuyên trách quản lý quy trình KYC cho Investor và giải quyết các khiếu nại liên quan đến đầu tư. Đảm bảo tính minh bạch và an toàn cho cộng đồng AISEP.
                            </p>
                        </div>
                    </div>

                    {/* Right side/Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-5">
                        {/* Highlights */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Chứng chỉ & Quyền hạn</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: ShieldCheck, label: "KYC Checker", date: "Cấp ngày 01/01/2026" },
                                    { icon: Briefcase, label: "Platform Auditor", date: "Cấp ngày 15/02/2026" },
                                ].map((badge, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100/50">
                                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                            <badge.icon className="w-4 h-4 text-[#eec54e]" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#171611]">{badge.label}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{badge.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Log brief */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Hệ thống</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[12px]">
                                    <span className="text-slate-500 font-medium">Lần đăng nhập cuối</span>
                                    <span className="text-slate-800 font-bold">10:45 AM, Hôm nay</span>
                                </div>
                                <div className="flex items-center justify-between text-[12px]">
                                    <span className="text-slate-500 font-medium">IP hiện tại</span>
                                    <span className="text-slate-800 font-bold">192.168.1.1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Bảo mật" && (
                <div className="max-w-2xl mx-auto w-full space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#eec54e]/10 text-[#eec54e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h2 className="text-[20px] font-bold text-[#171611]">Bảo mật tài khoản</h2>
                            <p className="text-[13px] text-slate-500 mt-1">Cập nhật mật khẩu và quản lý quyền truy cập</p>
                        </div>

                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#eec54e]/30 hover:bg-slate-50 transition-all group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#eec54e]/10 group-hover:text-[#eec54e] transition-all">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[14px] font-bold text-[#171611]">Thay đổi mật khẩu</p>
                                        <p className="text-[12px] text-slate-400 mt-0.5">Yêu cầu xác thực OTP qua email</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#eec54e]/30 hover:bg-slate-50 transition-all group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#eec54e]/10 group-hover:text-[#eec54e] transition-all">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[14px] font-bold text-[#171611]">Xác thực 2 yếu tố (2FA)</p>
                                        <p className="text-[12px] text-emerald-500 font-bold mt-0.5">Đã kích hoạt</p>
                                    </div>
                                </div>
                                <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Hoạt động" && (
                <div className="max-w-3xl mx-auto w-full space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                        <div className="flex items-center gap-2 mb-8">
                            <History className="w-5 h-5 text-slate-400" />
                            <h3 className="text-[15px] font-bold text-[#171611]">Lịch sử hoạt động gần đây</h3>
                        </div>
                        <div className="space-y-6">
                            {recentActivities.map((act, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    {i < recentActivities.length - 1 && (
                                        <div className="absolute left-[17px] top-10 bottom-[-24px] w-px bg-slate-100" />
                                    )}
                                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 border border-white shadow-sm", act.bg)}>
                                        <act.icon className={cn("w-4 h-4", act.color)} />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <p className="text-[14px] font-bold text-[#171611]">{act.title}</p>
                                        <p className="text-[12px] font-medium text-slate-500 mt-0.5">Đối tượng: {act.target}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{act.time}</p>
                                    </div>
                                    <button className="h-fit text-[11px] font-bold text-slate-400 hover:text-[#eec54e] cursor-pointer">Chi tiết</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
