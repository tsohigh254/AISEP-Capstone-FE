import axios from "../interceptor";

export interface FinanceTransaction {
  description: string;
  amount: number;
  type: "IN" | "OUT";
  source: string;
  date: string;
}

export interface FinanceSource {
  sourceName: string;
  amount: number;
  percentage: number;
}

export interface StaffFinanceStats {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  pendingAdvisorPayouts: number;
  pendingStartupRefunds: number;
  currentSystemBalance: number;
  incomeSources: FinanceSource[];
  expenseSources: FinanceSource[];
  recentTransactions: FinanceTransaction[];
  totalTransactions: number;
  checkedAt: string;
}

export async function GetFinanceOverview(
  period: "7D" | "30D" = "30D", 
  page: number = 1, 
  pageSize: number = 10
): Promise<IBackendRes<StaffFinanceStats>> {
  const response = await axios.get<IBackendRes<StaffFinanceStats>>(
    `/api/staff/finance/overview?period=${period}&page=${page}&pageSize=${pageSize}`
  );
  return response as any;
}
