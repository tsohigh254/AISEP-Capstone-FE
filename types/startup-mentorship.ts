/**
 * Types cho Mentorship từ phía Startup
 * Map với BE endpoints: /api/mentorships, /api/mentorships/sessions
 */

// ── Status enums ─────────────────────────────────────────────────────────────

export type MentorshipRequestStatus =
  | "Requested"
  | "Accepted"
  | "InProgress"
  | "Completed"
  | "Rejected"
  | "Cancelled"
  | "InDispute"
  | "Resolved"
  | "Expired"
  | "Pending"
  | "Scheduled";

export type MentorshipSessionStatus =
  | "ProposedByStartup"
  | "ProposedByAdvisor"
  | "Scheduled"
  | "InProgress"
  | "Conducted"
  | "Completed"
  | "Cancelled"
  | "InDispute"
  | "Resolved";

export type ReportReviewStatus =
  | "PendingReview"
  | "Passed"
  | "Failed"
  | "NeedsMoreInfo";

export type MeetingFormat = "GoogleMeet" | "MicrosoftTeams";

// ── Advisor summary (nhúng trong request/session) ────────────────────────────

export interface IMentorshipAdvisor {
  advisorID: number;
  fullName: string;
  title: string;
  profilePhotoURL: string;
  averageRating?: number;
}

export interface IMentorshipTimelineEvent {
  type?: string;
  actionType?: string;
  title?: string;
  description?: string;
  actor?: string;
  actorType?: string;
  happenedAt?: string;
  createdAt?: string;
}

// ── Mentorship Request (từ GET /api/mentorships) ─────────────────────────────

export interface IMentorshipRequest {
  mentorshipID: number;
  id?: number;
  startupID: number;
  startupName: string;
  startupIndustry?: string | null;
  startupStage?: string | null;
  advisorID: number;
  advisorName: string;
  advisor?: IMentorshipAdvisor;
  status: MentorshipRequestStatus | string;
  mentorshipStatus: string;
  objective?: string;
  problemContext?: string;
  challengeDescription: string;
  specificQuestions: string;
  preferredFormat: string;
  durationMinutes?: number;
  expectedDuration: string;
  expectedScope: string;
  scopeTags?: string[];
  scope?: string;
  additionalNotes?: string;
  obligationSummary: string;
  scheduledAt?: string;
  requestedAt: string;
  acceptedAt: string;
  inProgressAt?: string;
  rejectedAt: string;
  rejectedReason: string;
  rejectionReason?: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  completedAt: string;
  sessionAmount?: number | null;
  actualAmount?: number | null;
  paymentStatus?: string | null;
  paidAt?: string | null;
  isPayoutEligible?: boolean;
  payoutReleasedAt?: string | null;
  hasReport?: boolean;
  reportCount?: number;
  latestReportSubmittedAt?: string | null;
  completionConfirmedByStartup: boolean;
  completionConfirmedByAdvisor: boolean;
  createdAt: string;
  updatedAt: string;
  sessions: IMentorshipSession[];
  reports: IMentorshipReport[];
  feedbacks: IMentorshipFeedback[];
  timelineEvents?: IMentorshipTimelineEvent[];
  timeline?: IMentorshipTimelineEvent[];
}

// ── Create mentorship request (POST /api/mentorships) ────────────────────────

export interface ICreateMentorshipRequest {
  advisorId: number;
  challengeDescription?: string;
  specificQuestions?: string;
  preferredFormat?: MeetingFormat;
  expectedDuration: string;
  expectedScope?: string;
  requestedSlots?: {
    startAt: string;
    endAt: string;
    timezone: string;
  }[];
}

// ── Cancel request (PUT /api/mentorships/{id}/cancel) ────────────────────────

export interface ICancelMentorshipRequest {
  reason: string;
}

// ── Session list item (GET /api/mentorships/sessions) ────────────────────────

export interface IMentorshipSession {
  sessionID: number;
  mentorshipID: number;
  advisorID?: number;
  advisorName?: string;
  advisorProfilePhotoURL?: string;
  advisor?: IMentorshipAdvisor;
  objective?: string;
  status: MentorshipSessionStatus | string;
  sessionStatus?: string;
  mentorshipStatus?: string;
  scheduledStartAt: string;
  scheduledEndAt?: string;
  durationMinutes: number;
  meetingFormat?: MeetingFormat;
  sessionFormat?: string;
  meetingMode?: string;
  mentorshipChallengeDescription?: string;
  hasReport?: boolean;
  meetingURL?: string;
  topicsDiscussed?: string;
  keyInsights?: string;
  actionItems?: string;
  nextSteps?: string;
  createdAt: string;
  updatedAt: string;
  // Oversight fields
  startupConfirmedConductedAt?: string;
  disputeReason?: string;
  resolutionNote?: string;
  markedByStaffID?: number;
  markedAt?: string;
}

