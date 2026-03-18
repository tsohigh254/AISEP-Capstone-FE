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
import { Lock, X, Eye, EyeOff, Check } from "lucide-react";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    // Simple strength calculation
    const getStrength = (pwd: string) => {
        if (!pwd) return { label: "Yếu", level: 0, color: "bg-red-500" };
        if (pwd.length < 6) return { label: "Yếu", level: 1, color: "bg-red-500" };
        if (pwd.length < 10) return { label: "Trung bình", level: 2, color: "bg-orange-500" };
        return { label: "Mạnh", level: 4, color: "bg-[#e6cc4c]" };
    };

    const strength = getStrength(formData.new);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            onSuccess();
        }, 500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[480px] bg-white rounded-[32px] p-0 border-none overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b border-neutral-surface flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#e6cc4c]/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-[#e6cc4c]" />
                        </div>
                        <DialogTitle className="text-xl font-black text-[#171611]">Thay đổi mật khẩu</DialogTitle>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-neutral-surface flex items-center justify-center transition-colors">
                        <X className="w-5 h-5 text-neutral-muted" />
                    </button>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="block text-sm font-black text-[#171611]">Mật khẩu hiện tại</Label>
                        <div className="relative group">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={formData.current}
                                onChange={(e) => setFormData(prev => ({ ...prev, current: e.target.value }))}
                                className="w-full h-12 px-5 bg-[#f8f8f6] border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all font-bold placeholder:text-neutral-muted/60 text-sm"
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-[#171611] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="block text-sm font-black text-[#171611]">Mật khẩu mới</Label>
                        <div className="relative group">
                            <Input
                                type="password"
                                value={formData.new}
                                onChange={(e) => setFormData(prev => ({ ...prev, new: e.target.value }))}
                                />
                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-muted hover:text-[#171611]">
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                        {formData.new && (
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-neutral-muted uppercase tracking-widest leading-none">Độ mạnh mật khẩu</span>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none", strength.color.replace('bg-', 'text-'))}>{strength.label}</span>
                                </div>
                                <div className="flex gap-1.5 h-1.5">
                                    <div className={cn("h-full flex-1 rounded-full transition-all duration-500", strength.level >= 1 ? strength.color : "bg-neutral-200")}></div>
                                    <div className={cn("h-full flex-1 rounded-full transition-all duration-500", strength.level >= 2 ? strength.color : "bg-neutral-200")}></div>
                                    <div className={cn("h-full flex-1 rounded-full transition-all duration-500", strength.level >= 3 ? strength.color : "bg-neutral-200")}></div>
                                    <div className={cn("h-full flex-1 rounded-full transition-all duration-500", strength.level >= 4 ? strength.color : "bg-neutral-200")}></div>
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] text-neutral-muted font-bold leading-relaxed pt-1">
                            Mật khẩu phải có ít nhất <span className="text-[#171611]">8 ký tự</span>, bao gồm <span className="text-[#171611]">chữ và số</span>.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="block text-sm font-black text-[#171611]">Xác nhận mật khẩu mới</Label>
                        <Input
                            type="password"
                            value={formData.confirm}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirm: e.target.value }))}
                            className="w-full h-12 px-5 bg-[#f8f8f6] border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none transition-all font-bold placeholder:text-neutral-muted/60 text-sm"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>
                </form>

                <DialogFooter className="p-6 bg-[#f8f8f6] border-t border-neutral-surface flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl font-black text-neutral-muted hover:bg-neutral-surface"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 h-12 bg-[#e6cc4c] text-[#171611] text-sm font-black rounded-2xl shadow-lg shadow-[#e6cc4c]/20 hover:bg-[#d4ba3d] transition-all active:scale-95"
                    >
                        Cập nhật mật khẩu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function SuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[440px] bg-white rounded-[40px] p-0 border-none overflow-hidden shadow-2xl">
                <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-neutral-surface flex items-center justify-center transition-colors">
                        <X className="w-6 h-6 text-neutral-muted" />
                    </button>
                </div>
                <div className="px-8 pb-12 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-8 relative">
                        <div className="absolute inset-0 bg-[#10b981]/5 rounded-full animate-pulse"></div>
                        <Check className="w-12 h-12 text-[#10b981] relative z-10" />
                    </div>
                    <h3 className="text-2xl font-black text-[#171611] mb-4 tracking-tight">Cập nhật mật khẩu thành công</h3>
                    <p className="text-neutral-muted text-sm font-bold leading-relaxed mb-10 max-w-[280px]">
                        Mật khẩu của bạn đã được thay đổi. Vui lòng sử dụng mật khẩu mới cho lần đăng nhập sau.
                    </p>
                    <Button
                        onClick={onClose}
                        className="w-full max-w-[200px] h-12 bg-[#e6cc4c] text-[#171611] text-sm font-black rounded-2xl shadow-lg shadow-[#e6cc4c]/20 hover:bg-[#d4ba3d] transition-all active:scale-95"
                    >
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
