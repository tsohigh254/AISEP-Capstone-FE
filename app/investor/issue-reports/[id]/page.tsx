"use client";

import { use } from "react";

import { IssueReportDetailPage } from "@/components/shared/issue-report-detail-page";
import { InvestorShell } from "@/components/investor/investor-shell";

export default function InvestorIssueReportDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <InvestorShell>
      <IssueReportDetailPage id={Number.parseInt(id, 10)} roleBaseUrl="/investor/issue-reports" />
    </InvestorShell>
  );
}
