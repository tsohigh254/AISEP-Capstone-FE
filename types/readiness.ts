export type ReadinessDimension = "profile" | "kyc" | "documents" | "ai" | "trust";

export type ReadinessStatus = "NOTREADY" | "NEEDSWORK" | "ALMOSTREADY" | "INVESTORREADY";

export type ReadinessMissingCode =
  | "MISSING_ONELINER"
  | "MISSING_STAGE"
  | "MISSING_INDUSTRY"
  | "MISSING_PROBLEM"
  | "MISSING_SOLUTION"
  | "MISSING_WEBSITE"
  | "MISSING_MARKET_SCOPE"
  | "MISSING_TEAM"
  | "MISSING_KYC"
  | "KYC_PENDING_INFO"
  | "KYC_REJECTED"
  | "MISSING_PITCH_DECK"
  | "MISSING_BP"
  | "DOC_VISIBILITY"
  | "MISSING_AI_EVAL"
  | "MISSING_BLOCKCHAIN_PROOF"
  | "STALE_DATA";

export type ReadinessActionCode =
  | "COMPLETE_PROFILE"
  | "SUBMIT_KYC"
  | "RESUBMIT_KYC"
  | "UPLOAD_PITCH_DECK"
  | "UPLOAD_BP"
  | "REQUEST_AI_EVAL"
  | "VERIFY_DOC";

export type ReadinessCapRule = "NO_PITCH_DECK" | "NO_AI_EVALUATION" | "KYC_FAILED";

export interface ReadinessDimensions {
  profile: number;
  kyc: number;
  documents: number;
  ai: number;
  trust: number;
}

export interface ReadinessMissingItem {
  code: ReadinessMissingCode | string;
  dimension: ReadinessDimension;
  label: string;
}

export interface ReadinessNextAction {
  code: ReadinessActionCode | string;
  label: string;
  target: string;
}

export interface ReadinessAppliedCap {
  rule: ReadinessCapRule | string;
  description: string;
  cappedAt: number;
}

export interface StartupReadinessResult {
  overallScore: number;
  status: ReadinessStatus;
  dimensions: ReadinessDimensions;
  missingItems: ReadinessMissingItem[];
  nextActions: ReadinessNextAction[];
  appliedCaps: ReadinessAppliedCap[];
  calculatedAt: string;
}
