import type { IMentorshipRequest } from "@/types/startup-mentorship";
import axios from "../interceptor";

// DTO matching backend ExpertiseItemDto
export interface ExpertiseItemDto {
  category: string;
  subTopic?: string | null;
  proficiencyLevel?: string | null;
  yearsOfExperience?: number | null;
}

export interface ServicePricingDto {
  isBookable: boolean;
  hourlyRate: number | null;
  currency: "USD" | "VND";
  supportedDurations: number[];
}

interface AdvisorProfileOptionalFields {
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  profilePhotoFile?: File | null;
  experienceYears?: number | null;
  website?: string | null;
  linkedInURL?: string | null;
  googleMeetLink?: string | null;
  msTeamsLink?: string | null;
  mentorshipPhilosophy?: string | null;
  items?: ExpertiseItemDto[];
  servicePricing?: ServicePricingDto;
  advisorIndustryFocus?: { industryId: number }[];
}

const buildAdvisorFormData = (
  fullName: string,
  options: AdvisorProfileOptionalFields = {},
): FormData => {
  const formData = new FormData();

  // Required
  formData.append("FullName", fullName);

  // Optional simple fields
  if (options.title) formData.append("Title", options.title);
  if (options.company) formData.append("Company", options.company);
  if (options.bio) formData.append("Bio", options.bio);
  if (options.experienceYears !== undefined && options.experienceYears !== null) {
    formData.append("YearsOfExperience", String(options.experienceYears));
  }
  if (options.website) formData.append("Website", options.website);
  if (options.linkedInURL) formData.append("LinkedInURL", options.linkedInURL);
  if (options.googleMeetLink) formData.append("GoogleMeetLink", options.googleMeetLink);
  if (options.msTeamsLink) formData.append("MsTeamsLink", options.msTeamsLink);
  if (options.mentorshipPhilosophy)
    formData.append("MentorshipPhilosophy", options.mentorshipPhilosophy);

  // Service Pricing (Flattened)
  if (options.servicePricing) {
    if (options.servicePricing.hourlyRate !== null && options.servicePricing.hourlyRate !== undefined) {
      formData.append("HourlyRate", String(options.servicePricing.hourlyRate));
    }
    const durations = options.servicePricing.supportedDurations.join(",");
    if (durations) {
      formData.append("SupportedDurations", durations);
    }
  }

  // Profile photo (IFormFile)
  if (options.profilePhotoFile) {
    formData.append("ProfilePhotoURL", options.profilePhotoFile);
  }

  // Expertise items (Flattened - Comma separated string or multiple appends based on BE framework, usually comma separated works for simple lists in C#)
  const items = options.items ?? [];
  const expertiseList = items.map(i => i.category).filter(Boolean);
  if (expertiseList.length > 0) {
    formData.append("Expertise", expertiseList.join(","));
  }

  // AdvisorIndustryFocus (from main)
  const focuses = options.advisorIndustryFocus ?? [];
  focuses.forEach((item, index) => {
    formData.append(`AdvisorIndustryFocus[${index}].IndustryId`, String(item.industryId));
  });

  return formData;
};

