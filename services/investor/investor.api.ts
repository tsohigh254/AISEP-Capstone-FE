import axios from "../interceptor";

export const GetInvestorProfile = () => {
    return axios.get<IBackendRes<IInvestorProfile>>(`/api/investors/me`);
}

export const UpdateInvestorAcceptingConnections = (acceptingConnections: boolean) => {
    return axios.patch<IBackendRes<{ acceptingConnections: boolean }>>(
        `/api/investors/me/accepting-connections`,
        { acceptingConnections },
    );
}

export const CreateInvestorProfile = (data: ICreateInvestor) => {
    return axios.post<IBackendRes<IInvestorProfile>>(`/api/investors`, data);
}

export const GetInvestorWatchlist = (page: number = 1, pageSize: number = 20) => {
    return axios.get<IBackendRes<IPaginatedRes<IWatchlistItem>>>(`/api/investors/me/watchlist`, {
        params: { page, pageSize }
    });
}

export const AddToWatchlist = (data: ICreateWatchlistItem) => {
    return axios.post<IBackendRes<IWatchlistItem>>(`/api/investors/me/watchlist`, data);
}

export const SearchStartups = (
    query?: string,
    page: number = 1,
    pageSize: number = 20,
    industryId?: number,
    stage?: string,
) => {
    const params: Record<string, string | number> = {
        page,
        pageSize,
        _t: new Date().getTime(),
    };
    if (query) params.q = query;
    if (industryId) params.industryId = industryId;
    if (stage) params.stage = stage;
    return axios.get<IBackendRes<IPaginatedRes<IStartupSearchItem>>>(`/api/investors/search`, {
        params
    });
}

export const GetMasterIndustries = () => {
    return axios.get<IBackendRes<{ industryID: number; industryName: string; parentID?: number | null }[]>>(
        `/api/master/industries`,
        { params: { mode: 'flat' } }
    );
}

export const GetMasterStages = () => {
    return axios.get<IBackendRes<string[]>>(`/api/master/stages`);
}

export const GetRecommendations = (topN: number = 10) => {
    return axios.get<IBackendRes<any>>(`/api/ai/recommendations/startups`, { params: { topN } });
}

export const GetStartupById = (id: number) => {
    return axios.get<IBackendRes<IStartupSearchItem>>(`/api/startups/${id}`);
}

export const RemoveFromWatchlist = (startupId: number) => {
    // Backend expects the startupId in the route: DELETE /api/investors/me/watchlist/{startupId}
    return axios.delete<IBackendRes<null>>(`/api/investors/me/watchlist/${startupId}`);
}

export const UpdateInvestorProfile = (data: IUpdateInvestorProfile) => {
    return axios.put<IBackendRes<IInvestorProfile>>(`/api/investors/me`, data);
}

export const GetInvestorPreferences = () => {
    return axios.get<IBackendRes<IInvestorPreferences>>(`/api/investors/me/preferences`);
}

export const UploadInvestorPhoto = (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return axios.post<IBackendRes<IInvestorProfile>>(`/api/investors/me/photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export const UpdateInvestorPreferences = (data: IUpdateInvestorPreferences) => {
    return axios.put<IBackendRes<IInvestorPreferences>>(`/api/investors/me/preferences`, data);
}

export const GetKYCStatus = () => {
    // This is a mock implementation for the design phase
    return axios.get<IBackendRes<IKYCStatus>>(`/api/investors/me/kyc/status`);
}
