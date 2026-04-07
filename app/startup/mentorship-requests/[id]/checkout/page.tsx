"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  CreditCard, Lock, ShieldCheck, BadgeCheck, Star,
  ChevronRight, Info, CheckCircle2, AlertCircle,
  Calendar, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetMentorshipById, GetAdvisorById, CreatePaymentLink } from "@/services/startup/startup-mentorship.api";
import type { IMentorshipRequest, IAdvisorDetail } from "@/types/startup-mentorship";

const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CHECKOUT = {
  requestNo: "REQ-0003",
  sessionPrice: 3000000,
  advisor: {
    name: "Phạm Thành Long",
    title: "CTO & Co-founder · AI-Soft",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd7t5ciDWV2eTaJsfniBll5lOH1FpM75D-rNgvvVbqucB9qLvuvCqdD2n7NevngnBF0iNuRrvyppt6TSVePvhTgOoUFPXs3COh1SFpjFFfpRM7AvqpVQYWIKMeh8ZaAHBQXX7A9LfSgc9hJLF86zECFTAuBW7cVPKthlob2LHXSFNJoAt5LewaefZBVBDzh253xnffFoI4o3adtsf5g77DpJi4MsoGYiv14LMA-ivJZaM5n2tz_QhJaAEUCzsxPuiFm3f6b9lC-GA",
    rating: 4.8,
    isVerified: true,
  },
  topic: "Xây dựng đội kỹ thuật cho giai đoạn scale",
  agreedTime: {
    date: "Thứ Ba, 26 Tháng 3, 2024",
    time: "14:00 – 15:00 CH (GMT+7)",
  },
  duration: "60 phút",
  hourlyRate: 3000000,
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);

  const [requestData, setRequestData] = useState<IMentorshipRequest | null>(null);
  const [advisorData, setAdvisorData] = useState<IAdvisorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const res = await GetMentorshipById(Number(id));
        if (res.isSuccess && res.data) {
          setRequestData(res.data);
          try {
            // Also fetch the advisor full profile to get the hourlyRate
            const advRes = await GetAdvisorById(res.data.advisorID || (res.data.advisor as any)?.advisorID || (res.data as any).advisorId);
            // The interceptor might unwrap axios response
            setAdvisorData((advRes as any).data || (advRes as any));
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

  const data = MOCK_CHECKOUT;
  const sessions = (requestData as any)?.sessions || [];
  const firstSession = sessions.slice().reverse().find((s: any) => s.meetingUrl || s.meetingURL || s.meetingLink) || sessions[sessions.length - 1] || null;

  const actualPrice = advisorData?.hourlyRate || (requestData as any)?.advisor?.hourlyRate || 0; // The price strictly depends on the advisor's hourly rate setting
  const actualDuration = requestData?.durationMinutes || firstSession?.durationMinutes || 60;
  const actualTopic = requestData?.objective || (requestData as any)?.challengeDescription || data.topic;
  const actualTotal = Math.round((actualPrice / 60) * actualDuration) || 0; // Time proportion

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await CreatePaymentLink({
        amount: actualTotal,
        mentorshipId: Number(id),
      });
      const paymentData = (res as any)?.data?.data || (res as any)?.data;
      const checkoutUrl = paymentData?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        alert("Không thể tạo link thanh toán. Vui lòng thử lại.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      alert(err?.response?.data?.message || "Có lỗi xảy ra khi tạo thanh toán.");
      setIsProcessing(false);
    }
  };
  const scheduledAt = requestData?.scheduledAt || firstSession?.scheduledStartAt || null;
  const scheduledDateLabel = scheduledAt ? new Date(scheduledAt).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : data.agreedTime.date;
  const scheduledTimeLabel = scheduledAt ? `${new Date(scheduledAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} (GMT+7)` : data.agreedTime.time;

  const actualAdvisorName = advisorData?.fullName || requestData?.advisor?.fullName || (requestData as any)?.advisorName || "Đang cập nhật...";
  const actualAdvisorTitle = advisorData?.title || requestData?.advisor?.title || "Cố vấn chuyên môn";
  const actualAdvisorPhoto = advisorData?.profilePhotoURL || requestData?.advisor?.profilePhotoURL || data.advisor.avatar;
  const actualAdvisorRating = advisorData?.averageRating || requestData?.advisor?.averageRating || 5.0;
  const actualIsVerified = advisorData?.isVerified ?? true;

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[960px] mx-auto pt-20 text-center text-slate-400 text-[13px]">Đang tải...</div>
      </StartupShell>
    );
  }

  return (
    <StartupShell>
      <div className="max-w-[960px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-center gap-2 text-[13px] text-slate-400">
          <button onClick={() => router.push(`/startup/mentorship-requests/${id}`)} className="hover:text-slate-700 transition-colors">
            {data.requestNo}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-semibold">Thanh toán</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Payment Form */}
          <div className="lg:col-span-7 space-y-5">

            {/* Secure badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[12px] font-semibold text-emerald-700">Thanh toán bảo mật & tiện lợi qua PayOS (VietQR)</span>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
              <h2 className="text-[16px] font-bold text-slate-900 mb-5">Phương thức thanh toán</h2>
              
              <div className="border-2 border-blue-500 bg-blue-50/30 rounded-xl p-4 relative cursor-pointer transition-all">
                <div className="absolute top-4 right-4 text-blue-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                    <img src="https://payos.vn/wp-content/uploads/sites/13/2023/07/payos-logo.svg" alt="PayOS" className="w-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900">Mã QR Ngân hàng (VietQR / PayOS)</h3>
                    <p className="text-[12px] text-slate-500 mt-0.5">Dùng ứng dụng ngân hàng quét mã QR để thanh toán liền mạch</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Note */}
            <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-100 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-700 leading-relaxed">
                Khoản thanh toán sẽ được <span className="font-semibold">giữ an toàn bởi AISEP (escrow)</span> và chỉ giải phóng cho cố vấn sau khi phiên tư vấn hoàn tất và bạn xác nhận.
              </p>
            </div>

            {/* Pay CTA */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[15px] font-bold transition-all shadow-md",
                isProcessing
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-[#0f172a] text-white hover:bg-slate-700 active:scale-[0.99]"
              )}
            >
              {isProcessing ? (
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
              Bằng cách thanh toán, bạn đồng ý với <span className="underline cursor-pointer">Điều khoản dịch vụ</span> và <span className="underline cursor-pointer">Chính sách hoàn tiền</span> của AISEP.
            </p>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            {/* Advisor */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Cố vấn</p>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={actualAdvisorPhoto} alt={actualAdvisorName} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                  {actualIsVerified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-amber-500 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 leading-none">{actualAdvisorName}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{actualAdvisorTitle}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[12px] font-bold text-slate-600">{actualAdvisorRating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Chi tiết phiên</p>
              <div className="space-y-2.5 text-[12px]">
                <p className="text-slate-700 font-semibold leading-snug">{actualTopic}</p>
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
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Chi phí</p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí tư vấn ({actualDuration}m)</span>
                  <span className="font-semibold text-slate-700">{formatVND(actualTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí nền tảng</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="pt-2 mt-1 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[14px] font-bold text-slate-800">Tổng cộng</span>
                  <span className="text-[20px] font-black text-slate-900">{formatVND(actualTotal)}</span>
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
                Nếu cố vấn không thực hiện phiên, bạn sẽ được hoàn tiền <span className="text-white/90 font-semibold">100%</span> trong vòng 3–5 ngày làm việc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StartupShell>
  );
}
