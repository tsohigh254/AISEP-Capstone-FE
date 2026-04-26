"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  ArrowDownRight,
  Wallet,
  Calendar,
  Loader2,
  RefreshCcw,
  Percent,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetFinanceOverview, type StaffFinanceStats } from "@/services/staff/finance.api";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function StaffFinancePage() {
  const [stats, setStats] = useState<StaffFinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7D" | "30D">("30D");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (p: "7D" | "30D", currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await GetFinanceOverview(p, currentPage, pageSize);
      if (res.isSuccess) {
        setStats(res.data || null);
      } else {
        setError(res.message || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period, page);
  }, [period, page]);

  const handlePeriodChange = (p: "7D" | "30D") => {
    setPeriod(p);
    setPage(1); // Reset to first page on filter change
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#eec54e]" />
        <p className="text-[14px] font-medium text-slate-500">Đang tải dữ liệu tài chính...</p>
      </div>
    );
  }

  const totalPages = Math.ceil((stats?.totalTransactions || 0) / pageSize);

  return (
    <div className="px-8 py-7 pb-16 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 font-plus-jakarta-sans text-[22px] font-black tracking-tight text-slate-900 uppercase">
            <BarChart3 className="h-6 w-6 text-[#eec54e]" />
            Quản lý tài chính hệ thống
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 font-medium">
            Báo cáo doanh thu, hoa hồng và danh sách giao dịch chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          {(["7D", "30D"] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={cn(
                "px-4 py-2 text-[12px] font-bold rounded-lg transition-all",
                period === p 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              {p === "7D" ? "7 ngày qua" : "30 ngày qua"}
            </button>
          ))}
          <button 
            onClick={() => fetchData(period, page)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="Làm mới"
          >
            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium">
          {error}
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            label: "Tổng tiền đã nhận",
            value: stats?.totalRevenue || 0,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            desc: "Doanh thu trong kỳ"
          },
          {
            label: "Hoa hồng & Sub",
            value: stats?.totalCommission || 0,
            icon: Percent,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
            desc: "Lợi nhuận hệ thống"
          },
          {
            label: "Thực chi",
            value: stats?.totalPayouts || 0,
            icon: TrendingDown,
            color: "text-rose-600",
            bg: "bg-rose-50",
            border: "border-rose-100",
            desc: "Đã giải ngân & hoàn"
          },
          {
            label: "Nợ Mentor",
            value: stats?.pendingAdvisorPayouts || 0,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100",
            desc: "Chờ release tiền"
          },
          {
            label: "Nợ hoàn Startup",
            value: stats?.pendingStartupRefunds || 0,
            icon: RefreshCcw,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100",
            desc: "Chờ hoàn tiền bị hủy"
          },
          {
            label: "Số dư hiện tại",
            value: stats?.currentSystemBalance || 0,
            icon: Wallet,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            desc: "Tiền khả dụng"
          },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "p-5 rounded-[20px] border bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col gap-3",
            stat.border
          )}>
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Realtime</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1 leading-tight">{stat.label}</p>
              <p className={cn("text-[18px] font-black tracking-tight", stat.color)}>
                {formatCurrency(stat.value)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdowns & Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Sources */}
        <div className="p-6 rounded-[32px] bg-white border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
              Phân bổ nguồn tiền vào (Income)
            </h3>
          </div>
          <div className="space-y-4">
            {stats?.incomeSources.map((source, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-600 font-medium">{source.sourceName}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(source.amount)} ({source.percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Sources */}
        <div className="p-6 rounded-[32px] bg-white border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-rose-500" />
              Phân bổ nguồn tiền ra (Expense)
            </h3>
          </div>
          <div className="space-y-4">
            {stats?.expenseSources.map((source, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-600 font-medium">{source.sourceName}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(source.amount)} ({source.percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Transaction List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-[#eec54e]" />
              Lịch sử giao dịch mới nhất
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-500">
                  Cập nhật: {stats?.checkedAt ? formatDate(stats.checkedAt) : "..."}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thời gian</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mô tả</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nguồn</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số tiền</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats?.recentTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-[12px] text-slate-500 font-medium whitespace-nowrap">{formatDate(tx.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-bold text-slate-800">{tx.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[12px] text-slate-600 font-medium">{tx.source}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={cn(
                          "text-[13px] font-black",
                          tx.type === "IN" ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {tx.type === "IN" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                          tx.type === "IN" 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        )}>
                          {tx.type === "IN" ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                          {tx.type === "IN" ? "Tiền vào" : "Tiền ra"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats?.recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-[13px]">
                        Không có giao dịch nào trong khoảng thời gian này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[12px] text-slate-500 font-medium">
                  Hiển thị {stats?.recentTransactions.length} trên tổng số {stats?.totalTransactions} giao dịch
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1 || loading}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "w-8 h-8 text-[12px] font-bold rounded-lg transition-all",
                          page === p 
                            ? "bg-[#eec54e] text-white shadow-sm" 
                            : "text-slate-500 hover:bg-white hover:text-slate-800"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={page === totalPages || loading}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
