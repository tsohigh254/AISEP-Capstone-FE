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

import { FileUp, X, CloudUpload, ChevronDown, Info, Upload } from "lucide-react";

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UploadDocumentModal({ isOpen, onClose }: UploadDocumentModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Pitch Deck",
        access: "Riêng tư",
        description: ""
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle upload logic
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[720px] w-[95vw] bg-white rounded-[32px] p-0 border-none overflow-hidden shadow-[0_24px_128px_-32px_rgba(0,0,0,0.15)] flex flex-col max-h-[95vh]">
                <DialogHeader className="px-10 py-7 border-b border-slate-50 flex flex-row items-center justify-between bg-white flex-shrink-0 relative">
                    <div className="flex items-center gap-5">
                        <div className="size-11 bg-[#fef9e9] rounded-xl flex items-center justify-center text-[#eab308]">
                            <Upload className="size-6" />
                        </div>
                        <div className="space-y-0.5">
                            <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">Tải lên Tài liệu mới</DialogTitle>
                            <p className="text-[13px] text-slate-400 font-medium tracking-tight">Lưu trữ an toàn trên off-chain và sẵn sàng xác thực</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-slate-50 p-2 rounded-full transition-colors group">
                        <X className="size-5 text-slate-400 group-hover:text-slate-600" />
                    </button>
                </DialogHeader>

                <div className="flex-1 px-10 py-8 overflow-y-auto no-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-8 pb-4">
                        {/* Dropzone */}
                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.pptx,.xlsx"
                            />
                            <label
                                htmlFor="file-upload"
                                className={cn(
                                    "border-2 border-dashed rounded-[20px] py-14 flex flex-col items-center justify-center bg-[#fdfdfd] border-slate-200/80 hover:bg-yellow-50/10 transition-all cursor-pointer",
                                    selectedFile && "border-[#eec54e] bg-yellow-50/5"
                                )}
                            >
                                <div className="size-12 bg-[#f4d15d] rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <CloudUpload className="size-6 text-white" />
                                </div>
                                <div className="text-center space-y-2">
                                    {selectedFile ? (
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                                            <p className="text-xs text-[#eec54e] font-bold">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-[15px] font-bold text-slate-800">Kéo thả tài liệu vào đây hoặc <span className="text-[#eec54e] font-bold">Chọn tệp</span></p>
                                            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Chấp nhận: PDF, DOCX, PPTX, XLSX (Tối đa 25MB)</p>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-[11px] font-bold text-slate-500/80 uppercase tracking-[0.1em] pl-0.5">Tên tài liệu *</Label>
                                <Input
                                    className="h-11 bg-[#f8fafc]/50 border-slate-100 rounded-xl px-4 text-[13px] font-medium placeholder:text-slate-400/60 focus-visible:ring-1 focus-visible:ring-yellow-400/30 focus-visible:border-yellow-400/50 transition-all"
                                    placeholder="Ví dụ: Pitch Deck Q1 2026"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-slate-500/80 uppercase tracking-[0.1em] pl-0.5">Loại tài liệu</Label>
                                <div className="relative">
                                    <select
                                        className="w-full h-11 bg-[#f8fafc]/50 border border-slate-100 rounded-xl px-4 text-[13px] font-medium outline-none appearance-none focus:ring-1 focus:ring-yellow-400/30 text-slate-700"
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                        <option>Pitch Deck</option>
                                        <option>Tài chính</option>
                                        <option>Pháp lý</option>
                                        <option>Kỹ thuật</option>
                                        <option>Khác</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 size-4" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-slate-500/80 uppercase tracking-[0.1em] pl-0.5">Quyền truy cập</Label>
                                <div className="flex items-center p-1 bg-[#f1f5f9]/80 rounded-xl h-11">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, access: "Riêng tư" }))}
                                        className={cn(
                                            "flex-1 h-full rounded-lg text-xs font-bold transition-all duration-200",
                                            formData.access === "Riêng tư"
                                                ? "bg-white text-slate-900 shadow-sm border border-slate-200/5 font-bold"
                                                : "text-slate-500 hover:text-slate-700 font-bold"
                                        )}
                                    >
                                        Riêng tư
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, access: "Chia sẻ NĐT" }))}
                                        className={cn(
                                            "flex-1 h-full rounded-lg text-xs font-bold transition-all duration-200",
                                            formData.access === "Chia sẻ NĐT"
                                                ? "bg-white text-slate-900 shadow-sm border border-slate-200/5 font-bold"
                                                : "text-slate-500 hover:text-slate-700 font-bold"
                                        )}
                                    >
                                        Chia sẻ NĐT
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label className="text-[11px] font-bold text-slate-500/80 uppercase tracking-[0.1em] pl-0.5">Mô tả chi tiết</Label>
                                <textarea
                                    className="w-full bg-[#f8fafc]/50 border border-slate-100 rounded-xl px-4 py-3 text-[13px] font-medium outline-none focus:ring-1 focus:ring-yellow-400/30 placeholder:text-slate-400/60 min-h-[100px] resize-none text-slate-700"
                                    placeholder="Ghi chú ngắn về nội dung hoặc phiên bản tài liệu..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-[#eff6ff] rounded-xl border border-blue-100/30 flex gap-4 items-start">
                            <div className="size-5 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <Info className="size-3 flex-shrink-0" fill="currentColor" />
                            </div>
                            <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                                Tài liệu của bạn sẽ được lưu trữ mã <span className="font-bold text-blue-600">hóa</span>. Bạn có thể thực hiện <span className="text-blue-600 font-bold underline underline-offset-2">Xác thực Blockchain</span> sau khi lưu để bảo vệ sở hữu trí tuệ.
                            </p>
                        </div>
                    </form>
                </div>

                <DialogFooter className="px-10 py-7 flex items-center justify-end gap-6 flex-shrink-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[14px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Hủy
                    </button>
                    <Button
                        onClick={handleSubmit}
                        className="h-11 px-8 bg-[#eec54e] hover:bg-[#dab13b] text-slate-900 text-[14px] font-bold rounded-xl shadow-sm border-none transition-all active:scale-[0.98]"
                    >
                        Lưu tài liệu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
