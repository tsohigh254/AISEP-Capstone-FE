"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, User, Key, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logout } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";

type StartupHeaderProps = {
  userName?: string;
  userEmail?: string;
  notificationCount?: number;
  className?: string;
};

export function StartupHeader({
  userName = "Sarah Johnson",
  userEmail = "a@a.com",
  notificationCount = 3,
  className,
}: StartupHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();

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
    try {
      const res = await Logout();

      if (!res.isSuccess && res.statusCode !== 200) {
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
        "flex items-center justify-between px-8 py-4 bg-white border-b",
        className
      )}
    >
      <div className="flex-1"></div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-600 hover:text-slate-900"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Button>
        
        <span className="text-sm font-medium text-slate-700">Startup</span>

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
                <Link href="/startup/profile">
                  <button className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Hồ sơ cá nhân</span>
                  </button>
                </Link>

                <Link href="/startup/settings">
                  <button className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-slate-700">
                    <Key className="w-4 h-4" />
                    <span className="text-sm">Đổi mật khẩu</span>
                  </button>
                </Link>

                <div className="my-1 h-px bg-slate-100"></div>

                <button
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

