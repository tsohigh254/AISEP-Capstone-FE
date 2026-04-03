/**
 * Types cho Mentorship từ phía Startup
 * Map với BE endpoints: /api/mentorships, /api/mentorships/sessions
 */

// ── Status enums ─────────────────────────────────────────────────────────────

export type MentorshipRequestStatus =
  | "Requested"
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Scheduled"
  | "Completed"
  | "Cancelled"
  | "Finalized";

export type MentorshipSessionStatus =
  | "Requested"
  | "Pending"
  | "Scheduled"
  | "Completed"
  | "Cancelled";

export type MeetingFormat = "GoogleMeet" | "MicrosoftTeams";

// ── Advisor summary (nhúng trong request/session) ────────────────────────────

export interface IMentorshipAdvisor {
  advisorID: number;
  fullName: string;
  title: string;
  profilePhotoURL: string;
  averageRating?: number;
}

// ── Mentorship Request (từ GET /api/mentorships) ─────────────────────────────

export interface IMentorshipRequest {
  mentorshipID: number;
  advisorID: number;
  advisor: IMentorshipAdvisor;
  status: MentorshipRequestStatus;
  objective: string;
  problemContext?: string;
  scopeTags?: string[];
  durationMinutes?: number;
  additionalNotes?: string;
  preferredFormat?: MeetingFormat;
  rejectionReason?: string;
  cancelReason?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  scheduledAt?: string;
  completedAt?: string;
}

// ── Create mentorship request (POST /api/mentorships) ────────────────────────

export interface ICreateMentorshipRequest {
  advisorID: number;
  objective: string;
  problemContext?: string;
  challengeDescription?: string;
  scopeTags?: string[];
  durationMinutes?: number;
  additionalNotes?: string;
  preferredFormat?: MeetingFormat;
  requestedSlots?: {
    startAt: string;
    endAt: string;
    timezone: string;
    note?: string;
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
  advisor: IMentorshipAdvisor;
  objective: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  timezone?: string;
  status: MentorshipSessionStatus;
  meetingFormat?: MeetingFormat;
  meetingLink?: string;
  completedAt?: string;
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
  content: string;
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
  stage: string;
  rating: number;
  text: string;
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
}
