"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search, Inbox, Clock, CalendarCheck, CheckCircle2, ArrowRight,
  AlertCircle, X, Timer, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { FormatBadge } from "@/components/advisor/consulting-format-badge";
import type { IConsultingRequest, ConsultingRequestStatus } from "@/types/advisor-consulting";
import { GetAdvisorMentorships, AcceptMentorshipRequest } from "@/services/advisor/advisor.api";
import { mapMentorshipToConsultingRequest } from "@/services/advisor/advisor.mapper";
import { toast } from "sonner";

/* ─── Constants ──────────────────────────────────────────────── */

type TabKey = "all" | ConsultingRequestStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xử lý" },
  { key: "ACCEPTED", label: "Đã nhận" },
  { key: "SCHEDULED", label: "Đã lên lịch" },
  { key: "COMPLETED", label: "Đã diễn ra" },
  { key: "FINALIZED", label: "Đã hoàn thành" },
  { key: "REJECTED", label: "Đã từ chối" },
  { key: "CANCELLED", label: "Đã huỷ" },
];

const STATUS_LABEL: Record<ConsultingRequestStatus, string> = {
  PENDING: "Chờ xử lý", REQUESTED: "Chờ xử lý", ACCEPTED: "Đã nhận", SCHEDULED: "Đã lên lịch",
  COMPLETED: "Đã diễn ra", FINALIZED: "Đã hoàn thành", REJECTED: "Đã từ chối", CANCELLED: "Đã huỷ",
};

const STATUS_CFG: Record<ConsultingRequestStatus, { dot: string; badge: string }> = {
  PENDING: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
  REQUESTED: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
  ACCEPTED:  { dot: "bg-blue-400",  badge: "bg-blue-50 text-blue-700 border-blue-200/80" },
  SCHEDULED: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  COMPLETED: { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200/80" },
  FINALIZED: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  REJECTED:  { dot: "bg-red-400",   badge: "bg-red-50 text-red-600 border-red-200/80" },
  CANCELLED: { dot: "bg-gray-400",  badge: "bg-gray-50 text-gray-500 border-gray-200/80" },
};


const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];
function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
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

function expiryCountdown(expiresAt: string): string | null {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Đã hết hạn";
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 48) return null;
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 0) return `Hết hạn sau ${diffHours}h ${diffMins}m`;
  return `Hết hạn sau ${diffMins}m`;
}

function formatSlotPreview(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} Thg ${d.getMonth() + 1} • ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/* ─── Request Card ───────────────────────────────────────────── */

