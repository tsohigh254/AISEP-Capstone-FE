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
    fundingAmountSought?: number
    currentFundingRaised?: number
    valuation?: number
}

export interface IUpdateStartupRequest {
    companyName?: string
    oneLiner: string
    description?: string
    industryID?: number
    stage: StartupStage
    foundedDate?: string | Date
    website?: string
    logoUrl?: File | null
    fundingAmountSought?: number
    currentFundingRaised?: number
    valuation?: number
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

export const CreateStartupProfile = (data: ICreateStartupRequest) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof Date) {
                formData.append(key, value.toISOString());
            } else if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
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
            formData.append(key, "null");
            return;
        }
        if (value !== undefined && value !== null) {
            if (value instanceof Date) {
                formData.append(key, value.toISOString());
            } else if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
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

export const GetAdvisors = (query: string) => {
    return axios.get<IBackendRes<IPagingData<IAvisorPaging>>>(`/api/startups?${query}`)
}
