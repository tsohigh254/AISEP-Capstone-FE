"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  GetPendingAdvisors,
  GetPendingInvestors,
  GetPendingStartups,
  IPendingAdvisorDto,
  IPendingInvestorDto,
  IPendingStartupDto,
} from "@/services/staff/registration.api";
import {
  Search,
  Filter,
  ChevronDown,
  Clock,
  ShieldCheck,
  User,
  Calendar,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KYCSubtype, KYC_SUBTYPE_CONFIGS } from "@/types/staff-kyc";

type KYCStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "PENDING_MORE_INFO"
  | "APPROVED"
  | "REJECTED";

interface KYCSubmission {
  id: string;
  applicantName: string;
  entityName: string;
  role: "STARTUP" | "INVESTOR" | "ADVISOR";
  subtype: KYCSubtype;
  submittedAt: string;
  status: KYCStatus;
  slaDays: number;
  avatarUrl?: string | null;
}

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600",
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
];

const STATUS_CFG: Record<
  KYCStatus,
  { label: string; badge: string; dot: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    badge: "bg-amber-50 text-amber-700 border-amber-200/80",
    dot: "bg-amber-400",
  },
  IN_REVIEW: {
    label: "Đang soát xét",
    badge: "bg-blue-50 text-blue-700 border-blue-200/80",
    dot: "bg-blue-400",
  },
  PENDING_MORE_INFO: {
    label: "Chờ bổ sung",
    badge: "bg-purple-50 text-purple-700 border-purple-200/80",
    dot: "bg-purple-400",
  },
  APPROVED: {
    label: "Đã duyệt",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-400",
  },
  REJECTED: {
    label: "Từ chối",
    badge: "bg-red-50 text-red-700 border-red-200/80",
    dot: "bg-red-400",
  },
};

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function normalizeStatus(value: unknown): KYCStatus {
  const raw = String(value || "").toUpperCase();
  if (
    ["UNDER_REVIEW", "IN_REVIEW", "PENDING_REVIEW", "PENDINGKYC"].includes(raw)
  ) {
    return "IN_REVIEW";
  }
  if (raw === "PENDING_MORE_INFO") return "PENDING_MORE_INFO";
  if (["APPROVED", "VERIFIED"].includes(raw)) return "APPROVED";
  if (["REJECTED", "FAILED", "VERIFICATION_FAILED"].includes(raw)) {
    return "REJECTED";
  }
  return "PENDING";
}

function getSlaDays(value: unknown): number {
  const timestamp = value ? new Date(String(value)).getTime() : NaN;
  if (Number.isNaN(timestamp)) return 0;
  return Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 3600 * 24)));
}

function normalizeStartupSubtype(item: {
  startupVerificationType?: string;
  StartupVerificationType?: string;
  submissionSummary?: {
    startupVerificationType?: string;
    StartupVerificationType?: string;
  } | null;
}): KYCSubtype {
  const verificationType =
    item.startupVerificationType ||
    item.StartupVerificationType ||
    item.submissionSummary?.startupVerificationType ||
    item.submissionSummary?.StartupVerificationType;

  if (verificationType === "WITH_LEGAL_ENTITY") return "STARTUP_ENTITY";
  if (verificationType === "WITHOUT_LEGAL_ENTITY") return "STARTUP_NO_ENTITY";
  return "STARTUP_NO_ENTITY";
}

