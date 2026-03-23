"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import React from "react";
import { AdvisorHeader } from "@/components/advisor/advisor-header";
import { AuthGuard } from "@/components/auth-guard";

const routeLabels: Record<string, string> = {
  advisor: "Workspace",
  profile: "Hồ sơ Advisor",
  requests: "Yêu cầu tư vấn",
  schedule: "Lịch tư vấn",
  onboarding: "Đăng ký hồ sơ",
  kyc: "KYC & Xác thực",
  messaging: "Tin nhắn",
  notifications: "Thông báo",
  settings: "Cài đặt",
  availability: "Lịch rảnh",
  reports: "Báo cáo tư vấn",
};

function AdvisorBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = routeLabels[seg] ?? (
      /^\d+$/.test(seg) || /^req-/.test(seg) || /^rep-/.test(seg) || seg === "create"
        ? (seg === "create" ? "Tạo mới" : "Chi tiết")
        : seg
    );
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 mb-5 text-[12px]">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
          {crumb.isLast ? (
            <span className="text-slate-700 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-slate-400 hover:text-slate-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

type AdvisorShellProps = {
  children: React.ReactNode;
};

export function AdvisorShell({ children }: AdvisorShellProps) {
  return (
    <AuthGuard allowedRoles={["Advisor"]}>
      <div className="min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro selection:bg-[#e6cc4c]/30">
        <AdvisorHeader />
        <div className="h-[64px]" />
        <main className="min-h-[calc(100vh-64px)] pb-12 w-full max-w-[1440px] mx-auto px-6 pt-8">
          <AdvisorBreadcrumb />
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
