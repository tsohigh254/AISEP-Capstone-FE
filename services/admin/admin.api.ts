import axios from "../interceptor";

export const GetUsers = (params: {
    page?: number;
    pageSize?: number;
    userType?: string;
    isActive?: boolean;
}) => {
    return axios.get<IBackendRes<IAdminUser[]>>(`/api/users`, { params });
};

export const GetUserById = (id: number) => {
    return axios.get<IBackendRes<IAdminUser>>(`/api/users/${id}`);
};

export const UpdateUserStatus = (id: number, isActive: boolean) => {
    return axios.patch<IBackendRes<string>>(`/api/users/${id}/status`, { isActive });
};

export const GetRoles = () => {
    return axios.get<IBackendRes<IRole[]>>(`/api/roles`);
};

export const GetPermissions = (category?: string) => {
    return axios.get<IBackendRes<IPermission[]>>(`/api/permissions`, {
        params: category ? { category } : undefined,
    });
};

export const RemoveUserRole = (userId: number, roleId: number) => {
    return axios.delete<IBackendRes<string>>(`/api/users/${userId}/roles/${roleId}`);
};

