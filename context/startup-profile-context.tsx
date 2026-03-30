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
    fundingAmountSought: string;
    currentFundingRaised: string;
    valuation: string;
    businessCode: string;
    fullNameOfApplicant: string;
    roleOfApplicant: string;
    problemStatement: string;
    solutionSummary: string;
    marketScope: string;
    contactEmail: string;
    contactPhone: string;
    linkedInURL: string;
}

const INITIAL_FORM: StartupProfileFormState = {
    companyName: "",
    oneLiner: "",
    description: "",
    industryID: "",
    stage: StartupStage.Idea.toString(),
    foundedDate: "",
    website: "",
    fundingAmountSought: "",
    currentFundingRaised: "",
    valuation: "",
    businessCode: "",
    fullNameOfApplicant: "",
    roleOfApplicant: "",
    problemStatement: "",
    solutionSummary: "",
    marketScope: "",
    contactEmail: "",
    contactPhone: "",
    linkedInURL: "",
};

interface StartupProfileContextType {
    profile: IStartupProfile | null;
    form: StartupProfileFormState;
    logoFile: File | null;
    profileLogoURL: string;
    certificateFile: File | null;
    loading: boolean;
    saving: boolean;
    submitting: boolean;
    error: string | null;
    saveError: string | null;
    saveSuccess: boolean;
    fetchProfile: () => Promise<void>;
    updateForm: (field: string, value: any) => void;
    setLogoFile: (file: File | null) => void;
    setCertificateFile: (file: File | null) => void;
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

const normalizeStage = (stage: string | number | undefined | null): StartupStage => {
    if (typeof stage === "number" && Number.isFinite(stage) && stage >= StartupStage.Idea && stage <= StartupStage.Growth) {
        return stage as StartupStage;
    }
    const trimmed = `${stage ?? ""}`.trim();
    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber) && asNumber >= StartupStage.Idea && asNumber <= StartupStage.Growth) {
        return asNumber as StartupStage;
    }
    return STAGE_MAP[trimmed] ?? StartupStage.Idea;
};

export function StartupProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<IStartupProfile | null>(null);
    const [form, setForm] = useState<StartupProfileFormState>(INITIAL_FORM);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
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
            const res = await GetStartupProfile() as IBackendRes<IStartupProfile>;
            if ((res.success || res.isSuccess) && res.data) {
                const data = res.data;
                setProfile(data);
                setForm({
                    companyName: data.companyName || "",
                    oneLiner: data.oneLiner || "",
                    description: data.description || "",
                    industryID: data.industryID != null ? String(data.industryID) : "",
                    stage: data.stage !== undefined && data.stage !== null ? normalizeStage(data.stage).toString() : StartupStage.Idea.toString(),
                    foundedDate: data.foundedDate ? new Date(data.foundedDate).toISOString().split("T")[0] : "",
                    website: data.website || "",
                    fundingAmountSought:
                        data.fundingAmountSought != null && !Number.isNaN(Number(data.fundingAmountSought))
                            ? String(data.fundingAmountSought)
                            : "",
                    currentFundingRaised:
                        data.currentFundingRaised != null && !Number.isNaN(Number(data.currentFundingRaised))
                            ? String(data.currentFundingRaised)
                            : "",
                    valuation:
                        data.valuation != null && !Number.isNaN(Number(data.valuation)) ? String(data.valuation) : "",
                    businessCode: data.businessCode || "",
                    fullNameOfApplicant: data.fullNameOfApplicant || "",
                    roleOfApplicant: data.roleOfApplicant || "",
                    problemStatement: data.problemStatement || "",
                    solutionSummary: data.solutionSummary || "",
                    marketScope: data.marketScope || "",
                    contactEmail: data.contactEmail || "",
                    contactPhone: data.contactPhone || "",
                    linkedInURL: data.linkedInURL || "",
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
            const MAX_MONEY = 999999999999;
            const parseMoney = (s: string | undefined) => {
                if (s == null || !String(s).trim()) return undefined;
                const n = parseFloat(String(s).replace(/,/g, ""));
                return Number.isFinite(n) ? n : undefined;
            };
            const moneyError =
                (form.fundingAmountSought && (parseMoney(form.fundingAmountSought) ?? 0) > MAX_MONEY)
                    ? "Mục tiêu gọi vốn vượt quá giới hạn cho phép ($999,999,999,999)."
                : (form.currentFundingRaised && (parseMoney(form.currentFundingRaised) ?? 0) > MAX_MONEY)
                    ? "Số tiền đã huy động vượt quá giới hạn cho phép ($999,999,999,999)."
                : (form.valuation && (parseMoney(form.valuation) ?? 0) > MAX_MONEY)
                    ? "Định giá công ty vượt quá giới hạn cho phép ($999,999,999,999)."
                : null;
            if (moneyError) {
                setSaveError(moneyError);
                setSaving(false);
                return false;
            }

            const isExistingProfile = !!profile;

            if (!isExistingProfile) {
                if (!form.companyName?.trim()) {
                    setSaveError("Vui lòng nhập tên startup / dự án.");
                    setSaving(false);
                    return false;
                }
                if (!form.oneLiner?.trim()) {
                    setSaveError("Vui lòng nhập tagline / khẩu hiệu.");
                    setSaving(false);
                    return false;
                }
                if (!certificateFile) {
                    setSaveError("Vui lòng tải lên giấy ĐKKD (bắt buộc khi tạo hồ sơ).");
                    setSaving(false);
                    return false;
                }
            }

            const basePayload = {
                companyName: form.companyName || undefined,
                oneLiner: form.oneLiner,
                description: form.description || undefined,
                industryID: form.industryID ? parseInt(form.industryID) : undefined,
                stage: normalizeStage(form.stage),
                foundedDate: form.foundedDate ? new Date(form.foundedDate) : undefined,
                website: form.website || undefined,
                fundingAmountSought: parseMoney(form.fundingAmountSought),
                currentFundingRaised: parseMoney(form.currentFundingRaised),
                valuation: parseMoney(form.valuation),
                businessCode: form.businessCode || undefined,
                fullNameOfApplicant: form.fullNameOfApplicant || undefined,
                roleOfApplicant: form.roleOfApplicant || undefined,
                problemStatement: form.problemStatement || undefined,
                solutionSummary: form.solutionSummary || undefined,
                marketScope: form.marketScope || undefined,
                contactEmail: form.contactEmail || undefined,
                contactPhone: form.contactPhone || undefined,
                linkedInURL: form.linkedInURL || undefined,
            };

            const payload: any = {
                ...basePayload,
            };
            
            if (logoFile) {
                payload.logoUrl = logoFile;
            } else if (profile?.logoURL && !profileLogoURL) {
                payload.logoUrl = null;
            }

            if (certificateFile) {
                payload.FileCertificateBusiness = certificateFile;
            }

            const res = isExistingProfile
                ? await UpdateStartupProfile(payload as IUpdateStartupRequest) as unknown as IBackendRes<string>
                : await CreateStartupProfile(payload as ICreateStartupRequest) as unknown as IBackendRes<string>;
                
            if (res.success || res.isSuccess) {
                setSaveSuccess(true);
                await fetchProfile();
                setLogoFile(null);
                setCertificateFile(null);
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
    }, [form, logoFile, certificateFile, fetchProfile, profile, profileLogoURL]);

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
            profile, form, logoFile, certificateFile, profileLogoURL,
            loading, saving, submitting, error, saveError, saveSuccess,
            fetchProfile, updateForm, setLogoFile, setCertificateFile, setProfileLogoURL,
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
