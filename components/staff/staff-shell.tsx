"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import React from "react";
import { StaffHeader } from "./staff-header";
import { StaffSidebar } from "./staff-sidebar";
import { StaffHelpDrawer } from "./staff-help-drawer";
import { AuthGuard } from "@/components/auth-guard";

const routeLabels: Record<string, string> = {
  staff: "Vận hành",
  activity: "Giám sát nền tảng",
  kyc: "Xét duyệt KYC",
  "ai-exceptions": "AI Exceptions",
  complaints: "Khiếu nại & Tranh chấp",
  "profile-changes": "Thay đổi hồ sơ",
  "issue-reports": "Báo cáo sự cố",
  "consulting-ops": "Vận hành tư vấn",
  "payment-ops": "Vận hành thanh toán",
  profile: "Hồ sơ cá nhân",
};

function StaffBreadcrumb() {
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

  if (crumbs.length <= 1 || pathname === "/staff/profile" || pathname === "/staff/settings" || pathname === "/staff/notifications") return null;

  return (
    <nav className="flex items-center gap-1.5 mb-6 text-[12px] font-plus-jakarta-sans">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
          {crumb.isLast ? (
            <span className="text-slate-700 font-bold">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-slate-400 hover:text-slate-600 transition-colors font-medium cursor-pointer">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

type StaffShellProps = {
  children: React.ReactNode;
};

export function StaffShell({ children }: StaffShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  return (
    <AuthGuard allowedRoles={["Staff"]}>
      <div className="min-h-screen bg-[#f8f8f8] text-[#171611] font-manrope selection:bg-[#eec54e]/30">
        <StaffSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <StaffHelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        
        <div className="lg:pl-[280px] flex flex-col min-h-screen relative transition-all duration-300">
          <StaffHeader 
            onMenuClick={() => setIsSidebarOpen(true)} 
            onHelpClick={() => setIsHelpOpen(true)}
          />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full animate-in fade-in duration-500 overflow-x-hidden">
            <StaffBreadcrumb />
            {children}
          </main>
          
        </div>
      </div>
    </AuthGuard>
  );
}
