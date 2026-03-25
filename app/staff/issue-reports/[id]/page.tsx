"use client";

import { cn } from "@/lib/utils";
import { 
  Bug, 
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
  Cpu,
  Image as ImageIcon,
  ExternalLink,
  MessageSquare,
  AlertOctagon
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

const SEVERITY_CFG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CRITICAL: { label: "Nghiêm trọng", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertOctagon },
  HIGH: { label: "Cao", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
  MEDIUM: { label: "Trung bình", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: MessageSquare },
  LOW: { label: "Thấp", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: Info },
};

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  NEW: { label: "Mới nhận", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Đang xử lý", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  RESOLVED: { label: "Đã xong", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
};

function Info({ className }: { className?: string }) {
  return <AlertCircle className={className} />;
}

import { AlertCircle } from "lucide-react";

export default function IssueReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"DESC" | "ATTACH" | "RELATED">("DESC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for an Issue Report
  const issue = {
    id,
    title: "Lỗi không tải được ảnh KYC mặt sau",
    module: "KYC Service / Frontend App",
    source: "USER",
    reporter: "Startup Alpha (Nguyễn Văn A)",
    severity: "HIGH",
    status: "UNDER_REVIEW",
    createdAt: "2024-03-24T08:30:00Z",
    description: "Khi người dùng thực hiện bước tải ảnh CCCD mặt sau, hệ thống báo lỗi 'Request Timeout' liên tục dù mạng ổn định. Đã thử trên Chrome và Safari đều gặp tình trạng tương tự.",
    attachments: [
      { name: "error_screenshot_1.png", type: "IMAGE" },
      { name: "browser_logs.txt", type: "FILE" }
    ],
    affectedEntity: {
      type: "User Profile",
      name: "Startup Alpha",
      id: "ST-8821"
    }
  };

  const handleAction = (action: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const SeverityIcon = SEVERITY_CFG[issue.severity].icon;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 font-plus-jakarta-sans">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/staff/issue-reports" className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại danh sách sự cố
        </Link>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Xem log hệ thống
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#eec54e] shrink-0 shadow-sm">
                <Bug className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">{issue.title}</h1>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tight", SEVERITY_CFG[issue.severity].color, SEVERITY_CFG[issue.severity].bg)}>
                    <SeverityIcon className="w-3.5 h-3.5" />
                    {SEVERITY_CFG[issue.severity].label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[12px] font-medium">
                  <span className="flex items-center gap-1">
                    {issue.source === "USER" ? <User className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                    Báo cáo bởi: {issue.reporter}
                  </span>
                  <span>•</span>
                  <span className="font-mono">{issue.id}</span>
                  <span>•</span>
                  <span className={cn("inline-flex items-center gap-1", STATUS_CFG[issue.status].badge.replace("bg-", "text-").replace("text-", "font-bold text-"))}>
                    {STATUS_CFG[issue.status].label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Workspace */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center gap-1 px-6 pt-5 border-b border-slate-50 overflow-x-auto no-scrollbar">
              {[
                { id: "DESC", label: "Mô tả sự cố", icon: FileText },
                { id: "ATTACH", label: "Tệp đính kèm", icon: ImageIcon },
                { id: "RELATED", label: "Đối tượng ảnh hưởng", icon: Building2 },
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
              {activeTab === "DESC" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Module / Service</p>
                      <p className="text-[14px] font-bold text-slate-900">{issue.module}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian ghi nhận</p>
                      <p className="text-[14px] font-bold text-slate-900">{new Date(issue.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Nội dung chi tiết</h3>
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 text-[14px] text-slate-700 leading-relaxed shadow-sm">
                      {issue.description}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ATTACH" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {issue.attachments.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", file.type === "IMAGE" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500")}>
                            {file.type === "IMAGE" ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-700 group-hover:text-amber-600 transition-colors">{file.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{file.type}</p>
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
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thực thể bị ảnh hưởng</p>
                        <p className="text-[15px] font-bold text-slate-900 mt-0.5">{issue.affectedEntity.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500">
                          <span className="font-mono">#{issue.affectedEntity.id}</span>
                          <span>•</span>
                          <span>{issue.affectedEntity.type}</span>
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

        {/* Right Column: Action Panel */}
        <div className="space-y-6">
          
          {/* Resolution Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5 space-y-4">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">Phản hồi & Giải quyết</h3>
            <textarea 
              rows={5}
              placeholder="Nhập ghi chú giải quyết sự cố..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all"
            />
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <input type="checkbox" id="notify-user" className="rounded-md accent-[#eec54e]" />
              <label htmlFor="notify-user" className="text-[11px] font-bold text-slate-500 uppercase cursor-pointer">Thông báo cho người báo cáo</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xl shadow-slate-100 sticky top-24">
            <h3 className="text-[12px] font-bold uppercase tracking-widest mb-6 font-plus-jakarta-sans text-slate-400">Thao tác xử lý</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("RESOLVE")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-emerald-500/10"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Xác nhận đã giải quyết
              </button>
              <button 
                onClick={() => handleAction("ESCALATE")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <ShieldAlert className="w-4 h-4" />
                Chuyển cấp kỹ thuật
              </button>
              <button 
                onClick={() => handleAction("REJECT")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-100 text-red-500 text-[13px] font-bold hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Bác bỏ sự cố
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
