"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Rocket, 
  FileText, 
  PieChart, 
  CheckCircle2, 
  Star,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Import real steps
import { Step1 } from "@/components/startup/onboarding-steps/step-1-identity";
import { Step2 } from "@/components/startup/onboarding-steps/step-2-pitch";
import { Step3 } from "@/components/startup/onboarding-steps/step-3-docs";
import { Step4 } from "@/components/startup/onboarding-steps/step-4-readiness";
import { Step5 } from "@/components/startup/onboarding-steps/step-5-launch";

const STEPS = [
  { id: 1, label: "Định danh", icon: Building2 },
  { id: 2, label: "Sản phẩm", icon: Rocket },
  { id: 3, label: "Tài liệu", icon: FileText },
  { id: 4, label: "Độ sẵn sàng", icon: PieChart },
  { id: 5, label: "Khởi động", icon: Star },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  
  const handleSkip = () => {
    localStorage.setItem("aisep_startup_onboarding_skipped", "true");
    toast.info("Đã bỏ qua quy trình Onboarding.");
    router.replace("/startup");
  };

  useEffect(() => {
    const skipped = localStorage.getItem("aisep_startup_onboarding_skipped") === "true";
    const completed = localStorage.getItem("aisep_startup_onboarding_completed") === "true";
    
    if (skipped || completed) {
      router.replace("/startup");
    }
  }, [router]);

  // Mark as completed when reaching Step 5
  useEffect(() => {
    if (currentStep === 5) {
      localStorage.setItem("aisep_startup_onboarding_completed", "true");
    }
  }, [currentStep]);

  // Data State
  const [formData, setFormData] = useState({
    startupName: "",
    industry: "",
    stage: "",
    legalType: "WITH_LEGAL_ENTITY",
    problem: "",
    solution: "",
    targetAudience: "",
    pitchDeck: null as File | null,
    websiteUrl: "",
    productLink: "",
    completenessScore: 0
  });

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const completeness = useMemo(() => {
    const checks = [
      Boolean(formData.startupName.trim()),
      Boolean(formData.industry),
      Boolean(formData.stage),
      Boolean(formData.problem.trim()),
      Boolean(formData.solution.trim()),
      Boolean(formData.targetAudience.trim()),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [formData]);

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex flex-col items-center py-12 md:py-20 px-4" style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}>
      {/* 1. TOP BADGE */}
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm">
          <div className="size-5 rounded-full bg-[#fdf8e6] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-[#eec54e]" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Thiết lập Startup Profile</span>
        </div>
      </div>

      {/* 2. MAIN TITLES */}
      <div className="text-center mb-10 space-y-3 max-w-2xl animate-in fade-in slide-in-from-top-6 duration-700 delay-100">
        <h1 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight">
          Bắt đầu hành trình trên AISEP
        </h1>
        <p className="text-[14px] md:text-[16px] text-slate-500 font-medium leading-relaxed">
          Chia sẻ thông tin về Startup của bạn để nhận được đánh giá AI và kết nối với các Cố vấn phù hợp nhất.
        </p>
      </div>

      {/* 3. STEPPER & PROGRESS */}
      <div className="w-full max-w-[640px] mb-12 space-y-6 animate-in fade-in duration-1000 delay-200">
        <div className="flex items-center justify-between relative px-2">
           {STEPS.map((step, idx) => {
             const Icon = step.icon;
             const isCompleted = currentStep > step.id;
             const isActive = currentStep === step.id;
             
             return (
                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                  <div className={cn(
                    "size-9 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100" :
                    isActive ? "bg-white border-[#eec54e] shadow-xl shadow-[#eec54e]/20 scale-110" :
                    "bg-white border-slate-100 text-slate-200"
                  )}>
                     {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className={cn("w-4 h-4", isActive ? "text-[#eec54e]" : "")} />}
                  </div>
                  {isActive && (
                    <span className="absolute -bottom-6 text-[10px] font-black text-slate-900 uppercase tracking-wider whitespace-nowrap">
                      {step.label}
                    </span>
                  )}
                </div>
             );
           })}
           {/* Connecting Line Background */}
           <div className="absolute top-[18px] left-0 w-full h-[2px] bg-slate-100 -z-0" />
           {/* Active Progress Line */}
           <div 
            className="absolute top-[18px] left-0 h-[2px] bg-[#eec54e] -z-0 transition-all duration-700" 
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
           />
        </div>

        {/* Completeness Bar */}
        <div className="pt-4 space-y-2">
           <div className="flex justify-between items-end">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Độ hoàn thiện hồ sơ</span>
              <span className="text-[13px] font-black text-slate-900">{completeness}%</span>
           </div>
           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#eec54e] to-amber-400 transition-all duration-1000 ease-out"
                style={{ width: `${completeness}%` }}
              />
           </div>
        </div>
      </div>

      {/* 4. MAIN CARD */}
      <div className="w-full max-w-[640px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100/80 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="p-8 md:p-12">
           {currentStep === 1 && <Step1 data={formData} update={setFormData} onNext={nextStep} onSkip={() => setShowSkipDialog(true)} />}
           {currentStep === 2 && <Step2 data={formData} update={setFormData} onNext={nextStep} onPrev={prevStep} />}
           {currentStep === 3 && <Step3 data={formData} update={setFormData} onNext={nextStep} onPrev={prevStep} />}
           {currentStep === 4 && <Step4 data={formData} onNext={nextStep} onPrev={prevStep} />}
           {currentStep === 5 && <Step5 />}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-12 flex items-center gap-8 animate-in fade-in duration-1000 delay-500">
         <div className="flex items-center gap-2 text-slate-400">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Dữ liệu được bảo mật</span>
         </div>
         <div className="flex items-center gap-2 text-slate-400">
            <div className="size-1.5 rounded-full bg-[#f0f042]" />
            <span className="text-[11px] font-bold uppercase tracking-widest">AI SEP Pipeline 2.0</span>
         </div>
      </div>

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
         <DialogContent className="sm:max-w-[440px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="p-8 space-y-6">
               <div className="size-16 rounded-[24px] bg-amber-50 flex items-center justify-center border border-amber-100 mx-auto">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
               </div>
               
               <div className="text-center space-y-2">
                  <DialogTitle className="text-[18px] font-bold text-slate-900">Tiếp tục sau?</DialogTitle>
                  <DialogDescription className="text-[13px] text-slate-500 leading-relaxed px-4">
                     Bạn có thể truy cập Workspace ngay. Tuy nhiên, đừng quên hoàn thiện Onboarding để AI của chúng tôi có thể đánh giá độ sẵn sàng của Startup tốt nhất!
                     <span className="block font-bold mt-2 text-slate-900 text-[12px]">Lưu ý: Bạn sẽ không thấy lại hướng dẫn này sau khi bỏ qua.</span>
                  </DialogDescription>
               </div>

               <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setShowSkipDialog(false)}
                    className="py-3 rounded-xl font-bold text-[13px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                  >
                     Tiếp tục làm
                  </button>
                  <button 
                    onClick={handleSkip}
                    className="py-3 rounded-xl font-bold text-[13px] bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 transition-all active:scale-95"
                  >
                     Đồng ý, bỏ qua
                  </button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
