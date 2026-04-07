import type { IConsultingRequest, ConsultingRequestStatus } from "@/types/advisor-consulting";
import type { IMentorshipRequest } from "@/types/startup-mentorship";

export const mapMentorshipToConsultingRequest = (item: IMentorshipRequest): IConsultingRequest => {

  // Map raw slots from BE `requestedSlots` or `preferredSlots` to UI `preferredSlots`
  const sessions = (item as any).sessions || [];
  const otherSlots: any[] = (item as any).requestedSlots || (item as any).preferredSlots || (item as any).mentorshipRequestedSlots || (item as any).slots || [];
  const rawSlots = [...sessions, ...otherSlots];

  const mappedSlots = rawSlots.map((slot: any, idx) => {
    // Determine the status. If slot has an existing status use it, otherwise fallback depending on the item's status
    const rawState = slot.status || slot.sessionStatus;
    let statusVal = rawState ? (rawState.toUpperCase() === "PENDING" ? "PROPOSED" : rawState.toUpperCase()) : "PROPOSED";
    
    let isProposedByStartup = slot.proposedBy?.toUpperCase() === "STARTUP";
    if (rawState?.toUpperCase() === "PROPOSEDBYSTARTUP" || rawState?.toUpperCase() === "PROPOSED_BY_STARTUP") {
        isProposedByStartup = true;
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
    if (normalizedStatus === "COMPLETED" && (item as any).reports && (item as any).reports.length > 0) {
      normalizedStatus = "FINALIZED";
    }

  return {
    id: item.mentorshipID?.toString() || (item as any).id,
    mentorshipID: item.mentorshipID || Number((item as any).id) || undefined,
    startupID: item.startupID,
    startupName: item.startupName,
    advisorID: item.advisorID,
    status: normalizedStatus,
    submittedAt: item.createdAt || (item as any).submittedAt || new Date().toISOString(),
    expiresAt: null,
    startup: {
      id: (item as any).startupId || (item as any).startup?.id || "unknown",
      displayName: (item as any).startupName || (item as any).startup?.name || "Startup ẩn danh",
      logoUrl: (item as any).startupLogoUrl || (item as any).startup?.logoUrl || null,
      industry: (item as any).startupIndustry || "Chưa xác định",
      stage: (item as any).startupStage || "Khởi nghiệp",
    },
    objective: item.objective || (item as any).obligationSummary || "Yêu cầu tư vấn (Không có tiêu đề)",
    problemContext: item.problemContext || (item as any).challengeDescription || "",
    additionalNotes: (item as any).additionalNotes || (item as any).specificQuestions || "",
    durationMinutes: item.durationMinutes || (item as any).expectedDuration || 60,
    preferredFormat: (item.preferredFormat?.toUpperCase() === "GOOGLEMEET"
      ? "GOOGLE_MEET"
      : "MICROSOFT_TEAMS") as any,
    preferredSlots: preferredSlots as any,
    slotProposals: slotProposals as any,
    feedbacks: (item as any).feedbacks || [],
    confirmation: {
      startupConfirmedAt: (item as any).completionConfirmedByStartup || null,
      advisorConfirmedAt: (item as any).completionConfirmedByAdvisor || null,
      fullyConfirmed: !!(item as any).completionConfirmedByStartup && !!(item as any).completionConfirmedByAdvisor,
    },
    timeline: [
      {
        id: "t1",
        actionType: "REQUEST_SUBMITTED",
        actorType: "STARTUP",
        createdAt: item.createdAt || (item as any).submittedAt || new Date().toISOString()
      },
      ...((item.acceptedAt) ? [{
        id: "t2",
        actionType: "REQUEST_ACCEPTED",
        actorType: "ADVISOR",
        createdAt: item.acceptedAt
      }] : []),
      ...((item.scheduledAt) ? [{
        id: "t3",
        actionType: "ADVISOR_PROPOSED_TIME",
        actorType: "ADVISOR",
        createdAt: item.scheduledAt
      }] : []),
      ...((item.rejectedAt) ? [{
        id: "t4",
        actionType: "REQUEST_REJECTED",
        actorType: "ADVISOR",
        createdAt: item.rejectedAt
      }] : []),
      ...((item.cancelledAt) ? [{
        id: "t5",
        actionType: "SESSION_CANCELLED",
        actorType: item.cancelledBy === "Startup" ? "STARTUP" : "ADVISOR",
        createdAt: item.cancelledAt
      }] : []),
            ...(((item as any).reports && (item as any).reports.length > 0) ? [{ id: "t7", actionType: "REPORT_SUBMITTED", actorType: "ADVISOR", createdAt: (item as any).reports[0].createdAt || item.completedAt }] : []),
      ...(((item as any).feedbacks && (item as any).feedbacks.length > 0) ? [{ id: "t8", actionType: "FEEDBACK_SUBMITTED", actorType: "STARTUP", createdAt: (item as any).feedbacks[0].createdAt || item.completedAt }] : []),
      ...((item.completedAt) ? [{
        id: "t6",
        actionType: "SESSION_COMPLETED",
        actorType: "SYSTEM",
        createdAt: item.completedAt
      }] : [])
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as any[]
  };
};

