"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter, notFound } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { cn } from "@/lib/utils";
import {
    FileText, User, Calendar, HardDrive, Upload, Download,
    ShieldCheck, Shield, Copy, ExternalLink, CheckCircle2, AlertTriangle,
    RefreshCcw, XCircle, Brain, Sparkles, ArrowRight,
    History as LucideHistory, Lock, Users, UserCheck, Pencil, X,
    ChevronDown, Tag, MoreHorizontal, Eye, RotateCcw, Info, AlertCircle,
} from "lucide-react";
import {
    GetDocumentById,
    DeleteDocument,
    HashDocument,
    SubmitDocumentToBlockchain,
    CheckOnchainStatus,
} from "@/services/document/document.api";

/* ─── Types ───────────────────────────────────────────────── */
type BlockchainStatus = "not_submitted" | "pending" | "recorded" | "matched" | "mismatch" | "failed";
type Visibility = "private" | "investors" | "advisors" | "both";
type DocType = "Pitch Deck" | "Tài chính" | "Pháp lý" | "Kỹ thuật" | "Khác";

interface DocData {
    id: string; name: string; fileUrl?: string; type: DocType; visibility: Visibility;
    tags: string[]; description: string; size: string; uploader: string;
    role: string; createdAt: string; updatedAt: string; currentVersion: string;
    blockchainStatus: BlockchainStatus; hash: string; proofStatus?: string;
    txHash: string;
    recordedAt: string; network: string;
}

interface VersionRow {
    version: string; isCurrent?: boolean; uploader: string;
    date: string; blockchainStatus: BlockchainStatus; size: string; hashShort: string;
}

/* ─── Initial (no mock content) ────────────────────────────── */
const EMPTY_DOC: DocData = {
    id: "",
    name: "",
    type: "Khác",
    visibility: "private",
    tags: [],
    description: "",
    size: "—",
    uploader: "—",
    role: "—",
    createdAt: "",
    updatedAt: "",
    currentVersion: "",
    blockchainStatus: "not_submitted",
    hash: "—",
    proofStatus: "",
    txHash: "",
    recordedAt: "",
    network: "",
};

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
    if (!p || p.includes("hashcomputed")) return "not_submitted";
    if (p.includes("pending") || p.includes("processing")) return "pending";
    if (p.includes("mismatch")) return "mismatch";
    if (p.includes("failed") || p.includes("error")) return "failed";
    if (p.includes("matched")) return "matched";
    if (p.includes("recorded") || p.includes("verified") || p.includes("submitted") || p.includes("anchored")) return "recorded";
    return "not_submitted";
}

function mapBackendDocToUi(doc: IDocument): DocData {
    const anyDoc = doc as any;
    const hash = anyDoc.fileHash ?? anyDoc.computedHash ?? anyDoc.hash ?? "—";
    const txHash = anyDoc.txHash ?? anyDoc.transactionHash ?? "—";
    return {
        id: String(doc.documentID),
        name: fileNameFromUrl(doc.fileUrl),
        fileUrl: doc.fileUrl,
        type: mapBackendTypeToUiType(doc.documentType),
        visibility: "private",
        tags: [],
        description: anyDoc.description ?? "",
        size: "—",
        uploader: anyDoc.uploader ?? "—",
        role: anyDoc.role ?? "—",
        createdAt: formatUploadedAt(doc.uploadedAt),
        updatedAt: formatUploadedAt(doc.uploadedAt),
        currentVersion: doc.version,
        blockchainStatus: mapBlockchainStatus(doc),
        hash: hash,
        proofStatus: doc.proofStatus,
        txHash: txHash,
        recordedAt: anyDoc.recordedAt ?? formatUploadedAt(doc.uploadedAt),
        network: anyDoc.network ?? "Ethereum Sepolia",
    };
}

function shortHash(hash: string): string {
    if (!hash || hash === "—") return "—";
    const s = String(hash);
    if (s.length <= 12) return s;
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
}

