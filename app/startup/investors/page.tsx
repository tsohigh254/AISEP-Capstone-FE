"use client";

import { toast } from "sonner";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildInvestorSearchPresentation, isInvestorKycVerified } from "@/lib/investor-profile-presenter";
import { VerifiedRoleMark } from "@/components/shared/verified-role-mark";
import { Button } from "@/components/ui/button";
import { AcceptConnection, RejectConnection, GetSentConnections, GetReceivedConnections, WithdrawConnection } from "@/services/connection/connection.api";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { InvestorConnectionModal } from "@/components/startup/investor-connection-modal";
import { SearchInvestors } from "@/services/startup/startup.api";

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EMPTY_METRIC_VALUE = "N/A";

const formatTicketSize = (min?: number | null, max?: number | null): string => {
  if (!min && !max) return EMPTY_METRIC_VALUE;
  const fmt = (n: number) => n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1_000}K`;
  if (min && max) return `${fmt(min)}-${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `${fmt(max!)}`;
};

const formatDate = (iso: string): string => {
  if (!iso) return EMPTY_METRIC_VALUE;
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return EMPTY_METRIC_VALUE; }
};

const STATUS_STYLES: Record<string, string> = {
  Requested: "bg-blue-50 text-blue-600 border-blue-100",
  Pending:   "bg-blue-50 text-blue-600 border-blue-100",
  Accepted:  "bg-green-50 text-green-600 border-green-100",
  Rejected:  "bg-red-50 text-red-600 border-red-100",
  Withdrawn: "bg-slate-50 text-slate-500 border-slate-100",
  Closed:    "bg-slate-50 text-slate-500 border-slate-100",
};

const STATUS_LABEL: Record<string, string> = {
  Requested: "REQUESTED",
  Pending:   "SENT",
  Accepted:  "ACCEPTED",
  Rejected:  "REJECTED",
  Withdrawn: "WITHDRAWN",
  Closed:    "CLOSED",
};

type PaginatedListData<T> = IPaginatedRes<T> & {
  data?: T[];
  items?: T[];
  total?: number;
};

const getListItems = <T,>(data?: PaginatedListData<T> | null): T[] => {
  if (!data) return [];
  return data.items ?? data.data ?? [];
};

const getTotalPages = <T,>(data?: PaginatedListData<T> | null, pageSize: number = 10): number => {
  if (!data) return 1;
  const total = data.total ?? data.paging?.totalItems ?? 0;
  return data.paging?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
};

const isSuccessResponse = <T,>(response: IBackendRes<T> | null | undefined): response is IBackendRes<T> => {
  return Boolean(response?.success || response?.isSuccess);
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = (error as { response?: { status?: number } }).response;
  return typeof response?.status === "number" ? response.status : undefined;
};

const normalizeConnectionStatus = (status?: string): "Requested" | "Accepted" | "Rejected" | "Withdrawn" | "Closed" | string => {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "pending" || normalized === "requested") return "Requested";
  if (normalized === "accepted") return "Accepted";
  if (normalized === "rejected") return "Rejected";
  if (normalized === "withdrawn") return "Withdrawn";
  if (normalized === "closed") return "Closed";
  return status ?? "";
};

const isPendingConnection = (status?: string) => normalizeConnectionStatus(status) === "Requested";
const isAcceptedConnection = (status?: string) => normalizeConnectionStatus(status) === "Accepted";

