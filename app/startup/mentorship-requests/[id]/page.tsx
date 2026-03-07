"use client";

import React from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import Link from "next/link";
import {
    ChevronRight,
    Edit3,
    Video,
    Clock,
    DollarSign,
    MessageSquare,
    HelpCircle,
    CheckCircle2,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function MentorshipRequestDetailsPage() {
    // Mock data for the request
    const request = {
        id: "REQ-2849",
        status: "CHỜ PHẢN HỒI",
        problemDescription: "Chúng tôi đang gặp khó khăn trong việc tối ưu hóa tỷ lệ chuyển đổi (Conversion Rate) từ người dùng dùng thử nghiệm sang thuê bao trả phí. Dù lượng Traffic hàng tháng tăng trưởng 20%, tỷ lệ chuyển đổi vẫn dậm chân ở mức 1.5%. Chúng tôi đã thử nghiệm nhiều phương án A/B testing cho trang giá cả nhưng chưa thấy hiệu quả rõ rệt.",
        questions: [
            "Làm thế nào để xác định được 'Aha moment' thực sự của người dùng trong giai đoạn Trial?",
            "Chiến lược giá Tiered Pricing hiện tại của chúng tôi có đang quá phức tạp cho người dùng mới không?",
            "Cách thiết lập hệ thống email automation hiệu quả để thúc đẩy nâng cấp tài khoản?"
        ],
        tags: ["SaaS Product", "Growth Strategy", "Monetization"],
        advisor: {
            name: "Nguyễn Minh Quân",
            title: "Head of Product tại TechGlobal",
            rating: 4.9,
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhY2B_40T_b8ifCFhZYE9RUfdodTMIq4hkMeAvPfCxdek8AhcikuKD11XDhYpXmtyvdSlnne2UWZDbdEO4TMXf17yrSsltdyX2-bBHPjbzbTxFQNPTgQkflvmeFd6QdGRvx0WBDDS0vnBvv-defpdnEB2zPF8-sAiLMhhfWCHe6M2UpyMAwTRdjcu8xSEmKOJ3aGlWMMK40SM6ThVvCpVFz_jvRfcX6dDBi4rDUGiVvfrUIHpezyewWd_4dYD9EbKusdQxomMZQhk"
        },
        meeting: {
            type: "Online (Google Meet)",
            duration: "60 phút",
            fee: "$50"
        },
        history: [
            {
                status: "Đang xem xét",
                note: "Hệ thống đã thông báo cho chuyên gia. Đang chờ xác nhận buổi hẹn.",
                time: "14:30 • 24 THÁNG 05, 2024",
                active: true
            },
            {
                status: "Gửi yêu cầu thành công",
                note: "Yêu cầu Mentorship đã được tạo và gửi đến Nguyễn Minh Quân.",
                time: "09:15 • 24 THÁNG 05, 2024",
                active: false
            }
        ]
    };

    return (
        <StartupShell>
            <div className="max-w-[1440px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
                {/* Breadcrumbs & Status */}
                <div className="flex items-center justify-between">
                    <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400">
                        <Link href="/startup" className="hover:text-slate-600 transition-colors">Workspace</Link>
                        <ChevronRight className="size-4 text-slate-300" />
                        <Link href="/startup/experts" className="hover:text-slate-600 transition-colors">Yêu cầu Mentorship</Link>
                        <ChevronRight className="size-4 text-slate-300" />
                        <span className="text-slate-600 font-semibold uppercase tracking-tight">Chi tiết yêu cầu #{request.id}</span>
                    </nav>
                    <div className="px-3.5 py-1.5 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-full">
                        <span className="text-[11px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-[0.1em]">{request.status}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Challenge Details Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#eec54e] text-[22px]">settings</span>
                                    </div>
                                    <h2 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">Chi tiết thách thức</h2>
                                </div>
                                <button className="flex items-center gap-2 text-[13px] font-black text-slate-500 hover:text-slate-900 transition-colors">
                                    <Edit3 className="size-4" />
                                    <span>Chỉnh sửa nội dung</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-4">Mô tả vấn đề</h4>
                                    <p className="text-[16px] text-slate-600 dark:text-slate-300 font-medium leading-[1.8]">{request.problemDescription}</p>
                                </div>

                                <div>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-4">Các câu hỏi cụ thể cho chuyên gia</h4>
                                    <div className="space-y-3">
                                        {request.questions.map((q, i) => (
                                            <div key={i} className="flex gap-4 p-5 bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-800 shadow-sm">
                                                <div className="size-6 shrink-0 rounded-full bg-yellow-400 flex items-center justify-center text-[12px] font-black text-white">{i + 1}</div>
                                                <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{q}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4">
                                    {request.tags.map(tag => (
                                        <span key={tag} className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-[12px] font-black text-slate-600 dark:text-slate-400 tracking-tight">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Status History Timeline Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="size-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#eec54e] text-[22px]">history</span>
                                </div>
                                <h2 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">Lịch sử cập nhật trạng thái</h2>
                            </div>

                            <div className="space-y-12 pl-4">
                                {request.history.map((item, i) => (
                                    <div key={i} className="relative pl-10">
                                        {i < request.history.length - 1 && (
                                            <div className="absolute left-3 top-6 bottom-[-24px] w-px bg-slate-100 dark:bg-slate-800" />
                                        )}
                                        <div className={cn(
                                            "absolute left-0 top-1.5 size-6 rounded-full border-4 border-white dark:border-slate-900 shadow-sm",
                                            item.active ? "bg-blue-400" : "bg-yellow-400"
                                        )} />
                                        <div>
                                            <h4 className="text-[16px] font-black text-slate-900 dark:text-white leading-none mb-2">{item.status}</h4>
                                            <p className="text-[14px] font-medium text-slate-500 leading-relaxed">{item.note}</p>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-80">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Advisor Profile Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Chuyên gia tiếp nhận</h4>
                            <div className="flex items-center gap-4 mb-8">
                                <img src={request.advisor.avatar} alt={request.advisor.name} className="size-[64px] rounded-2xl object-cover border-2 border-slate-50 dark:border-slate-800" />
                                <div>
                                    <h3 className="text-[18px] font-bold text-slate-900 dark:text-white leading-tight">{request.advisor.name}</h3>
                                    <p className="text-[12px] text-slate-500 font-medium mt-1">{request.advisor.title}</p>
                                    <div className="flex items-center gap-1 mt-2">
                                        <span className="material-symbols-outlined text-yellow-400 text-[18px] fill-current">star</span>
                                        <span className="text-[13px] font-black text-slate-900 dark:text-white">{request.advisor.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full h-14 rounded-2xl border-2 border-slate-50 hover:border-[#eec54e]/20 hover:bg-[#eec54e]/5 bg-white text-slate-900 font-black text-[14px] transition-all gap-3 shadow-sm group">
                                <span className="material-symbols-outlined text-[20px] text-slate-900 group-hover:text-[#eec54e] transition-colors">chat_bubble</span>
                                <span>Nhắn tin cho chuyên gia</span>
                            </Button>
                        </div>

                        {/* Estimated Info Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Thông tin dự kiến</h4>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl border border-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                            <span className="material-symbols-outlined text-slate-400 text-[22px]">videocam</span>
                                        </div>
                                        <span className="text-[13px] font-bold text-slate-500">Hình thức</span>
                                    </div>
                                    <span className="text-[14px] font-black text-slate-900 dark:text-white">{request.meeting.type}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl border border-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                            <span className="material-symbols-outlined text-slate-400 text-[22px]">schedule</span>
                                        </div>
                                        <span className="text-[13px] font-bold text-slate-500">Thời lượng</span>
                                    </div>
                                    <span className="text-[14px] font-black text-slate-900 dark:text-white">{request.meeting.duration}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-yellow-50/50 dark:bg-yellow-500/5 rounded-2xl border border-yellow-100/50">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                            <span className="material-symbols-outlined text-[#eec54e] text-[22px]">payments</span>
                                        </div>
                                        <span className="text-[13px] font-bold text-slate-500">Phí tư vấn</span>
                                    </div>
                                    <span className="text-[20px] font-black text-slate-900 dark:text-white">{request.meeting.fee}</span>
                                </div>
                            </div>
                        </div>

                        {/* Help Box */}
                        <div className="bg-[#171611] rounded-[32px] p-8 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-yellow-400 text-[24px]">help</span>
                                <h3 className="text-[18px] font-bold">Trợ giúp</h3>
                            </div>
                            <p className="text-[13px] text-white/60 font-medium leading-relaxed mb-6">Chuyên gia thường phản hồi trong vòng 24-48h. Nếu có thắc mắc, vui lòng liên hệ CSKH.</p>
                            <Link href="#" className="inline-block text-[13px] font-black text-yellow-400 hover:text-yellow-300 underline underline-offset-4 transition-colors">Xem quy trình Mentoring</Link>
                        </div>
                    </div>
                </div>

                {/* Footer Credits */}
                <div className="text-center pt-10 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">© 2026 AISEP STARTUP WORKSPACE • HỆ THỐNG QUẢN LÝ CỐ VẤN & CHUYÊN GIA</p>
                </div>
            </div>
        </StartupShell>
    );
}
