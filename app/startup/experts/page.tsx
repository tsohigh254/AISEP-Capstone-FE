"use client";

import {
  Star, Search, ChevronRight, ChevronLeft, ChevronDown, Users, Briefcase, FileText, X, ArrowUpDown, BadgeCheck,
  CalendarCheck, Video, Loader2, Eye, CheckCircle, CreditCard, MessageSquare, Lock
} from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { MentorshipRequestModal } from "@/components/startup/mentorship-request-modal";
import { SessionReviewModal } from "@/components/startup/session-review-modal";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  SearchAdvisors,
  GetMentorships,
  GetMentorshipById,
  GetMentorshipSessions,
  CancelMentorship,
  ConfirmSessionConducted,
} from "@/services/startup/startup-mentorship.api";
import type {
  IAdvisorSearchItem,
  IMentorshipRequest,
  IMentorshipSession,
  MeetingFormat,
} from "@/types/startup-mentorship";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatVND = (n: number | null | undefined) => {
  if (n == null) return "Thỏa thuận";
  return n.toLocaleString("vi-VN") + "₫";
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const getSessionEndAt = (session: IMentorshipSession) => {
  if (session.scheduledEndAt) {
    return session.scheduledEndAt;
  }

  if (!session.scheduledStartAt || !session.durationMinutes) {
    return null;
  }

  return new Date(
    new Date(session.scheduledStartAt).getTime() + session.durationMinutes * 60_000
  ).toISOString();
};

const REQUEST_STATUS_MAP: Record<string, { label: string; color: string }> = {
  Requested:  { label: "Chờ phản hồi",  color: "text-blue-600 bg-blue-50 border-blue-100" },
  Pending:    { label: "Chờ phản hồi",  color: "text-blue-600 bg-blue-50 border-blue-100" },
  Accepted:   { label: "Đã chấp nhận",  color: "text-teal-600 bg-teal-50 border-teal-100" },
  Scheduled:  { label: "Đã lên lịch",   color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  InProgress: { label: "Đang tư vấn",   color: "text-violet-600 bg-violet-50 border-violet-100" },
  Completed:  { label: "Hoàn thành",    color: "text-green-600 bg-green-50 border-green-100" },
  Rejected:   { label: "Từ chối",       color: "text-red-500 bg-red-50 border-red-100" },
  Cancelled:  { label: "Đã hủy",        color: "text-slate-500 bg-slate-50 border-slate-100" },
  InDispute:  { label: "Đang tranh chấp", color: "text-orange-600 bg-orange-50 border-orange-100" },
  Resolved:   { label: "Đã giải quyết", color: "text-green-700 bg-green-50 border-green-200" },
  Expired:    { label: "Hết hạn",       color: "text-slate-500 bg-slate-100 border-slate-200" },
};

const SESSION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  Pending:   { label: "Sắp diễn ra",   color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  Scheduled: { label: "Sắp diễn ra",   color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  Completed: { label: "Đã hoàn thành", color: "text-green-600 bg-green-50 border-green-100" },
  Cancelled: { label: "Đã hủy",        color: "text-slate-500 bg-slate-50 border-slate-100" },
};

const SESSION_STATUS_META: Record<string, { label: string; color: string }> = {
  ProposedByStartup: { label: "Chờ cố vấn xác nhận", color: "text-amber-700 bg-amber-50 border-amber-100" },
  ProposedByAdvisor: { label: "Cố vấn đề xuất lịch mới", color: "text-violet-700 bg-violet-50 border-violet-200" },
  Scheduled: { label: "Sắp tới", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  InProgress: { label: "Đang diễn ra", color: "text-teal-600 bg-teal-50 border-teal-100" },
  Completed: { label: "Đã hoàn thành", color: "text-green-600 bg-green-50 border-green-100" },
  Cancelled: { label: "Đã hủy", color: "text-slate-500 bg-slate-50 border-slate-100" },
};

const SESSION_FILTER_DEFS = [
  { key: "all", label: "Tất cả" },
  { key: "pending_confirmation", label: "Chờ xác nhận" },
  { key: "advisor_proposed", label: "Cố vấn đề xuất lịch" },
  { key: "upcoming", label: "Sắp tới" },
  { key: "in_progress", label: "Đang diễn ra" },
  { key: "conducted", label: "Đã tư vấn" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "in_dispute", label: "Tranh chấp" },
  { key: "resolved", label: "Đã giải quyết" },
  { key: "cancelled", label: "Đã hủy" },
] as const;

type SessionFilterKey = typeof SESSION_FILTER_DEFS[number]["key"];

const SESSION_TEXT = {
  advisorFallback: "C\u1ed1 v\u1ea5n",
  noTopic: "Ch\u01b0a c\u00f3 ch\u1ee7 \u0111\u1ec1",
  unknownStatus: "Ch\u01b0a x\u00e1c \u0111\u1ecbnh",
  all: "T\u1ea5t c\u1ea3",
  pendingConfirmation: "Ch\u1edd x\u00e1c nh\u1eadn",
  upcoming: "S\u1eafp t\u1edbi",
  inProgress: "\u0110ang di\u1ec5n ra",
  completed: "\u0110\u00e3 ho\u00e0n th\u00e0nh",
  cancelled: "\u0110\u00e3 h\u1ee7y",
  headerAdvisor: "C\u1ed1 v\u1ea5n",
  headerTime: "Th\u1eddi gian",
  headerTopic: "N\u1ed9i dung / Ch\u1ee7 \u0111\u1ec1",
  headerFormat: "H\u00ecnh th\u1ee9c",
  headerStatus: "Tr\u1ea1ng th\u00e1i",
  headerAction: "H\u00e0nh \u0111\u1ed9ng",
  emptySessions: "Kh\u00f4ng c\u00f3 phi\u00ean n\u00e0o.",
  emDash: "\u2014",
} as const;

const SESSION_STATUS_DISPLAY_SAFE: Record<string, { label: string; color: string }> = {
  ProposedByStartup: { label: "Chờ cố vấn xác nhận", color: "text-amber-700 bg-amber-50 border-amber-100" },
  ProposedByAdvisor: { label: "Cố vấn đề xuất lịch mới", color: "text-violet-700 bg-violet-50 border-violet-200" },
  Scheduled: { label: SESSION_TEXT.upcoming, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  InProgress: { label: SESSION_TEXT.inProgress, color: "text-teal-600 bg-teal-50 border-teal-100" },
  Conducted: { label: "Đã tư vấn", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  Completed: { label: SESSION_TEXT.completed, color: "text-green-600 bg-green-50 border-green-100" },
  InDispute: { label: "Tranh chấp", color: "text-red-600 bg-red-50 border-red-100" },
  Resolved: { label: "Đã giải quyết", color: "text-slate-600 bg-slate-50 border-slate-200" },
  Cancelled: { label: SESSION_TEXT.cancelled, color: "text-slate-500 bg-slate-50 border-slate-100" },
};

const SESSION_FILTER_BUTTONS_SAFE = [
  { key: "all", label: SESSION_TEXT.all },
  { key: "pending_confirmation", label: SESSION_TEXT.pendingConfirmation },
  { key: "advisor_proposed", label: "Cố vấn đề xuất lịch" },
  { key: "upcoming", label: SESSION_TEXT.upcoming },
  { key: "in_progress", label: SESSION_TEXT.inProgress },
  { key: "conducted", label: "Đã tư vấn" },
  { key: "completed", label: SESSION_TEXT.completed },
  { key: "in_dispute", label: "Tranh chấp" },
  { key: "resolved", label: "Đã giải quyết" },
  { key: "cancelled", label: SESSION_TEXT.cancelled },
] as const;

const SESSION_FILTER_STATUS_PARAM: Record<SessionFilterKey, string | undefined> = {
  all: undefined,
  pending_confirmation: "ProposedByStartup",
  advisor_proposed: "ProposedByAdvisor",
  upcoming: "Scheduled",
  in_progress: "InProgress",
  conducted: "Conducted",
  completed: "Completed",
  in_dispute: "InDispute",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

const SESSION_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  ProposedByStartup: { label: "Chờ cố vấn xác nhận", color: "text-amber-700 bg-amber-50 border-amber-100" },
  ProposedByAdvisor: { label: "Cố vấn đề xuất lịch mới", color: "text-violet-700 bg-violet-50 border-violet-200" },
  Scheduled: { label: "Sắp tới", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  InProgress: { label: "Đang diễn ra", color: "text-teal-600 bg-teal-50 border-teal-100" },
  Completed: { label: "Đã hoàn thành", color: "text-green-600 bg-green-50 border-green-100" },
  Cancelled: { label: "Đã hủy", color: "text-slate-500 bg-slate-50 border-slate-100" },
};

const SESSION_FILTER_BUTTONS = [
  { key: "all", label: "Tất cả" },
  { key: "pending_confirmation", label: "Chờ xác nhận" },
  { key: "advisor_proposed", label: "Cố vấn đề xuất lịch" },
  { key: "upcoming", label: "Sắp tới" },
  { key: "in_progress", label: "Đang diễn ra" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
] as const;

const EXPERTISE_MAP: Record<string, string> = {
  "PRODUCT_STRATEGY": "Chiến lược SP",
  "FUNDRAISING": "Gọi vốn",
  "GO_TO_MARKET": "Go-to-market",
  "FINANCE": "Tài chính",
  "LEGAL_IP": "Pháp lý & SHTT",
  "LEGAL_COMPLIANCE": "Pháp lý & Tuân thủ",
  "OPERATIONS": "Vận hành",
  "TECHNOLOGY": "Công nghệ",
  "MARKETING": "Marketing",
  "HR_OR_TEAM_BUILDING": "Nhân sự & Đội ngũ",
  "ENGINEERING": "Kỹ thuật",
  "AI_ML": "AI / ML",
  "AI": "AI",
  "GROWTH_HACKING": "Growth Hacking",
  "SAAS": "SaaS",
  "FINTECH": "FinTech",
  "E_COMMERCE": "E-commerce",
};

const mapMeetingFormat = (fmt?: MeetingFormat | string | null): string => {
  if (fmt === "GoogleMeet") return "Google Meet";
  if (fmt === "MicrosoftTeams") return "Microsoft Teams";
  return SESSION_TEXT.emDash;
};

const isValidImageUrl = (url?: string | null) => {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/");
};

const parseSpecificQuestions = (specificQuestions?: string | null) => {
  if (!specificQuestions?.trim()) {
    return { objective: "", additionalNotes: "" };
  }

  const parts = specificQuestions
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean);

  return {
    objective: parts[0] || "",
    additionalNotes: parts.slice(1).join("\n\n"),
  };
};

const getMentorshipObjective = (item: IMentorshipRequest) => {
  const parsed = parseSpecificQuestions(item.specificQuestions);
  return item.objective || parsed.objective || item.challengeDescription || "Không có tiêu đề";
};

const getMentorshipAdvisorDisplay = (item: IMentorshipRequest) => {
  const fullName = item.advisor?.fullName || item.advisorName || "Cố vấn";
  const title = item.advisor?.title || (item as any).advisorTitle || "Cố vấn";
  const profilePhotoURL = item.advisor?.profilePhotoURL || (item as any).advisorPhotoURL || "";

  return { fullName, title, profilePhotoURL };
};

// ─── Helper Components ───────────────────────────────────────────────────────

const getSessionStatusKey = (session: IMentorshipSession) => {
  return String(session.status || session.sessionStatus || "").trim();
};

const matchesSessionFilter = (session: IMentorshipSession, filter: SessionFilterKey) => {
  const status = getSessionStatusKey(session);

  if (filter === "all") return true;
  if (filter === "pending_confirmation") return status === "ProposedByStartup";
  if (filter === "advisor_proposed") return status === "ProposedByAdvisor";
  if (filter === "upcoming") return status === "Scheduled";
  if (filter === "in_progress") return status === "InProgress";
  if (filter === "conducted") return status === "Conducted";
  if (filter === "completed") return status === "Completed";
  if (filter === "in_dispute") return status === "InDispute";
  if (filter === "resolved") return status === "Resolved";
  if (filter === "cancelled") return status === "Cancelled";

  return false;
};

const getSessionAdvisorDisplay = (session: IMentorshipSession) => ({
  fullName: session.advisorName || session.advisor?.fullName || SESSION_TEXT.advisorFallback,
  title: session.advisor?.title || "",
  profilePhotoURL: session.advisorProfilePhotoURL || session.advisor?.profilePhotoURL || "",
});

const getSessionTopic = (session: IMentorshipSession) => {
  return session.objective?.trim() || session.mentorshipChallengeDescription?.trim() || SESSION_TEXT.noTopic;
};

const getSessionMeetingType = (session: IMentorshipSession) => {
  const rawFormat = String(
    session.sessionFormat || session.meetingFormat || session.meetingMode || ""
  ).toLowerCase();
  if (rawFormat.includes("google")) return "Google Meet";
  if (rawFormat.includes("teams")) return "Microsoft Teams";
  return SESSION_TEXT.unknownStatus;
};

function FSelect({ value, onChange, options, labels }: { value: string; onChange: (v: string) => void; options: string[]; labels: string[] }) {
  return (
    <div className="relative flex-shrink-0">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-2.5 text-[12px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 cursor-pointer transition-all"
      >
        {options.map((o, i) => <option key={o} value={o}>{labels[i]}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  );
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 bg-[#0f172a] text-white text-[13px] font-medium rounded-xl shadow-lg pointer-events-none">
      {msg}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-7 h-7 text-slate-300 animate-spin" />
    </div>
  );
}

type SessionReviewContext = {
  id?: number;
  advisorName: string;
  advisorAvatar: string;
  topic: string;
  time: string;
} & Record<string, unknown>;

const PAGE_SIZE = 4;

// ─── Main Component ──────────────────────────────────────────────────────────

function StartupAdvisorsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Find tab state ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");
  const [advisorPage, setAdvisorPage] = useState(1);
  const [advisorTotalPages, setAdvisorTotalPages] = useState(1);
  const [advisorTotalItems, setAdvisorTotalItems] = useState(0);

  // Data states
  const [advisors, setAdvisors] = useState<IAdvisorSearchItem[]>([]);
  const [advisorsLoading, setAdvisorsLoading] = useState(false);

  const [requests, setRequests] = useState<IMentorshipRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);

  const [sessions, setSessions] = useState<IMentorshipSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);

  const [completedMentorships, setCompletedMentorships] = useState<IMentorshipRequest[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Tab derived from URL
  const VALID_TABS = ["find", "requests", "sessions", "reports"] as const;
  type TabKey = typeof VALID_TABS[number];
  const tabParam = searchParams.get("tab") as TabKey | null;
  const activeTab: TabKey = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "find";
  const setTab = (tab: TabKey) => router.replace(`/startup/experts?tab=${tab}`);

  // Sub-filter state
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<SessionFilterKey>("all");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");

  // Request management
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");


  // Modals
  const [selectedAdvisor, setSelectedAdvisor] = useState<IAdvisorSearchItem | null>(null);
  const selectedAdvisorForModal = selectedAdvisor;
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionReviewContext | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => setToast(msg);

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  const fetchAdvisors = useCallback(async () => {
    setAdvisorsLoading(true);
    try {
      const params: any = {
        page: advisorPage,
        pageSize: PAGE_SIZE,
      };
      if (search) params.search = search;
      if (expertiseFilter !== "all") params.expertise = expertiseFilter;
      
      if (experienceFilter !== "all") {
        if (experienceFilter === "1-3") params.experience = 1;
        else if (experienceFilter === "3-7") params.experience = 3;
        else if (experienceFilter === "7+") params.experience = 7;
        else if (experienceFilter === "10+") params.experience = 10;
      }

      if (ratingFilter !== "all") params.rating = parseFloat(ratingFilter);
      if (sortBy !== "best_match") params.sort = sortBy;

      const res = await SearchAdvisors(params) as unknown as IBackendRes<IPagingData<IAdvisorSearchItem>>;
      if ((res.success || res.isSuccess) && res.data) {
        setAdvisors((res.data.items || (res.data as any).data) ?? []);
        if (res.data.paging) {
          setAdvisorTotalPages(Math.max(1, Math.ceil(res.data.paging.totalItems / res.data.paging.pageSize)));
          setAdvisorTotalItems(res.data.paging.totalItems);
        }
      }
    } catch {
      // silent
    } finally {
      setAdvisorsLoading(false);
    }
  }, [search, advisorPage, expertiseFilter, experienceFilter, ratingFilter, sortBy]);

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const params: any = { page: requestsPage, pageSize: 15 };
      if (requestStatusFilter !== "all") {
        params.status = requestStatusFilter;
      }
      const res = await GetMentorships(params) as unknown as IBackendRes<IPagingData<IMentorshipRequest>>;
      if ((res.success || res.isSuccess) && res.data) {
        // Backend PagedData uses "data" for items, FE type uses "items" — handle both
        const rawData = res.data as any;
        const items = rawData.items ?? rawData.data ?? [];
        setRequests(items);
        if (rawData.paging) {
          setRequestsTotalPages(Math.max(1, Math.ceil(rawData.paging.totalItems / rawData.paging.pageSize)));
        } else if (rawData.total !== undefined) {
          setRequestsTotalPages(Math.max(1, Math.ceil(rawData.total / (rawData.pageSize || 15))));
        }
      }
    } catch {
      // silent
    } finally {
      setRequestsLoading(false);
    }
  }, [requestsPage, requestStatusFilter]);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const statusParam = SESSION_FILTER_STATUS_PARAM[sessionStatusFilter];
      const res = await GetMentorshipSessions({
        ...(statusParam ? { status: statusParam } : {}),
        page: sessionsPage,
        pageSize: 20,
      }) as unknown as IBackendRes<IPagingData<IMentorshipSession>>;
      if ((res.success || res.isSuccess) && res.data) {
        const rawData = res.data as any;
        const sessionItems = rawData.items ?? rawData.data ?? [];
        setSessions(sessionItems);
        setSessionsTotalPages(rawData.paging?.totalPages ?? 1);
      }
    } catch {
      // silent
    } finally {
      setSessionsLoading(false);
    }
  }, [sessionsPage, sessionStatusFilter]);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await GetMentorships({ page: 1, pageSize: 100 }) as unknown as IBackendRes<IPagingData<IMentorshipRequest>>;
      const raw = (res.data as any) ?? {};
      const allItems: IMentorshipRequest[] = (res.success || res.isSuccess)
        ? (raw.items ?? raw.data ?? [])
        : [];

      const reportItems = allItems.filter(item => item.hasReport);
      const detailedReportItems = await Promise.all(
        reportItems.map(async (item) => {
          try {
            const detailRes = await GetMentorshipById(item.mentorshipID);
            if ((detailRes.success || detailRes.isSuccess) && detailRes.data) {
              return {
                ...item,
                ...detailRes.data,
                hasReport: item.hasReport ?? detailRes.data.hasReport,
                reportCount: item.reportCount ?? detailRes.data.reportCount,
                latestReportSubmittedAt: item.latestReportSubmittedAt ?? detailRes.data.latestReportSubmittedAt,
              };
            }
          } catch {
            // fall back to lightweight list item if detail fetch fails
          }

          return item;
        })
      );

      setCompletedMentorships(detailedReportItems);
    } catch {
      // silent
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // Fetch advisors on mount + when filters change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdvisors();
    }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search, fetchAdvisors]);

  // Fetch tab data when tab becomes active
  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
    if (activeTab === "sessions") fetchSessions();
    if (activeTab === "reports") fetchReports();
  }, [activeTab, fetchRequests, fetchSessions, fetchReports]);

  const totalPages = advisorTotalPages;
  const paginatedAdvisors = advisors;

  const hasActiveFilters = search !== "" || expertiseFilter !== "all" || experienceFilter !== "all" || ratingFilter !== "all" || sortBy !== "best_match";

  const clearFilters = () => {
    setSearch("");
    setExpertiseFilter("all");
    setExperienceFilter("all");
    setRatingFilter("all");
    setSortBy("best_match");
    setAdvisorPage(1);
  };

  // ─── Filtered Sub-lists ───────────────────────────────────────────────────

  const filteredRequests = requests; // Now filtered server-side

  const filteredSessions = sessionStatusFilter === "all"
    ? sessions.filter(s => getSessionStatusKey(s) !== "Cancelled")
    : sessions;

  const filteredReports = reportStatusFilter === "all"
    ? completedMentorships
    : reportStatusFilter === "pending"
      ? completedMentorships.filter(r => (r.feedbacks?.length ?? 0) === 0)
      : completedMentorships.filter(r => (r.feedbacks?.length ?? 0) > 0);

  const normalizedFilteredReports: IMentorshipRequest[] = filteredReports.map(item => {
    const advisorDisplay = getMentorshipAdvisorDisplay(item);

    return {
      ...item,
      objective: getMentorshipObjective(item),
      advisor: {
        advisorID: item.advisor?.advisorID || item.advisorID,
        fullName: advisorDisplay.fullName,
        title: advisorDisplay.title,
        profilePhotoURL: advisorDisplay.profilePhotoURL,
      },
    };
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCancelRequest = async () => {
    if (!cancelConfirmId) return;
    setCancellingId(cancelConfirmId);
    try {
      const res = await CancelMentorship(cancelConfirmId, { reason: cancelReason || "Startup hủy yêu cầu" }) as unknown as IBackendRes<null>;
      if (res.success || res.isSuccess) {
        showToast("Đã hủy yêu cầu");
        fetchRequests();
      } else {
        showToast(res.message || "Hủy yêu cầu thất bại");
      }
    } catch {
      showToast("Hủy yêu cầu thất bại");
    } finally {
      setCancellingId(null);
      setCancelConfirmId(null);
      setCancelReason("");
    }
  };

  const handleOpenRequest = (advisor: IAdvisorSearchItem) => {
    setSelectedAdvisor(advisor);
    setShowRequestModal(true);
  };

  const handleOpenReview = (item: IMentorshipRequest) => {
    const advisorDisplay = getMentorshipAdvisorDisplay(item);
    setSelectedSession({
      id: item.mentorshipID || (item as any).id,
      advisorName: item.advisor?.fullName || "Cố vấn",
      advisorAvatarDisplay: advisorDisplay.profilePhotoURL,
      topicDisplay: getMentorshipObjective(item),
      time: formatDate(item.completedAt || item.createdAt),
      advisorNameDisplay: advisorDisplay.fullName,
      advisorAvatar: advisorDisplay.profilePhotoURL,
      topic: getMentorshipObjective(item),
    });
    setShowReviewModal(true);
  };

  const [confirmingConductedId, setConfirmingConductedId] = useState<number | null>(null);
  const handleConfirmConducted = async (mentorshipId: number, sessionId: number) => {
    setConfirmingConductedId(sessionId);
    try {
      const res = await ConfirmSessionConducted(mentorshipId, sessionId) as any;
      if (res?.success || res?.isSuccess) {
        showToast("Đã xác nhận buổi tư vấn thành công");
        fetchSessions();
      } else {
        showToast(res?.message || "Xác nhận thất bại");
      }
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === "ALREADY_CONFIRMED") showToast("Buổi tư vấn đã được xác nhận trước đó");
      else if (code === "SESSION_NOT_FOUND") showToast("Không tìm thấy phiên tư vấn");
      else showToast(err?.response?.data?.message || "Xác nhận thất bại");
    } finally {
      setConfirmingConductedId(null);
    }
  };

  // ─── Tabs ─────────────────────────────────────────────────────────────────

  const tabs = [
    { key: "find" as const, label: "Tìm cố vấn" },
    { key: "requests" as const, label: "Yêu cầu của tôi" },
    { key: "sessions" as const, label: "Các phiên hướng dẫn" },
    { key: "reports" as const, label: "Báo cáo & Đánh giá" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">Cố vấn & Chuyên gia</h1>
            <p className="text-slate-500 text-[14px] font-medium mt-1">Tìm kiếm và kết nối với cố vấn phù hợp cho startup của bạn.</p>
          </div>
          <button
            onClick={() => setTab("requests")}
            className="px-4 py-2.5 bg-[#fdf8e6] text-slate-800 border border-[#eec54e]/30 rounded-xl text-[13px] font-semibold hover:bg-[#eec54e] transition-all"
          >
            Yêu cầu của tôi ({requests.length})
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={cn(
                "pb-4 text-[14px] font-bold transition-all relative tracking-tight",
                activeTab === tab.key ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#eec54e] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "find" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition-all placeholder:text-slate-400"
                  placeholder="Tìm theo chuyên môn, ngành, tên cố vấn..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setAdvisorPage(1); }}
                />
              </div>

              <FSelect
                value={expertiseFilter}
                onChange={v => { setExpertiseFilter(v); setAdvisorPage(1); }}
                options={["all", "PRODUCT_STRATEGY", "FUNDRAISING", "ENGINEERING", "AI_ML", "GROWTH_HACKING", "MARKETING", "LEGAL_COMPLIANCE", "OPERATIONS", "SAAS", "FINTECH", "E_COMMERCE", "HR_OR_TEAM_BUILDING", "FINANCE"]}
                labels={["Tất cả chuyên môn", "Product Strategy", "Fundraising", "Engineering", "AI/ML", "Growth Hacking", "Marketing", "Legal & Compliance", "Operations", "SaaS", "FinTech", "E-commerce", "Nhân sự & Đội ngũ", "Tài chính"]}
              />

              <FSelect
                value={experienceFilter}
                onChange={v => { setExperienceFilter(v); setAdvisorPage(1); }}
                options={["all", "1-3", "3-7", "7+", "10+"]}
                labels={["Tất cả kinh nghiệm", "1–3 năm", "3–7 năm", "7+ năm", "10+ năm"]}
              />

              <FSelect
                value={ratingFilter}
                onChange={v => { setRatingFilter(v); setAdvisorPage(1); }}
                options={["all", "4.5", "4", "3"]}
                labels={["Tất cả xếp hạng", "4.5★ trở lên", "4★ trở lên", "3★ trở lên"]}
              />

              <div className="w-px h-6 bg-slate-200 flex-shrink-0" />

              {/* Sort */}
              <div className="relative flex-shrink-0">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none pl-8 pr-7 py-2.5 text-[12px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 cursor-pointer transition-all"
                >
                  <option value="best_match">Phù hợp nhất</option>
                  <option value="highest_rated">Đánh giá cao nhất</option>
                  <option value="most_experienced">Nhiều kinh nghiệm nhất</option>
                  <option value="most_sessions">Nhiều phiên nhất</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Result Count */}
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-slate-500">
                <span className="font-semibold text-[#0f172a]">{advisorTotalItems}</span> cố vấn phù hợp
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[12px] text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Advisor Grid */}
            {advisorsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {paginatedAdvisors.length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-[15px] font-semibold text-slate-400">Không tìm thấy cố vấn phù hợp</p>
                    <p className="text-[13px] text-slate-400 mt-1">Thử mở rộng tiêu chí tìm kiếm hoặc xóa bộ lọc.</p>
                    <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[13px] font-medium hover:bg-slate-200 transition-colors">Xóa bộ lọc</button>
                  </div>
                )}

                {paginatedAdvisors.map(advisor => (
                  <div key={advisor.advisorID} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 p-6">
                    {/* Top row */}
                    <div className="flex items-start gap-4 mb-4">
                      {isValidImageUrl(advisor.profilePhotoURL) ? (
                        <img
                          src={advisor.profilePhotoURL}
                          alt={advisor.fullName}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-slate-400">
                            {advisor.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[15px] font-semibold text-slate-900">{advisor.fullName}</span>
                          {advisor.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          )}
                          <span className={cn(
                            "ml-auto flex-shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-medium border",
                            advisor.availabilityHint === "Available"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                              : "bg-slate-50 border-slate-100 text-slate-400"
                          )}>
                            {advisor.availabilityHint === "Available" ? "Đang nhận mentee" : advisor.availabilityHint === "Not available" ? "Tạm ngưng" : advisor.availabilityHint}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-400 mt-0.5">{advisor.title}</p>
                        <p className="text-[13px] text-slate-500 mt-1.5 line-clamp-1">{advisor.bio}</p>
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {advisor.expertise.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-medium text-slate-600">
                          {EXPERTISE_MAP[tag] || tag}
                        </span>
                      ))}
                      {advisor.domainTags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-medium text-amber-700">
                          {EXPERTISE_MAP[tag] || tag}
                        </span>
                      ))}
                    </div>

                    {/* Trust row */}
                    <div className="flex items-center gap-1 text-[12px] text-slate-400 mb-3 flex-wrap">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-slate-700">{advisor.averageRating}</span>
                      <span>·</span>
                      <span>{advisor.reviewCount} đánh giá</span>
                      <span>·</span>
                      <span>{advisor.completedSessions} phiên</span>
                      <span>·</span>
                      <span>{advisor.yearsOfExperience} năm KN</span>
                    </div>

                    {/* Suitable For */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      <span className="text-[11px] text-slate-400 font-medium">Phù hợp:</span>
                      {advisor.suitableFor.slice(0, 2).map(f => (
                        <span key={f} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-[11px] font-medium border border-amber-100">{f}</span>
                      ))}
                    </div>

                    {/* Pricing Widget */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/60 border border-amber-100 rounded-xl mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-bold text-slate-700">{formatVND(advisor.hourlyRate)} / giờ</span>
                      </div>
                      <div className="flex gap-1">
                        {advisor.supportedDurations.map(d => (
                          <span key={d} className="px-1.5 py-0.5 bg-white border border-amber-100 rounded-md text-[10px] font-semibold text-amber-700">{d}m</span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => router.push(`/startup/experts/${advisor.advisorID}`)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                      >
                        Xem hồ sơ
                      </button>
                      <button
                        onClick={() => handleOpenRequest(advisor)}
                        className="flex-1 py-2.5 rounded-xl bg-[#fdf8e6] border border-[#eec54e]/30 text-slate-800 text-[13px] font-semibold hover:bg-[#eec54e] transition-all"
                      >
                        Gửi yêu cầu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !advisorsLoading && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setAdvisorPage(p => Math.max(1, p - 1))}
                  disabled={advisorPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setAdvisorPage(page)}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold transition-all",
                      advisorPage === page
                        ? "bg-[#eec54e] text-white shadow-sm"
                        : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setAdvisorPage(p => Math.min(totalPages, p + 1))}
                  disabled={advisorPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Status filter buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {([
                { key: "all", label: "Tất cả" },
                { key: "Requested", label: "Chờ phản hồi" },
                { key: "Accepted", label: "Đã chấp nhận" },
                { key: "Scheduled", label: "Đã lên lịch" },
                { key: "InProgress", label: "Đang tư vấn" },
                { key: "Completed", label: "Hoàn thành" },
                { key: "Rejected", label: "Từ chối" },
                { key: "Cancelled", label: "Đã hủy" },
              ] as const).map(s => (
                <button
                  key={s.key}
                  onClick={() => { setRequestStatusFilter(s.key); setRequestsPage(1); }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all",
                    requestStatusFilter === s.key
                      ? "bg-[#eec54e] text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {requestsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cố vấn</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chủ đề / Thách thức</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngày gửi</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hình thức</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-[14px] text-slate-400">Không có yêu cầu nào.</td>
                      </tr>
                    )}
                    {filteredRequests.map(item => {
                      const requestStatusKey = (item.status || item.mentorshipStatus) as string;
                      const statusInfo = REQUEST_STATUS_MAP[requestStatusKey] ?? { label: requestStatusKey, color: "text-slate-500 bg-slate-50 border-slate-100" };
                      const meetingType = mapMeetingFormat(item.preferredFormat);
                      const advisorDisplay = getMentorshipAdvisorDisplay(item);
                      const hasAdvisorProposal = (item as any).hasAdvisorProposedSlot === true;
                      return (
                        <tr key={item.mentorshipID} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {isValidImageUrl(advisorDisplay.profilePhotoURL) ? (
                                <img src={advisorDisplay.profilePhotoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                                  <span className="text-sm font-bold text-slate-400">
                                    {advisorDisplay.fullName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="text-[13px] font-semibold text-slate-900 leading-none mb-0.5">{advisorDisplay.fullName}</p>
                                <p className="text-[11px] text-slate-400">{advisorDisplay.title !== "Cố vấn" ? advisorDisplay.title : ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-[260px]">
                            <p className="text-[13px] font-semibold text-slate-800 truncate">{getMentorshipObjective(item)}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.problemContext ?? ""}</p>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-slate-500">{formatDate(item.createdAt)}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[12px] font-medium">
                              {meetingType === "Google Meet" ? <img src="/google-meet.svg" alt="Google Meet" className="w-[14px] h-[14px]" /> : meetingType === "Microsoft Teams" ? <img src="/ms-teams.svg" alt="Microsoft Teams" className="w-[14px] h-[14px]" /> : <Users className="w-3.5 h-3.5 text-slate-400" />}
                              {meetingType}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap", statusInfo.color)}>
                                {statusInfo.label}
                              </span>
                              {hasAdvisorProposal && (
                                <span className="text-[10px] text-violet-600 font-medium whitespace-nowrap">Cố vấn đề xuất lịch mới</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}`)}
                                className="p-2 text-slate-400 hover:text-amber-500 bg-slate-50 hover:bg-amber-50 rounded-lg transition-all"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {(item.status === "Pending" || item.status === "Requested") && (
                                <button onClick={() => setCancelConfirmId(item.mentorshipID)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-all" title="Hủy yêu cầu">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              {item.status === "Accepted" && (
                                <button
                                  onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}/confirm-schedule`)}
                                  className="p-2 text-slate-400 hover:text-teal-600 bg-slate-50 hover:bg-teal-50 rounded-lg transition-all"
                                  title="Xác nhận lịch hẹn"
                                >
                                  <CalendarCheck className="w-4 h-4" />
                                </button>
                              )}
                              {item.status === "Scheduled" && (
                                <button
                                  onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}`)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Xem chi tiết phiên"
                                >
                                  <Video className="w-4 h-4" />
                                </button>
                              )}
                              {item.status === "Completed" && item.hasReport && (
                                <button
                                  onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}/report`)}
                                  className="p-2 text-slate-400 hover:text-green-600 bg-slate-50 hover:bg-green-50 rounded-lg transition-all"
                                  title="Xem báo cáo"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              )}
                              {["Accepted", "InProgress", "Completed"].includes(item.status as string) && (
                                <button
                                  onClick={() => router.push(`/startup/messaging?mentorshipId=${item.mentorshipID}`)}
                                  className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Nhắn tin"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              )}
                              {item.status === "Rejected" && (
                                <button
                                  onClick={() => router.push("/startup/experts")}
                                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                                  title="Tìm cố vấn khác"
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination for requests */}
            {requestsTotalPages > 1 && !requestsLoading && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setRequestsPage(p => Math.max(1, p - 1))}
                  disabled={requestsPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: requestsTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setRequestsPage(page)}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold transition-all",
                      requestsPage === page
                        ? "bg-[#eec54e] text-white shadow-sm"
                        : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setRequestsPage(p => Math.min(requestsTotalPages, p + 1))}
                  disabled={requestsPage === requestsTotalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Status filter buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {SESSION_FILTER_BUTTONS_SAFE.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => { setSessionStatusFilter(filter.key); setSessionsPage(1); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[13px] font-semibold transition-all",
                    sessionStatusFilter === filter.key
                      ? "bg-[#eec54e] text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {sessionsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{SESSION_TEXT.headerAdvisor}</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{SESSION_TEXT.headerTime}</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">{SESSION_TEXT.headerTopic}</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">{SESSION_TEXT.headerFormat}</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">{SESSION_TEXT.headerStatus}</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">{SESSION_TEXT.headerAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-[14px] text-slate-400">{SESSION_TEXT.emptySessions}</td>
                      </tr>
                    )}
                    {filteredSessions.map(item => {
                      const sessionStatusKey = getSessionStatusKey(item);
                      const sessionEndAt = getSessionEndAt(item);
                      // Override badge for Scheduled: FE tự tính trạng thái theo giờ thực
                      // vì BE không auto-update status theo thời gian
                      const resolvedStatusInfo = (() => {
                        const base = SESSION_STATUS_DISPLAY_SAFE[sessionStatusKey] ?? { label: SESSION_TEXT.unknownStatus, color: "text-slate-500 bg-slate-50 border-slate-100" };
                        if (sessionStatusKey === "Scheduled") {
                          const now = Date.now();
                          const startMs = item.scheduledStartAt ? new Date(item.scheduledStartAt).getTime() : null;
                          const endMs = sessionEndAt ? new Date(sessionEndAt).getTime() : null;
                          if (endMs && now >= endMs) {
                            return { label: "Đã kết thúc", color: "text-slate-600 bg-slate-50 border-slate-200" };
                          }
                          if (startMs && now >= startMs) {
                            return { label: "Đang diễn ra", color: "text-teal-600 bg-teal-50 border-teal-100" };
                          }
                        }
                        return base;
                      })();
                      const sessionStatusInfo = resolvedStatusInfo;
                      const advisorDisplay = getSessionAdvisorDisplay(item);
                      const meetingType = getSessionMeetingType(item);
                      const meetingLink = item.meetingURL;
                      const isActive = sessionStatusKey === "Scheduled" || sessionStatusKey === "InProgress";
                      const needsPayment = isActive && !meetingLink;
                      const canJoin = isActive && !!meetingLink && !(!!sessionEndAt && Date.now() >= new Date(sessionEndAt).getTime() + 5 * 60_000);
                      const canConfirmConducted =
                        isActive &&
                        !!meetingLink &&
                        !!item.mentorshipID &&
                        !!item.sessionID &&
                        !!sessionEndAt &&
                        Date.now() >= new Date(sessionEndAt).getTime();
                      const sessionTopic = getSessionTopic(item);
                      const advisorSubtitle = advisorDisplay.title || item.advisor?.title || "";
                      return (
                        <tr key={item.sessionID} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {isValidImageUrl(advisorDisplay.profilePhotoURL) ? (
                                <img src={advisorDisplay.profilePhotoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                                  <span className="text-sm font-bold text-slate-400">
                                    {(advisorDisplay.fullName || "?")?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="text-[13px] font-semibold text-slate-900 leading-none mb-0.5">{advisorDisplay.fullName}</p>
                                <p className="text-[11px] text-slate-400">{advisorSubtitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[13px] font-semibold text-slate-700">{formatDate(item.scheduledStartAt)}</p>
                            <p className="text-[11px] text-slate-400">{formatTime(item.scheduledStartAt)}</p>
                          </td>
                          <td className="px-6 py-4 max-w-[250px]">
                            <p className="text-[13px] font-semibold text-slate-800 truncate">{sessionTopic}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[12px] font-medium">
                              {meetingType === "Google Meet" && <img src="/google-meet.svg" alt="Google Meet" className="w-[14px] h-[14px]" />}
                              {meetingType === "Microsoft Teams" && <img src="/ms-teams.svg" alt="Microsoft Teams" className="w-[14px] h-[14px]" />}
                              {meetingType}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold border", sessionStatusInfo.color)}>
                              {sessionStatusInfo.label}
                            </span>
                            {item.disputeReason && (
                              <p className="text-[10px] text-red-500 mt-1 max-w-[160px] mx-auto truncate" title={item.disputeReason}>
                                Lý do: {item.disputeReason}
                              </p>
                            )}
                            {item.resolutionNote && (
                              <p className="text-[10px] text-indigo-500 mt-0.5 max-w-[160px] mx-auto truncate" title={item.resolutionNote}>
                                KQ: {item.resolutionNote}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {sessionStatusKey === "ProposedByAdvisor" && (
                                <button
                                  onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}`)}
                                  title="Xem và xác nhận lịch"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-[11px] font-semibold hover:bg-violet-700 transition-all"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Xác nhận lịch
                                </button>
                              )}
                              {needsPayment && (
                                <button
                                  onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}/checkout`)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[11px] font-semibold hover:bg-amber-600 transition-all"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Thanh toán để nhận link
                                </button>
                              )}
                              {canJoin && (
                                <a
                                  href={meetingLink!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-semibold hover:bg-indigo-600 hover:text-white transition-all"
                                >
                                  Tham gia họp
                                </a>
                              )}
                              {isActive && !!meetingLink && item.mentorshipID && item.sessionID && (
                                <button
                                  onClick={() => handleConfirmConducted(item.mentorshipID, item.sessionID!)}
                                  disabled={confirmingConductedId === item.sessionID || !canConfirmConducted}
                                  title={
                                    canConfirmConducted
                                      ? "Xác nhận đã hoàn thành buổi tư vấn"
                                      : "Bạn có thể xác nhận sau khi phiên tư vấn kết thúc"
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {confirmingConductedId === item.sessionID ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  )}
                                  Xác nhận đã tư vấn
                                </button>
                              )}
                              {["Accepted", "InProgress", "Completed", "Scheduled", "Conducted"].includes(sessionStatusKey) && (
                                <button
                                  onClick={() => router.push(`/startup/messaging?mentorshipId=${item.mentorshipID}`)}
                                  className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Nhắn tin với cố vấn"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}`)}
                                title="Xem chi tiết yêu cầu"
                                className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {item.hasReport && (
                                <button
                                  onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}/report`)}
                                  title="Xem báo cáo tư vấn"
                                  className="p-2 text-slate-400 hover:text-amber-500 bg-slate-50 hover:bg-amber-50 rounded-lg transition-all"
                                >
                                  <Briefcase className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination for sessions */}
            {sessionsTotalPages > 1 && !sessionsLoading && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setSessionsPage(p => Math.max(1, p - 1))}
                  disabled={sessionsPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: sessionsTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setSessionsPage(page)}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold transition-all",
                      sessionsPage === page
                        ? "bg-[#eec54e] text-white shadow-sm"
                        : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setSessionsPage(p => Math.min(sessionsTotalPages, p + 1))}
                  disabled={sessionsPage === sessionsTotalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Status filter buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: "all", label: "Tất cả" },
                { key: "pending", label: "Chờ đánh giá" },
                { key: "done", label: "Đã hoàn tất" },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setReportStatusFilter(s.key)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[13px] font-semibold transition-all",
                    reportStatusFilter === s.key
                      ? "bg-[#eec54e] text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {reportsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cố vấn</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phiên hướng dẫn</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Báo cáo</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đánh giá</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {normalizedFilteredReports.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-[14px] text-slate-400">Không có báo cáo nào.</td>
                      </tr>
                    )}
                    {normalizedFilteredReports.map(item => (
                      <tr key={item.mentorshipID} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isValidImageUrl(item.advisor?.profilePhotoURL) ? (
                                <img src={item.advisor?.profilePhotoURL as string} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                                  <span className="text-sm font-bold text-slate-400">
                                    {(item.advisor?.fullName || "?")?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            <div>
                              <p className="text-[13px] font-semibold text-slate-900 leading-none mb-0.5">{item.advisor?.fullName || "Cố vấn"}</p>
                              <p className="text-[11px] text-slate-400">{item.advisor?.title || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-semibold text-slate-800">{item.objective || "Không có tiêu đề"}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(item.latestReportSubmittedAt || item.completedAt || item.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}/report`)}
                            className="inline-flex items-center gap-1.5 mx-auto text-[11px] font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 hover:bg-[#eec54e] hover:text-white transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" /> Xem báo cáo
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {(item.feedbacks?.length ?? 0) > 0 ? (
                            <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase border border-green-100">Đã đánh giá</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase border border-amber-100">Chưa đánh giá</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {(item.feedbacks?.length ?? 0) === 0 && (
                              <button
                                onClick={() => handleOpenReview(item)}
                                className="px-3 py-1.5 bg-[#eec54e] text-white rounded-lg text-[11px] font-semibold shadow-sm hover:bg-[#d4ae3d] transition-all"
                              >
                                Đánh giá
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/startup/messaging?mentorshipId=${item.mentorshipID}`)}
                              className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all"
                              title="Nhắn tin với cố vấn"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/startup/mentorship-requests/${item.mentorshipID}`)}
                              title="Xem chi tiết yêu cầu"
                              className="p-2 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <MentorshipRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          mentor={selectedAdvisorForModal}
        />
        <SessionReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          session={selectedSession}
        />

        {/* Toast */}
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

        {/* Cancel Confirmation Modal */}
        {cancelConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-[16px] font-bold text-slate-900 mb-2">Hủy yêu cầu tư vấn</h3>
              <p className="text-[13px] text-slate-500 mb-4">Bạn chắc chắn muốn hủy yêu cầu tư vấn này? Vui lòng cung cấp lý do để cố vấn hiểu rõ.</p>
              
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Lịch cố vấn không phù hợp, Đã tìm được người khác..."
                className="w-full text-[13px] text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all resize-none mb-5 h-24"
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setCancelConfirmId(null); setCancelReason(""); }}
                  className="px-4 py-2 text-[13px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Đóng
                </button>
                <button
                  onClick={handleCancelRequest}
                  disabled={cancellingId === cancelConfirmId}
                  className="px-4 py-2 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {cancellingId === cancelConfirmId && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác nhận Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StartupShell>
  );
}

export default function StartupAdvisorsPage() {
  return (
    <Suspense>
      <StartupAdvisorsPageInner />
    </Suspense>
  );
}
