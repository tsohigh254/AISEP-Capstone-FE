import axios from "../interceptor";
import type {
  IAdvisorFeedbackItem,
  IAdvisorFeedbackSummary,
  FeedbackSort,
} from "@/types/advisor-feedback";

// ── Sort param mapping ────────────────────────────────────────────────────────

const SORT_MAP: Record<FeedbackSort, string> = {
  NEWEST: "newest",
  OLDEST: "oldest",
  HIGHEST_RATING: "rating_desc",
  LOWEST_RATING: "rating_asc",
};

// ── Query params ──────────────────────────────────────────────────────────────

export interface IFeedbackListParams {
  rating?: number;
  sort?: FeedbackSort;
  page?: number;
  pageSize?: number;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export const GetAdvisorFeedbacks = (params: IFeedbackListParams = {}) => {
  return axios.get<IBackendRes<IPagingData<IAdvisorFeedbackItem>>>(
    "/api/advisors/me/feedbacks",
    {
      params: {
        ...(params.rating ? { rating: params.rating } : {}),
        sort: params.sort ? SORT_MAP[params.sort] : "newest",
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
    }
  );
};

export const GetAdvisorFeedbackSummary = () => {
  return axios.get<IBackendRes<IAdvisorFeedbackSummary>>(
    "/api/advisors/me/feedbacks/summary"
  );
};

export const SubmitFeedbackResponse = (feedbackId: string, responseText: string) => {
  return axios.post<IBackendRes<null>>(
    `/api/advisors/feedbacks/${feedbackId}/response`,
    { responseText }
  );
};
