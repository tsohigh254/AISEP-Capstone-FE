"use client";

import { useState, useRef } from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import { cn } from "@/lib/utils";
import {
    Shield, Bell, Lock, ChevronRight, Check, X,
    ShieldCheck, FileText, Users, Brain, Newspaper, AlertTriangle,
    Eye, EyeOff, Globe, AlertCircle, RefreshCw,
} from "lucide-react";
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
type Visibility = { investors: boolean; advisors: boolean };

const DEFAULT_PREFS: Prefs = {
    securityAlerts:      { inApp: true,  email: true  },
    verificationUpdates: { inApp: true,  email: true  },
    interactions:        { inApp: true,  email: false },
    documentsAndIP:      { inApp: true,  email: false },
    aiEvaluation:        { inApp: true,  email: true  },
    newsletter:          { inApp: false, email: false },
};

const DEFAULT_VISIBILITY: Visibility = { investors: true, advisors: true };

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
                "relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
                checked ? "bg-[#0f172a]" : "bg-slate-200",
                disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            )}
        >
            <span className={cn(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
                checked ? "translate-x-[18px]" : "translate-x-[3px]"
            )} />
        </button>
    );
}

/* ─── Toast component ───────────────────────────────────────── */
function Toast({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-3 duration-300">
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px]">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    type === "success" ? "bg-emerald-100" : "bg-red-100")}>
                    {type === "success"
                        ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                        : <X className="w-3.5 h-3.5 text-red-600" />}
                </div>
                <p className="text-[13px] font-medium text-slate-700 flex-1">{message}</p>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
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

    /* ── Visibility ── */
    const [visibility, setVisibility] = useState<Visibility>(DEFAULT_VISIBILITY);
    const originalVisibility = useRef<Visibility>(DEFAULT_VISIBILITY);
    const [visSaving, setVisSaving] = useState(false);
    const [visSaveFailed, setVisSaveFailed] = useState(false);
    const [showVisConfirm, setShowVisConfirm] = useState(false);
    const visDirty = JSON.stringify(visibility) !== JSON.stringify(originalVisibility.current);
    const bothOff = !visibility.investors && !visibility.advisors;

    /* ── Toast ── */
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

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
                showToast("success", "Tùy chọn thông báo đã được lưu thành công.");
            } else {
                setPrefsSaveFailed(true);
                showToast("error", "Lưu thất bại. Vui lòng thử lại.");
            }
        }, 600);
    };

    /* ── Handlers: Visibility ── */
    const handleSaveVisibility = () => {
        if (bothOff) { setShowVisConfirm(true); return; }
        commitSaveVisibility();
    };

    const commitSaveVisibility = () => {
        setShowVisConfirm(false);
        setVisSaving(true);
        setVisSaveFailed(false);
        setTimeout(() => {
            setVisSaving(false);
            // TODO: replace with real API call
            const success = true;
            if (success) {
                originalVisibility.current = { ...visibility };
                showToast("success", "Cài đặt hiển thị đã được cập nhật.");
            } else {
                setVisSaveFailed(true);
                showToast("error", "Lưu thất bại. Vui lòng thử lại.");
            }
        }, 600);
    };

    return (
        <StartupShell>
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

            <div className="max-w-[760px] mx-auto space-y-5 pb-20">

                {/* ── Page header ── */}
                <div className="mb-6">
                    <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">Cài đặt tài khoản</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Quản lý mật khẩu, thông báo và khả năng hiển thị hồ sơ startup của bạn.</p>
                </div>

                {/* ── Security card ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <h2 className="text-[13px] font-semibold text-slate-700">Bảo mật</h2>
                    </div>
                    <div className="px-6 py-5 flex items-center justify-between gap-6">
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
                </div>

                {/* ── Notification Preferences card ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <h2 className="text-[13px] font-semibold text-slate-700">Tùy chọn thông báo</h2>
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
                                        : "bg-[#0f172a] text-white hover:bg-slate-800 shadow-sm"
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

                {/* ── Profile Visibility card ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <h2 className="text-[13px] font-semibold text-slate-700">Hiển thị hồ sơ</h2>
                    </div>

                    {/* Description */}
                    <div className="px-6 py-3 bg-slate-50/60 border-b border-slate-100">
                        <p className="text-[12px] text-slate-500">
                            Kiểm soát ai có thể tìm thấy và xem hồ sơ startup của bạn trên nền tảng.
                            Cài đặt này ảnh hưởng đến khả năng khám phá hồ sơ, không phải từng tài liệu riêng lẻ.
                        </p>
                    </div>

                    {/* Visibility rows */}
                    <div className="divide-y divide-slate-100">
                        {/* Investors */}
                        <div className="px-6 py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                    visibility.investors ? "bg-emerald-50" : "bg-slate-50"
                                )}>
                                    {visibility.investors
                                        ? <Eye className="w-4 h-4 text-emerald-500" />
                                        : <EyeOff className="w-4 h-4 text-slate-400" />}
                                </div>
                                <div>
                                    <p className="text-[13px] font-medium text-slate-700">Hiển thị với Nhà đầu tư</p>
                                    <p className="text-[12px] text-slate-400 mt-0.5">
                                        {visibility.investors
                                            ? "Nhà đầu tư có thể tìm thấy và xem hồ sơ startup của bạn."
                                            : "Hồ sơ startup không hiển thị với nhà đầu tư."}
                                    </p>
                                </div>
                            </div>
                            <Toggle
                                checked={visibility.investors}
                                onChange={(v) => setVisibility(p => ({ ...p, investors: v }))}
                            />
                        </div>

                        {/* Advisors */}
                        <div className="px-6 py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                    visibility.advisors ? "bg-emerald-50" : "bg-slate-50"
                                )}>
                                    {visibility.advisors
                                        ? <Eye className="w-4 h-4 text-emerald-500" />
                                        : <EyeOff className="w-4 h-4 text-slate-400" />}
                                </div>
                                <div>
                                    <p className="text-[13px] font-medium text-slate-700">Hiển thị với Cố vấn</p>
                                    <p className="text-[12px] text-slate-400 mt-0.5">
                                        {visibility.advisors
                                            ? "Cố vấn có thể tìm thấy và xem hồ sơ startup của bạn."
                                            : "Hồ sơ startup không hiển thị với cố vấn."}
                                    </p>
                                </div>
                            </div>
                            <Toggle
                                checked={visibility.advisors}
                                onChange={(v) => setVisibility(p => ({ ...p, advisors: v }))}
                            />
                        </div>
                    </div>

                    {/* Both-off warning */}
                    {bothOff && (
                        <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 animate-in slide-in-from-top-1 duration-200">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[12.5px] text-amber-700 leading-relaxed">
                                Hồ sơ startup sẽ không còn được khám phá trên nền tảng. Điều này có thể ảnh hưởng đến cơ hội kết nối với nhà đầu tư và cố vấn.
                            </p>
                        </div>
                    )}

                    {/* Save footer */}
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <p className={cn("text-[12px]", visSaveFailed ? "text-red-500 font-medium" : "text-slate-400")}>
                            {visSaveFailed
                                ? "Lưu thất bại. Vui lòng thử lại."
                                : visDirty
                                    ? "Bạn có thay đổi chưa được lưu."
                                    : "Tất cả thay đổi đã được lưu."}
                        </p>
                        <button
                            onClick={handleSaveVisibility}
                            disabled={(!visDirty && !visSaveFailed) || visSaving}
                            className={cn(
                                "flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap",
                                (visDirty || visSaveFailed) && !visSaving
                                    ? visSaveFailed
                                        ? "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                                        : bothOff
                                            ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                                            : "bg-[#0f172a] text-white hover:bg-slate-800 shadow-sm"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {visSaving
                                ? "Đang lưu..."
                                : visSaveFailed
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
            {(prefsDirty || prefsSaveFailed || visDirty || visSaveFailed) && (
                <div className="md:hidden fixed bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 safe-bottom">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Chưa lưu</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(prefsDirty || prefsSaveFailed) && (
                                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                                            Thông báo
                                        </span>
                                    )}
                                    {(visDirty || visSaveFailed) && (
                                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                                            Hiển thị hồ sơ
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                {(prefsDirty || prefsSaveFailed) && (
                                    <button
                                        onClick={handleSavePrefs}
                                        disabled={prefsSaving}
                                        className={cn(
                                            "px-4 h-10 rounded-xl text-[13px] font-semibold transition-all",
                                            prefsSaveFailed
                                                ? "bg-red-600 text-white"
                                                : "bg-[#0f172a] text-white"
                                        )}
                                    >
                                        {prefsSaving ? "..." : prefsSaveFailed ? "Thử lại" : "Lưu TB"}
                                    </button>
                                )}
                                {(visDirty || visSaveFailed) && (
                                    <button
                                        onClick={handleSaveVisibility}
                                        disabled={visSaving}
                                        className={cn(
                                            "px-4 h-10 rounded-xl text-[13px] font-semibold transition-all",
                                            visSaveFailed
                                                ? "bg-red-600 text-white"
                                                : bothOff
                                                    ? "bg-amber-500 text-white"
                                                    : "bg-[#0f172a] text-white"
                                        )}
                                    >
                                        {visSaving ? "..." : visSaveFailed ? "Thử lại" : "Lưu HT"}
                                    </button>
                                )}
                            </div>
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
                    showToast("success", "Mật khẩu đã được cập nhật thành công.");
                }}
            />

            {/* ── Visibility confirm dialog (both OFF) ── */}
            {showVisConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowVisConfirm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.14)] w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">Ẩn hoàn toàn hồ sơ?</h3>
                        <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
                            Hồ sơ startup của bạn sẽ không còn xuất hiện trong kết quả tìm kiếm của nhà đầu tư và cố vấn trên nền tảng.
                        </p>
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setShowVisConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={commitSaveVisibility}
                                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-[13px] font-semibold hover:bg-amber-600 transition-colors"
                            >
                                Xác nhận ẩn hồ sơ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StartupShell>
    );
}
