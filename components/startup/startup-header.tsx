"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, User, Key, LogOut, Check, Trash2, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Logout } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";
import {
  GetNotifications,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
  DeleteNotification,
} from "@/services/notification/notification.api";

type StartupHeaderProps = {
  userName?: string;
  userEmail?: string;
  className?: string;
};

export function StartupHeader({
  userName = "TechAlpha Co.",
  userEmail = "a@a.com",
  className,
}: StartupHeaderProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [notiLoading, setNotiLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setUser, setAccessToken, setIsAuthen, user } = useAuth();

  const displayUserName = user?.email || userName;

  const fetchNotifications = useCallback(async () => {
    setNotiLoading(true);
    try {
      const res = await GetNotifications({ pageSize: 10 }) as unknown as IBackendRes<IPaginatedRes<INotificationItem>>;
      if (res.success && res.data) {
        setNotifications(res.data.items);
        setUnreadCount(res.data.items.filter((n) => !n.isRead).length);
      }
    } catch {
      // silent
    } finally {
      setNotiLoading(false);
    }
  }, []);

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
      if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
        setIsGridOpen(false);
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
    <header className={cn("fixed top-0 z-50 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-neutral-surface shadow-sm", className)}>
      <div className="max-w-[1440px] mx-auto w-full h-[64px] flex items-center justify-between px-6">
        {/* Left Section: Logo & Nav */}
        <div className="flex items-center gap-12">
          <Link href="/startup" className="flex items-center gap-4 cursor-pointer group">
            <div className="bg-[#e6cc4c] w-10 h-10 rounded-xl shadow-[0_4px_12px_rgba(230,204,76,0.15)] flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-white text-[28px] font-bold leading-none">rocket_launch</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-[#171611] text-[22px] font-black tracking-tighter font-manrope">AISEP</h2>
              <span className="text-[#878164] text-xl font-medium font-manrope">Startup</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/startup"
              className={cn(
                "text-sm font-black tracking-tight relative group/nav transition-colors",
                pathname === "/startup" ? "text-[#171611]" : "text-[#878164] hover:text-[#171611]"
              )}
            >
              Workspace
              {pathname === "/startup" && (
                <div className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full"></div>
              )}
            </Link>

            {pathname === "/startup/profile" && (
              <Link
                href="/startup/profile"
                className="text-sm font-black tracking-tight relative text-[#171611]"
              >
                Hồ sơ cá nhân
                <div className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full"></div>
              </Link>
            )}

            {pathname === "/startup/settings" && (
              <Link
                href="/startup/settings"
                className="text-sm font-black tracking-tight relative text-[#171611]"
              >
                Cài đặt
                <div className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full"></div>
              </Link>
            )}
          </div>
        </div>

        {/* Right Section: Actions & User Details */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative">
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>

            <div className="relative" ref={notiRef}>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative"
                onClick={handleToggleNoti}
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>

              {isNotiOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-neutral-surface z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-surface bg-[#f8f8f6]">
                    <h3 className="font-bold text-[#171611] text-sm uppercase tracking-widest">Thông báo</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-black">
                      <span className="material-symbols-outlined text-sm">done_all</span> Đọc tất cả
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-neutral-surface">
                    {notiLoading ? (
                      <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#e6cc4c]" /></div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-10 text-sm text-neutral-muted font-bold italic">Không có thông báo</div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.notificationId}
                          className={cn("flex items-start gap-4 px-5 py-4 hover:bg-[#f8f8f6] cursor-pointer group transition-colors", !item.isRead && "bg-blue-50/30 border-l-4 border-blue-500")}
                          onClick={() => handleNotiClick(item)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm truncate font-bold", !item.isRead ? "text-[#171611]" : "text-slate-600")}>{item.title}</p>
                            <p className="text-xs text-neutral-muted mt-1 leading-relaxed line-clamp-2">{item.messagePreview}</p>
                            <p className="text-[10px] font-black text-neutral-muted mt-2 uppercase tracking-widest opacity-60">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteNoti(item.notificationId); }} className="opacity-0 group-hover:opacity-100 text-neutral-muted hover:text-red-500 transition-all p-1">
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/startup/notifications" onClick={() => setIsNotiOpen(false)}>
                    <div className="text-center py-3.5 bg-[#f4f4f0] text-xs font-black text-blue-600 hover:bg-[#e6cc4c]/10 hover:text-blue-800 transition-colors uppercase tracking-widest">Xem tất cả thông báo</div>
                  </Link>
                </div>
              )}
            </div>

            <div
              className="relative"
              ref={gridRef}
              onMouseEnter={() => setIsGridOpen(true)}
              onMouseLeave={() => setIsGridOpen(false)}
            >
              <button
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative",
                  isGridOpen && "bg-[#e6cc4c]/10 text-[#e6cc4c]"
                )}
                onClick={() => setIsGridOpen(!isGridOpen)}
              >
                <span className="material-symbols-outlined text-[22px]">grid_view</span>
              </button>

              {isGridOpen && (
                <div className="absolute right-0 top-full pt-4 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="w-64 bg-white rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-neutral-surface/50 overflow-hidden p-2">
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { icon: "description", label: "Tài liệu & IP", href: "/startup/documents" },
                        { icon: "psychology", label: "Đánh giá AI", href: "/startup/ai-evaluation" },
                        { icon: "groups", label: "Tìm cố vấn", href: "/startup/experts" },
                        { icon: "handshake", label: "Kết nối nhà ĐT", href: "/startup/investors" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-[#f4f4f0]/80 rounded-[18px] transition-all group/grid"
                          onClick={() => setIsGridOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#f8f8f6] flex items-center justify-center group-hover/grid:bg-white group-hover/grid:shadow-sm transition-all">
                            <span className="material-symbols-outlined text-[22px] text-[#171611] group-hover/grid:text-[#e6cc4c] transition-colors">{item.icon}</span>
                          </div>
                          <span className="text-sm font-black text-[#171611] tracking-tight">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1" />

          {/* User Profile Card */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <div className="text-right flex flex-col items-end justify-center">
              <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">Founder Tech</p>
              <div className="px-1.5 py-0.5 bg-[#fdf8e6] dark:bg-[#e6cc4c]/10 rounded-md border border-[#e6cc4c]/30">
                <p className="text-[9px] text-[#878164] font-black uppercase tracking-wider leading-none">PRO ACCOUNT</p>
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-100/50 shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#e6cc4c]/30 transition-all"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                alt="User avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjzC7CoRfCe8M-_znRX9XUAau9pbCP3v7oCfUXQjfnXPYgidsvY_po_j5Fd6kfJPcZsbjS0DZnOdyJNi5XLu7Nkp0gVy4nzXT9rlO66SbMaDnIB6hJrk9g50fi9r_qIybSqzeZgEPgyRxdXku7uuelbI-i63vbQ34qdf3h074GkFdgtkBY6aFESlTBQke6B7Y5No2DIyWID-SgrcBUe7omoOQokhf7HyqmhFOevL66ApDBkAXteq5gjkmiN7HkNs0Ts-EJEuZUJLk"
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-4 w-52 bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-neutral-surface/50 overflow-hidden z-[60] py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                {[
                  { icon: "person", label: "Hồ sơ của tôi", href: "/startup/profile" },
                  { icon: "business", label: "Hồ sơ startup", href: "/startup/startup-profile" },
                  { icon: "settings", label: "Cài đặt tài khoản", href: "/startup/settings" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#f4f4f0]/60 transition-colors group/item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="material-symbols-outlined text-[22px] text-[#171611] opacity-70 group-hover/item:opacity-100 transition-opacity">
                      {link.icon}
                    </span>
                    <span className="text-[13px] font-bold text-[#171611] opacity-80 group-hover/item:opacity-100 transition-opacity">
                      {link.label}
                    </span>
                  </Link>
                ))}
                <div className="h-px bg-neutral-surface/60 my-2 mx-4"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50/50 transition-colors group/item"
                >
                  <span className="material-symbols-outlined text-[22px] text-[#ef4444] opacity-80 group-hover/item:opacity-100 transition-opacity rotate-180">
                    logout
                  </span>
                  <span className="text-[13px] font-bold text-[#ef4444] opacity-80 group-hover/item:opacity-100 transition-opacity text-left">
                    Đăng xuất
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

