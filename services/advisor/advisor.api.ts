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

export const UpdateAdvisorAvailability = (isAcceptingNewMentees: boolean) => {
  return axios.put(`/api/advisors/me/availability`, {
    isAcceptingNewMentees
  });
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

export const AcceptMentorshipRequest = (id: string) => {
  return axios.put<IBackendRes<any>>(`/api/mentorships/${id}/accept`);
};

export const RejectMentorshipRequest = (id: string, reason: string) => {
  return axios.put<IBackendRes<any>>(`/api/mentorships/${id}/reject`, { reason });
};

export const ScheduleMentorshipRequest = (id: string, payload: { startAt: string; endAt: string; meetingLink?: string; timezone?: string }) => {
  return axios.put<IBackendRes<any>>(`/api/mentorships/${id}/schedule`, payload);
};

export const CancelMentorshipRequest = (id: string, reason: string) => {
  return axios.put<IBackendRes<any>>(`/api/mentorships/${id}/cancel`, { reason });
};

// Đề xuất thời gian khác
export const ProposeMentorshipSlots = (id: string, payload: { requestedSlots: { startAt: string; endAt: string; timezone: string; note?: string }[] }) => {
  return axios.put<IBackendRes<any>>(`/api/mentorships/${id}/propose-slots`, payload);
};

// Lấy báo cáo tư vấn (nếu có)
export const GetMentorshipReport = (id: string) => {
  return axios.get<IBackendRes<any>>(`/api/mentorships/${id}/report`);
};

// Lấy danh sách buổi tư vấn (advisor gọi)
export const GetAdvisorSessions = (params?: { status?: string; page?: number; pageSize?: number }) => {
  return axios.get<IBackendRes<IPagingData<any>>>("/api/mentorships/sessions", { params });
};

