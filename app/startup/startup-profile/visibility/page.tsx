"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Clock, CheckCircle2, ShieldCheck, Loader2, CalendarCheck, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStartupProfile } from "@/context/startup-profile-context";
import { EnableVisibility, DisableVisibility } from "@/services/startup/startup.api";
import { toast } from "sonner";

type Status = "Visible" | "Hidden" | "PendingApproval";

/** Chuẩn hoá bất kỳ giá trị nào BE trả về thành Status hợp lệ */
const normalizeStatus = (raw: any): Status => {
    if (raw === true || raw === "Visible" || raw === "visible" || raw === "Public") return "Visible";
    if (raw === "PendingApproval" || raw === "Pending") return "PendingApproval";
    return "Hidden";
};

const STATUS_MAP = {
    Visible:         { label: "Hiển thị với nhà đầu tư & cố vấn",  desc: "Hồ sơ của bạn xuất hiện trong kết quả tìm kiếm. Nhà đầu tư và cố vấn có thể xem thông tin cơ bản và gửi yêu cầu kết nối.",  icon: Eye,    dot: "bg-emerald-500" },
    Hidden:          { label: "Ẩn khỏi nhà đầu tư & cố vấn",       desc: "Hồ sơ không hiển thị trong tìm kiếm. Nhà đầu tư và cố vấn sẽ không tìm thấy hoặc gửi kết nối đến bạn.",                      icon: EyeOff, dot: "bg-slate-400"   },
    PendingApproval: { label: "Đang chờ duyệt",                      desc: "Hồ sơ đang chờ phê duyệt từ hệ thống. Sau khi được duyệt, bạn có thể bật hiển thị cho nhà đầu tư và cố vấn.",                 icon: Clock,  dot: "bg-amber-400"   },
};

export default function StartupVisibilityPage() {
    const { profile, fetchProfile, loading } = useStartupProfile();
    // Khởi tạo từ profile ngay lập tức nếu đã có, tránh flash "Hidden"
    const [status, setStatus] = useState<Status>(() => normalizeStatus(profile?.visibilityStatus ?? profile?.isVisible));
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (profile) {
            // Ưu tiên visibilityStatus, fallback sang isVisible (boolean)
            const raw = profile.visibilityStatus ?? profile.isVisible;
            setStatus(normalizeStatus(raw));
        }
    }, [profile]);

    const cfg = STATUS_MAP[status] || STATUS_MAP["Hidden"];
    const Icon = cfg.icon;
    const isPending = status === "PendingApproval";

    const handleSetStatus = async (newStatus: Status) => {
        if (newStatus === status) return;

        setIsUpdating(true);
        try {
            if (newStatus === "Visible") {
                await EnableVisibility();
                toast.success("Hồ sơ đã được hiển thị.", {
                    description: "Nhà đầu tư và cố vấn có thể tìm thấy và xem hồ sơ của bạn.",
                });
            } else if (newStatus === "Hidden") {
                await DisableVisibility();
                toast.success("Hồ sơ đã được ẩn.", {
                    description: "Nhà đầu tư và cố vấn sẽ không tìm thấy hồ sơ trong kết quả tìm kiếm.",
                });
            }
            await fetchProfile(); // refresh data
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || err?.message || "Không xác định";
            toast.error("Cập nhật trạng thái thất bại.", {
                description: msg,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading && !profile) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-5">
            {/* Current status banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">Trạng thái hiện tại</p>
                <div className="flex items-center gap-3">
                    <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", cfg.dot)} />
                    <Icon className="w-4 h-4 text-slate-500" />
                    <div>
                        <p className="text-[14px] font-semibold text-[#0f172a]">{cfg.label}</p>
                        <p className="text-[12px] text-slate-400 mt-0.5">{cfg.desc}</p>
                    </div>
                </div>
            </div>

            {/* Approval info */}
            {(profile?.approvedAt || profile?.approvedBy) && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Thông tin duyệt hồ sơ</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile?.approvedAt && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                    <CalendarCheck className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium">Ngày duyệt</p>
                                    <p className="text-[13px] font-semibold text-[#0f172a] mt-0.5">
                                        {new Date(profile.approvedAt).toLocaleDateString("vi-VN", {
                                            day: "2-digit", month: "2-digit", year: "numeric",
                                            hour: "2-digit", minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {profile?.approvedBy && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <UserCheck className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium">Duyệt bởi (ID)</p>
                                    <p className="text-[13px] font-semibold text-[#0f172a] mt-0.5">{profile.approvedBy}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toggle options */}
            {!isPending && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-[13px] font-semibold text-slate-700">Thay đổi hiển thị</h3>
                        <p className="text-[12px] text-slate-400 mt-0.5">Kiểm soát việc nhà đầu tư có thể tìm thấy hồ sơ của bạn.</p>
                    </div>
                    <div className="p-4 space-y-2 relative">
                        {isUpdating && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
                            </div>
                        )}
                        {(["Visible", "Hidden"] as Status[]).map(s => {
                            const c = STATUS_MAP[s];
                            const Ic = c.icon;
                            const active = status === s;
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleSetStatus(s)}
                                    disabled={active || isUpdating}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                                        active
                                            ? "bg-slate-900 border-slate-900 text-white"
                                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                                    )}
                                >
                                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", active ? "bg-white/10" : "bg-slate-100")}>
                                        <Ic className={cn("w-4 h-4", active ? "text-white" : "text-slate-500")} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn("text-[13px] font-medium", active ? "text-white" : "text-slate-700")}>
                                            {s === "Visible" ? "Hiển thị hồ sơ" : "Ẩn hồ sơ"}
                                        </p>
                                        <p className={cn("text-[11px] mt-0.5", active ? "text-white/60" : "text-slate-400")}>
                                            {s === "Visible" ? "Nhà đầu tư và cố vấn có thể tìm thấy và xem hồ sơ của bạn." : "Hồ sơ sẽ không xuất hiện trong tìm kiếm."}
                                        </p>
                                    </div>
                                    {active && <CheckCircle2 className="w-4 h-4 text-white/80 flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Privacy note */}
            <div className="flex items-start gap-3 px-5 py-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-[12px] font-medium text-slate-600">Quyền riêng tư được bảo vệ</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Khi hồ sơ ở trạng thái &quot;Hiển thị&quot;, nhà đầu tư chỉ xem được thông tin cơ bản. Tài liệu tài chính và thông tin KYC chỉ chia sẻ qua kết nối được phê duyệt.
                    </p>
                </div>
            </div>
        </div>
    );
}
