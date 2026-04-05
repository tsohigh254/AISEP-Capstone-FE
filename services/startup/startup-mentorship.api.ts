import axios from "../interceptor";
import { parseReportFields } from "@/lib/report-parser";
import type {
  ICreateMentorshipRequest,
  ICancelMentorshipRequest,
  ICreateMentorshipFeedback,
  IMentorshipRequest,
  IMentorshipSession,
  IMentorshipReport,
  IAdvisorSearchItem,
  IAdvisorDetail,
} from "@/types/startup-mentorship";

// ── Advisor Search & Detail ──────────────────────────────────────────────────

export const SearchAdvisors = (params: {
  search?: string;
  industryId?: number;
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

export const GetMentorshipReport = async (mentorshipId: number) => {
  const response = await axios.get(`/api/mentorships/${mentorshipId}`);
  const data = response.data as any;
  const mentorship = data?.data || data;
  const actualReport = mentorship?.reports?.[0];
  
  if (actualReport) {
    const mappedReport = {
      reportID: actualReport.reportID,
      mentorshipID: actualReport.mentorshipID,
      createdAt: actualReport.submittedAt || actualReport.createdAt || new Date().toISOString(),
      ...parseReportFields(actualReport.reportSummary, actualReport.detailedFindings, actualReport.recommendations),
      content: [
         actualReport.reportSummary,
         actualReport.detailedFindings,
         actualReport.recommendations
      ].filter(Boolean).join("\n\n"),
      advisor: {
        advisorID: mentorship.advisorID,
        fullName: mentorship.advisorName || "Cố vấn",
        title: "Chuyên gia / Cố vấn",
        profilePhotoURL: ""
      }
    };
    return {
      isSuccess: true,
      data: mappedReport as any,
      message: data?.message
    };
  }
  
  return {
    isSuccess: false,
    data: null,
    message: "Khong tim thay bao cao"
  };
};

// ── Payment ──────────────────────────────────────────────────────────────────

export const CreatePaymentLink = (data: {
  amount: number;
  orderCode: number;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}) => {
  return axios.post("/api/Payment/create-payment-link", data);
};
