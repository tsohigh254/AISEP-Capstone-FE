"use client";

import { cn } from "@/lib/utils";
import { 
  UserCog, 
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
  Fingerprint,
  Info,
  ArrowDown
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

const IMPACT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: "Cực cao", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  HIGH: { label: "Cao", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  MEDIUM: { label: "Trung bình", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
};

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  NEW: { label: "Mới nhận", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "Đang xử lý", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  RESOLVED: { label: "Đã duyệt", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Từ chối", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
};

export default function ProfileChangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for a Sensitive Profile Change (Investor Identity)
  const changeData = {
    id,
    entityName: "Investor Nguyễn Thị K",
    role: "Investor",
    field: "Số định danh (CCCD)",
    impact: "CRITICAL",
    status: "UNDER_REVIEW",
    createdAt: "2024-03-24T10:00:00Z",
    reason: "Tôi đã đổi sang mẫu CCCD gắn chip mới nên cần cập nhật thông tin để đồng bộ với hồ sơ thuế.",
    diff: {
      field: "Số CCCD / ID Card",
      before: "001192004567",
      after: "034200008891 (CCCD Gắn chip)",
    },
    currentLabel: "VERIFIED"
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
        <Link href="/staff/profile-changes" className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại danh sách yêu cầu
        </Link>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Xem hồ sơ hiện tại
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Review Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#eec54e] shrink-0 shadow-sm">
                <UserCog className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">{changeData.field}</h1>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tight", IMPACT_CFG[changeData.impact].bg, IMPACT_CFG[changeData.impact].color)}>
                    Ảnh hưởng {IMPACT_CFG[changeData.impact].label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[12px] font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {changeData.entityName}
                  </span>
                  <span>•</span>
                  <span className="font-mono">{changeData.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Gửi lúc {new Date(changeData.createdAt).toLocaleTimeString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Warning Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-amber-900 leading-tight">Cảnh báo tác động - Thay đổi định danh</p>
              <p className="text-[12px] text-amber-800/80 mt-1 leading-relaxed">
                Việc phê duyệt thay đổi **Số định danh (CCCD)** sẽ tự động thu hồi nhãn <span className="font-bold text-emerald-700">VERIFIED</span> hiện có. Người dùng sẽ phải thực hiện lại quy trình xét duyệt KYC mới.
              </p>
            </div>
          </div>

          {/* Diff Workspace Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">So sánh thay đổi (Before vs After)</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mr-3">Cũ</span>
                <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200" />
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Mới</span>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* The Diff Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center z-10 hidden md:flex">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="p-5 rounded-2xl bg-red-50/30 border border-red-100 flex flex-col gap-2">
                  <h4 className="text-[11px] font-bold text-red-700 uppercase tracking-widest">{changeData.diff.field}</h4>
                  <p className="text-[16px] font-bold text-red-900 line-through decoration-red-400/50">{changeData.diff.before}</p>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/30 border border-emerald-100 flex flex-col gap-2">
                  <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Giá trị đề xuất</h4>
                  <p className="text-[16px] font-bold text-emerald-900">{changeData.diff.after}</p>
                </div>
              </div>

              {/* Reason and Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lý do từ người dùng</h3>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[13px] text-slate-600 leading-relaxed italic">
                    "{changeData.reason}"
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Minh chứng (Evidence)</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-[12px] font-bold text-slate-700 group-hover:text-blue-600">CCCD_MatTruoc_New.jpg</span>
                      </div>
                      <ArrowDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Decision Panel */}
        <div className="space-y-6">
          
          {/* Decision Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5 space-y-6 sticky top-24">
            <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">Quyết định thay đổi</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("APPROVE")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#eec54e] text-slate-900 text-[13px] font-bold hover:bg-[#ffe082] transition-all group active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#eec54e]/20"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Duyệt thay đổi
              </button>
              <button 
                onClick={() => handleAction("REQUEST_MORE")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4" />
                Yêu cầu bổ sung chứng cứ
              </button>
              <button 
                onClick={() => handleAction("REJECT")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-red-50/20 text-red-700 text-[13px] font-bold hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Từ chối thay đổi
              </button>
            </div>

            <div className="space-y-2 border-t border-slate-50 pt-5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ghi chú phản hồi (Gửi cho người dùng)</label>
              <textarea 
                rows={3}
                placeholder="Nhập lý do phê duyệt hoặc từ chi tiết để người dùng nắm rõ..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 italic leading-relaxed">
                Người dùng sẽ nhận được thông báo qua Email và App ngay sau khi bạn xác nhận quyết định.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
