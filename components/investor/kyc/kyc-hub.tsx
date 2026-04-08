"use client";

import React, { useState } from "react";
import {
  CheckCircle2, Clock, AlertCircle, XCircle, ShieldCheck,
  History, Info, Download, Award, RefreshCw, FileText,
  ArrowRight, Star, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IInvestorKYCStatus } from "@/types/investor-kyc";

interface KYCHubProps {
  status: IInvestorKYCStatus;
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
  investorType: "Loại nhà đầu tư",
  currentRoleTitle: "Vị trí / Chức vụ",
  organizationName: "Tên tổ chức",
  linkedinOrWebsite: "LinkedIn / Website",
  idOrBusinessLicenseFile: "Giấy phép KD / CCCD",
  investmentProofFile: "Bằng chứng đầu tư",
  declarationAccepted: "Cam kết",
};

export function KYCHub({ status, onStart, onContinue, onResubmit, onViewStatus, isDetailsRoute = false }: KYCHubProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { workflowStatus, verificationLabel, explanation, remarks, flaggedFields, history, submissionSummary, requiresNewEvidence } = status;
  const cfg = STATUS_MAP[workflowStatus] ?? STATUS_MAP.NOT_STARTED;
  const { Icon } = cfg;

  const isVerified = workflowStatus === "VERIFIED";
  const needsAction = ["NOT_STARTED", "DRAFT", "PENDING_MORE_INFO", "VERIFICATION_FAILED"].includes(workflowStatus);
  const hasRemarks = !!remarks && (workflowStatus === "PENDING_MORE_INFO" || workflowStatus === "VERIFICATION_FAILED");
  const submitted = ["PENDING_REVIEW", "VERIFIED", "VERIFICATION_FAILED", "PENDING_MORE_INFO"].includes(workflowStatus);
  const shouldShowDetails = isDetailsRoute && !!submissionSummary && submitted;

  const HISTORY_ACTION_MAP: Record<string, string> = {
    PENDING_REVIEW: "Hồ sơ đang được xem xét",
    PENDING_MORE_INFO: "Yêu cầu bổ sung thông tin",
    VERIFIED: "Hồ sơ đã được xác thực",
    VERIFICATION_FAILED: "Hồ sơ không đạt",
    DRAFT: "Bản nháp",
  };

  const checklist = [
    { label: "Thông tin định danh (Tên, Email)", done: submitted },
    { label: "Xác định loại hình Nhà đầu tư", done: submitted },
    { label: "Hồ sơ pháp lý cá nhân / tổ chức", done: submitted },
    { label: "Bằng chứng năng lực đầu tư", done: submitted },
    { label: "Cam kết bảo mật & Chống rửa tiền", done: submitted },
  ];
  const doneCount = checklist.filter(c => c.done).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* ── HERO ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Hero card — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#eec54e]/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-[#eec54e]" />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Xác thực Nhà đầu tư (KYC)</h1>
              <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5", cfg.badge)}>
                <span className={cn("w-1.5 h-1.5 rounded-full inline-block", cfg.dot)} />
                {cfg.label}
              </span>
            </div>
          </div>

          <p className="text-[13px] text-slate-400 mb-5 leading-relaxed">
            {explanation === "KYC submission is under review."
              ? "Hồ sơ của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất."
              : explanation === "KYC submission requires more information."
              ? "Ban thẩm định yêu cầu bổ sung thêm thông tin. Vui lòng kiểm tra ghi chú và gửi lại."
              : explanation === "KYC submission has been verified."
              ? "Hồ sơ của bạn đã được xác thực thành công."
              : explanation === "KYC submission has been rejected."
              ? "Hồ sơ của bạn không đạt yêu cầu. Vui lòng xem ghi chú và liên hệ hỗ trợ nếu cần."
              : explanation}
          </p>

          {/* Progress */}
          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-[12px] text-slate-500">
              <span className="font-medium">Mức độ hoàn thiện hồ sơ</span>
              <span className="font-semibold text-slate-700">{doneCount}/{checklist.length} mục</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#eec54e] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-2.5">
            {workflowStatus === "NOT_STARTED" && (
              <button onClick={onStart}
                className="bg-[#0f172a] text-white text-[13px] font-bold px-5 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 group shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                Bắt đầu xác thực
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
            {workflowStatus === "DRAFT" && (
              <button onClick={onContinue}
                className="bg-[#0f172a] text-white text-[13px] font-bold px-5 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 group shadow-sm">
                <FileText className="w-4 h-4" />
                Tiếp tục điền hồ sơ
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
            {(workflowStatus === "PENDING_MORE_INFO" || workflowStatus === "VERIFICATION_FAILED") && (
              <button onClick={onResubmit}
                className="bg-[#0f172a] text-white text-[13px] font-bold px-5 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm">
                <RefreshCw className="w-4 h-4" />
                {workflowStatus === "PENDING_MORE_INFO" ? "Bổ sung thông tin" : "Gửi lại hồ sơ"}
              </button>
            )}
            {isVerified && (
              <>
                <button
                  onClick={() => setShowDetails(v => !v)}
                  className="bg-[#0f172a] text-white text-[13px] font-bold px-5 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm">
                  <FileText className="w-4 h-4" />
                  Xem chi tiết hồ sơ
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
            {submitted && !isDetailsRoute && (
              <button onClick={onViewStatus}
                className="bg-[#0f172a] text-white text-[13px] font-bold px-5 h-10 rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm">
                <FileText className="w-4 h-4" />
                Xem trạng thái chi tiết
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {submissionSummary && !isVerified && workflowStatus !== "DRAFT" && (
              <div className="flex items-center gap-2 px-4 h-10 bg-slate-50 rounded-xl text-[12px] text-slate-400 font-medium">
                <FileText className="w-3.5 h-3.5" />
                Biên bản #{submissionSummary.version}{submissionSummary.submittedAt ? ` — ${new Date(submissionSummary.submittedAt).toLocaleDateString("vi-VN")}` : ""}
              </div>
            )}
          </div>
        </div>

        {/* Badge / Quick info — 1/3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <p className="text-[14px] font-bold text-slate-800 mb-4">Đặc quyền xác thực</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: ShieldCheck, label: "Được xác thực", desc: "Tăng uy tín Quỹ", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: FileText, label: "Truy cập Data Room", desc: "Toàn quyền truy cập", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Award, label: "AI Matching", desc: "Gợi ý Startup VIP", color: "text-[#eec54e]", bg: "bg-amber-50" },
              { icon: Star, label: "Ưu tiên", desc: "Kết nối nhanh hơn", color: "text-violet-500", bg: "bg-violet-50" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-white hover:border-slate-200 transition-all border border-transparent shadow-sm shadow-black/[0.01]">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", item.bg)}>
                  <item.icon className={cn("w-4 h-4", item.color)} />
                </div>
                <span className="text-[12px] font-bold text-slate-700 text-center leading-tight">{item.label}</span>
                <span className="text-[10px] text-slate-400 text-center mt-0.5 font-medium">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SUBMISSION DETAILS (status route) ───────────────── */}
      {shouldShowDetails && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <ShieldCheck className="w-4 h-4 text-[#eec54e]" />
            <p className="text-[14px] font-bold text-slate-800">
              {isVerified ? "Hồ sơ đã xác thực" : "Hồ sơ đã nộp hệ thống"}
            </p>
            <span className="ml-auto text-[11px] font-medium text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
              Phiên bản #{submissionSummary!.version}{submissionSummary!.submittedAt ? ` — ${new Date(submissionSummary!.submittedAt).toLocaleDateString("vi-VN")}` : ""}
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            {[
              { label: "Họ và tên", value: submissionSummary!.fullName },
              { label: "Email liên hệ", value: submissionSummary!.contactEmail },
              { label: "Loại nhà đầu tư", value: submissionSummary!.investorCategory === "INDIVIDUAL_ANGEL" ? "Angel Investor (Cá nhân)" : submissionSummary!.investorCategory === "INSTITUTIONAL" ? "Tổ chức / Quỹ đầu tư" : submissionSummary!.investorCategory },
              { label: submissionSummary!.investorCategory === "INSTITUTIONAL" ? "Vị trí hiện tại" : "Nghề nghiệp / Vị trí công việc", value: submissionSummary!.currentRoleTitle },
              ...(submissionSummary!.investorCategory === "INSTITUTIONAL" ? [
                { label: "Tổ chức / Quỹ", value: submissionSummary!.organizationName },
                { label: "Mã số thuế / Mã số doanh nghiệp", value: submissionSummary!.taxIdOrBusinessCode },
                { label: "Vai trò nộp hồ sơ", value: submissionSummary!.submitterRole },
              ] : [
                { label: "Căn cước công dân / Mã số thuế cá nhân", value: submissionSummary!.taxIdOrBusinessCode },
              ]),
              { label: "Tỉnh / Thành phố hoạt động", value: submissionSummary!.location },
            ].map((row, i) => row.value ? (
              <div key={i} className="flex items-center justify-between gap-4 border-b border-slate-50 py-3 last:border-0">
                <span className="shrink-0 text-[12px] font-medium text-slate-400 uppercase tracking-tight">{row.label}</span>
                <span className="max-w-[200px] truncate text-right text-[12px] font-semibold text-slate-700">{row.value}</span>
              </div>
            ) : null)}
            {submissionSummary!.linkedInURL && (
              <div className="flex items-center justify-between gap-4 border-b border-slate-50 py-3">
                <span className="shrink-0 text-[12px] font-medium text-slate-400 uppercase tracking-tight">
                  {submissionSummary!.investorCategory === "INSTITUTIONAL" ? "LinkedIn tổ chức" : "LinkedIn cá nhân"}
                </span>
                <a href={submissionSummary!.linkedInURL} target="_blank" rel="noreferrer"
                  className="max-w-[200px] truncate text-right text-[12px] font-semibold text-blue-600 hover:underline">
                  {submissionSummary!.linkedInURL}
                </a>
              </div>
            )}
            {submissionSummary!.website && (
              <div className="flex items-center justify-between gap-4 border-b border-slate-50 py-3">
                <span className="shrink-0 text-[12px] font-medium text-slate-400 uppercase tracking-tight">
                  {submissionSummary!.investorCategory === "INSTITUTIONAL" ? "Website tổ chức" : "Website / Portfolio cá nhân"}
                </span>
                <a href={submissionSummary!.website} target="_blank" rel="noreferrer"
                  className="max-w-[200px] truncate text-right text-[12px] font-semibold text-blue-600 hover:underline">
                  {submissionSummary!.website}
                </a>
              </div>
            )}
          </div>

          {/* Evidence files */}
          {submissionSummary!.evidenceFiles && submissionSummary!.evidenceFiles.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-[12px] font-medium text-slate-400 uppercase tracking-tight mb-3">Tài liệu đính kèm</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {submissionSummary!.evidenceFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-slate-700 truncate">{file.fileName || "Tài liệu"}</p>
                        <p className="text-[10px] text-slate-400">
                          {file.kind === "ID_PROOF" ? "Giấy tờ định danh" : file.kind === "INVESTMENT_PROOF" ? "Bằng chứng đầu tư" : file.kind}
                          {" · "}{new Date(file.uploadedAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    {file.url && (
                      <a href={file.url} target="_blank" rel="noreferrer"
                        className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        Xem <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUBMISSION DETAILS (VERIFIED) ────────────────────── */}
      {isVerified && showDetails && submissionSummary && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <FileText className="w-4 h-4 text-slate-400" />
            <p className="text-[14px] font-bold text-slate-800">Chi tiết hồ sơ đã xác thực</p>
            <span className="ml-auto text-[11px] text-slate-400 font-medium">
              Phiên bản #{submissionSummary.version}{submissionSummary.submittedAt ? ` — ${new Date(submissionSummary.submittedAt).toLocaleDateString("vi-VN")}` : ""}
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: "Họ và tên", value: submissionSummary.fullName },
              { label: "Email liên hệ", value: submissionSummary.contactEmail },
              { label: "Loại nhà đầu tư", value: submissionSummary.investorCategory === "INDIVIDUAL_ANGEL" ? "Angel Investor (Cá nhân)" : submissionSummary.investorCategory === "INSTITUTIONAL" ? "Tổ chức / Quỹ đầu tư" : submissionSummary.investorCategory },
              { label: submissionSummary.investorCategory === "INSTITUTIONAL" ? "Vị trí hiện tại" : "Nghề nghiệp / Vị trí công việc", value: submissionSummary.currentRoleTitle },
              ...(submissionSummary.investorCategory === "INSTITUTIONAL" ? [
                { label: "Tên tổ chức", value: submissionSummary.organizationName },
              ] : []),
              { label: submissionSummary.investorCategory === "INSTITUTIONAL" ? "LinkedIn tổ chức" : "LinkedIn cá nhân", value: submissionSummary.linkedInURL },
              { label: submissionSummary.investorCategory === "INSTITUTIONAL" ? "Website tổ chức" : "Website / Portfolio cá nhân", value: submissionSummary.website },
            ].map((row, i) => row.value ? (
              <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 last:border-0 md:[&:nth-last-child(-n+2)]:border-0">
                <span className="text-[12px] text-slate-400 font-medium shrink-0">{row.label}</span>
                <span className="text-[12px] font-bold text-slate-700 text-right truncate max-w-[200px]">{row.value}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* ── requiresNewEvidence banner ───────────────────────── */}
      {requiresNewEvidence && (workflowStatus === "PENDING_MORE_INFO" || workflowStatus === "VERIFICATION_FAILED") && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-amber-100 bg-amber-50/60">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <p className="text-[13px] font-bold text-amber-700">Yêu cầu tải lại tài liệu minh chứng</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Staff yêu cầu bạn <span className="font-semibold">thay thế bộ tài liệu minh chứng</span> trong lần gửi lại này. Bạn không thể giữ lại file cũ.
            </p>
          </div>
        </div>
      )}

      {/* ── REMARKS BANNER ──────────────────────────────────── */}
      {hasRemarks && (
        <div className={cn(
          "bg-white rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden",
          workflowStatus === "PENDING_MORE_INFO" ? "border-orange-200" : "border-red-200"
        )}>
          <div className={cn(
            "flex items-center gap-2.5 px-6 py-3.5 border-b shadow-sm",
            workflowStatus === "PENDING_MORE_INFO" ? "bg-orange-50/60 border-orange-100" : "bg-red-50/60 border-red-100"
          )}>
            <AlertCircle className={cn("w-4 h-4", workflowStatus === "PENDING_MORE_INFO" ? "text-orange-500" : "text-red-500")} />
            <p className={cn("text-[13px] font-bold", workflowStatus === "PENDING_MORE_INFO" ? "text-orange-700" : "text-red-600")}>
              Ghi chú từ Ban thâm định
            </p>
          </div>
          <div className="px-6 py-4 space-y-3">
            <p className="text-[13px] text-slate-600 leading-relaxed font-normal">{remarks}</p>
            {flaggedFields && flaggedFields.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Trường cần cập nhật:</p>
                <div className="flex flex-wrap gap-2">
                  {flaggedFields.map(f => (
                    <span key={f} className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                      workflowStatus === "PENDING_MORE_INFO"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    )}>
                      {FIELD_LABELS[f] ?? f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM ROW ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <p className="text-[14px] font-bold text-slate-800 mb-4">Hồ sơ cần chuẩn bị</p>
          <ul className="space-y-3">
            {checklist.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                  item.done ? "bg-[#eec54e] border-[#eec54e]" : "border-slate-200 bg-white"
                )}>
                  {item.done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-[#171611]" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  }
                </div>
                <span className={cn("text-[13px] font-medium transition-colors", item.done ? "text-slate-800 font-bold" : "text-slate-400")}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          {needsAction && (
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#eec54e] uppercase tracking-wider">TRẠNG THÁI:</span>
              <span className="text-[11px] text-slate-400 font-medium">{doneCount}/{checklist.length} mục hoàn thành</span>
            </div>
          )}
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <History className="w-4 h-4 text-slate-400" />
            <p className="text-[14px] font-bold text-slate-800">Lịch sử hoạt động</p>
          </div>

          {history && history.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {history.map((item, idx) => {
                const displayDate = item.reviewedAt || item.submittedAt;
                const action = HISTORY_ACTION_MAP[item.workflowStatus] ?? item.workflowStatus;
                return (
                  <div key={idx} className="px-6 py-3.5 flex items-start gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0 shadow-sm", TIMELINE_DOT[item.workflowStatus] ?? "bg-slate-300")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-bold text-slate-700">{action}</p>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{item.version}</span>
                      </div>
                      {item.remarks && (
                        <p className="text-[11px] text-slate-400 italic mt-1 font-medium">"{item.remarks}"</p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold shrink-0 whitespace-nowrap">
                      {displayDate ? new Date(displayDate).toLocaleDateString("vi-VN") : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100/50">
                <Clock className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Chưa có lịch sử</p>
              <p className="text-[12px] text-slate-300 mt-1 font-medium">Bắt đầu xác thực để theo dõi tiến trình của bạn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
