"use client";

import { cn } from "@/lib/utils";
import { 
  MessageSquareWarning, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  Flame,
  User,
  ExternalLink,
  ShieldCheck,
  History,
  ChevronDown,
  ShieldAlert
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

const COMPLAINTS_DATA = [
  {
    id: "CP-8801",
    type: "COMPLAINT",
    category: "Thái độ cố vấn",
    submittedBy: "Startup Alpha",
    against: "Advisor Nguyễn Văn M",
    severity: "HIGH",
    status: "NEW",
    submittedAt: "2026-03-24T08:30:00Z",
  },
  {
    id: "DS-9902",
    type: "DISPUTE",
    category: "Yêu cầu hoàn tiền",
    submittedBy: "Startup Beta",
    against: "Advisor Lê Thị K",
    severity: "CRITICAL",
    status: "UNDER_REVIEW",
    submittedAt: "2026-03-24T09:15:00Z",
  },
  {
    id: "FF-7703",
    type: "FLAGGED_FEEDBACK",
    category: "Nội dung không phù hợp",
    submittedBy: "Hệ thống (Auto)",
    against: "User Trần Văn X",
    severity: "MEDIUM",
    status: "NEW",
    submittedAt: "2026-03-24T10:00:00Z",
  },
  {
    id: "CP-8804",
    type: "COMPLAINT",
    category: "Chất lượng tư vấn",
    submittedBy: "Startup Gamma",
    against: "Advisor Phạm Hoàng N",
    severity: "LOW",
    status: "RESOLVED",
    submittedAt: "2026-03-23T14:20:00Z",
  },
];

const SEVERITY_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CRITICAL: { label: "Nghiêm trọng", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: Flame },
  HIGH: { label: "Cao", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
  MEDIUM: { label: "Trung bình", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: MessageSquareWarning },
  LOW: { label: "Thấp", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: Clock },
};

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  NEW: { label: "Mới tạo", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Đang xử lý", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  WAITING_EVIDENCE: { label: "Chờ bằng chứng", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  RESOLVED: { label: "Đã xong", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const TAB_MAP: Record<string, string> = {
  ALL: "Tất cả",
  COMPLAINT: "Khiếu nại",
  DISPUTE: "Tranh chấp",
  FLAGGED_FEEDBACK: "Nội dung vi phạm",
};

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    return COMPLAINTS_DATA.filter(item => {
      const matchesSearch = item.submittedBy.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === "ALL" || item.type === activeTab;
      const matchesSeverity = severityFilter === "ALL" || item.severity === severityFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesTab && matchesSeverity && matchesStatus;
    });
  }, [search, activeTab, severityFilter, statusFilter]);

  return (
    <div className="px-8 py-7 pb-16 space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans flex items-center gap-2.5">
            <MessageSquareWarning className="w-5 h-5 text-[#eec54e]" />
            Khiếu nại & Tranh chấp
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">Quản lý và giải quyết các khiếu nại, tranh chấp giữa các bên tham gia.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2.5 shadow-sm">
            <Flame className="w-4 h-4 text-red-600" />
            <span className="text-[12px] font-bold text-red-800 font-plus-jakarta-sans">
              {COMPLAINTS_DATA.filter(c => c.severity === "CRITICAL").length} Case nghiêm trọng
            </span>
          </div>
        </div>
      </div>

      {/* Removed Tabs Section - integrated into Filter Bar */}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full font-plus-jakarta-sans">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã số, Người gửi hoặc Đối tượng bị khiếu nại..."
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
                <MessageSquareWarning className={cn("w-4 h-4", activeTab !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{activeTab === "ALL" ? "Tất cả yêu cầu" : TAB_MAP[activeTab]}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={activeTab} onValueChange={setActiveTab}>
                {Object.entries(TAB_MAP).map(([key, label]) => (
                  <DropdownMenuRadioItem key={key} value={key} className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">{label}</DropdownMenuRadioItem>
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
                <ShieldAlert className={cn("w-4 h-4", severityFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
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
                <span>{statusFilter === "ALL" ? "Trạng thái xử lý" : STATUS_CFG[statusFilter].label}</span>
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

          {/* Reset Button */}
          {(activeTab !== "ALL" || severityFilter !== "ALL" || statusFilter !== "ALL" || search !== "") && (
            <button 
              onClick={() => { setActiveTab("ALL"); setSeverityFilter("ALL"); setStatusFilter("ALL"); setSearch(""); }}
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-24">Mã số</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nội dung</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bên khiếu nại</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mức độ</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => {
                const SeverityIcon = SEVERITY_CFG[item.severity].icon;
                return (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <span className="text-[12px] font-bold text-slate-900 font-mono tracking-tighter">{item.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-bold text-slate-900 font-plus-jakarta-sans">{item.category}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium truncate max-w-[200px]">Đối tượng: {item.against}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-700 font-plus-jakarta-sans">{item.submittedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border font-plus-jakarta-sans", SEVERITY_CFG[item.severity].bg, SEVERITY_CFG[item.severity].color)}>
                        <SeverityIcon className="w-3.5 h-3.5" />
                        {SEVERITY_CFG[item.severity].label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border font-plus-jakarta-sans", STATUS_CFG[item.status].badge)}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CFG[item.status].dot)} />
                        {STATUS_CFG[item.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-medium">{new Date(item.submittedAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/staff/complaints/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] hover:text-[#e6cc4c] transition-colors group/btn"
                      >
                        Thẩm định
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
