// ═══════════════════════════════════════════════════════════════
//  Types matching BE DTOs (AIDTOs.cs + IAIService responses)
//  BE is source of truth — all shapes mirror ApiEnvelope<T>.data
// ═══════════════════════════════════════════════════════════════

/* ─── Evaluation trigger ─────────────────────────────────────── */

export interface EvaluationSubmitResponse {
  evaluationRunId: number;
  status: string;
  message: string;
}

/* ─── Evaluation status (polling) ────────────────────────────── */

export interface EvaluationDocumentStatus {
  id: number;
  documentType: string;
  status: string;
  extractionStatus?: string;
  summary?: string;
}

export interface EvaluationStatusResponse {
  id: number;
  startupId: string;
  status: string;
  failureReason?: string;
  overallScore?: number;
  overallConfidence?: number;
  submittedAt?: string;
  documents: EvaluationDocumentStatus[];
}

/* ─── Evaluation report ──────────────────────────────────────── */

export interface EvaluationReportResponse {
  id: number;
  startupId: string;
  overallScore: number;
  overallConfidence?: number;
  dimensionScores?: Record<string, any>;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  completedAt?: string;
}

/* ─── AI Score (from local DB) ───────────────────────────────── */

export interface SubMetricDto {
  category: string;
  metricName: string;
  metricValue?: string;
  metricScore: number;
  explanation?: string;
}

export interface ImprovementRecommendationDto {
  category: string;
  priority: string;
  recommendationText?: string;
  expectedImpact?: string;
}

export interface AIScoreLatestResponse {
  scoreId: number;
  startupId: number;
  overallScore: number;
  teamScore: number;
  marketScore: number;
  productScore: number;
  tractionScore: number;
  financialScore: number;
  calculatedAt: string;
  subMetrics: SubMetricDto[];
  recommendations: ImprovementRecommendationDto[];
}

export interface AIScoreHistoryResponse {
  scores: AIScoreLatestResponse[];
}

/* ─── Recommendations (investor) ─────────────────────────────── */

export interface RecommendationMatchDto {
  startupId: string;
  startupName?: string;
  score: number;
  explanation?: string;
}

export interface RecommendationListResponse {
  investorId: string;
  items: RecommendationMatchDto[];
  generatedAt: string;
}

/* ─── Scoring model config (admin) ───────────────────────────── */

export interface ScoringModelConfigDto {
  configId: number;
  version: string;
  teamWeight: number;
  marketWeight: number;
  productWeight: number;
  tractionWeight: number;
  financialWeight: number;
  applicableStage?: string;
  changeNotes?: string;
  isActive: boolean;
  createdAt: string;
}

/* ─── UI-only helpers ────────────────────────────────────────── */

export type AIEvaluationStatus =
  | "NOT_REQUESTED"
  | "QUEUED"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED";

export type UserRole = "STARTUP_OWNER" | "INVESTOR_FULL" | "INVESTOR_LIMITED" | "INVESTOR_UNAUTHORIZED";
