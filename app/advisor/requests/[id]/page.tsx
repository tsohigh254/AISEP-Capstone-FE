"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { IssueReportModal } from "@/components/shared/issue-report-modal";
import { 
  Clock,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ClipboardList,
  AlertCircle,
  Search,
  Loader2,
  Send,
  X,
  Plus,
  Check,
  ArrowRight,
  Globe,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  FileText,
  ShieldAlert
} from "lucide-react";
import { FormatBadge } from "@/components/advisor/consulting-format-badge";
import type {
  IConsultingRequest,
  ConsultingRequestStatus,
  ConsultingScopeTag,
  ITimeSlotProposal,
  SlotProposalStatus,
} from "@/types/advisor-consulting";
import { getMockRequestById } from "@/services/advisor/advisor-consulting.mock";
import { getMockReports } from "@/services/advisor/advisor-report.mock";
import { IConsultationReport } from "@/types/advisor-report";
import { GetAdvisorProfile } from "@/services/advisor/advisor.api";
import { toast } from "sonner";

/* ─── Constants ──────────────────────────────────────────────── */

const STATUS_LABEL: Record<ConsultingRequestStatus, string> = {
  REQUESTED: "Chờ xử lý",
  ACCEPTED: "Đã nhận",
  SCHEDULED: "Đã lên lịch",
  COMPLETED: "Đã diễn ra",
  FINALIZED: "Đã hoàn thành",
  REJECTED: "Đã từ chối",
  CANCELLED: "Đã huỷ",
};

const STATUS_CFG: Record<ConsultingRequestStatus, { dot: string; badge: string }> = {
  REQUESTED: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
  ACCEPTED: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 border-blue-200/80" },
  SCHEDULED: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  COMPLETED: { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200/80" },
  FINALIZED: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  REJECTED: { dot: "bg-red-400", badge: "bg-red-50 text-red-600 border-red-200/80" },
  CANCELLED: { dot: "bg-gray-400", badge: "bg-gray-50 text-gray-500 border-gray-200/80" },
};


const SCOPE_LABEL: Record<ConsultingScopeTag, string> = {
  strategy: "Chiến lược",
  fundraising: "Gọi vốn",
  product: "Product",
  engineering: "Kỹ thuật",
  marketing: "Marketing",
  legal: "Pháp lý",
  operations: "Vận hành",
};

const SLOT_STATUS_STYLE: Record<SlotProposalStatus, string> = {
  PROPOSED: "bg-blue-50 text-blue-600 border border-blue-200",
  ACCEPTED: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  DECLINED: "bg-red-50 text-red-500 border border-red-200",
  SUPERSEDED: "bg-gray-50 text-gray-500 border border-gray-200",
};

const SLOT_STATUS_LABEL: Record<SlotProposalStatus, string> = {
  PROPOSED: "Đề xuất",
  ACCEPTED: "Chấp nhận",
  DECLINED: "Từ chối",
  SUPERSEDED: "Đã thay thế",
};

const TIMELINE_LABELS: Record<string, string> = {
  REQUEST_CREATED: "Yêu cầu được tạo",
  REQUEST_ACCEPTED: "Advisor đã chấp nhận",
  REQUEST_REJECTED: "Advisor đã từ chối",
  ADVISOR_PROPOSED_TIME: "Advisor đề xuất thời gian",
  STARTUP_PROPOSED_TIME: "Startup đề xuất thời gian",
  SCHEDULE_CONFIRMED_BY_ADVISOR: "Advisor xác nhận lịch",
  SCHEDULE_CONFIRMED_BY_STARTUP: "Startup xác nhận lịch",
  SESSION_SCHEDULED: "Buổi tư vấn đã lên lịch",
  SESSION_COMPLETED: "Buổi tư vấn đã diễn ra",
  SESSION_CANCELLED: "Buổi tư vấn đã huỷ",
  REQUEST_AUTO_CANCELLED: "Tự động huỷ do hết hạn",
  SLOTS_PROPOSED: "Đề xuất thời gian",
  SLOT_ACCEPTED: "Chấp nhận thời gian",
  SCHEDULE_CONFIRMED: "Lịch được xác nhận",
  REQUEST_CANCELLED: "Yêu cầu đã huỷ",
};

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600",
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─── Helpers ────────────────────────────────────────────────── */

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} ngày trước`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h} giờ trước`;
  const m = Math.floor(diff / 60000);
  if (m > 0) return `${m} phút trước`;
  return "Vừa xong";
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} Thg ${d.getMonth() + 1}, ${d.getFullYear()} \u2022 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function formatSlotRange(startAt: string, endAt: string): string {
  const s = new Date(startAt);
  const e = new Date(endAt);
  return `${s.getDate()} Thg ${s.getMonth() + 1}, ${s.getFullYear()} \u2022 ${s.getHours().toString().padStart(2, "0")}:${s.getMinutes().toString().padStart(2, "0")} - ${e.getHours().toString().padStart(2, "0")}:${e.getMinutes().toString().padStart(2, "0")}`;
}

