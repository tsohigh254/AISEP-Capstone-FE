import axios from "../interceptor";

// ── Connection CRUD ──

export const CreateConnection = (data: ICreateConnection) => {
    return axios.post<IBackendRes<IConnectionItem>>(`/api/connections`, data);
};

export const GetSentConnections = (page: number = 1, pageSize: number = 20, status?: string) => {
    return axios.get<IBackendRes<IPaginatedRes<IConnectionItem>>>(`/api/connections/sent`, {
        params: { page, pageSize, ...(status ? { status } : {}) },
    });
};

export const GetReceivedConnections = (page: number = 1, pageSize: number = 20, status?: string) => {
    return axios.get<IBackendRes<IPaginatedRes<IConnectionItem>>>(`/api/connections/received`, {
        params: { page, pageSize, ...(status ? { status } : {}) },
    });
};

export const GetConnectionById = (id: number) => {
    return axios.get<IBackendRes<IConnectionDetail>>(`/api/connections/${id}`);
};

export const UpdateConnection = (id: number, data: { message: string }) => {
    return axios.put<IBackendRes<IConnectionItem>>(`/api/connections/${id}`, data);
};

// ── Connection Actions ──

export const WithdrawConnection = (id: number) => {
    return axios.post<IBackendRes<IConnectionItem>>(`/api/connections/${id}/withdraw`);
};

export const AcceptConnection = (id: number) => {
    return axios.post<IBackendRes<IConnectionItem>>(`/api/connections/${id}/accept`);
};

export const RejectConnection = (id: number, data: { reason: string }) => {
    return axios.post<IBackendRes<IConnectionItem>>(`/api/connections/${id}/reject`, data);
};

export const CloseConnection = (id: number) => {
    return axios.post<IBackendRes<IConnectionItem>>(`/api/connections/${id}/close`);
};

// ── Information Requests ──

export const CreateInfoRequest = (connectionId: number, data: ICreateInfoRequest) => {
    return axios.post<IBackendRes<IInfoRequest>>(`/api/connections/${connectionId}/info-requests`, data);
};

export const GetInfoRequests = (connectionId: number) => {
    return axios.get<IBackendRes<IInfoRequest[]>>(`/api/connections/${connectionId}/info-requests`);
};

export const FulfillInfoRequest = (requestId: number, data: IFulfillInfoRequest) => {
    return axios.post<IBackendRes<IInfoRequest>>(`/api/info-requests/${requestId}/fulfill`, data);
};

export const RejectInfoRequest = (requestId: number, data: { reason: string }) => {
    return axios.post<IBackendRes<IInfoRequest>>(`/api/info-requests/${requestId}/reject`, data);
};
