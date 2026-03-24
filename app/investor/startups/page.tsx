"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Sparkles, Building2, MapPin, Target, Clock, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddToWatchlistModal } from "@/components/investor/add-to-watchlist-modal";

// Mock Data
const startups = [
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
        isHot: true
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
        isHot: true
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
        isHot: false
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
        isHot: false
    },
    {
        id: "SU-1005",
        name: "AgriSmart",
        industry: "AgriTech",
        stage: "Pre-Seed",
        location: "Cần Thơ, VN",
        target: "$150K",
        score: 72,
        desc: "Hệ thống giám sát và tự động hóa nhà màng nông nghiệp bằng IoT giá rẻ, tối ưu năng suất cây trồng nội địa.",
        activeDays: 60,
        logo: "AS",
        isHot: false
    },
    {
        id: "SU-1006",
        name: "FinFlow",
        industry: "FinTech",
        stage: "Series B",
        location: "Singapore",
        target: "$5.0M",
        score: 92,
        desc: "Nền tảng tín dụng B2B cung cấp luồng tiền linh hoạt cho các doanh nghiệp vừa và nhỏ khu vực Đông Nam Á.",
        activeDays: 2,
        logo: "FF",
        isHot: true
    }
];

const INDUSTRY_OPTIONS = ["SaaS & AI", "HealthTech", "FoodTech", "EdTech", "AgriTech", "FinTech", "CleanTech", "PropTech", "Blockchain", "IoT"];
const STAGE_OPTIONS = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];

