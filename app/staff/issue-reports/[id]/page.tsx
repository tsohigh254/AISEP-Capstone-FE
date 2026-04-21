"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bug,
  CalendarClock,
  CheckCircle2,
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
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GetIssueReportById,
  UpdateIssueReportStatus,
  type IssueReportDetailDto,
  type IssueReportStatus,
} from "@/services/issue-report.api";
import {
  formatIssueReporterIdentity,
  formatIssueReportDateTime,
  formatIssueReportEntityReference,
  formatIssueReportUpdatedAt,
  getIssueReporterAvatarStyle,
  getIssueReporterInitials,
  ISSUE_REPORT_STATUS_OPTIONS,
  getIssueCategoryOption,
  getIssueStatusOption,
} from "@/lib/issue-report";

const ISSUE_REPORT_LIST_URL = "/staff/issue-reports";

const isForbiddenResponse = (response?: IBackendRes<unknown> | null, status?: number | null) =>
  status === 403 || response?.statusCode === 403 || response?.error?.code === "FORBIDDEN";

const isNotFoundResponse = (response?: IBackendRes<unknown> | null, status?: number | null) =>
  status === 404 ||
  response?.statusCode === 404 ||
  response?.error?.code === "ISSUE_REPORT_NOT_FOUND";

type BackendRequestError<T = unknown> = {
  response?: {
    status?: number;
    data?: IBackendRes<T>;
  };
};

