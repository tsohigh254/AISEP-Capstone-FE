
import axios from "../interceptor";
import { IInvestorKYCStatus, IInvestorKYCSubmission } from "@/types/investor-kyc";

export const GetInvestorKYCStatus = async (): Promise<IBackendRes<IInvestorKYCStatus>> => {
  return await axios.get<IBackendRes<IInvestorKYCStatus>>("/api/investors/me/kyc");
};

export const SubmitInvestorKYC = async (formData: FormData): Promise<IBackendRes<IInvestorKYCStatus>> => {
  return await axios.post<IBackendRes<IInvestorKYCStatus>>("/api/investors/me/kyc/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const SaveInvestorKYCDraft = async (data: Partial<IInvestorKYCSubmission>): Promise<IBackendRes<IInvestorKYCStatus>> => {
  const form = new FormData();
  if (data.investorCategory) form.append("investorCategory", data.investorCategory);
  if (data.fullName) form.append("fullName", data.fullName);
  if (data.contactEmail) form.append("contactEmail", data.contactEmail);
  if (data.organizationName) form.append("organizationName", data.organizationName);
  if (data.currentRoleTitle) form.append("currentRoleTitle", data.currentRoleTitle);
  if (data.location) form.append("location", data.location);
  if (data.website) form.append("website", data.website);
  if (data.linkedInURL) form.append("linkedInURL", data.linkedInURL);
  if (data.submitterRole) form.append("submitterRole", data.submitterRole);
  if (data.taxIdOrBusinessCode) form.append("taxIdOrBusinessCode", data.taxIdOrBusinessCode);

  return await axios.post<IBackendRes<IInvestorKYCStatus>>("/api/investors/me/kyc/draft", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const ResubmitInvestorKYC = async (formData: FormData): Promise<IBackendRes<IInvestorKYCStatus>> => {
  return SubmitInvestorKYC(formData);
};
