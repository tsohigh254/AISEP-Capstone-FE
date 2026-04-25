import axios from "../interceptor";

export interface IIndustryFlat {
    industryId: number;
    /** Backward-compatible alias for older FE code while screens migrate. */
    industryID: number;
    industryName: string;
    description?: string;
    parentIndustryId?: number | null;
    /** Backward-compatible alias for older FE code while screens migrate. */
    parentIndustryID?: number | null;
    isActive?: boolean;
    startupCount?: number;
    investorCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface IIndustryTree extends IIndustryFlat {
    subIndustries: IIndustryTree[];
}

export interface IStaffIndustryItem extends IIndustryFlat {
    subIndustries?: IStaffIndustryItem[];
}

export interface ICreateOrUpdateIndustryRequest {
    industryName: string;
    description?: string;
    parentIndustryId?: number | null;
    isActive?: boolean;
}

export interface IStageMasterItem {
    stageId: number;
    /** Backward-compatible alias for older FE code while screens migrate. */
    stageID: number;
    stageName: string;
    description?: string;
    orderIndex?: number;
    isActive?: boolean;
}

export interface ICreateOrUpdateStageRequest {
    stageName: string;
    description?: string;
    orderIndex?: number;
    isActive?: boolean;
}

const unwrapList = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
};

const normalizeIndustry = (item: any): IIndustryFlat => {
    const industryId = Number(item?.industryId ?? item?.industryID ?? item?.id ?? 0);
    const parentIndustryId = item?.parentIndustryId ?? item?.parentIndustryID ?? item?.parentID ?? null;

    return {
        industryId,
        industryID: industryId,
        industryName: item?.industryName ?? item?.IndustryName ?? item?.name ?? item?.Name ?? "",
        description: item?.description ?? item?.Description,
        parentIndustryId: parentIndustryId == null ? null : Number(parentIndustryId),
        parentIndustryID: parentIndustryId == null ? null : Number(parentIndustryId),
        isActive: item?.isActive ?? item?.IsActive,
        startupCount: Number(item?.startupCount ?? item?.StartupCount ?? 0),
        investorCount: Number(item?.investorCount ?? item?.InvestorCount ?? 0),
        createdAt: item?.createdAt ?? item?.CreatedAt,
        updatedAt: item?.updatedAt ?? item?.UpdatedAt,
    };
};

const normalizeIndustryTree = (item: any): IIndustryTree => ({
    ...normalizeIndustry(item),
    subIndustries: unwrapList(item?.subIndustries ?? item?.SubIndustries).map(normalizeIndustryTree),
});

const normalizeStage = (item: any): IStageMasterItem => {
    const stageId = Number(item?.stageId ?? item?.stageID ?? item?.id ?? 0);
    return {
        stageId,
        stageID: stageId,
        stageName: item?.stageName ?? item?.StageName ?? item?.name ?? item?.Name ?? "",
        description: item?.description ?? item?.Description,
        orderIndex: item?.orderIndex ?? item?.OrderIndex,
        isActive: item?.isActive ?? item?.IsActive,
    };
};

const flattenIndustryTree = (items: IIndustryTree[]): IIndustryFlat[] => {
    const result: IIndustryFlat[] = [];
    const visit = (item: IIndustryTree) => {
        result.push(item);
        item.subIndustries.forEach(visit);
    };
    items.forEach(visit);
    return result;
}

export const GetIndustriesFlat = async (): Promise<IIndustryFlat[]> => {
    const res = await axios.get("/api/master/industries", { params: { mode: "flat" } }) as any;
    return unwrapList(res)
        .map(normalizeIndustry)
        .filter((item) => item.industryId > 0 && item.industryName.trim().length > 0);
};

export const GetIndustriesTree = async (): Promise<IIndustryTree[]> => {
    const res = await axios.get("/api/master/industries", { params: { mode: "tree" } }) as any;
    return unwrapList(res)
        .map(normalizeIndustryTree)
        .filter((item) => item.industryId > 0 && item.industryName.trim().length > 0);
};

export const GetStages = async (): Promise<IStageMasterItem[]> => {
    const res = await axios.get("/api/master/stages") as any;
    return unwrapList(res)
        .map(normalizeStage)
        .filter((item) => item.stageId > 0 && item.stageName.trim().length > 0);
};

export const GetStaffIndustries = async (): Promise<IStaffIndustryItem[]> => {
    const res = await axios.get("/api/staff/master/industries") as any;
    return unwrapList(res).map((item) => normalizeIndustryTree(item));
};

export const CreateStaffIndustry = (data: ICreateOrUpdateIndustryRequest) => {
    return axios.post<IBackendRes<any>>("/api/staff/master/industries", data).then((r) => {
        const envelope = (r as any)?.data ?? r;
        const item = envelope?.data ?? envelope;
        return normalizeIndustryTree(item);
    });
};

export const UpdateStaffIndustry = (id: number, data: ICreateOrUpdateIndustryRequest) => {
    return axios.put<IBackendRes<any>>(`/api/staff/master/industries/${id}`, data).then((r) => {
        const envelope = (r as any)?.data ?? r;
        const item = envelope?.data ?? envelope;
        return normalizeIndustryTree(item);
    });
};

export const DeleteStaffIndustry = (id: number) => {
    return axios.delete<IBackendRes<string>>(`/api/staff/master/industries/${id}`).then((r) => (r as any)?.data ?? r);
};

export const GetStaffStages = async (): Promise<IStageMasterItem[]> => {
    const res = await axios.get("/api/staff/master/stages") as any;
    return unwrapList(res)
        .map(normalizeStage)
        .filter((item) => item.stageId > 0 && item.stageName.trim().length > 0);
};

export const CreateStaffStage = (data: ICreateOrUpdateStageRequest) => {
    return axios.post<IBackendRes<any>>("/api/staff/master/stages", data).then((r) => {
        const envelope = (r as any)?.data ?? r;
        const item = envelope?.data ?? envelope;
        return normalizeStage(item);
    });
};

export const UpdateStaffStage = (id: number, data: ICreateOrUpdateStageRequest) => {
    return axios.put<IBackendRes<any>>(`/api/staff/master/stages/${id}`, data).then((r) => {
        const envelope = (r as any)?.data ?? r;
        const item = envelope?.data ?? envelope;
        return normalizeStage(item);
    });
};

export const DeleteStaffStage = (id: number) => {
    return axios.delete<IBackendRes<string>>(`/api/staff/master/stages/${id}`).then((r) => (r as any)?.data ?? r);
};
