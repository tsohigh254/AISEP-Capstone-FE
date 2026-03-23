import { IAdvisorKYCStatus, IAdvisorKYCSubmission } from "@/types/advisor-kyc";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Module-level mock state (simulates server state within session) ───────
// Change initialMockState to test different UI flows:
// "NOT_STARTED" | "DRAFT" | "PENDING_REVIEW" | "PENDING_MORE_INFO" | "VERIFIED" | "VERIFICATION_FAILED"
const INITIAL_STATE: IAdvisorKYCStatus["workflowStatus"] = "NOT_STARTED";

let mockState: IAdvisorKYCStatus = buildMockState(INITIAL_STATE);
let mockDraft: Partial<IAdvisorKYCSubmission> = {};

function buildMockState(status: IAdvisorKYCStatus["workflowStatus"]): IAdvisorKYCStatus {
  const base = {
    lastUpdated: new Date().toISOString(),
    history: [] as IAdvisorKYCStatus["history"],
  };

  switch (status) {
    case "NOT_STARTED":
      return {
        ...base,
        workflowStatus: "NOT_STARTED",
        verificationLabel: "NONE",
        explanation: "Chào mừng! Hãy xác thực tài khoản để tăng uy tín của bạn trong hệ sinh thái AISEP.",
      };

    case "DRAFT":
      return {
        ...base,
        workflowStatus: "DRAFT",
        verificationLabel: "NONE",
        explanation: "Bạn đang có bản nháp chưa gửi. Tiếp tục để hoàn tất hồ sơ KYC.",
        submissionSummary: { fullName: "", submittedAt: new Date().toISOString(), version: 0 },
        draftData: {
          fullName: "Nguyễn Hữu Huy",
          contactEmail: "huynlh04@gmail.com",
          declarationAccepted: true,
        },
      };

    case "PENDING_REVIEW":
      return {
        ...base,
        workflowStatus: "PENDING_REVIEW",
        verificationLabel: "NONE",
        explanation: "Hồ sơ của bạn đang được đội ngũ AISEP xem xét. Thường mất 1–3 ngày làm việc.",
        submissionSummary: {
          fullName: "Nguyễn Hữu Huy",
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          version: 1,
        },
        history: [
          { action: "Gửi hồ sơ lần đầu", date: "20/03/2026 09:14", status: "PENDING_REVIEW" },
        ],
      };

    case "PENDING_MORE_INFO":
      return {
        ...base,
        workflowStatus: "PENDING_MORE_INFO",
        verificationLabel: "PENDING_MORE_INFO",
        explanation: "Hồ sơ cần bổ sung thêm thông tin. Vui lòng đọc ghi chú từ reviewer và cập nhật lại.",
        remarks: "Vị trí công việc chưa đủ cụ thể. Link LinkedIn không trỏ đúng đến hồ sơ của bạn. Vui lòng kiểm tra lại.",
        flaggedFields: ["currentRoleTitle", "professionalProfileLink"],
        submissionSummary: {
          fullName: "Nguyễn Hữu Huy",
          submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          version: 1,
        },
        previousSubmission: {
          fullName: "Nguyễn Hữu Huy",
          contactEmail: "huynlh04@gmail.com",
          declarationAccepted: true,
          currentRoleTitle: "Product",
          currentOrganization: "TechGlobal Corp",
          primaryExpertise: "PRODUCT_STRATEGY",
          secondaryExpertise: ["GO_TO_MARKET"],
          professionalProfileLink: "https://linkedin.com/huynlh",
        },
        history: [
          { action: "Gửi hồ sơ lần đầu", date: "18/03/2026 10:00", status: "PENDING_REVIEW" },
          { action: "Reviewer yêu cầu bổ sung", date: "20/03/2026 14:30", status: "PENDING_MORE_INFO", remark: "Cần ghi rõ vị trí và link LinkedIn hợp lệ" },
        ],
      };

    case "VERIFIED":
      return {
        ...base,
        workflowStatus: "VERIFIED",
        verificationLabel: "VERIFIED_ADVISOR",
        explanation: "Chúc mừng! Hồ sơ của bạn đã được xác thực đầy đủ. Huy hiệu VERIFIED ADVISOR đã được kích hoạt trên profile.",
        submissionSummary: {
          fullName: "Nguyễn Hữu Huy",
          submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          version: 2,
        },
        previousSubmission: {
          fullName: "Nguyễn Hữu Huy",
          contactEmail: "huynlh04@gmail.com",
          declarationAccepted: true,
          currentRoleTitle: "Senior Product Manager",
          currentOrganization: "TechGlobal Corp",
          primaryExpertise: "PRODUCT_STRATEGY",
          secondaryExpertise: ["GO_TO_MARKET", "FUNDRAISING"],
          professionalProfileLink: "https://linkedin.com/in/huynlh04",
        },
        history: [
          { action: "Gửi hồ sơ lần đầu", date: "14/03/2026 09:00", status: "PENDING_REVIEW" },
          { action: "Yêu cầu bổ sung thông tin", date: "16/03/2026 11:00", status: "PENDING_MORE_INFO", remark: "Bổ sung link LinkedIn" },
          { action: "Gửi lại hồ sơ", date: "17/03/2026 14:00", status: "PENDING_REVIEW" },
          { action: "Xác thực thành công", date: "19/03/2026 09:30", status: "VERIFIED" },
        ],
      };

    case "VERIFICATION_FAILED":
      return {
        ...base,
        workflowStatus: "VERIFICATION_FAILED",
        verificationLabel: "VERIFICATION_FAILED",
        explanation: "Hồ sơ không đáp ứng tiêu chuẩn xác thực. Vui lòng xem lại ghi chú và gửi lại.",
        remarks: "Thông tin chuyên môn không khớp với hồ sơ LinkedIn. Bằng chứng năng lực được tải lên không liên quan đến lĩnh vực khai báo.",
        flaggedFields: ["primaryExpertise", "professionalProfileLink", "basicExpertiseProofFile"],
        submissionSummary: {
          fullName: "Nguyễn Hữu Huy",
          submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          version: 1,
        },
        previousSubmission: {
          fullName: "Nguyễn Hữu Huy",
          contactEmail: "huynlh04@gmail.com",
          declarationAccepted: true,
          currentRoleTitle: "Business Analyst",
          currentOrganization: "FinCorp",
          primaryExpertise: "FINANCE",
          secondaryExpertise: [],
          professionalProfileLink: "https://linkedin.com/company/fincorp",
        },
        history: [
          { action: "Gửi hồ sơ lần đầu", date: "17/03/2026 08:00", status: "PENDING_REVIEW" },
          { action: "Xác thực không đạt", date: "19/03/2026 16:00", status: "VERIFICATION_FAILED", remark: "Chuyên môn không khớp với bằng chứng" },
        ],
      };
  }
}

