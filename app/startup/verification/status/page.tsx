"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { StartupShell } from "@/components/startup/startup-shell";
import { cn } from "@/lib/utils";
import { GetStartupKYCStatus, KycEvidenceFile, StartupKycCase } from "@/services/startup/startup-kyc.api";

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

const STATUS_CFG = {
  NOT_SUBMITTED: {
    label: "Chưa bắt đầu",
    icon: Building2,
    badge: "bg-slate-50 text-slate-600 border-slate-200/80",
    dot: "bg-slate-400",
    title: "Bạn chưa gửi hồ sơ xác minh",
    subtitle: "Hoàn thiện hồ sơ để AISEP xác thực danh tính startup của bạn.",
  },
  DRAFT: {
    label: "Bản nháp",
    icon: FileText,
    badge: "bg-slate-50 text-slate-700 border-slate-200/80",
    dot: "bg-slate-400",
    title: "Hồ sơ KYC đang ở trạng thái bản nháp",
    subtitle: "Bạn có thể tiếp tục chỉnh sửa và gửi hồ sơ khi đã sẵn sàng.",
  },
  UNDER_REVIEW: {
    label: "Đang thẩm định",
    icon: Clock,
    badge: "bg-blue-50 text-blue-700 border-blue-200/80",
    dot: "bg-blue-400",
    title: "Hồ sơ đang được thẩm định",
    subtitle: "AISEP đang xem xét phiên bản hồ sơ bạn đã gửi gần nhất.",
  },
  PENDING_MORE_INFO: {
    label: "Cần bổ sung",
    icon: AlertCircle,
    badge: "bg-amber-50 text-amber-700 border-amber-200/80",
    dot: "bg-amber-400",
    title: "Cần bổ sung thông tin",
    subtitle: "Vui lòng cập nhật theo yêu cầu để tiếp tục quy trình xác minh.",
  },
  APPROVED: {
    label: "Đã xác minh",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-400",
    title: "Startup đã được xác minh",
    subtitle: "Phiên bản hồ sơ gần nhất của bạn đã được phê duyệt.",
  },
  REJECTED: {
    label: "Từ chối",
    icon: AlertCircle,
    badge: "bg-red-50 text-red-700 border-red-200/80",
    dot: "bg-red-400",
    title: "Hồ sơ chưa đạt xác minh",
    subtitle: "AISEP đã từ chối phiên bản hồ sơ gần nhất của bạn.",
  },
  SUPERSEDED: {
    label: "Đã thay thế",
    icon: AlertCircle,
    badge: "bg-slate-50 text-slate-600 border-slate-200/80",
    dot: "bg-slate-400",
    title: "Hồ sơ này đã được thay thế",
    subtitle: "Vui lòng theo dõi phiên bản KYC đang active mới nhất.",
  },
} as const;

function getReadableExplanation(explanation?: string, fallback?: string) {
  if (!explanation) return fallback || "";
  return EXPLANATION_MAP[explanation] || explanation;
}

function normalizePublicLink(url?: string) {
  if (!url || url === "N/A") return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function getEvidenceUrl(file: KycEvidenceFile) {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";
  const normalizeCandidate = (value?: string) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/")) return backendBase ? `${backendBase}${value}` : value;
    if (value.startsWith("api/") || value.startsWith("uploads/")) {
      return backendBase ? `${backendBase}/${value}` : `/${value}`;
    }
    return "";
  };

  return normalizeCandidate(file.url);
}

function createPendingTab() {
  const popup = window.open("about:blank", "_blank");
  if (popup) {
    popup.opener = null;
  }
  return popup;
}

function openUrlInNewTab(url: string, popup?: Window | null) {
  if (popup && !popup.closed) {
    try {
      popup.location.replace(url);
      popup.focus?.();
      return;
    } catch {
      popup.close();
    }
  }
  const nextPopup = window.open(url, "_blank");
  if (nextPopup) {
    nextPopup.opener = null;
  }
}

async function getUrlStatus(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.status;
  } catch {
    return null;
  }
}

