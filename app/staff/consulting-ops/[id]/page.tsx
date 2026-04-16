"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  Download,
  ExternalLink,
  Loader2,
  MessageSquare,
  ShieldAlert,
  User,
  Building2,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  GetOversightReports,
  ReviewReport,
  MarkSessionCompleted,
  MarkSessionDispute,
  MarkSessionResolved,
} from "@/services/staff/consulting-oversight.api";
import type { IReportOversightItem } from "@/types/startup-mentorship";
import { parseReportFields } from "@/lib/report-parser";
import { toast } from "sonner";

// ── Status configs ───────────────────────────────────────────────────────────

const REVIEW_STATUS_CFG: Record<string, { label: string; badge: string; icon: typeof Clock }> = {
  PendingReview: { label: "Chờ thẩm định", badge: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  Passed: { label: "Đã duyệt", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  Failed: { label: "Không đạt", badge: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  NeedsMoreInfo: { label: "Cần bổ sung", badge: "bg-blue-50 text-blue-700 border-blue-200", icon: AlertCircle },
};

const SESSION_STATUS_CFG: Record<string, { label: string; color: string }> = {
  Scheduled: { label: "Đã lên lịch", color: "text-blue-600" },
  InProgress: { label: "Đang diễn ra", color: "text-amber-600" },
  Conducted: { label: "Đã tư vấn", color: "text-indigo-600" },
  Completed: { label: "Hoàn tất", color: "text-emerald-600" },
  InDispute: { label: "Tranh chấp", color: "text-red-600" },
  Resolved: { label: "Đã giải quyết", color: "text-slate-600" },
};

const MENTORSHIP_STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Active: "Đang hoạt động",
  InProgress: "Đang tiến hành",
  Completed: "Hoàn tất",
  Cancelled: "Đã hủy",
  Disputed: "Đang tranh chấp",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ConsultingOpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const reportId = parseInt(id, 10);

  const [report, setReport] = useState<IReportOversightItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Session action state
  const [sessionActionNote, setSessionActionNote] = useState("");
  const [isSessionActing, setIsSessionActing] = useState(false);

  // Fetch report data
  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await GetOversightReports({ reviewStatus: "all", page: 1, pageSize: 100 }) as unknown as IBackendRes<IPagingData<IReportOversightItem>>;
        const items = res.data?.items ?? res.data?.data ?? [];
        const found = items.find((r) => r.reportID === reportId);
        if (found) {
          setReport(found);
        } else {
          setError("Báo cáo không tồn tại.");
        }
      } catch {
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reportId]);

  // Review action handler
  const handleReview = async (status: "Passed" | "Failed" | "NeedsMoreInfo") => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await ReviewReport(reportId, {
        reviewStatus: status,
        note: reviewNote.trim() || undefined,
      });
      const labels: Record<string, string> = {
        Passed: "Đã duyệt báo cáo thành công.",
        Failed: "Đã từ chối báo cáo.",
        NeedsMoreInfo: "Đã yêu cầu bổ sung thông tin.",
      };
      setSubmitSuccess(labels[status]);
      setReport((prev) => prev ? { ...prev, reviewStatus: status, staffReviewNote: reviewNote.trim() || null } : prev);
    } catch (err: any) {
      const code = err?.response?.data?.errorCode ?? err?.response?.data?.code;
      if (code === "SESSION_NOT_CONDUCTED") {
        setSubmitError("Buổi tư vấn chưa được startup xác nhận — không thể duyệt báo cáo.");
      } else if (code === "INVALID_REVIEW_STATUS") {
        setSubmitError("Kết quả review không hợp lệ.");
      } else if (code === "REPORT_NOT_FOUND") {
        setSubmitError("Báo cáo không tồn tại.");
      } else {
        setSubmitError(err?.response?.data?.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Session action handlers
  const handleMarkCompleted = async () => {
    if (!report) return;
    setIsSessionActing(true);
    try {
      await MarkSessionCompleted(report.mentorshipID, report.sessionID, sessionActionNote.trim() ? { note: sessionActionNote.trim() } : undefined);
      toast.success("Session đã được đánh dấu Hoàn tất.");
      setReport((prev) => prev ? { ...prev, sessionStatus: "Completed" } : prev);
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === "REPORTS_NOT_ALL_PASSED") toast.error("Tất cả reports phải Passed trước khi hoàn tất session.");
      else if (code === "NO_REPORT") toast.error("Session chưa có report nào.");
      else if (code === "SESSION_NOT_CONDUCTED") toast.error("Startup chưa xác nhận buổi tư vấn.");
      else if (code === "INVALID_STATUS_TRANSITION") toast.error("Không thể chuyển trạng thái session.");
      else toast.error(err?.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsSessionActing(false);
    }
  };

  const handleMarkDispute = async () => {
    if (!report || !sessionActionNote.trim()) {
      toast.error("Vui lòng nhập lý do tranh chấp.");
      return;
    }
    setIsSessionActing(true);
    try {
      await MarkSessionDispute(report.mentorshipID, report.sessionID, { reason: sessionActionNote.trim() });
      toast.success("Session đã được đánh dấu Tranh chấp.");
      setReport((prev) => prev ? { ...prev, sessionStatus: "InDispute" } : prev);
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
      toast.success(restoreCompleted ? "Tranh chấp đã giải quyết → Completed." : "Tranh chấp đã giải quyết → Resolved.");
      setReport((prev) => prev ? { ...prev, sessionStatus: restoreCompleted ? "Completed" : "Resolved" } : prev);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsSessionActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-3 text-[13px] text-slate-500">Đang tải báo cáo...</span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <ShieldAlert className="w-10 h-10 text-red-400" />
        <p className="text-[14px] text-red-500">{error ?? "Không tìm thấy báo cáo."}</p>
        <Link href="/staff/consulting-ops" className="text-[13px] font-bold text-[#eec54e] hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const reviewCfg = REVIEW_STATUS_CFG[report.reviewStatus] ?? REVIEW_STATUS_CFG.PendingReview;
  const ReviewIcon = reviewCfg.icon;
  const sessCfg = SESSION_STATUS_CFG[report.sessionStatus] ?? { label: report.sessionStatus, color: "text-slate-500" };
  const isReviewed = report.reviewStatus !== "PendingReview";

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 font-plus-jakarta-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/staff/consulting-ops"
          className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại Vận hành tư vấn
        </Link>
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border", reviewCfg.badge)}>
          <ReviewIcon className="w-3.5 h-3.5" />
          {reviewCfg.label}
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Video className="w-7 h-7 text-[#eec54e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
                    Report #{report.reportID}
                  </h1>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[12px] font-medium flex-wrap">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Session #{report.sessionID}
                  </span>
                  <span>•</span>
                  <span className={cn("font-bold", sessCfg.color)}>{sessCfg.label}</span>
                  {report.startupConfirmedConductedAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">✓ Startup đã xác nhận</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Parties Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Startup</p>
              </div>
              <p className="text-[14px] font-bold text-slate-900">{report.startupName}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-slate-400" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Advisor</p>
              </div>
              <p className="text-[14px] font-bold text-slate-900">{report.advisorName}</p>
            </div>
          </div>

          {/* Challenge Description */}
          {report.challengeDescription && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Mục tiêu tư vấn
              </h3>
              <p className="text-[14px] text-slate-700 leading-relaxed font-medium italic">
                &ldquo;{report.challengeDescription}&rdquo;
              </p>
            </div>
          )}

          {/* Report Content */}
          {(() => {
            const parsed = parseReportFields(
              report.reportSummary,
              report.detailedFindings,
              report.recommendations
            );
            const Field = ({ label, value }: { label: string; value: string }) =>
              value ? (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</h4>
                  <p className="text-[14px] text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {value}
                  </p>
                </div>
              ) : null;

            return (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#eec54e]" />
                    Nội dung báo cáo
                  </h3>
                </div>
                <div className="p-6 space-y-5">
                  <Field label="Tiêu đề" value={parsed.title} />
                  <Field label="Tóm tắt" value={parsed.summary} />
                  <Field label="Nội dung thảo luận" value={parsed.discussionOverview} />
                  <Field label="Phát hiện chính (Key Findings)" value={parsed.keyFindings} />
                  <Field label="Rủi ro nhận diện" value={parsed.identifiedRisks} />
                  <Field label="Khuyến nghị của Advisor" value={parsed.advisorRecommendations} />
                  <Field label="Các bước tiếp theo (Next Steps)" value={parsed.nextSteps} />
                  <Field label="Sản phẩm bàn giao (Deliverables)" value={parsed.deliverablesSummary} />
                  {parsed.followUpRequired && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Yêu cầu Follow-up</h4>
                      <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="text-amber-500 text-[13px] font-bold shrink-0">↻</span>
                        <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                          {parsed.followUpNotes || "Advisor yêu cầu có buổi tái đánh giá"}
                        </p>
                      </div>
                    </div>
                  )}
                  {report.attachmentsURL && (() => {
                    const url = report.attachmentsURL;
                    const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url);
                    const isPdf = /\.pdf(\?|$)/i.test(url);
                    const isOffice = /\.(docx?|xlsx?|pptx?)(\?|$)/i.test(url);
                    const fileName = url.split("/").pop()?.split("?")[0] || "Tài liệu đính kèm";

                    let embedSrc: string | null = null;
                    if (isImage) embedSrc = url;
                    else if (isPdf) embedSrc = url;
                    else if (isOffice) embedSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tài liệu đính kèm</h4>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-[#eec54e] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Tải xuống
                          </a>
                        </div>
                        {embedSrc ? (
                          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50" style={{ height: 480 }}>
                            {isImage ? (
                              <img src={embedSrc} alt={fileName} className="w-full h-full object-contain bg-white" />
                            ) : (
                              <iframe
                                title={fileName}
                                src={embedSrc}
                                className="w-full h-full bg-white"
                                allow="fullscreen"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-[13px] text-slate-600 truncate">{fileName}</span>
                            <span className="text-[11px] text-slate-400 ml-auto shrink-0">Không hỗ trợ xem trước</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

          {/* Previous Review Info */}
          {isReviewed && report.staffReviewNote && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Ghi chú review trước đó
              </h3>
              <p className="text-[14px] text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                {report.staffReviewNote}
              </p>
              {report.reviewedAt && (
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(report.reviewedAt).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Review Decision Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xl shadow-slate-100 sticky top-24">
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-6 font-plus-jakarta-sans text-slate-400">
              Phê duyệt quyết định
            </h3>

            {submitSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700 font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {submitError}
              </div>
            )}

            {!["Conducted", "Completed", "InDispute", "Resolved"].includes(report.sessionStatus) ? (
              <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-bold text-amber-700">Chưa thể thẩm định</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Startup chưa xác nhận đã tư vấn. Session cần ở trạng thái <span className="font-bold">Conducted</span> trở lên.</p>
                </div>
              </div>
            ) : report.reviewStatus === "Passed" ? (
              <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[12px] font-bold text-emerald-700">Báo cáo đã được duyệt — không thể thay đổi.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleReview("Passed")}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#eec54e] text-slate-900 text-[13px] font-bold hover:bg-[#ffe082] transition-all group active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#eec54e]/20"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Duyệt (Passed)
                </button>
                <button
                  onClick={() => handleReview("NeedsMoreInfo")}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  Yêu cầu bổ sung
                </button>
                <button
                  onClick={() => handleReview("Failed")}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-100 text-red-500 text-[13px] font-bold hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối (Failed)
                </button>
              </div>
            )}

            {!isReviewed && (
            <div className="mt-6 pt-6 border-t border-slate-50">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ghi chú review</p>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                maxLength={2000}
                placeholder="Nhập ghi chú (tùy chọn, tối đa 2000 ký tự)..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all font-plus-jakarta-sans"
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{reviewNote.length}/2000</p>
            </div>
            )}
          </div>

          {/* Report Meta Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thông tin</h3>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Mentorship</span>
                <span className="font-bold text-slate-700">#{report.mentorshipID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Session</span>
                <span className="font-bold text-slate-700">#{report.sessionID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái Session</span>
                <span className={cn("font-bold", sessCfg.color)}>{sessCfg.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trạng thái Mentorship</span>
                <span className="font-bold text-slate-700">{MENTORSHIP_STATUS_LABEL[report.mentorshipStatus] ?? report.mentorshipStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nộp lúc</span>
                <span className="font-bold text-slate-700">
                  {new Date(report.submittedAt).toLocaleString("vi-VN")}
                </span>
              </div>
              {report.supersededByReportID && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-100 text-[11px] text-amber-700 font-medium">
                  ⚠ Đã thay thế bởi Report #{report.supersededByReportID}
                </div>
              )}
            </div>
          </div>

          {/* Staff Session Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Quản lý Session</h3>

            <div className="space-y-2">
              {/* Conducted → Mark Completed */}
              {report.sessionStatus === "Conducted" && (
                report.reviewStatus === "Passed" ? (
                  <button
                    onClick={handleMarkCompleted}
                    disabled={isSessionActing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-[12px] font-bold hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSessionActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Hoàn tất Session
                  </button>
                ) : (
                  <div className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-400 text-center font-medium">
                    Cần duyệt báo cáo trước khi hoàn tất
                  </div>
                )
              )}

              {/* Conducted → Mark Dispute */}
              {(report.sessionStatus === "Conducted" || report.sessionStatus === "Completed") && (
                <button
                  onClick={handleMarkDispute}
                  disabled={isSessionActing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-[12px] font-bold hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Mở tranh chấp
                </button>
              )}

              {/* InDispute → Resolve */}
              {report.sessionStatus === "InDispute" && (
                <>
                  <button
                    onClick={() => handleResolveDispute(true)}
                    disabled={isSessionActing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-[12px] font-bold hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Giải quyết → Completed
                  </button>
                  <button
                    onClick={() => handleResolveDispute(false)}
                    disabled={isSessionActing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[12px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Giải quyết → Resolved (chặn payout)
                  </button>
                </>
              )}

              {/* No actions available */}
              {!["Conducted", "Completed", "InDispute"].includes(report.sessionStatus) && (
                <p className="text-[11px] text-slate-400 italic">Không có hành động nào khả dụng cho trạng thái hiện tại.</p>
              )}
            </div>

            {/* Action note */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ghi chú hành động</p>
              <textarea
                rows={2}
                value={sessionActionNote}
                onChange={(e) => setSessionActionNote(e.target.value)}
                maxLength={2000}
                placeholder="Nhập lý do / ghi chú cho hành động session..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all font-plus-jakarta-sans"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
