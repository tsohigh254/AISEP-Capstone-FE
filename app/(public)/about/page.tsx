"use client";

import Link from "next/link";
import {
  Rocket,
  Flag,
  Eye,
  Gem,
  Globe,
  AtSign,
  Network,
  Send,
  GraduationCap,
  Terminal,
  CircleDollarSign,
  LinkIcon,
  Menu,
  X,
  Mail,
  MapPin,
  BarChart,
} from "lucide-react";
import { useState } from "react";

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-manrope bg-[#FEFCE8] text-slate-900">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FACC15] text-slate-900">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">AISEP</h2>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Tính năng</Link>
            <Link href="/#roles" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Dành cho ai</Link>
            <Link href="/#trust" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Bảo mật</Link>
            <span className="text-sm font-semibold text-[#FACC15] cursor-default">Về chúng tôi</span>
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
          <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
            <Link href="/#features" className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2" onClick={() => setMobileMenuOpen(false)}>Tính năng</Link>
            <Link href="/#roles" className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2" onClick={() => setMobileMenuOpen(false)}>Dành cho ai</Link>
            <Link href="/#trust" className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2" onClick={() => setMobileMenuOpen(false)}>Bảo mật</Link>
            <span className="block text-sm font-semibold text-[#FACC15] py-2">Về chúng tôi</span>
            <Link href="/faq" className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Link href="/auth/login" className="flex-1 text-center px-4 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
              <Link href="/auth/register" className="flex-1 text-center px-4 py-2.5 text-sm font-bold bg-[#FACC15] text-slate-900 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Đăng ký</Link>
            </div>
          </div>
        )}
      </header>

      <div className="h-[73px]" />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-[#FACC15]/10 py-16 lg:py-24">
        {/* Dotted background pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#FACC15 0.5px, transparent 0.5px)", backgroundSize: "24px 24px", opacity: 0.15 }}></div>
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center rounded-full bg-[#FACC15]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-800 mb-6">
            Câu chuyện của chúng tôi
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl mb-8">
            Kiến tạo tương lai khởi nghiệp Việt{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">bằng sức mạnh AI</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            Tại AISEP, chúng tôi tin rằng công nghệ không chỉ là công cụ, mà là đòn bẩy để biến những ý tưởng táo bạo thành hiện thực. Chúng tôi xây dựng cầu nối vững chắc giữa Startup, Nhà đầu tư và Cố vấn.
          </p>
        </div>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Image Grid */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <img
                    alt="Team collaborating"
                    className="rounded-2xl shadow-lg w-full h-48 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM295LaZ9bxqpJVxllJVeSEGPJ13d63nyKWyCVDZ1NJZJiMK0IZqfmvdyWOjl_uwRpK8eqfpZN5ylBRQXDGpnnXhXInT3msReYWbLV5RqNyAj2zwp9qsiCFzDt3zioqQBfyaauaiOjIziVK48TsnYGxCHg4afw6_RZxbxUXQLAhCBzzweX8DSTpS0CnR0HqWBcSYLTfrZ-Mtc1JfM7BhbD9hjxyr21mCTBWiG1iC10cXhz9ejZcx1I_VQN81HYG-AZ15ddWbeaIQk"
                  />
                  <img
                    alt="Startups pitching"
                    className="rounded-2xl shadow-lg w-full h-64 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuB_CVZ92lHjs8Ujo_uSwsCyJ3DKc_0WZ1sxVKXjTbG_l25HtuP5-OKjgcabc6oJ5k2YVlV3M0irVmZMzRfLUlvX_wrKOSXljLN27K_ECyiXKIdHI5anJbAUuVDG177VP3FXpyeflu5tLzG8oTnluKTN2NNWd_rtzotyBDxdN2RIOFC2XqdLrCICbq0elPujf1TwSUBT-oo0b39lx3vPDtl6rxD0RINbgd7DmQ_nO-eUaui8GfAXoIXH9EAGHskIfr9q1gCVJwvcw"
                  />
                </div>
                <div className="space-y-4">
                  <img
                    alt="Brainstorming session"
                    className="rounded-2xl shadow-lg w-full h-64 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-IPO-G40oua3WT4yUcPiKHFvDDSdOBaHEWV6JQ7yX7KLMBGMeIDe1LDVyfOinN_xv3a3R6VcCu3w2ZJfJwSJev8YtI9t9epQ808h-UxroS3MXEWLDo9QXxr3tItPAPHrT2OWdopwG91irLx1znciz73u64smTOz6Q79P7A_pTkFjrszhqiVVHBF6ge1mwfA7btv96F1t-jO-C72OXfywsMySv7nb27-AxClBNVUr4FpeIh8gRGWxnTiy_sYCSwiu_OYxtTHmfU6E"
                  />
                  <img
                    alt="Tech office"
                    className="rounded-2xl shadow-lg w-full h-48 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAhX8yrqi1rEYu42LOhTob7gCLuPNn0fdECSehKr8-8VXqe9a9vuM5T5ZF0r8XFYmtbRrqoaUTBwYe35QYSOXuv8CKH_sLTENUCoodZXu8aEncJROLnyCx_C8eDxJQFn3TS5sasbQrWkwmozD_kh5aSUC-vu5yFPTk2eGbl0FvVud0ZSsh89PvqgFWqpaJZ16wSHNEfD5l3LTigK3hI4bJNZlg9CBCpgF_t6bHsHf0M417kgdN5p25Bicm2azbDM41uz9ZlEA22Ws"
                  />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-6">Sứ mệnh & Tầm nhìn</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-lg bg-[#FACC15]/20 text-slate-900">
                    <Flag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sứ mệnh</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Trao quyền cho các nhà sáng lập Việt Nam thông qua nền tảng dữ liệu minh bạch và các công cụ AI tiên tiến, giúp rút ngắn thời gian gọi vốn và tối ưu hóa nguồn lực phát triển.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-lg bg-[#FACC15]/20 text-slate-900">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Tầm nhìn</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Trở thành Hệ sinh thái khởi nghiệp số 1 Đông Nam Á vào năm 2030, nơi mọi ý tưởng đột phá đều tìm thấy nguồn lực cần thiết để vươn tầm thế giới.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex w-12 h-12 shrink-0 items-center justify-center rounded-lg bg-[#FACC15]/20 text-slate-900">
                    <Gem className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Giá trị cốt lõi</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Đổi mới sáng tạo - Minh bạch - Kết nối bền vững - Dẫn đầu công nghệ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-black text-[#FACC15] mb-2">2026</p>
              <p className="text-sm font-medium text-slate-600">Năm thành lập</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#FACC15] mb-2">5</p>
              <p className="text-sm font-medium text-slate-600">Thành viên đội ngũ</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#FACC15] mb-2">100%</p>
              <p className="text-sm font-medium text-slate-600">Tâm huyết</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ECOSYSTEM MAP ===== */}
      <section className="relative bg-[#1a1a0c] py-24 overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(250,204,21,0.1) 1px, transparent 1px)", backgroundSize: "30px 30px", opacity: 0.3 }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a0c] via-transparent to-[#1a1a0c] pointer-events-none z-10"></div>

        <div className="mx-auto max-w-7xl px-6 relative z-20">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-[#FACC15]/10 text-[#FACC15] text-xs font-bold tracking-widest uppercase mb-4 border border-[#FACC15]/20">Live Data</span>
            <h2 className="text-3xl font-black text-white sm:text-4xl mb-4">Hệ sinh thái AI thời gian thực</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Quan sát hàng ngàn kết nối được tạo ra mỗi giây giữa các Startup tiềm năng và Nhà đầu tư chiến lược trên nền tảng AISEP.
            </p>
          </div>

          {/* Interactive Map */}
          <div className="relative w-full h-[500px] bg-slate-900/50 rounded-2xl border border-[#FACC15]/20 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#FACC15]/10 flex items-center justify-center border border-[#FACC15]/50 animate-pulse" style={{ animationDuration: "3s" }}>
                  <Network className="w-10 h-10 text-[#FACC15]" />
                </div>
                <div className="absolute inset-0 rounded-full border border-[#FACC15]/30 animate-ping" style={{ animationDuration: "2s" }}></div>
              </div>
              <p className="mt-4 font-bold text-[#FACC15] text-lg tracking-widest">AISEP CORE</p>
            </div>

            {/* Node: Startups Fintech */}
            <div className="absolute top-[25%] left-[25%] animate-bounce" style={{ animationDuration: "6s" }}>
              <div className="relative group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-[#FACC15] flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(250,204,21,0.6)]">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-3 py-1 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Startups Fintech
                </div>
                {/* Connection line */}
                <div className="absolute top-1/2 left-full w-[120px] sm:w-[200px] h-[1px] bg-gradient-to-r from-[#FACC15] to-transparent origin-left rotate-[35deg] -z-10 opacity-40"></div>
              </div>
            </div>

            {/* Node: Venture Capitals */}
            <div className="absolute bottom-[25%] right-[25%] animate-bounce" style={{ animationDuration: "6s", animationDelay: "2s" }}>
              <div className="relative group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-[#FACC15] flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(250,204,21,0.6)]">
                  <CircleDollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-3 py-1 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Venture Capitals
                </div>
                <div className="absolute top-1/2 right-full w-[120px] sm:w-[200px] h-[1px] bg-gradient-to-l from-[#FACC15] to-transparent origin-right rotate-[-35deg] -z-10 opacity-40"></div>
              </div>
            </div>

            {/* Node: Mentors */}
            <div className="absolute top-[33%] right-[25%] animate-bounce" style={{ animationDuration: "6s", animationDelay: "1s" }}>
              <div className="relative group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-[#FACC15]/70 flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-1/2 left-1/2 w-[100px] sm:w-[150px] h-[1px] bg-gradient-to-r from-[#FACC15] to-transparent origin-left rotate-[-190deg] -z-10 opacity-30"></div>
              </div>
            </div>

            {/* Node: Tech */}
            <div className="absolute bottom-[33%] left-[25%] animate-bounce" style={{ animationDuration: "6s", animationDelay: "3s" }}>
              <div className="relative group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-[#FACC15]/70 flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-1/2 left-1/2 w-[100px] sm:w-[150px] h-[1px] bg-gradient-to-r from-[#FACC15] to-transparent origin-left rotate-[-20deg] -z-10 opacity-30"></div>
              </div>
            </div>

            {/* Glowing dots */}
            <div className="absolute top-[15%] left-[45%] w-2 h-2 bg-[#FACC15] rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
            <div className="absolute bottom-[20%] right-[35%] w-3 h-3 bg-yellow-200 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute top-[60%] right-[10%] w-2 h-2 bg-[#FACC15]/50 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-[40%] left-[10%] w-2 h-2 bg-[#FACC15]/50 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }}></div>
          </div>

          <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span> Hoạt động cao
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-600"></span> Chờ kết nối
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOUNDING TEAM ===== */}
      <section className="bg-[#FEFCE8] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl mb-4">Đội ngũ sáng lập</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Những con người tiên phong với khát vọng nâng tầm vị thế startup Việt trên bản đồ công nghệ thế giới.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* Member 1 */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img
                  alt="Nguyễn Văn An"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-Cf2XA-CIxqsl2k0nQT0CjBqR9BmL_bhclEgZLnM-gxNpnO8tily-MeijPKQxran5f1g9rRC9fOgoSavInnhQHzmySa7H_7gJ34ntTWVDDENycY4DkqazUVNhNHP_wVkqCaNHjA2M763A-9tL2YiNsR5i0fVtoL_V0SVfjbqDXIvVlXrA7vc5WsaKIkVXUkJ3jsEZmtudLrrbMZUcx4BSJc08o5702E4B4v4TFKiBflynMkzTNGpeESxv_YAr9ICgi5ObmjNuZHk"
                />
              </div>
              <div className="p-6 text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FACC15] text-slate-900 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Nguyễn Văn An</h3>
                <p className="text-[#FACC15] font-semibold text-sm mb-3">CEO & Co-Founder</p>
                <p className="text-slate-500 text-sm line-clamp-3">15 năm kinh nghiệm trong lĩnh vực Fintech và quản lý quỹ đầu tư mạo hiểm tại Silicon Valley.</p>
              </div>
            </div>

            {/* Member 2 */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img
                  alt="Trần Thị Mai"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLgch3t5HwGXoQmYFX7H6vsEKvlux4dO4dlTFiDfc6XL6-npcaMn_Yv3_U_6BDCcGciXRIFQ1dwev0dc8RH3ooQfp18_rStJKLqF-wFio7E-5YcF5QQdCpXk1nZF2DeIk6SJW8Ts4eM6ed0AbU8qhRg7h9FeV8wT03n3KrPAocIYSq3fLAo1UTZX-ekmCRPrFK5ArpizyldkvZSgi4V8YpSxiZPsdtZZm3PQQ3OlHbCVQUVgcwx7fNMkJFWTodLQV8jm-kb85Ac-E"
                />
              </div>
              <div className="p-6 text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FACC15] text-slate-900 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Trần Thị Mai</h3>
                <p className="text-[#FACC15] font-semibold text-sm mb-3">CTO & Co-Founder</p>
                <p className="text-slate-500 text-sm line-clamp-3">Tiến sĩ AI từ Đại học Stanford, chuyên gia hàng đầu về Machine Learning và Big Data.</p>
              </div>
            </div>

            {/* Member 3 */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img
                  alt="Lê Hoàng Nam"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp_In0qSapSM3Ew1NmaFmTFdwlYO5VeIdT9xJi-pKBHU014KR1bX40gepaW5tF17zkxXzRs_KoNUq1tt2udGsnCjW-r9kPyScz49I_lKB4Fzjl-vMlTpKpavzR10HMt8FWvSzLde9R7BwwvEevMz8KPy1jIYzaLnoIPc6PRSmUwzYmul4NBbryZ0bajHz1cRLWFV7aFqDAlpfQIKSOcuQIrDnrgrZu6uq8T05F8dwyW5EkTBwougIb7GbYfD-OSl7Y1zlWqZ3k9F4"
                />
              </div>
              <div className="p-6 text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FACC15] text-slate-900 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Lê Hoàng Nam</h3>
                <p className="text-[#FACC15] font-semibold text-sm mb-3">CPO & Co-Founder</p>
                <p className="text-slate-500 text-sm line-clamp-3">Cựu Giám đốc Sản phẩm tại các tập đoàn công nghệ lớn, chuyên gia UX/UI.</p>
              </div>
            </div>

            {/* Member 4 */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img
                  alt="Phạm Thu Hà"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3rDVN18D7nBRpR9EO2W60Prb_ll8qFYT4XipPAXVkIOKCE5pLB7F19RIgM2pDcLxdY8JVHSfyCq5_eJtX2290e--qRHPDznvP8Yav2EapyXYkRc61beSglnYp5PKl4uYz19gAEwu15RX2ksLv6kiQ1k7gQeaPkziyvIMAJD2zvMdMYesDnAzdzWAd53Lh6d0KIHQ99ONXp5zXoDo7Ilj2eWs-ZfI5Nk6iodXIzksHAT-J4V0MB5nrzyVKViOWxyxJP0I023SGkFQ"
                />
              </div>
              <div className="p-6 text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FACC15] text-slate-900 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Phạm Thu Hà</h3>
                <p className="text-[#FACC15] font-semibold text-sm mb-3">COO</p>
                <p className="text-slate-500 text-sm line-clamp-3">Chuyên gia vận hành với 10 năm kinh nghiệm xây dựng quy trình cho các startup tăng trưởng nóng.</p>
              </div>
            </div>

            {/* Member 5 */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img
                  alt="Hoàng Đức Trung"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=faces"
                />
              </div>
              <div className="p-6 text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FACC15] text-slate-900 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Hoàng Đức Trung</h3>
                <p className="text-[#FACC15] font-semibold text-sm mb-3">CFO</p>
                <p className="text-slate-500 text-sm line-clamp-3">Chuyên gia tài chính với 12 năm kinh nghiệm tại các ngân hàng đầu tư và quỹ Venture Capital hàng đầu.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <li><Link href="/#roles" className="hover:text-[#FACC15] transition-colors">Dành cho Startup</Link></li>
              <li><Link href="/#roles" className="hover:text-[#FACC15] transition-colors">Dành cho Nhà đầu tư</Link></li>
              <li><Link href="/#roles" className="hover:text-[#FACC15] transition-colors">Dành cho Cố vấn</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Sản phẩm</h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li><Link href="/#features" className="hover:text-[#FACC15] transition-colors">Xác thực Blockchain</Link></li>
              <li><Link href="/#features" className="hover:text-[#FACC15] transition-colors">Chỉ số tín nhiệm</Link></li>
              <li><Link href="/#features" className="hover:text-[#FACC15] transition-colors">Báo cáo thị trường</Link></li>
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
