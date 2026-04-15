"use client";

import { use, useState, useEffect } from "react";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
    FolderOpen,
    Loader2
} from "lucide-react";
import { AddToWatchlist, RemoveFromWatchlist, GetInvestorWatchlist, GetStartupById, GetInvestorProfile, SearchStartups } from "@/services/investor/investor.api";
import { CreateConnection, GetSentConnections } from "@/services/connection/connection.api";
import { GetStartupDocuments, ViewDocument } from "@/services/document/document.api";
import { toast } from "sonner";
import { Download, Eye, RefreshCcw } from "lucide-react";

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
    
    const [startupData, setStartupData] = useState<any | null>(null);
    const [isStartupLoading, setIsStartupLoading] = useState<boolean>(false);

    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [watchlistItemId, setWatchlistItemId] = useState<number | null>(null);
    const [isInvestor, setIsInvestor] = useState<boolean | null>(null);
    const [showUnfollowConfirm, setShowUnfollowConfirm] = useState<boolean>(false);

    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [connectionSent, setConnectionSent] = useState<boolean>(false);

    const [startupDocs, setStartupDocs] = useState<IDocument[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);

    const startup = startupData ?? (STARTUPS.find(s => s.id === id) || STARTUPS[0]);
    const avatarGradient = getAvatarColor(String(startup.id ?? startup.name ?? id));
    
    const notifyWatchlistUpdated = () => {
        if (typeof window === "undefined") return;
        try {
            if ((window as any).BroadcastChannel) {
                const bc = new BroadcastChannel("watchlist-updates");
                bc.postMessage({ type: "refresh" });
                bc.close();
            } else {
                localStorage.setItem("watchlist-refresh", Date.now().toString());
            }
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        const checkRole = async () => {
            try {
                const res = await GetInvestorProfile();
                if (res?.isSuccess) setIsInvestor(true);
                else setIsInvestor(false);
            } catch (e) {
                setIsInvestor(false);
            }
        };
        const checkExistingConnection = async () => {
            try {
                const numericId = Number(id);
                if (Number.isNaN(numericId) || numericId <= 0) return;
                const res = await GetSentConnections(1, 100);
                if (res?.isSuccess) {
                    let items: any[] = [];
                    const d = res.data as any;
                    if (Array.isArray(d)) items = d;
                    else if (Array.isArray(d?.data)) items = d.data;
                    else if (Array.isArray(d?.items)) items = d.items;
                    const found = items.some((c: any) => {
                        const cStartupId = Number(c?.startupID ?? c?.startupId ?? c?.StartupID ?? c?.StartupId ?? null);
                        return cStartupId === numericId;
                    });
                    if (found) setConnectionSent(true);
                }
            } catch { /* silent */ }
        };
        checkRole();
        checkExistingConnection();
    }, [id]);

    useEffect(() => {
        const fetchStartup = async () => {
            const numericId = Number(id);
            if (Number.isNaN(numericId) || numericId <= 0) return;
            setIsStartupLoading(true);
            try {
                const res = await GetStartupById(numericId);
                if (res?.isSuccess) {
                    const sd: any = res.data;
                    const fallback = STARTUPS.find(s => s.id === id) || STARTUPS[0];
                    const normalized = {
                        id: sd?.startupID ?? sd?.startupId ?? sd?.id ?? numericId,
                        name: sd?.companyName ?? sd?.CompanyName ?? sd?.name ?? sd?.StartupName ?? sd?.startupName ?? fallback.name,
                        industry: sd?.industry ?? sd?.Industry ?? fallback.industry,
                        stage: sd?.stage ?? sd?.Stage ?? fallback.stage,
                        location: sd?.location ?? sd?.Location ?? sd?.city ?? fallback.location,
                        target: sd?.target ?? sd?.Target ?? fallback.target,
                        score: sd?.score ?? sd?.Score ?? fallback.score,
                        desc: sd?.description ?? sd?.desc ?? sd?.Description ?? fallback.desc,
                        tags: sd?.tags ?? sd?.Tags ?? fallback.tags,
                        team: sd?.team ?? sd?.teamMembers ?? fallback.team,
                        logo: sd?.logo ?? sd?.logoURL ?? fallback.logo,
                    };
                    setStartupData(normalized);
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("GetStartupById error:", e);
            } finally {
                setIsStartupLoading(false);
            }
        };
        fetchStartup();
    }, [id]);

    useEffect(() => {
        const numId = Number(id);
        if (!numId || numId <= 0) return;
        let cancelled = false;
        (async () => {
            setDocsLoading(true);
            try {
                const res = await GetStartupDocuments(numId);
                if (!cancelled && res?.isSuccess) setStartupDocs(res.data ?? []);
            } catch { /* silent */ }
            finally { if (!cancelled) setDocsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [id]);

    useEffect(() => {
        const checkFollowing = async () => {
            try {
                const res = await GetInvestorWatchlist(1, 200);
                if (res?.isSuccess) {
                    // support multiple backend shapes: res.data.data, res.data.items, res.items, or res.data as array
                    let rawItems: any[] = [];
                    const resDataAny = res.data as any;
                    if (Array.isArray(res.data)) rawItems = res.data as any[];
                    else if (Array.isArray(resDataAny?.data)) rawItems = resDataAny.data;
                    else if (Array.isArray(resDataAny?.items)) rawItems = resDataAny.items;
                    else if (Array.isArray((res as any)?.items)) rawItems = (res as any).items;
                    else rawItems = [];

                    const items = rawItems.map((raw) => ({
                        watchlistId: raw?.watchlistID ?? raw?.watchlistId ?? raw?.WatchlistID ?? raw?.WatchlistId ?? null,
                        startupID: Number(raw?.startupID ?? raw?.startupId ?? raw?.StartupID ?? raw?.StartupId ?? null) || null,
                        startupName: raw?.companyName ?? raw?.CompanyName ?? raw?.startupName ?? raw?.StartupName ?? raw?.companyname ?? null,
                        addedAt: raw?.addedAt ?? raw?.AddedAt ?? raw?.AddedAt ?? null,
                    }));

                    const numericId = Number(id);
                    const found = items.find(i => (i.startupID && !Number.isNaN(numericId) ? i.startupID === numericId : (i.startupName && i.startupName === (startupData?.name ?? (STARTUPS.find(s => s.id === id)?.name ?? "")))));
                    if (found) {
                        setIsFollowing(true);
                        setWatchlistItemId(found.watchlistId);
                    } else {
                        setIsFollowing(false);
                        setWatchlistItemId(null);
                    }
                }
            } catch (err) {
                // ignore silently; user may be unauthenticated
            }
        };
        checkFollowing();
    }, [id, startupData]);

    const handleFollowClick = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            // Resolve a correct numeric startupId to send to backend.
            let resolvedStartupId = Number(id) || 0;
            // If route id is not numeric, try to resolve from fetched startup data or by searching
            if (!resolvedStartupId || resolvedStartupId <= 0) {
                if (startupData && Number(startupData?.id)) {
                    resolvedStartupId = Number(startupData.id);
                } else {
                    // try backend search by name
                    try {
                        const sres = await SearchStartups(startup.name, 1, 50);
                        if (sres?.isSuccess) {
                            const list = ((sres.data as any)?.data ?? (sres.data as any)?.items ?? []) as any[];
                            const found = list.find(it => (it?.companyName ?? it?.CompanyName ?? it?.name ?? it?.StartupName) === startup.name);
                            if (found) resolvedStartupId = Number(found?.startupID ?? found?.StartupID ?? found?.id ?? found?.Id ?? 0);
                        }
                    } catch (e) {
                        // ignore
                    }
                    // fallback: extract digits from slug like SU-1001 -> 1001
                    if (!resolvedStartupId || resolvedStartupId <= 0) {
                        const maybe = Number((startup.id || "").toString().replace(/\D/g, ""));
                        if (maybe && maybe > 0) resolvedStartupId = maybe;
                    }
                }
            }

            if (!isFollowing) {
                if (!resolvedStartupId || resolvedStartupId <= 0) {
                    try { localStorage.setItem("watchlist-debug", JSON.stringify({ timestamp: Date.now(), op: "resolve-failed", idParam: id, startupFallback: startup })); } catch(e){}
                    toast.error("Không xác định được startupId để theo dõi");
                    return;
                }

                const res = await AddToWatchlist({ startupID: resolvedStartupId });
                if (res?.isSuccess) {
                    const created = res.data as any;
                    const createdWatchlistId = created?.watchlistID ?? created?.watchlistId ?? created?.WatchlistID ?? created?.WatchlistId ?? null;
                    setIsFollowing(true);
                    setWatchlistItemId(createdWatchlistId ?? null);
                    // store debug info for troubleshooting
                    try {
                        const dbg = {
                            timestamp: Date.now(),
                            op: "add",
                            request: { url: "/api/investors/me/watchlist", body: { startupID: resolvedStartupId, StartupId: resolvedStartupId } },
                            response: { isSuccess: res?.isSuccess ?? false, statusCode: (res as any)?.statusCode ?? null, message: (res as any)?.message ?? null, data: res?.data ?? null }
                        };
                        localStorage.setItem("watchlist-debug", JSON.stringify(dbg));
                    } catch (e) {
                        // ignore storage errors
                    }
                    notifyWatchlistUpdated();
                    toast.success("Đã thêm vào danh sách theo dõi");
                } else {
                    // If backend indicates the startup is already in watchlist (409/conflict), reflect that in UI rather than only showing error.
                    const msg = (res && (res as any).message) || "Không thể thêm theo dõi";
                    // common backend codes/messages: "WATCHLIST_EXISTS" or english "already in your watchlist"
                    if ((res && ((res as any).code === "WATCHLIST_EXISTS" || /already/i.test(msg))) || (res && (res as any).statusCode === 409)) {
                        // Refresh watchlist to mark as following
                        try {
                            const refresh = await GetInvestorWatchlist(1, 200);
                            if (refresh?.isSuccess) {
                                let rawItems: any[] = [];
                                const refreshDataAny = refresh.data as any;
                                if (Array.isArray(refresh.data)) rawItems = refresh.data as any[];
                                else if (Array.isArray(refreshDataAny?.data)) rawItems = refreshDataAny.data;
                                else if (Array.isArray(refreshDataAny?.items)) rawItems = refreshDataAny.items;
                                else if (Array.isArray((refresh as any)?.items)) rawItems = (refresh as any).items;
                                else rawItems = [];

                                const found = rawItems.find(r => {
                                    const sid = Number(r?.startupID ?? r?.startupId ?? r?.StartupID ?? r?.StartupId ?? null) || null;
                                    return sid === resolvedStartupId || r?.companyName === startup.name || r?.CompanyName === startup.name;
                                });
                                        if (found) {
                                            setIsFollowing(true);
                                            const foundWatchlistId = found?.watchlistID ?? found?.watchlistId ?? found?.WatchlistID ?? found?.WatchlistId ?? null;
                                            setWatchlistItemId(foundWatchlistId ?? null);
                                            try {
                                                const dbg = {
                                                    timestamp: Date.now(),
                                                    op: "add-conflict-refresh",
                                                    request: { url: "/api/investors/me/watchlist (refresh)" },
                                                    response: { isSuccess: refresh?.isSuccess ?? false, statusCode: (refresh as any)?.statusCode ?? null, data: refresh?.data ?? null }
                                                };
                                                localStorage.setItem("watchlist-debug", JSON.stringify(dbg));
                                            } catch (e) {}
                                            notifyWatchlistUpdated();
                                        }
                            }
                        } catch (e) {
                            // ignore
                        }
                        toast.success("Đã có trong danh sách theo dõi");
                    } else {
                        toast.error(msg);
                    }
                }
            } else {
                // Backend delete expects the startupId in the route
                const idToDelete = resolvedStartupId;
                try {
                    const del = await RemoveFromWatchlist(idToDelete);
                    if (del?.isSuccess) {
                        // debug store
                        try {
                            const dbg = {
                                timestamp: Date.now(),
                                op: "remove",
                                request: { url: `/api/investors/me/watchlist/${idToDelete}`, method: "DELETE" },
                                response: { isSuccess: del?.isSuccess ?? false, statusCode: (del as any)?.statusCode ?? null, data: del?.data ?? null, message: del?.message ?? null }
                            };
                            localStorage.setItem("watchlist-debug", JSON.stringify(dbg));
                        } catch (e) {}
                        setIsFollowing(false);
                        setWatchlistItemId(null);
                        notifyWatchlistUpdated();
                        toast.success("Đã gỡ khỏi danh sách theo dõi");
                    } else {
                        toast.error(del?.message ?? "Không thể gỡ theo dõi");
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error("RemoveFromWatchlist error:", err);
                    toast.error("Lỗi khi gỡ theo dõi");
                }
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("handleFollowClick error:", err);
            toast.error("Lỗi khi cập nhật danh sách theo dõi");
        } finally {
            setIsProcessing(false);
        }
    };

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
                            <div className={cn("w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white text-[32px] md:text-[40px] font-black shrink-0 bg-gradient-to-br transition-transform hover:scale-105 duration-300 overflow-hidden", avatarGradient)}>
                                {startup.logo && (startup.logo.startsWith("http") || startup.logo.startsWith("/")) ? (
                                    <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    startup.logo || (startup.name ? startup.name.charAt(0).toUpperCase() : "?")
                                )}
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
                            {isInvestor === false ? (
                                <button
                                    onClick={() => toast.error("Chỉ Nhà đầu tư mới có thể theo dõi startup. Vui lòng chuyển tài khoản hoặc tạo hồ sơ Nhà đầu tư.")}
                                    className="flex-1 md:flex-none justify-center bg-[#f3f3f3] text-neutral-500 border border-slate-200 font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed"
                                >
                                    <Bookmark className="w-5 h-5" />
                                    Chỉ Nhà đầu tư
                                </button>
                            ) : (
                                <>
                                    <>
                                        <button
                                            onClick={() => {
                                                if (isFollowing) setShowUnfollowConfirm(true);
                                                else handleFollowClick();
                                            }}
                                            disabled={isProcessing}
                                            className={cn(
                                                "relative flex-1 md:flex-none justify-center font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-60",
                                                isFollowing
                                                    ? "bg-white text-emerald-700 border border-emerald-100"
                                                    : "bg-[#f8f8f6] text-[#171611] border border-slate-200"
                                            )}
                                        >
                                            <Bookmark className="w-5 h-5" />
                                            {isProcessing ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-[#171611]" />
                                            ) : (
                                                <span>{isFollowing ? "Đã theo dõi" : "Theo dõi"}</span>
                                            )}
                                        </button>

                                        <Dialog open={showUnfollowConfirm} onOpenChange={(open) => setShowUnfollowConfirm(open)}>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Xác nhận hủy theo dõi</DialogTitle>
                                            </DialogHeader>
                                            <DialogDescription>Bạn có chắc muốn bỏ theo dõi "{startup.name}" không? Thao tác này sẽ gỡ startup khỏi danh sách theo dõi của bạn.</DialogDescription>
                                            <DialogFooter>
                                              <div className="flex items-center gap-3">
                                                <button onClick={() => setShowUnfollowConfirm(false)} disabled={isProcessing} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all">Hủy</button>
                                                <button
                                                  onClick={async () => { setShowUnfollowConfirm(false); await handleFollowClick(); }}
                                                  disabled={isProcessing}
                                                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all"
                                                >
                                                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin inline-block" /> : "Bỏ theo dõi"}
                                                </button>
                                              </div>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                    </>
                                </>
                            )}
                            <button
                                onClick={async () => {
                                    const numericId = Number(startup.id);
                                    if (Number.isNaN(numericId) || numericId <= 0) {
                                        toast.error("Không xác định được ID startup.");
                                        return;
                                    }
                                    if (connectionSent) {
                                        toast.info("Bạn đã gửi đề nghị kết nối đến startup này rồi.");
                                        return;
                                    }
                                    setIsConnecting(true);
                                    try {
                                        const res = await CreateConnection({ startupId: numericId, message: "" });
                                        if (res?.isSuccess) {
                                            setConnectionSent(true);
                                            toast.success("Đã gửi đề nghị kết nối thành công!");
                                        } else {
                                            toast.error((res as any)?.message || "Gửi đề nghị thất bại.");
                                        }
                                    } catch (e: any) {
                                        toast.error(e?.response?.data?.message || "Gửi đề nghị thất bại.");
                                    } finally {
                                        setIsConnecting(false);
                                    }
                                }}
                                disabled={isConnecting || connectionSent}
                                className={cn(
                                    "flex-1 md:flex-none justify-center font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-60",
                                    connectionSent
                                        ? "bg-white text-emerald-700 border border-emerald-200"
                                        : "bg-[#e6cc4c] text-[#171611] hover:shadow-lg"
                                )}
                            >
                                {isConnecting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Handshake className="w-5 h-5" />
                                )}
                                {connectionSent ? "Đã gửi kết nối" : "Đề nghị kết nối"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="col-span-1 md:col-span-3 space-y-8">
                            <div>
                                <h4 className="text-[13px] font-bold text-slate-800 mb-3">Về Startup</h4>
                                <p className="text-[14px] text-slate-600 leading-relaxed max-w-3xl">{startup.desc}</p>
                                <div className="flex flex-wrap gap-2 mt-5">
                                    {startup.tags.map((tag: string) => (
                                        <span key={tag} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[13px] font-bold text-slate-800 mb-4">Đội ngũ sáng lập</h4>
                                <div className="flex flex-wrap gap-4">
                                    {startup.team.map((member: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100 min-w-[240px] hover:border-slate-300 transition-all group">
                                            <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center text-sm font-black text-slate-500 group-hover:bg-[#e6cc4c] group-hover:text-white transition-all">
                                                {(member.name ?? "?").split(" ").pop()?.charAt(0)}
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
                            <span className="text-[12px] text-slate-400 font-medium">{startupDocs.length} tài liệu</span>
                        </div>
                        {docsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCcw className="w-4 h-4 text-slate-300 animate-spin" />
                                <span className="ml-2 text-[12px] text-slate-400">Đang tải...</span>
                            </div>
                        ) : startupDocs.length === 0 ? (
                            <div className="text-center py-8">
                                <FolderOpen className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                <p className="text-[13px] text-slate-400">Chưa có tài liệu nào được chia sẻ</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {startupDocs.map((doc) => {
                                    const docType = (doc.documentType ?? "").toLowerCase();
                                    const color = docType.includes("pitch") ? "text-red-500"
                                        : docType.includes("business") || docType.includes("financ") ? "text-green-500"
                                        : docType.includes("legal") ? "text-blue-500"
                                        : "text-slate-500";
                                    const label = docType.includes("pitch") ? "Pitch Deck"
                                        : docType.includes("business") ? "Business Plan"
                                        : docType.includes("financ") ? "Tài chính"
                                        : docType.includes("legal") ? "Pháp lý"
                                        : doc.documentType ?? "Khác";
                                    const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("vi-VN") : "—";

                                    return (
                                        <div key={doc.documentID} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-[#e6cc4c]/40 transition-all group">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:bg-[#e6cc4c]/10 transition-colors flex-shrink-0">
                                                    <FileText className={cn("w-5 h-5", color)} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[14px] font-bold text-slate-700 group-hover:text-[#171611] transition-colors truncate">{doc.title ?? "Untitled"}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{label} • {uploadDate} • v{doc.version ?? "1"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                                                {doc.fileUrl && (
                                                    <a
                                                        href={/\.pdf(\?|$)/i.test(doc.fileUrl)
                                                            ? doc.fileUrl
                                                            : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.fileUrl)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => { ViewDocument(doc.documentID).catch(() => {}); }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                                                        title="Xem tài liệu"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const token = localStorage.getItem("accessToken") ?? "";
                                                            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/${doc.documentID}/download`, {
                                                                headers: { Authorization: `Bearer ${token}` },
                                                            });
                                                            if (!res.ok) throw new Error("Download failed");
                                                            const blob = await res.blob();
                                                            const cd = res.headers.get("content-disposition");
                                                            const match = cd?.match(/filename="?(.+?)"?$/);
                                                            const fileName = match?.[1] ?? `${doc.title ?? "document"}.pdf`;
                                                            const url = URL.createObjectURL(blob);
                                                            const a = document.createElement("a");
                                                            a.href = url; a.download = fileName;
                                                            document.body.appendChild(a); a.click();
                                                            document.body.removeChild(a);
                                                            URL.revokeObjectURL(url);
                                                        } catch {
                                                            toast.error("Tải xuống thất bại");
                                                        }
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all"
                                                    title="Tải xuống"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
