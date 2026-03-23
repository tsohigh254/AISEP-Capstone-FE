"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { KycSubmitForm } from "@/components/startup/kyc-submit-form";
import { getMockKycStatus, StartupKycCase } from "@/services/startup/startup-kyc.mock";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KycResubmitPage() {
  const router = useRouter();
  const [kycCase, setKycCase] = useState<StartupKycCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMockKycStatus("PENDING_MORE_INFO").then((res) => {
      setKycCase(res);
      setLoading(false);
    });
  }, []);

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
      <div className="max-w-[1000px] mx-auto space-y-6 pb-20">
        <Link 
          href="/startup/verification/status" 
          className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại trạng thái
        </Link>
        
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Cập nhật hồ sơ xác minh</h1>
          <p className="text-[14px] text-slate-500">Vui lòng bổ sung các tài liệu còn thiếu hoặc đính kèm lại theo yêu cầu của AISEP.</p>
        </div>

        <KycSubmitForm initialData={kycCase} isResubmit />
      </div>
    </StartupShell>
  );
}
