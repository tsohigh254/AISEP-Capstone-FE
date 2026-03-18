"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info, Layers, Globe } from "lucide-react";

export default function StartupInfoPage() {
    const [form, setForm] = useState({
        companyName: "TechAlpha Co.",
        oneLiner: "Giải pháp AI toàn diện cho doanh nghiệp SMEs",
        description: "Chúng tôi cung cấp các giải pháp trí tuệ nhân tạo giúp tự động hóa quy trình vận hành và tối ưu hóa chi phí cho các doanh nghiệp vừa và nhỏ tại khu vực Đông Nam Á.",
        industry: "SaaS",
        secondaryIndustry: "Artificial Intelligence",
        stage: "Sản phẩm thử nghiệm (MVP)",
        foundedDate: "2023-01-15",
        teamSize: "12",
        address: "Toà nhà Innovation, Công viên phần mềm Quang Trung",
        country: "VN",
        website: "https://techalpha.ai"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            {/* General Info Section */}
            <section className="bg-white rounded-[24px] shadow-sm border border-neutral-surface overflow-hidden">
                <div className="p-6 border-b border-neutral-surface bg-[#fdfbe9]/30 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#e6cc4c]" />
                    <h3 className="font-black text-[#171611] text-lg">Thông tin chung</h3>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Tên công ty <span className="text-red-500">*</span></label>
                        <input
                            name="companyName"
                            value={form.companyName}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                            placeholder="Nhập tên chính thức của startup"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">One-liner <span className="text-red-500">*</span></label>
                        <input
                            name="oneLiner"
                            value={form.oneLiner}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                            placeholder="Mô tả ngắn gọn về startup trong 1 câu"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Mô tả chi tiết <span className="text-red-500">*</span></label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all resize-none"
                            placeholder="Giới thiệu chi tiết về sản phẩm, giải pháp và tầm nhìn..."
                        />
                    </div>
                </div>
            </section>

            {/* Industry & Stage Section */}
            <section className="bg-white rounded-[24px] shadow-sm border border-neutral-surface overflow-hidden">
                <div className="p-6 border-b border-neutral-surface bg-[#fdfbe9]/30 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#e6cc4c]" />
                    <h3 className="font-black text-[#171611] text-lg">Ngành & giai đoạn</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Ngành nghề <span className="text-red-500">*</span></label>
                        <select
                            name="industry"
                            value={form.industry}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                        >
                            <option value="SaaS">SaaS</option>
                            {/* Add more options as in mockup */}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Ngành phụ</label>
                        <input
                            name="secondaryIndustry"
                            value={form.secondaryIndustry}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                            placeholder="Ví dụ: AI, Blockchain"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Giai đoạn <span className="text-red-500">*</span></label>
                        <select
                            name="stage"
                            value={form.stage}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                        >
                            <option value="Sản phẩm thử nghiệm (MVP)">Sản phẩm thử nghiệm (MVP)</option>
                            {/* Add more options as in mockup */}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Ngày thành lập <span className="text-red-500">*</span></label>
                        <input
                            name="foundedDate"
                            type="date"
                            value={form.foundedDate}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-black text-[#171611]">Quy mô team <span className="text-red-500">*</span></label>
                        <input
                            name="teamSize"
                            type="number"
                            value={form.teamSize}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                            placeholder="Số lượng nhân sự hiện tại"
                        />
                    </div>
                </div>
            </section>

            {/* Location & Links Section */}
            <section className="bg-white rounded-[24px] shadow-sm border border-neutral-surface overflow-hidden">
                <div className="p-6 border-b border-neutral-surface bg-[#fdfbe9]/30 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#e6cc4c]" />
                    <h3 className="font-black text-[#171611] text-lg">Địa điểm & liên kết</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-black text-[#171611]">Địa chỉ văn phòng <span className="text-red-500">*</span></label>
                        <input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                            placeholder="Số nhà, tên đường, quận/huyện..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Quốc gia <span className="text-red-500">*</span></label>
                        <select
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                        >
                            <option value="VN">Việt Nam</option>
                            <option value="SG">Singapore</option>
                            <option value="US">Hoa Kỳ</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-[#171611]">Website <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-muted w-5 h-5" />
                            <input
                                name="website"
                                type="url"
                                value={form.website}
                                onChange={handleChange}
                                className="w-full bg-[#f8f8f6] border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all"
                                placeholder="https://techalpha.ai"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
