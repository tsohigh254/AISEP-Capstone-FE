"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  BadgeCheck,
} from "lucide-react";
import { cn, normalizeScore } from "@/lib/utils";
import { ConnectStartupModal } from "@/components/investor/connect-startup-modal";
import { SearchStartups, GetMasterIndustries, GetMasterStages } from "@/services/investor/investor.api";

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
  industryId: number | null;
  stageId: number | null;
  stage: string;
  location: string;
  target: string;
  raised: string;
  score: number;
  matchLabel: string | null;
  desc: string;
  activeDays: number | null;
  logo: string;
  isHot: boolean;
  isVerified: boolean;
  connectionStatus: string | null;
  connectionId: number | null;
  canRequestConnection: boolean;
};

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function hasImageSource(value: string) {
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = typeof value === "string" ? value.trim() : "";
    if (text) return text;
  }
  return "";
}

const labelCls = "block text-[12px] font-semibold text-slate-500 mb-2";
const checkCls =
  "w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/10 cursor-pointer accent-slate-900";

export default function StartupDiscoveryPage() {
  const [startups, setStartups] = useState<StartupCard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [addingStartup, setAddingStartup] = useState<StartupCard | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  // Dynamic master data
  const [industryOptions, setIndustryOptions] = useState<{ id: number; name: string; parentId: number | null }[]>([]);
  const [stageOptions, setStageOptions] = useState<{ id: number; name: string }[]>([]);

  const [selectedIndustryIds, setSelectedIndustryIds] = useState<number[]>([]);
  const [selectedStageIds, setSelectedStageIds] = useState<number[]>([]);
  const [minScore, setMinScore] = useState(0);

  // Debounce search input → trigger server-side fetch
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch master data once
  useEffect(() => {
    GetMasterIndustries().then((res: any) => {
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : [];
      setIndustryOptions(list.map((i: any) => ({ id: i.industryId ?? i.industryID, name: i.industryName, parentId: i.parentIndustryId ?? i.parentIndustryID ?? null })));
    }).catch(() => {});
    GetMasterStages().then((res: any) => {
      const data = res?.data ?? res;
      const raw = Array.isArray(data) ? data : [];
      // Chỉ lấy 4 giai đoạn trong scope: Idea, PreSeed, Seed, Growth
      setStageOptions(raw
        .map((s: any) => ({ id: s.stageId ?? s.stageID ?? s.id, name: s.stageName ?? s.name ?? "" }))
        .filter((stage: { id: number; name: string }) => Number.isFinite(stage.id) && stage.name.trim().length > 0));
    }).catch(() => {});
  }, []);

  // Re-fetch startups when search/filters change
  useEffect(() => {
    const fetchStartups = async () => {
      setIsLoading(true);
      try {
        // Only pass one industryId at a time (API supports single); if multiple selected, filter client-side
        const res: any = await SearchStartups(
          debouncedSearch || undefined,
          1,
          100,
          selectedIndustryIds.length >= 1 ? selectedIndustryIds[0] : undefined,
          selectedStageIds.length === 1 ? selectedStageIds[0] : undefined,
        );
        const isSuccess = res.isSuccess || res.success || res.statusCode === 200;

        if (isSuccess) {
          const items = res.data?.items || res.data?.data || res.items || [];
          const total = res.data?.paging?.totalItems ?? items.length;
          setTotalCount(total);
          const formatMoney = (v: number | null | undefined) => {
            if (v == null) return null;
            if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
            if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
            if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
            return v.toLocaleString('vi-VN');
          };
          const industryById = new Map<number, { id: number; name: string; parentId: number | null }>();
          const industryByName = new Map<string, { id: number; name: string; parentId: number | null }>();
          industryOptions.forEach((option) => {
            industryById.set(option.id, option);
            industryByName.set(option.name.trim().toLowerCase(), option);
          });

          const mapped: StartupCard[] = items.map((apiItem: any) => {
            const explicitSubIndustry = firstText(
              apiItem.subIndustryName,
              apiItem.subIndustry,
              apiItem.SubIndustryName,
              apiItem.SubIndustry
            );
            const explicitIndustry = firstText(
              apiItem.industryName,
              apiItem.IndustryName,
              apiItem.industry,
              apiItem.Industry
            );

            const parentIndustry = firstText(
              apiItem.parentIndustryName,
              apiItem.parentIndustry,
              apiItem.ParentIndustryName,
              apiItem.ParentIndustry,
              explicitSubIndustry ? explicitIndustry : ""
            );
            const childIndustry = firstText(
              explicitSubIndustry,
              explicitIndustry
            );
            const fallbackIndustry = firstText(
              explicitIndustry,
              explicitSubIndustry
            );
            const subIndustryId = Number(
              apiItem.subIndustryId ?? apiItem.subIndustryID ?? apiItem.SubIndustryId ?? 0
            );
            const industryNameKey = (childIndustry || fallbackIndustry).trim().toLowerCase();
            const inferredChild =
              (Number.isFinite(subIndustryId) && subIndustryId > 0 ? industryById.get(subIndustryId) : undefined) ||
              (industryNameKey ? industryByName.get(industryNameKey) : undefined);
            const inferredParent =
              inferredChild?.parentId != null ? industryById.get(inferredChild.parentId) : undefined;

            const parentIndustryDisplay = parentIndustry || inferredParent?.name || "";
            const childIndustryDisplay = childIndustry || inferredChild?.name || fallbackIndustry || "";
            const normalizedParent = parentIndustryDisplay.trim().toLowerCase();
            const normalizedChild = childIndustryDisplay.trim().toLowerCase();
            const industryDisplay =
              parentIndustryDisplay &&
              childIndustryDisplay &&
              normalizedParent !== normalizedChild
                ? `${parentIndustryDisplay} / ${childIndustryDisplay}`
                : parentIndustryDisplay || childIndustryDisplay || "Other";

            const descriptionText = firstText(
              apiItem.oneLiner,
              apiItem.OneLiner,
              apiItem.tagline,
              apiItem.Tagline,
              apiItem.description,
              apiItem.Description,
              apiItem.companyDescription,
              apiItem.CompanyDescription,
              apiItem.startupDescription,
              apiItem.StartupDescription,
              apiItem.subIndustryName,
              apiItem.subIndustry,
              apiItem.SubIndustryName,
              apiItem.SubIndustry
            );

            return {
            id: (apiItem.startupID ?? apiItem.startupId ?? apiItem.StartupId ?? 0).toString(),
            name: apiItem.companyName || apiItem.startupName || apiItem.StartupName || "Unknown",
            industry: industryDisplay,
            industryId: apiItem.industryId ?? apiItem.industryID ?? null,
            stageId: apiItem.stageId ?? apiItem.stageID ?? null,
            stage: apiItem.stageName || apiItem.stage || "",
            location: apiItem.country || "VN",
            target: formatMoney(apiItem.fundingAmountSought) ? `$${formatMoney(apiItem.fundingAmountSought)}` : "Chưa cập nhật",
            raised: formatMoney(apiItem.currentFundingRaised) ? `$${formatMoney(apiItem.currentFundingRaised)}` : "Chưa cập nhật",
            score: normalizeScore(apiItem?.aiScore ?? apiItem?.score ?? apiItem?.matchScore ?? apiItem?.overallScore ?? apiItem?.overall_score) ?? 0,
            matchLabel:
              firstText(
                apiItem.matchLabel,
                apiItem.MatchLabel,
                apiItem.fitLabel,
                apiItem.FitLabel,
                apiItem.recommendationLabel,
                apiItem.RecommendationLabel
              ) || null,
            desc: descriptionText || `Lĩnh vực: ${industryDisplay}`,
            activeDays: apiItem.createdAt
              ? Math.max(0, Math.floor((Date.now() - new Date(apiItem.createdAt).getTime()) / 86_400_000))
              : null,
            logo:
              apiItem.logoURL ||
              (apiItem.companyName || "U").substring(0, 2).toUpperCase(),
            isHot: (apiItem.aiScore || 0) > 80,
            isVerified: apiItem.profileStatus === "Approved",
            connectionStatus: (apiItem.connectionStatus as string) ?? null,
            connectionId: (apiItem.connectionId as number) ?? null,
            canRequestConnection: (apiItem.canRequestConnection as boolean) ?? true,
          };
          });
          setStartups(mapped);
        }
      } catch (error) {
        console.error("Error fetching startups", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartups();
  }, [debouncedSearch, selectedIndustryIds, selectedStageIds, refreshKey, industryOptions]);


  const toggleIndustry = (id: number) =>
    setSelectedIndustryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAllChildren = (parentId: number) => {
    const childIds = industryOptions.filter((i) => i.parentId === parentId).map((i) => i.id);
    const allSelected = childIds.every((id) => selectedIndustryIds.includes(id));
    setSelectedIndustryIds((prev) =>
      allSelected
        ? prev.filter((x) => !childIds.includes(x))
        : [...prev.filter((x) => !childIds.includes(x)), ...childIds]
    );
  };

  const toggleStage = (id: number) =>
    setSelectedStageIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const activeCount = selectedIndustryIds.length + selectedStageIds.length + (minScore > 0 ? 1 : 0);

  const clearAll = () => {
    setSelectedIndustryIds([]);
    setSelectedStageIds([]);
    setMinScore(0);
  };

  // Client-side filter for multi-select industry/stage (when >1 selected, API only handles 1)
  const filtered = startups.filter((startup) => {
    const matchIndustry =
      selectedIndustryIds.length <= 1 || // handled server-side if <=1
      (startup.industryId != null && selectedIndustryIds.includes(startup.industryId));
    const matchStage =
      selectedStageIds.length <= 1 || // handled server-side if <=1
      (startup.stageId != null && selectedStageIds.includes(startup.stageId));
    const matchScore = startup.score >= minScore;
    return matchIndustry && matchStage && matchScore;
  });

  const hasActiveFilters = search !== "" || selectedIndustryIds.length > 0 || selectedStageIds.length > 0 || minScore > 0;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <h1 className="text-[20px] font-bold text-slate-900 mb-1">Khám phá Startup</h1>
        <p className="text-[13px] text-slate-500 mb-5">
          Hệ sinh thái đang có <strong>{totalCount > 0 ? totalCount : "—"}</strong> startup kêu gọi vốn. Khám phá
          các cơ hội đầu tư phù hợp với thesis của bạn.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên công ty hoặc mô tả..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all"
            />
          </div>

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
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                    {industryOptions
                      .filter((ind) => ind.parentId === null)
                      .map((parent) => {
                        const children = industryOptions.filter((c) => c.parentId === parent.id);
                        const allChildSelected = children.length > 0 && children.every((c) => selectedIndustryIds.includes(c.id));
                        return (
                          <div key={parent.id}>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                {parent.name}
                              </span>
                              {children.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => selectAllChildren(parent.id)}
                                  className="text-[10px] text-[#8a6a02] hover:underline"
                                >
                                  {allChildSelected ? "Bỏ chọn" : "Tất cả"}
                                </button>
                              )}
                            </div>
                            <div className="mt-1.5 space-y-1.5">
                              {children.length > 0 ? (
                                children.map((child) => (
                                  <label key={child.id} className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={selectedIndustryIds.includes(child.id)}
                                      onChange={() => toggleIndustry(child.id)}
                                      className={checkCls}
                                    />
                                    <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors">
                                      {child.name}
                                    </span>
                                  </label>
                                ))
                              ) : (
                                // Leaf parent (no children) — selectable directly
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={selectedIndustryIds.includes(parent.id)}
                                    onChange={() => toggleIndustry(parent.id)}
                                    className={checkCls}
                                  />
                                  <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors">
                                    {parent.name}
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Giai đoạn</label>
                  <div className="space-y-2">
                    {stageOptions.map((stage) => (
                      <label
                        key={stage.id}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStageIds.includes(stage.id)}
                          onChange={() => toggleStage(stage.id)}
                          className={checkCls}
                        />
                        <span className="text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors">
                          {stage.name}
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
            const connStatus = (startup.connectionStatus || "").toUpperCase();
            const isAccepted = connStatus === "ACCEPTED" || connStatus === "IN_DISCUSSION" || connStatus === "INDISCUSSION";
            const isPending = connStatus === "REQUESTED";
            const hasActiveConnection = isAccepted || isPending;

            return (
              <div
                key={startup.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={cn(
                      "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br text-white shadow-sm",
                      avatarGradient,
                    )}
                  >
                    {hasImageSource(startup.logo) ? (
                      <Image
                        src={startup.logo}
                        alt={startup.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[20px] font-bold">
                        {startup.logo}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[15px] font-semibold text-slate-900">
                        {startup.name}
                      </span>
                      {startup.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      )}
                      {startup.isHot && (
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="ml-auto flex-shrink-0 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-500">
                        {startup.stage}
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
                    Điểm phù hợp: {startup.score}%
                  </span>
                  <span>•</span>
                  <span>Raise: {startup.target}</span>
                  <span>•</span>
                  <span>
                    <MapPin className="w-3 h-3 inline" /> {startup.location}
                  </span>
                  {startup.activeDays != null && (
                    <>
                      <span>•</span>
                      <span>
                        <Clock className="w-3 h-3 inline" /> {startup.activeDays} ngày
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/60 border border-amber-100 rounded-xl mb-4">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[12px] font-bold text-slate-700">
                      Điểm AI: {startup.score}/100
                    </span>
                  </div>
                  {startup.matchLabel && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      {startup.matchLabel}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/investor/startups/${startup.id}`}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors text-center"
                  >
                    Xem chi tiết
                  </Link>
                  {isAccepted ? (
                    <Link
                      href={`/investor/messaging?connectionId=${startup.connectionId}`}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold hover:bg-emerald-100 transition-all text-center"
                    >
                      Đã kết nối · Nhắn tin
                    </Link>
                  ) : (
                    <button
                      onClick={() => setAddingStartup(startup)}
                      disabled={isPending}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                        isPending
                          ? "bg-amber-50 border border-amber-200 text-amber-600 cursor-not-allowed"
                          : "bg-[#fdf8e6] border border-[#eec54e]/30 text-slate-800 hover:bg-[#eec54e]",
                      )}
                    >
                      {isPending ? "Đang chờ phản hồi" : "Gửi yêu cầu kết nối"}
                    </button>
                  )}
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
          setRefreshKey((k) => k + 1);
          setAddingStartup(null);
        }}
      />
    </div>
  );
}
