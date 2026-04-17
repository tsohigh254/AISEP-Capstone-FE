"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Edit3, Video, Clock, MessageSquare,
  CheckCircle2, AlertCircle, Calendar, CalendarCheck,
  FileText, Star, Ban, X, 
  History as LucideHistory, Loader2, Info,
  ShieldAlert, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isMentorshipPaymentCompleted } from "@/lib/mentorship-payment";
import { IssueReportModal } from "@/components/shared/issue-report-modal";
import {
  CancelMentorship,
  ConfirmSessionConducted,
  GetAdvisorById,
  GetMentorshipById,
} from "@/services/startup/startup-mentorship.api";
import type {
  IAdvisorDetail,
  IMentorshipRequest,
  IMentorshipTimelineEvent,
  MeetingFormat,
  MentorshipRequestStatus,
} from "@/types/startup-mentorship";


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

const getMentorshipChatBlockMessage = (status?: MentorshipRequestStatus | string | null) => {
  switch (status) {
    case "Requested":
    case "Pending":
      return "Bạn chỉ có thể nhắn tin sau khi cố vấn chấp nhận yêu cầu tư vấn.";
    case "Rejected":
      return "Yêu cầu tư vấn đã bị từ chối nên hiện chưa thể nhắn tin với cố vấn.";
    case "Cancelled":
      return "Yêu cầu tư vấn đã bị hủy nên hiện chưa thể nhắn tin với cố vấn.";
    default:
      return null;
  }
};

const getNormalizedCancellationActor = (cancelledBy?: string | null) => {
  const value = cancelledBy?.trim().toLowerCase();
  if (!value) return null;
  if (value.includes("startup")) return "Startup";
  if (value.includes("advisor") || value.includes("mentor") || value.includes("expert")) return "Cố vấn";
  if (value.includes("system")) return "Hệ thống";
  return null;
};

const getCancellationActorLabel = (cancelledBy?: string | null) => {
  return getNormalizedCancellationActor(cancelledBy);
};

const getCancellationActorText = (cancelledBy?: string | null) => {
  const actor = getNormalizedCancellationActor(cancelledBy);
  if (!actor) return null;
  if (actor === "Startup") return "Bạn";
  return actor;
};

const getCancellationReasonText = (request: IMentorshipRequest) => {
  const rawReason = (request.cancelReason || (request as any).rejectedReason || "").trim();
  if (!rawReason) return "";

  const reasonMatch = rawReason.match(/reason:\s*(.+)$/i);
  if (reasonMatch?.[1]) {
    return reasonMatch[1].trim();
  }

  return rawReason
    .replace(/^cancelled by startup\.?\s*/i, "")
    .replace(/^cancelled by advisor\.?\s*/i, "")
    .replace(/^cancelled by system\.?\s*/i, "")
    .trim();
};

const getCancellationSummary = (request: IMentorshipRequest) => {
  const actorText = getCancellationActorText(request.cancelledBy);
  const reason = getCancellationReasonText(request);
  const actorSentence = !actorText
    ? "Yêu cầu đã bị hủy."
    : actorText === "Bạn"
      ? "Bạn đã hủy yêu cầu này."
      : `${actorText} đã hủy yêu cầu này.`;

  if (!reason) return actorSentence;
  return `${actorSentence} Lý do: ${reason}`;
};

const SUPPORT_SCOPE_LABELS: Record<string, string> = {
  FUNDRAISING: "Gọi vốn",
  PRODUCT_STRATEGY: "Chiến lược sản phẩm",
  GO_TO_MARKET: "Go-to-market",
  FINANCE: "Tài chính",
  LEGAL_IP: "Pháp lý & SHTT",
  OPERATIONS: "Vận hành",
  TECHNOLOGY: "Công nghệ",
  MARKETING: "Marketing",
  HR_OR_TEAM_BUILDING: "Nhân sự",
};

