"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Bell, ShieldAlert, ShieldCheck, FileText, Brain,
  Users, MessageSquare, CheckCheck, MoreHorizontal,
  MailOpen, Mail, Inbox, RefreshCw, ArrowRight,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

type NotificationType =
  | "SYSTEM"
  | "VERIFICATION"
  | "DOCUMENT"
  | "AI_EVALUATION"
  | "CONSULTING"
  | "INVESTOR_INTERACTION"
  | "MESSAGE";

interface StartupNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  targetUrl?: string;
  priority?: "LOW" | "NORMAL" | "HIGH";
  actorName?: string;
}

/* ─── Mock Data ──────────────────────────────────────────────── */

const INITIAL_NOTIFICATIONS: StartupNotification[] = [
  {
    id: "n-01",
    type: "CONSULTING",
    title: "Advisor đã chấp nhận yêu cầu tư vấn",
    message: "Nguyễn Thanh Hà đã chấp nhận yêu cầu tư vấn về Go-to-market strategy. Hãy xác nhận khung giờ phù hợp.",
    isRead: false,
    createdAt: "2026-03-23T08:15:00Z",
    targetUrl: "/startup/mentorship-requests/req-001",
    priority: "HIGH",
    actorName: "Nguyễn Thanh Hà",
  },
  {
    id: "n-02",
    type: "INVESTOR_INTERACTION",
    title: "Nhà đầu tư mới quan tâm đến startup của bạn",
    message: "Mekong Capital đã xem hồ sơ startup và đánh dấu quan tâm. Hãy chuẩn bị pitch deck để phản hồi.",
    isRead: false,
    createdAt: "2026-03-23T07:40:00Z",
    targetUrl: "/startup/investors",
    priority: "HIGH",
    actorName: "Mekong Capital",
  },
  {
    id: "n-03",
    type: "VERIFICATION",
    title: "Hồ sơ KYC yêu cầu bổ sung thông tin",
    message: "Đội ngũ xác minh yêu cầu bổ sung giấy tờ đăng ký kinh doanh. Vui lòng cập nhật trước 25/03/2026.",
    isRead: false,
    createdAt: "2026-03-22T14:20:00Z",
    targetUrl: "/startup/startup-profile/kyc",
    priority: "HIGH",
  },
  {
    id: "n-04",
    type: "AI_EVALUATION",
    title: "Kết quả đánh giá AI đã sẵn sàng",
    message: "Báo cáo đánh giá tiềm năng startup của bạn đã hoàn tất. Điểm tổng hợp: 78/100.",
    isRead: false,
    createdAt: "2026-03-22T11:00:00Z",
    targetUrl: "/startup/ai-evaluation/score",
    priority: "NORMAL",
  },
  {
    id: "n-05",
    type: "DOCUMENT",
    title: "Xác minh blockchain thành công",
    message: "Tài liệu \"Pitch Deck Q1 2026\" đã được xác minh và ghi nhận lên blockchain thành công.",
    isRead: false,
    createdAt: "2026-03-22T09:45:00Z",
    targetUrl: "/startup/documents",
    priority: "NORMAL",
  },
  {
    id: "n-06",
    type: "MESSAGE",
    title: "Tin nhắn mới từ Trần Minh Khoa",
    message: "Trần Minh Khoa vừa gửi tin nhắn trong cuộc hội thoại về cơ hội đầu tư Series A.",
    isRead: true,
    createdAt: "2026-03-21T10:30:00Z",
    targetUrl: "/startup/messaging",
    priority: "NORMAL",
    actorName: "Trần Minh Khoa",
  },
  {
    id: "n-07",
    type: "CONSULTING",
    title: "Nhắc nhở gửi đánh giá buổi tư vấn",
    message: "Buổi tư vấn với Lê Văn Phúc đã hoàn thành 2 ngày trước. Hãy chia sẻ đánh giá để giúp cộng đồng.",
    isRead: true,
    createdAt: "2026-03-21T09:00:00Z",
    targetUrl: "/startup/mentorship-requests",
    priority: "LOW",
    actorName: "Lê Văn Phúc",
  },
  {
    id: "n-08",
    type: "VERIFICATION",
    title: "Hồ sơ KYC đã được duyệt",
    message: "Chúc mừng! Hồ sơ xác minh danh tính của startup đã được phê duyệt. Hồ sơ của bạn sẽ hiển thị đầy đủ với nhà đầu tư.",
    isRead: true,
    createdAt: "2026-03-19T15:10:00Z",
    targetUrl: "/startup/startup-profile/kyc/status",
    priority: "NORMAL",
  },
  {
    id: "n-09",
    type: "AI_EVALUATION",
    title: "Đánh giá AI đang xử lý",
    message: "Hệ thống đang phân tích hồ sơ startup. Kết quả dự kiến trong vòng 24 giờ.",
    isRead: true,
    createdAt: "2026-03-19T08:00:00Z",
    targetUrl: "/startup/ai-evaluation",
    priority: "LOW",
  },
  {
    id: "n-10",
    type: "INVESTOR_INTERACTION",
    title: "Nhận được đề xuất đầu tư mới",
    message: "Vietnam Ventures vừa gửi đề xuất đầu tư $200,000 seed round. Xem chi tiết và phản hồi trước 30/03.",
    isRead: true,
    createdAt: "2026-03-18T13:25:00Z",
    targetUrl: "/startup/investors",
    priority: "HIGH",
    actorName: "Vietnam Ventures",
  },
  {
    id: "n-11",
    type: "DOCUMENT",
    title: "Tài liệu đang chờ xác minh",
    message: "\"Business Plan 2026\" đã được tải lên thành công và đang trong hàng chờ xác minh blockchain.",
    isRead: true,
    createdAt: "2026-03-17T11:00:00Z",
    targetUrl: "/startup/documents",
    priority: "LOW",
  },
  {
    id: "n-12",
    type: "SYSTEM",
    title: "Chào mừng đến với AISEP",
    message: "Tài khoản startup của bạn đã được kích hoạt. Hãy hoàn thiện hồ sơ để tăng khả năng tiếp cận nhà đầu tư.",
    isRead: true,
    createdAt: "2026-03-15T09:00:00Z",
    targetUrl: "/startup/startup-profile",
    priority: "LOW",
  },
];