const AVATAR_COLORS = [
    "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const labelCls = "block text-[12px] font-semibold text-slate-500 mb-2";
const checkCls = "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10 cursor-pointer accent-slate-900";

export default function StartupDiscoveryPage() {
    const [search, setSearch] = useState("");
    const [addingStartup, setAddingStartup] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [showFilter, setShowFilter] = useState(false);

    // Filter states
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [minScore, setMinScore] = useState(0);

    const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
        setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    const activeCount = selectedIndustries.length + selectedStages.length + (minScore > 0 ? 1 : 0);

    const clearAll = () => {
        setSelectedIndustries([]);
        setSelectedStages([]);
        setMinScore(0);
    };

    return (
        <div className="max-w-6xl mx-auto w-full space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                <h1 className="text-[20px] font-bold text-slate-900 mb-1">Khám phá Startup</h1>
                <p className="text-[13px] text-slate-500 mb-5">
                    Hệ sinh thái đang có <strong>52</strong> startup kêu gọi vốn. Khám phá các cơ hội đầu tư phù hợp với Thesis của bạn.
                </p>

                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm Tên công ty, Ngành nghề, Vị trí..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all"
                        />
                    </div>
                    <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all cursor-pointer outline-none"
                    >
                        <option value="Tất cả">Tất cả thư mục</option>
                        <option value="Phù hợp nhất (AI Match)">Phù hợp nhất (Phù hợp AI)</option>
                        <option value="Đang Trending">Đang Trending</option>
                        <option value="Mới triển khai (Pre-Seed/Seed)">Mới triển khai (Pre-Seed/Seed)</option>
                        <option value="Đang bùng nổ (Series A+)">Đang bùng nổ (Series A+)</option>
                    </select>
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={cn(
                            "w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-colors shrink-0 relative",
                            showFilter
                                ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        <Filter className="w-4 h-4" />
                        Bộ lọc
                        {activeCount > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold">
                                {activeCount}
                            </span>
                        )}
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilter && "rotate-180")} />
                    </button>
                </div>

                {/* Filter Panel - Collapsible */}
                <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    showFilter ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0 mt-0"
                )}>
                    <div className="overflow-hidden">
                        <div className="border border-slate-200/80 rounded-2xl bg-slate-50/50 p-5">
                            {/* Filter Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[13px] font-bold text-slate-700">Bộ lọc nâng cao</h3>
                                <div className="flex items-center gap-2">
                                    {activeCount > 0 && (
                                        <button onClick={clearAll} className="text-[12px] text-red-500 hover:text-red-600 font-medium transition-colors">
                                            Xoá tất cả
                                        </button>
                                    )}
                                    <button onClick={() => setShowFilter(false)} className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Industry */}
                                <div>
                                    <label className={labelCls}>Ngành nghề</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {INDUSTRY_OPTIONS.map(ind => (
                                            <label key={ind} className="flex items-center gap-2.5 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIndustries.includes(ind)}
                                                    onChange={() => toggleItem(selectedIndustries, ind, setSelectedIndustries)}
                                                    className={checkCls}
                                                />
                                                <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors">{ind}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Stage */}
                                <div>
                                    <label className={labelCls}>Giai đoạn</label>
                                    <div className="space-y-2">
                                        {STAGE_OPTIONS.map(stg => (
                                            <label key={stg} className="flex items-center gap-2.5 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStages.includes(stg)}
                                                    onChange={() => toggleItem(selectedStages, stg, setSelectedStages)}
                                                    className={checkCls}
                                                />
                                                <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors">{stg}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>


                                {/* AI Score */}
                                <div>
                                    <label className={labelCls}>Điểm AI tối thiểu</label>
                                    <div className="space-y-3">
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={minScore}
                                            onChange={e => setMinScore(Number(e.target.value))}
                                            className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-slate-900 cursor-pointer"
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400">0</span>
                                            <span className={cn(
                                                "text-[13px] font-bold px-2.5 py-0.5 rounded-lg",
                                                minScore >= 80 ? "bg-emerald-50 text-emerald-700" :
                                                minScore >= 50 ? "bg-amber-50 text-amber-700" :
                                                "bg-slate-100 text-slate-500"
                                            )}>
                                                {minScore > 0 ? `≥ ${minScore} điểm` : "Tất cả"}
                                            </span>
                                            <span className="text-[11px] text-slate-400">100</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Apply button */}
                            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-200/80">
                                <button onClick={clearAll} className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                    Đặt lại
                                </button>
                                <button
                                    onClick={() => setShowFilter(false)}
                                    className="px-5 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    Áp dụng bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Result Count */}
            {(() => {
                const q = search.toLowerCase();
                const filtered = startups.filter(s => {
                    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.industry.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
                    const matchIndustry = selectedIndustries.length === 0 || selectedIndustries.some(ind => s.industry.includes(ind));
                    const matchStage = selectedStages.length === 0 || selectedStages.includes(s.stage);
                    const matchScore = s.score >= minScore;
                    return matchSearch && matchIndustry && matchStage && matchScore;
                });
                const hasActiveFilters = search !== "" || selectedIndustries.length > 0 || selectedStages.length > 0 || minScore > 0;

                return (
                    <>
                        {/* Result count bar */}
                        <div className="flex items-center justify-between">
                            <p className="text-[13px] text-slate-500">
                                <span className="font-semibold text-[#0f172a]">{filtered.length}</span> startup phù hợp
                            </p>
                            {hasActiveFilters && (
                                <button onClick={() => { setSearch(""); clearAll(); }} className="text-[12px] text-slate-400 hover:text-slate-600 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        {/* Advisor-style Card Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                            {filtered.length === 0 && (
                                <div className="col-span-full py-16 text-center">
                                    <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-[15px] font-semibold text-slate-400">Không tìm thấy startup phù hợp</p>
                                    <p className="text-[13px] text-slate-400 mt-1">Thử mở rộng tiêu chí tìm kiếm hoặc xóa bộ lọc.</p>
                                    <button onClick={() => { setSearch(""); clearAll(); }} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-200 transition-colors">Xóa bộ lọc</button>
                                </div>
                            )}

                            {filtered.map(startup => {
                                const avatarGradient = getAvatarColor(startup.id);
                                return (
                                    <div key={startup.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 p-6">
                                        {/* Top row: Avatar + Info */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[20px] font-bold shrink-0 shadow-sm", avatarGradient)}>
                                                {startup.logo}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[15px] font-semibold text-slate-900">{startup.name}</span>
                                                    {startup.isHot && (
                                                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                                    )}
                                                    <span className="ml-auto flex-shrink-0 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-500">
                                                        {startup.stage} · {startup.target}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-slate-400 mt-0.5">{startup.industry} · {startup.location}</p>
                                                <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-2">{startup.desc}</p>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] font-medium text-emerald-700">{startup.stage}</span>
                                            <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-600">{startup.industry}</span>
                                            {startup.isHot && (
                                                <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-medium text-amber-700">Trending</span>
                                            )}
                                        </div>

                                        {/* Trust row */}
                                        <div className="flex items-center gap-1 text-[12px] text-slate-400 mb-3 flex-wrap">
                                            <Target className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="font-semibold text-slate-700">{startup.score}% Phù hợp</span>
                                            <span>·</span>
                                            <span>Raise: {startup.target}</span>
                                            <span>·</span>
                                            <span><MapPin className="w-3 h-3 inline" /> {startup.location}</span>
                                            <span>·</span>
                                            <span><Clock className="w-3 h-3 inline" /> {startup.activeDays} ngày gọi vốn</span>
                                        </div>

                                        {/* Score Widget */}
                                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/60 border border-amber-100 rounded-xl mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-[12px] font-bold text-slate-700">Điểm AI: {startup.score}/100</span>
                                            </div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[10px] font-bold",
                                                startup.score >= 85 ? "bg-emerald-100 text-emerald-700" :
                                                startup.score >= 75 ? "bg-amber-100 text-amber-700" :
                                                "bg-slate-100 text-slate-500"
                                            )}>
                                                {startup.score >= 85 ? "Rất phù hợp" : startup.score >= 75 ? "Phù hợp" : "Tiềm năng"}
                                            </span>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2.5">
                                            <Link
                                                href={`/investor/startups/${startup.id}`}
                                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors text-center"
                                            >
                                                Xem chi tiết
                                            </Link>
                                            <button 
                                                onClick={() => setAddingStartup(startup)}
                                                className="flex-1 py-2.5 rounded-xl bg-[#fdf8e6] border border-[#eec54e]/30 text-slate-800 text-[13px] font-semibold hover:bg-[#eec54e] transition-all"
                                            >
                                                Thêm vào danh sách
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                );
            })()}

            <AddToWatchlistModal 
                open={!!addingStartup} 
                onOpenChange={(open) => !open && setAddingStartup(null)} 
                startup={addingStartup} 
            />
        </div>
    );
}
