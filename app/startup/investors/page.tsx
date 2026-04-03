"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Sparkles,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { InvestorConnectionModal } from "@/components/startup/investor-connection-modal";
import { SearchInvestors } from "@/services/startup/startup.api";
import { GetReceivedConnections } from "@/services/connection/connection.api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatTicketSize = (min?: number | null, max?: number | null): string => {
  if (!min && !max) return "—";
  const fmt = (n: number) => n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1_000}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `${fmt(max!)}`;
};

const formatDate = (iso: string): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return "—"; }
};

const STATUS_STYLES: Record<string, string> = {
  Pending:   "bg-blue-50 text-blue-600 border-blue-100",
  Accepted:  "bg-green-50 text-green-600 border-green-100",
  Rejected:  "bg-red-50 text-red-600 border-red-100",
  Withdrawn: "bg-slate-50 text-slate-500 border-slate-100",
  Closed:    "bg-slate-50 text-slate-500 border-slate-100",
};

const STATUS_LABEL: Record<string, string> = {
  Pending:   "SENT",
  Accepted:  "ACCEPTED",
  Rejected:  "REJECTED",
  Withdrawn: "WITHDRAWN",
  Closed:    "CLOSED",
};

function InvestorAvatar({ name, url, size = "size-10" }: { name: string; url?: string; size?: string }) {
  if (url) {
    return <img src={url} alt={name} className={cn(size, "rounded-full object-cover border border-slate-100 shadow-sm")} />;
  }
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div className={cn(size, "rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-100")}>
      {initials}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InvestorsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Khám phá");

  // ── Tab: Khám phá ──
  const [investors, setInvestors] = useState<IInvestorSearchItem[]>([]);
  const [isLoadingInvestors, setIsLoadingInvestors] = useState(false);
  const [investorsError, setInvestorsError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ── Tab: Yêu cầu đã gửi ──
  const [sentConnections, setSentConnections] = useState<IConnectionItem[]>([]);
  const [isLoadingSent, setIsLoadingSent] = useState(false);
  const [sentPage, setSentPage] = useState(1);
  const [sentTotalPages, setSentTotalPages] = useState(1);
  const [sentKeyword, setSentKeyword] = useState("");

  // ── Tab: Đã kết nối ──
  const [connected, setConnected] = useState<IConnectionItem[]>([]);
  const [isLoadingConnected, setIsLoadingConnected] = useState(false);
  const [connectedPage, setConnectedPage] = useState(1);
  const [connectedTotalPages, setConnectedTotalPages] = useState(1);
  const [connectedKeyword, setConnectedKeyword] = useState("");

  // ── Modal ──
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<{ name: string; logo: string; type: string; investorId: number } | null>(null);

  // ── Connection status map (investorID → IConnectionItem) ──
  // Used on the Khám phá tab to show button states
  const [connectionMap, setConnectionMap] = useState<Record<number, IConnectionItem>>({});

  // ── Fetch: investors ──
  const fetchInvestors = useCallback(async (page: number, kw: string) => {
    setIsLoadingInvestors(true);
    setInvestorsError(null);
    try {
      const res = await SearchInvestors({ page, pageSize: 12, keyword: kw || undefined }) as any as IBackendRes<IPaginatedRes<IInvestorSearchItem>>;
      if (res.success && res.data) {
        setInvestors(res.data.items);
        setTotalPages(res.data.paging.totalPages ?? 1);
        setTotalItems(res.data.paging.totalItems);
      } else {
        setInvestors([]);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setInvestorsError("404");
      } else {
        setInvestorsError("error");
      }
      setInvestors([]);
    } finally {
      setIsLoadingInvestors(false);
    }
  }, []);

  // ── Fetch: sent connections (all, for status map) ──
  // Note: 403 = BE chưa cho phép role Startup → silent fail, connectionMap rỗng
  const fetchAllSent = useCallback(async () => {
    try {
      const res = await GetReceivedConnections(1, 100) as any as IBackendRes<IPaginatedRes<IConnectionItem>>;
      if (res.success && res.data) {
        const map: Record<number, IConnectionItem> = {};
        res.data.items.forEach(c => { map[c.investorID] = c; });
        setConnectionMap(map);
      }
    } catch { /* 403 hoặc lỗi khác → bỏ qua, nút hành động sẽ mặc định "Gửi lời mời" */ }
  }, []);

  // ── Fetch: sent tab ──
  const fetchSent = useCallback(async (page: number) => {
    setIsLoadingSent(true);
    try {
      const res = await GetReceivedConnections(page, 10) as any as IBackendRes<IPaginatedRes<IConnectionItem>>;
      if (res.success && res.data) {
        setSentConnections(res.data.items);
        setSentTotalPages(res.data.paging.totalPages ?? 1);
      }
    } catch { /* 403: BE chưa mở endpoint cho Startup */ } finally {
      setIsLoadingSent(false);
    }
  }, []);

  // ── Fetch: connected tab ──
  const fetchConnected = useCallback(async (page: number) => {
    setIsLoadingConnected(true);
    try {
      const res = await GetReceivedConnections(page, 10, "Accepted") as any as IBackendRes<IPaginatedRes<IConnectionItem>>;
      if (res.success && res.data) {
        setConnected(res.data.items);
        setConnectedTotalPages(res.data.paging.totalPages ?? 1);
      }
    } catch { /* 403: BE chưa mở endpoint cho Startup */ } finally {
      setIsLoadingConnected(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInvestors(1, "");
    fetchAllSent();
  }, [fetchInvestors, fetchAllSent]);

  // Reload when tab changes
  useEffect(() => {
    if (activeTab === "Yêu cầu đã gửi") fetchSent(1);
    if (activeTab === "Đã kết nối") fetchConnected(1);
  }, [activeTab, fetchSent, fetchConnected]);

  // Search with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchInvestors(1, keyword);
    }, 400);
    return () => clearTimeout(t);
  }, [keyword, fetchInvestors]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchInvestors(page, keyword);
  };

  const handleOpenRequest = (investor: IInvestorSearchItem) => {
    setSelectedInvestor({
      investorId: investor.investorID,
      name: investor.fullName,
      logo: investor.profilePhotoURL ?? "",
      type: investor.firmName || investor.investorType || "",
    });
    setIsRequestModalOpen(true);
  };

  const handleConnectionSuccess = (connectionId: number) => {
    // Refresh connection map after sending
    fetchAllSent();
  };

  // ── Pagination component ──
  const Pagination = ({
    page, total, onChange,
  }: { page: number; total: number; onChange: (p: number) => void }) => {
    if (total <= 1) return null;
    const pages: (number | "…")[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("…");
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
      if (page < total - 2) pages.push("…");
      pages.push(total);
    }
    return (
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(1, page - 1))} className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40" disabled={page === 1}>
          <ChevronLeft className="size-4" />
        </button>
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => typeof p === "number" && onChange(p)}
            disabled={p === "…"}
            className={cn(
              "size-8 rounded-lg text-[12px] font-bold",
              p === page ? "bg-[#eec54e] text-white shadow-lg shadow-yellow-500/20" : "border border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >{p}</button>
        ))}
        <button onClick={() => onChange(Math.min(total, page + 1))} className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40" disabled={page === total}>
          <ChevronRight className="size-4" />
        </button>
      </div>
    );
  };

  // ── Tab content ──────────────────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {

      // ── Khám phá ────────────────────────────────────────────────────────
      case "Khám phá":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-4">
              <div className="relative w-full lg:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <Input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên quỹ hoặc nhà đầu tư..."
                  className="w-full pl-12 h-12 bg-[#f8fafc]/50 dark:bg-slate-800/50 border-none rounded-xl text-sm font-bold focus:ring-1 focus:ring-yellow-400/30 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {["Giai đoạn", "Ngành nghề ưu tiên", "Quy mô đầu tư"].map((label) => (
                  <div key={label} className="h-12 px-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer group hover:bg-slate-50 transition-all">
                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{label}</span>
                    <ChevronDown className="size-4 text-slate-400 group-hover:text-slate-900" />
                  </div>
                ))}
                <Button variant="outline" className="h-12 px-5 border-none bg-slate-100/50 hover:bg-slate-100 text-slate-700 dark:text-white rounded-xl text-[12px] font-bold gap-2">
                  <SlidersHorizontal className="size-4" />
                  <span>Lọc nâng cao</span>
                </Button>
              </div>
            </div>

            {/* Loading */}
            {isLoadingInvestors && (
              <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-[#eec54e]" />
              </div>
            )}

            {/* Error states */}
            {!isLoadingInvestors && investorsError === "404" && (
              <div className="text-center py-20 space-y-3">
                <p className="text-slate-500 font-bold text-[16px]">Tính năng đang được phát triển</p>
                <p className="text-slate-400 text-[13px] font-medium">
                  API <code className="bg-slate-100 px-2 py-0.5 rounded text-[12px]">GET /api/startups/investors</code> chưa được triển khai trên server.
                </p>
              </div>
            )}
            {!isLoadingInvestors && investorsError === "error" && (
              <div className="text-center py-20 text-red-400 font-medium">
                Không thể tải danh sách nhà đầu tư. Vui lòng thử lại.
              </div>
            )}

            {/* Investor Grid */}
            {!isLoadingInvestors && !investorsError && investors.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-medium">
                Không tìm thấy nhà đầu tư phù hợp.
              </div>
            )}

            {!isLoadingInvestors && !investorsError && investors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {investors.map((investor) => {
                  const conn = connectionMap[investor.investorID];
                  return (
                    <div key={investor.investorID} className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-yellow-500/5 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden">
                      <div className="p-8 text-center space-y-6">
                        <div className="relative mx-auto size-24">
                          <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100" />
                          <InvestorAvatar
                            name={investor.fullName}
                            url={investor.profilePhotoURL}
                            size="size-24 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-md transition-transform duration-500 group-hover:scale-105 relative"
                          />
                        </div>
                        <div>
                          <h3 className="text-[18px] font-black text-slate-900 dark:text-white group-hover:text-[#eec54e] transition-colors leading-tight">{investor.fullName}</h3>
                          <p className="text-[12px] text-slate-400 font-semibold mt-1.5">{investor.title || investor.firmName}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50 dark:border-slate-800">
                          <div className="text-center">
                            <p className="text-[14px] font-black text-slate-900 dark:text-white leading-none">
                              {investor.portfolioCount != null ? `${investor.portfolioCount}+` : "—"}
                            </p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Portfolio</p>
                          </div>
                          <div className="text-center border-x border-slate-50 dark:border-slate-800">
                            <p className="text-[14px] font-black text-slate-900 dark:text-white leading-none truncate">
                              {formatTicketSize(investor.ticketSizeMin, investor.ticketSizeMax)}
                            </p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Ticket Size</p>
                          </div>
                          <div className="text-center">
                            <p className={cn(
                              "text-[14px] font-black leading-none",
                              investor.matchScore != null ? "text-green-500" : "text-slate-400"
                            )}>
                              {investor.matchScore != null ? `${investor.matchScore}%` : "—"}
                            </p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Match</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-1.5">
                          {(investor.preferredIndustries ?? []).slice(0, 3).map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-[#f8fafc] dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 rounded-full border border-slate-50 dark:border-slate-700 tracking-tight">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Link href={`/startup/investors/${investor.investorID}`} className="flex-1">
                            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-[13px] hover:bg-slate-50">
                              Xem hồ sơ
                            </Button>
                          </Link>
                          {!conn ? (
                            <Button
                              onClick={() => handleOpenRequest(investor)}
                              disabled={!investor.acceptingConnections}
                              className="flex-1 h-12 rounded-xl bg-[#eec54e] hover:bg-[#d4ae3d] text-white font-bold text-[13px] shadow-sm disabled:opacity-50"
                            >
                              {investor.acceptingConnections ? "Gửi lời mời" : "Đã đóng"}
                            </Button>
                          ) : conn.connectionStatus === "Accepted" ? (
                            <Button
                              onClick={() => router.push(`/startup/messaging?connectionId=${conn.connectionID}`)}
                              className="flex-1 h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-[13px] shadow-sm gap-1.5"
                            >
                              <MessageCircle className="size-4" />
                              Nhắn tin
                            </Button>
                          ) : (
                            <Button variant="outline" disabled className="flex-1 h-12 rounded-xl font-bold text-[13px] opacity-60">
                              {STATUS_LABEL[conn.connectionStatus] ?? conn.connectionStatus}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!isLoadingInvestors && !investorsError && totalPages > 0 && (
              <div className="pt-8 flex flex-col items-center gap-6">
                <p className="text-[13px] font-bold text-slate-400">
                  Hiển thị {(currentPage - 1) * 12 + 1}–{Math.min(currentPage * 12, totalItems)} trong tổng số {totalItems} nhà đầu tư
                </p>
                <Pagination page={currentPage} total={totalPages} onChange={handlePageChange} />
              </div>
            )}
          </div>
        );

      // ── Yêu cầu đã gửi ──────────────────────────────────────────────────
      case "Yêu cầu đã gửi":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="relative w-full lg:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input value={sentKeyword} onChange={e => setSentKeyword(e.target.value)} placeholder="Tìm kiếm nhà đầu tư..." className="w-full pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Trạng thái:</span>
                <div className="h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-10 cursor-pointer min-w-[140px] justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Tất cả</span>
                  <ChevronDown className="size-4 text-slate-400" />
                </div>
              </div>
            </div>

            {isLoadingSent ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#eec54e]" /></div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Nhà đầu tư</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Thông điệp</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Ngày gửi</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Trạng thái</th>
                      <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sentConnections.length === 0 && (
                      <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 text-sm font-medium">Chưa có lời mời nào được gửi.</td></tr>
                    )}
                    {sentConnections.map((item) => (
                      <tr key={item.connectionID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <InvestorAvatar name={item.investorName} size="size-10" />
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#eec54e] transition-colors">{item.investorName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-[300px]">
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium truncate">{item.personalizedMessage || "—"}</p>
                        </td>
                        <td className="px-8 py-6 text-center text-[13px] font-black text-slate-500 uppercase tracking-tight opacity-70">
                          {formatDate(item.requestedAt)}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border tracking-widest", STATUS_STYLES[item.connectionStatus] ?? "bg-slate-50 text-slate-500 border-slate-100")}>
                            • {STATUS_LABEL[item.connectionStatus] ?? item.connectionStatus}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <MoreVertical className="size-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-6 flex items-center justify-between">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                Trang {sentPage} / {sentTotalPages}
              </p>
              <Pagination page={sentPage} total={sentTotalPages} onChange={(p) => { setSentPage(p); fetchSent(p); }} />
            </div>
          </div>
        );

      // ── Đã kết nối ──────────────────────────────────────────────────────
      case "Đã kết nối":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="relative w-full lg:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input value={connectedKeyword} onChange={e => setConnectedKeyword(e.target.value)} placeholder="Tìm kiếm nhà đầu tư..." className="w-full pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 rounded-xl text-sm" />
              </div>
            </div>

            {isLoadingConnected ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#eec54e]" /></div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Nhà đầu tư</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Thông điệp</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Ngày kết nối</th>
                      <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {connected.length === 0 && (
                      <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 text-sm font-medium">Chưa có kết nối nào được chấp nhận.</td></tr>
                    )}
                    {connected.map((item) => (
                      <tr key={item.connectionID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <InvestorAvatar name={item.investorName} size="size-10" />
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#eec54e] transition-colors">{item.investorName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-[350px]">
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium italic border-l-2 border-slate-100 dark:border-slate-800 pl-4 truncate">
                            {item.personalizedMessage || "—"}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-center text-[13px] font-black text-slate-500 uppercase tracking-tight opacity-70">
                          {formatDate(item.respondedAt || item.requestedAt)}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              onClick={() => router.push(`/startup/messaging?connectionId=${item.connectionID}`)}
                              className="h-10 px-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-slate-900 dark:text-white border-none text-[12px] font-black gap-2 hover:bg-[#eec54e] hover:text-white transition-all group/btn"
                            >
                              <MessageCircle className="size-4 group-hover/btn:scale-110 transition-transform" />
                              <span>Nhắn tin</span>
                            </Button>
                            <Link href={`/startup/investors/${item.investorID}`}>
                              <button className="px-3 py-2 text-[12px] font-black text-slate-400 hover:text-slate-900 border border-slate-100 rounded-xl transition-all">
                                Xem hồ sơ
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-6 flex items-center justify-between">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                Trang {connectedPage} / {connectedTotalPages}
              </p>
              <Pagination page={connectedPage} total={connectedTotalPages} onChange={(p) => { setConnectedPage(p); fetchConnected(p); }} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <StartupShell>
      <div className="max-w-[1440px] mx-auto space-y-8 pb-12 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-[32px] font-black text-slate-900 tracking-tighter leading-none">Kết nối Nhà đầu tư & Quỹ đầu tư</h1>
            <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-[600px]">
              Khám phá và kết nối với các đối tác tài chính chiến lược tiềm năng để đưa startup của bạn lên tầm cao mới.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-1 px-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 rounded-full flex items-center gap-2">
              <Sparkles className="size-3 text-blue-500" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Gợi ý AI</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-10">
          {["Khám phá", "Yêu cầu đã gửi", "Đã kết nối"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-4 text-[15px] font-bold tracking-tight transition-all",
                activeTab === tab ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#eec54e] rounded-full animate-in slide-in-from-left-2 duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Footer */}
        <div className="text-center pt-10 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">© 2026 AISEP STARTUP WORKSPACE • HỆ THỐNG KẾT NỐI NHÀ ĐẦU TƯ & QUỸ ĐẦU TƯ</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Điều khoản</Link>
            <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Bảo mật</Link>
            <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Liên hệ</Link>
          </div>
        </div>

        {/* Modal */}
        <InvestorConnectionModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          investor={selectedInvestor}
          onSuccess={handleConnectionSuccess}
        />
      </div>
    </StartupShell>
  );
}
