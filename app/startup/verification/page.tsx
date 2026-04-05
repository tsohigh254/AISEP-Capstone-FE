"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { StartupShell } from "@/components/startup/startup-shell";
import { cn } from "@/lib/utils";
import { GetStartupKYCStatus, StartupKycCase } from "@/services/startup/startup-kyc.api";

const RESULT_LABEL_MAP: Record<string, string> = {
  VERIFIED_COMPANY: "Doanh nghiệp đã xác minh",
  VERIFIED_FOUNDING_TEAM: "Đội ngũ sáng lập đã xác minh",
  BASIC_VERIFIED: "Xác minh cơ bản",
  PENDING_MORE_INFO: "Cần bổ sung thông tin",
  VERIFICATION_FAILED: "Xác minh thất bại",
  REJECTED: "Từ chối",
  NONE: "",
};

const EXPLANATION_MAP: Record<string, string> = {
  "KYC has not been submitted.": "Bạn chưa gửi hồ sơ xác minh KYC.",
  "KYC submission is under review.": "Hồ sơ KYC của bạn đang được đội ngũ AISEP thẩm định.",
  "Startup KYC has been approved as a verified company.": "Hồ sơ startup đã được phê duyệt với trạng thái doanh nghiệp đã xác minh.",
  "Startup KYC has been approved as a verified founding team.": "Hồ sơ startup đã được phê duyệt với trạng thái đội ngũ sáng lập đã xác minh.",
  "Startup KYC has been approved as basic verified.": "Hồ sơ startup đã được phê duyệt với trạng thái xác minh cơ bản.",
  "Startup KYC has been rejected.": "Hồ sơ KYC của startup đã bị từ chối.",
};

const EMPTY_KYC_CASE: StartupKycCase = {
  id: "",
  startupId: "",
  workflowStatus: "NOT_SUBMITTED",
  resultLabel: "NONE",
  submissionSummary: null,
  requestedAdditionalItems: [],
};

function getReadableExplanation(explanation?: string, fallback?: string) {
  if (!explanation) return fallback || "";
  return EXPLANATION_MAP[explanation] || explanation;
}

