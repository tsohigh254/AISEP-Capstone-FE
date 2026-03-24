"use client";

import { useState, useRef } from "react";
import { Building2, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const fileRef = useRef<HTMLInputElement>(null);
    const [logo, setLogo] = useState<string | null>(null);

    return (
        <div className="space-y-5 animate-in fade-in duration-400">
            {/* Logo */}
            <FormSection title="Logo cá nhân / Quỹ">
                <div className="flex items-center gap-6">
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="relative w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 transition-all group flex-shrink-0"
                    >
                        {logo
                            ? <img src={logo} alt="logo" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-7 h-7 text-slate-300 group-hover:text-slate-400 transition-colors" /></div>
                        }
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-medium hover:bg-slate-700 transition-colors">
                            Chọn ảnh
                        </button>
                        <p className="text-[11px] text-slate-400 mt-1.5">PNG, JPG, WEBP · Tối đa 5MB</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setLogo(URL.createObjectURL(f)); }} />
                </div>
            </FormSection>

            <FormSection title="Thông tin tổ chức / cá nhân">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Tên Nhà đầu tư / Quỹ <span className="text-red-400">*</span></label>
                        <input type="text" defaultValue="VinaCapital Ventures" className={inputCls} placeholder="Tên chính thức" />
                    </div>
                    <div>
                        <label className={labelCls}>Loại hình đầu tư <span className="text-red-400">*</span></label>
                        <select className={inputCls} defaultValue="vc">
                            <option value="vc">Quỹ đầu tư (VC)</option>
                            <option value="angel">Angel Investor</option>
                            <option value="cve">Corporate Venture Capital</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Tổ chức trực thuộc</label>
                        <input type="text" defaultValue="Tập đoàn VinaCapital" className={inputCls} placeholder="Tên tổ chức (nếu có)" />
                    </div>
                    <div>
                        <label className={labelCls}>Chức vụ (Role / Title)</label>
                        <input type="text" defaultValue="Investment Director" className={inputCls} placeholder="Vd: Partner, Director..." />
                    </div>
                </div>
            </FormSection>

            <FormSection title="Liên hệ & Khu vực">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelCls}>Khu vực / Vị trí <span className="text-red-400">*</span></label>
                        <input type="text" defaultValue="TP. Hồ Chí Minh, Việt Nam" className={inputCls} placeholder="Địa chỉ hoặc khu vực hoạt động chính" />
                    </div>
                    <div>
                        <label className={labelCls}>Website</label>
                        <input type="url" defaultValue="https://vinacapital.com" className={inputCls} placeholder="https://..." />
                    </div>
                    <div>
                        <label className={labelCls}>LinkedIn</label>
                        <input type="url" className={inputCls} placeholder="https://linkedin.com/in/..." />
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
