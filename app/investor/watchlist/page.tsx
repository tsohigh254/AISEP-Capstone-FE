"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Bookmark, Search, UserMinus, Sparkles, Building2, TrendingUp, Handshake, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetInvestorWatchlist, GetInvestorProfile, RemoveFromWatchlist } from "@/services/investor/investor.api";
import { toast } from "sonner";

export default function WatchlistPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState<IWatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvestor, setIsInvestor] = useState<boolean | null>(null);
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
          const normalized = (items as any[]).map((raw) => ({
            watchlistId: raw?.watchlistID ?? raw?.watchlistId ?? null,
            startupID: raw?.startupID ?? raw?.startupId ?? null,
            startupName: raw?.companyName ?? raw?.startupName ?? null,
            industry: raw?.industry ?? null,
            stage: raw?.stage ?? null,
            logoURL: raw?.logoURL ?? null,
            priority: raw?.priority ?? null,
            addedAt: raw?.addedAt ?? null,
          }));
          setWatchlist(normalized as any);
        } else {
          toast.error("Không thể tải danh sách theo dõi");
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("GetInvestorWatchlist error:", err);
        toast.error("Lỗi khi tải danh sách theo dõi");
      } finally {
        setIsLoading(false);
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
        await fetchWatchlist();
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
      } catch (e) {
        // ignore
      }
    };

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "watchlist-refresh") fetchWatchlist();
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
                  searchTerm ? w.startupName.toLowerCase().includes(searchTerm.trim().toLowerCase()) : true,
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
                        <span className="font-black leading-none">—</span>
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
                      {/* Removed 'Xem chi tiết' button per request; show only Connect + Unfollow */}
                      <Link href={`/investor/startups/${item.startupID}`}>
                        <button title="Kết nối" className="text-[#C8A000] hover:text-[#E6B800] transition-colors p-2 rounded-lg hover:bg-[#e6cc4c]/10 bg-[#e6cc4c]/5 border border-[#e6cc4c]/20 shadow-sm">
                          <Handshake className="w-4 h-4" />
                        </button>
                      </Link>
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
    </div>
  );
}
