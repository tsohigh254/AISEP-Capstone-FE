"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import React, { Suspense } from "react";
import { AdvisorHeader } from "@/components/advisor/advisor-header";
import { AuthGuard } from "@/components/auth-guard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GetAdvisorProfile } from "@/services/advisor/advisor.api";
import { Loader2 } from "lucide-react";

const routeLabels: Record<string, string> = {
  advisor: "Workspace",
  profile: "Hồ sơ Advisor",
  requests: "Yêu cầu tư vấn",
  schedule: "Lịch tư vấn",
  onboarding: "Đăng ký hồ sơ",
  kyc: "KYC & Xác thực",
  submit: "Nộp hồ sơ xác thực",
  resubmit: "Cập nhật hồ sơ",
  status: "Trạng thái chi tiết",
  messaging: "Tin nhắn",
  "issue-reports": "Báo cáo của tôi",
  notifications: "Thông báo",
  settings: "Cài đặt",
  availability: "Lịch rảnh",
  edit: "Chỉnh sửa",
  reports: "Báo cáo tư vấn",
  wallet: "Ví",
  startups: "Hồ sơ Startup",
  feedback: "Đánh giá",
};

// Các path không có trang listing — hiển thị text thay vì link
const NO_LINK_PATHS = new Set(["/advisor/startups"]);

function AdvisorBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segments = pathname.split("/").filter(Boolean);

  // /advisor/startups/[id]?from=[requestId] — dựng breadcrumb đầy đủ từ context
  const isStartupDetail =
    segments.length === 3 &&
    segments[0] === "advisor" &&
    segments[1] === "startups" &&
    /^\d+$/.test(segments[2]);

  if (isStartupDetail) {
    const fromRequestId = searchParams.get("from");
    const crumbs = [
      { href: "/advisor", label: "Workspace", isLast: false, linked: true },
      { href: "/advisor/requests", label: "Yêu cầu tư vấn", isLast: false, linked: true },
      ...(fromRequestId
        ? [{ href: `/advisor/requests/${fromRequestId}`, label: "Chi tiết", isLast: false, linked: true }]
        : []),
      { href: pathname, label: "Hồ sơ Startup", isLast: true, linked: false },
    ];

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

  // Breadcrumb mặc định cho các route khác
  const crumbs = segments
    .map((seg, i) => {
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
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isOnboardingRoute = pathname === "/advisor/onboard";

    GetAdvisorProfile()
      .then((res: any) => {
        const data = res as unknown as IBackendRes<any>;
        const hasProfile = Boolean((data.success || data.isSuccess) && data.data);

        if (isOnboardingRoute) {
          if (hasProfile) {
            router.replace("/advisor");
            return;
          }

          setChecking(false);
          return;
        }

        if (hasProfile) {
          setChecking(false);
          return;
        }

        router.replace("/advisor/onboard");
      })
      .catch((err: any) => {
        const status = err?.response?.status;

        if (isOnboardingRoute) {
          setChecking(false);
          return;
        }

        if (status === 404 || status === 400) {
          router.replace("/advisor/onboard");
        } else {
          setChecking(false);
        }
      });
  }, [pathname, router]);

  if (checking && pathname !== "/advisor/onboard") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#eec54e] animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Đang tải Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["Advisor"]}>
      <div className="min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro selection:bg-[#e6cc4c]/30">
        <AdvisorHeader />
        <div className="h-[64px]" />
        <main className="min-h-[calc(100vh-64px)] pb-12 w-full max-w-[1440px] mx-auto px-6 pt-8">
          <Suspense fallback={null}>
            <AdvisorBreadcrumb />
          </Suspense>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
