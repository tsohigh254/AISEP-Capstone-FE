"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Bell, CheckCheck, Trash2, Loader2,
  Check, Eye, Clock, ChevronLeft, ChevronRight,
  ShieldCheck, Brain, Star, AlertTriangle,
  Zap, MessageSquare, UserCircle, RefreshCcw,
  Inbox, Mail, MailOpen, MoreHorizontal, ArrowRight
} from "lucide-react";
import { 
  GetNotifications, 
  MarkNotificationAsRead, 
  MarkAllNotificationsAsRead, 
  DeleteNotification 
} from "@/services/notification/notification.api";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import Link from "next/link";

/* ─── Helper: Get Icon by Type ─────────────────────────────── */
const getNotificationIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "VERIFICATION": return <ShieldCheck className="w-4 h-4 text-[#eec54e]" />;
    case "SYSTEM": return <Zap className="w-4 h-4 text-blue-500" />;
    case "AI_EVALUATION": return <Brain className="w-4 h-4 text-purple-500" />;
    case "CONSULTING": return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    case "INVESTOR_INTERACTION": return <Star className="w-4 h-4 text-rose-500" />;
    case "MESSAGE": return <MessageSquare className="w-4 h-4 text-blue-500" />;
    default: return <Bell className="w-4 h-4 text-slate-400" />;
  }
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

export default function StartupNotificationsPage() {
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const res = await GetNotifications({
        page: pageNum,
        pageSize: 15,
        unreadOnly: activeFilter === "unread" ? true : undefined,
        type: (activeFilter !== "all" && activeFilter !== "unread") ? activeFilter : undefined
      }) as unknown as IBackendRes<IPaginatedRes<INotificationItem>>;

      if ((res.isSuccess || res.success) && res.data) {
        const items = res.data.items || [];
        setNotifications(prev => pageNum === 1 ? items : [...prev, ...items]);
        setHasMore((res.data.paging?.totalItems || 0) > pageNum * 15);
        if (isInitial) {
           // unread count usually comes from sub-query or different API, 
           // for now we trust the header/bell or just focus on the list.
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Không thể tải thông báo.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilter]);

  // Handle Real-time notifications
  useNotifications((newNotif) => {
    if (page === 1) {
      setNotifications(prev => {
        if (prev.some(n => n.notificationId === newNotif.notificationId)) return prev;
        return [newNotif, ...prev];
      });
    }
  });

  useEffect(() => {
    setPage(1);
    fetchNotifications(1, true);
  }, [activeFilter, fetchNotifications]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  const handleToggleRead = async (id: number, currentStatus: boolean) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.notificationId === id ? { ...n, isRead: !currentStatus } : n
      ));
      await MarkNotificationAsRead(id, !currentStatus);
    } catch (error) {
      setNotifications(prev => prev.map(n => 
        n.notificationId === id ? { ...n, isRead: currentStatus } : n
      ));
      toast.error("Thao tác thất bại.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await MarkAllNotificationsAsRead();
      toast.success("Đã đánh dấu tất cả là đã đọc.");
    } catch (error) {
      toast.error("Thao tác thất bại.");
      fetchNotifications(1, true);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
      await DeleteNotification(id);
    } catch (error) {
      toast.error("Không thể xóa thông báo.");
      fetchNotifications(1, true);
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, INotificationItem[]> = {};
    for (const item of notifications) {
      const g = getDateGroup(item.createdAt);
      if (!map[g]) map[g] = [];
      map[g].push(item);
    }
    return GROUP_ORDER.filter(g => map[g]?.length).map(g => ({ label: g, items: map[g] }));
  }, [notifications]);

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
            <button 
              onClick={() => fetchNotifications(1, true)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Làm mới"
            >
              <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            <button
              onClick={handleMarkAllRead}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f172a] text-white text-[12px] font-semibold hover:bg-[#1e293b] transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-1 border-b border-slate-100">
          {[
            { key: "all", label: "Tất cả" },
            { key: "unread", label: "Chưa đọc" },
            { key: "VERIFICATION", label: "Xác minh" },
            { key: "CONSULTING", label: "Tư vấn" },
            { key: "AI_EVALUATION", label: "AI" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "px-4 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-colors",
                activeFilter === tab.key
                  ? "border-[#0f172a] text-[#0f172a]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Notification list ── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#eec54e] animate-spin" />
            <p className="text-[13px] font-medium text-slate-400">Đang tải thông báo thực tế...</p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                <Inbox className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-[14px] font-semibold text-slate-500">
                Không có thông báo nào
              </p>
              <p className="text-[13px] text-slate-400 text-center max-w-[280px]">
                Khi có cập nhật mới, chúng sẽ xuất hiện ở đây.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ label, items }) => (
              <div key={label}>
                <div className="flex items-center gap-3 mb-3 px-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
                  {items.map(item => (
                    <div 
                      key={item.notificationId}
                      className={cn(
                        "group relative flex items-start gap-4 px-5 py-4 transition-all cursor-pointer",
                        !item.isRead ? "bg-blue-50/30 hover:bg-blue-50/50" : "hover:bg-slate-50/80"
                      )}
                      onClick={() => {
                        if (item.actionUrl) window.location.href = item.actionUrl;
                        if (!item.isRead) handleToggleRead(item.notificationId, false);
                      }}
                    >
                      {!item.isRead && (
                        <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-blue-500 rounded-r-full" />
                      )}
                      
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-100 shadow-sm">
                        {getNotificationIcon(item.notificationType)}
                      </div>

                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            "text-[14px] leading-snug",
                            item.isRead ? "text-slate-600" : "font-bold text-slate-900"
                          )}>
                            {item.title}
                          </p>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap ml-4">
                            {relativeTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-500 line-clamp-2">
                          {item.messagePreview}
                        </p>
                      </div>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                         <button
                           onClick={(e) => { e.stopPropagation(); handleDelete(item.notificationId); }}
                           className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                           title="Xóa"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                         <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 rounded-full border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tải thêm thông báo"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </StartupShell>
  );
}
