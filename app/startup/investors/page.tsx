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
import { getIndustryName } from "@/lib/investor-preferred-stages";
import { VerifiedRoleMark } from "@/components/shared/verified-role-mark";
import { Button } from "@/components/ui/button";
import { AcceptConnection, RejectConnection, GetSentConnections, GetReceivedConnections, WithdrawConnection } from "@/services/connection/connection.api";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { InvestorConnectionModal } from "@/components/startup/investor-connection-modal";
import { GetInterestedInvestors, SearchInvestors, type SearchInvestorsParams } from "@/services/startup/startup.api";
import { GetIndustriesFlat, GetStages } from "@/services/master/master.api";

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
  Requested: "Đang chờ",
  Pending:   "Đang chờ",
  Accepted:  "Đã chấp nhận",
  Rejected:  "Đã từ chối",
  Withdrawn: "Đã thu hồi",
  Closed:    "Đã đóng",
  WaitingResponse: "Đang chờ phản hồi",
};

const DISCOVERY_CONNECTION_STATUS = {
  NONE: "NONE",
  REQUESTED: "REQUESTED",
  ACCEPTED: "ACCEPTED",
  IN_DISCUSSION: "IN_DISCUSSION",
} as const;

type DiscoveryConnectionStatus =
  (typeof DISCOVERY_CONNECTION_STATUS)[keyof typeof DISCOVERY_CONNECTION_STATUS];

type DiscoveryFilterState = {
  stageId: string;
  industryId: string;
  ticketRange: string;
};

const DISCOVERY_TICKET_RANGE_OPTIONS: Array<{
  value: string;
  label: string;
  params: Pick<SearchInvestorsParams, "ticketSizeMin" | "ticketSizeMax">;
}> = [
  { value: "", label: "Quy mô đầu tư", params: {} },
  { value: "upto-50k", label: "Dưới $50K", params: { ticketSizeMax: 50_000 } },
  { value: "50k-250k", label: "$50K - $250K", params: { ticketSizeMin: 50_000, ticketSizeMax: 250_000 } },
  { value: "250k-1m", label: "$250K - $1M", params: { ticketSizeMin: 250_000, ticketSizeMax: 1_000_000 } },
  { value: "1m-plus", label: "Từ $1M", params: { ticketSizeMin: 1_000_000 } },
];

const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilterState = {
  stageId: "",
  industryId: "",
  ticketRange: "",
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

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = (error as { response?: { data?: { error?: { code?: string }; code?: string } } }).response;
  return response?.data?.error?.code ?? response?.data?.code;
};

const getDiscoveryTicketRangeParams = (ticketRange: string) => {
  return DISCOVERY_TICKET_RANGE_OPTIONS.find((option) => option.value === ticketRange)?.params ?? {};
};

const getVerificationBadgeLabel = (badge: IInterestedInvestorItem["verificationBadge"]): string => {
  switch (badge) {
    case "Verified Investor Entity":
      return "Nhà đầu tư tổ chức đã xác minh";
    case "Verified Angel Investor":
      return "Nhà đầu tư thiên thần đã xác minh";
    case "Basic Verified":
      return "Đã xác minh cơ bản";
    default:
      return badge;
  }
};

const getInterestedInvestorDisplay = (item: IInterestedInvestorItem) => {
  const primaryName = item.displayName.trim();
  return { primaryName };
};

