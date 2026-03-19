import axios from "../interceptor";

// DTO matching backend ExpertiseItemDto
export interface ExpertiseItemDto {
  category: string;
  subTopic?: string | null;
  proficiencyLevel?: string | null;
  yearsOfExperience?: number | null;
}

interface AdvisorProfileOptionalFields {
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  profilePhotoFile?: File | null;
  website?: string | null;
  linkedInURL?: string | null;
  mentorshipPhilosophy?: string | null;
  items?: ExpertiseItemDto[];
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
  if (options.mentorshipPhilosophy)
    formData.append("MentorshipPhilosophy", options.mentorshipPhilosophy);

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

  return formData;
};

// CreateAdvisorRequest (multipart/form-data)
export const CreateAdvisorProfile = (
  fullName: string,
  options: AdvisorProfileOptionalFields = {},
) => {
  const formData = buildAdvisorFormData(fullName, options);

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
  fullName: string,
  options: AdvisorProfileOptionalFields = {},
) => {
  const formData = buildAdvisorFormData(fullName, options);

  return axios.put(`/api/advisors/me`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const SearchAdvisors = (query: string) => {
  return axios.get(`/api/advisors/${query}`);
};