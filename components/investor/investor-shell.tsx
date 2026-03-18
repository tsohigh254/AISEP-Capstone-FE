"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  TrendingUp,
  Building2,
  Star,
  Link2,
  LineChart,
  Lightbulb,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { InvestorHeader } from "@/components/investor/investor-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthGuard } from "@/components/auth-guard";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: TrendingUp, href: "/investor" },
  { label: "Startup", icon: Building2, href: "/investor/startups" },
  { label: "Watchlist", icon: Star, href: "/investor/watchlist" },
  { label: "Connections", icon: Link2, href: "/investor/offers" },
  { label: "Tin nhắn", icon: MessageSquare, href: "/investor/messaging" },
  { label: "AI Investment Trends", icon: LineChart, href: "/investor/analytics" },
  { label: "AI Recommendation", icon: Lightbulb, href: "/investor/recommendations" },
];

type InvestorShellProps = {
  children: React.ReactNode;
};

export function InvestorShell({ children }: InvestorShellProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/investor") return pathname === "/investor";
    return pathname.startsWith(href);
    };

  return (
    <AuthGuard allowedRoles={["Investor"]}>
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <aside className="w-64 bg-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 border-r">
        <div className="p-6 flex items-center gap-3">
          <img src="/AISEP_Logo.png" alt="AISEP" className="w-12 h-12 rounded-full object-contain" />
          <div>
            <h1 className="text-slate-900 text-lg font-bold">AISEP</h1>
            <p className="text-xs text-slate-500">Investor</p>
          </div>
        </div>
        <nav className="px-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-slate-700 hover:bg-slate-100",
                  active && "bg-blue-600 text-white hover:bg-blue-600"
                )}
              >
                <Link href={item.href}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
        
        <div className="px-3 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-sm text-blue-900">Pro Tip</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sử dụng AI để phân tích và cải thiện hồ sơ của bạn
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col">
        <InvestorHeader />
        <div className="h-[73px]" />
        <main className="flex-1 p-8 bg-slate-50">{children}</main>
      </div>
    </div>
    </AuthGuard>
  );
}


