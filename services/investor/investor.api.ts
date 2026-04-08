import axios from "../interceptor";

export const GetInvestorProfile = () => {
    return axios.get<IBackendRes<IInvestorProfile>>(`/api/investors/me`);
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

export const SearchStartups = (query?: string, page: number = 1, pageSize: number = 20) => {
    const params: Record<string, string | number> = {
        page,
        pageSize,
        _t: new Date().getTime(),
    };
    if (query) params.q = query;
    return axios.get<IBackendRes<IPaginatedRes<IStartupSearchItem>>>(`/api/investors/search`, {
        params
    });
}

export const GetRecommendations = () => {
    return axios.get<IBackendRes<IStartupSearchItem[]>>(`/api/investors/recommendations`);
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
