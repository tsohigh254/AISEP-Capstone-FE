"use client";

import { cn } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  AlertCircle,
  Activity,
  MessageSquareWarning,
  RefreshCw,
  Lock,
  AlertTriangle,
  Loader2,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  GetDashboardStats,
  GetKycTrend,
  GetActivityFeed,
  IStaffDashboardStats,
  IKycTrendPoint,
  IActivityFeedItem,
} from "@/services/staff/dashboard.api";

const ACTION_TYPE_LABELS: Record<string, string> = {
  KYC_REVIEW: "xét duyệt hồ sơ KYC",
  KYC_APPROVED: "đã duyệt hồ sơ KYC",
  KYC_REJECTED: "đã từ chối hồ sơ KYC",
  USER_LOCKED: "khoá tài khoản",
  USER_UNLOCKED: "mở khoá tài khoản",
  COMPLAINT_ESCALATED: "khiếu nại leo thang",
  PROFILE_CHANGE: "thay đổi hồ sơ",
  PAYMENT_ACTION: "xử lý thanh toán",
};

const ACTION_DOT_COLOR: Record<string, string> = {
  KYC_REVIEW: "bg-amber-400",
  KYC_APPROVED: "bg-emerald-500",
  KYC_REJECTED: "bg-rose-500",
  USER_LOCKED: "bg-rose-500",
  USER_UNLOCKED: "bg-emerald-500",
  COMPLAINT_ESCALATED: "bg-rose-500",
  PROFILE_CHANGE: "bg-sky-500",
  PAYMENT_ACTION: "bg-indigo-500",
};

function formatRelativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PlatformActivityPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"7D" | "30D">("7D");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [stats, setStats] = useState<IStaffDashboardStats | null>(null);
  const [trendPoints, setTrendPoints] = useState<IKycTrendPoint[]>([]);
  const [feed, setFeed] = useState<IActivityFeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);

  useEffect(() => {
    setLoadingStats(true);
    (GetDashboardStats() as any)
      .then((res: any) => {
        const d = res?.data ?? res;
        if (d) setStats(d);
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingTrend(true);
    (GetKycTrend(selectedPeriod) as any)
      .then((res: any) => {
        const d = res?.data ?? res;
        if (d?.points) setTrendPoints(d.points);
      })
      .catch(() => {})
      .finally(() => setLoadingTrend(false));
  }, [selectedPeriod]);

  const fetchFeed = useCallback(() => {
    setLoadingFeed(true);
    (GetActivityFeed(10) as any)
      .then((res: any) => {
        const d = res?.data ?? res;
        if (Array.isArray(d)) setFeed(d);
      })
      .catch(() => {})
      .finally(() => setLoadingFeed(false));
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const maxSubmitted = Math.max(...trendPoints.map((p) => p.submitted), 1);
  const chartData = trendPoints.map((p) => Math.round((p.submitted / maxSubmitted) * 100));

  const statCards = [
    {
      label: "Tổng người dùng",
      value: loadingStats ? "—" : (stats?.totalUsers?.toLocaleString() ?? "—"),
      sub: "tài khoản đăng ký",
      icon: Users,
      warn: false,
      href: "/staff/activity",
    },
    {
      label: "Tài khoản bị khoá",
      value: loadingStats ? "—" : (stats?.lockedAccounts?.toString() ?? "—"),
      sub: "cần xem xét",
      icon: Lock,
      warn: !loadingStats && (stats?.lockedAccounts ?? 0) > 0,
      href: "/staff/kyc",
    },
    {
      label: "Chờ duyệt KYC",
      value: loadingStats ? "—" : (stats?.pendingKycCount?.toString() ?? "—"),
      sub: "hồ sơ",
      icon: ShieldCheck,
      warn: !loadingStats && (stats?.pendingKycCount ?? 0) > 0,
      href: "/staff/kyc",
    },
  ];

  const governanceItems = [
    { label: "Chờ duyệt KYC Startup", value: loadingStats ? "—" : String(stats?.pendingKycCount ?? "—"), icon: ShieldCheck, href: "/staff/kyc" },
    { label: "Tài khoản bị khoá (24h)", value: loadingStats ? "—" : String(stats?.lockedAccounts ?? "—"), icon: Lock, href: "/staff/kyc" },
    { label: "Khiếu nại leo thang", value: "—", icon: MessageSquareWarning, href: "/staff/complaints" },
  ];

  return (
    <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">

      {/* Maintenance Alert Banner */}
      {!bannerDismissed && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-5 py-4 flex items-start gap-4">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wide">Hệ thống</span>
              <p className="text-[13px] font-semibold text-slate-800">Bảo trì hệ thống định kỳ</p>
            </div>
            <p className="text-[12px] text-amber-700 leading-relaxed">
              Hệ thống sẽ tiến hành bảo trì cơ sở dữ liệu vào Chủ nhật từ{" "}
              <span className="font-semibold">02:00 đến 04:00</span>. Một số dịch vụ AI có thể chậm hơn bình thường.
            </p>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="w-7 h-7 flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* -- Overview Stats -- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            System Health
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  {card.warn && (
                    <span className="w-2 h-2 rounded-full mt-1 shrink-0 bg-amber-400 animate-pulse" />
                  )}
                </div>
                <p className="text-[20px] font-bold text-slate-900 leading-none mb-1">{card.value}</p>
                <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* -- Main Content: Chart + Governance -- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* KYC Trend Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              Xu hướng hồ sơ KYC
            </h2>
            <select
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-600 bg-white focus:outline-none focus:border-[#eec54e] transition-colors cursor-pointer"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as "7D" | "30D")}
            >
              <option value="7D">7 ngày gần nhất</option>
              <option value="30D">30 ngày gần nhất</option>
            </select>
          </div>

          <div className="px-6 py-5">
            <div className={cn("h-[200px] flex items-end", selectedPeriod === "7D" ? "gap-3" : "gap-1")}>
              {loadingTrend ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[12px] text-slate-400">Không có dữ liệu</p>
                </div>
              ) : chartData.map((h, i) => (
                <div key={i} className="flex-1 h-full relative group/bar cursor-pointer">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-[#eec54e] rounded-t-sm transition-all duration-300 hover:bg-[#d4a800]"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  />
                  <div
                    className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none"
                    style={{ bottom: `calc(${h}% + 8px)` }}
                  >
                    <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">
                      {trendPoints[i]?.submitted ?? h}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              {selectedPeriod === "7D" ? (
                <><span>Thứ Hai</span><span>Chủ Nhật</span></>
              ) : (
                <><span>30 ngày trước</span><span>Hôm nay</span></>
              )}
            </div>
          </div>
        </div>

        {/* Governance Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Governance
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {governanceItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-[#fdf8e6] transition-colors">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#b8902e] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-700">{item.label}</p>
                  </div>
                  <span className="text-[15px] font-bold text-slate-800 shrink-0">{item.value}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* -- Live Activity Feed -- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            Live Feed
          </h2>
          <button
            onClick={fetchFeed}
            disabled={loadingFeed}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loadingFeed && "animate-spin")} />
            Làm mới
          </button>
        </div>

        {loadingFeed ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-[13px] font-medium text-slate-400">Không có hoạt động nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {feed.map((act, i) => (
              <div key={act.logId ?? i} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
                <span className="text-[11px] text-slate-400 font-mono w-14 shrink-0">
                  {formatRelativeTime(act.createdAt)}
                </span>
                <div className={cn("w-2 h-2 rounded-full shrink-0", ACTION_DOT_COLOR[act.actionType] ?? "bg-slate-400")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700 truncate">
                    {act.userEmail ?? "Hệ thống"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {act.actionDetails ?? ACTION_TYPE_LABELS[act.actionType] ?? act.actionType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
