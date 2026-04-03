import axios from "../interceptor";
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

export const GetMentorshipReport = (mentorshipId: number) => {
  return axios.get<IBackendRes<IMentorshipReport>>(
    `/api/mentorships/${mentorshipId}/report`
  );
};
