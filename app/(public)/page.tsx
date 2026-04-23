"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  ShieldCheck,
  Lock,
  Network,
  Database,
  CheckCircle,
  FileText,
  Table2,
  Plus,
  ArrowRight,
  Star,
  BarChart3,
  FileCheck,
  Calendar,
  Mail,
  MapPin,
  BarChart,
  AtSign,
  BadgeCheck,
  Clock,
  LinkIcon,
  Menu,
  X,
  Shield,
  Users,
  Fingerprint,
} from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { AnimatedNumber } from "@/lib/useCountUp";
import { Footer } from "@/components/layout";

export default function PublicHomePage() {
  const [activeRole, setActiveRole] = useState<"startup" | "investor" | "advisor">("startup");

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-manrope bg-[#FEFDF2] text-[#0F172A]">
      <div className="h-[100px]" />

      <main className="flex-1">
        {/* ===== PREMIUM HERO SECTION ===== */}
        <section className="relative mx-auto max-w-[1280px] px-6 py-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="flex flex-col gap-10 max-w-xl">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#FACC15]"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI-Powered Ecosystem</span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-[-0.02em] leading-[1.2] sm:leading-[1.1] lg:leading-[1.05] font-plus-jakarta-sans overflow-visible">
                  Nền tảng AI toàn diện <br />
                  cho hệ sinh thái <br />
                  <span className="text-[#FACC15] drop-shadow-sm text-4xl sm:text-6xl lg:text-7xl font-plus-jakarta-sans font-extrabold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent inline-block py-2 leading-tight mt-1">Khởi nghiệp</span>
                </h1>
                <p className="text-lg sm:text-xl font-medium text-slate-600 leading-relaxed">
                  Kết nối <span className="text-slate-900 font-bold italic">Startup</span>, <span className="text-slate-900 font-bold italic">Investor</span> và <span className="text-slate-900 font-bold italic">Advisor</span> trên một nền tảng minh bạch, bảo mật và hỗ trợ đánh giá thông minh.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, text: "Minh bạch quy trình" },
                  { icon: Lock, text: "Xác thực tài liệu" },
                  { icon: Network, text: "Kết nối có kiểm soát" }
                ].map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <badge.icon className="h-4 w-4 text-[#FACC15]" />
                    <span className="text-xs font-bold text-[#0F172A]">{badge.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/auth/register"
                    className="flex min-w-[180px] items-center justify-center rounded-xl bg-[#FACC15] px-8 py-5 text-base font-black text-slate-900 shadow-2xl shadow-[#FACC15]/30 hover:shadow-[#FACC15]/50 hover:-translate-y-1 transition-all"
                  >
                    Bắt đầu ngay
                  </Link>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="flex min-w-[180px] items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-5 text-base font-black text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    Xem nền tảng
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="w-8 h-8 rounded-full border-2 border-[#FEFDF2] bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${n}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    AI Evaluation • Blockchain Verification • Structured Consulting
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Dashboard Mockup */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              {/* Decorative Blur Gradients */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#FACC15]/20 via-transparent to-slate-200/30 rounded-full blur-3xl -z-10"></div>
              
              {/* Main App Frame */}
              <div className="w-full relative z-10 animate-in zoom-in-95 duration-1000">
                {/* Background Card */}
                <div className="absolute -top-6 -left-6 w-full h-full bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50 -rotate-2 -z-10"></div>
                
                {/* Main Dashboard UI Mockup */}
                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200/60 overflow-hidden ring-1 ring-slate-900/5">
                  {/* Mockup Title Bar */}
                  <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2.5 bg-slate-200 rounded-full"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <Fingerprint className="h-4 w-4 text-[#FACC15]" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mockup Content */}
                  <div className="p-8 grid grid-cols-12 gap-6">
                    {/* Stats Widget */}
                    <div className="col-span-12 md:col-span-8 space-y-6">
                      <div className="bg-[#0F172A] text-white p-6 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Startup AI Evaluation</h4>
                          <BadgeCheck className="h-5 w-5 text-[#FACC15]" />
                        </div>
                        <div className="flex items-end gap-3">
                          <span className="text-4xl font-black">94.8</span>
                          <span className="text-xs font-bold bg-[#FACC15] text-slate-900 px-2 py-0.5 rounded-md mb-1">GRADE A</span>
                        </div>
                        <div className="flex gap-2 h-1.5 pt-2">
                          {[60, 80, 40, 95, 70].map((w, i) => (
                            <div key={i} className="flex-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FACC15]" style={{ width: `${w}%` }}></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Interaction Flow Widget */}
                      <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Verification Pipeline</h4>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200">
                            <FileText className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="w-8 h-px bg-slate-200"></div>
                          <div className="w-10 h-10 rounded-full bg-[#FACC15]/20 flex items-center justify-center border border-[#FACC15]/30">
                            <ShieldCheck className="h-5 w-5 text-slate-900" />
                          </div>
                          <div className="w-8 h-px bg-slate-200"></div>
                          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                            <BadgeCheck className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Blockchain Proof</span>
                            <span className="text-[10px] font-bold text-[#FACC15]">TX-09124-SEC</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-[#FACC15]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ecosystem Widget */}
                    <div className="col-span-12 md:col-span-4 bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center">
                        <Users className="h-8 w-8 text-[#FACC15]" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-[#0F172A]">82</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect Advisors</p>
                      </div>
                      <div className="w-full h-px bg-slate-200"></div>
                      <div className="flex -space-x-1.5">
                        {[5, 6, 7].map(n => (
                          <div key={n} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${n}`} alt="user" />
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-700 hover:bg-slate-50 transition-colors">
                        View Network
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements for Premium Feel */}
                <div className="absolute -bottom-10 -right-10 w-48 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-bounce-slow hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                      <Lock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                      <p className="text-xs font-bold text-slate-900">Document Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PRODUCT PROOF FEED ===== */}
        <section id="features" className="bg-white py-20">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tính năng nổi bật</h2>
              <p className="mt-2 text-slate-500">Trải nghiệm các tính năng cốt lõi được bảo mật bởi công nghệ Blockchain.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 - Document Versions */}
              <div className="group flex flex-col gap-5 p-2 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100"></div>
                  <div className="absolute inset-0 p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-300">
                        <div className="w-4 h-4 rounded bg-slate-400"></div>
                        <div className="w-24 h-2 bg-slate-400 rounded"></div>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                        <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
                        <div className="w-12 h-4 rounded-full bg-green-100 text-[8px] flex items-center justify-center font-bold text-green-700">v2.1.0</div>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm opacity-60">
                        <div className="w-1/3 h-2 bg-slate-200 rounded"></div>
                        <div className="w-12 h-4 rounded-full bg-slate-100 text-[8px] flex items-center justify-center font-bold text-slate-400">v2.0.4</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[#FACC15]/0 group-hover:bg-[#FACC15]/5 transition-colors"></div>
                </div>
                <div className="px-2">
                  <h3 className="text-lg font-bold text-slate-900">Danh sách tài liệu &amp; phiên bản</h3>
                  <p className="text-sm text-slate-500 mt-1">Quản lý tập trung mọi tài liệu dự án với hệ thống phân quyền thông minh.</p>
                </div>
              </div>

              {/* Card 2 - Blockchain Proof */}
              <div className="group flex flex-col gap-5 p-2 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FACC15]/5 to-slate-100"></div>
                  <div className="absolute inset-0 p-4">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-center gap-4 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#FACC15] flex items-center justify-center text-[10px] font-bold">1</div>
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">2</div>
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">3</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                        <LinkIcon className="h-8 w-8 text-[#FACC15]" />
                        <div className="w-3/4 h-2 bg-slate-200 rounded mx-auto"></div>
                        <div className="w-1/2 h-2 bg-slate-200 rounded mx-auto opacity-50"></div>
                        <div className="mt-4 w-full h-8 rounded-lg bg-[#FACC15]/20 border border-[#FACC15]/40"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[#FACC15]/0 group-hover:bg-[#FACC15]/5 transition-colors"></div>
                </div>
                <div className="px-2">
                  <h3 className="text-lg font-bold text-slate-900">Quy trình Blockchain Proof</h3>
                  <p className="text-sm text-slate-500 mt-1">Xác thực tính toàn vẹn và mốc thời gian của mọi tương tác trên chuỗi khối.</p>
                </div>
              </div>

              {/* Card 3 - Mentorship */}
              <div className="group flex flex-col gap-5 p-2 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100"></div>
                  <div className="absolute inset-0 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white shadow-sm border-l-4 border-[#FACC15]">
                        <div className="w-8 h-8 rounded-full bg-slate-100 mb-2"></div>
                        <div className="w-12 h-1.5 bg-slate-300 rounded mb-1"></div>
                        <div className="w-8 h-1.5 bg-slate-200 rounded"></div>
                      </div>
                      <div className="p-3 rounded-lg bg-white shadow-sm opacity-50">
                        <div className="w-8 h-8 rounded-full bg-slate-100 mb-2"></div>
                        <div className="w-12 h-1.5 bg-slate-300 rounded mb-1"></div>
                        <div className="w-8 h-1.5 bg-slate-200 rounded"></div>
                      </div>
                      <div className="col-span-2 p-3 rounded-lg bg-white shadow-sm border border-slate-100">
                        <div className="flex justify-between">
                          <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
                          <div className="w-10 h-2 bg-[#FACC15]/40 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[#FACC15]/0 group-hover:bg-[#FACC15]/5 transition-colors"></div>
                </div>
                <div className="px-2">
                  <h3 className="text-lg font-bold text-slate-900">Quản lý Mentorship</h3>
                  <p className="text-sm text-slate-500 mt-1">Hệ thống kết nối và theo dõi lộ trình cố vấn giữa Mentor và Startup.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CORE PILLARS (Dark Section) ===== */}
        <section id="security" className="relative bg-slate-900 text-white py-14 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#FACC15] rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#FACC15] rounded-full blur-[100px]"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-12 justify-center md:justify-start">
              <img src="/AISEP_Logo.png" alt="AISEP" className="w-14 h-14 rounded-full object-contain shadow-lg shadow-[#FACC15]/20" />
              <span className="text-2xl font-black tracking-tighter uppercase">AISEP</span>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 text-center lg:text-left">
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 sm:mb-8">
                  Trụ cột cốt lõi của <span className="text-[#FACC15]">AISEP</span>
                </h2>
                <p className="text-xl md:text-2xl text-slate-300 max-w-2xl font-medium leading-relaxed mb-12">
                  Nền tảng ứng dụng công nghệ hiện đại nhất để chuẩn hóa và minh bạch hóa dữ liệu doanh nghiệp trong hệ sinh thái đổi mới sáng tạo.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button onClick={() => scrollToSection("roles")} className="bg-[#FACC15] text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer">
                    Khám phá ngay <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="kiosk-card p-8 rounded-2xl flex flex-col items-start !bg-white/5 !border-white/10 backdrop-blur-sm group">
                  <div className="w-16 h-16 bg-[#FACC15] text-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#FACC15]/10 group-hover:scale-110 transition-transform">
                    <Database className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Quy trình dữ liệu &amp; hồ sơ</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Số hóa và chuẩn hóa hồ sơ doanh nghiệp toàn diện, quản lý khoa học sẵn sàng cho gọi vốn.</p>
                </div>

                <div className="kiosk-card p-8 rounded-2xl flex flex-col items-start !bg-white/5 !border-white/10 backdrop-blur-sm group">
                  <div className="w-16 h-16 bg-[#FACC15] text-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#FACC15]/10 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Tin cậy tài liệu (Blockchain)</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Minh bạch và bảo mật tuyệt đối. Định danh duy nhất trên chuỗi khối, chống làm giả.</p>
                </div>

                <div className="kiosk-card p-8 rounded-2xl flex flex-col items-start !bg-white/5 !border-white/10 backdrop-blur-sm group">
                  <div className="w-16 h-16 bg-[#FACC15] text-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#FACC15]/10 group-hover:scale-110 transition-transform">
                    <Network className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Kết nối có kiểm soát</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Xây dựng mạng lưới thông minh. Làm chủ việc chia sẻ thông tin với đối tác tin cậy.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ROLES & USE CASES ===== */}
        <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-24 space-y-16 sm:space-y-24 lg:space-y-32">
          <div className="text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">Vai trò &amp; Trường hợp sử dụng</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setActiveRole("startup")}
                className={`px-8 py-3 font-extrabold rounded-full text-sm border-2 transition-colors ${
                  activeRole === "startup"
                    ? "bg-[#FACC15] text-slate-900 shadow-md border-[#FACC15]"
                    : "bg-white text-slate-600 shadow-sm border-slate-100 hover:border-[#FACC15]/50"
                }`}
              >
                STARTUP
              </button>
              <button
                onClick={() => setActiveRole("investor")}
                className={`px-8 py-3 font-bold rounded-full text-sm border-2 transition-colors ${
                  activeRole === "investor"
                    ? "bg-[#FACC15] text-slate-900 shadow-md border-[#FACC15]"
                    : "bg-white text-slate-600 shadow-sm border-slate-100 hover:border-[#FACC15]/50"
                }`}
              >
                NHÀ ĐẦU TƯ
              </button>
              <button
                onClick={() => setActiveRole("advisor")}
                className={`px-8 py-3 font-bold rounded-full text-sm border-2 transition-colors ${
                  activeRole === "advisor"
                    ? "bg-[#FACC15] text-slate-900 shadow-md border-[#FACC15]"
                    : "bg-white text-slate-600 shadow-sm border-slate-100 hover:border-[#FACC15]/50"
                }`}
              >
                CỐ VẤN
              </button>
            </div>
          </div>

          {/* Role content - keyed by activeRole to force remount & animation */}
          <div key={activeRole} className="role-section-enter">
            {activeRole === "startup" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                <div className="role-col-left space-y-6 sm:space-y-8">
                  <div>
                    <span className="bg-[#FACC15]/20 text-slate-900 px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-xs">Dành cho Startup</span>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mt-4 sm:mt-6 mb-4 sm:mb-6 leading-tight">Hoàn thiện hồ sơ năng lực chỉ trong vài phút</h3>
                    <p className="text-slate-600 text-xl leading-relaxed">
                      AISEP giúp các nhà sáng lập theo dõi mức độ hoàn thiện của hồ sơ và chuẩn bị các tài liệu quan trọng để tiếp cận nhà đầu tư chuyên nghiệp.
                    </p>
                  </div>

                  <ul className="space-y-5">
                    <li className="flex items-center gap-4 text-lg font-semibold">
                      <CheckCircle className="h-7 w-7 text-[#FACC15] shrink-0" /> Tự động đánh giá điểm tín nhiệm
                    </li>
                    <li className="flex items-center gap-4 text-lg font-semibold">
                      <CheckCircle className="h-7 w-7 text-[#FACC15] shrink-0" /> Kho lưu trữ tài liệu bảo mật Blockchain
                    </li>
                    <li className="flex items-center gap-4 text-lg font-semibold">
                      <CheckCircle className="h-7 w-7 text-[#FACC15] shrink-0" /> Chia sẻ hồ sơ gọi vốn chuyên nghiệp
                    </li>
                  </ul>
                </div>

                {/* Startup Profile Mockup */}
                <div className="role-col-right bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 relative">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="font-extrabold text-xl">Độ hoàn thiện hồ sơ</h4>
                    <span className="bg-[#FACC15]/20 text-slate-900 px-4 py-1 rounded-full text-sm font-black">85% Hoàn thành</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full mb-10 overflow-hidden">
                    <div className="bg-[#FACC15] h-full rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-base">Pitch Deck v2.1</p>
                          <p className="text-xs text-slate-500 font-medium">Cập nhật 2 ngày trước</p>
                        </div>
                      </div>
                      <BadgeCheck className="h-6 w-6 text-green-500" />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                          <Table2 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-base">Báo cáo tài chính Q3</p>
                          <p className="text-xs text-slate-500 font-medium">Đang chờ xác thực</p>
                        </div>
                      </div>
                      <Clock className="h-6 w-6 text-slate-300" />
                    </div>

                    <button className="w-full flex items-center justify-center gap-3 py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-[#FACC15] hover:text-slate-900 hover:bg-[#FACC15]/5 transition-all font-bold">
                      <Plus className="h-5 w-5" />
                      <span>Thêm tài liệu mới</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeRole === "investor" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                <div className="role-col-left order-2 lg:order-1 bg-slate-950 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 overflow-hidden relative min-h-[350px] sm:min-h-[500px] flex flex-col justify-center shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/10 via-transparent to-transparent"></div>
                  <div className="relative z-10 space-y-6">
                    {/* Startup Card 1 */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl transform -rotate-2 hover:rotate-0 transition-all duration-500">
                      <div className="flex gap-5 mb-5">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          <img
                            className="w-full h-full object-cover"
                            alt="Startup logo"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0v9fxre2MU4mt76xYAsUt-5G4vK0_rxGtDoRKvgU97HJdNFKVPyQcjWsoHtDyi3i2uocxJqxUasSCtwBHz9O_TDGUg2g7cIMAAnhaBIyz2i_W3MseMOlHi8CIXqBKDDJ4PhQgAKTTfQtEQJH3xrgBszYYDh5bCYtDCg1WTytw2HcNfTCJ3Bp9D_EpsDzcTIpsMUDcDWYpUu9NKG492-1Qvg2MnVmjr9VlnQZJvGNJLO6BbTve7dz4O3b4cia7n7w4qrjgpI_H0gQ"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="font-black text-lg text-slate-900">EcoSmart Energy</h5>
                            <button className="text-slate-300 hover:text-yellow-500">
                              <Star className="h-5 w-5" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-slate-500 mb-3">Series A • CleanTech</p>
                          <div className="flex gap-2">
                            <span className="text-[11px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">SaaS</span>
                            <span className="text-[11px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">B2B</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <span className="text-sm font-black text-slate-900">$2.5M Target</span>
                        <button className="text-sm font-black text-[#FACC15] bg-slate-900 px-4 py-1.5 rounded-lg">Details</button>
                      </div>
                    </div>

                    {/* Startup Card 2 */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl transform rotate-1 sm:translate-x-6 hover:rotate-0 transition-all duration-500">
                      <div className="flex gap-5 mb-5">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          <img
                            className="w-full h-full object-cover"
                            alt="Fintech startup"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmEGx8JN2Q36QjixqxNAJ2S0ZVEO00iqpt_b-4MiGkgcASnVjjvptLG3VE2Ecz99UR8S-eSrJKrRf0XRVnXMBFMGccpk2BNLSOXOAJV4zZMj08oM8xVCBSsQtGdpIIqCrX2XYw3DO15smziRuUVkaxN5B-TDERXlfXFID99zxAw8VmA6tPlhbwtoiP3vhluwVAbAyDMqw45FaTsIfUOxdAwcPLAsPM8OW62NujirOHMTpOqFvGTz5wTKiQaw6wHOKHWn93vDSISYU"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="font-black text-lg text-slate-900">FinFlow Pay</h5>
                            <button className="text-yellow-500">
                              <Star className="h-5 w-5 fill-current" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-slate-500 mb-3">Seed • Fintech</p>
                          <div className="flex gap-2">
                            <span className="text-[11px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">Payment</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <span className="text-sm font-black text-slate-900">$500K Target</span>
                        <button className="text-sm font-black text-[#FACC15] bg-slate-900 px-4 py-1.5 rounded-lg">Details</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="role-col-right order-1 lg:order-2 space-y-6 sm:space-y-8">
                  <div>
                    <span className="bg-[#FACC15]/20 text-slate-900 px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-xs">Dành cho Nhà đầu tư</span>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mt-4 sm:mt-6 mb-4 sm:mb-6 leading-tight">Sàng lọc cơ hội đầu tư minh bạch</h3>
                    <p className="text-slate-600 text-xl leading-relaxed">
                      Tiết kiệm hàng trăm giờ Due Diligence với hệ thống hồ sơ đã được xác thực qua Blockchain và các đơn vị kiểm toán uy tín.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-10">
                    <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-3xl sm:text-5xl font-black text-[#FACC15] mb-2"><AnimatedNumber value={500} duration={1400} delay={0} />+</p>
                      <p className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">Startup sẵn sàng</p>
                    </div>
                    <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-3xl sm:text-5xl font-black text-[#FACC15] mb-2"><AnimatedNumber value={100} duration={1000} delay={200} />%</p>
                      <p className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">Hồ sơ xác thực</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRole === "advisor" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                <div className="role-col-left space-y-6 sm:space-y-8">
                  <div>
                    <span className="bg-[#FACC15]/20 text-slate-900 px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-xs">Dành cho Cố vấn</span>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mt-4 sm:mt-6 mb-4 sm:mb-6 leading-tight">Quản lý phiên cố vấn hiệu quả</h3>
                    <p className="text-slate-600 text-xl leading-relaxed">
                      Hệ thống hóa các phiên làm việc, lưu trữ báo cáo tiến độ và theo dõi sự phát triển của các startup bạn đang đồng hành.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex gap-6 p-6 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/20">
                      <BarChart3 className="h-10 w-10 text-slate-800 shrink-0" />
                      <div>
                        <p className="text-xl font-black">Theo dõi KPI real-time</p>
                        <p className="text-slate-600 font-medium">Dễ dàng xem các chỉ số tăng trưởng của startup một cách trực quan.</p>
                      </div>
                    </div>
                    <div className="flex gap-6 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <FileCheck className="h-10 w-10 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-xl font-black">Báo cáo chuẩn hóa</p>
                        <p className="text-slate-600 font-medium">Tạo báo cáo nhanh chóng sau mỗi buổi Mentorship bằng mẫu chuẩn.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mentoring Schedule Mockup */}
                <div className="role-col-right bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                  <div className="bg-slate-50 px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-black text-lg">Lên lịch Mentoring</h4>
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="p-5 sm:p-10 space-y-6 sm:space-y-8">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Chọn Startup</label>
                      <select className="w-full bg-slate-50 border-slate-200 border rounded-xl py-4 px-5 text-base font-bold focus:ring-[#FACC15] focus:border-[#FACC15]">
                        <option>EcoSmart Energy</option>
                        <option>FinFlow Pay</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Ngày</label>
                        <input className="w-full bg-slate-50 border-slate-200 border rounded-xl py-4 px-5 text-base font-bold focus:ring-[#FACC15] focus:border-[#FACC15]" type="date" defaultValue="2023-10-25" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Giờ</label>
                        <input className="w-full bg-slate-50 border-slate-200 border rounded-xl py-4 px-5 text-base font-bold focus:ring-[#FACC15] focus:border-[#FACC15]" type="time" defaultValue="14:00" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Nội dung thảo luận</label>
                      <textarea
                        className="w-full bg-slate-50 border-slate-200 border rounded-xl py-4 px-5 text-base font-bold focus:ring-[#FACC15] focus:border-[#FACC15]"
                        placeholder="Ví dụ: Review kế hoạch tài chính năm 2026..."
                        rows={3}
                      ></textarea>
                    </div>

                    <button className="w-full bg-[#FACC15] text-slate-900 font-black py-5 rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-[#FACC15]/20 text-lg">
                      XÁC NHẬN LỊCH HẸN
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== SECURITY / ABOUT SECTION ===== */}
        <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6">Minh bạch & An toàn tuyệt đối</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              AISEP xây dựng trên nền tảng niềm tin và công nghệ bảo mật đa lớp, đảm bảo mọi dữ liệu và tài sản trí tuệ của bạn luôn được bảo vệ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 - Xác thực Blockchain */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
              <div className="w-14 h-14 bg-[#FEFCE8] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Fingerprint className="h-7 w-7 text-slate-800" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Xác thực Blockchain</h3>
              <p className="text-slate-500 leading-relaxed">
                Bảo vệ IP, tài liệu và chứng minh sở hữu trí tuệ thông qua hệ thống ghi nhận bất biến trên Blockchain – không thể thay đổi, không thể xóa.
              </p>
            </div>

            {/* Card 2 - Quản trị Phân quyền */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
              <div className="w-14 h-14 bg-[#FEFCE8] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="h-7 w-7 text-slate-800" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Quản trị Phân quyền (RBAC)</h3>
              <p className="text-slate-500 leading-relaxed">
                Kiểm soát truy cập chặt chẽ theo vai trò (Admin, Mentor, Startup), đảm bảo đúng người đúng việc và bảo mật thông tin nội bộ.
              </p>
            </div>

            {/* Card 3 - Hệ thống Kiểm duyệt */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
              <div className="w-14 h-14 bg-[#FEFCE8] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="h-7 w-7 text-slate-800" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Hệ thống Kiểm duyệt</h3>
              <p className="text-slate-500 leading-relaxed">
                Quy trình tự động và thủ công nhận xét, lý vi phạm, báo cáo nội dung không phù hợp – xây dựng môi trường khởi nghiệp lành mạnh.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-14 sm:mb-24">
          <div className="bg-[#FACC15] rounded-2xl sm:rounded-[3rem] p-8 sm:p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Rocket className="w-72 h-72" />
            </div>
            <div className="relative z-10 space-y-10">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
                Sẵn sàng nâng tầm doanh nghiệp?
              </h2>
              <p className="text-slate-800 max-w-2xl mx-auto text-base sm:text-xl md:text-2xl font-semibold">
                Tham gia vào hệ sinh thái AISEP ngay hôm nay để kết nối với những nhà đầu tư và cố vấn hàng đầu.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/auth/register"
                  className="bg-slate-900 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-xl hover:scale-105 transition-all shadow-xl"
                >
                  Bắt đầu ngay miễn phí
                </Link>
                <button
                  onClick={() => scrollToSection("features")}
                  className="bg-white/40 backdrop-blur-md text-slate-900 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-xl hover:bg-white/60 transition-all border-2 border-slate-900/10 cursor-pointer"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
