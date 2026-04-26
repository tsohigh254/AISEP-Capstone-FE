import { AIEvaluationReport, Recommendation, SubMetric, AIEvaluationStatus } from "./types";

function normalizeTo100(raw: any): number {
  if (raw == null) return 0;
  const n = Number(raw);
  if (Number.isNaN(n)) return 0;
  if (n <= 1) return Math.round(n * 100);
  if (n <= 10) return Math.round(n * 10);
  return Math.round(n);
}

function getCriterionScore(criteria: any[] | undefined, ...names: string[]): number {
  if (!criteria) return 0;
  const normalize = (s: any) => (s == null ? "" : String(s).toLowerCase().replace(/[^a-z]/g, ""));
  for (const c of criteria) {
    const label = normalize(c?.criterion_name ?? c?.criterion ?? c?.name ?? c?.title ?? c?.criterionName);
    for (const name of names) {
      const target = String(name ?? "").toLowerCase().replace(/[^a-z]/g, "");
      if (label.includes(target)) {
        const raw = c.normalized_score ?? c.weighted_score ?? c.final_score ?? c.score ?? c.raw_score ?? c.finalScore ?? c.rawScore;
        return normalizeTo100(raw);
      }
    }
  }
  return 0;
}

function getCriterionSubMetrics(criteria: any[] | undefined, ...names: string[]): SubMetric[] {
  if (!criteria) return [];
  const normalize = (s: any) => (s == null ? "" : String(s).toLowerCase().replace(/[^a-z]/g, ""));
  for (const c of criteria) {
    const label = normalize(c?.criterion_name ?? c?.criterion ?? c?.name ?? c?.title ?? c?.criterionName);
    for (const name of names) {
      const target = String(name ?? "").toLowerCase().replace(/[^a-z]/g, "");
      if (!label.includes(target)) continue;

      const raw = c?.sub_metrics ?? c?.sub_criteria ?? c?.subMetrics ?? c?.subCriteria ?? c?.cap_summary ?? c?.details ?? null;
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((m: any) => ({
          name: m.name ?? m.sub_criterion_name ?? m.criterion ?? m.title ?? (m.excerpt || m.summary) ?? "",
          score: normalizeTo100(m.score ?? m.normalized_score ?? m.weighted_score ?? m.final_score ?? m.raw_score ?? 0),
          maxScore: m.max_score ?? 100,
          comment: m.comment ?? m.explanation ?? m.reasoning ?? m.detail ?? "",
        }));
      }

      // Fallback: if criterion has strengths array, map those as lightweight subMetrics
      if (Array.isArray(c?.strengths) && c.strengths.length > 0) {
        const baseScore = normalizeTo100(c?.final_score ?? c?.raw_score ?? c?.normalized_score ?? 0);
        return (c.strengths || []).map((s: any) => ({
          name: typeof s === "string" ? s : (s?.excerpt ?? s?.summary ?? JSON.stringify(s)),
          score: baseScore,
          maxScore: 100,
          comment: "",
        }));
      }

      return [];
    }
  }
  return [];
}

function asStringArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  if (typeof v === "string") return [v];
  if (typeof v === "object") {
    const vals: string[] = [];
    for (const k of ["summary", "text", "conclusion", "excerpt", "recommendation"]) {
      if (typeof v[k] === "string") vals.push(v[k]);
    }
    return vals;
  }
  return [];
}

function mapStatusToUI(status?: string): AIEvaluationStatus {
  const s = (status ?? "").toLowerCase();
  if (s === "queued") return "QUEUED";
  if (s === "processing" || s === "retry" || s === "analyzing") return "ANALYZING";
  if (s === "partial_completed") return "ANALYZING";
  if (s === "completed") return "COMPLETED";
  if (s === "failed") return "FAILED";
  if (s === "insufficient_data") return "INSUFFICIENT_DATA";
  if (s === "access_restricted" || s === "access_denied") return "ACCESS_RESTRICTED";
  if (s === "scoring") return "SCORING";
  if (s === "generating_report" || s === "generating-report") return "GENERATING_REPORT";
  if (s === "validating") return "VALIDATING";
  return "NOT_REQUESTED";
}

