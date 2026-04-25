"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Brain,
  Briefcase,
  Building2,
  FileText,
  Globe,
  Handshake,
  Layers,
  Loader2,
  MapPin,
  Pencil,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getIndustryName, getInvestorPreferredStageLabel } from "@/lib/investor-preferred-stages";
import { buildInvestorProfilePresentation, isInvestorKycVerified } from "@/lib/investor-profile-presenter";
import { VerifiedRoleMark } from "@/components/shared/verified-role-mark";
import { GetInvestorPreferences, GetInvestorProfile } from "@/services/investor/investor.api";
import { GetInvestorKYCStatus } from "@/services/investor/investor-kyc";
import type { IInvestorKYCStatus } from "@/types/investor-kyc";

const TABS = ["Giới thiệu", "Tiêu chí đầu tư", "Liên hệ"] as const;
type Tab = typeof TABS[number];

function Tag({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "green" | "violet" | "amber" | "blue";
}) {
  const cls = {
    default: "bg-slate-50 text-slate-600 border-slate-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100/60",
    violet: "bg-violet-50 text-violet-600 border-violet-100/60",
    amber: "bg-amber-50 text-amber-700 border-amber-100/60",
    blue: "bg-sky-50 text-sky-600 border-sky-100/60",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium",
        cls,
      )}
    >
      {children}
    </span>
  );
}

function InfoPair({
  label,
  value,
  isLink,
}: {
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  if (!value) return null;

  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{label}</p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[13px] font-medium text-blue-600 hover:underline"
        >
          {value}
          <ArrowUpRight className="h-3 w-3" />
        </a>
      ) : (
        <p className="text-[13px] font-medium text-slate-700">{value}</p>
      )}
    </div>
  );
}

