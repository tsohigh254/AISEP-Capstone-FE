"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, User, Key, LogOut, Check, Trash2, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logout } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";
import {
  GetNotifications,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
  DeleteNotification,
} from "@/services/notification/notification.api";

type InvestorHeaderProps = {
  userName?: string;
  userEmail?: string;
  className?: string;
};

export function InvestorHeader({
  userName = "Sarah Johnson",
  userEmail = "a@a.com",
  className,
}: InvestorHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [notiLoading, setNotiLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();

  const fetchNotifications = useCallback(async () => {
    setNotiLoading(true);
    try {
      const res = await GetNotifications({ pageSize: 10 }) as unknown as IBackendRes<IPaginatedRes<INotificationItem>>;
      if (res.success && res.data) {
        setNotifications(res.data.items ?? []);
        setUnreadCount((res.data.items ?? []).filter((n) => !n.isRead).length);
      }
    } catch {
      // silent
    } finally {
      setNotiLoading(false);
    }
  }, []);

  // fetch unread count on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNoti = () => {
    const opening = !isNotiOpen;
    setIsNotiOpen(opening);
    if (opening) fetchNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await MarkNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => n.notificationId === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await MarkAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const handleDeleteNoti = async (id: number) => {
    try {
      await DeleteNotification(id);
      setNotifications((prev) => {
        const item = prev.find((n) => n.notificationId === id);
        if (item && !item.isRead) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.notificationId !== id);
      });
    } catch { /* silent */ }
  };

  const handleNotiClick = (item: INotificationItem) => {
    if (!item.isRead) handleMarkAsRead(item.notificationId);
    setIsNotiOpen(false);
    if (item.actionUrl) router.push(item.actionUrl);
  };

  const handleLogout = async () => {
    try {
      const res = await Logout();

      if (!res.success) {
        console.error(res.message || "Logout không thành công");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUser(undefined);
      setAccessToken(undefined);
      setIsAuthen(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      router.push("/auth/login");
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 left-64 right-0 flex items-center justify-between px-8 py-4 bg-white border-b",
        className
      )}
    >
      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notiRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-600 hover:text-slate-900"
            onClick={handleToggleNoti}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          {isNotiOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">Thông báo</h3>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Đọc tất cả
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notiLoading ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400">Không có thông báo</div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.notificationId}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 group",
                        !item.isRead && "bg-blue-50/50"
                      )}
                    >
                      <div className="flex-1 min-w-0" onClick={() => handleNotiClick(item)}>
                        <div className="flex items-center gap-2">
                          {!item.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                          <p className={cn("text-sm truncate", !item.isRead ? "font-semibold text-slate-900" : "text-slate-700")}>
                            {item.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.messagePreview}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNoti(item.notificationId); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <Link href="/investor/notifications" onClick={() => setIsNotiOpen(false)}>
                <div className="text-center py-2.5 border-t border-slate-100 text-xs text-blue-600 hover:text-blue-800 hover:bg-slate-50">
                  Xem tất cả thông báo
                </div>
              </Link>
            </div>
          )}
        </div>

        <span className="text-sm font-medium text-slate-700">Investor</span>

        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-lg"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-slate-400 transition-transform",
              isDropdownOpen && "rotate-180"
            )} />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="font-medium text-slate-900">a</div>
                <div className="text-sm text-slate-500">{userEmail}</div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link href="/investor/profile">
                  <button className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Hồ sơ cá nhân</span>
                  </button>
                </Link>

                <Link href="/investor/settings">
                  <button className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                    <Key className="w-4 h-4" />
                    <span className="text-sm">Đổi mật khẩu</span>
                  </button>
                </Link>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


