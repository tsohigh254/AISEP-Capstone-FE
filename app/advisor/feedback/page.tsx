"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Clock, ArrowRight, CornerDownRight } from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getMockFeedbackList, getMockFeedbackSummary, submitMockFeedbackResponse } from "@/services/advisor/advisor-feedback.mock";
import type { IAdvisorFeedbackItem, IAdvisorFeedbackSummary, FeedbackSort } from "@/types/advisor-feedback";

// Helper functions from Design System
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} ngày trước`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h} giờ trước`;
  const m = Math.floor(diff / 60000);
  if (m > 0) return `${m} phút trước`;
  return "Vừa xong";
}

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AdvisorFeedbackPage() {
  const [summary, setSummary] = useState<IAdvisorFeedbackSummary | null>(null);
  const [reviews, setReviews] = useState<IAdvisorFeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortFilter, setSortFilter] = useState<FeedbackSort>("NEWEST");
  
  // Responses
  const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
  const [isResponding, setIsResponding] = useState<Record<string, boolean>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const summaryData = getMockFeedbackSummary("adv_1");
      setSummary(summaryData);
      
      const listData = await getMockFeedbackList({
        rating: ratingFilter || undefined,
        sort: sortFilter,
      });
      setReviews(listData);
    } catch (e) {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingFilter, sortFilter]);

  const handleResponseChange = (reviewId: string, text: string) => {
    setResponseTexts((prev) => ({ ...prev, [reviewId]: text }));
  };

  const handleStartResponding = (reviewId: string) => {
    setIsResponding((prev) => ({ ...prev, [reviewId]: true }));
  };

  const handleCancelResponse = (reviewId: string) => {
    setIsResponding((prev) => ({ ...prev, [reviewId]: false }));
    setResponseTexts((prev) => ({ ...prev, [reviewId]: "" }));
  };

  const handleSubmitResponse = async (reviewId: string) => {
    const responseText = responseTexts[reviewId]?.trim();
    if (!responseText) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setSubmittingReply(reviewId);
    try {
      const success = await submitMockFeedbackResponse(reviewId, responseText);
      if (success) {
        toast.success("Đã gửi phản hồi thành công");
        await loadData();
        setIsResponding((prev) => ({ ...prev, [reviewId]: false }));
        setResponseTexts((prev) => ({ ...prev, [reviewId]: "" }));
      } else {
        toast.error("Có lỗi xảy ra khi gửi phản hồi");
      }
    } finally {
      setSubmittingReply(null);
    }
  };

  // Helper for rendering stars
  const renderStars = (rating: number, sizeClass = "w-4 h-4") => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClass,
              i < rating ? "fill-[#eec54e] text-[#eec54e]" : "fill-slate-200 text-slate-200"
            )}
          />
        ))}
      </div>
    );
  };

  const TABS = [
    { key: null, label: "Tất cả", count: summary?.totalReviews || 0 },
    { key: 5, label: "5 Sao", count: summary?.ratingBreakdown[5] || 0 },
    { key: 4, label: "4 Sao", count: summary?.ratingBreakdown[4] || 0 },
    { key: 3, label: "3 Sao", count: summary?.ratingBreakdown[3] || 0 },
    { key: 2, label: "2 Sao", count: summary?.ratingBreakdown[2] || 0 },
    { key: 1, label: "1 Sao", count: summary?.ratingBreakdown[1] || 0 },
  ];

  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
        
        {/* Page Header Pattern */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex-1">
             <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Đánh giá & Phản hồi</h1>
             <p className="text-[13px] text-slate-500 mt-1">Danh sách đánh giá từ các Startup sau các buổi tư vấn.</p>
          </div>
          
          {summary?.totalReviews ? (
           <div className="flex items-center gap-6 shrink-0 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
             <div className="text-center">
                <span className="text-[32px] font-bold text-slate-900 leading-none block">{summary.averageRating?.toFixed(1) || "0.0"}</span>
                <div className="flex items-center justify-center mt-1">
                  {renderStars(Math.round(summary.averageRating || 0), "w-3 h-3")}
                </div>
             </div>
             <div className="w-px h-10 bg-slate-200" />
             <div className="space-y-1.5 w-32">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = summary.ratingBreakdown[stars as 1|2|3|4|5] || 0;
                  const percent = summary.totalReviews ? (count / summary.totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                       <span className="text-[10px] font-medium text-slate-500 w-2 shrink-0">{stars}</span>
                       <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", stars >= 4 ? "bg-[#eec54e]" : "bg-slate-400")}
                            style={{ width: `${percent}%` }}
                          />
                       </div>
                    </div>
                  );
                })}
             </div>
           </div>
          ) : null}
        </div>

        {/* Tab Bar Pattern */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 mb-5 overflow-x-auto">
          <div className="flex items-center gap-1 shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.key ?? "all"}
                onClick={() => setRatingFilter(tab.key)}
                className={cn(
                  "px-3.5 py-3 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                  ratingFilter === tab.key
                    ? "border-[#0f172a] text-[#0f172a]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                    ratingFilter === tab.key ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Sort Dropdown */}
          <div className="shrink-0 pb-1.5 hidden sm:block">
             <select 
               className="px-3 py-2 rounded-xl border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all w-40"
               value={sortFilter}
               onChange={(e) => setSortFilter(e.target.value as FeedbackSort)}
             >
                <option value="NEWEST">Mới nhất</option>
                <option value="OLDEST">Cũ nhất</option>
                <option value="HIGHEST_RATING">Đánh giá cao nhất</option>
                <option value="LOWEST_RATING">Đánh giá thấp nhất</option>
             </select>
          </div>
        </div>

        {/* Mobile Sort Dropdown */}
        <div className="sm:hidden mb-5">
           <select 
             className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all"
             value={sortFilter}
             onChange={(e) => setSortFilter(e.target.value as FeedbackSort)}
           >
              <option value="NEWEST">Sắp xếp: Mới nhất</option>
              <option value="OLDEST">Sắp xếp: Cũ nhất</option>
              <option value="HIGHEST_RATING">Sắp xếp: Đánh giá cao nhất</option>
              <option value="LOWEST_RATING">Sắp xếp: Đánh giá thấp nhất</option>
           </select>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
             <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Star className="w-6 h-6 text-slate-300" />
             </div>
             <p className="text-[14px] font-semibold text-slate-500">Không có đánh giá nào</p>
             <p className="text-[13px] text-slate-400">Thử thay đổi bộ lọc mức sao khác.</p>
          </div>
        ) : (
          <div className="space-y-5">
             {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                   <div className="px-6 py-5">
                      <div className="flex items-start gap-3">
                         {/* Avatar uses Design System deterministic gradient pattern */}
                         <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[15px] font-bold shrink-0", getAvatarColor(review.startup.displayName))}>
                            {review.startup.displayName.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                               <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[14px] font-semibold text-slate-900">{review.startup.displayName}</span>
                                  {renderStars(review.rating, "w-3 h-3")}
                               </div>
                               <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {relativeTime(review.createdAt)}
                               </span>
                            </div>
                            <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1">{review.session.topic || "Buổi tư vấn chung"}</p>
                            
                            {/* Review Content */}
                            <div className="mt-3">
                               {review.comment ? (
                                  <p className="text-[13px] text-slate-700 leading-relaxed font-medium">"{review.comment}"</p>
                               ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-medium border border-slate-100 italic">
                                     Chỉ đánh giá sao, không kèm nhận xét.
                                  </span>
                               )}
                            </div>

                         </div>
                      </div>

                      {/* Response Block */}
                      {review.response && (
                         <div className="mt-4 ml-13 pl-4 border-l-2 border-slate-100">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                               <div className="flex items-center gap-1.5 mb-2">
                                  <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Phản hồi của bạn</span>
                                  <span className="text-[10px] text-slate-400 ml-auto">{relativeTime(review.response.createdAt)}</span>
                               </div>
                               <p className="text-[13px] text-slate-700 leading-relaxed pl-5">
                                  {review.response.responseText}
                               </p>
                            </div>
                         </div>
                      )}
                   </div>

                   {/* Quick actions strip for responding */}
                   {!review.response && review.canRespond && (
                      <div className="px-6 py-4 flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50">
                         {!isResponding[review.id] ? (
                            <div className="flex justify-end">
                               <button 
                                 onClick={() => handleStartResponding(review.id)}
                                 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm"
                               >
                                  <MessageSquare className="w-4 h-4" />
                                  Viết phản hồi
                               </button>
                            </div>
                         ) : (
                            <div className="space-y-3 animate-in fade-in duration-200">
                               <textarea
                                 rows={3}
                                 className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all bg-white shadow-sm"
                                 placeholder="Nhập nội dung phản hồi của bạn..."
                                 value={responseTexts[review.id] || ""}
                                 onChange={(e) => handleResponseChange(review.id, e.target.value)}
                               />
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => handleCancelResponse(review.id)}
                                    disabled={submittingReply === review.id}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors bg-white shadow-sm"
                                  >
                                    Huỷ
                                  </button>
                                  <button 
                                    onClick={() => handleSubmitResponse(review.id)}
                                    disabled={!responseTexts[review.id]?.trim() || submittingReply === review.id}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {submittingReply === review.id && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Gửi phản hồi
                                  </button>
                               </div>
                            </div>
                         )}
                      </div>
                   )}
                </div>
             ))}
          </div>
        )}
      </div>
    </AdvisorShell>
  );
}
