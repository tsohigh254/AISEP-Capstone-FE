"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search, Inbox, Clock, CalendarCheck, CheckCircle2, ArrowRight,
  AlertCircle, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { FormatBadge } from "@/components/advisor/consulting-format-badge";
import type { IConsultingRequest, ConsultingRequestStatus } from "@/types/advisor-consulting";
import { getMockRequests } from "@/services/advisor/advisor-consulting.mock";
import { toast } from "sonner";

/* ─── Constants ──────────────────────────────────────────────── */

type TabKey = "all" | ConsultingRequestStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "REQUESTED", label: "Chờ xử lý" },
  { key: "ACCEPTED", label: "Đã nhận" },
  { key: "SCHEDULED", label: "Đã lên lịch" },
  { key: "COMPLETED", label: "Đã diễn ra" },
  { key: "FINALIZED", label: "Đã hoàn thành" },
  { key: "REJECTED", label: "Đã từ chối" },
  { key: "CANCELLED", label: "Đã huỷ" },
];

const STATUS_LABEL: Record<ConsultingRequestStatus, string> = {
  REQUESTED: "Chờ xử lý", ACCEPTED: "Đã nhận", SCHEDULED: "Đã lên lịch",
  COMPLETED: "Đã diễn ra", FINALIZED: "Đã hoàn thành", REJECTED: "Đã từ chối", CANCELLED: "Đã huỷ",
};

const STATUS_CFG: Record<ConsultingRequestStatus, { dot: string; badge: string }> = {
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
  onAccept,
  showUrgent,
}: {
  req: IConsultingRequest;
  onAccept?: (id: string) => void;
  showUrgent?: boolean;
}) {
  const initial = req.startup.displayName.charAt(0).toUpperCase();
  const firstSlot = req.preferredSlots[0] ?? null;
  const cfg = STATUS_CFG[req.status];
  const expiry = req.expiresAt ? expiryCountdown(req.expiresAt) : null;
  const isRequested = req.status === "REQUESTED";

  return (
    <div className={cn(
      "group bg-white rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200",
      isRequested && showUrgent
        ? "border-amber-200 hover:border-amber-300 hover:shadow-[0_4px_12px_rgba(234,179,8,0.1)]"
        : "border-slate-200/80 hover:border-slate-300/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
    )}>
      <Link href={`/advisor/requests/${req.id}`} className="block px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={cn(
            "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[15px] font-bold shrink-0 shadow-sm",
            getAvatarColor(req.startup.displayName)
          )}>
            {initial}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                {req.startup.displayName}
              </span>
              <FormatBadge format={req.preferredFormat} size="sm" />
              {expiry && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-500">
                  <Clock className="w-3 h-3" />
                  {expiry}
                </span>
              )}
            </div>
            <p className="text-[13px] text-slate-500 truncate mt-0.5">{req.objective}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {relativeTime(req.submittedAt)}
              </span>
              {firstSlot && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
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

      {/* Quick actions for REQUESTED */}
      {isRequested && onAccept && (
        <div className="px-5 pb-4 flex items-center gap-2 border-t border-amber-100 pt-3 mt-0">
          <button
            onClick={e => { e.preventDefault(); onAccept(req.id); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] text-white text-[12px] font-semibold hover:bg-[#1e293b] transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Chấp nhận
          </button>
          <Link
            href={`/advisor/requests/${req.id}`}
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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [requestToAccept, setRequestToAccept] = useState<string | null>(null);

  useEffect(() => { setRequests(getMockRequests()); }, []);

  const counts = useMemo(() => {
    const c = { REQUESTED: 0, ACCEPTED: 0, SCHEDULED: 0, COMPLETED: 0, FINALIZED: 0, REJECTED: 0, CANCELLED: 0 };
    for (const r of requests) if (r.status in c) c[r.status as keyof typeof c]++;
    return c;
  }, [requests]);

  const pending = useMemo(() => requests.filter(r => r.status === "REQUESTED"), [requests]);

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

  const handleQuickAccept = (id: string) => {
    setRequestToAccept(id);
    setIsConfirmOpen(true);
  };

  const onConfirmAccept = () => {
    if (!requestToAccept) return;
    const id = requestToAccept;
    setRequests(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: "ACCEPTED" as ConsultingRequestStatus, acceptedAt: new Date().toISOString() }
        : r
    ));
    toast.success("Đã chấp nhận yêu cầu tư vấn");
    setIsConfirmOpen(false);
    setRequestToAccept(null);
  };

  // When tab = "all" and no search: group pending on top, rest below
  const showGrouped = activeTab === "all" && !search.trim() && pending.length > 0;
  const nonPendingFiltered = showGrouped
    ? filtered.filter(r => r.status !== "REQUESTED")
    : filtered;

  return (
    <AdvisorShell>
      <div className="max-w-[1000px] mx-auto space-y-5 animate-in fade-in duration-400">

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
                <RequestCard key={req.id} req={req} onAccept={handleQuickAccept} showUrgent />
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
                    tab.key === "REQUESTED" && activeTab !== tab.key && count > 0 && "bg-amber-100 text-amber-600"
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
                  <RequestCard key={req.id} req={req} />
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
                  key={req.id}
                  req={req}
                  onAccept={req.status === "REQUESTED" ? handleQuickAccept : undefined}
                  showUrgent={req.status === "REQUESTED"}
                />
              ))}
            </div>
          )
        )}

        {/* Confirmation Dialog */}
        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-slate-900">Xác nhận chấp nhận</h3>
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-3">
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Bạn có chắc chắn muốn chấp nhận yêu cầu tư vấn này không? Hành động này sẽ thông báo cho Startup và cho phép bạn tiến hành lên lịch buổi tư vấn.
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={onConfirmAccept}
                  className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdvisorShell>
  );
}
