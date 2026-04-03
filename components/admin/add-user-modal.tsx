"use client";

import { useState } from "react";
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
import { UserPlus, Mail, Lock, Shield, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Register } from "@/services/auth/auth.api";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const USER_TYPES = [
    { value: "Startup", label: "Startup" },
    { value: "Investor", label: "Nhà đầu tư" },
    { value: "Advisor", label: "Cố vấn" },
    { value: "Staff", label: "Nhân viên vận hành" },
    { value: "Admin", label: "Quản trị viên" },
];

export function AddUserModal({ isOpen, onClose, onSave }: AddUserModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userType, setUserType] = useState("Startup");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Email không hợp lệ";
        }
        if (!password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        setApiError(null);

        try {
            const res = await Register(email, password, confirmPassword, userType) as unknown as IBackendRes<any>;

            if (res.success) {
                onSave();
                handleClose();
            } else {
                // Handle validation errors from backend
                if (res.error?.details && res.error.details.length > 0) {
                    const fieldErrors: Record<string, string> = {};
                    res.error.details.forEach((d: IErrorDetail<any>) => {
                        fieldErrors[d.field.toLowerCase()] = d.message;
                    });
                    setErrors(fieldErrors);
                } else {
                    setApiError(res.error?.message || res.message || "Tạo tài khoản thất bại.");
                }
            }
        } catch {
            setApiError("Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setUserType("Startup");
        setErrors({});
        setApiError(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-2xl bg-white rounded-[32px] p-0 border-none overflow-hidden shadow-2xl"
                showCloseButton={false}
            >
                {/* Header */}
                <DialogHeader className="px-10 pt-10 pb-8 border-b border-slate-100 bg-gradient-to-br from-[#fdfbe9]/40 to-white">
                    <DialogTitle className="text-[26px] font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#eec54e] to-[#d4ae3d] flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            <UserPlus className="size-6 text-white" strokeWidth={2.5} />
                        </div>
                        Thêm người dùng mới
                    </DialogTitle>
                    <p className="text-[14px] text-slate-400 font-medium mt-2 ml-16">
                        Tạo tài khoản mới cho người dùng trong hệ thống AISEP
                    </p>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-10 py-8 space-y-7 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* API Error */}
                    {apiError && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3 animate-in fade-in duration-300">
                            <AlertCircle className="size-5 text-red-500 flex-shrink-0" />
                            <span className="text-[13px] font-bold text-red-600">{apiError}</span>
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-[13px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Mail className="size-4 text-slate-400" />
                            Địa chỉ Email <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                            className={cn(
                                "bg-[#f8fafc] border-slate-100 rounded-2xl h-14 px-6 text-[15px] font-bold focus:ring-2 focus:ring-[#eec54e]/30 focus:border-[#eec54e]/50 transition-all placeholder:text-slate-300",
                                errors.email && "border-red-300 focus:ring-red-200 focus:border-red-300"
                            )}
                            placeholder="nguoidung@example.com"
                            disabled={submitting}
                        />
                        {errors.email && (
                            <p className="text-[12px] text-red-500 font-bold ml-1 animate-in slide-in-from-top-1 duration-200">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Password */}
                        <div className="space-y-2.5">
                            <Label htmlFor="password" className="text-[13px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <Lock className="size-4 text-slate-400" />
                                Mật khẩu <span className="text-red-400">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                                    className={cn(
                                        "bg-[#f8fafc] border-slate-100 rounded-2xl h-14 px-6 pr-14 text-[15px] font-bold focus:ring-2 focus:ring-[#eec54e]/30 focus:border-[#eec54e]/50 transition-all placeholder:text-slate-300",
                                        errors.password && "border-red-300 focus:ring-red-200 focus:border-red-300"
                                    )}
                                    placeholder="••••••••"
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
                            {errors.password && (
                                <p className="text-[12px] text-red-500 font-bold ml-1 animate-in slide-in-from-top-1 duration-200">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2.5">
                            <Label htmlFor="confirmPassword" className="text-[13px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <Lock className="size-4 text-slate-400" />
                                Xác nhận MK <span className="text-red-400">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: "" })); }}
                                    className={cn(
                                        "bg-[#f8fafc] border-slate-100 rounded-2xl h-14 px-6 pr-14 text-[15px] font-bold focus:ring-2 focus:ring-[#eec54e]/30 focus:border-[#eec54e]/50 transition-all placeholder:text-slate-300",
                                        errors.confirmPassword && "border-red-300 focus:ring-red-200 focus:border-red-300"
                                    )}
                                    placeholder="••••••••"
                                    disabled={submitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-[12px] text-red-500 font-bold ml-1 animate-in slide-in-from-top-1 duration-200">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    {/* User Type */}
                    <div className="space-y-2.5">
                        <Label className="text-[13px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Shield className="size-4 text-slate-400" />
                            Loại tài khoản
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {USER_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => setUserType(type.value)}
                                    className={cn(
                                        "px-5 py-3 rounded-xl text-[12px] font-black transition-all border-2 uppercase tracking-wider",
                                        userType === type.value
                                            ? "bg-[#eec54e] border-[#eec54e] text-white shadow-md shadow-[#eec54e]/20"
                                            : "bg-white border-slate-100 text-slate-500 hover:border-[#eec54e]/40 hover:text-slate-700",
                                        submitting && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <DialogFooter className="px-10 py-8 border-t border-slate-100 bg-slate-50/30 flex flex-row gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        disabled={submitting}
                        className="flex-1 h-14 rounded-2xl font-black text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-[14px] uppercase tracking-wider transition-all"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 h-14 rounded-2xl font-black bg-gradient-to-r from-[#eec54e] to-[#d4ae3d] text-white hover:from-[#d4ae3d] hover:to-[#c49e2d] shadow-lg shadow-yellow-500/20 text-[14px] uppercase tracking-wider transition-all gap-2 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                <UserPlus className="size-5" strokeWidth={2.5} />
                                Tạo người dùng
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
