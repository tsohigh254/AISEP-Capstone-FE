"use client";

import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import React, { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";

interface AdminShellProps {
    children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <AuthGuard allowedRoles={["Admin"]}>
            <div className="min-h-screen bg-[#f8f8f8] font-manrope selection:bg-[#e6cc4c]/30">
                <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

                <AdminTopbar collapsed={collapsed} />

                {/* Toggle button — aligned with topbar center */}
                <button
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? "Mở rộng" : "Thu gọn"}
                    className={cn(
                        "fixed top-[18px] z-40 w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-[#eec54e] text-slate-500 hover:text-[#b8902e] transition-all duration-300 shadow-sm",
                        collapsed ? "left-[76px]" : "left-[252px]"
                    )}
                >
                    <PanelLeft className={cn("w-4 h-4 transition-transform duration-300", collapsed && "rotate-180")} />
                </button>

                <div className={cn("transition-all duration-300", collapsed ? "pl-[64px]" : "pl-[240px]")}>
                    <main className="min-h-screen pt-[64px]">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