export default function KYCPendingListPage() {
  const [activeTab, setActiveTab] = useState<
    "ALL" | "STARTUP" | "INVESTOR" | "ADVISOR"
  >("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: startupData, isLoading: startupLoading } = useQuery({
    queryKey: ["kyc-pending-startups"],
    queryFn: async () => {
      const res = await GetPendingStartups(1, 50);
      return ((res as IBackendRes<{ items: unknown[] }>)?.data?.items ||
        []) as IPendingStartupDto[];
    },
    staleTime: 0,
    refetchInterval: 10000,
  });

  const { data: advisorData, isLoading: advisorLoading } = useQuery({
    queryKey: ["kyc-pending-advisors"],
    queryFn: async () => {
      const res = await GetPendingAdvisors(1, 50);
      return ((res as IBackendRes<{ items: unknown[] }>)?.data?.items ||
        []) as IPendingAdvisorDto[];
    },
    staleTime: 0,
    refetchInterval: 10000,
  });

  const { data: investorData, isLoading: investorLoading } = useQuery({
    queryKey: ["kyc-pending-investors"],
    queryFn: async () => {
      const res = await GetPendingInvestors(1, 50);
      return ((res as IBackendRes<{ items: unknown[] }>)?.data?.items ||
        []) as IPendingInvestorDto[];
    },
    staleTime: 0,
    refetchInterval: 10000,
  });

  const isLoading = startupLoading || advisorLoading || investorLoading;

  const combinedData = useMemo(() => {
    if (isLoading) return [] as KYCSubmission[];

    const mappedStartups: KYCSubmission[] = (startupData || []).map((item) => ({
      id: `STARTUP-${item.startupID ?? item.startupId ?? item.id}`,
      applicantName:
        String(
          item.applicantName ??
            item.companyName ??
            item.submissionSummary?.legalFullName ??
            item.submissionSummary?.projectName ??
            "Chưa cập nhật",
        ) || "Chưa cập nhật",
      entityName: String(item.entityName ?? item.industryName ?? "Startup"),
      role: "STARTUP",
      subtype: normalizeStartupSubtype(item),
      submittedAt: String(
        item.submittedAt ?? item.updatedAt ?? new Date().toISOString(),
      ),
      status: normalizeStatus(item.workflowStatus ?? item.profileStatus),
      slaDays: getSlaDays(item.submittedAt ?? item.updatedAt),
      avatarUrl: item.logoURL ?? null,
    }));

    const mappedAdvisors: KYCSubmission[] = (advisorData || []).map((item) => ({
      id: `ADVISOR-${item.advisorID ?? item.advisorId ?? item.id}`,
      applicantName: String(item.fullName ?? "Chưa cập nhật"),
      entityName: String(item.title ?? "Chuyên gia"),
      role: "ADVISOR",
      subtype: "ADVISOR",
      submittedAt: String(
        item.submittedAt ?? item.updatedAt ?? new Date().toISOString(),
      ),
      status: normalizeStatus(item.workflowStatus ?? item.profileStatus),
      slaDays: getSlaDays(item.submittedAt ?? item.updatedAt),
      avatarUrl: item.profilePhotoURL ?? null,
    }));

    const mappedInvestors: KYCSubmission[] = (investorData || []).map((item) => ({
      id: `INVESTOR-${item.investorID ?? item.investorId ?? item.id}`,
      applicantName: String(item.fullName ?? "Chưa cập nhật"),
      entityName: String(item.firmName ?? "Nhà đầu tư cá nhân"),
      role: "INVESTOR",
      subtype: item.firmName
        ? "INSTITUTIONAL_INVESTOR"
        : "INDIVIDUAL_INVESTOR",
      submittedAt: String(
        item.submittedAt ?? item.updatedAt ?? new Date().toISOString(),
      ),
      status: normalizeStatus(item.workflowStatus ?? item.profileStatus),
      slaDays: getSlaDays(item.submittedAt ?? item.updatedAt),
      avatarUrl: item.profilePhotoURL ?? null,
    }));

    return [...mappedStartups, ...mappedAdvisors, ...mappedInvestors];
  }, [advisorData, investorData, isLoading, startupData]);

  const filteredData = combinedData.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.role === activeTab;
    const loweredSearch = search.toLowerCase();
    const matchesSearch =
      item.applicantName.toLowerCase().includes(loweredSearch) ||
      item.entityName.toLowerCase().includes(loweredSearch) ||
      item.id.toLowerCase().includes(loweredSearch);
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    return matchesTab && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-plus-jakarta-sans text-[20px] font-bold tracking-tight text-slate-900">
            Xét duyệt danh tính (KYC)
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Quản lý và thẩm định hồ sơ người dùng trên nền tảng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/staff/kyc/history"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Calendar className="h-4 w-4" />
            Lịch sử duyệt
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, tổ chức, mã hồ sơ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-plus-jakarta-sans w-full rounded-xl border border-slate-200 bg-slate-50/30 py-2.5 pl-9 pr-3 text-[13px] placeholder:text-slate-400 transition-all focus:border-[#eec54e] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-bold shadow-sm transition-all active:scale-95",
                    activeTab !== "ALL"
                      ? "border-[#eec54e] bg-amber-50 text-[#C8A000]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User
                      className={cn(
                        "h-4 w-4",
                        activeTab !== "ALL"
                          ? "text-[#eec54e]"
                          : "text-slate-400",
                      )}
                    />
                    <span>
                      {activeTab === "ALL"
                        ? "Tất cả đối tượng"
                        : activeTab === "STARTUP"
                          ? "Startup"
                          : activeTab === "INVESTOR"
                            ? "Nhà đầu tư"
                            : "Cố vấn"}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="font-plus-jakarta-sans w-[180px] rounded-2xl border-slate-100 bg-white p-1.5 shadow-xl"
              >
                <DropdownMenuRadioGroup
                  value={activeTab}
                  onValueChange={(v) =>
                    setActiveTab(v as "ALL" | "STARTUP" | "INVESTOR" | "ADVISOR")
                  }
                >
                  <DropdownMenuRadioItem
                    value="ALL"
                    className="rounded-xl py-2 text-[12px] font-medium"
                  >
                    Tất cả đối tượng
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="STARTUP"
                    className="rounded-xl py-2 text-[12px] font-medium"
                  >
                    Startup
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="INVESTOR"
                    className="rounded-xl py-2 text-[12px] font-medium"
                  >
                    Nhà đầu tư
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value="ADVISOR"
                    className="rounded-xl py-2 text-[12px] font-medium"
                  >
                    Cố vấn
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-bold shadow-sm transition-all active:scale-95",
                    statusFilter !== "ALL"
                      ? "border-[#eec54e] bg-amber-50 text-[#C8A000]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className={cn(
                        "h-4 w-4",
                        statusFilter !== "ALL"
                          ? "text-[#eec54e]"
                          : "text-slate-400",
                      )}
                    />
                    <span>
                      {statusFilter === "ALL"
                        ? "Tất cả trạng thái"
                        : STATUS_CFG[statusFilter as KYCStatus].label}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="font-plus-jakarta-sans w-[180px] rounded-2xl border-slate-100 bg-white p-1.5 shadow-xl"
              >
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <DropdownMenuRadioItem
                    value="ALL"
                    className="rounded-xl py-2 text-[12px] font-medium"
                  >
                    Tất cả trạng thái
                  </DropdownMenuRadioItem>
                  {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                    <DropdownMenuRadioItem
                      key={key}
                      value={key}
                      className="rounded-xl py-2 text-[12px] font-medium"
                    >
                      {cfg.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {(activeTab !== "ALL" || statusFilter !== "ALL" || search !== "") && (
              <button
                onClick={() => {
                  setActiveTab("ALL");
                  setStatusFilter("ALL");
                  setSearch("");
                }}
                className="ml-2 rounded-xl border border-rose-100 bg-rose-50 p-2.5 text-rose-500 transition-all hover:bg-rose-100 active:scale-95"
                title="Xóa tất cả bộ lọc"
              >
                <Filter className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Hồ sơ
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Đối tượng
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Ngày nộp
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => {
                const status = STATUS_CFG[item.status];
                const isOverdue = item.slaDays > 1 && item.status === "PENDING";

                return (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold text-white shadow-sm overflow-hidden",
                            !item.avatarUrl && `bg-gradient-to-br ${getAvatarGradient(item.applicantName)}`,
                          )}
                        >
                          {item.avatarUrl
                            ? <img src={item.avatarUrl} alt={item.applicantName} className="w-full h-full object-cover" />
                            : item.applicantName.charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-slate-900 transition-colors group-hover:text-slate-600">
                            {item.applicantName}
                          </span>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span className="font-mono text-[11px] uppercase tracking-tight text-slate-400">
                              #{item.id}
                            </span>
                            <span className="text-[11px] text-slate-200">•</span>
                            <span className="leading-none text-[11px] text-slate-400">
                              {item.entityName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-slate-700">
                          {item.role === "STARTUP"
                            ? "Startup"
                            : item.role === "INVESTOR"
                              ? "Nhà đầu tư"
                              : "Cố vấn"}
                        </span>
                        <span className="mt-0.5 text-[11px] text-slate-400">
                          {KYC_SUBTYPE_CONFIGS[item.subtype].label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-slate-600">
                          {new Date(item.submittedAt).toLocaleDateString("vi-VN")}
                        </span>
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1.5 text-[11px] font-semibold",
                            isOverdue ? "text-red-500" : "text-slate-400",
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{item.slaDays} ngày chờ</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-semibold",
                          status.badge,
                        )}
                      >
                        <div
                          className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/staff/kyc/${item.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#eec54e]/40 bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#C8A000] shadow-sm transition-all hover:scale-105 hover:border-[#eec54e] hover:bg-[#eec54e] hover:text-white active:scale-95"
                        >
                          Thẩm định
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <p className="text-[12px] font-medium text-slate-500">
            Hiển thị{" "}
            <span className="font-bold text-slate-900">{filteredData.length}</span>{" "}
            trên {combinedData.length} hồ sơ
          </p>
          <div className="flex items-center gap-2">
            <button className="cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-400 transition-colors">
              Trước
            </button>
            <button className="cursor-not-allowed rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-400 transition-colors">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