// CreateAdvisorRequest (multipart/form-data)
export const CreateAdvisorProfile = (
  data: string | FormData,
  options: AdvisorProfileOptionalFields = {},
) => {
  const formData = data instanceof FormData ? data : buildAdvisorFormData(data, options);

  return axios.post(`/api/advisors`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const GetAdvisorProfile = () => {
  return axios.get<IBackendRes<IAdvisorProfile>>(`/api/advisors/me?_t=${Date.now()}`);
};

// Update profile – backend can use similar body as create
export const UpdateAdvisorProfile = (
  data: string | FormData,
  options: AdvisorProfileOptionalFields = {},
) => {
  const formData = data instanceof FormData ? data : buildAdvisorFormData(data, options);

  return axios.put(`/api/advisors/me`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const GetAdvisorKYCStatus = () => {
  return axios.get<IBackendRes<any>>("/api/advisors/me/kyc/status");
};

export const SubmitAdvisorKYC = (data: any) => {
  return axios.post("/api/advisors/me/kyc/submit", data);
};

export const SaveAdvisorKYCDraft = (data: any) => {
  return axios.patch("/api/advisors/me/kyc/draft", data);
};

export interface IUpdateAvailabilityPayload {
  sessionFormats?: string;
  typicalSessionDuration?: number;
  weeklyAvailableHours?: number;
  maxConcurrentMentees?: number;
  responseTimeCommitment?: string;
  isAcceptingNewMentees?: boolean;
}

export const UpdateAdvisorAvailability = (payload: IUpdateAvailabilityPayload) => {
  return axios.put(`/api/advisors/me/availability`, payload);
};

export interface ITimeSlot {
  timeSlotID: number;
  dayOfWeek: number; // 0=Mon … 6=Sun
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface ITimeSlotInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export const GetAdvisorTimeSlots = () => {
  return axios.get<IBackendRes<ITimeSlot[]>>(`/api/advisors/me/timeslots`);
};

export const UpsertAdvisorTimeSlots = (slots: ITimeSlotInput[]) => {
  return axios.put<IBackendRes<ITimeSlot[]>>(`/api/advisors/me/timeslots`, { slots });
};

export const SearchAdvisors = (query: string) => {
  return axios.get(`/api/advisors/${query}`);
};

export const GetStartupById = (id: number) => {
  return axios.get(`/api/advisors/startups/${id}`);
};

export const GetAdvisorMentorships = (params?: any) => {
  return axios.get<IBackendRes<IPagingData<IMentorshipRequest>>>("/api/mentorships", { params });
};

export const GetAdvisorMentorshipById = (id: string) => {
  return axios.get<IBackendRes<IMentorshipRequest>>(`/api/mentorships/${id}`);
};

export const CompleteMentorship = (id: string | number) => {
  return axios.put<IBackendRes<IMentorshipRequest>>(`/api/mentorships/${id}/complete`);
};

export const AcceptMentorshipRequest = (id: string) => {
  return axios.post<IBackendRes<any>>(`/api/mentorships/${id}/accept`);
};

export const RejectMentorshipRequest = (id: string, reason: string) => {
  return axios.post<IBackendRes<any>>(`/api/mentorships/${id}/reject`, { reason });
};

export const ScheduleMentorshipRequest = (id: string, payload: { startAt: string; endAt: string; meetingLink?: string; timezone?: string }) => {
  const startDate = new Date(payload.startAt);
  const endDate = new Date(payload.endAt);
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000) || 60;
  
  return axios.post<IBackendRes<any>>(`/api/mentorships/${id}/sessions`, {
    scheduledStartAt: payload.startAt,
    durationMinutes,
    sessionFormat: payload.meetingLink && payload.meetingLink.includes("teams") ? "MicrosoftTeams" : "GoogleMeet",
    meetingUrl: payload.meetingLink || ""
  });
};

export const CancelMentorshipRequest = (id: string, reason: string) => {
  return axios.put<IBackendRes<any>>(`/api/mentorships/${id}/cancel`, { reason });
};

// Đề xuất thời gian — tạo session qua endpoint thực tế của backend
export const ProposeMentorshipSlots = (id: string, payload: { requestedSlots: { startAt: string; endAt: string; timezone: string; note?: string; durationMinutes?: number }[] }) => {
  const slot = payload.requestedSlots[0];
  if (!slot) return Promise.reject(new Error("No slots provided"));

  // Ưu tiên durationMinutes truyền vào, fallback tính từ thời gian, fallback 60
  let durationMinutes = slot.durationMinutes;
  if (!durationMinutes || durationMinutes < 15) {
    const startMs = new Date(slot.startAt).getTime();
    const endMs = new Date(slot.endAt).getTime();
    const calc = Math.round((endMs - startMs) / 60000);
    durationMinutes = (Number.isFinite(calc) && calc >= 15) ? calc : 60;
  }

  return axios.post<IBackendRes<any>>(`/api/mentorships/${id}/sessions`, {
    scheduledStartAt: slot.startAt,
    durationMinutes,
    sessionFormat: "GoogleMeet",
    meetingUrl: "",
    note: slot.note || undefined,
  });
};

// Lấy báo cáo tư vấn (nếu có)
export const GetMentorshipReport = (id: string) => {
  return axios.get<IBackendRes<any>>(`/api/mentorships/${id}/reports`);
};

export const CreateMentorshipReport = (id: string, payload: {
  sessionId: number;
  reportSummary: string;
  detailedFindings?: string;
  recommendations?: string;
  attachmentFile?: File | null;
  isDraft?: boolean;
}) => {
  const formData = new FormData();
  formData.append("sessionId", String(payload.sessionId));
  formData.append("reportSummary", payload.reportSummary);
  if (payload.detailedFindings) formData.append("detailedFindings", payload.detailedFindings);
  if (payload.recommendations) formData.append("recommendations", payload.recommendations);
  if (payload.attachmentFile) formData.append("attachmentFile", payload.attachmentFile);
  if (payload.isDraft !== undefined) formData.append("isDraft", String(payload.isDraft));
  return axios.post<IBackendRes<any>>(`/api/mentorships/${id}/reports`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const UpdateMentorshipReport = (
  mentorshipId: string,
  reportId: string | number,
  payload: {
    reportSummary?: string;
    detailedFindings?: string;
    recommendations?: string;
    attachmentFile?: File | null;
    isDraft?: boolean;
  }
) => {
  const formData = new FormData();
  if (payload.reportSummary !== undefined) formData.append("reportSummary", payload.reportSummary);
  if (payload.detailedFindings !== undefined) formData.append("detailedFindings", payload.detailedFindings);
  if (payload.recommendations !== undefined) formData.append("recommendations", payload.recommendations);
  if (payload.attachmentFile) formData.append("attachmentFile", payload.attachmentFile);
  if (payload.isDraft !== undefined) formData.append("isDraft", String(payload.isDraft));
  return axios.patch<IBackendRes<any>>(
    `/api/mentorships/${mentorshipId}/reports/${reportId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

// Lấy danh sách buổi tư vấn (advisor gọi)
export const GetAdvisorSessions = (params?: { status?: string; page?: number; pageSize?: number }) => {
  return axios.get<IBackendRes<IPagingData<any>>>("/api/mentorships/sessions", { params });
};

// Chấp nhận slot startup đề xuất (ProposedByStartup → Scheduled)
export const AcceptMentorshipSession = (mentorshipId: string | number, sessionId: number) => {
  return axios.post<IBackendRes<null>>(
    `/api/mentorships/${mentorshipId}/sessions/${sessionId}/accept`
  );
};;

