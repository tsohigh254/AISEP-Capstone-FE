
// Type dùng riêng cho luồng onboarding tạo profile — khác với KYC submission
export interface IInvestorOnboardData {
  investorCategory?: "INSTITUTIONAL" | "INDIVIDUAL_ANGEL";
  fullName?: string;
  contactEmail?: string;
  displayName?: string;
  organizationName?: string;
  legalOrganizationName?: string;
  currentRoleTitle?: string;
  location?: string;
  website?: string;
  linkedInURL?: string;
  avatar?: string;
  avatarFile?: File;
  taxIdOrBusinessCode?: string;
  submitterRole?: string;
  shortThesisSummary?: string;
  investmentThesis?: string;
  preferredIndustryIds?: number[];
  preferredStageIds?: number[];
  /** Deprecated display-only arrays for older preview/review components. */
  preferredIndustries?: string[];
  preferredStages?: string[];
  preferredGeographies?: string[];
  preferredMarketScopes?: string[];
  supportOffered?: string[];
  acceptingConnectionsStatus?: "OPEN" | "SELECTIVE" | "CLOSED";
  preferredProductMaturity?: string[];
  preferredValidationLevel?: string[];
  preferredAIScoreRange?: string;
  aiScoreImportance?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  preferredStrengths?: string[];
  declarationAccepted?: boolean;
  idOrBusinessLicenseFile?: File;
  investmentProofFile?: File;
}

export interface IInvestorKYCSubmission {
  investorCategory: "INSTITUTIONAL" | "INDIVIDUAL_ANGEL";

  fullName: string;
  contactEmail: string;
  declarationAccepted: boolean;

  organizationName?: string;
  currentRoleTitle?: string;
  location?: string;
  website?: string;
  linkedInURL?: string;
  taxIdOrBusinessCode?: string;
  submitterRole?: "PARTNER" | "INVESTMENT_MANAGER" | "ANALYST" | "LEGAL_REPRESENTATIVE" | "AUTHORIZED_PERSON";

  // Files (form only — not persisted in status)
  idOrBusinessLicenseFile?: File;
  investmentProofFile?: File;
}

export interface IInvestorEvidenceFile {
  id: number;
  url: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number;
  uploadedAt: string;
  kind: "ID_PROOF" | "INVESTMENT_PROOF" | "OTHER";
}

export interface IInvestorKYCStatus {
  workflowStatus:
    | "NOT_STARTED"
    | "DRAFT"
    | "PENDING_REVIEW"
    | "PENDING_MORE_INFO"
    | "VERIFIED"
    | "VERIFICATION_FAILED";

  verificationLabel:
    | "NONE"
    | "BASIC_VERIFIED"
    | "VERIFIED_INVESTOR_ENTITY"
    | "VERIFIED_ANGEL_INVESTOR"
    | "PENDING_MORE_INFO"
    | "VERIFICATION_FAILED";

  explanation: string;
  remarks: string | null;
  requiresNewEvidence: boolean;
  lastUpdated: string;

  submissionId: number | null;
  version: number | null;
  submittedAt: string | null;
  updatedAt: string | null;

  submissionSummary: {
    fullName: string | null;
    investorCategory: string | null;
    contactEmail: string | null;
    organizationName: string | null;
    currentRoleTitle: string | null;
    location: string | null;
    website: string | null;
    linkedInURL: string | null;
    submitterRole: string | null;
    taxIdOrBusinessCode: string | null;
    submittedAt: string | null;
    version: number;
    evidenceFiles: IInvestorEvidenceFile[];
  } | null;

  flaggedFields?: string[];
  history?: {
    submissionId: number;
    version: number;
    workflowStatus: string;
    resultLabel: string;
    submittedAt: string;
    reviewedAt: string | null;
    remarks: string | null;
    requiresNewEvidence: boolean;
  }[];
}
