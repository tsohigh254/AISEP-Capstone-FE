"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  Users,
  ShieldCheck,
  AlertCircle,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Download,
  Eye,
  Search,
  History,
  ShieldAlert,
  ArrowLeft,
  Filter
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { CustomToast } from "@/components/ui/custom-toast";

export default function PlatformActivityPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowToast(true);
    }, 1500);
  };

  const KPI_DATA = [
    { label: "Người dùng mới", value: "+42", icon: Users, color: "text-blue-600", bg: "bg-blue-50/50", border: "border-blue-100/50" },
    { label: "Yêu cầu KYC", value: "24", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100/50" },
    { label: "Tranh chấp", value: "03", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50/50", border: "border-red-100/50" },
    { label: "Giải ngân", value: "12", icon: RefreshCw, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100/50" },
    { label: "AI Exceptions", value: "05", icon: Zap, color: "text-[#eec54e]", bg: "bg-[#eec54e]/10", border: "border-[#eec54e]/20" },
    { label: "Báo cáo sự cố", value: "02", icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-50/50", border: "border-orange-100/50" },
  ];

  const RECENT_ACTIVITIES = [
    { type: "KYC", detail: "Phê duyệt hồ sơ Startup GreenEats", time: "10:45", status: "SUCCESS", statusLabel: "Thành công" },
    { type: "PAYMENT", detail: "Giao dịch rút tiền VinaCapital #882", time: "10:30", status: "PENDING", statusLabel: "Chờ xử lý" },
    { type: "AI", detail: "AI Exception: Lỗi trích xuất Pitch Deck #7002", time: "10:15", status: "ERROR", statusLabel: "Lỗi AI" },
    { type: "COMPLAINT", detail: "Khiếu nại tư vấn bởi MedChain AI", time: "09:50", status: "WARNING", statusLabel: "Cảnh báo" },
    { type: "KYC", detail: "Yêu cầu bổ sung hồ sơ TechAlpha", time: "09:30", status: "INFO", statusLabel: "Thông báo" },
  ];

  const STATUS_CFG: Record<string, { badge: string; dot: string }> = {
    SUCCESS: { badge: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60", dot: "bg-emerald-500" },
    PENDING: { badge: "bg-amber-50/80 text-amber-700 border-amber-200/60", dot: "bg-amber-500" },
    ERROR: { badge: "bg-red-50/80 text-red-700 border-red-200/60", dot: "bg-red-500" },
    WARNING: { badge: "bg-orange-50/80 text-orange-700 border-orange-200/60", dot: "bg-orange-500" },
    INFO: { badge: "bg-blue-50/80 text-blue-700 border-blue-200/60", dot: "bg-blue-500" },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans">Giám sát nền tảng</h1>
          <p className="text-[13px] text-slate-500 mt-1">Theo dõi hoạt động và sức khỏe hệ thống thời gian thực.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-all shadow-sm active:scale-95",
              isExporting 
                ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#eec54e]" />
            ) : (
              <Download className="w-4 h-4 text-slate-400" />
            )}
            {isExporting ? "Đang xử lý..." : "Xuất báo cáo"}
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI_DATA.map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center group hover:border-[#eec54e]/30 transition-all font-plus-jakarta-sans">
            <div className={cn("w-10 h-10 rounded-xl mb-3 flex items-center justify-center border transition-transform group-hover:scale-110", kpi.bg, kpi.border)}>
              <kpi.icon className={cn("w-5 h-5", kpi.color)} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-[20px] font-black text-slate-900 mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Submission Volume */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">Lưu lượng hồ sơ KYC</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50/80 border border-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +15%
              </span>
            </div>
            <div className="h-[220px] flex items-end justify-between gap-2 px-1">
              {[30, 45, 60, 25, 80, 50, 95, 40, 70, 55, 85, 45].map((h, i) => (
                <div key={i} className="flex-1 bg-[#eec54e] rounded-t-lg transition-all relative group cursor-pointer border-x border-t border-transparent" style={{ height: `${h}%` }}>
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white px-2.5 py-1.5 rounded-xl shadow-2xl shadow-slate-200/50 whitespace-nowrap z-10 border border-slate-800">{h} lượt</div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-slate-50 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>01 Th3</span>
              <span>10 Th3</span>
              <span>20 Th3</span>
              <span>31 Th3</span>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2 font-plus-jakarta-sans">
                <History className="w-4 h-4 text-slate-400" />
                Dòng hoạt động mới nhất
              </h3>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#eec54e] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm nhanh..." 
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-transparent rounded-xl text-[12px] w-56 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/10 focus:bg-white focus:border-[#eec54e] transition-all" 
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100">Phân loại</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100">Nội dung</th>
                    <th className="px-6 py-3 text-[11px] font-bold uppercase text-slate-400 tracking-widest border-b border-slate-100 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {RECENT_ACTIVITIES.map((act, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border",
                          act.type === "KYC" ? "text-blue-700 bg-blue-50/50 border-blue-100/50" :
                          act.type === "PAYMENT" ? "text-emerald-700 bg-emerald-50/50 border-emerald-100/50" :
                          act.type === "AI" ? "text-purple-700 bg-purple-50/50 border-purple-100/50" :
                          "text-amber-700 bg-amber-50/50 border-amber-100/50"
                        )}>
                          {act.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold text-slate-700">{act.detail}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{act.time} · Nhật ký hệ thống</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", STATUS_CFG[act.status].badge)}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CFG[act.status].dot)} />
                          {act.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          {/* Critical Alerts Panel */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-[0_1px_3px_rgba(239,68,68,0.05)] overflow-hidden">
            <div className="bg-red-50/50 px-6 py-5 border-b border-red-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-[13px] font-bold text-red-900 uppercase tracking-tight">Cảnh báo khẩn cấp</h3>
            </div>
            <div className="p-6 space-y-5">
              {[
                { detail: "Phát hiện đột biến hồ sơ từ Nga (IP bypass)", severity: "critical" },
                { detail: "Lỗi AI Scanner không thể giải mã CCCD (ID: 1554)", severity: "high" },
                { detail: "Giao dịch rút tiền lớn chưa được phê duyệt (>2k$)", severity: "medium" }
              ].map((alert, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.4)] group-hover:scale-125 transition-transform" />
                  <p className="text-[12px] text-slate-600 font-semibold leading-relaxed group-hover:text-slate-900 transition-colors">{alert.detail}</p>
                </div>
              ))}
              <Link 
                href="/staff/issue-reports"
                className="w-full mt-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-[#eec54e]" />
                Xử lý rủi ro
              </Link>
            </div>
          </div>

          {/* System Health Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
             <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight mb-5 flex items-center gap-2">
               <Zap className="w-4 h-4 text-[#eec54e]" />
               Tình trạng dịch vụ
             </h3>
             <div className="space-y-4">
                {[
                  { name: "AI Core Engine", status: "Đang hoạt động", color: "text-emerald-500" },
                  { name: "KYC Validator", status: "Đang hoạt động", color: "text-emerald-500" },
                  { name: "Payment Gateway", status: "Cảnh báo", color: "text-amber-500" },
                  { name: "Database Cluster", status: "Đang hoạt động", color: "text-emerald-500" },
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <span className="text-[12px] font-bold text-slate-600">{service.name}</span>
                    <span className={cn("text-[11px] font-black uppercase flex items-center gap-1.5", service.color)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", service.color.replace('text', 'bg'))} />
                      {service.status}
                    </span>
                  </div>
                ))}
             </div>
          </div>

          </div>
        </div>

        <CustomToast 
          message="Báo cáo giám sát đã được trích xuất thành công!" 
          isVisible={showToast} 
          onClose={() => setShowToast(false)} 
          type="success"
        />
      </div>
    );
}
