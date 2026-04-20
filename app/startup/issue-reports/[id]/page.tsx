"use client";

import { use } from "react";

import { IssueReportDetailPage } from "@/components/shared/issue-report-detail-page";
import { StartupShell } from "@/components/startup/startup-shell";

export default function StartupIssueReportDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <StartupShell>
      <IssueReportDetailPage id={Number.parseInt(id, 10)} roleBaseUrl="/startup/issue-reports" />
    </StartupShell>
  );
}