export interface IMentorshipReport {
  reportID: number;
  mentorshipID: number;
  sessionID: number;
  createdByAdvisorID: number;
  reportSummary: string;
  detailedFindings: string;
  recommendations: string;
  attachmentsURL: string;
  reportReviewStatus?: ReportReviewStatus | string | null;
  submittedAt: string;
  createdAt: string;
}

export interface IMentorshipFeedback {
  feedbackID: number;
  mentorshipID: number;
  sessionID: number;
  fromRole: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

// ── Feedback (POST /api/mentorships/{id}/feedbacks) ──────────────────────────

export interface ICreateMentorshipFeedback {
  rating: number;
  comment?: string;
}

// ── Report (GET /api/mentorships/reports/{reportId}) ─────────────────────────

export interface IMentorshipReport {
  reportID: number;
  mentorshipID: number;
  advisor: IMentorshipAdvisor;
  content: string; // Keep for backward compatibility
  title?: string;
  summary?: string;
  discussionOverview?: string;
  keyFindings?: string;
  identifiedRisks?: string;
  advisorRecommendations?: string;
  nextSteps?: string;
  deliverablesSummary?: string;
  createdAt: string;
}

// ── Advisor Search (mở rộng cho tab Find) ────────────────────────────────────

export interface IAdvisorSearchItem {
  advisorID: number;
  fullName: string;
  title: string;
  bio: string;
  profilePhotoURL: string;
  averageRating: number;
  reviewCount: number;
  completedSessions: number;
  yearsOfExperience: number;
  expertise: string[];
  domainTags: string[];
  suitableFor: string[];
  isVerified: boolean;
  availabilityHint: string;
  hourlyRate: number;
  supportedDurations: number[];
  industry: { industryId: number; industry: string }[];
}

// ── Advisor Detail (GET /api/advisors/{id}) ──────────────────────────────────

export interface IAdvisorExperience {
  year: string;
  role: string;
  company: string;
  desc: string;
}

export interface IAdvisorSkill {
  label: string;
  value: number;
}

export interface IAdvisorReview {
  author: string;
  stage: string | null;
  rating: number;
  text: string;
  submittedAt?: string;
}

// ── Staff Consulting Oversight ───────────────────────────────────────────────

export interface IReportOversightItem {
  reportID: number;
  mentorshipID: number;
  sessionID: number;
  advisorID: number;
  advisorName: string;
  startupID: number;
  startupName: string;
  reportSummary: string;
  detailedFindings: string;
  recommendations: string;
  attachmentsURL: string | null;
  submittedAt: string;
  reviewStatus: ReportReviewStatus;
  reviewedByStaffID: number | null;
  staffReviewNote: string | null;
  reviewedAt: string | null;
  supersededByReportID: number | null;
  isLatestForSession: boolean;
  sessionStatus: string;
  startupConfirmedConductedAt: string | null;
  mentorshipStatus: string;
  challengeDescription: string;
}

export interface IReviewReportRequest {
  reviewStatus: "Passed" | "Failed" | "NeedsMoreInfo";
  note?: string;
}

export interface IReportReviewResult {
  reportID: number;
  mentorshipID: number;
  reviewStatus: string;
  staffReviewNote: string | null;
  reviewedByStaffID: number | null;
  reviewedAt: string | null;
}

export interface IReleasePayoutResult {
  mentorshipID: number;
  creditedAmount: number;
  payoutReleasedAt: string;
  isPayoutEligible: boolean;
  releasedByStaffID: number;
}

export interface ISessionOversightResult {
  sessionID: number;
  sessionStatus: string;
  disputeReason: string | null;
  resolutionNote: string | null;
  mentorshipID: number;
  mentorshipStatus: string;
  isPayoutEligible: boolean;
  markedByStaffID: number | null;
  markedAt: string | null;
}

export interface IStaffMarkDisputeRequest {
  reason: string;
}

export interface IResolveDisputeRequest {
  resolution: string;
  restoreCompleted: boolean;
}

export interface IStaffSessionNoteRequest {
  note?: string;
}

export interface IAdvisorTimeSlot {
  dayOfWeek: number; // 0=Thứ 2 … 6=CN
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface IAdvisorDetail {
  advisorID: number;
  fullName: string;
  title: string;
  bio: string;
  profilePhotoURL: string;
  linkedInURL?: string;
  company?: string;
  mentorshipPhilosophy?: string;
  averageRating: number;
  reviewCount: number;
  completedSessions: number;
  yearsOfExperience: number;
  expertise: string[];
  domainTags: string[];
  suitableFor: string[];
  isVerified: boolean;
  availabilityHint: string;
  hourlyRate: number;
  supportedDurations: number[];
  industry: { industryId: number; industry: string }[];
  biography: string;
  philosophy: string;
  ratingBreakdown: { score: number; count: number }[];
  experience: IAdvisorExperience[];
  skills: IAdvisorSkill[];
  reviews: IAdvisorReview[];
  timeSlots?: IAdvisorTimeSlot[];
}
