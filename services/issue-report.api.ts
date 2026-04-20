import axios from "./interceptor";

/* ─── FE-side enums (dùng cho UI) ────────────────────────────── */

export type IssueCategory =
  | "PAYMENT_ISSUE"
  | "CONSULTING_ISSUE"
  | "MESSAGING_ISSUE"
  | "OFFER_OR_CONNECTION_ISSUE"
  | "VERIFICATION_ISSUE"
  | "DOCUMENT_ISSUE"
  | "HARASSMENT_OR_MISCONDUCT"
  | "TECHNICAL_PROBLEM"
  | "OTHER";

export type IssueReportStatus = "NEW" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
export type IssueReporterUserType = "Startup" | "Advisor" | "Investor" | "Staff" | "Admin";

export type RelatedEntityType =
  | "Mentorship"
  | "Session"
  | "Payment"
  | "AdvisorReport"
  | "Connection"
  | "User";

/* ─── BE ↔ FE mappings ───────────────────────────────────────── */

export const CATEGORY_TO_NUMBER: Record<IssueCategory, number> = {
  PAYMENT_ISSUE: 0,
  CONSULTING_ISSUE: 1,
  MESSAGING_ISSUE: 2,
  OFFER_OR_CONNECTION_ISSUE: 3,
  VERIFICATION_ISSUE: 4,
  DOCUMENT_ISSUE: 5,
  HARASSMENT_OR_MISCONDUCT: 6,
  TECHNICAL_PROBLEM: 7,
  OTHER: 8,
};

export const CATEGORY_FROM_BE: Record<string, IssueCategory> = {
  PaymentIssue: "PAYMENT_ISSUE",
  ConsultingIssue: "CONSULTING_ISSUE",
  MessagingIssue: "MESSAGING_ISSUE",
  OfferOrConnectionIssue: "OFFER_OR_CONNECTION_ISSUE",
  VerificationIssue: "VERIFICATION_ISSUE",
  DocumentIssue: "DOCUMENT_ISSUE",
  HarassmentOrMisconduct: "HARASSMENT_OR_MISCONDUCT",
  TechnicalProblem: "TECHNICAL_PROBLEM",
  Other: "OTHER",
};

export const STATUS_TO_NUMBER: Record<IssueReportStatus, number> = {
  NEW: 0,
  UNDER_REVIEW: 1,
  RESOLVED: 2,
  DISMISSED: 3,
};

export const STATUS_FROM_BE: Record<string, IssueReportStatus> = {
  New: "NEW",
  UnderReview: "UNDER_REVIEW",
  Resolved: "RESOLVED",
  Dismissed: "DISMISSED",
};

/* ─── DTOs ───────────────────────────────────────────────────── */

