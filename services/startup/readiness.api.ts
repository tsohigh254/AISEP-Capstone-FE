import axios from "../interceptor";
import type { StartupReadinessResult } from "@/types/readiness";

export const GetStartupReadiness = () => {
  return axios.get<IBackendRes<StartupReadinessResult>>("/api/startups/me/readiness");
};

export const RecalculateStartupReadiness = () => {
  return axios.post<IBackendRes<StartupReadinessResult>>("/api/startups/me/readiness/recalculate");
};
