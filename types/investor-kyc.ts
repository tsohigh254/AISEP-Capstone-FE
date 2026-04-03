
export interface IInvestorKYCSubmission {
  // Step 1: Investor Type
  investorCategory: "INSTITUTIONAL" | "INDIVIDUAL_ANGEL";
  investorType?: string;
  
  // Step 2: Public Profile
  displayName?: string; // Tên hiển thị (Quick Onboard)
  fullName: string;
  contactEmail: string;
  organizationName?: string;
  currentRoleTitle?: string;
  location?: string;
  website?: string;
  avatar?: string;
  shortThesisSummary?: string;
  preferredIndustries?: string[];
  preferredStages?: string[];
  preferredGeographies?: string[];
  preferredMarketScopes?: string[];
  supportOffered?: string[];
  acceptingConnectionsStatus?: "OPEN" | "SELECTIVE" | "CLOSED";

  // Step 3: Preferences & Matching
  preferredProductMaturity?: string[];
  preferredValidationLevel?: string[];
  preferredAIScoreRange?: string; // e.g. "81-100"
  aiScoreImportance?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  preferredStrengths?: string[];

  // Step 4: Verification / KYC
  // Institutional specific
  legalOrganizationName?: string;
  taxIdOrBusinessCode?: string;
  professionalProfileLink?: string; // Repeat or specific
  submitterRole?: "PARTNER" | "INVESTMENT_MANAGER" | "ANALYST" | "LEGAL_REPRESENTATIVE" | "AUTHORIZED_PERSON";
  
  // Files
  idOrBusinessLicenseFile?: File;
  investmentProofFile?: File;
  
  declarationAccepted: boolean;
}

export interface IInvestorKYCStatus {
  workflowStatus: "NOT_STARTED" | "DRAFT" | "PENDING_REVIEW" | "PENDING_MORE_INFO" | "VERIFIED" | "VERIFICATION_FAILED";
  verificationLabel: "VERIFIED_INVESTOR_ENTITY" | "VERIFIED_ANGEL_INVESTOR" | "BASIC_VERIFIED" | "NONE";
  explanation: string;
  lastUpdated: string;
  submissionSummary?: {
    fullName: string;
    submittedAt: string;
    version: number;
    investorCategory: string;
  };
  previousSubmission?: Partial<IInvestorKYCSubmission>;
  draftData?: Partial<IInvestorKYCSubmission>;
  submittedData?: {
    investorCategory: string;
    fullName: string;
    contactEmail: string;
    organizationName?: string;
    currentRoleTitle?: string;
    location?: string;
    website?: string;
    linkedInURL?: string;
    submitterRole?: string;
    taxIdOrBusinessCode?: string;
  };
  remarks?: string;
  flaggedFields?: string[];
  history?: {
    action: string;
    date: string;
    status: string;
    remark?: string;
  }[];
}