const parseSpecificQuestions = (specificQuestions?: string | null) => {
  if (!specificQuestions?.trim()) {
    return { objective: "", additionalNotes: "" };
  }

  const parts = specificQuestions
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean);

  return {
    objective: parts[0] || "",
    additionalNotes: parts.slice(1).join("\n\n"),
  };
};

const normalizeScopeTags = (request: IMentorshipRequest) => {
  const rawTags =
    request.scopeTags && request.scopeTags.length > 0
      ? request.scopeTags
      : (request.expectedScope || request.scope || "")
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean);

  return rawTags.map(tag => SUPPORT_SCOPE_LABELS[tag] || tag);
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

interface TimelineStep {
  label: string;
  note: string;
  time: string;
  done: boolean;
  current?: boolean;
  failed?: boolean;
}

interface HistoryItem {
  type: string;
  label: string;
  note: string;
  time: string;
  sortTime?: string;
  failed?: boolean;
}

const normalizeTimelineEventType = (event: IMentorshipTimelineEvent) => {
  const raw = (event.type || event.actionType || "").trim().toLowerCase();
  switch (raw) {
    case "requested":
    case "request_submitted":
      return "Requested";
    case "accepted":
    case "request_accepted":
      return "Accepted";
    case "inprogress":
    case "in_progress":
    case "advisor_proposed_time":
    case "session_created":
    case "session_scheduled":
      return "InProgress";
    case "rejected":
    case "request_rejected":
      return "Rejected";
    case "cancelled":
    case "canceled":
    case "session_cancelled":
      return "Cancelled";
    case "completed":
    case "session_completed":
      return "Completed";
    case "report_submitted":
      return "ReportSubmitted";
    case "feedback_submitted":
      return "FeedbackSubmitted";
    default:
      return event.type || event.actionType || "Unknown";
  }
};

const getHistoryDefaults = (type: string, request: IMentorshipRequest) => {
  switch (type) {
    case "Requested":
      return {
        label: "Yêu cầu đã gửi",
        note: "Yêu cầu tư vấn đã được tạo và gửi đến cố vấn.",
      };
    case "Accepted":
      return {
        label: "Cố vấn phản hồi",
        note: "Cố vấn đã chấp nhận yêu cầu.",
      };
    case "InProgress":
      return {
        label: "Phiên bắt đầu",
        note: "Cố vấn đã tạo phiên tư vấn đầu tiên.",
      };
    case "Rejected":
      return {
        label: "Yêu cầu bị từ chối",
        note: request.rejectionReason || (request as any).rejectedReason || "Cố vấn đã từ chối yêu cầu.",
      };
    case "Cancelled":
      return {
        label: "Yêu cầu đã được hủy",
        note: getCancellationSummary(request),
      };
    case "Completed":
      return {
        label: "Phiên hoàn thành",
        note: "Phiên tư vấn đã hoàn thành.",
      };
    case "ReportSubmitted":
      return {
        label: "Báo cáo có sẵn",
        note: "Cố vấn đã cung cấp báo cáo tư vấn.",
      };
    case "FeedbackSubmitted":
      return {
        label: "Đã đánh giá",
        note: "Startup đã gửi đánh giá cho phiên tư vấn.",
      };
    default:
      return {
        label: "Cập nhật trạng thái",
        note: "",
      };
  }
};

