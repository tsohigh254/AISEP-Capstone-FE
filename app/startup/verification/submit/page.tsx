"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { StartupShell } from "@/components/startup/startup-shell";
import { KycSubmitForm } from "@/components/startup/kyc-submit-form";
import { GetStartupKYCStatus, StartupKycCase } from "@/services/startup/startup-kyc.api";

export default function KycSubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<StartupKycCase | null>(null);

  useEffect(() => {
    GetStartupKYCStatus()
      .then((res) => {
        const data = res as unknown as IBackendRes<StartupKycCase>;
        if ((data.success || data.isSuccess) && data.data) {
          const kycCase = data.data;
          if (kycCase.workflowStatus === "NOT_SUBMITTED" || kycCase.workflowStatus === "DRAFT") {
            setInitialData(kycCase);
            return;
          }
          if (kycCase.workflowStatus === "PENDING_MORE_INFO" || kycCase.workflowStatus === "REJECTED" || kycCase.workflowStatus === "SUPERSEDED") {
            router.replace("/startup/verification/resubmit");
            return;
          }
          router.replace("/startup/verification/status");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <StartupShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
        <Link
          href="/startup/verification"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại tổng quan
        </Link>

        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Xác minh danh tính Startup</h1>
          <p className="text-[14px] text-slate-500">
            Cung cấp thông tin KYC theo đúng contract hiện tại của hệ thống và gửi bằng biểu mẫu đa phần `multipart/form-data`.
          </p>
        </div>

        <KycSubmitForm initialData={initialData} />
      </div>
    </StartupShell>
  );
}
