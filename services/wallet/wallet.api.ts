import axios from "../interceptor";

export interface IWalletInfo {
  walletId: number
  advisorId: number
  balance: number
  totalEarned: number
  totalWithdrawn: number
  createdAt: string
}

export interface ITransactionInfo {
  transactionID: number;
  walletId: number;
  amount: number;
  type: ETransactionType | number | string;
  status: ETransactionStatus | number | string;
  createdAt: string;
}

export interface ITransactionsParams {
  page?: number;
  pageSize?: number;
  transactionType?: ETransactionType;
  transactionStatus?: ETransactionStatus;
}

export enum ETransactionType {
  Deposit = 0,
  Withdrawal = 1,
}

export enum ETransactionStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
}

export const GetWalletInfo = () => {
  return axios.get<IBackendRes<IWalletInfo>>(`/api/wallets/me`);
};

export const GetWalletTransactions = (
  walletId: number,
  params: ITransactionsParams = {},
) => {
  const serializedParams = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value === undefined || value === null) return acc;
      acc[key] = String(value);
      return acc;
    }, {}),
  ).toString();

  return axios.get<IBackendRes<IPagingData<ITransactionInfo>>>(
    `/api/wallets/${walletId}/transactions?${serializedParams}`,
  );
};