function buildHistoryItems(req: IMentorshipRequest): HistoryItem[] {
  const rawEvents =
    req.timelineEvents ||
    req.timeline ||
    (req as any).mentorshipHistories ||
    (req as any).history ||
    [];

  if (Array.isArray(rawEvents) && rawEvents.length > 0) {
    return rawEvents
      .map((event: IMentorshipTimelineEvent) => {
        const type = normalizeTimelineEventType(event);
        const defaults = getHistoryDefaults(type, req);
        const happenedAt = event.happenedAt || event.createdAt || "";
        return {
          type,
          label: event.title || defaults.label,
          note: event.description || defaults.note,
          time: formatDateTime(happenedAt),
          sortTime: happenedAt,
          failed: type === "Rejected" || type === "Cancelled",
        };
      })
      .filter((item: HistoryItem) => item.label || item.note || item.time)
      .sort((a: HistoryItem, b: HistoryItem) => {
        const at = new Date(a.sortTime || 0).getTime();
        const bt = new Date(b.sortTime || 0).getTime();
        return at - bt;
      });
  }

  const items: HistoryItem[] = [
    {
      type: "Requested",
      label: "Yêu cầu đã gửi",
      note: "Yêu cầu tư vấn đã được tạo và gửi đến cố vấn.",
      time: formatDateTime(req.requestedAt || req.createdAt),
      sortTime: req.requestedAt || req.createdAt,
    },
  ];

  if (req.acceptedAt) {
    items.push({
      type: "Accepted",
      label: "Cố vấn phản hồi",
      note: "Cố vấn đã chấp nhận yêu cầu.",
      time: formatDateTime(req.acceptedAt),
      sortTime: req.acceptedAt,
    });
  }

  if (req.inProgressAt) {
    items.push({
      type: "InProgress",
      label: "Phiên bắt đầu",
      note: "Cố vấn đã tạo phiên tư vấn đầu tiên.",
      time: formatDateTime(req.inProgressAt),
      sortTime: req.inProgressAt,
    });
  }

  if (req.rejectedAt) {
    items.push({
      type: "Rejected",
      label: "Yêu cầu bị từ chối",
      note: req.rejectionReason || (req as any).rejectedReason || "Cố vấn đã từ chối yêu cầu.",
      time: formatDateTime(req.rejectedAt),
      sortTime: req.rejectedAt,
      failed: true,
    });
  } else if (req.cancelledAt) {
    items.push({
      type: "Cancelled",
      label: "Yêu cầu đã được hủy",
      note: getCancellationSummary(req),
      time: formatDateTime(req.cancelledAt),
      sortTime: req.cancelledAt,
      failed: true,
    });
  } else if (req.completedAt) {
    items.push({
      type: "Completed",
      label: "Phiên hoàn thành",
      note: "Phiên tư vấn đã hoàn thành.",
      time: formatDateTime(req.completedAt),
      sortTime: req.completedAt,
    });
  }

  if ((req as any).reports?.length) {
    items.push({
      type: "ReportSubmitted",
      label: "Báo cáo có sẵn",
      note: "Cố vấn đã cung cấp báo cáo tư vấn.",
      time: formatDateTime((req as any).reports[0]?.createdAt || req.completedAt),
      sortTime: (req as any).reports[0]?.createdAt || req.completedAt,
    });
  }

  if ((req as any).feedbacks?.length) {
    items.push({
      type: "FeedbackSubmitted",
      label: "Đã đánh giá",
      note: "Startup đã gửi đánh giá cho phiên tư vấn.",
      time: formatDateTime((req as any).feedbacks[0]?.createdAt || req.completedAt),
      sortTime: (req as any).feedbacks[0]?.createdAt || req.completedAt,
    });
  }

  return items.sort(
    (a, b) => new Date(a.sortTime || 0).getTime() - new Date(b.sortTime || 0).getTime()
  );
}

