import { AIEvaluationReport, Recommendation, SubMetric, AIEvaluationStatus } from "./types";

function normalizeTo100(raw: any): number {
  if (raw == null) return 0;
  const n = Number(raw);
  if (Number.isNaN(n)) return 0;
  if (n <= 1) return Math.round(n * 100);
  if (n <= 10) return Math.round(n * 10);
  return Math.round(n);
}

/**
 * Removes technical debug notes enclosed in brackets, e.g. [Merged - prioritizes Business Plan...]
 */
function cleanAiText(text: any): string {
  if (typeof text !== "string") return "";
  // Removes strings like [Text here...] at the start or end of the text
  return text.replace(/^\[[^\]]*\]\s*/g, "").trim();
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
          comment: cleanAiText(m.comment ?? m.explanation ?? m.reasoning ?? m.detail ?? ""),
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
 
function formatDate(dateInput: any): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString("vi-VN", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  });
}

function getFlatSubScoreTo100(data: any, ...keys: string[]): number {
  for (const key of keys) {
    const value = data?.[key];
    if (value == null) continue;
    return normalizeTo100(value);
  }
  return 0;
}

/** Đọc điểm phẳng từ payload BE: property có mặt + giá trị null → N/A; không có key → null. */
function readOptionalFlatScore100(data: any, ...keys: string[]): number | null {
  const d = data ?? {};
  for (const key of keys) {
    // Support nested access like "aiEvaluation.overallScore"
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = d;
      for (const p of parts) {
        current = current?.[p];
      }
      if (current !== undefined) {
        if (current === null) return null;
        return normalizeTo100(current);
      }
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(d, key)) continue;
    const value = d[key];
    if (value === null) return null;
    return normalizeTo100(value);
  }
  return null;
}

/** BE: subMetrics[].Pillar ∈ TEAM | MARKET | PRODUCT | TRACTION | FINANCIAL | OTHER. metricScore ∈ [0,10]. */
function parseLatestScoreSubMetrics(data: any): AIEvaluationReport["subMetrics"] {
  const buckets: AIEvaluationReport["subMetrics"] = {
    team: [],
    market: [],
    product: [],
    traction: [],
    financial: [],
    other: [],
  };
  const raw = data?.subMetrics ?? data?.SubMetrics;
  if (!Array.isArray(raw)) return buckets;

  const rawItemToSubMetric = (item: any): SubMetric | null => {
    if (!item || typeof item !== "object") return null;
    const name =
      (typeof item.metricName === "string" && item.metricName.trim()) ||
      (typeof item.MetricName === "string" && item.MetricName.trim()) ||
      (typeof item.category === "string" && item.category.trim()) ||
      (typeof item.Category === "string" && item.Category.trim()) ||
      (typeof item.name === "string" && item.name.trim()) ||
      "Tiêu chí";
    const rawScore = item.metricScore ?? item.MetricScore ?? item.score ?? item.Score ?? 0;
    const score = normalizeTo100(rawScore);
    const comment =
      (typeof item.explanation === "string" && item.explanation) ||
      (typeof item.Explanation === "string" && item.Explanation) ||
      (typeof item.metricValue === "string" && item.metricValue) ||
      (typeof item.MetricValue === "string" && item.MetricValue) ||
      "";
    return { name, score, maxScore: 100, comment: cleanAiText(comment) };
  };

  /** Chỉ dùng khi response cũ thiếu Pillar. */
  const bucketHeuristic = (category: string, metricName: string): keyof AIEvaluationReport["subMetrics"] => {
    const s = `${String(category)} ${String(metricName)}`.toLowerCase();
    const financialHits = [
      "financial", "revenue", "monetiz", "pricing", "margin", "burn", "runway", "funding",
      "business", "model", "unit economics", "cash flow", "go-to-market", "go to market", "gtm",
      "cac", "ltv", "p&l", "profitability", "commercial", "sales", "projection", "budget", "scalability"
    ];
    for (const k of financialHits) if (s.includes(k)) return "financial";
    const tractionHits = [
      "traction", "growth", "customer", "user", "retention", "churn", "validation", "scale", "adoption", "milestone",
    ];
    for (const k of tractionHits) if (s.includes(k)) return "traction";
    const productHits = [
      "product", "solution", "technology", "tech", "mvp", "roadmap", "platform", "feature", "differentiation", "architecture", "ux",
    ];
    for (const k of productHits) if (s.includes(k)) return "product";
    const marketHits = [
      "market", "competit", "competitor", "tam", "industry", "sector", "positioning", "demand", "opportunity", "timing",
    ];
    for (const k of marketHits) if (s.includes(k)) return "market";
    const teamHits = ["team", "founder", "leadership", "hiring", "culture", "talent", "execution"];
    for (const k of teamHits) if (s.includes(k)) return "team";
    return "team";
  };

  const pillarToKey = (pillarRaw: unknown): keyof AIEvaluationReport["subMetrics"] | null => {
    const p = String(pillarRaw ?? "").trim().toUpperCase();
    if (p === "TEAM") return "team";
    if (p === "MARKET") return "market";
    if (p === "PRODUCT") return "product";
    if (p === "TRACTION") return "traction";
    if (p === "FINANCIAL") return "financial";
    if (p === "OTHER") return "other";
    return null;
  };

  for (const item of raw) {
    const category = item?.category ?? item?.Category ?? "";
    const metricName = item?.metricName ?? item?.MetricName ?? "";
    const sm = rawItemToSubMetric(item);
    if (!sm) continue;
    const fromPillar = pillarToKey(item?.pillar ?? item?.Pillar ?? item?.dimension ?? item?.Dimension);
    const key = fromPillar ?? bucketHeuristic(category, metricName);
    buckets[key].push(sm);
  }
  return buckets;
}

