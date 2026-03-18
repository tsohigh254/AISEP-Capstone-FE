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
  overallScore: number;
  pitchDeckScore: number;
  businessPlanScore: number;
  teamScore: number;
  marketScore: number;
  productScore: number;
  tractionScore: number;
  financialScore: number;
  calculatedAt: string;
  generatedAt: string;
  isCurrent: boolean;
  configVersion: string;
  snapshotLabel: string;
  warningMessages: string[];
  strengths: string[];
  opportunities: string[];
  risks: string[];
  concerns: string[];
  recommendations: Recommendation[];
  subMetrics: {
    team: SubMetric[];
    market: SubMetric[];
    product: SubMetric[];
    traction: SubMetric[];
    financial: SubMetric[];
  };
}

export type UserRole = "STARTUP_OWNER" | "INVESTOR_FULL" | "INVESTOR_LIMITED" | "INVESTOR_UNAUTHORIZED";
