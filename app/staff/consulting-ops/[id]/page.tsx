"use client";

import { cn } from "@/lib/utils";
import { 
  Users, 
  ChevronLeft, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  User, 
  Building2, 
  Clock, 
  Calendar,
  FileText,
  AlertTriangle,
  Save,
  Send,
  ArrowRight,
  Loader2,
  ListChecks,
  MessageSquare,
  CreditCard,
  Video,
  Download,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

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

export default function ConsultingOpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"SESSION" | "REPORT" | "EVIDENCE">("SESSION");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for a Consultation Report Review
  const session = {
    id,
    title: "Tư vấn lộ trình gọi vốn Series A",
    startup: "TechGenius AI",
    advisor: "Advisor Nguyễn Văn M",
    date: "2024-03-22",
    time: "14:00 - 15:30",
    status: "UNDER_REVIEW",
    payoutStatus: "PENDING_REPORT",
    amount: "2,500,000đ",
    description: "Buổi tư vấn chuyên sâu về cấu trúc bảng cân đối kế toán và định giá doanh nghiệp trước khi tiếp cận các quỹ VCs.",
    report: {
      content: "Đã thảo luận về phương pháp định giá DCF. Startup cần hoàn thiện lại bản dự báo doanh thu 3 năm tới. Tôi đã gửi kèm template pitching-deck tiêu chuẩn.",
      completeness: 85,
      attachments: ["Pitching_Template.xlsx", "Meeting_Notes.pdf"]
    }
  };

  const handleAction = (action: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 font-plus-jakarta-sans">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/staff/consulting-ops" className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại Platform Consulting
        </Link>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Xem log buổi tư vấn
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Session and Report Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Session Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Video className="w-7 h-7 text-[#eec54e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">{session.title}</h1>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tight", STATUS_CFG[session.status].badge)}>
                    {STATUS_CFG[session.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[12px] font-medium">
                  <span className="flex items-center gap-1 font-mono text-slate-900">#{session.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {session.date} | {session.time}
                  </span>
                  <span>•</span>
                  <span className="font-bold text-slate-900">{session.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Workspace Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center gap-1 px-6 pt-5 border-b border-slate-50 overflow-x-auto no-scrollbar">
              {[
                { id: "SESSION", label: "Thông tin Session", icon: Building2 },
                { id: "REPORT", label: "Báo cáo của Advisor", icon: FileText },
                { id: "EVIDENCE", label: "Bằng chứng hoàn tất", icon: ListChecks },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2.5 text-[13px] font-bold whitespace-nowrap border-b-2 -mb-px transition-all flex items-center gap-2",
                    activeTab === tab.id
                      ? "border-[#0f172a] text-[#0f172a]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "SESSION" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Startup (Người mua)</p>
                      <p className="text-[14px] font-bold text-slate-900">{session.startup}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Advisor (Người bán)</p>
                      <p className="text-[14px] font-bold text-slate-900">{session.advisor}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mô tả mục tiêu buổi tư vấn</h3>
                    <p className="text-[14px] text-slate-700 leading-relaxed font-medium bg-white p-4 rounded-xl border border-slate-100 italic">
                      "{session.description}"
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "REPORT" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-inner">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Nội dung báo cáo chi tiết</h3>
                    <p className="text-[15px] leading-relaxed italic text-slate-700">{session.report.content}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tài liệu Advisor gửi kèm</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {session.report.attachments.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#eec54e]/30 hover:bg-slate-50 transition-all group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
                              <Download className="w-4 h-4" />
                            </div>
                            <span className="text-[13px] font-bold text-slate-700 group-hover:text-[#eec54e]">{file}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "EVIDENCE" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-blue-700 leading-relaxed">
                      Thông tin này được trích xuất từ lịch sử phòng họp ảo và báo chí từ Startup để đối chứng với Advisor.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-video rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-colors cursor-zoom-in">
                        <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Screen - {i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Review & Decision Panel */}
        <div className="space-y-6">
          
          {/* Completeness Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5 space-y-4">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">Checklist báo cáo</h3>
            <div className="space-y-3">
              {[
                "Advisor gửi báo cáo đúng hạn (trong 48h)",
                "Nội dung báo cáo có giá trị thực tiễn",
                "Có tài liệu đính kèm minh chứng",
                "Không có khiếu nại từ Startup"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md border border-slate-200 bg-white flex items-center justify-center">
                    {i < 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : null}
                  </div>
                  <span className="text-[12px] text-slate-600 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <span className="text-slate-400 uppercase tracking-widest font-plus-jakarta-sans">Độ hoàn thiện</span>
                <span className="text-emerald-500">85%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>
            </div>
          </div>

          {/* Decision Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xl shadow-slate-100 sticky top-24">
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-6 font-plus-jakarta-sans text-slate-400">Phê duyệt quyết định</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("APPROVE")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#eec54e] text-slate-900 text-[13px] font-bold hover:bg-[#ffe082] transition-all group active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#eec54e]/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Duyệt Payout cho Advisor
              </button>
              <button 
                onClick={() => handleAction("CLARIFY")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                Yêu cầu làm rõ báo cáo
              </button>
              <button 
                onClick={() => handleAction("REJECT")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-100 text-red-500 text-[13px] font-bold hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Hủy Payout & Hoàn tiền
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ghi chú xử lý</p>
              <textarea 
                rows={3}
                placeholder="Nhập nội dung phản hồi..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all font-plus-jakarta-sans"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return <ImageIconLucide className={className} />;
}

import { Image as ImageIconLucide } from "lucide-react";