/* ─── Constants ──────────────────────────────────────────────── */

type FilterKey = "all" | "unread" | NotificationType;

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "CONSULTING", label: "Tư vấn" },
  { key: "INVESTOR_INTERACTION", label: "Nhà đầu tư" },
  { key: "VERIFICATION", label: "Xác minh" },
  { key: "AI_EVALUATION", label: "AI Evaluation" },
  { key: "DOCUMENT", label: "Tài liệu & IP" },
  { key: "MESSAGE", label: "Tin nhắn" },
  { key: "SYSTEM", label: "Hệ thống" },
];

const TYPE_CFG: Record<NotificationType, {
  icon: React.ElementType;
  bg: string;
  iconColor: string;
  label: string;
  accent: string;
}> = {
  SYSTEM:               { icon: Bell,          bg: "bg-slate-100",  iconColor: "text-slate-500",   label: "Hệ thống",    accent: "bg-slate-400" },
  VERIFICATION:         { icon: ShieldCheck,   bg: "bg-blue-50",    iconColor: "text-blue-500",    label: "Xác minh",    accent: "bg-blue-400" },
  DOCUMENT:             { icon: FileText,      bg: "bg-violet-50",  iconColor: "text-violet-500",  label: "Tài liệu",    accent: "bg-violet-400" },
  AI_EVALUATION:        { icon: Brain,         bg: "bg-amber-50",   iconColor: "text-amber-500",   label: "AI",          accent: "bg-amber-400" },
  CONSULTING:           { icon: Users,         bg: "bg-emerald-50", iconColor: "text-emerald-600", label: "Tư vấn",      accent: "bg-emerald-500" },
  INVESTOR_INTERACTION: { icon: ShieldAlert,   bg: "bg-rose-50",    iconColor: "text-rose-500",    label: "Nhà đầu tư",  accent: "bg-rose-400" },
  MESSAGE:              { icon: MessageSquare, bg: "bg-cyan-50",    iconColor: "text-cyan-500",    label: "Tin nhắn",    accent: "bg-cyan-400" },
};

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

function getDateGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays <= 7) return "7 ngày qua";
  return "Trước đó";
}

const GROUP_ORDER = ["Hôm nay", "Hôm qua", "7 ngày qua", "Trước đó"];

/* ─── Notification Item ──────────────────────────────────────── */

function NotificationItem({
  item,
  onToggleRead,
}: {
  item: StartupNotification;
  onToggleRead: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = TYPE_CFG[item.type];
  const Icon = cfg.icon;

  const inner = (
    <div className={cn(
      "group relative flex items-start gap-4 px-5 py-4 transition-all cursor-pointer",
      !item.isRead
        ? "bg-gradient-to-r from-blue-50/60 to-transparent hover:from-blue-50/80"
        : "hover:bg-slate-50/70"
    )}>
      {/* Unread left accent bar */}
      {!item.isRead && (
        <div className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full", cfg.accent)} />
      )}

      {/* Category icon */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm",
        cfg.bg
      )}>
        <Icon className={cn("w-4.5 h-4.5", cfg.iconColor)} style={{ width: 18, height: 18 }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <p className={cn(
            "text-[13px] leading-snug flex-1",
            item.isRead ? "font-normal text-slate-700" : "font-semibold text-slate-900"
          )}>
            {item.title}
          </p>
          <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
            {relativeTime(item.createdAt)}
          </span>
        </div>

        {/* Message */}
        <p className="text-[12px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
          {item.message}
        </p>

        {/* Footer tags */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={cn(
            "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md",
            cfg.bg, cfg.iconColor
          )}>
            <Icon style={{ width: 10, height: 10 }} />
            {cfg.label}
          </span>

          {item.priority === "HIGH" && (
            <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-500">
              Cần xử lý
            </span>
          )}

          {item.actorName && (
            <span className="text-[11px] text-slate-400">từ {item.actorName}</span>
          )}
        </div>
      </div>

      {/* Arrow + menu */}
      <div className="flex items-center gap-1 flex-shrink-0 self-center">
        {/* Menu button */}
        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(o => !o); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/60 transition-colors text-slate-400 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-slate-200 shadow-lg py-1 min-w-[170px]">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleRead(item.id); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {item.isRead
                    ? <><Mail className="w-3.5 h-3.5 text-slate-400" /> Đánh dấu chưa đọc</>
                    : <><MailOpen className="w-3.5 h-3.5 text-slate-400" /> Đánh dấu đã đọc</>
                  }
                </button>
              </div>
            </>
          )}
        </div>

        {/* Arrow (only for linked items) */}
        {item.targetUrl && (
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100" />
        )}
      </div>
    </div>
  );

  if (item.targetUrl) {
    return (
      <Link
        href={item.targetUrl}
        onClick={() => { if (!item.isRead) onToggleRead(item.id); }}
        className="block"
      >
        {inner}
      </Link>
    );
  }
  return <div>{inner}</div>;
}

