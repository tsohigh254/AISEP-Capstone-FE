"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, notFound } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
    ChevronRight,
    Globe,
    Linkedin,
    MapPin,
    Info,
    TrendingUp,
    Flag,
    Zap,
    Target,
    HelpCircle,
    UserPlus,
    MessageCircle,
    Clock,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { InvestorConnectionModal } from "@/components/startup/investor-connection-modal";
import { GetConnectionByInvestorId } from "@/services/connection/connection.api";
// import { GetInvestorById } from "@/services/startup/startup.api";
import { CreateConversation } from "@/services/messaging/messaging.api";

// ── Types ──────────────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────

function deriveBadges(inv: IInvestorProfile): { label: string; color: "yellow" | "green" | "blue" }[] {
    const badges: { label: string; color: "yellow" | "green" | "blue" }[] = [];
    if (inv.investorType === "Institutional") badges.push({ label: "QUỸ CHÍNH QUY", color: "yellow" });
    else badges.push({ label: "ANGEL INVESTOR", color: "yellow" });
    if (inv.acceptingConnections) badges.push({ label: "ĐANG MỞ KẾT NỐI", color: "green" });
    if (inv.country) badges.push({ label: inv.country.toUpperCase(), color: "blue" });
    return badges;
}

function AvatarOrLogo({ name, url, className }: { name: string; url?: string; className?: string }) {
    if (url) return <img src={url} alt={name} className={cn("object-cover", className)} />;
    const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
    return (
        <div className={cn("bg-slate-100 flex items-center justify-center font-black text-slate-500 text-2xl", className)}>
            {initials}
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InvestorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const investorId = Number(id);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("Tổng quan");
    const [investor, setInvestor] = useState<IInvestorProfile | null>(null);
    const [investorLoading, setInvestorLoading] = useState(true);
    const [investorError, setInvestorError] = useState<string | null>(null);
    const [isNotFound, setIsNotFound] = useState(false);

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [connection, setConnection] = useState<IConnectionItem | null>(null);
    const [connectionLoading, setConnectionLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);

    // Fetch investor profile + connection status in parallel
    useEffect(() => {
        const loadInvestor = async () => {
            setInvestorLoading(true);
            try {
                // const res = await GetInvestorById(investorId) as any as IBackendRes<IInvestorProfile>;
                const res = { success: false, data: null }; // Mock until implemented
                if (res.success && res.data) {
                    setInvestor(res.data as any);
                } else {
                    setIsNotFound(true);
                }
            } catch {
                setInvestorError("Không thể tải thông tin nhà đầu tư.");
            } finally {
                setInvestorLoading(false);
            }
        };

        const loadConnection = async () => {
            try {
                const conn = await GetConnectionByInvestorId(investorId);
                setConnection(conn);
            } catch { /* silent */ } finally {
                setConnectionLoading(false);
            }
        };

        loadInvestor();
        loadConnection();
    }, [investorId]);

    const handleConnectionSuccess = (connectionId: number) => {
        setConnection({
            connectionID: connectionId,
            startupID: 0,
            startupName: "",
            investorID: investorId,
            investorName: investor?.fullName ?? "",
            connectionStatus: "Pending",
            personalizedMessage: "",
            matchScore: 0,
            requestedAt: new Date().toISOString(),
            respondedAt: "",
        });
    };

    const handleStartChat = async () => {
        if (!connection) return;
        setChatLoading(true);
        try {
            const res = await CreateConversation({ connectionId: connection.connectionID }) as any as IBackendRes<IConversation>;
            if (res.success && res.data) {
                router.push(`/startup/messaging?conversationId=${res.data.conversationId}`);
            } else {
                router.push("/startup/messaging");
            }
        } catch {
            router.push("/startup/messaging");
        } finally {
            setChatLoading(false);
        }
    };

    // ── Loading / Error states ──
    if (investorLoading) {
        return (
            <StartupShell>
                <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                    <Loader2 className="size-8 animate-spin mb-3 text-[#eec54e]" />
                    <p className="text-[14px] font-medium">Đang tải hồ sơ nhà đầu tư...</p>
                </div>
            </StartupShell>
        );
    }

    if (isNotFound) notFound();

    if (investorError || !investor) {
        return (
            <StartupShell>
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="size-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                        <AlertCircle className="size-6 text-red-400" />
                    </div>
                    <p className="text-slate-800 font-semibold text-[16px] mb-1">{investorError || "Không tìm thấy nhà đầu tư"}</p>
                    <button onClick={() => router.push("/startup/investors")} className="mt-5 px-4 py-2 rounded-xl text-[13px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        Quay lại danh sách
                    </button>
                </div>
            </StartupShell>
        );
    }

    const badges = deriveBadges(investor);
    const badgeColors = {
        yellow: "bg-yellow-50/50 border-yellow-200/50 text-yellow-600",
        green:  "bg-green-50/50 border-green-200/50 text-green-600",
        blue:   "bg-blue-50/50 border-blue-200/50 text-blue-600",
    };
    const dotColors = { yellow: "bg-yellow-400", green: "bg-green-400", blue: "bg-blue-400" };

    return (
        <StartupShell>
            <div className="max-w-[1440px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="size-32 rounded-[32px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 overflow-hidden">
                                <AvatarOrLogo name={investor.fullName} url={investor.profilePhotoURL} className="size-full rounded-[24px]" />
                            </div>
                            <div className="text-center lg:text-left space-y-4">
                                <div>
                                    <h1 className="text-[32px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">{investor.fullName}</h1>
                                    {investor.firmName && <p className="text-[15px] text-slate-400 font-semibold mt-1">{investor.firmName}</p>}
                                    {investor.title && <p className="text-[17px] text-slate-500 font-medium mt-1">{investor.title}</p>}
                                </div>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                                    {badges.map((badge, i) => (
                                        <div key={i} className={cn("px-4 py-2 rounded-xl flex items-center gap-2 border transition-all", badgeColors[badge.color])}>
                                            <div className={cn("size-2.5 rounded-full shadow-[0_0_8px_currentColor]", dotColors[badge.color])} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">{badge.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {connectionLoading ? (
                            <Button disabled className="h-16 px-10 rounded-[20px] bg-slate-100 text-slate-400 font-black text-[15px] uppercase tracking-widest shrink-0 gap-3">
                                <Loader2 className="size-5 animate-spin" />
                                <span>Đang tải...</span>
                            </Button>
                        ) : connection?.connectionStatus === "Accepted" ? (
                            <Button onClick={handleStartChat} disabled={chatLoading} className="h-16 px-10 rounded-[20px] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[15px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all gap-4 shrink-0 group">
                                {chatLoading ? <Loader2 className="size-5 animate-spin" /> : <MessageCircle className="size-6 transition-transform group-hover:scale-110" />}
                                <span>Bắt đầu chat</span>
                            </Button>
                        ) : connection?.connectionStatus === "Pending" ? (
                            <Button disabled className="h-16 px-10 rounded-[20px] bg-slate-100 text-slate-500 font-black text-[15px] uppercase tracking-widest shrink-0 gap-4 cursor-not-allowed">
                                <Clock className="size-6" />
                                <span>Đang chờ phản hồi</span>
                            </Button>
                        ) : investor.acceptingConnections ? (
                            <Button onClick={() => setIsRequestModalOpen(true)} className="h-16 px-10 rounded-[20px] bg-[#eec54e] hover:bg-[#d4ae3d] text-white font-black text-[15px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all gap-4 shrink-0 group">
                                <UserPlus className="size-6 transition-transform group-hover:scale-110" />
                                <span>Gửi lời mời kết nối</span>
                            </Button>
                        ) : (
                            <Button disabled className="h-16 px-10 rounded-[20px] bg-slate-100 text-slate-400 font-black text-[15px] uppercase tracking-widest shrink-0 gap-4 cursor-not-allowed">
                                <Clock className="size-6" />
                                <span>Không nhận kết nối</span>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Tab Navigation */}
                        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm px-8 overflow-x-auto">
                            <div className="flex gap-10 whitespace-nowrap">
                                {["Tổng quan", "Tiêu chí đầu tư", "Thông tin liên hệ"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "relative py-6 text-[15px] font-bold tracking-tight transition-all",
                                            activeTab === tab ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"
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

                        {/* Tab: Tổng quan */}
                        {activeTab === "Tổng quan" && (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10 space-y-12">
                                {/* Bio */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                                            <Info className="size-5 text-[#eec54e]" />
                                        </div>
                                        <h2 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">Về {investor.fullName}</h2>
                                    </div>
                                    <p className="text-[16px] text-slate-600 dark:text-slate-300 font-medium leading-[1.8]">
                                        {investor.bio || "Chưa có thông tin giới thiệu."}
                                    </p>
                                </section>

                                {/* Support Offered + Investment Thesis */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {(investor.supportOffered?.length ?? 0) > 0 && (
                                        <div className="bg-[#f8fafc] dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-50 dark:border-slate-800 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Handshake className="size-5 text-yellow-500" />
                                                <h3 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">Hỗ trợ cung cấp</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {(investor.supportOffered ?? []).map((item, i) => (
                                                    <li key={i} className="flex gap-3">
                                                        <div className="size-1.5 rounded-full bg-yellow-400 shrink-0 mt-2" />
                                                        <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {investor.investmentThesis && (
                                        <div className="bg-[#f8fafc] dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-50 dark:border-slate-800 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <TrendingUp className="size-5 text-yellow-500" />
                                                <h3 className="text-[17px] font-black text-slate-900 dark:text-white tracking-tight">Luận điểm đầu tư</h3>
                                            </div>
                                            <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-400 leading-[1.7]">
                                                {investor.investmentThesis}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Connection Guidance */}
                                {investor.connectionGuidance && (
                                    <section className="space-y-6 pt-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                                                <Flag className="size-5 text-[#eec54e]" />
                                            </div>
                                            <h2 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">Hướng dẫn kết nối</h2>
                                        </div>
                                        <p className="text-[16px] text-slate-600 dark:text-slate-300 font-medium leading-[1.8]">
                                            {investor.connectionGuidance}
                                        </p>
                                    </section>
                                )}
                            </div>
                        )}

                        {/* Tab: Tiêu chí đầu tư */}
                        {activeTab === "Tiêu chí đầu tư" && (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10 space-y-10">
                                {[
                                    { label: "Giai đoạn ưu tiên", items: investor.preferredStages },
                                    { label: "Lĩnh vực ưu tiên", items: investor.preferredIndustries },
                                    { label: "Địa lý", items: investor.preferredGeographies },
                                    { label: "Phạm vi thị trường", items: investor.preferredMarketScopes },
                                    { label: "Độ trưởng thành sản phẩm", items: investor.preferredProductMaturity },
                                    { label: "Mức độ kiểm chứng", items: investor.preferredValidationLevel },
                                    { label: "Điểm mạnh ưu tiên", items: investor.preferredStrengths },
                                ].filter(g => (g.items?.length ?? 0) > 0).map(group => (
                                    <div key={group.label} className="space-y-4">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{group.label}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(group.items ?? []).map(item => (
                                                <span key={item} className="px-5 py-2.5 bg-[#f8fafc] dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[12px] font-black text-slate-600 dark:text-slate-300 tracking-tight">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {investor.preferredAIScoreRange && (
                                    <div className="space-y-3">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dải AI Score ưu tiên</p>
                                        <p className="text-[20px] font-black text-slate-900 dark:text-white">
                                            {typeof investor.preferredAIScoreRange === 'string' ? investor.preferredAIScoreRange : `${(investor.preferredAIScoreRange as any)?.min} – ${(investor.preferredAIScoreRange as any)?.max}`}
                                        </p>
                                        <p className="text-[12px] text-slate-400 font-medium">Mức độ quan trọng: <span className="font-black text-yellow-600">{investor.aiScoreImportance}</span></p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Thông tin liên hệ */}
                        {activeTab === "Thông tin liên hệ" && (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10 space-y-8">
                                {investor.website && (
                                    <a href={investor.website.startsWith("http") ? investor.website : `https://${investor.website}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-4 group cursor-pointer">
                                        <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Globe className="size-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website chính thức</p>
                                            <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{investor.website}</p>
                                        </div>
                                    </a>
                                )}
                                {investor.linkedInURL && (
                                    <a href={investor.linkedInURL.startsWith("http") ? investor.linkedInURL : `https://linkedin.com/in/${investor.linkedInURL}`} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-4 group cursor-pointer">
                                        <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Linkedin className="size-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LinkedIn</p>
                                            <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{investor.linkedInURL}</p>
                                        </div>
                                    </a>
                                )}
                                {(investor.location || investor.country) && (
                                    <div className="flex items-start gap-4">
                                        <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <MapPin className="size-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa điểm</p>
                                            <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                                                {[investor.location, investor.country].filter(Boolean).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Investment Criteria Summary */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <Target className="size-5 text-yellow-500" />
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiêu chí đầu tư</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Loại nhà đầu tư</p>
                                    <p className="text-[18px] font-black text-slate-900 dark:text-white">{investor.investorType}</p>
                                    {investor.organization && <p className="text-[12px] text-slate-400 font-medium mt-1">{investor.organization}</p>}
                                </div>
                                {(investor.preferredStages?.length ?? 0) > 0 && (
                                    <div className="space-y-4">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Giai đoạn ưu tiên</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(investor.preferredStages ?? []).map(stage => (
                                                <span key={stage} className="px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-xl text-[12px] font-black text-slate-600 dark:text-slate-300 tracking-tight">
                                                    {stage}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(investor.preferredIndustries?.length ?? 0) > 0 && (
                                    <div className="space-y-4 pt-2">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lĩnh vực quan tâm</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(investor.preferredIndustries ?? []).map(sector => (
                                                <span key={sector} className="px-4 py-2 bg-[#f8fafc] dark:bg-slate-800 text-[11px] font-black text-slate-400 dark:text-slate-500 rounded-xl border border-slate-50 dark:border-slate-700">
                                                    {sector}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact quick-view */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="size-5 text-yellow-500" />
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin liên hệ</h3>
                            </div>
                            {investor.website && (
                                <div className="flex items-center gap-3">
                                    <Globe className="size-4 text-slate-400 shrink-0" />
                                    <p className="text-[13px] font-bold text-slate-600 truncate">{investor.website}</p>
                                </div>
                            )}
                            {investor.linkedInURL && (
                                <div className="flex items-center gap-3">
                                    <Linkedin className="size-4 text-slate-400 shrink-0" />
                                    <p className="text-[13px] font-bold text-slate-600 truncate">{investor.linkedInURL}</p>
                                </div>
                            )}
                            {(investor.location || investor.country) && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="size-4 text-slate-400 shrink-0" />
                                    <p className="text-[13px] font-bold text-slate-600">{[investor.location, investor.country].filter(Boolean).join(", ")}</p>
                                </div>
                            )}
                        </div>

                        {/* Note */}
                        <div className="p-8 bg-yellow-50/50 dark:bg-yellow-500/5 rounded-[32px] border border-yellow-100/50 dark:border-yellow-500/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap className="size-5 text-yellow-500" />
                                <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Ghi chú quan trọng</h3>
                            </div>
                            <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-[1.6]">
                                {investor.acceptingConnections
                                    ? "Nhà đầu tư này đang mở kết nối. Hãy đảm bảo hồ sơ dự án đã đầy đủ trước khi gửi lời mời."
                                    : "Nhà đầu tư này hiện không nhận kết nối mới. Bạn vẫn có thể theo dõi hồ sơ của họ."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-20">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <img src="/AISEP_Logo.png" alt="AISEP" className="size-10 rounded-full grayscale opacity-50" />
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
                    investor={investor ? {
                        name: investor.fullName,
                        logo: investor.profilePhotoURL ?? "",
                        type: investor.firmName || investor.investorType || "",
                        investorId: investorId,
                    } : null}
                    onSuccess={handleConnectionSuccess}
                />
            </div>
        </StartupShell>
    );
}
