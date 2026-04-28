"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeft } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { StaffHeader } from "./staff-header";
import { StaffSidebar } from "./staff-sidebar";
import { StaffHelpDrawer } from "./staff-help-drawer";
import { AuthGuard } from "@/components/auth-guard";

const routeLabels: Record<string, string> = {
  "master-data": "Danh mục dữ liệu",
  staff: "Vận hành",
  activity: "Giám sát nền tảng",
  kyc: "Xét duyệt KYC",
  complaints: "Khiếu nại & Tranh chấp",
  "issue-reports": "Báo cáo sự cố",
  "consulting-ops": "Vận hành tư vấn",
  "payment-ops": "Vận hành thanh toán",
  finance: "Quản lý tài chính",
  profile: "Hồ sơ cá nhân",
  history: "Lịch sử thẩm định",
  profiles: "Hồ sơ",
  startup: "Startup",
  advisor: "Advisor",
  investor: "Nhà đầu tư",
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

  if (
    crumbs.length <= 1 ||
    pathname === "/staff/profile" ||
    pathname === "/staff/settings" ||
    pathname === "/staff/notifications" ||
    /^\/staff\/profiles\//.test(pathname)
  ) return null;

  return (
    <nav className="flex items-center gap-1.5 px-8 pt-6 pb-4 text-[12px] font-plus-jakarta-sans">
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
  const [collapsed, setCollapsed] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  return (
    <AuthGuard allowedRoles={["Staff"]}>
      <div className="min-h-screen bg-[#f8f8f8] text-[#171611] font-manrope selection:bg-[#eec54e]/30">
        <StaffSidebar collapsed={collapsed} />
        <StaffHelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            "fixed top-[18px] z-[49] p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-300 shadow-sm",
            collapsed ? "left-[72px]" : "left-[248px]"
          )}
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          <PanelLeft className="w-3.5 h-3.5" />
        </button>
        
        <div className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          collapsed ? "pl-[64px]" : "pl-[240px]"
        )}>
          <StaffHeader onHelpClick={() => setIsHelpOpen(true)} />
          
          <main className="flex-1 overflow-x-hidden animate-in fade-in duration-500">
            <StaffBreadcrumb />
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
