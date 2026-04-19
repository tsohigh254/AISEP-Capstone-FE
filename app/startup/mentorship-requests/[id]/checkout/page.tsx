"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Lock,
  ShieldCheck,
  BadgeCheck,
  Star,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GetMentorshipById,
  GetAdvisorById,
} from "@/services/startup/startup-mentorship.api";
import { isMentorshipPaymentCompleted, parsePositiveAmount, parseDurationMinutes, calculateMentorshipTotal } from "@/lib/mentorship-payment";
import { CreatePaymentLink } from "@/services/payment/payment.api";
import type {
  IMentorshipRequest,
  IAdvisorDetail,
} from "@/types/startup-mentorship";

const formatVND = (n: number) => n.toLocaleString("vi-VN") + "₫";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);

  const [requestData, setRequestData] = useState<IMentorshipRequest | null>(
    null,
  );
  const [advisorData, setAdvisorData] = useState<IAdvisorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const unwrapApiData = <T,>(value: unknown): T | null => {
    if (!value || typeof value !== "object") {
      return (value as T) ?? null;
    }

    const candidate = value as Record<string, unknown>;
    if (candidate.data && typeof candidate.data === "object") {
      return candidate.data as T;
    }

    return candidate as T;
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        const res = (await GetMentorshipById(Number(id))) as any;
        const mentorship = unwrapApiData<IMentorshipRequest>(res?.data ?? res);
        const isSuccess =
          typeof res?.success === "boolean" || typeof res?.isSuccess === "boolean"
            ? Boolean(res?.success || res?.isSuccess)
            : Boolean(mentorship);

        if (isSuccess && mentorship) {
          setRequestData(mentorship);
          try {
            // Also fetch the advisor full profile to get the hourlyRate
            const advRes = await GetAdvisorById(
              mentorship.advisorID ||
                (mentorship as any).advisorId ||
                (mentorship as any).advisor?.advisorID,
            );
            setAdvisorData(
              unwrapApiData<IAdvisorDetail>((advRes as any)?.data ?? advRes),
            );
          } catch (advErr) {
            console.error("Failed to load advisor details", advErr);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const sessions = (requestData as any)?.sessions || [];
  const firstSession =
    sessions
      .slice()
      .reverse()
      .find((s: any) => s.meetingUrl || s.meetingURL || s.meetingLink) ||
    sessions[sessions.length - 1] ||
    null;

  const actualPrice =
    parsePositiveAmount(advisorData?.hourlyRate) ||
    parsePositiveAmount((requestData as any)?.advisor?.hourlyRate) ||
    parsePositiveAmount((requestData as any)?.hourlyRate) ||
    0; // The price strictly depends on the advisor's hourly rate setting
  const actualDuration = parseDurationMinutes(
    (requestData as any)?.durationMinutes ??
      requestData?.expectedDuration ??
      firstSession?.durationMinutes ??
      null,
  );
  const actualTopic =
    requestData?.challengeDescription ||
    requestData?.specificQuestions ||
    requestData?.obligationSummary ||
    (requestData as any)?.objective ||
    (requestData as any)?.challengeDescription ||
    "Tư vấn chuyên môn";
  const computedTotal =
    actualPrice > 0 ? Math.round((actualPrice / 60) * actualDuration) : 0;
  const actualTotal =
    parsePositiveAmount(requestData?.sessionAmount) ?? computedTotal; // Fallback when backend still returns sessionAmount = 0
  const isPaid = isMentorshipPaymentCompleted(requestData?.paymentStatus, requestData?.paidAt);

  const handlePay = async () => {
    if (isPaid) {
      router.push(`/startup/mentorship-requests/${id}`);
      return;
    }
    setIsProcessing(true);
    try {
      const res = await CreatePaymentLink(actualTotal, Number(id));

      const checkoutUrl = res?.data?.checkoutUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl; // 🔥 redirect
      } else {
        console.error("Không có checkoutUrl", res);
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const scheduledAt =
    (requestData as any)?.scheduledAt || firstSession?.scheduledStartAt || null;
  const scheduledDateLabel = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Chưa xác định";
  const scheduledTimeLabel = scheduledAt
    ? `${new Date(scheduledAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} (GMT+7)`
    : "Chưa xác định";

  const actualAdvisorName =
    advisorData?.fullName ||
    requestData?.advisorName ||
    (requestData as any)?.advisor?.fullName ||
    (requestData as any)?.advisorName ||
    "Dang cap nhat...";
  const actualAdvisorTitle =
    advisorData?.title || (requestData as any)?.advisor?.title || "Cố vấn chuyên môn";
  const actualAdvisorPhoto =
    advisorData?.profilePhotoURL || (requestData as any)?.advisor?.profilePhotoURL || "";
  const actualAdvisorRating =
    advisorData?.averageRating || (requestData as any)?.advisor?.averageRating || 5.0;
  const actualIsVerified = advisorData?.isVerified ?? true;

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[960px] mx-auto pt-20 text-center text-slate-400 text-[13px]">
          Đang tải...
        </div>
      </StartupShell>
    );
  }

  return (
    <StartupShell>
      <div className="max-w-[960px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Payment Form */}
          <div className="lg:col-span-7 space-y-5">
            {/* Secure badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[12px] font-semibold text-emerald-700">
                Thanh toán bảo mật & tiện lợi qua PayOS (VietQR)
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
              <h2 className="text-[16px] font-bold text-slate-900 mb-5">
                Phương thức thanh toán
              </h2>

              <div className="border-2 border-blue-500 bg-blue-50/30 rounded-xl p-4 relative cursor-pointer transition-all">
                <div className="absolute top-4 right-4 text-blue-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900">
                      Mã QR Ngân hàng{" "}
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      Dùng ứng dụng ngân hàng quét mã QR để thanh toán liền mạch
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Note */}
            <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-100 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-700 leading-relaxed">
                Khoản thanh toán sẽ được{" "}
                <span className="font-semibold">
                  giữ an toàn bởi AISEP (escrow)
                </span>{" "}
                và chỉ giải phóng cho cố vấn sau khi phiên tư vấn hoàn tất và
                bạn xác nhận.
              </p>
            </div>

            {/* Pay CTA */}
            <button
              onClick={handlePay}
              disabled={isProcessing || isPaid}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[15px] font-bold transition-all shadow-md",
                isProcessing || isPaid
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-[#0f172a] text-white hover:bg-slate-700 active:scale-[0.99]",
              )}
            >
              {isPaid ? (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Đã thanh toán
                </>
              ) : isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-300/40 border-t-slate-400 rounded-full animate-spin" />
                  Đang xử lý giao dịch...
                </>
              ) : (
                <>
                  <Lock className="w-4.5 h-4.5" />
                  Thanh toán {formatVND(actualTotal)}
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Bằng cách thanh toán, bạn đồng ý với{" "}
              <span className="underline cursor-pointer">
                Điều khoản dịch vụ
              </span>{" "}
              và{" "}
              <span className="underline cursor-pointer">
                Chính sách hoàn tiền
              </span>{" "}
              của AISEP.
            </p>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            {/* Advisor */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Cố vấn
              </p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={actualAdvisorPhoto}
                    alt={actualAdvisorName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                  {actualIsVerified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-amber-500 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 leading-none">
                    {actualAdvisorName}
                  </p>
                  <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                    {actualAdvisorTitle}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[12px] font-bold text-slate-600">
                      {actualAdvisorRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Chi tiết phiên
              </p>
              <div className="space-y-2.5 text-[12px]">
                <p className="text-slate-700 font-semibold leading-snug">
                  {actualTopic}
                </p>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{scheduledDateLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{scheduledTimeLabel}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Chi phí
              </p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Phí tư vấn ({actualDuration}m)
                  </span>
                  <span className="font-semibold text-slate-700">
                    {formatVND(actualTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí nền tảng</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="pt-2 mt-1 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[14px] font-bold text-slate-800">
                    Tổng cộng
                  </span>
                  <span className="text-[20px] font-black text-slate-900">
                    {formatVND(actualTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Guarantee */}
            <div className="bg-[#0f172a] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-[12px] font-bold">Đảm bảo hoàn tiền</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Nếu cố vấn không thực hiện phiên, bạn sẽ được hoàn tiền{" "}
                <span className="text-white/90 font-semibold">100%</span> trong
                vòng 3–5 ngày làm việc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StartupShell>
  );
}