export default function KycDashboardPage() {
  const [kycStatus, setKycStatus] = useState<StartupKycCase | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    GetStartupKYCStatus()
      .then((res) => {
        const data = res as unknown as IBackendRes<StartupKycCase>;
        if ((data.success || data.isSuccess) && data.data) {
          setKycStatus(data.data);
        } else {
          setKycStatus(EMPTY_KYC_CASE);
        }
      })
      .catch(() => {
        setKycStatus(EMPTY_KYC_CASE);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStatus();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    const isPending = kycStatus?.workflowStatus === "UNDER_REVIEW" || kycStatus?.workflowStatus === "PENDING_MORE_INFO";

    if (isPending) {
      interval = setInterval(() => {
        void fetchStatus(true);
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [kycStatus?.workflowStatus]);

  if (loading) {
    return (
      <StartupShell>
        <div className="flex items-center justify-center py-32">
          <Clock className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  const status = kycStatus?.workflowStatus || "NOT_SUBMITTED";
  const isVerified = status === "APPROVED";
  const isPending = status === "UNDER_REVIEW";
  const isDraft = status === "DRAFT";
  const isFailed = status === "REJECTED" || status === "PENDING_MORE_INFO" || status === "SUPERSEDED";
  const isNotStarted = status === "NOT_SUBMITTED";

  const statusCfg = isVerified
    ? {
        label: "Đã xác minh",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-400",
        iconWrap: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
        icon: ShieldCheck,
        title: "Startup của bạn đã được xác minh",
        actionLabel: "Xem hồ sơ đã nộp",
        fallbackExplanation: "Hồ sơ của bạn đã được phê duyệt và sẵn sàng tham gia sâu hơn vào hệ sinh thái AISEP.",
      }
    : isPending
      ? {
          label: "Đang thẩm định",
          badge: "bg-blue-50 text-blue-700 border-blue-200/80",
          dot: "bg-blue-400",
          iconWrap: "bg-blue-50 text-blue-600 border-blue-200/80",
          icon: Clock,
          title: "Hồ sơ của bạn đang được thẩm định",
          actionLabel: "Xem hồ sơ đã nộp",
          fallbackExplanation: "Đội ngũ AISEP đang xem xét phiên bản hồ sơ gần nhất mà bạn đã gửi.",
        }
      : isDraft
        ? {
            label: "Bản nháp",
            badge: "bg-slate-50 text-slate-700 border-slate-200/80",
            dot: "bg-slate-400",
            iconWrap: "bg-slate-50 text-slate-500 border-slate-200/80",
            icon: FileText,
            title: "Hồ sơ KYC đang ở trạng thái bản nháp",
            actionLabel: "Tiếp tục hoàn thiện",
            fallbackExplanation: "Bạn có thể tiếp tục chỉnh sửa hồ sơ và gửi khi đã sẵn sàng.",
          }
        : isFailed
          ? {
              label: "Cần cập nhật",
              badge: "bg-amber-50 text-amber-700 border-amber-200/80",
              dot: "bg-amber-400",
              iconWrap: "bg-amber-50 text-amber-600 border-amber-200/80",
              icon: AlertCircle,
              title: "Hồ sơ của bạn cần được cập nhật",
              actionLabel: "Cập nhật hồ sơ",
              fallbackExplanation: "Bạn cần bổ sung hoặc chỉnh sửa thông tin để tiếp tục quy trình xác minh.",
            }
          : {
              label: "Chưa bắt đầu",
              badge: "bg-slate-50 text-slate-600 border-slate-200/80",
              dot: "bg-slate-400",
              iconWrap: "bg-slate-50 text-slate-500 border-slate-200/80",
              icon: Building2,
              title: "Bắt đầu quy trình xác minh startup",
              actionLabel: "Bắt đầu ngay",
              fallbackExplanation: "Hoàn thiện hồ sơ pháp lý và năng lực cốt lõi để nhận huy hiệu Verified từ AISEP.",
            };

  const StatusIcon = statusCfg.icon;
  const lastUpdatedLabel = kycStatus?.updatedAt ? new Date(kycStatus.updatedAt).toLocaleDateString("vi-VN") : null;
  const resultLabelText = RESULT_LABEL_MAP[kycStatus?.resultLabel || "NONE"] || "";
  const summary = kycStatus?.submissionSummary;
  const submittedEntityName = summary?.legalFullName || summary?.projectName || null;
  const actionHref = isNotStarted || isDraft ? "/startup/verification/submit" : isFailed ? "/startup/verification/resubmit" : "/startup/verification/status";
  const feedbackTone =
    status === "REJECTED"
      ? {
          box: "bg-red-50 border-red-200",
          icon: "text-red-500",
          label: "text-red-600",
          body: "text-red-700",
        }
      : status === "PENDING_MORE_INFO"
        ? {
            box: "bg-amber-50 border-amber-200",
            icon: "text-amber-500",
            label: "text-amber-600",
            body: "text-amber-700",
          }
        : {
            box: "bg-slate-50 border-slate-200",
            icon: "text-slate-500",
            label: "text-slate-600",
            body: "text-slate-700",
          };
  const benefitItems = [
    {
      icon: ShieldCheck,
      title: "Độ tin cậy cao",
      description: "Tăng khả năng được tiếp cận bởi các quỹ đầu tư lớn.",
    },
    {
      icon: FileText,
      title: "Mở khóa quyền lợi",
      description: "Ưu tiên hiển thị trên bảng tin công ty tiềm năng.",
    },
    {
      icon: Sparkles,
      title: "Huy hiệu Verified",
      description: "Đánh dấu startup chính danh trên nền tảng AISEP.",
    },
  ];
  const reasonItems = [
    "Bảo vệ ý tưởng và thông tin nhạy cảm khỏi rò rỉ.",
    "Xây dựng uy tín ngay từ ngày đầu với cố vấn và chuyên gia.",
    "Tham gia vào mạng lưới kết nối độc quyền với các quỹ đầu tư mạo hiểm (VC).",
  ];

  return (
    <StartupShell>
      <div className="mx-auto max-w-[1100px] space-y-6 pb-20 animate-in fade-in duration-400">
        <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-4">
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border", statusCfg.iconWrap)}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[20px] font-bold leading-tight text-slate-900">Xác minh startup</h1>
                <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-semibold", statusCfg.badge)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                  {statusCfg.label}
                </span>
                {resultLabelText && (
                  <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                    {resultLabelText}
                  </span>
                )}
              </div>
              <p className="mt-1 max-w-[620px] text-[13px] leading-relaxed text-slate-500">
                Tăng cường uy tín và mở khóa các cơ hội kết nối chuyên sâu với nhà đầu tư thông qua hệ thống xác minh của AISEP.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {lastUpdatedLabel ? `Cập nhật lần cuối ${lastUpdatedLabel}` : "Chưa có cập nhật"}
                </span>
                {submittedEntityName && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    <Building2 className="h-3 w-3" />
                    {submittedEntityName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-[620px] space-y-3">
                    <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
                      <StatusIcon className="h-4 w-4 text-slate-400" />
                      {statusCfg.title}
                    </h2>
                    <p className="text-[13px] leading-relaxed text-slate-600">
                      {getReadableExplanation(kycStatus?.explanation, statusCfg.fallbackExplanation)}
                    </p>
                  </div>

                  <Link
                    href={actionHref}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors",
                      isNotStarted || isFailed
                        ? "bg-[#0f172a] text-white shadow-sm hover:bg-[#1e293b]"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {statusCfg.actionLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {kycStatus?.remarks && (
                  <div className={cn("rounded-xl border px-3 py-2.5", feedbackTone.box)}>
                    <div className="flex items-start gap-2">
                      <Info className={cn("mt-0.5 h-4 w-4 shrink-0", feedbackTone.icon)} />
                      <div>
                        <p className={cn("mb-1 text-[11px] font-medium uppercase tracking-wide", feedbackTone.label)}>Ghi chú từ staff</p>
                        <p className={cn("text-[13px]", feedbackTone.body)}>{kycStatus.remarks}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-slate-400" />
                Tại sao cần xác thực danh tính startup
              </h2>
              <div className="space-y-3">
                {reasonItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[13px] leading-relaxed text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Quyền lợi khi được xác minh
              </h2>
              <div className="space-y-3">
                {benefitItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white">
                          <Icon className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">{item.title}</p>
                          <p className="text-[13px] leading-relaxed text-slate-700">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StartupShell>
  );
}
