import axios from "../interceptor";
import type {
  IStartupAdvisorBookmarkIdsPayload,
  IStartupAdvisorBookmarkMutation,
  IStartupBookmarkedAdvisor,
} from "@/types/startup-advisor-bookmark";

type BookmarkListPayload =
  | IPagingData<Record<string, unknown>>
  | Record<string, unknown>
  | Record<string, unknown>[];

export const CreateStartupAdvisorBookmark = (advisorId: number) => {
  return axios.post<IBackendRes<IStartupAdvisorBookmarkMutation>>(
    "/api/startups/me/advisor-bookmarks",
    { advisorId }
  );
};

export const GetStartupAdvisorBookmarks = (params?: { page?: number; pageSize?: number }) => {
  return axios.get<IBackendRes<BookmarkListPayload>>(
    "/api/startups/me/advisor-bookmarks",
    { params }
  );
};

export const GetStartupAdvisorBookmarkIds = () => {
  return axios.get<IBackendRes<IStartupAdvisorBookmarkIdsPayload>>(
    "/api/startups/me/advisor-bookmarks/ids"
  );
};

export const RemoveStartupAdvisorBookmark = (advisorId: number) => {
  return axios.delete<IBackendRes<null>>(
    `/api/startups/me/advisor-bookmarks/${advisorId}`
  );
};

const normalizeNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeIndustry = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const industryId = normalizeNumber(record.industryId ?? record.industryID ?? 0, 0);
        const industry = String(record.industry ?? record.industryName ?? "").trim();
        if (!industry) return null;
        return { industryId, industry };
      })
      .filter((item): item is { industryId: number; industry: string } => Boolean(item));
  }

  const text = String(value ?? "").trim();
  return text ? [{ industryId: 0, industry: text }] : [];
};

const normalizeTextArray = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
};

export function normalizeStartupBookmarkedAdvisor(raw: unknown): IStartupBookmarkedAdvisor | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const advisorRecord =
    (record.advisor as Record<string, unknown> | undefined) ??
    (record.advisorSummary as Record<string, unknown> | undefined) ??
    record;

  const advisorID = normalizeNumber(
    record.advisorId ??
      record.advisorID ??
      advisorRecord.advisorId ??
      advisorRecord.advisorID,
    0
  );

  if (!advisorID) return null;

  const supportedDurationsSource =
    advisorRecord.supportedDurations ??
    advisorRecord.supportedDurationMinutes ??
    advisorRecord.durationOptions;

  const supportedDurations = Array.isArray(supportedDurationsSource)
    ? supportedDurationsSource
        .map((item) => normalizeNumber(item, 0))
        .filter((item) => item > 0)
    : [];

  return {
    bookmarkId: normalizeNumber(record.bookmarkId ?? record.bookmarkID, 0) || null,
    createdAt: String(
      record.createdAt ??
        record.bookmarkedAt ??
        record.addedAt ??
        record.savedAt ??
        ""
    ).trim() || null,
    advisorID,
    fullName: String(advisorRecord.fullName ?? advisorRecord.name ?? "").trim() || "Cố vấn",
    title: String(advisorRecord.title ?? advisorRecord.professionalHeadline ?? "").trim(),
    bio: String(advisorRecord.bio ?? advisorRecord.biography ?? "").trim(),
    profilePhotoURL: String(
      advisorRecord.profilePhotoURL ??
        advisorRecord.avatarUrl ??
        advisorRecord.profileImageUrl ??
        ""
    ).trim(),
    averageRating: normalizeNumber(advisorRecord.averageRating ?? advisorRecord.rating, 0),
    reviewCount: normalizeNumber(advisorRecord.reviewCount ?? advisorRecord.totalReviews, 0),
    completedSessions: normalizeNumber(
      advisorRecord.completedSessions ?? advisorRecord.completedSessionCount,
      0
    ),
    yearsOfExperience: normalizeNumber(
      advisorRecord.yearsOfExperience ?? advisorRecord.experienceYears,
      0
    ),
    expertise: normalizeTextArray(advisorRecord.expertise),
    domainTags: normalizeTextArray(advisorRecord.domainTags),
    suitableFor: normalizeTextArray(advisorRecord.suitableFor),
    isVerified: Boolean(advisorRecord.isVerified),
    availabilityHint: String(advisorRecord.availabilityHint ?? "").trim() || "Unknown",
    hourlyRate: normalizeNumber(advisorRecord.hourlyRate, 0),
    supportedDurations,
    industry: normalizeIndustry(advisorRecord.industry ?? advisorRecord.industries),
  };
}
