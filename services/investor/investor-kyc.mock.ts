
import { IInvestorKYCStatus } from "@/types/investor-kyc";

let mockStatus: IInvestorKYCStatus = {
  workflowStatus: "NOT_STARTED",
  verificationLabel: "NONE",
  explanation: "Hồ sơ của bạn chưa được khởi tạo. Hãy hoàn thiện các bước thiết lập hồ sơ để bắt đầu kết nối với Startup.",
  remarks: null,
  requiresNewEvidence: false,
  lastUpdated: new Date().toISOString(),
  submissionId: null,
  version: null,
  submittedAt: null,
  updatedAt: null,
  submissionSummary: null,
};

export const GetInvestorKYCStatus = async (): Promise<{ isSuccess: boolean; data: IInvestorKYCStatus }> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ isSuccess: true, data: mockStatus }), 500);
  });
};

export const SubmitInvestorKYC = async (formData: FormData): Promise<{ isSuccess: boolean }> => {
  return new Promise((resolve) => {
    const fullName = formData.get("fullName") as string;
    const category = (formData.get("investorCategory")) as string;
    const newVersion = (mockStatus.submissionSummary?.version ?? 0) + 1;

    mockStatus = {
      ...mockStatus,
      workflowStatus: "PENDING_REVIEW",
      explanation: "Hồ sơ của bạn đang được đội ngũ AISEP xem xét. Quá trình này thường mất 1–3 ngày làm việc.",
      submissionId: 1,
      version: newVersion,
      submittedAt: new Date().toISOString(),
      submissionSummary: {
        fullName: fullName || null,
        investorCategory: category || null,
        contactEmail: (formData.get("contactEmail") as string) || null,
        organizationName: (formData.get("organizationName") as string) || null,
        currentRoleTitle: (formData.get("currentRoleTitle") as string) || null,
        location: (formData.get("location") as string) || null,
        website: (formData.get("website") as string) || null,
        linkedInURL: (formData.get("linkedInURL") as string) || null,
        submitterRole: (formData.get("submitterRole") as string) || null,
        taxIdOrBusinessCode: (formData.get("taxIdOrBusinessCode") as string) || null,
        submittedAt: new Date().toISOString(),
        version: newVersion,
        evidenceFiles: [],
      },
      lastUpdated: new Date().toISOString(),
    };

    setTimeout(() => resolve({ isSuccess: true }), 1000);
  });
};

export const SaveInvestorKYCDraft = async (_data: FormData): Promise<{ isSuccess: boolean }> => {
  return new Promise((resolve) => {
    mockStatus = {
      ...mockStatus,
      workflowStatus: "DRAFT",
      explanation: "Bạn đang có bản nháp chưa hoàn tất. Tiếp tục để hoàn thiện hồ sơ của bạn.",
      lastUpdated: new Date().toISOString(),
    };
    setTimeout(() => resolve({ isSuccess: true }), 500);
  });
};

export const ResubmitInvestorKYC = async (formData: FormData): Promise<{ isSuccess: boolean }> => {
  return SubmitInvestorKYC(formData);
};
