"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Bookmark, Search, UserMinus, Sparkles, Building2, TrendingUp, Handshake, Loader2, MessageCircleMore } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetInvestorWatchlist, GetInvestorProfile, GetStartupById, RemoveFromWatchlist, SearchStartups } from "@/services/investor/investor.api";
import { GetEvaluationHistory, GetEvaluationReport } from "@/services/ai/ai.api";
import { GetReceivedConnections, GetSentConnections } from "@/services/connection/connection.api";
import { ConnectStartupModal } from "@/components/investor/connect-startup-modal";
import { toast } from "sonner";

const INVESTOR_WATCHLIST_LOAD_ERROR_TOAST_ID = "investor-watchlist-load-error";

function normalizeScore(raw: any): number | null {
  if (raw == null) return null;
  let n: number;
  if (typeof raw === "string") {
    const matched = raw.match(/-?\d+(?:\.\d+)?/);
    if (!matched) return null;
    n = Number(matched[0]);
  } else {
    n = Number(raw);
  }
  if (!Number.isFinite(n)) return null;
  if (n <= 1) return Math.round(n * 100);
  if (n <= 10) return Math.round(n * 10);
  return Math.round(n);
}

function extractAiScore(source: any): number | null {
  if (!source) return null;
  return normalizeScore(
    source?.aiScore ??
    source?.AiScore ??
    source?.AIScore ??
    source?.ai_score ??
    source?.score ??
    source?.Score ??
    source?.overallScore ??
    source?.OverallScore ??
    source?.overall_score ??
    source?.latestAiScore ??
    source?.latestScore ??
    source?.startupPotentialScore ??
    source?.startupScore ??
    source?.matchScore ??
    source?.MatchScore ??
    source?.startup?.aiScore ??
    source?.startup?.AiScore ??
    source?.startup?.score ??
    source?.ai?.score ??
    source?.ai?.aiScore ??
    source?.ai?.overallScore ??
    source?.aiEvaluation?.overallScore ??
    source?.overall_result?.overall_score ??
    source?.overall_result?.overallScore ??
    source?.report?.overall_result?.overall_score ??
    source?.report?.overall_result?.overallScore ??
    source?.report?.overallScore ??
    source?.report?.overall_score ??
    source?.data?.overall_result?.overall_score ??
    source?.data?.overall_result?.overallScore ??
    source?.data?.report?.overall_result?.overall_score ??
    source?.data?.report?.overall_result?.overallScore ??
    source?.data?.report?.overallScore ??
    source?.data?.report?.overall_score ??
    source?.potentialScore ??
    source?.PotentialScore ??
    source?.latestEvaluation?.overallScore ??
    source?.latestEvaluation?.overall_score ??
    source?.latestEvaluation?.report?.overall_result?.overall_score ??
    source?.startup?.potentialScore ??
    source?.startup?.latestEvaluation?.overallScore ??
    source?.startup?.latestEvaluation?.overall_score
  );
}

