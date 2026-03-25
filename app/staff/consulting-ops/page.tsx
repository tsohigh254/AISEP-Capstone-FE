"use client";

import { cn } from "@/lib/utils";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Mock Data for Consulting Ops
const SESSIONS_DATA = [
  {
    id: "SS-8001",
    startup: "TechGenius AI",
    advisor: "Advisor Nguyễn Văn M",
    type: "COMPLETION_EXCEPTION",
    exception: "Advisor vắng mặt",
    status: "NEW",
    payoutStatus: "BLOCKED",
    createdAt: "2024-03-24T08:30:00Z",
  },
  {
    id: "SS-8002",
    startup: "GreenEarth Solutions",
    advisor: "Advisor Lê Thị K",
    type: "REPORT_REVIEW",
    exception: "N/A",
    status: "UNDER_REVIEW",
    payoutStatus: "PENDING_REPORT",
    createdAt: "2024-03-24T09:15:00Z",
  },
  {
    id: "SS-8003",
    startup: "FinTrack Portal",
    advisor: "Advisor Phạm Hoàng N",
    type: "COMPLETION_EXCEPTION",
    exception: "Startup báo cáo chưa xong",
    status: "NEW",
    payoutStatus: "BLOCKED",
    createdAt: "2024-03-24T10:00:00Z",
  },
  {
    id: "SS-8004",
    startup: "MediCare Assist",
    advisor: "Advisor Trần Văn X",
    type: "REPORT_REVIEW",
    exception: "N/A",
    status: "RESOLVED",
    payoutStatus: "ELIGIBLE",
    createdAt: "2024-03-23T14:20:00Z",
  },
];

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  NEW: { label: "Cần xử lý", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Đang soát xét", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  RESOLVED: { label: "Đã hoàn tất", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const PAYOUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  BLOCKED: { label: "Bị chặn", color: "text-red-700", bg: "bg-red-50 border-red-100" },
  PENDING_REPORT: { label: "Chờ báo cáo", color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
  ELIGIBLE: { label: "Đủ điều kiện", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
};

export default function ConsultingOpsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    return SESSIONS_DATA.filter(item => {
      const matchesSearch = item.startup.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === "ALL" || item.type === activeTab;
      const matchesPayout = payoutStatusFilter === "ALL" || item.payoutStatus === payoutStatusFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesTab && matchesPayout && matchesStatus;
    });
  }, [search, activeTab, payoutStatusFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#eec54e]" />
            Vận hành tư vấn
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">Xử lý các ngoại lệ hoàn tất session và soát xét báo cáo tư vấn của Advisor.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-[12px] font-bold text-amber-800 font-plus-jakarta-sans uppercase">
              {SESSIONS_DATA.filter(s => s.payoutStatus === "BLOCKED").length} Payout bị chặn
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ngoại lệ hoàn tất", value: SESSIONS_DATA.filter(s => s.type === "COMPLETION_EXCEPTION").length, color: "text-red-600" },
          { label: "Báo cáo chờ duyệt", value: SESSIONS_DATA.filter(s => s.type === "REPORT_REVIEW").length, color: "text-amber-600" },
          { label: "Tranh chấp tư vấn", value: 2, color: "text-purple-600" },
          { label: "Đã hoàn tất (Tháng)", value: 48, color: "text-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] font-plus-jakarta-sans flex flex-col items-center justify-center text-center min-h-[100px]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className={cn("text-[24px] font-black mt-1", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Removed Tabs Section - integrated into Filter Bar */}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full font-plus-jakarta-sans">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo Session ID, Startup hoặc Advisor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all bg-slate-50/30 font-plus-jakarta-sans"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-plus-jakarta-sans">
          {/* Case Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                activeTab !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <FileText className={cn("w-4 h-4", activeTab !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{activeTab === "ALL" ? "Tất cả session" : activeTab === "COMPLETION_EXCEPTION" ? "Ngoại lệ" : "Báo cáo"}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={activeTab} onValueChange={setActiveTab}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Tất cả session</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="COMPLETION_EXCEPTION" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Ngoại lệ hoàn tất</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="REPORT_REVIEW" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Soát xét báo cáo</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Payout Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                payoutStatusFilter !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <CreditCard className={cn("w-4 h-4", payoutStatusFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{payoutStatusFilter === "ALL" ? "Trạng thái Payout" : PAYOUT_CFG[payoutStatusFilter].label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={payoutStatusFilter} onValueChange={setPayoutStatusFilter}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Tất cả payout</DropdownMenuRadioItem>
                {Object.entries(PAYOUT_CFG).map(([key, cfg]) => (
                  <DropdownMenuRadioItem key={key} value={key} className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">{cfg.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Progress Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                statusFilter !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <ShieldCheck className={cn("w-4 h-4", statusFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{statusFilter === "ALL" ? "Tiến độ xử lý" : STATUS_CFG[statusFilter].label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Tất cả tiến độ</DropdownMenuRadioItem>
                {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                  <DropdownMenuRadioItem key={key} value={key} className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">{cfg.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Button */}
          {(activeTab !== "ALL" || payoutStatusFilter !== "ALL" || statusFilter !== "ALL" || search !== "") && (
            <button 
              onClick={() => { setActiveTab("ALL"); setPayoutStatusFilter("ALL"); setStatusFilter("ALL"); setSearch(""); }}
              className="p-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-95"
              title="Xóa tất cả bộ lọc"
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 font-plus-jakarta-sans">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-24">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Các bên</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loại Case</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái Payout</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tiến độ</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Lùi lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-[12px] font-bold text-slate-900 font-mono tracking-tighter">{item.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-slate-900 font-plus-jakarta-sans">{item.startup}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium italic truncate max-w-[200px]">với {item.advisor}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold font-plus-jakarta-sans uppercase tracking-tighter">
                      {item.type === "COMPLETION_EXCEPTION" ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> : <FileText className="w-3.5 h-3.5 text-blue-400" />}
                      {item.type === "COMPLETION_EXCEPTION" ? "Ngoại lệ hoàn tất" : "Báo cáo / Report"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border font-plus-jakarta-sans uppercase tracking-tight", PAYOUT_CFG[item.payoutStatus].bg, PAYOUT_CFG[item.payoutStatus].color)}>
                      {PAYOUT_CFG[item.payoutStatus].label}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border font-plus-jakarta-sans", STATUS_CFG[item.status].badge)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CFG[item.status].dot)} />
                      {STATUS_CFG[item.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/staff/consulting-ops/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] hover:text-[#e6cc4c] transition-colors group/btn"
                    >
                      Kiểm tra
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
