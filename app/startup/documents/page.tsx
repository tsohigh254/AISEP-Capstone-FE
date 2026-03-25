"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { cn } from "@/lib/utils";
import { UploadDocumentModal } from "@/components/startup/upload-document-modal";
import {
    Search, Upload, FolderOpen, ShieldCheck, Clock, HardDrive,
    FileText, FileSpreadsheet, FileArchive, FileCode,
    Shield, RefreshCcw, AlertTriangle, CheckCircle2, XCircle,
    Eye, Download, Lock, Users, UserCheck, Pencil, Trash2,
    ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ExternalLink,
    Info, AlertCircle,
} from "lucide-react";
import { DeleteDocument, GetDocument } from "@/services/document/document.api";

/* ─── Types ───────────────────────────────────────────────── */
type BlockchainStatus = "not_submitted" | "pending" | "recorded" | "matched" | "mismatch" | "failed";
type DocType = "Pitch Deck" | "Tài chính" | "Pháp lý" | "Kỹ thuật" | "Khác";
type SortKey = "updatedAt" | "name" | "type" | "blockchainStatus" | "version";

interface Doc {
    id: string;
    fileUrl?: string;
    name: string; // derived from `fileUrl`
    type: DocType; // derived from `documentType`
    version: string;
    updatedAt: string;
    blockchainStatus: BlockchainStatus;
}

/* ─── Mapping helpers (BE -> UI) ───────────────────────────── */
function fileNameFromUrl(url?: string | null): string {
    if (!url) return "Untitled";
    const parts = url.split("/");
    return parts[parts.length - 1] || "Untitled";
}

