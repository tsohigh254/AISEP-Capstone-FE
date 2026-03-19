"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import {
  Download,
  Eye,
  Heart,
  Send,
  Clock,
  Loader2,
  MapPin,
  ArrowUpRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GetInvestorWatchlist } from "@/services/investor/investor.api";

const MONOGRAM_PALETTES = [
  { bg: "bg-slate-100", text: "text-slate-600" },
  { bg: "bg-sky-50", text: "text-sky-600" },
  { bg: "bg-violet-50", text: "text-violet-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-rose-50", text: "text-rose-600" },
  { bg: "bg-indigo-50", text: "text-indigo-600" },
  { bg: "bg-teal-50", text: "text-teal-600" },
];

function getMonogramPalette(id: number) {
  return MONOGRAM_PALETTES[id % MONOGRAM_PALETTES.length];
}

const MOCK_WATCHLIST: IWatchlistItem[] = [
  { watchlistID: 1, startupID: 1, companyName: "NeuralViet AI", oneLiner: "Nền tảng AI tự động hoá quy trình doanh nghiệp Việt Nam.", industry: "AI & Machine Learning", stage: "Seed", location: "Hồ Chí Minh", logoURL: "", watchReason: "Tiềm năng tăng trưởng cao", priority: "High", addedAt: "2026-03-14T10:00:00Z" },
  { watchlistID: 2, startupID: 2, companyName: "PayGo Finance", oneLiner: "Ví điện tử cho thị trường nông thôn Đông Nam Á.", industry: "FinTech", stage: "Series A", location: "Hà Nội", logoURL: "", watchReason: "Thị trường mới nổi", priority: "Medium", addedAt: "2026-03-12T08:00:00Z" },
  { watchlistID: 3, startupID: 3, companyName: "MediScan", oneLiner: "Chẩn đoán hình ảnh y tế bằng AI, phát hiện sớm ung thư.", industry: "HealthTech", stage: "Pre-Seed", location: "Đà Nẵng", logoURL: "", watchReason: "Công nghệ đột phá", priority: "High", addedAt: "2026-03-10T14:00:00Z" },
  { watchlistID: 4, startupID: 7, companyName: "CloudBase", oneLiner: "Nền tảng SaaS quản lý dữ liệu đám mây cho SME.", industry: "SaaS", stage: "Seed", location: "Hà Nội", logoURL: "", watchReason: "SaaS metrics tốt", priority: "Medium", addedAt: "2026-03-08T09:00:00Z" },
];

