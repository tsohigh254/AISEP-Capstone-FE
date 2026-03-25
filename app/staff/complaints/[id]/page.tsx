"use client";

import { cn } from "@/lib/utils";
import { 
  MessageSquareWarning, 
  ChevronLeft, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  Calendar,
  ExternalLink,
  Flame,
  AlertTriangle,
  Send,
  Save,
  Loader2,
  Users,
  CreditCard,
  Reply,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

const SEVERITY_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CRITICAL: { label: "Nghiêm trọng", color: "text-red-700", bg: "bg-red-50 border-red-100", icon: Flame },
  HIGH: { label: "Cao", color: "text-amber-700", bg: "bg-amber-50 border-amber-100", icon: AlertTriangle },
  MEDIUM: { label: "Trung bình", color: "text-blue-700", bg: "bg-blue-50 border-blue-100", icon: MessageSquareWarning },
  LOW: { label: "Thấp", color: "text-slate-600", bg: "bg-slate-50 border-slate-100", icon: Clock },
};

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  NEW: { label: "Mới nhận", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Đang xử lý", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  WAITING_EVIDENCE: { label: "Chờ bằng chứng", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  RESOLVED: { label: "Đã xong", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"CONTENT" | "EVIDENCE" | "RELATED">("CONTENT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for a Dispute case
  const caseData = {
    id,
    type: "DISPUTE",
    category: "Yêu cầu hoàn tiền",
    severity: "CRITICAL",
    status: "UNDER_REVIEW",
    submittedBy: "Startup Alpha (Nguyễn Văn A)",
    against: "Advisor Lê Thị K",
    submittedAt: "2024-03-24T09:15:00Z",
    description: "Tôi yêu cầu hoàn tiền cho buổi tư vấn #SS-8821. Cố vấn vắng mặt 20 phút và không cung cấp đủ tài liệu như đã cam kết trong phần mô tả slot. Tôi đã cố gắng liên hệ nhưng không nhận được phản hồi thỏa đáng.",
    relatedSession: {
      id: "SS-8821",
      title: "Tư vấn lộ trình gọi vốn Series A",
      date: "2024-03-22",
      amount: "2,500,000đ"
    }
  };

  const handleAction = (action: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const SeverityIcon = SEVERITY_CFG[caseData.severity].icon;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 font-plus-jakarta-sans">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/staff/complaints" className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại danh sách khiếu nại
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Investigation Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 border border-amber-100 shrink-0 shadow-sm")}>
                  <MessageSquareWarning className="w-7 h-7 text-[#eec54e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">{caseData.id} - {caseData.category}</h1>
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tight", SEVERITY_CFG[caseData.severity].bg, SEVERITY_CFG[caseData.severity].color)}>
                      <SeverityIcon className="w-3.5 h-3.5" />
                      {SEVERITY_CFG[caseData.severity].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[12px] font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Gửi vào {new Date(caseData.submittedAt).toLocaleString("vi-VN")}
                    </span>
                    <span>•</span>
                    <span className={cn("inline-flex items-center gap-1", STATUS_CFG[caseData.status].badge.replace("bg-", "text-").replace("text-", "font-bold text-"))}>
                      {STATUS_CFG[caseData.status].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investigation Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center gap-1 px-6 pt-5 border-b border-slate-50 overflow-x-auto no-scrollbar">
              {[
                { id: "CONTENT", label: "Nội dung phản ánh", icon: FileText },
                { id: "EVIDENCE", label: "Bằng chứng gửi kèm", icon: ShieldAlert },
                { id: "RELATED", label: "Đối tượng liên quan", icon: Users },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2.5 text-[13px] font-bold whitespace-nowrap border-b-2 -mb-px transition-all flex items-center gap-2",
                  activeTab === tab.id
                    ? "border-[#eec54e] text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "CONTENT" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bên khiếu nại</p>
                      <p className="text-[14px] font-bold text-slate-900">{caseData.submittedBy}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đối tượng bị khiếu nại</p>
                      <p className="text-[14px] font-bold text-slate-900">{caseData.against}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Mô tả chi tiết từ người dùng</h3>
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 text-[14px] text-slate-700 leading-relaxed italic shadow-sm">
                      "{caseData.description}"
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "EVIDENCE" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Screenshot_Session_Chat.png", size: "1.2 MB" },
                      { name: "Consultation_Agreement.pdf", size: "450 KB" },
                    ].map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{file.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{file.size}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "RELATED" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:border-[#eec54e]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-[#eec54e] shadow-sm">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Buổi tư vấn liên quan</p>
                        <p className="text-[15px] font-bold text-slate-900 mt-0.5">{caseData.relatedSession.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono">#{caseData.relatedSession.id}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-900">{caseData.relatedSession.amount}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#eec54e] -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Resolution Panel */}
        <div className="space-y-6">
          
          {/* Internal Note Area */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5 space-y-4">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">Thẩm định nội bộ</h3>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lịch sử xử lý tương tự</label>
              <p className="text-[12px] text-slate-500 leading-relaxed italic border-l-2 border-[#eec54e] pl-3 py-1 bg-amber-50/30">
                Advisor này đã từng bị khiếu nại tương tự về việc vắng mặt (case #CP-4421).
              </p>
            </div>
            <textarea 
              rows={4}
              placeholder="Nhập ghi chú nội bộ để lưu vết..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all"
            />
          </div>

          {/* Decision Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xl shadow-slate-100 sticky top-24">
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-6 font-plus-jakarta-sans text-slate-400">Quyết định xử lý</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("RESOLVE")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#eec54e] text-slate-900 text-[13px] font-bold hover:bg-[#ffe082] transition-all group active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#eec54e]/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Chấp thuận & Hoàn tiền
              </button>
              <button 
                onClick={() => handleAction("REQUEST_INFO")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Reply className="w-4 h-4" />
                Yêu cầu thêm bằng chứng
              </button>
              <button 
                onClick={() => handleAction("REJECT")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-100 text-red-500 text-[13px] font-bold hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Bác bỏ khiếu nại
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Hoặc chuyển cấp</p>
              <button 
                onClick={() => handleAction("ESCALATE")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/30 text-blue-600 text-[12px] font-bold hover:bg-blue-100 transition-all disabled:opacity-50"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Gửi cấp quản lý
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
