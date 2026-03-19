"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  Plus,
  FileQuestion,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  GetInfoRequests,
  CreateInfoRequest,
  FulfillInfoRequest,
  RejectInfoRequest,
} from "@/services/connection/connection.api";

export default function InfoRequestsPage() {
  const params = useParams();
  const connectionId = Number(params.id);

  const [requests, setRequests] = useState<IInfoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ requestType: "", requestMessage: "" });
  const [creating, setCreating] = useState(false);

  // Fulfill modal
  const [fulfillTarget, setFulfillTarget] = useState<number | null>(null);
  const [fulfillForm, setFulfillForm] = useState({ responseMessage: "", responseDocumentIDs: "" });
  const [fulfilling, setFulfilling] = useState(false);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await GetInfoRequests(connectionId)) as unknown as IBackendRes<IInfoRequest[]>;
      if (res.success && res.data) {
        setRequests(res.data);
      } else {
        setError(res.message || "Không thể tải danh sách yêu cầu.");
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    if (connectionId) fetchRequests();
  }, [connectionId, fetchRequests]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = (await CreateInfoRequest(connectionId, {
        requestType: createForm.requestType,
        requestMessage: createForm.requestMessage,
      })) as unknown as IBackendRes<IInfoRequest>;
      if (res.success) {
        setShowCreate(false);
        setCreateForm({ requestType: "", requestMessage: "" });
        fetchRequests();
      } else {
        alert(res.message || "Không thể tạo yêu cầu.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setCreating(false);
    }
  };

  const handleFulfill = async () => {
    if (fulfillTarget === null) return;
    setFulfilling(true);
    try {
      const res = (await FulfillInfoRequest(fulfillTarget, {
        responseMessage: fulfillForm.responseMessage,
        responseDocumentIDs: fulfillForm.responseDocumentIDs,
      })) as unknown as IBackendRes<IInfoRequest>;
      if (res.success) {
        setFulfillTarget(null);
        setFulfillForm({ responseMessage: "", responseDocumentIDs: "" });
        fetchRequests();
      } else {
        alert(res.message || "Không thể hoàn thành.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setFulfilling(false);
    }
  };

  const handleReject = async () => {
    if (rejectTarget === null) return;
    setRejecting(true);
    try {
      const res = (await RejectInfoRequest(rejectTarget, { reason: rejectReason })) as unknown as IBackendRes<IInfoRequest>;
      if (res.success) {
        setRejectTarget(null);
        setRejectReason("");
        fetchRequests();
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
    if (s === "pending") return <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Đang chờ</Badge>;
    if (s === "fulfilled") return <Badge className="bg-green-100 text-green-700 border-0 text-xs">Đã hoàn thành</Badge>;
    if (s === "rejected") return <Badge className="bg-red-100 text-red-700 border-0 text-xs">Đã từ chối</Badge>;
    return <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">{status}</Badge>;
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <InvestorShell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/investor/offers" className="hover:text-blue-600">
            🔗 Kết nối
          </Link>
          <span>/</span>
          <Link href={`/investor/offers/${connectionId}`} className="hover:text-blue-600">
            Kết nối #{connectionId}
          </Link>
          <span>/</span>
          <span>Yêu cầu thông tin</span>
        </div>

        {/* Back */}
        <Link href={`/investor/offers/${connectionId}`}>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại chi tiết kết nối
          </Button>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Yêu cầu thông tin</h1>
            <p className="text-slate-600">
              Quản lý các yêu cầu thông tin cho Connection #{connectionId}
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo yêu cầu mới
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
            <button onClick={fetchRequests} className="ml-2 underline hover:no-underline">Thử lại</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Chưa có yêu cầu thông tin nào.</p>
            <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Tạo yêu cầu đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.requestID} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-700 border-0 px-3 py-1">{req.requestType}</Badge>
                      {getStatusBadge(req.requestStatus)}
                      <span className="text-xs text-slate-400">#{req.requestID}</span>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(req.requestedAt)}</span>
                  </div>

                  <p className="text-sm text-slate-700 mb-3">{req.requestMessage}</p>

                  {/* Response */}
                  {req.responseMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                      <div className="text-xs text-green-600 uppercase font-medium mb-1">Phản hồi</div>
                      <p className="text-sm text-slate-700">{req.responseMessage}</p>
                      {req.responseDocumentIDs && (
                        <p className="text-xs text-slate-500 mt-1">Tài liệu: {req.responseDocumentIDs}</p>
                      )}
                      {req.fulfilledAt && (
                        <p className="text-xs text-slate-400 mt-1">Hoàn thành: {formatDate(req.fulfilledAt)}</p>
                      )}
                    </div>
                  )}

                  {/* Actions for pending requests */}
                  {req.requestStatus.toLowerCase() === "pending" && (
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-1"
                        onClick={() => {
                          setFulfillTarget(req.requestID);
                          setFulfillForm({ responseMessage: "", responseDocumentIDs: "" });
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Hoàn thành
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => {
                          setRejectTarget(req.requestID);
                          setRejectReason("");
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                        Từ chối
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Info Request Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Tạo yêu cầu thông tin</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Loại yêu cầu</Label>
                  <select
                    value={createForm.requestType}
                    onChange={(e) => setCreateForm((f) => ({ ...f, requestType: e.target.value }))}
                    className="w-full h-11 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn loại...</option>
                    <option value="Financial">Tài chính</option>
                    <option value="Legal">Pháp lý</option>
                    <option value="Technical">Kỹ thuật</option>
                    <option value="Business">Kinh doanh</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nội dung yêu cầu</Label>
                  <textarea
                    value={createForm.requestMessage}
                    onChange={(e) => setCreateForm((f) => ({ ...f, requestMessage: e.target.value }))}
                    placeholder="Mô tả thông tin bạn cần..."
                    className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1 h-11">
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white"
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

      {/* ── Fulfill Modal ── */}
      {fulfillTarget !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Hoàn thành yêu cầu</h2>
              <button onClick={() => setFulfillTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phản hồi</Label>
                <textarea
                  value={fulfillForm.responseMessage}
                  onChange={(e) => setFulfillForm((f) => ({ ...f, responseMessage: e.target.value }))}
                  placeholder="Nhập phản hồi..."
                  className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">ID tài liệu đính kèm (tùy chọn)</Label>
                <Input
                  value={fulfillForm.responseDocumentIDs}
                  onChange={(e) => setFulfillForm((f) => ({ ...f, responseDocumentIDs: e.target.value }))}
                  placeholder="VD: doc-1, doc-2"
                  className="h-11 border-slate-300"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setFulfillTarget(null)} className="flex-1 h-11">
                  Hủy
                </Button>
                <Button
                  disabled={fulfilling || !fulfillForm.responseMessage.trim()}
                  onClick={handleFulfill}
                  className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white"
                >
                  {fulfilling && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Info Request Modal ── */}
      {rejectTarget !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Từ chối yêu cầu</h2>
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
                  placeholder="Nhập lý do..."
                  className="w-full min-h-[100px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }} className="flex-1 h-11">
                  Hủy
                </Button>
                <Button
                  disabled={rejecting || !rejectReason.trim()}
                  onClick={handleReject}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
                >
                  {rejecting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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