
import { IInvestorKYCStatus, IInvestorKYCSubmission } from "@/types/investor-kyc";

let mockStatus: IInvestorKYCStatus = {
  workflowStatus: "NOT_STARTED",
  verificationLabel: "NONE",
  explanation: "Hồ sơ của bạn chưa được khởi tạo. Hãy hoàn thiện các bước thiết lập hồ sơ để bắt đầu kết nối với Startup.",
  lastUpdated: new Date().toISOString(),
};

export const GetInvestorKYCStatus = async (): Promise<{ isSuccess: boolean; data: IInvestorKYCStatus }> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ isSuccess: true, data: mockStatus }), 500);
  });
};

export const SubmitInvestorKYC = async (formData: FormData): Promise<{ isSuccess: boolean }> => {
  return new Promise((resolve) => {
    const fullName = formData.get("fullName") as string;
    const category = formData.get("investorCategory") as string;

    mockStatus = {
      ...mockStatus,
      workflowStatus: "PENDING_REVIEW",
      explanation: "Chúc mừng! Hồ sơ onboarding và xác thực của bạn đang được đội ngũ AISEP xem xét. Quá trình này thường mất 1-3 ngày làm việc.",
      submissionSummary: {
        fullName: fullName || "Investor",
        submittedAt: new Date().toISOString(),
        version: (mockStatus.submissionSummary?.version ?? 0) + 1,
        investorCategory: category,
      },
      lastUpdated: new Date().toISOString(),
    };
    
    setTimeout(() => resolve({ isSuccess: true }), 1000);
  });
};

export const SaveInvestorKYCDraft = async (data: Partial<IInvestorKYCSubmission>): Promise<{ isSuccess: boolean }> => {
  return new Promise((resolve) => {
    mockStatus = {
      ...mockStatus,
      workflowStatus: "DRAFT",
      explanation: "Bạn đang có bản nháp Onboarding chưa hoàn tất. Tiếp tục để hoàn thiện hồ sơ của bạn.",
      draftData: {
        ...mockStatus.draftData,
        ...data,
      },
      lastUpdated: new Date().toISOString(),
    };
    setTimeout(() => resolve({ isSuccess: true }), 500);
  });
};

export const ResubmitInvestorKYC = async (formData: FormData): Promise<{ isSuccess: boolean }> => {
  return SubmitInvestorKYC(formData);
};
