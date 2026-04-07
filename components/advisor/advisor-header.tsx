"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronRight,
  User,
  LogOut,
  MessageSquare,
  ClipboardList,
  LayoutGrid,
  Settings,
  FileText,
  Star,
  Clock,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/context";
import { Logout } from "@/services/auth/auth.api";
import { GetAdvisorKYCStatus, GetAdvisorProfile } from "@/services/advisor/advisor.api";
import { IssueReportModal } from "@/components/shared/issue-report-modal";
import { VerifiedRoleMark } from "@/components/shared/verified-role-mark";

type AdvisorHeaderProps = {
  userName?: string;
  userEmail?: string;
  className?: string;
};

export function AdvisorHeader({
  userName = "Advisor",
  userEmail = "advisor@aisep.com",
  className,
}: AdvisorHeaderProps) {
  const router = useRouter();
  const { user, setUser, setAccessToken, setIsAuthen } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [profileName, setProfileName] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const displayUserName = profileName || user?.email || userName;

  useEffect(() => {
    GetAdvisorProfile()
      .then((response) => {
        const envelope = response as unknown as IBackendRes<IAdvisorProfile>;
        if ((envelope.success || envelope.isSuccess) && envelope.data) {
          if (envelope.data.fullName) setProfileName(envelope.data.fullName);
          if (envelope.data.profilePhotoURL) {
            setProfilePhoto(envelope.data.profilePhotoURL);
          }
        }
      })
      .catch(() => {});

    GetAdvisorKYCStatus()
      .then((response) => {
        const envelope = response as unknown as IBackendRes<{ workflowStatus?: string }>;
        if (envelope.data?.workflowStatus === "VERIFIED") {
          setIsKycVerified(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }

      if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
        setIsGridOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        {/* Left Section: Logo only */}
        <div className="flex items-center">
          <Link href="/advisor" className="flex items-center gap-4 cursor-pointer group">
            <svg className="h-9 w-auto flex-shrink-0 group-hover:scale-110 transition-all duration-300" viewBox="425 214 196 142" xmlns="http://www.w3.org/2000/svg">
              <path fill="#F0A500" d="M528.294495,272.249176 C532.020630,271.159119 532.906860,268.448914 533.867676,265.449799 C535.802979,259.408997 541.379211,257.171539 546.497681,260.041779 C550.585571,262.334106 552.357971,267.148407 550.587708,271.151367 C548.773071,275.254730 543.780762,277.647247 539.242615,275.743347 C536.010803,274.387482 533.506592,275.034882 530.762512,276.396454 C523.005981,280.244965 515.210388,284.016083 507.488556,287.932800 C502.019379,290.706940 501.513702,296.870636 506.287506,300.729858 C509.783264,303.555939 513.722229,306.026459 516.581177,309.402679 C520.923767,314.531036 526.257446,314.049774 531.826904,313.505585 C533.454651,313.346497 534.374390,312.046173 535.337097,310.893738 C540.672119,304.507141 545.981750,298.099060 551.356201,291.745850 C553.119690,289.661285 554.246826,287.661224 554.063293,284.619507 C553.826965,280.703217 556.001953,277.910767 560.278870,277.694733 C562.666382,277.574158 564.243286,276.526672 565.735168,274.744263 C573.427490,265.553467 581.183960,256.415497 588.999390,247.329056 C592.103577,243.720093 594.713379,240.418274 593.101196,234.905457 C591.775574,230.372589 595.638428,225.800690 600.427612,224.596893 C605.320007,223.367142 609.245056,225.388168 611.269287,230.179382 C613.287842,234.957123 612.057007,241.198624 607.538025,242.087143 C595.447632,244.464279 590.773621,254.854019 583.510254,262.429077 C579.369141,266.747894 575.688293,271.511810 571.857544,276.122955 C569.632141,278.801758 567.404724,281.400757 567.140686,285.242615 C566.884766,288.966919 564.198486,290.772247 560.689026,290.993469 C557.865601,291.171387 556.195801,292.703003 554.578247,294.743011 C549.717407,300.872986 544.878723,307.029785 539.761292,312.942322 C537.741516,315.275970 536.957275,317.553314 537.063660,320.597931 C537.279541,326.775635 533.929199,330.804657 528.772766,331.151398 C523.616699,331.498169 520.158875,327.921295 519.794556,321.519257 C519.670044,319.330994 518.966125,317.806732 517.260193,316.428253 C513.635254,313.499084 510.235413,310.292053 506.623810,307.345398 C498.266754,300.527069 488.275360,301.030212 480.194489,308.408295 C472.572571,315.367340 464.686829,322.029694 457.324036,329.284302 C454.762329,331.808350 452.520905,333.758636 452.866730,338.019165 C453.251434,342.758057 449.313629,347.054596 445.018860,347.674835 C440.488342,348.329102 436.775269,346.896118 434.670868,342.521942 C432.654419,338.330566 433.628967,333.653137 436.915192,330.655640 C438.806000,328.930969 441.084839,328.250519 443.386108,328.722900 C448.079803,329.686401 451.392944,327.471985 454.536804,324.587189 C463.490356,316.371460 472.410217,308.118805 481.394043,299.936371 C483.022247,298.453491 483.464447,296.861664 483.419586,294.654510 C483.227997,285.232941 489.474670,280.941742 498.180878,284.476746 C500.202820,285.297760 501.850006,285.453094 503.832733,284.444336 C511.842072,280.369507 519.916626,276.422913 528.294495,272.249176 z"/>
            </svg>
            <div className="flex flex-col leading-tight">
              <h2 className="text-[22px] font-black tracking-tighter font-manrope bg-gradient-to-r from-[#E6B800] to-[#C8A000] bg-clip-text text-transparent">AISEP</h2>
              <span className="text-[#878164] text-[11px] font-normal font-manrope tracking-wide">Workspace</span>
            </div>
          </Link>
        </div>

        {/* Right Section: Actions & User Details */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link href="/advisor/messaging" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative">
              <MessageSquare className="w-5 h-5" />
            </Link>

            <div className="relative" ref={notiRef}>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative">
                <Bell className="w-5 h-5" />
              </button>
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
                      { icon: ClipboardList, label: "Yêu cầu tư vấn", href: "/advisor/requests" },
                      { icon: Calendar, label: "Lịch của tôi", href: "/advisor/schedule" },
                      { icon: FileText, label: "Báo cáo", href: "/advisor/reports" },
                      { icon: Star, label: "Đánh giá & Phản hồi", href: "/advisor/feedback" },
                      { icon: Wallet, label: "Ví", href: "/advisor/wallet" },
                      { icon: Clock, label: "Cài lịch tư vấn", href: "/advisor/availability" },
                      { icon: ShieldCheck, label: "Xác thực Advisor", href: "/advisor/kyc" },
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
          <div className="flex items-center gap-3.5 relative shrink-0" ref={dropdownRef}>
            <div className="text-right hidden sm:flex flex-col items-end justify-center min-w-0 max-w-[112px]">
              <p className="text-[13px] font-bold text-[#171611] tracking-tight leading-none truncate w-full text-right">{displayUserName}</p>
              <div className="mt-0.5 inline-flex items-center gap-1">
                <p className="text-[10px] text-[#878164] font-medium">Advisor Account</p>
                {isKycVerified && <VerifiedRoleMark className="h-3.5 w-3.5" />}
              </div>
            </div>
            <button
              className="relative flex items-center cursor-pointer group/avatar"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#e6cc4c]/40 group-hover/avatar:ring-[#e6cc4c]/70 transition-all shadow-sm">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={displayUserName ?? "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#e6cc4c]/30 to-[#F0A500]/20 flex items-center justify-center text-[#C8A000] font-black text-sm uppercase">
                    {displayUserName?.[0] ?? "A"}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.13),0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User info header */}
                <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-[#fdf8e6] via-[#fffdf5] to-white border-b border-slate-100/80">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-[#e6cc4c]/40 flex-shrink-0 shadow-sm">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt={displayUserName ?? "Avatar"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#e6cc4c]/40 to-[#F0A500]/30 flex items-center justify-center text-[#C8A000] font-black text-base uppercase">
                            {displayUserName?.[0] ?? "A"}
                          </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-black text-[#171611] tracking-tight truncate">{displayUserName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center text-[9px] font-black text-[#C8A000] bg-[#e6cc4c]/20 border border-[#e6cc4c]/40 px-1.5 py-0.5 rounded-md uppercase tracking-wider">PRO</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#878164] font-medium">
                          Advisor
                          {isKycVerified && <VerifiedRoleMark className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  {[
                    { icon: User, label: "Hồ sơ cá nhân", href: "/advisor/profile", desc: "Thông tin của bạn" },
                    { icon: Settings, label: "Cài đặt tài khoản", href: "/advisor/settings", desc: "Bảo mật & thông báo" },
                    { icon: ShieldAlert, label: "Báo cáo sự cố", onClick: () => setIsReportModalOpen(true), desc: "Gửi phản hồi cho AISEP" },
                  ].map((link, idx) => {
                    if ("href" in link && typeof link.href === "string") {
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f8f7f2] transition-colors group/item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-[#e6cc4c]/15 transition-colors flex-shrink-0">
                            <link.icon className="w-4 h-4 text-[#171611]/50 group-hover/item:text-[#C8A000] transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-bold text-[#171611]/80 group-hover/item:text-[#171611] transition-colors leading-none">{link.label}</p>
                            <p className="text-[10px] text-[#878164]/70 font-medium mt-0.5">{link.desc}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-slate-400 transition-colors flex-shrink-0" />
                        </Link>
                      );
                    } else {
                      return (
                        <button
                          key={idx}
                          onClick={() => { link.onClick(); setIsDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f8f7f2] transition-colors group/item"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover/item:bg-[#e6cc4c]/15 transition-colors flex-shrink-0">
                            <link.icon className="w-4 h-4 text-[#171611]/50 group-hover/item:text-[#C8A000] transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-[12.5px] font-bold text-[#171611]/80 group-hover/item:text-[#171611] transition-colors leading-none">{link.label}</p>
                            <p className="text-[10px] text-[#878164]/70 font-medium mt-0.5">{link.desc}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-slate-400 transition-colors flex-shrink-0" />
                        </button>
                      );
                    }
                  })}
                </div>

                <div className="h-px bg-slate-100 mx-3" />

                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50/70 transition-colors group/item"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <LogOut className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-[12.5px] font-bold text-red-500 text-left">Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <IssueReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </header>
  );
}