/* ─── Status configs ──────────────────────────────────────── */
const BC: Record<BlockchainStatus, { label: string; cls: string; Icon: React.ElementType; spin?: boolean }> = {
    not_submitted: { label: "Chưa gửi",     cls: "bg-slate-100 text-slate-500 border-slate-200",       Icon: Shield },
    pending:       { label: "Chờ xác nhận", cls: "bg-amber-50 text-amber-600 border-amber-100",         Icon: RefreshCcw, spin: true },
    recorded:      { label: "Đã ghi nhận",  cls: "bg-emerald-50 text-emerald-600 border-emerald-100",   Icon: CheckCircle2 },
    matched:       { label: "Khớp hash",    cls: "bg-teal-50 text-teal-600 border-teal-100",            Icon: ShieldCheck },
    mismatch:      { label: "Hash lệch",    cls: "bg-red-50 text-red-600 border-red-100",               Icon: AlertTriangle },
    failed:        { label: "Thất bại",     cls: "bg-rose-50 text-rose-600 border-rose-100",            Icon: XCircle },
};


const VIS: Record<Visibility, { label: string; cls: string; Icon: React.ElementType; hint: string }> = {
    private:   { label: "Riêng tư",     cls: "bg-slate-100 text-slate-600 border-slate-200",   Icon: Lock,      hint: "Chỉ thành viên nội bộ startup có thể xem." },
    investors: { label: "Nhà đầu tư",   cls: "bg-blue-50 text-blue-600 border-blue-100",       Icon: Users,     hint: "Các nhà đầu tư đã kết nối có thể xem tài liệu này." },
    advisors:  { label: "Cố vấn",       cls: "bg-violet-50 text-violet-600 border-violet-100", Icon: UserCheck, hint: "Các cố vấn đang mentoring startup có thể xem." },
    both:      { label: "NĐT & Cố vấn", cls: "bg-indigo-50 text-indigo-600 border-indigo-100", Icon: Users,     hint: "Cả nhà đầu tư và cố vấn đã kết nối đều có thể xem." },
};

/* ─── Toast ───────────────────────────────────────────────── */
function Toast({ msg, type = "info", onClose }: { msg: string; type?: "info"|"success"|"error"; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
    return (
        <div className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-[13px] font-medium pointer-events-none whitespace-nowrap",
            type === "success" ? "bg-emerald-600 text-white" :
            type === "error"   ? "bg-red-600 text-white" : "bg-[#0f172a] text-white"
        )}>
            {type === "success" ? <CheckCircle2 className="w-4 h-4" /> :
             type === "error"   ? <AlertCircle  className="w-4 h-4" /> :
                                  <Info          className="w-4 h-4" />}
            {msg}
        </div>
    );
}

