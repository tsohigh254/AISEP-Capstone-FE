"use client";

import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  Wallet,
  Receipt,
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

// Mock Data for Payment Ops
const PAYMENTS_DATA = [
  {
    id: "PY-4001",
    type: "PAYOUT",
    session: "SS-8004",
    recipient: "Advisor Trần Văn X",
    amount: "2,250,000đ",
    status: "AWAITING_APPROVAL",
    eligibility: "READY",
    createdAt: "2024-03-24T08:30:00Z",
  },
  {
    id: "RF-5001",
    type: "REFUND",
    session: "SS-8001",
    recipient: "Startup Alpha",
    amount: "2,500,000đ",
    status: "UNDER_REVIEW",
    eligibility: "DISPUTE_ACTIVE",
    createdAt: "2024-03-24T09:15:00Z",
  },
  {
    id: "PY-4002",
    type: "PAYOUT",
    session: "SS-8012",
    recipient: "Advisor Lê Thị K",
    amount: "1,800,000đ",
    status: "HELD",
    eligibility: "MISSING_REPORT",
    createdAt: "2024-03-24T10:00:00Z",
  },
  {
    id: "PY-4003",
    type: "PAYOUT",
    session: "SS-8025",
    recipient: "Advisor Nguyễn Văn M",
    amount: "3,000,000đ",
    status: "APPROVED",
    eligibility: "READY",
    createdAt: "2024-03-23T14:20:00Z",
  },
];

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  AWAITING_APPROVAL: { label: "Chờ duyệt", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Đang xem xét", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  HELD: { label: "Tạm giữ", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  APPROVED: { label: "Đã duyệt", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
};

const ELIGIBILITY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  READY: { label: "Sẵn sàng", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  DISPUTE_ACTIVE: { label: "Đang tranh chấp", color: "text-red-700", bg: "bg-red-50 border-red-100" },
  MISSING_REPORT: { label: "Thiếu báo cáo", color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
};

export default function PaymentOpsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [eligibilityFilter, setEligibilityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    return PAYMENTS_DATA.filter(item => {
      const matchesSearch = item.recipient.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === "ALL" || item.type === activeTab;
      const matchesEligibility = eligibilityFilter === "ALL" || item.eligibility === eligibilityFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesTab && matchesEligibility && matchesStatus;
    });
  }, [search, activeTab, eligibilityFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[#eec54e]" />
            Vận hành thanh toán
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">Quản lý và phê duyệt các giao dịch Payout cho Advisor và Refund cho Startup.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5 shadow-sm">
            <Wallet className="w-4 h-4 text-[#eec54e]" />
            <span className="text-[12px] font-bold text-slate-700 font-plus-jakarta-sans">
              Liquidity: <span className="text-emerald-600">124.5M VNĐ</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Payout chờ duyệt", value: PAYMENTS_DATA.filter(p => p.type === "PAYOUT" && p.status === "AWAITING_APPROVAL").length, color: "text-blue-600" },
          { label: "Hoàn tiền chờ duyệt", value: PAYMENTS_DATA.filter(p => p.type === "REFUND").length, color: "text-amber-600" },
          { label: "Case bị chặn", value: PAYMENTS_DATA.filter(p => p.status === "HELD").length, color: "text-red-600" },
          { label: "Đã chi trả (Tháng)", value: "85.2M", color: "text-emerald-600" },
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
            placeholder="Tìm theo Mã yêu cầu, Session hoặc Người nhận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all bg-slate-50/30 font-plus-jakarta-sans"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-plus-jakarta-sans">
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                activeTab !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <Receipt className={cn("w-4 h-4", activeTab !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{activeTab === "ALL" ? "Tất cả yêu cầu" : activeTab === "PAYOUT" ? "Payout" : "Hoàn tiền"}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={activeTab} onValueChange={setActiveTab}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Tất cả yêu cầu</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="PAYOUT" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Phê duyệt Payout</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="REFUND" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Phê duyệt Hoàn tiền</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Eligibility Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                eligibilityFilter !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <Zap className={cn("w-4 h-4", eligibilityFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{eligibilityFilter === "ALL" ? "Điều kiện lệ phí" : ELIGIBILITY_CFG[eligibilityFilter].label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={eligibilityFilter} onValueChange={setEligibilityFilter}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Tất cả điều kiện</DropdownMenuRadioItem>
                {Object.entries(ELIGIBILITY_CFG).map(([key, cfg]) => (
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

          {/* Reset Button */}
          {(activeTab !== "ALL" || eligibilityFilter !== "ALL" || statusFilter !== "ALL" || search !== "") && (
            <button 
              onClick={() => { setActiveTab("ALL"); setEligibilityFilter("ALL"); setStatusFilter("ALL"); setSearch(""); }}
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loại</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Người nhận</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Số tiền</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đủ điều kiện</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-[12px] font-bold text-slate-900 font-mono tracking-tighter">{item.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border font-plus-jakarta-sans tracking-tight", 
                      item.type === "PAYOUT" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-amber-50 text-amber-700 border-amber-100"
                    )}>
                      {item.type === "PAYOUT" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                      {item.type === "PAYOUT" ? "Payout" : "Hoàn tiền"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-[13px] font-bold text-slate-900 font-plus-jakarta-sans">{item.recipient}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium font-mono">Session: #{item.session}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[13px] font-black text-slate-900 font-plus-jakarta-sans">{item.amount}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border font-plus-jakarta-sans uppercase tracking-tight", ELIGIBILITY_CFG[item.eligibility].bg, ELIGIBILITY_CFG[item.eligibility].color)}>
                      {ELIGIBILITY_CFG[item.eligibility].label}
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
                      href={`/staff/payment-ops/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] hover:text-[#e6cc4c] transition-colors group/btn"
                    >
                      Phê duyệt
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
