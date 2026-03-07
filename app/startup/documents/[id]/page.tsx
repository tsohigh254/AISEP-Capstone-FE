"use client";

import { useParams, useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const versions = [
    {
        version: "v4.0.0",
        isCurrent: true,
        user: "Nguyễn Văn A",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        date: "Hôm nay, 15:30",
        status: "Verified",
    },
    {
        version: "v3.2.1",
        isCurrent: false,
        user: "Trần Thị B",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        date: "08/02/2026",
        status: "Verified",
    },
    {
        version: "v2.1.0",
        isCurrent: false,
        user: "Nguyễn Văn A",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        date: "01/02/2026",
        status: "Unverified",
    },
    {
        version: "v1.0.0",
        isCurrent: false,
        user: "Nguyễn Văn A",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        date: "12/01/2026",
        status: "Verified",
    },
];

export default function DocumentDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    return (
        <StartupShell>
            <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Link href="/startup" className="hover:text-primary transition-colors">Workspace</Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <Link href="/startup/documents" className="hover:text-primary transition-colors">Tài liệu & IP</Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-slate-600">Chi tiết tài liệu</span>
                </nav>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="size-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0 shadow-sm border border-red-100/50">
                            <span className="material-symbols-outlined text-4xl">picture_as_pdf</span>
                        </div>
                        <div className="space-y-1.5 min-w-0">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">Business_Plan_2026.pdf</h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-slate-500">
                                <span className="flex items-center gap-2 font-medium whitespace-nowrap">
                                    <span className="material-symbols-outlined text-lg opacity-60">person</span>
                                    Chủ sở hữu: <span className="text-slate-900 font-bold">Nguyễn Văn A (Founder)</span>
                                </span>
                                <span className="flex items-center gap-2 font-medium whitespace-nowrap">
                                    <span className="material-symbols-outlined text-lg opacity-60">calendar_today</span>
                                    Ngày tạo: <span className="text-slate-900 font-bold">12/01/2026</span>
                                </span>
                                <span className="flex items-center gap-2 font-medium whitespace-nowrap">
                                    <span className="material-symbols-outlined text-lg opacity-60">database</span>
                                    Dung lượng: <span className="text-slate-900 font-bold">4.8 MB</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-11 px-5 rounded-xl border-neutral-surface font-black text-[#171611] hover:bg-neutral-surface/50 flex items-center gap-2 transition-all">
                            <span className="material-symbols-outlined text-lg">share</span>
                            Chia sẻ
                        </Button>
                        <Button className="h-11 px-5 rounded-xl bg-[#e6cc4c] hover:bg-[#d4ba3d] text-[#171611] font-black shadow-lg shadow-[#e6cc4c]/10 flex items-center gap-2 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-lg font-black">upload</span>
                            Tải phiên bản mới
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Preview & IP Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[32px] border border-neutral-surface shadow-sm overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-neutral-surface bg-neutral-surface/20 flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-muted">Xem trước tài liệu</h3>
                                <span className="px-2 py-0.5 bg-neutral-surface rounded-md text-[10px] font-black text-neutral-muted">PDF</span>
                            </div>
                            <div className="aspect-[3/4] p-10 flex flex-col items-center justify-center text-center space-y-6 relative group">
                                <div className="size-24 bg-neutral-surface/50 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                                    <span className="material-symbols-outlined text-5xl text-neutral-muted/40">visibility_off</span>
                                </div>
                                <p className="text-sm font-bold text-neutral-muted max-w-[200px] leading-relaxed italic">Bản xem trước hiện không khả dụng cho tệp này.</p>
                                <Button className="bg-[#171611] hover:bg-black text-white px-8 h-12 rounded-2xl font-black text-sm flex items-center gap-2 transition-all">
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    Tải xuống tệp gốc
                                </Button>
                            </div>
                        </div>

                        {/* Blockchain IP Protection */}
                        <div className="bg-white rounded-[32px] border-2 border-[#10b981]/10 shadow-sm p-6 space-y-5 group hover:border-[#10b981]/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center text-[#10b981]">
                                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[#171611] tracking-tight">Bảo vệ IP (Blockchain)</h3>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 bg-[#10b981]/10 text-[#10b981] rounded-lg text-[9px] font-black uppercase tracking-wider">Đã xác thực</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] text-neutral-muted font-black uppercase tracking-widest pl-1">Mã Hash (SHA-256)</p>
                                    <div className="flex items-center gap-2 bg-neutral-surface/30 p-3 rounded-xl border border-neutral-surface/50 group-hover:border-[#10b981]/20 transition-all">
                                        <code className="text-[11px] font-black text-neutral-muted truncate flex-1 font-mono">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
                                        <button className="text-neutral-muted hover:text-[#e6cc4c] transition-colors"><span className="material-symbols-outlined text-base">content_copy</span></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-neutral-muted font-black uppercase tracking-widest pl-1">Thời gian ghi</p>
                                        <p className="text-xs font-black text-[#171611] pl-1">14/02/2026 - 15:30</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-neutral-muted font-black uppercase tracking-widest pl-1">Transaction Hash</p>
                                        <p className="text-xs font-black text-[#e6cc4c] hover:underline cursor-pointer transition-all pl-1 truncate">0x7a2...f4e2</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full h-10 rounded-xl bg-neutral-surface/40 hover:bg-neutral-surface transition-all font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">open_in_new</span>
                                Xem trên Blockchain Explorer
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Version History & Insights */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 tracking-tight">Lịch sử Phiên bản</h3>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Tổng số: 4 phiên bản</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Phiên bản</th>
                                            <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left whitespace-nowrap">Người cập nhật</th>
                                            <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left whitespace-nowrap">Ngày cập nhật</th>
                                            <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-left">Trạng thái IP</th>
                                            <th className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {versions.map((v, i) => (
                                            <tr key={v.version} className={cn("transition-colors", v.isCurrent ? "bg-[#e6cc4c]/5" : "hover:bg-neutral-surface/20")}>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900">{v.version}</span>
                                                        {v.isCurrent && (
                                                            <span className="px-2 py-0.5 bg-primary text-slate-900 text-[9px] font-bold uppercase rounded-md">Hiện tại</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-sm">
                                                            <img src={v.avatar} alt={v.user} className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{v.user}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{v.date}</span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight whitespace-nowrap",
                                                        v.status === "Verified" ? "bg-[#10b981]/10 text-[#10b981]" : "bg-amber-50 text-amber-700 border border-amber-100/50"
                                                    )}>
                                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: v.status === "Verified" ? "'FILL' 1" : "" }}>
                                                            {v.status === "Verified" ? "verified" : "gpp_maybe"}
                                                        </span>
                                                        {v.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button className="p-2 text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined">download</span></button>
                                                        {!v.isCurrent && (
                                                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-all"><span className="material-symbols-outlined">more_vert</span></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* AI Insights and Edit History */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden group">
                                <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform text-white">
                                    <span className="material-symbols-outlined text-9xl rotate-12">psychology</span>
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">AI Insight</p>
                                    <h4 className="text-xl font-bold flex items-center gap-3 tracking-tight">
                                        <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                                        Phân tích Tài liệu
                                    </h4>
                                    <p className="text-[13px] text-slate-300 font-medium leading-relaxed pr-4">
                                        AI đã phát hiện 3 điểm mâu thuẫn giữa <span className="text-white font-bold border-b border-primary/50">v4</span> và <span className="text-white font-bold border-b border-primary/50">v3</span> trong mục "Kế hoạch doanh thu".
                                    </p>
                                    <button className="pt-2 text-primary text-[13px] font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-wider group/btn">
                                        Xem so sánh ngay
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-5">
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
                                        <span className="material-symbols-outlined text-3xl">history_edu</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Lịch sử Chỉnh sửa</h4>
                                        <p className="text-[12px] text-slate-500 font-medium">Cập nhật lần cuối bởi <b className="text-slate-900">Nguyễn Văn A</b> cách đây 2 giờ.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="pt-12 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                        © 2026 AISEP STARTUP WORKSPACE • BẢO VỆ TÀI SẢN TRÍ TUỆ & MINH BẠCH GỌI VỐN
                    </p>
                </footer>
            </main>
        </StartupShell>
    );
}