function formatUploadedAt(uploadedAt?: string | null): string {
    if (!uploadedAt) return "—";
    const d = new Date(uploadedAt);
    if (Number.isNaN(d.getTime())) return uploadedAt;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function mapBackendTypeToUiType(documentType?: string | null): DocType {
    const t = String(documentType ?? "").toLowerCase();
    if (t.includes("pitch")) return "Pitch Deck";
    if (t.includes("business") || t.includes("plan")) return "Tài chính";
    if (t.includes("legal")) return "Pháp lý";
    if (t.includes("tech") || t.includes("technical")) return "Kỹ thuật";
    return "Khác";
}

function mapBlockchainStatus(doc: IDocument): BlockchainStatus {
    const p = String(doc.proofStatus ?? "").toLowerCase();
    if (!p) return "not_submitted";
    if (p.includes("pending") || p.includes("processing") || p.includes("calculating")) return "pending";
    if (p.includes("mismatch")) return "mismatch";
    if (p.includes("failed") || p.includes("error")) return "failed";
    if (p.includes("matched")) return "matched";
    if (p.includes("recorded") || p.includes("verified") || p.includes("submitted")) return "recorded";
    return "recorded";
}

function mapBackendDocToUi(doc: IDocument): Doc {
    const anyDoc = doc as any;
    return {
        id: String(doc.documentID),
        fileUrl: doc.fileUrl,
        name: fileNameFromUrl(doc.fileUrl),
        type: mapBackendTypeToUiType(doc.documentType),
        version: doc.version,
        updatedAt: formatUploadedAt(doc.uploadedAt),
        blockchainStatus: mapBlockchainStatus(doc),
    };
}

/* ─── Config ──────────────────────────────────────────────── */
function fileIconProps(name: string): { Icon: React.ElementType; cls: string } {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf")                          return { Icon: FileText,        cls: "text-red-500 bg-red-50 border-red-100" };
    if (["xlsx","xls","csv"].includes(ext))     return { Icon: FileSpreadsheet, cls: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (ext === "pptx")                         return { Icon: FileText,        cls: "text-orange-500 bg-orange-50 border-orange-100" };
    if (ext === "zip")                          return { Icon: FileArchive,     cls: "text-violet-500 bg-violet-50 border-violet-100" };
    return                                             { Icon: FileCode,        cls: "text-blue-500 bg-blue-50 border-blue-100" };
}

const BC: Record<BlockchainStatus, {
    label: string; cls: string; Icon: React.ElementType; spin?: boolean; hint?: string; cta?: string;
}> = {
    not_submitted: { label: "Chưa gửi",     cls: "bg-slate-100 text-slate-500 border-slate-200",       Icon: Shield },
    pending:       { label: "Chờ xác nhận", cls: "bg-amber-50 text-amber-600 border-amber-100",         Icon: RefreshCcw, spin: true },
    recorded:      { label: "Đã ghi nhận",  cls: "bg-emerald-50 text-emerald-600 border-emerald-100",   Icon: CheckCircle2 },
    matched:       { label: "Khớp hash",    cls: "bg-teal-50 text-teal-600 border-teal-100",            Icon: ShieldCheck },
    mismatch:      { label: "Hash lệch",    cls: "bg-red-50 text-red-600 border-red-100",               Icon: AlertTriangle, hint: "File có thể đã bị thay đổi sau khi ghi nhận", cta: "Kiểm tra on-chain" },
    failed:        { label: "Thất bại",     cls: "bg-rose-50 text-rose-600 border-rose-100",            Icon: XCircle, hint: "Giao dịch blockchain không thành công", cta: "Gửi lại hash" },
};

// Note: không có visibility/tags trong response hiện tại, nên không render các filter/columns liên quan.

function sortDocs(docs: Doc[], key: SortKey): Doc[] {
    return [...docs].sort((a, b) => {
        switch (key) {
            case "name":             return a.name.localeCompare(b.name);
            case "type":             return a.type.localeCompare(b.type);
            case "blockchainStatus": return a.blockchainStatus.localeCompare(b.blockchainStatus);
            case "version":          return b.version.localeCompare(a.version);
            default: {
                const parse = (s: string) => { const [d,m,y] = s.split("/"); return new Date(+y,+m-1,+d).getTime(); };
                return parse(b.updatedAt) - parse(a.updatedAt);
            }
        }
    });
}

/* ─── Toast ───────────────────────────────────────────────── */
function Toast({ msg, type = "info", onClose }: { msg: string; type?: "info"|"success"|"error"; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
    return (
        <div className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-[13px] font-medium pointer-events-none whitespace-nowrap",
            type === "success" ? "bg-emerald-600 text-white" :
            type === "error"   ? "bg-red-600 text-white" :
                                 "bg-[#0f172a] text-white"
        )}>
            {type === "success" ? <CheckCircle2 className="w-4 h-4" /> :
             type === "error"   ? <AlertCircle  className="w-4 h-4" /> :
                                  <Info          className="w-4 h-4" />}
            {msg}
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function StartupDocumentsPage() {
    const router = useRouter();
    const [localDocs, setLocalDocs]       = useState<Doc[]>([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [showUpload, setShowUpload]     = useState(false);
    const [menuState, setMenuState]       = useState<{ docId: string; x: number; y: number } | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [toast, setToast]               = useState<{ msg: string; type?: "info"|"success"|"error" } | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        if (!menuState) return;
        const close = () => { setMenuState(null); setDeleteConfirmId(null); };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [menuState]);

    const showToast = (msg: string, type: "info"|"success"|"error" = "info") => setToast({ msg, type });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await GetDocument();
                const items = res?.data ?? [];
                if (cancelled) return;
                setLocalDocs(items.map(mapBackendDocToUi));
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "Failed to load documents");
                setLocalDocs([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [reloadToken]);

    const docs = sortDocs(localDocs, "updatedAt");

    const protectedCount = localDocs.filter(d => d.blockchainStatus === "recorded" || d.blockchainStatus === "matched").length;
    const pendingCount   = localDocs.filter(d => d.blockchainStatus === "pending").length;

    const openMenu = (e: React.MouseEvent, docId: string) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setDeleteConfirmId(null);
        setMenuState({ docId, x: rect.right - 188, y: rect.bottom + 6 });
    };

    const handleDelete = (docId: string) => {
        (async () => {
            try {
                await DeleteDocument(docId);
                showToast("Đã xóa tài liệu", "success");
                setMenuState(null);
                setDeleteConfirmId(null);
                setReloadToken(v => v + 1);
            } catch (e: any) {
                showToast(e?.message ?? "Xóa tài liệu thất bại", "error");
            }
        })();
    };

    return (
        <StartupShell>
            <div className="max-w-[1100px] mx-auto space-y-5 pb-20">

                {/* Header */}
                <div className="flex items-end justify-between mb-2">
                    <div>
                        <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em]">Tài liệu & IP</h1>
                        <p className="text-[13px] text-slate-500 mt-1">Quản lý tài liệu và bảo vệ tài sản trí tuệ qua blockchain.</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] text-white rounded-xl text-[13px] font-medium hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <Upload className="w-3.5 h-3.5" /> Tải lên tài liệu
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { Icon: FolderOpen,  label: "Tổng tài liệu", value: String(localDocs.length), sub: "—" },
                        { Icon: ShieldCheck, label: "Đã bảo vệ IP",  value: String(protectedCount),   sub: localDocs.length ? `${Math.round(protectedCount / localDocs.length * 100)}% tổng số` : "—" },
                        { Icon: Clock,       label: "Chờ xác nhận",  value: String(pendingCount),     sub: "—" },
                        { Icon: HardDrive,   label: "Dung lượng",    value: "—",                         sub: "—" },
                    ].map(({ Icon, label, value, sub }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-5 py-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                                </div>
                                <span className="text-[11px] text-slate-500">{label}</span>
                            </div>
                            <p className="text-[22px] font-semibold text-[#0f172a] leading-none">{value}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {["Tài liệu","Loại","Phiên bản","Cập nhật","Blockchain",""].map((h, i) => (
                                    <th key={i} className={cn("px-5 py-3.5 text-[10px] font-medium text-slate-400 uppercase tracking-widest", i === 5 ? "text-right" : "text-left")}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center">
                                        <p className="text-[13px] text-slate-400">Đang tải tài liệu...</p>
                                        {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
                                    </td>
                                </tr>
                            ) : docs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center">
                                        <FolderOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-[13px] text-slate-400">Không tìm thấy tài liệu phù hợp</p>
                                    </td>
                                </tr>
                            ) : docs.map(doc => {
                                const fi  = fileIconProps(doc.name);
                                const bc  = BC[doc.blockchainStatus];

                                return (
                                    <tr key={doc.id} className="group hover:bg-slate-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0", fi.cls)}>
                                                    <fi.Icon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <Link href={`/startup/documents/${doc.id}`}
                                                        className="text-[13px] font-medium text-[#0f172a] hover:underline underline-offset-2 line-clamp-1 block">
                                                        {doc.name}
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md whitespace-nowrap">{doc.type}</span>
                                        </td>
                                        <td className="px-4 py-4 text-[12px] font-medium text-slate-600 whitespace-nowrap">{doc.version}</td>
                                        <td className="px-4 py-4 text-[12px] text-slate-500 whitespace-nowrap">{doc.updatedAt}</td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border whitespace-nowrap", bc.cls)} title={bc.hint}>
                                                    <bc.Icon className={cn("w-3 h-3 flex-shrink-0", bc.spin && "animate-spin")} />
                                                    {bc.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/startup/documents/${doc.id}`}>
                                                    <span className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all" title="Xem chi tiết">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </span>
                                                </Link>
                                                {doc.fileUrl && (
                                                    <a
                                                        href={doc.fileUrl}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                                                        title="Tải xuống"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={e => openMenu(e, doc.id)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                                                    title="Thêm thao tác"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                                                        <circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Row actions dropdown (fixed-positioned) */}
            {menuState && (() => {
                const menuDoc = localDocs.find(d => d.id === menuState.docId);
                if (!menuDoc) return null;
                const isConfirmingDelete = deleteConfirmId === menuState.docId;

                return (
                    <div
                        className="fixed z-[70] bg-white border border-slate-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1 w-[188px]"
                        style={{ left: menuState.x, top: menuState.y }}
                        onClick={e => e.stopPropagation()}
                    >
                        {isConfirmingDelete ? (
                            <div className="px-3.5 py-3 space-y-2.5">
                                <p className="text-[12px] text-slate-600 font-medium">Xóa tài liệu này?</p>
                                <p className="text-[11px] text-slate-400 leading-relaxed">Thao tác này không thể hoàn tác.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="flex-1 py-1.5 rounded-lg border border-slate-200 text-[12px] text-slate-500 hover:bg-slate-50 transition-colors"
                                    >Hủy</button>
                                    <button
                                        onClick={() => handleDelete(menuState.docId)}
                                        className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium hover:bg-red-600 transition-colors"
                                    >Xóa ngay</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href={`/startup/documents/${menuState.docId}`}>
                                    <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors text-left">
                                        <Eye className="w-3.5 h-3.5 text-slate-400" /> Xem chi tiết
                                    </button>
                                </Link>
                                <button
                                    onClick={() => setDeleteConfirmId(menuState.docId)}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors text-left"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Xóa tài liệu
                                </button>
                            </>
                        )}
                    </div>
                );
            })()}

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            <UploadDocumentModal
                isOpen={showUpload}
                onClose={() => setShowUpload(false)}
                onUploaded={() => setReloadToken(v => v + 1)}
            />
        </StartupShell>
    );
}
