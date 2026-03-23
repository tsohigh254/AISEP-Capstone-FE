"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, User, Key, LogOut, Check, Trash2, Loader2, MessageSquare, LayoutGrid, CheckCheck, Building2, Settings, Star, Link2, Lightbulb, BarChart3 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Logout } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";
import { GetInvestorProfile } from "@/services/investor/investor.api";
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

  const [profileName, setProfileName] = useState<string | null>(null);
  const displayUserName = profileName || user?.email || userName;

  useEffect(() => {
    GetInvestorProfile().then((res: any) => {
      if (res?.isSuccess && res.data?.fullName) setProfileName(res.data.fullName);
    }).catch(() => {});
  }, []);

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
      await Logout();
    } catch {
      // 401 is expected if token is already expired
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
          <Link href="/investor" className="flex items-center gap-4 cursor-pointer group">
            <svg className="h-9 w-auto flex-shrink-0 group-hover:scale-110 transition-all duration-300" viewBox="425 214 196 142" xmlns="http://www.w3.org/2000/svg">
              <path fill="#F0A500" d="M528.294495,272.249176 C532.020630,271.159119 532.906860,268.448914 533.867676,265.449799 C535.802979,259.408997 541.379211,257.171539 546.497681,260.041779 C550.585571,262.334106 552.357971,267.148407 550.587708,271.151367 C548.773071,275.254730 543.780762,277.647247 539.242615,275.743347 C536.010803,274.387482 533.506592,275.034882 530.762512,276.396454 C523.005981,280.244965 515.210388,284.016083 507.488556,287.932800 C502.019379,290.706940 501.513702,296.870636 506.287506,300.729858 C509.783264,303.555939 513.722229,306.026459 516.581177,309.402679 C520.923767,314.531036 526.257446,314.049774 531.826904,313.505585 C533.454651,313.346497 534.374390,312.046173 535.337097,310.893738 C540.672119,304.507141 545.981750,298.099060 551.356201,291.745850 C553.119690,289.661285 554.246826,287.661224 554.063293,284.619507 C553.826965,280.703217 556.001953,277.910767 560.278870,277.694733 C562.666382,277.574158 564.243286,276.526672 565.735168,274.744263 C573.427490,265.553467 581.183960,256.415497 588.999390,247.329056 C592.103577,243.720093 594.713379,240.418274 593.101196,234.905457 C591.775574,230.372589 595.638428,225.800690 600.427612,224.596893 C605.320007,223.367142 609.245056,225.388168 611.269287,230.179382 C613.287842,234.957123 612.057007,241.198624 607.538025,242.087143 C595.447632,244.464279 590.773621,254.854019 583.510254,262.429077 C579.369141,266.747894 575.688293,271.511810 571.857544,276.122955 C569.632141,278.801758 567.404724,281.400757 567.140686,285.242615 C566.884766,288.966919 564.198486,290.772247 560.689026,290.993469 C557.865601,291.171387 556.195801,292.703003 554.578247,294.743011 C549.717407,300.872986 544.878723,307.029785 539.761292,312.942322 C537.741516,315.275970 536.957275,317.553314 537.063660,320.597931 C537.279541,326.775635 533.929199,330.804657 528.772766,331.151398 C523.616699,331.498169 520.158875,327.921295 519.794556,321.519257 C519.670044,319.330994 518.966125,317.806732 517.260193,316.428253 C513.635254,313.499084 510.235413,310.292053 506.623810,307.345398 C498.266754,300.527069 488.275360,301.030212 480.194489,308.408295 C472.572571,315.367340 464.686829,322.029694 457.324036,329.284302 C454.762329,331.808350 452.520905,333.758636 452.866730,338.019165 C453.251434,342.758057 449.313629,347.054596 445.018860,347.674835 C440.488342,348.329102 436.775269,346.896118 434.670868,342.521942 C432.654419,338.330566 433.628967,333.653137 436.915192,330.655640 C438.806000,328.930969 441.084839,328.250519 443.386108,328.722900 C448.079803,329.686401 451.392944,327.471985 454.536804,324.587189 C463.490356,316.371460 472.410217,308.118805 481.394043,299.936371 C483.022247,298.453491 483.464447,296.861664 483.419586,294.654510 C483.227997,285.232941 489.474670,280.941742 498.180878,284.476746 C500.202820,285.297760 501.850006,285.453094 503.832733,284.444336 C511.842072,280.369507 519.916626,276.422913 528.294495,272.249176 z"/>
            </svg>
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-[#171611] text-[22px] font-black tracking-tighter font-manrope">AISEP</h2>
              <span className="text-[#878164] text-xl font-medium font-manrope">Investor</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/investor"
              className={cn(
                "text-sm font-black tracking-tight relative group/nav transition-colors",
                pathname === "/investor" ? "text-[#171611]" : "text-[#878164] hover:text-[#171611]"
              )}
            >
              Workspace
              {pathname === "/investor" && (
                <div className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full"></div>
              )}
            </Link>

            {pathname === "/investor/profile" && (
              <Link
                href="/investor/profile"
                className="text-sm font-black tracking-tight relative text-[#171611]"
              >
                Hồ sơ
                <div className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full"></div>
              </Link>
            )}

            {pathname === "/investor/settings" && (
              <Link
                href="/investor/settings"
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
            <Link href="/investor/messaging" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative">
              <MessageSquare className="w-5 h-5" />
            </Link>

            <div className="relative" ref={notiRef}>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative"
                onClick={handleToggleNoti}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {isNotiOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-neutral-surface z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-surface bg-[#f8f8f6]">
                    <h3 className="font-bold text-[#171611] text-sm uppercase tracking-widest">Thông báo</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-black">
                      <CheckCheck className="w-4 h-4" /> Đọc tất cả
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
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/investor/notifications" onClick={() => setIsNotiOpen(false)}>
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
                  "w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative",
                  isGridOpen && "bg-[#e6cc4c]/10 text-[#e6cc4c]"
                )}
                onClick={() => setIsGridOpen(!isGridOpen)}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>

              {isGridOpen && (
                <div className="absolute right-0 top-full pt-2 z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="w-52 bg-white rounded-xl shadow-lg shadow-black/8 border border-neutral-surface/60 py-1.5">
                    {[
                      { icon: Building2, label: "Khám phá Startup", href: "/investor/startups" },
                      { icon: Star, label: "Watchlist", href: "/investor/watchlist" },
                      { icon: Lightbulb, label: "AI Recommendations", href: "/investor/recommendations" },
                      { icon: BarChart3, label: "AI Investment Trends", href: "/investor/analytics" },
                      { icon: Link2, label: "Connections", href: "/investor/offers" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3.5 py-2 mx-1.5 rounded-lg text-[#171611]/70 hover:text-[#171611] hover:bg-[#f4f4f0] active:bg-[#e6cc4c]/15 transition-colors group/grid"
                        onClick={() => setIsGridOpen(false)}
                      >
                        <item.icon className="w-4 h-4 shrink-0 opacity-60 group-hover/grid:opacity-100 transition-opacity" />
                        <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-100 mx-1" />

          {/* User Profile Card */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <div className="text-right flex flex-col items-end justify-center">
              <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{displayUserName}</p>
              <div className="px-1.5 py-0.5 bg-[#fdf8e6] rounded-md border border-[#e6cc4c]/30">
                <p className="text-[9px] text-[#878164] font-black uppercase tracking-wider leading-none">TÀI KHOẢN PRO</p>
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
                  { icon: User, label: "Hồ sơ của tôi", href: "/investor/profile" },
                  { icon: Settings, label: "Cài đặt", href: "/investor/settings" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#f4f4f0]/60 transition-colors group/item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <link.icon className="w-5 h-5 text-[#171611] opacity-70 group-hover/item:opacity-100 transition-opacity" />
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
                  <LogOut className="w-5 h-5 text-[#ef4444] opacity-80 group-hover/item:opacity-100 transition-opacity" />
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