/* ─── Main Page ──────────────────────────────────────────────── */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<StartupNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  /* Group by date */
  const grouped = useMemo(() => {
    const map: Record<string, StartupNotification[]> = {};
    for (const item of filtered) {
      const g = getDateGroup(item.createdAt);
      if (!map[g]) map[g] = [];
      map[g].push(item);
    }
    return GROUP_ORDER.filter(g => map[g]?.length).map(g => ({ label: g, items: map[g] }));
  }, [filtered]);

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const tabCounts: Partial<Record<FilterKey, number>> = useMemo(() => ({
    unread: unreadCount,
    CONSULTING: notifications.filter(n => n.type === "CONSULTING" && !n.isRead).length || undefined,
    INVESTOR_INTERACTION: notifications.filter(n => n.type === "INVESTOR_INTERACTION" && !n.isRead).length || undefined,
    VERIFICATION: notifications.filter(n => n.type === "VERIFICATION" && !n.isRead).length || undefined,
    AI_EVALUATION: notifications.filter(n => n.type === "AI_EVALUATION" && !n.isRead).length || undefined,
    DOCUMENT: notifications.filter(n => n.type === "DOCUMENT" && !n.isRead).length || undefined,
    MESSAGE: notifications.filter(n => n.type === "MESSAGE" && !n.isRead).length || undefined,
  }), [notifications, unreadCount]);

  return (
    <StartupShell>
      <div className="max-w-[760px] mx-auto space-y-5 pb-12 animate-in fade-in duration-400">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900">Thông báo</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Cập nhật về xác minh, tài liệu, AI, tư vấn và nhà đầu tư.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 pt-1">
            {unreadCount > 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  {unreadCount} chưa đọc
                </span>
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f172a] text-white text-[12px] font-semibold hover:bg-[#1e293b] transition-colors shadow-sm"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Đánh dấu tất cả đã đọc
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium">
                <CheckCheck className="w-3.5 h-3.5" />
                Đã đọc tất cả
              </span>
            )}
          </div>
        </div>

        {/* ── Filter tabs — scrollable, no ugly scrollbar ── */}
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-0.5 border-b border-slate-100 min-w-max">
            {FILTER_TABS.map(tab => {
              const count = tabCounts[tab.key];
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    "px-3.5 py-2.5 text-[12px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex items-center gap-1.5",
                    isActive
                      ? "border-[#0f172a] text-[#0f172a]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  {tab.label}
                  {count != null && count > 0 && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                      isActive ? "bg-[#0f172a] text-white" : "bg-red-100 text-red-600"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notification list ── */}
        {grouped.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                {activeFilter === "unread"
                  ? <CheckCheck className="w-6 h-6 text-slate-300" />
                  : <Inbox className="w-6 h-6 text-slate-300" />
                }
              </div>
              <p className="text-[14px] font-semibold text-slate-500">
                {activeFilter === "unread" ? "Không có thông báo chưa đọc" : "Không có thông báo nào"}
              </p>
              <p className="text-[13px] text-slate-400 text-center max-w-[280px]">
                {activeFilter === "unread"
                  ? "Tất cả thông báo đã được đọc rồi."
                  : "Khi có cập nhật mới, chúng sẽ xuất hiện ở đây."}
              </p>
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="inline-flex items-center gap-1.5 mt-1 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Xem tất cả thông báo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(({ label, items }) => (
              <div key={label}>
                {/* Date group header */}
                <div className="flex items-center gap-3 mb-2 px-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[11px] text-slate-300">{items.length}</span>
                </div>

                {/* Cards in group */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-slate-100">
                  {items.map(item => (
                    <NotificationItem
                      key={item.id}
                      item={item}
                      onToggleRead={handleToggleRead}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {grouped.length > 0 && (
          <p className="text-center text-[12px] text-slate-400">
            {filtered.length} thông báo
            {activeFilter === "all" && unreadCount > 0 && (
              <> · <span className="text-blue-500 font-medium">{unreadCount} chưa đọc</span></>
            )}
          </p>
        )}

      </div>
    </StartupShell>
  );
}
