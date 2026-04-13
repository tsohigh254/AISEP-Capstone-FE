"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { KYCHub } from "@/components/advisor/kyc/kyc-hub";
import { GetAdvisorKYCStatus, GetAdvisorProfile } from "@/services/advisor/advisor.api";
import { IAdvisorKYCStatus } from "@/types/advisor-kyc";

async function fetchAdvisorProfile(): Promise<IAdvisorProfile> {
  const res = await GetAdvisorProfile();
  if ((res.success || res.isSuccess) && res.data) {
    return res.data;
  }
  throw new Error("Failed to fetch advisor profile");
}

async function fetchAdvisorKycStatus(): Promise<IAdvisorKYCStatus> {
  const res = await GetAdvisorKYCStatus();
  const data = res as unknown as IBackendRes<IAdvisorKYCStatus>;
  if ((data.success || data.isSuccess) && data.data) {
    return data.data;
  }
  throw new Error("Failed to fetch advisor KYC status");
}

export function AdvisorKycHubScreen() {
  const router = useRouter();
  const pathname = usePathname();
  
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["advisor-profile"],
    queryFn: fetchAdvisorProfile,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: status, isLoading: isStatusLoading } = useQuery({
    queryKey: ["advisor-kyc-status"],
    queryFn: fetchAdvisorKycStatus,
    staleTime: 0,
    refetchInterval: 10000,
  });

  const isLoading = isProfileLoading || isStatusLoading;

  if (isLoading) {
    return (
      <AdvisorShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#eec54e]" />
          <p className="text-[13px] font-bold uppercase tracking-widest text-slate-400">
            Đang tải hồ sơ...
          </p>
        </div>
      </AdvisorShell>
    );
  }

  if (!status) return null;

  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto space-y-4 py-4 md:py-6">
        <KYCHub
          status={status}
          profile={profile}
          isDetailsRoute={pathname === "/advisor/kyc/status"}
          onStart={() => router.push("/advisor/kyc/submit")}
          onContinue={() => router.push("/advisor/kyc/submit")}
          onResubmit={() => router.push("/advisor/kyc/resubmit")}
          onViewStatus={() => router.push("/advisor/kyc/status")}
        />
      </div>
    </AdvisorShell>
  );
}
