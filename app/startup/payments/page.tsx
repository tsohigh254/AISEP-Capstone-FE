"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  CreditCard, ShieldCheck, RotateCcw, DollarSign,
  CheckCircle2, AlertCircle, Clock, ChevronRight,
  BadgeCheck, Star, Search, Filter, Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IssueReportModal, type IssueReportContext } from "@/components/shared/issue-report-modal";

const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

// ─── Types ─────────────────────────────────────────────────────────────────────

type PaymentStatus =
  | "CHECKOUT_PENDING"
  | "PAYMENT_FAILED"
  | "PAID_HELD"
  | "RELEASE_READY"
  | "RELEASED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "DISPUTED";

interface PaymentRecord {
  id: string;
  requestId: string;
  requestNo: string;
  advisor: { name: string; title: string; avatar: string; isVerified: boolean; rating: number };
  topic: string;
  amount: number;
  status: PaymentStatus;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const AVATARS = {
  1: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhY2B_40T_b8ifCFhZYE9RUfdodTMIq4hkMeAvPfCxdek8AhcikuKD11XDhYpXmtyvdSlnne2UWZDbdEO4TMXf17yrSsltdyX2-bBHPjbzbTxFQNPTgQkflvmeFd6QdGRvx0WBDDS0vnBvv-defpdnEB2zPF8-sAiLMhhfWCHe6M2UpyMAwTRdjcu8xSEmKOJ3aGlWMMK40SM6ThVvCpVFz_jvRfcX6dDBi4rDUGiVvfrUIHpezyewWd_4dYD9EbKusdQxomMZQhk",
  2: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkeJpKLH89dtH6jy4p8OtegH6mL83JYobMLHvAQeMV-R-JV6ohyzLx5hQ2sZ387P-fztgR4sHa7EhmwJgbBTLxFVFskQsJI0Gohh4EB7LYt7pPNPIzVeMrNhIypAV8fJEz96dPqr4r8kUGO2XeJO1lDMfCEq0VHu2jl5963wBzE9lbl2WoMzmqdPjjGz-t_FAE1IFgbbvm8uMyf_V-UtsjIaqHKgVh5bF0DB5TQdrgyJ8kdtGF1397AobYsJYg8zAxOXwFyWtd32Q",
  3: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd7t5ciDWV2eTaJsfniBll5lOH1FpM75D-rNgvvVbqucB9qLvuvCqdD2n7NevngnBF0iNuRrvyppt6TSVePvhTgOoUFPXs3COh1SFpjFFfpRM7AvqpVQYWIKMeh8ZaAHBQXX7A9LfSgc9hJLF86zECFTAuBW7cVPKthlob2LHXSFNJoAt5LewaefZBVBDzh253xnffFoI4o3adtsf5g77DpJi4MsoGYiv14LMA-ivJZaM5n2tz_QhJaAEUCzsxPuiFm3f6b9lC-GA",
};

const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: "p1",
    requestId: "3",
    requestNo: "REQ-0003",
    advisor: { name: "Phạm Thành Long", title: "CTO & Co-founder · AI-Soft", avatar: AVATARS[3], isVerified: true, rating: 4.8 },
    topic: "Xây dựng đội kỹ thuật cho giai đoạn scale",
    amount: 3000000,
    status: "CHECKOUT_PENDING",
    createdAt: "20/03/2024",
    updatedAt: "20/03/2024",
  },
  {
    id: "p2",
    requestId: "4",
    requestNo: "REQ-0004",
    advisor: { name: "Nguyễn Minh Quân", title: "Head of Product · TechGlobal", avatar: AVATARS[1], isVerified: true, rating: 4.9 },
    topic: "Chiến lược tăng trưởng người dùng Q2/2024",
    amount: 2000000,
    status: "RELEASED",
    reference: "PAY-20240315-0004",
    createdAt: "20/03/2024",
    updatedAt: "20/03/2024",
  },
  {
    id: "p3",
    requestId: "7",
    requestNo: "REQ-0007",
    advisor: { name: "Trần Thu Hà", title: "Investment Director · VCFund", avatar: AVATARS[2], isVerified: true, rating: 5.0 },
    topic: "Gọi vốn Seed – Investor Targeting",
    amount: 3750000,
    status: "PAID_HELD",
    reference: "PAY-20240312-0007",
    createdAt: "12/03/2024",
    updatedAt: "13/03/2024",
  },
  {
    id: "p4",
    requestId: "8",
    requestNo: "REQ-0008",
    advisor: { name: "Phạm Thành Long", title: "CTO & Co-founder · AI-Soft", avatar: AVATARS[3], isVerified: true, rating: 4.8 },
    topic: "Code review kiến trúc microservices",
    amount: 1500000,
    status: "REFUNDED",
    reference: "REF-20240310-0008",
    createdAt: "08/03/2024",
    updatedAt: "11/03/2024",
  },
  {
    id: "p5",
    requestId: "9",
    requestNo: "REQ-0009",
    advisor: { name: "Nguyễn Minh Quân", title: "Head of Product · TechGlobal", avatar: AVATARS[1], isVerified: true, rating: 4.9 },
    topic: "Tối ưu hoá onboarding flow",
    amount: 2000000,
    status: "PAYMENT_FAILED",
    createdAt: "05/03/2024",
    updatedAt: "05/03/2024",
  },
];

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  CHECKOUT_PENDING: { label: "Chờ thanh toán", color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-100", icon: <Clock className="w-3 h-3" /> },
  PAYMENT_FAILED:   { label: "Thất bại",        color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100",   icon: <AlertCircle className="w-3 h-3" /> },
  PAID_HELD:        { label: "Đang giữ",         color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-100",icon: <ShieldCheck className="w-3 h-3" /> },
  RELEASE_READY:    { label: "Chờ xác nhận",     color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-100",  icon: <DollarSign className="w-3 h-3" /> },
  RELEASED:         { label: "Hoàn thành",        color: "text-slate-600",  bg: "bg-slate-100", border: "border-slate-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  REFUND_PENDING:   { label: "Chờ hoàn tiền",    color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100",icon: <RotateCcw className="w-3 h-3" /> },
  REFUNDED:         { label: "Đã hoàn tiền",      color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100",  icon: <RotateCcw className="w-3 h-3" /> },
  DISPUTED:         { label: "Tranh chấp",         color: "text-red-700",    bg: "bg-red-50",    border: "border-red-100",   icon: <AlertCircle className="w-3 h-3" /> },
};

const FILTER_TABS: { label: string; value: "all" | PaymentStatus }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ TT", value: "CHECKOUT_PENDING" },
  { label: "Đang giữ", value: "PAID_HELD" },
  { label: "Hoàn thành", value: "RELEASED" },
  { label: "Hoàn tiền", value: "REFUNDED" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | PaymentStatus>("all");
  const [search, setSearch] = useState("");
  const [issueContext, setIssueContext] = useState<IssueReportContext | null>(null);

  const openIssue = (e: React.MouseEvent, payment: PaymentRecord) => {
    e.stopPropagation();
    setIssueContext({
      entityType: "PAYMENT",
      entityId: payment.reference ?? payment.requestNo,
      entityTitle: `Thanh toán · ${payment.topic}`,
      otherPartyName: payment.advisor.name,
    });
  };

  const filtered = MOCK_PAYMENTS.filter(p => {
    if (activeFilter !== "all" && p.status !== activeFilter) return false;
    if (search && !p.requestNo.toLowerCase().includes(search.toLowerCase()) && !p.advisor.name.toLowerCase().includes(search.toLowerCase()) && !p.topic.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSpent = MOCK_PAYMENTS.filter(p => p.status === "RELEASED").reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = MOCK_PAYMENTS.filter(p => p.status === "CHECKOUT_PENDING" || p.status === "PAID_HELD").reduce((acc, p) => acc + p.amount, 0);

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

        {/* Page Header */}
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 leading-none">Lịch sử thanh toán</h1>
          <p className="text-[13px] text-slate-400 mt-1">Theo dõi tất cả các giao dịch tư vấn của bạn</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-[12px] font-semibold text-slate-500">Đã chi tiêu</span>
            </div>
            <p className="text-[26px] font-black text-slate-900 leading-none">{formatVND(totalSpent)}</p>
            <p className="text-[11px] text-slate-400 mt-1">{MOCK_PAYMENTS.filter(p => p.status === "RELEASED").length} phiên hoàn thành</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[12px] font-semibold text-slate-500">Đang xử lý</span>
            </div>
            <p className="text-[26px] font-black text-amber-600 leading-none">{formatVND(pendingAmount)}</p>
            <p className="text-[11px] text-slate-400 mt-1">{MOCK_PAYMENTS.filter(p => p.status === "CHECKOUT_PENDING" || p.status === "PAID_HELD").length} giao dịch</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-[12px] font-semibold text-slate-500">Tổng giao dịch</span>
            </div>
            <p className="text-[26px] font-black text-slate-900 leading-none">{MOCK_PAYMENTS.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Toàn thời gian</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Tìm theo mã yêu cầu, tên cố vấn, chủ đề..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-slate-300"
              />
            </div>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all",
                    activeFilter === tab.value
                      ? "bg-[#0f172a] text-white"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
              <Filter className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-slate-400">Không tìm thấy giao dịch nào</p>
              <p className="text-[12px] text-slate-300 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            filtered.map(payment => {
              const scfg = STATUS_CONFIG[payment.status];
              return (
                <div
                  key={payment.id}
                  onClick={() => {
                    if (payment.status === "CHECKOUT_PENDING" || payment.status === "PAYMENT_FAILED") {
                      router.push(`/startup/mentorship-requests/${payment.requestId}/checkout`);
                    } else {
                      router.push(`/startup/mentorship-requests/${payment.requestId}`);
                    }
                  }}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 hover:border-amber-200 hover:shadow-[0_2px_8px_rgba(238,197,78,0.12)] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img src={payment.advisor.avatar} alt={payment.advisor.name} className="w-11 h-11 rounded-xl object-cover border border-slate-100" />
                      {payment.advisor.isVerified && (
                        <BadgeCheck className="absolute -bottom-1 -right-1 w-4.5 h-4.5 text-amber-500 bg-white rounded-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-mono font-semibold text-slate-400">{payment.requestNo}</span>
                        <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", scfg.color, scfg.bg, scfg.border)}>
                          {scfg.icon}
                          {scfg.label}
                        </span>
                      </div>
                      <p className="text-[14px] font-bold text-slate-900 truncate leading-snug">{payment.topic}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] text-slate-500">{payment.advisor.name}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-semibold text-slate-400">{payment.advisor.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount + Action */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[18px] font-black text-slate-900 leading-none">{formatVND(payment.amount)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{payment.updatedAt}</p>
                        {payment.reference && (
                          <p className="text-[10px] font-mono text-slate-300 mt-0.5">{payment.reference}</p>
                        )}
                      </div>

                      {/* CTA for pending */}
                      {payment.status === "CHECKOUT_PENDING" && (
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/startup/mentorship-requests/${payment.requestId}/checkout`); }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-white rounded-xl text-[12px] font-semibold hover:bg-amber-600 transition-all shadow-sm whitespace-nowrap"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Thanh toán
                        </button>
                      )}
                      {payment.status === "PAYMENT_FAILED" && (
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/startup/mentorship-requests/${payment.requestId}/checkout`); }}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500 text-white rounded-xl text-[12px] font-semibold hover:bg-red-600 transition-all shadow-sm whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Thử lại
                        </button>
                      )}
                      {/* Report button for completed/disputed */}
                      {(payment.status === "RELEASED" || payment.status === "DISPUTED" || payment.status === "REFUNDED") && (
                        <button
                          onClick={(e) => openIssue(e, payment)}
                          title="Báo cáo sự cố"
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {payment.status !== "CHECKOUT_PENDING" && payment.status !== "PAYMENT_FAILED" && (
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <IssueReportModal
        isOpen={!!issueContext}
        onClose={() => setIssueContext(null)}
        context={issueContext ?? undefined}
      />
    </StartupShell>
  );
}
