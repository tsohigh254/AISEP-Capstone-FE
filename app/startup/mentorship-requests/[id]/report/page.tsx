"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  FileText,
  Download,
  CheckCircle2,
  BadgeCheck,
  Calendar,
  Paperclip,
  ExternalLink,
  Loader2,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import {
  AcknowledgeMentorshipReport,
  GetMentorshipReport,
} from "@/services/startup/startup-mentorship.api";
import type { IMentorshipReport } from "@/types/startup-mentorship";
import { toast } from "sonner";
import { IssueReportModal } from "@/components/shared/issue-report-modal";

type AcknowledgeMentorshipReportResponse = {
  reviewStatus?: string | null;
  startupAcknowledgedAt?: string | null;
};

type AcknowledgeMentorshipReportError = {
  response?: {
    data?: {
      code?: string;
      message?: string;
    };
  };
};

export default function ConsultingReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [report, setReport] = useState<IMentorshipReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await GetMentorshipReport(Number(id));
        if (res.isSuccess && res.data) {
          setReport(res.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleDownload = () => {
    if (report?.attachmentsURL) {
      window.open(report.attachmentsURL, "_blank", "noopener,noreferrer");
    }
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleAcknowledge = async () => {
    if (!report?.reportID) return;

    setIsAcknowledging(true);
    try {
      const res = await AcknowledgeMentorshipReport(Number(id), report.reportID);
      const envelope = res as unknown as IBackendRes<AcknowledgeMentorshipReportResponse>;
      const payload = envelope.data ?? {};
      setReport((prev) =>
        prev
          ? {
              ...prev,
              reviewStatus: payload.reviewStatus || prev.reviewStatus || "Passed",
              startupAcknowledgedAt:
                payload.startupAcknowledgedAt || prev.startupAcknowledgedAt || new Date().toISOString(),
            }
          : prev
      );
      toast.success(envelope.message || "Đã xác nhận đã đọc báo cáo.");
    } catch (err: unknown) {
      const error = err as AcknowledgeMentorshipReportError;
      const code = error.response?.data?.code;
      if (code === "ALREADY_ACKNOWLEDGED") {
        setReport((prev) =>
          prev
            ? {
                ...prev,
                startupAcknowledgedAt: prev.startupAcknowledgedAt || new Date().toISOString(),
              }
            : prev
        );
      }
      toast.error(error.response?.data?.message || "Không thể xác nhận báo cáo lúc này.");
    } finally {
      setIsAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[900px] mx-auto pt-20 text-center text-slate-400 text-[13px]">
          Đang tải báo cáo...
        </div>
      </StartupShell>
    );
  }

  if (notFound || !report) {
    return (
      <StartupShell>
        <div className="max-w-[900px] mx-auto pt-20 text-center space-y-4">
          <p className="text-[15px] font-semibold text-slate-700">Chưa có báo cáo</p>
          <p className="text-[13px] text-slate-400">
            Báo cáo sẽ được hiển thị ngay sau khi cố vấn nộp thành công.
          </p>
          <button
            onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
            className="mt-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Quay lại chi tiết yêu cầu
          </button>
        </div>
      </StartupShell>
    );
  }

  const createdDate = new Date(report.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const createdTime = new Date(report.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const acknowledgedTime = report.startupAcknowledgedAt
    ? new Date(report.startupAcknowledgedAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const canAcknowledge =
    report.reviewStatus === "Passed" && !report.startupAcknowledgedAt;
  const deadlineDate = report.issueReportDeadlineAt ? new Date(report.issueReportDeadlineAt) : null;
  const hasValidDeadline = Boolean(deadlineDate && !Number.isNaN(deadlineDate.getTime()));
  const deadlineLabel = hasValidDeadline
    ? deadlineDate!.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const canReportIssue = Boolean(report.reportID && report.canSubmitIssueReport);
  const reportIssueTitle = report.title?.trim()
    ? `Báo cáo tư vấn: ${report.title.trim()}`
    : `Báo cáo tư vấn #${report.reportID}`;

  return (
    <StartupShell>
      <div className="max-w-[900px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-7 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#eec54e]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BadgeCheck className="w-4 h-4 text-[#eec54e]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#eec54e]">
                    Báo cáo tư vấn
                  </span>
                </div>
                <h1 className="text-[26px] font-black tracking-tight leading-tight">Kết quả phiên hướng dẫn</h1>
                <p className="text-[13px] text-white/70 mt-2 max-w-[520px] leading-relaxed">
                  Báo cáo đã sẵn sàng ngay sau khi cố vấn nộp thành công. Bạn có thể xem nội dung và tải tài liệu đính kèm tại đây.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {report.attachmentsURL && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-[12px] font-semibold hover:bg-white/15 transition-all border border-white/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloaded ? "Đã mở tài liệu" : "Tải tài liệu"}
                  </button>
                )}
                <button
                  onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-[12px] font-semibold hover:bg-slate-100 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Quay lại phiên
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-slate-900">Báo cáo đã sẵn sàng</p>
              <p className="text-[12px] text-slate-500">Advisor đã nộp báo cáo vào {createdTime} ngày {createdDate}.</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {createdDate}
            </span>
            {report.attachmentsURL && (
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <Paperclip className="w-3.5 h-3.5" />
                Có tài liệu đính kèm
              </span>
            )}
          </div>
        </div>

        {hasValidDeadline && (
          <div
            className={
              canReportIssue
                ? "bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start"
                : "bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-4 items-start"
            }
          >
            <div
              className={
                canReportIssue
                  ? "w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0"
                  : "w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center flex-shrink-0"
              }
            >
              {canReportIssue ? (
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-slate-500" />
              )}
            </div>

            <div className="flex-1">
              <p className={canReportIssue ? "text-[13px] font-bold text-amber-900 mb-1" : "text-[13px] font-bold text-slate-800 mb-1"}>
                {canReportIssue ? "Bạn còn 24 giờ để báo cáo sự cố" : "Đã hết thời hạn báo cáo sự cố"}
              </p>
              <p className={canReportIssue ? "text-[12px] text-amber-800 leading-relaxed mb-3" : "text-[12px] text-slate-600 leading-relaxed mb-3"}>
                {canReportIssue
                  ? `Nếu có vấn đề với báo cáo tư vấn này, bạn có thể gửi báo cáo sự cố trước ${deadlineLabel}. Sau thời điểm này, quyền báo cáo sẽ đóng.`
                  : `Thời hạn báo cáo cho báo cáo tư vấn này đã kết thúc vào ${deadlineLabel}. Nếu không có báo cáo nào được gửi trước hạn, hệ thống sẽ xem như phiên tư vấn không có tranh chấp mới.`}
              </p>

              {canReportIssue && (
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-[12px] font-semibold hover:bg-amber-700 transition-all shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Báo cáo sự cố cho báo cáo này
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-[18px] font-bold text-slate-900 break-words [overflow-wrap:anywhere]">
              {report.title || "Tóm tắt"}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {(report.summary || report.title) && (
              <section className="space-y-3">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Tóm tắt</h3>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 text-[14px] leading-relaxed text-slate-700 break-words [overflow-wrap:anywhere]">
                  {report.summary}
                </div>
              </section>
            )}

            {(report.discussionOverview || report.keyFindings) && (
              <section className="space-y-3">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Nội dung thảo luận</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {report.discussionOverview && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tổng quan</p>
                      <p className="text-[14px] leading-relaxed text-slate-700 break-words [overflow-wrap:anywhere]">
                        {report.discussionOverview}
                      </p>
                    </div>
                  )}
                  {report.keyFindings && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phát hiện chính</p>
                      <p className="text-[14px] leading-relaxed text-slate-700 break-words [overflow-wrap:anywhere]">
                        {report.keyFindings}
                      </p>
                    </div>
                  )}
                  {report.identifiedRisks && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 md:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Rủi ro nhận diện</p>
                      <p className="text-[14px] leading-relaxed text-slate-700 break-words [overflow-wrap:anywhere]">
                        {report.identifiedRisks}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {(report.advisorRecommendations || report.nextSteps || report.deliverablesSummary) && (
              <section className="space-y-3">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Khuyến nghị và bước tiếp theo</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {report.advisorRecommendations && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Khuyến nghị</p>
                      <p className="text-[14px] leading-relaxed text-slate-700 break-words [overflow-wrap:anywhere]">
                        {report.advisorRecommendations}
                      </p>
                    </div>
                  )}
                  {report.nextSteps && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bước tiếp theo</p>
                      <p className="text-[14px] leading-relaxed text-slate-700 break-words [overflow-wrap:anywhere]">
                        {report.nextSteps}
                      </p>
                    </div>
                  )}
                  {report.deliverablesSummary && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 md:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Kết quả bàn giao</p>
                      <p className="text-[14px] leading-relaxed text-slate-700 break-words [overflow-wrap:anywhere]">
                        {report.deliverablesSummary}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {(!report.summary && !report.discussionOverview && !report.advisorRecommendations) && (
              <section className="space-y-3">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Nội dung</h3>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 text-[14px] leading-relaxed text-slate-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                  {report.content}
                </div>
              </section>
            )}

            {report.followUpRequired && (
              <section className="space-y-3">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-amber-500">Yêu cầu theo dõi</h3>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-amber-800 mb-1">Cố vấn yêu cầu theo dõi thêm</p>
                      {report.followUpNotes && (
                        <p className="text-[13px] leading-relaxed text-amber-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {report.followUpNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {report.attachmentsURL && (
              <section className="space-y-3">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-400">Tài liệu đính kèm</h3>
                <a
                  href={report.attachmentsURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Paperclip className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">
                        {report.attachmentsURL.split("/").pop() || "Tài liệu đính kèm"}
                      </p>
                      <p className="text-[12px] text-slate-500">Mở tài liệu trong tab mới</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                </a>
              </section>
            )}

            {canAcknowledge && (
              <section className="pt-2">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={isAcknowledging}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-slate-700 transition-all disabled:opacity-60"
                >
                  {isAcknowledging ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isAcknowledging ? "Đang xác nhận..." : "Xác nhận đã đọc báo cáo"}
                </button>
              </section>
            )}

            {acknowledgedTime && (
              <p className="text-center text-[12px] text-emerald-600 font-semibold">
                ✓ Bạn đã xác nhận đọc báo cáo lúc {acknowledgedTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-900">Xác nhận đã đọc báo cáo?</p>
                <p className="text-[12px] text-slate-500 mt-0.5">Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Bằng cách xác nhận, bạn đồng ý rằng đã đọc và hiểu nội dung báo cáo tư vấn này. Hệ thống sẽ ghi nhận thời điểm xác nhận của bạn.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={() => { setConfirmOpen(false); handleAcknowledge(); }}
                className="flex-1 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-slate-700 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <IssueReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        context={{
          entityType: "AdvisorReport",
          entityId: report.reportID,
          entityTitle: reportIssueTitle,
          otherPartyName: report.advisor?.fullName || "Cố vấn",
        }}
      />
    </StartupShell>
  );
}
