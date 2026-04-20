"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bug,
  CalendarClock,
  ChevronLeft,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquareText,
  Paperclip,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  GetIssueReportById,
  type IssueReportDetailDto,
} from "@/services/issue-report.api";
import {
  formatIssueReportDateTime,
  formatIssueReportEntityReference,
  formatIssueReportUpdatedAt,
  getIssueCategoryOption,
  getIssueStatusOption,
} from "@/lib/issue-report";

type BackendRequestError<T = unknown> = {
  response?: {
    status?: number;
    data?: IBackendRes<T>;
  };
};

const isForbiddenResponse = (response?: IBackendRes<unknown> | null, status?: number | null) =>
  status === 403 || response?.statusCode === 403 || response?.error?.code === "FORBIDDEN";

const isNotFoundResponse = (response?: IBackendRes<unknown> | null, status?: number | null) =>
  status === 404 ||
  response?.statusCode === 404 ||
  response?.error?.code === "ISSUE_REPORT_NOT_FOUND";

export function IssueReportDetailPage({
  id,
  roleBaseUrl,
}: {
  id: number;
  roleBaseUrl: string;
}) {
  const [report, setReport] = useState<IssueReportDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const fetchReport = useCallback(async () => {
    if (Number.isNaN(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setForbidden(false);

    try {
      const res = (await GetIssueReportById(id)) as unknown as IBackendRes<IssueReportDetailDto>;

      if ((res.success || res.isSuccess) && res.data) {
        setReport(res.data);
        return;
      }

      if (isForbiddenResponse(res)) {
        setReport(null);
        setForbidden(true);
        return;
      }

      if (isNotFoundResponse(res)) {
        setReport(null);
        setNotFound(true);
        return;
      }

      setReport(null);
      setError(res.message || "Không thể tải chi tiết báo cáo.");
    } catch (fetchError) {
      const backendError = fetchError as BackendRequestError<IssueReportDetailDto>;
      const status = backendError.response?.status ?? null;
      const response = backendError.response?.data;

      if (isForbiddenResponse(response, status)) {
        setReport(null);
        setForbidden(true);
        return;
      }

      if (isNotFoundResponse(response, status)) {
        setReport(null);
        setNotFound(true);
        return;
      }

      setReport(null);
      setError(backendError.response?.data?.message || "Không thể tải chi tiết báo cáo.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const category = useMemo(() => getIssueCategoryOption(report?.category), [report?.category]);
  const status = useMemo(() => getIssueStatusOption(report?.status), [report?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-3 text-[13px] text-slate-500">Đang tải chi tiết báo cáo...</span>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <ShieldAlert className="h-10 w-10 text-amber-400" />
        <p className="text-[14px] font-semibold text-slate-700">
          Bạn không có quyền xem báo cáo này.
        </p>
        <Link href={roleBaseUrl} className="text-[13px] font-bold text-[#eec54e] hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <XCircle className="h-10 w-10 text-slate-300" />
        <p className="text-[14px] font-semibold text-slate-600">Không tìm thấy báo cáo sự cố.</p>
        <Link href={roleBaseUrl} className="text-[13px] font-bold text-[#eec54e] hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <ShieldAlert className="h-10 w-10 text-red-400" />
        <p className="text-[14px] text-red-500">{error ?? "Không thể tải chi tiết báo cáo."}</p>
        <button onClick={fetchReport} className="text-[13px] font-bold text-[#eec54e] hover:underline">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link
          href={roleBaseUrl}
          className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Quay lại danh sách báo cáo của tôi
        </Link>

        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                  category?.bg ?? "bg-amber-50"
                )}
              >
                {category ? (
                  <category.icon className={cn("h-6 w-6", category.color)} />
                ) : (
                  <Bug className="h-6 w-6 text-[#eec54e]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                    Báo cáo #{report.issueReportID}
                  </h1>
                  {status && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold",
                        status.badge
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-slate-400">
                  <span>{category?.label ?? report.category}</span>
                  <span>•</span>
                  <span>{formatIssueReportEntityReference(report.relatedEntityType, report.relatedEntityID)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Timeline
                </p>
              </div>
              <p className="text-[13px] font-bold text-slate-900">
                Gửi lúc: {formatIssueReportDateTime(report.submittedAt)}
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Cập nhật: {formatIssueReportUpdatedAt(report.updatedAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Phản hồi từ staff
                </p>
              </div>
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">
                {report.staffNote?.trim() || "Chưa có phản hồi xử lý cho báo cáo này."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#eec54e]" />
              <h2 className="text-[13px] font-bold uppercase tracking-tight text-slate-900">
                Mô tả sự cố
              </h2>
            </div>
            <p className="whitespace-pre-wrap rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-[14px] leading-relaxed text-slate-700">
              {report.description}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-[#eec54e]" />
              <h2 className="text-[13px] font-bold uppercase tracking-tight text-slate-900">
                Tệp đính kèm
              </h2>
            </div>

            {report.attachments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-5 py-8 text-center text-[13px] text-slate-400">
                Báo cáo này không có tệp đính kèm.
              </div>
            ) : (
              <div className="space-y-3">
                {report.attachments.map((attachment) => (
                  <a
                    key={attachment.attachmentID}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:border-[#eec54e]/40 hover:bg-amber-50/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-slate-900 group-hover:text-[#b98500]">
                        {attachment.fileName}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {attachment.mimeType} • {Math.round(attachment.fileSize / 1024)} KB
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#eec54e]" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Tóm tắt nhanh
            </h3>

            <div className="mt-4 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Liên quan</span>
                <span className="text-right font-bold text-slate-700">
                  {formatIssueReportEntityReference(report.relatedEntityType, report.relatedEntityID)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Trạng thái</span>
                <span className="text-right font-bold text-slate-700">
                  {status?.label ?? report.status}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Tệp đính kèm</span>
                <span className="text-right font-bold text-slate-700">
                  {report.attachments.length} tệp
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Phản hồi từ staff</span>
                <span className="text-right font-bold text-slate-700">
                  {report.staffNote?.trim() ? "Đã có phản hồi" : "Chưa có phản hồi"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Cập nhật cuối</span>
                <span className="text-right font-bold text-slate-700">
                  {formatIssueReportUpdatedAt(report.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
