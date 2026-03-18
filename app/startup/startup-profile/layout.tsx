"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { StartupShell } from "@/components/startup/startup-shell";
import { StartupProfileFooter } from "@/components/startup/startup-profile-footer";

const tabs = [
    { label: "Thông tin chính", href: "/startup/startup-profile/info" },
    { label: "Gọi vốn", href: "/startup/startup-profile/funding" },
    { label: "Đội ngũ", href: "/startup/startup-profile/team" },
    { label: "KYC & Xác thực", href: "/startup/startup-profile/kyc" },
];

export default function StartupProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Find current tab for breadcrumbs
    const currentTab = tabs.find(tab => pathname === tab.href) || tabs[0];

    return (
        <StartupShell>
            <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-8 pb-32">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-muted">Hồ sơ Startup</span>
                    <ChevronRight className="w-4 h-4 text-neutral-muted" />
                    <span className="font-bold text-[#171611]">{currentTab.label}</span>
                </div>

                {/* Title & Tabs */}
                <div>
                    <h1 className="text-[28px] font-black text-[#171611] tracking-tight mb-6">Chỉnh sửa hồ sơ Startup</h1>
                    <div className="flex gap-8 border-b border-neutral-surface overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "pb-4 text-sm font-bold transition-all relative whitespace-nowrap",
                                    pathname === tab.href
                                        ? "text-[#171611]"
                                        : "text-neutral-muted hover:text-[#171611]"
                                )}
                            >
                                {tab.label}
                                {pathname === tab.href && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full"></div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Page Content */}
                {children}
            </main>

            <StartupProfileFooter />
        </StartupShell>
    );
}
