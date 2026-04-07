"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  UserPlus,
  X,
  ArrowUpRight,
  Clock,
  Loader2,
  InboxIcon,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { GetSentConnections, WithdrawConnection } from "@/services/connection/connection.api";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function StartupAvatar({ name, size = "size-10" }: { name: string; size?: string }) {
  const gradients = [
    "from-violet-500 to-violet-600",
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
  ];
  const idx = (name?.charCodeAt(0) ?? 0) % gradients.length;
  return (
    <div className={cn(size, "rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-black/5", gradients[idx])}>
      {(name ?? "?").charAt(0).toUpperCase()}
    </div>
  );
}

type Tab = "pending" | "accepted" | "rejected";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<IConnectionItem[]>([]);
  const [accepted, setAccepted] = useState<IConnectionItem[]>([]);
  const [rejected, setRejected] = useState<IConnectionItem[]>([]);
  const [loadingTab, setLoadingTab] = useState<Tab | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  const fetchTab = useCallback(async (tab: Tab, p = 1) => {
    setLoadingTab(tab);
    try {
      const statusMap: Record<Tab, string> = {
        pending: "Requested",
        accepted: "Accepted",
        rejected: "Rejected",
      };
      const res = await GetSentConnections(p, PAGE_SIZE, statusMap[tab]);
      if (res?.isSuccess) {
        const items: IConnectionItem[] = res.data?.items ?? [];
        const total = res.data?.paging?.totalItems ?? items.length;
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
        if (tab === "pending") setPending(items);
        else if (tab === "accepted") setAccepted(items);
        else setRejected(items);
      }
    } catch {
      toast.error("Lỗi khi tải danh sách kết nối");
    } finally {
      setLoadingTab(null);
    }
  }, []);

  useEffect(() => {
    fetchTab("pending", 1);
    fetchTab("accepted", 1);
    fetchTab("rejected", 1);
  }, [fetchTab]);

  const handleWithdraw = async (id: number) => {
    setWithdrawingId(id);
    try {
      const res = await WithdrawConnection(id) as any;
      if (res?.isSuccess || res?.success) {
        toast.success("Đã thu hồi yêu cầu kết nối");
        fetchTab("pending", page);
      } else {
        toast.error("Không thể thu hồi yêu cầu");
      }
    } catch {
      toast.error("Lỗi khi thu hồi yêu cầu");
    } finally {
      setWithdrawingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchTab(activeTab, newPage);
  };

  const tabItems: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "pending", label: "Đang chờ phản hồi", icon: Clock, count: pending.length },
    { id: "accepted", label: "Đã kết nối", icon: UserPlus, count: accepted.length },
    { id: "rejected", label: "Bị từ chối", icon: XCircle, count: rejected.length },
  ];

  const currentList = activeTab === "pending" ? pending : activeTab === "accepted" ? accepted : rejected;
  const isLoading = loadingTab === activeTab;

  const EmptyRow = ({ message }: { message: string }) => (
    <tr>
      <td colSpan={4} className="px-8 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <InboxIcon className="size-10 text-slate-200" />
          <p className="text-[13px] font-bold text-slate-400">{message}</p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-[32px] font-black text-[#171611] tracking-tight leading-none">Kết nối Startup</h1>
        <p className="text-slate-400 text-[15px] font-medium leading-relaxed max-w-[600px]">
          Quản lý các yêu cầu kết nối bạn đã gửi đến Startup và theo dõi tiến trình.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-8 overflow-x-auto">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); fetchTab(tab.id, 1); }}
            className={cn(
              "relative pb-4 text-[14px] font-bold tracking-tight transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className={cn("size-4", activeTab === tab.id ? "text-[#e6cc4c]" : "text-slate-300")} />
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                activeTab === tab.id ? "bg-[#e6cc4c] text-[#171611]" : "bg-slate-100 text-slate-400"
              )}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#e6cc4c] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            placeholder="Tìm kiếm startup..."
            className="w-full pl-10 h-11 bg-white border-slate-200 rounded-xl text-[13px] font-medium focus:ring-1 focus:ring-yellow-400/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-black text-slate-300 uppercase tracking-widest">Sắp xếp:</span>
          <div className="h-11 px-4 bg-white border border-slate-200 rounded-xl flex items-center gap-6 cursor-pointer min-w-[160px] justify-between group hover:border-[#e6cc4c]/40 transition-all">
            <span className="text-[13px] font-semibold text-slate-700">Mới nhất</span>
            <ChevronDown className="size-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Startup</th>
              <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tin nhắn</th>
              <th className="px-8 py-5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Thời gian</th>
              <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="size-8 animate-spin text-[#e6cc4c]" />
                  </div>
                </td>
              </tr>
            ) : currentList.length === 0 ? (
              <EmptyRow
                message={
                  activeTab === "pending" ? "Không có yêu cầu nào đang chờ phản hồi" :
                  activeTab === "accepted" ? "Chưa có kết nối nào được thiết lập" :
                  "Không có yêu cầu nào bị từ chối"
                }
              />
            ) : (
              currentList.map((item) => (
                <tr key={item.connectionID} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <StartupAvatar name={item.startupName} />
                      <div>
                        <p className="text-[15px] font-semibold text-slate-900 group-hover:text-[#C8A000] transition-colors">
                          {item.startupName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">ID #{item.startupID}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-[360px]">
                    {item.personalizedMessage ? (
                      <p className="text-[13px] text-slate-600 font-medium leading-relaxed line-clamp-2 italic border-l-2 border-slate-100 pl-4">
                        {item.personalizedMessage}
                      </p>
                    ) : (
                      <span className="text-[12px] text-slate-300 italic">Không có tin nhắn</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <p className="text-[13px] font-bold text-slate-700">{formatDate(item.requestedAt)}</p>
                      {activeTab === "pending" && (
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Đang chờ</span>
                      )}
                      {activeTab === "accepted" && (
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Đã kết nối</span>
                      )}
                      {activeTab === "rejected" && (
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Bị từ chối</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {activeTab === "pending" && (
                        <button
                          onClick={() => handleWithdraw(item.connectionID)}
                          disabled={withdrawingId === item.connectionID}
                          className="h-10 px-4 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-[13px] flex items-center gap-2 disabled:opacity-50"
                        >
                          {withdrawingId === item.connectionID ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <X className="size-4" />
                          )}
                          Thu hồi
                        </button>
                      )}
                      {activeTab === "accepted" && (
                        <Link href="/investor/messaging">
                          <button className="h-10 px-4 rounded-xl bg-slate-50 text-slate-600 hover:bg-[#e6cc4c] hover:text-[#171611] transition-all font-bold text-[13px] flex items-center gap-2">
                            <MessageCircle className="size-4" />
                            Nhắn tin
                          </button>
                        </Link>
                      )}
                      {activeTab === "rejected" && (
                        <Link href={`/investor/startups/${item.startupID}`}>
                          <button className="h-10 px-4 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all font-bold text-[13px] flex items-center gap-2">
                            <ArrowUpRight className="size-4" />
                            Xem startup
                          </button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 pb-6 flex justify-center">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="size-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-300 hover:border-slate-200 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center text-[14px] font-bold border transition-all",
                  p === page
                    ? "bg-[#eec54e] text-white shadow-lg shadow-yellow-500/20 border-[#eec54e]"
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="size-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
