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
  if (options.website) formData.append("Website", options.website);
  if (options.linkedInURL) formData.append("LinkedInURL", options.linkedInURL);
  if (options.googleMeetLink) formData.append("GoogleMeetLink", options.googleMeetLink);
  if (options.msTeamsLink) formData.append("MsTeamsLink", options.msTeamsLink);
  if (options.mentorshipPhilosophy)
    formData.append("MentorshipPhilosophy", options.mentorshipPhilosophy);

  // Service Pricing
  if (options.servicePricing) {
    formData.append("ServicePricing.IsBookable", String(options.servicePricing.isBookable));
    if (options.servicePricing.hourlyRate !== null) {
      formData.append("ServicePricing.HourlyRate", String(options.servicePricing.hourlyRate));
    }
    formData.append("ServicePricing.Currency", options.servicePricing.currency || "USD");
    options.servicePricing.supportedDurations.forEach((d, i) => {
      formData.append(`ServicePricing.SupportedDurations[${i}]`, String(d));
    });
  }

  // Profile photo (IFormFile)
  if (options.profilePhotoFile) {
    formData.append("ProfilePhotoURL", options.profilePhotoFile);
  }

  // Expertise items
  const items = options.items ?? [];
  items.forEach((item, index) => {
    formData.append(`Items[${index}].Category`, item.category);
    if (item.subTopic) {
      formData.append(`Items[${index}].SubTopic`, item.subTopic);
    }
    if (item.proficiencyLevel) {
      formData.append(`Items[${index}].ProficiencyLevel`, item.proficiencyLevel);
    }
    if (typeof item.yearsOfExperience === "number") {
      formData.append(
        `Items[${index}].YearsOfExperience`,
        String(item.yearsOfExperience),
      );
    }
  });

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
  return axios.get<IBackendRes<IAdvisorProfile>>(`/api/advisors/me`);
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

export const SearchAdvisors = (query: string) => {
  return axios.get(`/api/advisors/${query}`);
};

export const GetStartupById = (id: number) => {
  return axios.get(`/api/advisors/startups/${id}`);
};
