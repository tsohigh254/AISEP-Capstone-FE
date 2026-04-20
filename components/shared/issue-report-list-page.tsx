"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bug,
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GetMyIssueReports,
  type IssueCategory,
  type IssueReportStatus,
  type IssueReportSummaryDto,
  type RelatedEntityType,
} from "@/services/issue-report.api";
import {
  formatIssueReportDateTime,
  formatIssueReportUpdatedAt,
  getIssueCategoryOption,
  getIssueStatusOption,
  ISSUE_REPORT_CATEGORIES,
  ISSUE_REPORT_ENTITY_LABELS,
  ISSUE_REPORT_STATUS_OPTIONS,
} from "@/lib/issue-report";

const PAGE_SIZE = 20;

type CategoryFilter = IssueCategory | "ALL";
type StatusFilter = IssueReportStatus | "ALL";

type BackendRequestError = {
  response?: {
    data?: IBackendRes<unknown>;
  };
};

const getItems = (payload?: IPaginatedRes<IssueReportSummaryDto> | null) =>
  payload?.items ?? payload?.data ?? [];

const getTotalPages = (payload?: IPaginatedRes<IssueReportSummaryDto> | null) => {
  const totalItems = payload?.paging?.totalItems ?? getItems(payload).length;
  const pageSize = payload?.paging?.pageSize ?? PAGE_SIZE;
  return payload?.paging?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
};

