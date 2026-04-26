/**
 * Tính % hoàn thiện hồ sơ startup dựa trên các field đã có trong response.
 * Dùng chung cho dashboard và trang profile.
 */
export function calcProfileCompleteness(p: any, members: any[] = []): number {
  if (!p) return 0;
  const hasStage =
    p.stage !== undefined && p.stage !== null && p.stage !== "" ||
    p.stageId !== undefined && p.stageId !== null && p.stageId !== "" ||
    p.stageID !== undefined && p.stageID !== null && p.stageID !== "" ||
    p.stageName !== undefined && p.stageName !== null && p.stageName !== "";

  const checks: boolean[] = [
    // Basic info (7)
    !!p.companyName,
    !!p.oneLiner,
    !!p.description,
    !!(p.industryID || p.industryName || p.industry),
    hasStage,
    !!p.logoURL,
    !!(p.location || p.country),
    // Business (4)
    !!p.problemStatement,
    !!p.solutionSummary,
    !!p.marketScope,
    !!p.productStatus,
    // Funding (2)
    Number(p.fundingAmountSought) > 0,
    Array.isArray(p.currentNeeds) && p.currentNeeds.length > 0,
    // Contact (3)
    !!p.contactEmail,
    !!p.contactPhone,
    !!p.website,
    // Team (2)
    !!(p.teamSize || p.TeamSize),
    members.length > 0,
    // Extra (2)
    !!p.linkedInURL,
    !!p.foundedDate,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
