"use client";

import React, { useState } from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import {
    ChevronRight,
    Share2,
    Globe,
    Linkedin,
    MapPin,
    CheckCircle2,
    Info,
    TrendingUp,
    History,
    Flag,
    Zap,
    Users,
    DollarSign,
    Target,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { InvestorConnectionModal } from "@/components/startup/investor-connection-modal";

export default function InvestorDetailsPage() {
    const [activeTab, setActiveTab] = useState("Tổng quan");
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // Mock data for VinaCapital Ventures
    const investor = {
        name: "VinaCapital Ventures",
        logo: "https://lh3.googleusercontent.com/pw/AP1GczPl_9q8g_o1u6vI6z9X8uC7eY-F6r7k2D9f9S0m4b3q5p7_=s200-c",
        type: "Venture Capital",
        tagline: "Thúc đẩy tương lai công nghệ tại Việt Nam",
        badges: ["QUỸ CHÍNH QUY", "PHẢN HỒI NHANH", "ĐÔNG NAM Á"],
        description: "VinaCapital Ventures là một nền tảng đầu tư công nghệ với quy mô 100 triệu USD, thuộc tập đoàn quản lý tài sản hàng đầu VinaCapital. Chúng tôi tập trung vào việc tìm kiếm và hỗ trợ các công nghệ thế hệ mới tại Việt Nam và khu vực Đông Nam Á, những đơn vị có tiềm năng thay đổi cục diện ngành bằng các giải pháp đột phá.",
        achievements: [
            "Hỗ trợ hơn 45 doanh nghiệp công nghệ từ năm 2018.",
            "Dẫn dắt các vòng gọi vốn lớn trong lĩnh vực Fintech và Logistics.",
            "Xây dựng hệ sinh thái kết nối chặt chẽ giữa startup và tập đoàn."
        ],
        history: "Được thành lập vào năm 2018 như một phân trọng chiến lược mới của VinaCapital, quỹ ra đời với sứ mệnh thu hẹp khoảng cách vốn cho các startup công nghệ giai đoạn tăng trưởng tại Việt Nam, mang đến tiêu chuẩn quản trị quốc tế.",
        mission: "Chúng tôi không chỉ cung cấp vốn. VinaCapital Ventures cam kết đồng hành cùng các nhà sáng lập bằng cách cung cấp quyền truy cập vào mạng lưới kinh doanh rộng lớn, hỗ trợ vận hành và tư vấn chiến lược để giúp các startup đạt được quy mô mong muốn và thành công bền vững trên bản đồ khu vực.",
        criteria: {
            ticketSize: "$500,000 - $2,000,000",
            stages: ["Seed", "Series A", "Series B"],
            sectors: ["Fintech", "B2B SaaS", "Logistics", "AI/ML", "PropTech"]
        },
        contact: {
            website: "vinacapital.com",
            linkedin: "vinacapital-ventures",
            address: "Tầng 17, Sun Wah Tower, 115 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
        }
    };

    return (
        <StartupShell>
            <div className="max-w-[1440px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400">
                    <Link href="/startup" className="hover:text-slate-600 transition-colors">Workspace</Link>
                    <ChevronRight className="size-4 text-slate-300" />
                    <Link href="/startup/investors" className="hover:text-slate-600 transition-colors">Kết nối nhà đầu tư</Link>
                    <ChevronRight className="size-4 text-slate-300" />
                    <span className="text-slate-600 font-semibold">{investor.name}</span>
                </nav>

                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="size-32 rounded-[32px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20">
                                <img src={investor.logo} alt="" className="size-full rounded-[24px] object-cover" />
                            </div>
                            <div className="text-center lg:text-left space-y-4">
                                <h1 className="text-[32px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">{investor.name}</h1>
                                <p className="text-[17px] text-slate-500 font-medium">{investor.tagline}</p>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                                    {investor.badges.map((badge, i) => (
                                        <div key={badge} className={cn(
                                            "px-4 py-2 rounded-xl flex items-center gap-2 border transition-all",
                                            i === 0 ? "bg-yellow-50/50 border-yellow-200/50 text-yellow-600" :
                                                i === 1 ? "bg-green-50/50 border-green-200/50 text-green-600" :
                                                    "bg-blue-50/50 border-blue-200/50 text-blue-600"
                                        )}>
                                            <div className={cn(
                                                "size-2.5 rounded-full shadow-[0_0_8px_currentColor]",
                                                i === 0 ? "bg-yellow-400" : i === 1 ? "bg-green-400" : "bg-blue-400"
                                            )} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">{badge}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="h-16 px-10 rounded-[20px] bg-[#eec54e] hover:bg-[#d4ae3d] text-white font-black text-[15px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all gap-4 shrink-0 group"
                        >
                            <span className="material-symbols-outlined text-[24px] transition-transform group-hover:scale-110">person_add</span>
                            <span>Gửi lời mời kết nối</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Tab Navigation */}
                        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm px-8 overflow-x-auto">
                            <div className="flex gap-10 whitespace-nowrap">
                                {["Tổng quan", "Triết lý đầu tư", "Danh mục (Portfolio)", "Đội ngũ"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "relative py-6 text-[15px] font-bold tracking-tight transition-all",
                                            activeTab === tab
                                                ? "text-slate-900 dark:text-white"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#eec54e] rounded-full animate-in slide-in-from-left-2 duration-300" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Overview Content */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10 space-y-12">
                            {/* About Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                                        <Info className="size-5 text-[#eec54e]" />
                                    </div>
                                    <h2 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">Về {investor.name}</h2>
                                </div>
                                <p className="text-[16px] text-slate-600 dark:text-slate-300 font-medium leading-[1.8]">
                                    {investor.description}
                                </p>
                            </section>

                            {/* Achievements & History Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-[#f8fafc] dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-50 dark:border-slate-800 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="size-5 text-yellow-500" />
                                        <h3 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">Thành tựu nổi bật</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {investor.achievements.map((item, i) => (
                                            <li key={i} className="flex gap-3">
                                                <div className="size-1.5 rounded-full bg-yellow-400 shrink-0 mt-2" />
                                                <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-[#f8fafc] dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-50 dark:border-slate-800 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <History className="size-5 text-yellow-500" />
                                        <h3 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">Lịch sử hình thành</h3>
                                    </div>
                                    <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-400 leading-[1.7]">
                                        {investor.history}
                                    </p>
                                </div>
                            </div>

                            {/* Mission Section */}
                            <section className="space-y-6 pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                                        <Flag className="size-5 text-[#eec54e]" />
                                    </div>
                                    <h2 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">Sứ mệnh của chúng tôi</h2>
                                </div>
                                <p className="text-[16px] text-slate-600 dark:text-slate-300 font-medium leading-[1.8]">
                                    {investor.mission}
                                </p>
                            </section>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Investment Criteria Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <Target className="size-5 text-yellow-500" />
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiêu chí đầu tư</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Quy mô vốn (Ticket size)</p>
                                    <p className="text-[20px] font-black text-slate-900 dark:text-white">{investor.criteria.ticketSize}</p>
                                    <p className="text-[12px] text-yellow-600 font-bold mt-2 italic">Tùy thuộc vào tiềm năng dự án</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Giai đoạn ưu tiên</p>
                                    <div className="flex flex-wrap gap-2">
                                        {investor.criteria.stages.map(stage => (
                                            <span key={stage} className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-xl text-[12px] font-black text-slate-600 dark:text-slate-300 tracking-tight">
                                                {stage}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lĩnh vực quan tâm</p>
                                    <div className="flex flex-wrap gap-2">
                                        {investor.criteria.sectors.map(sector => (
                                            <span key={sector} className="px-4 py-2 bg-[#f8fafc] dark:bg-slate-800 text-[11px] font-black text-slate-400 dark:text-slate-500 rounded-xl border border-slate-50 dark:border-slate-700">
                                                {sector}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="size-5 text-yellow-500" />
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin liên hệ</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="size-11 rounded-1.5xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Globe className="size-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website chính thức</p>
                                        <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{investor.contact.website}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="size-11 rounded-1.5xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Linkedin className="size-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LinkedIn Profile</p>
                                        <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{investor.contact.linkedin}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="size-11 rounded-1.5xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <MapPin className="size-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ văn phòng</p>
                                        <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{investor.contact.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Note Box */}
                        <div className="p-8 bg-yellow-50/50 dark:bg-yellow-500/5 rounded-[32px] border border-yellow-100/50 dark:border-yellow-500/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap className="size-5 text-yellow-500" />
                                <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Ghi chú quan trọng</h3>
                            </div>
                            <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-[1.6]">
                                Nhà đầu tư này thường phản hồi các lời mời kết nối trong vòng 3-5 ngày làm việc. Hãy đảm bảo hồ sơ dự án của bạn đã đầy đủ thông tin trước khi gửi lời mời.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="text-center pt-20">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <img src="/logo-aisep.png" alt="" className="size-8 grayscale opacity-50" />
                        <span className="text-[18px] font-black text-slate-300 uppercase tracking-widest">AISEP</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">© 2026 AISEP STARTUP WORKSPACE • HỆ THỐNG KẾT NỐI NHÀ ĐẦU TƯ & QUỸ ĐẦU TƯ</p>
                    <div className="flex justify-center gap-8 mt-6">
                        <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Điều khoản</Link>
                        <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Bảo mật</Link>
                        <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Liên hệ</Link>
                    </div>
                </div>

                {/* Modal */}
                <InvestorConnectionModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    investor={{
                        name: investor.name,
                        logo: investor.logo,
                        type: investor.type
                    }}
                />
            </div>
        </StartupShell>
    );
}
