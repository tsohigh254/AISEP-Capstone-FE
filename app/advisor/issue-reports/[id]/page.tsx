"use client";

import { use } from "react";

import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { IssueReportDetailPage } from "@/components/shared/issue-report-detail-page";

export default function AdvisorIssueReportDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AdvisorShell>
      <IssueReportDetailPage id={Number.parseInt(id, 10)} roleBaseUrl="/advisor/issue-reports" />
    </AdvisorShell>
  );
}
