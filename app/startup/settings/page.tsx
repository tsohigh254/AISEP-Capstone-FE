"use client";

import { useState, useRef } from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import { cn } from "@/lib/utils";
import {
    Shield, Bell, Lock, ChevronRight, Check, X,
    ShieldCheck, FileText, Users, Brain, Newspaper, AlertTriangle,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { ChangePasswordModal } from "@/components/startup/change-password-modal";

/* ─── Types ─────────────────────────────────────────────────── */
type Channel = { inApp: boolean; email: boolean };
type Prefs = {
    securityAlerts: Channel;
    verificationUpdates: Channel;
    interactions: Channel;
    documentsAndIP: Channel;
    aiEvaluation: Channel;
    newsletter: Channel;
};
const DEFAULT_PREFS: Prefs = {
    securityAlerts:      { inApp: true,  email: true  },
    verificationUpdates: { inApp: true,  email: true  },
    interactions:        { inApp: true,  email: false },
    documentsAndIP:      { inApp: true,  email: false },
    aiEvaluation:        { inApp: true,  email: true  },
    newsletter:          { inApp: false, email: false },
};

/* ─── Toggle component ──────────────────────────────────────── */
function Toggle({
    checked, onChange, disabled = false,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eec54e]/20",
                checked ? "bg-[#eec54e]" : "bg-slate-200",
                disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            )}
        >
            <span className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                checked ? "translate-x-[22px]" : "translate-x-[2px]"
            )} />
        </button>
    );
}

