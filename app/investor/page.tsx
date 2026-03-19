"use client";

import { useState } from "react";
import { InvestorShell } from "@/components/investor/investor-shell";
import Link from "next/link";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Star,
  Link2,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Eye,
  Sparkles,
  Building2,
  BarChart3,
  Settings,
  FileText,
  CheckCircle,
  Send,
  Layers,
  Target,
  Zap,
  ChevronRight,
  Filter,
  CalendarDays,
  MoreVertical,
} from "lucide-react";

// --- Dummy Data ---

const recommendedStartups = [
  {
    name: "FinNext",
    tagline: "Tài chính cá nhân dựa trên AI cho các thị trường mới nổi",
    industry: "Fintech",
    stage: "Seed",
    location: "Hồ Chí Minh",
    aiScore: 91,
    logo: "FN",
    logoColor: "bg-blue-500",
    matchReasons: ["Phù hợp với lĩnh vực fintech bạn quan tâm", "Điểm AI cao về đội ngũ và thị trường"],
    caution: null,
  },
  {
    name: "MedScan AI",
    tagline: "Nền tảng chẩn đoán thông minh cho các phòng khám nông thôn",
    industry: "Healthtech",
    stage: "Pre-Seed",
    location: "Hà Nội",
    aiScore: 87,
    logo: "MS",
    logoColor: "bg-emerald-500",
    matchReasons: ["Phù hợp với sở thích giai đoạn seed của bạn", "Mức độ xác thực phù hợp với luận điểm đầu tư"],
    caution: "Xác thực sớm",
  },
  {
    name: "EduPlatform",
    tagline: "Công cụ học tập thích ứng cho học sinh K-12",
    industry: "Edtech",
    stage: "Seed",
    location: "Đà Nẵng",
    aiScore: 84,
    logo: "EP",
    logoColor: "bg-purple-500",
    matchReasons: ["Chỉ số tăng trưởng mạnh mẽ", "Điểm năng lực đội ngũ cao"],
    caution: "Thị trường ngách",
  },
  {
    name: "AgriFlow",
    tagline: "Tối ưu hóa chuỗi cung ứng cho nông dân Đông Nam Á",
    industry: "Agri/Foodtech",
    stage: "Pre-Seed",
    location: "Cần Thơ",
    aiScore: 82,
    logo: "AF",
    logoColor: "bg-orange-500",
    matchReasons: ["Đà tăng trưởng lĩnh vực mới nổi", "Phù hợp tiêu chí đầu tư tác động của bạn"],
    caution: "Ngoài khu vực ưu tiên",
  },
  {
    name: "ShopSmart AI",
    tagline: "Thương mại đàm thoại cho các thương hiệu D2C",
    industry: "E-commerce",
    stage: "Seed",
    location: "Hồ Chí Minh",
    aiScore: 79,
    logo: "SS",
    logoColor: "bg-pink-500",
    matchReasons: ["Phù hợp mối quan tâm thương mại điện tử", "Tăng trưởng doanh thu trên mức chuẩn"],
    caution: null,
  },
];

