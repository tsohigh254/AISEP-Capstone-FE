"use client";

import React, { useState } from "react";
import { InvestorShell } from "@/components/investor/investor-shell";
import { 
  Search, 
  ChevronDown, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  MessageCircle, 
  UserPlus,
  Check,
  X,
  Building2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RECEIVED = [
  {
    id: "CON-7001",
    startupName: "TechAlpha Co.",
    industry: "SaaS & AI",
    message: "Chúng tôi rất ấn tượng với danh mục đầu tư của VinaCapital và mong muốn được trình bày về giải pháp AI Marketplace của mình.",
    requestedAt: "2024-05-15T10:30:00Z",
    status: "Pending",
    logo: "TA",
    restrictionStatus: {
      isFlagged: true,
      reason: "Tần suất gửi yêu cầu quá cao trong 24h qua",
      type: "Spam"
    }
  },
  {
    id: "CON-7002",
    startupName: "MediChain AI",
    industry: "HealthTech",
    message: "MediChain đang tìm kiếm đối tác chiến lược có kinh nghiệm trong lĩnh vực công nghệ y tế tại Đông Nam Á.",
    requestedAt: "2024-05-14T08:15:00Z",
    status: "Pending",
    logo: "MC"
  }
];

const MOCK_SENT = [
  {
    id: "CON-8001",
    startupName: "GreenEats",
    industry: "FoodTech",
    message: "Tôi đã theo dõi dự án của bạn từ vòng Pre-seed và rất ấn tượng với tốc độ tăng trưởng. Hãy kết nối để thảo luận về vòng Series A.",
    requestedAt: "2024-05-12T14:20:00Z",
    status: "Pending",
    logo: "GE"
  }
];

const MOCK_CONNECTED = [
  {
    id: "CON-9001",
    startupName: "EduNova",
    industry: "EdTech",
    connectedAt: "2024-05-01T09:00:00Z",
    lastMessage: "Cảm ơn anh đã phản hồi. Chúng tôi sẽ gửi Pitch Deck bản cập nhật vào chiều nay.",
    logo: "EN"
  },
  {
    id: "CON-9002",
    startupName: "AgriSmart",
    industry: "AgriTech",
    connectedAt: "2024-04-25T16:45:00Z",
    lastMessage: "Lịch họp vào thứ 3 tuần tới đã bộ phận thư ký xác nhận rồi ạ.",
    logo: "AS",
    restrictionStatus: {
      isFlagged: true,
      reason: "Startup có dấu hiệu spam nội dung tin nhắn hàng loạt",
      type: "Abuse"
    }
  }
];

// ── Helpers ──────────────────────────────────────────────────────────────────

import { AlertTriangle, Info } from "lucide-react";

function RestrictionBadge({ status }: { status?: { isFlagged: boolean; reason: string; type: string } }) {
  if (!status?.isFlagged) return null;

  return (
    <div className="group relative">
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border animate-pulse",
        status.type === "Spam" 
          ? "bg-amber-50 text-amber-600 border-amber-100" 
          : "bg-red-50 text-red-600 border-red-100"
      )}>
        <AlertTriangle className="size-3" />
        {status.type}
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl border border-white/10">
        <div className="flex items-start gap-2">
          <Info className="size-3 mt-0.5 text-[#e6cc4c]" />
          <div>
            <p className="font-bold text-[#e6cc4c] mb-1">Cảnh báo hệ thống</p>
            <p className="font-medium text-slate-300 leading-relaxed">{status.reason}</p>
          </div>
        </div>
        <div className="absolute top-full left-4 w-2 h-2 bg-slate-900 rotate-45 -translate-y-1" />
      </div>
    </div>
  );
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

