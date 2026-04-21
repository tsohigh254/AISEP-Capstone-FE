"use client";

import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  ApproveStartupRegistration, ApproveAdvisorRegistration, ApproveInvestorRegistration,
  RejectStartupRegistration, RejectAdvisorRegistration, RejectInvestorRegistration,
  GetPendingStartupKycById, GetPendingAdvisorById, GetPendingInvestorKycById
} from "@/services/staff/registration.api";
import axios from "@/services/interceptor";
import { useAuth } from "@/context/context";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  Info,
  ChevronRight,
  Eye,
  MessageSquare,
  MoreVertical,
  Plus,
  Zap,
  Building2,
  User,
  GraduationCap,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import {
  KYCSubtype,
  AssessmentValue,
  KYC_SUBTYPE_CONFIGS,
  ASSESSMENT_LABELS,
  getSuggestedResult,
  SCORE_MAP,
  HARD_FAIL_VALUES,
  APPROVAL_THRESHOLDS,
} from "@/types/staff-kyc";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- Types ---
type KYCStatus = "PENDING" | "IN_REVIEW" | "PENDING_MORE_INFO" | "APPROVED" | "REJECTED" | "FAILED";
type PreviewDocument = {
  url: string;
  name: string;
  fileType?: string | null;
};

// --- Helper Functions ---
const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUS_CFG: Record<KYCStatus | "FAILED", { label: string, badge: string, dot: string }> = {
  PENDING: { label: "Chờ xử lý", badge: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-400" },
  IN_REVIEW: { label: "Đang soát xét", badge: "bg-blue-50 text-blue-700 border-blue-200/80", dot: "bg-blue-400" },
  PENDING_MORE_INFO: { label: "Chờ bổ sung", badge: "bg-purple-50 text-purple-700 border-purple-200/80", dot: "bg-purple-400" },
  APPROVED: { label: "Đã duyệt", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-400" },
  REJECTED: { label: "Từ chối", badge: "bg-red-50 text-red-700 border-red-200/80", dot: "bg-red-400" },
  FAILED: { label: "Thẩm định thất bại", badge: "bg-red-50 text-red-700 border-red-200/80", dot: "bg-red-400" },
};

function normalizeDetailStatus(value: unknown): KYCStatus | "FAILED" {
  const raw = String(value || "").toUpperCase();
  if (["UNDER_REVIEW", "IN_REVIEW", "PENDING_REVIEW", "PENDINGKYC", "PENDING"].includes(raw)) return "IN_REVIEW";
  if (raw === "PENDING_MORE_INFO") return "PENDING_MORE_INFO";
  if (["APPROVED", "VERIFIED"].includes(raw)) return "APPROVED";
  if (raw === "REJECTED") return "REJECTED";
  if (["FAILED", "VERIFICATION_FAILED"].includes(raw)) return "FAILED";
  return "IN_REVIEW";
}

function getOpenableUrl(value?: string | null) {
  return value && /^https?:\/\//i.test(value) ? value : "";
}

function getExternalLink(value?: string | null) {
  if (!value || value === "—") return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
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

function getFileNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const decoded = decodeURIComponent(pathname.split("/").pop() || "");
    return decoded || "tai-lieu";
  } catch {
    return "tai-lieu";
  }
}

function getPreviewDocument(data: any, entityId: string): PreviewDocument | null {
  if (!data) return null;

  if (entityId.startsWith("STARTUP-")) {
    const evidenceFiles = data.submissionSummary?.evidenceFiles || [];
    const file = evidenceFiles[0];
    const url = getOpenableUrl(file?.url);
    if (!url) return null;
    return {
      url,
      name: file?.fileName || getFileNameFromUrl(url),
      fileType: file?.fileType || null,
    };
  }

  if (entityId.startsWith("ADVISOR-")) {
    const evidenceFiles = data.submissionSummary?.evidenceFiles || [];
    const file = evidenceFiles[0];
    const url = getOpenableUrl(file?.url);
    if (!url) return null;
    return {
      url,
      name: file?.fileName || getFileNameFromUrl(url),
      fileType: file?.fileType || null,
    };
  }

  const fallbackUrl = getOpenableUrl(
    data?.idProofFileURL ||
    data?.investmentProofFileURL ||
    data?.proofFile ||
    data?.fileCertificateBusiness
  );

  if (!fallbackUrl) return null;

  return {
    url: fallbackUrl,
    name: getFileNameFromUrl(fallbackUrl),
    fileType: null,
  };
}

// --- Subtype Resolver ---
const getSubtypeById = (id: string): KYCSubtype => {
  if (id.startsWith("ADVISOR-")) return "ADVISOR";
  if (id.startsWith("INVESTOR-")) return "INDIVIDUAL_INVESTOR";
  if (id.endsWith("002")) return "STARTUP_NO_ENTITY";
  if (id.endsWith("003")) return "INSTITUTIONAL_INVESTOR";
  if (id.endsWith("004")) return "INDIVIDUAL_INVESTOR";
  if (id.endsWith("005")) return "ADVISOR";
  return "STARTUP_ENTITY";
};

export default function KYCDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { id } = React.use(params);
  const realId = id.split("-")[1];
  const numericId = parseInt(realId);

  const [activeTab, setActiveTab] = useState<"INFO" | "HISTORY">("INFO");
  const [detectedSubtype, setDetectedSubtype] = useState<KYCSubtype>(getSubtypeById(id));

  // Use React Query for data fetching
  const { data: rawData, isLoading: loading } = useQuery({
    queryKey: ["kyc-detail", id],
    queryFn: async () => {
      let res;
      if (id.startsWith("STARTUP-")) {
        res = await GetPendingStartupKycById(numericId);
      } else if (id.startsWith("ADVISOR-")) {
        res = await GetPendingAdvisorById(numericId);
      } else if (id.startsWith("INVESTOR-")) {
        res = await GetPendingInvestorKycById(numericId);
      }
      return (res as any)?.data;
    },
    enabled: !!id && !isNaN(numericId),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const realData = useMemo(() => {
    if (!rawData) return rawData;

    // 1. Chuẩn hóa dữ liệu Startup
    if (id.startsWith("STARTUP-")) {
      const summary = rawData.submissionSummary;
      const evidenceFiles = summary?.evidenceFiles || [];
      const primaryEvidence = evidenceFiles[0];

      return {
        ...rawData,
        companyName: summary?.legalFullName || summary?.projectName || rawData.companyName,
        businessCode: summary?.enterpriseCode || rawData.businessCode,
        fullNameOfApplicant: summary?.representativeFullName || rawData.fullNameOfApplicant,
        submitterRole: summary?.representativeRole || rawData.submitterRole,
        roleOfApplicant: summary?.representativeRole || rawData.roleOfApplicant,
        contactEmail: summary?.workEmail || summary?.contactEmail || rawData.contactEmail,
        website: summary?.publicLink || rawData.website,
        fileCertificateBusiness: primaryEvidence?.url || rawData.fileCertificateBusiness,
        avatarUrl: rawData.logoURL || null,
      };
    }

    // 2. Chuẩn hóa dữ liệu Advisor
    if (id.startsWith("ADVISOR-")) {
      // Helper map chuyên môn sang Tiếng Việt
      const formatExpertise = (val: any) => {
        if (!val) return null;
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
        if (Array.isArray(val)) {
          return val.map(v => EXPERTISE_LABELS[v] || v).join(", ");
        }
        return EXPERTISE_LABELS[val] || val;
      };

      const expertiseArr = rawData.expertise ? rawData.expertise.split(",") : [];

      return {
        ...rawData,
        title: rawData.title || rawData.currentRoleTitle,
        linkedin: rawData.linkedInURL || rawData.professionalProfileLink,
        primaryExpertise: formatExpertise(expertiseArr[0]),
        secondaryExpertise: formatExpertise(expertiseArr.slice(1)),
        currentOrganization: rawData.currentOrganization || "—",
        avatarUrl: rawData.profilePhotoURL || null,
      };
    }

    // 3. Chuẩn hóa dữ liệu Investor
    if (id.startsWith("INVESTOR-")) {
      const summary = rawData.submissionSummary;
      return {
        ...rawData,
        profileFullName: rawData.fullName,
        fullName: summary?.fullName || rawData.fullName,
        contactEmail: summary?.contactEmail || rawData.email,
        title: summary?.currentRoleTitle || null,
        currentOrganization: summary?.organizationName || rawData.firmName || null,
        location: summary?.location || null,
        linkedin: summary?.linkedInURL || null,
        website: summary?.website || null,
        submitterRole: summary?.submitterRole || null,
        taxIdOrBusinessCode: summary?.taxIdOrBusinessCode || null,
        investorEvidenceFiles: summary?.evidenceFiles ?? [],
        workflowStatus: rawData.workflowStatus,
        avatarUrl: rawData.profilePhotoURL || null,
      };
    }

    return rawData;
  }, [rawData, id]);

  const subtype = detectedSubtype;
  const config = KYC_SUBTYPE_CONFIGS[subtype];

  const entityName = useMemo(() => {
    if (!realData) return "Đang tải dữ liệu...";
    if (id.startsWith("STARTUP-")) {
      return realData.submissionSummary?.legalFullName || realData.submissionSummary?.projectName || realData.companyName || "N/A";
    }
    if (id.startsWith("ADVISOR-")) return realData.fullName || "N/A";
    if (id.startsWith("INVESTOR-")) {
      const isInstitutional = realData.submissionSummary?.investorCategory === "INSTITUTIONAL";
      if (isInstitutional) return realData.currentOrganization || realData.profileFullName || realData.fullName || "N/A";
      return realData.profileFullName || realData.fullName || "N/A";
    }
    return "N/A";
  }, [realData, id]);

  const detailStatus = useMemo(
    () => normalizeDetailStatus(realData?.workflowStatus || realData?.profileStatus),
    [realData]
  );

  const detailSubmittedAt = useMemo(
    () => realData?.submittedAt || realData?.updatedAt || null,
    [realData]
  );

  const [isSuccess, setIsSuccess] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [requiresNewEvidence, setRequiresNewEvidence] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);

  useEffect(() => {
    if (realData) {
      if (id.startsWith("STARTUP-")) {
        setDetectedSubtype(realData.submissionSummary?.startupVerificationType === "WITHOUT_LEGAL_ENTITY" ? "STARTUP_NO_ENTITY" : "STARTUP_ENTITY");
      } else if (id.startsWith("ADVISOR-")) {
        setDetectedSubtype("ADVISOR");
      } else if (id.startsWith("INVESTOR-")) {
        const category = realData.submissionSummary?.investorCategory || realData.investorCategory || realData.investorType;
        setDetectedSubtype(category === "INSTITUTIONAL" ? "INSTITUTIONAL_INVESTOR" : "INDIVIDUAL_INVESTOR");
      }
    }
  }, [realData, id]);

  const avatarGradient = useMemo(() => getAvatarGradient(entityName), [entityName]);

  // Initialize assessments
  const [assessments, setAssessments] = useState<Record<string, AssessmentValue>>({});

  // Reset assessments when subtype changes to ensure "Confirm" button activates for the correct fields
  useEffect(() => {
    if (config) {
      setAssessments(Object.fromEntries(config.fields.map((f: any) => [f.id, f.options[0]])));
    }
  }, [subtype]);

  useEffect(() => {
    if (id.startsWith("STARTUP-") || id.startsWith("INVESTOR-")) {
      setRequiresNewEvidence(Boolean(realData?.requiresNewEvidence));
    }
  }, [id, realData?.requiresNewEvidence]);

  const updateAssessment = (fieldId: string, val: AssessmentValue) => {
    setAssessments(prev => ({ ...prev, [fieldId]: val }));
  };

  const result = useMemo(() => getSuggestedResult(subtype, assessments), [subtype, assessments]);
  const isComplete = useMemo(() => {
    if (!config) return false;
    return config.fields.every(f => assessments[f.id] !== undefined);
  }, [config, assessments]);
  const fileFieldRequiresNewEvidence = useMemo(() => {
    if (!config) return false;
    if (!(id.startsWith("STARTUP-") || id.startsWith("ADVISOR-") || id.startsWith("INVESTOR-"))) return false;
    return config.fields.some(
      (field) =>
        field.type === "file" &&
        assessments[field.id] !== undefined &&
        HARD_FAIL_VALUES.includes(assessments[field.id]),
    );
  }, [assessments, config, id]);
  const effectiveRequiresNewEvidence =
    (id.startsWith("STARTUP-") || id.startsWith("ADVISOR-") || id.startsWith("INVESTOR-")) &&
    (fileFieldRequiresNewEvidence || requiresNewEvidence);

  const currentPreviewSource = useMemo(
    () => getPreviewDocument(realData, id),
    [realData, id]
  );
  const startupEvidenceFiles = useMemo(
    () => (id.startsWith("STARTUP-") ? realData?.submissionSummary?.evidenceFiles || [] : []),
    [id, realData]
  );
  const advisorEvidenceFiles = useMemo(
    () => (id.startsWith("ADVISOR-") ? realData?.submissionSummary?.evidenceFiles || [] : []),
    [id, realData]
  );

  const activePreviewDoc = useMemo(() => {
    if (!previewDoc) return currentPreviewSource;
    return previewDoc;
  }, [previewDoc, currentPreviewSource]);

  const handleOpenAttachment = async (
    mode: "open" | "preview" = "open",
    targetFileId?: string
  ) => {
    if (id.startsWith("STARTUP-")) {
      const currentEvidenceFiles = realData?.submissionSummary?.evidenceFiles || [];
      const currentFile =
        currentEvidenceFiles.find((item: { id?: string }) => item.id === targetFileId) ||
        currentEvidenceFiles[0];
      const currentUrl = getOpenableUrl(currentFile?.url);
      const currentPreview: PreviewDocument = {
        url: currentUrl,
        name: currentFile?.fileName || getFileNameFromUrl(currentUrl),
        fileType: currentFile?.fileType || null,
      };

      if (!currentUrl) {
        toast.error("Không tìm thấy link xem tài liệu.");
        return;
      }

      if (mode === "preview") {
        setPreviewDoc(currentPreview);
      } else {
        const popup = createPendingTab();
        openUrlInNewTab(currentUrl, popup);
      }

      const currentStatus = await getUrlStatus(currentUrl);
      if (currentStatus !== 401 && currentStatus !== 403) {
        return;
      }

      try {
        const refreshed = await GetPendingStartupKycById(numericId);
        const refreshedEnvelope = refreshed as unknown as IBackendRes<any>;
        const refreshedData = refreshedEnvelope?.data;

        if (refreshedData) {
          queryClient.setQueryData(["kyc-detail", id], refreshedData);

          const refreshedEvidenceFiles = refreshedData.submissionSummary?.evidenceFiles || [];
          const refreshedFile =
            refreshedEvidenceFiles.find((item: { id?: string }) => item.id === (targetFileId || currentFile?.id)) ||
            refreshedEvidenceFiles[0];
          const refreshedUrl = getOpenableUrl(refreshedFile?.url);
          const refreshedStatus = refreshedUrl ? await getUrlStatus(refreshedUrl) : null;

          if (refreshedUrl && refreshedStatus !== 401 && refreshedStatus !== 403) {
            const refreshedPreview: PreviewDocument = {
              url: refreshedUrl,
              name: refreshedFile?.fileName || getFileNameFromUrl(refreshedUrl),
              fileType: refreshedFile?.fileType || null,
            };

            if (mode === "preview") {
              setPreviewDoc(refreshedPreview);
            } else {
              const popup = createPendingTab();
              openUrlInNewTab(refreshedUrl, popup);
            }
            return;
          }
        }

        toast.error("Link xem tài liệu đã hết hạn hoặc không còn khả dụng.");
      } catch {
        toast.error("Không thể làm mới link xem tài liệu. Vui lòng thử lại.");
      }

      return;
    }

    if (id.startsWith("ADVISOR-")) {
      const currentEvidenceFiles = realData?.submissionSummary?.evidenceFiles || [];
      const currentFile =
        currentEvidenceFiles.find((item: { id?: string }) => item.id === targetFileId) ||
        currentEvidenceFiles[0];
      let currentUrl = getOpenableUrl(currentFile?.url);

      if (!currentUrl) {
        toast.error("Không tìm thấy link xem tài liệu.");
        return;
      }

      const currentPreview: PreviewDocument = {
        url: currentUrl,
        name: currentFile?.fileName || getFileNameFromUrl(currentUrl),
        fileType: currentFile?.fileType || null,
      };

      if (mode === "preview") {
        setPreviewDoc(currentPreview);
      } else {
        const popup = createPendingTab();
        openUrlInNewTab(currentUrl, popup);
      }

      const currentStatus = await getUrlStatus(currentUrl);
      if (currentStatus !== 401 && currentStatus !== 403) {
        return;
      }

      toast.info("Link hết hạn, đang thử làm mới tài liệu...");

      try {
        const refreshed = await GetPendingAdvisorById(numericId);
        const refreshedEnvelope = refreshed as unknown as IBackendRes<any>;
        const refreshedData = refreshedEnvelope?.data;

        if (refreshedData) {
          queryClient.setQueryData(["kyc-detail", id], refreshedData);

          const refreshedEvidenceFiles = refreshedData.submissionSummary?.evidenceFiles || [];
          const refreshedFile =
            refreshedEvidenceFiles.find((item: { id?: string }) => item.id === (targetFileId || currentFile?.id)) ||
            refreshedEvidenceFiles[0];
            
          let refreshedUrl = getOpenableUrl(refreshedFile?.url);

          const refreshedStatus = refreshedUrl ? await getUrlStatus(refreshedUrl) : null;

          if (refreshedUrl && refreshedStatus !== 401 && refreshedStatus !== 403) {
            const refreshedPreview: PreviewDocument = {
              url: refreshedUrl,
              name: refreshedFile?.fileName || getFileNameFromUrl(refreshedUrl),
              fileType: refreshedFile?.fileType || null,
            };

            if (mode === "preview") {
              setPreviewDoc(refreshedPreview);
            } else {
              const popup = createPendingTab();
              openUrlInNewTab(refreshedUrl, popup);
            }
            return;
          }
        }

        toast.error("Link xem tài liệu của Advisor đã hết hạn hoặc không còn khả dụng.");
      } catch {
        toast.error("Không thể làm mới link xem tài liệu của Advisor. Vui lòng thử lại.");
      }

      return;
    }

    if (id.startsWith("INVESTOR-")) {
      const currentEvidenceFiles = (realData?.investorEvidenceFiles || []) as { id: number; url: string; fileName: string | null; kind: string }[];
      const currentFile =
        currentEvidenceFiles.find((item) => String(item.id) === targetFileId) ||
        currentEvidenceFiles[0];
      const currentUrl = getOpenableUrl(currentFile?.url);

      if (!currentUrl) {
        toast.error("Không tìm thấy link xem tài liệu.");
        return;
      }

      const currentPreview: PreviewDocument = {
        url: currentUrl,
        name: currentFile?.fileName || getFileNameFromUrl(currentUrl),
        fileType: null,
      };

      if (mode === "preview") {
        setPreviewDoc(currentPreview);
      } else {
        const popup = createPendingTab();
        openUrlInNewTab(currentUrl, popup);
      }

      const currentStatus = await getUrlStatus(currentUrl);
      if (currentStatus !== 401 && currentStatus !== 403) {
        return;
      }

      toast.info("Link hết hạn, đang thử làm mới tài liệu...");

      try {
        const refreshed = await GetPendingInvestorKycById(numericId);
        const refreshedEnvelope = refreshed as unknown as IBackendRes<any>;
        const refreshedData = refreshedEnvelope?.data;

        if (refreshedData) {
          queryClient.setQueryData(["kyc-detail", id], refreshedData);

          const refreshedEvidenceFiles = (refreshedData.submissionSummary?.evidenceFiles || []) as { id: number; url: string; fileName: string | null; kind: string }[];
          const refreshedFile =
            refreshedEvidenceFiles.find((item) => String(item.id) === (targetFileId || String(currentFile?.id))) ||
            refreshedEvidenceFiles[0];
          const refreshedUrl = getOpenableUrl(refreshedFile?.url);
          const refreshedStatus = refreshedUrl ? await getUrlStatus(refreshedUrl) : null;

          if (refreshedUrl && refreshedStatus !== 401 && refreshedStatus !== 403) {
            const refreshedPreview: PreviewDocument = {
              url: refreshedUrl,
              name: refreshedFile?.fileName || getFileNameFromUrl(refreshedUrl),
              fileType: null,
            };

            if (mode === "preview") {
              setPreviewDoc(refreshedPreview);
            } else {
              const popup = createPendingTab();
              openUrlInNewTab(refreshedUrl, popup);
            }
            return;
          }
        }

        toast.error("Link xem tài liệu của Investor đã hết hạn hoặc không còn khả dụng.");
      } catch {
        toast.error("Không thể làm mới link xem tài liệu của Investor. Vui lòng thử lại.");
      }

      return;
    }

    const fallbackUrl = getOpenableUrl(
      realData?.idProofFileURL ||
      realData?.investmentProofFileURL ||
      realData?.fileCertificateBusiness
    );

    if (!fallbackUrl) {
      toast.error("Không tìm thấy file tệp đính kèm.");
      return;
    }

    const fallbackPreview: PreviewDocument = {
      url: fallbackUrl,
      name: getFileNameFromUrl(fallbackUrl),
      fileType: null,
    };

    if (mode === "preview") {
      setPreviewDoc(fallbackPreview);
      return;
    }

    const popup = createPendingTab();
    openUrlInNewTab(fallbackUrl, popup);
  };

  const isPreviewImage = useMemo(() => {
    if (!activePreviewDoc?.url) return false;
    // Check MIME type first (reliable)
    if (activePreviewDoc.fileType?.startsWith("image/")) return true;
    // Check filename extension from name field
    if (/\.(png|jpe?g|gif|bmp|svg|webp)$/i.test(activePreviewDoc.name || "")) return true;
    // Check URL — may not have extension for Cloudinary raw URLs, so this is last resort
    return /\.(png|jpe?g|gif|bmp|svg|webp)(\?|$)/i.test(activePreviewDoc.url);
  }, [activePreviewDoc]);

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#eec54e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isSuccess) {
// ... (success view remains same)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20" />
          <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
        </div>
        <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Xử lý thành công!</h2>
        <p className="text-[14px] text-slate-500 mt-2 text-center max-w-sm">
          Hồ sơ <span className="font-bold text-slate-900">{entityName}</span> đã được cập nhật nhãn <span className="font-bold text-emerald-600">{result.suggestedLabel}</span>. 
          Thông báo đã được gửi tới người dùng.
        </p>
        <div className="flex items-center gap-4 mt-10">
          <Link 
            href="/staff/kyc"
            className="px-6 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-[#1e293b] transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Về danh sách
          </Link>
          <button 
            onClick={() => setIsSuccess(false)}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            Xem lại hồ sơ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-400">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/staff/kyc"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-[13px] font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Page Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">


        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm overflow-hidden", !realData?.avatarUrl && `bg-gradient-to-br ${avatarGradient}`)}>
              {realData?.avatarUrl
                ? <img src={realData.avatarUrl} alt={entityName} className="w-full h-full object-cover" />
                : entityName.charAt(0).toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-bold text-slate-900 leading-tight font-plus-jakarta-sans">{entityName}</h1>
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", STATUS_CFG[detailStatus].badge)}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CFG[detailStatus].dot)} />
                  {STATUS_CFG[detailStatus].label}
                </span>
                {result.hasHardFail && (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    HARD FAIL
                  </span>
                )}
              </div>
              <p className="text-[13px] text-slate-500 mt-1">{config.label}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Nộp: {new Date().toLocaleDateString('vi-VN')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">#{id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-slate-100 no-scrollbar overflow-x-auto">
            {[ { id: "INFO", label: "Soát xét hồ sơ" }, { id: "HISTORY", label: "Lịch sử xử lý" } ].map((tab) => (
              <button 
                key={tab.id}
                className={cn("px-4 py-2 text-[13px] font-bold whitespace-nowrap border-b-2 -mb-px transition-colors font-plus-jakarta-sans", 
                  activeTab === tab.id ? "border-[#0f172a] text-[#0f172a]" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "INFO" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Thẩm định chi tiết
                </h2>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Khu vực xử lý</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">Thông tin</th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">Dữ liệu</th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 w-64 text-right">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {config.fields.map((field) => {
                      let realValue: React.ReactNode = field.value || "—";
                      
                      if (realData) {
                        // Priority 1: Direct ID matches
                        if (field.id === "legalName") realValue = realData.companyName || "—";
                        else if (field.id === "projectName") realValue = realData.companyName || "—";
                        else if (field.id === "taxId" || field.id === "orgTaxId") realValue = realData.businessCode || realData.taxIdOrBusinessCode || "—";
                        
                        else if (field.id === "submitterName") realValue = realData.fullNameOfApplicant || realData.fullName || "—";
                        else if (field.id === "repName") realValue = realData.fullNameOfApplicant || realData.fullName || "—";
                        else if (field.id === "investorName" || field.id === "advisorName") realValue = realData.fullName || "—";
                        
                        else if (field.id === "workEmail" || field.id === "contactEmail" || field.id === "email") {
                          realValue = realData.contactEmail || realData.email || "—";
                        }
                        
                        else if (field.id === "submitterRole" || field.id === "repRole") {
                          const roleMap: Record<string, string> = {
                            PARTNER: "Đối tác (Partner)",
                            INVESTMENT_MANAGER: "Quản lý đầu tư",
                            ANALYST: "Chuyên viên phân tích",
                            LEGAL_REPRESENTATIVE: "Đại diện pháp luật",
                            AUTHORIZED_PERSON: "Người được ủy quyền",
                          };
                          const raw = realData.submitterRole || realData.roleOfApplicant || "";
                          realValue = roleMap[raw] || raw || "—";
                        }
                        
                        else if (field.id === "officialLink" || field.id === "website" || field.id === "publicLink") {
                          realValue = realData.website || "—";
                        }
                        
                        else if (field.id === "linkedin") {
                          realValue = realData.linkedin || realData.linkedInURL || realData.linkedinURL || "—";
                        }
                        
                        else if (field.id === "primaryExpertise") {
                          realValue = realData.primaryExpertise || realData.expertise || (realData.industryFocus && realData.industryFocus[0]?.industry) || "—";
                        }
                        
                        else if (field.id === "orgLegalName" || field.id === "firmName" || field.id === "org") {
                          realValue = realData.currentOrganization || realData.organizationName || realData.firmName || "—";
                        }

                        else if (field.id === "title") {
                          realValue = realData.title || "—";
                        }

                        // Fallback/Generic handle
                        if (realValue === "—") {
                          // Try to find property by name (case insensitive)
                          const key = Object.keys(realData).find(k => k.toLowerCase() === field.id.toLowerCase());
                          if (key) {
                            const val = (realData as any)[key];
                            if (val && typeof val !== "object") realValue = String(val);
                          }
                        }
                        
                        if (field.type === "file") {
                           if (id.startsWith("STARTUP-")) {
                             realValue = startupEvidenceFiles.length > 0
                               ? `${startupEvidenceFiles.length} tài liệu đính kèm`
                               : "Chưa tải lên";
                           } else if (id.startsWith("ADVISOR-")) {
                             const hasFiles = advisorEvidenceFiles.length > 0;
                             realValue = hasFiles
                               ? `${advisorEvidenceFiles.length} tài liệu đính kèm`
                               : "Chưa tải lên";
                           } else if (id.startsWith("INVESTOR-")) {
                             const files = realData.investorEvidenceFiles || [];
                             realValue = files.length > 0 ? `${files.length} tài liệu đính kèm` : "Chưa tải lên";
                           }
                        }
                      }

                      return (
                      <tr key={field.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-5 align-top">
                          <p className="text-[13px] font-semibold text-slate-700">{field.label}</p>
                        </td>
                        <td className="px-6 py-5 align-top">
                           {field.type === "text" && (
                            <p className="text-[13px] text-slate-600 leading-relaxed font-normal">{realValue}</p>
                           )}
                           {field.type === "link" && (
                            getExternalLink(typeof realValue === "string" ? realValue : "") ? (
                              <a
                                href={getExternalLink(typeof realValue === "string" ? realValue : "")}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 font-medium hover:underline"
                              >
                                Mở liên kết
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-[13px] text-slate-400">Không có liên kết</span>
                            )
                           )}
                          {field.type === "file" && (
                            id.startsWith("STARTUP-") ? (
                              startupEvidenceFiles.length > 0 ? (
                                <div className="space-y-2">
                                  {startupEvidenceFiles.map((file: { id?: string; fileName?: string; fileType?: string | null; url?: string | null }, fileIndex: number) => (
                                    <div
                                      key={file.id || `${field.id}-${fileIndex}`}
                                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors group-hover:bg-white"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-red-500" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-700 text-[12px] truncate">
                                          {file.fileName || `${field.label} ${fileIndex + 1}`}
                                        </p>
                                        <button
                                          onClick={() => void handleOpenAttachment("preview", file.id)}
                                          className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                        >
                                          Xem tài liệu
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[13px] text-slate-400">Không có tài liệu</span>
                              )
                            ) : id.startsWith("ADVISOR-") ? (
                              advisorEvidenceFiles.length > 0 ? (
                                <div className="space-y-2">
                                  {advisorEvidenceFiles.map((file: { id?: string; fileName?: string; fileType?: string | null; url?: string | null }, fileIndex: number) => (
                                    <div
                                      key={file.id || `${field.id}-${fileIndex}`}
                                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors group-hover:bg-white"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-red-500" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-700 text-[12px] truncate">
                                          {file.fileName || `${field.label} ${fileIndex + 1}`}
                                        </p>
                                        <button
                                          onClick={() => void handleOpenAttachment("preview", file.id)}
                                          className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                        >
                                          Xem tài liệu
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-red-500" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-700 text-[12px] truncate">
                                      {field.label}
                                    </p>
                                    <button 
                                      onClick={() => void handleOpenAttachment("preview")}
                                      className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                    >
                                      {realValue === "Chưa tải lên" ? "Không có tài liệu" : "Xem tài liệu"}
                                    </button>
                                  </div>
                                </div>
                              )
                            ) : id.startsWith("INVESTOR-") ? (
                              (() => {
                                const investorFiles = (realData.investorEvidenceFiles || []) as { id: number; url: string; fileName: string | null; kind: string }[];
                                return investorFiles.length > 0 ? (
                                  <div className="space-y-2">
                                    {investorFiles.map((file, fileIndex) => (
                                      <div key={file.id || fileIndex} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors group-hover:bg-white">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                          <FileText className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-semibold text-slate-700 text-[12px] truncate">
                                            {file.fileName || file.kind || field.label}
                                          </p>
                                          <button
                                            onClick={() => void handleOpenAttachment("preview", String(file.id))}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                          >
                                            Xem tài liệu
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[13px] text-slate-400">Không có tài liệu</span>
                                );
                              })()
                            ) : (
                              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-700 text-[12px] truncate">
                                    {field.label}
                                  </p>
                                  <button
                                    onClick={() => void handleOpenAttachment("preview")}
                                    className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight"
                                  >
                                    {realValue === "Chưa tải lên" ? "Không có tài liệu" : "Xem tài liệu"}
                                  </button>
                                </div>
                              </div>
                            )
                           )}
                        </td>
                        <td className="px-6 py-5 align-top text-right">
                          <div className="space-y-2 inline-block text-left w-full">
                            <select 
                              value={assessments[field.id]}
                              onChange={(e) => updateAssessment(field.id, e.target.value as AssessmentValue)}
                              className={cn(
                                "w-full px-3 py-2 rounded-xl text-[12px] font-medium border outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e]",
                                HARD_FAIL_VALUES.includes(assessments[field.id]) 
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : SCORE_MAP[assessments[field.id]] >= 2
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-700"
                              )}
                            >
                              {field.options.map(opt => (
                                <option key={opt} value={opt}>{ASSESSMENT_LABELS[opt]}</option>
                              ))}
                            </select>
                            <div className="flex items-center justify-between px-1">
                               <span className={cn("text-[10px] font-bold uppercase tracking-wide", 
                                  SCORE_MAP[assessments[field.id]] >= 2 ? "text-emerald-500" :
                                  SCORE_MAP[assessments[field.id]] >= 1 ? "text-blue-500" :
                                  SCORE_MAP[assessments[field.id]] < 0 ? "text-red-500" : "text-slate-400"
                               )}>
                                {SCORE_MAP[assessments[field.id]] > 0 ? `+${SCORE_MAP[assessments[field.id]]}` : SCORE_MAP[assessments[field.id]]} điểm
                               </span>
                               {HARD_FAIL_VALUES.includes(assessments[field.id]) && (
                                 <span className="text-[10px] font-bold text-red-600 uppercase italic">Vi phạm nghiêm trọng</span>
                               )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evidence Preview Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    Xem trước minh chứng
                  </h2>
                {activePreviewDoc?.url ? (
                  <a
                    href={activePreviewDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    download={activePreviewDoc.name || "tai-lieu"}
                    className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải xuống
                  </a>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Tải xuống
                    </span>
                  )}
                </div>
                {id.startsWith("STARTUP-") && startupEvidenceFiles.length > 1 && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-slate-700">
                        Chọn tài liệu để xem trước
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {startupEvidenceFiles.length} tệp
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {startupEvidenceFiles.map((file: { id?: string; fileName?: string; url?: string | null }, fileIndex: number) => {
                        const fileUrl = getOpenableUrl(file.url);
                        const isActive =
                          Boolean(fileUrl && activePreviewDoc?.url === fileUrl) ||
                          (!fileUrl && activePreviewDoc?.name === (file.fileName || `Tài liệu ${fileIndex + 1}`));

                        return (
                          <button
                            key={file.id || `preview-file-${fileIndex}`}
                            type="button"
                            onClick={() => void handleOpenAttachment("preview", file.id)}
                            className={cn(
                              "inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[#0f172a] bg-[#0f172a] text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100",
                            )}
                          >
                            <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                            <span className="max-w-[220px] truncate text-[12px] font-medium">
                              {file.fileName || `Tài liệu ${fileIndex + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {id.startsWith("ADVISOR-") && advisorEvidenceFiles.length > 1 && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-slate-700">
                        Chọn tài liệu để xem trước
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {advisorEvidenceFiles.length} tệp
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {advisorEvidenceFiles.map((file: { id?: string; fileName?: string; url?: string | null }, fileIndex: number) => {
                        const fileUrl = getOpenableUrl(file.url);
                        const isActive =
                          Boolean(fileUrl && activePreviewDoc?.url === fileUrl) ||
                          (!fileUrl && activePreviewDoc?.name === (file.fileName || `Tài liệu ${fileIndex + 1}`));

                        return (
                          <button
                            key={file.id || `preview-file-${fileIndex}`}
                            type="button"
                            onClick={() => void handleOpenAttachment("preview", file.id)}
                            className={cn(
                              "inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[#0f172a] bg-[#0f172a] text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100",
                            )}
                          >
                            <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                            <span className="max-w-[220px] truncate text-[12px] font-medium">
                              {file.fileName || `Tài liệu ${fileIndex + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {id.startsWith("INVESTOR-") && (realData?.investorEvidenceFiles || []).length > 1 && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-slate-700">
                        Chọn tài liệu để xem trước
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {(realData?.investorEvidenceFiles || []).length} tệp
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(realData?.investorEvidenceFiles as { id: number; url: string; fileName: string | null; kind: string }[]).map((file, fileIndex) => {
                        const fileUrl = getOpenableUrl(file.url);
                        const isActive = Boolean(fileUrl && activePreviewDoc?.url === fileUrl);
                        return (
                          <button
                            key={file.id || `investor-preview-${fileIndex}`}
                            type="button"
                            onClick={() => void handleOpenAttachment("preview", String(file.id))}
                            className={cn(
                              "inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors",
                              isActive
                                ? "border-[#0f172a] bg-[#0f172a] text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100",
                            )}
                          >
                            <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                            <span className="max-w-[220px] truncate text-[12px] font-medium">
                              {file.fileName || file.kind || `Tài liệu ${fileIndex + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="aspect-[4/3] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden transition-colors hover:border-slate-300">
                  {activePreviewDoc?.url ? (
                    isPreviewImage ? (
                      <img
                        src={activePreviewDoc.url}
                        alt={activePreviewDoc.name}
                        className="w-full h-full object-contain bg-white"
                      />
                    ) : /\.(pdf)(\?|$)/i.test(activePreviewDoc.url) || activePreviewDoc.fileType === "application/pdf" ? (
                      <iframe
                        title={activePreviewDoc.name}
                        src={activePreviewDoc.url}
                        className="w-full h-full bg-white"
                      />
                    ) : (
                      <iframe
                        title={activePreviewDoc.name}
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(activePreviewDoc.url)}&embedded=true`}
                        className="w-full h-full bg-white"
                      />
                    )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center group">
                    <FileText className="w-10 h-10 text-slate-200 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-[13px] text-slate-400 italic">Chọn một tài liệu để xem trước nội dung</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-5">
            {/* Action Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Kết quả soát xét
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Điểm hệ thống</span>
                  <span className={cn("text-[18px] font-bold", result.totalScore >= 6 ? "text-emerald-600" : "text-amber-600")}>
                    {result.totalScore} <span className="text-[12px] font-medium text-slate-400">/ {config.fields.length * 2}</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Gợi ý nhãn</span>
                  <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border", 
                    result.suggestedDecision === "APPROVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200/80" :
                    result.suggestedDecision === "REJECT" ? "bg-red-50 text-red-700 border-red-200/80" :
                    "bg-amber-50 text-amber-700 border-amber-200/80"
                  )}>
                    <Zap className="w-3 h-3" />
                    {result.suggestedLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Ghi chú nội bộ</p>
                  <textarea 
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Nhập ghi chú quan trọng..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none h-24 transition-all"
                  />
                </div>

                {(id.startsWith("STARTUP-") || id.startsWith("ADVISOR-") || id.startsWith("INVESTOR-")) && result.suggestedDecision !== "APPROVE" && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">
                      Yêu cầu minh chứng khi gửi lại
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fileFieldRequiresNewEvidence) {
                          setRequiresNewEvidence((prev) => !prev);
                        }
                      }}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left transition-all",
                        effectiveRequiresNewEvidence
                          ? "border-amber-200 bg-amber-50"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                        fileFieldRequiresNewEvidence && "cursor-not-allowed",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800">
                            {effectiveRequiresNewEvidence
                              ? "Bắt đối tượng tải lại bộ minh chứng mới"
                              : "Cho phép giữ lại minh chứng cũ"}
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                            {fileFieldRequiresNewEvidence
                              ? "Trường tài liệu đang bị đánh fail hoặc nghi vấn nghiêm trọng. Bắt buộc phải tải bộ file mới khi gửi lại hồ sơ."
                              : effectiveRequiresNewEvidence
                              ? "Bật khi vấn đề nằm ở tài liệu minh chứng. Bắt buộc phải tải bộ file mới khi gửi lại hồ sơ."
                              : "Dùng khi staff chỉ yêu cầu sửa thông tin chữ hoặc liên kết. Có thể gửi lại mà không cần tải file mới."}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "mt-0.5 inline-flex h-6 min-w-11 items-center rounded-full border px-1 transition-colors",
                            effectiveRequiresNewEvidence
                              ? "justify-end border-amber-300 bg-amber-100"
                              : "justify-start border-slate-200 bg-slate-100",
                          )}
                        >
                          <span
                            className={cn(
                              "block h-4 w-4 rounded-full transition-colors",
                              effectiveRequiresNewEvidence ? "bg-amber-500" : "bg-white shadow-sm",
                            )}
                          />
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                <button 
                  disabled={!isComplete}
                  onClick={() => setShowConfirm(true)}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95",
                    isComplete ? "bg-[#0f172a] text-white hover:bg-[#1e293b]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận kết quả
                </button>
              </div>
            </div>

            {/* Timeline Row */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h3 className="text-[13px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Lịch sử xử lý
              </h3>
              <div className="relative">
                {[
                  { time: "2 giờ trước", action: "Người dùng nộp hồ sơ", actor: "Cá nhân/Tổ chức", isLatest: false },
                  { time: "1 giờ trước", action: "AI Engine tự động chấm điểm", actor: "Hệ thống", isLatest: true },
                ].map((entry, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  return (
                    <div key={idx} className="flex gap-3 pb-5 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 z-10",
                          entry.isLatest ? "bg-[#eec54e]" : "bg-slate-300"
                        )} />
                        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] text-slate-700 font-medium leading-tight">{entry.action}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{entry.actor} · {entry.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logic Guide */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h3 className="text-[13px] font-semibold text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#eec54e]" />
                Hướng dẫn gán nhãn
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[11px] font-bold text-emerald-600 uppercase">Đã xác thực</span>
                     <span className="text-[11px] font-bold text-slate-400">Min {APPROVAL_THRESHOLDS[subtype].verified}đ</span>
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Không có cảnh báo đỏ hoặc vi phạm nghiêm trọng.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[11px] font-bold text-blue-600 uppercase">Cơ bản</span>
                     <span className="text-[11px] font-bold text-slate-400">Min {APPROVAL_THRESHOLDS[subtype].basic}đ</span>
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Cho phép sai sót nhỏ không ảnh hưởng cốt lõi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto transition-all group-hover:scale-110">
            <History className="w-6 h-6 text-slate-300" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-500">Dữ liệu lịch sử đang được tải...</p>
            <p className="text-[13px] text-slate-400">Bạn sẽ thấy chi tiết các bước xử lý tại đây.</p>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-slate-900">Xác nhận phê duyệt</h3>
                  <button onClick={() => setShowConfirm(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <XCircle className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Bạn đang chuẩn bị áp dụng nhãn <span className="font-bold text-slate-900 border-b border-[#eec54e]">{result.suggestedLabel}</span> cho hồ sơ <span className="font-bold text-slate-900">{entityName}</span>.
                </p>

                <div className="mt-6 p-4 rounded-xl bg-[#0f172a] text-white flex items-center justify-between shadow-lg shadow-black/5">
                   <div>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Điểm số</p>
                     <p className="text-[24px] font-bold mt-0.5 tracking-tight">{result.totalScore}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Phân loại</p>
                     <span className={cn("inline-block mt-1 px-3 py-1 rounded-lg text-[12px] font-bold tracking-tight",
                        result.suggestedDecision === "APPROVE" ? "bg-emerald-500" : "bg-amber-500"
                     )}>
                       {result.suggestedLabel}
                     </span>
                   </div>
                </div>
             </div>
             
             <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3">
               <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
                 Hủy bỏ
               </button>
               <button 
                  className={cn("px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all shadow-sm active:scale-95",
                    result.suggestedDecision === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={async () => {
                    try {
                        const staffId = user?.userId || 1;
                        const numericId = Number(realId);
                        const isApprove = result.suggestedDecision === "APPROVE";
                        
                        if (id.startsWith("STARTUP-")) {
                            if (isApprove) {
                              await ApproveStartupRegistration(
                                staffId,
                                numericId,
                                result.totalScore,
                                internalNote || undefined,
                                false
                              );
                            } else {
                              await RejectStartupRegistration(
                                staffId,
                                numericId,
                                internalNote || "Không đạt",
                                effectiveRequiresNewEvidence
                              );
                            }
                        } else if (id.startsWith("ADVISOR-")) {
                            if (isApprove) await ApproveAdvisorRegistration(staffId, numericId, result.totalScore);
                            else await RejectAdvisorRegistration(staffId, numericId, internalNote || "Không đạt", effectiveRequiresNewEvidence);
                        } else if (id.startsWith("INVESTOR-")) {
                            const isInst = subtype === "INSTITUTIONAL_INVESTOR";
                            if (isApprove) await ApproveInvestorRegistration(staffId, numericId, result.totalScore, isInst);
                            else await RejectInvestorRegistration(staffId, numericId, internalNote || "Không đạt", effectiveRequiresNewEvidence);
                        }

                        toast.success(isApprove ? "Đã duyệt hồ sơ thành công" : "Đã từ chối hồ sơ");
                        queryClient.invalidateQueries({ queryKey: ["kyc-detail", id] });
                        queryClient.invalidateQueries({ queryKey: ["kyc-pending-startups"] });
                        queryClient.invalidateQueries({ queryKey: ["kyc-pending-advisors"] });
                        queryClient.invalidateQueries({ queryKey: ["kyc-pending-investors"] });
                        setIsSuccess(true);
                        setShowConfirm(false);
                    } catch (err: any) {
                        const rawMsg: string = err.response?.data?.message || err.message || "";
                        let toastMsg: string;
                        if (rawMsg === "No active KYC submission found." || rawMsg === "No active KYC submission found for this investor.") {
                            toastMsg = "Không tìm thấy hồ sơ KYC đang chờ duyệt.";
                        } else if (rawMsg === "Profile not found") {
                            toastMsg = "Không tìm thấy hồ sơ startup.";
                        } else if (rawMsg === "Advisor profile does not exist") {
                            toastMsg = "Không tìm thấy hồ sơ advisor.";
                        } else if (rawMsg === "Investor profile does not exist") {
                            toastMsg = "Không tìm thấy hồ sơ investor.";
                        } else {
                            toastMsg = rawMsg || "Có lỗi xảy ra khi xử lý hồ sơ. Vui lòng thử lại.";
                        }
                        toast.error(toastMsg);
                    }
                  }}
               >
                 {result.suggestedDecision === "APPROVE" ? "Phê duyệt" : "Từ chối"} hồ sơ
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}



