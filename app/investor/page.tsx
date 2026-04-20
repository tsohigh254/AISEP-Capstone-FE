"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bookmark,
  Brain,
  Bot,
  Compass,
  FileEdit,
  FolderOpen,
  Handshake,
  Loader2,
  MoreVertical,
  ShieldCheck as ShieldCheckIcon,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";
import { buildInvestorProfilePresentation, getInvestorKycUiState } from "@/lib/investor-profile-presenter";
import { GetSentConnections, GetReceivedConnections } from "@/services/connection/connection.api";
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

function AIMarketAnalysis({ profile, watchlist }: { profile: IInvestorProfile | null; watchlist: IWatchlistItem[] }) {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      setText("");

      try {
        const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || "").replace(/\/$/, "");
        const endpoint = `${backendBase}/api/ai/investor-agent/chat/stream`;

        const industries = (profile?.preferredIndustries ?? []).slice(0, 5).join(", ");
        const watched = (watchlist ?? []).slice(0, 3).map(w => w.startupName).join(", ");

        let query = "Bạn là AI Investment Assistant. Tóm tắt 2 xu hướng công nghệ ngắn gọn (1 câu mỗi) và 1 khuyến nghị hành động cho nhà đầu tư.";
        if (industries) query += ` Ngành ưu tiên: ${industries}.`;
        if (watched) query += ` Startup đang theo dõi: ${watched}.`;
        query += " Trả lời bằng tiếng Việt dưới dạng các gạch đầu dòng, mỗi dòng ngắn gọn.";

        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const resp = await fetch(endpoint, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ query }),
        });

        if (!resp.ok) {
          const body = await resp.text();
          throw new Error(`HTTP ${resp.status} ${body}`);
        }

        const reader = resp.body?.getReader();
        if (!reader) {
          const body = await resp.text();
          if (mounted) setText(body);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split(/\r?\n\r?\n/);
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const lines = part.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const data = line.replace(/^data:\s?/, "").trim();
              if (data === "[DONE]") continue;
              let evt = null;
              try {
                evt = JSON.parse(data);
              } catch {
                if (mounted) setText(prev => prev + data);
                continue;
              }
              if (evt?.type === "answer_chunk" && evt.content) {
                if (mounted) setText(prev => prev + evt.content);
              } else if (evt?.type === "final_answer" && evt.content) {
                if (mounted) setText(prev => prev + evt.content);
              } else if (evt?.content) {
                if (mounted) setText(prev => prev + evt.content);
              }
            }
          }
        }
      } catch (err: any) {
        if (mounted) setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // run once
    run();
    return () => { mounted = false; };
  }, [profile, watchlist]);

  if (loading) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <div className="flex items-center gap-3 text-green-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm font-medium">Đang tạo phân tích AI...</p>
        </div>
      </div>
    );
  }

  if (error || !text) {
    // fallback – simple static hints when AI not available
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-tight text-green-800">
            <TrendingUp className="h-4 w-4" /> Xu hướng công nghệ
          </p>
          <ul className="ml-4 list-disc space-y-1.5 text-xs font-medium text-green-700">
            <li>SaaS B2B tiếp tục thu hút vốn giai đoạn Seed – Series A.</li>
            <li>Ứng dụng AI trong sản phẩm doanh nghiệp đang tăng trưởng mạnh.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-tight text-blue-800">
            <Brain className="h-4 w-4" /> Đề xuất chiến lược
          </p>
          <ul className="ml-4 list-disc space-y-1.5 text-xs font-medium text-blue-700">
            <li>Ưu tiên đầu tư giai đoạn Seed cho mô hình có traction rõ ràng.</li>
          </ul>
        </div>
      </div>
    );
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-tight text-green-800">
          <TrendingUp className="h-4 w-4" /> Xu hướng công nghệ
        </p>
        <ul className="ml-4 list-disc space-y-1.5 text-xs font-medium text-green-700">
          {lines.slice(0, 3).map((ln, idx) => (
            <li key={idx}>{ln}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-tight text-blue-800">
          <Brain className="h-4 w-4" /> Đề xuất chiến lược
        </p>
        <ul className="ml-4 list-disc space-y-1.5 text-xs font-medium text-blue-700">
          {lines.slice(3, 6).length ? lines.slice(3, 6).map((ln, idx) => (
            <li key={idx}>{ln}</li>
          )) : <li>Không có đề xuất cụ thể.</li>}
        </ul>
      </div>
    </div>
  );
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
        // fetch sent & received accepted connections counts for dashboard total
        GetSentConnections(1, 1, "Accepted"),
        GetReceivedConnections(1, 1, "Accepted"),
      ]);

      const [
        profileResult,
        kycResult,
        watchlistResult,
        docsResult,
        sentConnectionsResult,
        receivedConnectionsResult,
      ] = results;

      if (
        isUnauthorized(profileResult) ||
        isUnauthorized(kycResult) ||
        isUnauthorized(watchlistResult) ||
        isUnauthorized(docsResult) ||
        isUnauthorized(sentConnectionsResult) ||
        isUnauthorized(receivedConnectionsResult)
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

      // Sum accepted connections initiated by me (sent) + accepted connections received
      let sentTotal = 0;
      let receivedTotal = 0;
      if (sentConnectionsResult?.status === "fulfilled") {
        const sentRes = sentConnectionsResult.value;
        if (sentRes?.isSuccess) sentTotal = sentRes.data?.paging?.totalItems ?? sentRes.data?.items?.length ?? 0;
      }
      if (receivedConnectionsResult?.status === "fulfilled") {
        const recvRes = receivedConnectionsResult.value;
        if (recvRes?.isSuccess) receivedTotal = recvRes.data?.paging?.totalItems ?? recvRes.data?.items?.length ?? 0;
      }

      // Fallback: if paging wasn't provided (or returned 0), try fetching a larger page to count items
      try {
        if ((sentTotal ?? 0) === 0) {
          const fullSent = (await GetSentConnections(1, 200, "Accepted") as any) ?? null;
          if (fullSent?.isSuccess) sentTotal = fullSent.data?.paging?.totalItems ?? fullSent.data?.items?.length ?? fullSent.data?.data?.length ?? sentTotal;
        }
      } catch (e) {
        // ignore
      }
      try {
        if ((receivedTotal ?? 0) === 0) {
          const fullRecv = (await GetReceivedConnections(1, 200, "Accepted") as any) ?? null;
          if (fullRecv?.isSuccess) receivedTotal = fullRecv.data?.paging?.totalItems ?? fullRecv.data?.items?.length ?? fullRecv.data?.data?.length ?? receivedTotal;
        }
      } catch (e) {
        // ignore
      }

      setConnectionTotal((sentTotal ?? 0) + (receivedTotal ?? 0));
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
  const kycUi = getInvestorKycUiState(profile, kycStatus);

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

  const isVerified = kycUi.isVerified;
  const isPending = kycUi.isPendingReview;
  const isFailed = kycUi.isFailed;
  const needsResubmission = kycUi.needsResubmission;

  return (
    <div className="animate-in space-y-6 fade-in duration-500">
      {kycUi.shouldShowVerificationPrompt && (
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

      {needsResubmission && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 md:flex-row">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-[13px] font-medium text-amber-700">
              Hệ thống cần bạn bổ sung thêm thông tin KYC. Vui lòng mở lại hồ sơ và cập nhật theo yêu cầu mới nhất.
            </p>
          </div>
          <Link
            href="/investor/kyc"
            className="rounded-xl bg-amber-500 px-5 py-2 text-[12px] font-bold text-white transition-all hover:bg-amber-600"
          >
            Bổ sung hồ sơ
          </Link>
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
              { icon: Compass, label: "Khám phá Startup", href: "/investor/startups", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Bot, label: "Trợ lý đầu tư AI", href: "/investor/ai-chatbot", color: "text-purple-500", bg: "bg-purple-50" },
              { icon: Bookmark, label: "Danh sách theo dõi", href: "/investor/watchlist", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Handshake, label: "Kết nối đầu tư", href: "/investor/connections", color: "text-emerald-500", bg: "bg-emerald-50" },
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

        <div className="col-span-12 flex items-center justify-between rounded-2xl border-2 border-[#e6cc4c]/30 bg-white p-6 shadow-sm transition-all hover:bg-[#f8f8f6] md:col-span-4 lg:col-span-4">
          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-widest text-neutral-muted">
              Danh sách theo dõi
            </p>

            {/* Investor status */}
            <div className="mb-3">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  profile?.acceptingConnections ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200",
                )}
              >
                {profile?.acceptingConnections ? "Đang nhận kết nối" : "Tạm dừng nhận kết nối"}
              </span>
            </div>

            {docTotal > 0 ? (
              <div className="flex items-baseline gap-3">
                <span ref={docCount.ref} className="text-4xl font-bold text-[#171611]">
                  {docCount.count}
                </span>
                <span className="text-sm font-bold lowercase text-neutral-muted">Files</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {watchlist && watchlist.length > 0 ? (
                  <>
                    <div className="flex items-center gap-3">
                      {watchlist.slice(0, 3).map((item) => (
                        <Link
                          key={`${item.watchlistId}-${item.startupID}`}
                          href={`/investor/startups/${item.startupID}`}
                          className="flex items-center gap-3 rounded-lg p-1 hover:bg-[#f8f8f6]"
                        >
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-black text-slate-700">
                            {(item.startupName ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{item.startupName}</span>
                        </Link>
                      ))}
                    </div>
                    {/* removed "Xem tất cả" per UX request */}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-600">Chưa có startup trong danh sách theo dõi.</p>
                    <div className="flex items-center gap-2">
                      <Link href="/investor/startups" className="inline-flex items-center gap-2 rounded-xl bg-[#e6cc4c] px-4 py-2 text-sm font-bold text-white">Khám phá Startup</Link>
                      <Link href="/investor/connections" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#171611]">Yêu cầu tài liệu</Link>
                    </div>
                  </>
                )}
              </div>
            )}
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

          <AIMarketAnalysis profile={profile} watchlist={watchlist} />
        </div>

        <div className="col-span-12 overflow-hidden rounded-2xl border border-neutral-surface bg-white shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-neutral-surface p-6">
            <h3 className="text-lg font-bold text-[#171611]">Hoạt động gần đây trên Danh sách theo dõi</h3>
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
