// Split text on a marker that may or may not have a leading "\n\n"
// (BE may trim leading whitespace from stored fields)
function splitOnMarker(text: string, marker: string): [string, string] | null {
  const withNewlines = "\n\n" + marker;
  if (text.includes(withNewlines)) {
    const idx = text.indexOf(withNewlines);
    return [text.slice(0, idx), text.slice(idx + withNewlines.length)];
  }
  if (text.startsWith(marker)) {
    return ["", text.slice(marker.length)];
  }
  return null;
}

export function parseReportFields(
  reportSummary: string = "",
  detailedFindings: string = "",
  recommendations: string = ""
) {
  // Normalize CRLF → LF (FormData / BE may return \r\n line endings)
  const rs = reportSummary.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const df = detailedFindings.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rec = recommendations.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 1. Parse reportSummary => title \n\n summary
  let title = "Báo cáo tư vấn";
  let summary = rs;
  if (rs.includes("\n\n")) {
    const parts = rs.split("\n\n");
    title = parts[0];
    summary = parts.slice(1).join("\n\n");
  }

  // 2. Parse detailedFindings => discussionOverview / keyFindings / identifiedRisks
  let discussionOverview = df;
  let keyFindings = "";
  let identifiedRisks = "";

  const kfSplit = splitOnMarker(df, "Key Findings:\n");
  if (kfSplit) {
    discussionOverview = kfSplit[0];
    const kfRest = kfSplit[1];
    const riskSplit = splitOnMarker(kfRest, "Risks:\n");
    if (riskSplit) {
      keyFindings = riskSplit[0];
      identifiedRisks = riskSplit[1];
    } else {
      keyFindings = kfRest;
    }
  }

  // 3. Parse recommendations => advisorRecommendations / nextSteps / deliverablesSummary / followUp
  let advisorRecommendations = rec;
  let nextSteps = "";
  let deliverablesSummary = "";
  let followUpRequired = false;
  let followUpNotes = "";

  const nsSplit = splitOnMarker(rec, "Next Steps:\n");
  if (nsSplit) {
    advisorRecommendations = nsSplit[0];
    const nsRest = nsSplit[1];
    const delSplit = splitOnMarker(nsRest, "Deliverables:\n");
    if (delSplit) {
      nextSteps = delSplit[0];
      const delRest = delSplit[1];
      const fuSplit = splitOnMarker(delRest, "Follow-up Required:\n");
      if (fuSplit) {
        deliverablesSummary = fuSplit[0];
        followUpRequired = true;
        followUpNotes = fuSplit[1];
      } else {
        deliverablesSummary = delRest;
      }
    } else {
      const fuSplit2 = splitOnMarker(nsRest, "Follow-up Required:\n");
      if (fuSplit2) {
        nextSteps = fuSplit2[0];
        followUpRequired = true;
        followUpNotes = fuSplit2[1];
      } else {
        nextSteps = nsRest;
      }
    }
  } else {
    const fuSplit3 = splitOnMarker(rec, "Follow-up Required:\n");
    if (fuSplit3) {
      advisorRecommendations = fuSplit3[0];
      followUpRequired = true;
      followUpNotes = fuSplit3[1];
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
    deliverablesSummary,
    followUpRequired,
    followUpNotes,
  };
}
