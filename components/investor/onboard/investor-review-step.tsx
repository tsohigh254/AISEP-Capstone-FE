"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, ShieldCheck, CheckCircle2, 
  User, Building2, MapPin, Globe, Zap, 
  LayoutGrid, Layers, Target, Brain, Star 
} from "lucide-react";
import { IInvestorOnboardData } from "@/types/investor-kyc";
import { getInvestorPreferredStageLabel } from "@/lib/investor-preferred-stages";

interface InvestorReviewStepProps {
  data: Partial<IInvestorOnboardData>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  files: {
    idFile: File | null;
    proofFile: File | null;
  };
}

export function InvestorReviewStep({ data, onBack, onSubmit, isSubmitting, files }: InvestorReviewStepProps) {
  const isInstitutional = data.investorCategory === "INSTITUTIONAL";

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="space-y-4 border-b border-slate-50 last:border-0 pb-6 last:pb-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {children}
      </div>
    </div>
  );

  const Item = ({ label, value, full }: any) => (
    <div className={cn("space-y-1", full && "md:col-span-2")}>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
      <div className="min-h-[20px]">
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {value.map(v => (
              <span key={v} className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 border border-slate-200/50">
                {label === "Giai đoạn ưu tiên" ? getInvestorPreferredStageLabel(v) : v}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[13px] font-bold text-slate-700 leading-snug">{value || "---"}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="flex items-center gap-4 mb-2">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight">Rà soát Hồ sơ & Hoàn thiện</h2>
          <p className="text-[13px] text-slate-400 font-medium font-bold uppercase tracking-widest mt-0.5">Kiểm tra lại toàn bộ thông tin trước khi nộp cho AISEP.</p>
        </div>
      </div>

      <div className="space-y-8 bg-white/50 px-2">
        
        {/* Profile */}
        <Section title="Hồ sơ công khai" icon={User}>
          <Item label="Loại hình" value={isInstitutional ? "Institutional Investor" : "Individual Angel"} />
          <Item label="Tên Investor" value={data.fullName} />
          <Item label="Tổ chức" value={data.organizationName} />
          <Item label="Vị trí / Chức vụ" value={data.currentRoleTitle} />
          <Item label="Địa điểm" value={data.location} />
          <Item label="Website / LinkedIn" value={data.website} />
          <Item label="Investment Thesis" value={data.shortThesisSummary} full />
          <Item label="Lĩnh vực quan tâm" value={data.preferredIndustries} />
          <Item label="Giai đoạn ưu tiên" value={data.preferredStages} />
        </Section>

        {/* Preferences */}
        <Section title="Tiêu chí Matching" icon={Target}>
          <Item label="Độ hoàn thiện SP" value={data.preferredProductMaturity} />
          <Item label="Mức độ Validation" value={data.preferredValidationLevel} />
          <Item label="AI Score Importance" value={data.aiScoreImportance} />
          <Item label="Thế mạnh kỳ vọng" value={data.preferredStrengths} />
        </Section>

        {/* Verification */}
        <Section title="Xác thực Danh tính" icon={ShieldCheck}>
          {isInstitutional && (
            <>
              <Item label="Tên pháp lý" value={data.legalOrganizationName} />
              <Item label="Mã số thuế" value={data.taxIdOrBusinessCode} />
            </>
          )}
          <Item label="File CCCD / Giấy phép" value={files.idFile?.name} />
          <Item label="File Bằng chứng đầu tư" value={files.proofFile?.name} />
          <Item 
            label="Cam kết bảo mật" 
            value={data.declarationAccepted ? "Đã xác nhận" : "Chưa xác nhận"} 
          />
        </Section>

      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Bước 4
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "h-11 px-10 rounded-xl text-[13px] font-bold flex items-center gap-2.5 transition-all shadow-xl active:scale-95 disabled:opacity-50",
            "bg-slate-900 text-white hover:bg-slate-800 shadow-black/5"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang nộp hồ sơ...
            </>
          ) : (
            <>
              Nộp hồ sơ Onboarding
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