function buildProgressSteps(historyItems: HistoryItem[], currentStatus: string, isPaid: boolean, request: IMentorshipRequest): TimelineStep[] {
  const steps: TimelineStep[] = [
    { label: "Yêu cầu đã gửi", note: "", time: "", done: false, current: false },
    { label: "Cố vấn phản hồi", note: "", time: "", done: false, current: false },
    { label: "Lịch xác nhận", note: "", time: "", done: false, current: false },
    { label: "Phiên diễn ra", note: "", time: "", done: false, current: false },
    { label: "Báo cáo có sẵn", note: "", time: "", done: false, current: false },
    { label: "Đã đánh giá", note: "", time: "", done: false, current: false },
  ];

  const findEvent = (type: string) => historyItems.find(item => item.type === type);
  const requestedEvent = findEvent("Requested");
  const acceptedEvent = findEvent("Accepted");
  const inProgressEvent = findEvent("InProgress");
  const completedEvent = findEvent("Completed");
  const reportEvent = findEvent("ReportSubmitted");
  const feedbackEvent = findEvent("FeedbackSubmitted");
  const rejectedEvent = findEvent("Rejected");
  const cancelledEvent = findEvent("Cancelled");
  const terminalFailedEvent = rejectedEvent || cancelledEvent;
  const cancellationActorText = getCancellationActorText(request.cancelledBy);

  // Session-level signals — mentorship timestamps alone are not enough in the new oversight flow
  const sessions: any[] = (request as any).sessions || [];
  const SESSION_SCHEDULED_PLUS = ["Scheduled", "InProgress", "Conducted", "Completed", "InDispute", "Resolved"];
  const SESSION_CONDUCTED_PLUS = ["Conducted", "Completed", "InDispute", "Resolved"];
  const scheduledSession = sessions.find((s: any) => SESSION_SCHEDULED_PLUS.includes(s.status || s.sessionStatus));
  const conductedSession = sessions.find((s: any) => SESSION_CONDUCTED_PLUS.includes(s.status || s.sessionStatus));

  if (requestedEvent) {
    steps[0].done = true;
    steps[0].note = requestedEvent.note;
    steps[0].time = requestedEvent.time;
  }

  if (acceptedEvent) {
    steps[1].done = true;
    steps[1].note = acceptedEvent.note;
    steps[1].time = acceptedEvent.time;
  }

  // Step 2: "Lịch xác nhận" — done khi có session Scheduled+ hoặc mentorship đã InProgress
  if (inProgressEvent || scheduledSession) {
    steps[2].done = true;
    steps[2].note = inProgressEvent?.note || "Lịch tư vấn đã được xác nhận.";
    steps[2].time = inProgressEvent?.time || formatDateTime(scheduledSession?.scheduledStartAt) || "";
  }

  // Step 3: "Phiên diễn ra" — done khi session Conducted+ hoặc mentorship Completed
  if (completedEvent || conductedSession) {
    steps[3].done = true;
    steps[3].note = completedEvent?.note || "Phiên tư vấn đã diễn ra.";
    steps[3].time = completedEvent?.time || formatDateTime(conductedSession?.scheduledStartAt) || "";
  } else if ((currentStatus === "Scheduled" || currentStatus === "InProgress") && (inProgressEvent || scheduledSession)) {
    steps[3].current = true;
    steps[3].note = isPaid ? "Đang chờ phiên tư vấn diễn ra." : "Đang chờ hoàn tất thanh toán trước phiên tư vấn.";
  }

  if (reportEvent || (request as any).reports?.length > 0) {
    steps[4].done = true;
    steps[4].note = reportEvent?.note || "Cố vấn đã cung cấp báo cáo tư vấn.";
    steps[4].time = reportEvent?.time || formatDateTime((request as any).reports?.[0]?.createdAt) || "";
    steps[4].current = false;
  } else if ((currentStatus === "Completed" || currentStatus === "Finalized") && (completedEvent || conductedSession)) {
    steps[4].current = true;
    steps[4].note = "Đang chờ báo cáo từ cố vấn.";
  }

  if (feedbackEvent || (request as any).feedbacks?.length > 0) {
    steps[5].done = true;
    steps[5].current = false;
    steps[5].note = feedbackEvent?.note || "Startup đã gửi đánh giá cho phiên tư vấn.";
    steps[5].time = feedbackEvent?.time || formatDateTime((request as any).feedbacks?.[0]?.createdAt) || "";
    steps[4].current = false;
  } else if (reportEvent) {
    steps[5].current = currentStatus !== "Finalized";
  }

  if (terminalFailedEvent) {
    const failIndex = (inProgressEvent || scheduledSession) ? 3 : acceptedEvent ? 2 : 1;
    const failNote =
      terminalFailedEvent.type === "Rejected"
        ? "Cố vấn đã từ chối yêu cầu"
        : !cancellationActorText
          ? "Yêu cầu đã bị hủy"
          : cancellationActorText === "Bạn"
          ? "Bạn đã hủy yêu cầu"
          : `${cancellationActorText} đã hủy yêu cầu`;
    steps[failIndex].failed = true;
    steps[failIndex].current = true;
    steps[failIndex].note = failNote;
    steps[failIndex].time = terminalFailedEvent.time;
  } else if (currentStatus === "Requested" || currentStatus === "Pending") {
    steps[0].current = true;
    steps[1].note = "Đang chờ cố vấn xem xét và phản hồi.";
  } else if (currentStatus === "Accepted" && acceptedEvent) {
    steps[2].current = true;
    steps[2].note = "Đang chờ cố vấn tạo phiên tư vấn đầu tiên.";
  }

  return steps;
}

