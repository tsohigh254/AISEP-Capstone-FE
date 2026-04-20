"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Bell, CheckCheck, Trash2, Loader2,
  Check, Eye, Clock, ChevronLeft, ChevronRight,
  ShieldCheck, Brain, Star, AlertTriangle,
  Zap, MessageSquare, UserCircle, RefreshCcw,
  Inbox
} from "lucide-react";
import { 
  GetNotifications, 
  MarkNotificationAsRead, 
  MarkAllNotificationsAsRead, 
  DeleteNotification 
} from "@/services/notification/notification.api";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { localizeIssueReportNotificationText } from "@/lib/notification";

/* ─── Helper: Get Icon by Type ─────────────────────────────── */
const getNotificationIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "KYC": 
    case "VERIFICATION": return <ShieldCheck className="w-4 h-4 text-[#eec54e]" />;
    case "ALERT": return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    case "SYSTEM": return <Zap className="w-4 h-4 text-blue-500" />;
    case "TASK": return <Brain className="w-4 h-4 text-purple-500" />;
    case "MESSAGE": return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    default: return <Bell className="w-4 h-4 text-slate-400" />;
  }
};

export default function StaffNotificationsPage() {
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const res = await GetNotifications({
        page: pageNum,
        pageSize: 15,
        unreadOnly: activeTab === "unread" ? true : undefined
      }) as unknown as IBackendRes<IPaginatedRes<INotificationItem>>;

      if ((res.isSuccess || res.success) && res.data) {
        const items = res.data.items || [];
        setNotifications(prev => pageNum === 1 ? items : [...prev, ...items]);
        setHasMore((res.data.paging?.totalItems || 0) > pageNum * 15);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Không thể tải thông báo.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  // Real-time integration
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
  }, [activeTab, fetchNotifications]);

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
      if (activeTab === "unread" && !currentStatus === true) {
        setNotifications(prev => prev.filter(n => n.notificationId !== id));
      }
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
      if (activeTab === "unread") setNotifications([]);
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

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-20 px-4 pt-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-black tracking-tight text-[#171611]">Thông báo hệ thống</h1>
          <p className="text-[14px] text-slate-500 font-medium mt-1">Quản lý các thông báo vận hành và yêu cầu từ người dùng.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchNotifications(1, true)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-500"
          >
            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button 
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-[#171611] hover:bg-slate-50 transition-all shadow-sm group cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-[#eec54e]" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 px-2">
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-8 py-4 text-[13px] font-bold transition-all relative cursor-pointer",
                activeTab === "all" ? "text-[#171611]" : "text-slate-400 hover:text-[#171611]"
              )}
            >
              Tất cả
              {activeTab === "all" && <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-[#eec54e] rounded-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "px-8 py-4 text-[13px] font-bold transition-all relative cursor-pointer",
                activeTab === "unread" ? "text-[#171611]" : "text-slate-400 hover:text-[#171611]"
              )}
            >
              Chưa đọc
              {activeTab === "unread" && <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-[#eec54e] rounded-full"></div>}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#eec54e] animate-spin" />
              <p className="text-[13px] font-medium text-slate-400">Đang tải dữ liệu thực tế...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-base font-bold text-[#171611] tracking-tight">Không có thông báo</h3>
              <p className="text-[13px] text-slate-400 mt-2 max-w-xs mx-auto">Tất cả đều ổn! Hiện không có thông báo vận hành nào.</p>
            </div>
          ) : (
            <>
              {notifications.map((item) => (
                <div 
                  key={item.notificationId}
                  className={cn(
                    "group flex items-start gap-4 p-5 transition-all hover:bg-slate-50/50 cursor-pointer relative overflow-hidden",
                    !item.isRead ? "bg-white" : "bg-white/40"
                  )}
                  onClick={() => {
                    if (item.actionUrl) window.location.href = item.actionUrl;
                    if (!item.isRead) handleToggleRead(item.notificationId, false);
                  }}
                >
                  {!item.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#eec54e]"></div>
                  )}
                  
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border border-transparent shadow-sm",
                    !item.isRead ? "bg-white text-[#eec54e] border-slate-100" : "bg-slate-50 text-slate-400 opacity-60"
                  )}>
                    {getNotificationIcon(item.notificationType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className={cn(
                        "text-[15px] tracking-tight",
                        !item.isRead ? "font-bold text-[#171611]" : "font-semibold text-slate-500"
                      )}>
                        {localizeIssueReportNotificationText(item, item.title)}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[13px] leading-relaxed font-medium line-clamp-2",
                      !item.isRead ? "text-slate-600" : "text-slate-400"
                    )}>
                      {localizeIssueReportNotificationText(item, item.messagePreview)}
                    </p>
                    <div className="flex items-center gap-4 mt-3.5">
                      {!item.isRead ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleRead(item.notificationId, false); }}
                          className="text-[11px] font-bold text-[#eec54e] hover:underline uppercase tracking-widest cursor-pointer"
                        >
                          Đánh dấu đã đọc
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleRead(item.notificationId, true); }}
                          className="text-[11px] font-bold text-slate-400 hover:underline uppercase tracking-widest cursor-pointer"
                        >
                          Đánh dấu chưa đọc
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.notificationId); }}
                        className="text-[11px] font-bold text-slate-300 hover:text-rose-500 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="p-4 flex justify-center border-t border-slate-50">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-50 text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                  >
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tải thêm thông báo"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
