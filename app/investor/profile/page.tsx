"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Pencil, MapPin, Layers, Target, TrendingUp, CheckCircle2, Clock,
    FileText, Brain, Building2, Globe, ArrowUpRight, Sparkles,
    ChevronRight, Briefcase, Zap, Handshake, Lock, User
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK = {
    // Phần startup thấy được (Public)
    investorName: "VinaCapital Ventures",
    investorType: "Quỹ đầu tư (VC)",
    organization: "Tập đoàn VinaCapital",
    roleTitle: "Investment Director",
    location: "TP. Hồ Chí Minh, Việt Nam",
    website: "https://vinacapital.com",
    verificationLabel: "Đã xác thực",
    logoURL: "",
    shortThesisSummary: "Đầu tư vào các dự án công nghệ mang tính đột phá, mô hình rủi ro thấp và khả năng nhân rộng giải quyết các vấn đề cốt lõi tại khu vực Đông Nam Á.",
    preferredIndustries: ["SaaS", "FinTech", "HealthTech", "AI & ML"],
    preferredStages: ["Pre-Seed", "Seed", "Series A"],
    preferredGeographies: ["Việt Nam", "Đông Nam Á", "Châu Á"],
    preferredMarketScopes: ["B2B", "B2B2C", "B2G"],
    supportOffered: ["Phát triển mạng lưới", "Tư vấn chiến lược", "Tuyển dụng nhân sự cấp cao"],
    acceptingConnectionsStatus: "Đang tìm kiếm dự án",
    recentlyActiveBadge: "Gần đây (Hôm nay)",

    // Phần hệ thống dùng thêm để matching (Private)
    preferredProductMaturity: ["Có MVP", "Đã ra mắt (Launched)"],
    preferredValidationLevel: "Có tập khách hàng trả phí hoặc doanh thu bước đầu",
    preferredAIScoreRange: "Trên 75 điểm",
    aiScoreImportance: "Cực kỳ quan trọng (Khởi điểm để xét duyệt)",
    preferredStrengths: ["Đội ngũ Founder xuất sắc", "Lợi thế dữ liệu (Data Moat)", "Thị trường tăng trưởng nhanh"],

    profileCompleteness: 85,
};

const TABS = ["Tổng quan", "Thông tin Thesis", "Liên hệ"] as const;
type Tab = typeof TABS[number];

function Tag({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "violet" | "amber" | "blue" }) {
    const cls = {
        default: "bg-slate-50 text-slate-600 border-slate-100",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100/60",
        violet: "bg-violet-50 text-violet-600 border-violet-100/60",
        amber: "bg-amber-50 text-amber-700 border-amber-100/60",
        blue: "bg-sky-50 text-sky-600 border-sky-100/60",
    }[variant];
    return <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border", cls)}>{children}</span>;
}

function InfoPair({ label, value, isLink }: { label: string; value?: string | null; isLink?: boolean }) {
    if (!value) return null;
    return (
        <div className="space-y-0.5">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{label}</p>
            {isLink ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-blue-600 hover:underline flex items-center gap-1">
                    {value} <ArrowUpRight className="w-3 h-3" />
                </a>
            ) : (
                <p className="text-[13px] font-medium text-slate-700">{value}</p>
            )}
        </div>
    );
}

