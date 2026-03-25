"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Bell, Search, LayoutGrid, User, LogOut, Settings, 
  ChevronRight, CheckCheck, Loader2, Trash2, 
  MessageSquare, Building2, Bookmark, Brain, Handshake, Target, ShieldCheck, UserCircle,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/context";
import { GetInvestorProfile } from "@/services/investor/investor.api";
import { Logout } from "@/services/auth/auth.api";
import { 
  GetNotifications, 
  MarkNotificationAsRead, 
  MarkAllNotificationsAsRead, 
  DeleteNotification 
} from "@/services/notification/notification.api";
import { NotificationDetailModal } from "./notification-detail-modal";
import { IssueReportModal } from "@/components/shared/issue-report-modal";

export function InvestorHeader({ 
  userName = "VinaCapital Ventures",
  title,
  className 
}: { 
  userName?: string; 
  title?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiLoading, setNotiLoading] = useState(false);
  
  const { user, setUser, setAccessToken, setIsAuthen } = useAuth();

  const [profileName, setProfileName] = useState<string | null>(null);
  const displayUserName = profileName || user?.email || userName;

  useEffect(() => {
    GetInvestorProfile().then((res: any) => {
      if (res?.isSuccess && res.data?.fullName) setProfileName(res.data.fullName);
    }).catch(() => {});
  }, []);

  // Notification Detail Modal State
  const [selectedNotiId, setSelectedNotiId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const notiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotis = useCallback(async () => {
    setNotiLoading(true);
    try {
      const res = await GetNotifications({ page: 1, pageSize: 5 });
      if (res.data) {
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.paging?.totalItems || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setNotiLoading(false);
    }
  }, []);

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
    if (!isNotiOpen) {
      fetchNotis();
    }
    setIsNotiOpen(!isNotiOpen);
    setIsProfileOpen(false);
    setIsGridOpen(false);
  };

  const handleNotiClick = (item: INotificationItem) => {
    setSelectedNotiId(item.notificationId);
    setIsDetailModalOpen(true);
    
    if (!item.isRead) {
      handleMarkAsRead(item.notificationId, false);
    }
    setIsNotiOpen(false);
  };

  const handleMarkAsRead = async (id: number, currentStatus: boolean) => {
     try {
       await MarkNotificationAsRead(id, true);
       setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
       setUnreadCount(prev => Math.max(0, prev - 1));
     } catch (error) {
       console.error("Failed to mark notification as read:", error);
     }
  };

  const handleDeleteNoti = async (id: number) => {
    try {
      await DeleteNotification(id);
      setNotifications(prev => prev.filter(n => n.notificationId !== id));
      if (unreadCount > 0) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await MarkAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await Logout();
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
          <Link href="/investor" className="flex items-center gap-4 cursor-pointer group">
            <svg className="h-9 w-auto flex-shrink-0 group-hover:scale-110 transition-all duration-300" viewBox="425 214 196 142" xmlns="http://www.w3.org/2000/svg">
              <path fill="#F0A500" d="M528.294495,272.249176 C532.020630,271.159119 532.906860,268.448914 533.867676,265.449799 C535.802979,259.408997 541.379211,257.171539 546.497681,260.041779 C550.585571,262.334106 552.357971,267.148407 550.587708,271.151367 C548.773071,275.254730 543.780762,277.647247 539.242615,275.743347 C536.010803,274.387482 533.506592,275.034882 530.762512,276.396454 C523.005981,280.244965 515.210388,284.016083 507.488556,287.932800 C502.019379,290.706940 501.513702,296.870636 506.287506,300.729858 C509.783264,303.555939 513.722229,306.026459 516.581177,309.402679 C520.923767,314.531036 526.257446,314.049774 531.826904,313.505585 C533.454651,313.346497 534.374390,312.046173 535.337097,310.893738 C540.672119,304.507141 545.981750,298.099060 551.356201,291.745850 C553.119690,289.661285 554.246826,287.661224 554.063293,284.619507 C553.826965,280.703217 556.001953,277.910767 560.278870,277.694733 C562.666382,277.574158 564.243286,276.526672 565.735168,274.744263 C573.427490,265.553467 581.183960,256.415497 588.999390,247.329056 C592.103577,243.720093 594.713379,240.418274 593.101196,234.905457 C591.775574,230.372589 595.638428,225.800690 600.427612,224.596893 C605.320007,223.367142 609.245056,225.388168 611.269287,230.179382 C613.287842,234.957123 612.057007,241.198624 607.538025,242.087143 C595.447632,244.464279 590.773621,254.854019 583.510254,262.429077 C579.369141,266.747894 575.688293,271.511810 571.857544,276.122955 C569.632141,278.801758 567.404724,281.400757 567.140686,285.242615 C566.884766,288.966919 564.198486,290.772247 560.689026,290.993469 C557.865601,291.171387 556.195801,292.703003 554.578247,294.743011 C549.717407,300.872986 544.878723,307.029785 539.761292,312.942322 C537.741516,315.275970 536.957275,317.553314 537.063660,320.597931 C537.279541,326.775635 533.929199,330.804657 528.772766,331.151398 C523.616699,331.498169 520.158875,327.921295 519.794556,321.519257 C519.670044,319.330994 518.966125,317.806732 517.260193,316.428253 C513.635254,313.499084 510.235413,310.292053 506.623810,307.345398 C498.266754,300.527069 488.275360,301.030212 480.194489,308.408295 C472.572571,315.367340 464.686829,322.029694 457.324036,329.284302 C454.762329,331.808350 452.520905,333.758636 452.866730,338.019165 C453.251434,342.758057 449.313629,347.054596 445.018860,347.674835 C440.488342,348.329102 436.775269,346.896118 434.670868,342.521942 C432.654419,338.330566 433.628967,333.653137 436.915192,330.655640 C438.806000,328.930969 441.084839,328.250519 443.386108,328.722900 C448.079803,329.686401 451.392944,327.471985 454.536804,324.587189 C463.490356,316.371460 472.410217,308.118805 481.394043,299.936371 C483.022247,298.453491 483.464447,296.861664 483.419586,294.654510 C483.227997,285.232941 489.474670,280.941742 498.180878,284.476746 C500.202820,285.297760 501.850006,285.453094 503.832733,284.444336 C511.842072,280.369507 519.916626,276.422913 528.294495,272.249176 z"/>
            </svg>
            <div className="flex flex-col leading-tight">
              <h2 className="text-[22px] font-black tracking-tighter font-manrope bg-gradient-to-r from-[#E6B800] to-[#C8A000] bg-clip-text text-transparent">AISEP</h2>
              <span className="text-[#878164] text-[11px] font-normal font-manrope tracking-wide">Workspace</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
          </div>
        </div>

        {/* Right Section: Actions & User Details */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link href="/investor/messaging" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative cursor-pointer">
              <MessageSquare className="w-5 h-5" />
            </Link>

            <div className="relative" ref={notiRef}>
              <button
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative cursor-pointer",
                  isNotiOpen && "bg-[#e6cc4c]/10 text-[#e6cc4c]"
                )}
                onClick={handleToggleNoti}
              >
                <Bell className="w-5 h-5 flex-shrink-0" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#e6cc4c] rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {isNotiOpen && (
                <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.05)] border border-slate-100/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 bg-[#fdfdfb]">
                    <h3 className="font-bold text-[#171611] text-[13px] uppercase tracking-[0.1em] font-be-vietnam-pro">Thông báo</h3>
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-[11px] text-[#878164] hover:text-[#e6cc4c] flex items-center gap-1.5 font-semibold transition-colors px-3 py-1.5 rounded-full hover:bg-[#e6cc4c]/5 active:bg-[#e6cc4c]/10 font-be-vietnam-pro"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Đọc tất cả
                    </button>
                  </div>
                  
                  <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-slate-50/50">
                    {notiLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#e6cc4c]" />
                        <span className="text-[12px] font-semibold text-slate-400 animate-pulse font-be-vietnam-pro">Đang tải...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-10 text-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-1">
                          <Bell className="w-6 h-6 text-slate-200" />
                        </div>
                        <p className="text-[14px] font-bold text-[#171611] font-be-vietnam-pro">Tuyệt vời! Không có thông báo mới</p>
                        <p className="text-[13px] text-slate-400 leading-relaxed font-be-vietnam-pro">Chúng tôi sẽ thông báo cho bạn ngay khi có cập nhật từ các Startup bạn quan tâm.</p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.notificationId}
                          className={cn(
                            "flex items-start gap-4 px-6 py-4.5 hover:bg-[#fbfbf9] cursor-pointer group transition-all relative overflow-hidden",
                            !item.isRead && "bg-[#e6cc4c]/[0.02]"
                          )}
                          onClick={() => handleNotiClick(item)}
                        >
                          {!item.isRead && (
                             <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#e6cc4c] transition-all duration-300 group-hover:w-[6px]"></div>
                          )}
                          
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300",
                            !item.isRead ? "bg-[#e6cc4c]/10 text-[#e6cc4c]" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                          )}>
                            <Bell className="w-4.5 h-4.5" />
                          </div>

                          <div className="flex-1 min-w-0 py-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className={cn(
                                "text-[13px] tracking-tight leading-snug break-words font-be-vietnam-pro",
                                !item.isRead ? "font-bold text-[#171611]" : "font-medium text-slate-500"
                              )}>
                                {item.title}
                              </p>
                              {!item.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#e6cc4c] shrink-0 translate-y-[-2px] pulse-subtle"></span>}
                            </div>
                            <p className="text-[12px] text-[#878164] mt-1.5 leading-[1.6] line-clamp-2 font-medium font-be-vietnam-pro">{item.messagePreview}</p>
                            <div className="flex items-center gap-2 mt-3.5">
                              <p className="text-[10px] font-bold text-[#B0AD98] uppercase tracking-[0.05em] font-be-vietnam-pro">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</p>
                              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                              <span className="text-[10px] font-bold text-[#e6cc4c] opacity-0 group-hover:opacity-100 transition-opacity font-be-vietnam-pro">Xem chi tiết</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteNoti(item.notificationId); }} 
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <Link 
                    href="/investor/notifications" 
                    onClick={() => setIsNotiOpen(false)}
                    className="block group/all border-t border-slate-50"
                  >
                    <div className="flex items-center justify-center gap-2 py-4 bg-[#f8f8f6] hover:bg-[#e6cc4c] transition-all duration-300 group-hover/all:gap-3">
                      <span className="text-[11px] font-bold text-[#171611] tracking-[0.15em] uppercase transition-colors group-hover/all:text-white font-be-vietnam-pro">Xem tất cả thông báo</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#171611] transition-all group-hover/all:text-white" />
                    </div>
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
                  "w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative cursor-pointer",
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
                      { icon: Search, label: "Khám phá Startup", href: "/investor/startups" },
                      { icon: Bookmark, label: "Danh sách theo dõi", href: "/investor/watchlist" },
                      { icon: Brain, label: "AI Chatbot", href: "/investor/ai-chatbot" },
                      { icon: Handshake, label: "Kết nối", href: "/investor/connections" },
                      { icon: ShieldCheck, label: "Xác thực Investor", href: "/investor/kyc" },
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

          <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1" />

          {/* User Profile Card */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <div className="text-right hidden sm:flex flex-col items-end justify-center">
              <p className="text-[13px] font-bold text-[#171611] tracking-tight leading-none truncate max-w-[160px]">{displayUserName}</p>
              <p className="text-[10px] text-[#878164] font-medium mt-0.5">Nhà Đầu Tư</p>
            </div>
            <button
              className="relative flex items-center cursor-pointer group/avatar"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#e6cc4c]/40 group-hover/avatar:ring-[#e6cc4c]/70 transition-all shadow-sm">
                <div className="w-full h-full bg-gradient-to-br from-[#e6cc4c]/30 to-[#F0A500]/20 flex items-center justify-center text-[#C8A000] font-black text-sm uppercase">
                  {displayUserName?.[0] ?? "I"}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.13),0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 pt-5 pb-4 bg-white border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#fef0d2] flex items-center justify-center text-[#d0a64b] font-black text-xl uppercase flex-shrink-0">
                      {displayUserName?.[0] ?? "I"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-[#171611] tracking-tight truncate">{displayUserName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center text-[10px] font-black text-[#d0a64b] bg-[#fef0d2]/70 border border-[#fef0d2] px-2 py-0.5 rounded-full uppercase tracking-wider">PRO</span>
                        <span className="text-[12px] text-slate-500 font-medium">Investor</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  {[
                    { icon: Building2, label: "Hồ sơ investor", href: "/investor/profile", desc: "Thông tin & tài liệu" },
                    { icon: Settings, label: "Cài đặt tài khoản", href: "/investor/settings", desc: "Bảo mật & thông báo" },
                    { icon: ShieldAlert, label: "Báo cáo sự cố", onClick: () => setIsReportModalOpen(true), desc: "Gửi phản hồi cho AISEP" },
                  ].map((link, idx) => {
                    if ("href" in link) {
                      return (
                        <Link
                          key={link.href}
                          href={link.href as string}
                          className="flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors group/item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/item:border-slate-200 transition-colors flex-shrink-0">
                            <link.icon className="w-4.5 h-4.5 text-slate-500 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-[#171611] transition-colors leading-none tracking-tight">{link.label}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-1.5">{link.desc}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 transition-colors flex-shrink-0" />
                        </Link>
                      );
                    } else {
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            link.onClick?.();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-slate-50 transition-colors group/item"
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover/item:border-slate-200 transition-colors flex-shrink-0">
                            <link.icon className="w-4.5 h-4.5 text-slate-500 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-[14px] font-bold text-[#171611] transition-colors leading-none tracking-tight">{link.label}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-1.5">{link.desc}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 transition-colors flex-shrink-0" />
                        </button>
                      );
                    }
                  })}
                </div>

                <div className="h-px bg-slate-100 mx-5" />

                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-red-50 transition-colors group/item"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 group-hover/item:border-red-200 transition-colors">
                      <LogOut className="w-4.5 h-4.5 text-red-500" />
                    </div>
                    <span className="text-[14px] font-bold text-red-500 text-left">Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <NotificationDetailModal
        notificationId={selectedNotiId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onDeleteSuccess={handleDeleteNoti}
      />
      <IssueReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </header>
  );
}
