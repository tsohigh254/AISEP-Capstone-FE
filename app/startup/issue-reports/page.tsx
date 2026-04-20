"use client";

import { IssueReportListPage } from "@/components/shared/issue-report-list-page";
import { StartupShell } from "@/components/startup/startup-shell";

export default function StartupIssueReportsPage() {
  return (
    <StartupShell>
      <IssueReportListPage roleBaseUrl="/startup/issue-reports" />
    </StartupShell>
  );
}
