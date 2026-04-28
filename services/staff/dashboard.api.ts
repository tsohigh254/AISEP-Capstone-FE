import axios from "../interceptor";

export interface IStaffDashboardStats {
  totalUsers: number;
  lockedAccounts: number;
  pendingKycCount: number;
  escalatedComplaintsCount: number;
  aiServiceOnline: boolean;
  checkedAt: string;
}

export interface IKycTrendPoint {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface IKycTrend {
  period: string;
  points: IKycTrendPoint[];
}

export interface IActivityFeedItem {
  logId: number;
  actionType: string;
  entityType: string;
  entityId: number | null;
  actionDetails: string | null;
  userId: number | null;
  userEmail: string | null;
  createdAt: string;
}

export const GetDashboardStats = () =>
  axios.get<IBackendRes<IStaffDashboardStats>>("/api/staff/dashboard/stats");

export const GetKycTrend = (period: "7D" | "30D" = "7D") =>
  axios.get<IBackendRes<IKycTrend>>("/api/staff/dashboard/kyc-trend", {
    params: { period },
  });

export const GetActivityFeed = (limit: number = 10) =>
  axios.get<IBackendRes<IActivityFeedItem[]>>("/api/staff/activity/feed", {
    params: { limit },
  });
