"use client";

import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { IssueReportListPage } from "@/components/shared/issue-report-list-page";

export default function AdvisorIssueReportsPage() {
  return (
    <AdvisorShell>
      <IssueReportListPage roleBaseUrl="/advisor/issue-reports" />
    </AdvisorShell>
  );
}