export default function InvestorWatchlistPage() {
  const router = useRouter();
  const [showHistory, setShowHistory] = useState(false);
  const [items, setItems] = useState<IWatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState<IPaging | null>(null);
  const pageSize = 20;

  const fetchWatchlist = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = (await GetInvestorWatchlist(p, pageSize)) as unknown as IBackendRes<IPaginatedRes<IWatchlistItem>>;
      if (res.success && res.data && (res.data.items ?? []).length > 0) {
        setItems(res.data.items);
        setPaging(res.data.paging);
      } else {
        setItems(MOCK_WATCHLIST);
        setPaging({ page: 1, pageSize: 20, totalItems: MOCK_WATCHLIST.length, totalPages: 1 });
      }
    } catch {
      setItems(MOCK_WATCHLIST);
      setPaging({ page: 1, pageSize: 20, totalItems: MOCK_WATCHLIST.length, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWatchlist(page); }, [page, fetchWatchlist]);

  const handleRemove = (id: number) => {
    setItems(items.filter((item) => item.watchlistID !== id));
  };

  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  const priorityStyle = (p: string) => {
    if (p === "High") return "text-rose-600 bg-rose-50 border-rose-100/60";
    if (p === "Medium") return "text-amber-600 bg-amber-50 border-amber-100/60";
    return "text-slate-500 bg-slate-50 border-slate-100";
  };

  return (
    <InvestorShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-[-0.02em] leading-tight">Watchlist</h1>
            <p className="text-[15px] text-slate-500 mt-1.5 font-normal">Startup bạn đang theo dõi và quan tâm</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all ${
                showHistory ? "bg-[#0f172a] text-white border-[#0f172a] shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <Clock className="w-4 h-4" />
              {showHistory ? "Watchlist hiện tại" : "Lịch sử"}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-white text-slate-600 border border-slate-200 hover:border-slate-300 shadow-sm transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 text-[13px] text-red-600 font-medium">
            {error}
            <button onClick={() => fetchWatchlist(page)} className="ml-2 text-red-700 underline underline-offset-2 hover:no-underline font-semibold">Thử lại</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin mb-3" />
            <p className="text-[14px] font-normal">Đang tải watchlist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-800 font-semibold text-[16px] mb-1">Chưa có startup nào</p>
            <p className="text-slate-400 text-[14px]">Thêm startup vào watchlist từ trang Khám phá</p>
            <button onClick={() => router.push("/investor/startups")} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors">
              Khám phá Startup
            </button>
          </div>
        ) : !showHistory ? (
          /* ── Card View ── */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {items.map((item) => {
              const palette = getMonogramPalette(item.startupID);
              return (
                <article key={item.watchlistID} className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-300">
                  <div className="p-5 pb-4">
                    <div className="flex items-start gap-3.5 mb-3">
                      {item.logoURL ? (
                        <img src={item.logoURL} alt={item.companyName} className="w-11 h-11 rounded-xl object-cover border border-slate-100" />
                      ) : (
                        <div className={`w-11 h-11 rounded-xl ${palette.bg} flex items-center justify-center`}>
                          <span className={`${palette.text} font-semibold text-[14px]`}>{getInitials(item.companyName)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-semibold text-[15px] text-slate-900 tracking-[-0.01em] truncate leading-tight">{item.companyName}</h3>
                        <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-[1.6] font-normal">{item.oneLiner}</p>
                      </div>
                      <button onClick={() => handleRemove(item.watchlistID)} className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0 mt-0.5" title="Xoá khỏi watchlist">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {item.industry && <span className="inline-flex items-center px-2 py-[3px] rounded-md bg-slate-50 text-[11px] font-medium text-slate-600 border border-slate-100">{item.industry}</span>}
                      {item.stage && <span className="inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100/60">{item.stage}</span>}
                      {item.priority && <span className={`inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium border ${priorityStyle(item.priority)}`}>{item.priority}</span>}
                    </div>

                    {item.watchReason && (
                      <p className="text-[12px] text-slate-400 font-normal mb-2">
                        <span className="font-medium text-slate-500">Lý do:</span> {item.watchReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40 rounded-b-2xl">
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Thêm {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => router.push(`/investor/startups/${item.startupID}`)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        Chi tiết
                      </button>
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors">
                        <Send className="w-3.5 h-3.5" />
                        Kết nối
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* ── History Table ── */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-[14px] font-semibold text-slate-800">Lịch sử Watchlist</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const palette = getMonogramPalette(item.startupID);
                return (
                  <div key={item.watchlistID} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${palette.bg} flex items-center justify-center`}>
                        <span className={`${palette.text} font-semibold text-[13px]`}>{getInitials(item.companyName)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[14px] text-slate-800">{item.companyName}</h4>
                        <p className="text-[12px] text-slate-400 font-normal">Thêm {new Date(item.addedAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.industry && <span className="inline-flex items-center px-2 py-[3px] rounded-md bg-slate-50 text-[11px] font-medium text-slate-600 border border-slate-100">{item.industry}</span>}
                      <span className="inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100/60">Đang theo dõi</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {paging && paging.totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-4">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all">
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-[13px] text-slate-500 mx-3">Trang {paging.page} / {paging.totalPages}</span>
            <button disabled={page >= paging.totalPages} onClick={() => setPage((p) => p + 1)} className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-all">
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </InvestorShell>
  );
}