const watchlistUpdates = [
  { startup: "FinNext", type: "Điểm AI tăng", summary: "Điểm AI đã cải thiện từ 87 lên 91 sau dữ liệu tăng trưởng mới.", time: "2 giờ trước", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  { startup: "MedScan AI", type: "Đánh giá AI mới", summary: "Báo cáo đánh giá AI mới nhất hiện đã có sẵn để xem xét.", time: "5 giờ trước", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50" },
  { startup: "EduPlatform", type: "Tài liệu được cập nhật", summary: "Pitch deck v3 và dự báo tài chính đã được tải lên.", time: "1 ngày trước", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
  { startup: "AgriFlow", type: "Trạng thái xác thực thay đổi", summary: "Trạng thái xác thực KYC đã được cập nhật thành Đã xác thực.", time: "2 ngày trước", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const recentConnections = [
  { startup: "FinNext", date: "17 Th03, 2026", status: "Chấp nhận", message: "Quan tâm đến việc thảo luận kế hoạch Series A", statusColor: "text-green-600", statusBg: "bg-green-50" },
  { startup: "MedScan AI", date: "15 Th03, 2026", status: "Đã xem", message: "Muốn tìm hiểu về công nghệ chẩn đoán của bạn", statusColor: "text-blue-600", statusBg: "bg-blue-50" },
  { startup: "ShopSmart AI", date: "14 Th03, 2026", status: "Đã gửi", message: "Khám phá cơ hội hợp tác và đầu tư", statusColor: "text-amber-600", statusBg: "bg-amber-50" },
  { startup: "AgriFlow", date: "10 Th03, 2026", status: "Từ chối", message: "Yêu cầu đầu tư cho vòng pre-seed", statusColor: "text-red-600", statusBg: "bg-red-50" },
];

const recentMessages = [
  { startup: "FinNext", logo: "FN", logoColor: "bg-blue-500", message: "Cảm ơn bạn đã quan tâm! Chúng tôi rất mong được sắp xếp cuộc gọi...", unread: true, time: "10 phút trước" },
  { startup: "MedScan AI", logo: "MS", logoColor: "bg-emerald-500", message: "Kết quả thử nghiệm mới nhất của chúng tôi được đính kèm.", unread: true, time: "2 giờ trước" },
];

// --- Component ---

export default function InvestorDashboardPage() {
  const [activeTab, setActiveTab] = useState<"recommendations" | "trending" | "watchlist">("recommendations");

  const aiRecsCount = useCountUp(7, 1200, 0);
  const watchlistCount = useCountUp(14, 1200, 150);
  const activeConns = useCountUp(3, 600, 450);

  return (
    <InvestorShell>
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* ═══════════════════════════════════════════════════
            ROW 1 — Hero Card (8 cols) + Quick Actions (4 cols)
            Same as Startup: image left, text right, badges, buttons
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          {/* Hero Card — matches startup hero exactly */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-6">
            {/* Left image — same as startup */}
            <div className="w-full md:w-48 h-48 rounded-xl bg-[#e6cc4c]/10 overflow-hidden shrink-0">
              <img
                alt="Investor brand visual"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPGo-MuNE1TA-f-CzA3CrxNhiTpXx6O33MdUq3W-IaDVQ7ym67WVsYzj_6y6DQg7FbffRXZWJQ18VrNJYBVodrdwsmss985qeqimmBjPdnV8vkYvC_Q0fjlVaghZCf_kvrqxGxP3dHivWdkDz8TKh0loaFMvqcs5oad2AIl1Y8j3vh7qi0ytZkwm8RLLxKFAiP7YQiEOYFqcO6_VLODJkRpYPEu1mAFYT3uLh98c8wUw33fLRLbsIZOwPUkI4ofRFvsVh95t_5Ghc"
              />
            </div>
            {/* Right text — same structure as startup */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#171611]">Bảng điều khiển Nhà đầu tư</h1>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-[0.1em] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ĐÃ XÁC THỰC
                  </span>
                </div>
                <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                  Khám phá các startup đầy hứa hẹn, quản lý danh sách theo dõi và nắm bắt các cơ hội đầu tư phù hợp. Bạn có <strong>7 gợi ý từ AI mới</strong> và <strong>5 cảnh báo danh sách theo dõi</strong> trong tuần này.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-bold text-[#171611]">
                    <span>Tiến độ xác thực KYC</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-3 bg-[#f4f4f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#e6cc4c] rounded-full transition-all duration-1000 ease-out" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/investor/startups" className="bg-[#e6cc4c] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 group">
                  <Building2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Khám phá Startup
                </Link>
                <Link href="/investor/profile" className="bg-[#f4f4f0] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition-all flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Xem hồ sơ công khai
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions — 2x2 grid, same as startup */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#171611]">Thao tác nhanh</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Building2, label: "Khám phá Startup", href: "/investor/startups", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Star, label: "Watchlist", href: "/investor/watchlist", color: "text-amber-500", bg: "bg-amber-50" },
                { icon: Lightbulb, label: "AI Recommendations", href: "/investor/recommendations", color: "text-purple-500", bg: "bg-purple-50" },
                { icon: BarChart3, label: "AI Investment Trends", href: "/investor/analytics", color: "text-emerald-500", bg: "bg-emerald-50" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#f8f8f6] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all group border border-transparent hover:border-neutral-100"
                >
                  <div className={cn("size-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110", item.bg)}>
                    <item.icon className={cn("w-5 h-5 transition-colors", item.color)} />
                  </div>
                  <span className="text-[11px] font-black text-[#171611] text-center leading-tight uppercase tracking-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            ROW 2 — 3 KPI Cards (5 + 4 + 3 cols)
            Same proportions as Startup: AI Score / Documents / Connections
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          {/* AI Recommendations — 5 cols, accent bg */}
          <div className="col-span-12 md:col-span-5 lg:col-span-5 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all">
            <div>
              <p className="text-neutral-500 text-sm font-bold mb-1 uppercase tracking-widest">Gợi ý từ AI mới</p>
              <div className="flex items-baseline gap-3">
                <span ref={aiRecsCount.ref} className="text-4xl font-bold text-[#171611]">{aiRecsCount.count}</span>
                <span className="text-neutral-500 text-sm font-bold lowercase">phù hợp</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-[#e6cc4c]" />
            </div>
          </div>

          {/* Watchlist — 4 cols, accent bg */}
          <Link href="/investor/watchlist" className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all">
            <div>
              <p className="text-neutral-500 text-sm font-bold mb-1 uppercase tracking-widest">Watchlist</p>
              <div className="flex items-baseline gap-3">
                <span ref={watchlistCount.ref} className="text-4xl font-bold text-[#171611]">{watchlistCount.count}</span>
                <span className="text-neutral-500 text-sm font-bold lowercase">startup</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7 text-[#e6cc4c]" />
            </div>
          </Link>

          {/* Active Connections — 3 cols, neutral bg */}
          <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between group hover:bg-[#f8f8f6] transition-colors">
            <div>
              <p className="text-neutral-500 text-sm font-bold mb-1 uppercase tracking-widest">Kết nối</p>
              <div className="flex items-baseline gap-3">
                <span ref={activeConns.ref} className="text-4xl font-bold text-[#171611]">{String(activeConns.count).padStart(2, '0')}</span>
                <span className="text-neutral-500 text-sm font-bold lowercase tracking-tight">Hoạt động</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#f4f4f0] flex items-center justify-center group-hover:bg-white transition-colors">
              <Link2 className="w-7 h-7 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            ROW 3 — Full-width section with tabs
            Same as Startup "Cần xử lý" → "Top AI Startup Recommendations"
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-lg text-[#171611]">Gợi ý Startup hàng đầu từ AI</h3>
              <div className="flex gap-1 bg-[#f4f4f0] p-1 rounded-xl">
                {[
                  { key: "recommendations" as const, label: "Lựa chọn AI" },
                  { key: "trending" as const, label: "Xu hướng" },
                  { key: "watchlist" as const, label: "Mới theo dõi" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-lg transition-colors",
                      activeTab === tab.key
                        ? "bg-white shadow-sm text-[#171611]"
                        : "text-neutral-500 hover:text-[#171611]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-neutral-100">
              {recommendedStartups.slice(0, 3).map((startup, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#f8f8f6] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs", startup.logoColor)}>
                      {startup.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#171611]">{startup.name}</p>
                        <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-tight">{startup.industry}</span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tight">{startup.stage}</span>
                        <span className="text-[11px] text-neutral-400">{startup.location}</span>
                      </div>
                      <p className="text-xs text-neutral-500 font-medium italic mt-0.5">
                        Điểm AI: {startup.aiScore} — {startup.matchReasons[0]}
                      </p>
                    </div>
                  </div>
                  <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Xem hồ sơ</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            ROW 4 — Left (4 cols) + Right (8 cols)
            Same as Startup: AI Evaluation Summary + Recent Documents
            → Investor Preferences + Watchlist Updates table
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Investment Preferences — same as AI Evaluation Summary */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-[#e6cc4c]" />
              <h3 className="font-bold text-lg text-[#171611]">Ưu tiên đầu tư</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                  <TrendingUp className="w-4 h-4" /> Lĩnh vực tập trung
                </p>
                <ul className="text-xs text-blue-700 space-y-1.5 list-disc ml-4 font-medium">
                  <li>Fintech, Thương mại điện tử, Healthtech</li>
                  <li>Startup giai đoạn Pre-Seed & Seed</li>
                  <li>Việt Nam & Đông Nam Á</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                  <AlertTriangle className="w-4 h-4" /> Tiêu chí
                </p>
                <ul className="text-xs text-amber-700 space-y-1.5 list-disc ml-4 font-medium">
                  <li>Khoảng điểm AI: 75 – 100</li>
                  <li>Điểm mạnh: Đội ngũ, Sự phù hợp thị trường, Đà tăng trưởng</li>
                </ul>
              </div>
            </div>
            <Link href="/investor/settings" className="mt-4 block w-full text-center bg-[#f4f4f0] text-[#171611] font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-200 transition-all text-sm">
              <Settings className="w-4 h-4 inline mr-2" />
              Chỉnh sửa ưu tiên
            </Link>
          </div>

          {/* Right: Watchlist Updates — same as Recent Documents table */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#171611]">Cập nhật danh sách theo dõi</h3>
              <Link href="/investor/watchlist" className="text-[#e6cc4c] font-bold text-sm hover:underline tracking-tight">Xem tất cả</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8f8f6]">
                  <tr className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest">
                    <th className="px-6 py-3 tracking-[0.1em]">STARTUP</th>
                    <th className="px-6 py-3 tracking-[0.1em]">LOẠI CẬP NHẬT</th>
                    <th className="px-6 py-3 tracking-[0.1em]">THỜI GIAN</th>
                    <th className="px-6 py-3 text-right pr-10">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {watchlistUpdates.map((update, idx) => (
                    <tr key={idx} className="hover:bg-[#f8f8f6]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <update.icon className={cn("w-5 h-5", update.color)} />
                          <span className="text-sm font-bold text-[#171611]">{update.startup}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-tight">{update.type}</td>
                      <td className="px-6 py-4 text-xs font-bold text-neutral-500 tracking-tight">{update.time}</td>
                      <td className="px-6 py-4 text-right pr-6">
                        <button className="text-neutral-400 hover:text-[#171611] transition-colors p-1 rounded-lg hover:bg-[#f4f4f0]">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            ROW 5 — Full-width section, 2-col grid inside
            Same as Startup: Consulting & Advisors sessions
            → Recent Connections + Messages
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6 pb-12">
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h3 className="font-bold text-lg text-[#171611] mb-6 tracking-tight">Kết nối & Tin nhắn gần đây</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentConnections.map((conn, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#f8f8f6] rounded-xl hover:shadow-md transition-shadow group cursor-pointer border border-transparent hover:border-[#e6cc4c]/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#e6cc4c]/20 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                      <Send className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#171611]">{conn.startup}</p>
                      <p className="text-xs text-neutral-500 font-medium italic">{conn.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#171611]">{conn.date}</p>
                    <p className={cn("text-[10px] font-black uppercase tracking-wider", conn.statusColor)}>{conn.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </InvestorShell>
  );
}
