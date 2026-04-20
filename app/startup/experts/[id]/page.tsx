"use client";

import { StartupShell } from "@/components/startup/startup-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star, MessageSquare, Send, Calendar, Briefcase, Users,
  BadgeCheck, CheckCircle2, Info, Lock, Loader2, Linkedin, ArrowRight, Activity
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { MentorshipRequestModal } from "@/components/startup/mentorship-request-modal";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { GetAdvisorById, GetMentorships } from "@/services/startup/startup-mentorship.api";
import type { IAdvisorDetail, IAdvisorSearchItem, IAdvisorTimeSlot, IMentorshipRequest } from "@/types/startup-mentorship";

const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

const EXPERTISE_DICT: Record<string, string> = {
  FUNDRAISING: "Gọi vốn",
  PRODUCT_STRATEGY: "Chiến lược SP",
  GO_TO_MARKET: "Go-to-market",
  FINANCE: "Tài chính",
  LEGAL_IP: "Pháp lý & SHTT",
  LEGAL_COMPLIANCE: "Pháp lý & Tuân thủ",
  OPERATIONS: "Vận hành",
  TECHNOLOGY: "Công nghệ",
  MARKETING: "Marketing",
  HR_OR_TEAM_BUILDING: "Nhân sự & Đội ngũ",
  ENGINEERING: "Kỹ thuật",
  AI_ML: "AI / ML",
  AI: "AI",
  GROWTH_HACKING: "Growth Hacking",
  SAAS: "SaaS",
  FINTECH: "FinTech",
  E_COMMERCE: "E-commerce",
};

const formatExpertise = (val: string) => EXPERTISE_DICT[val] || val;

const DAY_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

function groupSlotsByDay(slots: IAdvisorTimeSlot[]): { day: number; label: string; ranges: string[] }[] {
  const map: Record<number, string[]> = {};
  for (const s of slots) {
    if (!map[s.dayOfWeek]) map[s.dayOfWeek] = [];
    map[s.dayOfWeek].push(`${s.startTime}–${s.endTime}`);
  }
  return Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b)
    .map(day => ({ day, label: DAY_NAMES[day] ?? `Ngày ${day}`, ranges: map[day] }));
}

const isValidImageUrl = (url?: string | null) => {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/");
};

// ─── Toast Component ──────────────────────────────────────────────────────────

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 bg-[#0f172a] text-white text-[13px] font-medium rounded-xl shadow-lg pointer-events-none">
      {msg}
    </div>
  );
}

