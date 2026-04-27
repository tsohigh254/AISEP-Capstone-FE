export type AIEvaluationStatus =
  | "NOT_REQUESTED"
  | "VALIDATING"
  | "QUEUED"
  | "ANALYZING"
  | "SCORING"
  | "GENERATING_REPORT"
  | "COMPLETED"
  | "INSUFFICIENT_DATA"
  | "FAILED"
  | "ACCESS_RESTRICTED";

export interface SubMetric {
  name: string;
  score: number;
  maxScore: number;
  comment: string;
}

export interface Recommendation {
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  text: string;
  impact: string;
}

export interface AIEvaluationReport {
  evaluationId: string;
  startupId: string;
  status: AIEvaluationStatus;
  /** null khi BE trả null (chưa chấm / không áp dụng), không đồng nghĩa với 0 điểm. */
  overallScore: number | null;
  pitchDeckScore: number | null;
  businessPlanScore: number | null;
  teamScore: number | null;
  marketScore: number | null;
  productScore: number | null;
  tractionScore: number | null;
  financialScore: number | null;
  calculatedAt: string;
  generatedAt: string;
  isCurrent: boolean;
  configVersion: string;
  modelVersion: string;
  promptVersion: string;
  snapshotLabel: string;
  warningMessages: string[];
  executiveSummary: string;
  strengths: string[];
  opportunities: string[];
  risks: string[];
  concerns: string[];
  gaps: string[];
  recommendations: Recommendation[];
  subMetrics: {
    team: SubMetric[];
    market: SubMetric[];
    product: SubMetric[];
    traction: SubMetric[];
    financial: SubMetric[];
    /** Tiêu chí BE gắn pillar OTHER hoặc không khớp nhóm chính. */
    other: SubMetric[];
  };
  
  /** Full detail reports for specific sources if available. */
  pitchDeckReport?: AIEvaluationReport | null;
  businessPlanReport?: AIEvaluationReport | null;
}

export type UserRole = "STARTUP_OWNER" | "INVESTOR_FULL" | "INVESTOR_LIMITED" | "INVESTOR_UNAUTHORIZED";

/* ─── Readiness ────────────────────────────────────────────── */

export interface ReadinessItem {
  label: string;
  ready: boolean;
  detail?: string;
}

export interface EligibleDocument {
  id: string;
  name: string;
  type: "PITCH_DECK" | "BUSINESS_PLAN" | "OTHER";
  updatedAt: string;
  recommended: boolean;
}

export interface ReadinessSummary {
  profile: {
    ready: boolean;
    completionPercent: number;
    items: ReadinessItem[];
  };
  documents: {
    ready: boolean;
    eligibleDocs: EligibleDocument[];
    items: ReadinessItem[];
  };
}

export interface ProfileSnapshot {
  name: string;
  stage: string;
  industry: string;
  foundedYear: number;
  teamSize: number;
  lastUpdated: string;
}
