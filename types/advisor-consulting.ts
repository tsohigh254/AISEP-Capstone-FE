// Request statuses
export type ConsultingRequestStatus =
  | 'PENDING'
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FINALIZED'
  | 'IN_DISPUTE'
  | 'RESOLVED';

// Session statuses
export type ConsultingSessionStatus =
  | 'PENDING_CONFIRMATION'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED';

// Slot proposal status
export type SlotProposalStatus =
  | 'PROPOSED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'SUPERSEDED';

// Preferred format / meeting platform
export type ConsultingFormat = 'GOOGLE_MEET' | 'MICROSOFT_TEAMS';

// Startup summary (embedded in request)
export interface IConsultingStartup {
  id: number;
  displayName: string;
  logoUrl: string | null;
  industry: string;
  stage: string;
}

// Time slot proposal
export interface ITimeSlotProposal {
  id: string;
  proposedBy: 'STARTUP' | 'ADVISOR' | 'SYSTEM';
  startAt: string; // ISO
  endAt: string; // ISO
  timezone: string;
  status: SlotProposalStatus;
  note?: string;
  createdAt: string;
}

// Confirmation state
export interface IScheduleConfirmation {
  startupConfirmedAt: string | null;
  advisorConfirmedAt: string | null;
  fullyConfirmed: boolean;
}

// Timeline/activity log entry
export interface IConsultingActivity {
  id: string;
  actionType: string; // REQUEST_CREATED, REQUEST_ACCEPTED, REQUEST_REJECTED, etc.
  actorType: 'STARTUP' | 'ADVISOR' | 'SYSTEM';
  fromStatus?: string;
  toStatus?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Scope tags submitted by startup
export type ConsultingScopeTag =
  | 'strategy' | 'fundraising' | 'product'
  | 'engineering' | 'marketing' | 'legal' | 'operations'
  | 'FUNDRAISING' | 'PRODUCT_STRATEGY' | 'GO_TO_MARKET'
  | 'FINANCE' | 'LEGAL_IP' | 'OPERATIONS'
  | 'TECHNOLOGY' | 'MARKETING' | 'HR_OR_TEAM_BUILDING';

// Consulting Request (list item)
export interface IConsultingRequest {
  id?: string;
  mentorshipID?: number
  startupID?: number
  startupName?: string
  advisorID?: number
  status: ConsultingRequestStatus;
  submittedAt: string;
  expiresAt: string | null;
  startup: IConsultingStartup;
  objective: string;         // Mục tiêu buổi tư vấn
  problemContext?: string;   // Mô tả vấn đề / thách thức
  scopeTags?: ConsultingScopeTag[];  // Phạm vi hỗ trợ (multi-select)
  scope?: string;            // legacy / free text fallback
  durationMinutes?: number;  // 30 | 60 | 90
  additionalNotes?: string;
  preferredFormat: ConsultingFormat;
  preferredSlots: ITimeSlotProposal[];
  slotProposals: ITimeSlotProposal[];
  confirmation: IScheduleConfirmation;
  paymentStatus?: string | null;
  paidAt?: string | null;
  rejectionReason?: string;
  cancelReason?: string;
  cancelledBy?: string;
  timeline: IConsultingActivity[];
  feedbacks?: any[];
  advisorRespondedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
}

// Consulting Session
export interface IConsultingSession {
  id: string;
  requestId: string;
  startup: IConsultingStartup;
  objective: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  timezone: string;
  status: ConsultingSessionStatus;
  meetingMode: ConsultingFormat;
  meetingLink?: string;
  confirmation: IScheduleConfirmation;
  cancelReason?: string;
  cancelledBy?: string;
  completedAt?: string;
}
