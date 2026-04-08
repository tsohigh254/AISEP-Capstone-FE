export type InvestorPreferredStageValue =
    | "Idea"
    | "PreSeed"
    | "Seed"
    | "SeriesA"
    | "SeriesB"
    | "SeriesC"
    | "Growth";

export const INVESTOR_PREFERRED_STAGE_OPTIONS: Array<{
    value: InvestorPreferredStageValue;
    label: string;
}> = [
    { value: "Idea", label: "Idea" },
    { value: "PreSeed", label: "Pre-Seed" },
    { value: "Seed", label: "Seed" },
    { value: "SeriesA", label: "Series A" },
    { value: "SeriesB", label: "Series B" },
    { value: "SeriesC", label: "Series C+" },
    { value: "Growth", label: "Growth" },
];

const STAGE_VALUE_BY_INPUT: Record<string, InvestorPreferredStageValue> = {
    Idea: "Idea",
    PreSeed: "PreSeed",
    "Pre-Seed": "PreSeed",
    Seed: "Seed",
    SeriesA: "SeriesA",
    "Series A": "SeriesA",
    SeriesB: "SeriesB",
    "Series B": "SeriesB",
    SeriesC: "SeriesC",
    "Series C+": "SeriesC",
    Growth: "Growth",
    "IPO Ready": "Growth",
};

const STAGE_LABEL_BY_VALUE = INVESTOR_PREFERRED_STAGE_OPTIONS.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label;
    return acc;
}, {});

export const normalizeInvestorPreferredStage = (value: string): InvestorPreferredStageValue | null =>
    STAGE_VALUE_BY_INPUT[value] ?? null;

export const normalizeInvestorPreferredStages = (values?: string[]) => {
    const normalized = (values ?? [])
        .map(normalizeInvestorPreferredStage)
        .filter((value): value is InvestorPreferredStageValue => value != null);

    return Array.from(new Set(normalized));
};

export const getInvestorPreferredStageLabel = (value: string) => {
    const normalized = normalizeInvestorPreferredStage(value);
    if (!normalized) return value;
    return STAGE_LABEL_BY_VALUE[normalized] ?? value;
};

export const getInvestorPreferredStageLabels = (values?: string[]) =>
    normalizeInvestorPreferredStages(values).map(getInvestorPreferredStageLabel);
