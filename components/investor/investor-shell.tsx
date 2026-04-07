"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { InvestorHeader } from "@/components/investor/investor-header";
import { AuthGuard } from "@/components/auth-guard";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
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
  notifications: "Thông báo",
  settings: "Cài đặt",
  connections: "Kết nối",
};

function InvestorBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const SKIP_SEGMENTS = new Set(["edit"]);

  const crumbs = segments
    .filter(seg => !SKIP_SEGMENTS.has(seg))
    .map((seg, i, arr) => {
      const originalIndex = segments.indexOf(seg);
      const href = "/" + segments.slice(0, originalIndex + 1).join("/");
      const label = routeLabels[seg] ?? (/^\d+$/.test(seg) ? "Chi tiết" : seg);
      const isLast = i === arr.length - 1;
      return { href, label, isLast };
    });

  if (crumbs.length <= 1 || pathname.includes("/onboard")) return null;

  return (
    <nav className="flex items-center gap-1 mb-6 text-[13px]">
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

type InvestorShellProps = {
  children: React.ReactNode;
};

export function InvestorShell({ children }: InvestorShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnboarding = pathname.includes("/onboard");
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    // Only check if not already on onboarding page
    if (isOnboarding) {
        setIsCheckingProfile(false);
        return;
    }

    const checkProfile = async () => {
      try {
        const res = await GetInvestorProfile();
        const data = res as unknown as IBackendRes<any>;
        
        if (!data.success && !data.isSuccess) {
           router.replace("/investor/onboard");
        } else if (!data.data || data.data.profileStatus === "Draft") {
           router.replace("/investor/onboard");
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404 || status === 400) {
          router.replace("/investor/onboard");
        }
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [isOnboarding, router]);

  return (
    <AuthGuard allowedRoles={["Investor"]}>
      <div className={cn(
        "min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro selection:bg-[#e6cc4c]/30",
        isOnboarding && "h-screen overflow-hidden"
      )}>
        {!isOnboarding && (
          <>
            <InvestorHeader />
            <div className="h-[80px]" />
          </>
        )}
        <main className={cn(
          "min-h-[calc(100vh-80px)] pb-12 w-full max-w-[1440px] mx-auto px-6 pt-8",
          isOnboarding && "h-screen pt-0 pb-0 px-0 max-w-full overflow-hidden"
        )}>
          {!isOnboarding && <InvestorBreadcrumb />}
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
