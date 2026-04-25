"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { KYCHub } from "@/components/investor/kyc/kyc-hub";
import { GetInvestorKYCStatus } from "@/services/investor/investor-kyc";
import { IInvestorKYCStatus } from "@/types/investor-kyc";

const INVESTOR_KYC_STATUS_LOAD_ERROR_TOAST_ID = "investor-kyc-status-load-error";

export default function InvestorKYCStatusPage() {
  const router = useRouter();
  const [status, setStatus] = useState<IInvestorKYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GetInvestorKYCStatus()
      .then(res => {
        if (res.isSuccess && res.data) {
          setStatus(res.data);
        } else {
          toast.error("Không thể tải trạng thái KYC.", {
            id: INVESTOR_KYC_STATUS_LOAD_ERROR_TOAST_ID,
          });
          router.replace("/investor/kyc");
        }
      })
      .catch(() => {
        toast.error("Lỗi kết nối. Vui lòng thử lại.", {
          id: INVESTOR_KYC_STATUS_LOAD_ERROR_TOAST_ID,
        });
        router.replace("/investor/kyc");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-[#e6cc4c]" />
          <div className="absolute inset-0 blur-xl bg-[#e6cc4c]/20 animate-pulse" />
        </div>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Đang tải hồ sơ bảo mật...</p>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link
          href="/investor/kyc"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại tổng quan KYC
        </Link>
      </div>

      <KYCHub
        status={status}
        isDetailsRoute={true}
        onStart={() => router.push("/investor/kyc")}
        onContinue={() => router.push("/investor/kyc")}
        onResubmit={() => router.push("/investor/kyc?resubmit=1")}
      />
    </div>
  );
}