function extractLatestHistoryScore(items: any[]): number | null {
  if (!Array.isArray(items) || items.length === 0) return null;

  const isCompleted = (item: any) => {
    const s = String(item?.status ?? item?.Status ?? item?.statusName ?? item?.StatusName ?? "").toLowerCase();
    return s === "completed" || s === "partial_completed";
  };

  const getTime = (item: any) => {
    const t = new Date(item?.generatedAt ?? item?.calculatedAt ?? item?.createdAt ?? item?.updatedAt ?? item?.created_at ?? item?.updated_at ?? 0).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const sorted = [...items].filter(isCompleted).sort((a, b) => getTime(b) - getTime(a));
  for (const item of sorted) {
    const score = extractAiScore(item);
    if (score != null && score > 0) return score;
  }
  return null;
}

function extractLatestCompletedRunId(items: any[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;

  const isCompleted = (item: any) => {
    const s = String(item?.status ?? item?.Status ?? item?.statusName ?? item?.StatusName ?? "").toLowerCase();
    return s === "completed" || s === "partial_completed";
  };

  const getTime = (item: any) => {
    const t = new Date(item?.generatedAt ?? item?.calculatedAt ?? item?.createdAt ?? item?.updatedAt ?? item?.created_at ?? item?.updated_at ?? 0).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const sorted = [...items].filter(isCompleted).sort((a, b) => getTime(b) - getTime(a));
  if (sorted.length === 0) return 0;
  const latest = sorted[0];
  return Number(latest?.evaluationId ?? latest?.runId ?? latest?.RunId ?? latest?.id ?? latest?.Id ?? latest?.run_id ?? 0) || 0;
}

type WatchlistRow = IWatchlistItem & { aiScore?: number | null };
type ConnectionStatus = "none" | "pending" | "accepted";
type ConnectionMeta = { status: ConnectionStatus; connectionId: number | null };

function normalizeConnectionStatusValue(status?: string | null): ConnectionStatus {
  const normalized = (status ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (normalized === "REQUESTED" || normalized === "PENDING") return "pending";
  if (normalized === "ACCEPTED" || normalized === "IN_DISCUSSION" || normalized === "INDISCUSSION") {
    return "accepted";
  }
  return "none";
}

function extractConnectionIdValue(source: any): number | null {
  const raw = Number(source?.connectionID ?? source?.connectionId ?? source?.ConnectionID ?? null);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

function buildLatestConnectionMap(items: IConnectionItem[]): Record<number, ConnectionMeta> {
  const map = new Map<number, ConnectionMeta & { sortTime: number }>();

  for (const item of items) {
    const startupId = Number(item?.startupID ?? 0);
    if (!startupId) continue;

    const status = normalizeConnectionStatusValue(item?.connectionStatus);
    if (status === "none") continue;

    const sortTime = new Date(item?.respondedAt || item?.requestedAt || 0).getTime() || 0;
    const current = map.get(startupId);

    if (!current || sortTime >= current.sortTime) {
      map.set(startupId, {
        status,
        connectionId: extractConnectionIdValue(item),
        sortTime,
      });
    }
  }

  return Object.fromEntries(
    Array.from(map.entries()).map(([startupId, meta]) => [
      startupId,
      { status: meta.status, connectionId: meta.connectionId },
    ]),
  ) as Record<number, ConnectionMeta>;
}

export default function WatchlistPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvestor, setIsInvestor] = useState<boolean | null>(null);
  const [connectionMap, setConnectionMap] = useState<Record<number, ConnectionMeta>>({});
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<WatchlistRow | null>(null);
  const [removingMap, setRemovingMap] = useState<Record<string, boolean>>({});
  const setRemoving = (key: string, v: boolean) => setRemovingMap((s) => ({ ...s, [key]: v }));
  const [confirmMap, setConfirmMap] = useState<Record<string, boolean>>({});
  const setConfirm = (key: string, v: boolean) => setConfirmMap((s) => ({ ...s, [key]: v }));


  useEffect(() => {
    let bc: BroadcastChannel | null = null;

    const fetchWatchlist = async () => {
      setIsLoading(true);
      try {
        const res = await GetInvestorWatchlist(1, 50);
        if (res?.isSuccess) {
          // support multiple backend shapes: res.data.data, res.data.items, res.items, or res.data as array
          let items: any[] = [];
          if (Array.isArray(res.data)) items = res.data as any[];
          else if (Array.isArray((res.data as any)?.data)) items = (res.data as any).data;
          else if (Array.isArray(res.data?.items)) items = res.data.items;
          else if (Array.isArray((res as any)?.items)) items = (res as any).items;
          else items = [];
          // Normalize casing from backend DTOs to frontend-friendly camelCase
          let normalized: WatchlistRow[] = (items as any[]).map((raw) => ({
            watchlistId: raw?.watchlistID ?? raw?.watchlistId ?? null,
            startupID: raw?.startupID ?? raw?.startupId ?? raw?.startup?.startupID ?? raw?.startup?.startupId ?? null,
            startupName: raw?.companyName ?? raw?.startupName ?? raw?.startup?.companyName ?? raw?.startup?.startupName ?? null,
            industry: raw?.industry ?? raw?.startup?.industry ?? raw?.startup?.industryName ?? null,
            stage: raw?.stage ?? raw?.startup?.stage ?? null,
            logoURL: raw?.logoURL ?? raw?.startup?.logoURL ?? null,
            priority: raw?.priority ?? null,
            addedAt: raw?.addedAt ?? raw?.createdAt ?? raw?.startup?.addedAt ?? raw?.startup?.createdAt ?? null,
            aiScore: extractAiScore(raw),
          }));

          // Fallback: if watchlist payload doesn't include AI score, enrich by startup detail.
          const missingScoreRows = normalized.filter((x) => (x.aiScore == null || x.aiScore <= 0) && Number(x.startupID) > 0);
          if (missingScoreRows.length > 0) {
            const scoreByStartupId = new Map<number, number>();
            const details = await Promise.allSettled(
              missingScoreRows.map((row) => GetStartupById(Number(row.startupID)) as any)
            );

            for (let i = 0; i < details.length; i++) {
              const r = details[i];
              const startupId = Number(missingScoreRows[i]?.startupID);
              if (r.status !== "fulfilled") continue;
              const payload = (r.value as any)?.data ?? r.value;
              const score = extractAiScore(payload);
              if (score != null) scoreByStartupId.set(startupId, score);
            }

            normalized = normalized.map((row) => {
              const sid = Number(row.startupID);
              if (row.aiScore != null && row.aiScore > 0) return row;
              const enriched = scoreByStartupId.get(sid);
              return { ...row, aiScore: enriched ?? row.aiScore };
            });

            const stillMissingBySearch = normalized.filter((x) => (x.aiScore == null || x.aiScore <= 0) && Number(x.startupID) > 0);
            if (stillMissingBySearch.length > 0) {
              const maxPages = 4;
              for (let page = 1; page <= maxPages; page++) {
                const r = await SearchStartups(undefined, page, 100) as any;
                const isSuccess = r?.isSuccess || r?.success || r?.statusCode === 200;
                if (!isSuccess) continue;

                const items = r?.data?.items || r?.data?.data || r?.items || [];
                if (!Array.isArray(items) || items.length === 0) continue;

                for (const row of stillMissingBySearch) {
                  const sid = Number(row?.startupID);
                  if (!sid || scoreByStartupId.has(sid)) continue;
                  const matched = items.find((x: any) => Number(x?.startupID ?? x?.startupId ?? x?.StartupID ?? 0) === sid);
                  const score = extractAiScore(matched);
                  if (score != null) scoreByStartupId.set(sid, score);
                }
              }

              normalized = normalized.map((row) => {
                const sid = Number(row.startupID);
                if (row.aiScore != null && row.aiScore > 0) return row;
                const enriched = scoreByStartupId.get(sid);
                return { ...row, aiScore: enriched ?? row.aiScore };
              });
            }

            const stillMissingRows = normalized.filter((x) => (x.aiScore == null || x.aiScore <= 0) && Number(x.startupID) > 0);
            if (stillMissingRows.length > 0) {
              const histories = await Promise.allSettled(
                stillMissingRows.map((row) => GetEvaluationHistory(Number(row.startupID)) as any)
              );

              for (let i = 0; i < histories.length; i++) {
                const r = histories[i];
                const sid = Number(stillMissingRows[i]?.startupID);
                if (r.status !== "fulfilled") continue;
                const historyItems = (r.value as any)?.data ?? r.value ?? [];
                const score = extractLatestHistoryScore(historyItems);
                if (score != null) scoreByStartupId.set(sid, score);

                if (score == null || score <= 0) {
                  const latestRunId = extractLatestCompletedRunId(historyItems);
                  if (latestRunId > 0) {
                    try {
                      const reportRes = await GetEvaluationReport(latestRunId) as any;
                      const reportPayload = reportRes?.data?.report ?? reportRes?.data ?? reportRes;
                      const reportScore = extractAiScore(reportPayload);
                      if (reportScore != null) scoreByStartupId.set(sid, reportScore);
                    } catch {
                      // ignore report fallback failure
                    }
                  }
                }
              }

              normalized = normalized.map((row) => {
                const sid = Number(row.startupID);
                if (row.aiScore != null && row.aiScore > 0) return row;
                const enriched = scoreByStartupId.get(sid);
                return { ...row, aiScore: enriched ?? row.aiScore };
              });
            }
          }

          setWatchlist(normalized as any);
        } else {
          toast.error("Không thể tải danh sách theo dõi", {
            id: INVESTOR_WATCHLIST_LOAD_ERROR_TOAST_ID,
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("GetInvestorWatchlist error:", err);
        toast.error("Lỗi khi tải danh sách theo dõi", {
          id: INVESTOR_WATCHLIST_LOAD_ERROR_TOAST_ID,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchConnections = async () => {
      try {
        const [sentRes, receivedRes] = await Promise.all([
          GetSentConnections(1, 200) as any,
          GetReceivedConnections(1, 200) as any,
        ]);

        const getItems = (res: any): IConnectionItem[] => {
          if (!res?.isSuccess && !res?.success) return [];
          const data = res?.data as any;
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.items)) return data.items;
          return [];
        };

        setConnectionMap(buildLatestConnectionMap([...getItems(sentRes), ...getItems(receivedRes)]));
      } catch (err) {
        console.error("GetConnections error:", err);
      }
    };

    const init = async () => {
      setIsLoading(true);
      try {
        const prof = await GetInvestorProfile();
        if (!prof?.isSuccess) {
          setIsInvestor(false);
          setIsLoading(false);
          return;
        }
        setIsInvestor(true);
        await Promise.all([fetchWatchlist(), fetchConnections()]);
      } catch (e) {
        setIsInvestor(false);
        setIsLoading(false);
      }
    };

    init();

    const onMessage = (ev: MessageEvent) => {
      try {
        if (ev?.data?.type === "refresh") {
          fetchWatchlist();
        }
        if (ev?.data?.type === "refresh" || ev?.data?.type === "connections-refresh") {
          fetchConnections();
        }
      } catch (e) {
        // ignore
      }
    };

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "watchlist-refresh") fetchWatchlist();
      if (ev.key === "connections-refresh") fetchConnections();
    };

    if (typeof window !== "undefined") {
      try {
        if ((window as any).BroadcastChannel) {
          bc = new BroadcastChannel("watchlist-updates");
          bc.addEventListener("message", onMessage);
        } else {
          window.addEventListener("storage", onStorage);
        }
      } catch (e) {
        // ignore subscription errors
      }
    }

    return () => {
      try {
        if (bc) {
          bc.removeEventListener("message", onMessage);
          bc.close();
        } else {
          window.removeEventListener("storage", onStorage);
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const selectedStartupModalData = selectedStartup
    ? {
        id: Number(selectedStartup.startupID),
        name: selectedStartup.startupName,
        industry: selectedStartup.industry,
        stage: selectedStartup.stage,
        logo: selectedStartup.logoURL,
      }
    : null;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-16 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#e6cc4c]" />
            <h1 className="text-2xl font-bold text-[#171611]">Danh sách theo dõi</h1>
          </div>
          <p className="text-sm text-neutral-muted mt-1">Quản lý và theo dõi các startup bạn quan tâm để không bỏ lỡ cơ hội đầu tư.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Tìm trong danh sách..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-xl outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f8f6] border-b border-neutral-surface">
              <tr className="text-[10px] uppercase text-neutral-muted font-bold tracking-widest">
                <th className="px-6 py-4 tracking-[0.1em]">STARTUP & LĨNH VỰC</th>
                <th className="px-6 py-4 tracking-[0.1em]">GIAI ĐOẠN</th>
                <th className="px-6 py-4 tracking-[0.1em]">ĐIỂM AI</th>
                <th className="px-6 py-4 tracking-[0.1em]">LÝ DO THEO DÕI</th>
                <th className="px-6 py-4 tracking-[0.1em]">TRẠNG THÁI</th>
                <th className="px-6 py-4 text-right pr-6 tracking-[0.1em]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-surface">
              {(() => {
                const filtered = watchlist.filter((w) =>
                  searchTerm ? (w.startupName ?? "").toLowerCase().includes(searchTerm.trim().toLowerCase()) : true,
                );

                if (isLoading) {
                  return (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-[#e6cc4c]" />
                          <span className="text-sm font-medium text-neutral-500">Đang tải...</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm font-medium text-neutral-500">
                        Danh sách theo dõi hiện đang trống. Khám phá thêm startup để theo dõi!
                      </td>
                    </tr>
                  );
                }

                return filtered.map((item) => (
                  <tr key={item.watchlistId} className="hover:bg-[#f8f8f6]/50 transition-colors group text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-neutral-100 shadow-sm flex-shrink-0 flex items-center justify-center text-sm font-black text-slate-500">
                          {item.logoURL
                            ? <img src={item.logoURL} alt={item.startupName} className="w-full h-full object-cover" />
                            : (item.startupName?.charAt(0)?.toUpperCase() ?? "-")}
                        </div>
                        <div>
                          <Link href={`/investor/startups/${item.startupID}`} className="text-sm font-bold text-[#171611] hover:text-[#C8A000] transition-colors line-clamp-1">
                            {item.startupName}
                          </Link>
                          <p className="text-xs text-neutral-muted font-medium flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" /> {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#171611] flex items-center gap-2 whitespace-nowrap">
                        <TrendingUp className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-[#171611] font-semibold">{item.stage ?? "—"}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 bg-[#e6cc4c]/10 text-[#C8A000] px-2.5 py-1.5 rounded-lg border border-[#e6cc4c]/20 w-fit">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="font-black leading-none">{item.aiScore != null ? item.aiScore : "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[240px]">
                      <div className="bg-[#f8f8f6] p-3 rounded-xl border border-neutral-100">
                        <p className="text-[12px] text-[#171611] leading-relaxed font-medium italic">{item.priority ?? "—"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border whitespace-nowrap text-neutral-600 bg-neutral-50 border-neutral-100">Lưu lúc</span>
                      <p className="text-[10px] text-neutral-400 mt-1 italic font-medium whitespace-nowrap">{new Date(item.addedAt).toLocaleDateString("vi-VN")}</p>
                    </td>
                    <td className="px-6 py-4 text-right pr-6 space-x-2">
                      {(() => {
                        const connection = connectionMap[Number(item.startupID)] ?? { status: "none" as const, connectionId: null };

                        if (connection.status === "accepted") {
                          return (
                            <Link href={`/investor/messaging${connection.connectionId ? `?connectionId=${connection.connectionId}` : ""}`}>
                              <button
                                title="Đã kết nối · Nhắn tin"
                                className="text-emerald-700 hover:text-emerald-800 transition-colors p-2 rounded-lg hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 shadow-sm"
                              >
                                <MessageCircleMore className="w-4 h-4" />
                              </button>
                            </Link>
                          );
                        }

                        if (connection.status === "pending") {
                          return (
                            <button
                              title="Yêu cầu kết nối đang chờ phản hồi"
                              onClick={() => toast.info("Yêu cầu kết nối với startup này đang chờ phản hồi.")}
                              className="text-amber-600 hover:text-amber-700 transition-colors p-2 rounded-lg hover:bg-amber-100 bg-amber-50 border border-amber-200 shadow-sm"
                            >
                              <Handshake className="w-4 h-4" />
                            </button>
                          );
                        }

                        return (
                          <button
                            title="Đề nghị kết nối"
                            onClick={() => {
                              setSelectedStartup(item);
                              setShowConnectModal(true);
                            }}
                            className="text-[#C8A000] hover:text-[#E6B800] transition-colors p-2 rounded-lg hover:bg-[#e6cc4c]/10 bg-[#e6cc4c]/5 border border-[#e6cc4c]/20 shadow-sm"
                          >
                            <Handshake className="w-4 h-4" />
                          </button>
                        );
                      })()}
                      {confirmMap[String(item.watchlistId ?? item.startupID ?? item.startupName ?? "")] ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setConfirm(String(item.watchlistId ?? item.startupID ?? item.startupName ?? ""), false)} className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-all">Hủy</button>
                          <button
                            onClick={async () => {
                              const key = String(item.watchlistId ?? item.startupID ?? item.startupName ?? Math.random());
                              setRemoving(key, true);
                              try {
                                const sid = Number(item.startupID ?? 0);
                                const del = await RemoveFromWatchlist(sid);
                                if (del?.isSuccess) {
                                  setWatchlist((w) => w.filter((x) => x.watchlistId !== item.watchlistId));
                                  try {
                                    if ((window as any).BroadcastChannel) {
                                      const bc = new BroadcastChannel("watchlist-updates");
                                      bc.postMessage({ type: "refresh" });
                                      bc.close();
                                    } else {
                                      localStorage.setItem("watchlist-refresh", Date.now().toString());
                                    }
                                  } catch (e) {}
                                  toast.success("Đã bỏ theo dõi");
                                } else {
                                  toast.error(del?.message ?? "Không thể bỏ theo dõi");
                                }
                              } catch (err) {
                                // eslint-disable-next-line no-console
                                console.error("RemoveFromWatchlist error:", err);
                                toast.error("Lỗi khi bỏ theo dõi");
                              } finally {
                                setRemoving(key, false);
                                setConfirm(String(item.watchlistId ?? item.startupID ?? item.startupName ?? ""), false);
                              }
                            }}
                            className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-all"
                          >
                            {removingMap[String(item.watchlistId ?? item.startupID ?? item.startupName ?? "")] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bỏ theo dõi"}
                          </button>
                        </div>
                      ) : (
                        <button
                          title="Bỏ theo dõi"
                          onClick={() => setConfirm(String(item.watchlistId ?? item.startupID ?? item.startupName ?? Math.random()), true)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            removingMap[String(item.watchlistId ?? item.startupID ?? item.startupName ?? "")] ? "text-neutral-400 bg-red-50" : "text-neutral-400 hover:text-red-600 hover:bg-red-50"
                          )}
                        >
                          {removingMap[String(item.watchlistId ?? item.startupID ?? item.startupName ?? "")] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserMinus className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
      <ConnectStartupModal
        open={showConnectModal}
        onOpenChange={(open) => {
          setShowConnectModal(open);
          if (!open) setSelectedStartup(null);
        }}
        startup={selectedStartupModalData}
        onSuccess={() => {
          void (async () => {
            try {
              const [sentRes, receivedRes] = await Promise.all([
                GetSentConnections(1, 200) as any,
                GetReceivedConnections(1, 200) as any,
              ]);

              const getItems = (res: any): IConnectionItem[] => {
                if (!res?.isSuccess && !res?.success) return [];
                const data = res?.data as any;
                if (Array.isArray(data)) return data;
                if (Array.isArray(data?.data)) return data.data;
                if (Array.isArray(data?.items)) return data.items;
                return [];
              };

              setConnectionMap(buildLatestConnectionMap([...getItems(sentRes), ...getItems(receivedRes)]));
            } catch {
              // non-blocking
            }
          })();
        }}
      />
    </div>
  );
}
