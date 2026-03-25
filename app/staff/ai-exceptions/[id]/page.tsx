"use client";

import { cn } from "@/lib/utils";
import { 
  Zap, 
  ChevronLeft, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  User, 
  Building2, 
  Clock, 
  Calendar,
  FileText,
  ScanFace,
  ShieldAlert,
  Save,
  Send,
  ArrowRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

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

export default function AIExceptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"ANALYSIS" | "DIAGNOSTICS" | "TIMELINE">("ANALYSIS");
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  // Mock data for the specific case (Pitch Deck & Business Plan context)
  const exception = {
    id,
    startup: {
      name: "AlphaStream Tech",
      industry: "AI & Machine Learning",
      stage: "Seed",
      founder: "Nguyễn Văn A",
      kycStatus: "VERIFIED"
    },
    category: "Incomplete Evaluation Input",
    severity: "HIGH",
    status: "NEW",
    createdAt: "2024-03-24T08:30:00Z",
    flagSummary: "Thiếu Business Plan trong bộ hồ sơ nộp.",
    description: "Hệ thống AI đánh giá tài liệu phát hiện startup đã nộp Pitch Deck nhưng chưa có file Business Plan hợp lệ để thực hiện quy trình AI Evaluation toàn diện.",
    aiEvaluationStatus: "FLAGGED",
    documents: [
      { name: "Pitch_Deck_AlphaStream.pdf", type: "Pitch Deck", status: "VALID", uploadedAt: "2024-03-24T08:00:00Z" },
      { name: "Chưa có file", type: "Business Plan", status: "MISSING", uploadedAt: null }
    ],
    diagnostics: {
      humanSummary: "Cần bổ sung Business Plan để AI hoàn thiện bảng điểm tiềm năng thị trường.",
      confidence: 0.45,
      lastStep: "Document Verification",
      errorCode: "INCOMPLETE_INPUT_07"
    }
  };

  const handleAction = (action: string) => {
    setSubmittingAction(action);
    setTimeout(() => {
      setSubmittingAction(null);
      // alert(`Action: ${action}`);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/staff/ai-exceptions" className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors font-plus-jakarta-sans">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại danh sách
        </Link>
        <div />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Context & Deep Analysis */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Zap className="w-7 h-7 text-[#eec54e]" />
              </div>
              <div className="flex-1 min-w-0 font-plus-jakarta-sans">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">{exception.category}</h1>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tight", STATUS_CFG[exception.status].badge)}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CFG[exception.status].dot)} />
                    {STATUS_CFG[exception.status].label}
                  </span>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tight", SEVERITY_CFG[exception.severity].bg, SEVERITY_CFG[exception.severity].color)}>
                    {SEVERITY_CFG[exception.severity].label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[12px] font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {exception.startup.name}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[#eec54e] font-bold">{exception.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Flagged at: {new Date(exception.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Workspace */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-6 pt-5 border-b border-slate-50 overflow-x-auto no-scrollbar">
              {[
                { id: "ANALYSIS", label: "Phân tích ngoại lệ", icon: ShieldAlert },
                { id: "DIAGNOSTICS", label: "AI Diagnostics", icon: Zap },
                { id: "TIMELINE", label: "Timeline xử lý", icon: History },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2.5 text-[13px] font-bold whitespace-nowrap border-b-2 -mb-px transition-all flex items-center gap-2 font-plus-jakarta-sans",
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

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "ANALYSIS" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400 font-plus-jakarta-sans">
                  {/* Startup Context */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-plus-jakarta-sans">Thông tin Startup</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">Tên Startup:</span>
                          <span className="text-slate-900 font-bold">{exception.startup.name}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">Lĩnh vực:</span>
                          <span className="text-slate-900 font-bold">{exception.startup.industry}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">Giai đoạn:</span>
                          <span className="text-slate-700 font-bold">{exception.startup.stage}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">KYC Label:</span>
                          <span className="text-emerald-600 font-bold">{exception.startup.kycStatus}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50/30 border border-amber-100/50 space-y-3">
                      <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-2 font-plus-jakarta-sans">Tóm tắt Flag</h3>
                      <div className="p-3 rounded-lg bg-white border border-amber-100 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <p className="text-[13px] text-amber-700 font-bold leading-snug">{exception.flagSummary}</p>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed italic">{exception.description}</p>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-plus-jakarta-sans">Tài liệu liên quan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exception.documents.map((doc, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between group hover:border-[#eec54e]/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-lg", 
                              doc.status === "MISSING" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                            )}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{doc.type}</p>
                              <p className={cn("text-[13px] font-bold leading-none mt-1", 
                                doc.status === "MISSING" ? "text-red-600" : "text-slate-900"
                              )}>{doc.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {doc.status !== "MISSING" && (
                               <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-[#eec54e] transition-colors">
                                 <ArrowRight className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "DIAGNOSTICS" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6 font-plus-jakarta-sans">
                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#eec54e]">AI Evaluation Summary</h3>
                      <span className="px-2 py-0.5 rounded bg-[#eec54e]/20 text-[#eec54e] text-[10px] font-bold uppercase tracking-tight">AI Evaluation Status: {exception.aiEvaluationStatus}</span>
                    </div>
                    <p className="text-[14px] text-slate-300 leading-relaxed italic font-medium">"{exception.diagnostics.humanSummary}"</p>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Confidence Score</p>
                        <p className="text-[18px] font-black text-[#eec54e] mt-1">{exception.diagnostics.confidence * 100}%</p>
                      </div>
                      <div className="text-center border-x border-slate-800 px-4">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Last Step</p>
                        <p className="text-[15px] font-bold text-slate-200 mt-1">{exception.diagnostics.lastStep}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Error Code</p>
                        <p className="text-[15px] font-bold text-slate-200 mt-1">{exception.diagnostics.errorCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 border-dashed">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Expandable AI Raw Data</h3>
                    <pre className="bg-slate-50 p-4 rounded-xl text-[12px] text-slate-600 font-mono overflow-auto max-h-[300px]">
{`{
  "evaluation_context": "alpha_stream_seed_round",
  "missing_components": ["financial_projections", "business_plan"],
  "ai_engine": "EVAL_V4_MASTER",
  "processing_metadata": {
    "interrupted": "true",
    "cause": "INPUT_VALIDATION_FAILURE",
    "required_document_weight_missing": 0.35
  }
}`}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === "TIMELINE" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 font-plus-jakarta-sans">
                  <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                    {[
                      { action: "Case được tạo tự động bởi AI Engine", user: "Hệ thống AI", time: "25 phút trước" },
                      { action: "Hệ thống phát hiện thiếu tài liệu bắt buộc", user: "AI Validator", time: "25 phút trước" },
                      { action: "Notification đã gửi đến Staff", user: "Hệ thống", time: "24 phút trước" },
                    ].map((h, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-7 top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white" />
                        <p className="text-[13px] font-bold text-slate-700">{h.action}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{h.user} • {h.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Decision Panel */}
        <div className="space-y-6">
          
          {/* Decision Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5 space-y-6 sticky top-24 font-plus-jakarta-sans">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">Bảng phê duyệt</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("UNDER_REVIEW")}
                disabled={submittingAction !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submittingAction === "UNDER_REVIEW" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Đánh dấu Đang soát xét
              </button>
              <button 
                onClick={() => handleAction("APPROVE")}
                disabled={submittingAction !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-[#1e293b] transition-all group active:scale-[0.98] disabled:opacity-50"
              >
                {submittingAction === "APPROVE" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Chấp thuận ngoại lệ
              </button>
              <button 
                onClick={() => handleAction("RETRY")}
                disabled={submittingAction !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/20 text-blue-700 text-[13px] font-bold hover:bg-blue-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submittingAction === "RETRY" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Yêu cầu đánh giá lại
              </button>
              <button 
                onClick={() => handleAction("ESCALATE")}
                disabled={submittingAction !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/20 text-amber-700 text-[13px] font-bold hover:bg-amber-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submittingAction === "ESCALATE" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                Chuyển cấp thẩm định
              </button>
              <button 
                onClick={() => handleAction("REJECT")}
                disabled={submittingAction !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50/20 text-red-700 text-[13px] font-bold hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submittingAction === "REJECT" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Từ chối xử lý
              </button>
            </div>

            <div className="space-y-2 border-t border-slate-50 pt-5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ghi chú nội bộ</label>
              <textarea 
                rows={4}
                placeholder="Nhập ghi chú hoặc lý do ra quyết định..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all"
              />
            </div>

            <button className="w-full py-2.5 text-[12px] font-bold text-[#eec54e] border border-dashed border-[#eec54e]/40 rounded-xl hover:bg-[#eec54e]/5 transition-all">
              <Save className="w-3.5 h-3.5 inline mr-1.5" />
              Lưu bản nháp ghi chú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
