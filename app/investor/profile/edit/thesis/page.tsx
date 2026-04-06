"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GetInvestorProfile, UpdateInvestorProfile, UpdateInvestorPreferences } from "@/services/investor/investor.api";
import { useInvestorEdit } from "@/context/investor-edit-context";

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all";
const labelCls = "block text-[12px] font-medium text-slate-500 mb-1.5";

const STAGE_OPTIONS = ["Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "IPO Ready"];

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
    const [preferredIndustries, setPreferredIndustries] = useState("");
    const [preferredStages, setPreferredStages] = useState<string[]>([]);
    const [preferredGeographies, setPreferredGeographies] = useState("");
    const [preferredMarketScopes, setPreferredMarketScopes] = useState("");
    const [supportOffered, setSupportOffered] = useState("");

    useEffect(() => {
        GetInvestorProfile()
            .then(res => {
                const data = res as unknown as IBackendRes<IInvestorProfile>;
                if (data.isSuccess && data.data) {
                    const p = data.data;
                    setInvestmentThesis(p.investmentThesis || p.bio || "");
                    setPreferredIndustries((p.preferredIndustries || []).join(", "));
                    setPreferredStages(p.preferredStages || []);
                    setPreferredGeographies((p.preferredGeographies || []).join(", "));
                    setPreferredMarketScopes((p.preferredMarketScopes || []).join(", "));
                    setSupportOffered((p.supportOffered || []).join(", "));
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const toggleStage = (stage: string) => {
        setPreferredStages(prev =>
            prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
        );
    };

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const industriesList = preferredIndustries.split(",").map(s => s.trim()).filter(Boolean);

            const [profileRes] = await Promise.all([
                UpdateInvestorProfile({ investmentThesis, bio: investmentThesis }),
                (industriesList.length > 0 || preferredStages.length > 0)
                    ? UpdateInvestorPreferences({
                        preferredIndustries: industriesList,
                        preferredStages,
                    })
                    : Promise.resolve(),
            ]);

            const data = profileRes as unknown as IBackendRes<IInvestorProfile>;
            if (data.isSuccess) {
                toast.success("Đã cập nhật Thesis & Tiêu chí đầu tư");
            } else {
                toast.error(data.message || "Cập nhật thất bại");
            }
        } catch {
            toast.error("Gặp lỗi khi cập nhật");
        } finally {
            setIsSaving(false);
        }
    }, [investmentThesis, preferredIndustries, preferredStages, setIsSaving]);

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
                <div className="space-y-4">
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

                    <div>
                        <label className={labelCls}>Ngành nghề quan tâm</label>
                        <textarea
                            rows={2}
                            value={preferredIndustries}
                            onChange={e => setPreferredIndustries(e.target.value)}
                            className={cn(inputCls, "resize-none")}
                            placeholder="Ví dụ: AI, Logistics, Fintech..."
                        />
                        <p className="text-[11px] text-slate-400 mt-1.5">Phân tách mỗi ngành bằng dấu phẩy.</p>
                    </div>

                    <div>
                        <label className={labelCls}>Giai đoạn ưu tiên</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {STAGE_OPTIONS.map(stage => (
                                <button
                                    key={stage}
                                    type="button"
                                    onClick={() => toggleStage(stage)}
                                    className={cn(
                                        "px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all active:scale-95",
                                        preferredStages.includes(stage)
                                            ? "bg-[#0f172a] border-[#0f172a] text-white"
                                            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    {stage}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Khu vực địa lý ưu tiên</label>
                            <input
                                type="text"
                                value={preferredGeographies}
                                onChange={e => setPreferredGeographies(e.target.value)}
                                className={inputCls}
                                placeholder="Ví dụ: Việt Nam, Global..."
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Mô hình kinh doanh (Market Scopes)</label>
                            <input
                                type="text"
                                value={preferredMarketScopes}
                                onChange={e => setPreferredMarketScopes(e.target.value)}
                                className={inputCls}
                                placeholder="Ví dụ: B2B, B2C..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Giá trị gia tăng cung cấp</label>
                        <textarea
                            rows={2}
                            value={supportOffered}
                            onChange={e => setSupportOffered(e.target.value)}
                            className={cn(inputCls, "resize-none")}
                            placeholder="Ví dụ: Mentorship, Network, C-level recruitment..."
                        />
                        <p className="text-[11px] text-slate-400 mt-1.5">Phân tách bằng dấu phẩy.</p>
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