function RequestCard({
  req,
  
  showUrgent,
}: {
  req: IConsultingRequest;
  
  showUrgent?: boolean;
}) {
  const initial = req.startup.displayName.charAt(0).toUpperCase();
  const firstSlot = req.preferredSlots[0] ?? null;
  const cfg = STATUS_CFG[req.status];
  const expiry = req.expiresAt ? expiryCountdown(req.expiresAt) : null;
  const isRequested = req.status === "PENDING";

  return (
    <div className={cn(
      "group bg-white rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200",
      isRequested && showUrgent
        ? "border-amber-200 hover:border-amber-300 hover:shadow-[0_4px_12px_rgba(234,179,8,0.1)]"
        : "border-slate-200/80 hover:border-slate-300/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
    )}>
      <Link href={`/advisor/requests/${req.mentorshipID}`} className="block px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0 shadow-sm shrink-0 overflow-hidden",
            !req.startup.logoUrl ? cn("bg-gradient-to-br text-white", getAvatarColor(req.startup.displayName)) : "bg-white border border-slate-100"
          )}>
            {req.startup.logoUrl ? (
              <img src={req.startup.logoUrl} alt={req.startup.displayName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                {req.startup.displayName}
              </span>
              <FormatBadge format={req.preferredFormat} size="sm" />
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200/60 shadow-sm">
                <Timer className="w-3 h-3" />
                {req.durationMinutes} phút
              </span>
              {expiry && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500">
                  <Clock className="w-3 h-3" />
                  {expiry}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Briefcase className="w-3 h-3 text-slate-400" />
                {req.startup.industry} • {req.startup.stage}
              </span>
            </div>

            <p className="text-[13px] text-slate-600 truncate mt-1.5 font-medium">{req.objective}</p>
            
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {relativeTime(req.submittedAt)}
              </span>
              {firstSlot && isRequested && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50/80 border border-blue-100">
                  <CalendarCheck className="w-3 h-3 text-blue-500" />
                  <span className="text-[11px] font-semibold text-blue-700">
                    Đề xuất: {formatSlotPreview(firstSlot.startAt)} 
                    {req.preferredSlots.length > 1 && <span className="ml-1 text-blue-500">(+{req.preferredSlots.length - 1})</span>}
                  </span>
                </div>
              )}
              {firstSlot && !isRequested && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3" />
                  {formatSlotPreview(firstSlot.startAt)}
                </span>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {!isRequested && (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                cfg.badge
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                {STATUS_LABEL[req.status]}
              </span>
            )}
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </Link>

      {/* Quick actions for PENDING */}
      {isRequested && (
        <div className="px-5 pb-4 flex items-center gap-2 border-t border-amber-100 pt-3 mt-0">
          
          <Link
            href={`/advisor/requests/${req.mentorshipID}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-semibold hover:bg-slate-50 transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function AdvisorRequestsPage() {
  const [requests, setRequests] = useState<IConsultingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");

  // Confirm dialog state
  
  

const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    let isMounted = true;
    async function loadRequests(showLoading = true) {
      try {
        if (showLoading) setIsLoading(true);
        const res = await GetAdvisorMentorships({ pageSize: 100 });

        if (res.isSuccess || res.success) {
           const rawData = res.data as any;
           const itemsArray = rawData?.items || rawData?.data || [];
           const mapped: IConsultingRequest[] = itemsArray.map(mapMentorshipToConsultingRequest);

           if (isMounted) setRequests(mapped);
        }
      } catch(err) {
        console.error("Failed to load mentorships:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRequests(true);
    
    // Polling background update without showing loading spinner
    const interval = setInterval(() => {
      loadRequests(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const counts = useMemo(() => {
    const c = { PENDING: 0, ACCEPTED: 0, SCHEDULED: 0, COMPLETED: 0, FINALIZED: 0, REJECTED: 0, CANCELLED: 0 };
    for (const r of requests) if (r.status in c) c[r.status as keyof typeof c]++;
    return c;
  }, [requests]);
  const pending = useMemo(() => requests.filter(r => r.status === "PENDING"), [requests]);

  const filtered = useMemo(() => {
    let list = requests;
    if (activeTab !== "all") list = list.filter(r => r.status === activeTab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        r.startup.displayName.toLowerCase().includes(q) ||
        r.objective.toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, activeTab, search]);


  ;

  // When tab = "all" and no search: group pending on top, rest below
  const showGrouped = activeTab === "all" && !search.trim() && pending.length > 0;
  const nonPendingFiltered = showGrouped
    ? filtered.filter(r => r.status !== "PENDING")
    : filtered;

  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto space-y-5 animate-in fade-in duration-400">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 leading-tight">Yêu cầu tư vấn</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Quản lý và phản hồi các yêu cầu từ Startup.</p>
          </div>
          <div className="relative sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-9 rounded-xl border border-slate-200/80 text-[13px] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all"
            />
          </div>
        </div>

        {/* Urgent alert — only when on "all" tab, no search, has pending */}
        {showGrouped && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[13px] font-semibold text-amber-800">
                {pending.length} yêu cầu cần phản hồi
              </span>
              <span className="text-[11px] text-amber-600 ml-auto">Phản hồi sớm để tránh tự động hủy</span>
            </div>
            <div className="space-y-2">
              {pending.map(req => (
                <RequestCard key={req.mentorshipID} req={req}  showUrgent />
              ))}
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex items-center gap-1 overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-1">
          {TABS.map(tab => {
            const count = tab.key === "all" ? requests.length : counts[tab.key as keyof typeof counts] ?? 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                  activeTab === tab.key
                    ? "bg-[#0f172a] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] rounded-full px-1.5 py-0.5 font-bold leading-none",
                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400",
                    tab.key === "PENDING" && activeTab !== tab.key && count > 0 && "bg-amber-100 text-amber-600"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main list */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center py-20 px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-[14px] font-semibold text-slate-600">Không có yêu cầu nào</p>
            <p className="text-[12px] text-slate-400 mt-1">Chưa có yêu cầu tư vấn phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}

        {showGrouped ? (
          // Grouped view: pending already shown above, show rest with label
          nonPendingFiltered.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                Các yêu cầu khác
              </p>
              <div className="space-y-2">
                {nonPendingFiltered.map(req => (
                  <RequestCard key={req.mentorshipID} req={req} />
                ))}
              </div>
            </div>
          )
        ) : (
          // Flat filtered view
          filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map(req => (
                <RequestCard
                  key={req.mentorshipID}
                  req={req}
                  
                  showUrgent={req.status === "PENDING"}
                />
              ))}
            </div>
          )
        )}
      </div>
    </AdvisorShell>
  );
}
