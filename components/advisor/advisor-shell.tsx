"use client";

import { useRouter } from "next/navigation";
import { AdvisorHeader } from "@/components/advisor/advisor-header";
import { Logout } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";
import { AuthGuard } from "@/components/auth-guard";
import React from "react";

type AdvisorShellProps = {
  children: React.ReactNode;
};

export function AdvisorShell({ children }: AdvisorShellProps) {
  const router = useRouter();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();

  const handleProfileClick = () => {
    router.push("/advisor/profile");
  };

  const handlePasswordChangeClick = () => {
    router.push("/advisor/profile?tab=password");
  };

  const handleLogout = async () => {
    try {
      const res = await Logout();

      if (!res.success) {
        console.error(res.message || "Logout không thành công");
      }
    } catch (e: any) {
      // Suppress 401 errors during logout as the session might already be dead
      if (e?.response?.status !== 401) {
        console.error(e);
      }
    } finally {
      setUser(undefined);
      setAccessToken(undefined);
      setIsAuthen(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      router.push("/auth/login");
    }
  };

  return (
    <AuthGuard allowedRoles={["Advisor"]}>
      <div className="min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro selection:bg-[#e6cc4c]/30">
        <AdvisorHeader
          onProfileClick={handleProfileClick}
          onPasswordChangeClick={handlePasswordChangeClick}
          onLogout={handleLogout}
        />
        <div className="h-[73px]" />
        <main className="min-h-[calc(100vh-73px)] pb-12 w-full max-w-[1440px] mx-auto px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
