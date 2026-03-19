"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import {
  Heart,
  Search,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchStartups, AddToWatchlist } from "@/services/investor/investor.api";

/* ────────────────────────────────────────────────────────────────────
   Filter / sort constants
   ──────────────────────────────────────────────────────────────────── */
const INDUSTRIES = [
  "Tất cả lĩnh vực",
  "AI & Machine Learning",
  "FinTech",
  "HealthTech",
  "EdTech",
  "E-Commerce",
  "SaaS",
  "CleanTech",
  "AgriTech",
  "PropTech",
  "InsurTech",
];

const STAGES = [
  "Tất cả giai đoạn",
  "Idea",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
];

const FUNDING_STAGES = [
  "Tất cả vòng gọi vốn",
  "Bootstrapped",
  "Angel",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
];

type SortKey = "relevance" | "recent" | "ai_score" | "low_risk";
const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Phù hợp nhất", value: "relevance" },
  { label: "Mới cập nhật", value: "recent" },
  { label: "Điểm AI cao nhất", value: "ai_score" },
  { label: "Rủi ro thấp hơn", value: "low_risk" },
];

/* ────────────────────────────────────────────────────────────────────
   Mock data
   ──────────────────────────────────────────────────────────────────── */
const MOCK_STARTUPS: IStartupSearchItem[] = [
  { startupID: 1, companyName: "NeuralViet AI", oneLiner: "Nền tảng AI tự động hoá quy trình doanh nghiệp, giúp tiết kiệm 60% chi phí vận hành.", stage: "Seed", industry: "AI & Machine Learning", subIndustry: "Enterprise AI", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Seed", profileStatus: "Active", updatedAt: "2026-03-15T10:00:00Z" },
  { startupID: 2, companyName: "PayGo Finance", oneLiner: "Ví điện tử và giải pháp thanh toán không tiền mặt cho thị trường nông thôn Đông Nam Á.", stage: "Series A", industry: "FinTech", subIndustry: "Digital Payments", location: "Hà Nội", country: "Vietnam", logoURL: "", fundingStage: "Series A", profileStatus: "Active", updatedAt: "2026-03-12T08:30:00Z" },
  { startupID: 3, companyName: "MediScan", oneLiner: "Chẩn đoán hình ảnh y tế bằng AI, phát hiện sớm ung thư với độ chính xác 95%.", stage: "Pre-Seed", industry: "HealthTech", subIndustry: "Medical Imaging", location: "Đà Nẵng", country: "Vietnam", logoURL: "", fundingStage: "Angel", profileStatus: "Active", updatedAt: "2026-03-10T14:20:00Z" },
  { startupID: 4, companyName: "EduNova", oneLiner: "Nền tảng học tập cá nhân hoá dùng AI, adaptive learning cho học sinh K-12.", stage: "Seed", industry: "EdTech", subIndustry: "K-12 Learning", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Pre-Seed", profileStatus: "Active", updatedAt: "2026-03-08T09:15:00Z" },
  { startupID: 5, companyName: "GreenFarm IoT", oneLiner: "Hệ thống IoT giám sát và tự động hoá canh tác nông nghiệp thông minh.", stage: "Idea", industry: "AgriTech", subIndustry: "Smart Farming", location: "Cần Thơ", country: "Vietnam", logoURL: "", fundingStage: "Bootstrapped", profileStatus: "Draft", updatedAt: "2026-03-05T16:45:00Z" },
  { startupID: 6, companyName: "ShopeeX Logistics", oneLiner: "Giải pháp giao hàng last-mile bằng drone và xe tự hành cho thương mại điện tử.", stage: "Series A", industry: "E-Commerce", subIndustry: "Logistics", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Series A", profileStatus: "Active", updatedAt: "2026-03-14T11:30:00Z" },
  { startupID: 7, companyName: "CloudBase", oneLiner: "Nền tảng SaaS quản lý dữ liệu đám mây cho doanh nghiệp SME tại Việt Nam.", stage: "Seed", industry: "SaaS", subIndustry: "Cloud Infrastructure", location: "Hà Nội", country: "Vietnam", logoURL: "", fundingStage: "Seed", profileStatus: "Active", updatedAt: "2026-03-13T07:00:00Z" },
  { startupID: 8, companyName: "SolarVN Energy", oneLiner: "Giải pháp năng lượng mặt trời và pin lưu trữ cho hộ gia đình và doanh nghiệp nhỏ.", stage: "Series B", industry: "CleanTech", subIndustry: "Solar Energy", location: "Bình Dương", country: "Vietnam", logoURL: "", fundingStage: "Series B", profileStatus: "Active", updatedAt: "2026-03-11T13:00:00Z" },
  { startupID: 9, companyName: "PropMatch", oneLiner: "Kết nối chủ đầu tư bất động sản với nhà đầu tư, sử dụng AI matching.", stage: "Pre-Seed", industry: "PropTech", subIndustry: "Real Estate Marketplace", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Angel", profileStatus: "Active", updatedAt: "2026-03-09T15:30:00Z" },
  { startupID: 10, companyName: "InsureEasy", oneLiner: "Bảo hiểm số micro-insurance cho người lao động và freelancer tại Đông Nam Á.", stage: "Seed", industry: "InsurTech", subIndustry: "Micro Insurance", location: "Hà Nội", country: "Vietnam", logoURL: "", fundingStage: "Seed", profileStatus: "Active", updatedAt: "2026-03-07T10:45:00Z" },
  { startupID: 11, companyName: "VoiceAI Lab", oneLiner: "Nhận dạng giọng nói tiếng Việt, chatbot và trợ lý ảo cho doanh nghiệp.", stage: "Series A", industry: "AI & Machine Learning", subIndustry: "NLP / Voice", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Series A", profileStatus: "Active", updatedAt: "2026-03-16T09:00:00Z" },
  { startupID: 12, companyName: "WealthBot", oneLiner: "Robo-advisor quản lý tài sản cá nhân với AI, đầu tư tự động cho nhà đầu tư nhỏ lẻ.", stage: "Pre-Seed", industry: "FinTech", subIndustry: "WealthTech", location: "Đà Nẵng", country: "Vietnam", logoURL: "", fundingStage: "Pre-Seed", profileStatus: "Draft", updatedAt: "2026-03-06T12:00:00Z" },
];

/* ────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────── */
const MONOGRAM_PALETTES = [
  { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200/60" },
  { bg: "bg-sky-50",    text: "text-sky-600",   border: "border-sky-100/60" },
  { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100/60" },
  { bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100/60" },
  { bg: "bg-emerald-50",text: "text-emerald-600",border: "border-emerald-100/60" },
  { bg: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-100/60" },
  { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100/60" },
  { bg: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-100/60" },
];

function getMonogramPalette(id: number) {
  return MONOGRAM_PALETTES[id % MONOGRAM_PALETTES.length];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
}

/** Deterministic "AI score" for mock display — consistent per startupID */
function mockAiScore(id: number): number {
  return Math.round(62 + ((id * 17 + id * id * 3) % 29));
}

/** Investor signal to show on each card */
function getInvestorSignal(startup: IStartupSearchItem): { label: string; style: string } | null {
  const score = mockAiScore(startup.startupID);
  if (score >= 85) return { label: "Điểm AI cao", style: "text-emerald-700 bg-emerald-50 border-emerald-100/60" };
  if (["Series A", "Series B", "Series C+"].includes(startup.stage ?? ""))
    return { label: "Traction tốt", style: "text-sky-700 bg-sky-50 border-sky-100/60" };
  if (startup.profileStatus === "Active" && startup.fundingStage !== "Bootstrapped")
    return { label: "Đang gọi vốn", style: "text-violet-700 bg-violet-50/70 border-violet-100/60" };
  return null;
}

/** Check if stage and fundingStage are effectively the same label to avoid duplication */
function isSameStageAndFunding(stage: string | undefined, funding: string | undefined): boolean {
  if (!stage || !funding) return false;
  return stage.toLowerCase() === funding.toLowerCase();
}

/** How many days since updatedAt */
function daysSince(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function sortStartups(list: IStartupSearchItem[], key: SortKey): IStartupSearchItem[] {
  const copy = [...list];
  switch (key) {
    case "recent":
      return copy.sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime());
    case "ai_score":
      return copy.sort((a, b) => mockAiScore(b.startupID) - mockAiScore(a.startupID));
    case "low_risk":
      return copy.sort((a, b) => {
        const riskOrder = ["Series B", "Series A", "Seed", "Pre-Seed", "Angel", "Bootstrapped", "Idea"];
        return riskOrder.indexOf(a.fundingStage ?? "") - riskOrder.indexOf(b.fundingStage ?? "");
      });
    default:
      return copy; // relevance = original API order
  }
}

/* ════════════════════════════════════════════════════════════════════
   Main Page
   ════════════════════════════════════════════════════════════════════ */
export default function InvestorStartupsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả lĩnh vực");
  const [selectedStage, setSelectedStage]       = useState("Tất cả giai đoạn");
  const [selectedFunding, setSelectedFunding]   = useState("Tất cả vòng gọi vốn");
  const [searchQuery, setSearchQuery]           = useState("");
  const [sortKey, setSortKey]                   = useState<SortKey>("relevance");
  const [sortOpen, setSortOpen]                 = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [startups, setStartups]           = useState<IStartupSearchItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [page, setPage]                   = useState(1);
  const [paging, setPaging]               = useState<IPaging | null>(null);
  const [watchlistSet, setWatchlistSet]   = useState<Set<number>>(new Set());
  const [watchlistLoading, setWatchlistLoading] = useState<number | null>(null);
  const pageSize = 20;

  /* close sort dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchStartups = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = (await SearchStartups(p, pageSize)) as unknown as IBackendRes<IPaginatedRes<IStartupSearchItem>>;
      if (res.success && res.data && (res.data.items ?? []).length > 0) {
        setStartups(res.data.items ?? []);
        setPaging(res.data.paging);
      } else {
        setStartups(MOCK_STARTUPS);
        setPaging({ page: 1, pageSize: 20, totalItems: MOCK_STARTUPS.length, totalPages: 1 });
      }
    } catch {
      setStartups(MOCK_STARTUPS);
      setPaging({ page: 1, pageSize: 20, totalItems: MOCK_STARTUPS.length, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStartups(page); }, [page, fetchStartups]);

  const filtered = sortStartups(
    startups.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        s.companyName.toLowerCase().includes(q) ||
        s.oneLiner?.toLowerCase().includes(q) ||
        s.industry?.toLowerCase().includes(q);
      const matchCategory = selectedCategory === "Tất cả lĩnh vực" || s.industry === selectedCategory;
      const matchStage    = selectedStage    === "Tất cả giai đoạn"     || s.stage        === selectedStage;
      const matchFunding  = selectedFunding  === "Tất cả vòng gọi vốn"  || s.fundingStage === selectedFunding;
      return matchSearch && matchCategory && matchStage && matchFunding;
    }),
    sortKey
  );

  const activeFilterCount = [
    selectedCategory !== "Tất cả lĩnh vực",
    selectedStage    !== "Tất cả giai đoạn",
    selectedFunding  !== "Tất cả vòng gọi vốn",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("Tất cả lĩnh vực");
    setSelectedStage("Tất cả giai đoạn");
    setSelectedFunding("Tất cả vòng gọi vốn");
    setSearchQuery("");
  };

  /* Result insight counts */
  const recentCount = filtered.filter((s) => (daysSince(s.updatedAt) ?? 999) <= 7).length;
  const activeCount = filtered.filter((s) => s.profileStatus === "Active").length;

  const handleAddToWatchlist = async (e: React.MouseEvent, startup: IStartupSearchItem) => {
    e.stopPropagation();
    if (watchlistSet.has(startup.startupID)) return;
    setWatchlistLoading(startup.startupID);
    try {
      await AddToWatchlist({ startupId: startup.startupID, watchReason: "Thêm từ trang khám phá", priority: "Medium" });
      setWatchlistSet((prev) => new Set(prev).add(startup.startupID));
    } catch { /* silent */ } finally {
      setWatchlistLoading(null);
    }
  };

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? "Sắp xếp";

  return (
    <InvestorShell>
      <div className="space-y-7">
        {/* ─── Page Header ─── */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-[-0.025em] leading-tight">
              Khám phá Startup
            </h1>
            <p className="text-[14px] text-slate-400 mt-1.5 font-normal">
              Tìm kiếm và đánh giá cơ hội đầu tư trong hệ sinh thái AI startup Việt Nam
            </p>
          </div>

          {/* ── Sort control (replaces filter toggle on desktop) ── */}
          <div ref={sortRef} className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 h-[42px] rounded-xl text-[13px] font-medium bg-white text-slate-700 border border-slate-200 hover:border-slate-300 shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-[15px] h-[15px] text-slate-400" />
              {sortLabel}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-20 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden w-48 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em]">Sắp xếp theo</p>
                </div>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortKey(opt.value); setSortOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-[13px] transition-colors font-normal flex items-center justify-between ${
                      sortKey === opt.value
                        ? "bg-[#0f172a] text-white font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    {opt.label}
                    {sortKey === opt.value && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Search Bar ─── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên công ty, lĩnh vực, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 h-12 bg-white border border-slate-200 rounded-xl text-[14px] text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/8 focus:border-slate-300/80 transition-all font-normal shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ─── Main Layout: Filter Sidebar + Results ─── */}
        <div className="flex gap-7 items-start">

          {/* ════ Filter Sidebar ════ */}
          <div className="w-[240px] shrink-0 space-y-2">
            <FilterGroup
              icon={<Building2 className="w-[14px] h-[14px]" />}
              title="Lĩnh vực"
              items={INDUSTRIES}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <FilterGroup
              icon={<TrendingUp className="w-[14px] h-[14px]" />}
              title="Giai đoạn"
              items={STAGES}
              selected={selectedStage}
              onSelect={setSelectedStage}
            />
            <FilterGroup
              icon={<DollarSign className="w-[14px] h-[14px]" />}
              title="Vòng gọi vốn"
              items={FUNDING_STAGES}
              selected={selectedFunding}
              onSelect={setSelectedFunding}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full text-center text-[12px] font-medium text-slate-400 hover:text-slate-600 py-2 transition-colors"
              >
                Xoá tất cả bộ lọc ({activeFilterCount})
              </button>
            )}
          </div>

          {/* ════ Results Area ════ */}
          <div className="flex-1 min-w-0">

            {/* Result meta bar */}
            <div className="flex items-center justify-between mb-5">
              {loading ? (
                <p className="text-[13px] text-slate-400 font-normal">Đang tải...</p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-slate-500 font-normal">
                      Hiển thị{" "}
                      <span className="text-[#0f172a] font-semibold">{filtered.length}</span>{" "}
                      startup
                    </span>
                    {recentCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-md bg-emerald-50 text-[11px] font-medium text-emerald-700 border border-emerald-100/60">
                        <Zap className="w-2.5 h-2.5" />
                        {recentCount} mới tuần này
                      </span>
                    )}
                    {activeCount > 0 && activeCount < filtered.length && (
                      <span className="inline-flex items-center px-2 py-[2px] rounded-md bg-slate-50 text-[11px] font-medium text-slate-500 border border-slate-100">
                        {activeCount} đang hoạt động
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {selectedCategory !== "Tất cả lĩnh vực" && <FilterChip label={selectedCategory} onRemove={() => setSelectedCategory("Tất cả lĩnh vực")} />}
                      {selectedStage    !== "Tất cả giai đoạn"     && <FilterChip label={selectedStage}    onRemove={() => setSelectedStage("Tất cả giai đoạn")} />}
                      {selectedFunding  !== "Tất cả vòng gọi vốn"  && <FilterChip label={selectedFunding}  onRemove={() => setSelectedFunding("Tất cả vòng gọi vốn")} />}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-[13px] text-red-600 mb-5 font-medium">
                {error}
                <button onClick={() => fetchStartups(page)} className="ml-2 text-red-700 underline underline-offset-2 hover:no-underline font-semibold">Thử lại</button>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin mb-3" />
                <p className="text-[14px] font-normal">Đang tải danh sách startup...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-800 font-semibold text-[16px] mb-1">Không tìm thấy startup nào</p>
                <p className="text-slate-400 text-[14px]">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    Xoá bộ lọc
                  </button>
                )}
              </div>
            ) : (
              /* ─── Cards Grid ─── */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                {filtered.map((startup) => {
                  const palette   = getMonogramPalette(startup.startupID);
                  const aiScore   = mockAiScore(startup.startupID);
                  const signal    = getInvestorSignal(startup);
                  const isWatched = watchlistSet.has(startup.startupID);
                  const isNew     = (daysSince(startup.updatedAt) ?? 999) <= 7;
                  const showFunding = startup.fundingStage && !isSameStageAndFunding(startup.stage, startup.fundingStage);

                  return (
                    <article
                      key={startup.startupID}
                      onClick={() => router.push(`/investor/startups/${startup.startupID}`)}
                      className="group bg-white rounded-2xl border border-slate-200/70 hover:border-slate-300 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] transition-all duration-300 cursor-pointer flex flex-col"
                    >
                      {/* Card body */}
                      <div className="p-5 pb-4 flex-1">

                        {/* Row 1: Logo + Name + Watchlist icon */}
                        <div className="flex items-start gap-3.5 mb-3">
                          {/* Monogram */}
                          {startup.logoURL ? (
                            <img src={startup.logoURL} alt={startup.companyName} className="w-[44px] h-[44px] rounded-[10px] object-cover border border-slate-100 shrink-0" />
                          ) : (
                            <div className={`w-[44px] h-[44px] rounded-[10px] ${palette.bg} border ${palette.border} flex items-center justify-center shrink-0`}>
                              <span className={`${palette.text} font-semibold text-[14px] tracking-tight select-none`}>
                                {getInitials(startup.companyName)}
                              </span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-2 mb-[3px]">
                              <h3 className="font-semibold text-[15px] text-[#0f172a] tracking-[-0.01em] truncate leading-snug">
                                {startup.companyName}
                              </h3>
                              {startup.profileStatus === "Active" && (
                                <span title="Đang hoạt động"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /></span>
                              )}
                              {isNew && (
                                <span className="inline-flex items-center px-1.5 py-[1px] rounded-md bg-[#0f172a] text-[9px] font-bold text-[#e6cc4c] uppercase tracking-[0.05em] shrink-0">New</span>
                              )}
                            </div>

                            {/* Investor signal row — the key "match" insight */}
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                <Sparkles className="w-2.5 h-2.5 text-[#e6cc4c]" />
                                AI {aiScore}
                              </span>
                              {signal && (
                                <>
                                  <span className="text-slate-200 text-[10px]">·</span>
                                  <span className={`inline-flex items-center px-1.5 py-[1px] rounded-md text-[10px] font-semibold border ${signal.style}`}>
                                    {signal.label}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Watchlist button */}
                          <button
                            onClick={(e) => handleAddToWatchlist(e, startup)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                              isWatched
                                ? "text-rose-500 bg-rose-50 border border-rose-100/60"
                                : "text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100"
                            }`}
                            title={isWatched ? "Đã thêm vào watchlist" : "Thêm vào watchlist"}
                          >
                            {watchlistLoading === startup.startupID
                              ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                              : <Heart className={`w-4 h-4 ${isWatched ? "fill-rose-500" : ""}`} />
                            }
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-[13px] text-slate-500 leading-[1.65] font-normal line-clamp-2 mb-3.5">
                          {startup.oneLiner || "Chưa có mô tả"}
                        </p>

                        {/* Tags row — deduplicated, visually tiered */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Primary: Industry (most prominent) */}
                          {startup.industry && (
                            <span className="inline-flex items-center px-2.5 py-[3px] rounded-md bg-slate-900/[0.04] text-[11px] font-medium text-slate-700 border border-slate-900/[0.06]">
                              {startup.industry}
                            </span>
                          )}
                          {/* Secondary: Stage */}
                          {startup.stage && (
                            <span className="inline-flex items-center px-2.5 py-[3px] rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100/70">
                              {startup.stage}
                            </span>
                          )}
                          {/* Tertiary: Funding only if different from Stage */}
                          {showFunding && (
                            <span className="inline-flex items-center px-2.5 py-[3px] rounded-md text-[11px] font-medium text-violet-600 bg-violet-50/60 border border-violet-100/60">
                              {startup.fundingStage}
                            </span>
                          )}
                          {/* Sub-industry — quieter */}
                          {startup.subIndustry && (
                            <span className="inline-flex items-center px-2.5 py-[3px] rounded-md text-[11px] font-normal text-slate-400 bg-transparent">
                              {startup.subIndustry}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/80 bg-slate-50/30 rounded-b-2xl">
                        {startup.location ? (
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-normal min-w-0">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{startup.location}</span>
                          </div>
                        ) : <div />}

                        {/* CTA — ghost button style, intentional action */}
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/investor/startups/${startup.startupID}`); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#0f172a] border border-slate-200 bg-white hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a] transition-all duration-200 shrink-0 group/btn shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                        >
                          Xem hồ sơ
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* ─── Pagination ─── */}
            {paging && paging.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Trước
                </button>
                <div className="flex items-center gap-0.5 mx-2">
                  {Array.from({ length: Math.min(paging.totalPages, 5) }, (_, i) => {
                    const n = i + 1;
                    return (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-all ${
                          page === n ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-800"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                  {paging.totalPages > 5 && (
                    <>
                      <span className="text-slate-300 px-1 text-[12px]">···</span>
                      <button
                        onClick={() => setPage(paging.totalPages)}
                        className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-all ${page === paging.totalPages ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-800"}`}
                      >
                        {paging.totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  disabled={page >= paging.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  Sau <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </InvestorShell>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════════════════════════════ */

function FilterGroup({
  icon, title, items, selected, onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100">
        <span className="text-slate-400">{icon}</span>
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.05em]">{title}</h3>
      </div>
      {/* Options */}
      <div className="p-1.5 space-y-0.5">
        {items.map((item, idx) => {
          const isActive = selected === item;
          const isAll    = idx === 0;
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`w-full text-left px-3 py-[6px] rounded-lg text-[13px] transition-all duration-100 ${
                isActive
                  ? "bg-[#0f172a] text-white font-medium"
                  : isAll
                  ? "text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-normal"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-normal"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-lg bg-slate-100 text-[12px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
    >
      {label}
      <X className="w-3 h-3 text-slate-400" />
    </button>
  );
}
