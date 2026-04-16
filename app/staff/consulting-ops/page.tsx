"use client";

import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  Clock,
  FileText,
  ShieldAlert,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  GetOversightReports,
  type IOversightReportParams,
} from "@/services/staff/consulting-oversight.api";
import type { IReportOversightItem } from "@/types/startup-mentorship";

// ── Review status UI config ──────────────────────────────────────────────────

const REVIEW_STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  PendingReview: { label: "Chờ thẩm định", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  Passed: { label: "Đã duyệt", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Failed: { label: "Không đạt", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
  NeedsMoreInfo: { label: "Cần bổ sung", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
};

const SESSION_STATUS_CFG: Record<string, { label: string; color: string }> = {
  Scheduled: { label: "Đã lên lịch", color: "text-blue-600" },
  InProgress: { label: "Đang diễn ra", color: "text-amber-600" },
  Conducted: { label: "Đã tư vấn", color: "text-indigo-600" },
  Completed: { label: "Hoàn tất", color: "text-emerald-600" },
  InDispute: { label: "Tranh chấp", color: "text-red-600" },
  Resolved: { label: "Đã giải quyết", color: "text-slate-600" },
  Cancelled: { label: "Đã hủy", color: "text-slate-400" },
};

// ── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = "PendingReview" | "Passed" | "NeedsMoreInfo" | "Failed" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "PendingReview", label: "Chờ duyệt" },
  { key: "Passed", label: "Đã duyệt" },
  { key: "NeedsMoreInfo", label: "Cần bổ sung" },
  { key: "Failed", label: "Không đạt" },
  { key: "all", label: "Tất cả" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ConsultingOpsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("PendingReview");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [items, setItems] = useState<IReportOversightItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // KPI counts
  const [kpiPending, setKpiPending] = useState(0);
  const [kpiPassed, setKpiPassed] = useState(0);
  const [kpiNeedsInfo, setKpiNeedsInfo] = useState(0);
  const [kpiFailed, setKpiFailed] = useState(0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: IOversightReportParams = {
        reviewStatus: activeTab,
        page,
        pageSize,
      };
      const res = await GetOversightReports(params) as unknown as IBackendRes<IPagingData<IReportOversightItem>>;
      const paginated = res.data;
      if (paginated) {
        setItems(paginated.items ?? paginated.data ?? []);
        setTotalItems(paginated.paging?.totalItems ?? 0);
      }
    } catch {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  // Fetch KPI counts on mount
  useEffect(() => {
    async function fetchKPI() {
      try {
        const [pending, passed, needsInfo, failed] = await Promise.allSettled([
          GetOversightReports({ reviewStatus: "PendingReview", page: 1, pageSize: 1 }),
          GetOversightReports({ reviewStatus: "Passed", page: 1, pageSize: 1 }),
          GetOversightReports({ reviewStatus: "NeedsMoreInfo", page: 1, pageSize: 1 }),
          GetOversightReports({ reviewStatus: "Failed", page: 1, pageSize: 1 }),
        ]);
        const extractTotal = (val: any) => ((val as any)?.data?.paging?.totalItems ?? 0);
        if (pending.status === "fulfilled") setKpiPending(extractTotal(pending.value));
        if (passed.status === "fulfilled") setKpiPassed(extractTotal(passed.value));
        if (needsInfo.status === "fulfilled") setKpiNeedsInfo(extractTotal(needsInfo.value));
        if (failed.status === "fulfilled") setKpiFailed(extractTotal(failed.value));
      } catch { /* silent */ }
    }
    fetchKPI();
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => { setPage(1); }, [activeTab]);

  // Client-side search filter on loaded items
  const filteredItems = search.trim()
    ? items.filter(
        (r) =>
          r.startupName.toLowerCase().includes(search.toLowerCase()) ||
          r.advisorName.toLowerCase().includes(search.toLowerCase()) ||
          String(r.reportID).includes(search)
      )
    : items;

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#eec54e]" />
            Vận hành tư vấn
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Soát xét báo cáo tư vấn của Advisor và quản lý session consulting.
          </p>
        </div>
        {kpiPending > 0 && (
          <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-[12px] font-bold text-amber-800 font-plus-jakarta-sans uppercase">
              {kpiPending} báo cáo chờ duyệt
            </span>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Chờ thẩm định", value: kpiPending, color: "text-amber-600" },
          { label: "Đã duyệt", value: kpiPassed, color: "text-emerald-600" },
          { label: "Cần bổ sung", value: kpiNeedsInfo, color: "text-blue-600" },
          { label: "Không đạt", value: kpiFailed, color: "text-red-600" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] font-plus-jakarta-sans flex flex-col items-center justify-center text-center min-h-[100px]"
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className={cn("text-[24px] font-black mt-1", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2.5 text-[13px] font-bold whitespace-nowrap border-b-2 -mb-px transition-all",
                activeTab === tab.key
                  ? "border-[#0f172a] text-[#0f172a]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
              {tab.key === "PendingReview" && kpiPending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                  {kpiPending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Refresh */}
        <div className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full font-plus-jakarta-sans">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Startup, Advisor hoặc Report ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all bg-slate-50/30 font-plus-jakarta-sans"
            />
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Làm mới
          </button>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-95"
              title="Xóa bộ lọc"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            <span className="ml-3 text-[13px] text-slate-500">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShieldAlert className="w-8 h-8 text-red-400" />
            <p className="text-[13px] text-red-500">{error}</p>
            <button onClick={fetchReports} className="text-[12px] font-bold text-[#eec54e] hover:underline">
              Thử lại
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <FileText className="w-8 h-8 text-slate-300" />
            <p className="text-[13px] text-slate-400">Không có báo cáo nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 font-plus-jakarta-sans">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-20">Report</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Các bên</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Session</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Review</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nộp lúc</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => {
                  const reviewCfg = REVIEW_STATUS_CFG[item.reviewStatus] ?? REVIEW_STATUS_CFG.PendingReview;
                  const sessCfg = SESSION_STATUS_CFG[item.sessionStatus] ?? { label: item.sessionStatus, color: "text-slate-500" };

                  return (
                    <tr key={item.reportID} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="text-[12px] font-bold text-slate-900 font-mono tracking-tighter">#{item.reportID}</span>
                        {item.supersededByReportID && (
                          <span className="block text-[10px] text-amber-600 font-medium mt-0.5">Đã thay thế</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-bold text-slate-900 font-plus-jakarta-sans">{item.startupName}</p>
                        <p className="text-[11px] text-slate-400 mt-1 font-medium italic truncate max-w-[200px]">với {item.advisorName}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[12px] font-bold text-slate-700 font-plus-jakarta-sans">Session #{item.sessionID}</p>
                        <p className={cn("text-[11px] font-medium mt-0.5", sessCfg.color)}>{sessCfg.label}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border font-plus-jakarta-sans", reviewCfg.badge)}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", reviewCfg.dot)} />
                          {reviewCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[11px] text-slate-400 font-medium">{timeAgo(item.submittedAt)}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/staff/consulting-ops/${item.reportID}`}
                          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] hover:text-[#e6cc4c] transition-colors group/btn"
                        >
                          Xem chi tiết
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-[12px] text-slate-400">
              Trang {page} / {totalPages} ({totalItems} báo cáo)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
