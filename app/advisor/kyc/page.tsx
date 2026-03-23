"use client";

import React, { useState, useEffect } from "react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { KYCHub } from "@/components/advisor/kyc/kyc-hub";
import { KYCWizard } from "@/components/advisor/kyc/kyc-wizard";
import { GetKYCStatus, SubmitKYC, SaveKYCDraft, ResubmitKYC } from "@/services/advisor/advisor-kyc.api";
import { IAdvisorKYCStatus, IAdvisorKYCSubmission } from "@/types/advisor-kyc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdvisorKYCPage() {
  const [view, setView] = useState<"HUB" | "WIZARD" | "RESUBMIT">("HUB");
  const [status, setStatus] = useState<IAdvisorKYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await GetKYCStatus();
      if (res.isSuccess && res.data) {
        setStatus(res.data);
      }
    } catch {
      toast.error("Không thể tải trạng thái KYC. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleSubmit = async (formData: FormData) => {
    if (view === "RESUBMIT") {
      await ResubmitKYC(formData);
    } else {
      await SubmitKYC(formData);
    }
    await fetchStatus();
    setView("HUB");
    toast.success("Hồ sơ đã được gửi thành công!");
  };

  const handleSaveDraft = async (data: Partial<IAdvisorKYCSubmission>) => {
    try { await SaveKYCDraft(data); } catch { /* silent */ }
  };

  if (isLoading) {
    return (
      <AdvisorShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#e6cc4c]" />
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Đang tải hồ sơ...</p>
        </div>
      </AdvisorShell>
    );
  }

  return (
    <AdvisorShell>
      <div className="py-4 md:py-6">
        {view === "HUB" && status && (
          <KYCHub
            status={status}
            onStart={() => setView("WIZARD")}
            onContinue={() => setView("WIZARD")}
            onResubmit={() => setView("RESUBMIT")}
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
    </AdvisorShell>
  );
}
