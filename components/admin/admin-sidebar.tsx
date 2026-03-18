"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogOut, Loader2, User, Lock, Activity, Settings } from "lucide-react";
import { useAuth } from "@/context/context";
import { Logout } from "@/services/auth/auth.api";

const menuItems = [
    {
        icon: User,
        label: "Người dùng",
        href: "/admin/users",
    },
    {
        icon: Lock,
        label: "Vai trò & Quyền",
        href: "/admin/roles",
    },
    {
        icon: Activity,
        label: "Giám sát",
        href: "/admin/monitoring",
    },
];

const configItems = [
    {
        icon: Settings,
        label: "Cài đặt hệ thống",
        href: "/admin/settings",
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, setUser, setAccessToken, setIsAuthen } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await Logout();
        } catch { /* silent – still clear local state */ }
        finally {
            // Clear auth state
            setUser(undefined);
            setAccessToken(undefined);
            setIsAuthen(false);
            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
            }
            router.push("/auth/login");
        }
    };

    const displayName = user?.email?.split("@")[0] || "Admin User";
    const displayEmail = user?.email || "admin@aisep.vn";
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <div className="w-[280px] min-h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50">
            {/* Logo Section */}
            <div className="p-8">
                <Link href="/admin/users" className="flex items-center gap-4 group">
                    <img src="/AISEP_Logo.png" alt="AISEP" className="w-14 h-14 rounded-full object-contain group-hover:scale-110 transition-all duration-500 transform group-hover:rotate-6" />
                    <div className="flex flex-col">
                        <h2 className="text-[#171611] text-2xl font-black tracking-tighter font-manrope leading-none">AISEP Admin</h2>
                        <span className="text-[#878164] text-[13px] font-bold font-manrope mt-1 tracking-tight">Hệ thống quản trị</span>
                    </div>
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 px-4 space-y-8 mt-4">
                {/* Main Menu */}
                <div className="space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-4 rounded-[20px] transition-all duration-300 group relative",
                                pathname.startsWith(item.href)
                                    ? "bg-[#fdf8e6] text-[#171611] shadow-sm"
                                    : "text-slate-400 hover:text-[#171611] hover:bg-slate-50"
                            )}
                        >
                            {(() => {
                                const Icon = item.icon;
                                return (
                                    <Icon className={cn(
                                        "w-6 h-6 transition-all duration-300",
                                        pathname.startsWith(item.href) ? "text-[#e6cc4c] scale-110" : "group-hover:text-[#e6cc4c]"
                                    )} />
                                );
                            })()}
                            <span className="font-bold text-[15px] tracking-tight">{item.label}</span>
                            {pathname.startsWith(item.href) && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#e6cc4c] shadow-[0_0_8px_#e6cc4c]" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Configuration Section */}
                <div className="space-y-4">
                    <p className="px-6 text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Cấu hình</p>
                    <div className="space-y-2">
                        {configItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-[20px] transition-all duration-300 group",
                                    pathname.startsWith(item.href)
                                        ? "bg-[#fdf8e6] text-[#171611] shadow-sm"
                                        : "text-slate-400 hover:text-[#171611] hover:bg-slate-50"
                                )}
                            >
                                {(() => {
                                    const Icon = item.icon;
                                    return (
                                        <Icon className={cn(
                                            "w-6 h-6 transition-all duration-300",
                                            pathname.startsWith(item.href) ? "text-[#e6cc4c] scale-110" : "group-hover:text-[#e6cc4c]"
                                        )} />
                                    );
                                })()}
                                <span className="font-bold text-[15px] tracking-tight">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Support / Footer Section */}
            <div className="p-6 mt-auto border-t border-slate-50">
                <div className="bg-slate-50/50 rounded-[24px] p-4 flex items-center gap-4 group hover:bg-slate-50 transition-all duration-300 overflow-hidden relative">
                    <div className="size-12 rounded-full bg-[#fdf8e6] border-2 border-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-sm overflow-hidden">
                        <div className="size-full bg-yellow-400 flex items-center justify-center text-white font-black text-lg">{initials}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate tracking-tight">{displayName}</p>
                        <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">{displayEmail}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        title="Đăng xuất"
                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all duration-300 shrink-0 shadow-sm disabled:opacity-50"
                    >
                        {loggingOut ? <Loader2 className="size-5 animate-spin" /> : <LogOut className="size-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

