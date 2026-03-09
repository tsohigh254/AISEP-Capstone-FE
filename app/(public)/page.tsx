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
import { useCallback, useState } from "react";
import { AnimatedNumber } from "@/lib/useCountUp";

export default function PublicHomePage() {
  const [activeRole, setActiveRole] = useState<"startup" | "investor" | "advisor">("startup");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-manrope bg-[#FEFCE8] text-slate-900">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15] text-slate-900">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">AISEP</h2>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors" onClick={() => scrollToSection("features")}>Tính năng</button>
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors" onClick={() => scrollToSection("roles")}>Dành cho ai</button>
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors" onClick={() => scrollToSection("trust")}>Bảo mật</button>
            <Link href="/about" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Về chúng tôi</Link>
            <Link href="/faq" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center justify-center px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="hidden sm:flex items-center justify-center px-6 py-2.5 text-sm font-bold bg-[#FACC15] text-slate-900 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Đăng ký
            </Link>
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3 animate-in slide-in-from-top-2">
            <button className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2 text-left w-full" onClick={() => { scrollToSection("features"); setMobileMenuOpen(false); }}>Tính năng</button>
            <button className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2 text-left w-full" onClick={() => { scrollToSection("roles"); setMobileMenuOpen(false); }}>Dành cho ai</button>
            <button className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2 text-left w-full" onClick={() => { scrollToSection("trust"); setMobileMenuOpen(false); }}>Bảo mật</button>
            <Link href="/about" className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2 text-left w-full" onClick={() => setMobileMenuOpen(false)}>Về chúng tôi</Link>
            <Link href="/faq" className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2 text-left w-full" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Link href="/auth/login" className="flex-1 text-center px-4 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
              <Link href="/auth/register" className="flex-1 text-center px-4 py-2.5 text-sm font-bold bg-[#FACC15] text-slate-900 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Đăng ký</Link>
            </div>
          </div>
        )}
      </header>

      <div className="h-[73px]" />

      <main className="flex-1">
        {/* ===== HERO SECTION ===== */}
        <section className="relative mx-auto max-w-[1280px] px-4 sm:px-6 py-10 sm:py-16 lg:px-10 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-black leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
                  Nền tảng vận hành Hệ sinh thái Khởi nghiệp toàn diện
                </h1>
                <p className="text-lg font-medium text-slate-500">
                  A comprehensive startup ecosystem operation platform.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[#FACC15]/10 px-4 py-2 border border-[#FACC15]/20">
                  <ShieldCheck className="h-4 w-4 text-slate-800" />
                  <span className="text-sm font-semibold text-slate-800">Minh bạch quy trình</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#FACC15]/10 px-4 py-2 border border-[#FACC15]/20">
                  <Lock className="h-4 w-4 text-slate-800" />
                  <span className="text-sm font-semibold text-slate-800">Bảo vệ tính toàn vẹn tài liệu</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#FACC15]/10 px-4 py-2 border border-[#FACC15]/20">
                  <Network className="h-4 w-4 text-slate-800" />
                  <span className="text-sm font-semibold text-slate-800">Kết nối &amp; cố vấn có kiểm soát</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/register"
                  className="flex min-w-[160px] items-center justify-center rounded-xl bg-[#FACC15] px-8 py-4 text-base font-bold text-slate-900 shadow-xl shadow-[#FACC15]/20 hover:shadow-[#FACC15]/40 hover:-translate-y-0.5 transition-all"
                >
                  Bắt đầu ngay
                </Link>
                <button
                  onClick={() => scrollToSection("features")}
                  className="flex min-w-[160px] items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Xem nền tảng
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-[#FACC15]/30 to-slate-200 overflow-hidden shadow-2xl border-8 border-white">
                <div
                  className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000')",
                  }}
                />
                <div className="relative h-full w-full p-6 flex flex-col justify-end bg-gradient-to-t from-slate-900/40 to-transparent">
                  <div className="w-1/2 h-4 bg-white/30 rounded mb-2"></div>
                  <div className="w-1/3 h-4 bg-white/20 rounded"></div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden md:block w-48 h-48 bg-[#FACC15] rounded-2xl -z-10 opacity-20 blur-2xl"></div>
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
              <div className="w-12 h-12 bg-[#FACC15] rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-[#FACC15]/20">
                <Network className="h-7 w-7" />
              </div>
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
                        placeholder="Ví dụ: Review kế hoạch tài chính năm 2024..."
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

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-white py-12 sm:py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center text-slate-900">
                <Network className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase">AISEP</h1>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Chuẩn hóa dữ liệu doanh nghiệp và kết nối đầu tư thông minh.
            </p>
          </div>

          <div>
            <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Hệ sinh thái</h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => scrollToSection("roles")}>Dành cho Startup</button></li>
              <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => scrollToSection("roles")}>Dành cho Nhà đầu tư</button></li>
              <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => scrollToSection("roles")}>Dành cho Cố vấn</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Sản phẩm</h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => scrollToSection("features")}>Xác thực Blockchain</button></li>
              <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => scrollToSection("features")}>Chỉ số tín nhiệm</button></li>
              <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => scrollToSection("features")}>Báo cáo thị trường</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Liên hệ</h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-[#FACC15]" /> contact@aisep.vn</li>
              <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-[#FACC15]" /> TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-sm font-bold text-slate-500">© 2024 AISEP. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-8">
            <button className="text-slate-500 hover:text-[#FACC15] transition-colors">
              <BarChart className="h-5 w-5" />
            </button>
            <button className="text-slate-500 hover:text-[#FACC15] transition-colors">
              <AtSign className="h-5 w-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
