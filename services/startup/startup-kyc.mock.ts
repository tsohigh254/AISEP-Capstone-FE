/**
 * Mock Service for Startup KYC / Verification
 * Based on AISEP Startup KYC Spec v1.0
 */

export type StartupVerificationType = "WITH_LEGAL_ENTITY" | "WITHOUT_LEGAL_ENTITY";

export type KycWorkflowStatus = 
  | "NOT_SUBMITTED"
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "PENDING_MORE_INFO"
  | "APPROVED"
  | "FAILED";

export type KycResultLabel = 
  | "VERIFIED_COMPANY"
  | "VERIFIED_FOUNDING_TEAM"
  | "BASIC_VERIFIED"
  | "PENDING_MORE_INFO"
  | "VERIFICATION_FAILED"
  | null;

export interface RequestedInfoItem {
  id: string;
  fieldKey?: string;
  type: "FIELD" | "FILE" | "LINK" | "GENERAL";
  title: string;
  description: string;
  requiredAction: string;
}

export interface KycEvidenceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  kind: "BUSINESS_REGISTRATION_CERTIFICATE" | "BASIC_ACTIVITY_PROOF";
}

export interface StartupKycSubmissionSummary {
  startupVerificationType: StartupVerificationType;
  legalFullName?: string;
  enterpriseCode?: string;
  projectName?: string;
  representativeFullName?: string;
  representativeRole?: string;
  workEmail?: string;
  contactEmail?: string;
  publicLink?: string;
  evidenceFiles: KycEvidenceFile[];
}

export interface StartupKycCase {
  id: string;
  startupId: string;
  startupVerificationType: StartupVerificationType;
  workflowStatus: KycWorkflowStatus;
  resultLabel: KycResultLabel;
  submittedAt?: string;
  updatedAt?: string;
  latestReviewCycle: number;
  isResubmittable: boolean;
  explanation?: string;
  requestedAdditionalItems?: RequestedInfoItem[];
  submissionSummary?: StartupKycSubmissionSummary;
}

// --- MOCK DATA GENERATOR ---

export const getMockKycStatus = async (status: KycWorkflowStatus = "NOT_SUBMITTED"): Promise<StartupKycCase> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const baseCase: StartupKycCase = {
    id: "kyc-998877",
    startupId: "st-12345",
    startupVerificationType: "WITH_LEGAL_ENTITY",
    workflowStatus: status,
    resultLabel: null,
    latestReviewCycle: 1,
    isResubmittable: false,
  };

  if (status === "NOT_SUBMITTED") return baseCase;

  if (status === "UNDER_REVIEW") {
    return {
      ...baseCase,
      submittedAt: "2024-03-20T10:00:00Z",
      resultLabel: "BASIC_VERIFIED",
    };
  }

  if (status === "APPROVED") {
    return {
      ...baseCase,
      workflowStatus: "APPROVED",
      resultLabel: "VERIFIED_COMPANY",
      submittedAt: "2024-03-15T09:00:00Z",
      updatedAt: "2024-03-18T14:30:00Z",
    };
  }

  if (status === "PENDING_MORE_INFO") {
    return {
      ...baseCase,
      workflowStatus: "PENDING_MORE_INFO",
      resultLabel: "PENDING_MORE_INFO",
      isResubmittable: true,
      explanation: "Hình ảnh Giấy phép kinh doanh bị mờ, không nhìn rõ mã số thuế.",
      requestedAdditionalItems: [
        {
          id: "req-1",
          type: "FILE",
          fieldKey: "businessRegistration",
          title: "Giấy phép kinh doanh",
          description: "Bản chụp hiện tại bị mờ góc dưới bên trái.",
          requiredAction: "Vui lòng chụp lại bản gốc rõ nét và tải lên thay thế."
        }
      ]
    };
  }

  return baseCase;
};

export const submitKyc = async (data: any): Promise<{ success: boolean; message: string }> => {
  console.log("Submitting KYC Data:", data);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: "Hồ sơ KYC đã được gửi thành công" };
};
