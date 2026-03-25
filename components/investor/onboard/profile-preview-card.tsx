"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Building2, MapPin, Globe, ShieldCheck, 
  Layers, Briefcase, Zap, Star 
} from "lucide-react";
import { IInvestorKYCSubmission } from "@/types/investor-kyc";

interface ProfilePreviewCardProps {
  data: Partial<IInvestorKYCSubmission>;
}

export function ProfilePreviewCard({ data }: ProfilePreviewCardProps) {
  const {
    displayName,
    fullName,
    organizationName,
    currentRoleTitle,
    location,
    shortThesisSummary,
    preferredIndustries = [],
    preferredStages = [],
    investorCategory,
    avatar,
  } = data as any;

  const isInstitutional = investorCategory === "INSTITUTIONAL";
  const displayTitle = displayName || fullName || (isInstitutional ? "Tên Quỹ / Tổ chức" : "Họ và tên chuyên gia");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0 shadow-lg shadow-black/20 border border-white/10 overflow-hidden">
          {avatar ? (
            <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
          ) : isInstitutional ? (
            <Building2 className="w-7 h-7 text-[#eec54e]" />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[#eec54e] font-bold text-[18px]">
              {displayTitle?.[0] ?? "I"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-[15px] font-semibold tracking-tight truncate text-white">
              {displayTitle}
            </h4>
            <ShieldCheck className="w-3.5 h-3.5 text-[#eec54e]/60 shrink-0" />
          </div>
          <div className="flex flex-col gap-1 text-[11px] text-white/40 font-semibold uppercase tracking-wide">
            <div className="flex items-center gap-1.5 font-normal">
              <Briefcase className="w-3 h-3 text-white/20" />
              <span className="truncate">{currentRoleTitle || "Chức vụ"} {organizationName ? `@ ${organizationName}` : ""}</span>
            </div>
            <div className="flex items-center gap-1.5 font-normal">
              <MapPin className="w-3 h-3 text-white/20" />
              <span>{location || "Địa điểm"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Thesis */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-white/20 uppercase tracking-wide flex items-center gap-1.5">
          <Zap className="w-3 h-3" /> Investment Thesis
        </p>
        <p className={cn(
          "text-[13px] leading-relaxed font-normal transition-all",
          shortThesisSummary ? "text-white/80" : "text-white/20 italic"
        )}>
          {shortThesisSummary || "Nội dung thesis sẽ hiển thị tại đây..."}
        </p>
      </div>

      {/* Chips */}
      <div className="space-y-4 pt-1">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-white/20 uppercase tracking-wide flex items-center gap-1.5">
            <Star className="w-3 h-3" /> Focus Industries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preferredIndustries.length > 0 ? (
              preferredIndustries.map((ind: string) => (
                <span key={ind} className="px-2.5 py-1 bg-[#eec54e]/10 border border-[#eec54e]/20 rounded-lg text-[11px] font-semibold text-[#eec54e] uppercase tracking-wide">
                  {ind}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-white/10 italic">Chưa chọn lĩnh vực...</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-white/20 uppercase tracking-wide flex items-center gap-1.5">
            <Layers className="w-3 h-3" /> Preferred Stages
          </p>
          <div className="flex flex-wrap gap-1.5">
            {preferredStages.length > 0 ? (
              preferredStages.map((stg: string) => (
                <span key={stg} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-semibold text-white/60 uppercase tracking-wide">
                  {stg}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-white/10 italic">Chưa chọn giai đoạn...</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Badge */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="px-2.5 py-1 bg-[#eec54e]/5 border border-[#eec54e]/10 rounded-lg flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-[#eec54e]" />
          <span className="text-[11px] font-semibold text-[#eec54e]/80 uppercase tracking-wide">
            {isInstitutional ? "Institutional Entity" : "Individual Angel"}
          </span>
        </div>
        <Globe className="w-4 h-4 text-white/10" />
      </div>

    </div>
  );
}
