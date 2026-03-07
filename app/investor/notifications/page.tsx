"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GetNotifications,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
  DeleteNotification,
} from "@/services/notification/notification.api";
import { cn } from "@/lib/utils";

export default function InvestorNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState<IPaging | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const pageSize = 20;

  const fetchNotifications = useCallback(async (p: number, unreadOnly: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await GetNotifications({
        page: p,
        pageSize,
        unreadOnly: unreadOnly || undefined,
      }) as unknown as IBackendRes<IPaginatedRes<INotificationItem>>;
      if (res.success && res.data) {
        setNotifications(res.data.items);
        setPaging(res.data.paging);
      } else {
        setError(res.message || "Không thể tải thông báo.");
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(page, filter === "unread");
  }, [page, filter, fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await MarkNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await MarkAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: number) => {
    try {
      await DeleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    } catch { /* silent */ }
  };

  const handleClick = (item: INotificationItem) => {
    if (!item.isRead) handleMarkAsRead(item.notificationId);
    if (item.actionUrl) router.push(item.actionUrl);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <InvestorShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Thông báo</h1>
            <p className="text-slate-600 mt-1">Quản lý tất cả thông báo của bạn</p>
          </div>
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Check className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter("all"); setPage(1); }}
            className={filter === "all" ? "bg-blue-600 text-white" : "border-slate-300 text-slate-700"}
          >
            Tất cả
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter("unread"); setPage(1); }}
            className={filter === "unread" ? "bg-blue-600 text-white" : "border-slate-300 text-slate-700"}
          >
            Chưa đọc
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={() => fetchNotifications(page, filter === "unread")} className="ml-2 underline hover:no-underline">
              Thử lại
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải thông báo...
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">Không có thông báo nào</p>
              <p className="text-slate-400 text-sm mt-1">
                {filter === "unread" ? "Bạn đã đọc tất cả thông báo." : "Chưa có thông báo mới."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-slate-100">
              {notifications.map((item) => (
                <div
                  key={item.notificationId}
                  className={cn(
                    "flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group",
                    !item.isRead && "bg-blue-50/40"
                  )}
                >
                  {/* Unread dot */}
                  <div className="pt-1.5 w-3 flex-shrink-0">
                    {!item.isRead && <span className="block w-2.5 h-2.5 rounded-full bg-blue-500" />}
                  </div>

                  {/* Content — clickable */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleClick(item)}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={cn("text-sm", !item.isRead ? "font-semibold text-slate-900" : "text-slate-700")}>
                        {item.title}
                      </p>
                      {item.notificationType && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-300 text-slate-500">
                          {item.notificationType}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{item.messagePreview}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.notificationId)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.notificationId)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {paging && paging.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-slate-300"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Trước
            </Button>
            <span className="text-sm text-slate-600">
              Trang {paging.page} / {paging.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= paging.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-300"
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </InvestorShell>
  );
}
