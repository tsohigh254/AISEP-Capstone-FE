"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, MessageSquare, Rocket, CheckCircle2, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CreateStartupProfile,
  GetStartupProfile,
  StartupStage,
} from "@/services/startup/startup.api";
import { Step1 } from "@/components/startup/onboarding-steps/step-1-identity";
import { Step2 } from "@/components/startup/onboarding-steps/step-2-pitch";
import { Step3 } from "@/components/startup/onboarding-steps/step-3-launch";

const STEPS = [
  { id: 1, label: "Định danh",  icon: Building2,    hint: "Tên, ngành, giai đoạn" },
  { id: 2, label: "Câu chuyện", icon: MessageSquare, hint: "Vấn đề & giải pháp" },
  { id: 3, label: "Hoàn tất",   icon: Rocket,        hint: "Bắt đầu hành trình" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const [formData, setFormData] = useState({
    startupName: "",
    oneLiner: "",
    businessCode: "",
    industryID: "",
    stage: "",
    problem: "",
    solution: "",
    targetAudience: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    GetStartupProfile()
      .then(res => {
        const data = res as unknown as IBackendRes<any>;
        if ((data.success || data.isSuccess) && data.data) {
          router.replace("/startup");
        }
      })
      .catch(() => {});
  }, []);

  const handleSkip = () => {
    localStorage.setItem("aisep_startup_onboarding_skipped", "true");
    toast.info("Đã bỏ qua. Bạn có thể hoàn thiện hồ sơ sau.");
    router.replace("/startup");
  };

  const goNext = () => {
    setCurrentStep(s => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setCurrentStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completeness = useMemo(() => {
    const checks = [
      Boolean(formData.startupName.trim()),
      Boolean(formData.industryID),
      Boolean(formData.stage),
      Boolean(formData.problem.trim()),
      Boolean(formData.solution.trim()),
      Boolean(formData.targetAudience.trim()),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [formData]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const payload = {
        companyName:      formData.startupName,
        oneLiner:         formData.oneLiner || formData.startupName,
        stage:            (parseInt(formData.stage) || 0) as StartupStage,
        industryID:       formData.industryID ? parseInt(formData.industryID) : undefined,
        businessCode:     formData.businessCode.trim() || undefined,
        problemStatement: formData.problem || undefined,
        solutionSummary:  formData.solution || undefined,
        marketScope:      formData.targetAudience || undefined,
      };
      const res = await CreateStartupProfile(payload) as unknown as IBackendRes<string>;
      if (res.success || res.isSuccess) {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(res.message || "Lưu hồ sơ thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const msg = err?.response?.data?.message || err?.message || "Lỗi kết nối.";
        toast.error(typeof msg === "string" ? msg : "Lỗi kết nối.");
      }
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div
      className="min-h-screen flex flex-col items-center py-12 md:py-20 px-4"
      style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
    >
      {/* ── BADGE ── */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-600">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
          <div className="size-5 rounded-full bg-[#fdf8e6] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-[#eec54e]" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Thiết lập Startup Profile
          </span>
        </div>
      </div>

      {/* ── HEADING ── */}
      <div className="text-center mb-12 space-y-2 max-w-lg animate-in fade-in slide-in-from-top-6 duration-600 delay-100">
        <h1 className="text-[32px] md:text-[38px] font-black text-slate-900 tracking-tighter leading-tight">
          Chào mừng đến AISEP 👋
        </h1>
        <p className="text-[14px] text-slate-500 leading-relaxed">
          Chỉ <span className="font-semibold text-slate-700">2 bước nhanh</span> để tạo hồ sơ Startup.
          Bạn có thể bổ sung chi tiết sau bất kỳ lúc nào.
        </p>
      </div>

      {/* ── STEPPER ── */}
      <div className="w-full max-w-[520px] mb-10 animate-in fade-in duration-700 delay-150">
        {/* Step counter */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-[12px] font-bold text-slate-500">
            Bước <span className="text-slate-900">{Math.min(currentStep, 2)}</span> / 2
          </span>
          {currentStep < 3 && (
            <span className="text-[12px] text-slate-400">{completeness}% hoàn thiện</span>
          )}
        </div>

        {/* Step dots + line */}
        <div className="relative flex items-center justify-between px-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const done   = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                <div className={cn(
                  "size-10 rounded-full flex items-center justify-center border-2 transition-all duration-400",
                  done   ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100" :
                  active ? "bg-white border-[#eec54e] shadow-lg shadow-[#eec54e]/20 scale-110" :
                           "bg-white border-slate-200 text-slate-300"
                )}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5" />
                    : <Icon className={cn("w-4 h-4", active ? "text-[#eec54e]" : "")} />
                  }
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-[11px] font-bold uppercase tracking-wide transition-colors",
                    active ? "text-slate-900" : done ? "text-emerald-600" : "text-slate-400"
                  )}>{step.label}</p>
                  <p className={cn(
                    "text-[10px] transition-colors hidden sm:block",
                    active ? "text-slate-500" : "text-slate-300"
                  )}>{step.hint}</p>
                </div>
              </div>
            );
          })}
          {/* Background line */}
          <div className="absolute top-5 left-4 right-4 h-[2px] bg-slate-100" />
          {/* Active line */}
          <div
            className="absolute top-5 left-4 h-[2px] bg-[#eec54e] transition-all duration-700 ease-out"
            style={{ width: `calc(${progress}% - 8px)` }}
          />
        </div>
      </div>

      {/* ── MAIN CARD ── */}
      <div className="w-full max-w-[560px] bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-600 delay-200">
        <div className="p-8 md:p-10">
          {currentStep === 1 && (
            <Step1
              data={formData}
              update={setFormData}
              onNext={goNext}
              onSkip={() => setShowSkipDialog(true)}
            />
          )}
          {currentStep === 2 && (
            <Step2
              data={formData}
              update={setFormData}
              onNext={handleComplete}
              onPrev={goPrev}
              loading={loading}
            />
          )}
          {currentStep === 3 && (
            <Step3 completeness={completeness} />
          )}
        </div>
      </div>

      {/* ── FOOTER META ── */}
      {currentStep < 3 && (
        <p className="mt-8 text-[11px] text-slate-400 animate-in fade-in duration-700 delay-300">
          🔒 Thông tin của bạn được bảo mật và không chia sẻ cho bên thứ ba.
        </p>
      )}

      {/* ── SKIP DIALOG ── */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="p-8 space-y-5">
            <div className="size-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
            <div className="text-center space-y-1.5">
              <DialogTitle className="text-[17px] font-bold text-slate-900">Bỏ qua lúc này?</DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500 leading-relaxed px-2">
                Không sao cả! Bạn vẫn có thể vào Workspace và hoàn thiện hồ sơ sau tại trang <span className="font-semibold text-slate-700">Startup Profile</span>.
              </DialogDescription>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setShowSkipDialog(false)}
                className="inline-flex items-center justify-center h-11 rounded-xl font-semibold text-[13px] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Tiếp tục điền
              </button>
              <button
                onClick={handleSkip}
                className="inline-flex items-center justify-center h-11 rounded-xl font-semibold text-[13px] bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
