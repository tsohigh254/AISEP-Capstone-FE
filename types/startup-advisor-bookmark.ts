import type { IAdvisorSearchItem } from "@/types/startup-mentorship";

export interface IStartupAdvisorBookmarkMutation {
  bookmarkId: number;
  advisorId: number;
  createdAt: string;
  isBookmarked: boolean;
}

export interface IStartupAdvisorBookmarkIdsPayload {
  advisorIds: number[];
}

export type IStartupBookmarkedAdvisor = IAdvisorSearchItem & {
  bookmarkId?: number | null;
  createdAt?: string | null;
};