export default function KycStatusPage() {
  const [kycCase, setKycCase] = useState<StartupKycCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await GetStartupKYCStatus();
        const data = res as unknown as IBackendRes<StartupKycCase>;
        if ((data.success || data.isSuccess) && data.data) {
          setKycCase(data.data);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    };

    void fetchStatus();

    const interval = setInterval(() => {
      if (kycCase?.workflowStatus === "UNDER_REVIEW" || kycCase?.workflowStatus === "PENDING_MORE_INFO") {
        void fetchStatus(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [kycCase?.workflowStatus]);

  if (loading) {
    return (
      <StartupShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  if (!kycCase) return null;

  const workflowStatus = kycCase.workflowStatus || "NOT_SUBMITTED";
  const cfg = STATUS_CFG[workflowStatus as keyof typeof STATUS_CFG] || STATUS_CFG.NOT_SUBMITTED;
  const Icon = cfg.icon;
  const resultLabelText = RESULT_LABEL_MAP[kycCase.resultLabel || "NONE"] || "";
  const summary = kycCase.submissionSummary;
  const evidenceFiles = summary?.evidenceFiles || [];
  const entityName = summary?.legalFullName || summary?.projectName || "Chưa có tên hồ sơ";
  const canResubmit = workflowStatus === "PENDING_MORE_INFO" || workflowStatus === "REJECTED" || workflowStatus === "SUPERSEDED";
  const canEditDraft = workflowStatus === "DRAFT" || workflowStatus === "NOT_SUBMITTED";
  const actionHref = canResubmit ? "/startup/verification/resubmit" : canEditDraft ? "/startup/verification/submit" : "/startup/verification";
  const feedbackTone =
    workflowStatus === "REJECTED"
      ? {
          box: "bg-red-50 border-red-200",
          icon: "text-red-500",
          label: "text-red-600",
          body: "text-red-700",
        }
      : workflowStatus === "PENDING_MORE_INFO"
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
  const submittedAtLabel = kycCase.submittedAt ? new Date(kycCase.submittedAt).toLocaleDateString("vi-VN") : "Chưa nộp";
  const updatedAtLabel = kycCase.updatedAt ? new Date(kycCase.updatedAt).toLocaleDateString("vi-VN") : "Chưa cập nhật";

  const summaryRows = !summary
    ? []
    : [
        { label: summary.startupVerificationType === "WITH_LEGAL_ENTITY" ? "Tên pháp lý" : "Tên dự án", value: entityName },
        { label: "Email công việc", value: summary.workEmail || summary.contactEmail || "N/A" },
        { label: "Người đại diện", value: summary.representativeFullName || "N/A" },
        { label: "Vai trò", value: summary.representativeRole || "N/A" },
        ...(summary.startupVerificationType === "WITH_LEGAL_ENTITY"
          ? [{ label: "Mã số doanh nghiệp", value: summary.enterpriseCode || "N/A" }]
          : []),
        { label: "Liên kết công khai", value: summary.publicLink || "N/A" },
      ];

  const handleOpenEvidence = async (file: KycEvidenceFile) => {
    const popup = createPendingTab();
    const candidateUrl = getEvidenceUrl(file);

    if (!candidateUrl) {
      popup?.close();
      toast.error("Không tìm thấy link xem tài liệu.");
      return;
    }

    openUrlInNewTab(candidateUrl, popup);

    const initialStatus = await getUrlStatus(candidateUrl);
    if (initialStatus !== 401 && initialStatus !== 403) {
      return;
    }

    try {
      const res = await GetStartupKYCStatus();
      const data = res as unknown as IBackendRes<StartupKycCase>;
      if ((data.success || data.isSuccess) && data.data) {
        setKycCase(data.data);
        const refreshedFile = data.data.submissionSummary?.evidenceFiles?.find((item) => item.id === file.id);
        const refreshedUrl = refreshedFile ? getEvidenceUrl(refreshedFile) : "";
        const refreshedStatus = refreshedUrl ? await getUrlStatus(refreshedUrl) : null;

        if (refreshedUrl && refreshedStatus !== 401 && refreshedStatus !== 403) {
          openUrlInNewTab(refreshedUrl, popup);
          return;
        }
      }

      popup?.close();
      toast.error("Link xem tài liệu đã hết hạn hoặc không còn khả dụng.");
    } catch {
      popup?.close();
      toast.error("Không thể làm mới link xem tài liệu. Vui lòng thử lại.");
    }
  };

  return (
    <StartupShell>
      <div className="mx-auto max-w-[1100px] space-y-6 pb-20 animate-in fade-in duration-400">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <Link href="/startup/verification" className="group flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-900">
            <div className="flex size-8 items-center justify-center rounded-full border border-slate-200 transition-all group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-bold">Quay lại tổng quan</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50">
                      <Icon className="h-6 w-6 text-slate-500" />
                    </div>
                    <div>
                      <h1 className="text-[20px] font-bold text-slate-900">{cfg.title}</h1>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-semibold", cfg.badge)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </span>
                        {resultLabelText && (
                          <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            {resultLabelText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="max-w-[620px] text-[13px] leading-relaxed text-slate-500">
                    {getReadableExplanation(kycCase.explanation, cfg.subtitle)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <Link
                    href={actionHref}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors",
                      canResubmit ? "bg-[#0f172a] text-white hover:bg-[#1e293b]" : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {canResubmit ? "Cập nhật hồ sơ" : canEditDraft ? "Tiếp tục hồ sơ" : "Về tổng quan"}
                    {canResubmit ? <Send className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4 rotate-180" />}
                  </Link>
                </div>
              </div>

              {kycCase.remarks && (
                <div className={cn("mt-5 rounded-xl border px-3 py-2.5", feedbackTone.box)}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className={cn("mt-0.5 h-4 w-4 shrink-0", feedbackTone.icon)} />
                    <div>
                      <p className={cn("mb-1 text-[11px] font-medium uppercase tracking-wide", feedbackTone.label)}>Nhận xét từ staff</p>
                      <p className={cn("text-[13px]", feedbackTone.body)}>{kycCase.remarks}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-slate-400" />
                Tóm tắt hồ sơ đã nộp
              </h2>

              {!summary ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[13px] text-slate-500">Chưa có hồ sơ KYC nào được gửi.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                    {summaryRows.map((row) => {
                      const publicLink = row.label === "Liên kết công khai" ? normalizePublicLink(row.value) : "";
                      return (
                        <div key={row.label}>
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">{row.label}</p>
                          {publicLink ? (
                            <a href={publicLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-blue-600 hover:underline">
                              {row.value}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <p className="text-[13px] leading-relaxed text-slate-700">{row.value}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <p className="mb-3 text-[11px] uppercase tracking-wide text-slate-400">Tài liệu minh chứng</p>
                    {evidenceFiles.length === 0 ? (
                      <p className="text-[13px] text-slate-500">Không có tệp đính kèm.</p>
                    ) : (
                      <div className="space-y-3">
                        {evidenceFiles.map((file) => {
                          const fileUrl = getEvidenceUrl(file);
                          return (
                            <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-slate-700">{file.fileName}</p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {file.kind}
                                  {file.uploadedAt ? ` · ${new Date(file.uploadedAt).toLocaleDateString("vi-VN")}` : ""}
                                </p>
                              </div>
                              {fileUrl ? (
                                <button
                                  type="button"
                                  onClick={() => void handleOpenEvidence(file)}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                                >
                                  Xem file
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              ) : (
                                <span className="shrink-0 text-[12px] text-slate-400">Chưa có link xem</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                <Clock className="h-4 w-4 text-slate-400" />
                Mốc thời gian
              </h2>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Ngày nộp</p>
                  <p className="text-[13px] font-medium text-slate-700">{submittedAtLabel}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Cập nhật gần nhất</p>
                  <p className="text-[13px] font-medium text-slate-700">{updatedAtLabel}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Phiên bản</p>
                  <p className="text-[13px] font-medium text-slate-700">{kycCase.version ?? "N/A"}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Submission ID</p>
                  <p className="text-[13px] font-medium text-slate-700">{kycCase.submissionId ?? kycCase.id ?? "N/A"}</p>
                </div>
              </div>
            </div>

            {Array.isArray(kycCase.requestedAdditionalItems) && kycCase.requestedAdditionalItems.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <h2 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                  <AlertCircle className="h-4 w-4 text-slate-400" />
                  Yêu cầu bổ sung
                </h2>
                <div className="space-y-3">
                  {kycCase.requestedAdditionalItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-[13px] font-medium text-slate-700">{item.title}</p>
                      <p className="mt-1 text-[12px] text-slate-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StartupShell>
  );
}
