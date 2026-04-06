"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
    Pencil, MapPin, Layers, Target, TrendingUp, CheckCircle2, Clock,
    FileText, Brain, Building2, Globe, ArrowUpRight, Sparkles,
    ChevronRight, Briefcase, Zap, Handshake, Lock, User, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetInvestorProfile } from "@/services/investor/investor.api";

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

function calcCompleteness(p: IInvestorProfile): number {
    const checks = [
        Boolean(p.fullName),
        Boolean(p.title),
        Boolean(p.location),
        Boolean(p.bio || p.investmentThesis),
        Boolean(p.website || p.linkedInURL),
        Boolean(p.preferredIndustries?.length),
        Boolean(p.preferredStages?.length),
        Boolean(p.profilePhotoURL),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function InvestorProfileViewPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Tổng quan");
    const [profile, setProfile] = useState<IInvestorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        GetInvestorProfile()
            .then(res => {
                const data = res as unknown as IBackendRes<IInvestorProfile>;
                if (data.isSuccess && data.data) setProfile(data.data);
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#e6cc4c]" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-slate-500 text-[14px]">
                Không tải được hồ sơ.
            </div>
        );
    }

    const completeness = calcCompleteness(profile);
    const completenessColor = completeness >= 80 ? "bg-[#e6cc4c]" : completeness >= 50 ? "bg-amber-400" : "bg-rose-400";
    const initials = profile.fullName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
    const websiteDisplay = profile.website || profile.linkedInURL;
    const thesisSummary = profile.bio || profile.investmentThesis;
    const connectionLabel = profile.acceptingConnections ? "Đang tìm kiếm dự án" : "Tạm đóng kết nối";

    return (
        <div className="max-w-6xl mx-auto w-full space-y-5">

            {/* ── Hero Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    <div className="absolute top-4 right-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white text-[11px] font-medium">
                            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", profile.acceptingConnections ? "bg-emerald-400" : "bg-slate-400")} />
                            {connectionLabel}
                        </span>
                    </div>
                </div>

                <div className="px-7 pb-7 relative">
                    <div className="-mt-10 mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-[3px] border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                            {profile.profilePhotoURL
                                ? <img src={profile.profilePhotoURL} alt={profile.fullName} className="w-full h-full object-cover" />
                                : <span className="text-white font-black text-[32px] tracking-tight">{initials}</span>
                            }
                        </div>
                    </div>

                    <div className="mb-4">
                        <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">{profile.fullName}</h1>
                        {thesisSummary && <p className="text-[13px] text-slate-500 mt-0.5">{thesisSummary}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-5">
                        {profile.investorType && <Tag variant="green"><Building2 className="w-3 h-3" />{profile.investorType}</Tag>}
                        {profile.preferredStages?.[0] && <Tag variant="violet"><TrendingUp className="w-3 h-3" />{profile.preferredStages[0]}</Tag>}
                        {profile.preferredIndustries?.[0] && <Tag><FileText className="w-3 h-3 text-slate-400" />{profile.preferredIndustries[0]}</Tag>}
                        {profile.preferredMarketScopes?.[0] && <Tag variant="blue">{profile.preferredMarketScopes[0]}</Tag>}
                        {profile.location && (
                            <>
                                <span className="text-slate-200 text-[14px] mx-0.5">·</span>
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <MapPin className="w-3 h-3" />{profile.location}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-medium text-slate-500">Độ hoàn thiện hồ sơ</span>
                            <span className="text-[12px] font-semibold text-slate-700">{completeness}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div className={cn("h-full rounded-full transition-all", completenessColor)} style={{ width: `${completeness}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {!thesisSummary && (
                                <Link href="/investor/profile/edit/thesis" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100/60 hover:bg-amber-100 transition-colors">
                                    + Mở rộng Thesis
                                </Link>
                            )}
                            <Link href="/investor/profile/edit/kyc" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-100/60 hover:bg-amber-100 transition-colors">
                                + KYC Thành viên
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
                    <div className="col-span-12 lg:col-span-8 space-y-5">
                        {(profile.title || profile.firmName) && (
                            <div className="grid grid-cols-2 gap-4">
                                {profile.title && (
                                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-[#C8A000]" />
                                            <h3 className="text-[13px] font-semibold text-slate-700">Tổ chức & Vai trò</h3>
                                        </div>
                                        <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                                            {profile.title}{profile.firmName ? ` tại ${profile.firmName}` : ""}
                                        </p>
                                    </div>
                                )}
                                {profile.supportOffered?.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Handshake className="w-4 h-4 text-emerald-500" />
                                            <h3 className="text-[13px] font-semibold text-slate-700">Giá trị gia tăng</h3>
                                        </div>
                                        <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{profile.supportOffered.join(" · ")}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {thesisSummary && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-[13px] font-semibold text-slate-700">Tóm tắt ngắn gọn (Thesis Summary)</h3>
                                </div>
                                <p className="text-[13px] text-slate-500 leading-relaxed">{thesisSummary}</p>
                            </div>
                        )}

                        {profile.preferredIndustries?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-[13px] font-semibold text-slate-700">Industry quan tâm</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.preferredIndustries.map(n => (
                                        <span key={n} className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25">{n}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thông tin nhanh</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Briefcase, label: "TÊN TỔ CHỨC", val: profile.firmName || profile.organization },
                                    { icon: User, label: "CHỨC VỤ", val: profile.title },
                                    { icon: Building2, label: "LOẠI HÌNH ĐẦU TƯ", val: profile.investorType },
                                    { icon: Globe, label: "KHU VỰC/VỊ TRÍ", val: profile.location },
                                ].filter(i => i.val).map(({ icon: Icon, label, val }) => (
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

                        <Link href="/investor/profile/edit/info" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm">
                            <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                        </Link>
                    </div>
                </div>
            )}

            {activeTab === "Thông tin Thesis" && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 space-y-5">
                        {profile.preferredMarketScopes?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                                <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-500" /> Tệp khách hàng mục tiêu</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.preferredMarketScopes.map(n => <span key={n} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-medium border border-emerald-100/60">{n}</span>)}
                                </div>
                            </div>
                        )}
                        {profile.preferredStages?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
                                <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-500" /> Giai đoạn đầu tư ưu tiên</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.preferredStages.map(n => <span key={n} className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-[12px] font-medium border border-violet-100/60">{n}</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        {profile.preferredGeographies?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                                <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Phạm vi</h3>
                                <InfoPair label="Vị trí địa lý ưu tiên" value={profile.preferredGeographies.join(", ")} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "Liên hệ" && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                        <h3 className="text-[13px] font-semibold text-slate-700">Kênh kết nối chính thức</h3>
                        <div className="space-y-3">
                            <InfoPair label="Website / Liên kết" value={websiteDisplay} isLink />
                            <InfoPair label="Địa chỉ văn phòng" value={profile.location} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
