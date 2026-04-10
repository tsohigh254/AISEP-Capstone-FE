import axios from "../interceptor";
import type {
  EvaluationSubmitResponse,
  EvaluationStatusResponse,
  EvaluationReportResponse,
  AIScoreLatestResponse,
  AIScoreHistoryResponse,
} from "@/app/startup/ai-evaluation/types";

// ─── Startup: trigger evaluation ────────────────────────────────
export const TriggerEvaluation = (documentId: number) => {
  return axios.post<IBackendRes<EvaluationSubmitResponse>>(
    `/api/ai/evaluate/${documentId}`
  );
};

// ─── Startup: poll evaluation status ────────────────────────────
export const GetEvaluationStatus = (evaluationRunId: number) => {
  return axios.get<IBackendRes<EvaluationStatusResponse>>(
    `/api/ai/evaluations/${evaluationRunId}/status`
  );
};

// ─── Startup: get evaluation report by run ID ───────────────────
export const GetEvaluationReport = (evaluationRunId: number) => {
  return axios.get<IBackendRes<EvaluationReportResponse>>(
    `/api/ai/evaluations/${evaluationRunId}/report`
  );
};

// ─── Startup: latest AI score (from DB) ─────────────────────────
export const GetLatestScore = () => {
  return axios.get<IBackendRes<AIScoreLatestResponse>>(
    `/api/ai/scores/latest`
  );
};

// ─── Startup: score history (from DB) ───────────────────────────
export const GetScoreHistory = () => {
  return axios.get<IBackendRes<AIScoreHistoryResponse>>(
    `/api/ai/history`
  );
};

// ─── Startup: detailed report for a startup ─────────────────────
export const GetStartupReport = (startupId: number) => {
  return axios.get<IBackendRes<EvaluationReportResponse>>(
    `/api/ai/reports/${startupId}`
  );
};
