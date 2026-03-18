"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StartupHeader } from "@/components/startup/startup-header";
import { Button } from "@/components/ui/button";
import {
  Bell,
  FileText,
  LayoutDashboard,
  Sparkles,
  User,
  Users,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { AuthGuard } from "@/components/auth-guard";

type StartupShellProps = {
  children: React.ReactNode;
};

export function StartupShell({ children }: StartupShellProps) {
  return (
    <AuthGuard allowedRoles={["Startup"]}>
      <div className="min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro selection:bg-[#e6cc4c]/30">
        <StartupHeader />
        <div className="h-[80px]" />
        <main className="min-h-[calc(100vh-80px)] pb-12 w-full max-w-[1440px] mx-auto px-6 pt-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
