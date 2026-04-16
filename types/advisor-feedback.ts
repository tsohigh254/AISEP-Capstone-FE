export type FeedbackVisibilityStatus =
  | 'VISIBLE'
  | 'HIDDEN_BY_POLICY'
  | 'FLAGGED'
  | 'REMOVED';

export type ModerationStatus =
  | 'NONE'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type FeedbackSort =
  | 'NEWEST'
  | 'OLDEST'
  | 'HIGHEST_RATING'
  | 'LOWEST_RATING';

export interface IAdvisorFeedbackResponse {
  id: string;
  responseText: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdvisorFeedbackItem {
  id: string;
  sessionId: string;
  startup: {
    id: string;
    displayName: string;
  };
  session: {
    topic: string | null;
    completedAt: string;
  } | null;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  createdAt: string;
  response: IAdvisorFeedbackResponse | null;
  canRespond: boolean;
  visibilityStatus: FeedbackVisibilityStatus;
}

export interface IAdvisorFeedbackSummary {
  advisorId: string;
  averageRating: number | null;
  totalReviews: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  lastUpdatedAt?: string;
}
