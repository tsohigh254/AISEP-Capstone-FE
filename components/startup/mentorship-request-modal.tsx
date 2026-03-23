"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Send, CheckCircle2, BadgeCheck, Clock, Check, Plus, Trash2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

interface MentorshipRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    mentor: { name: string; avatar: string; title?: string; hourlyRate?: number; supportedDurations?: number[] } | null;
}

const SCOPE_OPTIONS = [
    { value: "strategy",    label: "Chiến lược" },
    { value: "fundraising", label: "Gọi vốn" },
    { value: "product",     label: "Product" },
    { value: "engineering", label: "Kỹ thuật" },
    { value: "marketing",   label: "Marketing" },
    { value: "legal",       label: "Pháp lý" },
    { value: "operations",  label: "Vận hành" },
];

const DURATIONS = [
    { value: "30", label: "30 phút" },
    { value: "60", label: "60 phút" },
    { value: "90", label: "90 phút" },
];

const PLATFORMS = [
    {
        value: "meet",
        label: "Google Meet",
        icon: <Image src="https://thesvg.org/icons/google-meet/default.svg" alt="Google Meet" width={16} height={16} unoptimized />,
        activeColor: "text-emerald-600",
        activeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
    },
    {
        value: "teams",
        label: "Microsoft Teams",
        icon: <Image src="https://thesvg.org/icons/microsoft-teams/default.svg" alt="Microsoft Teams" width={16} height={16} unoptimized />,
        activeColor: "text-violet-600",
        activeBg: "bg-violet-50 border-violet-200 text-violet-800",
    },
] as const;

const TIMEZONES = [
    { value: "Asia/Ho_Chi_Minh", label: "GMT+7 – Hà Nội / TP. Hồ Chí Minh" },
    { value: "Asia/Singapore",   label: "GMT+8 – Singapore / Hồng Kông" },
    { value: "Asia/Tokyo",       label: "GMT+9 – Tokyo / Seoul" },
    { value: "Europe/London",    label: "GMT+0 – London" },
    { value: "Europe/Paris",     label: "GMT+1 – Paris / Berlin" },
    { value: "America/New_York", label: "GMT-5 – New York" },
    { value: "America/Los_Angeles", label: "GMT-8 – Los Angeles" },
];

interface TimeSlot { date: string; time: string; }
interface FormErrors { objective?: string; problemContext?: string; scope?: string; }

