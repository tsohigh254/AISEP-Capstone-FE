"use client";

import { cn } from "@/lib/utils";
import { 
  Zap, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  ChevronDown,
  ShieldCheck
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

// Mock Data for AI Exceptions
// Mock Data for AI Exceptions (focused on Pitch Deck & Business Plan)
const EXCEPTIONS_DATA = [
  {
    id: "EX-7001",
    startup: "AlphaStream Tech",
    category: "Incomplete Evaluation Input",
    flagSummary: "Thiếu Business Plan trong hồ sơ nộp",
    aiStatus: "FLAGGED",
    severity: "HIGH",
    status: "NEW",
    createdAt: "2024-03-24T08:30:00Z",
  },
  {
    id: "EX-7002",
    startup: "NexGen Energy",
    category: "Technical Failure",
    flagSummary: "Lỗi parse nội dung Pitch Deck (File hỏng)",
    aiStatus: "FAILED",
    severity: "CRITICAL",
    status: "UNDER_REVIEW",
    createdAt: "2024-03-24T09:15:00Z",
  },
  {
    id: "EX-7003",
    startup: "BioFrontier Lab",
    category: "Low Confidence / Ambiguous Result",
    flagSummary: "AI không đủ tin cậy để chấm điểm tài chính",
    aiStatus: "FLAGGED",
    severity: "MEDIUM",
    status: "NEW",
    createdAt: "2024-03-24T10:00:00Z",
  },
  {
    id: "EX-7004",
    startup: "CyberGuard AI",
    category: "Suspicious / Inconsistent Content",
    flagSummary: "Nội dung Business Plan mâu thuẫn với Pitch Deck",
    aiStatus: "FLAGGED",
    severity: "HIGH",
    status: "ESCALATED",
    createdAt: "2024-03-24T10:45:00Z",
  },
  {
    id: "EX-7005",
    startup: "UrbanHarvest Hub",
    category: "Content Extraction Problem",
    flagSummary: "File scan quá mờ, không trích xuất được text",
    aiStatus: "FAILED",
    severity: "MEDIUM",
    status: "WAITING_RETRY",
    createdAt: "2024-03-23T14:20:00Z",
  },
];

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  NEW: { label: "Mới", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Đang xử lý", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  WAITING_RETRY: { label: "Chờ Retry", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  RESOLVED: { label: "Đã xử lý", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
  ESCALATED: { label: "Chuyển cấp", dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-200" },
};

const SEVERITY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: "Khẩn cấp", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  HIGH: { label: "Cao", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  MEDIUM: { label: "Trung bình", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  LOW: { label: "Thấp", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
};

export default function AIExceptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    return EXCEPTIONS_DATA.filter(item => {
      const matchesSearch = item.startup.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesSeverity = severityFilter === "ALL" || item.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [search, statusFilter, severityFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-[#eec54e]" />
            AI Exceptions
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">Các case AI đánh giá tài liệu Startup cần kiểm tra thủ công.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-[12px] font-bold text-amber-800 font-plus-jakarta-sans text-nowrap">
              {EXCEPTIONS_DATA.filter(e => ["HIGH", "CRITICAL"].includes(e.severity) && e.status !== "RESOLVED").length} Case nghiêm trọng
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      {/* Summary States Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Case mới", value: EXCEPTIONS_DATA.filter(e => e.status === "NEW").length, color: "text-blue-600" },
          { label: "Cao/Khẩn cấp", value: EXCEPTIONS_DATA.filter(e => ["HIGH", "CRITICAL"].includes(e.severity)).length, color: "text-red-600" },
          { label: "Đang xử lý", value: EXCEPTIONS_DATA.filter(e => e.status === "UNDER_REVIEW").length, color: "text-amber-600" },
          { label: "Chờ Retry", value: EXCEPTIONS_DATA.filter(e => e.status === "WAITING_RETRY").length, color: "text-purple-600" },
          { label: "Đã chuyển cấp", value: EXCEPTIONS_DATA.filter(e => e.status === "ESCALATED").length, color: "text-rose-600" },
          { label: "Xử lý hôm nay", value: 12, color: "text-emerald-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] font-plus-jakarta-sans flex flex-col items-center justify-center text-center min-h-[100px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
            <p className={cn("text-[24px] font-black mt-1", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full font-plus-jakarta-sans">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo ID hoặc tên chủ thể..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all bg-slate-50/30 font-plus-jakarta-sans"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-plus-jakarta-sans">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                statusFilter !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <ShieldCheck className={cn("w-4 h-4", statusFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{statusFilter === "ALL" ? "Tất cả trạng thái" : STATUS_CFG[statusFilter].label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Tất cả trạng thái</DropdownMenuRadioItem>
                {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                  <DropdownMenuRadioItem key={key} value={key} className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">{cfg.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Severity Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                severityFilter !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <AlertCircle className={cn("w-4 h-4", severityFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{severityFilter === "ALL" ? "Mọi mức độ" : SEVERITY_CFG[severityFilter].label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={severityFilter} onValueChange={setSeverityFilter}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Mọi mức độ</DropdownMenuRadioItem>
                {Object.entries(SEVERITY_CFG).map(([key, cfg]) => (
                  <DropdownMenuRadioItem key={key} value={key} className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">{cfg.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Button */}
          {(statusFilter !== "ALL" || severityFilter !== "ALL" || search !== "") && (
            <button 
              onClick={() => { setStatusFilter("ALL"); setSeverityFilter("ALL"); setSearch(""); }}
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
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 whitespace-nowrap">Mã số</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 whitespace-nowrap">Startup</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 whitespace-nowrap">Phân loại</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 whitespace-nowrap text-center">Mức độ</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 whitespace-nowrap text-center">Trạng thái AI</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 whitespace-nowrap">Thời điểm Flag</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 whitespace-nowrap text-center">Trạng thái xử lý</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 whitespace-nowrap text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-5 whitespace-nowrap">
                    <span className="text-[12px] font-bold text-slate-900 font-mono tracking-tighter">{item.id}</span>
                  </td>
                  <td className="px-4 py-5 min-w-[200px]">
                    <p className="text-[13px] font-bold text-slate-900 font-plus-jakarta-sans">{item.startup}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">{item.flagSummary}</p>
                  </td>
                  <td className="px-4 py-5 min-w-[180px]">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold font-plus-jakarta-sans">
                      <Zap className="w-3.5 h-3.5 text-slate-400" />
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border font-plus-jakarta-sans uppercase tracking-tight whitespace-nowrap", SEVERITY_CFG[item.severity].bg, SEVERITY_CFG[item.severity].color)}>
                      {SEVERITY_CFG[item.severity].label}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col gap-1">
                      <span className={cn("text-[11px] font-bold font-plus-jakarta-sans", 
                        item.aiStatus === "FAILED" ? "text-red-500" : "text-amber-500"
                      )}>{item.aiStatus}</span>
                      <p className="text-[10px] text-slate-400">AI Evaluation</p>
                    </div>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-700">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border font-plus-jakarta-sans whitespace-nowrap", STATUS_CFG[item.status].badge)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CFG[item.status].dot)} />
                      {STATUS_CFG[item.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right whitespace-nowrap">
                    <Link 
                      href={`/staff/ai-exceptions/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] hover:text-[#e6cc4c] transition-colors group/btn"
                    >
                      Xử lý
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[12px] text-slate-400 font-medium">Hiển thị {filteredData.length} kết quả</p>
          <div className="flex items-center gap-1 font-plus-jakarta-sans">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-400 bg-white opacity-50 cursor-not-allowed">Trước</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-[#eec54e] bg-white hover:bg-slate-50 transition-colors">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-400 bg-white hover:bg-slate-50 transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
