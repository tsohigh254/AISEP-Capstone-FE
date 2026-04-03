import axios from "../interceptor";

export const GetMe = () => {
    return axios.get<IBackendRes<IUser>>(`/api/users/me`);
}