export function MentorshipRequestModal({ isOpen, onClose, mentor }: MentorshipRequestModalProps) {
    const [objective, setObjective]             = useState("");
    const [problemContext, setProblemContext]    = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [scope, setScope]                     = useState<string[]>([]);
    const [platform, setPlatform]               = useState<"meet" | "teams">("meet");
    const [duration, setDuration]               = useState("60");
    const [timezone, setTimezone]               = useState("Asia/Ho_Chi_Minh");
    const [slots, setSlots]                     = useState<TimeSlot[]>([{ date: "", time: "" }]);
    const [isSubmitting, setIsSubmitting]       = useState(false);
    const [isSuccess, setIsSuccess]             = useState(false);
    const [errors, setErrors]                   = useState<FormErrors>({});
    const [submitted, setSubmitted]             = useState(false);

    const today = typeof window !== "undefined" ? new Date().toISOString().split("T")[0] : "";

    useEffect(() => {
        if (!isOpen) {
            setObjective(""); setProblemContext(""); setAdditionalNotes("");
            setScope([]); setPlatform("meet"); setDuration("60");
            setTimezone("Asia/Ho_Chi_Minh"); setSlots([{ date: "", time: "" }]);
            setIsSubmitting(false); setIsSuccess(false);
            setErrors({}); setSubmitted(false);
        }
    }, [isOpen]);

    const toggleScope = (val: string) => {
        const next = scope.includes(val) ? scope.filter(v => v !== val) : [...scope, val];
        setScope(next);
        if (submitted) setErrors(e => ({ ...e, scope: next.length > 0 ? undefined : "Vui lòng chọn ít nhất một phạm vi" }));
    };

    const addSlot = () => { if (slots.length < 3) setSlots(s => [...s, { date: "", time: "" }]); };
    const removeSlot = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i));
    const updateSlot = (i: number, field: keyof TimeSlot, val: string) =>
        setSlots(s => s.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

    const canSubmit = objective.trim() && problemContext.trim() && scope.length > 0;

    const handleSubmit = () => {
        setSubmitted(true);
        const errs: FormErrors = {};
        if (!objective.trim())     errs.objective     = "Vui lòng nhập mục tiêu buổi tư vấn";
        if (!problemContext.trim()) errs.problemContext = "Vui lòng mô tả vấn đề bạn đang gặp";
        if (scope.length === 0)    errs.scope          = "Vui lòng chọn ít nhất một phạm vi";
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setIsSubmitting(true);
        setTimeout(() => { setIsSubmitting(false); setIsSuccess(true); setTimeout(onClose, 2400); }, 1500);
    };

    if (!isOpen || !mentor) return null;

    const sessionPrice = mentor.hourlyRate ? Math.round(mentor.hourlyRate * parseInt(duration) / 60) : null;;

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

            <div className="relative bg-white rounded-t-[24px] sm:rounded-[20px] shadow-[0_24px_80px_rgba(0,0,0,0.16)] w-full max-w-[540px] mx-0 sm:mx-4 flex flex-col max-h-[94vh] overflow-hidden">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 flex-shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative flex-shrink-0">
                                <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-[14px] object-cover ring-2 ring-white shadow-md" />
                                <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-white">
                                    <BadgeCheck className="w-2.5 h-2.5 text-white" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10.5px] font-bold text-amber-500 uppercase tracking-[0.1em] mb-0.5">Gửi yêu cầu đến</p>
                                <p className="text-[15px] font-bold text-slate-900 leading-tight truncate">{mentor.name}</p>
                                {mentor.title && <p className="text-[12px] text-slate-400 truncate mt-0.5">{mentor.title}</p>}
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all flex-shrink-0 mt-0.5">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-4 h-px bg-slate-100" />
                </div>

                {/* Body */}
                <div className="flex-1 px-6 pb-2 overflow-y-auto space-y-5">
                    {isSuccess ? (
                        <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                            <div className="w-[72px] h-[72px] bg-emerald-50 rounded-full flex items-center justify-center mb-5 ring-4 ring-emerald-50">
                                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                            </div>
                            <h3 className="text-[18px] font-bold text-slate-900">Yêu cầu đã được gửi!</h3>
                            <p className="text-[13px] text-slate-500 mt-2 max-w-[240px] leading-relaxed">
                                <span className="font-semibold text-slate-700">{mentor.name}</span> sẽ phản hồi trong vòng 24–48 giờ.
                            </p>
                            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-[12px] font-medium text-amber-700">Chờ phản hồi</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mục tiêu */}
                            <Field label="Mục tiêu buổi tư vấn" required error={errors.objective} hint={`${objective.length}/200`}>
                                <textarea rows={2} maxLength={200} className={inputCls(!!errors.objective)}
                                    placeholder="Ví dụ: Tôi muốn được góp ý để hoàn thiện pitch deck trước khi gặp nhà đầu tư."
                                    value={objective}
                                    onChange={e => {
                                        setObjective(e.target.value);
                                        if (submitted) setErrors(err => ({ ...err, objective: e.target.value.trim() ? undefined : "Vui lòng nhập mục tiêu buổi tư vấn" }));
                                    }}
                                />
                            </Field>

                            {/* Mô tả vấn đề */}
                            <Field label="Mô tả vấn đề" sublabel="thách thức bạn đang gặp" required error={errors.problemContext} hint={`${problemContext.length}/500`}>
                                <textarea rows={4} maxLength={500} className={inputCls(!!errors.problemContext)}
                                    placeholder="Mô tả bối cảnh hiện tại, những gì bạn đã thử và khó khăn chính..."
                                    value={problemContext}
                                    onChange={e => {
                                        setProblemContext(e.target.value);
                                        if (submitted) setErrors(err => ({ ...err, problemContext: e.target.value.trim() ? undefined : "Vui lòng mô tả vấn đề bạn đang gặp" }));
                                    }}
                                />
                            </Field>

                            {/* Ghi chú */}
                            <Field label="Câu hỏi / Ghi chú thêm" hint={`${additionalNotes.length}/300`}>
                                <textarea rows={2} maxLength={300} className={inputCls(false)}
                                    placeholder="Các câu hỏi cụ thể hoặc thông tin bổ sung cho cố vấn..."
                                    value={additionalNotes}
                                    onChange={e => setAdditionalNotes(e.target.value)}
                                />
                            </Field>

                            {/* Phạm vi */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[12.5px] font-semibold text-slate-700">Phạm vi hỗ trợ</span>
                                        <span className="text-amber-400 text-[13px] leading-none">•</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400">Chọn một hoặc nhiều</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {SCOPE_OPTIONS.map(opt => {
                                        const active = scope.includes(opt.value);
                                        return (
                                            <button key={opt.value} type="button" onClick={() => toggleScope(opt.value)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-150",
                                                    active
                                                        ? "bg-amber-50 border-amber-300 text-amber-800"
                                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                                )}>
                                                {active && <Check className="w-3 h-3 text-amber-600" />}
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.scope && (
                                    <p className="flex items-center gap-1.5 text-[11.5px] text-red-500">
                                        <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                                        {errors.scope}
                                    </p>
                                )}
                            </div>

                            {/* Nền tảng */}
                            <div className="space-y-2">
                                <span className="text-[12.5px] font-semibold text-slate-700">Nền tảng</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {PLATFORMS.map(p => {
                                        const active = platform === p.value;
                                        return (
                                            <button key={p.value} type="button" onClick={() => setPlatform(p.value)}
                                                className={cn(
                                                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-left",
                                                    active
                                                        ? "bg-white border-slate-300 shadow-sm text-slate-900"
                                                        : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                                                )}>
                                                <span className={cn("flex-shrink-0", active ? p.activeColor : "")}>{p.icon}</span>
                                                <span className="text-[12.5px] font-medium whitespace-nowrap">{p.label}</span>
                                                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Thời lượng */}
                            <div className="space-y-2">
                                <span className="text-[12.5px] font-semibold text-slate-700">Thời lượng</span>
                                <div className="p-1 bg-slate-50 border border-slate-200 rounded-xl flex gap-1">
                                    {DURATIONS.map(d => (
                                        <button key={d.value} type="button" onClick={() => setDuration(d.value)}
                                            className={cn(
                                                "flex-1 flex items-center justify-center py-2 rounded-[9px] text-[12px] font-semibold transition-all",
                                                duration === d.value
                                                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                                    : "text-slate-400 hover:text-slate-600"
                                            )}>
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Timezone */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[12.5px] font-semibold text-slate-700">Múi giờ</span>
                                </div>
                                <select
                                    value={timezone}
                                    onChange={e => setTimezone(e.target.value)}
                                    className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 transition-all appearance-none cursor-pointer"
                                >
                                    {TIMEZONES.map(tz => (
                                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-2.5 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12.5px] font-semibold text-slate-700">Khung giờ ưu tiên</span>
                                        <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">Tùy chọn</span>
                                    </div>
                                    {slots.length < 3 && (
                                        <button type="button" onClick={addSlot}
                                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                                            <Plus className="w-3 h-3" />
                                            Thêm khung giờ
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {slots.map((slot, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-slate-300 w-4 flex-shrink-0 text-right">{i + 1}</span>
                                            <input
                                                type="date"
                                                min={today}
                                                value={slot.date}
                                                onChange={e => updateSlot(i, "date", e.target.value)}
                                                className="flex-1 bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-[12.5px] text-slate-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 transition-all"
                                            />
                                            <input
                                                type="time"
                                                value={slot.time}
                                                onChange={e => updateSlot(i, "time", e.target.value)}
                                                className="w-[110px] bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-[12.5px] text-slate-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 transition-all"
                                            />
                                            {slots.length > 1 && (
                                                <button type="button" onClick={() => removeSlot(i)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Đề xuất tối đa 3 khung giờ bạn sẵn sàng. Cố vấn sẽ chọn hoặc đề xuất lại.
                                </p>
                            </div>

                            {/* Session Price Preview */}
                            {sessionPrice !== null && (
                                <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                                    <div>
                                        <p className="text-[10.5px] font-semibold text-amber-600 uppercase tracking-wide mb-0.5">Giá phiên tư vấn</p>
                                        <p className="text-[22px] font-black text-amber-700 leading-none">{formatVND(sessionPrice)}</p>
                                    </div>
                                    <div className="text-right text-[11px] text-amber-600/80 space-y-0.5">
                                        <p>{duration} phút · {formatVND(mentor.hourlyRate!)}/giờ</p>
                                        <p className="text-[10px] text-amber-500 font-medium italic">Chỉ thanh toán sau khi lịch được xác nhận</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isSuccess && (
                    <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>Phản hồi trong <span className="font-medium text-slate-500">24–48h</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={onClose}
                                title="Hủy"
                                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={cn(
                                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                                    isSubmitting
                                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        : canSubmit
                                            ? "bg-[#0f172a] text-white hover:bg-slate-800 shadow-[0_2px_10px_rgba(15,23,42,0.25)]"
                                            : "bg-slate-100 text-slate-400"
                                )}
                            >
                                {isSubmitting ? (
                                    <><span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />Đang gửi...</>
                                ) : (
                                    <><Send className="w-3.5 h-3.5" />Gửi yêu cầu</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
    return cn(
        "w-full bg-white border rounded-xl px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-300 outline-none transition-all resize-none leading-relaxed",
        hasError
            ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-300"
            : "border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
    );
}

function Field({
    label, sublabel, required, error, hint, children,
}: {
    label: string; sublabel?: string; required?: boolean;
    error?: string; hint?: string; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1 min-h-[18px]">
                <span className="text-[12.5px] font-semibold text-slate-700">{label}</span>
                {sublabel && <span className="text-[12px] text-slate-400">· {sublabel}</span>}
                {required && <span className="text-amber-400 text-[13px] leading-none ml-0.5">•</span>}
                {hint && <span className="ml-auto text-[11px] text-slate-300 tabular-nums">{hint}</span>}
            </div>
            {children}
            {error && (
                <p className="flex items-center gap-1.5 text-[11.5px] text-red-500">
                    <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}
