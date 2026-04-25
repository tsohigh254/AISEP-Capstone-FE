export type InvestorPreferredStageValue =
    | "Idea"
    | "PreSeed"
    | "Seed"
    | "Growth";

export const INVESTOR_PREFERRED_STAGE_OPTIONS: Array<{
    value: InvestorPreferredStageValue;
    label: string;
}> = [
    { value: "Idea", label: "Idea" },
    { value: "PreSeed", label: "Pre-Seed" },
    { value: "Seed", label: "Seed" },
    { value: "Growth", label: "Growth" },
];

export type InvestorStageLike = string | { stageId?: number; stageID?: number; id?: number; stageName?: string; name?: string };
export type InvestorIndustryLike = string | { industryId?: number; industryID?: number; id?: number; industryName?: string; name?: string };

const STAGE_VALUE_BY_INPUT: Record<string, InvestorPreferredStageValue> = {
    Idea: "Idea",
    PreSeed: "PreSeed",
    "Pre-Seed": "PreSeed",
    Seed: "Seed",
    Growth: "Growth",
    "IPO Ready": "Growth",
};

const STAGE_LABEL_BY_VALUE = INVESTOR_PREFERRED_STAGE_OPTIONS.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label;
    return acc;
}, {});

const getStageName = (value: InvestorStageLike): string => {
    if (typeof value === "string") return value;
    return value.stageName ?? value.name ?? "";
};

export const getStageId = (value: InvestorStageLike): number | null => {
    if (typeof value === "string") return null;
    const id = value.stageId ?? value.stageID ?? value.id;
    return typeof id === "number" && Number.isFinite(id) ? id : null;
};

export const getIndustryId = (value: InvestorIndustryLike): number | null => {
    if (typeof value === "string") return null;
    const id = value.industryId ?? value.industryID ?? value.id;
    return typeof id === "number" && Number.isFinite(id) ? id : null;
};

export const getIndustryName = (value: InvestorIndustryLike): string => {
    if (typeof value === "string") return value;
    return value.industryName ?? value.name ?? "";
};

export const normalizeInvestorPreferredStage = (value: InvestorStageLike): InvestorPreferredStageValue | null =>
    STAGE_VALUE_BY_INPUT[getStageName(value)] ?? null;

export const normalizeInvestorPreferredStages = (values?: InvestorStageLike[]) => {
    const normalized = (values ?? [])
        .map(normalizeInvestorPreferredStage)
        .filter((value): value is InvestorPreferredStageValue => value != null);

    return Array.from(new Set(normalized));
};

export const getInvestorPreferredStageLabel = (value: InvestorStageLike) => {
    const normalized = normalizeInvestorPreferredStage(value);
    if (!normalized) return getStageName(value);
    return STAGE_LABEL_BY_VALUE[normalized] ?? getStageName(value);
};

export const getInvestorPreferredStageLabels = (values?: InvestorStageLike[]) =>
    normalizeInvestorPreferredStages(values).map(getInvestorPreferredStageLabel);
