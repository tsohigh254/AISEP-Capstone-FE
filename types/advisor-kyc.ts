
export interface IAdvisorKYCSubmission {
  fullName: string;
  contactEmail: string;
  declarationAccepted: boolean;
  currentRoleTitle?: string;
  currentOrganization?: string;
  primaryExpertise?: string;
  secondaryExpertise?: string[];
  professionalProfileLink?: string;
  basicExpertiseProofFile?: File;
  basicExpertiseProofFileURL?: string;
  bio?: string;
  mentorshipPhilosophy?: string;
  yearsOfExperience?: number;
}

export interface IAdvisorKYCStatus {
  workflowStatus: "NOT_STARTED" | "DRAFT" | "PENDING_REVIEW" | "PENDING_MORE_INFO" | "VERIFIED" | "VERIFICATION_FAILED";
  verificationLabel: "VERIFIED_ADVISOR" | "BASIC_VERIFIED" | "PENDING_MORE_INFO" | "VERIFICATION_FAILED" | "NONE";
  explanation: string;
  lastUpdated: string;

  // ✅ Dữ liệu bản nộp MỚI NHẤT — FE đọc từ đây
  currentSubmission?: Partial<IAdvisorKYCSubmission>;

  // Metadata + evidence files (signed URL)
  submissionSummary?: {
    fullName: string;
    submittedAt: string;
    version: number;
    evidenceFiles?: {
      id?: string;
      fileName?: string;
      url?: string;
      fileType?: string;
      kind?: string;
      uploadedAt?: string;
    }[];
  };

  requiresNewEvidence?: boolean;
  previousSubmission?: Partial<IAdvisorKYCSubmission>;
  draftData?: Partial<IAdvisorKYCSubmission>;
  remarks?: string;
  flaggedFields?: string[];
  history?: {
    action: string;
    date: string;
    status: string;
    remark?: string;
  }[];
}
