export const isIssueReportNotification = (item: {
  notificationType?: string | null;
  actionUrl?: string | null;
  relatedEntityType?: string | null;
}) => {
  const relatedEntityType = item.relatedEntityType?.toLowerCase() ?? "";
  const notificationType = item.notificationType?.toLowerCase() ?? "";
  const actionUrl = item.actionUrl?.toLowerCase() ?? "";

  return (
    relatedEntityType === "issuereport" ||
    notificationType.includes("issue_report") ||
    notificationType.includes("issuereport") ||
    actionUrl.includes("/issue-reports/")
  );
};

type NotificationTextContext = {
  notificationType?: string | null;
  actionUrl?: string | null;
  relatedEntityType?: string | null;
};

const ISSUE_REPORT_STATUS_TEXT_MAP: Record<string, string> = {
  New: "Mới tạo",
  UnderReview: "Đang xử lý",
  Resolved: "Đã giải quyết",
  Dismissed: "Đã bác bỏ",
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const localizeIssueReportNotificationText = (
  item: NotificationTextContext,
  text?: string | null
) => {
  if (!text || !isIssueReportNotification(item)) {
    return text ?? "";
  }

  return Object.entries(ISSUE_REPORT_STATUS_TEXT_MAP).reduce((result, [rawStatus, localizedStatus]) => {
    const pattern = new RegExp(`\\b${escapeRegExp(rawStatus)}\\b`, "g");
    return result.replace(pattern, localizedStatus);
  }, text);
};
