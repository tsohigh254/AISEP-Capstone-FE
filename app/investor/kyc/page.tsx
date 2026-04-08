"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { KYCHub } from "@/components/investor/kyc/kyc-hub";
import { KYCWizard } from "@/components/investor/kyc/kyc-wizard";
import { resolveInvestorCategory } from "@/lib/investor-profile-presenter";
import { GetInvestorProfile } from "@/services/investor/investor.api";
import {
  GetInvestorKYCStatus,
  ResubmitInvestorKYC,
  SaveInvestorKYCDraft,
  SubmitInvestorKYC,
} from "@/services/investor/investor-kyc";
import type { IInvestorKYCStatus, IInvestorKYCSubmission } from "@/types/investor-kyc";

export default function InvestorKYCPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"HUB" | "WIZARD" | "RESUBMIT">("HUB");
  const [status, setStatus] = useState<IInvestorKYCStatus | null>(null);
  const [profileInvestorType, setProfileInvestorType] = useState<
    "INSTITUTIONAL" | "INDIVIDUAL_ANGEL" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);

      try {
        const res = await GetInvestorKYCStatus();
        if (res.isSuccess && res.data) {
          setStatus(res.data);
          const resolvedCategory = resolveInvestorCategory(undefined, res.data);
          if (resolvedCategory) {
            setProfileInvestorType(resolvedCategory);
          }
        } else if (
          !res.isSuccess &&
          (res.error?.code === "INVESTOR_PROFILE_NOT_FOUND" ||
            res.statusCode === 404 ||
            res.statusCode === 400)
        ) {
          if (!silent) {
            toast.info("Bạn cần khởi tạo hồ sơ nhà đầu tư trước khi xác thực.");
            router.push("/investor/onboard");
          }
        }
      } catch {
        if (!silent) {
          toast.error("Không thể tải trạng thái KYC. Vui lòng kiểm tra lại kết nối.");
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void fetchStatus();

    void GetInvestorProfile().then((res) => {
      const data = res as unknown as IBackendRes<IInvestorProfile>;
      if (data.isSuccess && data.data) {
        const resolvedCategory = resolveInvestorCategory(data.data, undefined);
        if (resolvedCategory) {
          setProfileInvestorType((prev) => prev || resolvedCategory);
        }
      }
    });
  }, [fetchStatus]);

  useEffect(() => {
    if (!isLoading && status && searchParams.get("resubmit") === "1") {
      const canResubmit =
        status.workflowStatus === "VERIFICATION_FAILED" ||
        status.workflowStatus === "PENDING_MORE_INFO";
      if (canResubmit) {
        setView("RESUBMIT");
      }
      router.replace("/investor/kyc");
    }
  }, [isLoading, router, searchParams, status]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    const isPending =
      status?.workflowStatus === "PENDING_REVIEW" ||
      status?.workflowStatus === "PENDING_MORE_INFO";

    if (isPending && view === "HUB") {
      interval = setInterval(() => {
        void fetchStatus(true);
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchStatus, status?.workflowStatus, view]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const res =
        view === "RESUBMIT"
          ? await ResubmitInvestorKYC(formData)
          : await SubmitInvestorKYC(formData);

      if (!res.isSuccess) {
        toast.error(res.message || "Gửi hồ sơ thất bại. Vui lòng kiểm tra lại thông tin.");
        return;
      }

      await fetchStatus();
      setView("HUB");
      toast.success("Hồ sơ KYC của bạn đã được gửi thành công!");
    } catch {
      toast.error("Gửi hồ sơ thất bại. Vui lòng thử lại sau.");
    }
  };

  const handleSaveDraft = async (data: Partial<IInvestorKYCSubmission>) => {
    try {
      await SaveInvestorKYCDraft(data);
    } catch {
      // silent
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-[#e6cc4c]" />
          <div className="absolute inset-0 animate-pulse bg-[#e6cc4c]/20 blur-xl" />
        </div>
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400 animate-pulse">
          Đang tải hồ sơ bảo mật...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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
          profileInvestorType={profileInvestorType}
          onCancel={() => setView("HUB")}
          onSubmit={handleSubmit}
          onSaveStep={handleSaveDraft}
        />
      )}
    </div>
  );
}
