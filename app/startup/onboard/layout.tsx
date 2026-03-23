"use client";

import React from "react";
import { AuthGuard } from "@/components/auth-guard";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["Startup"]}>
      <div className="min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro flex flex-col items-center justify-center p-6 selection:bg-[#eec54e]/30">
        <div className="w-full max-w-[800px] animate-in fade-in slide-in-from-bottom-4 duration-700">
           {children}
        </div>
      </div>
    </AuthGuard>
  );
}