/* ─── SectionCard component (consistent with investor/advisor) ── */
function SectionCard({ title, icon: Icon, description, children, id }: {
    title: string;
    icon: React.ElementType;
    description?: string;
    children: React.ReactNode;
    id?: string;
}) {
    return (
        <div id={id} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden scroll-mt-24">
            <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[15px] font-bold text-slate-800">{title}</p>
                </div>
                {description && <p className="text-[12px] text-slate-400 ml-9">{description}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

/* ─── Notification categories config ───────────────────────── */
const CATEGORIES: {
    key: keyof Prefs;
    icon: React.ElementType;
    label: string;
    description: string;
    locked?: boolean;
}[] = [
    {
        key: "securityAlerts",
        icon: AlertTriangle,
        label: "Cảnh báo bảo mật",
        description: "Đăng nhập mới, thay đổi mật khẩu và các sự kiện bảo mật quan trọng.",
        locked: true,
    },
    {
        key: "verificationUpdates",
        icon: ShieldCheck,
        label: "Cập nhật xác minh / KYC",
        description: "Trạng thái KYC: đã nhận, cần bổ sung, được duyệt hoặc bị từ chối.",
        locked: true,
    },
    {
        key: "interactions",
        icon: Users,
        label: "Tương tác với cố vấn & nhà đầu tư",
        description: "Ai đó xem hồ sơ, gửi yêu cầu kết nối hoặc phản hồi về startup của bạn.",
    },
    {
        key: "documentsAndIP",
        icon: FileText,
        label: "Tài liệu & IP",
        description: "Kết quả xử lý tài liệu, xác minh blockchain và cập nhật trạng thái hiển thị.",
    },
    {
        key: "aiEvaluation",
        icon: Brain,
        label: "AI Evaluation",
        description: "Đánh giá bắt đầu, hoàn tất hoặc báo cáo đã sẵn sàng để xem.",
    },
    {
        key: "newsletter",
        icon: Newspaper,
        label: "Bản tin & cập nhật nền tảng",
        description: "Xu hướng startup, sự kiện kết nối nhà đầu tư và tính năng mới hàng tuần.",
    },
];

/* ─── Main Page ─────────────────────────────────────────────── */
export default function StartupSettingsPage() {
    /* ── Password modal ── */
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    /* ── Notification prefs ── */
    const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
    const originalPrefs = useRef<Prefs>(DEFAULT_PREFS);
    const [prefsSaving, setPrefsSaving] = useState(false);
    const [prefsSaveFailed, setPrefsSaveFailed] = useState(false);
    const prefsDirty = JSON.stringify(prefs) !== JSON.stringify(originalPrefs.current);



    /* ── Handlers: Notification prefs ── */
    const setChannel = (key: keyof Prefs, channel: keyof Channel, value: boolean) => {
        setPrefs(p => ({ ...p, [key]: { ...p[key], [channel]: value } }));
    };

    const handleSavePrefs = () => {
        setPrefsSaving(true);
        setPrefsSaveFailed(false);
        setTimeout(() => {
            setPrefsSaving(false);
            // TODO: replace with real API call
            const success = true;
            if (success) {
                originalPrefs.current = prefs;
                toast.success("Tùy chọn thông báo đã được lưu thành công.");
            } else {
                setPrefsSaveFailed(true);
                toast.error("Lưu thất bại. Vui lòng thử lại.");
            }
        }, 600);
    };

    return (
        <StartupShell>
            <div className="max-w-[760px] mx-auto space-y-5 pb-20">

                {/* ── Page header ── */}
                <div className="mb-6">
                    <h1 className="text-[22px] font-semibold text-slate-800 tracking-[-0.02em]">Cài đặt tài khoản</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Quản lý mật khẩu, thông báo và khả năng hiển thị hồ sơ startup của bạn.</p>
                </div>

                {/* ── Security card ── */}
                <SectionCard title="Bảo mật" icon={Shield} description="Quản lý mật khẩu và bảo vệ tài khoản.">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <Lock className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[13px] font-medium text-slate-700">Mật khẩu đăng nhập</p>
                                <p className="text-[12px] text-slate-400 mt-0.5">Cập nhật mật khẩu định kỳ để tăng tính bảo mật cho tài khoản.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all whitespace-nowrap"
                        >
                            Đổi mật khẩu <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </div>
                </SectionCard>

                {/* ── Notification Preferences card ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                <Bell className="w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-[15px] font-bold text-slate-800">Tùy chọn thông báo</p>
                        </div>
                    </div>

                    {/* Essential note */}
                    <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-100">
                        <p className="text-[12px] text-slate-500">
                            Một số thông báo bảo mật và xác minh luôn được bật để bảo vệ tài khoản của bạn.
                        </p>
                    </div>

                    {/* Column headers */}
                    <div className="px-6 py-3 border-b border-slate-100 grid grid-cols-[1fr_64px_64px] gap-4 items-center">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Loại thông báo</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">In-app</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-center">Email</span>
                    </div>

                    {/* Category rows */}
                    <div className="divide-y divide-slate-100">
                        {CATEGORIES.map(({ key, icon: Icon, label, description, locked }) => (
                            <div key={key} className="px-6 py-4 grid grid-cols-[1fr_64px_64px] gap-4 items-center">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[13px] font-medium text-slate-700">{label}</p>
                                            {locked && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-500">Bắt buộc</span>
                                            )}
                                        </div>
                                        <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <Toggle
                                        checked={prefs[key].inApp}
                                        onChange={(v) => setChannel(key, "inApp", v)}
                                        disabled={locked}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <Toggle
                                        checked={prefs[key].email}
                                        onChange={(v) => setChannel(key, "email", v)}
                                        disabled={locked}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save footer */}
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <p className={cn("text-[12px]", prefsSaveFailed ? "text-red-500 font-medium" : "text-slate-400")}>
                            {prefsSaveFailed
                                ? "Lưu thất bại. Vui lòng thử lại."
                                : prefsDirty
                                    ? "Bạn có thay đổi chưa được lưu."
                                    : "Tất cả thay đổi đã được lưu."}
                        </p>
                        <button
                            onClick={handleSavePrefs}
                            disabled={(!prefsDirty && !prefsSaveFailed) || prefsSaving}
                            className={cn(
                                "flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap",
                                (prefsDirty || prefsSaveFailed) && !prefsSaving
                                    ? prefsSaveFailed
                                        ? "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                                        : "bg-[#eec54e] text-[#171611] hover:bg-[#e6c445] shadow-sm"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {prefsSaving
                                ? "Đang lưu..."
                                : prefsSaveFailed
                                    ? <><RefreshCw className="w-3.5 h-3.5" /> Thử lại</>
                                    : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                    <span>AISEP Startup Platform</span>
                    <div className="flex items-center gap-4">
                        <a href="#" className="hover:text-slate-600 transition-colors">Điều khoản</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Chính sách bảo mật</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Hỗ trợ</a>
                    </div>
                </div>
            </div>

            {/* ── Mobile sticky save bar ── */}
            {(prefsDirty || prefsSaveFailed) && (
                <div className="md:hidden fixed bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 safe-bottom">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Chưa lưu</p>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">Thông báo</span>
                            </div>
                            <button
                                onClick={handleSavePrefs}
                                disabled={prefsSaving}
                                className={cn(
                                    "px-4 h-10 rounded-xl text-[13px] font-semibold transition-all",
                                    prefsSaveFailed ? "bg-red-600 text-white" : "bg-[#eec54e] text-[#171611]"
                                )}
                            >
                                {prefsSaving ? "..." : prefsSaveFailed ? "Thử lại" : "Lưu TB"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Change Password Modal ── */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => {
                    setShowPasswordModal(false);
                    toast.success("Mật khẩu đã được cập nhật thành công.");
                }}
            />

        </StartupShell>
    );
}
