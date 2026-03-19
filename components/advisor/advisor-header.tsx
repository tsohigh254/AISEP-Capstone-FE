"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  LogOut, 
  Star, 
  User, 
  Key, 
  ChevronDown, 
  Bell, 
  LayoutGrid, 
  MessageSquare,
  Clock,
  Calendar,
  Settings,
  FileText,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/context";
import { Logout } from "@/services/auth/auth.api";

type AdvisorHeaderProps = {
  userName?: string;
  userEmail?: string;
  roleLabel?: string;
  avatarLabel?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onPasswordChangeClick?: () => void;
  className?: string;
};

export function AdvisorHeader({
  userName = "c!",
  userEmail = "c!@gmail.com",
  roleLabel = "Advisor",
  avatarLabel = "C",
  onLogout,
  onProfileClick,
  onPasswordChangeClick,
  className,
}: AdvisorHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, setAccessToken, setIsAuthen } = useAuth();
  const displayUserName = user?.email || userName;

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
  const [isGridOpen, setIsGridOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(event.target as Node)) {
        setIsGridOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={cn("fixed top-0 z-50 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-neutral-surface shadow-sm", className)}>
      <div className="max-w-[1440px] mx-auto w-full h-[73px] flex items-center justify-between px-6">
        {/* Left Section: Logo & Role */}
        <div className="flex items-center gap-12">
          <Link href="/advisor" className="flex items-center gap-4 cursor-pointer group">
            <img src="/AISEP_Logo.png" alt="AISEP" className="w-12 h-12 rounded-full object-contain group-hover:scale-110 transition-all duration-300" />
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-[#171611] text-[22px] font-black tracking-tighter font-manrope">AISEP</h2>
              <span className="text-[#878164] text-xl font-medium font-manrope">Advisor</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/advisor"
              className={cn(
                "text-sm font-black tracking-tight relative group/nav transition-colors",
                pathname === "/advisor" ? "text-[#171611]" : "text-[#878164] hover:text-[#171611]"
              )}
            >
              Dashboard
              {pathname === "/advisor" && (
                <div className="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full"></div>
              )}
            </Link>
          </div>
        </div>

        {/* Right Section: Actions & User Details */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link href="/advisor/messaging" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative">
              <MessageSquare className="w-5 h-5" />
            </Link>

            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-[#e6cc4c]/10 hover:text-[#e6cc4c] transition-all relative">
              <Bell className="w-5 h-5" />
            </button>

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
                      { icon: MessageSquare, label: "Consulting Requests", href: "/advisor/requests" },
                      { icon: Calendar, label: "Schedule", href: "/advisor/schedule" },
                      { icon: FileText, label: "Reports", href: "/advisor/reports" },
                      { icon: Star, label: "Ratings & Feedback", href: "/advisor/reviews" },
                      { icon: Clock, label: "Set Availability", href: "/advisor/availability" },
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
          <div className="flex items-center gap-3 relative">
            <div className="text-right flex flex-col items-end justify-center">
              <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{displayUserName}</p>
              <div className="px-1.5 py-0.5 bg-[#fdf8e6] rounded-md border border-[#e6cc4c]/30">
                <p className="text-[9px] text-[#878164] font-black uppercase tracking-wider leading-none">{roleLabel} PRO</p>
              </div>
            </div>
            
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-100/50 shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#e6cc4c]/30 transition-all">
                  <div className="w-full h-full bg-[#f4f4f0] flex items-center justify-center text-[#171611] font-black text-sm uppercase">
                    {avatarLabel}
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-neutral-surface/50 overflow-hidden py-3">
                <DropdownMenuLabel className="px-5 py-2">
                  <p className="text-sm font-black text-[#171611]">{displayUserName}</p>
                  <p className="text-xs text-neutral-muted font-medium truncate">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-4 my-2 opacity-50" />
                <DropdownMenuItem onClick={() => router.push("/advisor/profile")} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#f4f4f0]/60 transition-colors group cursor-pointer focus:bg-[#f4f4f0]/60">
                  <User className="w-5 h-5 text-[#171611] opacity-70 group-hover:opacity-100" />
                  <span className="text-[13px] font-bold text-[#171611]">Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/advisor/settings")} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#f4f4f0]/60 transition-colors group cursor-pointer focus:bg-[#f4f4f0]/60">
                  <Key className="w-5 h-5 text-[#171611] opacity-70 group-hover:opacity-100" />
                  <span className="text-[13px] font-bold text-[#171611]">Đổi mật khẩu</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="mx-4 my-2 opacity-50" />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-5 py-2.5 hover:bg-red-50/50 transition-colors group cursor-pointer focus:bg-red-50/50">
                  <LogOut className="w-5 h-5 text-red-500 opacity-80 group-hover:opacity-100" />
                  <span className="text-[13px] font-bold text-red-500">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
