"use client";

import { use } from "react";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Brain, 
  Bookmark, 
  Handshake, 
  Sparkles, 
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Building2,
  MapPin,
  FolderOpen
} from "lucide-react";

// Mock Data (Shared with Discovery page)
const STARTUPS = [
    {
        id: "SU-1001",
        name: "TechAlpha Co.",
        industry: "SaaS & AI",
        stage: "Seed",
        location: "Hồ Chí Minh, VN",
        target: "$500K",
        score: 84,
        desc: "AISEP là nền tảng vận hành hệ sinh thái khởi nghiệp toàn diện, giúp kết nối Startup với Nhà đầu tư thông qua công nghệ Blockchain và AI.",
        activeDays: 12,
        logo: "TA",
        isHot: true,
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPGo-MuNE1TA-f-CzA3CrxNhiTpXx6O33MdUq3W-IaDVQ7ym67WVsYzj_6y6DQg7FbffRXZWJQ18VrNJYBVodrdwsmss985qeqimmBjPdnV8vkYvC_Q0fjlVaghZCf_kvrqxGxP3dHivWdkDz8TKh0loaFMvqcs5oad2AIl1Y8j3vh7qi0ytZkwm8RLLxKFAiP7YQiEOYFqcO6_VLODJkRpYPEu1mAFYT3uLh98c8wUw33fLRLbsIZOwPUkI4ofRFvsVh95t_5Ghc",
        tags: ["Blockchain", "SaaS", "B2B", "Startup Ecosystem", "AI"],
        team: [
            { name: "Nguyễn Minh Tuấn", role: "CEO & Co-Founder" },
            { name: "Trần Thị Hồng", role: "CTO" },
            { name: "Lê Văn Khoa", role: "COO" },
        ]
    },
    {
        id: "SU-1002",
        name: "MediChain AI",
        industry: "HealthTech",
        stage: "Pre-Seed",
        location: "Hà Nội, VN",
        target: "$200K",
        score: 88,
        desc: "Giải pháp lưu trữ và theo dõi hồ sơ y tế bệnh nhân thông qua hệ thống phi tập trung, giúp giảm rủi ro bảo mật dữ liệu.",
        activeDays: 3,
        logo: "MC",
        isHot: true,
        img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2670&auto=format&fit=crop",
        tags: ["Health", "AI", "Medical", "Security"],
        team: [
            { name: "Phạm Minh Đức", role: "CEO" },
            { name: "Lê Thu Hà", role: "CTO" }
        ]
    },
    {
        id: "SU-1003",
        name: "GreenEats",
        industry: "FoodTech",
        stage: "Series A",
        location: "Đà Nẵng, VN",
        target: "$1.5M",
        score: 76,
        desc: "Nền tảng giao đồ ăn xanh và thuần chay đầu tiên tại Việt Nam, tối ưu chuỗi cung ứng bằng thuật toán học máy dự đoán nhu cầu.",
        activeDays: 45,
        logo: "GE",
        isHot: false,
        img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2671&auto=format&fit=crop",
        tags: ["Vegan", "Logistics", "Sustainability"],
        team: [
            { name: "Võ Hoàng Yến", role: "CEO" },
            { name: "Đặng Nam", role: "CMO" }
        ]
    },
    {
        id: "SU-1004",
        name: "EduNova",
        industry: "EdTech",
        stage: "Seed",
        location: "Hồ Chí Minh, VN",
        target: "$300K",
        score: 81,
        desc: "Nền tảng học tập cá nhân hóa sử dụng AI để tạo ra lộ trình học tập tối ưu cho từng học sinh dựa trên điểm mạnh yếu.",
        activeDays: 8,
        logo: "EN",
        isHot: false,
        img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2832&auto=format&fit=crop",
        tags: ["Education", "AI", "Personalization"],
        team: [
            { name: "Lý Gia Thành", role: "Founder" }
        ]
    },
];