function StartupAvatar({ name, logo, size = "size-10" }: { name: string; logo: string; size?: string }) {
  const gradients = [
    "from-violet-500 to-violet-600",
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600"
  ];
  const idx = name.length % gradients.length;
  
  return (
    <div className={cn(size, "rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-black/5", gradients[idx])}>
      {logo}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function Switch({ isChecked, onChange }: { isChecked: boolean, onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className={cn(
        "relative w-10 h-6 rounded-full transition-all duration-300 outline-none focus:ring-4 focus:ring-yellow-400/10",
        isChecked ? "bg-[#e6cc4c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" : "bg-slate-200"
      )}
    >
      <div 
        className={cn(
          "absolute top-1 left-1 size-4 bg-white rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center",
          isChecked ? "translate-x-4" : "translate-x-0"
        )}
      >
        {isChecked && <div className="size-1.5 rounded-full bg-[#e6cc4c] scale-50" />}
      </div>
    </button>
  );
}

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("received");
  const [isReceiving, setIsReceiving] = useState(true);

  const Pagination = ({ page = 1, total = 2 }) => (
    <div className="flex items-center gap-2.5">
      <button className="size-10 flex items-center justify-center rounded-xl border border-slate-50 text-slate-300 transition-colors" disabled>
        <ChevronLeft className="size-4" />
      </button>
      <button className="size-10 rounded-xl flex items-center justify-center text-[14px] font-bold bg-[#eec54e] text-white shadow-lg shadow-yellow-500/20 border border-[#eec54e] transition-all">
        1
      </button>
      <button className="size-10 rounded-xl flex items-center justify-center text-[14px] font-bold bg-white text-slate-500 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all">
        2
      </button>
      <button className="size-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50 transition-colors">
        <ChevronRight className="size-4" />
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-[32px] font-black text-[#171611] tracking-tight leading-none">Kết nối Startup</h1>
          <p className="text-slate-400 text-[15px] font-medium leading-relaxed max-w-[600px]">
            Quản lý các yêu cầu kết nối từ các Startup và duy trì mối quan hệ đầu tư bền vững.
          </p>
        </div>

        {/* Status Toggle Card */}
        <div className={cn(
          "bg-white rounded-2xl border p-4 shadow-sm min-w-0 lg:min-w-[320px] transition-all duration-500",
          isReceiving ? "border-slate-200" : "border-amber-200 bg-amber-50/20"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "size-2.5 rounded-full transition-all duration-500",
                isReceiving ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-300"
              )} />
              <span className="text-[13px] font-black text-slate-700 uppercase tracking-widest">Nhận yêu cầu mới</span>
            </div>
            <Switch isChecked={isReceiving} onChange={() => setIsReceiving(!isReceiving)} />
          </div>
          <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
            Trạng thái: {isReceiving ? <span className="text-emerald-600">Đang bật</span> : <span className="text-amber-600">Đang tạm dừng</span>}
          </p>
        </div>
      </div>

      {/* Warning Banner when disabled */}
      {!isReceiving && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-amber-900">Tính năng nhận yêu cầu đang tắt</p>
            <p className="text-[12px] text-amber-700/80 font-medium">Các Startup sẽ không thể tìm thấy hồ sơ của bạn cho đến khi trạng thái này được bật lại. Các kết nối hiện tại vẫn có thể nhắn tin bình thường.</p>
          </div>
          <button 
            onClick={() => setIsReceiving(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[12px] font-bold hover:bg-amber-700 transition-colors shadow-sm"
          >
            Bật lại ngay
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-10">
        {[
          { id: "received", label: "Lời mời nhận được", icon: ArrowDownLeft, count: MOCK_RECEIVED.length },
          { id: "sent", label: "Yêu cầu đã gửi", icon: ArrowUpRight, count: MOCK_SENT.length },
          { id: "connected", label: "Đã kết nối", icon: UserPlus, count: MOCK_CONNECTED.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative pb-4 text-[14px] font-bold tracking-tight transition-all flex items-center gap-2",
              activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className={cn("size-4", activeTab === tab.id ? "text-[#e6cc4c]" : "text-slate-300")} />
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                activeTab === tab.id ? "bg-[#e6cc4c] text-[#171611]" : "bg-slate-100 text-slate-400"
              )}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Filters/Search Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input 
            placeholder="Tìm kiếm startup..." 
            className="w-full pl-10 h-11 bg-white border-slate-200 rounded-xl text-[13px] font-medium focus:ring-1 focus:ring-yellow-400/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-black text-slate-300 uppercase tracking-widest">Sắp xếp:</span>
          <div className="h-11 px-4 bg-white border border-slate-200 rounded-xl flex items-center gap-6 cursor-pointer min-w-[160px] justify-between group hover:border-[#e6cc4c]/40 transition-all">
            <span className="text-[13px] font-semibold text-slate-700">Mới nhất</span>
            <ChevronDown className="size-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Startup</th>
              <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Thông điệp</th>
              <th className="px-8 py-5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Thời gian</th>
              <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            
            {/* Lời mời nhận được */}
            {activeTab === "received" && (
              MOCK_RECEIVED.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 text-sm font-medium italic">Không có yêu cầu kết nối mới</td></tr>
              ) : (
                MOCK_RECEIVED.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <StartupAvatar name={item.startupName} logo={item.logo} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[15px] font-semibold text-slate-900 group-hover:text-[#C8A000] transition-colors">{item.startupName}</p>
                            <RestrictionBadge status={(item as any).restrictionStatus} />
                          </div>
                          <p className="text-[12px] text-slate-400 font-medium">{item.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-[400px]">
                      <p className="text-[13px] text-slate-600 font-medium leading-relaxed line-clamp-2 italic border-l-2 border-slate-100 pl-4">{item.message}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <p className="text-[13px] font-bold text-slate-700">{formatDate(item.requestedAt)}</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Đang chờ</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="h-10 px-4 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-[13px] flex items-center gap-2">
                          <X className="size-4" />
                          Từ chối
                        </button>
                        <button className="h-10 px-4 rounded-xl bg-[#e6cc4c] text-[#171611] hover:shadow-lg transition-all font-bold text-[13px] flex items-center gap-2">
                          <Check className="size-4" />
                          Chấp nhận
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}

            {/* Yêu cầu đã gửi */}
            {activeTab === "sent" && (
              MOCK_SENT.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 text-sm font-medium italic">Bạn chưa gửi yêu cầu kết nối nào</td></tr>
              ) : (
                MOCK_SENT.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <StartupAvatar name={item.startupName} logo={item.logo} />
                        <div>
                          <p className="text-[15px] font-semibold text-slate-900 group-hover:text-[#C8A000] transition-colors">{item.startupName}</p>
                          <p className="text-[12px] text-slate-400 font-medium">{item.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-[400px]">
                      <p className="text-[13px] text-slate-600 font-medium leading-relaxed line-clamp-2 italic border-l-2 border-slate-100 pl-4">{item.message}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center text-slate-400">
                        <p className="text-[13px] font-bold">{formatDate(item.requestedAt)}</p>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Đã gửi</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-slate-400 hover:text-red-500 font-bold text-[12px] uppercase tracking-widest transition-colors">Thu hồi</button>
                        <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors border border-slate-100 rounded-lg"><MoreVertical className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}

            {/* Đã kết nối */}
            {activeTab === "connected" && (
              MOCK_CONNECTED.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-16 text-center text-slate-400 text-sm font-medium italic">Chưa có kết nối nào được thiết lập</td></tr>
              ) : (
                MOCK_CONNECTED.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <StartupAvatar name={item.startupName} logo={item.logo} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[15px] font-semibold text-slate-900 group-hover:text-[#C8A000] transition-colors">{item.startupName}</p>
                            <RestrictionBadge status={(item as any).restrictionStatus} />
                          </div>
                          <p className="text-[12px] text-slate-400 font-medium">{item.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-[400px]">
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-1 italic border-l-2 border-[#e6cc4c] pl-4">
                        <span className="text-slate-300 mr-2 font-black uppercase text-[10px]">Cuối:</span>
                        {item.lastMessage}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <p className="text-[13px] font-bold text-[#171611]">{formatDate(item.connectedAt)}</p>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Đang kết nối</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/investor/messaging?id=${item.id}`}>
                          <button className="h-10 px-4 rounded-xl bg-slate-50 text-slate-600 hover:bg-[#e6cc4c] hover:text-[#171611] transition-all font-bold text-[13px] flex items-center gap-2 group/btn">
                            <MessageCircle className="size-4 group-hover/btn:scale-110 transition-transform" />
                            Nhắn tin
                          </button>
                        </Link>
                        <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors border border-slate-100 rounded-lg"><MoreVertical className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="pt-12 pb-6 flex justify-center">
        <Pagination />
      </div>

    </div>
  );
}

