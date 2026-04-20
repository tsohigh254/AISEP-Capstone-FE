"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  RefreshCw,
  FileText,
  Loader2,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import {
  GetOversightReports,
  type IOversightReportParams,
} from "@/services/staff/consulting-oversight.api";
import type { IReportOversightItem } from "@/types/startup-mentorship";

type TabKey = "all" | "Passed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "Passed", label: "Đã auto-approve" },
];

const REVIEW_STATUS_CFG: Record<string, { label: string; badge: string }> = {
  Passed: {
    label: "Đã hoàn tất",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Failed: {
    label: "Không đạt",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  NeedsMoreInfo: {
    label: "Cần bổ sung",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const SESSION_STATUS_CFG: Record<string, { label: string; color: string }> = {
  Conducted: { label: "Đã tư vấn", color: "text-indigo-600" },
  Completed: { label: "Hoàn tất", color: "text-emerald-600" },
  InDispute: { label: "Tranh chấp", color: "text-red-600" },
  Resolved: { label: "Đã giải quyết", color: "text-slate-600" },
  Scheduled: { label: "Đã lên lịch", color: "text-blue-600" },
  InProgress: { label: "Đang diễn ra", color: "text-amber-600" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function ConsultingOpsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [items, setItems] = useState<IReportOversightItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiTotal, setKpiTotal] = useState(0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: IOversightReportParams = {
        reviewStatus: activeTab,
        page,
        pageSize,
      };

      const res =
        (await GetOversightReports(params)) as unknown as IBackendRes<
          IPagingData<IReportOversightItem>
        >;
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

  useEffect(() => {
    async function fetchKpi() {
      try {
        const res =
          (await GetOversightReports({
            reviewStatus: "all",
            page: 1,
            pageSize: 1,
          })) as unknown as IBackendRes<IPagingData<IReportOversightItem>>;
        setKpiTotal(res.data?.paging?.totalItems ?? 0);
      } catch {
        setKpiTotal(0);
      }
    }

    fetchKpi();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();

    return items.filter(
      (item) =>
        item.startupName.toLowerCase().includes(q) ||
        item.advisorName.toLowerCase().includes(q) ||
        String(item.reportID).includes(q)
    );
  }, [items, search]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 font-plus-jakarta-sans text-[20px] font-bold tracking-tight text-slate-900">
            <Users className="h-5 w-5 text-[#eec54e]" />
            Vận hành tư vấn
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Báo cáo tư vấn được auto-approve khi Advisor submit. Staff chỉ theo
            dõi và mở tranh chấp session khi phát hiện vấn đề.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-[12px] font-bold uppercase text-emerald-800">
            {kpiTotal} báo cáo đã ghi nhận
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-slate-100 px-6 pt-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-[13px] font-bold transition-all",
                activeTab === tab.key
                  ? "border-[#0f172a] text-[#0f172a]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 p-4 md:flex-row">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Startup, Advisor hoặc Report ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 py-2.5 pl-10 pr-4 text-[13px] placeholder:text-slate-400 transition-all focus:border-[#eec54e] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20"
            />
          </div>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-3 text-[13px] text-slate-500">
              Đang tải...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <ShieldAlert className="h-8 w-8 text-red-400" />
            <p className="text-[13px] text-red-500">{error}</p>
            <button
              onClick={fetchReports}
              className="text-[12px] font-bold text-[#eec54e] hover:underline"
            >
              Thử lại
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <FileText className="h-8 w-8 text-slate-300" />
            <p className="text-[13px] text-slate-400">Không có báo cáo nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="w-20 px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Report
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Các bên
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Session
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Nộp lúc
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => {
                  const reviewCfg =
                    REVIEW_STATUS_CFG[item.reviewStatus] ??
                    REVIEW_STATUS_CFG.Passed;
                  const sessCfg = SESSION_STATUS_CFG[item.sessionStatus] ?? {
                    label: item.sessionStatus,
                    color: "text-slate-500",
                  };

                  return (
                    <tr
                      key={item.reportID}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-[12px] font-bold tracking-tighter text-slate-900">
                          #{item.reportID}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[13px] font-bold text-slate-900">
                          {item.startupName}
                        </p>
                        <p className="mt-1 max-w-[200px] truncate text-[11px] font-medium italic text-slate-400">
                          với {item.advisorName}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[12px] font-bold text-slate-700">
                          Session #{item.sessionID}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-[11px] font-medium",
                            sessCfg.color
                          )}
                        >
                          {sessCfg.label}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold",
                            reviewCfg.badge
                          )}
                        >
                          {reviewCfg.label}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-[11px] font-medium text-slate-400">
                          {timeAgo(item.submittedAt)}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/staff/consulting-ops/${item.reportID}`}
                          className="group/btn inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] transition-colors hover:text-[#e6cc4c]"
                        >
                          Xem chi tiết
                          <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-[12px] text-slate-400">
              Trang {page} / {totalPages} ({totalItems} báo cáo)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40"
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
