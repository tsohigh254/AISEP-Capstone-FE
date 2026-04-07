"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import {
  ETransactionStatus,
  ETransactionType,
  GetWalletInfo,
  GetWalletTransactions,
  ITransactionInfo,
  IWalletInfo,
} from "@/services/wallet/wallet.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw, Wallet, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

const PAGE_SIZE = 10;

const transactionTypeLabel: Record<number, string> = {
  [ETransactionType.Deposit]: "Nạp tiền",
  [ETransactionType.Withdrawal]: "Rút tiền",
};

const transactionStatusLabel: Record<number, string> = {
  [ETransactionStatus.Pending]: "Đang xử lý",
  [ETransactionStatus.Completed]: "Thành công",
  [ETransactionStatus.Failed]: "Thất bại",
};

function toNumberValue(value: string): number | null {
  if (value === "all") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatCurrency(amount: number | null | undefined) {
  const safeValue = Number.isFinite(amount) ? Number(amount) : 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(safeValue);
}

function formatDate(dateInput: string | null | undefined) {
  if (!dateInput) return "--";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeTypeLabel(typeValue: ITransactionInfo["transactionType"]) {
  const asNumber = typeof typeValue === "number" ? typeValue : Number(typeValue);
  if (!Number.isNaN(asNumber) && transactionTypeLabel[asNumber]) {
    return transactionTypeLabel[asNumber];
  }
  return String(typeValue ?? "Unknown");
}

function normalizeStatusLabel(statusValue: ITransactionInfo["transactionStatus"]) {
  const asNumber = typeof statusValue === "number" ? statusValue : Number(statusValue);
  if (!Number.isNaN(asNumber) && transactionStatusLabel[asNumber]) {
    return transactionStatusLabel[asNumber];
  }
  return String(statusValue ?? "Unknown");
}

function statusBadgeClass(statusValue: ITransactionInfo["transactionStatus"]) {
  const asNumber = typeof statusValue === "number" ? statusValue : Number(statusValue);
  if (asNumber === ETransactionStatus.Completed) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (asNumber === ETransactionStatus.Pending) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (asNumber === ETransactionStatus.Failed) {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function AdvisorWalletPage() {
  const [walletInfo, setWalletInfo] = useState<IWalletInfo | null>(null);
  const [transactions, setTransactions] = useState<ITransactionInfo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchTransactions = useCallback(
    async (walletId: number, nextPage: number, nextTypeFilter: string, nextStatusFilter: string) => {
      setError(null);
      setIsLoadingTransactions(true);
      try {
        const typeValue = toNumberValue(nextTypeFilter);
        const statusValue = toNumberValue(nextStatusFilter);

        const res = await GetWalletTransactions(walletId, {
          page: nextPage,
          pageSize: PAGE_SIZE,
          transactionType: typeValue === null ? undefined : (typeValue as ETransactionType),
          transactionStatus: statusValue === null ? undefined : (statusValue as ETransactionStatus),
        });

        const envelope = res as IBackendRes<IPagingData<ITransactionInfo>>;
        const itemList = envelope.data?.items ?? [];
        const paging = envelope.data?.paging;

        setTransactions(itemList);
        setTotalPages(paging?.totalPages ?? Math.max(1, Math.ceil((paging?.totalItems ?? itemList.length) / PAGE_SIZE)));
      } catch (fetchError) {
        console.error(fetchError);
        setTransactions([]);
        setTotalPages(1);
        setError("Không thể tải lịch sử giao dịch. Vui lòng thử lại.");
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    [],
  );

  const loadWallet = useCallback(async (): Promise<IWalletInfo | null> => {
    setError(null);
    setIsLoadingWallet(true);
    try {
      const res = await GetWalletInfo();
      const envelope = res as IBackendRes<IWalletInfo>;
      const wallet = envelope.data ?? null;
      setWalletInfo(wallet);
      return wallet;
    } catch (loadError) {
      console.error(loadError);
      setWalletInfo(null);
      setTransactions([]);
      setTotalPages(1);
      setError("Không thể tải thông tin ví. Vui lòng thử lại.");
      setIsLoadingTransactions(false);
      return null;
    } finally {
      setIsLoadingWallet(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    if (!walletInfo?.walletId) return;
    void fetchTransactions(walletInfo.walletId, page, typeFilter, statusFilter);
  }, [fetchTransactions, page, statusFilter, typeFilter, walletInfo?.walletId]);

  const hasTransactions = useMemo(() => transactions.length > 0, [transactions.length]);

  return (
    <AdvisorShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Ví</h1>
          <p className="text-sm text-slate-500">Theo dõi số dư, tổng thu nhập và lịch sử giao dịch của bạn.</p>
        </div>

        {error && (
          <Card className="border-rose-200 bg-rose-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-rose-700">{error}</p>
                <Button
                  variant="outline"
                  className="border-rose-300 bg-white"
                  onClick={async () => {
                    const wallet = await loadWallet();
                    const walletId = wallet?.walletId;
                    if (walletId) {
                      await fetchTransactions(walletId, page, typeFilter, statusFilter);
                    }
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Số dư hiện tại</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWallet ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(walletInfo?.balance)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Tổng đã nhận</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWallet ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                    <ArrowDownToLine className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(walletInfo?.totalEarned)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Tổng đã rút</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWallet ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-sky-100 p-2 text-sky-700">
                    <ArrowUpFromLine className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(walletInfo?.totalWithdrawn)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Bộ lọc giao dịch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500">Loại giao dịch</p>
                <Select
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Tất cả</option>
                  <option value={String(ETransactionType.Deposit)}>{transactionTypeLabel[ETransactionType.Deposit]}</option>
                  <option value={String(ETransactionType.Withdrawal)}>{transactionTypeLabel[ETransactionType.Withdrawal]}</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500">Trạng thái</p>
                <Select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Tất cả</option>
                  <option value={String(ETransactionStatus.Pending)}>{transactionStatusLabel[ETransactionStatus.Pending]}</option>
                  <option value={String(ETransactionStatus.Completed)}>{transactionStatusLabel[ETransactionStatus.Completed]}</option>
                  <option value={String(ETransactionStatus.Failed)}>{transactionStatusLabel[ETransactionStatus.Failed]}</option>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={async () => {
                    const wallet = await loadWallet();
                    const walletId = wallet?.walletId;
                    if (walletId) {
                      await fetchTransactions(walletId, page, typeFilter, statusFilter);
                    }
                  }}
                  className="w-full md:w-auto"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Làm mới
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Lịch sử giao dịch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingTransactions ? (
              <div className="flex min-h-[180px] items-center justify-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Đang tải giao dịch...</span>
              </div>
            ) : !hasTransactions ? (
              <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">
                Không có giao dịch phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-3 pr-4 font-semibold">ID</th>
                      <th className="py-3 pr-4 font-semibold">Loại</th>
                      <th className="py-3 pr-4 font-semibold">Trạng thái</th>
                      <th className="py-3 pr-4 font-semibold">Số tiền</th>
                      <th className="py-3 pr-4 font-semibold">Số dư sau GD</th>
                      <th className="py-3 pr-4 font-semibold">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((transaction) => (
                      <tr key={`${transaction.transactionId}-${transaction.createdAt}`} className="hover:bg-slate-50/60">
                        <td className="py-3 pr-4 font-medium text-slate-800">#{transaction.transactionId}</td>
                        <td className="py-3 pr-4 text-slate-700">{normalizeTypeLabel(transaction.transactionType)}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={statusBadgeClass(transaction.transactionStatus)}>
                            {normalizeStatusLabel(transaction.transactionStatus)}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-900">{formatCurrency(transaction.amount)}</td>
                        <td className="py-3 pr-4 text-slate-700">{formatCurrency(transaction.balanceAfterTransaction)}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatDate(transaction.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Trang {page} / {Math.max(totalPages, 1)}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1 || isLoadingTransactions}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages || isLoadingTransactions}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Sau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdvisorShell>
  );
}
