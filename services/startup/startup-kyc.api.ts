import axios from "../interceptor";

export type StartupVerificationType = "WITH_LEGAL_ENTITY" | "WITHOUT_LEGAL_ENTITY";

export type KycWorkflowStatus =
    | "NOT_SUBMITTED"
    | "DRAFT"
    | "UNDER_REVIEW"
    | "PENDING_MORE_INFO"
    | "APPROVED"
    | "REJECTED"
    | "SUPERSEDED";

export type KycResultLabel =
    | "NONE"
    | "VERIFIED_COMPANY"
    | "VERIFIED_FOUNDING_TEAM"
    | "BASIC_VERIFIED"
    | "PENDING_MORE_INFO"
    | "VERIFICATION_FAILED"
    | "REJECTED"
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
    fileType?: string;
    fileSize?: number;
    uploadedAt: string;
    kind: "BUSINESS_REGISTRATION_CERTIFICATE" | "BASIC_ACTIVITY_PROOF";
    url?: string;
    storageKey?: string;
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
    submissionId?: string | number | null;
    startupId: string;
    version?: number;
    isActive?: boolean;
    requiresNewEvidence?: boolean;
    workflowStatus: KycWorkflowStatus;
    resultLabel: KycResultLabel;
    startupVerificationType?: StartupVerificationType;
    submittedAt?: string;
    updatedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    latestReviewCycle?: number;
    isResubmittable?: boolean;
    explanation?: string;
    requestedAdditionalItems?: RequestedInfoItem[];
    remarks?: string;
    submissionSummary: StartupKycSubmissionSummary | null;
}

export const GetStartupKYCStatus = () => {
    return axios.get<IBackendRes<StartupKycCase>>(`/api/startups/me/kyc/status`);
};

export const SubmitStartupKYC = (formData: FormData) => {
    return axios.post<IBackendRes<null>>(`/api/startups/me/kyc/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const SaveStartupKYCDraft = (formData: FormData) => {
    return axios.patch<IBackendRes<null>>(`/api/startups/me/kyc/draft`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
