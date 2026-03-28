import axios from "../interceptor";

export interface IIndustryFlat {
    industryID: number;
    industryName: string;
    description?: string;
    parentIndustryID?: number | null;
}

export const GetIndustriesFlat = async (): Promise<IIndustryFlat[]> => {
    const res = await axios.get("/api/master/industries", { params: { mode: "flat" } }) as any;
    // interceptor trả về res.data trực tiếp, nên res có thể là array hoặc wrapped
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};
