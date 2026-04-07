import axios from "../interceptor";

export interface IWalletInfo {
  walletId: number;
  advisorId: number;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  createdAt: string;
}

export interface ITransactionInfo {
  transactionId: number;
  walletId: number;
  amount: number;
  balanceAfterTransaction?: number;
  transactionType: ETransactionType | number | string;
  transactionStatus: ETransactionStatus | number | string;
  description?: string | null;
  referenceCode?: string | null;
  createdAt: string;
  updatedAt?: string | null;
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
  return axios.get<IBackendRes<IPagingData<ITransactionInfo>>>(
    `/api/wallets/${walletId}/transactions`,
    { params },
  );
};
