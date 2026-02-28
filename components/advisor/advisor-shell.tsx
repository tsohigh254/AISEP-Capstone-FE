"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdvisorHeader } from "@/components/advisor/advisor-header";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageSquare,
  Star,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { Logout } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/advisor" },
  { label: "Consulting Request", icon: MessageSquare, href: "/advisor/requests" },
  { label: "Rating", icon: Star, href: "/advisor/feedback" },
  { label: "Report", icon: FileText, href: "/advisor/reports" },
];

type AdvisorShellProps = {
  children: React.ReactNode;
};

export function AdvisorShell({ children }: AdvisorShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();

  const isActive = (href: string) => {
    if (href === "/advisor") return pathname === "/advisor";
    return pathname.startsWith(href);
  };

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
    } catch (e) {
      console.error(e);
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdvisorHeader
        onProfileClick={handleProfileClick}
        onPasswordChangeClick={handlePasswordChangeClick}
        onLogout={handleLogout}
      />
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-68px)] flex flex-col">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    active
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="mt-auto p-3">
            <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Pro Tip</span>
              </div>
              <p className="text-sm text-slate-600">
                Sử dụng AI để phân tích và cải thiện hồ sơ của bạn
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
