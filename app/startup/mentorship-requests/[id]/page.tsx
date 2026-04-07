"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Edit3, Video, Clock, MessageSquare,
  CheckCircle2, AlertCircle, Calendar, CalendarCheck,
  FileText, Star, Ban, X, 
  History as LucideHistory, Loader2, Info,
  ShieldAlert, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IssueReportModal } from "@/components/shared/issue-report-modal";
import { GetMentorshipById, CancelMentorship } from "@/services/startup/startup-mentorship.api";
import type { IMentorshipRequest, MentorshipRequestStatus, MeetingFormat } from "@/types/startup-mentorship";


const formatDateTime = (iso?: string | null) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    const mo = (d.getMonth() + 1).toString().padStart(2, "0");
    const yy = d.getFullYear();
    return `${hh}:${mm} • ${dd}/${mo}/${yy}`;
  } catch {
    return iso;
  }
};

const mapMeetingFormat = (fmt?: MeetingFormat | string | null): string => {
  if (fmt === "GoogleMeet") return "Google Meet";
  if (fmt === "MicrosoftTeams") return "Microsoft Teams";
  return "—";
};

const isValidImageUrl = (url?: string | null) => {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/");
};

// ─── Status Config ─────────────────────────────────────────────────────────────

type DisplayStatus = MentorshipRequestStatus | "InProgress";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Requested:  { label: "Chờ phản hồi", color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-100",   icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  Pending:    { label: "Chờ phản hồi", color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-100",   icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  Accepted:   { label: "Đã chấp nhận", color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-100",   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Rejected:   { label: "Từ chối",      color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100",    icon: <Ban className="w-3.5 h-3.5" /> },
  Scheduled:  { label: "Đã lên lịch",  color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100", icon: <Calendar className="w-3.5 h-3.5" /> },
  InProgress: { label: "Đã lên lịch",  color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100", icon: <Calendar className="w-3.5 h-3.5" /> },
  Completed:  { label: "Hoàn thành",   color: "text-green-700",  bg: "bg-green-50",  border: "border-green-100",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Finalized:  { label: "Hoàn thành",   color: "text-green-700",  bg: "bg-green-50",  border: "border-green-100",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Cancelled:  { label: "Đã hủy",       color: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-200",  icon: <X className="w-3.5 h-3.5" /> },
};

// ─── Dynamic Timeline Builder ──────────────────────────────────────────────────

interface TimelineStep {
  label: string;
  note: string;
  time: string;
  done: boolean;
  current?: boolean;
  failed?: boolean;
}

function buildTimeline(req: IMentorshipRequest, isPaid: boolean = false): TimelineStep[] {
  const status = req.status || (req as any).mentorshipStatus;
  const sessions = (req as any).sessions || [];
  const firstSession = sessions.slice().reverse().find((s: any) => s.meetingUrl || s.meetingURL || s.meetingLink) || sessions[sessions.length - 1] || null;
    const scheduledTime = req.scheduledAt || firstSession?.scheduledStartAt;
  
  const steps: TimelineStep[] = [
    {
      label: "Yêu cầu đã gửi",
      note: "Yêu cầu tư vấn đã được tạo và gửi đến cố vấn.",
      time: formatDateTime(req.createdAt),
      done: true,
      current: false,
    },
    {
      label: "Cố vấn phản hồi",
      note: "",
      time: "",
      done: false,
      current: false,
    },
    {
      label: "Lịch xác nhận",
      note: "",
      time: "",
      done: false,
      current: false,
    },
    {
      label: "Phiên diễn ra",
      note: "",
      time: "",
      done: false,
      current: false,
    },
    {
      label: "Báo cáo có sẵn",
      note: "",
      time: "",
      done: false,
      current: false,
    },
    {
      label: "Đã đánh giá",
      note: "",
      time: "",
      done: false,
      current: false,
    },
  ];

  // Requested / Pending — only step 0 done
  if (status === "Requested" || status === "Pending") {
    steps[0].current = true;
    steps[1].note = "Đang chờ cố vấn xem xét và phản hồi.";
    return steps;
  }

  // Rejected
  if (status === "Rejected") {
    steps[1].done = true;
    steps[1].failed = true;
    steps[1].current = true;
    steps[1].note = "Cố vấn đã từ chối yêu cầu.";
    steps[1].time = formatDateTime(req.rejectedAt);
    return steps;
  }

  // Cancelled
  if (status === "Cancelled") {
    steps[0].current = false;
    // Mark step 1 as cancelled point
    steps[1].done = false;
    steps[1].failed = true;
    steps[1].current = true;
      steps[1].note = req.cancelReason || (req as any).rejectedReason || "Yêu cầu đã bị hủy.";
    steps[1].done = true;
    steps[1].current = true;
    steps[1].note = "Cố vấn đã chấp nhận yêu cầu.";
    steps[1].time = formatDateTime(req.acceptedAt);
    steps[2].note = "Đang chờ xác nhận khung giờ.";
    return steps;
  }

  // Scheduled — steps 0,1,2 done
  if (status === "Scheduled" || status === "InProgress") {
    steps[1].done = true;
    steps[1].note = "Cố vấn đã chấp nhận yêu cầu.";
    steps[1].time = formatDateTime(req.acceptedAt);
    steps[2].done = true;
    steps[2].current = !isPaid;
    steps[2].note = "Lịch hẹn đã được xác nhận.";
    steps[2].time = formatDateTime(scheduledTime);
    steps[3].current = isPaid;
    steps[3].note = "Đang chờ phiên tư vấn diễn ra.";
    return steps;
  }

  // Completed — steps 0,1,2,3,4 done
  const hasReport = ((req as any).reports || []).length > 0;
  const hasFeedback = ((req as any).feedbacks || []).length > 0;

  if (status === "Completed" || status === "Finalized") {
    steps[1].done = true;
    steps[1].note = "Cố vấn đã chấp nhận.";
    steps[1].time = formatDateTime(req.acceptedAt);
    steps[2].done = true;
    steps[2].note = "Lịch hẹn đã được xác nhận.";
    steps[2].time = formatDateTime(scheduledTime);
    steps[3].done = true;
    steps[3].note = "Phiên tư vấn đã hoàn thành.";
    steps[3].time = formatDateTime(req.completedAt || req.updatedAt || req.createdAt);
    
    const isReportAvailable = hasReport || status === "Finalized";
    steps[4].done = isReportAvailable;
    steps[4].current = isReportAvailable && !hasFeedback && status !== "Finalized";
    steps[4].note = isReportAvailable ? "Cố vấn đã cung cấp báo cáo tư vấn." : "Đang chờ báo cáo từ cố vấn.";
    steps[4].time = isReportAvailable ? formatDateTime(req.updatedAt || req.completedAt) : "";

    const isFeedbackDone = hasFeedback || status === "Finalized";
    if (isFeedbackDone) {
      steps[5].done = true;
      steps[5].current = true;
      steps[5].note = "Đã gửi đánh giá.";
      steps[4].current = false;
    }
    return steps;
  }

  return steps;
}

// ─── Progress Stepper ──────────────────────────────────────────────────────────

function ProgressStepper({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="flex items-start gap-0 w-full overflow-x-auto pb-1">
      {steps.map((step, i) => (
        <div key={i} className="flex-1 flex flex-col items-center min-w-[80px]">
          <div className="flex items-center w-full">
            {i > 0 && (
              <div className={cn("flex-1 h-0.5 -mr-0.5 mt-[-16px]", step.done ? "bg-[#eec54e]" : "bg-slate-200")} />
            )}
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all",
              step.failed ? "bg-red-50 border-red-300 text-red-500" :
              step.done && step.current ? "bg-[#eec54e] border-[#eec54e] text-white shadow-[0_0_0_4px_rgba(238,197,78,0.15)]" :
              step.done ? "bg-[#eec54e] border-[#eec54e] text-white" :
              "bg-white border-slate-200 text-slate-300"
            )}>
              {step.failed
                ? <X className="w-3.5 h-3.5" />
                : step.done
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <div className="w-2 h-2 rounded-full bg-current" />
              }
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 -ml-0.5 mt-[-16px]", steps[i + 1]?.done ? "bg-[#eec54e]" : "bg-slate-200")} />
            )}
          </div>
          <p className={cn(
            "text-[10px] font-semibold mt-2 text-center leading-tight",
            step.failed ? "text-red-500" :
            step.done && step.current ? "text-[#b8902e]" :
            step.done ? "text-slate-600" : "text-slate-300"
          )}>
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MentorshipRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const numericId = Number(id);

  // Data state
  const [request, setRequest] = useState<IMentorshipRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // UI state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<MentorshipRequestStatus | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && request) {
      const key = `mentorship_paid_${request.mentorshipID || (request as any).id}`;
      setIsPaid(localStorage.getItem(key) === "true");
    }
  }, [request]);

  // Fetch data
  const fetchRequest = useCallback(async () => {
    if (isNaN(numericId)) {
      setFetchError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await GetMentorshipById(numericId) as unknown as IBackendRes<IMentorshipRequest>;
      if ((res.success || res.isSuccess) && res.data) {
        setRequest(res.data);
        setLocalStatus(res.data.status as MentorshipRequestStatus);
        setFetchError(false);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Cancel handler (real API)
  const handleCancel = async () => {
    if (!request) return;
    setIsCancelling(true);
    try {
      const res = await CancelMentorship(request.mentorshipID, {
        reason: cancelReason || "Startup hủy yêu cầu",
      }) as unknown as IBackendRes<null>;
      if (res.success || res.isSuccess) {
        setLocalStatus("Cancelled");
        setShowCancelConfirm(false);
        setToast("Yêu cầu đã được hủy thành công.");
        fetchRequest(); // refresh data
      } else {
        setToast(res.message || "Hủy yêu cầu thất bại.");
      }
    } catch {
      setToast("Hủy yêu cầu thất bại.");
    } finally {
      setIsCancelling(false);
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <StartupShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
      </StartupShell>
    );
  }

  // ─── Error / Not Found State ─────────────────────────────────────────────────

  if (fetchError || !request) {
    return (
      <StartupShell>
        <div className="max-w-[600px] mx-auto py-20 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-[20px] font-bold text-slate-900 mb-2">Không tìm thấy yêu cầu</h2>
          <p className="text-[14px] text-slate-500 mb-6">Yêu cầu tư vấn này không tồn tại hoặc bạn không có quyền truy cập.</p>
          <button
            onClick={() => router.push("/startup/experts?tab=requests")}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-all"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </StartupShell>
    );
  }

  // ─── Derived data ────────────────────────────────────────────────────────────

  const currentStatus = localStatus || request.status || (request as any).mentorshipStatus;
  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Requested"];
  const timeline = buildTimeline({ ...request, status: currentStatus }, isPaid);
  const requestNo = `REQ-${String(request.mentorshipID || (request as any).id || 0).padStart(4, "0")}`;
  const advisor = request.advisor || { advisorID: request.advisorID, fullName: (request as any).advisorName, title: "Cố vấn viên", profilePhotoURL: "", averageRating: null };
  const isCancelled = currentStatus === "Cancelled";

  const sessions = (request as any).sessions || [];
  const firstSession = sessions.slice().reverse().find((s: any) => s.meetingUrl || s.meetingURL || s.meetingLink) || sessions[sessions.length - 1] || null;
  const scheduledAtString = request.scheduledAt || firstSession?.scheduledStartAt || null;

  return (
    <StartupShell>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 bg-[#0f172a] text-white text-[13px] font-medium rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-[1280px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-bold text-slate-900 leading-none">{requestNo}</h1>
              <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border", cfg.color, cfg.bg, cfg.border)}>
                {cfg.icon}
                {cfg.label}
              </span>
            </div>
          </div>
          {(currentStatus === "Requested" || currentStatus === "Pending") && !isCancelled && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setToast("Chức năng chỉnh sửa sẽ sớm được mở.")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Chỉnh sửa
              </button>
              {showCancelConfirm ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      placeholder="Lý do hủy (tùy chọn)..."
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      className="px-3 py-2 text-[12px] border border-slate-200 rounded-lg outline-none focus:border-red-300 w-[200px]"
                    />
                  </div>
                  <button onClick={handleCancel} disabled={isCancelling} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-all">
                    {isCancelling ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <X className="w-4 h-4" />}
                    Xác nhận hủy
                  </button>
                  <button onClick={() => { setShowCancelConfirm(false); setCancelReason(""); }} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-all">
                    Không
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowCancelConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 text-[13px] font-medium hover:bg-red-100 transition-all">
                  <X className="w-4 h-4" />
                  Hủy yêu cầu
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-5">
            <CalendarCheck className="w-4 h-4 text-amber-500" />
            <span className="text-[13px] font-bold text-slate-700">Tiến trình yêu cầu</span>
          </div>
          <ProgressStepper steps={timeline} />
        </div>

        {/* Rejection Banner */}
        {currentStatus === "Rejected" && (request.rejectionReason || (request as any).rejectedReason) && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-red-700 mb-1">Lý do từ chối</p>
                <p className="text-[13px] text-red-600 leading-relaxed">{request.rejectionReason || (request as any).rejectedReason}</p>
                <button
                  onClick={() => router.push("/startup/experts")}
                  className="mt-3 text-[12px] font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors"
                >
                  Tìm cố vấn phù hợp hơn →
                </button>
              </div>
            </div>
          )}

          {/* Cancellation Banner */}
          {currentStatus === "Cancelled" && (request.cancelReason || (request as any).rejectedReason) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-4">
              <Ban className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-slate-600 mb-1">Lý do hủy</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">{request.cancelReason || (request as any).rejectedReason}</p>
                {request.cancelledBy && (
                  <p className="text-[11px] text-slate-400 mt-1">Hủy bởi: {request.cancelledBy}</p>
                )}
              </div>
          </div>
        )}

        {/* Accepted Banner */}
        {currentStatus === "Accepted" && (() => {
          const rawSlots = (request as any)?.sessions || (request as any)?.requestedSlots || [];
          const advisorSlots = rawSlots.filter(
            (s: any) => s.isActive !== false && s.sessionStatus !== "Cancelled" && s.sessionStatus?.toUpperCase() !== "PROPOSEDBYSTARTUP"
          );
          const hasAdvisorSlots = advisorSlots.length > 0;
          return (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex gap-4 items-start">
              <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-teal-800 mb-2">Cố vấn đã chấp nhận yêu cầu</p>
                {hasAdvisorSlots ? (
                  <>
                    <p className="text-[12px] text-teal-700 leading-relaxed mb-3">
                      Cố vấn đã đề xuất {advisorSlots.length} khung giờ. Vui lòng chọn khung giờ phù hợp để tiến hành đặt lịch.
                    </p>
                    <button
                      onClick={() => router.push(`/startup/mentorship-requests/${request.mentorshipID}/confirm-schedule`)}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[12px] font-semibold hover:bg-teal-700 transition-all shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Xác nhận lịch hẹn
                    </button>
                  </>
                ) : (
                  <p className="text-[12px] text-teal-700 leading-relaxed">
                    Cố vấn đã đồng ý tư vấn cho bạn. Đang chờ cố vấn đề xuất khung giờ cụ thể — bạn sẽ nhận được thông báo khi có lịch.
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Scheduled Banner */}
        {(currentStatus === "Scheduled" || currentStatus === "InProgress") && !isPaid && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex gap-4 items-start">
            <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-indigo-800 mb-2">Phiên tư vấn đã được lên lịch</p>
              <p className="text-[12px] text-indigo-700 leading-relaxed mb-3">
                Lịch hẹn đã được cố vấn xác nhận vào {formatDateTime(scheduledAtString)}. Bạn cần xem chi tiết và hoàn tất thanh toán.
              </p>
              <button
                onClick={() => router.push(`/startup/mentorship-requests/${request.mentorshipID || (request as any).id || requestNo.replace('REQ-','')}/confirm-schedule`)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-semibold hover:bg-indigo-700 transition-all shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                Xem lịch hẹn & Thanh Toán
              </button>
            </div>
          </div>
        )}

        {/* Paid Banner */}
        {(currentStatus === "Scheduled" || currentStatus === "InProgress") && isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-4 items-start">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-green-800 mb-2">Thanh toán hoàn tất</p>
              <p className="text-[12px] text-green-700 leading-relaxed mb-3">
                Lịch hẹn lúc {formatDateTime(scheduledAtString)} đã ghi nhận thanh toán. Vui lòng tham gia phiên tư vấn đúng thông tin đã gửi và xác nhận sau khi kết thúc.
              </p>
              {(() => {
                  const finalLink = (request as any)?.meetingLink || (request as any)?.meetingUrl || firstSession?.meetingUrl || firstSession?.meetingURL;                  console.log("DEBUG: finalLink =>", finalLink, "request =>", request, "firstSession =>", firstSession);                  if (finalLink && finalLink !== "undefined" && finalLink.trim() !== "") {
                    return (
                      <a
                        href={finalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[12px] font-semibold hover:bg-green-700 transition-all shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Tham gia vào cuộc họp
                      </a>
                    );
                  }
                  return (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-[12px] font-semibold cursor-not-allowed shadow-sm"
                      title="Cố vấn chưa cung cấp đường dẫn cho cuộc họp này"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Đang chờ cấp link cuộc họp
                    </button>
                  );
                })()}
            </div>
          </div>
        )}

        {/* Completed Banner */}
        {(currentStatus === "Completed" || currentStatus === "Finalized") && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex gap-4 items-start">
            <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-green-800 mb-1">Phiên tư vấn đã hoàn thành</p>
                <p className="text-[12px] text-green-700 mb-3">Cố vấn đã hoàn thành phiên tư vấn {request.completedAt ? `vào ${formatDateTime(request.completedAt)}.` : '.'}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => router.push(`/startup/mentorship-requests/${request.mentorshipID}/report`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[12px] font-semibold hover:bg-green-700 transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Xem báo cáo
                </button>
                {currentStatus !== "Finalized" && !((request as any).feedbacks && (request as any).feedbacks.length > 0) && (
                  <button
                    onClick={() => router.push(`/startup/mentorship-requests/${request.mentorshipID}/feedback`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl text-[12px] font-semibold hover:bg-green-50 transition-all"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Gửi đánh giá
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Challenge Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                  </div>
                  <h2 className="text-[17px] font-bold text-slate-900">Nội dung yêu cầu tư vấn</h2>
                </div>
                {(currentStatus === "Requested" || currentStatus === "Pending") && !isCancelled && (
                  <button
                    onClick={() => setToast("Chức năng chỉnh sửa sẽ sớm được mở.")}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Objective / Title */}
                {request.objective && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mục tiêu</p>
                    <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">{request.objective}</p>
                  </div>
                )}

                {/* Problem Context */}
                {request.problemContext && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Thách thức</p>
                    <p className="text-[14px] text-slate-600 leading-relaxed">{request.problemContext}</p>
                  </div>
                )}

                {/* Additional Notes */}
                {request.additionalNotes && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ghi chú thêm</p>
                    <div className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">!</span>
                      <p className="text-[13px] text-slate-700 leading-relaxed">{request.additionalNotes}</p>
                    </div>
                  </div>
                )}

                {/* Scope Tags */}
                {request.scopeTags && request.scopeTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    {request.scopeTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[12px] font-medium text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <LucideHistory className="w-4 h-4 text-amber-500" />
                </div>
                <h2 className="text-[17px] font-bold text-slate-900">Lịch sử cập nhật</h2>
              </div>

              <div className="space-y-8 pl-3">
                {timeline.filter(t => t.done || t.current || t.failed).map((item, i, arr) => (
                  <div key={i} className="relative pl-8">
                    {i < arr.length - 1 && (
                      <div className="absolute left-2.5 top-5 bottom-[-20px] w-px bg-slate-100" />
                    )}
                    <div className={cn(
                      "absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      item.failed ? "bg-red-50 border-red-300" :
                      item.current ? "bg-amber-400 border-amber-400" :
                      item.done ? "bg-amber-100 border-amber-300" :
                      "bg-slate-50 border-slate-200"
                    )}>
                      {item.failed
                        ? <X className="w-2.5 h-2.5 text-red-500" />
                        : item.done
                          ? <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
                          : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      }
                    </div>
                    <div>
                      <p className={cn("text-[13px] font-bold leading-none mb-1", item.failed ? "text-red-600" : item.current ? "text-slate-900" : "text-slate-600")}>{item.label}</p>
                      {item.note && <p className="text-[12px] text-slate-400 leading-relaxed">{item.note}</p>}
                      {item.time && <p className="text-[11px] text-slate-300 font-medium mt-1 uppercase tracking-wide">{item.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hub Support / Report Action */}
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 text-amber-500 shadow-sm border border-amber-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-1 leading-none">Gặp sự cố với yêu cầu này?</h3>
              <p className="text-[12px] text-slate-500 text-center mb-5 mt-2 max-w-[360px] leading-relaxed">
                Chúng tôi đảm bảo quyền lợi cho cả Startup và Cố vấn. Nếu có bất kỳ vấn đề gì, hãy báo cáo để đội ngũ AISEP can thiệp xử lý kịp thời.
              </p>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 hover:shadow-md transition-all group"
              >
                Báo cáo sự cố ngay
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all" />
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Advisor Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Cố vấn tiếp nhận</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  {isValidImageUrl(advisor?.profilePhotoURL) ? (
                    <img src={advisor.profilePhotoURL} alt={advisor.fullName} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-400">{advisor?.fullName?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 leading-none">{advisor?.fullName}</p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-snug">{advisor?.title}</p>
                  {advisor?.averageRating != null && advisor.averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[12px] font-bold text-slate-700">{advisor.averageRating}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/startup/messaging?mentorshipId=${advisor?.advisorID}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Nhắn tin
                </button>
                <button
                  onClick={() => router.push(`/startup/experts/${advisor?.advisorID}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Xem hồ sơ
                </button>
              </div>
            </div>

            {/* Session Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thông tin phiên</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Video className="w-3.5 h-3.5" />
                    Hình thức
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">{mapMeetingFormat(request.preferredFormat)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    Thời lượng
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">{request.durationMinutes ? `${request.durationMinutes} phút` : "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    Ngày tạo
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">{formatDateTime(request.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-[#0f172a] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-[13px] font-bold">Cần hỗ trợ?</span>
              </div>
              <p className="text-[12px] text-white/60 leading-relaxed italic">Cố vấn thường phản hồi trong 24–48h. Nếu có thắc mắc hoặc gặp sự cố, vui lòng báo cáo cho chúng tôi.</p>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors group"
              >
                <ShieldAlert className="w-3.5 h-3.5 group-hover:animate-pulse" />
                Báo cáo sự cố
              </button>
            </div>
          </div>
        </div>
      </div>
      <IssueReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        context={{
          entityType: "CONSULTING_REQUEST",
          entityId: String(request.mentorshipID),
          entityTitle: `Yêu cầu tư vấn: ${request.objective}`,
          otherPartyName: advisor?.fullName || "Cố vấn"
        }}
      />
    </StartupShell>
  );
}
