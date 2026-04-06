"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Shield, Cloud, Loader2 } from "lucide-react";
import { useInvestorEdit } from "@/context/investor-edit-context";

export function InvestorProfileFooter() {
    const pathname = usePathname();
    const isKyc = pathname.includes("/kyc");
    const { onSave, isSaving } = useInvestorEdit();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 z-[50] shadow-[0_-1px_0_rgba(0,0,0,0.04)]">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-2 text-slate-400">
                    {isKyc
                        ? <Shield className="w-3.5 h-3.5" />
                        : <Cloud className="w-3.5 h-3.5" />}
                    <span className="text-[12px] font-normal">
                        {isKyc ? "Dữ liệu được bảo mật bởi AISEP" : "Nhấn lưu để cập nhật hồ sơ"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onSave}
                        disabled={isSaving || !onSave}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-2",
                            isSaving || !onSave
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-[#0f172a] text-white hover:bg-slate-800"
                        )}
                    >
                        {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </footer>
    );
}
