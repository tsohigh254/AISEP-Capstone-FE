"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Mail, Shield, Calendar, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { GetUserById } from "@/services/admin/admin.api";

interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number | null;
}

export function ViewUserModal({ isOpen, onClose, userId }: ViewUserModalProps) {
    const [user, setUser] = useState<IAdminUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUser(userId);
        }
        if (!isOpen) {
            setUser(null);
            setError(null);
        }
    }, [isOpen, userId]);

    const fetchUser = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await GetUserById(id) as unknown as IBackendRes<IAdminUser>;
            if (res.success && res.data) {
                setUser(res.data);
            } else {
                setError(res.message || "Không thể tải thông tin người dùng.");
            }
        } catch {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            });
        } catch { return dateStr; }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-lg bg-white rounded-[32px] p-0 border-none overflow-hidden shadow-2xl"
                showCloseButton={false}
            >
                <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100 bg-gradient-to-br from-[#fdfbe9]/40 to-white">
                    <DialogTitle className="text-[22px] font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#eec54e] to-[#d4ae3d] flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            <User className="size-5 text-white" strokeWidth={2.5} />
                        </div>
                        Chi tiết người dùng
                    </DialogTitle>
                </DialogHeader>

                <div className="px-8 py-6 max-h-[65vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="size-7 text-[#eec54e] animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                            <AlertCircle className="size-5 text-red-500 flex-shrink-0" />
                            <span className="text-[13px] font-bold text-red-600">{error}</span>
                        </div>
                    ) : user ? (
                        <div className="space-y-5">
                            {/* Avatar & ID */}
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                <div className="size-14 rounded-full flex items-center justify-center font-black text-sm border border-slate-100/50 shadow-sm bg-[#fdf8e6] text-[#e6cc4c]">
                                    {user.email.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</p>
                                    <p className="text-[18px] font-black text-slate-900">#{user.userId}</p>
                                </div>
                            </div>

                            {/* Info rows */}
                            <InfoRow icon={<Mail className="size-4" />} label="Email" value={user.email} />
                            <InfoRow icon={<Shield className="size-4" />} label="Loại tài khoản" value={user.userType} />

                            {/* Roles */}
                            <div className="flex items-start gap-3">
                                <Shield className="size-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vai trò</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.roles && user.roles.length > 0 ? user.roles.map((role, i) => (
                                            <span key={i} className="px-3 py-1 bg-[#fdf8e6] text-[#b8960f] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#eec54e]/20">
                                                {role}
                                            </span>
                                        )) : <span className="text-[13px] text-slate-400 italic">Chưa có vai trò</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-3">
                                {user.isActive ? <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" /> : <XCircle className="size-4 text-red-500 flex-shrink-0" />}
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trạng thái</p>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black border tracking-widest uppercase",
                                        user.isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                                    )}>
                                        {user.isActive ? "Active" : "Disabled"}
                                    </span>
                                </div>
                            </div>

                            {/* Email Verified */}
                            <div className="flex items-center gap-3">
                                {user.emailVerified ? <CheckCircle2 className="size-4 text-blue-500 flex-shrink-0" /> : <Clock className="size-4 text-slate-400 flex-shrink-0" />}
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Xác thực email</p>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black border tracking-widest uppercase",
                                        user.emailVerified ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {user.emailVerified ? "Verified" : "Pending"}
                                    </span>
                                </div>
                            </div>

                            <InfoRow icon={<Calendar className="size-4" />} label="Ngày tạo" value={formatDateTime(user.createdAt)} />
                            <InfoRow icon={<Clock className="size-4" />} label="Đăng nhập lần cuối" value={formatDateTime(user.lastLoginAt)} />
                        </div>
                    ) : null}
                </div>

                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30">
                    <Button
                        onClick={onClose}
                        className="w-full h-12 rounded-2xl font-black bg-slate-100 text-slate-600 hover:bg-slate-200 text-[13px] uppercase tracking-wider transition-all"
                    >
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-slate-400 flex-shrink-0">{icon}</span>
            <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-[14px] font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