const AVATAR_COLORS = [
    "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarColor(id: string): string {
    const idx = parseInt(id.split("-")[1] || "0") % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

export default function StartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    
    // Find the startup by ID
    const startup = STARTUPS.find(s => s.id === id) || STARTUPS[0];
    const avatarGradient = getAvatarColor(startup.id);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
            {/* Breadcrumb replacement or top nav */}
            <div className="flex items-center gap-2 text-[13px] text-slate-400 mb-2">
                <Link href="/investor/startups" className="hover:text-slate-600 transition-colors">Khám phá Startup</Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">{startup.name}</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-slate-900 to-slate-800" />
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-12 mb-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
                            <div className={cn("w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white text-[32px] md:text-[40px] font-black shrink-0 bg-gradient-to-br transition-transform hover:scale-105 duration-300", avatarGradient)}>
                                {startup.logo}
                            </div>
                            <div className="md:pb-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl md:text-3xl font-black text-[#171611] leading-tight">{startup.name}</h1>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-[0.1em]">Đã Verify</span>
                                </div>
                                <p className="text-sm md:text-base text-slate-500 font-bold mt-1.5 uppercase tracking-wide opacity-80">{startup.industry} • {startup.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none justify-center bg-[#f8f8f6] text-[#171611] border border-slate-200 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2">
                                <Bookmark className="w-5 h-5" />
                                Theo dõi
                            </button>
                            <button className="flex-1 md:flex-none justify-center bg-[#e6cc4c] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                                <Handshake className="w-5 h-5" />
                                Đề nghị kết nối
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="col-span-1 md:col-span-3 space-y-8">
                            <div>
                                <h4 className="text-[13px] font-bold text-slate-800 mb-3">Về Startup</h4>
                                <p className="text-[14px] text-slate-600 leading-relaxed max-w-3xl">{startup.desc}</p>
                                <div className="flex flex-wrap gap-2 mt-5">
                                    {startup.tags.map((tag) => (
                                        <span key={tag} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[13px] font-bold text-slate-800 mb-4">Đội ngũ sáng lập</h4>
                                <div className="flex flex-wrap gap-4">
                                    {startup.team.map((member, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100 min-w-[240px] hover:border-slate-300 transition-all group">
                                            <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center text-sm font-black text-slate-500 group-hover:bg-[#e6cc4c] group-hover:text-white transition-all">
                                                {member.name.split(" ").pop()?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-[#171611]">{member.name}</p>
                                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mục tiêu gọi vốn</p>
                                <p className="text-[28px] font-black text-[#171611] leading-none mb-1">{startup.target}</p>
                                <p className="text-[13px] font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-md mt-2">{startup.stage}</p>
                            </div>
                            <div className="bg-[#e6cc4c]/5 rounded-2xl p-5 border border-[#e6cc4c]/20 flex items-start gap-4 shadow-sm group hover:bg-[#e6cc4c]/10 transition-colors">
                                <Sparkles className="w-7 h-7 text-[#e6cc4c] shrink-0" />
                                <div>
                                    <p className="text-[11px] font-bold text-[#C8A000] uppercase tracking-widest mb-1.5">Điểm đánh giá AI</p>
                                    <p className="text-[28px] font-black text-[#171611] leading-none">{startup.score} <span className="text-[14px] font-bold text-slate-400">/100</span></p>
                                    <p className="text-[11px] text-[#C8A000] font-bold mt-2 bg-white/60 px-2 py-0.5 rounded-md inline-block">Độ phù hợp Rất cao</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="col-span-1 lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-[16px] text-[#171611]">Tài liệu Data Room</h3>
                            <span className="text-[12px] text-slate-400 font-medium">3 tài liệu tải lên</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: "Pitch_Deck_" + startup.name.replace(" ", "_") + ".pdf", type: "Pitch Deck", date: "12/05/2024", icon: FileText, color: "text-red-500" },
                                { name: "Financial_Projections_2024.xlsx", type: "Tài chính", date: "10/05/2024", icon: FileText, color: "text-green-500" },
                                { name: "Legal_Documents.pdf", type: "Pháp lý", date: "05/05/2024", icon: FileText, color: "text-blue-500" },
                            ].map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-[#e6cc4c]/40 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:bg-[#e6cc4c]/10 transition-colors">
                                            <doc.icon className={cn("w-5 h-5", doc.color)} />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-slate-700 group-hover:text-[#171611] transition-colors">{doc.name}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{doc.type} • Tải lên: {doc.date}</p>
                                        </div>
                                    </div>
                                    <FolderOpen className="w-5 h-5 text-slate-300 group-hover:text-[#e6cc4c] transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Brain className="w-5 h-5 text-[#e6cc4c]" />
                            <h3 className="font-bold text-[16px] text-[#171611]">Đánh giá AI tự động</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50">
                                <p className="text-[12px] font-bold text-emerald-800 mb-3 flex items-center gap-2 uppercase tracking-tight">
                                    <TrendingUp className="w-4 h-4" /> Điểm mạnh nổi bật
                                </p>
                                <ul className="text-[13px] text-emerald-700 space-y-2 list-disc ml-4 font-medium leading-relaxed">
                                    <li>Xác minh Blockchain đem lại niềm tin lớn cho dòng vốn FDI.</li>
                                    <li>Doanh thu định kỳ (MRR) tăng trưởng 20% m/m ổn định.</li>
                                </ul>
                            </div>
                            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
                                <p className="text-[12px] font-bold text-amber-800 mb-3 flex items-center gap-2 uppercase tracking-tight">
                                    <AlertTriangle className="w-4 h-4" /> Rủi ro cần thị sát
                                </p>
                                <ul className="text-[13px] text-amber-700 space-y-2 list-disc ml-4 font-medium leading-relaxed">
                                    <li>Tỷ lệ Burn rate hiện tại cần gọi vòng sau trong 9 tháng.</li>
                                    <li>Chưa có bằng sáng chế rõ ràng về công nghệ lõi.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