function InvestorAvatar({ name, url, size = "size-10" }: { name: string; url?: string; size?: string }) {
  if (url) {
    return (
      <div className={cn(size, "relative overflow-hidden rounded-full border border-slate-100 shadow-sm")}>
        <Image src={url} alt={name} fill sizes="84px" className="object-cover" />
      </div>
    );
  }
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div className={cn(size, "rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-100")}>
      {initials}
    </div>
  );
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // Tab: Nhận từ Investor
  const [receivedConnections, setReceivedConnections] = useState<IConnectionItem[]>([]);
  const [isLoadingReceived, setIsLoadingReceived] = useState(false);
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedTotalPages, setReceivedTotalPages] = useState(1);

  // ── Tab: Đã kết nối ──
  const [connected, setConnected] = useState<IConnectionItem[]>([]);
  const [isLoadingConnected, setIsLoadingConnected] = useState(false);
  const [connectedPage, setConnectedPage] = useState(1);
  const [connectedTotalPages, setConnectedTotalPages] = useState(1);
  const [connectedKeyword, setConnectedKeyword] = useState("");
  const handleAcceptConnection = async (id: number) => {
    try {
      const res = await AcceptConnection(id);
      if (isSuccessResponse(res)) { toast.success("Đã chấp nhận kết nối"); fetchReceived(receivedPage); fetchConnected(connectedPage); fetchConnectionMap(); }
      else { toast.error("Có lỗi xảy ra"); }
    } catch { toast.error("Có lỗi xảy ra"); }
  };

  const handleRejectConnection = async (id: number) => {
    try {
      const res = await RejectConnection(id, { reason: "Không phù hợp" });
      if (isSuccessResponse(res)) { toast.success("Đã từ chối kết nối"); fetchReceived(receivedPage); }
      else { toast.error("Có lỗi xảy ra"); }
    } catch { toast.error("Có lỗi xảy ra"); }
  };

  const handleWithdrawConnection = async (id: number) => {
    try {
      const res = await WithdrawConnection(id);
      if (isSuccessResponse(res)) { toast.success("Đã thu hồi yêu cầu"); fetchSent(sentPage); fetchConnectionMap(); }
      else { toast.error("Có lỗi xảy ra"); }
    } catch { toast.error("Có lỗi xảy ra"); }
  };


  // â”€â”€ Modal â”€â”€
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<{ name: string; logo: string; type: string; investorId: number } | null>(null);

  // â”€â”€ Connection status map (investorID â†’ IConnectionItem) â”€â”€
  // Used on the Khám phá tab to show button states
  const [connectionMap, setConnectionMap] = useState<Record<number, IConnectionItem>>({});

  // â”€â”€ Fetch: investors â”€â”€
  const fetchInvestors = useCallback(async (page: number, kw: string) => {
    setIsLoadingInvestors(true);
    setInvestorsError(null);
    try {
      const res = await SearchInvestors({ page, pageSize: 12, keyword: kw || undefined }) as IBackendRes<PaginatedListData<IInvestorSearchItem>>;
      if (res.success && res.data) {
        setInvestors(getListItems(res.data));
        setTotalPages(getTotalPages(res.data, 12));
        setTotalItems(res.data.paging?.totalItems ?? res.data.total ?? 0);
      } else {
        setInvestors([]);
      }
    } catch (err: unknown) {
      const status = getErrorStatus(err);
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

  // â”€â”€ Fetch: sent connections (all, for status map) â”€â”€
  const fetchConnectionMap = useCallback(async () => {
    try {
      const [resSent, resReceived] = await Promise.all([
        GetSentConnections(1, 100),
        GetReceivedConnections(1, 100),
      ]);
      const map: Record<number, IConnectionItem> = {};
      getListItems(resSent.data).forEach((connection) => {
        if (!connection?.investorID) return;
        map[connection.investorID] = {
          ...connection,
          initiatedByRole: connection.initiatedByRole ?? "STARTUP",
        };
      });
      getListItems(resReceived.data).forEach((connection) => {
        if (!connection?.investorID) return;
        map[connection.investorID] = {
          ...connection,
          initiatedByRole: connection.initiatedByRole ?? "INVESTOR",
        };
      });
      setConnectionMap(map);
    } catch { /* silent */ }
  }, []);

  // alias for BroadcastChannel compatibility
  
  // â”€â”€ Fetch: sent tab â”€â”€
  const fetchSent = useCallback(async (page: number) => {
    setIsLoadingSent(true);
    try {
      const res = await GetSentConnections(page, 10);
      if (isSuccessResponse(res)) {
        setSentConnections(
          getListItems(res.data).map((item) => ({
            ...item,
            initiatedByRole: item.initiatedByRole ?? "STARTUP",
          }))
        );
        setSentTotalPages(getTotalPages(res.data, 10));
      }
    } catch { /* silent */ } finally {
      setIsLoadingSent(false);
    }
  }, []);

  // â”€â”€ Fetch: received tab (investor â†’ startup) â”€â”€
  const fetchReceived = useCallback(async (page: number) => {
    setIsLoadingReceived(true);
    try {
      const res = await GetReceivedConnections(page, 10);
      if (isSuccessResponse(res)) {
        setReceivedConnections(
          getListItems(res.data).map((item) => ({
            ...item,
            initiatedByRole: item.initiatedByRole ?? "INVESTOR",
          }))
        );
        setReceivedTotalPages(getTotalPages(res.data, 10));
      }
    } catch { /* silent */ } finally {
      setIsLoadingReceived(false);
    }
  }, []);

  // â”€â”€ Fetch: connected tab â”€â”€
  const fetchConnected = useCallback(async (_page?: number) => {
    setIsLoadingConnected(true);
    try {
      const [resSent, resReceived] = await Promise.all([
        GetSentConnections(1, 100, "Accepted"),
        GetReceivedConnections(1, 100, "Accepted"),
      ]);
      const all: IConnectionItem[] = [
        ...getListItems(resSent.data).map((item) => ({
          ...item,
          initiatedByRole: item.initiatedByRole ?? "STARTUP",
        })),
        ...getListItems(resReceived.data).map((item) => ({
          ...item,
          initiatedByRole: item.initiatedByRole ?? "INVESTOR",
        })),
      ];
      setConnected(all);
      setConnectedTotalPages(1);
    } catch { /* silent */ } finally {
      setIsLoadingConnected(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInvestors(1, "");
    fetchConnectionMap();
  }, [fetchInvestors, fetchConnectionMap]);

  // Listen for cross-tab connection updates (so startup UI refreshes when an investor sends a request)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    const onMessage = (ev: MessageEvent) => {
      try {
        if (ev?.data?.type === "refresh") {
          fetchConnectionMap();
          if (activeTab === "Yêu cầu đã gửi") fetchSent(sentPage);
          if (activeTab === "Nhận từ Investor") fetchReceived(receivedPage);
          if (activeTab === "Đã kết nối") fetchConnected(connectedPage);
        }
      } catch { /* ignore */ }
    };

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "connections-refresh") {
        fetchConnectionMap();
        if (activeTab === "Yêu cầu đã gửi") fetchSent(sentPage);
        if (activeTab === "Nhận từ Investor") fetchReceived(receivedPage);
        if (activeTab === "Đã kết nối") fetchConnected(connectedPage);
      }
    };

    if (typeof window !== "undefined") {
      try {
        if (typeof BroadcastChannel !== "undefined") {
          bc = new BroadcastChannel("connections-updates");
          bc.addEventListener("message", onMessage);
        } else {
          window.addEventListener("storage", onStorage);
        }
      } catch { /* ignore */ }
    }

    return () => {
      try {
        if (bc) bc.close();
        else window.removeEventListener("storage", onStorage);
      } catch {}
    };
  }, [fetchConnectionMap, fetchSent, fetchReceived, fetchConnected, activeTab, sentPage, receivedPage, connectedPage]);

  // Reload when tab changes
  useEffect(() => {
    if (activeTab === "Yêu cầu đã gửi") fetchSent(1);
    if (activeTab === "Nhận từ Investor") fetchReceived(1);
    if (activeTab === "Đã kết nối") fetchConnected(1);
  }, [activeTab, fetchSent, fetchReceived, fetchConnected]);

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
    const presentation = buildInvestorSearchPresentation(investor, {
      institutionalIdentityLineMode: "organization",
    });
    setSelectedInvestor({
      investorId: investor.investorID,
      name: presentation.primaryName,
      logo: investor.profilePhotoURL ?? "",
      type: presentation.categoryLabel || investor.investorType || "Nhà đầu tư",
    });
    setIsRequestModalOpen(true);
  };

  const handleConnectionSuccess = () => {
    fetchConnectionMap();
  };

  // â”€â”€ Pagination component â”€â”€
  const Pagination = ({
    page, total, onChange,
  }: { page: number; total: number; onChange: (p: number) => void }) => {
    if (total <= 1) return null;
    const pages: (number | "...")[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
      if (page < total - 2) pages.push("...");
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
            disabled={p === "..."}
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

  // â”€â”€ Tab content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const renderTabContent = () => {
    switch (activeTab) {

      // ── Khám phá ────────────────────────────────────────────────────────
      case "Khám phá":
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Search & Filters */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px] flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <Input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên quỹ hoặc nhà đầu tư..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {["Giai đoạn", "Ngành nghề ưu tiên", "Quy mô đầu tư"].map((label) => (
                  <div key={label} className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition-colors hover:bg-slate-50">
                    <span className="whitespace-nowrap text-[13px] font-medium text-slate-700">{label}</span>
                    <ChevronDown className="size-4 text-slate-400" />
                  </div>
                ))}
                <Button variant="outline" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-100">
                  <SlidersHorizontal className="size-4" />
                  <span>Lọc nâng cao</span>
                </Button>
              </div>
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
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {investors.map((investor) => {
                  const conn = connectionMap[investor.investorID];
                  const presentation = buildInvestorSearchPresentation(investor, {
                    institutionalIdentityLineMode: "organization",
                  });
                  const isKycVerified = isInvestorKycVerified(investor);
                  const normalizedConnectionStatus = normalizeConnectionStatus(conn?.connectionStatus);
                  const hasPendingIncomingInvite =
                    Boolean(conn) && isPendingConnection(conn?.connectionStatus) && conn?.initiatedByRole === "INVESTOR";
                  const canRequestConnection =
                    investor.canRequestConnection ??
                    ((investor.profileAvailabilityReason ?? "OPEN") === "OPEN" && investor.acceptingConnections !== false);
                  const hasTicketSize = investor.ticketSizeMin != null || investor.ticketSizeMax != null;
                  const industries = (investor.preferredIndustries ?? []).slice(0, 3);
                  return (
                    <div key={investor.investorID} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                      <div className="flex flex-1 flex-col p-6 text-center">
                          <div className="relative mx-auto mb-5 size-[84px]">
                            <div className="absolute inset-0 rounded-full bg-[#eec54e]/10 opacity-0 blur-2xl transition-all group-hover:opacity-100" />
                            <InvestorAvatar
                              name={presentation.primaryName}
                              url={investor.profilePhotoURL}
                              size="relative size-[84px] rounded-full border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                            <div className="mb-5">
                              {presentation.categoryLabel && (
                                <div className="mb-2 flex justify-center">
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                                      presentation.isInstitutional
                                        ? "border-blue-200/80 bg-blue-50 text-blue-700"
                                        : "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                                    )}
                                  >
                                    {presentation.isInstitutional ? "Quỹ / Tổ chức" : "Cá nhân"}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-center gap-2">
                                <h3 className="text-[20px] font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#0f172a]">{presentation.primaryName}</h3>
                                {isKycVerified && <VerifiedRoleMark className="h-4 w-4 shrink-0" />}
                              </div>
                            <p className="mt-1.5 min-h-[36px] line-clamp-2 text-[12px] font-medium text-slate-400">
                              {presentation.heroIdentityLine || presentation.categoryLabel || "Nhà đầu tư"}
                            </p>
                          </div>

                          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100/70 px-2 py-3">
                            <div className="text-center">
                              <p className={cn(
                                "text-[15px] leading-none",
                                investor.acceptedConnectionCount != null ? "font-semibold text-slate-900" : "font-semibold text-slate-500"
                              )}>
                                {investor.acceptedConnectionCount != null ? investor.acceptedConnectionCount : EMPTY_METRIC_VALUE}
                              </p>
                              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Đã kết nối</p>
                            </div>
                            <div className="border-l border-slate-300/70 text-center">
                              <p className={cn(
                                "px-1 text-[13px] leading-tight",
                                hasTicketSize ? "font-semibold text-slate-900" : "font-semibold text-slate-500"
                              )}>
                                {formatTicketSize(investor.ticketSizeMin, investor.ticketSizeMax)}
                              </p>
                              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">Quy mô đầu tư</p>
                            </div>
                          </div>

                          <div className="mb-4 flex min-h-[58px] flex-wrap justify-center content-start gap-1.5">
                            {industries.length > 0 ? (
                              industries.map((tag) => (
                                <span
                                  key={tag}
                                  className="line-clamp-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                                  title={tag}
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                                Chưa cập nhật lĩnh vực
                              </span>
                            )}
                          </div>

                          <div className="mt-auto flex gap-3 pt-2">
                          <Link href={`/startup/investors/${investor.investorID}`} className="flex-1">
                            <Button variant="outline" className="h-[44px] w-full rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50">
                              Xem hồ sơ
                            </Button>
                          </Link>
                          {!conn ? (
                            <Button
                              onClick={() => handleOpenRequest(investor)}
                              disabled={!canRequestConnection}
                              className="h-[44px] flex-1 whitespace-nowrap rounded-xl bg-blue-600 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:border-transparent disabled:bg-blue-100 disabled:text-blue-500 disabled:opacity-100"
                            >
                              {canRequestConnection ? "Gửi lời mời" : "Đã đóng"}
                            </Button>
                          ) : isAcceptedConnection(conn.connectionStatus) ? (
                            <Button
                              onClick={() => router.push(`/startup/messaging?connectionId=${conn.connectionID}`)}
                              className="h-[44px] flex-1 gap-1.5 rounded-xl bg-emerald-600 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                            >
                              <MessageCircle className="size-4" />
                              Nhắn tin
                            </Button>
                          ) : hasPendingIncomingInvite ? (
                            <Button
                              onClick={() => router.push(`/startup/investors/${investor.investorID}`)}
                              className="h-[44px] flex-1 gap-1.5 rounded-xl bg-sky-50 text-[13px] font-semibold text-sky-700 shadow-sm transition-colors hover:bg-sky-100"
                            >
                              Xử lý lời mời
                            </Button>
                          ) : (
                            <Button variant="outline" disabled className="h-[44px] flex-1 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-medium text-slate-500 opacity-100 transition-colors">
                              {STATUS_LABEL[normalizedConnectionStatus] ?? normalizedConnectionStatus}
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
              <div className="flex flex-col items-center gap-5 pt-6">
                <p className="text-[12px] font-medium text-slate-400">
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
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium truncate">{item.personalizedMessage || "\u2014"}</p>
                        </td>
                        <td className="px-8 py-6 text-center text-[13px] font-black text-slate-500 uppercase tracking-tight opacity-70">
                          {formatDate(item.requestedAt)}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border tracking-widest", STATUS_STYLES[normalizeConnectionStatus(item.connectionStatus)] ?? "bg-slate-50 text-slate-500 border-slate-100")}>
                            {"\u2022"} {STATUS_LABEL[normalizeConnectionStatus(item.connectionStatus)] ?? normalizeConnectionStatus(item.connectionStatus)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                            {isPendingConnection(item.connectionStatus) ? (
                              <button
                                onClick={() => handleWithdrawConnection(item.connectionID)}
                                className="h-10 px-4 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-[13px] flex items-center gap-2"
                              >
                                Thu hồi
                              </button>
                            ) : isAcceptedConnection(item.connectionStatus) ? (
                              <Button
                                onClick={() => router.push(`/startup/messaging?connectionId=${item.connectionID}`)}
                                className="h-10 px-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-slate-900 dark:text-white border-none text-[12px] font-black gap-2 hover:bg-[#eec54e] hover:text-white transition-all group/btn"
                              >
                                <MessageCircle className="size-4 group-hover/btn:scale-110 transition-transform" />
                                <span>Nhắn tin</span>
                              </Button>
                            ) : (
                              <span className="text-[13px] font-bold text-slate-500">
                                Đã xử lý
                              </span>
                            )}
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
      // Tab: Nhận từ Investor
      case "Nhận từ Investor":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {isLoadingReceived ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#eec54e]" /></div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Nhà đầu tư</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Lời nhắn</th>
                      <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Ngày gửi</th>
                      <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {receivedConnections.length === 0 && (
                      <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 text-sm font-medium">Chưa có nhà đầu tư nào gửi lời mời kết nối.</td></tr>
                    )}
                    {receivedConnections.map((item) => (
                      <tr key={item.connectionID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <InvestorAvatar name={item.investorName} size="size-10" />
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#eec54e] transition-colors">{item.investorName}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 max-w-[300px]">
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium truncate">{item.personalizedMessage || "\u2014"}</p>
                        </td>
                        <td className="px-8 py-6 text-center text-[13px] font-black text-slate-500 uppercase tracking-tight opacity-70">
                          {formatDate(item.requestedAt)}
                        </td>
                        <td className="px-8 py-6 text-right">
                          {isPendingConnection(item.connectionStatus) ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAcceptConnection(item.connectionID)}
                                className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all font-bold text-[13px]"
                              >
                                Chấp nhận
                              </button>
                              <button
                                onClick={() => handleRejectConnection(item.connectionID)}
                                className="h-10 px-4 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-[13px]"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : isAcceptedConnection(item.connectionStatus) ? (
                            <Button
                              onClick={() => router.push(`/startup/messaging?connectionId=${item.connectionID}`)}
                              className="h-10 px-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-slate-900 dark:text-white border-none text-[12px] font-black gap-2 hover:bg-[#eec54e] hover:text-white transition-all group/btn"
                            >
                              <MessageCircle className="size-4" />
                              <span>Nhắn tin</span>
                            </Button>
                          ) : (
                            <span className="text-[13px] font-bold text-slate-500">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pt-6 flex items-center justify-between">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                Trang {receivedPage} / {receivedTotalPages}
              </p>
              <Pagination page={receivedPage} total={receivedTotalPages} onChange={(p) => { setReceivedPage(p); fetchReceived(p); }} />
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
                            {item.personalizedMessage || "\u2014"}
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
      <div className="mx-auto max-w-[1100px] space-y-6 pb-20 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-[28px] font-black tracking-tight text-slate-900">Kết nối Nhà đầu tư & Quỹ đầu tư</h1>
            <p className="max-w-[620px] text-[14px] font-medium leading-relaxed text-slate-500">
              Khám phá và kết nối với các đối tác tài chính chiến lược tiềm năng để đưa startup của bạn lên tầm cao mới.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#eec54e]/30 bg-[#fdf8e6] px-4 py-2.5">
              <Sparkles className="size-3 text-[#d4ae3d]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a58419]">Gợi ý AI</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 overflow-x-auto border-b border-slate-200">
          {["Khám phá", "Yêu cầu đã gửi", "Nhận từ Investor", "Đã kết nối"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative whitespace-nowrap pb-4 text-[14px] font-bold tracking-tight transition-all",
                activeTab === tab
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#eec54e]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Footer */}
        <div className="hidden border-t border-slate-100 pt-8 text-center">
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
