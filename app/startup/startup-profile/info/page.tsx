"use client";

import { useRef } from "react";
import { Building2, Camera, X } from "lucide-react";
import { useStartupProfile } from "@/context/startup-profile-context";
import { StartupStage } from "@/services/startup/startup.api";

const MOCK_INDUSTRIES = [
    { id: 1, name: "AI & Technology" },
    { id: 2, name: "Fintech" },
    { id: 3, name: "Healthcare" },
    { id: 4, name: "E-commerce" },
    { id: 5, name: "EdTech" },
    { id: 6, name: "ClimateTech" },
];

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all";
const labelCls = "block text-[12px] font-medium text-slate-500 mb-1.5";

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

export default function StartupInfoPage() {
    const { form, updateForm, logoFile, setLogoFile, profileLogoURL, setProfileLogoURL, loading } = useStartupProfile();
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setLogoFile(f);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Logo */}
            <FormSection title="Logo công ty">
                <div className="flex items-center gap-6">
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="relative w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 transition-all group flex-shrink-0"
                    >
                        {logoFile ? (
                            <img src={URL.createObjectURL(logoFile)} alt="logo" className="w-full h-full object-cover" />
                        ) : profileLogoURL ? (
                            <img src={profileLogoURL} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-slate-300 group-hover:text-slate-400 transition-colors" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-medium hover:bg-slate-700 transition-colors">
                                Chọn ảnh
                            </button>
                            {(logoFile || profileLogoURL) && (
                                <button
                                    type="button"
                                    onClick={() => { setLogoFile(null); setProfileLogoURL(""); }}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    title="Xóa ảnh"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">PNG, JPG, WEBP · Tối đa 5MB · Khuyến nghị 400×400px</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
            </FormSection>

            {/* General Info */}
            <FormSection title="Thông tin chung">
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>Tên công ty <span className="text-red-400">*</span></label>
                        <input
                            name="companyName"
                            value={form.companyName}
                            onChange={(e) => updateForm("companyName", e.target.value)}
                            className={inputCls}
                            placeholder="Tên chính thức của startup"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Tagline / One-liner <span className="text-red-400">*</span></label>
                        <input
                            name="oneLiner"
                            value={form.oneLiner}
                            onChange={(e) => updateForm("oneLiner", e.target.value)}
                            className={inputCls}
                            placeholder="Mô tả startup trong 1 câu"
                            maxLength={120}
                        />
                        <p className="text-[11px] text-slate-400 mt-1">{form.oneLiner.length}/120</p>
                    </div>
                    <div>
                        <label className={labelCls}>Mô tả chi tiết</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={(e) => updateForm("description", e.target.value)}
                            rows={4}
                            className={`${inputCls} resize-none`}
                            placeholder="Giới thiệu sản phẩm, giải pháp và tầm nhìn..."
                        />
                    </div>
                </div>
            </FormSection>

            {/* Industry & Stage */}
            <FormSection title="Ngành & Giai đoạn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Ngành nghề</label>
                        <select
                            name="industryID"
                            value={form.industryID}
                            onChange={(e) => updateForm("industryID", e.target.value)}
                            className={inputCls}
                        >
                            <option value="">Chọn ngành</option>
                            {MOCK_INDUSTRIES.map(ind => (
                                <option key={ind.id} value={ind.id.toString()}>{ind.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Giai đoạn <span className="text-red-400">*</span></label>
                        <select
                            name="stage"
                            value={form.stage}
                            onChange={(e) => updateForm("stage", e.target.value)}
                            className={inputCls}
                        >
                            <option value="" disabled>Chọn giai đoạn</option>
                            <option value={StartupStage.Idea.toString()}>Idea</option>
                            <option value={StartupStage.PreSeed.toString()}>Pre-Seed</option>
                            <option value={StartupStage.Seed.toString()}>Seed</option>
                            <option value={StartupStage.SeriesA.toString()}>Series A</option>
                            <option value={StartupStage.SeriesB.toString()}>Series B</option>
                            <option value={StartupStage.SeriesC.toString()}>Series C+</option>
                            <option value={StartupStage.Growth.toString()}>Growth</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Ngày thành lập</label>
                        <input
                            name="foundedDate"
                            type="date"
                            value={form.foundedDate}
                            onChange={(e) => updateForm("foundedDate", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Website</label>
                        <input
                            name="website"
                            type="url"
                            value={form.website}
                            onChange={(e) => updateForm("website", e.target.value)}
                            className={inputCls}
                            placeholder="https://example.com"
                        />
                    </div>
                </div>
            </FormSection>

            {/* Financial */}
            <FormSection title="Tài chính">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelCls}>Số vốn cần gọi (USD)</label>
                        <input
                            name="fundingAmountSought"
                            type="number"
                            min="0"
                            value={form.fundingAmountSought}
                            onChange={(e) => updateForm("fundingAmountSought", e.target.value)}
                            className={inputCls}
                            placeholder="VD: 500000"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Số vốn đã huy động (USD)</label>
                        <input
                            name="currentFundingRaised"
                            type="number"
                            min="0"
                            value={form.currentFundingRaised}
                            onChange={(e) => updateForm("currentFundingRaised", e.target.value)}
                            className={inputCls}
                            placeholder="VD: 120000"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Định giá (USD)</label>
                        <input
                            name="valuation"
                            type="number"
                            min="0"
                            value={form.valuation}
                            onChange={(e) => updateForm("valuation", e.target.value)}
                            className={inputCls}
                            placeholder="VD: 2000000"
                        />
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
