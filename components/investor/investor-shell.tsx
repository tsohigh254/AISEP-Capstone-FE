"use client";

import React from "react";
import { InvestorHeader } from "@/components/investor/investor-header";
import { AuthGuard } from "@/components/auth-guard";

type InvestorShellProps = {
  children: React.ReactNode;
};

export function InvestorShell({ children }: InvestorShellProps) {
  return (
    <AuthGuard allowedRoles={["Investor"]}>
      <div className="min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro selection:bg-[#e6cc4c]/30">
        <InvestorHeader />
        <div className="h-[80px]" />
        <main className="min-h-[calc(100vh-80px)] pb-12 w-full max-w-[1440px] mx-auto px-6 pt-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
