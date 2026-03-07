"use client";

import { AdminSidebar } from "./admin-sidebar";
import React from "react";

interface AdminShellProps {
    children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
    return (
        <div className="min-h-screen bg-[#f8f8f6] font-manrope selection:bg-[#e6cc4c]/30">
            <AdminSidebar />
            <div className="pl-[280px]">
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
