"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Loader2,
  ShieldAlert,
  User,
  Building2,
  Video,
} from "lucide-react";
import {
  GetOversightReports,
  MarkSessionDispute,
  MarkSessionResolved,
} from "@/services/staff/consulting-oversight.api";
import type { IReportOversightItem } from "@/types/startup-mentorship";
import { parseReportFields } from "@/lib/report-parser";
import { toast } from "sonner";

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

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ConsultingOpsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reportId = Number.parseInt(id, 10);

  const [report, setReport] = useState<IReportOversightItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionActionNote, setSessionActionNote] = useState("");
  const [isSessionActing, setIsSessionActing] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);

      try {
        const res =
          (await GetOversightReports({
            reviewStatus: "all",
            page: 1,
            pageSize: 200,
          })) as unknown as IBackendRes<IPagingData<IReportOversightItem>>;

        const items = res.data?.items ?? res.data?.data ?? [];
        const found = items.find((item) => item.reportID === reportId);

        if (!found) {
          setError("Báo cáo không tồn tại.");
        } else {
          setReport(found);
        }
      } catch {
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  const handleMarkDispute = async () => {
    if (!report || !sessionActionNote.trim()) {
      toast.error("Vui lòng nhập lý do tranh chấp.");
      return;
    }

    setIsSessionActing(true);
    try {
      await MarkSessionDispute(report.mentorshipID, report.sessionID, {
        reason: sessionActionNote.trim(),
      });
      toast.success("Session đã được đánh dấu tranh chấp.");
      setReport((prev) =>
        prev ? { ...prev, sessionStatus: "InDispute" } : prev
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsSessionActing(false);
    }
  };

  const handleResolveDispute = async (restoreCompleted: boolean) => {
    if (!report || !sessionActionNote.trim()) {
      toast.error("Vui lòng nhập ghi chú giải quyết.");
      return;
    }

    setIsSessionActing(true);
    try {
      await MarkSessionResolved(report.mentorshipID, report.sessionID, {
        resolution: sessionActionNote.trim(),
        restoreCompleted,
      });
      toast.success(
        restoreCompleted
          ? "Tranh chấp đã được giải quyết và session quay lại Completed."
          : "Tranh chấp đã được giải quyết và session chuyển sang Resolved."
      );
      setReport((prev) =>
        prev
          ? {
              ...prev,
              sessionStatus: restoreCompleted ? "Completed" : "Resolved",
            }
          : prev
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsSessionActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-3 text-[13px] text-slate-500">
          Đang tải báo cáo...
        </span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <ShieldAlert className="h-10 w-10 text-red-400" />
        <p className="text-[14px] text-red-500">
          {error ?? "Không tìm thấy báo cáo."}
        </p>
        <Link
          href="/staff/consulting-ops"
          className="text-[13px] font-bold text-[#eec54e] hover:underline"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const reviewCfg =
    REVIEW_STATUS_CFG[report.reviewStatus] ?? REVIEW_STATUS_CFG.Passed;
  const sessCfg = SESSION_STATUS_CFG[report.sessionStatus] ?? {
    label: report.sessionStatus,
    color: "text-slate-500",
  };
  const parsed = parseReportFields(
    report.reportSummary,
    report.detailedFindings,
    report.recommendations
  );

  const Field = ({ label, value }: { label: string; value: string }) =>
    value ? (
      <div>
        <h4 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </h4>
        <p className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 text-[14px] leading-relaxed text-slate-700">
          {value}
        </p>
      </div>
    ) : null;

  return (
    <div className="px-8 py-7 pb-12 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link
          href="/staff/consulting-ops"
          className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Quay lại Vận hành tư vấn
        </Link>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[11px] font-bold",
            reviewCfg.badge
          )}
        >
          {reviewCfg.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white shadow-lg">
                <Video className="h-7 w-7 text-[#eec54e]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                    Report #{report.reportID}
                  </h1>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Session #{report.sessionID}
                  </span>
                  <span>•</span>
                  <span className={cn("font-bold", sessCfg.color)}>
                    {sessCfg.label}
                  </span>
                  {report.startupConfirmedConductedAt && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-emerald-600">
                        Startup đã xác nhận
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
                Trạng thái contract mới
              </p>
            </div>
            <p className="text-[14px] leading-relaxed text-slate-700">
              Báo cáo này được hệ thống auto-approve ngay khi Advisor submit.
              Staff không còn duyệt report thủ công; chỉ cần theo dõi và mở
              tranh chấp session nếu phát hiện vấn đề.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Startup
                </p>
              </div>
              <p className="text-[14px] font-bold text-slate-900">
                {report.startupName}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Advisor
                </p>
              </div>
              <p className="text-[14px] font-bold text-slate-900">
                {report.advisorName}
              </p>
            </div>
          </div>

          {report.challengeDescription && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Mục tiêu tư vấn
              </h3>
              <p className="text-[14px] font-medium italic leading-relaxed text-slate-700">
                “{report.challengeDescription}”
              </p>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-tight text-slate-900">
                <FileText className="h-4 w-4 text-[#eec54e]" />
                Nội dung báo cáo
              </h3>
            </div>

            <div className="space-y-5 p-6">
              <Field label="Tiêu đề" value={parsed.title} />
              <Field label="Tóm tắt" value={parsed.summary} />
              <Field label="Nội dung thảo luận" value={parsed.discussionOverview} />
              <Field label="Phát hiện chính" value={parsed.keyFindings} />
              <Field label="Rủi ro nhận diện" value={parsed.identifiedRisks} />
              <Field
                label="Khuyến nghị của Advisor"
                value={parsed.advisorRecommendations}
              />
              <Field label="Các bước tiếp theo" value={parsed.nextSteps} />
              <Field label="Sản phẩm bàn giao" value={parsed.deliverablesSummary} />

              {report.attachmentsURL && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Tài liệu đính kèm
                    </h4>
                    <a
                      href={report.attachmentsURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 transition-colors hover:text-[#eec54e]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Tải xuống
                    </a>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate text-[13px] text-slate-600">
                      {report.attachmentsURL.split("/").pop()?.split("?")[0] ||
                        "Tài liệu đính kèm"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100">
            <h3 className="mb-6 text-[12px] font-bold uppercase tracking-widest text-slate-400">
              Quản lý session
            </h3>

            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-600">
              Report review thủ công đã bị loại khỏi flow. Staff chỉ can thiệp
              qua dispute hoặc resolution nếu cần.
            </div>

            <div className="space-y-3">
              {(report.sessionStatus === "Conducted" ||
                report.sessionStatus === "Completed") && (
                <button
                  onClick={handleMarkDispute}
                  disabled={isSessionActing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-[12px] font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSessionActing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  )}
                  Mở tranh chấp
                </button>
              )}

              {report.sessionStatus === "InDispute" && (
                <>
                  <button
                    onClick={() => handleResolveDispute(true)}
                    disabled={isSessionActing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[12px] font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Giải quyết → Completed
                  </button>
                  <button
                    onClick={() => handleResolveDispute(false)}
                    disabled={isSessionActing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    Giải quyết → Resolved
                  </button>
                </>
              )}

              {!["Conducted", "Completed", "InDispute"].includes(
                report.sessionStatus
              ) && (
                <p className="text-[11px] italic text-slate-400">
                  Không có hành động nào khả dụng cho trạng thái hiện tại.
                </p>
              )}
            </div>

            <div className="mt-6 border-t border-slate-50 pt-6">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Ghi chú hành động
              </p>
              <textarea
                rows={3}
                value={sessionActionNote}
                onChange={(e) => setSessionActionNote(e.target.value)}
                maxLength={2000}
                placeholder="Nhập lý do hoặc ghi chú cho action session..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#eec54e] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Thông tin
            </h3>

            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Mentorship</span>
                <span className="font-bold text-slate-700">
                  #{report.mentorshipID}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session</span>
                <span className="font-bold text-slate-700">
                  #{report.sessionID}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Review status</span>
                <span className="font-bold text-slate-700">
                  {reviewCfg.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session status</span>
                <span className={cn("font-bold", sessCfg.color)}>
                  {sessCfg.label}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Submitted at</span>
                <span className="text-right font-bold text-slate-700">
                  {formatDateTime(report.submittedAt)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Startup confirmed</span>
                <span className="text-right font-bold text-slate-700">
                  {formatDateTime(report.startupConfirmedConductedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
