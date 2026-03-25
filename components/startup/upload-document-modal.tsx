"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, CloudUpload, ChevronDown, Info, Upload, CheckCircle2, FileText } from "lucide-react";
import { DocumentType, UploadDocument } from "@/services/document/document.api";

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploaded?: () => void;
}

export function UploadDocumentModal({ isOpen, onClose, onUploaded }: UploadDocumentModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Pitch Deck",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragging, setDragging]         = useState(false);
    const [nameError, setNameError]       = useState(false);
    const [submitError, setSubmitError]   = useState<string | null>(null);
    const [submitting, setSubmitting]     = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: "", category: "Pitch Deck" });
            setSelectedFile(null);
            setNameError(false);
            setSubmitError(null);
            setSubmitting(false);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        if (!formData.name) setFormData(p => ({ ...p, name: file.name.replace(/\.[^/.]+$/, "") }));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        setSelectedFile(file);
        if (!formData.name) setFormData(p => ({ ...p, name: file.name.replace(/\.[^/.]+$/, "") }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) { setNameError(true); return; }
        if (!selectedFile) return;

        setSubmitting(true);
        setSubmitError(null);
        try {
            const documentType =
                formData.category === "Pitch Deck" ? DocumentType.Pitch_Deck : DocumentType.Bussiness_Plan;

            // BE hiện tại yêu cầu field `version`; modal không có input version nên dùng mặc định.
            const version = "v1";

            await UploadDocument({
                file: selectedFile,
                documentType,
                title: formData.name.trim(),
                version,
            });

            onUploaded?.();
            onClose();
        } catch (e: any) {
            setSubmitError(e?.message ?? "Upload tài liệu thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = formData.name.trim().length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-[#0f172a]">Tải lên tài liệu mới</h2>
                            <p className="text-[12px] text-slate-400 mt-0.5">Lưu trữ an toàn, sẵn sàng xác thực blockchain</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 px-6 py-5 overflow-y-auto space-y-5">

                    {/* Dropzone */}
                    <div>
                        <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.pptx,.xlsx,.zip" />
                        <label
                            htmlFor="file-upload"
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            className={cn(
                                "border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center cursor-pointer transition-all",
                                dragging       ? "border-amber-400 bg-amber-50"      :
                                selectedFile   ? "border-emerald-400 bg-emerald-50/30" :
                                                 "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                            )}
                        >
                            {selectedFile ? (
                                <>
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <p className="text-[13px] font-medium text-[#0f172a]">{selectedFile.name}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Nhấn để đổi tệp</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center mb-3">
                                        <CloudUpload className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <p className="text-[13px] text-slate-600">
                                        Kéo thả tài liệu hoặc <span className="font-semibold text-amber-600 underline underline-offset-2">Chọn tệp</span>
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">PDF, DOCX, PPTX, XLSX, ZIP · Tối đa 25 MB</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium text-slate-500">
                            Tên tài liệu <span className="text-red-400">*</span>
                        </label>
                        <input
                            className={cn(
                                "w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all",
                                nameError ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-slate-400"
                            )}
                            placeholder="Ví dụ: Pitch Deck Q1 2026"
                            value={formData.name}
                            onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setNameError(false); }}
                        />
                        {nameError && <p className="text-[11px] text-red-500">Vui lòng nhập tên tài liệu</p>}
                    </div>

                    {/* Type */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[12px] font-medium text-slate-500">Loại tài liệu</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all pr-9 cursor-pointer"
                                    value={formData.category}
                                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                >
                                    {["Pitch Deck","Bussiness Plan"].map(t => <option key={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] text-slate-600 leading-relaxed">
                            Tài liệu được lưu mã hóa. Bạn có thể gửi lên blockchain sau khi lưu để bảo vệ sở hữu trí tuệ.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-slate-100 transition-colors">
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all shadow-sm",
                            canSubmit
                                ? "bg-[#0f172a] text-white hover:bg-slate-800"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {submitting ? "Đang tải lên..." : "Lưu tài liệu"}
                    </button>
                </div>
                {submitError && (
                    <div className="px-6 pb-5">
                        <p className="text-[12px] text-red-500">{submitError}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
