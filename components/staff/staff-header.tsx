"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Bell,
  Search,
  Filter,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Loader2,
  Menu
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/context";
import { Logout } from "@/services/auth/auth.api";

export function StaffHeader({ 
  className, 
  onMenuClick, 
  onHelpClick 
}: { 
  className?: string, 
  onMenuClick?: () => void,
  onHelpClick?: () => void 
}) {
  const router = useRouter();
  const { user, setUser, setAccessToken, setIsAuthen } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
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

  const displayName = (user as any)?.fullName || user?.email?.split("@")[0] || "Nhân viên";

  return (
    <header className={cn("h-[64px] bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-all duration-300", className)}>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:text-[#eec54e] hover:bg-[#eec54e]/5 transition-all cursor-pointer mr-2"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Brand/Breadcrumb Space */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link href="/staff/notifications" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-[#eec54e] hover:bg-[#eec54e]/5 transition-all relative cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Link>

        {/* Help */}
        <button 
          onClick={onHelpClick}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-[#eec54e] hover:bg-[#eec54e]/5 transition-all cursor-pointer"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-1 pr-1.5 py-1 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 font-plus-jakarta-sans cursor-pointer"
          >
            <div className="text-right hidden sm:flex flex-col items-end justify-center">
              <p className="text-[13px] font-bold text-[#171611] tracking-tight leading-none truncate max-w-[160px]">{displayName}</p>
              <p className="text-[10px] text-[#878164] font-medium mt-0.5">Nhân Viên Vận Hành</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#eec54e]/40 to-[#F0A500]/30 flex items-center justify-center text-[#eec54e] font-black text-xs shadow-sm uppercase">
              {displayName?.[0] || "S"}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-black/8 border border-slate-100 py-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản nhân viên</p>
              </div>
              <Link 
                href="/staff/profile"
                className="w-[calc(100%-12px)] mx-1.5 flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="w-4 h-4 opacity-70" />
                <span className="text-[13px] font-bold">Hồ sơ cá nhân</span>
              </Link>
              <Link 
                href="/staff/settings"
                className="w-[calc(100%-12px)] mx-1.5 flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings className="w-4 h-4 opacity-70" />
                <span className="text-[13px] font-bold">Cài đặt</span>
              </Link>
              <div className="h-px bg-slate-50 my-1.5 mx-3" />
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-[calc(100%-12px)] mx-1.5 flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                {loggingOut ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <LogOut className="w-4 h-4" />}
                <span className="text-[13px] font-bold">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