export function IssueReportListPage({ roleBaseUrl }: { roleBaseUrl: string }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [items, setItems] = useState<IssueReportSummaryDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = (await GetMyIssueReports({
        page,
        pageSize: PAGE_SIZE,
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(categoryFilter !== "ALL" && { category: categoryFilter }),
      })) as unknown as IBackendRes<IPaginatedRes<IssueReportSummaryDto>>;

      if ((res.success || res.isSuccess) && res.data) {
        const nextItems = getItems(res.data);
        setItems(nextItems);
        setTotalItems(res.data.paging?.totalItems ?? nextItems.length);
        setTotalPages(getTotalPages(res.data));
        return;
      }

      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
      setError(res.message || "Không thể tải danh sách báo cáo của bạn.");
    } catch (fetchError) {
      const backendError = fetchError as BackendRequestError;
      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
      setError(backendError.response?.data?.message || "Không thể tải danh sách báo cáo của bạn.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, statusFilter]);

  const displayedItems = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();

    return items.filter((item) => {
      if (!searchQuery) return true;

      return (
        String(item.issueReportID).includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery) ||
        (item.relatedEntityType ?? "").toLowerCase().includes(searchQuery) ||
        String(item.relatedEntityID ?? "").includes(searchQuery)
      );
    });
  }, [items, search]);

  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 font-plus-jakarta-sans text-[20px] font-bold tracking-tight text-slate-900">
            <Bug className="h-5 w-5 text-[#eec54e]" />
            Báo cáo của tôi
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Theo dõi các báo cáo bạn đã gửi và xem phản hồi xử lý từ đội ngũ vận hành.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Làm mới
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo mã báo cáo, mô tả hoặc thực thể trên trang hiện tại..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/30 py-2.5 pl-10 pr-4 text-[13px] placeholder:text-slate-400 transition-all focus:border-[#eec54e] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-bold transition-all shadow-sm active:scale-95",
                  categoryFilter !== "ALL"
                    ? "border-[#eec54e] bg-amber-50 text-[#C8A000]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <span>
                  {categoryFilter === "ALL"
                    ? "Mọi danh mục"
                    : ISSUE_REPORT_CATEGORIES.find((item) => item.value === categoryFilter)?.label}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[220px] rounded-2xl border-slate-100 bg-white p-1.5 font-plus-jakarta-sans shadow-xl"
            >
              <DropdownMenuRadioGroup
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
              >
                <DropdownMenuRadioItem
                  value="ALL"
                  className="cursor-pointer rounded-xl py-2 text-[12px] font-medium focus:bg-slate-50"
                >
                  Mọi danh mục
                </DropdownMenuRadioItem>
                {ISSUE_REPORT_CATEGORIES.map((category) => (
                  <DropdownMenuRadioItem
                    key={category.value}
                    value={category.value}
                    className="cursor-pointer rounded-xl py-2 text-[12px] font-medium focus:bg-slate-50"
                  >
                    {category.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-bold transition-all shadow-sm active:scale-95",
                  statusFilter !== "ALL"
                    ? "border-[#eec54e] bg-amber-50 text-[#C8A000]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <span>
                  {statusFilter === "ALL"
                    ? "Mọi trạng thái"
                    : ISSUE_REPORT_STATUS_OPTIONS.find((item) => item.value === statusFilter)?.label}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[220px] rounded-2xl border-slate-100 bg-white p-1.5 font-plus-jakarta-sans shadow-xl"
            >
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <DropdownMenuRadioItem
                  value="ALL"
                  className="cursor-pointer rounded-xl py-2 text-[12px] font-medium focus:bg-slate-50"
                >
                  Mọi trạng thái
                </DropdownMenuRadioItem>
                {ISSUE_REPORT_STATUS_OPTIONS.map((status) => (
                  <DropdownMenuRadioItem
                    key={status.value}
                    value={status.value}
                    className="cursor-pointer rounded-xl py-2 text-[12px] font-medium focus:bg-slate-50"
                  >
                    {status.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="rounded-xl border border-rose-100 bg-rose-50 p-2.5 text-rose-500 transition-all hover:bg-rose-100 active:scale-95"
              title="Xóa bộ lọc"
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-3 text-[13px] text-slate-500">Đang tải danh sách báo cáo...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <ShieldAlert className="h-8 w-8 text-red-400" />
            <p className="text-[13px] text-red-500">{error}</p>
            <button
              onClick={fetchReports}
              className="text-[12px] font-bold text-[#eec54e] hover:underline"
            >
              Thử lại
            </button>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Bug className="h-8 w-8 text-slate-300" />
            <p className="text-[14px] font-semibold text-slate-500">
              {hasActiveFilters
                ? "Không có báo cáo phù hợp với bộ lọc hiện tại."
                : "Bạn chưa gửi báo cáo nào."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-[12px] font-bold text-[#eec54e] hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 font-plus-jakarta-sans">
                  <th className="w-24 px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Mã số
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Danh mục
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Liên quan
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {displayedItems.map((item) => {
                  const category = getIssueCategoryOption(item.category);
                  const status = getIssueStatusOption(item.status);
                  const entityLabel = item.relatedEntityType
                    ? ISSUE_REPORT_ENTITY_LABELS[item.relatedEntityType as RelatedEntityType] ??
                      item.relatedEntityType
                    : "Không gắn thực thể";

                  return (
                    <tr
                      key={item.issueReportID}
                      className="group cursor-pointer transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-[12px] font-bold tracking-tighter text-slate-900">
                          #{item.issueReportID}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {category ? (
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-xl",
                                category.bg
                              )}
                            >
                              <category.icon className={cn("h-4 w-4", category.color)} />
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-900">{category.label}</p>
                              <p className="text-[11px] text-slate-400">{item.category}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[13px] font-bold text-slate-900">{item.category}</p>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[13px] font-bold text-slate-900">{entityLabel}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {item.relatedEntityID != null ? `#${item.relatedEntityID}` : "Không có ID"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        {status ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold",
                              status.badge
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                            {status.label}
                          </span>
                        ) : (
                          <span className="text-[12px] font-bold text-slate-500">{item.status}</span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[12px] font-bold text-slate-700">
                          {formatIssueReportDateTime(item.submittedAt)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Cập nhật: {formatIssueReportUpdatedAt(item.updatedAt)}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`${roleBaseUrl}/${item.issueReportID}`}
                          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] transition-colors hover:text-[#e6cc4c]"
                        >
                          Xem chi tiết
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-[12px] text-slate-400">
              Trang {page} / {Math.max(totalPages, 1)} ({totalItems} báo cáo)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-40"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
