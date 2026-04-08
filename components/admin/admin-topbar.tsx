"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, RefreshCw, ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/context";
import { Logout } from "@/services/auth/auth.api";

interface AdminTopbarProps {
    collapsed: boolean;
}

export function AdminTopbar({ collapsed }: AdminTopbarProps) {
    const router = useRouter();
    const { user, setUser, setAccessToken, setIsAuthen } = useAuth();
    const [spinning, setSpinning] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [now, setNow] = useState("");

    const displayName = user?.email?.split("@")[0] || "Admin";
    const initials = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        const update = () => {
            setNow(new Date().toLocaleString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }));
        };
        update();
        const id = setInterval(update, 30000);
        return () => clearInterval(id);
    }, []);

    const handleRefresh = () => {
        if (spinning) return;
        setSpinning(true);
        setTimeout(() => setSpinning(false), 1000);
    };

    const handleLogout = async () => {
        setDropdownOpen(false);
        try { await Logout(); } catch { /* silent */ }
        finally {
            setUser(undefined);
            setAccessToken(undefined);
            setIsAuthen(false);
            if (typeof window !== "undefined") localStorage.removeItem("accessToken");
            router.push("/auth/login");
        }
    };

    return (
        <div
            className={cn(
                "fixed top-0 right-0 z-30 h-[64px] bg-white border-b border-slate-100 flex items-center px-6 transition-all duration-300",
                collapsed ? "left-[64px]" : "left-[240px]"
            )}
        >
            {/* Left: Title + Subtitle */}
            <div className="pl-12">
                <p className="text-[15px] font-bold text-slate-900 leading-tight">Admin Workspace</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">System governance and operational control center</p>
            </div>

            {/* Right */}
            <div className="ml-auto flex items-center gap-2">
                {/* Date/time */}
                <span className="text-[12px] text-slate-400 hidden md:block mr-2">{now}</span>

                {/* Refresh */}
                <button
                    onClick={handleRefresh}
                    title="Refresh"
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <RefreshCw className={cn("w-4 h-4", spinning && "animate-spin")} />
                </button>

                {/* Notification bell */}
                <button
                    title="Thông báo"
                    className="w-9 h-9 relative flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
                </button>

                {/* Avatar dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(o => !o)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <div className="size-7 rounded-full bg-[#fdf8e6] border border-[#eec54e]/30 flex items-center justify-center shrink-0">
                            <span className="text-[12px] font-black text-[#b8902e]">{initials}</span>
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700 hidden sm:block">{displayName}</span>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", dropdownOpen && "rotate-180")} />
                    </button>

                    {dropdownOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setDropdownOpen(false)}
                            />
                            {/* Dropdown */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-50 overflow-hidden py-1.5">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