function mapCanonicalToReport(runId: number, data: any): AIEvaluationReport {
  const criteria: any[] = data?.criteria_results ?? data?.criteria ?? [];
  const overall = data?.overall_result ?? data;
  const narr = data?.narrative ?? data;

  const teamScore = getCriterionScore(criteria, "team", "team_", "execution");
  const marketScore = getCriterionScore(criteria, "market", "market_");
  const productScore = getCriterionScore(criteria, "solution", "product", "differentiation", "solution_");
  const tractionScore = getCriterionScore(criteria, "traction", "validation", "validation_");
  const financialScore = getCriterionScore(criteria, "business", "financial", "model", "revenue", "business_");

  const overallScore = normalizeTo100(
    overall?.overall_score ?? overall?.overallScore ??
    data?.overall_score ?? data?.overallScore ?? data?.OverallScore ??
    overall?.score ?? 0
  );

  const executiveSummary = narr?.executive_summary ?? narr?.summary ?? narr?.conclusion ?? overall?.summary ?? "";
  const warnings = asStringArray(data?.warnings ?? data?.processing_warnings ?? narr?.warnings ?? []);
  
  // Heuristic: Detect source documents from report text since we cannot change BE
  const fullText = (executiveSummary + " " + (data?.snapshot_label ?? "") + " " + warnings.join(" ")).toLowerCase();
  
  const mentionsBP = fullText.includes("business plan") || fullText.includes("kế hoạch kinh doanh");
  const mentionsPD = fullText.includes("pitch deck") || fullText.includes("bản thuyết trình");
  const bpMissing = fullText.includes("business plan not provided") || fullText.includes("thiếu business plan") || fullText.includes("không có business plan");
  const pdMissing = fullText.includes("pitch deck not provided") || fullText.includes("thiếu pitch deck") || fullText.includes("không có pitch deck");

  let pitchDeckScore = 0;
  let businessPlanScore = 0;

  // Decision logic
  if (mentionsBP && mentionsPD && !bpMissing && !pdMissing) {
    // Looks like a combined evaluation
    const allScores = (criteria || [])
      .map((c: any) => normalizeTo100(c.normalized_score ?? c.weighted_score ?? c.final_score ?? c.score ?? c.raw_score))
      .sort((a: number, b: number) => b - a);
    pitchDeckScore = allScores[0] ?? overallScore;
    businessPlanScore = allScores[1] ?? overallScore;
  } else if (mentionsBP && !bpMissing) {
    // Business Plan only
    businessPlanScore = overallScore;
    pitchDeckScore = 0;
  } else if (mentionsPD && !pdMissing) {
    // Pitch Deck only
    pitchDeckScore = overallScore;
    businessPlanScore = 0;
  } else {
    // Fallback: If we can't tell, show overall score in both or use the old high-low logic
    pitchDeckScore = overallScore;
    businessPlanScore = 0; 
  }

  const strengths: string[] = asStringArray(narr?.strengths ?? narr?.strength ?? narr?.top_strengths ?? narr?.topStrengths ?? data?.strengths ?? []);
  const opportunities: string[] = asStringArray(narr?.opportunities ?? narr?.opportunity ?? narr?.top_opportunities ?? narr?.topOpportunities ?? data?.opportunities ?? []);
  const risks: string[] = asStringArray(narr?.risks ?? narr?.risk ?? narr?.top_risks ?? narr?.topRisks ?? data?.risks ?? []);
  const concerns: string[] = asStringArray(narr?.concerns ?? narr?.top_concerns ?? narr?.topConcerns ?? data?.concerns ?? []);
  const gaps: string[] = asStringArray(narr?.gaps ?? narr?.missing_information ?? narr?.missingInformation ?? data?.gaps ?? []);

  const recommendationsRaw = data?.recommendations ?? narr?.recommendations ?? narr?.recommendation ?? [];
  const recommendations: Recommendation[] = [];
  if (Array.isArray(recommendationsRaw)) {
    for (const r of recommendationsRaw) {
      // normalize priority: support numeric (1-5) or string
      const pRaw = r.priority ?? r.Priority ?? r.priority_score ?? r.priorityLevel ?? r.priorityNumber;
      let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
      if (typeof pRaw === "number") {
        if (pRaw >= 4) priority = "HIGH";
        else if (pRaw === 3) priority = "MEDIUM";
        else priority = "LOW";
      } else if (typeof pRaw === "string") {
        const s = pRaw.toLowerCase();
        if (s === "high" || s === "5" || s === "4") priority = "HIGH";
        else if (s === "medium" || s === "3") priority = "MEDIUM";
        else priority = "LOW";
      }

      const text = r.text ?? r.recommendation ?? r.recommendation_text ?? r.recommendation ?? r.suggestion ?? r.description ?? "";
      const category = r.category ?? r.type ?? r.categoryName ?? "";
      const impact = r.impact ?? r.expected_impact ?? r.expectedImpact ?? r.expected_impact ?? "";

      recommendations.push({
        category,
        priority,
        text,
        impact,
      });
    }
  }

  const now = new Date();
  const nowStr = now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return {
    evaluationId: String(runId),
    startupId: String(data?.startup_id ?? data?.startupId ?? ""),
    status: mapStatusToUI(data?.status ?? data?.Status ?? "queued"),
    overallScore,
    pitchDeckScore,
    businessPlanScore,
    teamScore,
    marketScore,
    productScore,
    tractionScore,
    financialScore,
    calculatedAt: data?.calculated_at ?? data?.calculatedAt ?? data?.submitted_at ?? data?.submittedAt ?? nowStr,
    generatedAt: data?.generated_at ?? data?.generatedAt ?? data?.created_at ?? data?.createdAt ?? nowStr,
    isCurrent: false,
    configVersion: data?.config_version ?? data?.configVersion ?? "",
    modelVersion: data?.model_version ?? data?.modelVersion ?? "",
    promptVersion: data?.prompt_version ?? data?.promptVersion ?? "",
    snapshotLabel: data?.snapshot_label ?? data?.title ?? `Đánh giá ${nowStr}`,
    warningMessages: asStringArray(data?.warnings ?? data?.processing_warnings ?? narr?.warnings ?? []),
    executiveSummary,
    strengths,
    opportunities,
    risks,
    concerns,
    gaps,
    recommendations,
    subMetrics: {
      team: getCriterionSubMetrics(criteria, "team"),
      market: getCriterionSubMetrics(criteria, "market"),
      product: getCriterionSubMetrics(criteria, "solution", "product"),
      traction: getCriterionSubMetrics(criteria, "traction"),
      financial: getCriterionSubMetrics(criteria, "business", "model", "financial"),
    },
  } as AIEvaluationReport;
}

export { normalizeTo100, mapCanonicalToReport, mapStatusToUI };
