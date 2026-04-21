"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, CreditCard, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { GetPayoutEligibleMentorships } from "@/services/staff/consulting-oversight.api";
import type { IMentorshipRequest } from "@/types/startup-mentorship";

type PaymentOpsTab = "PENDING" | "RELEASED";
const PAYMENT_OPS_REFRESH_KEY = "staff-payment-ops:refresh";

const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value.toLocaleString("vi-VN")}đ`;
};

export default function PaymentOpsPage() {
  const [data, setData] = useState<IMentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PaymentOpsTab>("PENDING");
  const [search, setSearch] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [totalEligibleCount, setTotalEligibleCount] = useState(0);

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await GetPayoutEligibleMentorships({ page: 1, pageSize: 100 });
        const payload = res.data;
        const items = payload?.items ?? payload?.data ?? [];
        setData(items);
        setTotalEligibleCount(payload?.paging?.totalItems ?? items.length);
      } catch (error: any) {
        console.error("Failed to fetch payout eligible mentorships", error);
        setError(error?.response?.data?.message ?? "Không thể tải dữ liệu payout từ môi trường hiện tại.");
        setData([]);
        setTotalEligibleCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [refreshSeed]);

  useEffect(() => {
    const maybeRefresh = () => {
      if (typeof window === "undefined") return;
      if (window.sessionStorage.getItem(PAYMENT_OPS_REFRESH_KEY) !== "1") return;

      window.sessionStorage.removeItem(PAYMENT_OPS_REFRESH_KEY);
      setRefreshSeed((value) => value + 1);
    };

    maybeRefresh();
    window.addEventListener("focus", maybeRefresh);
    window.addEventListener("pageshow", maybeRefresh);

    return () => {
      window.removeEventListener("focus", maybeRefresh);
      window.removeEventListener("pageshow", maybeRefresh);
    };
  }, []);

  const pendingItems = useMemo(
    () => data.filter((item) => !item.payoutReleasedAt),
    [data]
  );

  const releasedItems = useMemo(
    () => data.filter((item) => !!item.payoutReleasedAt),
    [data]
  );

  const displayedItems = useMemo(() => {
    const base = activeTab === "PENDING" ? pendingItems : releasedItems;
    const query = search.trim().toLowerCase();

    if (!query) return base;

    return base.filter((item) =>
      item.advisorName?.toLowerCase().includes(query) ||
      item.startupName?.toLowerCase().includes(query) ||
      String(item.mentorshipID).includes(query)
    );
  }, [activeTab, pendingItems, releasedItems, search]);

  const stats = useMemo(
    () => ({
      pendingCount: pendingItems.length,
      releasedCount: releasedItems.length,
      pendingAmount: pendingItems.reduce((sum, item) => sum + (item.actualAmount ?? 0), 0),
      releasedAmount: releasedItems.reduce((sum, item) => sum + (item.actualAmount ?? 0), 0),
      totalEligibleCount,
    }),
    [pendingItems, releasedItems, totalEligibleCount]
  );

  return (
    <div className="px-8 py-7 pb-16 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 font-plus-jakarta-sans text-[20px] font-bold tracking-tight text-slate-900">
            <CreditCard className="h-5 w-5 text-[#eec54e]" />
            Vận hành thanh toán
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Quản lý danh sách payout đủ điều kiện và theo dõi trạng thái giải ngân cho advisor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Payout chờ giải ngân",
            value: error ? "--" : stats.pendingCount,
            color: "text-blue-600",
          },
          {
            label: "Payout đã giải ngân",
            value: error ? "--" : stats.releasedCount,
            color: "text-emerald-600",
          },
          {
            label: "Giá trị chờ giải ngân",
            value: error ? "--" : formatCurrency(stats.pendingAmount),
            color: "text-amber-600",
          },
          {
            label: "Tổng payout eligible",
            value: error ? "--" : stats.totalEligibleCount,
            color: "text-slate-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex min-h-[100px] flex-col justify-center rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {stat.label}
            </p>
            <p className={cn("mt-1 text-[24px] font-black", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] md:flex-row md:items-center">
        <div className="relative flex-1 font-plus-jakarta-sans">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo Mentorship ID, Advisor hoặc Startup..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/30 py-2.5 pl-10 pr-4 font-plus-jakarta-sans text-[13px] placeholder:text-slate-400 transition-all focus:border-[#eec54e] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 font-plus-jakarta-sans">
          {(["PENDING", "RELEASED"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === "PENDING" ? pendingItems.length : releasedItems.length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-[13px] font-bold transition-colors",
                  isActive
                    ? "border-[#0f172a] bg-[#0f172a] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab === "PENDING" ? "Chờ giải ngân" : "Đã giải ngân"}
                <span
                  className={cn(
                    "ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Không thể tải payout từ local/BE hiện tại. Nếu môi trường payment chỉ có trên production thì đây là expected behavior.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 font-plus-jakarta-sans">
                <th className="w-28 px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Mentorship ID
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Advisor
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Startup
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Số tiền
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`}>
                    {Array.from({ length: 6 }).map((__, columnIndex) => (
                      <td key={`skeleton-${rowIndex}-${columnIndex}`} className="px-6 py-5">
                        <div className="h-4 animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-[13px] text-amber-600">
                      {error}
                    </p>
                  </td>
                </tr>
              ) : displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-[13px] text-slate-400">
                      {activeTab === "PENDING"
                        ? "Không có khoản nào chờ giải ngân."
                        : "Chưa có khoản nào đã giải ngân."}
                    </p>
                  </td>
                </tr>
              ) : (
                displayedItems.map((item) => (
                  <tr key={item.mentorshipID} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-5">
                      <span className="font-mono text-[12px] font-bold tracking-tight text-slate-900">
                        #{item.mentorshipID}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-plus-jakarta-sans text-[13px] font-bold text-slate-900">
                        {item.advisorName || "--"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-plus-jakarta-sans text-[13px] font-medium text-slate-700">
                        {item.startupName || "--"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-plus-jakarta-sans text-[13px] font-black text-slate-900">
                        {formatCurrency(item.actualAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {item.payoutReleasedAt ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Đã giải ngân
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                          <Clock className="h-3 w-3" />
                          Chờ giải ngân
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/staff/payment-ops/${item.mentorshipID}`}
                        className="group/btn inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] transition-colors hover:text-[#e6cc4c]"
                      >
                        Xem chi tiết
                        <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
