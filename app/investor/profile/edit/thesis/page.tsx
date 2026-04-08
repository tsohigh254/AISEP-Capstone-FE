"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, ChevronDown } from "lucide-react";
import { GetInvestorPreferences, GetInvestorProfile, UpdateInvestorProfile, UpdateInvestorPreferences } from "@/services/investor/investor.api";
import { GetIndustriesFlat, IIndustryFlat } from "@/services/master/master.api";
import { INVESTOR_PREFERRED_STAGE_OPTIONS, normalizeInvestorPreferredStages } from "@/lib/investor-preferred-stages";
import { useInvestorEdit } from "@/context/investor-edit-context";

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all";
const labelCls = "block text-[12px] font-medium text-slate-500 mb-1.5";

const normalizeTextList = (value: string) =>
    value.split(",").map(s => s.trim()).filter(Boolean);

const sameStringArray = (a: string[] = [], b: string[] = []) =>
    a.length === b.length && a.every((item, index) => item === b[index]);

const getStatusCode = (error: unknown) => {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { status?: number } }).response;
        return response?.status;
    }
    return undefined;
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-[13px] font-semibold text-slate-700">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export default function ThesisEditPage() {
    const { setSaveHandler, setIsSaving } = useInvestorEdit();
    const [isLoading, setIsLoading] = useState(true);

    const [investmentThesis, setInvestmentThesis] = useState("");
    const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);
    const [preferredStages, setPreferredStages] = useState<string[]>([]);
    const [preferredMarketScopes, setPreferredMarketScopes] = useState("");
    const [supportOffered, setSupportOffered] = useState("");

    const [industries, setIndustries] = useState<IIndustryFlat[]>([]);
    const [expandedSections, setExpandedSections] = useState<number[]>([]);

    useEffect(() => {
        Promise.allSettled([
            GetInvestorProfile(),
            GetInvestorPreferences(),
            GetIndustriesFlat(),
        ]).then(([profileResult, prefsResult, industriesResult]) => {
            if (profileResult.status === "fulfilled") {
                const profileData = profileResult.value as unknown as IBackendRes<IInvestorProfile>;
                if (profileData.isSuccess && profileData.data) {
                    const profile = profileData.data;
                    setInvestmentThesis(profile.investmentThesis || profile.bio || "");
                }
            }

            if (prefsResult.status === "fulfilled") {
                const prefsData = prefsResult.value as unknown as IBackendRes<IInvestorPreferences>;
                if (prefsData.isSuccess && prefsData.data) {
                    const prefs = prefsData.data;
                    setPreferredIndustries(prefs.preferredIndustries || []);
                    setPreferredStages(normalizeInvestorPreferredStages(prefs.preferredStages));
                    setPreferredMarketScopes((prefs.preferredMarketScopes || []).join(", "));
                    setSupportOffered((prefs.supportOffered || []).join(", "));
                }
            } else if (getStatusCode(prefsResult.reason) !== 405) {
                toast.error("Không tải được tiêu chí đầu tư");
            }

            if (industriesResult.status === "fulfilled") {
                setIndustries(industriesResult.value);
            } else {
                toast.error("Không tải được danh mục ngành");
            }
        }).finally(() => setIsLoading(false));
    }, []);

    const parentIndustries = industries.filter(i => !i.parentIndustryID);
    const childrenMap = industries.reduce((acc, i) => {
        if (i.parentIndustryID) {
            if (!acc[i.parentIndustryID]) acc[i.parentIndustryID] = [];
            acc[i.parentIndustryID].push(i);
        }
        return acc;
    }, {} as Record<number, IIndustryFlat[]>);

    const toggleIndustry = (name: string) => {
        setPreferredIndustries(prev =>
            prev.includes(name) ? prev.filter(v => v !== name) : [...prev, name]
        );
    };

    const toggleSection = (id: number) => {
        setExpandedSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleStage = (stage: string) => {
        setPreferredStages(prev =>
            prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
        );
    };

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const normalizedStages = normalizeInvestorPreferredStages(preferredStages);
            const marketScopesList = normalizeTextList(preferredMarketScopes);
            const supportOfferedList = normalizeTextList(supportOffered);

            const [profileRes, prefsRes] = await Promise.all([
                UpdateInvestorProfile({
                    investmentThesis,
                    bio: investmentThesis,
                }),
                UpdateInvestorPreferences({
                    preferredIndustries,
                    preferredStages: normalizedStages,
                    preferredMarketScopes: marketScopesList,
                    supportOffered: supportOfferedList,
                }),
            ]);

            const profileData = profileRes as unknown as IBackendRes<IInvestorProfile>;
            const prefsData = prefsRes as unknown as IBackendRes<IInvestorPreferences>;

            if (!profileData.isSuccess || !prefsData.isSuccess) {
                toast.error(profileData.message || prefsData?.message || "Cập nhật thất bại");
                return;
            }

            if (prefsData.data) {
                const savedPreferences = prefsData.data;
                const savedIndustries = savedPreferences.preferredIndustries || [];
                const savedStages = savedPreferences.preferredStages || [];
                const savedMarketScopes = savedPreferences.preferredMarketScopes || [];
                const savedSupportOffered = savedPreferences.supportOffered || [];

                setPreferredIndustries(savedIndustries);
                setPreferredStages(savedStages);
                setPreferredMarketScopes(savedMarketScopes.join(", "));
                setSupportOffered(savedSupportOffered.join(", "));

                const notPersisted: string[] = [];

                if (!sameStringArray(savedIndustries, preferredIndustries)) notPersisted.push("ngành nghề quan tâm");
                if (!sameStringArray(savedStages, normalizedStages)) notPersisted.push("giai đoạn ưu tiên");
                if (!sameStringArray(savedMarketScopes, marketScopesList)) notPersisted.push("market scopes");
                if (!sameStringArray(savedSupportOffered, supportOfferedList)) notPersisted.push("giá trị gia tăng cung cấp");

                if (notPersisted.length > 0) {
                    toast.warning(`Server chưa lưu được: ${notPersisted.join(", ")}`);
                    return;
                }
            }

            toast.success("Đã cập nhật Thesis & Tiêu chí đầu tư");
        } catch {
            toast.error("Gặp lỗi khi cập nhật");
        } finally {
            setIsSaving(false);
        }
    }, [investmentThesis, preferredIndustries, preferredStages, preferredMarketScopes, supportOffered, setIsSaving]);

    useEffect(() => {
        setSaveHandler(handleSave);
    }, [handleSave, setSaveHandler]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-6 h-6 animate-spin text-[#e6cc4c]" />
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-400">
            <FormSection title="Tiêu chí đầu tư (Thesis)">
                <div className="space-y-6">
                    <div>
                        <label className={labelCls}>Triết lý đầu tư ngắn gọn (Short Summary)</label>
                        <textarea
                            rows={3}
                            value={investmentThesis}
                            onChange={e => setInvestmentThesis(e.target.value)}
                            className={cn(inputCls, "resize-none")}
                            placeholder="Tóm tắt trọng tâm đầu tư của bạn..."
                        />
                    </div>

                    {/* Industry picker */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelCls + " mb-0"}>Ngành nghề quan tâm</label>
                            {preferredIndustries.length > 0 && (
                                <span className="text-[12px] text-slate-500">
                                    Đã chọn <span className="font-semibold text-slate-700">{preferredIndustries.length}</span> lĩnh vực
                                </span>
                            )}
                        </div>

                        {industries.length === 0 ? (
                            <div className="space-y-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-11 rounded-xl bg-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {parentIndustries.map(parent => {
                                    const children = childrenMap[parent.industryID] || [];
                                    const selectedCount = children.filter(c =>
                                        preferredIndustries.includes(c.industryName)
                                    ).length;
                                    const isExpanded = expandedSections.includes(parent.industryID);

                                    if (children.length === 0) {
                                        const isSelected = preferredIndustries.includes(parent.industryName);
                                        return (
                                            <button
                                                key={parent.industryID}
                                                type="button"
                                                onClick={() => toggleIndustry(parent.industryName)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl border text-[13px] font-semibold transition-all active:scale-[0.99]",
                                                    isSelected
                                                        ? "bg-[#e6cc4c]/10 border-[#e6cc4c] text-slate-900"
                                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                                                )}
                                            >
                                                {parent.industryName}
                                            </button>
                                        );
                                    }

                                    return (
                                        <div key={parent.industryID} className="border border-slate-200 rounded-xl overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => toggleSection(parent.industryID)}
                                                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                                            >
                                                <span className="text-[13px] font-semibold text-slate-700">{parent.industryName}</span>
                                                <div className="flex items-center gap-2">
                                                    {selectedCount > 0 && (
                                                        <span className="bg-[#e6cc4c] text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                                            {selectedCount}
                                                        </span>
                                                    )}
                                                    <ChevronDown className={cn(
                                                        "w-4 h-4 text-slate-400 transition-transform duration-200",
                                                        isExpanded && "rotate-180"
                                                    )} />
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="px-4 py-3 flex flex-wrap gap-2 bg-white border-t border-slate-100">
                                                    {children.map(child => (
                                                        <button
                                                            key={child.industryID}
                                                            type="button"
                                                            onClick={() => toggleIndustry(child.industryName)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all active:scale-95",
                                                                preferredIndustries.includes(child.industryName)
                                                                    ? "bg-[#e6cc4c] border-[#e6cc4c] text-slate-900"
                                                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white"
                                                            )}
                                                        >
                                                            {child.industryName}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className={labelCls}>Giai đoạn ưu tiên</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {INVESTOR_PREFERRED_STAGE_OPTIONS.map(stage => (
                                <button
                                    key={stage.value}
                                    type="button"
                                    onClick={() => toggleStage(stage.value)}
                                    className={cn(
                                        "px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all active:scale-95",
                                        preferredStages.includes(stage.value)
                                            ? "bg-[#0f172a] border-[#0f172a] text-white"
                                            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    {stage.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Mô hình kinh doanh (Market Scopes)</label>
                            <input
                                type="text"
                                value={preferredMarketScopes}
                                onChange={e => setPreferredMarketScopes(e.target.value)}
                                className={inputCls}
                                placeholder="Ví dụ: B2B, B2C..."
                            />
                            <p className="text-[11px] text-slate-400 mt-1.5">Phân tách bằng dấu phẩy.</p>
                        </div>
                        <div>
                            <label className={labelCls}>Giá trị gia tăng cung cấp</label>
                            <input
                                type="text"
                                value={supportOffered}
                                onChange={e => setSupportOffered(e.target.value)}
                                className={inputCls}
                                placeholder="Ví dụ: Mentorship, Network..."
                            />
                            <p className="text-[11px] text-slate-400 mt-1.5">Phân tách bằng dấu phẩy.</p>
                        </div>
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
