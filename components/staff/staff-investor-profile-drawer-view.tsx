"use client";

import { useState } from "react";
import {
  Building2,
  FileText,
  Globe,
  MapPin,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getIndustryName, getInvestorPreferredStageLabel } from "@/lib/investor-preferred-stages";
import {
  buildInvestorProfilePresentation,
  isInvestorKycVerified,
} from "@/lib/investor-profile-presenter";
import { VerifiedRoleMark } from "@/components/shared/verified-role-mark";

const INVESTOR_PROFILE_TABS = ["Giới thiệu", "Tiêu chí đầu tư", "Liên hệ"] as const;
type InvestorProfileTab = typeof INVESTOR_PROFILE_TABS[number];

export function StaffInvestorProfileDrawerView({
  investor,
}: {
  investor: IInvestorProfile;
}) {
  const [activeTab, setActiveTab] = useState<InvestorProfileTab>("Giới thiệu");
  const presentation = buildInvestorProfilePresentation(investor);
  const isKycVerified = isInvestorKycVerified(investor);
  const preferredStages = investor.preferredStages ?? [];
  const preferredIndustries = investor.preferredIndustries ?? [];
  const preferredGeographies = investor.preferredGeographies ?? [];
  const preferredMarketScopes = investor.preferredMarketScopes ?? [];
  const supportOffered = investor.supportOffered ?? [];
  const locationLabel = [investor.location, investor.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-6 py-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="relative h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute right-5 top-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
              <span className={cn("h-1.5 w-1.5 rounded-full", investor.acceptingConnections ? "bg-emerald-400" : "bg-slate-400")} />
              {investor.acceptingConnections ? "Đang tìm kiếm dự án" : "Tạm đóng kết nối"}
            </span>
          </div>
        </div>

        <div className="relative px-7 pb-7">
          <div className="-mt-10 mb-4">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-white bg-gradient-to-br from-slate-800 to-slate-950 shadow-md">
              {investor.profilePhotoURL ? (
                <img src={investor.profilePhotoURL} alt={presentation.primaryName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[32px] font-black tracking-tight text-white">
                  {presentation.primaryName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0f172a]">
                {presentation.primaryName}
              </h1>
              {isKycVerified && <VerifiedRoleMark className="h-4 w-4" />}
            </div>
            {presentation.heroIdentityLine && (
              <p className="mt-0.5 text-[13px] text-slate-500">{presentation.heroIdentityLine}</p>
            )}
            {presentation.shortSummary && (
              <p className="mt-2 text-[13px] text-slate-500">{presentation.shortSummary}</p>
            )}
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-1.5">
            {presentation.categoryLabel && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100/60 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                <Building2 className="h-3 w-3" />
                {presentation.categoryLabel}
              </span>
            )}
            {preferredStages[0] && (
              <span className="inline-flex items-center gap-1 rounded-md border border-violet-100/60 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-600">
                <TrendingUp className="h-3 w-3" />
                {getInvestorPreferredStageLabel(preferredStages[0])}
              </span>
            )}
            {preferredIndustries[0] && (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                <FileText className="h-3 w-3 text-slate-400" />
                Lĩnh vực chính: {getIndustryName(preferredIndustries[0])}
              </span>
            )}
            {locationLabel && (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                <MapPin className="h-3 w-3 text-slate-400" />
                {locationLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-fit items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {INVESTOR_PROFILE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-medium transition-all",
              activeTab === tab
                ? "bg-[#0f172a] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Giới thiệu" && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 space-y-5 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <h3 className="text-[13px] font-semibold text-slate-700">
                  {presentation.isInstitutional ? "Người đại diện & tổ chức" : "Thông tin cá nhân"}
                </h3>
              </div>
              <div className="space-y-2 text-[13px] text-slate-600">
                {presentation.representativeName && (
                  <p><span className="font-semibold text-slate-700">Người đại diện:</span> {presentation.representativeName}</p>
                )}
                {presentation.representativeRole && (
                  <p><span className="font-semibold text-slate-700">Vai trò đại diện:</span> {presentation.representativeRole}</p>
                )}
                {presentation.organizationName && (
                  <p><span className="font-semibold text-slate-700">Tổ chức:</span> {presentation.organizationName}</p>
                )}
                {presentation.roleName && !presentation.representativeRole && (
                  <p><span className="font-semibold text-slate-700">Chức danh:</span> {presentation.roleName}</p>
                )}
              </div>
            </div>

            {presentation.shortSummary && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <h3 className="text-[13px] font-semibold text-slate-700">
                    {presentation.isInstitutional ? "Giới thiệu tổ chức & thesis" : "Giới thiệu & khẩu vị đầu tư"}
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-500">{presentation.shortSummary}</p>
              </div>
            )}
          </div>

          <div className="col-span-12 space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-slate-400">Thông tin nhanh</h3>
              <div className="space-y-3">
                {presentation.quickFacts.map((item) =>
                  item.value ? (
                    <div key={item.label}>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
                      <p className="text-[12px] font-medium text-slate-700">{item.value}</p>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Tiêu chí đầu tư" && (
        <div className="space-y-5">
          {presentation.shortSummary && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                <h3 className="text-[13px] font-semibold text-slate-700">Định hướng đầu tư</h3>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-500">{presentation.shortSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="mb-3 text-[13px] font-semibold text-slate-700">Giai đoạn ưu tiên</h3>
              <div className="flex flex-wrap gap-2">
                {preferredStages.length > 0 ? preferredStages.map((stage) => (
                  <span key={getInvestorPreferredStageLabel(stage)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600">
                    {getInvestorPreferredStageLabel(stage)}
                  </span>
                )) : <p className="text-[13px] text-slate-400">Chưa cập nhật.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="mb-3 text-[13px] font-semibold text-slate-700">Lĩnh vực ưu tiên</h3>
              <div className="flex flex-wrap gap-2">
                {preferredIndustries.length > 0 ? preferredIndustries.map((industry) => (
                  <span key={getIndustryName(industry)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600">
                    {getIndustryName(industry)}
                  </span>
                )) : <p className="text-[13px] text-slate-400">Chưa cập nhật.</p>}
              </div>
            </div>
          </div>

          {(preferredGeographies.length > 0 || preferredMarketScopes.length > 0 || supportOffered.length > 0) && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-3 text-[13px] font-semibold text-slate-700">Khu vực ưu tiên</h3>
                <div className="flex flex-wrap gap-2">
                  {preferredGeographies.length > 0 ? preferredGeographies.map((item) => (
                    <span key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600">{item}</span>
                  )) : <p className="text-[13px] text-slate-400">Chưa cập nhật.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-3 text-[13px] font-semibold text-slate-700">Market scope</h3>
                <div className="flex flex-wrap gap-2">
                  {preferredMarketScopes.length > 0 ? preferredMarketScopes.map((item) => (
                    <span key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600">{item}</span>
                  )) : <p className="text-[13px] text-slate-400">Chưa cập nhật.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-3 text-[13px] font-semibold text-slate-700">Hỗ trợ cung cấp</h3>
                <div className="flex flex-wrap gap-2">
                  {supportOffered.length > 0 ? supportOffered.map((item) => (
                    <span key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600">{item}</span>
                  )) : <p className="text-[13px] text-slate-400">Chưa cập nhật.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "Liên hệ" && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 space-y-5 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <h3 className="text-[13px] font-semibold text-slate-700">Liên hệ</h3>
              </div>
              <div className="space-y-3">
                {investor.website && (
                  <div>
                    <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">Website</p>
                    <a href={investor.website} target="_blank" rel="noopener noreferrer" className="break-all text-[13px] font-medium text-blue-600 hover:underline">
                      {investor.website}
                    </a>
                  </div>
                )}
                {investor.linkedInURL && (
                  <div>
                    <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">LinkedIn</p>
                    <a href={investor.linkedInURL} target="_blank" rel="noopener noreferrer" className="break-all text-[13px] font-medium text-blue-600 hover:underline">
                      {investor.linkedInURL}
                    </a>
                  </div>
                )}
                {!investor.website && !investor.linkedInURL && (
                  <p className="text-[13px] text-slate-400">Chưa có liên kết công khai.</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-slate-400">Trạng thái kết nối</h3>
              <div className={cn("flex items-center gap-3 rounded-xl border p-3", investor.acceptingConnections ? "border-emerald-100 bg-emerald-50" : "border-slate-100 bg-slate-50")}>
                <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", investor.acceptingConnections ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                <div>
                  <p className={cn("text-[12px] font-semibold", investor.acceptingConnections ? "text-emerald-700" : "text-slate-600")}>
                    {investor.acceptingConnections ? "Đang nhận kết nối" : "Tạm ngưng kết nối"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {investor.acceptingConnections ? "Hồ sơ đang mở để startup gửi lời mời" : "Hiện không nhận lời mời mới"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
