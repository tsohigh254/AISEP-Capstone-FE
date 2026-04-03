import type { IConsultingRequest, ConsultingRequestStatus } from "@/types/advisor-consulting";
import type { IMentorshipRequest } from "@/types/startup-mentorship";

export const mapMentorshipToConsultingRequest = (item: IMentorshipRequest): IConsultingRequest => {

  // Map raw slots from BE `requestedSlots` or `preferredSlots` to UI `preferredSlots`
  const rawSlots: any[] = (item as any).requestedSlots || (item as any).preferredSlots || (item as any).mentorshipRequestedSlots || (item as any).slots || [];

  const mappedSlots = rawSlots.map((slot: any, idx) => {
    // Determine the status. If slot has an existing status use it, otherwise fallback depending on the item's status
    let statusVal = slot.status ? (slot.status.toUpperCase() === "PENDING" ? "PROPOSED" : slot.status.toUpperCase()) : "PROPOSED";
    
    return {
      id: slot.id || `slot-${idx}`,
      proposedBy: (slot.proposedBy?.toUpperCase()) as "STARTUP" | "ADVISOR" || "STARTUP",
      startAt: slot.startAt,
      endAt: slot.endAt,
      timezone: slot.timezone || "Asia/Ho_Chi_Minh",
      status: statusVal as "PROPOSED" | "ACCEPTED" | "DECLINED" | "SUPERSEDED",
      note: slot.note,
      createdAt: slot.createdAt || item.createdAt || new Date().toISOString()
    };
  });

  const preferredSlots = mappedSlots.filter(s => s.proposedBy === "STARTUP");
  const slotProposals = mappedSlots.filter(s => s.proposedBy === "ADVISOR");

  const rawStatus = item.status?.toUpperCase() || (item as any).mentorshipStatus?.toUpperCase() || "PENDING";
  let normalizedStatus: ConsultingRequestStatus = "PENDING";
  if (rawStatus === "REQUESTED") normalizedStatus = "PENDING";
  else if (rawStatus === "INPROGRESS" || rawStatus === "IN_PROGRESS") normalizedStatus = "SCHEDULED";
  else normalizedStatus = rawStatus as ConsultingRequestStatus;

  return {
    id: item.mentorshipID?.toString() || (item as any).id,
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
    preferredSlots,
    slotProposals,
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
      ...((item.completedAt) ? [{
        id: "t6",
        actionType: "SESSION_COMPLETED",
        actorType: "SYSTEM",
        createdAt: item.completedAt
      }] : [])
    ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as any[]
  };
};

