"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, LayoutDashboard, UserCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingLayout } from "@/components/investor/onboard/onboarding-layout";
import { OnboardingStepper } from "@/components/investor/onboard/onboarding-stepper";
import { InvestorTypeStep } from "@/components/investor/onboard/investor-type-step";
import { InvestorProfileStep } from "@/components/investor/onboard/investor-profile-step";
import { ProfilePreviewCard } from "@/components/investor/onboard/profile-preview-card";
import { WelcomeStep } from "@/components/investor/onboard/welcome-step";
import { OnboardingTimeline } from "@/components/investor/onboard/onboarding-timeline";
import { 
  GetInvestorKYCStatus, 
  SubmitInvestorKYC, 
  SaveInvestorKYCDraft 
} from "@/services/investor/investor-kyc";
import { CreateInvestorProfile, UpdateInvestorPreferences, UploadInvestorPhoto } from "@/services/investor/investor.api";
import { IInvestorKYCStatus, IInvestorOnboardData } from "@/types/investor-kyc";
import { normalizeInvestorPreferredStages } from "@/lib/investor-preferred-stages";

const TIMELINE_STEPS = [
  { n: 1, label: "Thông tin cơ bản" },
  { n: 2, label: "Hồ sơ chuyên sâu" },
];

export default function InvestorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState<IInvestorOnboardData>({
    preferredIndustries: [],
    preferredStages: [],
    acceptingConnectionsStatus: "OPEN",
    declarationAccepted: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const completeness = React.useMemo(() => {
    const checks = [
      Boolean(formData.investorCategory),
      Boolean(formData.displayName?.trim()),
      Boolean(formData.currentRoleTitle?.trim()),
      Boolean(formData.location?.trim()),
      Boolean(formData.website?.trim()),
      Boolean(formData.preferredIndustries?.length),
      Boolean(formData.preferredStages?.length),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [formData]);

  const timelineStep = step <= 2 ? 1 : 2;

  useEffect(() => {
    GetInvestorKYCStatus().then(res => {
      if (res.isSuccess && res.data?.submissionSummary) {
        const data = res.data.submissionSummary;
        setFormData(prev => ({
          ...prev,
          investorCategory: (data.investorCategory as any) ?? prev.investorCategory,
          fullName: data.fullName ?? prev.fullName,
          contactEmail: data.contactEmail ?? prev.contactEmail,
          organizationName: data.organizationName ?? prev.organizationName,
          currentRoleTitle: data.currentRoleTitle ?? prev.currentRoleTitle,
          location: data.location ?? prev.location,
          website: data.website ?? prev.website,
          linkedInURL: data.linkedInURL ?? prev.linkedInURL,
          taxIdOrBusinessCode: data.taxIdOrBusinessCode ?? prev.taxIdOrBusinessCode,
          submitterRole: data.submitterRole ?? prev.submitterRole,
        }));
      }
    });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 3) {
      const isInstitutional = formData.investorCategory === "INSTITUTIONAL";

      if (!formData.displayName?.trim())
        e.displayName = "Vui lòng nhập tên hiển thị";

      if (isInstitutional && !formData.fullName?.trim())
        e.fullName = "Vui lòng nhập họ và tên người đại diện";

      if (!formData.currentRoleTitle?.trim())
        e.currentRoleTitle = "Vui lòng nhập chức vụ";

      if (!formData.location?.trim())
        e.location = "Vui lòng nhập địa điểm hoạt động";

      if (!formData.shortThesisSummary?.trim())
        e.shortThesisSummary = "Vui lòng nhập khẩu vị đầu tư";

      if (!formData.preferredIndustries?.length)
        e.preferredIndustries = "Vui lòng chọn ít nhất 1 lĩnh vực";

      if (!formData.preferredStages?.length)
        e.preferredStages = "Vui lòng chọn ít nhất 1 giai đoạn";

      if (isInstitutional) {
        if (!formData.website?.trim())
          e.website = "Vui lòng nhập website";
      } else {
        if (!formData.linkedInURL?.trim())
          e.linkedInURL = "Vui lòng nhập LinkedIn";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      if (step === 3) {
        handleSubmit();
      } else {
        setStep(s => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      toast.error("Vui lòng hoàn thiện các thông tin bắt buộc");
      // Scroll to top of inner scrollable container so user sees which fields are invalid
      const scrollEl = document.querySelector("[data-onboard-scroll]");
      if (scrollEl) scrollEl.scrollTop = 0;
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isInstitutional = formData.investorCategory === "INSTITUTIONAL";
      const requestData: ICreateInvestor = {
        fullName: isInstitutional ? (formData.fullName || "") : (formData.displayName || formData.fullName || ""),
        firmName: isInstitutional ? formData.displayName : undefined,
        title: formData.currentRoleTitle,
        bio: formData.shortThesisSummary,
        investorType: formData.investorCategory,
        location: formData.location,
        website: isInstitutional ? formData.website : undefined,
        linkedInURL: !isInstitutional ? formData.linkedInURL : undefined,
        investmentThesis: formData.shortThesisSummary,
      };

      const res = await CreateInvestorProfile(requestData);
      if (!res.isSuccess) {
        toast.error(res.message || "Gặp lỗi khi tạo hồ sơ");
        return;
      }

      if (formData.avatarFile) {
        await UploadInvestorPhoto(formData.avatarFile).catch(() => {});
      }

      if (formData.preferredIndustries?.length || formData.preferredStages?.length) {
        await UpdateInvestorPreferences({
          preferredIndustries: formData.preferredIndustries || [],
          preferredStages: normalizeInvestorPreferredStages(formData.preferredStages),
        });
      }

      setIsCompleted(true);
      setStep(4);
      toast.success("Hồ sơ cơ bản đã được thiết lập thành công!");
    } catch {
      toast.error("Gặp lỗi khi xử lý hồ sơ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted || step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 animate-in fade-in duration-700" style={{ backgroundImage: "url('/backgroundforonboard.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200/80 p-10 max-w-[560px] w-full text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-[20px] font-bold text-slate-900 tracking-tight leading-tight">Tuyệt vời! Hồ sơ đã sẵn sàng</h1>
            <p className="text-[13px] text-slate-500 font-normal leading-relaxed max-w-[400px] mx-auto">
              Bạn đã hoàn tất thiết lập cơ bản. Hệ thống đã có đủ thông tin để bắt đầu ghép nối bạn với các Startup tiềm năng.
            </p>
          </div>

          {/* Checklist Next Steps */}
          <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200/60 space-y-4">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide ml-1">📦 Bước tiếp theo nên làm:</h4>
            <div className="space-y-2.5">
              {[
                { label: "Hoàn thiện thông tin Matching nâng cao", status: "Nên làm" },
                { label: "Nộp hồ sơ xác minh (KYC) để nhận tích xanh", status: "Chờ duyệt" },
                { label: "Bắt đầu khám phá danh sách Startup", status: "Sẵn sàng" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#eec54e]/30 transition-all group cursor-pointer active:scale-[0.99]">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      item.status === "Sẵn sàng" ? "bg-emerald-500" : item.status === "Nên làm" ? "bg-[#eec54e]" : "bg-slate-300"
                    )} />
                    <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg border",
                    item.status === "Sẵn sàng" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : item.status === "Nên làm" ? "bg-[#eec54e]/5 text-[#eec54e] border-[#eec54e]/10" : "bg-slate-100 text-slate-400 border-slate-200"
                  )}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <button 
              onClick={() => router.push("/investor")}
              className="h-11 bg-[#0f172a] text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-[13px] hover:bg-[#1e293b] transition-all shadow-sm active:scale-[0.98] group"
            >
              <LayoutDashboard className="w-4 h-4" />
              Vào Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => router.push("/investor/profile")}
              className="h-11 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 font-semibold text-[13px] hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
            >
              <UserCircle className="w-4 h-4" />
              Xem hồ sơ của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout 
      step={step} 
      totalSteps={4} 
    >
      <div className="max-w-[720px] mx-auto w-full">
        {step > 1 && step < 4 && (
          <OnboardingTimeline 
            currentStep={timelineStep} 
            steps={TIMELINE_STEPS} 
          />
        )}
        <div className="animate-in fade-in duration-700">
          {step === 1 && (
            <WelcomeStep 
              onNext={handleNext}
            />
          )}
          {step === 2 && (
            <InvestorTypeStep 
              selected={formData.investorCategory as any} 
              onSelect={(cat) => setFormData({ ...formData, investorCategory: cat })} 
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <InvestorProfileStep
              data={formData}
              onChange={setFormData as any}
              onNext={handleNext}
              onBack={handleBack}
              errors={errors}
            />
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
