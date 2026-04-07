"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Users,
  Send,
  ShieldCheck,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KycFileUploader } from "@/components/startup/kyc-file-uploader";
import { toast } from "sonner";
import {
  SaveStartupKYCDraft,
  StartupKycCase,
  SubmitStartupKYC,
} from "@/services/startup/startup-kyc.api";

const inputCls =
  "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] outline-none transition-all";
const labelCls =
  "block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-tight";

interface KycSubmitFormProps {
  initialData?: StartupKycCase | null;
  isResubmit?: boolean;
}

function sanitizeEnterpriseCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 13);
}

function isValidEnterpriseCode(value: string) {
  return /^\d{10}(\d{3})?$/.test(value);
}

function normalizePublicLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidPublicLink(value: string) {
  const normalized = normalizePublicLink(value);
  if (!normalized) return false;

  try {
    const parsed = new URL(normalized);
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function translateUploadErrorMessage(message?: string | null) {
  if (!message) return "Có lỗi xảy ra. Vui lòng thử lại.";

  const normalized = message.toLowerCase();

  if (
    normalized.includes("evidence_files_required") ||
    normalized.includes("at least one new evidence file is required")
  ) {
    return "Bạn cần tải lên ít nhất một tài liệu minh chứng mới khi gửi hoặc gửi lại hồ sơ KYC.";
  }

  if (
    normalized.includes("only these document extensions are allowed") ||
    normalized.includes("document extensions are allowed")
  ) {
    return "Chỉ cho phép các định dạng tài liệu: .pdf, .ppt, .pptx, .doc, .docx";
  }

  if (normalized.includes("file too large") || normalized.includes("exceeds")) {
    return "Dung lượng tệp vượt quá giới hạn cho phép.";
  }

  return message;
}

export function KycSubmitForm({
  initialData,
  isResubmit,
}: KycSubmitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"WITH_LEGAL_ENTITY" | "WITHOUT_LEGAL_ENTITY">(
    initialData?.submissionSummary?.startupVerificationType ||
      initialData?.startupVerificationType ||
      "WITH_LEGAL_ENTITY",
  );
  const [agreed, setAgreed] = useState(false);
  const [legalName, setLegalName] = useState(
    initialData?.submissionSummary?.legalFullName ||
      initialData?.submissionSummary?.projectName ||
      "",
  );
  const [taxCode, setTaxCode] = useState(
    initialData?.submissionSummary?.enterpriseCode || "",
  );
  const [repName, setRepName] = useState(
    initialData?.submissionSummary?.representativeFullName || "",
  );
  const [repRole, setRepRole] = useState(
    initialData?.submissionSummary?.representativeRole || "",
  );
  const [email, setEmail] = useState(
    initialData?.submissionSummary?.workEmail ||
      initialData?.submissionSummary?.contactEmail ||
      "",
  );
  const [link, setLink] = useState(
    initialData?.submissionSummary?.publicLink || "",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [showReplaceWarning, setShowReplaceWarning] = useState(false);
  const [replaceWarningConfirmed, setReplaceWarningConfirmed] = useState(false);
  const [uploaderResetKey, setUploaderResetKey] = useState(0);
  const existingEvidenceFiles = initialData?.submissionSummary?.evidenceFiles || [];
  const hasExistingEvidence = existingEvidenceFiles.length > 0;
  const requiresNewEvidenceRaw = initialData?.requiresNewEvidence ?? (initialData as any)?.RequiresNewEvidence;
  const requiresNewEvidence = Boolean(isResubmit && requiresNewEvidenceRaw);
  const shouldWarnAboutReplacingEvidence =
    Boolean(isResubmit) && !requiresNewEvidence && hasExistingEvidence;

  const handleFilesChange = (nextFiles: File[]) => {
    setFiles(nextFiles);

    if (nextFiles.length === 0) {
      setShowReplaceWarning(false);
      setReplaceWarningConfirmed(false);
      return;
    }

    if (shouldWarnAboutReplacingEvidence && !replaceWarningConfirmed) {
      setShowReplaceWarning(true);
    }
  };

  const handleCancelEvidenceReplacement = () => {
    setFiles([]);
    setShowReplaceWarning(false);
    setReplaceWarningConfirmed(false);
    setUploaderResetKey((prev) => prev + 1);
  };

  const handleConfirmEvidenceReplacement = () => {
    setReplaceWarningConfirmed(true);
    setShowReplaceWarning(false);
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("StartupVerificationType", mode);
    const normalizedLink = normalizePublicLink(link);

    if (mode === "WITH_LEGAL_ENTITY") {
      if (legalName.trim()) formData.append("LegalFullName", legalName.trim());
      if (taxCode.trim()) formData.append("EnterpriseCode", taxCode.trim());
    } else if (legalName.trim()) {
      formData.append("ProjectName", legalName.trim());
    }

    if (repName.trim()) {
      formData.append("RepresentativeFullName", repName.trim());
    }
    if (repRole.trim()) {
      formData.append("RepresentativeRole", repRole.trim());
    }
    if (email.trim()) {
      formData.append("WorkEmail", email.trim());
    }
    if (normalizedLink) {
      formData.append("PublicLink", normalizedLink);
    }

    const evidenceKind =
      mode === "WITH_LEGAL_ENTITY"
        ? "BUSINESS_REGISTRATION_CERTIFICATE"
        : "BASIC_ACTIVITY_PROOF";

    files.forEach((file) => {
      formData.append("EvidenceFiles", file);
      formData.append("EvidenceFileKinds", evidenceKind);
    });

    return formData;
  };

  const validateSubmit = () => {
    if (!agreed) {
      toast.error("Vui lòng xác nhận cam kết trước khi gửi.");
      return false;
    }

    if (
      !legalName.trim() ||
      !repName.trim() ||
      !repRole.trim() ||
      !email.trim() ||
      !link.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc trước khi gửi.");
      return false;
    }

    if (mode === "WITH_LEGAL_ENTITY" && !taxCode.trim()) {
      toast.error("Vui lòng nhập mã số doanh nghiệp trước khi gửi.");
      return false;
    }

    if (
      mode === "WITH_LEGAL_ENTITY" &&
      !isValidEnterpriseCode(taxCode.trim())
    ) {
      toast.error("Mã số doanh nghiệp / MST phải gồm 10 hoặc 13 chữ số.");
      return false;
    }

    if (!isValidPublicLink(link)) {
      toast.error(
        "Vui lòng nhập Website / Landing page / LinkedIn hợp lệ. Bạn có thể nhập đầy đủ hoặc chỉ nhập domain.",
      );
      return false;
    }

    if (requiresNewEvidence && files.length === 0) {
      toast.error(
        "Bạn cần tải lên bộ minh chứng mới cho lần gửi lại theo yêu cầu của staff.",
      );
      return false;
    }

    if (!isResubmit && files.length === 0 && !hasExistingEvidence) {
      toast.error("Vui lòng tải lên ít nhất một tài liệu minh chứng.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmit()) return;

    setLoading(true);
    try {
      const res = (await SubmitStartupKYC(
        buildFormData(),
      )) as unknown as IBackendRes<null>;

      if (res.success || res.isSuccess) {
        toast.success(
          isResubmit
            ? "Hồ sơ đã được cập nhật thành công."
            : "Hồ sơ đã được gửi thành công.",
        );
        router.push("/startup/verification/status");
      } else {
        toast.error(
          translateUploadErrorMessage(
            res.message || "Gửi hồ sơ thất bại. Vui lòng thử lại.",
          ),
        );
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi kết nối. Vui lòng thử lại.";
      toast.error(`Gửi thất bại: ${translateUploadErrorMessage(msg)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const res = (await SaveStartupKYCDraft(
        buildFormData(),
      )) as unknown as IBackendRes<null>;

      if (res.success || res.isSuccess) {
        toast.success("Đã lưu bản nháp KYC.");
        router.push("/startup/verification");
      } else {
        toast.error(
          translateUploadErrorMessage(
            res.message || "Lưu bản nháp thất bại. Vui lòng thử lại.",
          ),
        );
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi kết nối. Vui lòng thử lại.";
      toast.error(
        `Lưu bản nháp thất bại: ${translateUploadErrorMessage(msg)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isResubmit &&
        initialData?.requestedAdditionalItems &&
        initialData.requestedAdditionalItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="w-5 h-5" />
              <p className="text-[14px] font-bold">Lưu ý sửa đổi theo Staff</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {initialData.requestedAdditionalItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-amber-100"
                >
                  <div className="size-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {!isResubmit && (
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Lộ trình xác thực
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode("WITH_LEGAL_ENTITY")}
                className={cn(
                  "flex flex-col p-4 rounded-xl border-2 transition-all text-left",
                  mode === "WITH_LEGAL_ENTITY"
                    ? "border-[#eec54e] bg-[#eec54e]/5"
                    : "border-slate-100 hover:border-slate-300",
                )}
              >
                <Building2
                  className={cn(
                    "w-6 h-6 mb-2",
                    mode === "WITH_LEGAL_ENTITY"
                      ? "text-[#eec54e]"
                      : "text-slate-400",
                  )}
                />
                <p className="text-[13px] font-bold text-slate-800">
                  Có tư cách pháp nhân
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dành cho công ty đã đăng ký kinh doanh chính thức.
                </p>
              </button>

              <button
                onClick={() => setMode("WITHOUT_LEGAL_ENTITY")}
                className={cn(
                  "flex flex-col p-4 rounded-xl border-2 transition-all text-left",
                  mode === "WITHOUT_LEGAL_ENTITY"
                    ? "border-[#eec54e] bg-[#eec54e]/5"
                    : "border-slate-100 hover:border-slate-300",
                )}
              >
                <Users
                  className={cn(
                    "w-6 h-6 mb-2",
                    mode === "WITHOUT_LEGAL_ENTITY"
                      ? "text-[#eec54e]"
                      : "text-slate-400",
                  )}
                />
                <p className="text-[13px] font-bold text-slate-800">
                  Chưa có pháp nhân
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dành cho dự án đang phát triển hoặc nhóm sáng lập.
                </p>
              </button>
            </div>
          </div>
        )}

        <div className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-[#eec54e] pl-4">
              <h3 className="text-[15px] font-bold text-slate-900">
                Thông tin định danh
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className={labelCls}>
                  {mode === "WITH_LEGAL_ENTITY"
                    ? "Tên đầy đủ theo pháp luật"
                    : "Tên dự án / Startup"}
                </label>
                <input
                  disabled={loading}
                  className={inputCls}
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  autoComplete="off"
                  placeholder={
                    mode === "WITH_LEGAL_ENTITY"
                      ? "VD: AISEP XYZ JSC"
                      : "VD: Dự án Nông trại thông minh"
                  }
                />
              </div>

              {mode === "WITH_LEGAL_ENTITY" && (
                <div className="space-y-1.5">
                  <label className={labelCls}>Mã số doanh nghiệp / MST</label>
                  <input
                    disabled={loading}
                    value={taxCode}
                    onChange={(e) =>
                      setTaxCode(sanitizeEnterpriseCode(e.target.value))
                    }
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={13}
                    className={inputCls}
                    placeholder="10 hoặc 13 chữ số"
                  />
                  <p className="text-[11px] text-slate-400">
                    Chỉ nhận chữ số. MST hợp lệ gồm 10 hoặc 13 số.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className={labelCls}>
                  {mode === "WITH_LEGAL_ENTITY"
                    ? "Người đại diện pháp luật"
                    : "Người đại diện nhóm"}
                </label>
                <input
                  disabled={loading}
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  autoComplete="off"
                  className={inputCls}
                  placeholder="Họ và tên đầy đủ"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Chức vụ</label>
                <input
                  disabled={loading}
                  value={repRole}
                  onChange={(e) => setRepRole(e.target.value)}
                  autoComplete="off"
                  className={inputCls}
                  placeholder="VD: Founder, CEO"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Email công việc</label>
                <input
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className={inputCls}
                  placeholder="email@company.com"
                />
              </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>Website / Landing page / LinkedIn</label>
                  <input
                    type="url"
                    disabled={loading}
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    inputMode="url"
                    autoComplete="url"
                    className={inputCls}
                    placeholder="https://..."
                  />
                </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-[#eec54e] pl-4">
              <h3 className="text-[15px] font-bold text-slate-900">
                Tài liệu minh chứng
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-[13px] text-slate-500 leading-relaxed">
                {mode === "WITH_LEGAL_ENTITY"
                  ? "Tải lên giấy phép kinh doanh hoặc tài liệu chứng minh pháp nhân của startup."
                  : "Tải lên tài liệu chứng minh dự án đang hoạt động như pitch deck, screenshot sản phẩm, tài liệu demo hoặc link công khai."}
              </p>

              {isResubmit && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[12px] font-bold text-amber-800">
                      {requiresNewEvidence
                        ? "Bạn cần thay bộ minh chứng cho lần gửi lại"
                        : "Staff không yêu cầu thay bộ minh chứng hiện tại"}
                    </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-amber-700">
                    {requiresNewEvidence
                      ? "Tài liệu của lần trước chỉ để bạn đối chiếu. Với lần gửi lại này, staff yêu cầu thay bộ minh chứng nên hệ thống chỉ nhận các tệp mới bạn tải lên bên dưới."
                        : "Tài liệu của lần trước được hiển thị để bạn đối chiếu. Bạn có thể chỉ sửa thông tin văn bản hoặc liên kết và gửi lại mà không cần tải file mới."}
                  </p>
                </div>
              )}

              <KycFileUploader
                key={uploaderResetKey}
                label={
                  isResubmit
                    ? mode === "WITH_LEGAL_ENTITY"
                      ? requiresNewEvidence
                        ? "Tải lên đầy đủ bộ giấy phép kinh doanh mới"
                        : "Tải lên bộ giấy phép mới nếu bạn muốn thay thế"
                      : requiresNewEvidence
                        ? "Tải lên đầy đủ bộ minh chứng dự án mới"
                        : "Tải lên bộ minh chứng mới nếu bạn muốn thay thế"
                    : mode === "WITH_LEGAL_ENTITY"
                      ? "Giấy phép kinh doanh"
                      : "Tài liệu minh chứng dự án"
                }
                description={
                  isResubmit
                    ? requiresNewEvidence
                      ? "Bộ tệp bạn chọn ở đây sẽ thay thế toàn bộ minh chứng của phiên bản mới."
                      : "Nếu bạn chọn tệp mới ở đây, phiên bản mới sẽ dùng bộ tệp mới. Nếu bạn không chọn tệp mới, hệ thống sẽ giữ lại minh chứng của lần trước."
                    : undefined
                }
                limit={mode === "WITH_LEGAL_ENTITY" ? 1 : 3}
                onChange={handleFilesChange}
              />

              {isResubmit && files.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-[12px] font-bold text-emerald-800">
                    Bộ minh chứng sẽ gửi đi: {files.length} tệp
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-emerald-700">
                    {requiresNewEvidence
                      ? "Chỉ các tệp mới bạn vừa chọn mới được gửi trong lần resubmit này. Tài liệu của lần nộp trước sẽ không tự động đi kèm."
                      : "Bạn đã chọn thay thế bộ minh chứng cho phiên bản mới bằng các tệp vừa tải lên."}
                  </p>
                </div>
              )}

              {isResubmit && !requiresNewEvidence && hasExistingEvidence && files.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-[12px] font-bold text-amber-800">
                      Bạn đang thay thế bộ minh chứng mà staff không yêu cầu đổi
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-amber-700">
                      Bộ minh chứng hiện tại vẫn có thể được giữ nguyên cho lần gửi lại này. Nếu bạn
                      tiếp tục với các tệp mới, phiên bản mới sẽ thay toàn bộ bộ file hiện tại bằng bộ
                      file mới bạn vừa chọn.
                    </p>
                </div>
              )}

              {hasExistingEvidence && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-semibold text-slate-500">
                      {isResubmit ? "Tài liệu của lần nộp trước" : "Tài liệu đã đính kèm"}
                    </p>
                    {isResubmit && (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Chỉ để tham khảo
                      </span>
                    )}
                  </div>
                  {isResubmit && (
                    <p className="text-[12px] text-slate-400">
                      {requiresNewEvidence
                        ? "Các tệp này thuộc phiên bản trước đã bị trả lại hoặc cần bổ sung. Bạn có thể xem lại để đối chiếu, nhưng chúng sẽ không được gửi sang phiên bản mới nếu bạn không tải lại."
                        : "Các tệp này thuộc phiên bản trước. Nếu bạn không tải bộ file mới, hệ thống sẽ giữ lại bộ minh chứng này khi bạn gửi lại hồ sơ."}
                    </p>
                  )}
                  <div className="space-y-2">
                    {existingEvidenceFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                      >
                        <div className="min-w-0">
                          {isResubmit && (
                            <div className="mb-1 flex items-center gap-2">
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                Phiên bản trước
                              </span>
                            </div>
                          )}
                          <p className="truncate text-[13px] font-semibold text-slate-800">
                            {file.fileName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {file.kind === "BUSINESS_REGISTRATION_CERTIFICATE"
                              ? "Giấy phép kinh doanh"
                              : "Tài liệu minh chứng hoạt động"}
                            {file.uploadedAt
                              ? ` · ${new Date(file.uploadedAt).toLocaleDateString("vi-VN")}`
                              : ""}
                          </p>
                        </div>
                        {file.url ? (
                          <Link
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
                          >
                            {isResubmit ? "Xem file cũ" : "Xem file"}
                          </Link>
                        ) : (
                          <span className="shrink-0 text-[12px] text-slate-400">
                            Chưa có liên kết
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isResubmit && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[12px] text-slate-500">
                  {requiresNewEvidence
                    ? "Nếu tài liệu cũ đã bị đánh fail, bạn không cần xóa nó khỏi lịch sử. Chỉ cần tải lên bộ minh chứng mới đạt yêu cầu, vì hệ thống sẽ dùng đúng bộ file mới này cho lần resubmit."
                    : "Nếu staff chỉ yêu cầu sửa thông tin văn bản hoặc liên kết, bạn có thể giữ lại tài liệu cũ. Chỉ tải bộ file mới khi bạn muốn thay thế minh chứng hiện tại."}
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-normal">
                  AISEP sử dụng quy chuẩn bảo mật để bảo vệ tài liệu của bạn.
                  Tài liệu chỉ được dùng cho mục đích xác minh danh tính.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="space-y-6">
            <div
              onClick={() => !loading && setAgreed(!agreed)}
              className={cn(
                "flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group",
                agreed
                  ? "border-emerald-100 bg-emerald-50/30"
                  : "border-slate-50 bg-slate-50/50 hover:border-slate-200",
              )}
            >
              <div
                className={cn(
                  "size-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 shrink-0",
                  agreed
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-white border-slate-300 group-hover:border-slate-400",
                )}
              >
                {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-bold text-slate-800">
                  Cam kết tính trung thực
                </p>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Tôi xác nhận rằng mọi thông tin và tài liệu cung cấp trên là
                  chính xác và hợp pháp. Tôi chịu trách nhiệm nếu có sai lệch
                  cố ý.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/80 px-8 py-5 flex items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400 hidden md:block">
            Kiểm tra kỹ thông tin trước khi gửi hồ sơ.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-[13px] transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              Lưu bản nháp
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || !agreed || (requiresNewEvidence && files.length === 0)}
              className={cn(
                "flex items-center gap-2.5 px-10 py-3.5 rounded-xl text-white font-bold text-[14px] transition-all shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-50",
                loading
                  ? "bg-slate-400"
                  : "bg-[#0f172a] hover:bg-[#1e293b] shadow-slate-200",
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isResubmit ? (
                <Send className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              {loading
                ? "Đang xử lý..."
                : isResubmit
                  ? "Gửi lại hồ sơ"
                  : "Nộp hồ sơ duyệt"}
            </button>
          </div>
        </div>
      </div>

      {showReplaceWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-[18px] font-bold text-slate-900">
                      Xác nhận thay bộ minh chứng
                    </h3>
                    <p className="text-[13px] leading-relaxed text-slate-500">
                      Staff hiện không yêu cầu thay bộ minh chứng hiện tại. Nếu bạn tiếp tục,
                      bộ file mới bạn vừa chọn sẽ thay thế toàn bộ bộ tài liệu cũ cho lần gửi lại này.
                    </p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-[12px] font-bold text-amber-800">
                  Điều gì sẽ xảy ra nếu bạn tiếp tục?
                </p>
                <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-amber-700">
                  <li>- Phiên bản mới sẽ dùng bộ file bạn vừa tải lên.</li>
                  <li>- Bộ minh chứng của lần trước sẽ chỉ còn trong lịch sử tham khảo.</li>
                  <li>- Nếu bạn chỉ cần sửa text hoặc liên kết, bạn có thể quay lại và giữ nguyên tài liệu cũ.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 rounded-b-3xl border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={handleCancelEvidenceReplacement}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Quay lại giữ file cũ
              </button>
              <button
                type="button"
                onClick={handleConfirmEvidenceReplacement}
                className="rounded-xl bg-[#0f172a] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1e293b]"
              >
                Tiếp tục thay file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

