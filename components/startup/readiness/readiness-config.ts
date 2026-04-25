import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BrainCircuit,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Globe2,
  Link2,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type {
  ReadinessActionCode,
  ReadinessCapRule,
  ReadinessDimension,
  ReadinessMissingCode,
  ReadinessStatus,
} from "@/types/readiness";

export const DIMENSION_MAX: Record<ReadinessDimension, number> = {
  profile: 25,
  kyc: 20,
  documents: 20,
  ai: 20,
  trust: 15,
};

export const DIMENSION_META: Record<ReadinessDimension, { label: string; description: string; icon: LucideIcon }> = {
  profile: {
    label: "Hồ sơ Startup",
    description: "Thông tin cốt lõi, ngành, giai đoạn, thị trường và đội ngũ.",
    icon: UserRound,
  },
  kyc: {
    label: "Xác minh KYC",
    description: "Mức độ xác thực pháp lý hoặc xác minh đội ngũ.",
    icon: ShieldCheck,
  },
  documents: {
    label: "Tài liệu",
    description: "Pitch Deck, Business Plan và quyền hiển thị với nhà đầu tư.",
    icon: FileText,
  },
  ai: {
    label: "Đánh giá AI",
    description: "Kết quả đánh giá tiềm năng hiện hành của Startup.",
    icon: BrainCircuit,
  },
  trust: {
    label: "Độ tin cậy",
    description: "Blockchain proof và dữ liệu được cập nhật gần đây.",
    icon: Link2,
  },
};

export const STATUS_META: Record<ReadinessStatus, { label: string; summary: string; dot: string; badge: string; bar: string }> = {
  NOTREADY: {
    label: "Chưa sẵn sàng",
    summary: "Cần hoàn thiện các nền tảng quan trọng trước khi tiếp cận nhà đầu tư.",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border-red-200/80",
    bar: "bg-red-500",
  },
  NEEDSWORK: {
    label: "Cần cải thiện",
    summary: "Startup đã có dữ liệu ban đầu nhưng vẫn còn các điểm chặn quan trọng.",
    dot: "bg-orange-400",
    badge: "bg-orange-50 text-orange-700 border-orange-200/80",
    bar: "bg-orange-500",
  },
  ALMOSTREADY: {
    label: "Gần sẵn sàng",
    summary: "Hồ sơ đã khá tốt, cần xử lý thêm vài mục để đạt mức sẵn sàng đầu tư.",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200/80",
    bar: "bg-amber-500",
  },
  INVESTORREADY: {
    label: "Sẵn sàng gọi vốn",
    summary: "Hồ sơ đủ mạnh để chủ động tiếp cận và trao đổi với nhà đầu tư.",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    bar: "bg-emerald-500",
  },
};

export const MISSING_ITEM_LABELS: Record<ReadinessMissingCode, string> = {
  MISSING_ONELINER: "Bổ sung mô tả ngắn về Startup",
  MISSING_STAGE: "Chọn giai đoạn phát triển",
  MISSING_INDUSTRY: "Chọn ngành hoạt động",
  MISSING_PROBLEM: "Mô tả vấn đề đang giải quyết",
  MISSING_SOLUTION: "Mô tả giải pháp của Startup",
  MISSING_WEBSITE: "Thêm website hoặc demo URL",
  MISSING_MARKET_SCOPE: "Bổ sung phạm vi thị trường",
  MISSING_TEAM: "Bổ sung thông tin đội ngũ",
  MISSING_KYC: "Nộp hồ sơ xác minh KYC",
  KYC_PENDING_INFO: "Bổ sung thông tin KYC theo yêu cầu",
  KYC_REJECTED: "Gửi lại hồ sơ KYC sau khi bị từ chối",
  MISSING_PITCH_DECK: "Tải lên Pitch Deck",
  MISSING_BP: "Tải lên Business Plan",
  DOC_VISIBILITY: "Bật hiển thị tài liệu cho nhà đầu tư",
  MISSING_AI_EVAL: "Yêu cầu đánh giá AI",
  MISSING_BLOCKCHAIN_PROOF: "Xác thực tài liệu quan trọng trên blockchain",
  STALE_DATA: "Cập nhật hồ sơ hoặc tài liệu trong 90 ngày gần đây",
};

export const ACTION_META: Record<ReadinessActionCode, { label: string; href: string; icon: LucideIcon }> = {
  COMPLETE_PROFILE: {
    label: "Hoàn thiện hồ sơ",
    href: "/startup/startup-profile/info?tab=overview",
    icon: ClipboardCheck,
  },
  SUBMIT_KYC: {
    label: "Nộp KYC",
    href: "/startup/verification/submit",
    icon: ShieldCheck,
  },
  RESUBMIT_KYC: {
    label: "Gửi lại KYC",
    href: "/startup/verification/resubmit",
    icon: RefreshCcw,
  },
  UPLOAD_PITCH_DECK: {
    label: "Tải Pitch Deck",
    href: "/startup/documents",
    icon: FileText,
  },
  UPLOAD_BP: {
    label: "Tải Business Plan",
    href: "/startup/documents",
    icon: FileCheck2,
  },
  REQUEST_AI_EVAL: {
    label: "Yêu cầu đánh giá AI",
    href: "/startup/ai-evaluation/request",
    icon: BrainCircuit,
  },
  VERIFY_DOC: {
    label: "Xác thực tài liệu",
    href: "/startup/documents",
    icon: LockKeyhole,
  },
};

export const CAP_RULE_LABELS: Record<ReadinessCapRule, string> = {
  NO_PITCH_DECK: "Thiếu Pitch Deck nên điểm tối đa bị giới hạn ở 69.",
  NO_AI_EVALUATION: "Chưa có đánh giá AI nên chưa thể đạt trạng thái sẵn sàng gọi vốn.",
  KYC_FAILED: "KYC bị từ chối nên điểm tối đa bị giới hạn ở 69.",
};

export const CAP_RULE_ICONS: Record<ReadinessCapRule, LucideIcon> = {
  NO_PITCH_DECK: FileText,
  NO_AI_EVALUATION: BrainCircuit,
  KYC_FAILED: AlertTriangle,
};

export const FALLBACK_ACTION_ICON = Globe2;

export function getMissingItemLabel(code: string, fallback: string) {
  return MISSING_ITEM_LABELS[code as ReadinessMissingCode] ?? fallback;
}

export function getActionMeta(code: string, fallbackLabel: string, fallbackTarget: string) {
  return ACTION_META[code as ReadinessActionCode] ?? {
    label: fallbackLabel,
    href: fallbackTarget || "/startup",
    icon: FALLBACK_ACTION_ICON,
  };
}

export function getCapRuleLabel(rule: string, fallback: string) {
  return CAP_RULE_LABELS[rule as ReadinessCapRule] ?? fallback;
}

export function getCapRuleIcon(rule: string) {
  return CAP_RULE_ICONS[rule as ReadinessCapRule] ?? AlertTriangle;
}

export function clampScore(score: number, max = 100) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(max, Math.round(score)));
}

export function formatReadinessDate(value?: string | null) {
  if (!value) return "Chưa có dữ liệu";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
