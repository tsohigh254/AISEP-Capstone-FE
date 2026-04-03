import api from "@/services/interceptor";
import { IAdvisorKYCStatus, IAdvisorKYCSubmission } from "@/types/advisor-kyc";

export const GetKYCStatus = async (): Promise<IBackendRes<IAdvisorKYCStatus>> => {
  return api.get("/api/advisors/me/kyc/status");
};

export const GetKYCRequirements = async (): Promise<IBackendRes<any>> => {
  // Maintaining a small mock for requirements as it's often static or handled differently
  return {
    success: true, isSuccess: true, statusCode: 200,
    message: "Lấy yêu cầu thành công", error: null,
    data: { requiredDocs: ["CCCD/Passport", "Bằng cấp/Chứng chỉ chuyên môn"] },
  };
};

export const SaveKYCDraft = async (data: Partial<IAdvisorKYCSubmission>): Promise<IBackendRes<null>> => {
  // For now, we can reuse UpdateProfile to save changes as a "draft" 
  // since the backend status will only change when SubmitKYC is called.
  return api.put("/api/advisors/me", data);
};

export const SubmitKYC = async (formData: FormData): Promise<IBackendRes<null>> => {
  // First, potentially update profile data if the wizard has new fields
  // Then trigger the status change
  return api.post("/api/advisors/me/kyc/submit");
};

export const ResubmitKYC = async (formData: FormData): Promise<IBackendRes<null>> => {
  return api.post("/api/advisors/me/kyc/submit");
};

export const GetKYCSubmissionDetail = async (submissionId: string): Promise<IBackendRes<any>> => {
  return api.get("/api/advisors/me/kyc/status");
};

export const GetKYCHistory = async (): Promise<IBackendRes<IAdvisorKYCStatus["history"]>> => {
  const res = await api.get<IAdvisorKYCStatus>("/api/advisors/me/kyc/status");
  return {
    success: true, isSuccess: true, statusCode: 200,
    message: "OK", error: null,
    data: (res as any).data?.history ?? []
  };
};
