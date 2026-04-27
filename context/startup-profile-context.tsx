"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    GetStartupProfile,
    CreateStartupProfile,
    UpdateStartupProfile,
    SubmitForApproval,
    ICreateStartupRequest,
    IUpdateStartupRequest,
} from "@/services/startup/startup.api";

export interface StartupProfileFormState {
    companyName: string;
    oneLiner: string;
    description: string;
    industryId: string;
    subIndustryId?: string;
    /** Deprecated aliases retained until all read-only screens migrate. */
    industryID?: string;
    subIndustry?: string;
    teamSize?: string;
    currentNeeds?: string[];
    [key: string]: any;
    metricSummary?: string;
    pitchDeckUrl?: string;
    stageId: string;
    stage?: string;
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
    productStatus?: string;
    country?: string;
    location?: string;
}

const INITIAL_FORM: StartupProfileFormState = {
    companyName: "",
    oneLiner: "",
    description: "",
    industryID: "",
    industryId: "",
    subIndustryId: "",
    stageId: "",
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
    productStatus: "",
    country: "",
    location: "",
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

const getNumberString = (...values: unknown[]) => {
    for (const value of values) {
        if (value === undefined || value === null || value === "") continue;
        const parsed = Number(value);
        if (Number.isFinite(parsed) && parsed > 0) return String(parsed);
    }
    return "";
};

export function StartupProfileProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<StartupProfileFormState>(INITIAL_FORM);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [profileLogoURL, setProfileLogoURL] = useState<string>("");
    
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const { 
        data: profile, 
        isLoading: loading, 
        error: queryError, 
        refetch: fetchProfile 
    } = useQuery({
        queryKey: ["startup-profile"],
        queryFn: async () => {
            try {
                const res = await GetStartupProfile() as IBackendRes<IStartupProfile>;
                if ((res.success || res.isSuccess) && res.data) {
                    const data = res.data as any;
                    const computeCompleteness = (d: any) => {
                        const keys = [
                            "companyName", "oneLiner", "description", "industryId", "industryID",
                            "stageId", "stageID", "stage", "teamSize", "pitchDeckUrl",
                            "problemStatement", "solutionSummary", "marketScope", "logoURL",
                            "country", "location"
                        ];
                        let filled = 0;
                        for (const k of keys) {
                            const v = d[k] ?? d[k === "teamSize" ? "TeamSize" : k.charAt(0).toUpperCase() + k.slice(1)];
                            if (v !== undefined && v !== null && String(v).trim() !== "") filled += 1;
                        }
                        return Math.round((filled / keys.length) * 100);
                    };
                    const completeness = data.profileCompleteness ?? data.completionPercent ?? data.completion ?? computeCompleteness(data);
                    data.profileCompleteness = completeness;
                    data.completionPercent = completeness;
                    data.completion = completeness;
                    return data;
                }
                return null;
            } catch (err: any) {
                if (err?.response?.status === 404) return null;
                throw err;
            }
        },
        retry: 1,
    });

    const error = queryError ? (queryError as any).message : null;

    const getTeamSizeValue = useCallback((data: IStartupProfile & { TeamSize?: string | number }) => {
        const raw = data.teamSize ?? data.TeamSize;
        return raw != null ? String(raw) : "";
    }, []);

    const clearSaveStatus = useCallback(() => {
        setSaveError(null);
        setSaveSuccess(false);
    }, []);

    // Sync form state whenever profile changes (from server refresh)
    useEffect(() => {
        if (!profile) return;
        
        const isInitial = form.companyName === "";
        
        if (isInitial || saveSuccess) {
            setForm({
                companyName: profile.companyName || "",
                oneLiner: profile.oneLiner || "",
                description: profile.description || "",
                industryId: getNumberString(profile.industryId, profile.industryID),
                industryID: getNumberString(profile.industryId, profile.industryID),
                subIndustryId: getNumberString(profile.subIndustryId, profile.subIndustryID),
                stageId: getNumberString(profile.stageId, profile.stageID, (profile as any).stage),
                stage: getNumberString(profile.stageId, profile.stageID, (profile as any).stage),
                foundedDate: profile.foundedDate ? new Date(profile.foundedDate).toISOString().split("T")[0] : "",
                website: profile.website || "",
                fundingAmountSought: profile.fundingAmountSought != null ? String(profile.fundingAmountSought) : "",
                currentFundingRaised: profile.currentFundingRaised != null ? String(profile.currentFundingRaised) : "",
                valuation: profile.valuation != null ? String(profile.valuation) : "",
                businessCode: profile.businessCode || "",
                fullNameOfApplicant: profile.fullNameOfApplicant || "",
                roleOfApplicant: profile.roleOfApplicant || "",
                problemStatement: profile.problemStatement || "",
                solutionSummary: profile.solutionSummary || "",
                marketScope: profile.marketScope || "",
                contactEmail: profile.contactEmail || "",
                contactPhone: profile.contactPhone || "",
                linkedInURL: profile.linkedInURL || "",
                subIndustry: profile.subIndustryName || (profile as any).subIndustry || "",
                teamSize: getTeamSizeValue(profile as IStartupProfile & { TeamSize?: string | number }),
                currentNeeds: Array.isArray(profile.currentNeeds)
                    ? profile.currentNeeds
                    : typeof profile.currentNeeds === 'string'
                        ? (() => { try { return JSON.parse(profile.currentNeeds); } catch { return [profile.currentNeeds]; } })()
                        : [],
                metricSummary: profile.metricSummary || "",
                pitchDeckUrl: (profile as any).pitchDeckUrl || "",
                productStatus: profile.productStatus || "",
                country: profile.country || "",
                location: profile.location || "",
            });

            // If this was a sync after save, clear the status so subsequent background refreshes don't overwrite typing
            if (saveSuccess) {
                clearSaveStatus();
            }
        }

        if (profile.logoURL) {
            setProfileLogoURL(profile.logoURL);
        }
    }, [profile, getTeamSizeValue, saveSuccess, clearSaveStatus]);

    const updateForm = useCallback((field: string, value: any) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === "industryId" || field === "industryID") {
                next.industryId = value;
                next.industryID = value;
            }
            if (field === "stageId" || field === "stage") {
                next.stageId = value;
                next.stage = value;
            }
            if (field === "subIndustryId" || field === "subIndustryID") {
                next.subIndustryId = value;
            }
            return next;
        });
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
                // if (!certificateFile) {
                //     setSaveError("Vui lòng tải lên giấy ĐKKD (bắt buộc khi tạo hồ sơ).");
                //     setSaving(false);
                //     return false;
                // }
            }

            const basePayload = {
                companyName: form.companyName || undefined,
                oneLiner: form.oneLiner,
                description: form.description || undefined,
                industryId: form.industryId ? parseInt(form.industryId) : undefined,
                subIndustryId: form.subIndustryId ? parseInt(form.subIndustryId) : null,
                stageId: form.stageId ? parseInt(form.stageId) : undefined,
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
                teamSize: form.teamSize || undefined,
                currentNeeds: form.currentNeeds || undefined,
                metricSummary: form.metricSummary || undefined,
                pitchDeckUrl: (form as any).pitchDeckUrl || undefined,
                productStatus: form.productStatus || undefined,
                country: form.country || undefined,
                location: form.location || undefined,
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
                await queryClient.invalidateQueries({ queryKey: ["startup-profile"] });
                setLogoFile(null);
                setCertificateFile(null);
                return true;
            } else if (!res.isSuccess && res.statusCode === 400 && Array.isArray(res.data) && res.data.length > 0) {
                const msgs = (res.data as IValidationError[]).flatMap((v) => v.messages ?? []);
                setSaveError(msgs.join(" "));
                return false;
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

            const res = await SubmitForApproval() as unknown as IBackendRes<IValidationError[] | null>;
            if (res.success || res.isSuccess) {
                await queryClient.invalidateQueries({ queryKey: ["startup-profile"] });
                return true;
            } else if (!res.isSuccess && res.statusCode === 400 && Array.isArray(res.data) && res.data.length > 0) {
                const msgs = (res.data as IValidationError[]).flatMap((v) => v.messages ?? []);
                setSaveError(msgs.join(" "));
                return false;
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

    // No more manual useEffect fetchProfile needed as useQuery handles it

    return (
        <StartupProfileContext.Provider value={{
            profile, form, logoFile, certificateFile, profileLogoURL,
            loading, saving, submitting, error, saveError, saveSuccess,
            fetchProfile: async () => { await fetchProfile(); }, 
            updateForm, setLogoFile, setCertificateFile, setProfileLogoURL,
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
