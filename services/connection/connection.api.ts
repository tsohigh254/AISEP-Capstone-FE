import axios from "../interceptor";

const isSuccessResponse = <T,>(res?: IBackendRes<T> | null): res is IBackendRes<T> => {
  return Boolean(res && (res.success || res.isSuccess));
};

const getItems = <T,>(res?: IBackendRes<IPaginatedRes<T>> | null): T[] => {
  if (!isSuccessResponse(res) || !res.data) return [];
  const data = res.data as IPaginatedRes<T> & { data?: T[] };
  return data.items ?? data.data ?? [];
};

const pickLatestConnection = (items: IConnectionItem[]): IConnectionItem | null => {
  if (!items.length) return null;
  return [...items].sort((a, b) => {
    const aTime = new Date(a.respondedAt || a.requestedAt || 0).getTime();
    const bTime = new Date(b.respondedAt || b.requestedAt || 0).getTime();
    return bTime - aTime;
  })[0] ?? null;
};

// Connection CRUD
export const CreateConnection = (data: ICreateConnection) => {
  return axios.post<IBackendRes<IConnectionItem>>(`/api/connections`, data);
};

// Startup -> Investor (StartupOnly)
export const InviteInvestorConnection = (data: ICreateStartupInvestorInvite) => {
  return axios.post<IBackendRes<IConnectionItem>>(`/api/connections/invite`, data);
};

export const GetSentConnections = (
  page: number = 1,
  pageSize: number = 20,
  status?: string,
  counterpartId?: number,
) => {
  return axios.get<IBackendRes<IPaginatedRes<IConnectionItem>>>(`/api/connections/sent`, {
    params: {
      page,
      pageSize,
      ...(status ? { status } : {}),
      ...(counterpartId ? { counterpartId } : {}),
    },
  });
};

export const GetReceivedConnections = (
  page: number = 1,
  pageSize: number = 20,
  status?: string,
  counterpartId?: number,
) => {
  return axios.get<IBackendRes<IPaginatedRes<IConnectionItem>>>(`/api/connections/received`, {
    params: {
      page,
      pageSize,
      ...(status ? { status } : {}),
      ...(counterpartId ? { counterpartId } : {}),
    },
  });
};

export const GetConnectionById = (id: number) => {
  return axios.get<IBackendRes<IConnectionDetail>>(`/api/connections/${id}`);
};

export const UpdateConnection = (id: number, data: { message: string }) => {
  return axios.put<IBackendRes<IConnectionItem>>(`/api/connections/${id}`, data);
};

// Connection Actions
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

const isRequestedStatus = (status?: string) => {
  const normalized = (status ?? "").toLowerCase();
  return normalized === "requested" || normalized === "pending";
};

// Startup: check latest connection with one investor (both directions)
export const GetConnectionByInvestorId = async (investorId: number): Promise<IConnectionItem | null> => {
  try {
    const [sentRes, receivedRes] = await Promise.all([
      GetSentConnections(1, 20, undefined, investorId) as any as IBackendRes<IPaginatedRes<IConnectionItem>>,
      GetReceivedConnections(1, 20, undefined, investorId) as any as IBackendRes<IPaginatedRes<IConnectionItem>>,
    ]);
    const items = [...getItems(sentRes), ...getItems(receivedRes)].filter(
      (item) => item.investorID === investorId,
    );
    return pickLatestConnection(items);
  } catch {
    return null;
  }
};

// Startup: pending invites received from investor to this startup
export const GetPendingConnectionInviteByInvestorId = async (investorId: number): Promise<IConnectionItem | null> => {
  try {
    const res = await (
      GetReceivedConnections(1, 20, "Requested", investorId) as any as IBackendRes<IPaginatedRes<IConnectionItem>>
    );
    const pendingIncoming = getItems(res).filter((item) => {
      if (item.investorID !== investorId) return false;
      if (!isRequestedStatus(item.connectionStatus)) return false;
      return item.initiatedByRole ? item.initiatedByRole === "INVESTOR" : true;
    });
    return pickLatestConnection(pendingIncoming);
  } catch {
    return null;
  }
};

// Information Requests
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
