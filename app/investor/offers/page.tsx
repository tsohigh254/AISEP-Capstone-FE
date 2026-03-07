"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Link2,
  Plus,
  X,
  Loader2,
  Eye,
  Undo2,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  GetSentConnections,
  GetReceivedConnections,
  CreateConnection,
  WithdrawConnection,
  AcceptConnection,
  RejectConnection,
} from "@/services/connection/connection.api";

type TabKey = "sent" | "received";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "Pending", label: "Pending" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
  { value: "Closed", label: "Closed" },
];

export default function ConnectionsPage() {
  const [tab, setTab] = useState<TabKey>("sent");
  const [connections, setConnections] = useState<IConnectionItem[]>([]);
  const [paging, setPaging] = useState<IPaging | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ startupId: "", message: "" });
  const [creating, setCreating] = useState(false);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetcher = tab === "sent" ? GetSentConnections : GetReceivedConnections;
      const res = (await fetcher(page, 20, statusFilter || undefined)) as unknown as IBackendRes<IPaginatedRes<IConnectionItem>>;
      if (res.success && res.data) {
        setConnections(res.data.items);
        setPaging(res.data.paging);
      } else {
        setError(res.message || "Không thể tải danh sách kết nối.");
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [tab, page, statusFilter]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Reset page when changing tab or filter
  useEffect(() => {
    setPage(1);
  }, [tab, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.startupId) return;
    setCreating(true);
    try {
      const res = (await CreateConnection({
        startupId: Number(createForm.startupId),
        message: createForm.message,
      })) as unknown as IBackendRes<IConnectionItem>;
      if (res.success) {
        setShowCreate(false);
        setCreateForm({ startupId: "", message: "" });
        fetchConnections();
      } else {
        alert(res.message || "Không thể tạo kết nối.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setCreating(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm("Bạn có chắc muốn rút lại yêu cầu kết nối này?")) return;
    setActionLoading(id);
    try {
      const res = (await WithdrawConnection(id)) as unknown as IBackendRes<IConnectionItem>;
      if (res.success) {
        fetchConnections();
      } else {
        alert(res.message || "Không thể rút yêu cầu.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (id: number) => {
    setActionLoading(id);
    try {
      const res = (await AcceptConnection(id)) as unknown as IBackendRes<IConnectionItem>;
      if (res.success) {
        fetchConnections();
      } else {
        alert(res.message || "Không thể chấp nhận.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (rejectTarget === null) return;
    setRejecting(true);
    try {
      const res = (await RejectConnection(rejectTarget, { reason: rejectReason })) as unknown as IBackendRes<IConnectionItem>;
      if (res.success) {
        setRejectTarget(null);
        setRejectReason("");
        fetchConnections();
      } else {
        alert(res.message || "Không thể từ chối.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending")
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0 px-3 py-1">Pending</Badge>;
    if (s === "accepted")
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 px-3 py-1">Accepted</Badge>;
    if (s === "rejected")
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 px-3 py-1">Rejected</Badge>;
    if (s === "withdrawn")
      return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0 px-3 py-1">Withdrawn</Badge>;
    if (s === "closed")
      return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 px-3 py-1">Closed</Badge>;
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 px-3 py-1">{status}</Badge>;
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <InvestorShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Connections</h1>
            <p className="text-slate-600 mt-1">Quản lý các yêu cầu kết nối với startup</p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-11 px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo kết nối mới
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setTab("sent")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "sent" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đã gửi
          </button>
          <button
            onClick={() => setTab("received")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "received" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đã nhận
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Label className="text-sm text-slate-600">Trạng thái:</Label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={fetchConnections} className="ml-2 underline hover:no-underline">
              Thử lại
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải...
          </div>
        ) : connections.length === 0 ? (
          <div className="text-center py-16">
            <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {tab === "sent" ? "Chưa gửi yêu cầu kết nối nào." : "Chưa nhận yêu cầu kết nối nào."}
            </p>
            {tab === "sent" && (
              <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Tạo kết nối đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Connection List */}
            <div className="space-y-4">
              {connections.map((conn) => (
                <Card key={conn.connectionID} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Name & Status */}
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-900">
                            {tab === "sent" ? conn.startupName : conn.investorName}
                          </h3>
                          {getStatusBadge(conn.connectionStatus)}
                        </div>

                        {/* Message */}
                        {conn.personalizedMessage && (
                          <p className="text-slate-600 line-clamp-2">{conn.personalizedMessage}</p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          {conn.matchScore > 0 && (
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>Match: {conn.matchScore}%</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Gửi: {formatDate(conn.requestedAt)}</span>
                          </div>
                          {conn.respondedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Phản hồi: {formatDate(conn.respondedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/investor/offers/${conn.connectionID}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            Chi tiết
                          </Button>
                        </Link>
                        {tab === "sent" && conn.connectionStatus.toLowerCase() === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                            disabled={actionLoading === conn.connectionID}
                            onClick={() => handleWithdraw(conn.connectionID)}
                          >
                            {actionLoading === conn.connectionID ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Undo2 className="w-4 h-4" />
                            )}
                            Rút lại
                          </Button>
                        )}
                        {tab === "received" && conn.connectionStatus.toLowerCase() === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === conn.connectionID}
                              onClick={() => handleAccept(conn.connectionID)}
                            >
                              {actionLoading === conn.connectionID ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              Chấp nhận
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => setRejectTarget(conn.connectionID)}
                            >
                              <XCircle className="w-4 h-4" />
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {paging && paging.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-600">
                  Trang {paging.page} / {paging.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= paging.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Create Connection Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Tạo kết nối mới</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="startupId" className="text-sm font-medium">
                    Startup ID
                  </Label>
                  <Input
                    id="startupId"
                    type="number"
                    value={createForm.startupId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, startupId: e.target.value }))}
                    placeholder="Nhập ID startup..."
                    className="h-11 border-slate-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Lời nhắn
                  </Label>
                  <textarea
                    id="message"
                    value={createForm.message}
                    onChange={(e) => setCreateForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Giới thiệu ngắn về mục đích kết nối..."
                    className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 h-11"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Gửi yêu cầu
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectTarget !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Từ chối kết nối</h2>
              <button onClick={() => { setRejectTarget(null); setRejectReason(""); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Lý do từ chối</Label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setRejectTarget(null); setRejectReason(""); }}
                  className="flex-1 h-11"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={rejecting || !rejectReason.trim()}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
                >
                  {rejecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Xác nhận từ chối
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </InvestorShell>
  );
}