export const GetKYCStatus = async (): Promise<IBackendRes<IAdvisorKYCStatus>> => {
  await sleep(800);
  return {
    success: true, isSuccess: true, statusCode: 200,
    message: "Lấy trạng thái thành công", error: null,
    data: mockState,
  };
};

export const GetKYCRequirements = async (): Promise<IBackendRes<any>> => {
  await sleep(400);
  return {
    success: true, isSuccess: true, statusCode: 200,
    message: "Lấy yêu cầu thành công", error: null,
    data: { requiredDocs: ["CCCD/Passport", "Bằng cấp/Chứng chỉ chuyên môn"] },
  };
};

export const SaveKYCDraft = async (data: Partial<IAdvisorKYCSubmission>): Promise<IBackendRes<null>> => {
  await sleep(600);
  mockDraft = data;
  if (mockState.workflowStatus === "NOT_STARTED") {
    mockState = buildMockState("DRAFT");
    mockState.draftData = data;
  } else if (mockState.workflowStatus === "DRAFT") {
    mockState.draftData = data;
  }
  return { success: true, isSuccess: true, statusCode: 200, message: "Lưu bản nháp thành công", error: null };
};

export const SubmitKYC = async (formData: FormData): Promise<IBackendRes<null>> => {
  await sleep(2000);
  mockState = buildMockState("PENDING_REVIEW");
  return { success: true, isSuccess: true, statusCode: 200, message: "Gửi hồ sơ thành công", error: null };
};

export const ResubmitKYC = async (formData: FormData): Promise<IBackendRes<null>> => {
  await sleep(2000);
  mockState = buildMockState("PENDING_REVIEW");
  return { success: true, isSuccess: true, statusCode: 200, message: "Gửi lại hồ sơ thành công", error: null };
};

export const GetKYCSubmissionDetail = async (submissionId: string): Promise<IBackendRes<any>> => {
  await sleep(500);
  return { success: true, isSuccess: true, statusCode: 200, message: "OK", error: null, data: mockState };
};

export const GetKYCHistory = async (): Promise<IBackendRes<IAdvisorKYCStatus["history"]>> => {
  await sleep(400);
  return { success: true, isSuccess: true, statusCode: 200, message: "OK", error: null, data: mockState.history ?? [] };
};
