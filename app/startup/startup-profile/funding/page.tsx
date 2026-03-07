"use client";

import { useState } from "react";

export default function StartupFundingPage() {
    const [form, setForm] = useState({
        fundingStage: "",
        fundingNeeded: "",
        fundingRaised: "",
        valuation: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <section className="bg-white rounded-[24px] shadow-sm border border-neutral-surface overflow-hidden">
                <div className="p-8 border-b border-neutral-surface bg-[#fdfbe9]/30">
                    <h3 className="font-black text-[#171611] text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#e6cc4c]">payments</span>
                        Thông tin gọi vốn
                    </h3>
                    <p className="text-sm text-neutral-muted mt-1 font-medium">Cung cấp các thông số tài chính để nhà đầu tư có cái nhìn tổng quan về nhu cầu vốn của bạn.</p>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#171611]">
                                Giai đoạn gọi vốn <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="fundingStage"
                                value={form.fundingStage}
                                onChange={handleChange}
                                className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all appearance-none"
                            >
                                <option value="">Chọn giai đoạn</option>
                                <option value="seed">Seed</option>
                                <option value="pre-seed">Pre-Seed</option>
                                <option value="series-a">Series A</option>
                                <option value="series-b">Series B</option>
                            </select>
                            <p className="text-[11px] text-neutral-muted font-bold">Giai đoạn hiện tại của vòng gọi vốn này.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#171611]">
                                Số vốn cần huy động (USD) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    name="fundingNeeded"
                                    type="number"
                                    placeholder="Ví dụ: 500000"
                                    value={form.fundingNeeded}
                                    onChange={handleChange}
                                    className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all pr-12"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-muted font-black text-sm">$</span>
                            </div>
                            <p className="text-[11px] text-neutral-muted font-bold">Tổng số vốn bạn đang tìm kiếm từ các nhà đầu tư.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#171611]">
                                Số vốn đã huy động được (USD)
                            </label>
                            <div className="relative">
                                <input
                                    name="fundingRaised"
                                    type="number"
                                    placeholder="Ví dụ: 100000"
                                    value={form.fundingRaised}
                                    onChange={handleChange}
                                    className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all pr-12"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-muted font-black text-sm">$</span>
                            </div>
                            <p className="text-[11px] text-neutral-muted font-bold">Số vốn đã cam kết hoặc đã nhận được tính đến hiện tại.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-[#171611]">
                                Định giá công ty (Valuation) (USD)
                            </label>
                            <div className="relative">
                                <input
                                    name="valuation"
                                    type="number"
                                    placeholder="Ví dụ: 2000000"
                                    value={form.valuation}
                                    onChange={handleChange}
                                    className="w-full bg-[#f8f8f6] border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#171611] focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all pr-12"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-muted font-black text-sm">$</span>
                            </div>
                            <p className="text-[11px] text-neutral-muted font-bold">Định giá Pre-money hoặc Post-money dự kiến.</p>
                        </div>
                    </div>
                    <div className="bg-[#fdfbe9] border border-[#e6cc4c]/20 p-5 rounded-2xl flex gap-3">
                        <span className="material-symbols-outlined text-[#e6cc4c]">info</span>
                        <p className="text-xs text-neutral-muted leading-relaxed font-bold italic">
                            Các trường có dấu <span className="text-red-500">*</span> là thông tin bắt buộc để hồ sơ có thể được gửi duyệt. Thông tin tài chính chính xác sẽ giúp AI của AISEP đánh giá startup của bạn tốt hơn.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
