"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { StartupShell } from "@/components/startup/startup-shell";
import { StartupProfileFooter } from "@/components/startup/startup-profile-footer";

const editTabs = [
    { label: "Thông tin cơ bản", href: "/startup/startup-profile/info" },
    { label: "Kinh doanh & Thị trường", href: "/startup/startup-profile/business" },
    { label: "Gọi vốn", href: "/startup/startup-profile/funding" },
    { label: "Đội ngũ & Xác thực", href: "/startup/startup-profile/team" },
    { label: "Hiển thị", href: "/startup/startup-profile/visibility" },
    { label: "KYC & Xác thực", href: "/startup/verification" },
];

export default function StartupProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isViewMode = pathname === "/startup/startup-profile";
    const currentTab = editTabs.find(tab => pathname === tab.href) || editTabs[0];

    return (
        <StartupShell>
            {isViewMode ? (
                <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-5">
                    {children}
                </main>
            ) : (
                <>
                    <main className="flex-1 max-w-6xl mx-auto w-full p-6 pb-32 space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em] mb-5">Chỉnh sửa hồ sơ Startup</h1>

                            {/* Tab bar */}
                            <div className="flex gap-0 border-b border-slate-200 overflow-x-auto no-scrollbar">
                                {editTabs.map((tab) => (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        className={cn(
                                            "pb-3 px-4 text-[13px] font-medium transition-all relative whitespace-nowrap",
                                            pathname === tab.href
                                                ? "text-[#0f172a]"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {tab.label}
                                        {pathname === tab.href && (
                                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0f172a] rounded-full" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {children}
                    </main>

                    <StartupProfileFooter />
                </>
            )}
        </StartupShell>
    );
}
