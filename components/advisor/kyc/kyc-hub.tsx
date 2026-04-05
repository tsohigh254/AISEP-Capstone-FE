"use client";

import React from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Info,
  RefreshCw,
  ShieldCheck,
  Star,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IAdvisorKYCStatus } from "@/types/advisor-kyc";

interface KYCHubProps {
  status: IAdvisorKYCStatus;
  onStart: () => void;
  onContinue: () => void;
  onResubmit: () => void;
  onViewStatus?: () => void;
  isDetailsRoute?: boolean;
}

const STATUS_MAP = {
  NOT_STARTED: {
    Icon: ShieldCheck,
    badge: "bg-slate-100 text-slate-500",
    label: "Chưa xác thực",
    dot: "bg-slate-300",
  },
  DRAFT: {
    Icon: FileText,
    badge: "bg-blue-50 text-blue-600",
    label: "Bản nháp",
    dot: "bg-blue-400",
  },
  PENDING_REVIEW: {
    Icon: Clock,
    badge: "bg-amber-50 text-amber-600",
    label: "Đang xem xét",
    dot: "bg-[#eec54e]",
  },
  PENDING_MORE_INFO: {
    Icon: Info,
    badge: "bg-orange-50 text-orange-600",
    label: "Cần bổ sung",
    dot: "bg-orange-400",
  },
  VERIFIED: {
    Icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-600",
    label: "Đã xác thực",
    dot: "bg-emerald-500",
  },
  VERIFICATION_FAILED: {
    Icon: XCircle,
    badge: "bg-red-50 text-red-500",
    label: "Không đạt",
    dot: "bg-red-400",
  },
} as const;

const TIMELINE_DOT: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-400",
  PENDING_MORE_INFO: "bg-orange-400",
  VERIFIED: "bg-emerald-500",
  VERIFICATION_FAILED: "bg-red-400",
  DRAFT: "bg-blue-400",
};

const FIELD_LABELS: Record<string, string> = {
  fullName: "Họ và tên",
  contactEmail: "Email liên hệ",
  currentRoleTitle: "Vị trí hiện tại",
  currentOrganization: "Tổ chức / Công ty",
  primaryExpertise: "Chuyên môn chính",
  secondaryExpertise: "Chuyên môn phụ",
  professionalProfileLink: "Link LinkedIn",
  basicExpertiseProofFile: "Bằng chứng chuyên môn",
  declarationAccepted: "Cam kết",
};

const EXPERTISE_LABELS: Record<string, string> = {
  FUNDRAISING: "Gọi vốn",
  PRODUCT_STRATEGY: "Chiến lược sản phẩm",
  GO_TO_MARKET: "Go-to-market",
  FINANCE: "Tài chính",
  LEGAL_IP: "Pháp lý & SHTT",
  OPERATIONS: "Vận hành",
  TECHNOLOGY: "Công nghệ",
  MARKETING: "Marketing",
  HR_OR_TEAM_BUILDING: "Nhân sự",
};

function formatExpertise(value?: string) {
  if (!value) return undefined;
  return EXPERTISE_LABELS[value] ?? value;
}

function formatDate(value?: string) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

