import type { IInvestorKYCStatus } from "@/types/investor-kyc";

export type InvestorCategory = "INDIVIDUAL_ANGEL" | "INSTITUTIONAL";
export type InstitutionalIdentityLineMode = "representative" | "organization";

type InvestorPresentationOptions = {
  institutionalIdentityLineMode?: InstitutionalIdentityLineMode;
};

const SUBMITTER_ROLE_LABELS: Record<string, string> = {
  PARTNER: "Đối tác (Partner)",
  INVESTMENT_MANAGER: "Quản lý đầu tư",
  ANALYST: "Chuyên viên phân tích",
  LEGAL_REPRESENTATIVE: "Đại diện pháp luật",
  AUTHORIZED_PERSON: "Người được ủy quyền",
};

function normalizeCategory(value?: string | null): InvestorCategory | null {
  if (value === "INDIVIDUAL_ANGEL" || value === "INSTITUTIONAL") {
    return value;
  }
  return null;
}

function buildAngelIdentityLine(role: string | null, organizationName: string | null) {
  if (role && organizationName) return `${role} tại ${organizationName}`;
  return role || organizationName || null;
}

type InvestorKycLike = Partial<
  Pick<IInvestorProfile, "profileStatus" | "workflowStatus" | "verificationLabel" | "kycVerified"> &
    Pick<IInvestorSearchItem, "profileStatus" | "workflowStatus" | "verificationLabel" | "kycVerified">
>;

export type InvestorKycUiState = {
  workflowStatus: string | null;
  verificationLabel: string | null;
  hasKnownStatus: boolean;
  isVerified: boolean;
  isPendingReview: boolean;
  needsResubmission: boolean;
  isFailed: boolean;
  shouldShowVerificationPrompt: boolean;
};

export function isInvestorKycVerified(
  source?: InvestorKycLike | null,
  kycStatus?: Pick<IInvestorKYCStatus, "workflowStatus" | "verificationLabel"> | null,
) {
  if (source?.kycVerified) return true;

  const workflowStatus = kycStatus?.workflowStatus ?? source?.workflowStatus;
  if (workflowStatus === "VERIFIED") return true;

  const verificationLabel = kycStatus?.verificationLabel ?? source?.verificationLabel;
  if (
    verificationLabel === "BASIC_VERIFIED" ||
    verificationLabel === "VERIFIED_INVESTOR_ENTITY" ||
    verificationLabel === "VERIFIED_ANGEL_INVESTOR"
  ) {
    return true;
  }

  const profileStatus = source?.profileStatus?.toUpperCase();
  return Boolean(profileStatus && profileStatus.includes("VERIFIED"));
}

export function getInvestorKycUiState(
  source?: InvestorKycLike | null,
  kycStatus?: Pick<IInvestorKYCStatus, "workflowStatus" | "verificationLabel"> | null,
): InvestorKycUiState {
  const workflowStatus = kycStatus?.workflowStatus ?? source?.workflowStatus ?? null;
  const verificationLabel = kycStatus?.verificationLabel ?? source?.verificationLabel ?? null;
  const profileStatus = source?.profileStatus?.toUpperCase() ?? null;
  const hasVerifiedProfileSignal = Boolean(profileStatus && profileStatus.includes("VERIFIED"));
  const hasKnownStatus = Boolean(source?.kycVerified || workflowStatus || verificationLabel || hasVerifiedProfileSignal);
  const isVerified = isInvestorKycVerified(source, kycStatus);
  const isPendingReview = workflowStatus === "PENDING_REVIEW";
  const needsResubmission =
    workflowStatus === "PENDING_MORE_INFO" || verificationLabel === "PENDING_MORE_INFO";
  const isFailed =
    workflowStatus === "VERIFICATION_FAILED" || verificationLabel === "VERIFICATION_FAILED";

  return {
    workflowStatus,
    verificationLabel,
    hasKnownStatus,
    isVerified,
    isPendingReview,
    needsResubmission,
    isFailed,
    shouldShowVerificationPrompt:
      hasKnownStatus && !isVerified && !isPendingReview && !needsResubmission && !isFailed,
  };
}

export function resolveInvestorCategory(
  profile?: Pick<IInvestorProfile, "investorType"> | null,
  kycStatus?: IInvestorKYCStatus | null,
): InvestorCategory {
  return (
    normalizeCategory(kycStatus?.submissionSummary?.investorCategory) ||
    normalizeCategory(profile?.investorType) ||
    "INDIVIDUAL_ANGEL"
  );
}

export function getInvestorCategoryLabel(category?: InvestorCategory | null) {
  if (category === "INSTITUTIONAL") return "Tổ chức / Quỹ đầu tư";
  if (category === "INDIVIDUAL_ANGEL") return "Angel Investor (Cá nhân)";
  return null;
}

export function getSubmitterRoleLabel(role?: string | null) {
  if (!role) return null;
  return SUBMITTER_ROLE_LABELS[role] || role;
}

function buildInstitutionalIdentityLine(
  category: InvestorCategory,
  representativeName: string | null,
  representativeRole: string | null,
  mode: InstitutionalIdentityLineMode,
) {
  if (mode === "organization") {
    return getInvestorCategoryLabel(category);
  }

  return [representativeName ? `Người đại diện: ${representativeName}` : null, representativeRole]
    .filter(Boolean)
    .join(" · ") || null;
}

