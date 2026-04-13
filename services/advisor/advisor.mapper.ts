import type { IConsultingRequest, ConsultingRequestStatus } from "@/types/advisor-consulting";
import type { IMentorshipRequest } from "@/types/startup-mentorship";

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

const normalizeActorType = (actor?: string | null, actorType?: string | null) => {
  const raw = (actorType || actor || "").trim().toUpperCase();
  if (raw === "STARTUP") return "STARTUP" as const;
  if (raw === "ADVISOR") return "ADVISOR" as const;
  return "SYSTEM" as const;
};

const normalizeTimelineActionType = (type?: string | null, actionType?: string | null) => {
  const raw = (actionType || type || "").trim();
  const key = raw.toLowerCase();

  switch (key) {
    case "requested":
      return "REQUEST_SUBMITTED";
    case "accepted":
      return "REQUEST_ACCEPTED";
    case "inprogress":
    case "in_progress":
      return "SESSION_SCHEDULED";
    case "rejected":
      return "REQUEST_REJECTED";
    case "cancelled":
    case "canceled":
      return "REQUEST_CANCELLED";
    case "completed":
      return "SESSION_COMPLETED";
    default:
      return raw || "REQUEST_SUBMITTED";
  }
};

export const mapMentorshipToConsultingRequest = (item: IMentorshipRequest): IConsultingRequest => {
  const parsedSpecificQuestions = parseSpecificQuestions((item as any).specificQuestions);
  const rawTimeline =
    (item as any).timelineEvents ||
    (item as any).timeline ||
    (item as any).mentorshipHistories ||
    [];

  const rawScopeTags =
    Array.isArray((item as any).scopeTags) && (item as any).scopeTags.length > 0
      ? (item as any).scopeTags
      : ((item as any).expectedScope || (item as any).scope || "")
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean);

  const sessions = (item as any).sessions || [];
  const otherSlots: any[] =
    (item as any).requestedSlots ||
    (item as any).preferredSlots ||
    (item as any).mentorshipRequestedSlots ||
    (item as any).slots ||
    [];
  const rawSlots = [...sessions, ...otherSlots];

  const mappedSlots = rawSlots.map((slot: any, idx) => {
    const rawState = slot.status || slot.sessionStatus;
    let statusVal = rawState ? (rawState.toUpperCase() === "PENDING" ? "PROPOSED" : rawState.toUpperCase()) : "PROPOSED";

    let isProposedByStartup = slot.proposedBy?.toUpperCase() === "STARTUP";
    if (rawState?.toUpperCase() === "PROPOSEDBYSTARTUP" || rawState?.toUpperCase() === "PROPOSED_BY_STARTUP") {
      isProposedByStartup = true;
      statusVal = "PROPOSED";
    }
    if (rawState?.toUpperCase() === "PROPOSEDBYADVISOR" || rawState?.toUpperCase() === "PROPOSED_BY_ADVISOR") {
      isProposedByStartup = false;
      statusVal = "PROPOSED";
    }

    if (statusVal === "SCHEDULED") statusVal = "ACCEPTED";

    const start = slot.startAt || slot.scheduledStartAt;
    let end = slot.endAt;
    if (!end && start) {
      end = new Date(new Date(start).getTime() + (slot.durationMinutes || 60) * 60000).toISOString();
    }

    return {
      id: slot.sessionID?.toString() || slot.id || `slot-${idx}`,
      proposedBy: isProposedByStartup ? "STARTUP" : "ADVISOR",
      startAt: start,
      endAt: end,
      timezone: slot.timezone || "Asia/Ho_Chi_Minh",
      status: statusVal as "PROPOSED" | "ACCEPTED" | "DECLINED" | "SUPERSEDED",
      note: slot.note || slot.topicsDiscussed,
      createdAt: slot.createdAt || (item as any).createdAt || new Date().toISOString()
    };
  });

  const preferredSlots = mappedSlots.filter(s => s.proposedBy === "STARTUP");
  const slotProposals = mappedSlots.filter(s => s.proposedBy === "ADVISOR");

  const rawStatus = item.status?.toUpperCase() || (item as any).mentorshipStatus?.toUpperCase() || "PENDING";
  let normalizedStatus: ConsultingRequestStatus = "PENDING";
  if (rawStatus === "REQUESTED") normalizedStatus = "PENDING";
  else if (rawStatus === "INPROGRESS" || rawStatus === "IN_PROGRESS") normalizedStatus = "SCHEDULED";
  else normalizedStatus = rawStatus as ConsultingRequestStatus;

  if (normalizedStatus === "COMPLETED") {
    const hasReportFlag = (item as any).hasReport === true || ((item as any).reportCount ?? 0) > 0;
    const hasReportInArray = Array.isArray((item as any).reports) && (item as any).reports.length > 0;
    if (hasReportFlag || hasReportInArray) normalizedStatus = "FINALIZED";
  }

  const fallbackTimeline = [
    {
      id: "t1",
      actionType: "REQUEST_SUBMITTED",
      actorType: "STARTUP" as const,
      createdAt: (item as any).requestedAt || item.createdAt || (item as any).submittedAt || new Date().toISOString()
    },
    ...((item.acceptedAt) ? [{
      id: "t2",
      actionType: "REQUEST_ACCEPTED",
      actorType: "ADVISOR" as const,
      createdAt: item.acceptedAt
    }] : []),
    ...(((item as any).inProgressAt) ? [{
      id: "t3",
      actionType: "SESSION_SCHEDULED",
      actorType: "ADVISOR" as const,
      createdAt: (item as any).inProgressAt
    }] : []),
    ...((item.rejectedAt) ? [{
      id: "t4",
      actionType: "REQUEST_REJECTED",
      actorType: "ADVISOR" as const,
      createdAt: item.rejectedAt
    }] : []),
    ...((item.cancelledAt) ? [{
      id: "t5",
      actionType: "REQUEST_CANCELLED",
      actorType: item.cancelledBy === "Startup" ? "STARTUP" as const : item.cancelledBy === "Advisor" ? "ADVISOR" as const : "SYSTEM" as const,
      createdAt: item.cancelledAt
    }] : []),
    ...(((item as any).reports && (item as any).reports.length > 0) ? [{
      id: "t7",
      actionType: "REPORT_SUBMITTED",
      actorType: "ADVISOR" as const,
      createdAt: (item as any).reports[0].createdAt || item.completedAt
    }] : []),
    ...(((item as any).feedbacks && (item as any).feedbacks.length > 0) ? [{
      id: "t8",
      actionType: "FEEDBACK_SUBMITTED",
      actorType: "STARTUP" as const,
      createdAt: (item as any).feedbacks[0].createdAt || item.completedAt
    }] : []),
    ...((item.completedAt) ? [{
      id: "t6",
      actionType: "SESSION_COMPLETED",
      actorType: "SYSTEM" as const,
      createdAt: item.completedAt
    }] : [])
  ];

  return {
    id: item.mentorshipID?.toString() || (item as any).id,
    mentorshipID: item.mentorshipID || Number((item as any).id) || undefined,
    startupID: item.startupID,
    startupName: item.startupName,
    advisorID: item.advisorID,
    status: normalizedStatus,
    submittedAt: (item as any).requestedAt || item.createdAt || (item as any).submittedAt || new Date().toISOString(),
    expiresAt: null,
    startup: {
      id: item.startupID || (item as any).startupId || (item as any).startup?.id || "unknown",
      displayName: (item as any).startupName || (item as any).startup?.name || "Startup ẩn danh",
      logoUrl: (item as any).startupLogoUrl || (item as any).startup?.logoUrl || null,
      industry: item.startupIndustry || (item as any).startup?.industry || "Chưa xác định",
      stage: item.startupStage || (item as any).startup?.stage || "Khởi nghiệp",
    },
    objective: item.objective || parsedSpecificQuestions.objective || item.challengeDescription || (item as any).specificQuestions || "Yêu cầu tư vấn (Không có tiêu đề)",
    problemContext: item.problemContext || (item as any).challengeDescription || "",
    scopeTags: rawScopeTags as any,
    scope: (item as any).scope || (item as any).expectedScope || "",
    additionalNotes: (item as any).additionalNotes || parsedSpecificQuestions.additionalNotes || "",
    durationMinutes: item.durationMinutes || (item as any).expectedDuration || 60,
    preferredFormat: (() => {
      const fmt = item.preferredFormat?.toUpperCase().replace(/_/g, "") ?? "";
      return (fmt === "GOOGLEMEET" ? "GOOGLE_MEET" : "MICROSOFT_TEAMS") as any;
    })(),
    preferredSlots: preferredSlots as any,
    slotProposals: slotProposals as any,
    paymentStatus: item.paymentStatus ?? null,
    paidAt: item.paidAt ?? null,
    feedbacks: (item as any).feedbacks || [],
    confirmation: {
      startupConfirmedAt: (item as any).completionConfirmedByStartup || null,
      advisorConfirmedAt: (item as any).completionConfirmedByAdvisor || null,
      fullyConfirmed: !!(item as any).completionConfirmedByStartup && !!(item as any).completionConfirmedByAdvisor,
    },
    timeline: (
      Array.isArray(rawTimeline) && rawTimeline.length > 0
        ? rawTimeline.map((entry: any, idx: number) => ({
            id: entry.id || `evt-${idx}`,
            actionType: normalizeTimelineActionType(entry.type, entry.actionType),
            actorType: normalizeActorType(entry.actor, entry.actorType),
            metadata: entry.metadata,
            createdAt: entry.happenedAt || entry.createdAt || new Date().toISOString(),
          }))
        : fallbackTimeline
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as any[],
    rejectionReason: (item as any).rejectionReason || (item as any).rejectedReason,
    cancelReason: (item as any).cancelReason,
    cancelledBy: (item as any).cancelledBy,
    advisorRespondedAt: (item as any).advisorRespondedAt,
    acceptedAt: item.acceptedAt,
    rejectedAt: item.rejectedAt,
    cancelledAt: item.cancelledAt,
  };
};
