"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, Plus } from "lucide-react";

interface AdminHeaderProps {
    title: string;
    onAddClick?: () => void;
}

export function AdminHeader({ title, onAddClick }: AdminHeaderProps) {
    return (
        <header className="h-[100px] flex items-center justify-between px-10 bg-transparent border-none">
            <div className="flex flex-col">
                <h1 className="text-[32px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative border border-slate-100 dark:border-slate-800 shadow-sm">
                    <Bell className="size-5" />
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                </button>

                <Button onClick={onAddClick} className="h-12 px-8 rounded-xl bg-[#eec54e] hover:bg-[#d4ae3d] text-[#171611] font-black text-[14px] uppercase tracking-wider shadow-lg shadow-yellow-500/10 transition-all gap-3">
                    <Plus className="size-5" strokeWidth={3} />
                    <span>Thêm mới</span>
                </Button>
            </div>
        </header>
    );
}
