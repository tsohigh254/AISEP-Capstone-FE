"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Lock, X, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const inputCls = (hasError: boolean) =>
    cn(
        "w-full bg-slate-50 border rounded-xl px-4 py-2.5 pr-11 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all",
        hasError ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-500/10" : "border-slate-200"
    );

const POLICY = [
    { rule: (p: string) => p.length >= 8,       label: "Ít nhất 8 ký tự" },
    { rule: (p: string) => /[A-Z]/.test(p),      label: "Có chữ hoa" },
    { rule: (p: string) => /[0-9]/.test(p),      label: "Có chữ số" },
];

function PasswordField({
    label, name, value, onChange, placeholder, error, hint,
}: {
    label: string; name: string; value: string;
    onChange: (v: string) => void; placeholder: string;
    error?: string; hint?: React.ReactNode;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label className="block text-[12px] font-medium text-slate-500">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={inputCls(!!error)}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {error && (
                <p className="flex items-center gap-1.5 text-[12px] text-red-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
                </p>
            )}
            {hint}
        </div>
    );
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
    const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
    const [errors, setErrors] = useState<Partial<typeof form>>({});
    const [apiError, setApiError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showDiscard, setShowDiscard] = useState(false);

    const isDirty = form.current !== "" || form.newPwd !== "" || form.confirm !== "";

    const handleClose = () => {
        if (isDirty && !submitting) {
            setShowDiscard(true);
        } else {
            onClose();
        }
    };

    const handleDiscardConfirm = () => {
        setShowDiscard(false);
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            setForm({ current: "", newPwd: "", confirm: "" });
            setErrors({});
            setApiError("");
            setSubmitting(false);
            setShowDiscard(false);
        }
    }, [isOpen]);

    const validate = () => {
        const errs: Partial<typeof form> = {};
        if (!form.current) errs.current = "Vui lòng nhập mật khẩu hiện tại.";
        if (!form.newPwd) errs.newPwd = "Vui lòng nhập mật khẩu mới.";
        else if (form.newPwd.length < 8) errs.newPwd = "Mật khẩu phải có ít nhất 8 ký tự.";
        if (!form.confirm) errs.confirm = "Vui lòng xác nhận mật khẩu mới.";
        else if (form.confirm !== form.newPwd) errs.confirm = "Mật khẩu xác nhận không khớp.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setApiError("");
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            // TODO: replace with real API call — map apiError for "INVALID_CURRENT_PASSWORD"
            onSuccess();
        }, 700);
    };

    // Called by API layer when current password is wrong
    const handleApiError = (code: "INVALID_CURRENT_PASSWORD" | string) => {
        if (code === "INVALID_CURRENT_PASSWORD") {
            setErrors(e => ({ ...e, current: "Mật khẩu hiện tại không đúng." }));
        } else {
            setApiError("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
    };
    void handleApiError; // suppress unused warning until API is wired

    const policyChecks = POLICY.map(p => ({ ...p, passed: p.rule(form.newPwd) }));
    const canSubmit = form.current && form.newPwd && form.confirm && !submitting;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={handleClose} />
            <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] w-full max-w-md mx-4 overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-slate-600" />
                        </div>
                        <h2 className="text-[15px] font-semibold text-[#0f172a]">Đổi mật khẩu</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <PasswordField
                        label="Mật khẩu hiện tại"
                        name="current"
                        value={form.current}
                        onChange={v => { setForm(p => ({ ...p, current: v })); setErrors(e => ({ ...e, current: undefined })); }}
                        placeholder="Nhập mật khẩu hiện tại"
                        error={errors.current}
                    />

                    <PasswordField
                        label="Mật khẩu mới"
                        name="newPwd"
                        value={form.newPwd}
                        onChange={v => { setForm(p => ({ ...p, newPwd: v })); setErrors(e => ({ ...e, newPwd: undefined })); }}
                        placeholder="Tối thiểu 8 ký tự"
                        error={errors.newPwd}
                        hint={
                            form.newPwd ? (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    {policyChecks.map(({ label, passed }) => (
                                        <span key={label} className={cn("flex items-center gap-1 text-[11px]", passed ? "text-emerald-600" : "text-slate-400")}>
                                            <CheckCircle2 className="w-3 h-3" /> {label}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-400 mt-0.5">Tối thiểu 8 ký tự, bao gồm chữ hoa và chữ số.</p>
                            )
                        }
                    />

                    <PasswordField
                        label="Xác nhận mật khẩu mới"
                        name="confirm"
                        value={form.confirm}
                        onChange={v => { setForm(p => ({ ...p, confirm: v })); setErrors(e => ({ ...e, confirm: undefined })); }}
                        placeholder="Nhập lại mật khẩu mới"
                        error={errors.confirm}
                    />
                </form>

                {/* API-level error */}
                {apiError && (
                    <div className="mx-6 mb-1 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-[12.5px] text-red-600 font-medium">{apiError}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all shadow-sm",
                            canSubmit
                                ? "bg-[#0f172a] text-white hover:bg-slate-800"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {submitting ? "Đang lưu..." : "Cập nhật mật khẩu"}
                    </button>
                </div>
            </div>

            {/* Discard changes confirmation */}
            {showDiscard && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-2xl">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl mx-4 px-6 py-5 w-full max-w-xs animate-in zoom-in-95 duration-150">
                        <h3 className="text-[14px] font-semibold text-slate-900 mb-1">Bỏ thay đổi?</h3>
                        <p className="text-[13px] text-slate-500 mb-4">Thông tin bạn đã nhập sẽ không được lưu.</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDiscard(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Tiếp tục chỉnh sửa
                            </button>
                            <button
                                onClick={handleDiscardConfirm}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors"
                            >
                                Bỏ thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
