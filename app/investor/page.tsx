"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bookmark,
  Brain,
  FileEdit,
  FolderOpen,
  Handshake,
  Loader2,
  MoreVertical,
  Search,
  ShieldCheck as ShieldCheckIcon,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";
import { buildInvestorProfilePresentation } from "@/lib/investor-profile-presenter";
import { GetSentConnections } from "@/services/connection/connection.api";
import { GetDocument } from "@/services/document/document.api";
import { GetInvestorProfile, GetInvestorWatchlist } from "@/services/investor/investor.api";
import { GetInvestorKYCStatus } from "@/services/investor/investor-kyc";
import type { IInvestorKYCStatus } from "@/types/investor-kyc";

type RawWatchlistItem = Partial<{
  watchlistID: number;
  watchlistId: number;
  WatchlistID: number;
  WatchlistId: number;
  investorID: number;
  investorId: number;
  InvestorID: number;
  InvestorId: number;
  startupID: number;
  startupId: number;
  StartupID: number;
  StartupId: number;
  companyName: string;
  CompanyName: string;
  startupName: string;
  StartupName: string;
  addedAt: string;
  AddedAt: string;
}>;

type WatchlistPayload =
  | IPaginatedRes<IWatchlistItem>
  | { data?: RawWatchlistItem[]; items?: RawWatchlistItem[]; paging?: IPaging }
  | RawWatchlistItem[]
  | null
  | undefined;

function isUnauthorized(result: PromiseSettledResult<unknown>) {
  return (
    result.status === "rejected" &&
    typeof result.reason === "object" &&
    result.reason !== null &&
    "response" in result.reason &&
    typeof (result.reason as { response?: { status?: number } }).response?.status === "number" &&
    (result.reason as { response?: { status?: number } }).response?.status === 401
  );
}

function normalizeWatchlistItems(source: RawWatchlistItem[]) {
  return source
    .map<IWatchlistItem | null>((raw) => {
      const startupName =
        raw.companyName ?? raw.CompanyName ?? raw.startupName ?? raw.StartupName ?? "";
      const addedAt = raw.addedAt ?? raw.AddedAt ?? "";

      if (!startupName || !addedAt) {
        return null;
      }

      return {
        watchlistId:
          raw.watchlistID ?? raw.watchlistId ?? raw.WatchlistID ?? raw.WatchlistId ?? 0,
        investorID: raw.investorID ?? raw.investorId ?? raw.InvestorID ?? raw.InvestorId ?? 0,
        startupID: raw.startupID ?? raw.startupId ?? raw.StartupID ?? raw.StartupId ?? 0,
        startupName,
        addedAt,
      };
    })
    .filter((item): item is IWatchlistItem => Boolean(item));
}

function extractWatchlistData(payload: WatchlistPayload) {
  if (Array.isArray(payload)) {
    const items = normalizeWatchlistItems(payload);
    return { items, totalItems: items.length };
  }

  const pagedItems =
    payload && "items" in payload && Array.isArray(payload.items) ? payload.items : null;
  if (pagedItems) {
    const normalizedItems = normalizeWatchlistItems(pagedItems as RawWatchlistItem[]);
    const pagedPayload = payload && typeof payload === "object" ? payload : null;
    return {
      items: normalizedItems,
      totalItems:
        (pagedPayload && "paging" in pagedPayload ? pagedPayload.paging?.totalItems : undefined) ??
        normalizedItems.length,
    };
  }

  const rawItems =
    payload && "data" in payload && Array.isArray(payload.data)
      ? normalizeWatchlistItems(payload.data)
      : payload && "items" in payload && Array.isArray(payload.items)
        ? normalizeWatchlistItems(payload.items)
        : [];

  return {
    items: rawItems,
    totalItems:
      payload && "paging" in payload ? payload.paging?.totalItems ?? rawItems.length : rawItems.length,
  };
}