/**
 * Determine pitchDeckScore / businessPlanScore based on the document types
 * that the backend tells us were actually evaluated.
 */
function assignDocScores(
  overallScore: number | null,
  evaluatedDocTypes?: string[],
  explicitPD?: number | null,
  explicitBP?: number | null
): { pitchDeckScore: number | null; businessPlanScore: number | null } {
  const types = (evaluatedDocTypes ?? []).map(t => t.toLowerCase());
  const hasPD = types.includes("pitch_deck");
  const hasBP = types.includes("business_plan");

  return {
    pitchDeckScore: hasPD ? (explicitPD ?? overallScore) : null,
    businessPlanScore: hasBP ? (explicitBP ?? overallScore) : null
  };
}

function mapLatestScoreToReport(data: any, evaluatedDocTypes?: string[]): AIEvaluationReport {
  const runId = Number(
    data?.evaluationRunId ??
    data?.EvaluationRunId ??
    data?.evaluationRunID ??
    data?.EvaluationRunID ??
    data?.runId ??
    data?.RunId ??
    data?.evaluationId ??
    data?.EvaluationId ??
    data?.id ??
    0
  ) || 0;
 
  const overallScore = readOptionalFlatScore100(data, "overallScore", "OverallScore", "overall_score", "score", "Score", "aiScore", "AiScore", "latestEvaluation.overallScore", "aiEvaluation.overallScore");
  const teamScore = readOptionalFlatScore100(data, "teamScore", "TeamScore", "team_score", "latestEvaluation.teamScore", "aiEvaluation.teamScore");
  const marketScore = readOptionalFlatScore100(data, "marketScore", "MarketScore", "market_score", "latestEvaluation.marketScore", "aiEvaluation.marketScore");
  const productScore = readOptionalFlatScore100(data, "productScore", "ProductScore", "product_score", "latestEvaluation.productScore", "aiEvaluation.productScore");
  const tractionScore = readOptionalFlatScore100(data, "tractionScore", "TractionScore", "traction_score", "latestEvaluation.tractionScore", "aiEvaluation.tractionScore");
  const financialScore = readOptionalFlatScore100(data, "financialScore", "FinancialScore", "financial_score", "latestEvaluation.financialScore", "aiEvaluation.financialScore");

  const recommendationsRaw = data?.recommendations ?? data?.Recommendations ?? data?.improvementRecommendations ?? data?.ImprovementRecommendations ?? [];
  const recommendations: Recommendation[] = Array.isArray(recommendationsRaw)
    ? recommendationsRaw.map((r: any) => ({
        category: r?.category ?? r?.Category ?? "",
        priority: (() => {
          const p = String(r?.priority ?? r?.Priority ?? "MEDIUM").toUpperCase();
          return p === "HIGH" || p === "LOW" ? p : "MEDIUM";
        })() as "HIGH" | "MEDIUM" | "LOW",
        text: r?.recommendationText ?? r?.RecommendationText ?? r?.text ?? r?.recommendation ?? "",
        impact: r?.expectedImpact ?? r?.ExpectedImpact ?? r?.impact ?? "",
      }))
    : [];

  const pitchDeckScore = readOptionalFlatScore100(data, "pitchDeckScore", "PitchDeckScore", "pitch_deck_score");
  const businessPlanScore = readOptionalFlatScore100(data, "businessPlanScore", "BusinessPlanScore", "business_plan_score");

  const docScores = assignDocScores(overallScore, evaluatedDocTypes, pitchDeckScore, businessPlanScore);

  return {
    evaluationId: String(runId),
    startupId: String(data?.startupId ?? data?.StartupId ?? data?.startup_id ?? ""),
    status: "COMPLETED",
    overallScore,
    ...docScores,
    teamScore,
    marketScore,
    productScore,
    tractionScore,
    financialScore,
    calculatedAt: formatDate(data?.calculatedAt ?? data?.CalculatedAt ?? data?.calculated_at ?? data?.submittedAt ?? data?.SubmittedAt),
    generatedAt: formatDate(data?.generatedAt ?? data?.GeneratedAt ?? data?.generated_at ?? data?.created_at ?? data?.CreatedAt ?? data?.updatedAt ?? data?.UpdatedAt),
    isCurrent: true,
    configVersion: data?.configVersion ?? data?.ConfigVersion ?? "",
    modelVersion: data?.modelVersion ?? data?.ModelVersion ?? "",
    promptVersion: data?.promptVersion ?? data?.PromptVersion ?? "",
    snapshotLabel: data?.snapshotLabel ?? data?.SnapshotLabel ?? (data?.calculatedAt ? `Đánh giá ${data.calculatedAt}` : `Đánh giá #${runId}`),
    warningMessages: asStringArray(data?.warnings ?? data?.Warnings ?? []),
    executiveSummary: data?.executiveSummary ?? data?.ExecutiveSummary ?? data?.summary ?? data?.Summary ?? "",
    strengths: asStringArray(data?.strengths ?? data?.Strengths ?? []),
    opportunities: asStringArray(data?.opportunities ?? data?.Opportunities ?? []),
    risks: asStringArray(data?.risks ?? data?.Risks ?? []),
    concerns: asStringArray(data?.concerns ?? data?.Concerns ?? []),
    gaps: asStringArray(data?.gaps ?? data?.Gaps ?? []),
    recommendations,
    subMetrics: parseLatestScoreSubMetrics(data),
  } as AIEvaluationReport;
}

