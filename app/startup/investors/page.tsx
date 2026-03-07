"use client";

import React, { useState } from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Star,
  Briefcase,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Send,
  UserCheck,
  LayoutDashboard,
  Sparkles,
  Building2,
  Calendar,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { InvestorConnectionModal } from "@/components/startup/investor-connection-modal";

const investors = [
  {
    id: 1,
    name: "VinaCapital Ventures",
    title: "Quỹ đầu tư mạo hiểm công nghệ",
    partner: null,
    logo: "https://lh3.googleusercontent.com/pw/AP1GczPl_9q8g_o1u6vI6z9X8uC7eY-F6r7k2D9f9S0m4b3q5p7_=s200-c",
    portfolio: "45+",
    ticketSize: "$500k-2M",
    matchRate: "85%",
    tags: ["Fintech", "B2B SaaS", "Logistics"]
  },
  {
    id: 2,
    name: "Trần Thu Hà",
    title: "Managing Partner tại Alpha VC",
    partner: null,
    logo: "https://lh3.googleusercontent.com/pw/AP1GczO2v_6W6K_2L1u7R8o9j9X0m5b4q6p8_=s200-c",
    portfolio: "12+",
    ticketSize: "$100k-500k",
    matchRate: "92%",
    tags: ["HealthTech", "AI"]
  },
  {
    id: 3,
    name: "Mekong Capital",
    title: "Quỹ tăng trưởng Private Equity",
    partner: null,
    logo: "https://lh3.googleusercontent.com/pw/AP1GczN7v_5W5K_1L0u6R7o8j8X9m4b3q5p7_=s200-c",
    portfolio: "35+",
    ticketSize: "$2M - $5M",
    matchRate: "Low",
    tags: ["Retail", "Consumer"]
  },
  {
    id: 4,
    name: "Nextrans",
    title: "Quỹ đầu tư hạt giống",
    partner: null,
    logo: "https://lh3.googleusercontent.com/pw/AP1GczM6v_4W4K_0L9u5R6o7j7X8m3b2q4p6_=s200-c",
    portfolio: "60+",
    ticketSize: "$50k-150k",
    matchRate: "70%",
    tags: ["Early Stage", "GreenTech"]
  }
];

const sentRequests = [
  {
    id: 1,
    investor: {
      name: "VinaCapital Ventures",
      logo: "https://lh3.googleusercontent.com/pw/AP1GczPl_9q8g_o1u6vI6z9X8uC7eY-F6r7k2D9f9S0m4b3q5p7_=s200-c",
      type: "Venture Capital"
    },
    message: "Chúng tôi đang tìm kiếm đối tác chiến lược...",
    docs: 2,
    date: "12/03/2024",
    status: "SENT",
    statusLabel: "SENT",
    statusColor: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    id: 2,
    investor: {
      name: "CyberAgent Capital",
      logo: "https://lh3.googleusercontent.com/pw/AP1GczO2v_6W6K_2L1u7R8o9j9X0m5b4q6p8_=s200-c",
      type: "Global Fund"
    },
    message: "Mong muốn thảo luận về giải pháp AI ứng dụn...",
    docs: 1,
    date: "08/03/2024",
    status: "ACCEPTED",
    statusLabel: "ACCEPTED",
    statusColor: "bg-green-50 text-green-600 border-green-100"
  },
  {
    id: 3,
    investor: {
      name: "Mekong Capital",
      logo: "https://lh3.googleusercontent.com/pw/AP1GczN7v_5W5K_1L0u6R7o8j8X9m4b3q5p7_=s200-c",
      type: "Private Equity"
    },
    message: "Giới thiệu về mạng lưới khách hàng B2B hiện...",
    docs: 3,
    date: "28/02/2024",
    status: "REJECTED",
    statusLabel: "REJECTED",
    statusColor: "bg-red-50 text-red-600 border-red-100"
  }
];

const connectedInvestors = [
  {
    id: 1,
    investor: {
      name: "CyberAgent Capital",
      logo: "https://lh3.googleusercontent.com/pw/AP1GczO2v_6W6K_2L1u7R8o9j9X0m5b4q6p8_=s200-c",
      type: "Global Fund"
    },
    pendingInfo: "2 yêu cầu mới",
    lastMessage: "“Vui lòng gửi bản cập nhật báo cáo...”",
    date: "12/03/2024"
  },
  {
    id: 2,
    investor: {
      name: "VinaCapital Ventures",
      logo: "https://lh3.googleusercontent.com/pw/AP1GczPl_9q8g_o1u6vI6z9X8uC7eY-F6r7k2D9f9S0m4b3q5p7_=s200-c",
      type: "Venture Capital"
    },
    pendingInfo: null,
    lastMessage: "“Cảm ơn bạn, chúng tôi sẽ xem xét...”",
    date: "05/03/2024"
  },
  {
    id: 3,
    investor: {
      name: "Do Ventures",
      logo: "https://lh3.googleusercontent.com/pw/AP1GczN7v_5W5K_1L0u6R7o8j8X9m4b3q5p7_=s200-c",
      type: "Seed Fund"
    },
    pendingInfo: "1 yêu cầu mới",
    lastMessage: "“Hẹn gặp team vào thứ 4 tuần tới...”",
    date: "28/02/2024"
  }
];

