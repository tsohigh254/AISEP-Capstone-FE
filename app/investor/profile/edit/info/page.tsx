"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Building2, Camera, Loader2, ChevronDown } from "lucide-react";
import { getNames } from "country-list";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GetInvestorProfile, UpdateInvestorProfile, UploadInvestorPhoto } from "@/services/investor/investor.api";
import { useInvestorEdit } from "@/context/investor-edit-context";

const COUNTRIES = [
    "Viet Nam",
    ...getNames().filter(n => n !== "Viet Nam").sort((a, b) => a.localeCompare(b)),
];

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filtered = search.trim()
        ? COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))
        : COUNTRIES;

    const handleSelect = (country: string) => {
        onChange(country);
        setOpen(false);
        setSearch("");
    };

    const handleOpen = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 });
        }
        setOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
            ) { setOpen(false); setSearch(""); }
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
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-[10px] px-3 py-2 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900/10"
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
                                    value === c ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-700"
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
}

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

export default function InfoEditPage() {
    const { setSaveHandler, setIsSaving } = useInvestorEdit();

    const [isLoading, setIsLoading] = useState(true);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [investorTypeDisplay, setInvestorTypeDisplay] = useState("");
    const [form, setForm] = useState<IUpdateInvestorProfile>({});

    useEffect(() => {
        GetInvestorProfile()
            .then(res => {
                const data = res as unknown as IBackendRes<IInvestorProfile>;
                if (data.isSuccess && data.data) {
                    const p = data.data;
                    setForm({
                        fullName: p.fullName || "",
                        firmName: p.firmName || p.organization || "",
                        title: p.title || "",
                        country: p.country || "",
                        location: p.location || "",
                        website: p.website || "",
                        linkedInURL: p.linkedInURL || "",
                    });
                    if (p.profilePhotoURL) setLogoPreview(p.profilePhotoURL);
                    const typeLabel = p.investorType === "INSTITUTIONAL" ? "Quỹ đầu tư (VC / CVC)"
                        : p.investorType === "INDIVIDUAL_ANGEL" ? "Angel Investor"
                        : p.investorType || "Chưa xác định";
                    setInvestorTypeDisplay(typeLabel);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const tasks: Promise<any>[] = [UpdateInvestorProfile(form)];
            if (photoFile) tasks.push(UploadInvestorPhoto(photoFile));

            const [profileRes] = await Promise.all(tasks);
            const data = profileRes as unknown as IBackendRes<IInvestorProfile>;
            if (data.isSuccess) {
                toast.success("Đã cập nhật thông tin cơ bản");
                setPhotoFile(null); // clear pending file sau khi upload
            } else {
                toast.error(data.message || "Cập nhật thất bại");
            }
        } catch {
            toast.error("Gặp lỗi khi cập nhật");
        } finally {
            setIsSaving(false);
        }
    }, [form, photoFile, setIsSaving]);

    useEffect(() => {
        setSaveHandler(handleSave);
    }, [handleSave, setSaveHandler]);

    const set = (key: keyof IUpdateInvestorProfile, val: string) =>
        setForm(prev => ({ ...prev, [key]: val }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-6 h-6 animate-spin text-[#e6cc4c]" />
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-400">
            {/* Logo */}
            <FormSection title="Logo cá nhân / Quỹ">
                <div className="flex items-center gap-6">
                    <label className="relative w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 transition-all group flex-shrink-0">
                        {logoPreview
                            ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-7 h-7 text-slate-300 group-hover:text-slate-400 transition-colors" /></div>
                        }
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <input
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) {
                                    setPhotoFile(f);
                                    setLogoPreview(URL.createObjectURL(f));
                                }
                            }}
                        />
                    </label>
                    <div>
                        <p className="text-[13px] font-medium text-slate-700">Ảnh đại diện / Logo</p>
                        <p className="text-[11px] text-slate-400 mt-1">PNG, JPG · Tối đa 5MB</p>
                        {photoFile && (
                            <p className="text-[11px] text-amber-600 font-medium mt-1.5">
                                Ảnh mới chờ lưu: {photoFile.name}
                            </p>
                        )}
                    </div>
                </div>
            </FormSection>

            <FormSection title="Thông tin tổ chức / cá nhân">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Tên Nhà đầu tư / Quỹ <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            value={form.fullName || ""}
                            onChange={e => set("fullName", e.target.value)}
                            className={inputCls}
                            placeholder="Tên chính thức"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Loại hình đầu tư</label>
                        <div className={cn(inputCls, "flex items-center justify-between bg-slate-100 cursor-not-allowed text-slate-500")}>
                            <span>{investorTypeDisplay || "Chưa xác định"}</span>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md">Không thể đổi</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">Được thiết lập khi đăng ký, liên hệ hỗ trợ để thay đổi.</p>
                    </div>
                    <div>
                        <label className={labelCls}>Tổ chức trực thuộc</label>
                        <input
                            type="text"
                            value={form.firmName || ""}
                            onChange={e => set("firmName", e.target.value)}
                            className={inputCls}
                            placeholder="Tên tổ chức (nếu có)"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Chức vụ (Role / Title)</label>
                        <input
                            type="text"
                            value={form.title || ""}
                            onChange={e => set("title", e.target.value)}
                            className={inputCls}
                            placeholder="Vd: Partner, Director..."
                        />
                    </div>
                </div>
            </FormSection>

            <FormSection title="Liên hệ & Khu vực">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Quốc gia</label>
                        <CountrySelect
                            value={form.country || ""}
                            onChange={val => set("country", val)}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Tỉnh / Thành phố</label>
                        <input
                            type="text"
                            value={form.location || ""}
                            onChange={e => set("location", e.target.value)}
                            className={inputCls}
                            placeholder="Ví dụ: TP. Hồ Chí Minh"
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Website</label>
                        <input
                            type="url"
                            value={form.website || ""}
                            onChange={e => set("website", e.target.value)}
                            className={inputCls}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className={labelCls}>LinkedIn</label>
                        <input
                            type="url"
                            value={form.linkedInURL || ""}
                            onChange={e => set("linkedInURL", e.target.value)}
                            className={inputCls}
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
