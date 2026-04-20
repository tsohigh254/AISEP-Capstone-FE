"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    FileText,
    FileSpreadsheet,
    FileArchive,
    FileCode,
    ShieldCheck,
    Clock,
    X,
    Check
} from "lucide-react";
import { GetDocument } from "@/services/document/document.api";
import { cn } from "@/lib/utils";

interface PickDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (docUrl: string, docName: string) => void;
}

export function PickDocumentModal({ isOpen, onClose, onSelect }: PickDocumentModalProps) {
    const [docs, setDocs] = useState<IDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchDocs();
        }
    }, [isOpen]);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await GetDocument();
            if (res.success && Array.isArray(res.data)) {
                setDocs(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDocs = docs.filter(d => 
        (d.title || "").toLowerCase().includes(search.toLowerCase())
    );

    const getFileIcon = (name: string) => {
        const ext = name.split(".").pop()?.toLowerCase() ?? "";
        if (ext === "pdf") return { Icon: FileText, cls: "text-red-500 bg-red-50" };
        if (["xlsx", "xls", "csv"].includes(ext)) return { Icon: FileSpreadsheet, cls: "text-emerald-600 bg-emerald-50" };
        if (ext === "pptx") return { Icon: FileText, cls: "text-orange-500 bg-orange-50" };
        if (ext === "zip") return { Icon: FileArchive, cls: "text-violet-500 bg-violet-50" };
        return { Icon: FileCode, cls: "text-blue-500 bg-blue-50" };
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <DialogTitle className="text-lg font-bold text-slate-900">Chọn tài liệu hệ thống</DialogTitle>
                    <p className="text-xs text-slate-500 mt-1">Chọn một tài liệu đã tải lên để đính kèm vào chat.</p>
                </DialogHeader>

                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#e6cc4c]/20 outline-none transition-all"
                            placeholder="Tìm kiếm tài liệu..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {loading ? (
                            <div className="py-20 text-center">
                                <p className="text-sm text-slate-400">Đang tải danh sách tài liệu...</p>
                            </div>
                        ) : filteredDocs.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-sm text-slate-400">Không tìm thấy tài liệu nào</p>
                            </div>
                        ) : (
                            filteredDocs.map(doc => {
                                const name = doc.title || "Untitled";
                                const { Icon, cls } = getFileIcon(name);
                                const isAnchored = String(doc.proofStatus ?? "").toLowerCase().trim() === "anchored" || doc.proofStatus === "0";

                                return (
                                    <div
                                        key={doc.documentID}
                                        onClick={() => onSelect(doc.fileUrl || "", name)}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#e6cc4c] hover:bg-[#e6cc4c]/5 cursor-pointer transition-all group"
                                    >
                                        <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", cls)}>
                                            <Icon className="size-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-sm font-bold text-slate-900 truncate">{name}</h4>
                                                {isAnchored && (
                                                    <span title="Đã xác thực blockchain">
                                                        <ShieldCheck className="size-3.5 text-emerald-500" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-400">v{doc.version}</span>
                                                <span className="text-[10px] text-slate-300">•</span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="size-6 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#e6cc4c] group-hover:bg-[#e6cc4c] transition-all">
                                            <Check className="size-3 text-transparent group-hover:text-slate-900" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
