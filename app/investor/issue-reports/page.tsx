"use client";

import { IssueReportListPage } from "@/components/shared/issue-report-list-page";
import { InvestorShell } from "@/components/investor/investor-shell";

export default function InvestorIssueReportsPage() {
  return (
    <InvestorShell>
      <IssueReportListPage roleBaseUrl="/investor/issue-reports" />
    </InvestorShell>
  );
}
