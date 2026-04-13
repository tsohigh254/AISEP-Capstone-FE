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
import {
    X,
    Star,
    Send,
    MessageSquare,
    Info,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SubmitMentorshipFeedback } from "@/services/startup/startup-mentorship.api";

interface SessionReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: {
        id?: number;
        advisorName: string;
        advisorNameDisplay?: string;
        advisorAvatar: string;
        topic: string;
        time: string;
    } | null;
}

export function SessionReviewModal({ isOpen, onClose, session }: SessionReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0 || !session?.id) return;

        setIsSubmitting(true);
        try {
            const res = await SubmitMentorshipFeedback(session.id, {
                rating: rating,
                comment: feedback
            });
            
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setRating(0);
                setFeedback("");
            }, 2000);
        } catch (error) {
            setIsSubmitting(false);
            // Handle error silently or log
            console.error("Failed to submit feedback", error);
        }
    };

    if (!session) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] p-0 overflow-hidden border-none bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl">
                {/* Header Side Banner */}
                <div className="absolute top-0 left-0 w-2 h-full bg-[#eec54e]" />

                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <DialogTitle className="text-[24px] font-black text-slate-900 dark:text-white tracking-tight leading-none">Đánh giá phiên hướng dẫn</DialogTitle>
                            <p className="text-[14px] text-slate-400 font-medium mt-2">Phản hồi của bạn giúp cộng đồng startup phát triển.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="size-5 text-slate-400" />
                        </button>
                    </div>

                    {isSuccess ? (
                        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                            <div className="size-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="size-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Gửi thành công!</h3>
                            <p className="text-slate-500 mt-2 font-medium">Cảm ơn bạn đã đóng góp ý kiến đánh giá.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Session Info Card */}
                            <div className="p-5 bg-[#f8fafc] dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                                <img src={session.advisorAvatar} alt="" className="size-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                                <div>
                                    <p className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">{session.advisorNameDisplay || session.advisorName}</p>
                                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">{session.topic}</p>
                                    <p className="text-[11px] text-[#eec54e] font-black uppercase tracking-wider mt-1">{session.time}</p>
                                </div>
                            </div>

                            {/* Rating Section */}
                            <div className="space-y-4">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                                    <Star className="size-3 text-[#eec54e]" /> Xếp hạng mức độ hài lòng
                                </label>
                                <div className="flex items-center justify-between px-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="group relative transition-transform hover:scale-110 active:scale-95"
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star
                                                className={cn(
                                                    "size-10 transition-all duration-300",
                                                    (hover || rating) >= star
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-slate-100 dark:text-slate-800"
                                                )}
                                            />
                                            {(hover || rating) === star && (
                                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 uppercase tracking-widest">
                                                    {star === 1 ? "Rất kém" : star === 2 ? "Kém" : star === 3 ? "Bình thường" : star === 4 ? "Tốt" : "Xuất sắc"}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback Section */}
                            <div className="space-y-4">
                                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                                    <MessageSquare className="size-3 text-[#eec54e]" /> Nhận xét chi tiết
                                </label>
                                <div className="relative">
                                    <Textarea
                                        placeholder="Hãy chia sẻ trải nghiệm của bạn về phiên hướng dẫn này..."
                                        className="min-h-[120px] resize-none rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-[#eec54e]/20 focus:border-[#eec54e] p-5 text-sm leading-relaxed"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md">
                                        {feedback.length}/500
                                    </div>
                                </div>
                            </div>

                            {/* Warning Note */}
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl flex gap-3 border border-blue-100/50 dark:border-blue-500/10">
                                <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[12px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                                    Đánh giá của bạn sẽ được hiển thị công khai trên hồ sơ của cố vấn. Vui lòng sử dụng ngôn ngữ văn minh.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 h-14 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Hủy bỏ
                                </Button>
                                <Button
                                    disabled={rating === 0 || isSubmitting}
                                    onClick={handleSubmit}
                                    className="flex-[2] h-14 rounded-2xl bg-[#eec54e] hover:bg-[#d4ae3d] text-white font-black text-[13px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all gap-3"
                                >
                                    {isSubmitting ? (
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Gửi đánh giá</span>
                                            <Send className="size-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
