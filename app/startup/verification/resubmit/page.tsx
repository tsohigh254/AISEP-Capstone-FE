"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StartupShell } from "@/components/startup/startup-shell";
import { KycSubmitForm } from "@/components/startup/kyc-submit-form";
import {
  GetStartupKYCStatus,
  StartupKycCase,
} from "@/services/startup/startup-kyc.api";

export default function KycResubmitPage() {
  const router = useRouter();
  const [kycCase, setKycCase] = useState<StartupKycCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetStartupKYCStatus()
      .then((res) => {
        const data = res as unknown as IBackendRes<StartupKycCase>;
        if ((data.success || data.isSuccess) && data.data) {
          const nextCase = data.data;

          if (
            nextCase.workflowStatus === "PENDING_MORE_INFO" ||
            nextCase.workflowStatus === "REJECTED" ||
            nextCase.workflowStatus === "SUPERSEDED"
          ) {
            setKycCase(nextCase);
            return;
          }

          if (
            nextCase.workflowStatus === "NOT_SUBMITTED" ||
            nextCase.workflowStatus === "DRAFT"
          ) {
            router.replace("/startup/verification/submit");
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
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  if (!kycCase) return null;

  return (
    <StartupShell>
      <div className="mx-auto max-w-[1100px] space-y-6 pb-20">
        <Link
          href="/startup/verification/status"
          className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại trạng thái
        </Link>

        <div className="space-y-1">
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
            Cập nhật hồ sơ xác minh
          </h1>
          <p className="text-[14px] text-slate-500">
            Bổ sung thông tin và tài liệu theo đúng yêu cầu của workflow KYC
            đang hoạt động.
          </p>
        </div>

        <KycSubmitForm initialData={kycCase} isResubmit />
      </div>
    </StartupShell>
  );
}