const DISCOVERY_PAGE_SIZE = 12;
const normalizeDiscoveryConnectionStatus = (status?: string | null): DiscoveryConnectionStatus => {
  if (
    status === DISCOVERY_CONNECTION_STATUS.REQUESTED ||
    status === DISCOVERY_CONNECTION_STATUS.ACCEPTED ||
    status === DISCOVERY_CONNECTION_STATUS.IN_DISCUSSION
  ) {
    return status;
  }

  return DISCOVERY_CONNECTION_STATUS.NONE;
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
  const [isLoadingInvestors, setIsLoadingInvestors] = useState(true);
  const [investorsError, setInvestorsError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilterState>(DEFAULT_DISCOVERY_FILTERS);
  const [industryOptions, setIndustryOptions] = useState<{ id: number; name: string }[]>([]);
  const [stageOptions, setStageOptions] = useState<{ id: number; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ── Tab: Yêu cầu đã gửi ──
  const [sentConnections, setSentConnections] = useState<IConnectionItem[]>([]);
  const [isLoadingSent, setIsLoadingSent] = useState(false);
  const [sentPage, setSentPage] = useState(1);
  const [sentTotalPages, setSentTotalPages] = useState(1);
  const [sentKeyword, setSentKeyword] = useState("");
  const [sentStatusFilter, setSentStatusFilter] = useState("");

  // Tab: Nhận từ Investor
  const [receivedConnections, setReceivedConnections] = useState<IConnectionItem[]>([]);
  const [isLoadingReceived, setIsLoadingReceived] = useState(false);
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedTotalPages, setReceivedTotalPages] = useState(1);
  const [receivedKeyword, setReceivedKeyword] = useState("");

  // Tab: Nhà đầu tư quan tâm
  const [interestedInvestors, setInterestedInvestors] = useState<IInterestedInvestorItem[]>([]);
  const [isLoadingInterested, setIsLoadingInterested] = useState(false);
  const [interestedPage, setInterestedPage] = useState(1);
  const [interestedTotalPages, setInterestedTotalPages] = useState(1);
  const [interestedKeyword, setInterestedKeyword] = useState("");
  const [interestedErrorCode, setInterestedErrorCode] = useState<string | null>(null);

  // ── Tab: Đã kết nối ──
  const [connected, setConnected] = useState<IConnectionItem[]>([]);
  const [isLoadingConnected, setIsLoadingConnected] = useState(false);
  const [connectedPage, setConnectedPage] = useState(1);
  const [connectedTotalPages, setConnectedTotalPages] = useState(1);
  const [connectedKeyword, setConnectedKeyword] = useState("");
  const handleAcceptConnection = async (id: number) => {
    try {
      const res = await AcceptConnection(id);
      if (isSuccessResponse(res)) { toast.success("Đã chấp nhận kết nối"); fetchReceived(receivedPage); fetchConnected(connectedPage); fetchInvestors(currentPage, keyword, discoveryFilters); }
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
      if (isSuccessResponse(res)) { toast.success("Đã thu hồi yêu cầu"); fetchSent(sentPage); fetchInvestors(currentPage, keyword, discoveryFilters); }
      else { toast.error("Có lỗi xảy ra"); }
    } catch { toast.error("Có lỗi xảy ra"); }
  };


  // â”€â”€ Modal â”€â”€
  const isFirstInvestorFetch = React.useRef(true);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<{ name: string; logo: string; type: string; investorId: number } | null>(null);

  // â”€â”€ Connection status map (investorID â†’ IConnectionItem) â”€â”€
  // Used on the Khám phá tab to show button states
  // â”€â”€ Fetch: investors â”€â”€
  const fetchInvestors = useCallback(async (page: number, kw: string, filters: DiscoveryFilterState) => {
    setIsLoadingInvestors(true);
    setInvestorsError(null);
    try {
      const ticketRangeParams = getDiscoveryTicketRangeParams(filters.ticketRange);
      const res = await SearchInvestors({
        page,
        pageSize: DISCOVERY_PAGE_SIZE,
        keyword: kw || undefined,
        stageId: filters.stageId ? Number(filters.stageId) : undefined,
        industryId: filters.industryId ? Number(filters.industryId) : undefined,
        ...ticketRangeParams,
      }) as IBackendRes<PaginatedListData<IInvestorSearchItem>>;
      if ((res.success || res.isSuccess) && res.data) {
        const items = getListItems(res.data);
        setInvestors(items);
        setTotalPages(getTotalPages(res.data, DISCOVERY_PAGE_SIZE));
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
  // alias for BroadcastChannel compatibility
  
  // â”€â”€ Fetch: sent tab â”€â”€
  const fetchSent = useCallback(async (page: number, kw?: string, status?: string) => {
    setIsLoadingSent(true);
    try {
      const res = await GetSentConnections(page, 10, status || undefined, undefined, kw || undefined);
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
  const fetchReceived = useCallback(async (page: number, kw?: string) => {
    setIsLoadingReceived(true);
    try {
      const res = await GetReceivedConnections(page, 10, "Requested", undefined, kw || undefined);
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

  // â”€â”€ Fetch: interested investors tab (watchlist) â”€â”€
  const fetchInterested = useCallback(async (page: number, kw?: string) => {
    setIsLoadingInterested(true);
    setInterestedErrorCode(null);
    try {
      const res = await GetInterestedInvestors({
        page,
        pageSize: 10,
        keyword: kw || undefined,
        sortBy: "latest",
      });

      if (isSuccessResponse(res) && res.data) {
        setInterestedInvestors(res.data.data ?? []);
        setInterestedTotalPages(Math.max(1, Math.ceil((res.data.total ?? 0) / (res.data.pageSize || 10))));
      } else {
        setInterestedInvestors([]);
        setInterestedTotalPages(1);
      }
    } catch (err) {
      const status = getErrorStatus(err);
      const code = getErrorCode(err);

      if (status === 404 && code === "STARTUP_PROFILE_NOT_FOUND") {
        router.replace("/startup/onboard");
        return;
      }

      if (code === "NO_INTERESTED_INVESTORS") {
        setInterestedInvestors([]);
        setInterestedTotalPages(1);
      } else if (code === "EMAIL_NOT_VERIFIED") {
        setInterestedErrorCode("MSG012");
      } else if (code === "STARTUP_PROFILE_INCOMPLETE") {
        setInterestedErrorCode("MSG041");
      } else {
        setInterestedErrorCode("MSG008");
      }
    } finally {
      setIsLoadingInterested(false);
    }
  }, [router]);

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

  useEffect(() => {
    let isMounted = true;

    GetIndustriesFlat()
      .then((items) => {
        if (!isMounted) return;
        setIndustryOptions(items
          .filter((item) => item.industryName.trim().length > 0)
          .map((item) => ({ id: item.industryId, name: item.industryName }))
          .sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {
        if (isMounted) setIndustryOptions([]);
      });

    GetStages()
      .then((items) => {
        if (!isMounted) return;
        setStageOptions(items.map((item) => ({ id: item.stageId, name: item.stageName })));
      })
      .catch(() => {
        if (isMounted) setStageOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for cross-tab connection updates (so startup UI refreshes when an investor sends a request)
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    const onMessage = (ev: MessageEvent) => {
      try {
        if (ev?.data?.type === "refresh") {
          fetchInvestors(currentPage, keyword, discoveryFilters);
          if (activeTab === "Yêu cầu đã gửi") fetchSent(sentPage);
          if (activeTab === "Nhận từ Investor") fetchReceived(receivedPage);
          if (activeTab === "Nhà đầu tư quan tâm") fetchInterested(interestedPage);
          if (activeTab === "Đã kết nối") fetchConnected(connectedPage);
        }
      } catch { /* ignore */ }
    };

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "connections-refresh") {
        fetchInvestors(currentPage, keyword, discoveryFilters);
        if (activeTab === "Yêu cầu đã gửi") fetchSent(sentPage);
        if (activeTab === "Nhận từ Investor") fetchReceived(receivedPage);
        if (activeTab === "Nhà đầu tư quan tâm") fetchInterested(interestedPage);
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
  }, [fetchInvestors, currentPage, keyword, discoveryFilters, fetchSent, fetchReceived, fetchInterested, fetchConnected, activeTab, sentPage, receivedPage, interestedPage, connectedPage]);

  // Reload when tab changes
  useEffect(() => {
    if (activeTab === "Yêu cầu đã gửi") { setSentKeyword(""); setSentStatusFilter(""); fetchSent(1); }
    if (activeTab === "Nhận từ Investor") { setReceivedKeyword(""); fetchReceived(1); }
    if (activeTab === "Nhà đầu tư quan tâm") { setInterestedKeyword(""); fetchInterested(1); }
    if (activeTab === "Đã kết nối") fetchConnected(1);
  }, [activeTab, fetchSent, fetchReceived, fetchInterested, fetchConnected]);

  // Search with debounce - Khám phá (fire immediately on first mount, debounce on subsequent changes)
  useEffect(() => {
    if (isFirstInvestorFetch.current) {
      isFirstInvestorFetch.current = false;
      setCurrentPage(1);
      fetchInvestors(1, keyword, discoveryFilters);
      return;
    }
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchInvestors(1, keyword, discoveryFilters);
    }, 400);
    return () => clearTimeout(t);
  }, [keyword, discoveryFilters, fetchInvestors]);

  // Search with debounce - Yêu cầu đã gửi
  useEffect(() => {
    const t = setTimeout(() => { setSentPage(1); fetchSent(1, sentKeyword, sentStatusFilter); }, 400);
    return () => clearTimeout(t);
  }, [sentKeyword, sentStatusFilter, fetchSent]);

  // Search with debounce - Nhận từ Investor
  useEffect(() => {
    const t = setTimeout(() => { setReceivedPage(1); fetchReceived(1, receivedKeyword); }, 400);
    return () => clearTimeout(t);
  }, [receivedKeyword, fetchReceived]);

  // Search with debounce - Nhà đầu tư quan tâm
  useEffect(() => {
    const t = setTimeout(() => { setInterestedPage(1); fetchInterested(1, interestedKeyword); }, 400);
    return () => clearTimeout(t);
  }, [interestedKeyword, fetchInterested]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchInvestors(page, keyword, discoveryFilters);
  };

  const handleDiscoveryFilterChange = <K extends keyof DiscoveryFilterState>(
    key: K,
    value: DiscoveryFilterState[K],
  ) => {
    setDiscoveryFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetDiscoveryFilters = () => {
    setDiscoveryFilters(DEFAULT_DISCOVERY_FILTERS);
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
    fetchInvestors(currentPage, keyword, discoveryFilters);
    fetchSent(sentPage);
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
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm theo tên quỹ hoặc nhà đầu tư..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0"
                  />
                </div>
                <div className="relative">
                  <select
                    value={discoveryFilters.stageId}
                    onChange={(event) => handleDiscoveryFilterChange("stageId", event.target.value)}
                    className="h-11 min-w-[150px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[13px] font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50"
                  >
                    <option value="">Giai đoạn</option>
                    {stageOptions.map((option) => (
                      <option key={option.id} value={option.id.toString()}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative">
                  <select
                    value={discoveryFilters.industryId}
                    onChange={(event) => handleDiscoveryFilterChange("industryId", event.target.value)}
                    className="h-11 min-w-[190px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[13px] font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50"
                  >
                    <option value="">Ngành nghề ưu tiên</option>
                    {industryOptions.map((option) => (
                      <option key={option.id} value={option.id.toString()}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative">
                  <select
                    value={discoveryFilters.ticketRange}
                    onChange={(event) => handleDiscoveryFilterChange("ticketRange", event.target.value)}
                    className="h-11 min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[13px] font-medium text-slate-700 outline-none transition-colors hover:bg-slate-50"
                  >
                    {DISCOVERY_TICKET_RANGE_OPTIONS.map((option) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetDiscoveryFilters}
                  disabled={
                    discoveryFilters.stageId === "" &&
                    discoveryFilters.industryId === "" &&
                    discoveryFilters.ticketRange === ""
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <SlidersHorizontal className="size-4" />
                  <span>Xóa lọc</span>
                </Button>
              </div>
            </div>
            <div className="hidden">
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

            {/* Loading — skeleton cards thay vì spinner để tránh layout shift */}
            {isLoadingInvestors && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-pulse">
                    <div className="flex flex-1 flex-col p-6 text-center">
                      {/* Avatar */}
                      <div className="mx-auto mb-5 size-[84px] rounded-full bg-slate-200" />
                      {/* Badge */}
                      <div className="mx-auto mb-2 h-5 w-20 rounded-full bg-slate-200" />
                      {/* Name */}
                      <div className="mx-auto mb-2 h-6 w-36 rounded-lg bg-slate-200" />
                      {/* Subtitle */}
                      <div className="mx-auto mb-5 h-4 w-28 rounded-lg bg-slate-100" />
                      {/* Stats grid */}
                      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100/70 px-2 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-5 w-8 rounded bg-slate-200" />
                          <div className="h-3 w-16 rounded bg-slate-200" />
                        </div>
                        <div className="flex flex-col items-center gap-1 border-l border-slate-300/70">
                          <div className="h-5 w-20 rounded bg-slate-200" />
                          <div className="h-3 w-16 rounded bg-slate-200" />
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="mb-4 flex min-h-[58px] flex-wrap justify-center gap-1.5">
                        <div className="h-6 w-24 rounded-lg bg-slate-200" />
                        <div className="h-6 w-28 rounded-lg bg-slate-200" />
                        <div className="h-6 w-20 rounded-lg bg-slate-200" />
                      </div>
                      {/* Buttons */}
                      <div className="mt-auto flex gap-3 pt-2">
                        <div className="h-[44px] flex-1 rounded-xl bg-slate-200" />
                        <div className="h-[44px] flex-1 rounded-xl bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
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
                  const presentation = buildInvestorSearchPresentation(investor, {
                    institutionalIdentityLineMode: "organization",
                  });
                  const isKycVerified = isInvestorKycVerified(investor);
                  const connectionStatus = normalizeDiscoveryConnectionStatus(investor.connectionStatus);
                  const isAccepted =
                    connectionStatus === DISCOVERY_CONNECTION_STATUS.ACCEPTED ||
                    connectionStatus === DISCOVERY_CONNECTION_STATUS.IN_DISCUSSION;
                  const isPending = connectionStatus === DISCOVERY_CONNECTION_STATUS.REQUESTED;
                  const hasPendingIncomingInvite =
                    isPending && investor.initiatedByRole === "INVESTOR";
                  const hasPendingOutgoingInvite =
                    isPending && investor.initiatedByRole === "STARTUP";
                  const canRequestConnection = investor.canRequestConnection;
                  const conn =
                    investor.connectionId != null
                      ? ({
                          connectionID: investor.connectionId,
                          connectionStatus: isAccepted
                            ? "Accepted"
                            : isPending
                              ? "Requested"
                              : "Closed",
                          initiatedByRole: investor.initiatedByRole ?? undefined,
                        } as Pick<IConnectionItem, "connectionID" | "connectionStatus" | "initiatedByRole">)
                      : null;
                  const normalizedConnectionStatus = hasPendingOutgoingInvite
                    ? "WaitingResponse"
                    : isAccepted
                      ? "Accepted"
                      : !canRequestConnection
                        ? "Closed"
                        : normalizeConnectionStatus(conn?.connectionStatus) || "Closed";
                  const hasTicketSize = investor.ticketSizeMin != null || investor.ticketSizeMax != null;
                  const industries = (investor.preferredIndustries ?? []).map(getIndustryName).slice(0, 3);
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
                              className="h-[44px] flex-1 gap-1.5 rounded-xl bg-amber-500 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
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
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-[340px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input
                  value={sentKeyword}
                  onChange={e => setSentKeyword(e.target.value)}
                  placeholder="Tìm kiếm nhà đầu tư..."
                  className="w-full pl-10 h-10 bg-white border-slate-200 rounded-xl text-[13px]"
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái:</span>
                <div className="relative">
                  <select
                    value={sentStatusFilter}
                    onChange={e => { setSentStatusFilter(e.target.value); setSentPage(1); fetchSent(1, sentKeyword, e.target.value); }}
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-[13px] font-semibold text-slate-700 outline-none hover:bg-slate-50 transition-colors"
                  >
                    <option value="">Tất cả</option>
                    <option value="Requested">Đang chờ</option>
                    <option value="Rejected">Đã từ chối</option>
                    <option value="Withdrawn">Đã thu hồi</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {isLoadingSent ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#eec54e]" /></div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Nhà đầu tư</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Thông điệp</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Ngày gửi</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Trạng thái</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sentConnections.filter(c => normalizeConnectionStatus(c.connectionStatus) !== "Accepted").length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-14 text-center text-slate-400 text-[13px] font-medium">Chưa có lời mời nào được gửi.</td></tr>
                    )}
                    {sentConnections.filter(c => normalizeConnectionStatus(c.connectionStatus) !== "Accepted").map((item) => (
                      <tr key={item.connectionID} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <InvestorAvatar name={item.investorName} url={item.investorPhotoURL ?? undefined} size="size-9" />
                            <p className="text-[13px] font-bold text-slate-800">{item.investorName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[260px]">
                          <p className="text-[13px] text-slate-500 font-medium truncate">{item.personalizedMessage || "—"}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-[12px] font-medium text-slate-400">
                          {formatDate(item.requestedAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border", STATUS_STYLES[normalizeConnectionStatus(item.connectionStatus)] ?? "bg-slate-50 text-slate-500 border-slate-100")}>
                            <span className="size-1.5 rounded-full bg-current opacity-70" />
                            {STATUS_LABEL[normalizeConnectionStatus(item.connectionStatus)] ?? normalizeConnectionStatus(item.connectionStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPendingConnection(item.connectionStatus) ? (
                            <button
                              onClick={() => handleWithdrawConnection(item.connectionID)}
                              className="h-9 px-4 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all font-semibold text-[12px]"
                            >
                              Thu hồi
                            </button>
                          ) : isAcceptedConnection(item.connectionStatus) ? (
                            <button
                              onClick={() => router.push(`/startup/messaging?connectionId=${item.connectionID}`)}
                              className="h-9 px-4 rounded-xl bg-[#eec54e] text-[#171611] font-bold text-[12px] inline-flex items-center gap-1.5 hover:bg-[#d4ae3d] transition-colors"
                            >
                              <MessageCircle className="size-3.5" />
                              Nhắn tin
                            </button>
                          ) : (
                            <span className="text-[12px] font-medium text-slate-400">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-slate-400">Trang {sentPage} / {sentTotalPages}</p>
              <Pagination page={sentPage} total={sentTotalPages} onChange={(p) => { setSentPage(p); fetchSent(p, sentKeyword, sentStatusFilter); }} />
            </div>
          </div>
        );
      // Tab: Nhận từ Investor
      case "Nhận từ Investor":
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-[340px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input
                  value={receivedKeyword}
                  onChange={e => setReceivedKeyword(e.target.value)}
                  placeholder="Tìm kiếm nhà đầu tư..."
                  className="w-full pl-10 h-10 bg-white border-slate-200 rounded-xl text-[13px]"
                />
              </div>
            </div>

            {isLoadingReceived ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#eec54e]" /></div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Nhà đầu tư</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Lời nhắn</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Ngày gửi</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receivedConnections.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-14 text-center text-slate-400 text-[13px] font-medium">Chưa có nhà đầu tư nào gửi lời mời kết nối.</td></tr>
                    )}
                    {receivedConnections.map((item) => (
                      <tr key={item.connectionID} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <InvestorAvatar name={item.investorName} url={item.investorPhotoURL ?? undefined} size="size-9" />
                            <div>
                              <p className="text-[13px] font-bold text-slate-800">{item.investorName}</p>
                              {item.firmName && (
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.firmName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[260px]">
                          <p className="text-[13px] text-slate-500 font-medium truncate">{item.personalizedMessage || "—"}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-[12px] font-medium text-slate-400">
                          {formatDate(item.requestedAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isPendingConnection(item.connectionStatus) ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAcceptConnection(item.connectionID)}
                                className="h-9 px-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all font-semibold text-[12px]"
                              >
                                Chấp nhận
                              </button>
                              <button
                                onClick={() => handleRejectConnection(item.connectionID)}
                                className="h-9 px-4 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all font-semibold text-[12px]"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : isAcceptedConnection(item.connectionStatus) ? (
                            <button
                              onClick={() => router.push(`/startup/messaging?connectionId=${item.connectionID}`)}
                              className="h-9 px-4 rounded-xl bg-[#eec54e] text-[#171611] font-bold text-[12px] inline-flex items-center gap-1.5 hover:bg-[#d4ae3d] transition-colors"
                            >
                              <MessageCircle className="size-3.5" />
                              Nhắn tin
                            </button>
                          ) : (
                            <span className="text-[12px] font-medium text-slate-400">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-slate-400">Trang {receivedPage} / {receivedTotalPages}</p>
              <Pagination page={receivedPage} total={receivedTotalPages} onChange={(p) => { setReceivedPage(p); fetchReceived(p, receivedKeyword); }} />
            </div>
          </div>
        );
      // Tab: Nhà đầu tư quan tâm
      case "Nhà đầu tư quan tâm":
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-[340px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input
                  value={interestedKeyword}
                  onChange={e => setInterestedKeyword(e.target.value)}
                  placeholder="Tìm kiếm nhà đầu tư..."
                  className="w-full pl-10 h-10 bg-white border-slate-200 rounded-xl text-[13px]"
                />
              </div>
            </div>

            {interestedErrorCode === "MSG012" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] font-medium text-amber-800">
                Email của bạn chưa được xác minh. Vui lòng xác minh email để xem danh sách nhà đầu tư quan tâm.
              </div>
            )}
            {interestedErrorCode === "MSG041" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-[13px] font-medium text-amber-800">
                Hồ sơ startup chưa hoàn thiện. Vui lòng hoàn thiện hồ sơ để xem danh sách nhà đầu tư quan tâm.
              </div>
            )}
            {interestedErrorCode === "MSG008" && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] font-medium text-red-700">
                Không thể tải danh sách nhà đầu tư quan tâm lúc này. Vui lòng thử lại sau.
              </div>
            )}

            {isLoadingInterested ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#eec54e]" /></div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Nhà đầu tư</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Tóm tắt</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Xác minh</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Ngày quan tâm</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!interestedErrorCode && interestedInvestors.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-14 text-center text-slate-400 text-[13px] font-medium">Chưa có nhà đầu tư nào thêm startup của bạn vào watchlist.</td></tr>
                    )}
                    {interestedInvestors.map((item) => {
                      const { primaryName } = getInterestedInvestorDisplay(item);

                      return (
                      <tr key={`${item.investorId}-${item.dateOfInterest}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <InvestorAvatar name={primaryName} url={item.profilePhotoURL ?? undefined} size="size-9" />
                            <div>
                              <p className="text-[13px] font-bold text-slate-800">{primaryName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[260px]">
                          <p className="text-[13px] text-slate-500 font-medium line-clamp-2">{item.shortSummary || "—"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            item.verificationStatus === "VERIFIED"
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-sky-100 bg-sky-50 text-sky-700"
                          )}>
                            <span className="size-1.5 rounded-full bg-current opacity-70" />
                            {getVerificationBadgeLabel(item.verificationBadge)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-[12px] font-medium text-slate-400">
                          {formatDate(item.dateOfInterest)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/startup/investors/${item.investorId}`}>
                            <button className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-semibold text-[12px]">
                              Xem hồ sơ
                            </button>
                          </Link>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-slate-400">Trang {interestedPage} / {interestedTotalPages}</p>
              <Pagination page={interestedPage} total={interestedTotalPages} onChange={(p) => { setInterestedPage(p); fetchInterested(p, interestedKeyword); }} />
            </div>
          </div>
        );
      // ── Đã kết nối ──────────────────────────────────────────────────────
      case "Đã kết nối":
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-[340px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input
                  value={connectedKeyword}
                  onChange={e => setConnectedKeyword(e.target.value)}
                  placeholder="Tìm kiếm nhà đầu tư..."
                  className="w-full pl-10 h-10 bg-white border-slate-200 rounded-xl text-[13px]"
                />
              </div>
            </div>

            {isLoadingConnected ? (
              <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-[#eec54e]" /></div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Nhà đầu tư</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Thông điệp</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Ngày kết nối</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {connected.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-14 text-center text-slate-400 text-[13px] font-medium">Chưa có kết nối nào được chấp nhận.</td></tr>
                    )}
                    {connected.map((item) => (
                      <tr key={item.connectionID} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <InvestorAvatar name={item.investorName} url={item.investorPhotoURL ?? undefined} size="size-9" />
                            <p className="text-[13px] font-bold text-slate-800">{item.investorName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[300px]">
                          <p className="text-[13px] text-slate-500 font-medium border-l-2 border-slate-100 pl-3 truncate">
                            {item.personalizedMessage || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center text-[12px] font-medium text-slate-400">
                          {formatDate(item.respondedAt || item.requestedAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/startup/messaging?connectionId=${item.connectionID}`)}
                              className="h-9 px-4 rounded-xl bg-[#eec54e] text-[#171611] font-bold text-[12px] inline-flex items-center gap-1.5 hover:bg-[#d4ae3d] transition-colors"
                            >
                              <MessageCircle className="size-3.5" />
                              Nhắn tin
                            </button>
                            <Link href={`/startup/investors/${item.investorID}`}>
                              <button className="h-9 px-3 text-[12px] font-semibold text-slate-400 hover:text-slate-700 border border-slate-200 rounded-xl transition-all hover:bg-slate-50">
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

            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-slate-400">Trang {connectedPage} / {connectedTotalPages}</p>
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
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a58419]">Nhà đầu tư phù hợp</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-8 overflow-x-auto border-b border-slate-200">
          {["Khám phá", "Yêu cầu đã gửi", "Nhận từ Investor", "Nhà đầu tư quan tâm", "Đã kết nối"].map((tab) => (
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
