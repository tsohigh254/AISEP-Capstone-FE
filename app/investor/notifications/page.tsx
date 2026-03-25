"use client";

import { useState, useEffect, useCallback } from "react";
import { InvestorShell } from "@/components/investor/investor-shell";
import { cn } from "@/lib/utils";
import {
  Bell, CheckCheck, Trash2, Search,
  Filter, MoreVertical, Check, Eye, Clock,
  ChevronLeft, ChevronRight, AlertCircle,
  MessageSquare, UserCircle, ShieldCheck, Brain, Star
} from "lucide-react";
import { 
  GetNotifications, 
  MarkNotificationAsRead, 
  MarkAllNotificationsAsRead, 
  DeleteNotification 
} from "@/services/notification/notification.api";
import { Loader2 } from "lucide-react";
import { NotificationDetailModal } from "@/components/investor/notification-detail-modal";

/* ─── Helper: Get Icon by Type ─────────────────────────────── */
const getNotificationIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "connection": return <UserCircle className="w-4 h-4 text-blue-500" />;
    case "message": return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    case "kyc": return <ShieldCheck className="w-4 h-4 text-orange-500" />;
    case "matching": return <Brain className="w-4 h-4 text-purple-500" />;
    case "recommendation": return <Star className="w-4 h-4 text-yellow-500" />;
    default: return <Bell className="w-4 h-4 text-slate-400" />;
  }
};

export default function InvestorNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Notification Detail Modal State
  const [selectedNotiId, setSelectedNotiId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetNotifications({
        unreadOnly: activeTab === "unread" ? true : undefined,
        page,
        pageSize
      });
      if (res.data) {
        setNotifications(res.data.items || []);
        setTotalItems(res.data.paging?.totalItems || 0);
        setTotalPages(res.data.paging?.totalPages || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotiClick = (item: any) => {
    setSelectedNotiId(item.notificationId);
    setIsDetailModalOpen(true);
    if (!item.isRead) {
      handleMarkAsRead(item.notificationId, false);
    }
  };

  const handleMarkAsRead = async (id: number, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        await MarkNotificationAsRead(id, true);
        setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
      } else {
        await MarkNotificationAsRead(id, false);
        setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: false } : n));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await MarkAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await DeleteNotification(id);
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
      setTotalItems(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[26px] font-black tracking-tight text-[#171611]">Thông báo</h1>
            <p className="text-sm text-neutral-muted font-medium mt-1">Cập nhật những hoạt động mới nhất từ hệ sinh thái.</p>
          </div>
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-surface rounded-xl text-[13px] font-black text-[#171611] hover:bg-[#e6cc4c]/10 hover:border-[#e6cc4c]/30 hover:text-[#e6cc4c] transition-all shadow-sm group"
          >
            <CheckCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white rounded-2xl border border-neutral-surface shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between border-b border-neutral-surface px-2">
            <div className="flex">
              <button
                onClick={() => { setActiveTab("all"); setPage(1); }}
                className={cn(
                  "px-6 py-4 text-[13px] font-black transition-all relative",
                  activeTab === "all" ? "text-[#171611]" : "text-neutral-muted hover:text-[#171611]"
                )}
              >
                Tất cả
                {activeTab === "all" && <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-[#e6cc4c] rounded-full"></div>}
              </button>
              <button
                onClick={() => { setActiveTab("unread"); setPage(1); }}
                className={cn(
                  "px-6 py-4 text-[13px] font-black transition-all relative",
                  activeTab === "unread" ? "text-[#171611]" : "text-neutral-muted hover:text-[#171611]"
                )}
              >
                Chưa đọc
                {activeTab === "unread" && <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-[#e6cc4c] rounded-full"></div>}
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 opacity-50">
              <span className="text-[11px] font-black uppercase tracking-widest text-neutral-muted">Tổng: {totalItems}</span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-neutral-surface">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#e6cc4c]" />
                <p className="text-[13px] font-bold text-neutral-muted tracking-wide animate-pulse uppercase font-be-vietnam-pro">Đang tải thông báo...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-[#f8f8f6] flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-neutral-muted opacity-30" />
                </div>
                <h3 className="text-base font-black text-[#171611] tracking-tight font-be-vietnam-pro">Không có thông báo nào</h3>
                <p className="text-[13px] text-neutral-muted mt-2 max-w-xs mx-auto font-be-vietnam-pro">Chúng tôi sẽ thông báo cho bạn khi có các hoạt động mới diễn ra.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div 
                  key={item.notificationId}
                  className={cn(
                    "group flex items-start gap-4 p-5 transition-all hover:bg-[#fbfbf9] cursor-pointer relative overflow-hidden",
                    !item.isRead ? "bg-white" : "bg-neutral-50/50"
                  )}
                  onClick={() => handleNotiClick(item)}
                >
                  {!item.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#e6cc4c]"></div>
                  )}
                  
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                    !item.isRead ? "bg-[#e6cc4c]/10 text-[#e6cc4c] shadow-sm" : "bg-slate-100 text-slate-400 opacity-60"
                  )}>
                    {getNotificationIcon(item.type || item.notificationType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className={cn(
                        "text-[15px] font-be-vietnam-pro",
                        !item.isRead ? "font-bold text-[#171611]" : "font-semibold text-slate-500"
                      )}>
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-400 font-be-vietnam-pro">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[13px] leading-relaxed font-be-vietnam-pro line-clamp-2",
                      !item.isRead ? "text-slate-700 font-medium" : "text-slate-500"
                    )}>
                      {item.messagePreview || item.content || item.message}
                    </p>
                    <div className="flex items-center gap-3 mt-3.5">
                      {!item.isRead ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item.notificationId, false); }}
                          className="text-[11px] font-bold text-[#e6cc4c] hover:underline uppercase tracking-wide font-be-vietnam-pro"
                        >
                          Đánh dấu đã đọc
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item.notificationId, true); }}
                          className="text-[11px] font-bold text-slate-400 hover:underline uppercase tracking-wide font-be-vietnam-pro"
                        >
                          Đánh dấu chưa đọc
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.notificationId); }}
                        className="text-[11px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-be-vietnam-pro"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-5 border-t border-neutral-surface flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-surface hover:bg-[#f8f8f6] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[300px] no-scrollbar">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-[13px] font-black transition-all",
                      page === i + 1 
                        ? "bg-[#171611] text-white shadow-md shadow-[#171611]/10" 
                        : "text-neutral-muted hover:bg-[#f8f8f6] hover:text-[#171611]"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-surface hover:bg-[#f8f8f6] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <NotificationDetailModal
        notificationId={selectedNotiId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onDeleteSuccess={handleDelete}
      />
    </div>
  );
}
