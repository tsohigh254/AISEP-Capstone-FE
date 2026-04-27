import axios from "../interceptor";

export interface ISubmitEvaluationRequest {
  startupId: number;
  documentIds?: number[];
}

export const SubmitEvaluation = (data: ISubmitEvaluationRequest) => {
  return axios.post<IBackendRes<any>>(`/api/ai/evaluation/submit`, data);
};

export const GetEvaluationStatus = (runId: number) => {
  return axios.get<IBackendRes<any>>(`/api/ai/evaluation/${runId}/status`);
};

export const GetEvaluationReport = (runId: number) => {
  return axios.get<IBackendRes<any>>(`/api/ai/evaluation/${runId}/report`);
};

export const GetEvaluationHistory = (startupId: number) => {
  return axios.get<IBackendRes<any>>(`/api/ai/evaluation/history/${startupId}`);
};

export const GetLatestScore = () => {
  return axios.get<IBackendRes<any>>(`/api/ai/scores/latest`);
};

export const GetScoreHistory = () => {
  return axios.get<IBackendRes<any>>(`/api/ai/history`);
};

export interface IInvestorAgentChatRequest {
  query: string;
  thread_id?: string;
}

/**
 * Initiates the Investor Agent chat stream.
 * Note: Since this returns a stream, use fetch() directly or a specialized SSE handler
 * if the interceptor/axios doesn't support streaming well.
 */
export const InvestorAgentChatStreamEndpoint = "/api/ai/investor-agent/chat/stream";

/** One-shot research (no client thread); .NET assigns a fresh research-* thread_id to Python /chat/stream. */
export const InvestorAgentResearchEndpoint = "/api/ai/investor-agent/research";