// ─── Star Row ─────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5 my-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={cn(
            "w-4 h-4",
            s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <StartupShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="size-36 rounded-2xl bg-slate-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-4 w-full">
              <div className="h-8 bg-slate-200 animate-pulse rounded-lg w-64 mx-auto md:mx-0" />
              <div className="h-5 bg-slate-100 animate-pulse rounded-lg w-48 mx-auto md:mx-0" />
              <div className="flex gap-2 justify-center md:justify-start">
                <div className="h-6 bg-slate-100 animate-pulse rounded-lg w-20" />
                <div className="h-6 bg-slate-100 animate-pulse rounded-lg w-20" />
                <div className="h-6 bg-slate-100 animate-pulse rounded-lg w-20" />
              </div>
              <div className="flex gap-6 justify-center md:justify-start">
                <div className="h-10 bg-slate-100 animate-pulse rounded-lg w-24" />
                <div className="h-10 bg-slate-100 animate-pulse rounded-lg w-24" />
                <div className="h-10 bg-slate-100 animate-pulse rounded-lg w-24" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6">
              <div className="h-4 bg-slate-100 animate-pulse rounded w-32" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 animate-pulse rounded w-full" />
                <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
              <div className="h-4 bg-slate-100 animate-pulse rounded w-24" />
              <div className="h-10 bg-slate-100 animate-pulse rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    </StartupShell>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <StartupShell>
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <Info className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy chuyên gia</h2>
        <p className="text-sm text-slate-500">Chuyên gia này không tồn tại hoặc đã xảy ra lỗi khi tải dữ liệu.</p>
        <Button
          onClick={onRetry}
          className="mt-4 h-10 px-6 rounded-xl bg-[#0f172a] text-white text-sm font-semibold hover:bg-slate-700"
        >
          Thử lại
        </Button>
      </div>
    </StartupShell>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExpertProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [advisor, setAdvisor] = useState<IAdvisorDetail | null>(null);
  const [activeMentorship, setActiveMentorship] = useState<IMentorshipRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const ACTIVE_STATUSES = ["Requested", "Pending", "Accepted", "InProgress"];

  const fetchAdvisor = async () => {
    setLoading(true);
    setError(false);
    try {
      const [advisorRes, mentorshipsRes] = await Promise.all([
        GetAdvisorById(parseInt(id)) as unknown as Promise<IBackendRes<IAdvisorDetail>>,
        GetMentorships({ pageSize: 100 }) as unknown as Promise<IBackendRes<IPagingData<IMentorshipRequest>>>,
      ]);

      const data = advisorRes.data && (advisorRes.data as any).data ? (advisorRes.data as any).data : advisorRes.data;
      if ((advisorRes.success || advisorRes.isSuccess) && data) {
        // Normalize linkedin field casing từ backend
        if (!data.linkedInURL && (data as any).linkedinUrl) {
          data.linkedInURL = (data as any).linkedinUrl;
        }
        setAdvisor(data);
      } else {
        setError(true);
      }

      if (mentorshipsRes.isSuccess || mentorshipsRes.success) {
        const items: IMentorshipRequest[] = (mentorshipsRes.data as any)?.items ?? (mentorshipsRes.data as any)?.data ?? [];
        const found = items.find(
          m => m.advisorID === parseInt(id) && ACTIVE_STATUSES.includes(m.status as string)
        );
        setActiveMentorship(found ?? null);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisor();
  }, [id]);

  if (loading) return <ProfileSkeleton />;
  if (error || !advisor) return <ErrorState onRetry={fetchAdvisor} />;

  // Check if advisor has configured their hourly rate and durations
    const isMissingRequiredInfo = typeof advisor.hourlyRate !== "number" || !advisor.supportedDurations || advisor.supportedDurations.length === 0;

  return (
    <StartupShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative size-36 rounded-2xl overflow-hidden border-4 border-white shadow-xl shadow-amber-500/10 flex-shrink-0">
                {isValidImageUrl(advisor.profilePhotoURL) ? (
                  <img src={advisor.profilePhotoURL} alt={advisor.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-slate-400">
                      {advisor.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            <div className="flex-1 space-y-5 text-center md:text-left">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                  <h1 className="text-[28px] font-black text-slate-900 tracking-tight">{advisor.fullName}</h1>
                  {advisor.isVerified && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl text-[11px] font-semibold">
                      <BadgeCheck className="w-3.5 h-3.5" /> Đã xác minh
                    </span>
                  )}
                </div>
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                    <p className="text-[15px] font-semibold text-slate-500">{advisor.title}</p>
                    {advisor.company && (
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5 before:hidden md:before:block before:content-['•'] before:mr-3 before:text-slate-300">
                          <span className="font-medium text-slate-600">{advisor.company}</span>
                        </span>
                      </div>
                    )}
                  </div>
                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mt-2">
                    {(advisor.expertise || []).map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-600">
                          {formatExpertise(tag)}
                        </span>
                    ))}
                    {(advisor.domainTags || []).map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-medium text-amber-700">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-slate-900 leading-none">{advisor.averageRating}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{advisor.reviewCount} đánh giá</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-6 border-x border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-slate-900 leading-none">{advisor.completedSessions}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Phiên hoàn thành</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-slate-900 leading-none">{advisor.yearsOfExperience} năm</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Kinh nghiệm</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                <Button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="h-11 px-6 rounded-xl bg-[#fdf8e6] text-slate-900 border border-[#eec54e]/30 hover:bg-[#eec54e] transition-all font-semibold text-[13px] shadow-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Yêu cầu tư vấn ngay
                </Button>
                {!!activeMentorship ? (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/startup/messaging")}
                    className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-semibold text-[13px] hover:bg-slate-50 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Gửi tin nhắn
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="h-11 px-6 rounded-xl border-slate-200 text-slate-400 font-semibold text-[13px] cursor-not-allowed opacity-60"
                    title="Cần có phiên tư vấn được chấp nhận để nhắn tin"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Nhắn tin
                  </Button>
                )}
                {advisor.linkedInURL && (
                  <a
                    href={advisor.linkedInURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[#0077B5]/30 bg-[#0077B5]/5 text-[#0077B5] font-semibold text-[13px] hover:bg-[#0077B5]/10 transition-all"
                  >
                    <Image src="/linkedin.svg" alt="LinkedIn" width={16} height={16} unoptimized />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-8 space-y-10">

                {/* Biography */}
                <section className="space-y-3">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Giới thiệu Chuyên gia</h3>
                    <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line">{advisor.bio || advisor.biography || "Cố vấn chưa cung cấp thông tin giới thiệu."}</p>
                  </section>

                  {/* Philosophy */}
                  {Boolean(advisor.mentorshipPhilosophy || advisor.philosophy) && (
                    <section className="space-y-3 pt-6 border-t border-slate-50">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Triết lý hướng dẫn</h3>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                        <MessageSquare className="absolute -top-2 -left-2 w-7 h-7 text-[#eec54e]/20" />
                        <p className="text-[14px] text-slate-700 font-semibold italic whitespace-pre-line">"{advisor.mentorshipPhilosophy || advisor.philosophy}"</p>
                      </div>
                    </section>
                  )}

                {/* Rating Summary */}
                <section className="space-y-4 pt-8 border-t border-slate-50">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Đánh giá & Xếp hạng</h3>
                  <div className="flex items-center gap-8">
                    <div className="text-center flex-shrink-0">
                      <p className="text-[48px] font-black text-slate-900 leading-none">{advisor.averageRating}</p>
                      <StarRow rating={advisor.averageRating} />
                      <p className="text-[12px] text-slate-400 mt-1">{advisor.reviewCount} đánh giá</p>
                    </div>
                    <div className="flex-1 space-y-2">
                        {[...(advisor.ratingBreakdown || [])].reverse().map(({ score, count }) => (
                        <div key={score} className="flex items-center gap-3">
                          <span className="text-[12px] text-slate-400 w-8 text-right">{score}⭐</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-amber-400 h-2 rounded-full transition-all"
                                style={{ width: (advisor.reviewCount || Number((advisor as any).totalReviews) || 0) > 0 ? `${(count / (advisor.reviewCount || Number((advisor as any).totalReviews) || 1)) * 100}%` : "0%" }}
                            />
                          </div>
                          <span className="text-[12px] text-slate-400 w-5">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Experience */}
{advisor.experience && advisor.experience.length > 0 && (
                    <section className="space-y-6 pt-8 border-t border-slate-50">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Kinh nghiệm & Thành tựu</h3>
                      <div className="space-y-8 relative before:absolute before:inset-0 before:left-[11px] before:w-0.5 before:bg-slate-100">
                        {advisor.experience.map((item, idx) => (
                          <div key={idx} className="relative pl-10 space-y-1">
                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#eec54e] shadow-sm z-10" />
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{item.year}</span>
                            <h4 className="text-[15px] font-bold text-slate-900">{item.role}</h4>
                            <p className="text-[13px] font-semibold text-slate-400">{item.company}</p>
                            <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {/* Suitable For */}
{advisor.suitableFor && advisor.suitableFor.length > 0 && (
                    <section className="space-y-4 pt-8 border-t border-slate-50">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Phù hợp với</h3>
                      <div className="flex flex-wrap gap-2">
                        {(advisor.suitableFor || []).map(f => (
                          <span key={f} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-[12px] font-medium border border-amber-100">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="rounded-2xl border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Đánh giá từ Startup</h3>
                <div className="space-y-4">
                  {(advisor.reviews || []).length === 0 ? (
                    <p className="text-[13px] text-slate-400 italic">Chưa có đánh giá nào.</p>
                  ) : (
                    (advisor.reviews || []).map((review, idx) => (
                      <div key={idx} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[14px] font-bold text-slate-500">
                              {review.author.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-slate-900 leading-none mb-0.5">{review.author}</p>
                              {review.stage && <p className="text-[11px] text-slate-400">{review.stage}</p>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                              ))}
                            </div>
                            {review.submittedAt && (
                              <p className="text-[10px] text-slate-300">
                                {new Date(review.submittedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-[13px] text-slate-600 italic leading-relaxed">"{review.text}"</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            {activeMentorship ? (
              <Card className="rounded-2xl border-blue-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 leading-snug">Đang có phiên tư vấn</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">với cố vấn này</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    Bạn đang trong một cuộc tư vấn với <span className="font-semibold text-slate-700">{advisor.fullName}</span>. Vui lòng hoàn thành phiên hiện tại trước khi đặt lịch mới.
                  </p>
                  <button
                    onClick={() => router.push(`/startup/mentorship-requests/${activeMentorship.mentorshipID}`)}
                    className="w-full h-11 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    Xem chi tiết phiên tư vấn
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl border-amber-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Phí tư vấn</h4>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md text-[10px] font-bold text-emerald-600">Đã thanh toán</span>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className="text-[32px] font-black text-slate-900 leading-none">{formatVND(advisor.hourlyRate)}</span>
                    <span className="text-[13px] text-slate-400 mb-1">/giờ</span>
                  </div>

                  <div className="space-y-2">
                    {(advisor.supportedDurations || []).map(d => {
                      const price = Math.round(advisor.hourlyRate * d / 60);
                      return (
                        <div key={d} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                          <span className="text-[12px] font-semibold text-slate-600">{d} phút</span>
                          <span className="text-[13px] font-bold text-slate-900">{formatVND(price)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-amber-50/50 border border-amber-100/60 rounded-xl">
                    <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-relaxed">Bạn chỉ thanh toán sau khi lịch hẹn được xác nhận.</p>
                  </div>

                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="w-full h-11 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-slate-700 transition-all"
                  >
                    Đặt lịch tư vấn
                  </button>
                </CardContent>
              </Card>
            )}

            {/* Quick Facts */}
            <Card className="rounded-2xl border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <h4 className="text-[13px] font-bold text-slate-900 text-center pb-4 border-b border-slate-50 italic">Thông tin tư vấn</h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                        <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phiên hoàn thành</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">{advisor.completedSessions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kinh nghiệm</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">{advisor.yearsOfExperience} năm</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                        <BadgeCheck className="w-3.5 h-3.5 text-teal-500" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Xác minh</span>
                    </div>
                    <span className={cn("text-[13px] font-bold", advisor.isVerified ? "text-teal-600" : "text-slate-400")}>
                      {advisor.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                    </span>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Weekly Timeslots */}
            <Card className="rounded-2xl border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] pb-4 border-b border-slate-50 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Lịch rảnh trong tuần
                </h4>
                {(() => {
                  const grouped = groupSlotsByDay(advisor.timeSlots ?? []);
                  if (grouped.length === 0) {
                    return (
                      <p className="text-[12px] text-slate-400 text-center py-2">Chưa thiết lập lịch rảnh.</p>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {grouped.map(({ day, label, ranges }) => (
                        <div key={day} className="flex items-start gap-3">
                          <span className="min-w-[52px] text-[11px] font-bold text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-2 py-1 text-center leading-tight">
                            {label}
                          </span>
                          <div className="flex flex-col gap-1">
                            {ranges.map((r, i) => (
                              <span key={i} className="text-[12px] font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 leading-tight">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="rounded-2xl border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-6 space-y-5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] pb-4 border-b border-slate-50">Chuyên môn chính</h4>
                <div className="space-y-4">
                  {advisor.skills.map((skill, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-slate-700">{skill.label}</span>
                        <span className="text-[13px] font-bold text-[#eec54e]">{skill.value}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#eec54e] rounded-full transition-all duration-700"
                          style={{ width: `${skill.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal */}
        <MentorshipRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          mentor={{
            advisorID: advisor.advisorID,
            fullName: advisor.fullName,
            profilePhotoURL: advisor.profilePhotoURL,
            title: advisor.title,
            hourlyRate: advisor.hourlyRate,
            supportedDurations: advisor.supportedDurations,
            expertise: advisor.expertise,
          } as IAdvisorSearchItem}
        />

        {/* Toast */}
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </div>
    </StartupShell>
  );
}

