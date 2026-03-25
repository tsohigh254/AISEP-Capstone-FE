"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  ChevronDown,
  Clock,
  ShieldCheck,
  User,
  Building2,
  Calendar,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { 
  KYCSubtype, 
  KYC_SUBTYPE_CONFIGS 
} from "@/types/staff-kyc";

// --- Types ---
type KYCStatus = "PENDING" | "IN_REVIEW" | "PENDING_MORE_INFO" | "APPROVED" | "REJECTED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface KYCSubmission {
  id: string;
  applicantName: string;
  entityName: string;
  role: "STARTUP" | "INVESTOR" | "ADVISOR";
  subtype: KYCSubtype;
  submittedAt: string;
  status: KYCStatus;
  priority: Priority;
  slaDays: number;
}

// --- Dummy Data ---
const DUMMY_KYC: KYCSubmission[] = [
  { id: "KYC-2024-001", applicantName: "Nguyễn Văn A", entityName: "TechAlpha Co.", role: "STARTUP", subtype: "STARTUP_ENTITY", submittedAt: "2024-03-22T10:00:00Z", status: "PENDING", priority: "HIGH", slaDays: 2 },
  { id: "KYC-2024-002", applicantName: "Lê Thị B", entityName: "MedChain AI", role: "STARTUP", subtype: "STARTUP_NO_ENTITY", submittedAt: "2024-03-24T08:30:00Z", status: "IN_REVIEW", priority: "MEDIUM", slaDays: 1 },
  { id: "KYC-2024-003", applicantName: "Trần Văn C", entityName: "VinaCapital Ventures", role: "INVESTOR", subtype: "INSTITUTIONAL_INVESTOR", submittedAt: "2024-03-23T15:45:00Z", status: "PENDING", priority: "CRITICAL", slaDays: 3 },
  { id: "KYC-2024-004", applicantName: "Phạm Minh D", entityName: "Angel Fund", role: "INVESTOR", subtype: "INDIVIDUAL_INVESTOR", submittedAt: "2024-03-24T14:20:00Z", status: "PENDING_MORE_INFO", priority: "LOW", slaDays: 0 },
  { id: "KYC-2024-005", applicantName: "Hoàng Gia E", entityName: "Elite Advisors", role: "ADVISOR", subtype: "ADVISOR", submittedAt: "2024-03-24T09:15:00Z", status: "PENDING", priority: "MEDIUM", slaDays: 1 },
];

