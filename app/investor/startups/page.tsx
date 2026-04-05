"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Building2,
  MapPin,
  Target,
  Clock,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectStartupModal } from "@/components/investor/connect-startup-modal";
import { SearchStartups } from "@/services/investor/investor.api";
import { GetSentConnections } from "@/services/connection/connection.api";

const INDUSTRY_OPTIONS = [
  "SaaS & AI",
  "HealthTech",
  "FoodTech",
  "EdTech",
  "AgriTech",
  "FinTech",
  "CleanTech",
  "PropTech",
  "Blockchain",
  "IoT",
];

const STAGE_OPTIONS = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
];

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600",
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
];

type StartupCard = {
  id: string;
  name: string;
  industry: string;
  stage: string;
  location: string;
  target: string;
  score: number;
  desc: string;
  activeDays: number;
  logo: string;
  isHot: boolean;
};

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const labelCls = "block text-[12px] font-semibold text-slate-500 mb-2";
const checkCls =
  "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10 cursor-pointer accent-slate-900";

export default function StartupDiscoveryPage() {
  const [startups, setStartups] = useState<StartupCard[]>([]);
  const [myConnections, setMyConnections] = useState<IConnectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [addingStartup, setAddingStartup] = useState<StartupCard | null>(null);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(0);

  const fetchConnections = async () => {
    try {
      const res = await GetSentConnections(1, 100);
      if (res.success && res.data) {
        setMyConnections((res.data as any).data || res.data.items || res.data || []);
      }
    } catch (error) {
      console.error("Error fetching connections", error);
    }
  };

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res: any = await SearchStartups(1, 50);
        const isSuccess = res.isSuccess || res.success || res.statusCode === 200;

        if (isSuccess) {
          const items = res.data?.data || res.data?.items || res.items || [];
          const mapped: StartupCard[] = items.map((apiItem: any) => ({
            id: apiItem.startupID?.toString() || "0",
            name: apiItem.companyName || "Unknown",
            industry: apiItem.industryName || apiItem.industry || "Other",
            stage: apiItem.stage || "Pre-Seed",
            location: apiItem.country || "VN",
            target: "N/A",
            score: apiItem.aiScore || 0,
            desc: apiItem.tagline || apiItem.subIndustry || "Chưa có thông tin mô tả",
            activeDays: 0,
            logo:
              apiItem.logoURL ||
              (apiItem.companyName || "U").substring(0, 2).toUpperCase(),
            isHot: (apiItem.aiScore || 0) > 80,
          }));
          setStartups(mapped);
        }
      } catch (error) {
        console.error("Error fetching startups", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartups();
    fetchConnections();
  }, []);

  const toggleItem = (
    list: string[],
    item: string,
    setter: (value: string[]) => void,
  ) => {
    setter(list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]);
  };

  const activeCount =
    selectedIndustries.length + selectedStages.length + (minScore > 0 ? 1 : 0);

  const clearAll = () => {
    setSelectedIndustries([]);
    setSelectedStages([]);
    setMinScore(0);
  };

  const query = search.toLowerCase();
  const filtered = startups.filter((startup) => {
    const matchSearch =
      !query ||
      startup.name.toLowerCase().includes(query) ||
      startup.industry.toLowerCase().includes(query) ||
      startup.location.toLowerCase().includes(query) ||
      startup.desc.toLowerCase().includes(query);

    const matchIndustry =
      selectedIndustries.length === 0 ||
      selectedIndustries.some((industry) => startup.industry.includes(industry));

    const matchStage =
      selectedStages.length === 0 || selectedStages.includes(startup.stage);

    const matchScore = startup.score >= minScore;

    return matchSearch && matchIndustry && matchStage && matchScore;
  });

  const hasActiveFilters =
    search !== "" ||
    selectedIndustries.length > 0 ||
    selectedStages.length > 0 ||
    minScore > 0;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <h1 className="text-[20px] font-bold text-slate-900 mb-1">Khám phá Startup</h1>
        <p className="text-[13px] text-slate-500 mb-5">
          Hệ sinh thái đang có <strong>52</strong> startup kêu gọi vốn. Khám phá
          các cơ hội đầu tư phù hợp với thesis của bạn.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên công ty, ngành nghề, vị trí..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all"
            />
          </div>

          <select
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all cursor-pointer outline-none"
          >
            <option value="Tất cả">Tất cả thư mục</option>
            <option value="Phù hợp nhất (AI Match)">Phù hợp nhất (Phù hợp AI)</option>
            <option value="Đang Trending">Đang Trending</option>
            <option value="Mới triển khai (Pre-Seed/Seed)">
              Mới triển khai (Pre-Seed/Seed)
            </option>
            <option value="Đang bùng nổ (Series A+)">
              Đang bùng nổ (Series A+)
            </option>
          </select>

          <button
            type="button"
            onClick={() => setShowFilter((previous) => !previous)}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            Bộ lọc nâng cao
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#eec54e]/15 text-[#8a6a02] text-[11px] font-semibold">
                {activeCount}
              </span>
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                showFilter && "rotate-180",
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            showFilter ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0 mt-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="border border-slate-200/80 rounded-2xl bg-slate-50/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-slate-700">
                  Bộ lọc nâng cao
                </h3>
                <div className="flex items-center gap-2">
                  {activeCount > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-[12px] text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Xóa tất cả
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilter(false)}
                    className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Ngành nghề</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <label
                        key={industry}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIndustries.includes(industry)}
                          onChange={() =>
                            toggleItem(
                              selectedIndustries,
                              industry,
                              setSelectedIndustries,
                            )
                          }
                          className={checkCls}
                        />
                        <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors">
                          {industry}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Giai đoạn</label>
                  <div className="space-y-2">
                    {STAGE_OPTIONS.map((stage) => (
                      <label
                        key={stage}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStages.includes(stage)}
                          onChange={() =>
                            toggleItem(selectedStages, stage, setSelectedStages)
                          }
                          className={checkCls}
                        />
                        <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors">
                          {stage}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Điểm AI tối thiểu</label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={minScore}
                      onChange={(event) => setMinScore(Number(event.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-slate-900 cursor-pointer"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">0</span>
                      <span
                        className={cn(
                          "text-[13px] font-bold px-2.5 py-0.5 rounded-lg",
                          minScore >= 80
                            ? "bg-emerald-50 text-emerald-700"
                            : minScore >= 50
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {minScore > 0 ? `= ${minScore} điểm` : "Tất cả"}
                      </span>
                      <span className="text-[11px] text-slate-400">100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-200/80">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
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

      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-500">
          <span className="font-semibold text-[#0f172a]">{filtered.length}</span>{" "}
          startup phù hợp
        </p>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch("");
              clearAll();
            }}
            className="text-[12px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {isLoading && (
          <div className="col-span-full py-16 text-center">
            <p className="text-[15px] font-semibold text-slate-400">
              Đang tải danh sách startup...
            </p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-slate-400">
              Không tìm thấy startup phù hợp
            </p>
            <p className="text-[13px] text-slate-400 mt-1">
              Thử mở rộng tiêu chí tìm kiếm hoặc xóa bộ lọc.
            </p>
            <button
              onClick={() => {
                setSearch("");
                clearAll();
              }}
              className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-200 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {!isLoading &&
          filtered.map((startup) => {
            const avatarGradient = getAvatarColor(startup.id);
            const hasConnected = myConnections.some(
              (connection: any) =>
                String(connection.receiverId) === startup.id ||
                String(connection.startupId) === startup.id,
            );

            return (
              <div
                key={startup.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[20px] font-bold shrink-0 shadow-sm",
                      avatarGradient,
                    )}
                  >
                    {startup.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[15px] font-semibold text-slate-900">
                        {startup.name}
                      </span>
                      {startup.isHot && (
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="ml-auto flex-shrink-0 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-500">
                        {startup.stage} • {startup.target}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      {startup.industry} • {startup.location}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-2">
                      {startup.desc}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px] font-medium text-emerald-700">
                    {startup.stage}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-600">
                    {startup.industry}
                  </span>
                  {startup.isHot && (
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-medium text-amber-700">
                      Trending
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[12px] text-slate-400 mb-3 flex-wrap">
                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-slate-700">
                    {startup.score}% Phù hợp
                  </span>
                  <span>•</span>
                  <span>Raise: {startup.target}</span>
                  <span>•</span>
                  <span>
                    <MapPin className="w-3 h-3 inline" /> {startup.location}
                  </span>
                  <span>•</span>
                  <span>
                    <Clock className="w-3 h-3 inline" /> {startup.activeDays} ngày gọi vốn
                  </span>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/60 border border-amber-100 rounded-xl mb-4">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[12px] font-bold text-slate-700">
                      Điểm AI: {startup.score}/100
                    </span>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold",
                      startup.score >= 85
                        ? "bg-emerald-100 text-emerald-700"
                        : startup.score >= 75
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {startup.score >= 85
                      ? "Rất phù hợp"
                      : startup.score >= 75
                        ? "Phù hợp"
                        : "Tiềm năng"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/investor/startups/${startup.id}`}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors text-center"
                  >
                    Xem chi tiết
                  </Link>
                  <button
                    onClick={() => setAddingStartup(startup)}
                    disabled={hasConnected}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                      hasConnected
                        ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-[#fdf8e6] border border-[#eec54e]/30 text-slate-800 hover:bg-[#eec54e]",
                    )}
                  >
                    {hasConnected ? "Đã gửi kết nối" : "Gửi yêu cầu kết nối"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <ConnectStartupModal
        open={!!addingStartup}
        onOpenChange={(open) => !open && setAddingStartup(null)}
        startup={addingStartup}
        onSuccess={() => {
          fetchConnections();
          setAddingStartup(null);
        }}
      />
    </div>
  );
}
