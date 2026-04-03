
import axios from "../interceptor";
import { IInvestorKYCStatus, IInvestorKYCSubmission } from "@/types/investor-kyc";

export const GetInvestorKYCStatus = async (): Promise<IBackendRes<IInvestorKYCStatus>> => {
  return await axios.get<IBackendRes<IInvestorKYCStatus>>("/api/investors/me/kyc");
};

export const SubmitInvestorKYC = async (formData: FormData): Promise<IBackendRes<IInvestorKYCStatus>> => {
  return await axios.post<IBackendRes<IInvestorKYCStatus>>("/api/investors/me/kyc/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const SaveInvestorKYCDraft = async (data: Partial<IInvestorKYCSubmission>): Promise<IBackendRes<IInvestorKYCStatus>> => {
  return await axios.post<IBackendRes<IInvestorKYCStatus>>("/api/investors/me/kyc/draft", data);
};

export const ResubmitInvestorKYC = async (formData: FormData): Promise<IBackendRes<IInvestorKYCStatus>> => {
  return SubmitInvestorKYC(formData);
};
