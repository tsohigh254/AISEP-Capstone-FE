"use client";

import React, { useState } from "react";
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

const AVATAR_COLORS = [
    "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function SessionReviewModal({ isOpen, onClose, session }: SessionReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0 || !session?.id) return;

        setIsSubmitting(true);
        try {
            await SubmitMentorshipFeedback(session.id, {
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
            console.error("Failed to submit feedback", error);
        }
    };

    if (!session || !isOpen) return null;

    const advisorName = session.advisorNameDisplay || session.advisorName;
    const avatarGradient = getAvatarColor(advisorName);
    const hasValidAvatar = !avatarError && session.advisorAvatar?.startsWith("http");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h3 className="text-[20px] font-bold text-slate-900 leading-tight">Đánh giá phiên hướng dẫn</h3>
                        <p className="text-[13px] text-slate-400 font-medium mt-1">Phản hồi của bạn giúp cộng đồng startup phát triển.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 ml-3 mt-0.5"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="py-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-slate-900">Gửi thành công!</h3>
                        <p className="text-[13px] text-slate-500 mt-1">Cảm ơn bạn đã đóng góp ý kiến đánh giá.</p>
                    </div>
                ) : (
                    <div className="space-y-5 animate-in fade-in duration-300">

                        {/* Session Info */}
                        <div className="flex items-center gap-3 px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            {hasValidAvatar ? (
                                <img
                                    src={session.advisorAvatar}
                                    alt={advisorName}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <div className={cn(
                                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[15px] font-bold shrink-0",
                                    avatarGradient
                                )}>
                                    {advisorName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-[14px] font-semibold text-slate-900 leading-tight truncate">{advisorName}</p>
                                <p className="text-[12px] text-slate-500 mt-0.5 truncate">{session.topic}</p>
                                <p className="text-[11px] text-[#eec54e] font-semibold mt-0.5">{session.time}</p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="space-y-3">
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                                <Star className="w-3 h-3 text-[#eec54e]" />
                                Xếp hạng mức độ hài lòng
                            </p>
                            <div className="flex items-center justify-between px-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="relative group transition-transform hover:scale-110 active:scale-95"
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={cn(
                                                "w-9 h-9 transition-all duration-200",
                                                (hover || rating) >= star
                                                    ? "text-[#eec54e] fill-[#eec54e]"
                                                    : "text-slate-200"
                                            )}
                                        />
                                        {(hover || rating) === star && (
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-semibold rounded-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
                                                {star === 1 ? "Rất kém" : star === 2 ? "Kém" : star === 3 ? "Bình thường" : star === 4 ? "Tốt" : "Xuất sắc"}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="space-y-2">
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3 text-[#eec54e]" />
                                Nhận xét chi tiết
                            </p>
                            <div className="relative">
                                <textarea
                                    rows={4}
                                    placeholder="Hãy chia sẻ trải nghiệm của bạn về phiên hướng dẫn này..."
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all leading-relaxed"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    maxLength={500}
                                />
                                <span className="absolute bottom-2.5 right-3 text-[10px] font-semibold text-slate-400">
                                    {feedback.length}/500
                                </span>
                            </div>
                        </div>

                        {/* Info note */}
                        <div className="px-3.5 py-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[12px] text-blue-700 font-medium leading-relaxed">
                                Đánh giá của bạn sẽ được hiển thị công khai trên hồ sơ của cố vấn. Vui lòng sử dụng ngôn ngữ văn minh.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={onClose}
                                className="inline-flex items-center justify-center flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                disabled={rating === 0 || isSubmitting}
                                onClick={handleSubmit}
                                className={cn(
                                    "inline-flex items-center justify-center gap-1.5 flex-[2] px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors shadow-sm",
                                    rating > 0 && !isSubmitting
                                        ? "bg-[#0f172a] text-white hover:bg-[#1e293b]"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Gửi đánh giá</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
