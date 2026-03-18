import axios from "../interceptor";

export const GetMe = () => {
    return axios.get<IBackendRes<IAdminUser>>(`/api/users/me`);
}
