"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Shield, Cloud } from "lucide-react";

export function InvestorProfileFooter() {
    const pathname = usePathname();
    const isKyc = pathname.includes("/kyc");
    const isSubmitDisabled = false; // Add logic if needed

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/80 z-[50] shadow-[0_-1px_0_rgba(0,0,0,0.04)]">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-2 text-slate-400">
                    {isKyc
                        ? <Shield className="w-3.5 h-3.5" />
                        : <Cloud className="w-3.5 h-3.5" />}
                    <span className="text-[12px] font-normal">
                        {isKyc ? "Dữ liệu được bảo mật bởi AISEP" : "Tự động lưu · Vừa xong"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-5 py-2 rounded-xl text-[13px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                        Lưu thay đổi
                    </button>
                    <button
                        disabled={isSubmitDisabled}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[13px] font-medium transition-colors",
                            isSubmitDisabled
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-[#0f172a] text-white hover:bg-slate-800"
                        )}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </footer>
    );
}
