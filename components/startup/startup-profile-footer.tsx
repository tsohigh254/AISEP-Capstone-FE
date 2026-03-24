"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Shield, Cloud, Loader2, CheckCircle2 } from "lucide-react";
import { useStartupProfile } from "@/context/startup-profile-context";

export function StartupProfileFooter() {
    const pathname = usePathname();
    const { saving, submitting, saveSuccess, saveError, saveProfile, submitForApproval, clearSaveStatus } = useStartupProfile();
    const isKyc = pathname.includes("/kyc");
    const isInfoRoute = pathname === "/startup/startup-profile/info";

    const handleSave = async () => {
        clearSaveStatus();
        await saveProfile();
    };

    const handleSubmit = async () => {
        clearSaveStatus();
        await submitForApproval();
    };

    const isProcessing = saving || submitting;

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 z-[50] shadow-[0_-1px_0_rgba(0,0,0,0.04)]">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-2 text-slate-400">
                    {isKyc
                        ? <Shield className="w-3.5 h-3.5" />
                        : <Cloud className="w-3.5 h-3.5" />}
                    <span className="text-[12px] font-normal">
                        {saveSuccess ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đã lưu thành công
                            </span>
                        ) : saveError ? (
                            <span className="text-red-500">{saveError}</span>
                        ) : isKyc ? (
                            "Dữ liệu được bảo mật bởi AISEP"
                        ) : (
                            "Thay đổi sẽ được lưu khi bấm nút"
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isProcessing || !isInfoRoute}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-2",
                            (isProcessing || !isInfoRoute)
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Lưu thay đổi
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !isInfoRoute}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-2",
                            (isProcessing || !isInfoRoute)
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-[#0f172a] text-white hover:bg-slate-800"
                        )}
                    >
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isKyc ? "Gửi duyệt hồ sơ" : "Gửi duyệt"}
                    </button>
                </div>
            </div>
        </footer>
    );
}
