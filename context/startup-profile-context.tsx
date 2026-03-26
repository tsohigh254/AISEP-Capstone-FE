"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import {
    GetStartupProfile,
    CreateStartupProfile,
    UpdateStartupProfile,
    SubmitForApproval,
    ICreateStartupRequest,
    IUpdateStartupRequest,
    StartupStage,
} from "@/services/startup/startup.api";

export interface StartupProfileFormState {
    companyName: string;
    oneLiner: string;
    description: string;
    industryID: string;
    stage: string;
    foundedDate: string;
    website: string;
    targetFunding: string;
    raisedAmount: string;
    valuation: string;
    problemStatement: string;
    solutionSummary: string;
    currentNeeds: string[];
    marketScope: string;
    productStatus: string;
    contactEmail: string;
    contactPhone: string;
    linkedInURL: string;
    metricSummary: string;
    location: string;
    country: string;
    teamSize: string;
}

const INITIAL_FORM: StartupProfileFormState = {
    companyName: "",
    oneLiner: "",
    description: "",
    industryID: "",
    stage: StartupStage.Idea.toString(),
    foundedDate: "",
    website: "",
    targetFunding: "",
    raisedAmount: "",
    valuation: "",
    problemStatement: "",
    solutionSummary: "",
    currentNeeds: [],
    marketScope: "",
    productStatus: "",
    contactEmail: "",
    contactPhone: "",
    linkedInURL: "",
    metricSummary: "",
    location: "",
    country: "",
    teamSize: "",
};

interface StartupProfileContextType {
    profile: any | null;
    form: StartupProfileFormState;
    logoFile: File | null;
    profileLogoURL: string;
    loading: boolean;
    saving: boolean;
    submitting: boolean;
    error: string | null;
    saveError: string | null;
    saveSuccess: boolean;
    fetchProfile: () => Promise<void>;
    updateForm: (field: string, value: any) => void;
    setLogoFile: (file: File | null) => void;
    setProfileLogoURL: (url: string) => void;
    saveProfile: () => Promise<boolean>;
    submitForApproval: () => Promise<boolean>;
    clearSaveStatus: () => void;
}

const StartupProfileContext = createContext<StartupProfileContextType | null>(null);

const STAGE_MAP: Record<string, StartupStage> = {
    Idea: StartupStage.Idea,
    PreSeed: StartupStage.PreSeed,
    "Pre-Seed": StartupStage.PreSeed,
    Seed: StartupStage.Seed,
    SeriesA: StartupStage.SeriesA,
    "Series A": StartupStage.SeriesA,
    SeriesB: StartupStage.SeriesB,
    "Series B": StartupStage.SeriesB,
    SeriesC: StartupStage.SeriesC,
    "Series C": StartupStage.SeriesC,
    "Series C+": StartupStage.SeriesC,
    Growth: StartupStage.Growth,
};

const normalizeStage = (stage: string): StartupStage => {
    const trimmed = `${stage ?? ""}`.trim();
    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber) && asNumber >= StartupStage.Idea && asNumber <= StartupStage.Growth) {
        return asNumber as StartupStage;
    }
    return STAGE_MAP[trimmed] ?? StartupStage.Idea;
};