export function buildInvestorProfilePresentation(
  profile: IInvestorProfile,
  kycStatus?: IInvestorKYCStatus | null,
  options?: InvestorPresentationOptions,
) {
  const institutionalIdentityLineMode = options?.institutionalIdentityLineMode ?? "representative";
  const category = resolveInvestorCategory(profile, kycStatus);
  const isInstitutional = category === "INSTITUTIONAL";
  const organizationName =
    profile.firmName ||
    profile.organization ||
    kycStatus?.submissionSummary?.organizationName ||
    null;
  const roleName = profile.title || kycStatus?.submissionSummary?.currentRoleTitle || null;
  const representativeName = isInstitutional
    ? kycStatus?.submissionSummary?.fullName || profile.fullName || null
    : null;
  const representativeRole = isInstitutional
    ? getSubmitterRoleLabel(kycStatus?.submissionSummary?.submitterRole) || roleName
    : null;
  const primaryName = isInstitutional
    ? organizationName || profile.fullName || "Hồ sơ Investor"
    : profile.fullName || organizationName || "Hồ sơ Investor";
  const institutionalIdentityLine = buildInstitutionalIdentityLine(
    category,
    representativeName,
    representativeRole,
    institutionalIdentityLineMode,
  );

  return {
    category,
    isInstitutional,
    categoryLabel: getInvestorCategoryLabel(category),
    primaryName,
    organizationName,
    roleName,
    representativeName,
    representativeRole,
    heroIdentityLine: isInstitutional
      ? institutionalIdentityLine
      : buildAngelIdentityLine(roleName, organizationName),
    shortSummary: profile.bio || profile.investmentThesis || null,
    contactEmail: kycStatus?.submissionSummary?.contactEmail || null,
    lockedFieldsNote: isInstitutional
      ? "Tên người đại diện, vai trò nộp hồ sơ và thông tin pháp lý được quản lý tại KYC."
      : "Email xác minh và thông tin pháp lý được quản lý tại luồng KYC.",
    avatarSectionTitle: isInstitutional ? "Logo tổ chức" : "Ảnh đại diện",
    avatarSectionDescription: isInstitutional
      ? "Logo công khai của tổ chức / quỹ"
      : "Ảnh đại diện công khai của nhà đầu tư",
    infoSectionTitle: isInstitutional ? "Thông tin tổ chức" : "Thông tin cá nhân",
    primaryField: {
      key: (isInstitutional ? "firmName" : "fullName") as keyof IUpdateInvestorProfile,
      label: isInstitutional ? "Tên tổ chức / quỹ" : "Tên hiển thị",
      placeholder: isInstitutional ? "Tên tổ chức / quỹ đầu tư" : "Họ tên hiển thị công khai",
    },
    affiliationField: isInstitutional
      ? null
      : {
          key: "firmName" as keyof IUpdateInvestorProfile,
          label: "Nơi công tác hiện tại",
          placeholder: "Tên công ty / tổ chức bạn đang gắn với",
        },
    titleField: {
      key: "title" as keyof IUpdateInvestorProfile,
      label: isInstitutional ? "Vai trò / chức danh đại diện" : "Chức danh / nghề nghiệp",
      placeholder: isInstitutional ? "VD: Managing Partner, Principal..." : "VD: Angel Investor, Founder, CTO...",
    },
    locationLabel: isInstitutional ? "Tỉnh / Thành phố hoạt động" : "Tỉnh / Thành phố",
    websiteLabel: isInstitutional ? "Website tổ chức" : "Website / Portfolio",
    websitePlaceholder: isInstitutional ? "https://ten-to-chuc.com" : "https://portfolio.com",
    linkedInLabel: isInstitutional ? "LinkedIn tổ chức" : "LinkedIn cá nhân",
    linkedInPlaceholder: isInstitutional ? "https://linkedin.com/company/..." : "https://linkedin.com/in/...",
    quickFacts: isInstitutional
      ? [
          { label: "NGƯỜI ĐẠI DIỆN", value: representativeName },
          { label: "VAI TRÒ ĐẠI DIỆN", value: representativeRole || roleName },
          { label: "LOẠI HÌNH ĐẦU TƯ", value: getInvestorCategoryLabel(category) },
          { label: "KHU VỰC / VỊ TRÍ", value: profile.location || null },
        ]
      : [
          { label: "NƠI CÔNG TÁC", value: organizationName },
          { label: "CHỨC DANH / NGHỀ NGHIỆP", value: roleName },
          { label: "LOẠI HÌNH ĐẦU TƯ", value: getInvestorCategoryLabel(category) },
          { label: "KHU VỰC / VỊ TRÍ", value: profile.location || null },
        ],
  };
}

export function buildInvestorSearchPresentation(
  investor: IInvestorSearchItem,
  options?: InvestorPresentationOptions,
) {
  const institutionalIdentityLineMode = options?.institutionalIdentityLineMode ?? "representative";
  const category = normalizeCategory(investor.investorType) || "INDIVIDUAL_ANGEL";
  const isInstitutional = category === "INSTITUTIONAL";
  const organizationName = investor.firmName || null;
  const roleName = investor.title || null;
  const representativeName = isInstitutional ? investor.fullName || null : null;
  const primaryName = isInstitutional
    ? organizationName || investor.fullName || "Hồ sơ Investor"
    : investor.fullName || organizationName || "Hồ sơ Investor";

  return {
    category,
    isInstitutional,
    categoryLabel: getInvestorCategoryLabel(category),
    primaryName,
    organizationName,
    roleName,
    representativeName,
    heroIdentityLine: isInstitutional
      ? institutionalIdentityLineMode === "representative"
        ? [
            representativeName && representativeName !== primaryName
              ? `Người đại diện: ${representativeName}`
              : null,
            roleName,
          ]
            .filter(Boolean)
            .join(" · ") || null
        : getInvestorCategoryLabel(category)
      : buildAngelIdentityLine(roleName, organizationName),
  };
}