function mapCanonicalToReport(runId: number, data: any, evaluatedDocTypes?: string[], explicitPD?: number | null, explicitBP?: number | null, rawPD?: any, rawBP?: any, metadata?: { submittedAt?: string; updatedAt?: string }): AIEvaluationReport {
  const criteria: any[] = data?.criteria_results ?? data?.criteria ?? [];
  const overall = data?.overall_result ?? data;
  const narr = data?.narrative ?? data;

  const overallScore = normalizeTo100(
    overall?.overall_score ?? overall?.overallScore ??
    data?.overall_score ?? data?.overallScore ?? data?.OverallScore ??
    data?.score ?? data?.Score ?? data?.aiScore ??
    overall?.score ?? 0
  );

  const tScore = getCriterionScore(criteria, "team", "team_", "execution", "founder");
  const mScore = getCriterionScore(criteria, "market", "market_", "timing", "attractiveness");
  const pScore = getCriterionScore(criteria, "solution", "product", "differentiation", "solution_", "tech");
  const trScore = getCriterionScore(criteria, "traction", "validation", "validation_", "growth");
  const fScore = getCriterionScore(criteria, "business", "financial", "model", "revenue", "business_", "scalability");

  // Fallback to flat scores if criteria results are missing or 0
  const teamScore = tScore || readOptionalFlatScore100(data, "teamScore", "TeamScore", "team_score", "latestEvaluation.teamScore", "aiEvaluation.teamScore") || 0;
  const marketScore = mScore || readOptionalFlatScore100(data, "marketScore", "MarketScore", "market_score", "latestEvaluation.marketScore", "aiEvaluation.marketScore") || 0;
  const productScore = pScore || readOptionalFlatScore100(data, "productScore", "ProductScore", "product_score", "latestEvaluation.productScore", "aiEvaluation.productScore") || 0;
  const tractionScore = trScore || readOptionalFlatScore100(data, "tractionScore", "TractionScore", "traction_score", "latestEvaluation.tractionScore", "aiEvaluation.tractionScore") || 0;
  const financialScore = fScore || readOptionalFlatScore100(data, "financialScore", "FinancialScore", "financial_score", "latestEvaluation.financialScore", "aiEvaluation.financialScore") || 0;

  const executiveSummary = cleanAiText(
    narr?.executive_summary ?? narr?.summary ?? narr?.conclusion ?? 
    overall?.summary ?? overall?.executive_summary ?? 
    data?.summary ?? data?.executive_summary ?? ""
  );
  const warnings = asStringArray(data?.warnings ?? data?.processing_warnings ?? narr?.warnings ?? []);

  // Use explicit document types from backend if available
  const { pitchDeckScore, businessPlanScore } = evaluatedDocTypes && evaluatedDocTypes.length > 0
    ? assignDocScores(overallScore, evaluatedDocTypes, explicitPD, explicitBP)
    : (() => {
        // Legacy fallback: heuristic text-matching (only for old runs without evaluatedDocumentTypes)
        const fullText = (executiveSummary + " " + (data?.snapshot_label ?? "") + " " + warnings.join(" ")).toLowerCase();
        const mentionsBP = fullText.includes("business plan") || fullText.includes("kế hoạch kinh doanh");
        const mentionsPD = fullText.includes("pitch deck") || fullText.includes("bản thuyết trình");
        const bpMissing = fullText.includes("business plan not provided") || fullText.includes("thiếu business plan") || fullText.includes("không có business plan");
        const pdMissing = fullText.includes("pitch deck not provided") || fullText.includes("thiếu pitch deck") || fullText.includes("không có pitch deck");

        if (mentionsBP && !bpMissing && mentionsPD && !pdMissing) {
          return { pitchDeckScore: overallScore, businessPlanScore: overallScore };
        } else if (mentionsBP && !bpMissing) {
          return { pitchDeckScore: 0, businessPlanScore: overallScore };
        } else if (mentionsPD && !pdMissing) {
          return { pitchDeckScore: overallScore, businessPlanScore: 0 };
        }
        return { pitchDeckScore: overallScore, businessPlanScore: null };
      })();

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
      let category = r.category ?? r.type ?? r.categoryName ?? "";
      
      // Humanize category
      const catMap: Record<string, string> = {
        "VALIDATION_PRIORITY": "Xác thực dữ liệu",
        "STRATEGIC_CLARITY": "Chi tiết chiến lược",
        "PRODUCT_DEVELOPMENT": "Phát triển sản phẩm",
        "MARKET_EXPANSION": "Mở rộng thị trường",
        "FINANCIAL_PLANNING": "Kế hoạch tài chính"
      };
      if (catMap[category]) {
        category = catMap[category];
      } else {
        category = category.replace(/_/g, ' ');
      }

      // Hide technical impact/criterion name if it looks like an internal ID (has underscores but no spaces)
      const impactRaw = r.impact ?? r.expected_impact ?? r.expectedImpact ?? r.expected_impact ?? "";
      const impact = (impactRaw.includes('_') && !impactRaw.includes(' ')) ? "" : impactRaw;

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

  const result = {
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
    calculatedAt: formatDate(metadata?.submittedAt ?? data?.calculated_at ?? data?.calculatedAt ?? data?.submitted_at ?? data?.submittedAt),
    generatedAt: formatDate(metadata?.updatedAt ?? data?.generated_at ?? data?.generatedAt ?? data?.created_at ?? data?.createdAt ?? data?.updatedAt ?? data?.UpdatedAt),
    isCurrent: false,
    configVersion: data?.config_version ?? data?.configVersion ?? "",
    modelVersion: data?.model_version ?? data?.modelVersion ?? "",
    promptVersion: data?.prompt_version ?? data?.promptVersion ?? "",
    snapshotLabel: data?.snapshot_label ?? data?.title ?? (data?.calculated_at ? `Đánh giá ${data.calculated_at}` : `Đánh giá #${runId}`),
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
      other: [],
    },
    pitchDeckReport: rawPD ? mapCanonicalToReport(runId, rawPD, ["pitch_deck"], explicitPD) : null,
    businessPlanReport: rawBP ? mapCanonicalToReport(runId, rawBP, ["business_plan"], explicitBP) : null,
  } as AIEvaluationReport;

  console.log(`[CanonicalMapper] Mapped report for run ${runId}:`, {
    overallScore,
    teamScore,
    marketScore,
    productScore,
    tractionScore,
    financialScore,
    hasSummary: !!executiveSummary,
    criteriaCount: criteria.length
  });

  return result;
}

export { normalizeTo100, mapCanonicalToReport, mapLatestScoreToReport, mapStatusToUI };