function calcCompleteness(profile: IInvestorProfile) {
  const checks = [
    Boolean(profile.fullName || profile.firmName),
    Boolean(profile.title),
    Boolean(profile.location),
    Boolean(profile.bio || profile.investmentThesis),
    Boolean(profile.website || profile.linkedInURL),
    Boolean(profile.preferredIndustries?.length),
    Boolean(profile.preferredStages?.length),
    Boolean(profile.profilePhotoURL),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function mergePreferencesIntoProfile(
  profile: IInvestorProfile,
  preferences?: IInvestorPreferences | null,
) {
  if (!preferences) return profile;

  return {
    ...profile,
    preferredIndustries: preferences.preferredIndustries || profile.preferredIndustries,
    preferredStages: preferences.preferredStages || profile.preferredStages,
    preferredMarketScopes: preferences.preferredMarketScopes || profile.preferredMarketScopes,
    supportOffered: preferences.supportOffered || profile.supportOffered,
    preferredGeographies:
      typeof preferences.preferredGeographies === "string"
        ? preferences.preferredGeographies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : profile.preferredGeographies,
  };
}

export default function InvestorProfileViewPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Giới thiệu");
  const [profile, setProfile] = useState<IInvestorProfile | null>(null);
  const [preferences, setPreferences] = useState<IInvestorPreferences | null>(null);
  const [kycStatus, setKycStatus] = useState<IInvestorKYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([GetInvestorProfile(), GetInvestorKYCStatus(), GetInvestorPreferences()])
      .then(([profileRes, kycRes, preferencesRes]) => {
        let nextProfile: IInvestorProfile | null = null;

        if (profileRes.status === "fulfilled") {
          const data = profileRes.value as unknown as IBackendRes<IInvestorProfile>;
          if (data.isSuccess && data.data) {
            nextProfile = data.data;
          }
        }

        if (kycRes.status === "fulfilled") {
          const data = kycRes.value as unknown as IBackendRes<IInvestorKYCStatus>;
          if (data.isSuccess && data.data) {
            setKycStatus(data.data);
          }
        }

        if (nextProfile && preferencesRes.status === "fulfilled") {
          const data = preferencesRes.value as unknown as IBackendRes<IInvestorPreferences>;
          if (data.isSuccess && data.data) {
            setPreferences(data.data);
            nextProfile = mergePreferencesIntoProfile(nextProfile, data.data);
          }
        }

        if (nextProfile) {
          setProfile(nextProfile);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e6cc4c]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-[14px] text-slate-500">
        Không tải được hồ sơ.
      </div>
    );
  }

  const presentation = buildInvestorProfilePresentation(profile, kycStatus);
  const completeness = calcCompleteness(profile);
  const completenessColor =
    completeness >= 80 ? "bg-[#e6cc4c]" : completeness >= 50 ? "bg-amber-400" : "bg-rose-400";
  const initials = presentation.primaryName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const websiteDisplay = profile.website || profile.linkedInURL;
  const thesisSummary = presentation.shortSummary;
  const ticketMin = preferences?.ticketMin ?? null;
  const ticketMax = preferences?.ticketMax ?? null;
  const isKycVerified = isInvestorKycVerified(profile, kycStatus);
  // Chỉ trust acceptingConnections khi đã KYC VERIFIED (BE default bug: true cho tài khoản mới)
  const effectiveAcceptingConnections = isKycVerified && profile.acceptingConnections;
  const connectionLabel = effectiveAcceptingConnections
    ? "Đang tìm kiếm dự án"
    : "Tạm đóng kết nối";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="relative h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute right-5 top-4">
            <Link
              href="/investor/settings"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              title="Mở cài đặt nhận kết nối"
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                  effectiveAcceptingConnections ? "bg-emerald-400" : "bg-slate-400",
                )}
              />
              {connectionLabel}
            </Link>
          </div>
        </div>

        <div className="relative px-7 pb-7">
          <div className="-mt-10 mb-4">
            <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-white bg-gradient-to-br from-slate-800 to-slate-950 shadow-md">
              {profile.profilePhotoURL ? (
                <Image
                  src={profile.profilePhotoURL}
                  alt={presentation.primaryName}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span className="text-[32px] font-black tracking-tight text-white">
                  {initials}
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
              <p className="mt-0.5 text-[13px] text-slate-500">
                {presentation.heroIdentityLine}
              </p>
            )}
            {thesisSummary && <p className="mt-2 text-[13px] text-slate-500">{thesisSummary}</p>}
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-1.5">
            {presentation.categoryLabel && (
              <Tag variant="green">
                <Building2 className="h-3 w-3" />
                {presentation.categoryLabel}
              </Tag>
            )}
            {profile.preferredStages?.[0] && (
              <Tag variant="violet">
                <TrendingUp className="h-3 w-3" />
                {getInvestorPreferredStageLabel(profile.preferredStages[0])}
              </Tag>
            )}
            {profile.preferredIndustries?.[0] && (
              <Tag>
                <FileText className="h-3 w-3 text-slate-400" />
                Lĩnh vực chính: {getIndustryName(profile.preferredIndustries[0])}
              </Tag>
            )}
            {profile.preferredMarketScopes?.[0] && <Tag variant="blue">{profile.preferredMarketScopes[0]}</Tag>}
            {profile.location && (
              <>
                <span className="mx-0.5 text-[14px] text-slate-200">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </span>
              </>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-500">
                Độ hoàn thiện hồ sơ
              </span>
              <span className="text-[12px] font-semibold text-slate-700">{completeness}%</span>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all", completenessColor)}
                style={{ width: `${completeness}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {!thesisSummary && (
                <Link
                  href="/investor/profile/edit/thesis"
                  className="inline-flex items-center gap-1 rounded-md border border-amber-100/60 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
                >
                  + Mở rộng thesis
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {TABS.map((tab) => (
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
            {(presentation.heroIdentityLine ||
              presentation.organizationName ||
              presentation.representativeName) && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-[#C8A000]" />
                    <h3 className="text-[13px] font-semibold text-slate-700">
                      {presentation.isInstitutional
                        ? "Người đại diện & tổ chức"
                        : "Vai trò & nơi công tác"}
                    </h3>
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed text-slate-500">
                    {presentation.isInstitutional
                      ? presentation.heroIdentityLine || presentation.organizationName
                      : presentation.heroIdentityLine}
                  </p>
                </div>
            )}

                {profile.supportOffered?.length > 0 && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="mb-3 flex items-center gap-2">
                      <Handshake className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-[13px] font-semibold text-slate-700">
                        Giá trị gia tăng
                      </h3>
                    </div>
                    <p className="text-[13px] font-medium leading-relaxed text-slate-500">
                      {profile.supportOffered.join(" · ")}
                    </p>
                  </div>
                )}

            {thesisSummary && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <h3 className="text-[13px] font-semibold text-slate-700">
                    {presentation.isInstitutional
                      ? "Giới thiệu tổ chức & thesis"
                      : "Giới thiệu & thesis"}
                  </h3>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-500">{thesisSummary}</p>
              </div>
            )}

            {profile.preferredIndustries?.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-400" />
                  <h3 className="text-[13px] font-semibold text-slate-700">
                    Lĩnh vực quan tâm
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredIndustries.map((industry) => (
                    <span
                      key={getIndustryName(industry)}
                      className="rounded-lg border border-[#e6cc4c]/25 bg-[#fdfbe9] px-3 py-1.5 text-[12px] font-medium text-[#171611]"
                    >
                      {getIndustryName(industry)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-slate-400">
                Thông tin nhanh
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Briefcase, item: presentation.quickFacts[0] },
                  { icon: User, item: presentation.quickFacts[1] },
                  { icon: Building2, item: presentation.quickFacts[2] },
                  { icon: Globe, item: presentation.quickFacts[3] },
                ]
                  .filter(({ item }) => item?.value)
                  .map(({ icon: Icon, item }) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50">
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          {item.label}
                        </p>
                        <p className="truncate text-[12px] font-medium text-slate-700">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <Link
              href="/investor/profile/edit/info"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              <Pencil className="h-3.5 w-3.5" />
              Chỉnh sửa hồ sơ
            </Link>
          </div>
        </div>
      )}

      {activeTab === "Tiêu chí đầu tư" && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 space-y-5 lg:col-span-8">
            {profile.preferredIndustries?.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                  <Target className="h-4 w-4 text-[#C8A000]" />
                  Ngành nghề quan tâm
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.preferredIndustries.map((industry) => (
                    <span
                      key={getIndustryName(industry)}
                      className="rounded-lg border border-[#e6cc4c]/25 bg-[#fdfbe9] px-3 py-1.5 text-[12px] font-medium text-[#171611]"
                    >
                      {getIndustryName(industry)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.preferredMarketScopes?.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  Tệp khách hàng mục tiêu
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.preferredMarketScopes.map((scope) => (
                    <span
                      key={scope}
                      className="rounded-lg border border-emerald-100/60 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.preferredStages?.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                  Giai đoạn đầu tư ưu tiên
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.preferredStages.map((stage) => (
                    <span
                      key={getInvestorPreferredStageLabel(stage)}
                      className="rounded-lg border border-violet-100/60 bg-violet-50 px-3 py-1.5 text-[12px] font-medium text-violet-700"
                    >
                      {getInvestorPreferredStageLabel(stage)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.supportOffered?.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                  <Handshake className="h-4 w-4 text-emerald-500" />
                  Giá trị gia tăng cung cấp
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.supportOffered.map((support) => (
                    <span
                      key={support}
                      className="rounded-lg border border-emerald-100/60 bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700"
                    >
                      {support}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 space-y-4 lg:col-span-4">
            {profile.preferredGeographies?.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-slate-400">
                  Phạm vi
                </h3>
                <InfoPair
                  label="Vị trí địa lý ưu tiên"
                  value={profile.preferredGeographies.join(", ")}
                />
              </div>
            )}

            {(ticketMin != null || ticketMax != null) && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-slate-400">
                  Quy mô đầu tư (USD)
                </h3>
                <div className="space-y-3">
                  <InfoPair
                    label="Tối thiểu"
                    value={ticketMin != null ? ticketMin.toLocaleString("vi-VN") : "Chưa cập nhật"}
                  />
                  <InfoPair
                    label="Tối đa"
                    value={ticketMax != null ? ticketMax.toLocaleString("vi-VN") : "Chưa cập nhật"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Liên hệ" && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:col-span-6">
            <h3 className="mb-4 text-[13px] font-semibold text-slate-700">
              Kênh kết nối chính thức
            </h3>
            <div className="space-y-3">
              <InfoPair label="Email xác minh" value={presentation.contactEmail} />
              <InfoPair
                label="Website / liên kết"
                value={websiteDisplay}
                isLink={Boolean(websiteDisplay)}
              />
              <InfoPair label="Địa chỉ văn phòng" value={profile.location} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
