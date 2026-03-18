import axios from "../interceptor";

export const GetAdvisorProfile = () => {
    return axios.get<IBackendRes<IAdvisorProfile>>(`/api/advisors/me`);
}

export const CreateAdvisorProfile = (data: FormData) => {
    return axios.post<IBackendRes<IAdvisorProfile>>(`/api/advisors`, data);
}
