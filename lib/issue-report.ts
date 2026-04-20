import type { LucideIcon } from "lucide-react";
import {
  AlertOctagon,
  CreditCard,
  FileText,
  Handshake,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

import {
  CATEGORY_FROM_BE,
  CATEGORY_TO_NUMBER,
  STATUS_FROM_BE,
  STATUS_TO_NUMBER,
  type IssueCategory,
  type IssueReporterUserType,
  type IssueReportStatus,
  type RelatedEntityType,
} from "@/services/issue-report.api";

export type IssueCategoryOption = {
  value: IssueCategory;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
};

export type IssueStatusOption = {
  value: IssueReportStatus;
  label: string;
  dot: string;
  badge: string;
};

export const ISSUE_REPORT_CATEGORIES: IssueCategoryOption[] = [
  {
    value: "PAYMENT_ISSUE",
    label: "Thanh toán",
    icon: CreditCard,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    value: "CONSULTING_ISSUE",
    label: "Tư vấn",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    value: "MESSAGING_ISSUE",
    label: "Tin nhắn",
    icon: MessageSquare,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    value: "OFFER_OR_CONNECTION_ISSUE",
    label: "Kết nối & Đề nghị",
    icon: Handshake,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    value: "VERIFICATION_ISSUE",
    label: "Xác thực",
    icon: ShieldCheck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    value: "DOCUMENT_ISSUE",
    label: "Tài liệu & IP",
    icon: FileText,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    value: "HARASSMENT_OR_MISCONDUCT",
    label: "Vi phạm đạo đức",
    icon: AlertOctagon,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    value: "TECHNICAL_PROBLEM",
    label: "Lỗi kỹ thuật",
    icon: Wrench,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  {
    value: "OTHER",
    label: "Khác",
    icon: HelpCircle,
    color: "text-slate-500",
    bg: "bg-slate-50",
  },
];

export const ISSUE_REPORT_STATUS_OPTIONS: IssueStatusOption[] = [
  {
    value: "NEW",
    label: "Mới tạo",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "UNDER_REVIEW",
    label: "Đang xử lý",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "RESOLVED",
    label: "Đã giải quyết",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "DISMISSED",
    label: "Đã bác bỏ",
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

export const ISSUE_REPORT_ENTITY_LABELS: Record<RelatedEntityType, string> = {
  Mentorship: "Mentorship",
  Session: "Phiên tư vấn",
  Payment: "Thanh toán",
  AdvisorReport: "Báo cáo tư vấn",
  Connection: "Kết nối",
  User: "Người dùng",
};

export const ISSUE_REPORT_USER_TYPE_LABELS: Record<IssueReporterUserType, string> = {
  Startup: "Startup",
  Advisor: "Advisor",
  Investor: "Investor",
  Staff: "Staff",
  Admin: "Admin",
};

export const ISSUE_REPORT_USER_TYPE_AVATAR_STYLES: Record<IssueReporterUserType, string> = {
  Startup: "from-blue-500 to-cyan-500",
  Advisor: "from-violet-500 to-fuchsia-500",
  Investor: "from-emerald-500 to-teal-500",
  Staff: "from-amber-500 to-orange-500",
  Admin: "from-slate-600 to-slate-800",
};

const isIssueCategory = (value: string): value is IssueCategory => value in CATEGORY_TO_NUMBER;

const isIssueStatus = (value: string): value is IssueReportStatus => value in STATUS_TO_NUMBER;

export const getIssueCategoryOption = (value?: string | null) => {
  if (!value) return null;
  const category = isIssueCategory(value) ? value : CATEGORY_FROM_BE[value];
  if (!category) return null;
  return ISSUE_REPORT_CATEGORIES.find((item) => item.value === category) ?? null;
};

export const getIssueStatusOption = (value?: string | null) => {
  if (!value) return null;
  const status = isIssueStatus(value) ? value : STATUS_FROM_BE[value];
  if (!status) return null;
  return ISSUE_REPORT_STATUS_OPTIONS.find((item) => item.value === status) ?? null;
};

export const formatIssueReportDate = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
};

export const formatIssueReportDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN");
};

export const formatIssueReporterIdentity = (
  userType?: IssueReporterUserType | null,
  userId?: number | null
) => {
  const parts: string[] = [];

  if (userType) {
    parts.push(ISSUE_REPORT_USER_TYPE_LABELS[userType] ?? userType);
  }

  if (userId != null) {
    parts.push(`User ID: #${userId}`);
  }

  return parts.join(" • ") || "--";
};

export const getIssueReporterInitials = (
  email?: string | null,
  userType?: IssueReporterUserType | null
) => {
  const source = (email?.split("@")[0] || userType || "U").replace(/[^a-zA-Z0-9]/g, "");
  return source.slice(0, 2).toUpperCase() || "U";
};

export const getIssueReporterAvatarStyle = (userType?: IssueReporterUserType | null) => {
  if (!userType) return "from-slate-400 to-slate-500";
  return ISSUE_REPORT_USER_TYPE_AVATAR_STYLES[userType] ?? "from-slate-400 to-slate-500";
};

export const formatIssueReportUpdatedAt = (value?: string | null) => {
  if (!value) return "Chưa cập nhật";
  return formatIssueReportDateTime(value);
};

export const formatIssueReportEntityReference = (
  entityType?: RelatedEntityType | string | null,
  entityId?: number | null
) => {
  const entityLabel =
    entityType && entityType in ISSUE_REPORT_ENTITY_LABELS
      ? ISSUE_REPORT_ENTITY_LABELS[entityType as RelatedEntityType]
      : entityType;

  if (entityLabel && entityId != null) {
    return `${entityLabel} #${entityId}`;
  }

  if (entityLabel) {
    return entityLabel;
  }

  if (entityId != null) {
    return `Mã liên quan #${entityId}`;
  }

  return "Không có liên kết";
};
