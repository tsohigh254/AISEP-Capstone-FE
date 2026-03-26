"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Pencil, Eye, EyeOff, MapPin, Calendar, Users, Layers,
    Target, Lightbulb, TrendingUp, CheckCircle2, Clock,
    ExternalLink, Mail, Phone, FileText, Brain, Building2,
    Globe, AlertTriangle, ArrowUpRight, DollarSign, Sparkles,
    ChevronRight, Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetStartupProfile, GetMembers } from "@/services/startup/startup.api";

const MOCK_INDUSTRIES = [
    { id: 1, name: "AI & Technology" },
    { id: 2, name: "Fintech" },
    { id: 3, name: "Healthcare" },
    { id: 4, name: "E-commerce" },
    { id: 5, name: "EdTech" },
    { id: 6, name: "ClimateTech" },
];

const STAGE_LABELS: Record<string, string> = {
    "0": "Hạt giống (Idea)", "1": "Tiền ươm mầm (Pre-Seed)", "2": "Ươm mầm (Seed)", 
    "3": "Series A", "4": "Series B", "5": "Series C+", "6": "Tăng trưởng (Growth)",
    "Idea": "Hạt giống (Idea)", "PreSeed": "Tiền ươm mầm (Pre-Seed)", "Seed": "Ươm mầm (Seed)", 
    "SeriesA": "Series A", "SeriesB": "Series B", "SeriesC": "Series C+", "Growth": "Tăng trưởng (Growth)"
};

const TABS = ["Tổng quan", "Kinh doanh", "Gọi vốn", "Đội ngũ & Xác thực", "Liên hệ"] as const;
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

