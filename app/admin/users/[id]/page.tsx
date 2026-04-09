"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminShell } from "@/components/admin/admin-shell";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import {
    ArrowLeft, CheckCircle2, Clock, FileText,
    Lock, Mail, Pencil, Shield, Unlock, Loader2,
    AlertTriangle,
} from "lucide-react";
import { GetUserById, UpdateUserStatus, GetAuditLogs } from "@/services/admin/admin.api";

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminUserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const userId = Number(id);

    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
    const [auditLoading, setAuditLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [lockLoading, setLockLoading] = useState(false);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GetUserById(userId) as unknown as IBackendRes<IUser>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                setUser(res.data);
            } else {
                toast.error("Không tìm thấy người dùng");
                router.push("/admin/users");
            }
        } catch {
            toast.error("Lỗi khi tải thông tin người dùng");
            router.push("/admin/users");
        }
        finally { setLoading(false); }
    }, [userId, router]);

    const fetchAudit = useCallback(async () => {
        setAuditLoading(true);
        try {
            const res = await GetAuditLogs({ userId, page: 1, pageSize: 10 }) as unknown as IBackendRes<any>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                // Backend returns { page, pageSize, total, data: [...] }
                setAuditLogs(res.data.items ?? res.data.data ?? []);
            }
        } catch { /* silent */ }
        finally { setAuditLoading(false); }
    }, [userId]);

    useEffect(() => {
        if (userId) { fetchUser(); fetchAudit(); }
    }, [userId, fetchUser, fetchAudit]);

    const handleToggleStatus = async () => {
        if (!user) return;
        setLockLoading(true);
        try {
            const res = await UpdateUserStatus(user.userId, !user.isActive) as unknown as IBackendRes<string>;
            if ((res?.isSuccess || res?.success)) {
                toast.success(user.isActive ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản");
                fetchUser();
            } else {
                toast.error(res?.message || "Thao tác thất bại");
            }
        } catch { toast.error("Lỗi hệ thống"); }
        finally { setLockLoading(false); }
    };

    if (loading) {
        return (
            <AdminShell>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </AdminShell>
        );
    }

    if (!user) return null;

    const isAdmin = user.userType === "Admin";

    return (
        <AdminShell>
            <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">

                {/* Back + Header */}
                <div>
                    <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors mb-4">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Quay lại danh sách
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-[20px] font-bold text-slate-900">{user.email}</h1>
                            <p className="text-[13px] text-slate-400 mt-0.5">User ID: #{user.userId} · {user.userType}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isAdmin && (
                                <>
                                    <button
                                        onClick={() => setEditOpen(true)}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" /> Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={handleToggleStatus}
                                        disabled={lockLoading}
                                        className={cn(
                                            "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors",
                                            user.isActive
                                                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                        )}
                                    >
                                        {lockLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                        {user.isActive ? "Khoá" : "Mở khoá"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* User Info Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                            <h2 className="text-[15px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-slate-400" />
                                Thông tin tài khoản
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem label="Email" value={user.email} icon={<Mail className="w-3.5 h-3.5" />} />
                                <InfoItem label="Loại tài khoản" value={user.userType} icon={<Shield className="w-3.5 h-3.5" />} />
                                <InfoItem label="Trạng thái" value={user.isActive ? "Active" : "Locked"} icon={user.isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-red-500" />} />
                                <InfoItem label="Email verified" value={user.emailVerified ? "Đã xác minh" : "Chưa xác minh"} icon={user.emailVerified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />} />
                                <InfoItem label="Ngày tạo" value={new Date(user.createdAt).toLocaleDateString("vi-VN")} icon={<Clock className="w-3.5 h-3.5" />} />
                                <InfoItem label="Đăng nhập cuối" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("vi-VN") : "Chưa đăng nhập"} icon={<Clock className="w-3.5 h-3.5" />} />
                                <InfoItem label="Roles" value={user.roles?.join(", ") || "Không có"} icon={<Shield className="w-3.5 h-3.5" />} />
                            </div>
                        </div>
                    </div>

                    {/* Audit Log Sidebar */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Audit Log
                            </h2>
                            <Link href={`/admin/audit-logs?userId=${userId}`} className="text-[11px] font-medium text-slate-400 hover:text-slate-700">
                                Xem tất cả →
                            </Link>
                        </div>
                        {auditLoading ? (
                            <div className="p-6 animate-pulse space-y-3">
                                <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                                <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-[13px] text-slate-400">Chưa có audit log nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {auditLogs.map(log => (
                                    <div key={log.logId} className="px-5 py-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[12px] font-semibold text-slate-700">{log.actionType}</span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(log.createdAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 line-clamp-1">
                                            {log.entityType}{log.entityId ? ` #${log.entityId}` : ""}
                                            {log.actionDetails ? ` · ${log.actionDetails}` : ""}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditUserModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onSaved={() => { setEditOpen(false); fetchUser(); }}
                userId={userId}
            />
        </AdminShell>
    );
}

/* ─── InfoItem ─────────────────────────────────────────── */
function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2">
            <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 mt-0.5">
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{value}</p>
            </div>
        </div>
    );
}
