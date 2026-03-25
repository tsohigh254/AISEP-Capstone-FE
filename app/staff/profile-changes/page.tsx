"use client";

import { cn } from "@/lib/utils";
import { 
  UserCog, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Building2,
  Users,
  CreditCard,
  FileBadge,
  ChevronDown,
  User,
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

// Mock Data for Profile Changes
const CHANGES_DATA = [
  {
    id: "PR-2001",
    entity: "Startup FinTech X",
    role: "Startup",
    field: "Người đại diện pháp luật",
    impact: "HIGH",
    status: "NEW",
    createdAt: "2024-03-24T08:30:00Z",
  },
  {
    id: "PR-2002",
    entity: "Advisor Trần Văn M",
    role: "Advisor",
    field: "Tài khoản ngân hàng",
    impact: "MEDIUM",
    status: "UNDER_REVIEW",
    createdAt: "2024-03-24T09:15:00Z",
  },
  {
    id: "PR-2003",
    entity: "Investor Nguyễn Thị K",
    role: "Investor",
    field: "Số định danh (CCCD)",
    impact: "CRITICAL",
    status: "NEW",
    createdAt: "2024-03-24T10:00:00Z",
  },
  {
    id: "PR-2004",
    entity: "EcoLoop Solutions",
    role: "Startup",
    field: "Tên pháp nhân",
    impact: "HIGH",
    status: "RESOLVED",
    createdAt: "2024-03-23T14:20:00Z",
  },
];

const IMPACT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: "Cực cao", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  HIGH: { label: "Cao", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  MEDIUM: { label: "Trung bình", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
};

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  NEW: { label: "Mới tạo", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Đang xem xét", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  RESOLVED: { label: "Đã duyệt", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
};

export default function ProfileChangesPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [impactFilter, setImpactFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    return CHANGES_DATA.filter(item => {
      const matchesSearch = item.entity.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || item.role === roleFilter;
      const matchesImpact = impactFilter === "ALL" || item.impact === impactFilter;
      return matchesSearch && matchesRole && matchesImpact;
    });
  }, [search, roleFilter, impactFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans flex items-center gap-2.5">
            <UserCog className="w-5 h-5 text-[#eec54e]" />
            Thay đổi hồ sơ nhạy cảm
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">Kiểm soát các thay đổi quan trọng ảnh hưởng đến tính xác thực của tài khoản.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2.5 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span className="text-[12px] font-bold text-blue-800 font-plus-jakarta-sans">
              {CHANGES_DATA.filter(c => c.status === "NEW").length} Yêu cầu mới
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full font-plus-jakarta-sans">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã yêu cầu hoặc tên chủ thể..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all bg-slate-50/30 font-plus-jakarta-sans"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-plus-jakarta-sans">
          {/* Role Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                roleFilter !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <User className={cn("w-4 h-4", roleFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{roleFilter === "ALL" ? "Tất cả vai trò" : roleFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Tất cả vai trò</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Startup" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Startup</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Advisor" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Advisor</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Investor" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Investor</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Impact Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
                impactFilter !== "ALL" 
                  ? "border-[#eec54e] bg-amber-50 text-[#C8A000]" 
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}>
                <ShieldCheck className={cn("w-4 h-4", impactFilter !== "ALL" ? "text-[#eec54e]" : "text-slate-400")} />
                <span>{impactFilter === "ALL" ? "Mức ảnh hưởng" : IMPACT_CFG[impactFilter].label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1.5 bg-white rounded-2xl shadow-xl border-slate-100 font-plus-jakarta-sans">
              <DropdownMenuRadioGroup value={impactFilter} onValueChange={setImpactFilter}>
                <DropdownMenuRadioItem value="ALL" className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">Tất cả mức độ</DropdownMenuRadioItem>
                {Object.entries(IMPACT_CFG).map(([key, cfg]) => (
                  <DropdownMenuRadioItem key={key} value={key} className="text-[12px] font-medium py-2 rounded-xl cursor-pointer focus:bg-slate-50">{cfg.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Button */}
          {(roleFilter !== "ALL" || impactFilter !== "ALL" || search !== "") && (
            <button 
              onClick={() => { setRoleFilter("ALL"); setImpactFilter("ALL"); setSearch(""); }}
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Chủ thể</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trường thay đổi</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mức ảnh hưởng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thời gian</th>
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
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {item.role === "Startup" ? <Building2 className="w-4 h-4 text-slate-400" /> : <Users className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 font-plus-jakarta-sans">{item.entity}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{item.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold font-plus-jakarta-sans">
                      <FileBadge className="w-3.5 h-3.5 text-slate-400" />
                      {item.field}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border font-plus-jakarta-sans uppercase tracking-tight", IMPACT_CFG[item.impact].bg, IMPACT_CFG[item.impact].color)}>
                      {IMPACT_CFG[item.impact].label}
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
                      <span className="text-[12px] font-medium">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/staff/profile-changes/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#eec54e] hover:text-[#e6cc4c] transition-colors group/btn"
                    >
                      Xét duyệt
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
