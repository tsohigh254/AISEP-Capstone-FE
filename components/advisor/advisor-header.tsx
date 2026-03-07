"use client";

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
import { LogOut, Star, User, Key, ChevronDown } from "lucide-react";

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
  return (
    <header
      className={cn(
        "fixed top-0 z-50 left-0 right-0 flex items-center justify-between px-6 py-4 bg-white border-b",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <Star className="w-6 h-6 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-semibold">AdvisorHub</div>
          <div className="text-xs text-slate-500">Dashboard</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center text-sm font-semibold">
          {avatarLabel}
        </div>
        <span className="text-base font-medium">{userName}</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              <span>Hồ sơ cá nhân</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onPasswordChangeClick} className="cursor-pointer">
              <Key className="w-4 h-4 mr-2" />
              <span>Đổi mật khẩu</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
