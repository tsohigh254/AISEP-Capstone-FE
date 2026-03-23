import axios from "../interceptor";

interface AdvisorProfilePayload {
  fullName: string;
  title?: string | null;
  bio?: string | null;
  profilePhotoFile?: File | null;
  linkedInURL?: string | null;
  mentorshipPhilosophy?: string | null;
  advisorIndustryFocus?: { industryId: number }[];
}

const buildAdvisorFormData = (payload: AdvisorProfilePayload): FormData => {
  const formData = new FormData();

  // Required
  formData.append("FullName", payload.fullName);

  // Optional simple fields
  if (payload.title) formData.append("Title", payload.title);
  if (payload.bio) formData.append("Bio", payload.bio);
  if (payload.linkedInURL) formData.append("LinkedInURL", payload.linkedInURL);
  if (payload.mentorshipPhilosophy)
    formData.append("MentorshipPhilosophy", payload.mentorshipPhilosophy);

  // Profile photo (IFormFile)
  if (payload.profilePhotoFile) {
    formData.append("ProfilePhotoURL", payload.profilePhotoFile);
  }

  // AdvisorIndustryFocus
  const focuses = payload.advisorIndustryFocus ?? [];
  focuses.forEach((item, index) => {
    formData.append(`AdvisorIndustryFocus[${index}].IndustryId`, String(item.industryId));
  });

  return formData;
};

// Create advisor profile (multipart/form-data)
export const CreateAdvisorProfile = (payload: AdvisorProfilePayload) => {
  const formData = buildAdvisorFormData(payload);

  return axios.post(`/api/advisors`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const GetAdvisorProfile = () => {
  return axios.get<IBackendRes<IAdvisorProfile>>(`/api/advisors/me`);
};

// Update profile
export const UpdateAdvisorProfile = (payload: AdvisorProfilePayload) => {
  const formData = buildAdvisorFormData(payload);

  return axios.put(`/api/advisors/me`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const SearchAdvisors = (query: string) => {
  return axios.get(`/api/advisors/${query}`);
};
