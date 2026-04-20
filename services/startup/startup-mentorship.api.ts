import axios from "../interceptor";
import { parseReportFields } from "@/lib/report-parser";
import type {
  ICreateMentorshipRequest,
  ICancelMentorshipRequest,
  ICreateMentorshipFeedback,
  IMentorshipRequest,
  IMentorshipReport,
  IMentorshipSession,
  IAdvisorSearchItem,
  IAdvisorDetail,
} from "@/types/startup-mentorship";

// ── Advisor Search & Detail ──────────────────────────────────────────────────

export const SearchAdvisors = (params: {
  search?: string;
  expertise?: string;
  experience?: number;
  rating?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}) => {
  return axios.get<IBackendRes<IPagingData<IAdvisorSearchItem>>>(
    "/api/advisors/search",
    { params }
  );
};

export const GetAdvisorById = (id: number) => {
  return axios.get<IBackendRes<IAdvisorDetail>>(`/api/advisors/${id}`);
};

// ── Mentorship Requests ──────────────────────────────────────────────────────

export const GetMentorships = (params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return axios.get<IBackendRes<IPagingData<IMentorshipRequest>>>(
    "/api/mentorships",
    { params }
  );
};

export const CreateMentorship = (data: ICreateMentorshipRequest) => {
  return axios.post<IBackendRes<IMentorshipRequest>>("/api/mentorships", data);
};

export const GetMentorshipById = (id: number) => {
  return axios.get<IBackendRes<IMentorshipRequest>>(`/api/mentorships/${id}`);
};

export const CancelMentorship = (id: number, data: ICancelMentorshipRequest) => {
  return axios.put<IBackendRes<null>>(`/api/mentorships/${id}/cancel`, data);
};

// ── Mentorship Sessions ──────────────────────────────────────────────────────

export const GetMentorshipSessions = (params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) => {
  return axios.get<IBackendRes<IPagingData<IMentorshipSession>>>(
    "/api/mentorships/sessions",
    { params }
  );
};

export const ConfirmMentorshipSession = (
  mentorshipId: number,
  sessionId: number
) => {
  return axios.post<IBackendRes<null>>(
    `/api/mentorships/${mentorshipId}/sessions/${sessionId}/confirm`
  );
};

// ── Feedback & Reports ───────────────────────────────────────────────────────

export const SubmitMentorshipFeedback = (
  mentorshipId: number,
  data: ICreateMentorshipFeedback
) => {
  return axios.post<IBackendRes<null>>(
    `/api/mentorships/${mentorshipId}/feedbacks`,
    data
  );
};

// ── Startup Confirm Conducted ────────────────────────────────────────────────

export const ConfirmSessionConducted = (
  mentorshipId: number,
  sessionId: number
) => {
  return axios.post<IBackendRes<unknown>>(
    `/api/mentorships/${mentorshipId}/sessions/${sessionId}/confirm-conducted`
  );
};

type MentorshipReportSource = {
  reportID: number;
  mentorshipID: number;
  reviewStatus?: string | null;
  startupAcknowledgedAt?: string | null;
  issueReportDeadlineAt?: string | null;
  canSubmitIssueReport?: boolean | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  reportSummary?: string | null;
  detailedFindings?: string | null;
  recommendations?: string | null;
  attachmentsURL?: string | null;
};

type MentorshipDetailWithReports = {
  reports?: MentorshipReportSource[] | null;
  advisorID?: number;
  advisorName?: string | null;
  advisorTitle?: string | null;
  advisorPhotoURL?: string | null;
};

const isBackendEnvelope = (
  value: IBackendRes<MentorshipDetailWithReports> | MentorshipDetailWithReports
): value is IBackendRes<MentorshipDetailWithReports> =>
  typeof value === "object" && value !== null && "data" in value;

export const GetMentorshipReport = async (mentorshipId: number) => {
  const response = await axios.get<IBackendRes<MentorshipDetailWithReports> | MentorshipDetailWithReports>(
    `/api/mentorships/${mentorshipId}`
  );
  const data = response;
  let mentorship: MentorshipDetailWithReports | null | undefined;
  let message: string | undefined;

  if (isBackendEnvelope(data)) {
    const envelope = data as IBackendRes<MentorshipDetailWithReports>;
    mentorship = envelope.data;
    message = envelope.message;
  } else {
    mentorship = data;
  }
  const actualReport = mentorship?.reports?.[0];
  
  if (actualReport && mentorship) {
    const mappedReport: IMentorshipReport = {
      reportID: actualReport.reportID,
      mentorshipID: actualReport.mentorshipID,
      reviewStatus: actualReport.reviewStatus || "Passed",
      startupAcknowledgedAt: actualReport.startupAcknowledgedAt || null,
      issueReportDeadlineAt: actualReport.issueReportDeadlineAt || null,
      canSubmitIssueReport: Boolean(actualReport.canSubmitIssueReport),
      submittedAt: actualReport.submittedAt || actualReport.createdAt || new Date().toISOString(),
      createdAt: actualReport.submittedAt || actualReport.createdAt || new Date().toISOString(),
      ...parseReportFields(
        actualReport.reportSummary ?? undefined,
        actualReport.detailedFindings ?? undefined,
        actualReport.recommendations ?? undefined
      ),
      content: [
         actualReport.reportSummary,
         actualReport.detailedFindings,
         actualReport.recommendations
      ].filter(Boolean).join("\n\n"),
      attachmentsURL: actualReport.attachmentsURL || null,
      advisor: {
        advisorID: mentorship.advisorID ?? 0,
        fullName: mentorship.advisorName || "Cố vấn",
        title: mentorship.advisorTitle || "Chuyên gia / Cố vấn",
        profilePhotoURL: mentorship.advisorPhotoURL || ""
      }
    };
    return {
      isSuccess: true,
      data: mappedReport,
      message
    };
  }
  
  return {
    isSuccess: false,
    data: null,
    message: "Khong tim thay bao cao"
  };
};

export const AcknowledgeMentorshipReport = (
  mentorshipId: number,
  reportId: number
) => {
  return axios.post<IBackendRes<unknown>>(
    `/api/mentorships/${mentorshipId}/reports/${reportId}/acknowledge`
  );
};

// ── Payment ──────────────────────────────────────────────────────────────────

export const CreatePaymentLink = (data: {
  amount: number;
  mentorshipId: number;
}) => {
  return axios.post("/api/Payment/create-payment-link", data);
};
