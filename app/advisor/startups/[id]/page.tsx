"use client";

import { AdvisorShell } from "@/components/advisor/advisor-shell";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Hash,
  Layers,
  Lightbulb,
  Loader2,
  MapPin,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "@/services/interceptor";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  "0": "Hạt giống (Idea)",
  "1": "Tiền ươm mầm (Pre-Seed)",
  "2": "Ươm mầm (Seed)",
  "3": "Series A",
  "4": "Series B",
  "5": "Series C+",
  "6": "Tăng trưởng (Growth)",
  Idea: "Hạt giống (Idea)",
  PreSeed: "Tiền ươm mầm (Pre-Seed)",
  Seed: "Ươm mầm (Seed)",
  SeriesA: "Series A",
  SeriesB: "Series B",
  SeriesC: "Series C+",
  Growth: "Tăng trưởng (Growth)",
};

const TABS = ["Tổng quan", "Kinh doanh", "Gọi vốn", "Đội ngũ & Xác thực", "Liên hệ"] as const;
type Tab = typeof TABS[number];

const MONOGRAM_PALETTES = [
  { bg: "bg-violet-500",  text: "text-white" },
  { bg: "bg-blue-500",    text: "text-white" },
  { bg: "bg-emerald-500", text: "text-white" },
  { bg: "bg-rose-500",    text: "text-white" },
  { bg: "bg-amber-500",   text: "text-white" },
  { bg: "bg-cyan-500",    text: "text-white" },
  { bg: "bg-pink-500",    text: "text-white" },
  { bg: "bg-indigo-500",  text: "text-white" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonogramPalette(id: number) {
  return MONOGRAM_PALETTES[id % MONOGRAM_PALETTES.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function getErrorCode(source: any): string | undefined {
  return (
    source?.errorCode ??
    source?.error?.code ??
    source?.data?.errorCode ??
    source?.data?.error?.code ??
    source?.response?.data?.errorCode ??
    source?.response?.data?.error?.code
  );
}

function getErrorMessage(source: any): string | undefined {
  return (
    source?.message ??
    source?.error?.message ??
    source?.data?.message ??
    source?.response?.data?.message
  );
}

// ─── Reusable components ──────────────────────────────────────────────────────

function Tag({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "green" | "violet" | "amber" | "blue";
}) {
  const cls = {
    default: "bg-slate-50 text-slate-600 border-slate-100",
    green:   "bg-emerald-50 text-emerald-700 border-emerald-100/60",
    violet:  "bg-violet-50 text-violet-600 border-violet-100/60",
    amber:   "bg-amber-50 text-amber-700 border-amber-100/60",
    blue:    "bg-sky-50 text-sky-600 border-sky-100/60",
  }[variant];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border", cls)}>
      {children}
    </span>
  );
}

function InfoPair({ label, value, isLink }: { label: string; value?: string | null; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{label}</p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-[13px] font-medium text-slate-700">{value}</p>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto space-y-5 pb-16">
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="h-28 bg-slate-200 animate-pulse" />
          <div className="px-7 pb-7 space-y-4">
            <div className="w-20 h-20 -mt-10 rounded-2xl bg-slate-300 animate-pulse border-[3px] border-white" />
            <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-lg" />
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-md" />
              <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <div key={t} className="h-9 w-28 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-48 animate-pulse" />
          </div>
          <div className="col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-48 animate-pulse" />
          </div>
        </div>
      </div>
    </AdvisorShell>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const router = useRouter();
  return (
    <AdvisorShell>
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-[16px] font-semibold text-slate-800">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-slate-700"
          >
            Thử lại
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-200"
          >
            Quay lại
          </button>
        </div>
      </div>
    </AdvisorShell>
  );
}

// ─── Tab: Tổng quan ───────────────────────────────────────────────────────────

function TabOverview({ p, displayStage, displayIndustry, foundedDateDisplay, teamSizeValue }: any) {
  const currentNeeds: string[] = Array.isArray(p.currentNeeds) ? p.currentNeeds : [];

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Left */}
      <div className="col-span-12 lg:col-span-8 space-y-5">
        {/* Problem / Solution cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: AlertTriangle,
              label: "Vấn đề",
              text: p.problemStatement || "Chưa cập nhật vấn đề",
              color: "text-rose-500",
            },
            {
              icon: Lightbulb,
              label: "Giải pháp",
              text: p.solutionSummary || p.solution || "Chưa cập nhật giải pháp",
              color: "text-amber-500",
            },
          ].map(({ icon: Icon, label, text, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", color)} />
                <h3 className="text-[13px] font-semibold text-slate-700">{label}</h3>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="text-[13px] font-semibold text-slate-700">Mô tả chi tiết</h3>
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            {p.description || "Chưa cập nhật mô tả"}
          </p>
        </div>

        {/* Current Needs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            <h3 className="text-[13px] font-semibold text-slate-700">Nhu cầu hiện tại</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentNeeds.length > 0 ? (
              currentNeeds.map((n: string) => (
                <span
                  key={n}
                  className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25"
                >
                  {n}
                </span>
              ))
            ) : (
              <span className="text-[12px] text-slate-400">Chưa có thông tin nhu cầu</span>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="col-span-12 lg:col-span-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thông tin nhanh</h3>
          <div className="space-y-3">
            {[
              { icon: Layers,        label: "Giai đoạn",  val: displayStage || "-" },
              { icon: Building2,     label: "Ngành",      val: displayIndustry || "-" },
              { icon: Globe,         label: "Thị trường", val: p.marketScope || "-" },
              { icon: CheckCircle2,  label: "Sản phẩm",   val: p.productStatus || "-" },
              { icon: Calendar,      label: "Thành lập",  val: foundedDateDisplay || (p.foundedYear ? `${p.foundedYear}` : "-") },
              { icon: Users,         label: "Team size",  val: teamSizeValue ? `${teamSizeValue} người` : "-" },
              {
                icon: MapPin,
                label: "Địa điểm",
                val: [p.location, p.country].filter(Boolean).join(", ") || "-",
              },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-[12px] font-medium text-slate-700 truncate">{val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Kinh doanh ──────────────────────────────────────────────────────────

function TabBusiness({ p }: any) {
  const currentNeeds: string[] = Array.isArray(p.currentNeeds) ? p.currentNeeds : [];
  const hasContent = p.problemStatement || p.solutionSummary || p.solution || p.marketScope || p.productStatus;

  if (!hasContent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
        <Lightbulb className="w-8 h-8 text-slate-200 mx-auto" />
        <p className="text-[13px] text-slate-400">Startup chưa cập nhật thông tin kinh doanh.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-8 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-5">
          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" /> Vấn đề & Giải pháp
          </h3>
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Vấn đề</p>
            <p className="text-[13px] text-slate-600 leading-relaxed">{p.problemStatement || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Giải pháp</p>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {p.solutionSummary || p.solution || "-"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" /> Nhu cầu hiện tại
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentNeeds.length > 0 ? (
              currentNeeds.map((n: string) => (
                <span
                  key={n}
                  className="px-3 py-1.5 rounded-lg bg-[#fdfbe9] text-[#171611] text-[12px] font-medium border border-[#e6cc4c]/25"
                >
                  {n}
                </span>
              ))
            ) : (
              <span className="text-[12px] text-slate-400">Chưa có</span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thị trường</h3>
          <InfoPair label="Phạm vi thị trường" value={p.marketScope} />
          <InfoPair label="Trạng thái sản phẩm" value={p.productStatus} />
          {!p.marketScope && !p.productStatus && (
            <p className="text-[12px] text-slate-400">Chưa có thông tin.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Gọi vốn ─────────────────────────────────────────────────────────────

function TabFunding({ p, displayStage }: any) {
  const targetFunding = Number(p.fundingAmountSought) || 0;
  const raisedAmount = Number(p.currentFundingRaised) || 0;
  const fundingProgress =
    targetFunding > 0 ? Math.min(100, Math.round((raisedAmount / targetFunding) * 100)) : 0;

  if (!targetFunding && !raisedAmount) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
        <DollarSign className="w-8 h-8 text-slate-200 mx-auto" />
        <p className="text-[13px] text-slate-400">Startup chưa cập nhật thông tin gọi vốn.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      {[
        {
          label: "Giai đoạn gọi vốn",
          value: displayStage || "-",
          icon: TrendingUp,
          sub: "Vòng hiện tại",
        },
        {
          label: "Số vốn cần",
          value: targetFunding > 0 ? `$${targetFunding.toLocaleString()}` : "-",
          icon: DollarSign,
          sub: "USD",
        },
        {
          label: "Đã huy động",
          value: raisedAmount > 0 ? `$${raisedAmount.toLocaleString()}` : "-",
          icon: CheckCircle2,
          sub: `${fundingProgress}% mục tiêu`,
        },
      ].map(({ label, value, icon: Icon, sub }) => (
        <div
          key={label}
          className="col-span-12 sm:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">{value}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
        </div>
      ))}
      <div className="col-span-12 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <p className="text-[12px] font-medium text-slate-500 mb-3">Tiến độ huy động vốn</p>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e6cc4c] rounded-full transition-all"
            style={{ width: `${fundingProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-slate-400">${raisedAmount.toLocaleString()} đã huy động</span>
          <span className="text-[11px] text-slate-400">Mục tiêu ${targetFunding.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Đội ngũ & Xác thực ──────────────────────────────────────────────────

function TabTeam({ p, teamSizeValue }: any) {
  const members: any[] = Array.isArray(p.teamMembers)
    ? p.teamMembers
    : Array.isArray(p.team)
      ? p.team
      : [];
  const isApproved = !!(p.approvedAt || p.approvedBy);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-8 space-y-5">
        {/* Team members */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-5">
          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Thành viên cốt cán ({members.length})
          </h3>
          <div className="divide-y divide-slate-100">
            {members.length > 0 ? (
              members.map((m: any, idx: number) => (
                <div
                  key={m.teamMemberID ?? m.id ?? idx}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                    {(m.photoURL || m.PhotoURL) ? (
                      <Image
                        src={m.photoURL ?? m.PhotoURL}
                        alt={m.fullName ?? m.FullName ?? m.name ?? "Member"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-[13px] font-bold">
                        {(m.fullName ?? m.FullName ?? m.name ?? "?")[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] font-semibold text-slate-800">
                          {m.fullName ?? m.FullName ?? m.name ?? "Thành viên"}
                        </p>
                        {(m.isFounder || m.IsFounder) && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100/50 text-amber-700 text-[10px] font-bold border border-amber-200/50">
                            FOUNDER
                          </span>
                        )}
                      </div>
                      {(m.linkedInURL || m.LinkedInURL) && (
                        <a href={m.linkedInURL ?? m.LinkedInURL} target="_blank" rel="noreferrer" className="hover:bg-blue-50 p-1.5 rounded-lg transition-colors flex-shrink-0">
                          <Image src="/linkedin.svg" alt="LinkedIn" width={16} height={16} />
                        </a>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 font-medium">
                      {[m.title ?? m.Title, m.role ?? m.Role].filter(Boolean).join(" · ")}
                      {Number(m.yearsOfExperience) > 0 ? ` · ${m.yearsOfExperience} năm kinh nghiệm` : ""}
                    </p>
                    {(m.bio || m.Bio) && (
                      <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{m.bio ?? m.Bio}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-slate-400 italic">Chưa có thông tin thành viên.</p>
            )}
          </div>
        </div>

        {/* Traction */}
        {p.metricSummary && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
            <h3 className="text-[13px] font-semibold text-slate-700">Chỉ số traction</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed font-mono bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
              {p.metricSummary}
            </p>
          </div>
        )}
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-4">
        {p.enterpriseCode && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Pháp lý</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-[12px] font-medium text-emerald-700">Đã đăng ký doanh nghiệp</span>
            </div>
            <InfoPair label="Mã số doanh nghiệp" value={p.enterpriseCode} />
          </div>
        )}

        {isApproved && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-3">
            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Thông tin duyệt</h3>
            {p.approvedAt && (
              <InfoPair
                label="Ngày duyệt"
                value={new Date(p.approvedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            )}
            {p.approvedBy && <InfoPair label="Duyệt bởi" value={p.approvedBy} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Liên hệ ─────────────────────────────────────────────────────────────

function TabContact({ p }: any) {
  const hasContact = p.contactEmail || p.contactPhone || p.location || p.country;
  const hasLinks = p.website || p.linkedInURL;

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
        <h3 className="text-[13px] font-semibold text-slate-700">Liên hệ trực tiếp</h3>
        {hasContact ? (
          <div className="space-y-3">
            <InfoPair label="Email" value={p.contactEmail} />
            <InfoPair label="Điện thoại" value={p.contactPhone} />
            <InfoPair
              label="Địa chỉ"
              value={[p.location, p.country].filter(Boolean).join(", ") || undefined}
            />
          </div>
        ) : (
          <p className="text-[12px] text-slate-400">Chưa có thông tin liên hệ.</p>
        )}
      </div>
      <div className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
        <h3 className="text-[13px] font-semibold text-slate-700">Liên kết</h3>
        {hasLinks ? (
          <div className="space-y-3">
            <InfoPair label="Website" value={p.website} isLink />
            <InfoPair label="LinkedIn" value={p.linkedInURL} isLink />
          </div>
        ) : (
          <p className="text-[12px] text-slate-400">Chưa có liên kết.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdvisorStartupDetailPage() {
  const params = useParams();
  const startupId = Number(params.id);

  const [startup, setStartup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Tổng quan");

  const fetchStartup = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!Number.isFinite(startupId) || startupId <= 0) {
      setError("Không tìm thấy thông tin startup.");
      setLoading(false);
      return;
    }

    try {
      const res = (await axios.get(`/api/startups/${startupId}`)) as IBackendRes<any>;
      if ((res?.success || res?.isSuccess) && res.data) {
        setStartup(res.data);
      } else {
        const code = getErrorCode(res);
        setError(
          code === "STARTUP_NOT_FOUND" || res?.statusCode === 404
            ? "Không tìm thấy thông tin startup."
            : getErrorMessage(res) || "Không tải được thông tin startup. Vui lòng thử lại.",
        );
      }
    } catch (err: any) {
      const code = getErrorCode(err);
      setError(
        code === "STARTUP_NOT_FOUND" || err?.response?.status === 404
          ? "Không tìm thấy thông tin startup."
          : getErrorMessage(err) || "Không tải được thông tin startup. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => {
    void fetchStartup();
  }, [fetchStartup]);

  if (loading) return <ProfileSkeleton />;
  if (error || !startup) return <ErrorState message={error ?? "Không tìm thấy startup."} onRetry={fetchStartup} />;

  // ── Derived values ───────────────────────────────────────────────────────────
  const palette = getMonogramPalette(Number(startup.startupID ?? startupId));
  const companyName = startup.companyName ?? "Startup";
  const displayStage = STAGE_LABELS[startup.stage?.toString()] || STAGE_LABELS[startup.fundingStage?.toString()] || startup.fundingStage || startup.stage;
  const displayIndustry = startup.parentIndustryName
    ? `${startup.parentIndustryName} / ${startup.industryName || startup.industry || ""}`
    : (startup.industryName || startup.industry);
  const teamSizeValue = startup.teamSize ?? startup.TeamSize;

  const foundedDateDisplay = startup.foundedDate
    ? new Date(startup.foundedDate).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  const tabProps = { p: startup, displayStage, displayIndustry, foundedDateDisplay, teamSizeValue };

  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto space-y-5 pb-16">

        {/* ── Hero Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="px-7 pb-7 relative">
            {/* Logo — overlaps cover */}
            <div className="-mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-[3px] border-white shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {startup.logoURL ? (
                  <img
                    src={startup.logoURL}
                    alt={companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn("w-full h-full flex items-center justify-center", palette.bg)}>
                    <span className={cn("text-[20px] font-bold tracking-tight", palette.text)}>
                      {getInitials(companyName)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Name + status */}
            <div className="mb-3">
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">
                  {companyName}
                </h1>
                {startup.profileStatus === "Approved" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                  </span>
                )}
              </div>
              {startup.oneLiner && (
                <p className="text-[13px] text-slate-500">{startup.oneLiner}</p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {displayStage && (
                <Tag variant="green">
                  <TrendingUp className="w-3 h-3" />
                  {displayStage}
                </Tag>
              )}
              <Tag>
                <Building2 className="w-3 h-3 text-slate-400" />
                {displayIndustry || "Chưa có ngành"}
              </Tag>
              {startup.marketScope && <Tag variant="blue">{startup.marketScope}</Tag>}
              <span className="text-slate-200 text-[14px] mx-0.5">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3" />
                {startup.location || "Chưa rõ vị trí"}
              </span>
              {startup.productStatus && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="text-slate-200">·</span> {startup.productStatus}
                </span>
              )}
              {startup.enterpriseCode && (
                <Tag variant="green">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã đăng ký doanh nghiệp
                </Tag>
              )}
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-slate-100">
              {[
                ...(foundedDateDisplay
                  ? [{ icon: Clock, label: "Thành lập", value: foundedDateDisplay }]
                  : []),
                ...(Number(startup.fundingAmountSought) > 0
                  ? [{ icon: DollarSign, label: "Vốn gọi", value: `$${Number(startup.fundingAmountSought).toLocaleString()}` }]
                  : []),
                ...(teamSizeValue
                  ? [{ icon: Users, label: "Quy mô", value: `${teamSizeValue} người` }]
                  : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-700 leading-none">{value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap",
                activeTab === tab
                  ? "bg-[#0f172a] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "Tổng quan"            && <TabOverview  {...tabProps} />}
        {activeTab === "Kinh doanh"           && <TabBusiness  {...tabProps} />}
        {activeTab === "Gọi vốn"              && <TabFunding   {...tabProps} />}
        {activeTab === "Đội ngũ & Xác thực"  && <TabTeam      {...tabProps} />}
        {activeTab === "Liên hệ"              && <TabContact   {...tabProps} />}

      </div>
    </AdvisorShell>
  );
}
