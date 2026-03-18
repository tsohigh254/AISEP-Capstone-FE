"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info, ShieldCheck, FileText, File, CheckCircle2, Trash2, IdCard, X, Shield } from "lucide-react";

export default function StartupKYCPage() {
    const [mst, setMst] = useState("0101234567");
    const [representative, setRepresentative] = useState("Nguyễn Văn Alpha");

    return (
        <div className="space-y-6">
            <div className="bg-[#fdfbe9] border border-[#e6cc4c]/20 p-5 rounded-[24px] flex items-start gap-4 shadow-sm">
                <Info className="w-5 h-5 text-[#e6cc4c] mt-0.5" />
                <p className="text-sm text-[#171611] font-black leading-relaxed">
                    Hồ sơ KYC chưa được thiết lập. Vui lòng cung cấp thông tin pháp lý để tăng tính minh bạch.
                </p>
            </div>

            <section className="bg-white rounded-[24px] shadow-sm border border-neutral-surface overflow-hidden">
                <div className="p-6 border-b border-neutral-surface flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#e6cc4c]" />
                    <h3 className="font-black text-[#171611] text-lg">Thông tin định danh doanh nghiệp</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Mã số thuế (MST) <span className="text-red-500">*</span></label>
                        <input
                            value={mst}
                            onChange={(e) => setMst(e.target.value)}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                            placeholder="Ví dụ: 0101234567"
                        />
                        <p className="text-[11px] text-neutral-muted font-bold">Mã số doanh nghiệp 10 số theo giấy đăng ký kinh doanh.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Người đại diện pháp luật <span className="text-red-500">*</span></label>
                        <input
                            value={representative}
                            onChange={(e) => setRepresentative(e.target.value)}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                            placeholder="Họ và tên người đại diện"
                        />
                        <p className="text-[11px] text-neutral-muted font-bold">Ghi chính xác như trên giấy phép kinh doanh.</p>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-[24px] shadow-sm border border-neutral-surface overflow-hidden">
                <div className="p-6 border-b border-neutral-surface">
                    <h3 className="font-black text-[#171611] text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#e6cc4c]" />
                        Tài liệu pháp lý
                    </h3>
                    <p className="text-sm text-neutral-muted mt-1 font-bold italic">Tải lên các bản quét (scan) hoặc ảnh chụp rõ nét của tài liệu gốc.</p>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <label className="text-sm font-black text-[#171611]">Giấy phép kinh doanh (GPKD) <span className="text-red-500">*</span></label>
                            <span className="text-[10px] font-black text-neutral-muted bg-neutral-surface px-3 py-1 rounded-full uppercase tracking-widest">PDF, JPG, PNG • MAX 10MB</span>
                        </div>
                        <div className="border border-neutral-surface rounded-[24px] p-5 bg-white shadow-sm flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#fdfbe9] rounded-2xl flex items-center justify-center border-2 border-[#e6cc4c]/10 shadow-sm">
                                    <File className="w-7 h-7 text-[#e6cc4c]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-[#171611] truncate uppercase tracking-tighter">GPKD_TechAlpha.pdf</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[11px] text-neutral-muted font-black uppercase">2.4 MB</span>
                                        <span className="w-1 h-1 bg-neutral-muted/30 rounded-full"></span>
                                        <span className="text-[10px] font-black text-green-600 flex items-center gap-1 uppercase tracking-widest">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Đã tải lên
                                        </span>
                                    </div>
                                </div>
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="w-full h-2 bg-[#f8f8f6] rounded-full overflow-hidden border border-neutral-surface/30">
                                <div className="h-full bg-[#171611]/10 w-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <label className="text-sm font-black text-[#171611]">CCCD người đại diện <span className="text-red-500">*</span></label>
                            <span className="text-[10px] font-black text-neutral-muted bg-neutral-surface px-3 py-1 rounded-full uppercase tracking-widest">PDF, JPG, PNG • MAX 10MB</span>
                        </div>
                        <div className="border-2 border-dashed border-neutral-surface rounded-[24px] p-8 flex flex-col items-center justify-center bg-[#f8f8f6]/30 hover:bg-[#fdfbe9]/40 hover:border-[#e6cc4c]/40 transition-all cursor-pointer group group/dropzone">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md mb-4 group-hover/dropzone:scale-110 transition-transform duration-300 border border-neutral-surface/50">
                                <IdCard className="w-7 h-7 text-[#e6cc4c]" />
                            </div>
                            <p className="text-[15px] font-black text-[#171611] text-center tracking-tight">Tải lên hoặc kéo thả CCCD/CMND</p>
                            <p className="text-[11px] text-neutral-muted text-center mt-1.5 font-bold italic opacity-70">Mặt trước và mặt sau đính kèm chung 1 tệp</p>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-1 space-y-4 mt-2">
                        <div className="flex items-end justify-between">
                            <label className="text-sm font-black text-[#171611]">Điều lệ Công ty <span className="text-neutral-muted font-medium">(Không bắt buộc)</span></label>
                        </div>
                        <div className="border border-neutral-surface rounded-[24px] p-5 bg-white shadow-sm flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-neutral-surface rounded-2xl flex items-center justify-center opacity-60">
                                    <FileText className="w-7 h-7 text-neutral-muted" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-[#171611] truncate uppercase tracking-tighter opacity-70">Dieu_le_Startup.pdf</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[11px] text-neutral-muted font-black uppercase">4.1 MB</span>
                                        <span className="w-1 h-1 bg-neutral-muted/30 rounded-full"></span>
                                        <span className="text-[10px] font-black text-[#e6cc4c] flex items-center gap-1 uppercase tracking-widest animate-pulse">
                                            Đang tải lên 65%...
                                        </span>
                                    </div>
                                </div>
                                <button className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-muted hover:bg-neutral-surface transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="w-full h-2 bg-[#f8f8f6] rounded-full overflow-hidden border border-neutral-surface/30">
                                <div className="h-full bg-[#e6cc4c] w-[65%] transition-all duration-500 ease-out"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 flex items-start gap-2 max-w-2xl">
                    <Shield className="w-5 h-5 text-neutral-muted opacity-60" />
                    <p className="text-[11px] text-neutral-muted font-bold italic leading-relaxed opacity-70">
                        Mọi thông tin bạn cung cấp sẽ được mã hóa và bảo mật tuyệt đối theo chính sách quyền riêng tư của AISEP. Chúng tôi chỉ sử dụng cho mục đích xác thực tính chính danh của Startup.
                    </p>
                </div>
            </section>
        </div>
    );
}