export default function InvestorsPage() {
  const [activeTab, setActiveTab] = useState("Khám phá");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);

  const handleOpenRequest = (investor: any) => {
    setSelectedInvestor({
      name: investor.name,
      logo: investor.logo,
      type: investor.title || investor.type
    });
    setIsRequestModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Khám phá":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-4">
              <div className="relative w-full lg:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <Input
                  key="investor-search"
                  placeholder="Tìm theo tên quỹ hoặc nhà đầu tư..."
                  className="w-full pl-12 h-12 bg-[#f8fafc]/50 dark:bg-slate-800/50 border-none rounded-xl text-sm font-bold focus:ring-1 focus:ring-yellow-400/30 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {["Giai đoạn", "Ngành nghề ưu tiên", "Quy mô đầu tư"].map((label) => (
                  <div key={label} className="h-12 px-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer group hover:bg-slate-50 transition-all">
                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{label}</span>
                    <ChevronDown className="size-4 text-slate-400 group-hover:text-slate-900" />
                  </div>
                ))}
                <Button variant="outline" className="h-12 px-5 border-none bg-slate-100/50 hover:bg-slate-100 text-slate-700 dark:text-white rounded-xl text-[12px] font-bold gap-2">
                  <SlidersHorizontal className="size-4" />
                  <span>Lọc nâng cao</span>
                </Button>
              </div>
            </div>

            {/* Investor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {investors.map((investor) => (
                <div key={investor.id} className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-yellow-500/5 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden">
                  <div className="p-8 text-center space-y-6">
                    <div className="relative mx-auto size-24">
                      <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100" />
                      <img
                        src={investor.logo}
                        alt={investor.name}
                        className="relative size-24 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-md transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-black text-slate-900 dark:text-white group-hover:text-[#eec54e] transition-colors leading-tight">{investor.name}</h3>
                      <p className="text-[12px] text-slate-400 font-semibold mt-1.5">{investor.title}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-50 dark:border-slate-800">
                      <div className="text-center">
                        <p className="text-[14px] font-black text-slate-900 dark:text-white leading-none">{investor.portfolio}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Portfolio</p>
                      </div>
                      <div className="text-center border-x border-slate-50 dark:border-slate-800">
                        <p className="text-[14px] font-black text-slate-900 dark:text-white leading-none truncate">{investor.ticketSize}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Ticket Size</p>
                      </div>
                      <div className="text-center">
                        <p className={cn(
                          "text-[14px] font-black leading-none",
                          investor.matchRate === "Low" ? "text-slate-400" : "text-green-500"
                        )}>{investor.matchRate}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Phản hồi</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1.5">
                      {investor.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-[#f8fafc] dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 rounded-full border border-slate-50 dark:border-slate-700 tracking-tight">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Link href={`/startup/investors/${investor.id}`} className="flex-1">
                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-[13px] hover:bg-slate-50">
                          Xem hồ sơ
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleOpenRequest(investor)}
                        className="flex-1 h-12 rounded-xl bg-[#eec54e] hover:bg-[#d4ae3d] text-white font-bold text-[13px] shadow-sm"
                      >
                        Gửi lời mời
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Status */}
            <div className="pt-8 flex flex-col items-center gap-6">
              <p className="text-[13px] font-bold text-slate-400">Hiển thị 1 - 4 trong tổng số 120+ nhà đầu tư & quỹ</p>
              <div className="flex items-center gap-2">
                <button className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400"><ChevronLeft className="size-5" /></button>
                {[1, 2, 3, '...', 30].map((p, i) => (
                  <button
                    key={i}
                    className={cn(
                      "size-10 flex items-center justify-center rounded-xl text-[14px] font-bold transition-all",
                      p === 1 ? "bg-[#eec54e] text-white shadow-lg shadow-yellow-500/20" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400"><ChevronRight className="size-5" /></button>
              </div>
            </div>
          </div>
        );

      case "Yêu cầu đã gửi":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="relative w-full lg:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input key="sent-requests-search" placeholder="Tìm kiếm nhà đầu tư..." className="w-full pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Trạng thái:</span>
                <div className="h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-10 cursor-pointer min-w-[140px] justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Tất cả</span>
                  <ChevronDown className="size-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Nhà đầu tư</th>
                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Thông điệp</th>
                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Tài liệu</th>
                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Ngày gửi</th>
                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Trạng thái</th>
                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sentRequests.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={item.investor.logo} alt="" className="size-10 rounded-lg object-cover border border-slate-100 shadow-sm" />
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#eec54e] transition-colors">{item.investor.name}</p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{item.investor.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 max-w-[300px]">
                        <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium truncate">{item.message}</p>
                      </td>
                      <td className="px-8 py-6 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2 text-[13px] font-bold">
                          <FileText className="size-4" />
                          <span>{item.docs}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center text-[13px] font-black text-slate-500 uppercase tracking-tight opacity-70">
                        {item.date}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border tracking-widest", item.statusColor)}>
                          • {item.statusLabel}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                          <MoreVertical className="size-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Status */}
            <div className="pt-6 flex items-center justify-between">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị 1-3 trong số 12 lời mời</p>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronLeft className="size-4" /></button>
                <button className="size-8 rounded-lg bg-[#eec54e] text-white text-[12px] font-bold">1</button>
                <button className="size-8 rounded-lg border border-slate-200 text-slate-500 text-[12px] font-bold">2</button>
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        );

      case "Đã kết nối":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="relative w-full lg:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input key="connected-investors-search" placeholder="Tìm kiếm nhà đầu tư..." className="w-full pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Ngành:</span>
                  <div className="h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-10 cursor-pointer min-w-[160px] justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Tất cả ngành</span>
                    <ChevronDown className="size-4 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Giai đoạn:</span>
                  <div className="h-11 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-10 cursor-pointer min-w-[160px] justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Tất cả giai đoạn</span>
                    <ChevronDown className="size-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Nhà đầu tư</th>
                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Yêu cầu thông tin</th>
                    <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Tin nhắn cuối</th>
                    <th className="px-8 py-5 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Ngày kết nối</th>
                    <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {connectedInvestors.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={item.investor.logo} alt="" className="size-10 rounded-lg object-cover border border-slate-100 shadow-sm" />
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#eec54e] transition-colors">{item.investor.name}</p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{item.investor.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {item.pendingInfo ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100 animate-pulse">
                            <span className="text-[18px] leading-none mb-0.5">!</span>
                            <span className="text-[11px] font-black uppercase tracking-tight">{item.pendingInfo}</span>
                          </div>
                        ) : (
                          <p className="text-[12px] text-slate-400 font-medium italic">Không có yêu cầu mới</p>
                        )}
                      </td>
                      <td className="px-8 py-6 max-w-[350px]">
                        <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium italic border-l-2 border-slate-100 dark:border-slate-800 pl-4">{item.lastMessage}</p>
                      </td>
                      <td className="px-8 py-6 text-center text-[13px] font-black text-slate-500 uppercase tracking-tight opacity-70">
                        {item.date}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Button className="h-10 px-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-slate-900 dark:text-white border-none text-[12px] font-black gap-2 hover:bg-[#eec54e] hover:text-white transition-all group/btn">
                            <MessageCircle className="size-4 group-hover/btn:scale-110 transition-transform" />
                            <span>Nhắn tin</span>
                          </Button>
                          <button className="px-3 py-2 text-[12px] font-black text-slate-400 hover:text-slate-900 border border-slate-100 rounded-xl transition-all">
                            Xem yêu cầu
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <MoreVertical className="size-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-6 flex items-center justify-between">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị 1-3 trong số 8 kết nối</p>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronLeft className="size-4" /></button>
                <button className="size-8 rounded-lg bg-[#eec54e] text-white text-[12px] font-bold">1</button>
                <button className="size-8 rounded-lg border border-slate-200 text-slate-500 text-[12px] font-bold">2</button>
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <StartupShell>
      <div className="max-w-[1440px] mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400">
          <Link href="/startup" className="hover:text-slate-600 transition-colors">Workspace</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-slate-600 font-semibold">Kết nối nhà đầu tư</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-[32px] font-black text-slate-900 tracking-tighter leading-none">Kết nối Nhà đầu tư & Quỹ đầu tư</h1>
            <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-[600px]">
              Khám phá và kết nối với các đối tác tài chính chiến lược tiềm năng để đưa startup của bạn lên tầm cao mới.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-1 px-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 rounded-full flex items-center gap-2">
              <Sparkles className="size-3 text-blue-500" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Gợi ý AI</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-10">
          {["Khám phá", "Yêu cầu đã gửi", "Đã kết nối", "Portfolio mẫu"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-4 text-[15px] font-bold tracking-tight transition-all",
                activeTab === tab
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#eec54e] rounded-full animate-in slide-in-from-left-2 duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Footer Credits */}
        <div className="text-center pt-10 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">© 2026 AISEP STARTUP WORKSPACE • HỆ THỐNG KẾT NỐI NHÀ ĐẦU TƯ & QUỸ ĐẦU TƯ</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Điều khoản</Link>
            <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Bảo mật</Link>
            <Link href="#" className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Liên hệ</Link>
          </div>
        </div>

        {/* Modals */}
        <InvestorConnectionModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          investor={selectedInvestor}
        />
      </div>
    </StartupShell>
  );
}
