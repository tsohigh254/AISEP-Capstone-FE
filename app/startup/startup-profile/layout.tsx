"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StartupShell } from "@/components/startup/startup-shell";
import { StartupProfileFooter } from "@/components/startup/startup-profile-footer";
import { StartupProfileProvider } from "@/context/startup-profile-context";
import { Suspense } from "react";
import { Settings } from "lucide-react";

const NavigationContent = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isViewMode = pathname === "/startup/startup-profile";
    // Edit mode: Gom toàn bộ thông tin tạo/cập nhật ở 1 tab (/info), member tách ở (/team)
    const editTabs = [
        { id: "info", label: "Tổng quan", href: "/startup/startup-profile/info", match: pathname.includes("/info") && !pathname.includes("/team") },
        { id: "team", label: "Đội ngũ & Xác thực", href: "/startup/startup-profile/team", match: pathname.includes("/team") },
    ];

    const isVisibilitySettings = pathname.includes("/visibility");

    return (
        <StartupShell>
            {isViewMode ? (
                <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-5">
                    {children}
                </main>
            ) : (
                <>
                    <main className="flex-1 max-w-5xl mx-auto w-full p-6 pb-32 space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-[24px] font-bold text-[#0f172a] tracking-tight mb-5">Chỉnh sửa hồ sơ Startup</h1>

                            {/* Tab bar Pill Navbar (Matches View Page) + Settings Button */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm w-max overflow-x-auto">
                                    {editTabs.map((tab) => (
                                        <Link
                                            key={tab.id}
                                            href={tab.href}
                                            className={cn(
                                                "px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 relative whitespace-nowrap",
                                                tab.match
                                                    ? "bg-[#0f172a] text-white shadow-md shadow-slate-900/10"
                                                    : "text-slate-500 hover:text-[#0f172a] hover:bg-slate-100"
                                            )}
                                        >
                                            {tab.label}
                                        </Link>
                                    ))}
                                </div>
                                
                                {/* Nút điều khiển Hiển thị / Ẩn tách biệt */}
                                <Link
                                    href="/startup/startup-profile/visibility"
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-[13px] hover:bg-slate-50 transition-all shadow-sm w-max",
                                        isVisibilitySettings ? "border-[#0f172a] ring-1 ring-[#0f172a]/20 text-[#0f172a] bg-slate-50" : "text-slate-600 hover:text-[#0f172a]"
                                    )}
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Cài đặt hiển thị</span>
                                </Link>
                            </div>
                        </div>

                        {children}
                    </main>

                    <StartupProfileFooter />
                </>
            )}
        </StartupShell>
    );
};

export default function StartupProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <StartupProfileProvider>
            <Suspense fallback={<div />}>
                <NavigationContent>{children}</NavigationContent>
            </Suspense>
        </StartupProfileProvider>
    );
}
