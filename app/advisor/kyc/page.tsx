"use client";

import React, { useState, useEffect } from "react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { KYCHub } from "@/components/advisor/kyc/kyc-hub";
import { KYCWizard } from "@/components/advisor/kyc/kyc-wizard";
import { GetAdvisorKYCStatus, SubmitAdvisorKYC, SaveAdvisorKYCDraft } from "@/services/advisor/advisor.api";
import { IAdvisorKYCStatus, IAdvisorKYCSubmission } from "@/types/advisor-kyc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdvisorKYCPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"HUB" | "WIZARD" | "RESUBMIT">("HUB");

  const { data: status, isLoading: queryLoading } = useQuery({
    queryKey: ["advisor-kyc-status"],
    queryFn: async () => {
      const res = await GetAdvisorKYCStatus();
      const data = res as unknown as IBackendRes<any>;
      if ((data.success || data.isSuccess) && data.data) return data.data;
      throw new Error("Failed to fetch status");
    },
    staleTime: 0,
    refetchInterval: 10000
  });

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Map FormData to the standardized SubmitAdvisorKYCRequest
      const payload = {
        fullName: formData.get("fullName"),
        title: formData.get("currentRoleTitle"),
        bio: formData.get("bio"),
        linkedInURL: formData.get("professionalProfileLink"),
        mentorshipPhilosophy: formData.get("mentorshipPhilosophy"),
        contactEmail: formData.get("contactEmail"),
      };
      return SubmitAdvisorKYC(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-kyc-status"] });
      setView("HUB");
      toast.success("Hồ sơ đã được gửi thành công!");
    },
    onError: () => {
      toast.error("Gửi hồ sơ thất bại. Vui lòng thử lại.");
    }
  });

  const draftMutation = useMutation({
    mutationFn: (data: Partial<IAdvisorKYCSubmission>) => {
      // Map partial submission data to the standardized SaveAdvisorKYCDraftRequest
      const payload: any = {};
      if (data.fullName) payload.fullName = data.fullName;
      if (data.currentRoleTitle) payload.title = data.currentRoleTitle;
      if (data.bio) payload.bio = data.bio;
      if (data.professionalProfileLink) payload.linkedInURL = data.professionalProfileLink;
      if (data.mentorshipPhilosophy) payload.mentorshipPhilosophy = data.mentorshipPhilosophy;
      if (data.contactEmail) payload.contactEmail = data.contactEmail;
      
      return SaveAdvisorKYCDraft(payload);
    }
  });

  const handleSubmit = async (formData: FormData) => {
    submitMutation.mutate(formData);
  };

  const handleSaveDraft = async (data: Partial<IAdvisorKYCSubmission>) => {
    draftMutation.mutate(data);
  };

  if (queryLoading) {
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
