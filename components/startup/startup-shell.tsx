"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StartupHeader } from "@/components/startup/startup-header";
import { ChevronRight } from "lucide-react";
import React from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GetStartupProfile } from "@/services/startup/startup.api";
import { Loader2 } from "lucide-react";

const routeLabels: Record<string, string> = {
  startup: "Workspace",
  "startup-profile": "Hồ sơ Startup",
  investors: "Nhà đầu tư",
  "ai-evaluation": "Đánh giá AI",
  request: "Yêu cầu đánh giá",
  score: "Điểm tiềm năng",
  history: "Lịch sử đánh giá",
  experts: "Cố vấn & Chuyên gia",
  "mentorship-requests": "Yêu cầu tư vấn",
  "confirm-schedule": "Xác nhận lịch hẹn",
  checkout: "Thanh toán",
  result: "Kết quả thanh toán",
  payments: "Lịch sử thanh toán",
  report: "Báo cáo tư vấn",
  feedback: "Gửi đánh giá",
  documents: "Tài liệu & IP",
  messaging: "Tin nhắn",
  notifications: "Thông báo",
  settings: "Cài đặt",
  info: "Thông tin cơ bản",
  business: "Kinh doanh & Thị trường",
  funding: "Gọi vốn",
  team: "Đội ngũ & Xác thực",
  visibility: "Hiển thị",
  kyc: "KYC & Xác thực",
  verification: "Xác minh",
  requirements: "Yêu cầu hồ sơ",
  submit: "Nộp hồ sơ",
  status: "Trạng thái",
  resubmit: "Gửi lại hồ sơ",
};

function StartupBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = routeLabels[seg] ?? (/^\d+$/.test(seg) ? "Chi tiết" : seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  if (crumbs.length <= 1) return null;

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

type StartupShellProps = {
  children: React.ReactNode;
};

export function StartupShell({ children }: StartupShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Only guard if NOT already on the onboard page
    if (pathname === "/startup/onboard") {
      setChecking(false);
      return;
    }

    GetStartupProfile()
      .then((res) => {
        const data = res as unknown as IBackendRes<IStartupProfile | null>;
        if (!data.success && !data.isSuccess) {
          router.replace("/startup/onboard");
        } else if (data.data === null || data.data?.profileStatus === "Draft") {
          // Backend now returns 200 with data:null when the startup profile does not exist yet.
          router.replace("/startup/onboard");
        } else {
          setChecking(false);
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404 || status === 400) {
          router.replace("/startup/onboard");
        } else {
          // Other errors (server down?), maybe let them through or show error
          setChecking(false); 
        }
      });
  }, [pathname, router]);

  if (checking && pathname !== "/startup/onboard") {
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
    <AuthGuard allowedRoles={["Startup"]}>
      <div className="min-h-screen bg-[#f8f8f6] text-[#171611] font-be-vietnam-pro selection:bg-[#e6cc4c]/30">
        <StartupHeader />
        <div className="h-[64px]" />
        <main className="min-h-[calc(100vh-64px)] pb-12 w-full max-w-[1440px] mx-auto px-6 pt-8">
          <StartupBreadcrumb />
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
