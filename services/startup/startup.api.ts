import axios from "../interceptor";

export enum StartupStage {
    Idea = 0,
    PreSeed = 1,
    Seed = 2,
    SeriesA = 3,
    SeriesB = 4,
    SeriesC = 5,
    Growth = 6
}

export interface ICreateStartupRequest {
    companyName: string
    oneLiner: string
    description?: string
    industryID?: number
    stage: StartupStage
    foundedDate?: string | Date
    website?: string
    logoUrl?: File
    // Financial
    fundingAmountSought?: number
    currentFundingRaised?: number
    valuation?: number
    businessCode?: string
    fullNameOfApplicant?: string
    roleOfApplicant?: string
    contactEmail?: string
    contactPhone?: string
    // Business
    marketScope?: string
    problemStatement?: string
    solutionSummary?: string
    // Contact & Extra
    linkedInURL?: string
    subIndustry?: string
    currentNeeds?: string[]
    metricSummary?: string
    teamSize?: string
    pitchDeckUrl?: string
    productStatus?: string
    country?: string
    location?: string
    FileCertificateBusiness?: File
}

export interface IUpdateStartupRequest {
    companyName: string
    oneLiner: string
    description?: string
    industryID?: number
    stage: StartupStage
    foundedDate?: string | Date
    website?: string
    /** File mới hoặc `null` khi xóa logo (multipart append `"null"`). */
    logoUrl?: File | null
    // Financial
    fundingAmountSought?: number
    currentFundingRaised?: number
    valuation?: number
    businessCode?: string
    fullNameOfApplicant?: string
    roleOfApplicant?: string
    contactEmail?: string
    contactPhone?: string
    // Business
    marketScope?: string
    problemStatement?: string
    solutionSummary?: string
    // Contact & Extra
    linkedInURL?: string
    subIndustry?: string
    currentNeeds?: string[]
    metricSummary?: string
    teamSize?: string
    pitchDeckUrl?: string
    productStatus?: string
    country?: string
    location?: string
    /** Chỉ gửi khi đổi file; không bắt buộc mỗi lần cập nhật. */
    FileCertificateBusiness?: File
}

export interface IAddMemberRequest {
    fullName: string
    role: string
    title: string
    linkedInURL: string
    bio: string
    photoURL: File
    isFounder: boolean
    yearsOfExperience: number
}

export interface IUpdateMemberRequest {
    fullName?: string
    role?: string
    title?: string
    linkedInURL?: string
    bio?: string
    photoURL?: File
    isFounder?: boolean
    yearsOfExperience?: number
}

function appendFormValue(formData: FormData, key: string, value: unknown) {
    if (value instanceof Date) {
        formData.append(key, value.toISOString());
    } else if (value instanceof File) {
        formData.append(key, value);
    } else if (Array.isArray(value)) {
        value.forEach(v => formData.append(key, v.toString()));
    } else {
        formData.append(key, String(value));
    }
}

function getStartupFormKey(key: string) {
    // Backend save contract expects TeamSize in PascalCase for multipart form-data.
    return key === "teamSize" ? "TeamSize" : key;
}

export const CreateStartupProfile = (data: ICreateStartupRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            appendFormValue(formData, getStartupFormKey(key), value);
        }
    });

    return axios.post<IBackendRes<string>>(`/api/startups`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const UpdateStartupProfile = (data: IUpdateStartupRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value === null && key === "logoUrl") {
            formData.append("logoUrl", "null");
            return;
        }
        if (key === "businessCode") {
            if (value !== undefined && value !== null && String(value).trim() !== "") {
                const s = String(value).trim();
                formData.append("businessCode", s);
            }
            return;
        }
        if (value !== undefined && value !== null) {
            appendFormValue(formData, getStartupFormKey(key), value);
        }
    });

    return axios.put<IBackendRes<string>>(`/api/startups/me`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export const GetStartupProfile = () => {
    return axios.get<IBackendRes<IStartupProfile>>(`/api/startups/me`)
}

export const EnableVisibility = () => {
    return axios.put<IBackendRes<null>>(`/api/startups/me/visibility`, { isVisible: true });
};

export const DisableVisibility = () => {
    return axios.put<IBackendRes<null>>(`/api/startups/me/visibility`, { isVisible: false });
};

export const AddMember = (data: IAddMemberRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        }
    });
    return axios.post<IBackendRes<null>>(`/api/startups/me/team-members`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export const UpdateMember = (teamMemberId: number, data: IUpdateMemberRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        }
    });
    return axios.put<IBackendRes<null>>(`/api/startups/me/team-members/${teamMemberId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export const DeleteMember = (memberId: number) => {
    return axios.delete<IBackendRes<null>>(`/api/startups/me/team-members/${memberId}`)
}

export const GetMembers = () => {
    return axios.get<IBackendRes<ITeamMember[]>>(`/api/startups/me/team-members`);
}

export const SubmitForApproval = () => {
    return axios.post<IBackendRes<null>>(`/api/startups/me/submit-for-approval`)
}

export const SearchInvestors = (params: { page?: number; pageSize?: number; keyword?: string }) => {
    return axios.get<IBackendRes<any>>(`/api/investors`, { params });
}

export const GetInvestorById = (id: number) => {
    return axios.get<IBackendRes<IInvestorProfile>>(`/api/investors/${id}`);
}

