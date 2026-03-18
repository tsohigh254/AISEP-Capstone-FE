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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserPlus, Edit2, Camera, Link2 } from "lucide-react";

interface TeamMember {
    id?: string;
    name: string;
    roles: string[];
    description: string;
    title: string;
    status: string;
    avatar: string;
    linkedin: string;
}

interface TeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: TeamMember) => void;
    member?: TeamMember | null;
}

export function TeamMemberModal({ isOpen, onClose, onSave, member }: TeamMemberModalProps) {
    const [formData, setFormData] = useState<TeamMember>({
        name: "",
        roles: [],
        description: "",
        title: "",
        status: "Toàn thời gian",
        avatar: "",
        linkedin: ""
    });

    useEffect(() => {
        if (member) {
            setFormData(member);
        } else {
            setFormData({
                name: "",
                roles: [],
                description: "",
                title: "",
                status: "Toàn thời gian",
                avatar: "",
                linkedin: ""
            });
        }
    }, [member, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleRole = (role: string) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white rounded-[32px] p-0 border-none overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 border-b border-neutral-surface bg-[#fdfbe9]/30">
                    <DialogTitle className="text-2xl font-black text-[#171611] tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#e6cc4c] flex items-center justify-center text-white">
                            {member ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        </div>
                        {member ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Avatar & Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1 space-y-4 flex flex-col items-center">
                            <Label className="text-sm font-black text-[#171611] w-full text-left">Ảnh đại diện</Label>
                            <div className="w-32 h-32 rounded-[32px] bg-[#f8f8f6] border-2 border-dashed border-neutral-surface flex flex-col items-center justify-center cursor-pointer hover:bg-[#fdfbe9]/50 transition-all overflow-hidden relative group">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="w-8 h-8 text-neutral-muted opacity-40" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Thay đổi</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-3 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-black text-[#171611]">Họ và tên <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-[#f8f8f6] border-none rounded-2xl h-12 px-5 font-bold focus:ring-2 focus:ring-[#e6cc4c]/30"
                                    placeholder="Nhập họ tên đầy đủ"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-black text-[#171611]">Chức danh / Vị trí <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="bg-[#f8f8f6] border-none rounded-2xl h-12 px-5 font-bold focus:ring-2 focus:ring-[#e6cc4c]/30"
                                    placeholder="Ví dụ: CEO, CTO, Head of Product..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-black text-[#171611]">Loại nhân sự</Label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-[#f8f8f6] border-none rounded-2xl h-12 px-5 font-bold text-sm focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none appearance-none"
                            >
                                <option value="Toàn thời gian">Toàn thời gian</option>
                                <option value="Bán thời gian">Bán thời gian</option>
                                <option value="Cố vấn">Cố vấn</option>
                                <option value="Thực tập sinh">Thực tập sinh</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin" className="text-sm font-black text-[#171611]">LinkedIn URL</Label>
                            <div className="relative">
                                <Link2 className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-muted w-5 h-5" />
                                <Input
                                    id="linkedin"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    className="bg-[#f8f8f6] border-none rounded-2xl h-12 pl-12 pr-5 font-bold focus:ring-2 focus:ring-[#e6cc4c]/30"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-black text-[#171611]">Vai trò đặc biệt</Label>
                        <div className="flex flex-wrap gap-2">
                            {["Founder", "Co-founder", "Board Member", "Investor"].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleToggleRole(role)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black transition-all border-2",
                                        formData.roles.includes(role)
                                            ? "bg-[#e6cc4c] border-[#e6cc4c] text-white shadow-md shadow-[#e6cc4c]/20"
                                            : "bg-white border-neutral-surface text-neutral-muted hover:border-[#e6cc4c]/40"
                                    )}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-black text-[#171611]">Tiểu sử ngắn gọn</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="bg-[#f8f8f6] border-none rounded-[24px] p-5 font-bold focus:ring-2 focus:ring-[#e6cc4c]/30 resize-none"
                            placeholder="Giới thiệu kinh nghiệm, học vấn hoặc thành tựu nổi bật..."
                            rows={4}
                        />
                    </div>
                </form>

                <DialogFooter className="p-8 border-t border-neutral-surface bg-neutral-surface/5 flex flex-row gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl font-black text-neutral-muted hover:bg-neutral-surface"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="flex-1 h-12 rounded-2xl font-black bg-[#e6cc4c] text-white hover:bg-[#d4ba3d] shadow-lg shadow-[#e6cc4c]/20"
                    >
                        {member ? "Cập nhật" : "Lưu thành viên"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