export default function StartupProfileViewPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Tổng quan");
    const [p, setP] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [resProfile, resMembers] = await Promise.all([
                    GetStartupProfile() as any,
                    GetMembers() as any
                ]);
                
                if ((resProfile.success || resProfile.isSuccess) && resProfile.data) {
                    setP(resProfile.data);
                } else {
                    setP(null);
                }
                
                if ((resMembers.success || resMembers.isSuccess) && Array.isArray(resMembers.data)) {
                    setMembers(resMembers.data);
                }
            } catch {
                setP(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!p) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Chưa có hồ sơ Startup</h2>
                <p className="text-slate-500 mb-5">Bạn chưa tạo hồ sơ. Vui lòng cập nhật thông tin ở màn chỉnh sửa để bắt đầu.</p>
                <Link href="/startup/startup-profile/info" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                    <Pencil className="w-4 h-4" />
                    Tạo hồ sơ ngay
                </Link>
            </div>
        );
    }

    const companyName = p.companyName || "Chưa có tên";
    const initials = companyName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    const completeness = p.profileCompleteness || 0;
    const completenessColor = completeness >= 80 ? "bg-emerald-500" : completeness >= 50 ? "bg-[#e6cc4c]" : "bg-rose-400";
    
    // SafeArea values
    const currentNeeds = Array.isArray(p.currentNeeds) ? p.currentNeeds : [];
    const targetFunding = Number(p.targetFunding) || 0;
    const raisedAmount = Number(p.raisedAmount) || 0;
    const fundingProgress = targetFunding > 0 ? Math.round((raisedAmount / targetFunding) * 100) : 0;
    
    let foundedYear = p.foundedYear;
    if (!foundedYear && p.foundedDate) {
        foundedYear = new Date(p.foundedDate).getFullYear();
    }
    
    const displayIndustry = p.industry || MOCK_INDUSTRIES.find(x => x.id === p.industryID)?.name;
    const displayStage = STAGE_LABELS[p.stage?.toString()] || p.stage;

    return (
        <div className="space-y-5">
            {/* ── Hero Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    {/* Visibility — clear status badge with action */}
                    <div className="absolute top-4 right-5">
                        <Link href="/startup/startup-profile/visibility"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white text-[11px] font-medium hover:bg-black/50 transition-colors"
                        >
                            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", p.visibilityStatus === "Visible" ? "bg-emerald-400" : "bg-slate-400")} />
                            {p.visibilityStatus === "Visible" ? "Đang hiển thị với nhà đầu tư" : "Đang ẩn khỏi nhà đầu tư"}
                            <ChevronRight className="w-3 h-3 text-white/50" />
                        </Link>
                    </div>
                </div>

                <div className="px-7 pb-7 relative">
                    {/* Logo row — overlaps cover, no edit button here */}
                    <div className="-mt-10 mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-[3px] border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                            {p.logoURL
                                ? <img src={p.logoURL} alt={companyName} className="w-full h-full object-cover" />
                                : <span className="text-slate-600 font-bold text-[20px] tracking-tight">{initials}</span>
                            }
                        </div>
                    </div>

                    {/* Name + description */}
                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">{companyName}</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">{p.oneLiner || "Chưa có khẩu hiệu"}</p>
                    </div>

                    {/* Tags — phân cấp: primary (stage/industry/funding) vs secondary (location) */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-5">
                        {/* Primary */}
                        {displayStage && <Tag variant="green"><TrendingUp className="w-3 h-3" />{displayStage}</Tag>}
                        {p.fundingStage && <Tag variant="violet"><DollarSign className="w-3 h-3" />{p.fundingStage}</Tag>}
                        <Tag><Building2 className="w-3 h-3 text-slate-400" />{displayIndustry || "Chưa có ngành"}{p.subIndustry ? ` / ${p.subIndustry}` : ""}</Tag>
                        {p.marketScope && <Tag variant="blue">{p.marketScope}</Tag>}
                        {/* Secondary — divider + lighter style */}
                        <span className="text-slate-200 text-[14px] mx-0.5">·</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <MapPin className="w-3 h-3" />{p.location || "Chưa rõ vị trí"}
                        </span>
                        {p.productStatus && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                <span className="text-slate-200">·</span> {p.productStatus}
                            </span>
                        )}
                    </div>

                    {/* Actionable completion bar */}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium text-slate-500">Độ hoàn thiện hồ sơ</span>
                            <span className="text-[12px] font-semibold text-slate-700">{completeness}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div className={cn("h-full rounded-full transition-all", completenessColor)} style={{ width: `${completeness}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Link href="/startup/startup-profile/kyc"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100/60 hover:bg-amber-100 transition-colors"
                            >
                                + KYC chưa hoàn tất
                            </Link>
                            <Link href="/startup/startup-profile/team"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100/60 hover:bg-amber-100 transition-colors"
                            >
                                + Xác thực đội ngũ
                            </Link>
                            <Link href="/startup/startup-profile/info"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 text-[11px] font-medium border border-slate-100 hover:bg-slate-100 transition-colors"
                            >
                                + Thêm thông tin
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
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
                        {/* Problem / Solution */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: AlertTriangle, label: "Vấn đề", text: p.problemStatement || "Chưa cập nhật vấn đề", color: "text-rose-500" },
                                { icon: Lightbulb, label: "Giải pháp", text: p.solutionSummary || "Chưa cập nhật giải pháp", color: "text-amber-500" },
                            ].map(({ icon: Icon, label, text, color }) => (
                                <div key={label} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className={cn("w-4 h-4", color)} />
                                        <h3 className="text-[13px] font-semibold text-slate-700">{label}</h3>
                                    </div>
                                    <p className="text-[13px] text-slate-500 leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[13px] font-semibold text-slate-700">Mô tả chi tiết</h3>
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed">{p.description || "Chưa cập nhật mô tả"}</p>
                        </div>

                        {/* Current Needs */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-slate-400" />
                                <h3 className="text-[13px] font-semibold text-slate-700">Nhu cầu hiện tại</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {currentNeeds.length > 0 ? currentNeeds.map((n: string) => (
                                    <span key={n} className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25">{n}</span>
                                )) : <span className="text-[12px] text-slate-400">Chưa có thông tin nhu cầu</span>}
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thông tin nhanh</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Layers, label: "Giai đoạn", val: displayStage || "-" },
                                    { icon: Building2, label: "Ngành", val: `${displayIndustry || "-"} ${p.subIndustry ? `/ ${p.subIndustry}` : ""}` },
                                    { icon: Globe, label: "Thị trường", val: p.marketScope || "-" },
                                    { icon: CheckCircle2, label: "Sản phẩm", val: p.productStatus || "-" },
                                    { icon: Calendar, label: "Thành lập", val: foundedYear ? `${foundedYear}` : "-" },
                                    { icon: Users, label: "Team size", val: p.teamSize ? `${p.teamSize} người` : "-" },
                                    { icon: MapPin, label: "Địa điểm", val: `${p.location || ""}, ${p.country || ""}`.replace(/^,\s|,$\s/g, '') || "-" },
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
                            <Link href="/startup/startup-profile/info" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm">
                                <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                            </Link>
                            <Link href="/startup/documents" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                                <FileText className="w-3.5 h-3.5" /> Quản lý tài liệu
                            </Link>
                            <Link href="/startup/ai-evaluation" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                                <Brain className="w-3.5 h-3.5" /> AI Evaluation
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Kinh doanh" && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 space-y-5">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-5">
                            <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-400" /> Vấn đề & Giải pháp</h3>
                            <div className="space-y-1">
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Vấn đề</p>
                                <p className="text-[13px] text-slate-600 leading-relaxed">{p.problemStatement || "-"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Giải pháp</p>
                                <p className="text-[13px] text-slate-600 leading-relaxed">{p.solutionSummary || "-"}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" /> Nhu cầu hiện tại</h3>
                            <div className="flex flex-wrap gap-2">
                                {currentNeeds.length > 0 ? currentNeeds.map((n: string) => <span key={n} className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25">{n}</span>) : <span className="text-[12px] text-slate-400">Chưa có</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thị trường</h3>
                            <InfoPair label="Phạm vi thị trường" value={p.marketScope} />
                            <InfoPair label="Trạng thái sản phẩm" value={p.productStatus} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Gọi vốn" && (
                <div className="grid grid-cols-12 gap-5">
                    {[
                        { label: "Giai đoạn gọi vốn", value: p.fundingStage || "-", icon: TrendingUp, sub: "Vòng hiện tại" },
                        { label: "Số vốn cần", value: targetFunding > 0 ? `$${targetFunding.toLocaleString()}` : "-", icon: DollarSign, sub: "USD" },
                        { label: "Đã huy động", value: raisedAmount > 0 ? `$${raisedAmount.toLocaleString()}` : "-", icon: CheckCircle2, sub: `${fundingProgress}% mục tiêu` },
                    ].map(({ label, value, icon: Icon, sub }) => (
                        <div key={label} className="col-span-12 sm:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                                <Icon className="w-4.5 h-4.5 text-slate-400" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-1">{label}</p>
                            <p className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">{value}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                        </div>
                    ))}
                    {/* Raise progress */}
                    <div className="col-span-12 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                        <p className="text-[12px] font-medium text-slate-500 mb-3">Tiến độ huy động vốn</p>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#e6cc4c] rounded-full transition-all" style={{ width: `${fundingProgress}%` }} />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-[11px] text-slate-400">${raisedAmount.toLocaleString()} đã huy động</span>
                            <span className="text-[11px] text-slate-400">Mục tiêu ${targetFunding.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Đội ngũ & Xác thực" && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 space-y-5">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-5">
                            <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Thành viên cốt cán ({members.length})
                            </h3>
                            <div className="divide-y divide-slate-100">
                                {members.length > 0 ? members.map(m => (
                                    <div key={m.teamMemberID} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                                            <img src={m.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}&background=random`} alt={m.fullName} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-[14px] font-semibold text-slate-800 flex items-center gap-2">
                                                    {m.fullName} 
                                                    {m.isFounder && <span className="px-2 py-0.5 rounded-full bg-amber-100/50 text-amber-700 text-[10px] font-bold border border-amber-200/50">FOUNDER</span>}
                                                </p>
                                                {m.linkedInURL && (
                                                    <a href={m.linkedInURL} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                                                        <Linkedin className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-[12px] text-slate-500 font-medium">{(m.title && m.role) ? `${m.title} · ${m.role}` : (m.title || m.role)} {m.yearsOfExperience > 0 && ` · ${m.yearsOfExperience} năm kinh nghiệm`}</p>
                                            <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{m.bio}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-[13px] text-slate-400 italic">Chưa có thông tin thành viên.</p>}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#e6cc4c]" /> Chỉ số traction</h3>
                            <p className="text-[13px] text-slate-600 leading-relaxed font-mono bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{p.metricSummary || "Chưa có dữ liệu traction"}</p>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Xác thực đội ngũ</h3>
                            <div className="flex items-center gap-2.5">
                                <div className={cn("w-2 h-2 rounded-full", p.validationStatus === "Validated" ? "bg-emerald-500" : p.validationStatus === "In Progress" ? "bg-amber-400" : "bg-slate-300")} />
                                <span className="text-[13px] font-medium text-slate-700">{p.validationStatus || "Chưa xác thực"}</span>
                            </div>
                            <InfoPair label="Quy mô team" value={p.teamSize ? `${p.teamSize} người` : undefined} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Liên hệ" && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                        <h3 className="text-[13px] font-semibold text-slate-700">Liên hệ trực tiếp</h3>
                        <div className="space-y-3">
                            <InfoPair label="Email" value={p.contactEmail} />
                            <InfoPair label="Điện thoại" value={p.contactPhone} />
                            <InfoPair label="Địa chỉ" value={p.location || p.country ? `${p.location || ""}, ${p.country || ""}`.replace(/^,\s|,$\s/g, '') : undefined} />
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                        <h3 className="text-[13px] font-semibold text-slate-700">Liên kết</h3>
                        <div className="space-y-3">
                            <InfoPair label="Website" value={p.website} isLink />
                            <InfoPair label="LinkedIn" value={p.linkedInURL} isLink />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}