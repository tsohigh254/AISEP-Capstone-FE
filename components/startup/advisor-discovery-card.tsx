"use client";

import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IAdvisorSearchItem } from "@/types/startup-mentorship";
import { AdvisorBookmarkButton } from "@/components/startup/advisor-bookmark-button";

type AdvisorDiscoveryCardProps = {
  advisor: IAdvisorSearchItem;
  bookmarked: boolean;
  bookmarkLoading?: boolean;
  onToggleBookmark: () => void;
  onViewProfile: () => void;
  onRequest: () => void;
  savedAt?: string | null;
};

const EXPERTISE_MAP: Record<string, string> = {
  PRODUCT_STRATEGY: "Chiến lược SP",
  FUNDRAISING: "Gọi vốn",
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

const formatVND = (value: number | null | undefined) => {
  if (value == null || value <= 0) return "Thỏa thuận";
  return `${value.toLocaleString("vi-VN")}₫`;
};

const formatShortDate = (iso?: string | null) => {
  if (!iso) return "";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isAdvisorAvailable = (availabilityHint?: string | null) => availabilityHint === "Available";

const isValidImageUrl = (url?: string | null) => {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/");
};

export function AdvisorDiscoveryCard({
  advisor,
  bookmarked,
  bookmarkLoading = false,
  onToggleBookmark,
  onViewProfile,
  onRequest,
  savedAt,
}: AdvisorDiscoveryCardProps) {
  const formattedSavedAt = formatShortDate(savedAt);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 p-6">
      <div className="flex items-start gap-4 mb-4">
        {isValidImageUrl(advisor.profilePhotoURL) ? (
          <img
            src={advisor.profilePhotoURL}
            alt={advisor.fullName}
            className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
            <span className="text-xl font-bold text-slate-400">
              {advisor.fullName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-semibold text-slate-900">{advisor.fullName}</span>
            {advisor.isVerified && (
              <BadgeCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
            )}

            <div className="ml-auto flex items-center gap-2">
              <AdvisorBookmarkButton
                variant="chip"
                bookmarked={bookmarked}
                loading={bookmarkLoading}
                onClick={onToggleBookmark}
              />
              <span
                className={cn(
                  "flex-shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-medium border",
                  advisor.availabilityHint === "Available"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-slate-50 border-slate-100 text-slate-400"
                )}
              >
                {advisor.availabilityHint === "Available"
                  ? "Đang nhận mentee"
                  : advisor.availabilityHint === "Not available"
                    ? "Tạm ngưng"
                    : advisor.availabilityHint}
              </span>
            </div>
          </div>

          <p className="text-[12px] text-slate-400 mt-0.5">{advisor.title}</p>
          <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-1">{advisor.bio}</p>
          {formattedSavedAt && (
            <p className="mt-1.5 text-[11px] font-medium text-amber-700">
              Đã lưu ngày {formattedSavedAt}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {advisor.expertise.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-600"
          >
            {EXPERTISE_MAP[tag] || tag}
          </span>
        ))}
        {advisor.domainTags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-medium text-amber-700"
          >
            {EXPERTISE_MAP[tag] || tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 text-[12px] text-slate-400 mb-3 flex-wrap">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="font-semibold text-slate-700">{advisor.averageRating}</span>
        <span>·</span>
        <span>{advisor.reviewCount} đánh giá</span>
        <span>·</span>
        <span>{advisor.completedSessions} phiên</span>
        <span>·</span>
        <span>{advisor.yearsOfExperience} năm KN</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        <span className="text-[11px] text-slate-400 font-medium">Phù hợp:</span>
        {advisor.suitableFor.slice(0, 2).map((item) => (
          <span
            key={item}
            className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-[11px] font-medium border border-amber-100"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/60 border border-amber-100 rounded-xl mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold text-slate-700">
            {formatVND(advisor.hourlyRate)} / giờ
          </span>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {advisor.supportedDurations.map((duration) => (
            <span
              key={duration}
              className="px-1.5 py-0.5 bg-white border border-amber-100 rounded-md text-[10px] font-semibold text-amber-700"
            >
              {duration}m
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onViewProfile}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors"
        >
          Xem hồ sơ
        </button>
        <button
          type="button"
          onClick={onRequest}
          disabled={!isAdvisorAvailable(advisor.availabilityHint)}
          title={!isAdvisorAvailable(advisor.availabilityHint) ? "Cố vấn hiện chưa sẵn sàng nhận yêu cầu tư vấn." : undefined}
          className={cn(
            "flex-1 py-2.5 rounded-xl border text-[13px] font-semibold transition-all",
            isAdvisorAvailable(advisor.availabilityHint)
              ? "bg-[#fdf8e6] border-[#eec54e]/30 text-slate-800 hover:bg-[#eec54e]"
              : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          Gửi yêu cầu
        </button>
      </div>
    </div>
  );
}
