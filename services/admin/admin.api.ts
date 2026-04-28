import axios from "../interceptor";

/* ═══════════════════════════════════════════════════════════
   TypeScript interfaces matching backend DTOs
   ═══════════════════════════════════════════════════════════ */

export interface RolePermissionRes {
    permissionId: number;
    permissionName: string;
    description: string | null;
    category: string | null;
}

export interface RoleRes {
    roleId: number;
    roleName: string;
    description: string | null;
    createdAt: string;
    updatedAt: string | null;
    permissions: RolePermissionRes[] | null;
}

export interface PermissionRes {
    permissionId: number;
    permissionName: string;
    description: string | null;
    category: string | null;
}

export interface IncidentRes {
    incidentId: number;
    title: string;
    description: string;
    severity: string;
    status: string;
    createdBy: number;
    createdAt: string;
    resolvedAt: string | null;
    resolvedBy: number | null;
    rollbackNotes: string | null;
    isRolledBack: boolean;
}

export interface SystemHealthRes {
    databaseConnected: boolean;
    totalUsers: number;
    totalStartups: number;
    totalInvestors: number;
    totalAdvisors: number;
    pendingApprovals: number;
    openIncidents: number;
    unresolvedFlags: number;
    checkedAt: string;
}

/* ═══════════════════════════════════════════════════════════
   Users  (api/users)
   ═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
   Roles  (api/roles)
   ═══════════════════════════════════════════════════════════ */

export const GetRoles = () => {
    return axios.get<IBackendRes<RoleRes[]>>(`/api/roles`);
};

export const GetRoleById = (id: number) => {
    return axios.get<IBackendRes<RoleRes>>(`/api/roles/${id}`);
};

export const CreateRole = (data: { roleName: string; description?: string }) => {
    return axios.post<IBackendRes<RoleRes>>(`/api/roles`, data);
};

export const UpdateRole = (id: number, data: { roleName?: string; description?: string }) => {
    return axios.put<IBackendRes<RoleRes>>(`/api/roles/${id}`, data);
};

export const DeleteRole = (id: number) => {
    return axios.delete<IBackendRes<string>>(`/api/roles/${id}`);
};

export const AssignPermissionToRole = (roleId: number, permissionId: number) => {
    return axios.post<IBackendRes<string>>(`/api/roles/${roleId}/permissions`, { permissionId });
};

export const RemovePermissionFromRole = (roleId: number, permissionId: number) => {
    return axios.delete<IBackendRes<string>>(`/api/roles/${roleId}/permissions/${permissionId}`);
};

export const GetRoleUsers = (roleId: number) => {
    return axios.get<IBackendRes<IUser[]>>(`/api/roles/${roleId}/users`);
};

/* ═══════════════════════════════════════════════════════════
   Permissions  (api/permissions)
   ═══════════════════════════════════════════════════════════ */

export const GetPermissions = (category?: string) => {
    return axios.get<IBackendRes<PermissionRes[]>>(`/api/permissions`, {
        params: category ? { category } : undefined,
    });
};

export const GetPermissionCategories = () => {
    return axios.get<IBackendRes<string[]>>(`/api/permissions/categories`);
};

/* ═══════════════════════════════════════════════════════════
   User roles  (api/users/:id/roles)
   ═══════════════════════════════════════════════════════════ */

export const RemoveUserRole = (userId: number, roleId: number) => {
    return axios.delete<IBackendRes<string>>(`/api/users/${userId}/roles/${roleId}`);
};

/* ═══════════════════════════════════════════════════════════
   Incidents  (api/admin/incidents)
   ═══════════════════════════════════════════════════════════ */

export const GetIncidents = () => {
    return axios.get<IBackendRes<IncidentRes[]>>(`/api/admin/incidents`);
};

export const CreateIncident = (data: { title: string; description: string; severity: number }) => {
    return axios.post<IBackendRes<IncidentRes>>(`/api/admin/incidents`, data);
};

export const RollbackIncident = (id: number, data: { rollbackNotes: string }) => {
    return axios.post<IBackendRes<string>>(`/api/admin/incidents/${id}/rollback`, data);
};

/* ═══════════════════════════════════════════════════════════
   Audit Logs  (api/admin/audit-logs)
   ═══════════════════════════════════════════════════════════ */

export const GetAuditLogs = (params: {
    key?: string;
    actionType?: string;
    entityType?: string;
    userId?: number;
    page?: number;
    pageSize?: number;
}) => {
    return axios.get<IBackendRes<IPagingData<IAuditLog>>>(`/api/admin/audit-logs`, { params });
};

/* ═══════════════════════════════════════════════════════════
   System Health  (api/admin/system-health)
   ═══════════════════════════════════════════════════════════ */

export const GetSystemHealth = () => {
    return axios.get<IBackendRes<SystemHealthRes>>(`/api/admin/system-health`);
};

/* ═══════════════════════════════════════════════════════════
   Server Logs  (api/admin/logs)
   ═══════════════════════════════════════════════════════════ */

export interface LogFileRes {
    fileName: string;
    sizeBytes: number;
    lastModifiedUtc: string;
}

export interface LogContentRes {
    fileName: string;
    sizeBytes: number;
    lastModifiedUtc: string;
    totalLinesReturned: number;
    lines: string[];
}

export const ListLogFiles = () => {
    return axios.get<IBackendRes<LogFileRes[]>>(`/api/admin/logs`);
};

export const ReadLogFile = (fileName: string, tail: number = 500) => {
    return axios.get<IBackendRes<LogContentRes>>(`/api/admin/logs/${encodeURIComponent(fileName)}`, {
        params: { tail },
    });
};

/* ═══════════════════════════════════════════════════════════
   AI Service Logs  (api/admin/ai-logs)
   ═══════════════════════════════════════════════════════════ */

export interface AiLogEntryRes {
    timestamp: string;
    level: string;
    logger: string;
    message: string;
    correlationId: string | null;
    source: string;     // "api" | "worker"
    raw: string | null;
}

export interface AiLogFileInfoRes {
    fileName: string;
    exists: boolean;
    sizeBytes: number;
    lastModifiedUtc: string | null;
}

export interface AiLogsRes {
    entries: AiLogEntryRes[];
    totalReturned: number;
    sources: AiLogFileInfoRes[];
}

export const GetAiLogs = (params: {
    tail?: number;
    level?: string;
    search?: string;
    correlationId?: string;
}) => {
    return axios.get<IBackendRes<AiLogsRes>>(`/api/admin/ai-logs`, { params });
};

/* ═══════════════════════════════════════════════════════════
   Auth — Admin Password Reset  (api/auth/admin/reset-password)
   ═══════════════════════════════════════════════════════════ */

export const ResetAdminPassword = (userId: number, newPassword: string) => {
    return axios.put<IBackendRes<string>>(`/api/auth/admin/reset-password`, { userId, newPassword });
};