function expiryCountdown(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Đã hết hạn";
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 24) return `Còn ${Math.floor(diffHours / 24)} ngày`;
  return `Còn ${diffHours}h ${diffMins}m`;
}

function ReportField({ label, content, icon: Icon, colorClass = "text-slate-900" }: { label: string; content?: string; icon?: any; colorClass?: string }) {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</h4>
      </div>
      <div className={cn("text-[13px] leading-relaxed whitespace-pre-wrap font-medium p-3 rounded-xl bg-slate-50/50 border border-slate-100", colorClass)}>
        {content}
      </div>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────── */

interface ProposedSlotRow {
  date: string;
  startTime: string;
  endTime: string;
  note: string;
}

export default function AdvisorRequestDetailPage() {
  const params = useParams();
const requestId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<IConsultingRequest | null>(null);
  const [report, setReport] = useState<IConsultationReport | null>(null);

  // Dialog states
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [proposeOpen, setProposeOpen] = useState(false);
  const [proposedSlots, setProposedSlots] = useState<ProposedSlotRow[]>([
    { date: "", startTime: "", endTime: "", note: "" },
  ]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [proposedTimezone, setProposedTimezone] = useState("Asia/Ho_Chi_Minh");
  const [advisorLinks, setAdvisorLinks] = useState<{ googleMeet?: string; msTeams?: string } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const TIMEZONES = [
    { value: "Asia/Ho_Chi_Minh", label: "GMT+7 – Hà Nội / TP. Hồ Chí Minh" },
    { value: "Asia/Singapore", label: "GMT+8 – Singapore / Hồng Kông" },
    { value: "Asia/Tokyo", label: "GMT+9 – Tokyo / Seoul" },
    { value: "Europe/London", label: "GMT+0 – London" },
    { value: "Europe/Paris", label: "GMT+1 – Paris / Berlin" },
    { value: "America/New_York", label: "GMT-5 – New York" },
    { value: "America/Los_Angeles", label: "GMT-8 – Los Angeles" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      const data = getMockRequestById(requestId);
      if (data) {
        setRequest({ ...data });
        // Fetch report
        const reports = getMockReports();
        const found = reports.find(r => r.sessionId === data.id || r.sessionId === "ses-002" && data.id === "req-005");
        setReport(found || null);
      } else {
        setRequest(null);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [requestId]);

  useEffect(() => {
    const loadAdvisorProfile = async () => {
      try {
        const res = await GetAdvisorProfile();
        if (res.isSuccess && res.data) {
          setAdvisorLinks({
            googleMeet: (res.data as any).googleMeetLink,
            msTeams: (res.data as any).msTeamsLink,
          });
        }
      } catch (error) {
        console.error("Failed to load advisor links", error);
      }
    };
    loadAdvisorProfile();
  }, []);

  /* ─── Actions ───────────────────────────────────────────────── */

  const handleAccept = () => {
    if (!request || !selectedSlotId) return;
    setAcceptOpen(true);
  };

  const handleAcceptConfirm = () => {
    if (!request || !selectedSlotId) return;
    const now = new Date().toISOString();
    const updatedSlots = request.preferredSlots.map(s => ({
      ...s,
      status: s.id === selectedSlotId ? ("ACCEPTED" as const) : ("SUPERSEDED" as const),
    }));
    const startupAlreadyConfirmed = request.confirmation.startupConfirmedAt !== null;

    setRequest({
      ...request,
      status: startupAlreadyConfirmed ? "SCHEDULED" : "ACCEPTED",
      acceptedAt: request.acceptedAt ?? now,
      advisorRespondedAt: request.advisorRespondedAt ?? now,
      preferredSlots: updatedSlots,
      confirmation: {
        ...request.confirmation,
        advisorConfirmedAt: now,
        fullyConfirmed: startupAlreadyConfirmed,
      },
      timeline: [
        ...request.timeline,
        { id: `act-${Date.now()}a`, actionType: "REQUEST_ACCEPTED", actorType: "ADVISOR", fromStatus: "REQUESTED", toStatus: "ACCEPTED", createdAt: now },
        { id: `act-${Date.now()}b`, actionType: "SCHEDULE_CONFIRMED_BY_ADVISOR", actorType: "ADVISOR", metadata: { slotId: selectedSlotId }, createdAt: now },
      ],
    });
    setAcceptOpen(false);
    toast.success(startupAlreadyConfirmed ? "Lịch đã xác nhận — buổi tư vấn đã lên lịch!" : "Đã chấp nhận yêu cầu tư vấn");
  };

  // Fix #1 — Chọn slot của startup: toggle selectedSlotId
  const handleToggleSlotSelect = (slotId: string) => {
    setSelectedSlotId(prev => (prev === slotId ? null : slotId));
  };

  // Fix #2 — Advisor xác nhận một slot cụ thể (ACCEPTED state)
  const handleConfirmSlot = (slotId: string, fromProposals: boolean) => {
    if (!request) return;
    const now = new Date().toISOString();
    const updateSlots = (arr: ITimeSlotProposal[]) =>
      arr.map(s => ({ ...s, status: s.id === slotId ? ("ACCEPTED" as const) : s.status === "PROPOSED" ? ("SUPERSEDED" as const) : s.status }));
    const startupAlreadyConfirmed = request.confirmation.startupConfirmedAt !== null;
    setRequest({
      ...request,
      status: startupAlreadyConfirmed ? "SCHEDULED" : "ACCEPTED",
      preferredSlots: fromProposals ? request.preferredSlots : updateSlots(request.preferredSlots),
      slotProposals: fromProposals ? updateSlots(request.slotProposals) : request.slotProposals,
      confirmation: {
        ...request.confirmation,
        advisorConfirmedAt: now,
        fullyConfirmed: startupAlreadyConfirmed,
      },
      timeline: [
        ...request.timeline,
        { id: `act-${Date.now()}`, actionType: "SCHEDULE_CONFIRMED_BY_ADVISOR", actorType: "ADVISOR", metadata: { slotId }, createdAt: now },
      ],
    });
    toast.success(startupAlreadyConfirmed ? "Lịch đã xác nhận — buổi tư vấn đã lên lịch!" : "Đã xác nhận — đang chờ Startup xác nhận");
  };

  const handleRejectConfirm = () => {
    if (!request) return;
    if (rejectReason.trim().length < 10) { toast.error("Lý do từ chối phải có ít nhất 10 ký tự"); return; }
    setRequest({
      ...request,
      status: "REJECTED",
      rejectionReason: rejectReason.trim(),
      rejectedAt: new Date().toISOString(),
      advisorRespondedAt: new Date().toISOString(),
      timeline: [
        ...request.timeline,
        { id: `act-${Date.now()}`, actionType: "REQUEST_REJECTED", actorType: "ADVISOR", fromStatus: request.status, toStatus: "REJECTED", metadata: { reason: rejectReason.trim() }, createdAt: new Date().toISOString() },
      ],
    });
    setRejectOpen(false);
    setRejectReason("");
    toast.success("Đã từ chối yêu cầu");
  };

  // Fix #4 — Khi đề xuất giờ từ REQUESTED → ngầm accept request luôn
  // Đồng thời vô hiệu hoá các slot cũ nếu có
  const handleProposeConfirm = () => {
    if (!request) return;
    const validSlots = proposedSlots.filter(s => s.date && s.startTime && s.endTime);
    if (validSlots.length === 0) { toast.error("Vui lòng thêm ít nhất 1 khung giờ"); return; }

    const now = new Date().toISOString();
    const newSlots: ITimeSlotProposal[] = validSlots.map((s, i) => ({
      id: `slot-prop-${Date.now()}-${i}`,
      proposedBy: "ADVISOR" as const,
      startAt: `${s.date}T${s.startTime}:00+07:00`, // In real app, would use selected timezone offset
      endAt: `${s.date}T${s.endTime}:00+07:00`,
      timezone: proposedTimezone,
      status: "PROPOSED" as const,
      note: s.note || undefined,
      createdAt: now,
    }));

    const wasRequested = request.status === "REQUESTED";
    const wasScheduled = request.status === "SCHEDULED";

    // Invalidate old slots
    const updatedPreferred = request.preferredSlots.map(s =>
      s.status === "PROPOSED" || s.status === "ACCEPTED" ? { ...s, status: "DECLINED" as const } : s
    );
    const updatedProposals = request.slotProposals.map(s =>
      s.status === "PROPOSED" || s.status === "ACCEPTED" ? { ...s, status: "SUPERSEDED" as const } : s
    );

    setRequest({
      ...request,
      status: wasRequested || wasScheduled ? "ACCEPTED" : request.status,
      acceptedAt: wasRequested ? now : request.acceptedAt,
      advisorRespondedAt: (wasRequested || wasScheduled) ? now : request.advisorRespondedAt,
      preferredSlots: updatedPreferred,
      slotProposals: [...updatedProposals, ...newSlots],
      confirmation: {
        startupConfirmedAt: null,
        advisorConfirmedAt: null,
        fullyConfirmed: false,
      },
      timeline: [
        ...request.timeline,
        ...(wasRequested ? [{ id: `act-${Date.now()}a`, actionType: "REQUEST_ACCEPTED", actorType: "ADVISOR" as const, fromStatus: "REQUESTED", toStatus: "ACCEPTED", createdAt: now }] : []),
        { id: `act-${Date.now()}b`, actionType: "ADVISOR_PROPOSED_TIME", actorType: "ADVISOR" as const, metadata: { slotCount: newSlots.length, isReschedule: wasScheduled }, createdAt: now },
      ],
    });

    setProposeOpen(false);
    setSelectedSlotId(null);
    setProposedSlots([{ date: "", startTime: "", endTime: "", note: "" }]);
    toast.success(wasScheduled ? "Đã gửi đề xuất dời lịch mới" : `Đã gửi ${newSlots.length} khung giờ đề xuất${wasRequested ? " — yêu cầu đã được chấp nhận" : ""}`);
  };

  const handleCancelConfirm = () => {
    if (!request) return;
    if (cancelReason.trim().length < 10) {
      toast.error("Vui lòng nhập lý do huỷ cụ thể (tối thiểu 10 ký tự)");
      return;
    }
    setRequest({
      ...request,
      status: "CANCELLED",
      cancelReason: cancelReason.trim(),
      cancelledBy: "ADVISOR",
      cancelledAt: new Date().toISOString(),
      timeline: [
        ...request.timeline,
        { id: `act-${Date.now()}`, actionType: "SESSION_CANCELLED", actorType: "ADVISOR", fromStatus: request.status, toStatus: "CANCELLED", metadata: { reason: cancelReason.trim() }, createdAt: new Date().toISOString() },
      ],
    });
    setCancelOpen(false);
    setCancelReason("");
    toast.success("Đã huỷ buổi tư vấn");
  };

  /* ─── Render ────────────────────────────────────────────────── */

  if (loading) {
    return (
      <AdvisorShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </AdvisorShell>
    );
  }

  if (!request) {
    return (
      <AdvisorShell>
        <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-400">
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-[14px] font-semibold text-slate-600">Không tìm thấy yêu cầu</p>
            <Link
              href="/advisor/requests"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#eec54e] hover:underline"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </AdvisorShell>
    );
  }

  const initial = request.startup.displayName.charAt(0).toUpperCase();
  const avatarGradient = getAvatarColor(request.startup.displayName);
  const cfg = STATUS_CFG[request.status];
  const confirmedSlot =
    request.preferredSlots.find(s => s.status === "ACCEPTED") ??
    request.slotProposals.find(s => s.status === "ACCEPTED");

  return (
    <AdvisorShell>
      <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-400">

        {/* Page header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm",
              avatarGradient
            )}>
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-bold text-slate-900 leading-tight">
                  {request.startup.displayName}
                </h1>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border",
                  cfg.badge
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                  {STATUS_LABEL[request.status]}
                </span>
                <Link 
                  href={`/advisor/startups/${request.startup.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Xem hồ sơ
                </Link>
              </div>
              <p className="text-[13px] text-slate-500 mt-1 truncate">{request.objective}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {relativeTime(request.submittedAt)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">#{request.id}</span>
                {request.status === "REQUESTED" && request.expiresAt && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {expiryCountdown(request.expiresAt)}
                  </span>
                )}
                <FormatBadge format={request.preferredFormat} size="sm" />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-semibold border border-slate-100">
                  <Building2 className="w-3 h-3" />
                  {request.startup.industry}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-semibold border border-slate-100">
                  <Briefcase className="w-3 h-3" />
                  {request.startup.stage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Card A - Request Content */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-400" />
                Nội dung yêu cầu
              </h2>
              <div className="space-y-4">

                {/* 1. Mục tiêu */}
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Mục tiêu buổi tư vấn</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{request.objective}</p>
                </div>

                {/* 2. Mô tả vấn đề / thách thức */}
                {request.problemContext && (
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Mô tả vấn đề</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{request.problemContext}</p>
                  </div>
                )}

                {/* 3. Phạm vi hỗ trợ (scope tags) */}
                {request.scopeTags && request.scopeTags.length > 0 && (
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-2">Phạm vi hỗ trợ</p>
                    <div className="flex flex-wrap gap-1.5">
                      {request.scopeTags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {SCOPE_LABEL[tag] ?? tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Thời lượng + nền tảng */}
                <div className="flex items-center gap-2 flex-wrap">
                  {request.durationMinutes && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {request.durationMinutes} phút
                    </span>
                  )}
                  <FormatBadge format={request.preferredFormat} size="md" />
                </div>

                {/* 5. Ghi chú thêm */}
                {request.additionalNotes && (
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Câu hỏi / Ghi chú thêm</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{request.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card B - Time Slots */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Thời gian đề xuất
              </h2>

              {/* Startup preferred slots */}
              {request.preferredSlots.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-2">Startup đề xuất</p>
                  <div className="space-y-2">
                    {request.preferredSlots.map(slot => (
                      <div key={slot.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[13px] text-slate-700">{formatSlotRange(slot.startAt, slot.endAt)}</span>
                          <span className="text-[10px] text-slate-400">{slot.timezone}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {request.status === "REQUESTED" && slot.status === "PROPOSED" && (
                            <button
                              onClick={() => handleToggleSlotSelect(slot.id)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                                selectedSlotId === slot.id
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : "bg-[#0f172a] text-white hover:bg-[#1e293b]"
                              )}
                            >
                              {selectedSlotId === slot.id ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Đã chọn
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3" />
                                  Chọn giờ này
                                </>
                              )}
                            </button>
                          )}
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold",
                            selectedSlotId === slot.id ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : SLOT_STATUS_STYLE[slot.status]
                          )}>
                            {selectedSlotId === slot.id ? "Đang chọn" : SLOT_STATUS_LABEL[slot.status]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advisor proposed slots */}
              {request.slotProposals.length > 0 && (
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-2">Advisor đề xuất</p>
                  <div className="space-y-2">
                    {request.slotProposals.map(slot => (
                      <div key={slot.id} className="flex flex-col gap-1 px-3.5 py-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-[13px] text-slate-700">{formatSlotRange(slot.startAt, slot.endAt)}</span>
                            <span className="text-[10px] text-slate-400">{slot.timezone}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {request.status === "ACCEPTED" && slot.status === "PROPOSED" && slot.proposedBy === "STARTUP" && (
                              <button
                                onClick={() => handleConfirmSlot(slot.id, true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                Xác nhận giờ này
                              </button>
                            )}
                            <span className={cn("inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold", SLOT_STATUS_STYLE[slot.status])}>
                              {SLOT_STATUS_LABEL[slot.status]}
                            </span>
                          </div>
                        </div>
                        {slot.note && (
                          <p className="text-[11px] text-slate-500 pl-5.5">{slot.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {request.preferredSlots.length === 0 && request.slotProposals.length === 0 && (
                <p className="text-[13px] text-slate-400">Chưa có thời gian đề xuất nào.</p>
              )}
            </div>

            {/* Card C - Action Area */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-slate-400" />
                Hành động
              </h2>

              {/* REQUESTED */}
              {request.status === "REQUESTED" && (
                <div className="flex-1 w-full">
                  {!selectedSlotId && (
                    <p className="text-[11px] text-amber-600 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Vui lòng chọn một khung giờ đề xuất bên trên trước khi chấp nhận.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleAccept}
                      disabled={!selectedSlotId}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-all shadow-sm",
                        selectedSlotId
                          ? "bg-[#0f172a] text-white hover:bg-[#1e293b]"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => setRejectOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                    <button
                      onClick={() => setProposeOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Đề xuất thời gian khác
                    </button>
                  </div>
                </div>
              )}

              {/* ACCEPTED */}
              {request.status === "ACCEPTED" && (
                <div className="space-y-3">
                  <p className="text-[13px] text-slate-500">
                    Chọn một khung giờ trong danh sách phía trên để xác nhận lịch, hoặc đề xuất thời gian mới cho Startup.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setProposeOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Đề xuất thêm thời gian
                    </button>
                    <button
                      onClick={() => setCancelOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Huỷ yêu cầu
                    </button>
                  </div>
                </div>
              )}

              {/* SCHEDULED */}
              {request.status === "SCHEDULED" && (
                <div className="space-y-3">
                  {confirmedSlot && (
                    <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-[11px] text-emerald-600 uppercase tracking-wide font-medium mb-1">Thời gian đã xác nhận</p>
                      <p className="text-[13px] font-semibold text-emerald-700">
                        {formatSlotRange(confirmedSlot.startAt, confirmedSlot.endAt)}
                      </p>
                    </div>
                  )}
                  <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-[11px] text-blue-600 uppercase tracking-wide font-medium mb-1">
                      Link họp ({request.preferredFormat === "GOOGLE_MEET" ? "Google Meet" : "MS Teams"})
                    </p>
                    {advisorLinks?.[request.preferredFormat === "GOOGLE_MEET" ? "googleMeet" : "msTeams"] ? (
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <a 
                          href={advisorLinks[request.preferredFormat === "GOOGLE_MEET" ? "googleMeet" : "msTeams"]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-semibold text-blue-700 hover:underline break-all"
                        >
                          {advisorLinks[request.preferredFormat === "GOOGLE_MEET" ? "googleMeet" : "msTeams"]}
                        </a>
                      </div>
                    ) : (
                      <p className="text-[12px] text-amber-600 italic">
                        Bạn chưa cập nhật link phòng họp trong hồ sơ. Vui lòng cập nhật để Startup tham gia.
                      </p>
                    )}
                    <p className="text-[10px] text-blue-500/80 mt-2 italic">
                      Lưu ý: Link này chỉ hiển thị cho bạn và Startup đã xác nhận.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setProposeOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Đổi lịch
                    </button>
                    <button
                      onClick={() => setCancelOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Huỷ buổi tư vấn
                    </button>
                  </div>
                </div>
              )}



              {/* REJECTED */}
              {request.status === "REJECTED" && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[12px] font-medium text-red-600 mb-0.5">Yêu cầu đã bị từ chối</p>
                      {request.rejectionReason && (
                        <p className="text-[13px] text-red-700">{request.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CANCELLED */}
              {request.status === "CANCELLED" && (
                <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[12px] font-medium text-gray-600 mb-0.5">
                        Buổi tư vấn đã huỷ
                        {request.cancelledBy && (
                          <span className="font-normal text-gray-500"> bởi {request.cancelledBy}</span>
                        )}
                      </p>
                      {request.cancelReason && (
                        <p className="text-[13px] text-gray-700">{request.cancelReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* COMPLETED */}
              {request.status === "COMPLETED" && (
                <div className="space-y-4">
                  <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[12px] font-medium text-slate-600 mb-0.5">Buổi tư vấn đã diễn ra</p>
                            <p className="text-[13px] text-slate-500 italic">Vui lòng nộp báo cáo tư vấn để hoàn tất quy trình và ghi nhận kết quả.</p>
                        </div>
                    </div>
                  </div>
                  <Link 
                    href={`/advisor/reports/create?sessionId=${request.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-[#1e293b] transition-all shadow-sm flex items-center gap-2 w-fit"
                  >
                    <FileText className="w-4 h-4" />
                    Viết báo cáo tư vấn
                    <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
                  </Link>
                </div>
              )}

              {/* FINALIZED REPORT CONTENT */}
              {request.status === "FINALIZED" && report && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="px-5 py-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-emerald-900 mb-1">Dự án đã hoàn thành xuất sắc</p>
                            <p className="text-[13px] text-emerald-700 leading-relaxed font-medium">Báo cáo của bạn đã được phê duyệt và gửi tới Startup. Dưới đây là nội dung chi tiết báo cáo đã được ghi nhận.</p>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 text-left">
                     <ReportField label="Tiêu đề & Tóm tắt" content={`${report.title}\n\n${report.summary}`} icon={FileText} />
                     <ReportField label="Tổng quan thảo luận" content={report.discussionOverview} icon={MessageSquare} />
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <ReportField label="Phát hiện chính" content={report.keyFindings} icon={Search} />
                       <ReportField label="Khuyến nghị từ Advisor" content={report.advisorRecommendations} icon={CheckCircle2} colorClass="text-emerald-700 bg-emerald-50/30 border-emerald-100/50" />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <ReportField label="Rủi ro nhận diện" content={report.identifiedRisks} icon={AlertCircle} colorClass="text-amber-700 bg-amber-50/30 border-amber-100/50" />
                       <ReportField label="Bước tiếp theo" content={report.nextSteps} icon={ArrowRight} />
                     </div>

                     <ReportField label="Sản phẩm bàn giao" content={report.deliverablesSummary} icon={Plus} />

                     {report.attachments.length > 0 && (
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <FileText className="w-3.5 h-3.5 text-slate-400" />
                           <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tài liệu đính kèm</h4>
                         </div>
                         <div className="flex flex-wrap gap-2">
                           {report.attachments.map(att => (
                             <a 
                               key={att.id}
                               href={att.url}
                               className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
                             >
                               <FileText className="w-3.5 h-3.5 text-slate-400" />
                               <span className="text-[12px] font-semibold text-slate-700">{att.originalFileName}</span>
                               <ExternalLink className="w-3 h-3 text-slate-300 ml-1" />
                             </a>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>
                </div>
              )}

              {/* Common Report Action (Bottom of Action Card) - Refined Style */}
              <div className="mt-8 pt-5 border-t border-slate-100">
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-200 rounded-xl text-[13px] font-bold text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500 group-hover:animate-bounce" />
                  Bạn gặp sự cố? Gửi báo cáo & Phản hồi
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2 font-medium opacity-70">
                  AISEP sẽ hỗ trợ xử lý các tranh chấp và sự cố kỹ thuật trong vòng 24h.
                </p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-1 space-y-5">

            {/* Card D - Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-4">Lịch sử hoạt động</h2>
              <div className="relative">
                {request.timeline.map((entry, idx) => {
                  const isLast = idx === request.timeline.length - 1;
                  return (
                    <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full mt-1 shrink-0",
                          isLast ? "bg-[#eec54e]" : "bg-slate-300"
                        )} />
                        {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                      </div>
                      <div className="min-w-0 pb-1">
                        <p className="text-[13px] text-slate-700 font-medium leading-tight">
                          {TIMELINE_LABELS[entry.actionType] || entry.actionType}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {entry.actorType === "STARTUP" ? "Startup" : entry.actorType === "ADVISOR" ? "Advisor" : "Hệ thống"}
                          {" "}&middot; {relativeTime(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card E - Confirmation Status */}
            {(request.status === "ACCEPTED" || request.status === "SCHEDULED") && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
                <h2 className="text-[13px] font-semibold text-slate-900 mb-4">Trạng thái xác nhận</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-600">Advisor</span>
                    {request.confirmation.advisorConfirmedAt ? (
                      <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã xác nhận
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] text-amber-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Chờ xác nhận
                      </span>
                    )}
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-600">Startup</span>
                    {request.confirmation.startupConfirmedAt ? (
                      <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã xác nhận
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] text-amber-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Chờ xác nhận
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Dialogs ──────────────────────────────────────────────── */}

      {/* Reject Dialog */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-slate-900">Từ chối yêu cầu</h3>
              <button onClick={() => { setRejectOpen(false); setRejectReason(""); }} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all"
            />
            {rejectReason.trim().length > 0 && rejectReason.trim().length < 10 && (
              <p className="text-[11px] text-red-500 mt-1">Lý do phải có ít nhất 10 ký tự</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setRejectOpen(false); setRejectReason(""); }} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                Huỷ
              </button>
              <button onClick={handleRejectConfirm} className="px-4 py-2 rounded-xl bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors shadow-sm">
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Propose Time Dialog */}
      {proposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[15px] font-semibold text-slate-900">Đề xuất thời gian khác</h3>
              <button onClick={() => { setProposeOpen(false); setProposedSlots([{ date: "", startTime: "", endTime: "", note: "" }]); }} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-amber-800">Thông tin thời lượng</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Startup yêu cầu tư vấn trong <span className="font-bold">{request.durationMinutes ?? 60} phút</span>. Thời gian kết thúc sẽ được tự động tính toán.
                </p>
              </div>
            </div>

            <div className="mb-4 space-y-1">
              <label className="text-[11px] font-medium text-slate-500 ml-1 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Múi giờ
              </label>
              <select
                value={proposedTimezone}
                onChange={(e) => setProposedTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all appearance-none"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {proposedSlots.map((slot, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative group/slot">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khung giờ {idx + 1}</span>
                    {proposedSlots.length > 1 && (
                      <button 
                        onClick={() => setProposedSlots(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all opacity-0 group-hover/slot:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 ml-1">Ngày</label>
                      <input
                        type="date"
                        value={slot.date}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all"
                        onChange={e => setProposedSlots(prev => prev.map((s, i) => i === idx ? { ...s, date: e.target.value } : s))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 ml-1">Bắt đầu</label>
                      <input
                        type="time"
                        value={slot.startTime}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all"
                        onChange={e => {
                          const val = e.target.value;
                          setProposedSlots(prev => prev.map((s, i) => {
                            if (i !== idx) return s;
                            if (!val) return { ...s, startTime: val, endTime: "" };
                            
                            // Auto-calculate end time
                            const [h, m] = val.split(":").map(Number);
                            const duration = request.durationMinutes ?? 60;
                            const date = new Date();
                            date.setHours(h, m + duration);
                            const endH = date.getHours().toString().padStart(2, "0");
                            const endM = date.getMinutes().toString().padStart(2, "0");
                            
                            return { ...s, startTime: val, endTime: `${endH}:${endM}` };
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 ml-1">Kết thúc</label>
                      <input
                        type="time"
                        value={slot.endTime}
                        readOnly
                        className="w-full px-3 py-2 rounded-xl border border-slate-100 text-[13px] bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-500 ml-1">Ghi chú thêm</label>
                    <input
                      type="text"
                      placeholder="vd: Tôi có thể dời sớm hơn 15p nếu cần"
                      value={slot.note}
                      onChange={e => setProposedSlots(prev => prev.map((s, i) => i === idx ? { ...s, note: e.target.value } : s))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
            {proposedSlots.length < 3 && (
              <button
                onClick={() => setProposedSlots(prev => [...prev, { date: "", startTime: "", endTime: "", note: "" }])}
                className="inline-flex items-center gap-1 mt-3 text-[12px] font-medium text-[#0f172a] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm khung giờ
              </button>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setProposeOpen(false); setProposedSlots([{ date: "", startTime: "", endTime: "", note: "" }]); }} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                Huỷ
              </button>
              <button onClick={handleProposeConfirm} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm">
                <Send className="w-3.5 h-3.5" />
                Gửi đề xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-slate-900">Huỷ buổi tư vấn</h3>
              <button onClick={() => { setCancelOpen(false); setCancelReason(""); }} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[12px] text-amber-700">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Nhập lý do huỷ..."
              rows={4}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl border text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all",
                cancelReason.trim().length > 0 && cancelReason.trim().length < 10 ? "border-red-300" : "border-slate-200"
              )}
            />
            {cancelReason.trim().length > 0 && cancelReason.trim().length < 10 && (
              <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">Lý do phải có ít nhất 10 ký tự</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setCancelOpen(false); setCancelReason(""); }} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                Huỷ
              </button>
              <button onClick={handleCancelConfirm} className="px-4 py-2 rounded-xl bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors shadow-sm">
                Xác nhận huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Dialog */}
      {acceptOpen && request && selectedSlotId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-slate-900">Xác nhận chấp nhận</h3>
              <button onClick={() => setAcceptOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Bạn đã chọn khung giờ sau để thực hiện buổi tư vấn:
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-[13px] font-semibold text-emerald-700">
                  {formatSlotRange(
                    request.preferredSlots.find(s => s.id === selectedSlotId)!.startAt,
                    request.preferredSlots.find(s => s.id === selectedSlotId)!.endAt
                  )}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {request.preferredFormat === "GOOGLE_MEET" ? (
                    <Image src="https://thesvg.org/icons/google-meet/default.svg" alt="Google Meet" width={18} height={18} unoptimized />
                  ) : (
                    <Image src="https://thesvg.org/icons/microsoft-teams/default.svg" alt="Microsoft Teams" width={18} height={18} unoptimized />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-blue-800">Thông tin bảo mật</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Hệ thống sẽ dùng link **{request.preferredFormat === "GOOGLE_MEET" ? "Google Meet" : "MS Teams"}** cá nhân của bạn để tạo buổi họp này.
                  </p>
                  {!advisorLinks?.[request.preferredFormat === "GOOGLE_MEET" ? "googleMeet" : "msTeams"] && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      ⚠️ Bạn chưa điền link này trong hồ sơ! Hãy bổ sung sau khi chấp nhận.
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn chấp nhận yêu cầu này với khung giờ đã chọn không?
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setAcceptOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                Huỷ
              </button>
              <button onClick={handleAcceptConfirm} className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm">
                Xác nhận chấp nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <IssueReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        context={{
          entityType: "CONSULTING_REQUEST",
          entityId: request.id,
          entityTitle: `Yêu cầu tư vấn: ${request.objective}`,
          otherPartyName: request.startup.displayName
        }}
      />
    </AdvisorShell>
  );
}
