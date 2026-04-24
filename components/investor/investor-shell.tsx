"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { InvestorHeader } from "@/components/investor/investor-header";
import { AuthGuard } from "@/components/auth-guard";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { GetInvestorProfile } from "@/services/investor/investor.api";

const routeLabels: Record<string, string> = {
  investor: "Workspace",
  profile: "Hồ sơ Nhà đầu tư",
  edit: "Chỉnh sửa",
  info: "Thông tin cơ bản",
  thesis: "Kế hoạch & Tiêu chí",
  matching: "AI Matching",
  startups: "Khám phá Startup",
  watchlist: "Watchlist",
  recommendations: "Gợi ý AI",
  "ai-chatbot": "AI Chatbot",
  kyc: "Xác thực KYC",
  status: "Trạng thái",
  messaging: "Tin nhắn",
  "issue-reports": "Báo cáo của tôi",
  notifications: "Thông báo",
  settings: "Cài đặt",
  connections: "Kết nối",
};

function InvestorBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const skipSegments = new Set(["edit"]);

  const crumbs = segments
    .filter((seg) => !skipSegments.has(seg))
    .map((seg, i, arr) => {
      const originalIndex = segments.indexOf(seg);
      const href = "/" + segments.slice(0, originalIndex + 1).join("/");
      const label = routeLabels[seg] ?? (/^\d+$/.test(seg) ? "Chi tiết" : seg);
      const isLast = i === arr.length - 1;
      return { href, label, isLast };
    });

  if (crumbs.length <= 1 || pathname.includes("/onboard") || pathname.includes("/ai-chatbot")) return null;

  return (
    <nav className="mb-6 flex items-center gap-1 text-[13px]">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.href}>
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />}
          {crumb.isLast ? (
            <span className="font-medium text-slate-700">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-slate-400 transition-colors hover:text-slate-600">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

type InvestorShellProps = {
  children: React.ReactNode;
};

export function InvestorShell({ children }: InvestorShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnboarding = pathname.includes("/onboard");
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await GetInvestorProfile();

        if (!res.success && !res.isSuccess) {
          if (!isOnboarding) {
            router.replace("/investor/onboard");
          }
          return;
        }

        if (res.data) {
          if (isOnboarding) {
            router.replace("/investor");
          }
          return;
        }

        if (!isOnboarding) {
          router.replace("/investor/onboard");
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (!isOnboarding && (status === 404 || status === 400)) {
          router.replace("/investor/onboard");
        }
      } finally {
        setIsCheckingProfile(false);
      }
    };

    void checkProfile();
  }, [isOnboarding, router]);

  return (
    <AuthGuard allowedRoles={["Investor"]}>
      {isCheckingProfile ? (
        <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6] text-[#171611]">
          <Loader2 className="h-8 w-8 animate-spin text-[#e6cc4c]" />
        </div>
      ) : (
        <div
          className={cn(
            "min-h-screen bg-[#f8f8f6] font-be-vietnam-pro text-[#171611] selection:bg-[#e6cc4c]/30",
            isOnboarding && "h-screen overflow-hidden",
          )}
        >
          {!isOnboarding && (
            <>
              <InvestorHeader />
              <div className="h-[64px]" />
            </>
          )}
          <main
            className={cn(
              "mx-auto min-h-[calc(100vh-64px)] w-full max-w-[1440px] px-6 pb-12 pt-8",
              isOnboarding && "h-screen max-w-full overflow-hidden px-0 pb-0 pt-0",
            )}
          >
            {!isOnboarding && <InvestorBreadcrumb />}
            {children}
          </main>
        </div>
      )}
    </AuthGuard>
  );
}
