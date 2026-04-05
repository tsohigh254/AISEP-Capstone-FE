export function parseReportFields(
  reportSummary: string = "", 
  detailedFindings: string = "", 
  recommendations: string = ""
) {
  // 1. Parse reportSummary => title \n\n summary
  let title = "Báo cáo tư vấn";
  let summary = reportSummary;
  if (reportSummary.includes("\n\n")) {
    const parts = reportSummary.split("\n\n");
    title = parts[0];
    summary = parts.slice(1).join("\n\n");
  }

  // 2. Parse detailedFindings => discussionOverview \n\nKey Findings:\n keyFindings \n\nRisks:\n identifiedRisks
  let discussionOverview = detailedFindings;
  let keyFindings = "";
  let identifiedRisks = "";
  
  if (detailedFindings.includes("\n\nKey Findings:\n")) {
      const parts1 = detailedFindings.split("\n\nKey Findings:\n");
      discussionOverview = parts1[0];
      const rest = parts1.slice(1).join("\n\nKey Findings:\n");
      if (rest.includes("\n\nRisks:\n")) {
          const parts2 = rest.split("\n\nRisks:\n");
          keyFindings = parts2[0];
          identifiedRisks = parts2.slice(1).join("\n\nRisks:\n");
      } else {
          keyFindings = rest;
      }
  }

  // 3. Parse recommendations => advisorRecommendations \n\nNext Steps:\n nextSteps \n\nDeliverables:\n deliverablesSummary
  let advisorRecommendations = recommendations;
  let nextSteps = "";
  let deliverablesSummary = "";
  
  if (recommendations.includes("\n\nNext Steps:\n")) {
      const parts1 = recommendations.split("\n\nNext Steps:\n");
      advisorRecommendations = parts1[0];
      const rest = parts1.slice(1).join("\n\nNext Steps:\n");
      if (rest.includes("\n\nDeliverables:\n")) {
          const parts2 = rest.split("\n\nDeliverables:\n");
          nextSteps = parts2[0];
          deliverablesSummary = parts2.slice(1).join("\n\nDeliverables:\n");
      } else {
          nextSteps = rest;
      }
  }

  return {
    title,
    summary,
    discussionOverview,
    keyFindings,
    identifiedRisks,
    advisorRecommendations,
    nextSteps,
    deliverablesSummary
  };
}
