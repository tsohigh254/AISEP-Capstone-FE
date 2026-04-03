"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Calendar, CheckCircle2, Clock, Video,
  Globe, Info, BadgeCheck, Star, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetMentorshipById } from "@/services/startup/startup-mentorship.api";
import type { IMentorshipRequest } from "@/types/startup-mentorship";
import { toast } from "sonner";
import Link from "next/link";

const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ConfirmSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [request, setRequest] = useState<IMentorshipRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

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

  // Advisor-proposed slots come from BE as requestedSlots with proposedBy === "ADVISOR"
  const advisorSlots: any[] = ((request as any)?.requestedSlots ?? []).filter(
    (s: any) => s.proposedBy === "ADVISOR" && s.isActive !== false
  );

  // Kịch bản A: advisor đã schedule thẳng → status Scheduled, có scheduledAt
  const isAlreadyScheduled = request?.status === "Scheduled";
  const scheduledAt: string | null = (request as any)?.scheduledAt ?? null;
  const scheduledEndAt: string | null = (request as any)?.scheduledEndAt ?? null;
  const meetingLink: string | null = (request as any)?.meetingLink ?? null;
  const meetingFormat: string | null = (request as any)?.preferredFormat ?? (request as any)?.meetingFormat ?? null;

  const handleConfirm = async () => {
    if (selectedSlotId === null) {
      toast.error("Vui lòng chọn một khung giờ phù hợp.");
      return;
    }
    setIsConfirming(true);
    try {
      // TODO: call BE endpoint PUT /api/mentorships/{id}/confirm-slot { slotID }
      // when endpoint is available. For now navigate to checkout.
      router.push(`/startup/mentorship-requests/${id}/checkout`);
    } catch {
      toast.error("Xác nhận thất bại. Vui lòng thử lại.");
      setIsConfirming(false);
    }
  };

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[800px] mx-auto pt-20 text-center text-slate-400 text-[13px]">Đang tải...</div>
      </StartupShell>
    );
  }

  const advisor = request?.advisor;
  const durationMinutes = request?.durationMinutes ?? 60;
  const durationLabel = `${durationMinutes} phút`;

  return (
    <StartupShell>
      <div className="max-w-[800px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

        {/* ── Kịch bản A: Advisor đã schedule thẳng ── */}
        {isAlreadyScheduled ? (
          <>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-[18px] font-bold text-slate-900">Lịch hẹn đã được chốt</h1>
                  <p className="text-[12px] text-slate-400 mt-0.5">Cố vấn đã xác nhận thời gian buổi tư vấn</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-4">
                {/* Confirmed schedule card */}
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
                  <p className="text-[13px] font-bold text-slate-700">Thông tin buổi tư vấn đã xác nhận</p>

                  <div className="flex items-start gap-3 p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <Calendar className="w-4.5 h-4.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-indigo-900">{formatDateTime(scheduledAt)}</p>
                      {scheduledEndAt && (
                        <p className="text-[12px] text-indigo-600 mt-0.5">
                          Kết thúc: {new Date(scheduledEndAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      <p className="text-[11px] text-indigo-500 mt-0.5">GMT+7</p>
                    </div>
                  </div>

                  {meetingLink ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <Link2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Link tham gia</p>
                        <a
                          href={meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] font-semibold text-emerald-700 hover:underline truncate block"
                        >
                          {meetingLink}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <p className="text-[12px] text-amber-700">Link tham gia sẽ được cung cấp sau khi thanh toán hoàn tất.</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/startup/mentorship-requests/${id}/checkout`)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-slate-700 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tiến hành thanh toán
                  </button>
                  <button
                    onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
                    className="px-5 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-all"
                  >
                    Về chi tiết yêu cầu
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Cố vấn</p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={advisor?.profilePhotoURL || "/images/placeholder-avatar.png"} alt={advisor?.fullName} className="w-11 h-11 rounded-xl object-cover border border-slate-100" />
                      <BadgeCheck className="absolute -bottom-1 -right-1 w-4.5 h-4.5 text-amber-500 bg-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{advisor?.fullName ?? "—"}</p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{advisor?.title ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Trạng thái xác nhận</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-600">Bạn</span>
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-600"><Clock className="w-3.5 h-3.5" />Chờ thanh toán</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-600">Cố vấn</span>
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />Đã xác nhận lịch</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Thông tin phiên</p>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500 flex-shrink-0">Chủ đề</span>
                      <span className="font-semibold text-slate-700 text-right truncate max-w-[140px]">{request?.objective ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thời lượng</span>
                      <span className="font-semibold text-slate-700">{durationLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-2">Thanh toán sau khi xác nhận</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    Tiền được giữ bởi AISEP cho đến khi phiên hoàn tất.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
        /* ── Kịch bản B: Advisor đề xuất counter-slot, startup chọn ── */
          <>
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5 text-teal-600" />
                </div>
                <div>
                  <h1 className="text-[18px] font-bold text-slate-900">Xác nhận lịch hẹn tư vấn</h1>
                  <p className="text-[12px] text-slate-400 mt-0.5">Chọn một trong các khung giờ mà cố vấn đề xuất</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Slot Picker */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                  <p className="text-[13px] font-bold text-slate-700 mb-4">Chọn khung giờ phù hợp</p>

                  {advisorSlots.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <Clock className="w-8 h-8 text-slate-200 mx-auto" />
                      <p className="text-[13px] text-slate-400 font-medium">Cố vấn chưa đề xuất khung giờ nào.</p>
                      <p className="text-[12px] text-slate-400">Vui lòng quay lại sau hoặc liên hệ trực tiếp với cố vấn.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {advisorSlots.map((slot: any) => {
                        const start = new Date(slot.startAt);
                        const end   = new Date(slot.endAt);
                        const dateLabel = start.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
                        const timeLabel = `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
                        const tz = slot.timezone ?? "GMT+7";
                        const isSelected = selectedSlotId === slot.slotID;

                        return (
                          <button
                            key={slot.slotID}
                            onClick={() => setSelectedSlotId(slot.slotID)}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                              isSelected
                                ? "border-[#eec54e] bg-amber-50/50"
                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                              isSelected ? "border-[#eec54e] bg-[#eec54e]" : "border-slate-300"
                            )}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-[13px] font-bold text-slate-800 mb-1">{dateLabel}</p>
                              <div className="flex items-center gap-4 text-[12px] text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeLabel}</span>
                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{tz}</span>
                                <span className="flex items-center gap-1"><Video className="w-3 h-3" />Online</span>
                              </div>
                              {slot.note && (
                                <p className="text-[11px] text-slate-400 mt-1 italic">{slot.note}</p>
                              )}
                            </div>
                            {isSelected && (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[11px] font-bold">Đã chọn</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Payment required notice */}
                <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-700 leading-relaxed">
                    Tất cả giờ theo <span className="font-semibold">GMT+7</span>. Sau khi chọn khung giờ, bạn sẽ được chuyển đến trang <span className="font-semibold">thanh toán bắt buộc</span>. Link tham gia phiên chỉ hiển thị sau khi thanh toán thành công.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={selectedSlotId === null || isConfirming || advisorSlots.length === 0}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold transition-all shadow-sm",
                      selectedSlotId !== null && !isConfirming
                        ? "bg-[#0f172a] text-white hover:bg-slate-700"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {isConfirming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Xác nhận & Tiến hành thanh toán
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
                    className="px-5 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-all"
                  >
                    Về chi tiết yêu cầu
                  </button>
                </div>
              </div>

              {/* Sidebar: Summary */}
              <div className="space-y-4">
                {/* Advisor */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Cố vấn</p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={advisor?.profilePhotoURL || "/images/placeholder-avatar.png"}
                        alt={advisor?.fullName}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-100"
                      />
                      <BadgeCheck className="absolute -bottom-1 -right-1 w-4.5 h-4.5 text-amber-500 bg-white rounded-full" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">{advisor?.fullName ?? "—"}</p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{advisor?.title ?? "—"}</p>
                      {advisor?.averageRating != null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-bold text-slate-600">{advisor.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirmation status */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Trạng thái xác nhận</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-600">Bạn</span>
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
                        <Clock className="w-3.5 h-3.5" />
                        Chờ xác nhận
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-600">Cố vấn</span>
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />Đã đề xuất lịch
                      </span>
                    </div>
                  </div>
                </div>

                {/* Session info */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Thông tin phiên</p>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500 flex-shrink-0">Chủ đề</span>
                      <span className="font-semibold text-slate-700 text-right truncate max-w-[140px]">{request?.objective ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thời lượng</span>
                      <span className="font-semibold text-slate-700">{durationLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Payment note */}
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-2">Thanh toán sau khi xác nhận</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    Tiền được giữ bởi AISEP cho đến khi phiên hoàn tất.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </StartupShell>
  );
}
