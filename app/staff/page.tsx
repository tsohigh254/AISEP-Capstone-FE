"use client";

import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Activity,
  MessageSquareWarning,
  RefreshCcw,
  LayoutDashboard,
  Database,
  Cpu,
  Globe,
  Lock,
  AlertOctagon,
  Terminal,
  X,
  Workflow,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function StaffDashboardPage() {
  // State for chart period
  const [selectedPeriod, setSelectedPeriod] = useState("7D");
  
  // Counters for KPI cards
  const activeUsers = useCountUp(1240, 1000, 0);
  const pendingKYC = useCountUp(12, 800, 100);
  const aiExceptions = useCountUp(5, 600, 300);
  const pendingDisputes = useCountUp(3, 700, 500);

  const chartData = selectedPeriod === "7D" 
    ? [45, 60, 35, 85, 50, 70, 65]
    : [30, 45, 25, 60, 40, 55, 70, 35, 80, 50, 65, 45, 90, 55, 40, 75, 50, 60, 45, 85, 40, 70, 55, 95, 40, 60, 50, 75, 80, 65];

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500 font-plus-jakarta-sans">

      {/* Maintenance Alert Banner */}
      <div className="bg-white rounded-[32px] p-1 border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden group">
        <div className="bg-amber-50/50 rounded-[31px] p-5 flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-amber-200/50 shadow-sm">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[9px] font-black rounded-full uppercase tracking-widest">Hệ thống</span>
              <p className="text-[14px] font-black text-slate-900 tracking-tight">Bảo trì hệ thống định kỳ</p>
            </div>
            <p className="text-[12px] text-slate-500 mt-1 font-bold leading-relaxed">
              Hệ thống sẽ tiến hành bảo trì cơ sở dữ liệu vào Chủ nhật từ <span className="text-amber-700">02:00 đến 04:00</span>. Một số dịch vụ AI có thể chậm hơn bình thường.
            </p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-white rounded-xl transition-all mr-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-10">
          
          {/* Section: System Health */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.15em] flex items-center gap-2.5">
                <div className="w-2 h-6 bg-[#eec54e] rounded-full" />
                System Health
              </h2>
              <Link href="/staff/activity" className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest flex items-center gap-2 group">
                Xem chi tiết monitoring <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Tổng người dùng", value: "1,284", sub: "+12 hôm nay", icon: Users, status: "healthy", href: "/staff/activity" },
                { label: "Tài khoản bị khoá", value: "3", sub: "cần xem xét", icon: Lock, status: "warning", href: "/staff/kyc" },
                { label: "Active Roles", value: "12", sub: "3 thay đổi gần đây", icon: ShieldCheck, status: "healthy", href: "/staff/profile-changes" },
                { label: "AI Service", value: "99.8%", sub: "uptime 30 ngày", icon: Cpu, status: "healthy", href: "/staff/activity" },
                { label: "Blockchain Node", value: "Online", sub: "sync 100%", icon: Globe, status: "healthy", href: "/staff/activity" },
                { label: "Database", value: "Healthy", sub: "latency 12ms", icon: Database, status: "healthy", href: "/staff/activity" },
                { label: "API Gateway", value: "Degraded", sub: "p95 > 2s", icon: Terminal, status: "warning", href: "/staff/activity" },
                { label: "Open Alerts", value: "5", sub: "2 critical", icon: AlertTriangle, status: "warning", href: "/staff/issue-reports" },
              ].map((item, i) => (
                <Link 
                  key={i} 
                  href={item.href} 
                  className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-[170px] group hover:border-[#eec54e]/40 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#eec54e]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="mb-4 relative">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#eec54e] group-hover:bg-[#eec54e]/5 transition-all duration-300">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className={cn(
                      "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm",
                      item.status === "healthy" ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                  </div>
                  
                  <div className="space-y-0.5">
                    <p className="text-[22px] font-black text-[#171611] tracking-tight">{item.value}</p>
                    <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">{item.label}</p>
                    <p className="text-[10px] font-medium text-slate-400 italic">{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Performance Charts */}
          <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-slate-900 -tracking-tight">Xu hướng hồ sơ KYC</h3>
                  <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Thống kê hồ sơ {selectedPeriod === "7D" ? "tuần hiện tại" : "30 ngày gần nhất"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[12px] font-black font-plus-jakarta-sans shadow-sm">
                  <ArrowUpRight className="w-4 h-4" /> +15.4%
                </div>
                <select 
                  className="px-4 py-2 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-600 bg-white focus:outline-none focus:ring-4 focus:ring-[#eec54e]/10 focus:border-[#eec54e] transition-all cursor-pointer shadow-sm"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="7D">7 ngày gần nhất</option>
                  <option value="30D">30 ngày gần nhất</option>
                </select>
              </div>
            </div>
            
            <div className={cn(
              "h-[280px] flex items-end justify-between px-2",
              selectedPeriod === "7D" ? "gap-6 px-4" : "gap-1 px-1"
            )}>
              {chartData.map((h, i) => (
                <div key={i} className="flex-1 h-full bg-slate-50/50 rounded-t-sm relative group/bar cursor-pointer transition-all">
                  <div className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all whitespace-nowrap z-20" style={{ bottom: `calc(${h}% + 10px)` }}>
                    <span className="text-[11px] font-black text-slate-900">{h} hồ sơ</span>
                  </div>
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#eec54e] rounded-t-sm transition-all duration-300" 
                    style={{ height: `${h}%` }} 
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
              {selectedPeriod === "7D" ? (
                <>
                  <span>Thứ Hai</span>
                  <span>Chủ Nhật</span>
                </>
              ) : (
                <>
                  <span>30 ngày trước</span>
                  <span>Hôm nay</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Governance & Activities */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
          
          {/* Section: Governance Summary */}
          <div className="space-y-5">
            <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.15em] flex items-center gap-2.5">
              <div className="w-1.5 h-5 bg-[#C8A000] rounded-full" />
              Governance
            </h2>
            
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Chờ duyệt KYC Startup", value: pendingKYC.count, icon: ShieldCheck, color: "blue", href: "/staff/kyc" },
                { label: "Tài khoản bị khoá (24h)", value: "2", icon: Lock, color: "amber", href: "/staff/kyc" },
                { label: "Khiếu nại leo thang", value: pendingDisputes.count, icon: MessageSquareWarning, color: "rose", href: "/staff/complaints" },
                { label: "Role thay đổi gần đây", value: "5", icon: LayoutDashboard, color: "indigo", href: "/staff/profile-changes" },
                { label: "Yêu cầu mở khẩn cấp", value: "4", icon: AlertOctagon, color: "orange", href: "/staff/issue-reports" },
                { label: "Workflow chờ xử lý", value: "2", icon: Workflow, color: "teal", href: "/staff/consulting-ops" },
              ].map((item, i) => (
                <Link 
                  key={i} 
                  href={item.href} 
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-[#eec54e]/40 hover:shadow-md transition-all group active:scale-[0.98] relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-[#eec54e] group-hover:bg-[#eec54e]/5 transition-all">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[18px] font-black text-[#171611] leading-none">{item.value}</p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1.5 uppercase tracking-wide truncate">{item.label}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#eec54e] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Section: Live Activity Feed */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-slate-300" />
                Live Feed
              </h3>
              <Link href="/staff/activity" className="text-[11px] font-bold text-slate-400 hover:text-[#eec54e] transition-colors uppercase tracking-widest">
                Tất cả »
              </Link>
            </div>

            <div className="space-y-6 flex-1 relative overflow-y-auto no-scrollbar pr-2">
              <div className="absolute left-[11px] top-2 bottom-6 w-px bg-slate-100" />
              {[
                { user: "Nguyễn Văn A", action: "vừa nộp hồ sơ Startup", time: "2m", dot: "bg-amber-400" },
                { user: "Lê Thị B", action: "khiếu nại buổi tư vấn #124", time: "15m", dot: "bg-rose-500" },
                { user: "AI Engine", action: "phát hiện bất thường", time: "1h", dot: "bg-[#eec54e]" },
                { user: "Trần Văn C", action: "yêu cầu rút tiền 5M", time: "2h", dot: "bg-emerald-500" },
                { user: "Admin", action: "cập nhật Audit Logs", time: "4h", dot: "bg-slate-900" },
                { user: "Startup X", action: "hoàn tất xác minh video", time: "5h", dot: "bg-sky-500" },
              ].map((act, i) => (
                <div key={i} className="flex gap-5 relative group cursor-pointer">
                  <div className={cn(
                    "w-[22px] h-[22px] rounded-full border-[4px] border-white shadow-sm shrink-0 z-10 transition-all group-hover:scale-110", 
                    act.dot
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] font-bold text-[#171611] truncate">{act.user}</p>
                      <span className="text-[10px] font-medium text-slate-400">{act.time} ago</span>
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{act.action}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full py-3.5 bg-slate-50 hover:bg-[#171611] text-slate-600 hover:text-white rounded-[18px] text-[12px] font-bold tracking-widest transition-all flex items-center justify-center gap-2 group border border-slate-100">
              <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
              LÀM MỚI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
