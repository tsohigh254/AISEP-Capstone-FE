import axios from "../interceptor";
import type {
  IReportOversightItem,
  IReviewReportRequest,
  IReportReviewResult,
  IReleasePayoutResult,
  ISessionOversightResult,
  IStaffMarkDisputeRequest,
  IResolveDisputeRequest,
  IStaffSessionNoteRequest,
  IMentorshipRequest,
} from "@/types/startup-mentorship";

// ── Query params ─────────────────────────────────────────────────────────────

export interface IOversightReportParams {
  reviewStatus?: string;
  advisorId?: number;
  startupId?: number;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface IPayoutEligibleMentorshipParams {
  page?: number;
  pageSize?: number;
}

// ── Staff Report Oversight ───────────────────────────────────────────────────

export const GetOversightReports = (params: IOversightReportParams = {}) => {
  return axios.get<
    IBackendRes<IPagingData<IReportOversightItem>>
  >("/api/mentorships/oversight/reports", { params });
};

export const GetPayoutEligibleMentorships = (
  params: IPayoutEligibleMentorshipParams = {}
) => {
  return axios.get<
    IBackendRes<IPagingData<IMentorshipRequest>>
  >("/api/mentorships", {
    params: {
      isPayoutEligible: true,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
    },
  });
};

export const ReleasePayout = (mentorshipId: number | string) => {
  return axios.post<IBackendRes<IReleasePayoutResult>>(
    `/api/mentorships/${mentorshipId}/release-payout`
  );
};

export const ReviewReport = (
  reportId: number,
  data: IReviewReportRequest
) => {
  return axios.put<IBackendRes<IReportReviewResult>>(
    `/api/mentorships/reports/${reportId}/review`,
    data
  );
};

// ── Startup — Confirm Conducted ──────────────────────────────────────────────

export const ConfirmConducted = (
  mentorshipId: number,
  sessionId: number
) => {
  return axios.post<IBackendRes<any>>(
    `/api/mentorships/${mentorshipId}/sessions/${sessionId}/confirm-conducted`
  );
};

// ── Staff Session Actions ────────────────────────────────────────────────────

export const MarkSessionCompleted = (
  mentorshipId: number,
  sessionId: number,
  data?: IStaffSessionNoteRequest
) => {
  return axios.put<IBackendRes<ISessionOversightResult>>(
    `/api/mentorships/${mentorshipId}/sessions/${sessionId}/mark-completed`,
    data ?? {}
  );
};

export const MarkSessionDispute = (
  mentorshipId: number,
  sessionId: number,
  data: IStaffMarkDisputeRequest
) => {
  return axios.put<IBackendRes<ISessionOversightResult>>(
    `/api/mentorships/${mentorshipId}/sessions/${sessionId}/mark-dispute`,
    data
  );
};

export const MarkSessionResolved = (
  mentorshipId: number,
  sessionId: number,
  data: IResolveDisputeRequest
) => {
  return axios.put<IBackendRes<ISessionOversightResult>>(
    `/api/mentorships/${mentorshipId}/sessions/${sessionId}/mark-resolved`,
    data
  );
};
