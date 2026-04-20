"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  Loader2,
  ShieldAlert,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { GetAdvisorMentorshipById } from "@/services/advisor/advisor.api";
import { ReleasePayout } from "@/services/staff/consulting-oversight.api";
import type { IMentorshipRequest, IMentorshipSession } from "@/types/startup-mentorship";

const PAYMENT_OPS_REFRESH_KEY = "staff-payment-ops:refresh";

const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value.toLocaleString("vi-VN")}đ`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN");
};

const getPrimarySession = (sessions?: IMentorshipSession[]) => {
  if (!sessions?.length) return null;

  return [...sessions].sort((a, b) => {
    const first = new Date(a.scheduledStartAt ?? a.createdAt ?? 0).getTime();
    const second = new Date(b.scheduledStartAt ?? b.createdAt ?? 0).getTime();
    return second - first;
  })[0];
};

export default function PaymentOpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [mentorship, setMentorship] = useState<IMentorshipRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primarySession = useMemo(
    () => getPrimarySession(mentorship?.sessions),
    [mentorship?.sessions]
  );

  const normalizedMentorshipStatus = String(
    mentorship?.status || mentorship?.mentorshipStatus || ""
  ).toUpperCase();

  const conditions = useMemo(
    () =>
      mentorship
        ? [
            {
              label: "Buổi tư vấn đã hoàn thành",
              ok: normalizedMentorshipStatus === "COMPLETED",
            },
            {
              label: "Đủ điều kiện giải ngân",
              ok: mentorship.isPayoutEligible === true,
            },
          ]
        : [],
    [mentorship, normalizedMentorshipStatus]
  );

  const conditionIcons = [CheckCircle2, Banknote] as const;

  useEffect(() => {
    const fetchMentorship = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await GetAdvisorMentorshipById(id);
        if (res.isSuccess && res.data) {
          setMentorship(res.data);
        } else {
          setError("Không tìm thấy mentorship.");
        }
      } catch (fetchError: any) {
        setError(fetchError?.response?.data?.message ?? "Không thể tải dữ liệu payout.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentorship();
  }, [id]);

  const markListDirty = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(PAYMENT_OPS_REFRESH_KEY, "1");
    }
  };

  const refetchMentorship = async () => {
    const res = await GetAdvisorMentorshipById(id);
    if (res.isSuccess && res.data) {
      setMentorship(res.data);
      markListDirty();
    }
  };

  const handleReleasePayout = async () => {
    if (!mentorship) return;

    setReleasing(true);
    try {
      const res = await ReleasePayout(mentorship.mentorshipID);

      if (res.isSuccess && res.data) {
        setMentorship((prev) =>
          prev
            ? {
                ...prev,
                payoutReleasedAt: res.data?.payoutReleasedAt ?? prev.payoutReleasedAt,
              }
            : prev
        );
      }

      markListDirty();
      toast.success("Đã giải ngân payout thành công.");
    } catch (releaseError: any) {
      const errorCode = releaseError?.response?.data?.message ?? "";

      if (
        errorCode === "PAYOUT_ALREADY_RELEASED" ||
        String(errorCode).includes("ALREADY_RELEASED")
      ) {
        await refetchMentorship();
      } else {
        toast.error(errorCode || "Không thể giải ngân payout.");
      }
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-3 text-[13px] text-slate-500">Đang tải chi tiết payout...</span>
      </div>
    );
  }

  if (error || !mentorship) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <ShieldAlert className="h-10 w-10 text-red-400" />
        <p className="text-[14px] text-red-500">{error ?? "Không tìm thấy mentorship."}</p>
        <Link href="/staff/payment-ops" className="text-[13px] font-bold text-[#eec54e] hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-plus-jakarta-sans animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link
          href="/staff/payment-ops"
          className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Quay lại danh sách thanh toán
        </Link>

        <button
          onClick={() => router.push("/staff/payment-ops")}
          className="rounded-xl border border-slate-200 px-4 py-2 text-[13px] font-bold text-slate-600 transition-all hover:bg-slate-50"
        >
          Về danh sách
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0f172a] text-white shadow-lg">
                <Banknote className="h-7 w-7 text-[#eec54e]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
                    Chi trả cho {mentorship.advisorName || "Advisor"}
                  </h1>

                  {mentorship.payoutReleasedAt ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Đã giải ngân
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                      <Clock className="h-3 w-3" />
                      Chờ giải ngân
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-400">
                  <span>Mentorship #{mentorship.mentorshipID}</span>
                  <span>•</span>
                  <span>Khởi tạo: {formatDate(mentorship.createdAt || mentorship.requestedAt)}</span>
                  <span>•</span>
                  <span className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                    mentorship.isPayoutEligible
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  )}>
                    {mentorship.isPayoutEligible ? "Eligible" : "Not Eligible"}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Số tiền thanh toán
                </p>
                <p className="text-[24px] font-black tracking-tight text-[#eec54e]">
                  {formatCurrency(mentorship.actualAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="border-b border-slate-50 px-6 py-5">
              <h3 className="text-[13px] font-bold uppercase tracking-tight text-slate-900">
                Chi tiết payout
              </h3>
            </div>

            <div className="space-y-8 p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Kiểm tra vận hành
                  </h4>

                  <div className="space-y-3">
                    {conditions.map((condition) => (
                      (() => {
                        const Icon = conditionIcons[conditions.indexOf(condition)] ?? CheckCircle2;
                        return (
                          <div
                            key={condition.label}
                            className="flex items-center gap-3 rounded-xl border border-slate-50 bg-slate-50/50 p-3"
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5 shrink-0",
                                condition.ok ? "text-emerald-500" : "text-red-500"
                              )}
                            />
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                condition.ok ? "bg-emerald-500" : "bg-red-500"
                              )}
                            />
                            <span className="text-[12px] font-bold text-slate-700">{condition.label}</span>
                          </div>
                        );
                      })()
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Đối tượng liên quan
                  </h4>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2 text-slate-400 shadow-sm">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Advisor
                          </p>
                          <p className="mt-1 text-[14px] font-bold text-slate-900">
                            {mentorship.advisorName || "--"}
                          </p>
                          <p className="mt-1 text-[12px] text-slate-500">
                            Advisor ID: {mentorship.advisorID ?? "--"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2 text-slate-400 shadow-sm">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Startup
                          </p>
                          <p className="mt-1 text-[14px] font-bold text-slate-900">
                            {mentorship.startupName || "--"}
                          </p>
                          <p className="mt-1 text-[12px] text-slate-500">
                            Startup ID: {mentorship.startupID ?? "--"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Session gần nhất
                      </p>
                      <p className="mt-0.5 text-[15px] font-bold text-slate-900">
                        {primarySession?.objective || mentorship.objective || mentorship.challengeDescription || "Mentorship session"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-slate-500">
                        <span>Session ID: #{primarySession?.sessionID ?? "--"}</span>
                        <span>•</span>
                        <span>Ngày tư vấn: {formatDate(primarySession?.scheduledStartAt)}</span>
                        <span>•</span>
                        <span>Trạng thái: {primarySession?.status || "--"}</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 shrink-0 text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 shadow-sm",
              mentorship.isPayoutEligible
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            )}
          >
            {mentorship.isPayoutEligible ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            ) : (
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
            )}

            <div>
              <p
                className={cn(
                  "text-[13px] font-bold leading-tight",
                  mentorship.isPayoutEligible ? "text-emerald-900" : "text-amber-900"
                )}
              >
                {mentorship.isPayoutEligible ? "Đủ điều kiện giải ngân" : "Chưa đủ điều kiện giải ngân"}
              </p>
              <p
                className={cn(
                  "mt-1 text-[12px] leading-relaxed",
                  mentorship.isPayoutEligible ? "text-emerald-800/80" : "text-amber-800/80"
                )}
              >
                {mentorship.isPayoutEligible
                  ? "Mentorship này đã đáp ứng điều kiện payout. Staff có thể thực hiện giải ngân cho advisor."
                  : "Mentorship này hiện chưa đáp ứng đủ điều kiện payout, nên nút giải ngân sẽ bị khóa."}
              </p>
            </div>
          </div>

          <div className="sticky top-24 rounded-2xl bg-[#0f172a] p-6 text-white shadow-xl shadow-slate-200">
            <h3 className="mb-6 font-plus-jakarta-sans text-[13px] font-bold uppercase tracking-widest text-slate-400">
              Phê duyệt thanh toán
            </h3>

            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Trạng thái payout
                </p>
                <p className="mt-2 text-[14px] font-bold text-white">
                  {mentorship.payoutReleasedAt ? "Đã giải ngân" : "Chờ giải ngân"}
                </p>
                <p className="mt-1 text-[12px] text-slate-400">
                  {mentorship.payoutReleasedAt
                    ? `Thời gian release: ${formatDateTime(mentorship.payoutReleasedAt)}`
                    : "Chưa có timestamp giải ngân."}
                </p>
              </div>

              {mentorship.payoutReleasedAt ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-[13px] font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Đã giải ngân
                </div>
              ) : (
                <button
                  onClick={handleReleasePayout}
                  disabled={releasing || mentorship.isPayoutEligible !== true}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/10 transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {releasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Xác nhận & Giải ngân
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
