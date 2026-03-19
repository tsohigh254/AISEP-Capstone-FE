"use client";

import React from "react";
import { AdvisorHeader } from "@/components/advisor/advisor-header";
import { AuthGuard } from "@/components/auth-guard";

type AdvisorShellProps = {
  children: React.ReactNode;
};

export function AdvisorShell({ children }: AdvisorShellProps) {
  return (
    <AuthGuard allowedRoles={["Advisor"]}>
      <div className="min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro selection:bg-[#e6cc4c]/30">
        <AdvisorHeader />
        <div className="h-[80px]" />
        <main className="min-h-[calc(100vh-80px)] pb-12 w-full max-w-[1440px] mx-auto px-6 pt-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
