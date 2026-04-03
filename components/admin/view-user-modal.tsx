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
    const [user, setUser] = useState<IUser | null>(null);
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
            const res = await GetUserById(id) as unknown as IBackendRes<IUser>;
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
                        <div className="space-y-6">
                            {/* Profile Header Card */}
                            <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-3xl shadow-sm">
                                <div className="size-16 rounded-2xl flex items-center justify-center font-black text-lg border border-slate-100 shadow-sm bg-[#fdf8e6] text-[#e6cc4c] flex-shrink-0">
                                    {user.email.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                                        <h3 className="text-[17px] leading-tight font-black text-slate-900 break-all">{user.email}</h3>
                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                                            #{user.userId}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm">
                                            {user.userType || "N/A"}
                                        </span>
                                        {user.roles && user.roles.map((role: string, i: number) => (
                                            <span key={i} className="px-2.5 py-1 bg-[#fdf8e6] text-[#b8960f] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#eec54e]/20">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Left Column: Status & Security */}
                                <div className="col-span-2 sm:col-span-1 space-y-4 p-5 bg-slate-50/50 border border-slate-100 rounded-3xl">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Shield className="size-3.5" /> Bảo mật & Trạng thái
                                    </h4>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 hover:text-slate-500 transition-colors">Tình trạng hoạt động</p>
                                            <div className="flex items-center gap-2.5">
                                                {user.isActive ? (
                                                    <div className="flex items-center justify-center size-7 rounded-full bg-green-100 text-green-600">
                                                        <CheckCircle2 className="size-4" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center size-7 rounded-full bg-red-100 text-red-500">
                                                        <XCircle className="size-4" />
                                                    </div>
                                                )}
                                                <span className={cn(
                                                    "text-[13px] font-bold",
                                                    user.isActive ? "text-green-700" : "text-red-600"
                                                )}>
                                                    {user.isActive ? "Đang hoạt động" : "Bị Khóa"}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 hover:text-slate-500 transition-colors">Xác thực Email</p>
                                            <div className="flex items-center gap-2.5">
                                                {user.emailVerified ? (
                                                    <div className="flex items-center justify-center size-7 rounded-full bg-blue-100 text-blue-600">
                                                        <CheckCircle2 className="size-4" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center size-7 rounded-full bg-slate-200 text-slate-500">
                                                        <Clock className="size-4" />
                                                    </div>
                                                )}
                                                <span className={cn(
                                                    "text-[13px] font-bold",
                                                    user.emailVerified ? "text-blue-700" : "text-slate-600"
                                                )}>
                                                    {user.emailVerified ? "Đã xác thực" : "Chờ xác thực"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Timestamps */}
                                <div className="col-span-2 sm:col-span-1 space-y-4 p-5 bg-slate-50/50 border border-slate-100 rounded-3xl">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Clock className="size-3.5" /> Lịch sử hệ thống
                                    </h4>

                                    <div className="space-y-4">
                                        <InfoRow
                                            icon={<Calendar className="size-4 text-emerald-500" />}
                                            label="Ngày khởi tạo"
                                            value={formatDateTime(user.createdAt)}
                                        />
                                        <InfoRow
                                            icon={<Clock className="size-4 text-purple-500" />}
                                            label="Đăng nhập cuối"
                                            value={formatDateTime(user.lastLoginAt)}
                                        />
                                    </div>
                                </div>
                            </div>
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
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 hover:text-slate-500 transition-colors">
                {icon}
                {label}
            </p>
            <p className="text-[13px] font-black text-slate-800 ml-5">{value}</p>
        </div>
    );
}