export default function InvestorDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<IInvestorProfile | null>(null);
  const [kycStatus, setKycStatus] = useState<IInvestorKYCStatus | null>(null);
  const [watchlist, setWatchlist] = useState<IWatchlistItem[]>([]);
  const [watchlistTotal, setWatchlistTotal] = useState(0);
  const [connectionTotal, setConnectionTotal] = useState(0);
  const [docTotal, setDocTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);

    try {
      const results = await Promise.allSettled([
        GetInvestorProfile(),
        GetInvestorKYCStatus(),
        GetInvestorWatchlist(1, 5),
        GetDocument(),
        GetSentConnections(1, 1),
      ]);

      const [profileResult, kycResult, watchlistResult, docsResult, connectionsResult] = results;

      if (
        isUnauthorized(profileResult) ||
        isUnauthorized(kycResult) ||
        isUnauthorized(watchlistResult) ||
        isUnauthorized(docsResult) ||
        isUnauthorized(connectionsResult)
      ) {
        return;
      }

      if (profileResult.status === "fulfilled") {
        const profileRes = profileResult.value;
        if (profileRes?.isSuccess && profileRes.data) {
          setProfile(profileRes.data);
          if (profileRes.data.profileStatus === "Draft") {
            router.push("/investor/onboard");
            return;
          }
        }
      }

      if (kycResult.status === "fulfilled") {
        const kycRes = kycResult.value;
        if (kycRes?.isSuccess && kycRes.data) {
          setKycStatus(kycRes.data);
        }
      }

      if (watchlistResult.status === "fulfilled") {
        const watchlistRes = watchlistResult.value;
        if (watchlistRes?.isSuccess) {
          const { items, totalItems } = extractWatchlistData(
            (watchlistRes.data ?? null) as WatchlistPayload,
          );
          setWatchlist(items);
          setWatchlistTotal(totalItems);
        }
      }

      if (docsResult.status === "fulfilled") {
        const docsRes = docsResult.value;
        if (docsRes?.isSuccess) {
          const documents = docsRes.data ?? [];
          setDocTotal(Array.isArray(documents) ? documents.length : 0);
        }
      }

      if (connectionsResult.status === "fulfilled") {
        const connectionsRes = connectionsResult.value;
        if (connectionsRes?.isSuccess) {
          setConnectionTotal(
            connectionsRes.data?.paging?.totalItems ?? connectionsRes.data?.items?.length ?? 0,
          );
        }
      }
    } catch (error) {
      console.error("fetchDashboardData error:", error);
      toast.error("Lỗi khi tải dữ liệu Dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const profileProgressCount = useMemo(() => {
    if (!profile) return 0;

    const fields = [
      profile.fullName,
      profile.firmName,
      profile.title,
      profile.bio,
      profile.location,
      profile.website,
      profile.linkedInURL,
      profile.investmentThesis,
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const profileProgress = useCountUp(profileProgressCount, 1200, 0);
  const watchlistCount = useCountUp(watchlistTotal, 1200, 0);
  const docCount = useCountUp(docTotal, 800, 0);
  const connectionCount = useCountUp(connectionTotal, 600, 0);
  const presentation = profile ? buildInvestorProfilePresentation(profile, kycStatus) : null;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#e6cc4c]" />
        <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  const isVerified = kycStatus?.workflowStatus === "VERIFIED";
  const isPending = kycStatus?.workflowStatus === "PENDING_REVIEW";
  const isFailed = kycStatus?.workflowStatus === "VERIFICATION_FAILED";

  return (
    <div className="animate-in space-y-6 fade-in duration-500">
      {!isVerified && !isPending && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-[#e6cc4c]/40 bg-[#e6cc4c]/10 p-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6cc4c]/20 text-[#e6cc4c]">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-slate-800">
                Tài khoản chưa được xác thực (KYC)
              </h4>
              <p className="text-[12px] text-slate-500">
                Xác thực ngay để nhận được sự tin tưởng từ các Startup và truy cập dữ liệu
                chuyên sâu.
              </p>
            </div>
          </div>
          <Link
            href="/investor/kyc"
            className="whitespace-nowrap rounded-xl bg-[#171611] px-6 py-2 text-[12px] font-bold text-white transition-all hover:bg-slate-700"
          >
            Xác thực ngay
          </Link>
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <p className="text-[13px] font-medium text-blue-700">
            Hồ sơ định danh của bạn đang được duyệt. Quá trình này có thể mất 1-2 ngày làm việc.
          </p>
        </div>
      )}

      {isFailed && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 p-4 md:flex-row">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-[13px] font-medium text-red-700">
              Xác thực thất bại. Vui lòng kiểm tra lại hồ sơ và nộp lại.
            </p>
          </div>
          <Link
            href="/investor/kyc"
            className="rounded-xl bg-red-600 px-5 py-2 text-[12px] font-bold text-white transition-all hover:bg-red-700"
          >
            Nộp lại hồ sơ
          </Link>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-6 rounded-2xl border border-neutral-surface bg-white p-6 shadow-sm md:flex-row lg:col-span-8">
          <div className="relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900 md:w-48">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
            <span className="relative z-10 text-7xl font-black text-white">
              {presentation?.primaryName?.charAt(0) || "V"}
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#171611]">
                  Chào mừng, {presentation?.primaryName || "Nhà đầu tư"}
                </h1>
                {isVerified ? (
                  <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-green-700">
                    <ShieldCheckIcon className="h-3 w-3" /> Đã xác thực
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                    Chưa xác thực
                  </span>
                )}
              </div>

              {presentation?.heroIdentityLine && (
                <p className="mb-3 text-sm font-medium text-slate-500">
                  {presentation.heroIdentityLine}
                </p>
              )}

              <p className="mb-6 text-sm leading-relaxed text-neutral-muted">
                Hồ sơ nhà đầu tư của bạn hiện đạt {profileProgressCount}%.
                {profileProgressCount < 100
                  ? " Hãy cập nhật đầy đủ thông tin để AI đề xuất Startup chính xác hơn."
                  : " Hồ sơ của bạn đã được tối ưu cho việc matching."}
              </p>

              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#171611]">
                  <span>Tiến độ hoàn thiện hồ sơ</span>
                  <span ref={profileProgress.ref}>{profileProgress.count}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#f4f4f0]">
                  <div
                    className="h-full rounded-full bg-[#e6cc4c] transition-all duration-1000 ease-out"
                    style={{ width: `${profileProgress.count}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/investor/profile"
                className="group flex items-center gap-2 rounded-xl bg-[#e6cc4c] px-6 py-2.5 font-bold text-[#171611] transition-all hover:shadow-lg"
              >
                <FileEdit className="h-5 w-5" />
                Hoàn thiện hồ sơ
              </Link>
            </div>
          </div>
        </div>

        <div className="col-span-12 rounded-2xl border border-neutral-surface bg-white p-6 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#171611]">Thao tác nhanh</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Search, label: "Khám phá", href: "/investor/startups", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Brain, label: "AI Chatbot", href: "/investor/ai-chatbot", color: "text-purple-500", bg: "bg-purple-50" },
              { icon: Bookmark, label: "Danh sách theo dõi", href: "/investor/watchlist", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Handshake, label: "Kết nối", href: "/investor/connections", color: "text-emerald-500", bg: "bg-emerald-50" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center justify-center rounded-2xl border border-transparent bg-[#f8f8f6] p-4 transition-all hover:border-neutral-surface hover:bg-white hover:shadow-xl hover:shadow-black/5"
              >
                <div
                  className={cn(
                    "mb-2 flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                    item.bg,
                  )}
                >
                  <item.icon className={cn("h-5 w-5 transition-colors", item.color)} />
                </div>
                <span className="text-center text-[11px] font-black uppercase tracking-tight text-[#171611]">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex items-center justify-between rounded-2xl border-2 border-[#e6cc4c]/30 bg-[#e6cc4c]/10 p-6 shadow-sm transition-all hover:bg-[#e6cc4c]/20 md:col-span-5 lg:col-span-5">
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-widest text-neutral-muted">
              Startup đang theo dõi
            </p>
            <div className="flex items-baseline gap-3">
              <span ref={watchlistCount.ref} className="text-4xl font-bold text-[#171611]">
                {watchlistCount.count}
              </span>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
            <Bookmark className="h-7 w-7 text-[#e6cc4c]" />
          </div>
        </div>

        <div className="col-span-12 flex items-center justify-between rounded-2xl border-2 border-[#e6cc4c]/30 bg-[#e6cc4c]/10 p-6 shadow-sm transition-all hover:bg-[#e6cc4c]/20 md:col-span-4 lg:col-span-4">
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-widest text-neutral-muted">
              Tài liệu đã truy cập
            </p>
            <div className="flex items-baseline gap-3">
              <span ref={docCount.ref} className="text-4xl font-bold text-[#171611]">
                {docCount.count}
              </span>
              <span className="text-sm font-bold lowercase text-neutral-muted">Files</span>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
            <FolderOpen className="h-7 w-7 text-[#e6cc4c]" />
          </div>
        </div>

        <div className="col-span-12 flex items-center justify-between rounded-2xl border border-neutral-surface bg-white p-6 shadow-sm transition-colors hover:bg-[#f8f8f6] md:col-span-3 lg:col-span-3">
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-widest text-neutral-muted">
              Kết nối Startup
            </p>
            <div className="flex items-baseline gap-3">
              <span ref={connectionCount.ref} className="text-4xl font-bold text-[#171611]">
                {connectionCount.count}
              </span>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f4f0] transition-colors group-hover:bg-white">
            <Handshake className="h-7 w-7 text-neutral-muted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 pb-12">
        <div className="col-span-12 rounded-2xl border border-neutral-surface bg-white p-6 shadow-sm lg:col-span-4">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#e6cc4c]" />
            <h3 className="text-lg font-bold text-[#171611]">Phân tích thị trường bằng AI</h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-tight text-green-800">
                <TrendingUp className="h-4 w-4" /> Xu hướng công nghệ
              </p>
              <ul className="ml-4 list-disc space-y-1.5 text-xs font-medium text-green-700">
                <li>SaaS B2B tăng 35% lượng gọi vốn trong Q2/2024.</li>
                <li>GreenTech và ClimateTech đang là xu hướng mới tại Việt Nam.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-tight text-blue-800">
                <Brain className="h-4 w-4" /> Đề xuất chiến lược
              </p>
              <ul className="ml-4 list-disc space-y-1.5 text-xs font-medium text-blue-700">
                <li>Phân bổ vốn giai đoạn Seed đang mang lại tỷ suất ROI tốt nhất.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-span-12 overflow-hidden rounded-2xl border border-neutral-surface bg-white shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-neutral-surface p-6">
            <h3 className="text-lg font-bold text-[#171611]">
              Hoạt động gần đây trên Danh sách theo dõi
            </h3>
            <Link
              href="/investor/watchlist"
              className="text-sm font-bold tracking-tight text-[#e6cc4c] hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f8f6]">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-neutral-muted">
                  <th className="px-6 py-3 tracking-[0.1em]">Startup</th>
                  <th className="px-6 py-3 tracking-[0.1em]">Cập nhật mới</th>
                  <th className="px-6 py-3 tracking-[0.1em]">Thời gian</th>
                  <th className="px-6 py-3 pr-10 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-surface">
                {watchlist.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Bookmark className="h-8 w-8 text-slate-200" />
                        <p className="text-[13px] font-bold text-slate-400">
                          Chưa có Startup nào trong danh sách theo dõi
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Khám phá và thêm Startup để theo dõi hoạt động tại đây.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  watchlist.map((item) => (
                    <tr
                      key={`${item.watchlistId}-${item.startupID}`}
                      className="group transition-colors hover:bg-[#f8f8f6]/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-slate-500">
                            {(item.startupName ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-[#171611]">
                            {item.startupName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Bookmark className="h-4 w-4 text-orange-500" />
                          <span className="text-xs font-bold tracking-tight text-neutral-700">
                            Đã thêm vào danh sách theo dõi
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium tracking-tight text-neutral-muted">
                        {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 pr-6 text-right">
                        <button className="rounded-lg p-1 text-neutral-muted transition-colors hover:bg-[#f4f4f0] hover:text-[#171611]">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
