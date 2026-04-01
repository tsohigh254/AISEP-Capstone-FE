"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { getNames } from "country-list";
import { Building2, Camera, X, ChevronDown } from "lucide-react";
import { useStartupProfile } from "@/context/startup-profile-context";
import { StartupStage } from "@/services/startup/startup.api";
import { GetIndustriesFlat, IIndustryFlat } from "@/services/master/master.api";
import { cn } from "@/lib/utils";
import { NumericFormat } from "react-number-format";

const COUNTRIES = [
    "Viet Nam",
    ...getNames()
        .filter(n => n !== "Viet Nam")
        .sort((a, b) => a.localeCompare(b)),
];


const inputCls = "w-full bg-slate-50 border border-slate-200/80 rounded-[14px] px-4 py-3 text-[13px] text-[#0f172a] placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-[#0f172a]/5 focus:border-[#0f172a]/30 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]";
const labelCls = "block text-[12px] font-semibold text-slate-700 mb-1.5";

// Component chọn Quốc gia (custom dropdown dùng portal để tránh overflow-hidden)
const CountrySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filtered = search.trim()
        ? COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))
        : COUNTRIES;

    const handleSelect = useCallback((country: string) => {
        onChange(country);
        setOpen(false);
        setSearch("");
    }, [onChange]);

    const handleOpen = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        }
        setOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setSearch("");
            }
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={handleOpen}
                className={cn(inputCls, "flex items-center justify-between text-left", !value && "text-slate-400")}
            >
                <span>{value || "Chọn quốc gia"}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", open && "rotate-180")} />
            </button>

            {open && createPortal(
                <div ref={dropdownRef} style={dropdownStyle} className="bg-white border border-slate-200 rounded-[14px] shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm quốc gia..."
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-[10px] px-3 py-2 text-[13px] text-[#0f172a] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0f172a]/10"
                        />
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-2 text-[13px] text-slate-400">Không tìm thấy</li>
                        ) : filtered.map(c => (
                            <li
                                key={c}
                                onMouseDown={() => handleSelect(c)}
                                className={cn(
                                    "px-4 py-2 text-[13px] cursor-pointer hover:bg-slate-50 transition-colors",
                                    value === c ? "font-semibold text-[#0f172a] bg-slate-50" : "text-slate-700"
                                )}
                            >
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
};

// Component nhập Tags (Multi-select)
const TagsInput = ({ value, onChange, placeholder }: { value: string[], onChange: (v: string[]) => void, placeholder?: string }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            if (!value.includes(inputValue.trim())) {
                onChange([...value, inputValue.trim()]);
            }
            setInputValue("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap gap-2 p-2 border border-slate-200/80 rounded-[14px] bg-slate-50 focus-within:ring-4 focus-within:ring-[#0f172a]/5 focus-within:border-[#0f172a]/30 focus-within:bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            {value.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] text-[12px] font-semibold text-white rounded-[10px] shadow-sm animate-in zoom-in-95 duration-200">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-white/60 hover:text-red-400 transition-colors pointer-events-auto">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[150px] bg-transparent text-[13px] text-[#0f172a] placeholder:text-slate-400 outline-none px-2 py-1.5"
                placeholder={value.length === 0 ? placeholder : "Thêm nhu cầu & Enter..."}
            />
        </div>
    );
};

function StartupInfoPageInner() {
    const { form, updateForm, logoFile, setLogoFile, profileLogoURL, setProfileLogoURL, loading } = useStartupProfile();
    const [industries, setIndustries] = useState<IIndustryFlat[]>([]);
    const [allIndustries, setAllIndustries] = useState<IIndustryFlat[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "overview";

    useEffect(() => {
        GetIndustriesFlat().then(data => {
            setAllIndustries(data);
            setIndustries(data.filter(i => i.parentIndustryID === null || i.parentIndustryID === undefined));
        }).catch(() => {});
    }, []);

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
        <div className="w-full bg-white rounded-[24px] border border-slate-200/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] p-8 relative overflow-hidden">
            {/* Background Pattern Decorative */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/80 via-white to-white pointer-events-none" />

            <div className="relative z-10">
                {activeTab === "overview" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Profile Header Input */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="shrink-0 flex flex-col gap-3">
                                <label className={labelCls}>Logo công ty</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="relative w-[120px] h-[120px] rounded-[22px] bg-slate-50 border border-slate-200/80 overflow-hidden cursor-pointer hover:border-slate-400 transition-all group flex items-center justify-center shadow-sm"
                                >
                                    {logoFile ? (
                                        <img src={URL.createObjectURL(logoFile)} alt="logo" className="w-full h-full object-cover" />
                                    ) : profileLogoURL ? (
                                        <img src={profileLogoURL} alt="Company" className="w-full h-full object-contain bg-white p-2" />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-slate-300 group-hover:scale-110 transition-transform" />
                                    )}
                                    <div className="absolute inset-0 bg-[#0f172a]/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white gap-1 backdrop-blur-sm">
                                        <Camera className="w-5 h-5" />
                                        <span className="text-[10px] font-semibold tracking-wide">THAY ẢNH</span>
                                    </div>
                                </div>
                                {(logoFile || profileLogoURL) && (
                                    <button
                                        type="button"
                                        onClick={() => { setLogoFile(null); setProfileLogoURL(""); }}
                                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 py-1.5 px-3 rounded-lg transition-colors w-full text-center"
                                    >
                                        Chức năng Xóa
                                    </button>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>

                            <div className="flex-1 space-y-5 w-full">
                                <div>
                                    <label className={labelCls}>Tên startup / Dự án <span className="text-red-500">*</span></label>
                                    <input
                                        name="companyName"
                                        value={form.companyName || ""}
                                        onChange={(e) => updateForm("companyName", e.target.value)}
                                        className={inputCls}
                                        placeholder="Tên chính thức hiển thị"
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Tagline / Khẩu hiệu <span className="text-red-500">*</span></label>
                                    <input
                                        name="oneLiner"
                                        value={form.oneLiner || ""}
                                        onChange={(e) => updateForm("oneLiner", e.target.value)}
                                        className={inputCls}
                                        placeholder="Mô tả công ty bạn trong một câu ngắn gọn..."
                                        maxLength={100}
                                    />
                                    <div className="flex justify-end mt-1.5"><span className="text-[11px] text-slate-400 font-medium">{(form.oneLiner || "").length}/100</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 w-full" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Lĩnh vực chính (Industry)</label>
                                <select
                                    name="industryID"
                                    value={form.industryID || ""}
                                    onChange={(e) => updateForm("industryID", e.target.value)}
                                    className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[position:right_16px_center]")}
                                >
                                    <option value="">Chọn lĩnh vực</option>
                                    {industries.map(ind => (
                                        <option key={ind.industryID} value={ind.industryID.toString()}>{ind.industryName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Lĩnh vực phụ (Sub-Industry)</label>
                                <select
                                    name="subIndustry"
                                    value={form.subIndustry || ""}
                                    onChange={(e) => updateForm("subIndustry", e.target.value)}
                                    disabled={!form.industryID}
                                    className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[position:right_16px_center] disabled:opacity-50 disabled:cursor-not-allowed")}
                                >
                                    <option value="">{form.industryID ? "Chọn lĩnh vực phụ" : "Chọn lĩnh vực chính trước"}</option>
                                    {allIndustries
                                        .filter(i => i.parentIndustryID === Number(form.industryID))
                                        .map(i => (
                                            <option key={i.industryID} value={i.industryName}>{i.industryName}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Giai đoạn phát triển <span className="text-red-500">*</span></label>
                                <select
                                    name="stage"
                                    value={form.stage || StartupStage.Idea.toString()}
                                    onChange={(e) => updateForm("stage", e.target.value)}
                                    className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[position:right_16px_center]")}
                                >
                                    <option value={StartupStage.Idea.toString()}>Hạt giống (Idea)</option>
                                    <option value={StartupStage.PreSeed.toString()}>Tiền ươm mầm (Pre-Seed)</option>
                                    <option value={StartupStage.Seed.toString()}>Ươm mầm (Seed)</option>
                                    <option value={StartupStage.SeriesA.toString()}>Series A</option>
                                    <option value={StartupStage.SeriesB.toString()}>Series B</option>
                                    <option value={StartupStage.SeriesC.toString()}>Series C+</option>
                                    <option value={StartupStage.Growth.toString()}>Tăng trưởng (Growth)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Quy mô nhân sự (Team Size)</label>
                                <input
                                    type="number"
                                    min="1"
                                    name="teamSize"
                                    value={form.teamSize || ""}
                                    onChange={(e) => updateForm("teamSize", e.target.value)}
                                    className={inputCls}
                                    placeholder="Ví dụ: 10"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Mô tả công ty (Description)</label>
                                <textarea
                                    name="description"
                                    value={form.description || ""}
                                    onChange={(e) => updateForm("description", e.target.value)}
                                    rows={5}
                                    className={cn(inputCls, "resize-none")}
                                    placeholder="Giới thiệu nhanh lịch sử, tầm nhìn, và giá trị cốt lõi..."
                                />
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <label className={labelCls}>Nhu cầu tìm kiếm hiện tại (Current Needs)</label>
                            <p className="text-[11px] text-slate-400 mb-3 font-medium">Hiển thị dạng huy hiệu (badge) cho nhà đầu tư dễ nắm bắt. (Ví dụ: Marketing, Tech, Funding...)</p>
                            <TagsInput
                                value={form.currentNeeds || []}
                                onChange={(val) => updateForm("currentNeeds", val)}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Lực kéo tóm tắt (Traction / Metrics)</label>
                            <input
                                name="metricSummary"
                                value={form.metricSummary || ""}
                                onChange={(e) => updateForm("metricSummary", e.target.value)}
                                className={inputCls}
                                placeholder="VD: Đạt 10K MAU, $5K MRR, Tăng trưởng 20% tháng..."
                            />
                            <p className="text-[11px] text-slate-400 mt-2 font-medium">Báo cáo nhanh những con số nổi bật nhất của dự án để thu hút nhà đầu tư trên Overview.</p>
                        </div>
                    </div>
                )}

                {activeTab === "business" && (
                    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Vấn đề cốt lõi (Problem)</label>
                                <textarea
                                    name="problemStatement"
                                    value={form.problemStatement || ""}
                                    onChange={(e) => updateForm("problemStatement", e.target.value)}
                                    rows={4}
                                    className={cn(inputCls, "resize-none")}
                                    placeholder="Nỗi đau lớn nhất khách hàng đang gặp phải..."
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Giải pháp (Solution)</label>
                                <textarea
                                    name="solutionSummary"
                                    value={form.solutionSummary || ""}
                                    onChange={(e) => updateForm("solutionSummary", e.target.value)}
                                    rows={4}
                                    className={cn(inputCls, "resize-none")}
                                    placeholder="Sản phẩm của bạn giải quyết nỗi đau đó như thế nào..."
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Thị trường mục tiêu (Market Scope)</label>
                                <select
                                    name="marketScope"
                                    value={form.marketScope || ""}
                                    onChange={(e) => updateForm("marketScope", e.target.value)}
                                    className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[position:right_16px_center]")}
                                >
                                    <option value="">Chọn loại hình</option>
                                    <option value="B2B">B2B (Business to Business)</option>
                                    <option value="B2C">B2C (Business to Consumer)</option>
                                    <option value="B2B2C">B2B2C</option>
                                    <option value="B2G">B2G (Business to Government)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Trạng thái sản phẩm (Product Status)</label>
                                <select
                                    name="productStatus"
                                    value={form.productStatus || ""}
                                    onChange={(e) => updateForm("productStatus", e.target.value)}
                                    className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[position:right_16px_center]")}
                                >
                                    <option value="">Chọn trạng thái</option>
                                    <option value="Đang phát triển">Đang phát triển</option>
                                    <option value="Bản mẫu (MVP)">Bản mẫu (MVP)</option>
                                    <option value="Thử nghiệm (Beta)">Thử nghiệm (Beta)</option>
                                    <option value="Đã ra mắt">Đã ra mắt (Launched)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "funding" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Mục tiêu gọi vốn ($ USD)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">$</span>
                                    <NumericFormat
                                        thousandSeparator=","
                                        decimalSeparator="."
                                        decimalScale={2}
                                        allowNegative={false}
                                        isAllowed={({ floatValue }) => !floatValue || floatValue <= 999999999999}
                                        value={form.targetFunding || ""}
                                        onValueChange={({ value }) => updateForm("targetFunding", value)}
                                        className={cn(inputCls, "pl-8 text-[15px] font-semibold tracking-wide")}
                                        placeholder="1,000,000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Đã huy động được ($ USD)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">$</span>
                                    <NumericFormat
                                        thousandSeparator=","
                                        decimalSeparator="."
                                        decimalScale={2}
                                        allowNegative={false}
                                        isAllowed={({ floatValue }) => !floatValue || floatValue <= 999999999999}
                                        value={form.raisedAmount || ""}
                                        onValueChange={({ value }) => updateForm("raisedAmount", value)}
                                        className={cn(inputCls, "pl-8 text-[15px] font-semibold tracking-wide")}
                                        placeholder="250,000"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 max-w-md">
                                <label className={labelCls}>Định giá công ty dự kiến ($ USD)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold z-10">$</span>
                                    <NumericFormat
                                        thousandSeparator=","
                                        decimalSeparator="."
                                        decimalScale={2}
                                        allowNegative={false}
                                        isAllowed={({ floatValue }) => !floatValue || floatValue <= 999999999999}
                                        value={form.valuation || ""}
                                        onValueChange={({ value }) => updateForm("valuation", value)}
                                        className={cn(inputCls, "pl-8 text-[15px] font-semibold tracking-wide")}
                                        placeholder="5,000,000"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-2 font-medium">Chỉ dành cho các dự án đã ước tính được Valuation Post-Money/Pre-Money rõ ràng.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "contact" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelCls}>Website dự án</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={form.website || ""}
                                    onChange={(e) => updateForm("website", e.target.value)}
                                    className={inputCls}
                                    placeholder="https://yourstartup.com"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Trang LinkedIn</label>
                                <input
                                    type="url"
                                    name="linkedInURL"
                                    value={form.linkedInURL || ""}
                                    onChange={(e) => updateForm("linkedInURL", e.target.value)}
                                    className={inputCls}
                                    placeholder="https://linkedin.com/company/abc"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Email liên hệ đại diện</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={form.contactEmail || ""}
                                    onChange={(e) => updateForm("contactEmail", e.target.value)}
                                    className={inputCls}
                                    placeholder="founder@yourstartup.com"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Hotline liên hệ (tuỳ chọn)</label>
                                <input
                                    name="contactPhone"
                                    value={form.contactPhone || ""}
                                    onChange={(e) => updateForm("contactPhone", e.target.value)}
                                    className={inputCls}
                                    placeholder="+84 999 000 000"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Ngày thành lập (theo giấy phép)</label>
                                <input
                                    type="date"
                                    name="foundedDate"
                                    value={form.foundedDate || ""}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => updateForm("foundedDate", e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Quốc gia (Country)</label>
                                <CountrySelect
                                    value={form.country || ""}
                                    onChange={(val) => updateForm("country", val)}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Tỉnh / Thành phố (Location)</label>
                                <input
                                    name="location"
                                    value={form.location || ""}
                                    onChange={(e) => updateForm("location", e.target.value)}
                                    className={inputCls}
                                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
export default function StartupInfoPage() {
    return (
        <Suspense>
            <StartupInfoPageInner />
        </Suspense>
    );
}