export default function StaffIssueReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reportId = Number.parseInt(id, 10);
  const router = useRouter();

  const [report, setReport] = useState<IssueReportDetailDto | null>(null);
  const [note, setNote] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<IssueReportStatus | null>(null);

  const handleForbidden = useCallback(() => {
    toast.error("Bạn không có quyền xem báo cáo này.");
    router.replace(ISSUE_REPORT_LIST_URL);
  }, [router]);

  const fetchReport = useCallback(
    async (preserveLayout = false) => {
      if (Number.isNaN(reportId)) {
        setNotFound(true);
        setError(null);
        setLoading(false);
        return;
      }

      if (!preserveLayout) setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const res = (await GetIssueReportById(reportId)) as unknown as IBackendRes<IssueReportDetailDto>;

        if ((res.success || res.isSuccess) && res.data) {
          setReport(res.data);
          setNote(res.data.staffNote ?? "");
          setNoteDirty(false);
          return;
        }

        if (isForbiddenResponse(res)) {
          handleForbidden();
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
          handleForbidden();
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
    },
    [handleForbidden, reportId]
  );

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const category = useMemo(() => getIssueCategoryOption(report?.category), [report?.category]);
  const status = useMemo(() => getIssueStatusOption(report?.status), [report?.status]);
  const currentStatus = status?.value ?? null;
  const pendingStatusLabel = pendingStatus
    ? ISSUE_REPORT_STATUS_OPTIONS.find((item) => item.value === pendingStatus)?.label || pendingStatus
    : "";

  const handleNoteChange = (value: string) => {
    setNote(value);
    setNoteDirty(value !== (report?.staffNote ?? ""));
  };

  const submitStatusUpdate = async (nextStatus: IssueReportStatus) => {
    if (!report || updating) return;

    setUpdating(true);

    try {
      const res = (await UpdateIssueReportStatus(report.issueReportID, {
        status: nextStatus,
        ...(noteDirty && { staffNote: note }),
      })) as unknown as IBackendRes<IssueReportDetailDto>;

      if ((res.success || res.isSuccess) && res.data) {
        toast.success("Đã cập nhật trạng thái báo cáo.");
        setPendingStatus(null);
        await fetchReport(true);
        return;
      }

      if (isForbiddenResponse(res)) {
        handleForbidden();
        return;
      }

      if (isNotFoundResponse(res)) {
        setReport(null);
        setNotFound(true);
        return;
      }

      toast.error(res.message || "Không thể cập nhật trạng thái báo cáo.");
    } catch (updateError) {
      const backendError = updateError as BackendRequestError<IssueReportDetailDto>;
      const statusCode = backendError.response?.status ?? null;
      const response = backendError.response?.data;

      if (isForbiddenResponse(response, statusCode)) {
        handleForbidden();
        return;
      }

      if (isNotFoundResponse(response, statusCode)) {
        setReport(null);
        setNotFound(true);
        return;
      }

      toast.error(
        backendError.response?.data?.message || "Không thể cập nhật trạng thái báo cáo."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-3 text-[13px] text-slate-500">Đang tải chi tiết báo cáo...</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <XCircle className="h-10 w-10 text-slate-300" />
        <p className="text-[14px] font-semibold text-slate-600">
          Không tìm thấy báo cáo sự cố.
        </p>
        <Link
          href={ISSUE_REPORT_LIST_URL}
          className="text-[13px] font-bold text-[#eec54e] hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <ShieldAlert className="h-10 w-10 text-red-400" />
        <p className="text-[14px] text-red-500">
          {error ?? "Không thể tải chi tiết báo cáo."}
        </p>
        <button
          onClick={() => fetchReport()}
          className="text-[13px] font-bold text-[#eec54e] hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open && !updating) {
            setPendingStatus(null);
          }
        }}
      >
        <DialogContent className="max-w-[460px] overflow-hidden rounded-2xl border-none p-0 shadow-2xl">
          <div className="bg-gradient-to-br from-[#fff8e7] via-white to-white px-6 py-5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-[18px] font-bold tracking-tight text-slate-900">
                Xác nhận cập nhật trạng thái
              </DialogTitle>
              <DialogDescription className="mt-2 text-[13px] leading-relaxed text-slate-500">
                {pendingStatus === "DISMISSED"
                  ? `Bạn sắp bác bỏ báo cáo #${report.issueReportID}. Hành động này sẽ cập nhật trạng thái ngay cho người gửi.`
                  : `Chuyển báo cáo #${report.issueReportID} sang trạng thái "${pendingStatusLabel}" và lưu ghi chú staff hiện tại nếu bạn đã chỉnh sửa.`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={() => setPendingStatus(null)}
              disabled={updating}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => pendingStatus && void submitStatusUpdate(pendingStatus)}
              disabled={updating || !pendingStatus}
              className={cn(
                "inline-flex min-w-[150px] items-center justify-center rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-all disabled:opacity-50",
                pendingStatus === "DISMISSED"
                  ? "bg-slate-900 hover:bg-slate-800"
                  : "bg-[#eec54e] hover:bg-[#e6cc4c]"
              )}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật
                </>
              ) : (
                "Xác nhận cập nhật"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="px-8 py-7 pb-12 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Link
            href={ISSUE_REPORT_LIST_URL}
            className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Quay lại danh sách báo cáo sự cố
          </Link>

          <button
            onClick={() => fetchReport(true)}
            disabled={updating}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", updating && "animate-spin")} />
            Tải lại
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
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
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br text-[13px] font-bold text-white shadow-sm",
                      getIssueReporterAvatarStyle(report.reporterUserType)
                    )}
                  >
                    {report.reporterAvatarUrl ? (
                      <Image
                        src={report.reporterAvatarUrl}
                        alt={report.reporterEmail || "Reporter avatar"}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getIssueReporterInitials(report.reporterEmail, report.reporterUserType)
                    )}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Người báo cáo
                  </p>
                </div>
                <p className="text-[14px] font-bold text-slate-900">
                  {report.reporterEmail || "Không có email"}
                </p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {formatIssueReporterIdentity(report.reporterUserType, report.reporterUserID)}
                </p>
              </div>

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
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
                Xử lý báo cáo
              </h2>

              <div className="mt-5 space-y-3">
                {ISSUE_REPORT_STATUS_OPTIONS.map((statusOption) => {
                  const active = currentStatus === statusOption.value;
                  return (
                    <button
                      key={statusOption.value}
                      onClick={() => setPendingStatus(statusOption.value)}
                      disabled={updating || active}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                        active
                          ? `${statusOption.badge} cursor-default`
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {updating && !active && pendingStatus === statusOption.value ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {statusOption.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-slate-400" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Ghi chú staff
                  </p>
                </div>

                <textarea
                  rows={6}
                  value={note}
                  onChange={(event) => handleNoteChange(event.target.value)}
                  maxLength={2000}
                  placeholder="Nhập ghi chú xử lý. Để trống rồi bấm cập nhật sẽ xóa note hiện tại."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#eec54e] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20"
                />

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {noteDirty
                      ? "Đã chỉnh sửa, sẽ gửi kèm lần cập nhật tiếp theo."
                      : "Chưa thay đổi note."}
                  </span>
                  <span>{note.length} / 2000</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Tóm tắt nhanh
              </h3>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Liên quan</span>
                  <span className="text-right font-bold text-slate-700">
                    {formatIssueReportEntityReference(report.relatedEntityType, report.relatedEntityID)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Người gửi</span>
                  <span className="text-right font-bold text-slate-700">
                    {report.reporterEmail || "Không có email"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Tệp đính kèm</span>
                  <span className="text-right font-bold text-slate-700">
                    {report.attachments.length} tệp
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Phản hồi staff</span>
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
    </>
  );
}