export function StartupProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<any | null>(null);
    const [form, setForm] = useState<StartupProfileFormState>(INITIAL_FORM);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [profileLogoURL, setProfileLogoURL] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await GetStartupProfile() as unknown as IBackendRes<any>;
            console.log("🔥 [GET API] Dữ liệu Backend trả về (/startups/me):", res?.data);
            if ((res.success || res.isSuccess) && res.data) {
                const data = res.data;
                setProfile(data);
                setForm({
                    companyName: data.companyName || "",
                    oneLiner: data.oneLiner || "",
                    description: data.description || "",
                    industryID: data.industryID?.toString() || "",
                    stage: data.stage !== undefined ? normalizeStage(data.stage).toString() : StartupStage.Idea.toString(),
                    foundedDate: data.foundedDate ? new Date(data.foundedDate).toISOString().split("T")[0] : "",
                    website: data.website || "",
                    targetFunding: data.targetFunding?.toString() || "",
                    raisedAmount: data.raisedAmount?.toString() || "",
                    valuation: data.valuation?.toString() || "",
                    problemStatement: data.problemStatement || "",
                    solutionSummary: data.solutionSummary || "",
                    currentNeeds: Array.isArray(data.currentNeeds) ? data.currentNeeds : [],
                    marketScope: data.marketScope || "",
                    productStatus: data.productStatus || "",
                    contactEmail: data.contactEmail || "",
                    contactPhone: data.contactPhone || "",
                    linkedInURL: data.linkedInURL || "",
                    metricSummary: data.metricSummary || "",
                    location: data.location || "",
                    country: data.country || "",
                    teamSize: data.teamSize ? data.teamSize.toString() : "",
                });
                if (data.logoURL) {
                    setProfileLogoURL(data.logoURL);
                }
            } else {
                setProfile(null);
                setError(null);
            }
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 404) {
                setProfile(null);
                setError(null);
            } else {
                setError("Lỗi kết nối. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const updateForm = useCallback((field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const saveProfile = useCallback(async (): Promise<boolean> => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const basePayload = {
                companyName: form.companyName || undefined,
                oneLiner: form.oneLiner,
                description: form.description || undefined,
                industryID: form.industryID ? parseInt(form.industryID) : undefined,
                stage: normalizeStage(form.stage),
                foundedDate: form.foundedDate ? new Date(form.foundedDate) : undefined,
                website: form.website || undefined,
                targetFunding: form.targetFunding ? parseFloat(form.targetFunding) : undefined,
                raisedAmount: form.raisedAmount ? parseFloat(form.raisedAmount) : undefined,
                valuation: form.valuation ? parseFloat(form.valuation) : undefined,
                problemStatement: form.problemStatement || undefined,
                solutionSummary: form.solutionSummary || undefined,
                currentNeeds: form.currentNeeds && form.currentNeeds.length > 0 ? form.currentNeeds : undefined,
                marketScope: form.marketScope || undefined,
                productStatus: form.productStatus || undefined,
                contactEmail: form.contactEmail || undefined,
                contactPhone: form.contactPhone || undefined,
                linkedInURL: form.linkedInURL || undefined,
                metricSummary: form.metricSummary || undefined,
                location: form.location || undefined,
                country: form.country || undefined,
                teamSize: form.teamSize ? parseInt(form.teamSize) : undefined,
                teamsize: form.teamSize ? parseInt(form.teamSize) : undefined, // Phòng trường hợp BE sai case
            };

            const payload: IUpdateStartupRequest | ICreateStartupRequest = {
                ...basePayload,
            };
            
            console.log("🔥 [PUT API] Payload sẽ ném vào Backend FormData:", payload);

            if (logoFile) {
                payload.logoUrl = logoFile;
            } else if (profile?.logoURL && !profileLogoURL) {
                payload.logoUrl = null;
            }

            const isExistingProfile = !!profile;
            const res = isExistingProfile
                ? await UpdateStartupProfile(payload as IUpdateStartupRequest) as unknown as IBackendRes<string>
                : await CreateStartupProfile(payload as ICreateStartupRequest) as unknown as IBackendRes<string>;
                
            if (res.success || res.isSuccess) {
                setSaveSuccess(true);
                // Refetch profile to get updated data
                await fetchProfile();
                setLogoFile(null);
                return true;
            } else {
                setSaveError(res.message || "Lưu thất bại");
                return false;
            }
        } catch (err: any) {
            console.error("Lỗi khi saveProfile:", err);
            const msg = err?.response?.data?.message || err?.response?.data?.title || err?.message || "Lỗi kết nối. Vui lòng thử lại.";
            setSaveError(typeof msg === 'string' ? msg : JSON.stringify(msg));
            return false;
        } finally {
            setSaving(false);
        }
    }, [form, logoFile, fetchProfile, profile, profileLogoURL]);

    const submitForApprovalFn = useCallback(async (): Promise<boolean> => {
        setSubmitting(true);
        setSaveError(null);
        try {
            // Save first, then submit
            const saved = await saveProfile();
            if (!saved) return false;

            const res = await SubmitForApproval() as unknown as IBackendRes<null>;
            if (res.success || res.isSuccess) {
                await fetchProfile();
                return true;
            } else {
                setSaveError(res.message || "Gửi duyệt thất bại");
                return false;
            }
        } catch {
            setSaveError("Lỗi kết nối. Vui lòng thử lại.");
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [saveProfile, fetchProfile]);

    const clearSaveStatus = useCallback(() => {
        setSaveError(null);
        setSaveSuccess(false);
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <StartupProfileContext.Provider value={{
            profile, form, logoFile, profileLogoURL,
            loading, saving, submitting, error, saveError, saveSuccess,
            fetchProfile, updateForm, setLogoFile, setProfileLogoURL,
            saveProfile, submitForApproval: submitForApprovalFn, clearSaveStatus,
        }}>
            {children}
        </StartupProfileContext.Provider>
    );
}

export function useStartupProfile() {
    const ctx = useContext(StartupProfileContext);
    if (!ctx) throw new Error("useStartupProfile must be used within StartupProfileProvider");
    return ctx;
}
