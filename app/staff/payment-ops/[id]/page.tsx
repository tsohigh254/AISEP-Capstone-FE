"use client";

import { cn } from "@/lib/utils";
import { 
  CreditCard, 
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
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Info,
  Banknote,
  FileCheck2,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

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

export default function PaymentOpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for a Payout Approval
  const payment = {
    id,
    type: "PAYOUT",
    session: {
      id: "SS-8004",
      title: "Tư vấn lộ trình gọi vốn Series A",
      date: "2024-03-22"
    },
    recipient: "Advisor Trần Văn X",
    amount: "2,250,000đ",
    bankInfo: "Techcombank - 1903...8821",
    status: "AWAITING_APPROVAL",
    eligibility: "READY",
    createdAt: "2024-03-24T08:30:00Z",
    conditions: [
      { label: "Buổi tư vấn đã hoàn thành", ok: true },
      { label: "Báo cáo tư vấn đã được duyệt", ok: true },
      { label: "Không có khiếu nại/tranh chấp", ok: true },
      { label: "Tài khoản nhận tiền hợp lệ", ok: true }
    ]
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
        <Link href="/staff/payment-ops" className="group flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Quay lại danh sách thanh toán
        </Link>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Sao kê dòng tiền
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0f172a] flex items-center justify-center text-white shrink-0 shadow-lg">
                <Banknote className="w-7 h-7 text-[#eec54e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Chi trả cho {payment.recipient}</h1>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-tight", STATUS_CFG[payment.status].badge)}>
                    {STATUS_CFG[payment.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-[12px] font-medium">
                  <span className="flex items-center gap-1">
                    <History className="w-3.5 h-3.5" />
                    Yêu cầu: {new Date(payment.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-900 font-bold">{payment.id}</span>
                  <span>•</span>
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border font-plus-jakarta-sans uppercase tracking-tight", ELIGIBILITY_CFG[payment.eligibility].bg, ELIGIBILITY_CFG[payment.eligibility].color)}>
                    {ELIGIBILITY_CFG[payment.eligibility].label}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số tiền thanh toán</p>
                <p className="text-[24px] font-black text-[#eec54e] tracking-tight">{payment.amount}</p>
              </div>
            </div>
          </div>

          {/* Payment Workspace Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50">
              <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">Chi tiết điều kiện thanh toán</h3>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Dependency Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kiểm tra Logic Vận hành</h4>
                  <div className="space-y-3">
                    {payment.conditions.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white", c.ok ? "bg-emerald-500 shadow-emerald-100 shadow-md" : "bg-red-500 shadow-red-100 shadow-md")}>
                          {c.ok ? <FileCheck2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[12px] font-bold text-slate-700">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thông tin thụ hưởng</h4>
                  <div className="p-5 rounded-2xl bg-[#0f172a] text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                      <Wallet className="w-24 h-24" />
                    </div>
                    <div className="relative space-y-4">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-[#eec54e]" />
                        <p className="text-[13px] font-bold uppercase tracking-widest font-mono">Recipient Account</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[12px] text-slate-400">Tên tài khoản</p>
                        <p className="text-[15px] font-bold text-[#eec54e]">{payment.recipient.toUpperCase()}</p>
                      </div>
                      <div className="space-y-1 pt-2">
                        <p className="text-[12px] text-slate-400">Số tài khoản / Ngân hàng</p>
                        <p className="text-[14px] font-bold tracking-widest">{payment.bankInfo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Case Link */}
              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:border-[#eec54e]/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phát sinh từ Session</p>
                    <p className="text-[15px] font-bold text-slate-900 mt-0.5">{payment.session.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500">
                      <span className="font-mono">#{payment.session.id}</span>
                      <span>•</span>
                      <span>Ngày tư vấn: {payment.session.date}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#eec54e] -translate-x-2 group-hover:translate-x-0 transition-all font-bold" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Approval Panel */}
        <div className="space-y-6">
          
          {/* Security Alert Header */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-emerald-900 leading-tight">Yêu cầu hợp lệ</p>
              <p className="text-[12px] text-emerald-800/80 mt-1 leading-relaxed">
                Hệ thống xác nhận tất cả các điều kiện về báo cáo và tài liệu đã được Advisor hoàn thành đầy đủ.
              </p>
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-xl shadow-slate-200 sticky top-24">
            <h3 className="text-[13px] font-bold uppercase tracking-widest mb-6 font-plus-jakarta-sans text-slate-400">Pha Duyệt Thanh Toán</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("APPROVE")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-500/10"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Xác nhận & Giải ngân
              </button>
              <button 
                onClick={() => handleAction("HOLD")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white text-[13px] font-bold hover:bg-white/5 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                Tạm giữ (Hold) Payout
              </button>
              <button 
                onClick={() => handleAction("REJECT")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-400/50 text-red-400 text-[13px] font-bold hover:bg-red-400/10 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Từ chối thanh toán
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-4">Mã pin xác nhận (Staff Alpha)</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
