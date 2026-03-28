import axios from "../interceptor";

export type StartupVerificationType = "WITH_LEGAL_ENTITY" | "WITHOUT_LEGAL_ENTITY";

export type KycWorkflowStatus =
    | "NOT_SUBMITTED"
    | "DRAFT"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "PENDING_MORE_INFO"
    | "APPROVED"
    | "FAILED";

export type KycResultLabel =
    | "VERIFIED_COMPANY"
    | "VERIFIED_FOUNDING_TEAM"
    | "BASIC_VERIFIED"
    | "PENDING_MORE_INFO"
    | "VERIFICATION_FAILED"
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
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    kind: "BUSINESS_REGISTRATION_CERTIFICATE" | "BASIC_ACTIVITY_PROOF";
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
    startupId: string;
    startupVerificationType: StartupVerificationType;
    workflowStatus: KycWorkflowStatus;
    resultLabel: KycResultLabel;
    submittedAt?: string;
    updatedAt?: string;
    latestReviewCycle: number;
    isResubmittable: boolean;
    explanation?: string;
    requestedAdditionalItems?: RequestedInfoItem[];
    submissionSummary?: StartupKycSubmissionSummary;
}

export const GetStartupKYCStatus = () => {
    return axios.get<IBackendRes<StartupKycCase>>(`/api/startups/me/kyc/status`);
};

export const SubmitStartupKYC = (formData: FormData) => {
    return axios.post<IBackendRes<null>>(`/api/startups/me/kyc/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const ResubmitStartupKYC = (formData: FormData) => {
    return axios.post<IBackendRes<null>>(`/api/startups/me/kyc/resubmit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};
