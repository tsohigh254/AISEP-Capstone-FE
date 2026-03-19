"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Undo2,
  Lock,
  Edit3,
  FileQuestion,
  X,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  GetConnectionById,
  UpdateConnection,
  WithdrawConnection,
  AcceptConnection,
  RejectConnection,
  CloseConnection,
} from "@/services/connection/connection.api";

export default function ConnectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = Number(params.id);

  const [conn, setConn] = useState<IConnectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit message modal
  const [showEdit, setShowEdit] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editing, setEditing] = useState(false);

  // Reject modal
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await GetConnectionById(connectionId)) as unknown as IBackendRes<IConnectionDetail>;
      if (res.success && res.data) {
        setConn(res.data);
      } else {
        setError(res.message || "Không tìm thấy kết nối.");
      }
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    if (connectionId) fetchConnection();
  }, [connectionId, fetchConnection]);

  const handleAction = async (action: () => Promise<unknown>, successMsg?: string) => {
    setActionLoading(true);
    try {
      const res = (await action()) as unknown as IBackendRes<IConnectionItem>;
      if (res.success) {
        fetchConnection();
      } else {
        alert(res.message || "Thao tác thất bại.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (!confirm("Bạn có chắc muốn rút lại yêu cầu kết nối này?")) return;
    handleAction(() => WithdrawConnection(connectionId));
  };

  const handleAccept = () => handleAction(() => AcceptConnection(connectionId));

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const res = (await RejectConnection(connectionId, { reason: rejectReason })) as unknown as IBackendRes<IConnectionItem>;
      if (res.success) {
        setShowReject(false);
        setRejectReason("");
        fetchConnection();
      } else {
        alert(res.message || "Thao tác thất bại.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = () => {
    if (!confirm("Bạn có chắc muốn đóng kết nối này?")) return;
    handleAction(() => CloseConnection(connectionId));
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(true);
    try {
      const res = (await UpdateConnection(connectionId, { message: editMessage })) as unknown as IBackendRes<IConnectionItem>;
      if (res.success) {
        setShowEdit(false);
        fetchConnection();
      } else {
        alert(res.message || "Không thể cập nhật.");
      }
    } catch {
      alert("Có lỗi xảy ra.");
    } finally {
      setEditing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    const map: Record<string, { bg: string; text: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
      accepted: { bg: "bg-green-100", text: "text-green-700" },
      rejected: { bg: "bg-red-100", text: "text-red-700" },
      withdrawn: { bg: "bg-slate-100", text: "text-slate-600" },
      closed: { bg: "bg-gray-100", text: "text-gray-600" },
    };
    const style = map[s] || { bg: "bg-blue-100", text: "text-blue-700" };
    return (
      <Badge className={`${style.bg} ${style.text} hover:${style.bg} border-0 px-4 py-1.5 text-xs font-bold uppercase`}>
        {status}
      </Badge>
    );
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getInfoRequestStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Đang chờ</Badge>;
    if (s === "fulfilled") return <Badge className="bg-green-100 text-green-700 border-0 text-xs">Đã hoàn thành</Badge>;
    if (s === "rejected") return <Badge className="bg-red-100 text-red-700 border-0 text-xs">Đã từ chối</Badge>;
    return <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">{status}</Badge>;
  };

  if (loading) {
    return (
      <InvestorShell>
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Đang tải...
        </div>
      </InvestorShell>
    );
  }

  if (error || !conn) {
    return (
      <InvestorShell>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{error || "Không tìm thấy kết nối"}</h2>
          <Link href="/investor/offers">
            <Button className="mt-4">Quay lại danh sách</Button>
          </Link>
        </div>
      </InvestorShell>
    );
  }

  const status = conn.connectionStatus.toLowerCase();
  const isPending = status === "pending";
  const isAccepted = status === "accepted";

  return (
    <InvestorShell>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/investor/offers" className="hover:text-blue-600">
            🔗 Kết nối
          </Link>
          <span>/</span>
          <span>Kết nối #{conn.connectionID}</span>
        </div>

        {/* Back Button */}
        <Link href="/investor/offers">
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>

        {/* Main Connection Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-3">{conn.startupName || `Startup #${conn.startupID}`}</h1>
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(conn.connectionStatus)}
                  {conn.matchScore > 0 && (
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <Sparkles className="w-4 h-4" />
                      Match Score: {conn.matchScore}%
                    </div>
                  )}
                </div>
                {conn.investorName && (
                  <p className="text-sm text-slate-500">Nhà đầu tư: {conn.investorName}</p>
                )}
              </div>
              <div className="text-right text-sm text-slate-500 space-y-1">
                <div>Kết nối #{conn.connectionID}</div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-slate-200">
              <div>
                <div className="text-xs text-slate-500 uppercase font-medium mb-2">Gửi lúc</div>
                <div className="text-sm font-semibold">{formatDate(conn.requestedAt)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-medium mb-2">Phản hồi lúc</div>
                <div className="text-sm font-semibold">{conn.respondedAt ? formatDate(conn.respondedAt) : "Chưa phản hồi"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-medium mb-2">Match Score</div>
                <div className="text-sm font-semibold">{conn.matchScore > 0 ? `${conn.matchScore}%` : "—"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-medium mb-2">Tài liệu</div>
                <div className="text-sm font-semibold">{conn.attachedDocumentIDs || "Không có"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Message + Info Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personalized Message */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Lời nhắn
                  </h2>
                  {isPending && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditMessage(conn.personalizedMessage || "");
                        setShowEdit(true);
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {conn.personalizedMessage || "Không có lời nhắn."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information Requests */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-purple-600" />
                    Yêu cầu thông tin ({conn.informationRequests?.length || 0})
                  </h2>
                  {isAccepted && (
                    <Link href={`/investor/offers/${conn.connectionID}/counter`}>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Tạo yêu cầu mới
                      </Button>
                    </Link>
                  )}
                </div>

                {!conn.informationRequests || conn.informationRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <FileQuestion className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Chưa có yêu cầu thông tin nào.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conn.informationRequests.map((req) => (
                      <div key={req.requestID} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">{req.requestType}</Badge>
                            {getInfoRequestStatusBadge(req.requestStatus)}
                          </div>
                          <span className="text-xs text-slate-500">{formatDate(req.requestedAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{req.requestMessage}</p>
                        {req.responseMessage && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="text-xs text-slate-500 uppercase font-medium mb-1">Phản hồi</div>
                            <p className="text-sm text-slate-600">{req.responseMessage}</p>
                            {req.responseDocumentIDs && (
                              <p className="text-xs text-slate-400 mt-1">Tài liệu: {req.responseDocumentIDs}</p>
                            )}
                            {req.fulfilledAt && (
                              <p className="text-xs text-slate-400 mt-1">Hoàn thành: {formatDate(req.fulfilledAt)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Actions */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Thao tác</h2>
                <div className="space-y-3">
                  {/* Pending actions */}
                  {isPending && (
                    <>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={actionLoading}
                        onClick={handleAccept}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                        disabled={actionLoading}
                        onClick={() => setShowReject(true)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Từ chối
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                        disabled={actionLoading}
                        onClick={handleWithdraw}
                      >
                        <Undo2 className="w-4 h-4 mr-2" />
                        Rút lại yêu cầu
                      </Button>
                    </>
                  )}

                  {/* Accepted actions */}
                  {isAccepted && (
                    <>
                      <Link href={`/investor/offers/${conn.connectionID}/counter`} className="block">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                          <FileQuestion className="w-4 h-4 mr-2" />
                          Yêu cầu thông tin
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full text-slate-600"
                        disabled={actionLoading}
                        onClick={handleClose}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Đóng kết nối
                      </Button>
                    </>
                  )}

                  {/* Closed / Rejected / Withdrawn */}
                  {(status === "closed" || status === "rejected" || status === "withdrawn") && (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      Kết nối đã kết thúc ({conn.connectionStatus}).
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200">
                    <Link href="/investor/offers">
                      <Button variant="link" className="w-full justify-start text-blue-600 p-0">
                        ← Quay lại danh sách kết nối
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Edit Message Modal ── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Chỉnh sửa lời nhắn</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateMessage} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Lời nhắn</Label>
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowEdit(false)} className="flex-1 h-11">
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={editing}
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Từ chối kết nối</h2>
              <button onClick={() => { setShowReject(false); setRejectReason(""); }} className="text-slate-400 hover:text-slate-600">
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
                <Button variant="outline" onClick={() => { setShowReject(false); setRejectReason(""); }} className="flex-1 h-11">
                  Hủy
                </Button>
                <Button
                  disabled={actionLoading || !rejectReason.trim()}
                  onClick={handleReject}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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