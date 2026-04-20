
import { IInvestorKYCStatus } from "@/types/investor-kyc";
import {
  GetInvestorKYCStatus as GetInvestorKYCStatusApi,
  SubmitInvestorKYC as SubmitInvestorKYCApi,
  SaveInvestorKYCDraft as SaveInvestorKYCDraftApi,
  ResubmitInvestorKYC as ResubmitInvestorKYCApi,
} from "./investor-kyc";

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

function normalizeApiStatus(res: any): { isSuccess: boolean; data: IInvestorKYCStatus } {
  const payload = res?.data ?? res;
  if (payload && typeof payload === "object" && payload.isSuccess !== undefined && payload.data !== undefined) {
    return { isSuccess: Boolean(payload.isSuccess), data: payload.data as IInvestorKYCStatus };
  }
  if (payload && typeof payload === "object") {
    // If API returned the status object directly
    if (payload.workflowStatus || payload.verificationLabel) return { isSuccess: true, data: payload as IInvestorKYCStatus };
  }
  return { isSuccess: true, data: mockStatus };
}

export const GetInvestorKYCStatus = async (): Promise<{ isSuccess: boolean; data: IInvestorKYCStatus }> => {
  try {
    const res = await GetInvestorKYCStatusApi();
    return normalizeApiStatus(res);
  } catch (err) {
    return { isSuccess: true, data: mockStatus };
  }
};

export const SubmitInvestorKYC = async (formData: FormData): Promise<{ isSuccess: boolean }> => {
  try {
    const res = await SubmitInvestorKYCApi(formData);
    const payload = (res as any)?.data ?? res;
    if (payload && payload.isSuccess !== undefined) return { isSuccess: Boolean(payload.isSuccess) };

    // If server succeeded but different shape, assume success
    return { isSuccess: true };
  } catch (err) {
    // Fallback: update local mock state to simulate submission
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

    return { isSuccess: true };
  }
};

export const SaveInvestorKYCDraft = async (_data: FormData): Promise<{ isSuccess: boolean }> => {
  try {
    const res = await SaveInvestorKYCDraftApi(_data as any);
    const payload = (res as any)?.data ?? res;
    if (payload && payload.isSuccess !== undefined) return { isSuccess: Boolean(payload.isSuccess) };
    return { isSuccess: true };
  } catch (err) {
    mockStatus = {
      ...mockStatus,
      workflowStatus: "DRAFT",
      explanation: "Bạn đang có bản nháp chưa hoàn tất. Tiếp tục để hoàn thiện hồ sơ của bạn.",
      lastUpdated: new Date().toISOString(),
    };
    return { isSuccess: true };
  }
};

export const ResubmitInvestorKYC = async (formData: FormData): Promise<{ isSuccess: boolean }> => {
  try {
    const res = await ResubmitInvestorKYCApi(formData);
    const payload = (res as any)?.data ?? res;
    if (payload && payload.isSuccess !== undefined) return { isSuccess: Boolean(payload.isSuccess) };
    return { isSuccess: true };
  } catch (err) {
    return SubmitInvestorKYC(formData);
  }
};
