import axios from "../interceptor";

export interface IPendingStartupDto {
    startupID: number;
    companyName: string;
    industryName: string;
    stage: string;
    logoURL: string | null;
    profileStatus: string;
    updatedAt: string;
}

export interface IPendingAdvisorDto {
    advisorID: number;
    fullName: string;
    title: string;
    profilePhotoURL: string | null;
    profileStatus: string;
    updatedAt: string;
    industryFocus: any[];
}

export interface IPendingInvestorDto {
    investorID: number;
    fullName: string;
    firmName: string;
    title: string;
    location: string;
    profileStatus: string;
    updatedAt: string;
}

export interface IPendingResponse<T> {
    items: T[];
    paging: {
        page: number;
        pageSize: number;
        totalItems: number;
    }
}

// GET LISTS
export const GetPendingStartups = (page: number = 1, pageSize: number = 10) => {
    return axios.get<IBackendRes<IPendingResponse<IPendingStartupDto>>>(
        `/api/registration/pending/startups?page=${page}&pageSize=${pageSize}`
    );
};

export const GetPendingAdvisors = (page: number = 1, pageSize: number = 10) => {
    return axios.get<IBackendRes<IPendingResponse<IPendingAdvisorDto>>>(
        `/api/registration/pending/advisors?page=${page}&pageSize=${pageSize}`
    );
};

export const GetPendingInvestors = (page: number = 1, pageSize: number = 10) => {
    return axios.get<IBackendRes<IPendingResponse<IPendingInvestorDto>>>(
        `/api/registration/pending/investors?page=${page}&pageSize=${pageSize}`
    );
};

// GET BY ID
export const GetPendingStartupById = (id: number | string) => {
    return axios.get<IBackendRes<any>>(`/api/registration/pending/startups/${id}`);
};

export const GetPendingAdvisorById = (id: number | string) => {
    return axios.get<IBackendRes<any>>(`/api/registration/pending/advisors/${id}`);
};

export const GetPendingInvestorById = (id: number | string) => {
    return axios.get<IBackendRes<any>>(`/api/registration/pending/investors/${id}`);
};

// APPROVE
export const ApproveStartupRegistration = (staffId: number | string, startupId: number | string, score: number = 10) => {
    return axios.post<IBackendRes<any>>(`/api/registration/approve/startups/${staffId}`, {
        startupId,
        score
    });
};

export const ApproveAdvisorRegistration = (staffId: number | string, advisorId: number | string, score: number = 10) => {
    return axios.post<IBackendRes<any>>(`/api/registration/approve/advisors/${staffId}`, {
        advisorId,
        score
    });
};

export const ApproveInvestorRegistration = (staffId: number | string, investorId: number | string, score: number = 10, isInstitutional: boolean = false) => {
    return axios.post<IBackendRes<any>>(`/api/registration/approve/investors/${staffId}`, {
        investorId,
        score,
        isInstitutional
    });
};

// REJECT
export const RejectStartupRegistration = (staffId: number | string, id: number | string, reason: string) => {
    return axios.post<IBackendRes<any>>(`/api/registration/reject/startups/${staffId}`, {
        id,
        reason
    });
};

export const RejectAdvisorRegistration = (staffId: number | string, id: number | string, reason: string) => {
    return axios.post<IBackendRes<any>>(`/api/registration/reject/advisors/${staffId}`, {
        id,
        reason
    });
};

export const RejectInvestorRegistration = (staffId: number | string, id: number | string, reason: string) => {
    return axios.post<IBackendRes<any>>(`/api/registration/reject/investors/${staffId}`, {
        id,
        reason
    });
};