export function KYCHub({
  status,
  onStart,
  onContinue,
  onResubmit,
  onViewStatus,
  isDetailsRoute = false,
}: KYCHubProps) {
  const {
    workflowStatus,
    verificationLabel,
    explanation,
    remarks,
    flaggedFields,
    history,
    submissionSummary,
    previousSubmission,
  } = status;
  const cfg = STATUS_MAP[workflowStatus] ?? STATUS_MAP.NOT_STARTED;
  const { Icon } = cfg;

  const isVerified = workflowStatus === "VERIFIED";
  const isVerifiedAdvisor = isVerified && verificationLabel === "VERIFIED_ADVISOR";
  const isBasicVerified = isVerified && verificationLabel === "BASIC_VERIFIED";
  const needsAction = ["NOT_STARTED", "DRAFT", "PENDING_MORE_INFO", "VERIFICATION_FAILED"].includes(workflowStatus);
  const hasRemarks = !!remarks && (workflowStatus === "PENDING_MORE_INFO" || workflowStatus === "VERIFICATION_FAILED");
  const submitted = ["PENDING_REVIEW", "VERIFIED", "VERIFICATION_FAILED", "PENDING_MORE_INFO"].includes(workflowStatus);
  const shouldShowVerifiedDetails = isVerified && isDetailsRoute && !!previousSubmission;

  const checklist = [
    { label: "Thông tin liên hệ (Email, Họ tên)", done: submitted },
    { label: "Vị trí & Tổ chức hiện tại", done: submitted },
    { label: "Chuyên môn tư vấn cốt lõi", done: submitted },
    { label: "Link profile nghề nghiệp", done: submitted },
    { label: "Bằng chứng chuyên môn (PDF/Ảnh)", done: submitted },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  return (
    <div className="animate-in space-y-5 fade-in duration-500">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:col-span-2">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eec54e]/10">
              <Icon className="h-5 w-5 text-[#eec54e]" />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-bold text-slate-900">Xác thực Advisor (KYC)</h1>
              <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", cfg.badge)}>
                <span className={cn("inline-block h-1.5 w-1.5 rounded-full", cfg.dot)} />
                {cfg.label}
              </span>
            </div>
          </div>

          <p className="mb-5 text-[13px] leading-relaxed text-slate-400">{explanation}</p>

          <div className="mb-5 space-y-1.5">
            <div className="flex justify-between text-[12px] text-slate-500">
              <span>Mức độ hoàn thiện hồ sơ</span>
              <span className="font-semibold text-slate-700">
                {doneCount}/{checklist.length} mục
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#eec54e] transition-all duration-700 ease-out"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {workflowStatus === "NOT_STARTED" && (
              <button
                onClick={onStart}
                className="group flex h-10 items-center gap-2 rounded-xl bg-[#0f172a] px-5 text-[13px] font-bold text-white transition-all hover:bg-slate-700"
              >
                <ShieldCheck className="h-4 w-4" />
                Bắt đầu xác thực
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {workflowStatus === "DRAFT" && (
              <button
                onClick={onContinue}
                className="group flex h-10 items-center gap-2 rounded-xl bg-[#0f172a] px-5 text-[13px] font-bold text-white transition-all hover:bg-slate-700"
              >
                <FileText className="h-4 w-4" />
                Tiếp tục điền hồ sơ
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {(workflowStatus === "PENDING_MORE_INFO" || workflowStatus === "VERIFICATION_FAILED") && (
              <button
                onClick={onResubmit}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#0f172a] px-5 text-[13px] font-bold text-white transition-all hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                {workflowStatus === "PENDING_MORE_INFO" ? "Bổ sung hồ sơ" : "Gửi lại hồ sơ"}
              </button>
            )}

            {isVerified && !isDetailsRoute && (
              <button
                onClick={onViewStatus}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#0f172a] px-5 text-[13px] font-bold text-white transition-all hover:bg-slate-700"
              >
                <FileText className="h-4 w-4" />
                Xem trạng thái chi tiết
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {submissionSummary && !isVerified && workflowStatus !== "DRAFT" && (
              <div className="flex h-10 items-center gap-2 rounded-xl bg-slate-50 px-4 text-[12px] text-slate-400">
                <FileText className="h-3.5 w-3.5" />
                Phiên bản #{submissionSummary.version} — {formatDate(submissionSummary.submittedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="mb-4 text-[14px] font-bold text-slate-800">Trạng thái huy hiệu</p>

          {isVerified ? (
            <div className="space-y-3">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4",
                  isVerifiedAdvisor ? "border-[#eec54e]/40 bg-[#eec54e]/5" : "border-slate-200 bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isVerifiedAdvisor ? "bg-[#eec54e]/15" : "bg-slate-100",
                  )}
                >
                  {isVerifiedAdvisor ? (
                    <Award className="h-5 w-5 text-[#C8A000]" />
                  ) : (
                    <Star className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800">
                    {isVerifiedAdvisor ? "Verified Advisor" : "Basic Verified"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {isVerifiedAdvisor ? "Xác thực đầy đủ" : "Xác thực cơ bản"}
                  </p>
                </div>
              </div>

              {isVerifiedAdvisor && (
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-[12px] font-semibold text-slate-700">Huy hiệu hiện tại</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Hồ sơ của bạn đã đạt mức xác thực đầy đủ dành cho advisor theo kết quả thẩm định hiện tại.
                  </p>
                </div>
              )}

              {isBasicVerified && (
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="mb-1 text-[12px] font-semibold text-slate-700">Huy hiệu hiện tại</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Hồ sơ của bạn hiện đang ở mức xác thực cơ bản theo kết quả review mới nhất.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: ShieldCheck, label: "Được xác thực", desc: "Tăng độ tin cậy", color: "text-emerald-500", bg: "bg-emerald-50" },
                { icon: Award, label: "Huy hiệu", desc: "Nổi bật hơn", color: "text-amber-500", bg: "bg-amber-50" },
                { icon: Star, label: "Ưu tiên", desc: "Hiển thị đầu", color: "text-violet-500", bg: "bg-violet-50" },
                { icon: CheckCircle2, label: "Tin tưởng", desc: "Startup yên tâm", color: "text-blue-500", bg: "bg-blue-50" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center rounded-xl border border-transparent bg-slate-50 p-3.5 transition-all hover:border-slate-200 hover:bg-white"
                >
                  <div className={cn("mb-2 flex h-8 w-8 items-center justify-center rounded-lg", item.bg)}>
                    <item.icon className={cn("h-4 w-4", item.color)} />
                  </div>
                  <span className="text-center text-[12px] font-semibold leading-tight text-slate-700">{item.label}</span>
                  <span className="mt-0.5 text-center text-[10px] text-slate-400">{item.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {shouldShowVerifiedDetails && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <FileText className="h-4 w-4 text-slate-400" />
            <p className="text-[14px] font-bold text-slate-800">Chi tiết hồ sơ đã xác thực</p>
            {submissionSummary && (
              <span className="ml-auto text-[11px] text-slate-400">
                Phiên bản #{submissionSummary.version} — {formatDate(submissionSummary.submittedAt)}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-6 sm:grid-cols-2">
            {[
              { label: "Họ và tên", value: previousSubmission.fullName },
              { label: "Email liên hệ", value: previousSubmission.contactEmail },
              { label: "Vị trí hiện tại", value: previousSubmission.currentRoleTitle },
              { label: "Tổ chức / Công ty", value: previousSubmission.currentOrganization },
              { label: "Chuyên môn chính", value: formatExpertise(previousSubmission.primaryExpertise) },
              { label: "Link LinkedIn", value: previousSubmission.professionalProfileLink },
            ].map((row, index) =>
              row.value ? (
                <div key={index} className="flex items-start justify-between gap-4 border-b border-slate-50 py-2 last:border-0">
                  <span className="shrink-0 text-[12px] text-slate-400">{row.label}</span>
                  <span className="max-w-[200px] truncate text-right text-[12px] font-semibold text-slate-700">{row.value}</span>
                </div>
              ) : null,
            )}

            {previousSubmission.secondaryExpertise && previousSubmission.secondaryExpertise.length > 0 && (
              <div className="flex items-start justify-between gap-4 border-b border-slate-50 py-2 sm:col-span-2">
                <span className="shrink-0 text-[12px] text-slate-400">Chuyên môn phụ</span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {previousSubmission.secondaryExpertise.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                    >
                      {formatExpertise(item)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasRemarks && (
        <div
          className={cn(
            "overflow-hidden rounded-2xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
            workflowStatus === "PENDING_MORE_INFO" ? "border-orange-200" : "border-red-200",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2.5 border-b px-6 py-3.5",
              workflowStatus === "PENDING_MORE_INFO"
                ? "border-orange-100 bg-orange-50/60"
                : "border-red-100 bg-red-50/60",
            )}
          >
            <AlertCircle
              className={cn(
                "h-4 w-4",
                workflowStatus === "PENDING_MORE_INFO" ? "text-orange-500" : "text-red-500",
              )}
            />
            <p
              className={cn(
                "text-[13px] font-bold",
                workflowStatus === "PENDING_MORE_INFO" ? "text-orange-700" : "text-red-600",
              )}
            >
              Ghi chú từ reviewer
            </p>
          </div>
          <div className="space-y-3 px-6 py-4">
            <p className="text-[13px] leading-relaxed text-slate-600">{remarks}</p>
            {flaggedFields && flaggedFields.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold text-slate-400">
                  Các trường cần bổ sung / chỉnh sửa:
                </p>
                <div className="flex flex-wrap gap-2">
                  {flaggedFields.map((field) => (
                    <span
                      key={field}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        workflowStatus === "PENDING_MORE_INFO"
                          ? "border-orange-200 bg-orange-50 text-orange-700"
                          : "border-red-200 bg-red-50 text-red-600",
                      )}
                    >
                      {FIELD_LABELS[field] ?? field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {workflowStatus === "PENDING_REVIEW" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5 border-b border-slate-100 bg-amber-50/40 px-6 py-3.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <p className="text-[13px] font-bold text-amber-700">Đang xử lý</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-[13px] leading-relaxed text-slate-500">
              Hồ sơ đã được tiếp nhận. Đội ngũ AISEP sẽ xem xét trong <span className="font-semibold text-slate-700">1–3 ngày làm việc</span>. Bạn sẽ nhận thông báo khi có kết quả.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="mb-4 text-[14px] font-bold text-slate-800">Hồ sơ cần chuẩn bị</p>
          <ul className="space-y-3">
            {checklist.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    item.done ? "border-[#eec54e] bg-[#eec54e]" : "border-slate-200 bg-white",
                  )}
                >
                  {item.done ? (
                    <CheckCircle2 className="h-3 w-3 text-[#171611]" />
                  ) : (
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                  )}
                </div>
                <span className={cn("text-[13px]", item.done ? "font-semibold text-slate-700" : "text-slate-400")}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          {needsAction && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-[11px] text-slate-400">{doneCount}/{checklist.length} mục hoàn thành</p>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <History className="h-4 w-4 text-slate-400" />
            <p className="text-[14px] font-bold text-slate-800">Lịch sử hoạt động</p>
          </div>

          {history && history.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {history.map((item, index) => (
                <div key={index} className="flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-slate-50/60">
                  <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", TIMELINE_DOT[item.status] ?? "bg-slate-300")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-700">{item.action}</p>
                    {item.remark && (
                      <p className="mt-0.5 text-[11px] italic text-slate-400">
                        &quot;{item.remark}&quot;
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 pt-0.5 text-[11px] text-slate-400">{item.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <Clock className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-[13px] font-semibold text-slate-400">Chưa có lịch sử hoạt động</p>
              <p className="mt-1 text-[11px] text-slate-300">Bắt đầu xác thực để theo dõi tiến trình</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
