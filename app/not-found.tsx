"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/context";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ArrowLeft, Home, LayoutDashboard, MessageCircle, Info, Rocket, ShieldCheck } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();
  const { isAuthen, user } = useAuth();

  // Helper to determine dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return "/";
    const type = (user.userType || "").toLowerCase();
    const roles = user.roles || [];
    
    if (type === "startup" || roles.includes("startup")) return "/startup";
    if (type === "investor" || roles.includes("investor")) return "/investor";
    if (type === "advisor" || type === "expert" || roles.includes("advisor")) return "/advisor";
    if (type === "admin" || roles.includes("admin")) return "/admin/users";
    if (type === "staff" || roles.includes("staff")) return "/staff";
    return "/";
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-manrope bg-[#FEFDF2] text-slate-900">
      <PublicHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-20 relative">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Left Side: Illustration */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-end animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="relative w-full max-w-[500px] aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/50 ring-1 ring-slate-200/50 group">
              <img 
                src="/images/404-illustration.png" 
                alt="AISEP 404 Connection Disconnected" 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm mb-2">
                <span className="flex h-2 w-2 rounded-full bg-[#FACC15] animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Error 404 - Not Found</span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Không tìm thấy <span className="text-[#FACC15]">trang</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
                Trang bạn đang truy cập không tồn tại, đã được di chuyển hoặc liên kết không còn hợp lệ. Hãy để AISEP đưa bạn trở lại lộ trình của mình.
              </p>
            </div>

            {/* Invalid URL Info (Muted) */}
            <div className="bg-slate-100/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 inline-block">
              <p className="text-xs font-mono text-slate-400">
                Path: <span className="text-slate-600 font-bold">{pathname}</span>
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full">
              {isAuthen ? (
                <Link
                  href={getDashboardPath()}
                  className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-5 text-base font-black text-white shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all"
                >
                  <LayoutDashboard className="h-5 w-5 text-[#FACC15]" />
                  Đi đến bảng điều khiển
                </Link>
              ) : (
                <Link
                  href="/"
                  className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-8 py-5 text-base font-black text-slate-900 shadow-2xl shadow-[#FACC15]/30 hover:shadow-[#FACC15]/50 hover:-translate-y-1 transition-all"
                >
                  <Home className="h-5 w-5" />
                  Quay về trang chủ
                </Link>
              )}
              
              <button
                onClick={() => window.history.back()}
                className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-5 text-base font-black text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
                Quay lại
              </button>
            </div>

            {/* Quick Links / Suggestions */}
            <div className="pt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-slate-200 w-full max-w-lg">
              <Link href="/about" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                <Info className="h-4 w-4 text-[#FACC15]" />
                Khám phá tính năng
              </Link>
              <Link href="/faq" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                <MessageCircle className="h-4 w-4 text-[#FACC15]" />
                Liên hệ hỗ trợ
              </Link>
              <Link href="/auth/register?role=startup" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                <Rocket className="h-4 w-4 text-[#FACC15]" />
                Dành cho Startup
              </Link>
              <Link href="/auth/register?role=investor" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                <ShieldCheck className="h-4 w-4 text-[#FACC15]" />
                Dành cho Investor
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Muted Info */}
      <footer className="py-8 px-6 text-center lg:text-left mx-auto w-full max-w-[1280px]">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          © 2024 AISEP • AI powered startup ecosystem
        </p>
      </footer>
    </div>
  );
}
