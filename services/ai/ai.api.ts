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
