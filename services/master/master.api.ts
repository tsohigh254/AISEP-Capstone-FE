import axios from "../interceptor";

export interface IIndustryFlat {
    industryID: number;
    industryName: string;
    description?: string;
    parentIndustryID?: number | null;
}

export interface IStageMasterItem {
    stageID?: number;
    stageName: string;
}

export const GetIndustriesFlat = async (): Promise<IIndustryFlat[]> => {
    const res = await axios.get("/api/master/industries", { params: { mode: "flat" } }) as any;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};

export const GetStages = async (): Promise<IStageMasterItem[]> => {
    const res = await axios.get("/api/master/stages") as any;
    const rawItems = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
            ? res.data
            : [];

    return rawItems
        .map((item: any) => ({
            stageID: item?.stageID ?? item?.stageId ?? item?.id,
            stageName: item?.stageName ?? item?.StageName ?? item?.name ?? item?.Name,
        }))
        .filter((item: IStageMasterItem) => typeof item.stageName === "string" && item.stageName.trim().length > 0);
};