// ─── Progress Stepper ──────────────────────────────────────────────────────────

function ProgressStepper({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div
        className="grid min-w-[760px] gap-0 sm:min-w-0"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step, i) => {
          const isReached = step.done || step.current || step.failed;
          const isFuture = !step.done && !step.current && !step.failed;
          const leftReached = i > 0 && isReached;
          const rightReached = i < steps.length - 1 && step.done && !step.failed;

          return (
            <div key={i} className="relative px-2">
              {i > 0 && (
                <div
                  className={cn(
                    "absolute left-0 right-1/2 top-5 h-[3px] rounded-full",
                    leftReached
                      ? step.failed
                        ? "bg-red-300"
                        : "bg-[#eec54e]"
                      : "bg-slate-200",
                  )}
                />
              )}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-1/2 right-0 top-5 h-[3px] rounded-full",
                    rightReached ? "bg-[#eec54e]" : "bg-slate-200",
                  )}
                />
              )}

              <div
                className={cn(
                  "relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] transition-all",
                  step.failed
                    ? "border-red-300 bg-red-50 text-red-500 shadow-[0_0_0_4px_rgba(248,113,113,0.08)]"
                    : step.done && step.current
                      ? "border-[#eec54e] bg-[#eec54e] text-white shadow-[0_0_0_5px_rgba(238,197,78,0.15)]"
                      : step.done
                        ? "border-[#eec54e] bg-[#eec54e] text-white"
                        : step.current
                          ? "border-[#eec54e] bg-white text-[#d4a62e] shadow-[0_0_0_5px_rgba(238,197,78,0.12)]"
                          : "border-slate-200 bg-white text-slate-300",
                )}
              >
                {step.failed ? (
                  <X className="h-3.5 w-3.5" />
                ) : step.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      step.current ? "bg-[#eec54e]" : "bg-current",
                    )}
                  />
                )}
              </div>

              <div className="mt-4 flex min-h-[3.5rem] flex-col items-center text-center">
                <p
                  className={cn(
                    "max-w-[130px] text-[11px] font-semibold leading-[1.35]",
                    step.failed
                      ? "text-red-600"
                      : step.current
                        ? "text-slate-900"
                        : step.done
                          ? "text-slate-700"
                          : isFuture
                            ? "text-slate-400"
                            : "text-slate-500",
                  )}
                >
                  {step.label}
                </p>
                {step.current && step.note && !step.failed && (
                  <p className="mt-1 max-w-[150px] text-[10px] font-medium leading-tight text-slate-400">
                    {step.note}
                  </p>
                )}
                {step.failed && step.note && (
                  <p className="mt-1 max-w-[150px] text-[10px] font-medium leading-tight text-red-400">
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
  const [advisorDetail, setAdvisorDetail] = useState<IAdvisorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // UI state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [localStatus, setLocalStatus] = useState<MentorshipRequestStatus | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isConfirmingConducted, setIsConfirmingConducted] = useState(false);

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
        const advisorId =
          res.data.advisorID ||
          (res.data as any).advisorId ||
          res.data.advisor?.advisorID;

        if (advisorId) {
          try {
            const advisorRes = await GetAdvisorById(Number(advisorId)) as unknown as IBackendRes<IAdvisorDetail>;
            const advisorPayload =
              advisorRes?.data && (advisorRes.data as any)?.data
                ? (advisorRes.data as any).data
                : advisorRes?.data;
            setAdvisorDetail((advisorPayload as IAdvisorDetail) || null);
          } catch {
            setAdvisorDetail(null);
          }
        } else {
          setAdvisorDetail(null);
        }
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

  // Confirm conducted handler
  const handleConfirmConducted = async (sessionId: number) => {
    if (!request) return;
    setIsConfirmingConducted(true);
    try {
      const res = await ConfirmSessionConducted(request.mentorshipID, sessionId) as any;
      if (res?.isSuccess || res?.success) {
        toast.success("Đã xác nhận phiên tư vấn hoàn thành!");
        // Update local session state immediately to hide the confirm button
        setRequest(prev => {
          if (!prev) return prev;
          const updatedSessions = ((prev as any).sessions || []).map((s: any) =>
            s.sessionID === sessionId ? { ...s, status: "Conducted", sessionStatus: "Conducted" } : s
          );
          return { ...prev, sessions: updatedSessions } as any;
        });
        fetchRequest();
      } else {
        toast.error(res?.message || "Xác nhận thất bại.");
        fetchRequest(); // Refresh to get latest session state
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xác nhận.");
      fetchRequest(); // Refresh to get latest session state
    } finally {
      setIsConfirmingConducted(false);
    }
  };

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
        toast.success("Yêu cầu đã được hủy thành công.");
        fetchRequest(); // refresh data
      } else {
        toast.error(res.message || "Hủy yêu cầu thất bại.");
      }
    } catch {
      toast.error("Hủy yêu cầu thất bại.");
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
  const isPaid = isMentorshipPaymentCompleted(request.paymentStatus, request.paidAt);
  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Requested"];
  const historyItems = buildHistoryItems(request);
  const progressSteps = buildProgressSteps(historyItems, currentStatus, isPaid, request);
  const requestNo = `REQ-${String(request.mentorshipID || (request as any).id || 0).padStart(4, "0")}`;
  const advisor = advisorDetail || request.advisor || {
    advisorID: request.advisorID,
    fullName: (request as any).advisorName,
    title: "Cố vấn viên",
    profilePhotoURL: "",
    averageRating: null,
  };
  const isCancelled = currentStatus === "Cancelled";
  const blockedChatMessage = getMentorshipChatBlockMessage(currentStatus);
  const parsedSpecificQuestions = parseSpecificQuestions(request.specificQuestions);
  const requestObjective = request.objective || parsedSpecificQuestions.objective || "";
  const requestProblemContext = request.problemContext || request.challengeDescription || "";
  const requestAdditionalNotes = request.additionalNotes || parsedSpecificQuestions.additionalNotes || "";
  const requestScopeTags = normalizeScopeTags(request);
  const hasRequestContent = Boolean(
    requestObjective ||
    requestProblemContext ||
    requestAdditionalNotes ||
    requestScopeTags.length > 0
  );

  const sessions = (request as any).sessions || [];
  const firstSession = sessions.slice().reverse().find((s: any) => s.meetingUrl || s.meetingURL || s.meetingLink) || sessions[sessions.length - 1] || null;
  const scheduledAtString = request.scheduledAt || firstSession?.scheduledStartAt || null;
  const durationMinutes =
    request.durationMinutes ||
    Number((request as any).expectedDuration?.toString().replace(/[^\d]/g, "")) ||
    firstSession?.durationMinutes ||
    null;
  const advisorProposedSessions = sessions.filter((s: any) =>
    (s.status === "ProposedByAdvisor" || s.sessionStatus === "ProposedByAdvisor") &&
    s.status !== "Cancelled" && s.sessionStatus !== "Cancelled"
  );
  const activeSessions = sessions.filter((s: any) =>
    ["Scheduled", "InProgress"].includes(s.status || s.sessionStatus)
  );
  const hasConductedSession = sessions.some((s: any) =>
    ["Conducted", "Completed", "InDispute", "Resolved"].includes(s.status || s.sessionStatus)
  );

  return (
    <StartupShell>
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
                onClick={() => toast.info("Chức năng chỉnh sửa sẽ sớm được mở.")}
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
          <ProgressStepper steps={progressSteps} />
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
          {currentStatus === "Cancelled" && (request.cancelReason || (request as any).rejectedReason || request.cancelledBy) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-4">
              <Ban className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-slate-600 mb-1">Yêu cầu đã được hủy</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">{getCancellationSummary(request)}</p>
                {request.cancelledBy && (
                  <p className="text-[11px] text-slate-400 mt-1">Hủy bởi: {getCancellationActorLabel(request.cancelledBy)}</p>
                )}
              </div>
          </div>
        )}

        {/* Advisor Proposed Slots Banner — hiện khi status còn Requested nhưng advisor đã đề xuất lịch */}
        {advisorProposedSessions.length > 0 && currentStatus !== "Scheduled" && currentStatus !== "InProgress" && currentStatus !== "Completed" && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 flex gap-4 items-start">
            <Calendar className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-violet-800 mb-1">Cố vấn đề xuất {advisorProposedSessions.length} khung giờ mới</p>
              <p className="text-[12px] text-violet-700 leading-relaxed mb-3">
                Vui lòng xem và chọn khung giờ phù hợp để xác nhận lịch tư vấn.
              </p>
              <div className="space-y-2 mb-3">
                {advisorProposedSessions.map((s: any) => (
                  <div key={s.sessionID} className="flex flex-col gap-1 text-[12px] text-violet-700 bg-white border border-violet-100 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-semibold">{new Date(s.scheduledStartAt).toLocaleString("vi-VN", { weekday: "short", day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {s.note && (
                      <p className="text-[11px] text-violet-600 pl-5">{s.note}</p>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push(`/startup/mentorship-requests/${request.mentorshipID}/confirm-schedule`)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-[12px] font-semibold hover:bg-violet-700 transition-all shadow-sm"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                Chọn và xác nhận lịch
              </button>
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
        {(currentStatus === "Scheduled" || currentStatus === "InProgress") && !isPaid && !hasConductedSession && (
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
        {(currentStatus === "Scheduled" || currentStatus === "InProgress") && isPaid && !hasConductedSession && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-4 items-start">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-green-800 mb-2">Thanh toán hoàn tất</p>
              <p className="text-[12px] text-green-700 leading-relaxed mb-3">
                Lịch hẹn lúc {formatDateTime(scheduledAtString)} đã ghi nhận thanh toán. Vui lòng tham gia phiên tư vấn đúng thông tin đã gửi và xác nhận sau khi kết thúc.
              </p>
              {(() => {
                const finalLink =
                  (request as any)?.meetingLink ||
                  (request as any)?.meetingUrl ||
                  firstSession?.meetingLink ||
                  firstSession?.meetingUrl ||
                  firstSession?.meetingURL;

                if (finalLink && finalLink !== "undefined" && finalLink.trim() !== "") {
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={finalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[12px] font-semibold hover:bg-green-700 transition-all shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Tham gia vào cuộc họp
                      </a>
                      {activeSessions.length === 1 && (
                        <button
                          onClick={() => handleConfirmConducted(activeSessions[0].sessionID)}
                          disabled={isConfirmingConducted}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[12px] font-semibold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                        >
                          {isConfirmingConducted
                            ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Xác nhận đã tư vấn
                        </button>
                      )}
                      {activeSessions.length > 1 && (
                        <div className="w-full mt-2 space-y-2">
                          <p className="text-[11px] text-green-700 font-semibold">Chọn phiên cần xác nhận:</p>
                          {activeSessions.map((s: any) => (
                            <button
                              key={s.sessionID}
                              onClick={() => handleConfirmConducted(s.sessionID)}
                              disabled={isConfirmingConducted}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[12px] font-semibold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 w-full"
                            >
                              {isConfirmingConducted
                                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Xác nhận phiên #{s.sessionID} — {formatDateTime(s.scheduledStartAt)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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

        {/* Conducted Banner — session đã diễn ra, chờ advisor nộp báo cáo & staff duyệt */}
        {(currentStatus === "Scheduled" || currentStatus === "InProgress") && hasConductedSession && !((request as any).reports?.length > 0) && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex gap-4 items-start">
            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-teal-800 mb-2">Phiên tư vấn đã diễn ra</p>
              <p className="text-[12px] text-teal-700 leading-relaxed">
                Bạn đã xác nhận phiên tư vấn hoàn thành. Đang chờ cố vấn nộp báo cáo và bộ phận Vận hành phê duyệt để hoàn tất quy trình.
              </p>
            </div>
          </div>
        )}

        {/* Report Ready Banner — session conducted + báo cáo đã có nhưng status chưa Completed */}
        {(currentStatus === "Scheduled" || currentStatus === "InProgress") && hasConductedSession && (request as any).reports?.length > 0 && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex gap-4 items-start">
            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-teal-800 mb-2">Phiên tư vấn đã diễn ra</p>
              <p className="text-[12px] text-teal-700 leading-relaxed mb-3">
                Bạn đã xác nhận phiên tư vấn hoàn thành. Đang chờ bộ phận Vận hành phê duyệt báo cáo để hoàn tất quy trình.
              </p>
              <button
                onClick={() => router.push(`/startup/mentorship-requests/${request.mentorshipID}/report`)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[12px] font-semibold hover:bg-teal-700 transition-all shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                Xem báo cáo
              </button>
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
                    onClick={() => toast.info("Chức năng chỉnh sửa sẽ sớm được mở.")}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Objective / Title */}
                {requestObjective && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mục tiêu buổi tư vấn</p>
                    <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">{requestObjective}</p>
                  </div>
                )}

                {/* Problem Context */}
                {requestProblemContext && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mô tả vấn đề</p>
                    <p className="text-[14px] text-slate-600 leading-relaxed">{requestProblemContext}</p>
                  </div>
                )}

                {/* Additional Notes */}
                {requestAdditionalNotes && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Câu hỏi / Ghi chú thêm</p>
                    <div className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">!</span>
                      <p className="text-[13px] text-slate-700 leading-relaxed">{requestAdditionalNotes}</p>
                    </div>
                  </div>
                )}

                {/* Scope Tags */}
                {requestScopeTags.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Phạm vi hỗ trợ</p>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    {requestScopeTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[12px] font-medium text-slate-500">
                        {tag}
                      </span>
                    ))}
                    </div>
                  </div>
                )}

                {!hasRequestContent && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      Chưa có nội dung chi tiết cho yêu cầu tư vấn này từ API.
                    </p>
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
                {historyItems.map((item, i, arr) => (
                  <div key={i} className="relative pl-8">
                    {i < arr.length - 1 && (
                      <div className="absolute left-2.5 top-5 bottom-[-20px] w-px bg-slate-100" />
                    )}
                    <div className={cn(
                      "absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      item.failed ? "bg-red-50 border-red-300" :
                      "bg-amber-100 border-amber-300"
                    )}>
                      {item.failed
                        ? <X className="w-2.5 h-2.5 text-red-500" />
                        : <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
                      }
                    </div>
                    <div>
                      <p className={cn("text-[13px] font-bold leading-none mb-1", item.failed ? "text-red-600" : "text-slate-700")}>{item.label}</p>
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
                  onClick={() => {
                    if (blockedChatMessage) {
                      toast.error(blockedChatMessage);
                      return;
                    }
                    router.push(`/startup/messaging?mentorshipId=${request.mentorshipID}`);
                  }}
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
                  <span className="text-[12px] font-semibold text-slate-700">{mapMeetingFormat(firstSession?.sessionFormat ?? request.preferredFormat)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    Thời lượng
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">{durationMinutes ? `${durationMinutes} phút` : "—"}</span>
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
