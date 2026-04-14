"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, BadgeCheck, Loader2, Send, X } from "lucide-react";
import { CanInviteInvestor, InviteInvestorConnection } from "@/services/connection/connection.api";

interface InvestorConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: {
    name: string;
    logo: string;
    type: string;
    investorId: number;
  } | null;
  onSuccess?: (connectionId: number) => void;
}

const MAX_MESSAGE_LENGTH = 300;

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = (error as { response?: { data?: unknown } }).response;
  const data = response?.data as
    | { code?: string; errorCode?: string; error?: { code?: string } }
    | undefined;
  return data?.error?.code || data?.code || data?.errorCode;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
};

const REASON_CODE_LABELS: Record<string, string> = {
  INVESTOR_ACCOUNT_INACTIVE: "Tài khoản investor đang bị khóa hoặc ngưng hoạt động.",
  INVESTOR_PROFILE_NOT_APPROVED: "Hồ sơ investor chưa được duyệt.",
  INVESTOR_KYC_NOT_APPROVED: "KYC của investor chưa được duyệt hoặc không còn hợp lệ.",
  INVESTOR_NOT_ACCEPTING_CONNECTIONS: "Investor hiện đang tắt nhận yêu cầu kết nối mới.",
};

const getReasonLabel = (codes: string[]): string => {
  // Priority: account > profile > kyc > toggle
  const priority = [
    "INVESTOR_ACCOUNT_INACTIVE",
    "INVESTOR_PROFILE_NOT_APPROVED",
    "INVESTOR_KYC_NOT_APPROVED",
    "INVESTOR_NOT_ACCEPTING_CONNECTIONS",
  ];
  const first = priority.find((c) => codes.includes(c));
  return first ? REASON_CODE_LABELS[first] : "Không thể gửi lời mời kết nối lúc này.";
};

export function InvestorConnectionModal({
  isOpen,
  onClose,
  investor,
  onSuccess,
}: InvestorConnectionModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [canInviteResult, setCanInviteResult] = useState<ICanInviteResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setIsSubmitting(false);
      setCanInviteResult(null);
      return;
    }
    if (!investor) return;

    const check = async () => {
      setIsChecking(true);
      try {
        const res = await CanInviteInvestor(investor.investorId) as IBackendRes<ICanInviteResult>;
        if (res?.isSuccess && res.data) {
          setCanInviteResult(res.data);
        } else {
          // fallback: assume can invite if check fails (non-blocking)
          setCanInviteResult({ canInvite: true, reasonCodes: [], messageMaxLength: 300 });
        }
      } catch {
        setCanInviteResult({ canInvite: true, reasonCodes: [], messageMaxLength: 300 });
      } finally {
        setIsChecking(false);
      }
    };
    void check();
  }, [isOpen, investor]);

  if (!isOpen || !investor) return null;

  const maxLen = canInviteResult?.messageMaxLength ?? 300;
  const canSend = canInviteResult?.canInvite !== false;

  const handleSubmit = async () => {
    if (isSubmitting || !canSend) return;

    const trimmedMessage = message.trim();
    setIsSubmitting(true);
    try {
      const res = await InviteInvestorConnection({
        investorId: investor.investorId,
        message: trimmedMessage || undefined,
      });

      const isSuccess = Boolean(res?.success || res?.isSuccess);
      if (!isSuccess) {
        toast.error(res?.message || "Không thể gửi lời mời kết nối.");
        return;
      }

      toast.success("Đã gửi lời mời kết nối thành công.");
      onSuccess?.(res.data?.connectionID ?? 0);
      onClose();
    } catch (error) {
      const status = getErrorStatus(error);
      const code = getErrorCode(error);
      if (status === 409 && code) {
        toast.error(REASON_CODE_LABELS[code] ?? "Gửi lời mời thất bại. Vui lòng thử lại.");
      } else {
        toast.error("Gửi lời mời thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative mx-0 w-full max-w-[560px] overflow-hidden rounded-t-[24px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:mx-4 sm:rounded-[20px]">
        <div className="px-6 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="relative flex-shrink-0">
                <div className="relative h-12 w-12 overflow-hidden rounded-[14px] ring-2 ring-white shadow-md">
                  {investor.logo ? (
                    <Image
                      src={investor.logo}
                      alt={investor.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-[13px] font-bold uppercase text-slate-600">
                      {investor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-amber-400 ring-2 ring-white">
                  <BadgeCheck className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              <div className="min-w-0">
                <p className="mb-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-amber-500">
                  Gui loi moi ket noi
                </p>
                <p className="truncate text-[15px] font-bold leading-tight text-slate-900">
                  {investor.name}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-slate-400">
                  {investor.type}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:opacity-60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border-y border-slate-100 bg-slate-50/70 px-6 py-5">
          {/* Can-invite check banner */}
          {isChecking ? (
            <div className="mb-4 flex items-center gap-2 text-[12px] text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang kiểm tra trạng thái nhận kết nối...
            </div>
          ) : !canSend && canInviteResult ? (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{getReasonLabel(canInviteResult.reasonCodes)}</span>
            </div>
          ) : null}

          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            Lời nhắn mở đầu (tùy chọn)
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, maxLen))}
            rows={4}
            disabled={isSubmitting || !canSend}
            placeholder="VD: Startup chúng tôi rất phù hợp với thesis đầu tư của anh/chị..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-700 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <p className="mt-2 text-right text-[11px] text-slate-400">
            {message.length}/{maxLen}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isChecking || !canSend}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1e293b] disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Gửi lời mời
          </button>
        </div>
      </div>
    </div>
  );
}
