"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Select
} from "@/components/ui/select";
import {
    X,
    Send,
    FileText,
    Info,
    ChevronDown,
    Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateConnection } from "@/services/connection/connection.api";

interface InvestorConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    investor: {
        name: string;
        logo: string;
        type: string;
        investorId: number;
    } | null;
    onSuccess?: (connectionId: number) => void;
}

export function InvestorConnectionModal({ isOpen, onClose, investor, onSuccess }: InvestorConnectionModalProps) {
    const [goal, setGoal] = useState("");
    const [message, setMessage] = useState("");
    const [attachedDocs, setAttachedDocs] = useState([
        { id: 1, name: "Pitch Deck v2.0" },
        { id: 2, name: "Báo cáo tài chính 2024" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!investor) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await CreateConnection({
                investorID: investor.investorId,
                personalizedMessage: `[${goal}] ${message}`,
            }) as any as IBackendRes<IConnectionItem>;
            if (res.success && res.data) {
                onSuccess?.(res.data.connectionID);
                onClose();
                setGoal("");
                setMessage("");
            } else {
                setError(res.message || "Gửi lời mời thất bại. Vui lòng thử lại.");
            }
        } catch {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeDoc = (id: number) => {
        setAttachedDocs(docs => docs.filter(doc => doc.id !== id));
    };

    if (!investor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[700px] p-0 overflow-hidden border-none bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[24px] font-black text-slate-900 dark:text-white tracking-tight leading-none">Gửi lời mời kết nối</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="size-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Investor Card */}
                        <div className="p-6 bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl flex items-center gap-5 border border-slate-100 dark:border-slate-800">
                            <img src={investor.logo} alt="" className="size-14 rounded-xl object-cover border-2 border-white shadow-sm" />
                            <div>
                                <h3 className="text-[18px] font-bold text-slate-900 dark:text-white leading-tight">{investor.name}</h3>
                                <div className="mt-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full inline-block">
                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{investor.type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Connection Goal */}
                        <div className="space-y-3">
                            <label className="text-[13px] font-black text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                Mục tiêu kết nối<span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-[#eec54e]/20 text-sm font-medium"
                            >
                                <option value="" disabled>Chọn mục tiêu kết nối</option>
                                <option value="seed">Gọi vốn Seed/Series A</option>
                                <option value="networking">Tìm kiếm đối tác chiến lược</option>
                                <option value="advice">Tham khảo ý kiến chuyên gia</option>
                            </Select>
                        </div>

                        {/* Introduction Message */}
                        <div className="space-y-3">
                            <label className="text-[13px] font-black text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                Lời nhắn giới thiệu<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Textarea
                                    placeholder="Hãy viết một thông điệp ngắn gọn và ấn tượng để giới thiệu startup của bạn..."
                                    className="min-h-[140px] resize-none rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-[#eec54e]/20 focus:border-[#eec54e] p-6 text-sm leading-relaxed"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {message.length}/500 ký tự
                                </div>
                            </div>
                        </div>

                        {/* Attached Documents */}
                        <div className="space-y-3">
                            <label className="text-[13px] font-black text-slate-600 dark:text-slate-300">
                                Tài liệu đính kèm
                            </label>
                            <div className="p-5 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl space-y-4 bg-slate-50/30">
                                <div className="flex flex-wrap gap-2">
                                    {attachedDocs.map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm animate-in zoom-in-95 duration-200">
                                            <FileText className="size-4 text-blue-500" />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{doc.name}</span>
                                            <button
                                                onClick={() => removeDoc(doc.id)}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
                                            >
                                                <X className="size-3 text-slate-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Input
                                        placeholder="Tìm tài liệu..."
                                        className="h-10 border-none bg-transparent text-sm focus-visible:ring-0 px-0 placeholder:text-slate-400"
                                    />
                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                                    <p className="text-[11px] text-slate-400 font-medium italic">Dữ liệu được lấy từ module "Tài liệu & IP" của bạn.</p>
                                </div>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-5 bg-yellow-50/50 dark:bg-yellow-500/5 rounded-2xl border border-yellow-100/50 dark:border-yellow-500/10 flex gap-4 animate-in fade-in duration-700">
                            <div className="size-6 shrink-0 rounded-full bg-yellow-400 flex items-center justify-center">
                                <Info className="size-3.5 text-white" />
                            </div>
                            <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-[1.6]">
                                <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter mr-1">Ghi chú:</span>
                                Lời mời này sẽ được gửi kèm hồ sơ Startup của bạn tới nhà đầu tư. Hãy đảm bảo thông tin hồ sơ đã được cập nhật mới nhất.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-500 font-medium px-1">{error}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 h-14 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-[14px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Hủy
                            </Button>
                            <Button
                                disabled={!goal || !message || isSubmitting}
                                onClick={handleSubmit}
                                className="flex-[2] h-14 rounded-2xl bg-[#eec54e] hover:bg-[#d4ae3d] text-white font-black text-[14px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all gap-3"
                            >
                                {isSubmitting ? (
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Gửi lời mời ngay</span>
                                        <Send className="size-4 -rotate-45" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
