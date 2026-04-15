"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { Cashout } from "@/services/payment/payment.api";
import {
  CreateWallet,
  ETransactionStatus,
  ETransactionType,
  GetWalletInfo,
  GetWalletTransactions,
  ITransactionInfo,
  IWalletInfo,
  UpdateWallet,
} from "@/services/wallet/wallet.api";
import { GetBankOptions, IBankOption } from "@/services/external/external.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  RefreshCcw,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

const PAGE_SIZE = 10;

const transactionTypeLabel: Record<number, string> = {
  [ETransactionType.Deposit]: "Nạp tiền",
  [ETransactionType.Withdrawal]: "Rút tiền",
};

const transactionStatusLabel: Record<number, string> = {
  [ETransactionStatus.Pending]: "Đang chờ",
  [ETransactionStatus.Completed]: "Hoàn thành",
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

function normalizeTypeLabel(typeValue: ITransactionInfo["type"]) {
  const asNumber = typeof typeValue === "number" ? typeValue : Number(typeValue);
  if (!Number.isNaN(asNumber) && transactionTypeLabel[asNumber]) {
    return transactionTypeLabel[asNumber];
  }
  return String(typeValue ?? "Unknown");
}

function normalizeStatusLabel(statusValue: ITransactionInfo["status"]) {
  const asNumber = typeof statusValue === "number" ? statusValue : Number(statusValue);
  if (!Number.isNaN(asNumber) && transactionStatusLabel[asNumber]) {
    return transactionStatusLabel[asNumber];
  }
  return String(statusValue ?? "Unknown");
}

function statusBadgeClass(statusValue: ITransactionInfo["status"]) {
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

function getHttpStatusCode(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const maybeError = error as { response?: { status?: unknown } };
  return typeof maybeError.response?.status === "number" ? maybeError.response.status : null;
}

function isDepositTransaction(tx: ITransactionInfo) {
  const status = String(tx.status ?? "").trim().toLowerCase();
  const type = String(tx.type ?? "").trim().toLowerCase();
  const typeAsNumber = typeof tx.type === "number" ? tx.type : Number(tx.type);

  if (status === "deposit" || type === "deposit") {
    return true;
  }

  return !Number.isNaN(typeAsNumber) && typeAsNumber === ETransactionType.Deposit;
}

export default function AdvisorWalletPage() {
  const [walletInfo, setWalletInfo] = useState<IWalletInfo | null>(null);
  const [transactions, setTransactions] = useState<ITransactionInfo[]>([]);
  const [banks, setBanks] = useState<IBankOption[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [cashoutLoadingId, setCashoutLoadingId] = useState<number | null>(null);
  const [cashoutError, setCashoutError] = useState<string | null>(null);
  const [cashoutSuccess, setCashoutSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noWallet, setNoWallet] = useState(false);
  const [bankDraft, setBankDraft] = useState({ bin: "", accountNumber: "" });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankInfoMessage, setBankInfoMessage] = useState<string | null>(null);
  const [bankInfoError, setBankInfoError] = useState<string | null>(null);

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

        const envelope = res as unknown as IBackendRes<IPagingData<ITransactionInfo>>;
        const payload = envelope.data;
        const itemList = payload?.items ?? [];
        const paging = payload?.paging;

        setTransactions(itemList);
        setTotalPages(
          paging?.totalPages ?? Math.max(1, Math.ceil((paging?.totalItems ?? itemList.length) / PAGE_SIZE)),
        );
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
      const envelope = (await GetWalletInfo()) as IBackendRes<IWalletInfo>;
      const wallet = envelope.data ?? null;
      if (wallet?.walletId) {
        setWalletInfo(wallet);
        setNoWallet(false);
        return wallet;
      }
      if (envelope.success || envelope.isSuccess) {
        setWalletInfo(null);
        setNoWallet(true);
        setTransactions([]);
        setTotalPages(1);
        setIsLoadingTransactions(false);
        return null;
      }
      setWalletInfo(null);
      setNoWallet(false);
      setTransactions([]);
      setTotalPages(1);
      setError(envelope.message || "Không thể tải thông tin ví. Vui lòng thử lại.");
      setIsLoadingTransactions(false);
      return null;
    } catch (loadError) {
      console.error(loadError);
      const status = getHttpStatusCode(loadError);
      if (status === 404) {
        setWalletInfo(null);
        setNoWallet(true);
        setTransactions([]);
        setTotalPages(1);
        setIsLoadingTransactions(false);
        return null;
      }
      setWalletInfo(null);
      setNoWallet(false);
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
    setBankDraft({
      bin: walletInfo.bankBin?.trim() ?? "",
      accountNumber: walletInfo.bankAccountNumber?.trim() ?? "",
    });
  }, [walletInfo]);

  useEffect(() => {
    let isMounted = true;

    const loadBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const bankOptions = await GetBankOptions();
        if (!isMounted) return;
        setBanks(bankOptions);
      } catch (bankError) {
        console.error(bankError);
        if (!isMounted) return;
        setBanks([]);
      } finally {
        if (isMounted) {
          setIsLoadingBanks(false);
        }
      }
    };

    void loadBanks();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!walletInfo?.walletId) return;
    void fetchTransactions(walletInfo.walletId, page, typeFilter, statusFilter);
  }, [fetchTransactions, page, statusFilter, typeFilter, walletInfo?.walletId]);

  const hasTransactions = useMemo(() => transactions.length > 0, [transactions.length]);

  const selectedBankForDraft = useMemo(
    () => banks.find((bank) => bank.bin === bankDraft.bin),
    [banks, bankDraft.bin],
  );

  const applyWalletFromEnvelope = useCallback((envelope: IBackendRes<IWalletInfo>) => {
    const next = envelope.data ?? null;
    if (next?.walletId && (envelope.success || envelope.isSuccess)) {
      setWalletInfo(next);
      setNoWallet(false);
      setBankDraft({
        bin: next.bankBin?.trim() ?? "",
        accountNumber: next.bankAccountNumber?.trim() ?? "",
      });
      return next;
    }
    return null;
  }, []);

  const handleSaveBankInfo = useCallback(async () => {
    setBankInfoError(null);
    setBankInfoMessage(null);

    const bin = bankDraft.bin.trim();
    const accountNumber = bankDraft.accountNumber.trim();
    const bankName =
      selectedBankForDraft?.shortName?.trim() || walletInfo?.bankName?.trim() || "";

    if (!bin) {
      setBankInfoError("Vui lòng chọn ngân hàng.");
      return;
    }
    if (!accountNumber) {
      setBankInfoError("Vui lòng nhập số tài khoản.");
      return;
    }
    if (!bankName) {
      setBankInfoError("Không xác định được tên ngân hàng. Vui lòng chọn lại ngân hàng.");
      return;
    }

    setIsSavingBank(true);
    try {
      const envelope = noWallet
        ? ((await CreateWallet(accountNumber, bin, bankName)) as IBackendRes<IWalletInfo>)
        : ((await UpdateWallet(accountNumber, bin, bankName)) as IBackendRes<IWalletInfo>);

      if (!(envelope.success || envelope.isSuccess) || !envelope.data?.walletId) {
        setBankInfoError(envelope.message || "Không lưu được thông tin ngân hàng. Vui lòng thử lại.");
        return;
      }

      const updated = applyWalletFromEnvelope(envelope);
      setBankInfoMessage(noWallet ? "Đã tạo ví thành công." : "Đã cập nhật thông tin ngân hàng.");

      if (updated?.walletId) {
        await fetchTransactions(updated.walletId, page, typeFilter, statusFilter);
      }
    } catch (saveError) {
      console.error(saveError);
      setBankInfoError("Không lưu được thông tin ngân hàng. Vui lòng thử lại.");
    } finally {
      setIsSavingBank(false);
    }
  }, [
    applyWalletFromEnvelope,
    bankDraft.accountNumber,
    bankDraft.bin,
    fetchTransactions,
    noWallet,
    page,
    selectedBankForDraft?.shortName,
    statusFilter,
    typeFilter,
    walletInfo?.bankName,
  ]);

  const handleCashout = useCallback(
    async (tx: ITransactionInfo) => {
      if (!walletInfo?.walletId || !walletInfo.bankAccountNumber?.trim() || !walletInfo.bankBin?.trim()) {
        setCashoutSuccess(null);
        setCashoutError("Vui lòng tạo/cập nhật thông tin ví trước khi rút tiền.");
        return;
      }

      setCashoutLoadingId(tx.transactionID);
      setCashoutError(null);
      setCashoutSuccess(null);

      try {
        await Cashout(tx.transactionID);
        setCashoutSuccess(`Đã gửi yêu cầu rút tiền cho giao dịch #${tx.transactionID}.`);

        const wallet = await loadWallet();
        if (wallet?.walletId) {
          await fetchTransactions(wallet.walletId, page, typeFilter, statusFilter);
        }
      } catch (cashoutApiError) {
        console.error(cashoutApiError);
        setCashoutSuccess(null);
        setCashoutError(`Rút tiền thất bại cho giao dịch #${tx.transactionID}. Vui lòng thử lại.`);
      } finally {
        setCashoutLoadingId(null);
      }
    },
    [fetchTransactions, loadWallet, page, statusFilter, typeFilter, walletInfo?.bankAccountNumber, walletInfo?.bankBin, walletInfo?.walletId],
  );

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

        {(cashoutError || cashoutSuccess) && (
          <Card className={cashoutError ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}>
            <CardContent className="pt-6">
              <p className={`text-sm font-medium ${cashoutError ? "text-rose-700" : "text-emerald-700"}`}>
                {cashoutError ?? cashoutSuccess}
              </p>
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
            <CardTitle className="text-base font-semibold">
              {noWallet ? "Thiết lập ngân hàng nhận tiền" : "Ngân hàng nhận tiền"}
            </CardTitle>
            <p className="text-sm text-slate-500">
              {noWallet
                ? "Tạo ví bằng thông tin tài khoản ngân hàng của bạn. Bạn có thể chỉnh sửa sau."
                : "Cập nhật tài khoản nhận thanh toán khi cần."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(bankInfoError || bankInfoMessage) && (
              <div
                className={`rounded-md border px-3 py-2 text-sm ${
                  bankInfoError
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {bankInfoError ?? bankInfoMessage}
              </div>
            )}

            {!isLoadingWallet && walletInfo?.walletId && !noWallet && (
              <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">Ngân hàng</p>
                  <p className="text-sm font-semibold text-slate-900">{walletInfo.bankName || "--"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Mã BIN</p>
                  <p className="text-sm font-semibold text-slate-900">{walletInfo.bankBin || "--"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Số tài khoản</p>
                  <p className="text-sm font-semibold text-slate-900">{walletInfo.bankAccountNumber || "--"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Ngày tạo ví</p>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(walletInfo.createdAt)}</p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="advisor-wallet-bank">Ngân hàng</Label>
                <Select
                  id="advisor-wallet-bank"
                  value={bankDraft.bin}
                  disabled={isLoadingBanks || isSavingBank || isLoadingWallet}
                  onChange={(event) => {
                    setBankDraft((prev) => ({ ...prev, bin: event.target.value }));
                  }}
                >
                  <option value="">{isLoadingBanks ? "Đang tải..." : "Chọn ngân hàng"}</option>
                  {banks.map((bank) => (
                    <option key={`wallet-${bank.bin}-${bank.shortName}`} value={bank.bin}>
                      {bank.shortName} ({bank.bin})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="advisor-wallet-account">Số tài khoản</Label>
                <input
                  id="advisor-wallet-account"
                  type="text"
                  inputMode="numeric"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Nhập số tài khoản"
                  value={bankDraft.accountNumber}
                  disabled={isSavingBank || isLoadingWallet}
                  onChange={(event) => {
                    setBankDraft((prev) => ({ ...prev, accountNumber: event.target.value }));
                  }}
                />
              </div>
            </div>

            {bankDraft.bin && (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                {selectedBankForDraft?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedBankForDraft.logo}
                    alt={selectedBankForDraft.shortName ?? "Logo ngân hàng"}
                    className="h-6 w-6 rounded-sm object-contain"
                  />
                ) : null}
                <span className="text-sm text-slate-700">
                  {selectedBankForDraft?.shortName || "Đã chọn mã BIN"}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" disabled={isSavingBank || isLoadingWallet} onClick={() => void handleSaveBankInfo()}>
                {isSavingBank ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : noWallet ? (
                  "Tạo ví"
                ) : (
                  "Cập nhật thông tin"
                )}
              </Button>
              {walletInfo?.walletId && !isLoadingWallet ? (
                <span className="text-xs text-slate-500">
                  Số dư: {formatCurrency(walletInfo.balance)} · Đã rút: {formatCurrency(walletInfo.totalWithdrawn)}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Rút tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isCashoutEnabled = isDepositTransaction(tx);
                    const hasWalletBankInfo = Boolean(
                      walletInfo?.walletId && walletInfo.bankAccountNumber?.trim() && walletInfo.bankBin?.trim(),
                    );
                    const canCashout = isCashoutEnabled && hasWalletBankInfo;

                    return (
                      <TableRow key={tx.transactionID}>
                        <TableCell className="font-medium">{tx.transactionID}</TableCell>
                        <TableCell>{normalizeTypeLabel(tx.type)}</TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClass(tx.status)}>{normalizeStatusLabel(tx.status)}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(tx.amount)}</TableCell>
                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        <TableCell>
                          {!isCashoutEnabled ? (
                            <span className="text-xs text-slate-400">Không khả dụng</span>
                          ) : (
                            <div className="flex min-w-[220px] flex-col gap-2">
                              <Button size="sm" disabled={!canCashout || cashoutLoadingId === tx.transactionID} onClick={() => void handleCashout(tx)}>
                                {cashoutLoadingId === tx.transactionID ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang xử lý
                                  </>
                                ) : (
                                  "Rút tiền"
                                )}
                              </Button>
                              {!hasWalletBankInfo && (
                                <span className="text-xs text-amber-700">
                                  Cần cập nhật thông tin ví trước khi rút tiền.
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
