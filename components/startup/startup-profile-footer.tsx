"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function StartupProfileFooter() {
    const pathname = usePathname();

    // Custom text based on page
    const isKyc = pathname.includes("/kyc");
    const saveLabel = "Lưu thay đổi";
    const submitLabel = isKyc ? "Gửi duyệt hồ sơ" : "Gửi duyệt";
    const securityText = isKyc ? "Dữ liệu được bảo mật bởi AISEP Security" : "Tự động lưu lúc 14:20";
    const securityIcon = isKyc ? "shield" : "cloud_done";

    // Check if current page is KYC to apply different button styles if needed
    const isSubmitDisabled = pathname.includes("/funding") || pathname.includes("/info");

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-surface p-5 z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6">
                <div className="flex items-center gap-3 text-neutral-muted">
                    <div className="w-8 h-8 rounded-full bg-neutral-surface flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] opacity-70">{securityIcon}</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest opacity-60">{securityText}</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="px-8 py-3.5 rounded-2xl text-sm font-black bg-white border-2 border-neutral-surface text-[#171611] hover:bg-neutral-surface hover:border-neutral-muted transition-all duration-300 shadow-sm active:scale-95">
                        {saveLabel}
                    </button>

                    <button
                        disabled={isSubmitDisabled}
                        className={cn(
                            "px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-300 shadow-lg active:scale-95",
                            isSubmitDisabled
                                ? "bg-neutral-surface text-neutral-muted cursor-not-allowed opacity-50 shadow-none"
                                : "bg-[#e6cc4c] text-white hover:bg-[#d4ba3d] shadow-[#e6cc4c]/30"
                        )}
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </footer>
    );
}
