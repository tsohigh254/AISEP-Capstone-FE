"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
} from "@/components/ui/select";
import {
    X,
    Send,
    MessageSquare,
    Video,
    Clock,
    ChevronDown,
    Layout
} from "lucide-react";
import Image from "next/image";

interface MentorshipRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    mentor: {
        name: string;
        avatar: string;
    } | null;
}

export function MentorshipRequestModal({ isOpen, onClose, mentor }: MentorshipRequestModalProps) {
    if (!mentor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between space-y-0 bg-white dark:bg-slate-900 z-10 shrink-0">
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Gửi yêu cầu Mentorship</DialogTitle>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                    <div className="flex items-center gap-3 mb-10 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 w-fit">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Người nhận:</span>
                        <div className="flex items-center gap-2">
                            <div className="relative size-8 rounded-full overflow-hidden border border-[#eec54e]/30 font-bold">
                                <Image
                                    src={mentor.avatar}
                                    alt={mentor.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{mentor.name}</span>
                        </div>
                    </div>

                    <form className="space-y-10">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                                Mô tả thách thức*
                            </label>
                            <Textarea
                                className="min-h-[140px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all text-sm rounded-xl resize-none p-5"
                                placeholder="Giới thiệu ngắn gọn về vấn đề Startup của bạn đang gặp phải..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                                Câu hỏi cụ thể*
                            </label>
                            <Textarea
                                className="min-h-[140px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all text-sm rounded-xl resize-none p-5"
                                placeholder="Những câu hỏi cụ thể bạn cần chuyên gia giải đáp..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                                Phạm vi hỗ trợ
                            </label>
                            <Select className="h-14 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] rounded-xl text-sm px-5">
                                <option value="" disabled selected>Chọn danh mục hỗ trợ</option>
                                <option value="strategy">Chiến lược</option>
                                <option value="fundraising">Gọi vốn</option>
                                <option value="product">Product</option>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                                    Hình thức
                                </label>
                                <div className="relative">
                                    <Select
                                        defaultValue="online"
                                        className="h-14 pl-5 pr-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] rounded-xl text-sm"
                                    >
                                        <option value="online">Trực tuyến (Online)</option>
                                        <option value="offline">Gặp trực tiếp (Offline)</option>
                                    </Select>
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Video className="size-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 ml-1">
                                    Thời lượng dự kiến
                                </label>
                                <div className="relative">
                                    <Select
                                        defaultValue="60"
                                        className="h-14 pl-5 pr-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] rounded-xl text-sm"
                                    >
                                        <option value="30">30 phút</option>
                                        <option value="60">60 phút</option>
                                        <option value="90">90 phút</option>
                                    </Select>
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Clock className="size-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-5 pt-10 border-t border-slate-100 dark:border-slate-800 mt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="px-6 h-11 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="px-8 h-11 rounded-xl text-sm font-bold bg-[#fdf8e6] text-slate-900 border border-[#eec54e]/20 hover:bg-[#eec54e] transition-all shadow-sm"
                            >
                                Gửi yêu cầu
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