export interface IssueReportAttachment {
  attachmentID: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface IssueReportSummaryDto {
  issueReportID: number;
  category: string; // BE PascalCase ("PaymentIssue") — map qua CATEGORY_FROM_BE
  status: string; // BE PascalCase ("New") — map qua STATUS_FROM_BE
  description: string;
  relatedEntityType: string | null;
  relatedEntityID: number | null;
  submittedAt: string;
  updatedAt: string | null;
}

export interface IssueReportDetailDto extends IssueReportSummaryDto {
  reporterUserID: number;
  reporterUserType: IssueReporterUserType;
  reporterAvatarUrl: string | null;
  reporterEmail: string | null; // BE entity User chưa có FirstName/LastName → field này là email
  staffNote: string | null;
  assignedToStaffID: number | null;
  attachments: IssueReportAttachment[];
}

export interface SubmitIssueReportInput {
  issueCategory: IssueCategory;
  description: string;
  relatedEntityType?: RelatedEntityType | null;
  relatedEntityID?: number | null;
  attachments?: File[];
}

const MAX_ATTACHMENTS = 5;

const pickIssueReportAvatarUrl = (value: unknown) => {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;
  const candidate =
    raw.reporterAvatarUrl ??
    raw.reporterAvatarURL ??
    raw.ReporterAvatarUrl ??
    raw.ReporterAvatarURL ??
    null;

  return typeof candidate === "string" && candidate.trim() ? candidate : null;
};

const normalizeIssueReportDetail = (value: unknown): IssueReportDetailDto => {
  const raw = value as IssueReportDetailDto & Record<string, unknown>;

  return {
    ...raw,
    reporterAvatarUrl: pickIssueReportAvatarUrl(raw),
  };
};

const normalizeIssueReportDetailResponse = (
  response: IBackendRes<IssueReportDetailDto>
) => {
  if (!response?.data) return response;

  return {
    ...response,
    data: normalizeIssueReportDetail(response.data),
  };
};

const normalizeIssueReportListResponse = (
  response: IBackendRes<IPaginatedRes<IssueReportDetailDto>>
) => {
  if (!response?.data) return response;

  const items = response.data.items ?? response.data.data ?? [];
  const normalizedItems = items.map((item) => normalizeIssueReportDetail(item));

  return {
    ...response,
    data: {
      ...response.data,
      ...(response.data.items ? { items: normalizedItems } : {}),
      ...(response.data.data ? { data: normalizedItems } : {}),
    },
  };
};

/* ─── API calls ──────────────────────────────────────────────── */

export const SubmitIssueReport = (input: SubmitIssueReportInput) => {
  const fd = new FormData();
  fd.append("issueCategory", String(CATEGORY_TO_NUMBER[input.issueCategory]));
  fd.append("description", input.description);
  if (input.relatedEntityType) fd.append("relatedEntityType", input.relatedEntityType);
  if (input.relatedEntityID != null) fd.append("relatedEntityID", String(input.relatedEntityID));
  (input.attachments ?? []).slice(0, MAX_ATTACHMENTS).forEach((file) => fd.append("attachments", file));

  return axios.post<IBackendRes<IssueReportSummaryDto>>(`/api/issue-reports`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const GetMyIssueReports = (params?: {
  page?: number;
  pageSize?: number;
  status?: IssueReportStatus;
  category?: IssueCategory;
}) => {
  return axios.get<IBackendRes<IPaginatedRes<IssueReportSummaryDto>>>(`/api/issue-reports/me`, {
    params: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      ...(params?.status != null && { status: STATUS_TO_NUMBER[params.status] }),
      ...(params?.category != null && { category: CATEGORY_TO_NUMBER[params.category] }),
    },
  });
};

export const GetIssueReportById = (id: number) =>
  axios
    .get<IBackendRes<IssueReportDetailDto>>(`/api/issue-reports/${id}`)
    .then((response) =>
      normalizeIssueReportDetailResponse(response as unknown as IBackendRes<IssueReportDetailDto>)
    );

export const GetIssueReportsList = (params?: {
  page?: number;
  pageSize?: number;
  status?: IssueReportStatus;
  category?: IssueCategory;
  reporterUserId?: number;
}) => {
  return axios
    .get<IBackendRes<IPaginatedRes<IssueReportDetailDto>>>(`/api/issue-reports`, {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        ...(params?.status != null && { status: STATUS_TO_NUMBER[params.status] }),
        ...(params?.category != null && { category: CATEGORY_TO_NUMBER[params.category] }),
        ...(params?.reporterUserId != null && { reporterUserId: params.reporterUserId }),
      },
    })
    .then((response) =>
      normalizeIssueReportListResponse(
        response as unknown as IBackendRes<IPaginatedRes<IssueReportDetailDto>>
      )
    );
};

/**
 * staffNote semantics (BE: report.StaffNote = request.StaffNote ?? report.StaffNote):
 *   - omit (undefined) → BE giữ note cũ
 *   - "" (empty string) → BE overwrite thành "" (xóa note)
 *   - "text" → BE overwrite
 *   - null → KHÔNG dùng (BE coi như omit, dễ nhầm). Type đã chặn ở đây.
 */
export const UpdateIssueReportStatus = (
  id: number,
  body: { status: IssueReportStatus; staffNote?: string },
) => {
  return axios.patch<IBackendRes<IssueReportDetailDto>>(`/api/issue-reports/${id}/status`, {
    status: STATUS_TO_NUMBER[body.status],
    ...(body.staffNote !== undefined && { staffNote: body.staffNote }),
  });
};
