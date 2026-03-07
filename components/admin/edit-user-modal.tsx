"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { GetUserById } from "@/services/admin/admin.api";
import { ResetAdminPassword } from "@/services/auth/auth.api";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    userId: number | null;
}

export function EditUserModal({ isOpen, onClose, onSaved, userId }: EditUserModalProps) {
    const [user, setUser] = useState<IAdminUser | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUser(userId);
        }
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen, userId]);

    const fetchUser = async (id: number) => {
        setLoadingUser(true);
        try {
            const res = await GetUserById(id) as unknown as IBackendRes<IAdminUser>;
            if (res.success && res.data) {
                setUser(res.data);
            }
        } catch { /* silent */ }
        finally { setLoadingUser(false); }
    };

    const resetForm = () => {
        setUser(null);
        setNewPassword("");
        setShowPassword(false);
        setError(null);
        setSuccess(null);
    };

    const handleResetPassword = async () => {
        if (!userId) return;
        if (!newPassword.trim()) {
            setError("Vui lòng nhập mật khẩu mới");
            return;
        }
        if (newPassword.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await ResetAdminPassword(userId, newPassword) as unknown as IBackendRes<null>;
            if (res.success) {
                setSuccess("Đặt lại mật khẩu thành công!");
                setNewPassword("");
                onSaved();
            } else {
                setError(res.error?.message || res.message || "Đặt lại mật khẩu thất bại.");
            }
        } catch {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
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
                            <Pencil className="size-5 text-white" strokeWidth={2.5} />
                        </div>
                        Cập nhật người dùng
                    </DialogTitle>
                </DialogHeader>

                <div className="px-8 py-6 space-y-6 max-h-[65vh] overflow-y-auto">
                    {loadingUser ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="size-7 text-[#eec54e] animate-spin" />
                        </div>
                    ) : user ? (
                        <>
                            {/* User Info Summary */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                                <div className="size-12 rounded-full flex items-center justify-center font-black text-sm border border-slate-100/50 shadow-sm bg-[#fdf8e6] text-[#e6cc4c]">
                                    {user.email.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-slate-900">{user.email}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">#{user.userId} · {user.userType}</p>
                                </div>
                            </div>

                            {/* Success message */}
                            {success && (
                                <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex items-center gap-3 animate-in fade-in duration-300">
                                    <CheckCircle2 className="size-5 text-green-500 flex-shrink-0" />
                                    <span className="text-[13px] font-bold text-green-600">{success}</span>
                                </div>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3 animate-in fade-in duration-300">
                                    <AlertCircle className="size-5 text-red-500 flex-shrink-0" />
                                    <span className="text-[13px] font-bold text-red-600">{error}</span>
                                </div>
                            )}

                            {/* Reset Password Section */}
                            <div className="space-y-3 p-5 bg-white border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lock className="size-4 text-slate-400" />
                                    <h4 className="text-[13px] font-black text-slate-700 uppercase tracking-wider">Đặt lại mật khẩu</h4>
                                </div>
                                <p className="text-[12px] text-slate-400 font-medium">Nhập mật khẩu mới cho người dùng.</p>

                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                                        className="bg-[#f8fafc] border-slate-100 rounded-2xl h-14 px-6 pr-14 text-[15px] font-bold focus:ring-2 focus:ring-[#eec54e]/30 focus:border-[#eec54e]/50 transition-all placeholder:text-slate-300"
                                        placeholder="Nhập mật khẩu mới..."
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                </div>

                                <Button
                                    onClick={handleResetPassword}
                                    disabled={submitting || !newPassword.trim()}
                                    className="w-full h-12 rounded-2xl font-black bg-gradient-to-r from-[#eec54e] to-[#d4ae3d] text-white hover:from-[#d4ae3d] hover:to-[#c49e2d] shadow-lg shadow-yellow-500/20 text-[12px] uppercase tracking-wider transition-all gap-2 disabled:opacity-40"
                                >
                                    {submitting ? (
                                        <><Loader2 className="size-4 animate-spin" /> Đang xử lý...</>
                                    ) : (
                                        <><Lock className="size-4" /> Đặt lại mật khẩu</>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : null}
                </div>

                <DialogFooter className="px-8 py-5 border-t border-slate-100 bg-slate-50/30">
                    <Button
                        onClick={onClose}
                        className="w-full h-12 rounded-2xl font-black bg-slate-100 text-slate-600 hover:bg-slate-200 text-[13px] uppercase tracking-wider transition-all"
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
