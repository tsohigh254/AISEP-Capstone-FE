import { 
  ShieldCheck, 
  Building2, 
  User, 
  UserCheck, 
  GraduationCap,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

// --- Types ---

export type KYCSubtype = 
  | "STARTUP_ENTITY" 
  | "STARTUP_NO_ENTITY" 
  | "INSTITUTIONAL_INVESTOR" 
  | "INDIVIDUAL_INVESTOR" 
  | "ADVISOR";

export type AssessmentValue = 
  | "EXACT_MATCH" | "PARTIAL_MATCH" | "CANNOT_VERIFY" | "MISMATCH"
  | "VALID_MATCH" | "FOUND_BUT_DIFFERS" | "NOT_FOUND" | "INVALID_FORMAT"
  | "CLEAR_AND_MATCH" | "UNCLEAR_BUT_PLAUSIBLE" | "INCOMPLETE" | "MISMATCH_OR_SUSPICIOUS"
  | "STRONG_LINK" | "PLAUSIBLE_LINK" | "SUSPICIOUS"
  | "ROLE_SUPPORTED" | "ROLE_PLAUSIBLE" | "ROLE_UNSUPPORTED" | "ROLE_INCONSISTENT"
  | "COMPANY_DOMAIN_MATCH" | "PERSONAL_BUT_PLAUSIBLE" | "UNRELATED" | "INVALID"
  | "ACTIVE_AND_MATCH" | "ACTIVE_BUT_WEAK" | "INACTIVE_OR_BROKEN" | "NOT_RELATED"
  | "ACCEPTED" | "MISSING"
  | "CLEAR_AND_RELEVANT" | "BASIC_BUT_WEAK" | "UNCLEAR" | "IRRELEVANT_OR_SUSPICIOUS"
  | "ALIGNED"
  | "CONSISTENT_PUBLICLY"
  | "CLEAR_MATCH" | "NOT_ENOUGH_INFO";

export interface KYCField {
  id: string;
  label: string;
  value: string;
  type: "text" | "link" | "file";
  options: AssessmentValue[];
}

export interface KYCConfig {
  label: string;
  icon: any;
  fields: KYCField[];
}

// --- Score Mapping ---

export const SCORE_MAP: Record<AssessmentValue, number> = {
  // Nhóm tốt = 2 điểm
  EXACT_MATCH: 2, VALID_MATCH: 2, CLEAR_AND_MATCH: 2, STRONG_LINK: 2,
  ROLE_SUPPORTED: 2, COMPANY_DOMAIN_MATCH: 2, ACTIVE_AND_MATCH: 2,
  CONSISTENT_PUBLICLY: 2, CLEAR_AND_RELEVANT: 2, ACCEPTED: 2,
  CLEAR_MATCH: 2, ALIGNED: 2,

  // Nhóm chấp nhận được = 1 điểm
  PARTIAL_MATCH: 1, FOUND_BUT_DIFFERS: 1, UNCLEAR_BUT_PLAUSIBLE: 1,
  PLAUSIBLE_LINK: 1, ROLE_PLAUSIBLE: 1, PERSONAL_BUT_PLAUSIBLE: 1,
  ACTIVE_BUT_WEAK: 1, BASIC_BUT_WEAK: 1,

  // Nhóm chưa đủ cơ sở = 0 điểm
  CANNOT_VERIFY: 0, INCOMPLETE: 0, ROLE_UNSUPPORTED: 0,
  INACTIVE_OR_BROKEN: 0, UNCLEAR: 0, MISSING: 0, NOT_ENOUGH_INFO: 0,

  // Nhóm rủi ro cao = -2 điểm
  MISMATCH: -2, NOT_FOUND: -2, INVALID_FORMAT: -2,
  MISMATCH_OR_SUSPICIOUS: -2, SUSPICIOUS: -2, ROLE_INCONSISTENT: -2,
  UNRELATED: -2, INVALID: -2, NOT_RELATED: -2, IRRELEVANT_OR_SUSPICIOUS: -2,
};

// --- Hard Fail Values ---
export const HARD_FAIL_VALUES: AssessmentValue[] = [
  "NOT_FOUND", "INVALID_FORMAT", "MISMATCH_OR_SUSPICIOUS",
  "MISMATCH", "SUSPICIOUS", "NOT_RELATED", "IRRELEVANT_OR_SUSPICIOUS"
];

// --- Subtype Configurations ---

export const KYC_SUBTYPE_CONFIGS: Record<KYCSubtype, KYCConfig> = {
  STARTUP_ENTITY: {
    label: "Startup có pháp nhân",
    icon: Building2,
    fields: [
      { id: "legalName", label: "Tên pháp lý đầy đủ", value: "", type: "text", options: ["EXACT_MATCH", "PARTIAL_MATCH", "CANNOT_VERIFY", "MISMATCH"] },
      { id: "taxId", label: "Mã số doanh nghiệp", value: "", type: "text", options: ["VALID_MATCH", "FOUND_BUT_DIFFERS", "NOT_FOUND", "INVALID_FORMAT"] },
      { id: "licenseFile", label: "Giấy chứng nhận ĐKDN", value: "", type: "file", options: ["CLEAR_AND_MATCH", "UNCLEAR_BUT_PLAUSIBLE", "INCOMPLETE", "MISMATCH_OR_SUSPICIOUS"] },
      { id: "submitterName", label: "Họ tên người nộp", value: "", type: "text", options: ["STRONG_LINK", "PLAUSIBLE_LINK", "CANNOT_VERIFY", "SUSPICIOUS"] },
      { id: "submitterRole", label: "Vai trò người nộp", value: "", type: "text", options: ["ROLE_SUPPORTED", "ROLE_PLAUSIBLE", "ROLE_UNSUPPORTED", "ROLE_INCONSISTENT"] },
      { id: "workEmail", label: "Email công việc", value: "", type: "text", options: ["COMPANY_DOMAIN_MATCH", "PERSONAL_BUT_PLAUSIBLE", "UNRELATED", "INVALID"] },
      { id: "officialLink", label: "Website/Product link", value: "", type: "link", options: ["ACTIVE_AND_MATCH", "ACTIVE_BUT_WEAK", "INACTIVE_OR_BROKEN", "NOT_RELATED"] },
      { id: "declaration", label: "Cam kết trung thực", value: "Đã xác nhận", type: "text", options: ["ACCEPTED", "MISSING"] },
    ]
  },
  STARTUP_NO_ENTITY: {
    label: "Startup chưa có pháp nhân",
    icon: Zap,
    fields: [
      { id: "projectName", label: "Tên dự án", value: "", type: "text", options: ["CONSISTENT_PUBLICLY", "PARTIAL_MATCH", "CANNOT_VERIFY", "MISMATCH"] },
      { id: "repName", label: "Họ tên người đại diện", value: "", type: "text", options: ["STRONG_LINK", "PLAUSIBLE_LINK", "CANNOT_VERIFY", "SUSPICIOUS"] },
      { id: "repRole", label: "Vai trò", value: "", type: "text", options: ["ROLE_SUPPORTED", "ROLE_PLAUSIBLE", "ROLE_UNSUPPORTED", "ROLE_INCONSISTENT"] },
      { id: "contactEmail", label: "Email liên hệ", value: "", type: "text", options: ["ALIGNED", "PERSONAL_BUT_PLAUSIBLE", "UNRELATED", "INVALID"] },
      { id: "publicLink", label: "Link công khai", value: "", type: "link", options: ["ACTIVE_AND_MATCH", "ACTIVE_BUT_WEAK", "INACTIVE_OR_BROKEN", "NOT_RELATED"] },
      { id: "activityProof", label: "Chứng minh hoạt động", value: "", type: "file", options: ["CLEAR_AND_RELEVANT", "BASIC_BUT_WEAK", "UNCLEAR", "IRRELEVANT_OR_SUSPICIOUS"] },
      { id: "declaration", label: "Cam kết trung thực", value: "Đã xác nhận", type: "text", options: ["ACCEPTED", "MISSING"] },
    ]
  },
  INSTITUTIONAL_INVESTOR: {
    label: "Nhà đầu tư tổ chức",
    icon: Building2,
    fields: [
      { id: "orgLegalName", label: "Tên pháp lý tổ chức", value: "", type: "text", options: ["EXACT_MATCH", "PARTIAL_MATCH", "CANNOT_VERIFY", "MISMATCH"] },
      { id: "orgTaxId", label: "Mã số doanh nghiệp", value: "", type: "text", options: ["VALID_MATCH", "FOUND_BUT_DIFFERS", "NOT_FOUND", "INVALID_FORMAT"] },
      { id: "orgProofFile", label: "Chứng minh tổ chức", value: "", type: "file", options: ["CLEAR_AND_MATCH", "UNCLEAR_BUT_PLAUSIBLE", "INCOMPLETE", "MISMATCH_OR_SUSPICIOUS"] },
      { id: "submitterName", label: "Họ tên người nộp", value: "", type: "text", options: ["STRONG_LINK", "PLAUSIBLE_LINK", "CANNOT_VERIFY", "SUSPICIOUS"] },
      { id: "submitterRole", label: "Vai trò người nộp", value: "", type: "text", options: ["ROLE_SUPPORTED", "ROLE_PLAUSIBLE", "ROLE_UNSUPPORTED", "ROLE_INCONSISTENT"] },
      { id: "workEmail", label: "Email công việc", value: "", type: "text", options: ["COMPANY_DOMAIN_MATCH", "PERSONAL_BUT_PLAUSIBLE", "UNRELATED", "INVALID"] },
      { id: "officialLink", label: "Website/Fund page", value: "", type: "link", options: ["ACTIVE_AND_MATCH", "ACTIVE_BUT_WEAK", "INACTIVE_OR_BROKEN", "NOT_RELATED"] },
      { id: "declaration", label: "Cam kết trung thực", value: "Đã xác nhận", type: "text", options: ["ACCEPTED", "MISSING"] },
    ]
  },
  INDIVIDUAL_INVESTOR: {
    label: "Nhà đầu tư cá nhân",
    icon: User,
    fields: [
      { id: "investorName", label: "Họ tên đầy đủ", value: "", type: "text", options: ["STRONG_LINK", "PLAUSIBLE_LINK", "CANNOT_VERIFY", "SUSPICIOUS"] },
      { id: "title", label: "Nghề nghiệp / Vị trí công việc", value: "", type: "text", options: ["CLEAR_AND_RELEVANT", "BASIC_BUT_WEAK", "UNCLEAR", "IRRELEVANT_OR_SUSPICIOUS"] },
      { id: "location", label: "Tỉnh / Thành phố hoạt động", value: "", type: "text", options: ["CLEAR_AND_RELEVANT", "BASIC_BUT_WEAK", "UNCLEAR", "IRRELEVANT_OR_SUSPICIOUS"] },
      { id: "taxIdOrBusinessCode", label: "Căn cước công dân / MST cá nhân", value: "", type: "text", options: ["VALID_MATCH", "FOUND_BUT_DIFFERS", "NOT_FOUND", "INVALID_FORMAT"] },
      { id: "email", label: "Email liên hệ", value: "", type: "text", options: ["ALIGNED", "PERSONAL_BUT_PLAUSIBLE", "UNRELATED", "INVALID"] },
      { id: "linkedin", label: "LinkedIn cá nhân", value: "", type: "link", options: ["ACTIVE_AND_MATCH", "ACTIVE_BUT_WEAK", "INACTIVE_OR_BROKEN", "NOT_RELATED"] },
      { id: "website", label: "Website / Portfolio cá nhân", value: "", type: "link", options: ["ACTIVE_AND_MATCH", "ACTIVE_BUT_WEAK", "INACTIVE_OR_BROKEN", "NOT_RELATED"] },
      { id: "proofFile", label: "Bằng chứng năng lực đầu tư", value: "", type: "file", options: ["CLEAR_AND_RELEVANT", "BASIC_BUT_WEAK", "UNCLEAR", "IRRELEVANT_OR_SUSPICIOUS"] },
      { id: "declaration", label: "Cam kết trung thực", value: "Đã xác nhận", type: "text", options: ["ACCEPTED", "MISSING"] },
    ]
  },
  ADVISOR: {
    label: "Cố vấn chuyên gia",
    icon: GraduationCap,
    fields: [
      { id: "advisorName", label: "Họ tên đầy đủ", value: "", type: "text", options: ["STRONG_LINK", "PLAUSIBLE_LINK", "CANNOT_VERIFY", "SUSPICIOUS"] },
      { id: "title", label: "Chức danh", value: "", type: "text", options: ["CLEAR_AND_RELEVANT", "BASIC_BUT_WEAK", "UNCLEAR", "IRRELEVANT_OR_SUSPICIOUS"] },
      { id: "org", label: "Tổ chức hiện tại", value: "", type: "text", options: ["ACTIVE_AND_MATCH", "PLAUSIBLE_LINK", "CANNOT_VERIFY", "NOT_RELATED"] },
      { id: "primaryExpertise", label: "Chuyên môn chính", value: "", type: "text", options: ["CLEAR_MATCH", "PARTIAL_MATCH", "UNCLEAR", "MISMATCH"] },
      { id: "secondaryExpertise", label: "Chuyên môn phụ", value: "", type: "text", options: ["CLEAR_MATCH", "PARTIAL_MATCH", "NOT_ENOUGH_INFO", "MISMATCH"] },
      { id: "email", label: "Email liên hệ", value: "", type: "text", options: ["ALIGNED", "PERSONAL_BUT_PLAUSIBLE", "UNRELATED", "INVALID"] },
      { id: "linkedin", label: "LinkedIn profile", value: "", type: "link", options: ["ACTIVE_AND_MATCH", "ACTIVE_BUT_WEAK", "INACTIVE_OR_BROKEN", "NOT_RELATED"] },
      { id: "proofFile", label: "Chứng minh chuyên môn", value: "", type: "file", options: ["CLEAR_AND_RELEVANT", "BASIC_BUT_WEAK", "UNCLEAR", "IRRELEVANT_OR_SUSPICIOUS"] },
      { id: "declaration", label: "Cam kết trung thực", value: "Đã xác nhận", type: "text", options: ["ACCEPTED", "MISSING"] },
    ]
  }
};

// --- Approval Thresholds (verified, basic) per subtype ---
export const APPROVAL_THRESHOLDS: Record<KYCSubtype, { verified: number; basic: number }> = {
  STARTUP_ENTITY:         { verified: 10, basic: 6 },
  STARTUP_NO_ENTITY:      { verified: 8,  basic: 5 },
  INSTITUTIONAL_INVESTOR: { verified: 10, basic: 6 },
  INDIVIDUAL_INVESTOR:    { verified: 10, basic: 6 },
  ADVISOR:                { verified: 11, basic: 7 },
};

// --- Label Suggestion Logic ---

export interface KYCResult {
  totalScore: number;
  hasHardFail: boolean;
  suggestedLabel: string;
  suggestedDecision: "APPROVE" | "REJECT" | "PENDING_MORE_INFO";
}

export const getSuggestedResult = (subtype: KYCSubtype, assessments: Record<string, AssessmentValue>): KYCResult => {
  let totalScore = 0;
  let hasHardFail = false;

  // Only count fields that exist in current config — prevents stale fields from inflating score
  const configFieldIds = new Set(KYC_SUBTYPE_CONFIGS[subtype].fields.map(f => f.id));
  Object.entries(assessments).forEach(([fieldId, val]) => {
    if (!configFieldIds.has(fieldId)) return;
    totalScore += SCORE_MAP[val] || 0;
    if (HARD_FAIL_VALUES.includes(val)) {
      hasHardFail = true;
    }
  });

  // Base logic for all subtypes (can be refined per subtype if needed)
  let suggestedLabel = "Chưa xác minh";
  let suggestedDecision: "APPROVE" | "REJECT" | "PENDING_MORE_INFO" = "REJECT";

  if (hasHardFail) {
    suggestedLabel = "Verification Failed";
    suggestedDecision = "REJECT";
    return { totalScore, hasHardFail, suggestedLabel, suggestedDecision };
  }

  switch (subtype) {
    case "STARTUP_ENTITY":
      if (totalScore >= 10) {
        suggestedLabel = "Startup Đã Xác Thực";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 6) {
        suggestedLabel = "Xác Thực Cơ Bản";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 2) {
        suggestedLabel = "Cần Bổ Sung Thông Tin";
        suggestedDecision = "PENDING_MORE_INFO";
      }
      break;
    case "STARTUP_NO_ENTITY":
      if (totalScore >= 8) {
        suggestedLabel = "Đội Nhóm Đã Xác Thực";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 5) {
        suggestedLabel = "Xác Thực Cơ Bản";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 2) {
        suggestedLabel = "Cần Bổ Sung Thông Tin";
        suggestedDecision = "PENDING_MORE_INFO";
      }
      break;
    case "INSTITUTIONAL_INVESTOR":
      if (totalScore >= 10) {
        suggestedLabel = "Tổ Chức Đầu Tư Đã Xác Thực";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 6) {
        suggestedLabel = "Xác Thực Cơ Bản";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 2) {
        suggestedLabel = "Cần Bổ Sung Thông Tin";
        suggestedDecision = "PENDING_MORE_INFO";
      }
      break;
    case "INDIVIDUAL_INVESTOR":
      if (totalScore >= APPROVAL_THRESHOLDS.INDIVIDUAL_INVESTOR.verified) {
        suggestedLabel = "Angel Investor Đã Xác Thực";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= APPROVAL_THRESHOLDS.INDIVIDUAL_INVESTOR.basic) {
        suggestedLabel = "Xác Thực Cơ Bản";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 2) {
        suggestedLabel = "Cần Bổ Sung Thông Tin";
        suggestedDecision = "PENDING_MORE_INFO";
      }
      break;
    case "ADVISOR":
      if (totalScore >= 11) {
        suggestedLabel = "Cố Vấn Đã Xác Thực";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 7) {
        suggestedLabel = "Xác Thực Cơ Bản";
        suggestedDecision = "APPROVE";
      } else if (totalScore >= 3) {
        suggestedLabel = "Cần Bổ Sung Thông Tin";
        suggestedDecision = "PENDING_MORE_INFO";
      }
      break;
  }

  return { totalScore, hasHardFail, suggestedLabel, suggestedDecision };
};

// --- Localization for Assessment Values ---

export const ASSESSMENT_LABELS: Record<AssessmentValue, string> = {
  EXACT_MATCH: "Khớp hoàn toàn",
  PARTIAL_MATCH: "Khớp một phần",
  CANNOT_VERIFY: "Không thể xác minh",
  MISMATCH: "Không khớp",
  VALID_MATCH: "Hợp lệ và Khớp",
  FOUND_BUT_DIFFERS: "Tìm thấy nhưng sai lệch",
  NOT_FOUND: "Không tìm thấy",
  INVALID_FORMAT: "Định dạng không hợp lệ",
  CLEAR_AND_MATCH: "Rõ ràng và Khớp",
  UNCLEAR_BUT_PLAUSIBLE: "Chưa rõ nhưng hợp lý",
  INCOMPLETE: "Thiếu thông tin",
  MISMATCH_OR_SUSPICIOUS: "Sai lệch hoặc nghi vấn",
  STRONG_LINK: "Liên kết chặt chẽ",
  PLAUSIBLE_LINK: "Liên kết hợp lý",
  SUSPICIOUS: "Nghi vấn rủi ro",
  ROLE_SUPPORTED: "Vai trò có cơ sở",
  ROLE_PLAUSIBLE: "Vai trò hợp lý",
  ROLE_UNSUPPORTED: "Vai trò thiếu cơ sở",
  ROLE_INCONSISTENT: "Vai trò bất nhất",
  COMPANY_DOMAIN_MATCH: "Email tên miền công ty",
  PERSONAL_BUT_PLAUSIBLE: "Email cá nhân nhưng hợp lý",
  UNRELATED: "Email không liên quan",
  INVALID: "Email không hợp lệ",
  ACTIVE_AND_MATCH: "Hoạt động và Khớp",
  ACTIVE_BUT_WEAK: "Hoạt động nhưng yếu",
  INACTIVE_OR_BROKEN: "Không hoạt động/Lỗi",
  NOT_RELATED: "Không liên quan",
  ACCEPTED: "Đã chấp nhận",
  MISSING: "Còn thiếu",
  CLEAR_AND_RELEVANT: "Rõ ràng và Liên quan",
  BASIC_BUT_WEAK: "Cơ bản nhưng yếu",
  UNCLEAR: "Chưa rõ ràng",
  IRRELEVANT_OR_SUSPICIOUS: "Không liên quan/Nghi vấn",
  ALIGNED: "Phù hợp/Đồng nhất",
  CONSISTENT_PUBLICLY: "Đồng nhất công khai",
  CLEAR_MATCH: "Khớp rõ rệt",
  NOT_ENOUGH_INFO: "Không đủ thông tin"
};
