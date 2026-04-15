"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Shield, Cloud, Loader2 } from "lucide-react";
import { useStartupProfile } from "@/context/startup-profile-context";
import { toast } from "sonner";
import { useEffect } from "react";

export function StartupProfileFooter() {
    const pathname = usePathname();
    const { saving, saveSuccess, saveError, saveProfile, clearSaveStatus } = useStartupProfile();
    const isKyc = pathname.includes("/kyc");
    const isInfoRoute = pathname === "/startup/startup-profile/info";

    const handleSave = async () => {
        clearSaveStatus();
        await saveProfile();
    };

    useEffect(() => {
        if (saveSuccess) {
            toast.success("Lưu thành công", {
                description: "Hồ sơ của bạn đã được cập nhật.",
                position: "top-right",
            });
            clearSaveStatus();
        }
        if (saveError) {
            toast.error("Lưu thất bại", {
                description: saveError,
                position: "top-right",
            });
            clearSaveStatus();
        }
    }, [saveSuccess, saveError, clearSaveStatus]);

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 z-[50] shadow-[0_-1px_0_rgba(0,0,0,0.04)]">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-2 text-slate-400">
                    {isKyc
                        ? <Shield className="w-3.5 h-3.5" />
                        : <Cloud className="w-3.5 h-3.5" />}
                    <span className="text-[12px] font-normal">
                        {isKyc ? "Dữ liệu được bảo mật bởi AISEP" : "Thay đổi sẽ được lưu khi bấm nút"}
                    </span>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || !isInfoRoute}
                    className={cn(
                        "px-5 py-2 rounded-xl text-[13px] font-semibold transition-colors flex items-center gap-2 shadow-sm",
                        (saving || !isInfoRoute)
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-[#0f172a] text-white hover:bg-[#1e293b] border border-[#0f172a]"
                    )}
                >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Lưu thay đổi
                </button>
            </div>
        </footer>
    );
}
