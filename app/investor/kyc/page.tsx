"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KYCHub } from "@/components/investor/kyc/kyc-hub";
import { KYCWizard } from "@/components/investor/kyc/kyc-wizard";
import { GetInvestorKYCStatus, SubmitInvestorKYC, SaveInvestorKYCDraft, ResubmitInvestorKYC } from "@/services/investor/investor-kyc";
import { IInvestorKYCStatus, IInvestorKYCSubmission } from "@/types/investor-kyc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InvestorKYCPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"HUB" | "WIZARD" | "RESUBMIT">("HUB");
  const [status, setStatus] = useState<IInvestorKYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await GetInvestorKYCStatus();
      if (res.isSuccess && res.data) {
        setStatus(res.data);
      } else if (!res.isSuccess && (res.error?.code === "INVESTOR_PROFILE_NOT_FOUND" || res.statusCode === 404 || res.statusCode === 400)) {
        if (!silent) {
          toast.info("Bạn cần khởi tạo hồ sơ nhà đầu tư trước khi xác thực.");
          router.push("/investor/onboard");
        }
      }
    } catch {
      if (!silent) toast.error("Không thể tải trạng thái KYC. Vui lòng kiểm tra lại kết nối.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  useEffect(() => {
    if (!isLoading && status && searchParams.get("resubmit") === "1") {
      const canResubmit = status.workflowStatus === "VERIFICATION_FAILED" || status.workflowStatus === "PENDING_MORE_INFO";
      if (canResubmit) setView("RESUBMIT");
      router.replace("/investor/kyc");
    }
  }, [isLoading, status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isPending = status?.workflowStatus === "PENDING_REVIEW" || status?.workflowStatus === "PENDING_MORE_INFO";
    if (isPending && view === "HUB") {
      interval = setInterval(() => fetchStatus(true), 10000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [status?.workflowStatus, view]);

  const handleSubmit = async (formData: FormData) => {
    try {
      if (view === "RESUBMIT") await ResubmitInvestorKYC(formData);
      else await SubmitInvestorKYC(formData);
      await fetchStatus();
      setView("HUB");
      toast.success("Hồ sơ KYC của bạn đã được gửi thành công!");
    } catch {
      toast.error("Gửi hồ sơ thất bại. Vui lòng thử lại sau.");
    }
  };

  const handleSaveDraft = async (data: Partial<IInvestorKYCSubmission>) => {
    try { await SaveInvestorKYCDraft(data); } catch { /* silent */ }
  };

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {view === "HUB" && status && (
        <KYCHub
          status={status}
          onStart={() => setView("WIZARD")}
          onContinue={() => setView("WIZARD")}
          onResubmit={() => setView("RESUBMIT")}
          onViewStatus={() => router.push("/investor/kyc/status")}
        />
      )}
      {(view === "WIZARD" || view === "RESUBMIT") && status && (
        <KYCWizard
          initialStatus={status}
          isResubmit={view === "RESUBMIT"}
          onCancel={() => setView("HUB")}
          onSubmit={handleSubmit}
          onSaveStep={handleSaveDraft}
        />
      )}
    </div>
  );
}
