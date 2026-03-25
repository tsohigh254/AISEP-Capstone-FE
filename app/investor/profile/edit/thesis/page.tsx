"use client";

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

export default function ThesisEditPage() {
    return (
        <div className="space-y-5 animate-in fade-in duration-400">
            <FormSection title="Tiêu chí đầu tư (Thesis)">
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>Triết lý đầu tư ngắn gọn (Short Summary) <span className="text-red-400">*</span></label>
                        <textarea rows={3} defaultValue="Đầu tư vào các dự án công nghệ mang tính đột phá, mô hình rủi ro thấp và khả năng nhân rộng giải quyết các vấn đề cốt lõi tại khu vực Đông Nam Á." className={cn(inputCls, "resize-none")} placeholder="Tóm tắt trọng tâm đầu tư của bạn..." />
                    </div>

                    <div>
                        <label className={labelCls}>Ngành nghề quan tâm (Preferred Industries) <span className="text-red-400">*</span></label>
                        <textarea rows={2} defaultValue="SaaS, FinTech, HealthTech, AI & ML" className={cn(inputCls, "resize-none")} placeholder="Ví dụ: AI, Logistics, Fintech..." />
                        <p className="text-[11px] text-slate-400 mt-1.5">Phân tách mỗi ngành bằng dấu phẩy.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Giai đoạn ưu tiên (Stages) <span className="text-red-400">*</span></label>
                            <input type="text" defaultValue="Pre-Seed, Seed, Series A" className={inputCls} placeholder="Ví dụ: Pre-seed, Seed..." />
                        </div>
                        <div>
                            <label className={labelCls}>Khu vực địa lý ưu tiên</label>
                            <input type="text" defaultValue="Việt Nam, Đông Nam Á" className={inputCls} placeholder="Ví dụ: Việt Nam, Global..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Mô hình kinh doanh (Market Scopes)</label>
                            <input type="text" defaultValue="B2B, B2B2C, B2G" className={inputCls} placeholder="Ví dụ: B2B, B2C..." />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Giá trị gia tăng cung cấp (Support offered)</label>
                        <textarea rows={2} defaultValue="Phát triển mạng lưới, Tư vấn chiến lược, Tuyển dụng nhân sự cấp cao" className={cn(inputCls, "resize-none")} placeholder="Ví dụ: Mentorship, Network, C-level recruitment..." />
                        <p className="text-[11px] text-slate-400 mt-1.5">Các giá trị giúp startup ngoại trừ phần vốn (Capital).</p>
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
