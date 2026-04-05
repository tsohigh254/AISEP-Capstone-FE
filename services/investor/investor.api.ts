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

export const SearchStartups = (page: number = 1, pageSize: number = 20) => {
    return axios.get<IBackendRes<IPaginatedRes<any>>>(`/api/investors/search`, {
        params: { page, pageSize, _t: new Date().getTime() }
    });
}

export const GetRecommendations = () => {
    return axios.get<IBackendRes<IStartupSearchItem[]>>(`/api/investors/recommendations`);
}

export const GetStartupById = (id: number) => {
    return axios.get<IBackendRes<IStartupSearchItem>>(`/api/investors/startups/${id}`);
}

export const RemoveFromWatchlist = (watchlistId: number) => {
    return axios.delete<IBackendRes<null>>(`/api/investors/me/watchlist/${watchlistId}`);
}

export const GetKYCStatus = () => {
    // This is a mock implementation for the design phase
    return axios.get<IBackendRes<IKYCStatus>>(`/api/investors/me/kyc/status`);
}
