"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { KYCWizard } from "@/components/advisor/kyc/kyc-wizard";
import { GetAdvisorKYCStatus, SaveAdvisorKYCDraft, SubmitAdvisorKYC } from "@/services/advisor/advisor.api";
import { IAdvisorKYCStatus, IAdvisorKYCSubmission } from "@/types/advisor-kyc";

type AdvisorKycWizardMode = "submit" | "resubmit";

async function fetchAdvisorKycStatus(): Promise<IAdvisorKYCStatus> {
  const res = await GetAdvisorKYCStatus();
  const data = res as unknown as IBackendRes<IAdvisorKYCStatus>;
  if ((data.success || data.isSuccess) && data.data) {
    return data.data;
  }
  throw new Error("Failed to fetch advisor KYC status");
}

function mapAdvisorDraftPayload(data: Partial<IAdvisorKYCSubmission>) {
  const payload: Record<string, unknown> = {};
  if (data.fullName) payload.fullName = data.fullName;
  if (data.currentRoleTitle) payload.title = data.currentRoleTitle;
  if (data.bio) payload.bio = data.bio;
  if (data.professionalProfileLink) payload.linkedInURL = data.professionalProfileLink;
  if (data.mentorshipPhilosophy) payload.mentorshipPhilosophy = data.mentorshipPhilosophy;
  if (data.contactEmail) payload.contactEmail = data.contactEmail;
  if (data.currentOrganization) payload.currentOrganization = data.currentOrganization;
  if (data.primaryExpertise) payload.primaryExpertise = data.primaryExpertise;
  if (data.secondaryExpertise) payload.secondaryExpertise = data.secondaryExpertise;
  return payload;
}

export function AdvisorKycWizardScreen({ mode }: { mode: AdvisorKycWizardMode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: status, isLoading } = useQuery({
    queryKey: ["advisor-kyc-status"],
    queryFn: fetchAdvisorKycStatus,
    staleTime: 0,
    refetchInterval: 10000,
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => SubmitAdvisorKYC(formData),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["advisor-kyc-status"] });
      toast.success("Hồ sơ đã được gửi thành công.");
      router.replace("/advisor/kyc/status");
    },
    onError: () => {
      toast.error("Gửi hồ sơ thất bại. Vui lòng thử lại.");
    },
  });

  const draftMutation = useMutation({
    mutationFn: async (data: Partial<IAdvisorKYCSubmission>) => SaveAdvisorKYCDraft(mapAdvisorDraftPayload(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["advisor-kyc-status"] });
    },
  });

  useEffect(() => {
    if (!status) return;

    if (mode === "submit") {
      if (status.workflowStatus === "NOT_STARTED" || status.workflowStatus === "DRAFT") return;
      if (status.workflowStatus === "PENDING_MORE_INFO" || status.workflowStatus === "VERIFICATION_FAILED") {
        router.replace("/advisor/kyc/resubmit");
        return;
      }
      router.replace("/advisor/kyc/status");
      return;
    }

    if (status.workflowStatus === "PENDING_MORE_INFO" || status.workflowStatus === "VERIFICATION_FAILED") return;
    if (status.workflowStatus === "NOT_STARTED" || status.workflowStatus === "DRAFT") {
      router.replace("/advisor/kyc/submit");
      return;
    }
    router.replace("/advisor/kyc/status");
  }, [mode, router, status]);

  if (isLoading) {
    return (
      <AdvisorShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </AdvisorShell>
    );
  }

  if (!status) return null;

  const heading = mode === "resubmit" ? "Cập nhật hồ sơ xác thực Advisor" : "Xác thực Advisor";
  const description =
    mode === "resubmit"
      ? "Bổ sung thông tin và gửi lại hồ sơ theo nhận xét từ đội ngũ thẩm định."
      : "Cung cấp thông tin và bằng chứng chuyên môn để hoàn tất xác thực Advisor.";
  const backHref = mode === "resubmit" ? "/advisor/kyc/status" : "/advisor/kyc";
  const backLabel = mode === "resubmit" ? "Quay lại trạng thái" : "Quay lại tổng quan";

  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto space-y-6 pb-20">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </Link>

        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">{heading}</h1>
          <p className="text-[14px] text-slate-500">{description}</p>
        </div>

        <KYCWizard
          initialStatus={status}
          isResubmit={mode === "resubmit"}
          onCancel={() => router.push(backHref)}
          onSubmit={async (formData) => {
            await submitMutation.mutateAsync(formData);
          }}
          onSaveStep={async (data) => {
            await draftMutation.mutateAsync(data);
          }}
        />
      </div>
    </AdvisorShell>
  );
}