// --- Helper Functions ---
const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUS_CFG: Record<KYCStatus, { label: string, badge: string, dot: string }> = {
  PENDING: { label: "Chờ xử lý", badge: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-400" },
  IN_REVIEW: { label: "Đang soát xét", badge: "bg-blue-50 text-blue-700 border-blue-200/80", dot: "bg-blue-400" },
  PENDING_MORE_INFO: { label: "Chờ bổ sung", badge: "bg-purple-50 text-purple-700 border-purple-200/80", dot: "bg-purple-400" },
  APPROVED: { label: "Đã duyệt", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-400" },
  REJECTED: { label: "Từ chối", badge: "bg-red-50 text-red-700 border-red-200/80", dot: "bg-red-400" },
};

const PRIORITY_CFG: Record<Priority, { label: string, color: string }> = {
  LOW: { label: "Thấp", color: "text-slate-400" },
  MEDIUM: { label: "Trung bình", color: "text-blue-500" },
  HIGH: { label: "Cao", color: "text-amber-500" },
  CRITICAL: { label: "Khẩn cấp", color: "text-red-500" },
};

export default function KYCPendingListPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "STARTUP" | "INVESTOR" | "ADVISOR">("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const filteredData = DUMMY_KYC.filter(item => {
    const matchesTab = activeTab === "ALL" || item.role === activeTab;
    const matchesSearch = item.applicantName.toLowerCase().includes(search.toLowerCase()) || 
                          item.entityName.toLowerCase().includes(search.toLowerCase()) ||
                          item.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || item.priority === priorityFilter;
    
    return matchesTab && matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans">Xét duyệt danh tính (KYC)</h1>
          <p className="text-[13px] text-slate-500 mt-1">Quản lý và thẩm định hồ sơ người dùng trên nền tảng.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/staff/kyc/history" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Lịch sử duyệt
          </Link>
        </div>
      </div>

      {/* Tabs & Search Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, tổ chức, mã hồ sơ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-slate-50/30 transition-all font-plus-jakarta-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                  activeTab !== "ALL" 
                    ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}>
                  <div className="flex items-center gap-2">
                    <User className={cn("w-4 h-4", activeTab !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                    <span>{activeTab === "ALL" ? "Tất cả đối tượng" : activeTab === "STARTUP" ? "Startup" : activeTab === "INVESTOR" ? "Nhà đầu tư" : "Cố vấn"}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
                <DropdownMenuRadioGroup value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl">Tất cả đối tượng</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="STARTUP" className="text-[12px] font-medium py-2 rounded-xl">Startup</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="INVESTOR" className="text-[12px] font-medium py-2 rounded-xl">Nhà đầu tư</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ADVISOR" className="text-[12px] font-medium py-2 rounded-xl">Cố vấn</DropdownMenuRadioItem>
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
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={cn("w-4 h-4", statusFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                    <span>{statusFilter === "ALL" ? "Tất cả trạng thái" : STATUS_CFG[statusFilter as KYCStatus].label}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                  <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl">Tất cả trạng thái</DropdownMenuRadioItem>
                  {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                    <DropdownMenuRadioItem key={key} value={key} className="text-[12px] font-medium py-2 rounded-xl">{cfg.label}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                  priorityFilter !== "ALL" 
                    ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className={cn("w-4 h-4", priorityFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                    <span>{priorityFilter === "ALL" ? "Tất cả ưu tiên" : PRIORITY_CFG[priorityFilter as Priority].label}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
                <DropdownMenuRadioGroup value={priorityFilter} onValueChange={setPriorityFilter}>
                  <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl">Tất cả ưu tiên</DropdownMenuRadioItem>
                  {Object.entries(PRIORITY_CFG).map(([key, cfg]) => (
                    <DropdownMenuRadioItem key={key} value={key} className="text-[12px] font-medium py-2 rounded-xl">{cfg.label}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Button */}
            {(activeTab !== "ALL" || statusFilter !== "ALL" || priorityFilter !== "ALL" || search !== "") && (
              <button 
                onClick={() => { setActiveTab("ALL"); setStatusFilter("ALL"); setPriorityFilter("ALL"); setSearch(""); }}
                className="ml-2 p-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all active:scale-95"
                title="Xóa tất cả bộ lọc"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Hồ sơ</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Đối tượng</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Ngày nộp</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right">Phân loại</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => {
                const status = STATUS_CFG[item.status];
                const priority = PRIORITY_CFG[item.priority];
                const isOverdue = item.slaDays > 1 && item.status === "PENDING";

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[15px] font-bold shrink-0 shadow-sm", getAvatarGradient(item.applicantName))}>
                          {item.applicantName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">{item.applicantName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-mono tracking-tight uppercase">#{item.id}</span>
                            <span className="text-[11px] text-slate-200">•</span>
                            <span className="text-[11px] text-slate-400 leading-none">{item.entityName}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-slate-700">{item.role === 'STARTUP' ? 'Startup' : item.role === 'INVESTOR' ? 'Nhà đầu tư' : 'Cố vấn'}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">{KYC_SUBTYPE_CONFIGS[item.subtype].label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-slate-600">
                          {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                        </span>
                        <div className={cn("flex items-center gap-1.5 mt-1 text-[11px] font-semibold", isOverdue ? "text-red-500" : "text-slate-400")}>
                          <Clock className="w-3 h-3" />
                          <span>{item.slaDays} ngày chờ</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", status.badge)}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn("text-[11px] font-bold uppercase tracking-tight", priority.color)}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/staff/kyc/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#eec54e]/40 bg-white text-[#C8A000] text-[12px] font-bold hover:bg-[#eec54e] hover:text-white hover:border-[#eec54e] hover:scale-105 transition-all shadow-sm active:scale-95"
                        >
                          Thẩm định
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[12px] text-slate-500 font-medium">Hiển thị <span className="text-slate-900 font-bold">5</span> trên 5 hồ sơ</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-400 cursor-not-allowed transition-colors">Trước</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-400 cursor-not-allowed transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
