"use client";

import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all";
const labelCls = "block text-[12px] font-medium text-slate-500 mb-1.5";

function FormSection({ title, children, isPrivate = false }: { title: string; children: React.ReactNode, isPrivate?: boolean }) {
    return (
        <div className={cn("bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden relative", isPrivate && "border-purple-200/50")}>
            {isPrivate && (
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                    <Lock className="w-48 h-48 text-purple-900" />
                </div>
            )}
            <div className={cn("px-6 py-4 border-b border-slate-100 flex items-center justify-between relative z-10", isPrivate && "bg-purple-50/30")}>
                <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                    {isPrivate && <Lock className="w-3.5 h-3.5 text-purple-600" />}
                    {title}
                </h3>
            </div>
            <div className="p-6 relative z-10">{children}</div>
        </div>
    );
}

export default function MatchingEditPage() {
    return (
        <div className="space-y-5 animate-in fade-in duration-400">
            <FormSection title="Cấu hình hệ thống gợi ý AI" isPrivate>
                <div className="space-y-4">
                    <p className="text-[13px] text-slate-500 mb-6 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <strong className="text-purple-800 font-semibold block mb-1">Thiết lập bộ lọc độc quyền</strong>
                        Những phần thiết lập này chỉ dành cho hệ thống phân tích AI. Startup sẽ <strong>không nhìn thấy</strong> thông tin này trên hồ sơ công khai của bạn.
                    </p>
                    
                    <div>
                        <label className={labelCls}>Mức độ hoàn thiện Sản phẩm (Product Maturity)</label>
                        <input type="text" defaultValue="Có MVP, Đã ra mắt (Launched)" className={inputCls} placeholder="Ví dụ: MVP, Launched..." />
                    </div>

                    <div>
                        <label className={labelCls}>Mức độ kiểm chứng thị trường (Validation Level)</label>
                        <input type="text" defaultValue="Có tập khách hàng trả phí hoặc doanh thu bước đầu" className={inputCls} placeholder="Ví dụ: Có doanh thu, Đã gọi vốn..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Ngưỡng điểm AI tối thiểu (AI Score Range)</label>
                            <select className={inputCls} defaultValue="75">
                                <option value="75">Trên 75 điểm (Khuyên dùng)</option>
                                <option value="80">Trên 80 điểm (Khắt khe)</option>
                                <option value="60">Trên 60 điểm (Tiềm năng)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Mức độ quan trọng (Importance)</label>
                            <select className={inputCls} defaultValue="high">
                                <option value="high">Cực kỳ quan trọng (Tiên quyết)</option>
                                <option value="medium">Làm thông tin tham khảo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Điểm mạnh trọng yếu (Preferred Strengths)</label>
                        <textarea rows={2} defaultValue="Đội ngũ Founder xuất sắc, Lợi thế dữ liệu (Data Moat), Thị trường tăng trưởng nhanh" className={cn(inputCls, "resize-none")} placeholder="Các yếu tố được hệ thống AI ưu tiên quét..." />
                        <p className="text-[11px] text-slate-400 mt-1.5">Hệ thống AI sẽ quét các keyword này trong hồ sơ của Startup.</p>
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