/* ─── Edit Metadata Modal ─────────────────────────────────── */
function EditMetadataModal({ doc, onClose, onSave }: {
    doc: DocData;
    onClose: () => void;
    onSave: (updated: DocData) => void;
}) {
    const [form, setForm] = useState({
        name: doc.name, type: doc.type, visibility: doc.visibility,
        tags: doc.tags.join(", "), description: doc.description,
    });

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] w-full max-w-lg mx-4 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Pencil className="w-4 h-4 text-slate-600" /></div>
                        <h2 className="text-[15px] font-semibold text-[#0f172a]">Chỉnh sửa metadata</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium text-slate-500">Tên tài liệu</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[12px] font-medium text-slate-500">Loại tài liệu</label>
                            <div className="relative">
                                <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all pr-8 cursor-pointer"
                                    value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as DocType }))}>
                                    {["Pitch Deck","Tài chính","Pháp lý","Kỹ thuật","Khác"].map(t => <option key={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[12px] font-medium text-slate-500">Hiển thị với</label>
                            <div className="relative">
                                <select className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all pr-8 cursor-pointer"
                                    value={form.visibility} onChange={e => setForm(p => ({ ...p, visibility: e.target.value as Visibility }))}>
                                    <option value="private">Riêng tư</option>
                                    <option value="investors">Nhà đầu tư</option>
                                    <option value="advisors">Cố vấn</option>
                                    <option value="both">Nhà đầu tư & Cố vấn</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium text-slate-500">Tags <span className="text-slate-400 font-normal">(phân cách bằng dấu phẩy)</span></label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
                            value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Ví dụ: 2026, Series A, pitch" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium text-slate-500">Mô tả</label>
                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all resize-none"
                            rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-slate-100 transition-colors">Hủy bỏ</button>
                    <button
                        onClick={() => onSave({
                            ...doc,
                            name: form.name,
                            type: form.type,
                            visibility: form.visibility,
                            tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
                            description: form.description,
                        })}
                        className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#0f172a] text-white hover:bg-slate-800 transition-all shadow-sm"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Blockchain Panel ────────────────────────────────────── */
function BlockchainPanel({ status, hash, proofStatus, onSubmit, onRetry, onVerify }: {
    status: BlockchainStatus;
    hash: string;
    proofStatus?: string;
    onSubmit: () => void | Promise<void>; onRetry: () => void | Promise<void>; onVerify: () => void | Promise<void>;
}) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const bc = BC[status];
    const isVerified     = status === "recorded" || status === "matched";
    const isMismatch     = status === "mismatch";
    const isNotSubmitted = status === "not_submitted";
    const isFailed       = status === "failed";
    const isPending      = status === "pending";
    const isSubmitDisabled = String(proofStatus ?? "").toLowerCase() === "pending";

    const copyText = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className={cn("bg-white rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden",
            isMismatch ? "border-red-200" : isVerified ? "border-teal-200/60" : "border-slate-200/80")}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center",
                        isVerified ? "bg-teal-50" : isMismatch ? "bg-red-50" : "bg-slate-100")}>
                        <ShieldCheck className={cn("w-3.5 h-3.5", isVerified ? "text-teal-600" : isMismatch ? "text-red-500" : "text-slate-400")} />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700">Bảo vệ IP (Blockchain)</span>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border", bc.cls)}>
                    <bc.Icon className={cn("w-3 h-3", bc.spin && "animate-spin")} /> {bc.label}
                </span>
            </div>

            <div className="px-5 py-4 space-y-4">
                {isNotSubmitted && (
                    <div className="space-y-3">
                        <p className="text-[12px] text-slate-500 leading-relaxed">Tài liệu chưa được bảo vệ trên blockchain. Gửi ngay để đăng ký tài sản trí tuệ.</p>
                        <button
                            onClick={onSubmit}
                            disabled={isSubmitDisabled}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-2.5 bg-[#0f172a] text-white rounded-xl text-[13px] font-medium hover:bg-slate-800 transition-all",
                                isSubmitDisabled && "opacity-60 cursor-not-allowed hover:bg-[#0f172a]"
                            )}
                        >
                            <Shield className="w-3.5 h-3.5" /> Gửi lên Blockchain
                        </button>
                    </div>
                )}
                {isPending && (
                    <div className="flex items-center gap-3 py-2">
                        <RefreshCcw className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" />
                        <p className="text-[12px] text-amber-700">Hash đang được tính toán và gửi lên mạng. Vui lòng chờ...</p>
                    </div>
                )}
                {isMismatch && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-[12px] text-red-700 leading-relaxed">
                            <span className="font-semibold">Cảnh báo:</span> Hash hiện tại không khớp với hash đã ghi trên blockchain. Tài liệu có thể đã bị sửa đổi.
                        </p>
                    </div>
                )}
                {isFailed && (
                    <div className="space-y-3">
                        <p className="text-[12px] text-slate-500">Giao dịch thất bại. Vui lòng thử gửi lại.</p>
                        <button onClick={onRetry} className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-all">
                            <RefreshCcw className="w-3.5 h-3.5" /> Gửi lại
                        </button>
                    </div>
                )}

                {(isVerified || isMismatch) && (
                    <>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">SHA-256 Hash</p>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                <code className="text-[11px] text-slate-600 font-mono truncate flex-1">{hash}</code>
                                <button onClick={() => copyText(hash, "hash")} className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors" title="Sao chép hash">
                                    {copiedKey === "hash" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 pt-1">
                            {isMismatch ? (
                                <button onClick={onVerify} className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 bg-red-50 rounded-xl text-[12px] font-medium hover:bg-red-100 transition-all">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Kiểm tra on-chain
                                </button>
                            ) : (
                                <button onClick={onVerify} className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 text-slate-500 rounded-xl text-[12px] font-medium hover:bg-slate-50 transition-all">
                                    <RotateCcw className="w-3.5 h-3.5" /> Xác minh lại
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [doc, setDoc]                   = useState<DocData>(EMPTY_DOC);
    const [versions, setVersions]         = useState<VersionRow[]>([]);
    const [localBcStatus, setLocalBcStatus] = useState<BlockchainStatus>("not_submitted");
    const [loading, setLoading]           = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [showMoreMenu, setShowMoreMenu]  = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [toast, setToast]               = useState<{ msg: string; type?: "info"|"success"|"error" } | null>(null);

    const showToast = useCallback((msg: string, type: "info"|"success"|"error" = "info") => {
        setToast({ msg, type });
    }, []);

    // Close more menu on outside click
    useEffect(() => {
        if (!showMoreMenu) return;
        const close = () => { setShowMoreMenu(false); setDeleteConfirm(false); };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [showMoreMenu]);

    useEffect(() => {
        const backendDocId = Number(id);
        if (!Number.isFinite(backendDocId)) notFound();

        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await GetDocumentById(backendDocId);
                const item = res?.data ?? null;
                if (cancelled) return;
                if (!item) notFound();

                const mapped = mapBackendDocToUi(item);
                setDoc(mapped);
                setLocalBcStatus(mapped.blockchainStatus);
                setVersions([
                    {
                        version: mapped.currentVersion,
                        isCurrent: true,
                        uploader: mapped.uploader,
                        date: mapped.createdAt,
                        blockchainStatus: mapped.blockchainStatus,
                        size: mapped.size,
                        hashShort: shortHash(mapped.hash),
                    },
                ]);
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "Failed to load document");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id, reloadToken]);

    const bc  = BC[localBcStatus];

    const handleSubmitBlockchain = async () => {
        const backendDocId = Number(id);
        setLocalBcStatus("pending");
        showToast("Đang gửi lên blockchain...", "info");
        try {
            await HashDocument(backendDocId);
            await SubmitDocumentToBlockchain(backendDocId);
            showToast("Đã gửi lên blockchain (đang chờ xử lý)...", "success");
        } catch (e: any) {
            setLocalBcStatus("failed");
            showToast(e?.message ?? "Gửi blockchain thất bại", "error");
        }
    };

    const handleRetryBlockchain = async () => {
        const backendDocId = Number(id);
        setLocalBcStatus("pending");
        showToast("Đang gửi lại yêu cầu ghi nhận...", "info");
        try {
            await SubmitDocumentToBlockchain(backendDocId);
            showToast("Đã gửi lại (đang chờ xử lý)...", "success");
        } catch (e: any) {
            setLocalBcStatus("failed");
            showToast(e?.message ?? "Gửi lại thất bại", "error");
        }
    };

    const handleVerifyBlockchain = async () => {
        const backendDocId = Number(id);
        setLocalBcStatus("pending");
        showToast("Đang kiểm tra on-chain...", "info");
        try {
            const res = await CheckOnchainStatus(backendDocId);
            const v = res?.data;
            const statusStr = String(v?.status ?? "").toLowerCase();
            if (statusStr.includes("failed") || statusStr.includes("error")) setLocalBcStatus("failed");
            else if (statusStr.includes("pending")) setLocalBcStatus("pending");
            else if (v?.onChainVerified) setLocalBcStatus("matched");
            else setLocalBcStatus("mismatch");

            if (v?.computedHash && v.computedHash !== "—") {
                setDoc(prev => ({ ...prev, hash: v.computedHash }));
                setVersions(prev =>
                    prev.map(ver => (ver.isCurrent ? { ...ver, hashShort: shortHash(v.computedHash) } : ver))
                );
            }
            showToast("Hoàn tất kiểm tra on-chain", "success");
        } catch (e: any) {
            setLocalBcStatus("failed");
            showToast(e?.message ?? "Kiểm tra on-chain thất bại", "error");
        }
    };

    const handleDelete = () => {
        (async () => {
            try {
                const backendDocId = Number(id);
                if (!Number.isFinite(backendDocId)) throw new Error("Invalid document id");
                await DeleteDocument(String(backendDocId));
                showToast("Đã xóa tài liệu", "success");
                setTimeout(() => router.push("/startup/documents"), 800);
            } catch (e: any) {
                showToast(e?.message ?? "Xóa tài liệu thất bại", "error");
            }
        })();
    };

    if (loading) {
        return (
            <StartupShell>
                <div className="max-w-[1100px] mx-auto space-y-6 pb-20">
                    <p className="text-[13px] text-slate-500">Đang tải tài liệu...</p>
                </div>
            </StartupShell>
        );
    }

    if (error) {
        return (
            <StartupShell>
                <div className="max-w-[1100px] mx-auto space-y-6 pb-20">
                    <p className="text-[13px] text-red-500">{error}</p>
                </div>
            </StartupShell>
        );
    }

    return (
        <StartupShell>
            <div className="max-w-[1100px] mx-auto space-y-6 pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 flex-shrink-0">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-[20px] font-semibold text-[#0f172a] tracking-[-0.02em]">{doc.name}</h1>
                                <span className="px-2 py-0.5 bg-[#0f172a] text-white text-[10px] font-medium rounded-md">{doc.currentVersion}</span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-medium rounded-md border border-emerald-100">Hiện tại</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                                <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                                    <Calendar className="w-3.5 h-3.5" /> Tạo {doc.createdAt || "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* More menu */}
                        <div className="relative">
                            <button
                                onClick={e => { e.stopPropagation(); setShowMoreMenu(v => !v); setDeleteConfirm(false); }}
                                className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {showMoreMenu && (
                                <div
                                    className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1 w-[176px] z-20"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {deleteConfirm ? (
                                        <div className="px-3.5 py-3 space-y-2.5">
                                            <p className="text-[12px] text-slate-600 font-medium">Xóa tài liệu này?</p>
                                            <p className="text-[11px] text-slate-400">Thao tác không thể hoàn tác.</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-1.5 rounded-lg border border-slate-200 text-[12px] text-slate-500 hover:bg-slate-50 transition-colors">Hủy</button>
                                                <button onClick={handleDelete} className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-[12px] font-medium hover:bg-red-600 transition-colors">Xóa ngay</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setShowMoreMenu(false); setDeleteConfirm(true); }}
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 text-left"
                                        >
                                            <X className="w-3.5 h-3.5" /> Xóa tài liệu
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                    {/* Left column */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* Compact file card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-7 h-7 text-red-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-[#0f172a] truncate">{doc.name}</p>
                                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border mt-1.5", bc.cls)}>
                                        <bc.Icon className={cn("w-2.5 h-2.5", bc.spin && "animate-spin")} /> {bc.label}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {doc.fileUrl ? (
                                    <>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 py-2.5 bg-[#0f172a] text-white rounded-xl text-[12px] font-medium hover:bg-slate-800 transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Mở tệp
                                        </a>
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-[12px] font-medium hover:bg-slate-50 transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Tải xuống
                                        </a>
                                    </>
                                ) : (
                                    <p className="col-span-2 text-[12px] text-slate-400">Chưa có file để tải xuống.</p>
                                )}
                            </div>
                        </div>

                        {/* Metadata card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-[13px] font-semibold text-slate-700">Thông tin</span>
                            </div>
                            <div className="px-5 pt-4 pb-3 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[12px] text-slate-400">Loại</span>
                                    <span className="text-[12px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{doc.type}</span>
                                </div>
                                {/* Response hiện tại không trả về visibility/hint như UI cũ */}
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[12px] text-slate-400">Tạo lúc</span>
                                    <span className="text-[12px] text-slate-600">{doc.createdAt}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[12px] text-slate-400">Cập nhật</span>
                                    <span className="text-[12px] text-slate-600">{doc.updatedAt}</span>
                                </div>
                            </div>
                            {/* Không hiển thị các trường không có trong response hiện tại */}
                        </div>

                        {/* Blockchain panel */}
                        <BlockchainPanel
                            status={localBcStatus}
                            hash={doc.hash}
                            proofStatus={doc.proofStatus}
                            onSubmit={handleSubmitBlockchain}
                            onRetry={handleRetryBlockchain}
                            onVerify={handleVerifyBlockchain}
                        />
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-8 space-y-5">

                        {/* Version history */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-[13px] font-semibold text-slate-700">Lịch sử phiên bản</span>
                                <span className="text-[12px] text-slate-400">{versions.length} phiên bản</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            {["Phiên bản","Hash","Blockchain"].map((h, i) => (
                                                <th key={i} className={cn("px-5 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest", i === 2 ? "text-right" : "text-left")}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {versions.map(v => {
                                            const vbc = BC[v.blockchainStatus];
                                            return (
                                                <tr key={v.version} className={cn("transition-colors", v.isCurrent ? "bg-teal-50/30" : "hover:bg-slate-50/40")}>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("text-[13px] font-semibold", v.isCurrent ? "text-teal-700" : "text-[#0f172a]")}>{v.version}</span>
                                                            {v.isCurrent && <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[9px] font-semibold rounded border border-teal-200">Hiện tại</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5"><code className="text-[11px] text-slate-500 font-mono">{v.hashShort}</code></td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap", vbc.cls)}>
                                                            <vbc.Icon className={cn("w-2.5 h-2.5", vbc.spin && "animate-spin")} /> {vbc.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {false && <EditMetadataModal doc={doc} onClose={() => {}} onSave={() => {}} />}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </StartupShell>
    );
}
