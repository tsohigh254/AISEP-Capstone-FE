"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Star, CheckCircle2, BadgeCheck, Send, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetMentorshipById, SubmitMentorshipFeedback } from "@/services/startup/startup-mentorship.api";
import type { IMentorshipRequest } from "@/types/startup-mentorship";
import { toast } from "sonner";

const RATING_LABELS: Record<number, string> = {
  1: "Không hữu ích",
  2: "Dưới kỳ vọng",
  3: "Đáp ứng yêu cầu",
  4: "Vượt kỳ vọng",
  5: "Xuất sắc",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [request, setRequest] = useState<IMentorshipRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating]     = useState(0);
  const [hover, setHover]       = useState(0);
  const [comment, setComment]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [submittedRating, setSubmittedRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await GetMentorshipById(Number(id));
        if (res.isSuccess && res.data) {
          setRequest(res.data);
        }
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const res = await SubmitMentorshipFeedback(Number(id), {
        rating,
        comment: comment.trim() || undefined,
      });
      if (res.isSuccess) {
        setSubmittedRating(rating);
        setIsSuccess(true);
      } else {
        toast.error(res.message || "Gửi đánh giá thất bại. Vui lòng thử lại.");
      }
    } catch {
      toast.error("Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hover || rating;

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[600px] mx-auto pt-20 text-center text-slate-400 text-[13px]">Đang tải...</div>
      </StartupShell>
    );
  }

  const advisor = request?.advisor;
  const sessionDate = request?.scheduledAt
    ? new Date(request.scheduledAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })
    : "—";
  const duration = request?.durationMinutes ? `${request.durationMinutes} phút` : "—";

  return (
    <StartupShell>
      <div className="max-w-[600px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

        {/* Success State */}
        {isSuccess ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-10 text-center">
            <div className="w-20 h-20 bg-amber-50 border-2 border-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <>
              <h2 className="text-[20px] font-bold text-slate-900 mb-2">Cảm ơn đánh giá của bạn!</h2>
              <div className="flex items-center justify-center gap-1 my-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={cn("w-7 h-7", s <= submittedRating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                ))}
              </div>
              <p className="text-[14px] font-semibold text-amber-600 mb-1">{RATING_LABELS[submittedRating]}</p>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6">Phản hồi của bạn giúp cải thiện chất lượng tư vấn và hỗ trợ cộng đồng startup phát triển.</p>
            </>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
                className="px-5 py-2.5 bg-[#0f172a] text-white rounded-xl text-[13px] font-semibold hover:bg-slate-700 transition-all"
              >
                Về chi tiết yêu cầu
              </button>
              <button
                onClick={() => router.push("/startup/experts")}
                className="px-5 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-all"
              >
                Tìm cố vấn khác
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <h1 className="text-[18px] font-bold text-slate-900 mb-1">Đánh giá phiên tư vấn</h1>
              <p className="text-[13px] text-slate-400">Phản hồi của bạn là ẩn danh và giúp cố vấn cải thiện chất lượng dịch vụ.</p>
            </div>

            {/* Session Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Phiên tư vấn</p>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={advisor?.profilePhotoURL || "/images/placeholder-avatar.png"} alt={advisor?.fullName} className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
                  <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-amber-500 bg-white rounded-full" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-slate-900">{advisor?.fullName ?? "—"}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{advisor?.title ?? "—"}</p>
                  <p className="text-[12px] text-slate-400 mt-1">{request?.objective ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">{sessionDate}</p>
                  <p className="text-[11px] text-slate-400">{duration}</p>
                  {advisor?.averageRating != null && (
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-slate-600">{advisor.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Form */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
              {/* Stars */}
              <div className="text-center mb-6">
                <p className="text-[13px] font-bold text-slate-700 mb-4">Bạn đánh giá phiên tư vấn này như thế nào?</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star className={cn(
                        "w-10 h-10 transition-all duration-150",
                        s <= displayRating ? "text-amber-400 fill-amber-400" : "text-slate-200 hover:text-amber-200"
                      )} />
                    </button>
                  ))}
                </div>
                {displayRating > 0 && (
                  <p className={cn(
                    "text-[14px] font-bold transition-all",
                    displayRating >= 4 ? "text-amber-500" : displayRating === 3 ? "text-slate-600" : "text-red-500"
                  )}>
                    {RATING_LABELS[displayRating]}
                  </p>
                )}
                {displayRating === 0 && (
                  <p className="text-[13px] text-slate-300">Chọn từ 1–5 sao</p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-slate-500">
                  Nhận xét chi tiết <span className="text-slate-300">(tùy chọn)</span>
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-[13px] text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition-all resize-none leading-relaxed"
                  placeholder="Những điểm mạnh/yếu của cố vấn, chất lượng nội dung tư vấn, mức độ hữu ích thực tế với startup của bạn..."
                />
                <p className="text-[11px] text-slate-300 text-right">{comment.length} / 500</p>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Lock className="w-3 h-3" />
                  Đánh giá chỉ gửi được 1 lần
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
                    className="px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-all"
                  >
                    Về chi tiết yêu cầu
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all shadow-sm",
                      rating > 0 && !isSubmitting
                        ? "bg-[#0f172a] text-white hover:bg-slate-700"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang gửi...</>
                    ) : (
                      <><Send className="w-4 h-4" />Gửi đánh giá</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </StartupShell>
  );
}