export default function InvestorProfileViewPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Tổng quan");
    const p = MOCK;

    const initials = p.investorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const completenessColor = p.profileCompleteness >= 80 ? "bg-[#e6cc4c]" : p.profileCompleteness >= 50 ? "bg-[#e6cc4c]" : "bg-rose-400";

    return (
        <div className="max-w-6xl mx-auto w-full space-y-5">

            {/* ── Hero Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="absolute top-4 right-5">
                        <Link href="#"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white text-[11px] font-medium hover:bg-black/50 transition-colors"
                        >
                            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", p.acceptingConnectionsStatus ? "bg-emerald-400" : "bg-slate-400")} />
                            {p.acceptingConnectionsStatus}
                            <ChevronRight className="w-3 h-3 text-white/50" />
                        </Link>
                    </div>
                </div>

                <div className="px-7 pb-7 relative">
                    {/* Logo row */}
                    <div className="-mt-10 mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-[3px] border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                            {p.logoURL
                                ? <img src={p.logoURL} alt={p.investorName} className="w-full h-full object-cover" />
                                : <span className="text-white font-black text-[32px] tracking-tight">{initials}</span>
                            }
                        </div>
                    </div>

                    {/* Name + description */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">{p.investorName}</h1>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md border border-emerald-100/60 uppercase tracking-[0.1em]">{p.verificationLabel}</span>
                        </div>
                        <p className="text-[13px] text-slate-500 mt-0.5">{p.shortThesisSummary}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-5">
                        <Tag variant="green"><Building2 className="w-3 h-3" />{p.investorType}</Tag>
                        {p.preferredStages[0] && <Tag variant="violet"><TrendingUp className="w-3 h-3" />{p.preferredStages[0]}</Tag>}
                        {p.preferredIndustries[0] && <Tag><FileText className="w-3 h-3 text-slate-400" />{p.preferredIndustries[0]}</Tag>}
                        {p.preferredMarketScopes[0] && <Tag variant="blue">{p.preferredMarketScopes[0]}</Tag>}
                        
                        <span className="text-slate-200 text-[14px] mx-0.5">·</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <MapPin className="w-3 h-3" />{p.location}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 ml-1">
                            <span className="text-slate-200">·</span> <Clock className="w-3 h-3 ml-1" />{p.recentlyActiveBadge}
                        </span>
                    </div>

                    {/* Actionable completion bar */}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium text-slate-500">Độ hoàn thiện hồ sơ</span>
                            <span className="text-[12px] font-semibold text-slate-700">{p.profileCompleteness}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div className={cn("h-full rounded-full transition-all", completenessColor)} style={{ width: `${p.profileCompleteness}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Link href="#"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100/60 hover:bg-amber-100 transition-colors"
                            >
                                + Mở rộng Thesis
                            </Link>
                            <Link href="#"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100/60 hover:bg-amber-100 transition-colors"
                            >
                                + KYC Thành viên
                            </Link>
                            <Link href="#"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 text-[11px] font-medium border border-slate-100 hover:bg-slate-100 transition-colors"
                            >
                                + Chỉnh danh mục
                            </Link>
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
                            "px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap flex items-center gap-2",
                            activeTab === tab
                                ? "bg-[#0f172a] text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            {activeTab === "Tổng quan" && (
                <div className="grid grid-cols-12 gap-5">
                    {/* Left */}
                    <div className="col-span-12 lg:col-span-8 space-y-5">
                        {/* Highlights */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Brain, label: "Tổ chức & Vai trò", text: `${p.roleTitle} tại ${p.organization}`, color: "text-[#C8A000]" },
                                { icon: Handshake, label: "Giá trị gia tăng", text: p.supportOffered.join(" · "), color: "text-emerald-500" },
                            ].map(({ icon: Icon, label, text, color }) => (
                                <div key={label} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className={cn("w-4 h-4", color)} />
                                        <h3 className="text-[13px] font-semibold text-slate-700">{label}</h3>
                                    </div>
                                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[13px] font-semibold text-slate-700">Tóm tắt ngắn gọn (Thesis Summary)</h3>
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed">{p.shortThesisSummary}</p>
                        </div>

                        {/* Industries */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[13px] font-semibold text-slate-700">Industry quan tâm (Preferred Industries)</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {p.preferredIndustries.map(n => (
                                    <span key={n} className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25">{n}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thông tin nhanh</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Briefcase, label: "TÊN TỔ CHỨC", val: p.organization },
                                    { icon: User, label: "CHỨC VỤ", val: p.roleTitle },
                                    { icon: Building2, label: "LOẠI HÌNH ĐẦU TƯ", val: p.investorType },
                                    { icon: Globe, label: "KHU VỰC/VỊ TRÍ", val: p.location },
                                    { icon: CheckCircle2, label: "XÁC THỰC", val: p.verificationLabel },
                                ].map(({ icon: Icon, label, val }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                                            <p className="text-[12px] font-medium text-slate-700 truncate">{val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Link href="/investor/profile/edit/info" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm">
                                <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Thông tin Thesis" && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 space-y-5">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-500" /> Tệp khách hàng mục tiêu</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {p.preferredMarketScopes.map(n => <span key={n} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-medium border border-emerald-100/60">{n}</span>)}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-500" /> Giai đoạn đầu tư ưu tiên (Stages)</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {p.preferredStages.map(n => <span key={n} className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-[12px] font-medium border border-violet-100/60">{n}</span>)}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Phạm vi</h3>
                            <InfoPair label="Vị trí địa lý ưu tiên" value={p.preferredGeographies.join(", ")} />
                        </div>
                    </div>
                </div>
            )}



            {activeTab === "Liên hệ" && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                        <h3 className="text-[13px] font-semibold text-slate-700">Kênh kết nối chính thức</h3>
                        <div className="space-y-3">
                            <InfoPair label="Website / Liên kết" value={p.website} isLink />
                            <InfoPair label="Địa chỉ văn phòng" value={p.location} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
