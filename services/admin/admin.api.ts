import axios from "../interceptor";

export const GetUsers = (params: {
    page?: number;
    pageSize?: number;
    userType?: string;
    isActive?: boolean;
}) => {
    return axios.get<IBackendRes<IUser[]>>(`/api/users`, { params });
};

export const GetUserById = (id: number) => {
    return axios.get<IBackendRes<IUser>>(`/api/users/${id}`);
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

export const GetAuditLogs = (params: {
    key?: string;
    actionType?: string;
    entityType?: string;
    page?: number;
    pageSize?: number;
}) => {
    return axios.get<IBackendRes<IPagingData<IAuditLog>>>(`/api/admin/audit-logs`, { params });
};

