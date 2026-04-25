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
    ChevronDown, Tag, MoreHorizontal, Eye, RotateCcw, Info, AlertCircle, Clock,
} from "lucide-react";
import {
    GetDocumentById,
    DeleteDocument,
    HashDocument,
    SubmitDocumentToBlockchain,
    CheckOnchainStatus,
    VerifyDocumentOnchain,
    GetVersionHistory,
    UploadNewVersion,
    GetDocumentAccessLogs,
    AddMetaData,
} from "@/services/document/document.api";
import { openDocumentInTab, downloadDocument } from "@/lib/document-viewer";

/* ─── Types ───────────────────────────────────────────────── */
type BlockchainStatus = "not_submitted" | "pending" | "recorded" | "matched" | "mismatch" | "failed";
type Visibility = "private" | "investors" | "advisors" | "both" | "public";
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
    documentID?: number;
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
    const p = String(doc.proofStatus ?? "").toLowerCase().trim();
    // Handle numeric values from EF Core LINQ (Anchored=0, Revoked=1, HashComputed=2, Pending=3)
    if (!p || p === "2" || p.includes("hashcomputed")) return "not_submitted";
    if (p === "3" || p.includes("pending") || p.includes("processing")) return "pending";
    if (p.includes("mismatch")) return "mismatch";
    if (p.includes("failed") || p.includes("error")) return "failed";
    if (p.includes("matched")) return "matched";
    if (p === "0" || p.includes("recorded") || p.includes("verified") || p.includes("submitted") || p.includes("anchored")) return "recorded";
    if (p === "1" || p.includes("revoked")) return "failed";
    return "not_submitted";
}

function mapBackendDocToUi(doc: IDocument): DocData {
    const anyDoc = doc as any;
    const hash = anyDoc.fileHash ?? anyDoc.computedHash ?? anyDoc.hash ?? "—";
    const txHash = anyDoc.txHash ?? anyDoc.transactionHash ?? "—";
    return {
        id: String(doc.documentID),
        name: (doc as any).title || fileNameFromUrl(doc.fileUrl),
        fileUrl: doc.fileUrl,
        type: mapBackendTypeToUiType(doc.documentType),
        visibility: visibilityFromBE(doc.visibility),
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
        recordedAt: anyDoc.anchoredAt ?? "",
        network: anyDoc.network ?? "Ethereum Sepolia",
    };
}

function formatVersion(v: string): string {
    if (!v) return "v1";
    return v.toLowerCase().startsWith("v") ? v : `v${v}`;
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
    public:    { label: "Công khai",    cls: "bg-emerald-50 text-emerald-600 border-emerald-100", Icon: Eye,    hint: "Mọi người dùng đã đăng nhập đều có thể xem." },
};

// DocumentVisibility flags: OwnerOnly=0, Investor=1, Advisor=2, Public=4.
// We map the subset the UI supports; unknown combinations fall back to "private".
function visibilityFromBE(n: number | null | undefined): Visibility {
    if (n == null) return "private";
    if (n === 4) return "public";
    const hasInv = (n & 1) !== 0;
    const hasAdv = (n & 2) !== 0;
    if (hasInv && hasAdv) return "both";
    if (hasInv) return "investors";
    if (hasAdv) return "advisors";
    return "private";
}

function visibilityToBE(v: Visibility): number {
    switch (v) {
        case "investors": return 1;
        case "advisors":  return 2;
        case "both":      return 3;
        case "public":    return 4;
        default:          return 0;
    }
}

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

/* ─── Visibility Modal ────────────────────────────────────── */
function VisibilityModal({ currentVisibility, saving, onClose, onSave }: {
    currentVisibility: Visibility;
    saving: boolean;
    onClose: () => void;
    onSave: (v: Visibility) => void;
}) {
    const [value, setValue] = useState<Visibility>(currentVisibility);
    const hint = VIS[value].hint;
    const dirty = value !== currentVisibility;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={saving ? undefined : onClose} />
            <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Eye className="w-4 h-4 text-slate-600" /></div>
                        <h2 className="text-[15px] font-semibold text-[#0f172a]">Cài đặt quyền xem</h2>
                    </div>
                    <button onClick={onClose} disabled={saving} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-all disabled:opacity-50"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-6 py-5 space-y-3">
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-medium text-slate-500">Ai được xem tài liệu này?</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/10 transition-all pr-8 cursor-pointer"
                                value={value}
                                disabled={saving}
                                onChange={e => setValue(e.target.value as Visibility)}
                            >
                                <option value="private">Riêng tư (chỉ mình tôi)</option>
                                <option value="investors">Nhà đầu tư đã kết nối</option>
                                <option value="advisors">Cố vấn đang mentoring</option>
                                <option value="both">Nhà đầu tư & Cố vấn</option>
                                <option value="public">Công khai (mọi người dùng)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                        <Info className="inline w-3.5 h-3.5 text-slate-400 mr-1.5 -mt-0.5" />{hint}
                    </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50">Hủy</button>
                    <button
                        onClick={() => onSave(value)}
                        disabled={saving || !dirty}
                        className="px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#0f172a] text-white hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        {saving && <RefreshCcw className="w-3.5 h-3.5 animate-spin" />}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Blockchain Panel ────────────────────────────────────── */
function BlockchainPanel({ status, hash, proofStatus, txHash, recordedAt, etherscanUrl, onSubmit, onRetry, onVerify }: {
    status: BlockchainStatus;
    hash: string;
    proofStatus?: string;
    txHash?: string;
    recordedAt?: string;
    etherscanUrl?: string | null;
    onSubmit: () => void | Promise<void>; onRetry: () => void | Promise<void>; onVerify: () => void | Promise<void>;
}) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [showTechnical, setShowTechnical] = useState(false);
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
                    <span className="text-[13px] font-semibold text-slate-700">Bảo vệ IP</span>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border", bc.cls)}>
                    <bc.Icon className={cn("w-3 h-3", bc.spin && "animate-spin")} /> {bc.label}
                </span>
            </div>

            <div className="px-5 py-4 space-y-4">
                {isNotSubmitted && (
                    <div className="space-y-3">
                        <p className="text-[12px] text-slate-500 leading-relaxed">Tài liệu chưa được bảo vệ. Gửi lên blockchain để đăng ký quyền sở hữu trí tuệ với bằng chứng thời gian.</p>
                        <button
                            onClick={onSubmit}
                            disabled={isSubmitDisabled}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-2.5 bg-[#0f172a] text-white rounded-xl text-[13px] font-medium hover:bg-slate-800 transition-all",
                                isSubmitDisabled && "opacity-60 cursor-not-allowed hover:bg-[#0f172a]"
                            )}
                        >
                            <Shield className="w-3.5 h-3.5" /> Bảo vệ tài liệu
                        </button>
                    </div>
                )}
                {isPending && (
                    <div className="flex items-center gap-3 py-2">
                        <RefreshCcw className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" />
                        <p className="text-[12px] text-amber-700">Đang xử lý, vui lòng chờ trong giây lát...</p>
                    </div>
                )}
                {isMismatch && (
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-[12px] text-red-700 leading-relaxed">
                                <span className="font-semibold">Cảnh báo:</span> Nội dung tài liệu không còn khớp với bản đã đăng ký trên blockchain. Tài liệu có thể đã bị chỉnh sửa sau khi đăng ký.
                            </p>
                        </div>
                        <button onClick={onVerify} className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 bg-red-50 rounded-xl text-[12px] font-medium hover:bg-red-100 transition-all">
                            <AlertTriangle className="w-3.5 h-3.5" /> Kiểm tra lại
                        </button>
                    </div>
                )}
                {isFailed && (
                    <div className="space-y-3">
                        <p className="text-[12px] text-slate-500">Đăng ký không thành công. Vui lòng thử lại.</p>
                        <button onClick={onRetry} className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-all">
                            <RefreshCcw className="w-3.5 h-3.5" /> Thử lại
                        </button>
                    </div>
                )}

                {(isVerified || isMismatch) && (
                    <>
                        {/* Simple info for non-tech users */}
                        {isVerified && (
                            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
                                <p className="text-[12px] text-teal-700 leading-relaxed">
                                    Tài liệu đã được đăng ký bảo vệ trên blockchain. Bạn có bằng chứng xác thực quyền sở hữu trí tuệ với thời gian cụ thể.
                                </p>
                            </div>
                        )}

                        {recordedAt && (
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] text-slate-400">Thời điểm đăng ký</span>
                                <span className="text-[12px] font-medium text-slate-600">{(() => {
                                    const d = new Date(recordedAt);
                                    if (Number.isNaN(d.getTime())) return recordedAt;
                                    const dd = String(d.getDate()).padStart(2, "0");
                                    const mm = String(d.getMonth() + 1).padStart(2, "0");
                                    const yyyy = d.getFullYear();
                                    const hh = String(d.getHours()).padStart(2, "0");
                                    const mi = String(d.getMinutes()).padStart(2, "0");
                                    return `${dd}/${mm}/${yyyy} · ${hh}:${mi}`;
                                })()}</span>
                            </div>
                        )}

                        {isVerified && (
                            <button onClick={onVerify} className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 text-slate-500 rounded-xl text-[12px] font-medium hover:bg-slate-50 transition-all">
                                <RotateCcw className="w-3.5 h-3.5" /> Kiểm tra lại
                            </button>
                        )}

                        {/* Collapsible technical details */}
                        <div className="border-t border-slate-100 pt-3">
                            <button
                                onClick={() => setShowTechnical(v => !v)}
                                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <ChevronDown className={cn("w-3 h-3 transition-transform", showTechnical && "rotate-180")} />
                                Chi tiết kỹ thuật
                            </button>
                            {showTechnical && (
                                <div className="mt-3 space-y-3">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">SHA-256 Hash</p>
                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                            <code className="text-[11px] text-slate-600 font-mono truncate flex-1">{hash}</code>
                                            <button onClick={() => copyText(hash, "hash")} className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors" title="Sao chép hash">
                                                {copiedKey === "hash" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    {txHash && txHash !== "—" && (
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Transaction Hash</p>
                                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                                <code className="text-[11px] text-slate-600 font-mono truncate flex-1">{txHash}</code>
                                                <button onClick={() => copyText(txHash, "tx")} className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors" title="Sao chép TX hash">
                                                    {copiedKey === "tx" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {txHash && txHash !== "—" && (
                                        <a href={etherscanUrl || `https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                                           className="w-full flex items-center justify-center gap-2 py-2 border border-indigo-200 text-indigo-600 bg-indigo-50 rounded-xl text-[12px] font-medium hover:bg-indigo-100 transition-all">
                                            <ExternalLink className="w-3.5 h-3.5" /> Xem bằng chứng trên Etherscan
                                        </a>
                                    )}
                                </div>
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
    const [editOpen, setEditOpen] = useState(false);
    const [savingMeta, setSavingMeta] = useState(false);
    const [toast, setToast]               = useState<{ msg: string; type?: "info"|"success"|"error" } | null>(null);
    const [showUploadVersion, setShowUploadVersion] = useState(false);
    const [uploadingVersion, setUploadingVersion] = useState(false);
    const [uploadVersionError, setUploadVersionError] = useState<string | null>(null);
    const [accessLogs, setAccessLogs] = useState<IDocumentAccessLog[]>([]);
    const [accessLogsLoading, setAccessLogsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"versions" | "access-logs">("versions");

    const showToast = useCallback((msg: string, type: "info"|"success"|"error" = "info") => {
        setToast({ msg, type });
    }, []);

    // Close more menu on outside click
    useEffect(() => {
        if (!showMoreMenu) return;
        const close = () => { setShowMoreMenu(false); };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [showMoreMenu]);

    const pollTxStatus = useCallback(async (docId: number) => {
        for (let i = 0; i < 12; i++) {
            await new Promise(r => setTimeout(r, 5000));
            try {
                const raw = await CheckOnchainStatus(docId) as any;
                // Interceptor unwraps response.data → raw is IBackendRes
                const inner = raw?.data;
                const status = String(inner?.status ?? "").toLowerCase();
                if (status.includes("confirmed")) {
                    setLocalBcStatus("recorded");
                    setReloadToken(t => t + 1);
                    showToast("Blockchain đã xác nhận thành công!", "success");
                    return;
                }
                if (status.includes("failed")) {
                    setLocalBcStatus("failed");
                    showToast("Giao dịch blockchain thất bại", "error");
                    return;
                }
                // If backend returned error (e.g. proof not found), skip
                if (raw?.isSuccess === false) continue;
            } catch { /* keep polling */ }
        }
        // After polling timeout, reload to get latest status from DB
        setReloadToken(t => t + 1);
    }, [showToast]);

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

                // Fetch real version history
                try {
                    const vRes = await GetVersionHistory(backendDocId);
                    const vItems = vRes?.data ?? [];
                    if (vItems.length > 0) {
                        setVersions(vItems.map((v: IDocumentVersionHistory) => ({
                            version: v.version,
                            isCurrent: v.isCurrent,
                            uploader: "—",
                            date: formatUploadedAt(v.uploadedAt),
                            blockchainStatus: mapBlockchainStatus({ proofStatus: v.proofStatus } as IDocument),
                            size: "—",
                            hashShort: shortHash(v.fileHash ?? ""),
                            documentID: v.documentID,
                        })));
                    } else {
                        setVersions([{
                            version: mapped.currentVersion,
                            isCurrent: true,
                            uploader: mapped.uploader,
                            date: mapped.createdAt,
                            blockchainStatus: mapped.blockchainStatus,
                            size: mapped.size,
                            hashShort: shortHash(mapped.hash),
                        }]);
                    }
                } catch {
                    setVersions([{
                        version: mapped.currentVersion,
                        isCurrent: true,
                        uploader: mapped.uploader,
                        date: mapped.createdAt,
                        blockchainStatus: mapped.blockchainStatus,
                        size: mapped.size,
                        hashShort: shortHash(mapped.hash),
                    }]);
                }
                // Fetch access logs
                try {
                    setAccessLogsLoading(true);
                    const logRes = await GetDocumentAccessLogs(backendDocId);
                    if (!cancelled) setAccessLogs(logRes?.data ?? []);
                } catch {
                    // Access logs are optional — silently ignore errors (e.g. 403 for non-owner)
                } finally {
                    if (!cancelled) setAccessLogsLoading(false);
                }

                // Auto-poll if status is pending on page load
                if (mapped.blockchainStatus === "pending") {
                    pollTxStatus(backendDocId);
                }
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "Không thể tải tài liệu. Vui lòng thử lại.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id, reloadToken, pollTxStatus]);

    const bc  = BC[localBcStatus];

    const handleSubmitBlockchain = async () => {
        const backendDocId = Number(id);
        setLocalBcStatus("pending");
        showToast("Đang gửi lên blockchain...", "info");
        try {
            const hashRes = await HashDocument(backendDocId) as any;
            if (hashRes && hashRes.isSuccess === false) {
                setLocalBcStatus("failed");
                showToast(hashRes.message ?? "Tính hash thất bại", "error");
                return;
            }
            const submitRes = await SubmitDocumentToBlockchain(backendDocId) as any;
            if (submitRes && submitRes.isSuccess === false) {
                setLocalBcStatus("failed");
                showToast(submitRes.message ?? "Gửi blockchain thất bại", "error");
                return;
            }
            const submitData = submitRes?.data ?? submitRes;
            if (submitData?.etherscanUrl) {
                setDoc(prev => ({ ...prev, txHash: submitData.transactionHash ?? prev.txHash, etherscanUrl: submitData.etherscanUrl } as any));
            }
            showToast("Đã gửi lên blockchain, đang chờ xác nhận...", "success");
            pollTxStatus(backendDocId);
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
            const res = await SubmitDocumentToBlockchain(backendDocId) as any;
            if (res && res.isSuccess === false) {
                setLocalBcStatus("failed");
                showToast(res.message ?? "Gửi lại thất bại", "error");
                return;
            }
            showToast("Đã gửi lại, đang chờ xác nhận...", "success");
            pollTxStatus(backendDocId);
        } catch (e: any) {
            setLocalBcStatus("failed");
            showToast(e?.message ?? "Gửi lại thất bại", "error");
        }
    };

    const handleVerifyBlockchain = async () => {
        const backendDocId = Number(id);
        setLocalBcStatus("pending");
        showToast("Đang xác minh on-chain...", "info");
        try {
            const res = await VerifyDocumentOnchain(backendDocId);
            const v = res?.data as any;
            if (v?.onChainVerified) {
                setLocalBcStatus("matched");
                showToast("Tài liệu đã được xác minh trên blockchain!", "success");
            } else {
                const status = String(v?.status ?? "").toLowerCase();
                if (status.includes("notfound")) {
                    setLocalBcStatus("not_submitted");
                    showToast("Tài liệu chưa được ghi trên blockchain", "info");
                } else if (status.includes("mismatch")) {
                    setLocalBcStatus("mismatch");
                    showToast("Hash không khớp — tài liệu có thể đã bị sửa đổi", "error");
                } else {
                    setLocalBcStatus("mismatch");
                    showToast("Không thể xác minh trên blockchain", "error");
                }
            }

            if (v?.computedHash && v.computedHash !== "—") {
                setDoc(prev => ({
                    ...prev,
                    hash: v.computedHash,
                    recordedAt: v.anchoredAt ?? prev.recordedAt,
                    etherscanUrl: v.etherscanUrl ?? (prev as any).etherscanUrl,
                }));
                setVersions(prev =>
                    prev.map(ver => (ver.isCurrent ? { ...ver, hashShort: shortHash(v.computedHash) } : ver))
                );
            }
        } catch (e: any) {
            setLocalBcStatus("failed");
            showToast(e?.message ?? "Xác minh on-chain thất bại", "error");
        }
    };

    const handleDelete = () => {
        setDeleteConfirm(false);
        (async () => {
            try {
                const backendDocId = Number(id);
                if (!Number.isFinite(backendDocId)) throw new Error("Invalid document id");
                const res = await DeleteDocument(String(backendDocId)) as any;
                if (res?.success === false) {
                    showToast(res?.message ?? "Xóa tài liệu thất bại", "error");
                    return;
                }
                showToast("Đã xóa tài liệu", "success");
                setTimeout(() => router.push("/startup/documents"), 800);
            } catch (e: any) {
                showToast(e?.message ?? "Xóa tài liệu thất bại", "error");
            }
        })();
    };

    const handleSaveVisibility = async (v: Visibility) => {
        const backendDocId = Number(id);
        if (!Number.isFinite(backendDocId)) {
            showToast("ID tài liệu không hợp lệ", "error");
            return;
        }
        setSavingMeta(true);
        try {
            const res = await AddMetaData(backendDocId, {
                visibility: visibilityToBE(v),
            }) as any;
            if (res?.success === false || res?.isSuccess === false) {
                showToast(res?.message ?? "Cập nhật thất bại", "error");
                return;
            }
            showToast("Đã cập nhật quyền xem", "success");
            setEditOpen(false);
            setReloadToken(t => t + 1);
        } catch (e: any) {
            showToast(e?.response?.data?.message ?? e?.message ?? "Cập nhật thất bại", "error");
        } finally {
            setSavingMeta(false);
        }
    };

    const handleUploadNewVersion = async (file: File) => {
        const backendDocId = Number(id);
        setUploadingVersion(true);
        setUploadVersionError(null);
        try {
            const res = await UploadNewVersion(backendDocId, file) as any;
            if (res?.isSuccess === false || res?.success === false) {
                setUploadVersionError(res?.message ?? "Upload phiên bản mới thất bại");
                return;
            }
            showToast("Đã upload phiên bản mới!", "success");
            setShowUploadVersion(false);
            setUploadVersionError(null);
            setReloadToken(t => t + 1);
        } catch (e: any) {
            setUploadVersionError(e?.response?.data?.message ?? e?.message ?? "Upload phiên bản mới thất bại");
        } finally {
            setUploadingVersion(false);
        }
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
                                    <button
                                        onClick={() => { setShowMoreMenu(false); setEditOpen(true); }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-slate-600 hover:bg-slate-50 text-left"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> Cài đặt quyền xem
                                    </button>
                                    <button
                                        onClick={() => { setShowMoreMenu(false); setDeleteConfirm(true); }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 text-left"
                                    >
                                        <X className="w-3.5 h-3.5" /> Xóa tài liệu
                                    </button>
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
                                        <button
                                            type="button"
                                            onClick={() => openDocumentInTab(doc.id)}
                                            className="flex items-center justify-center gap-1.5 py-2.5 bg-[#0f172a] text-white rounded-xl text-[12px] font-medium hover:bg-slate-800 transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Mở tệp
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => downloadDocument(doc.id, doc.name)}
                                            className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-[12px] font-medium hover:bg-slate-50 transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Tải xuống
                                        </button>
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
                            txHash={doc.txHash}
                            recordedAt={doc.recordedAt}
                            etherscanUrl={(doc as any).etherscanUrl}
                            onSubmit={handleSubmitBlockchain}
                            onRetry={handleRetryBlockchain}
                            onVerify={handleVerifyBlockchain}
                        />
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-8 space-y-5">

                        {/* Tabbed card: Version History + Access Logs */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                            {/* Tab header */}
                            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setActiveTab("versions")}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all",
                                            activeTab === "versions"
                                                ? "bg-slate-100 text-[#0f172a]"
                                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <LucideHistory className="w-3.5 h-3.5" />
                                        Lịch sử phiên bản
                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", activeTab === "versions" ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400")}>{versions.length}</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("access-logs")}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all",
                                            activeTab === "access-logs"
                                                ? "bg-slate-100 text-[#0f172a]"
                                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <Clock className="w-3.5 h-3.5" />
                                        Nhật ký truy cập
                                        {accessLogs.length > 0 && (
                                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", activeTab === "access-logs" ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400")}>{accessLogs.length}</span>
                                        )}
                                    </button>
                                </div>
                                {activeTab === "versions" && (
                                    <button
                                        onClick={() => { setShowUploadVersion(true); setUploadVersionError(null); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] text-white rounded-lg text-[12px] font-medium hover:bg-slate-800 transition-all"
                                    >
                                        <Upload className="w-3.5 h-3.5" /> Phiên bản mới
                                    </button>
                                )}
                            </div>

                            {/* Tab: Version History */}
                            {activeTab === "versions" && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                {["Phiên bản","Ngày upload","Hash","Blockchain",""].map((h, i) => (
                                                    <th key={i} className={cn("px-5 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest", i === 3 ? "text-right" : "text-left")}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {versions.map(v => {
                                                const vbc = BC[v.blockchainStatus];
                                                return (
                                                    <tr
                                                        key={v.version}
                                                        className={cn("transition-colors cursor-pointer", v.isCurrent ? "bg-teal-50/30" : "hover:bg-slate-50/40")}
                                                        onClick={() => { if (v.documentID && v.documentID !== Number(id)) router.push(`/startup/documents/${v.documentID}`); }}
                                                    >
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("text-[13px] font-semibold", v.isCurrent ? "text-teal-700" : "text-[#0f172a]")}>{formatVersion(v.version)}</span>
                                                                {v.isCurrent && <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[9px] font-semibold rounded border border-teal-200">Hiện tại</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className="text-[12px] text-slate-500">{v.date}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <code className="text-[11px] text-slate-500 font-mono">{v.hashShort}</code>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-right">
                                                            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border whitespace-nowrap", vbc.cls)}>
                                                                <vbc.Icon className={cn("w-2.5 h-2.5", vbc.spin && "animate-spin")} /> {vbc.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-right">
                                                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                                                {v.documentID && (
                                                                    <button
                                                                        onClick={() => router.push(`/startup/documents/${v.documentID}`)}
                                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                                                                        title="Xem chi tiết"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                {!v.isCurrent && v.documentID && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            try {
                                                                                await DeleteDocument(String(v.documentID));
                                                                                showToast("Đã xóa phiên bản", "success");
                                                                                setReloadToken(t => t + 1);
                                                                            } catch {
                                                                                showToast("Xóa phiên bản thất bại", "error");
                                                                            }
                                                                        }}
                                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                                                        title="Xóa phiên bản"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Tab: Access Logs */}
                            {activeTab === "access-logs" && (
                                <>
                                    {accessLogsLoading ? (
                                        <div className="px-5 py-8 text-center">
                                            <RefreshCcw className="w-4 h-4 text-slate-300 animate-spin mx-auto mb-2" />
                                            <p className="text-[12px] text-slate-400">Đang tải...</p>
                                        </div>
                                    ) : accessLogs.length === 0 ? (
                                        <div className="px-5 py-12 text-center">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                                <Eye className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <p className="text-[13px] font-medium text-slate-400">Chưa có ai truy cập</p>
                                            <p className="text-[11px] text-slate-300 mt-1">Khi nhà đầu tư hoặc cố vấn xem tài liệu, lịch sử sẽ hiển thị ở đây</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-slate-100">
                                                        <th className="px-5 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-left">Người truy cập</th>
                                                        <th className="px-5 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-left">Vai trò</th>
                                                        <th className="px-5 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-left">Hành động</th>
                                                        <th className="px-5 py-3 text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Thời gian</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {accessLogs.map(log => (
                                                        <tr key={log.logID} className="hover:bg-slate-50/40 transition-colors">
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                                    </div>
                                                                    <span className="text-[12px] font-medium text-slate-700 truncate max-w-[180px]">{log.userName}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <span className={cn(
                                                                    "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border",
                                                                    log.userType === "Investor" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                                    log.userType === "Advisor" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                                                    log.userType === "Staff" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                    log.userType === "Admin" ? "bg-red-50 text-red-600 border-red-100" :
                                                                    "bg-slate-100 text-slate-500 border-slate-200"
                                                                )}>
                                                                    {log.userType === "Investor" ? "Nhà đầu tư" :
                                                                     log.userType === "Advisor" ? "Cố vấn" :
                                                                     log.userType === "Staff" ? "Staff" :
                                                                     log.userType === "Admin" ? "Admin" : log.userType}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <span className={cn(
                                                                    "inline-flex items-center gap-1 text-[11px] font-medium",
                                                                    log.action === "Download" ? "text-emerald-600" : "text-slate-500"
                                                                )}>
                                                                    {log.action === "Download" ? <Download className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                                    {log.action === "Download" ? "Tải xuống" : "Xem"}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-right">
                                                                <span className="text-[11px] text-slate-400">{(() => {
                                                                    const d = new Date(log.accessedAt);
                                                                    if (Number.isNaN(d.getTime())) return log.accessedAt;
                                                                    const dd = String(d.getDate()).padStart(2, "0");
                                                                    const mm = String(d.getMonth() + 1).padStart(2, "0");
                                                                    const hh = String(d.getHours()).padStart(2, "0");
                                                                    const mi = String(d.getMinutes()).padStart(2, "0");
                                                                    return `${dd}/${mm} · ${hh}:${mi}`;
                                                                })()}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Upload New Version Modal */}
                        {showUploadVersion && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center">
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowUploadVersion(false)} />
                                <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] w-full max-w-md mx-4 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Upload className="w-4 h-4 text-slate-600" /></div>
                                            <h2 className="text-[15px] font-semibold text-[#0f172a]">Upload phiên bản mới</h2>
                                        </div>
                                        <button onClick={() => setShowUploadVersion(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-all"><X className="w-4 h-4" /></button>
                                    </div>
                                    <div className="px-6 py-5">
                                        <p className="text-[12px] text-slate-500 mb-4">Chọn file mới để thay thế phiên bản hiện tại. Version sẽ được tự động tăng.</p>
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all">
                                            <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                            <span className="text-[13px] text-slate-500 font-medium">Chọn file (PDF, DOCX, PPTX)</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                                disabled={uploadingVersion}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUploadNewVersion(file);
                                                }}
                                            />
                                        </label>
                                        {uploadingVersion && (
                                            <div className="flex items-center gap-2 mt-3">
                                                <RefreshCcw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                                                <span className="text-[12px] text-slate-500">Đang upload...</span>
                                            </div>
                                        )}
                                        {uploadVersionError && (
                                            <div className="flex items-start gap-3 p-3.5 mt-3 bg-red-50 border border-red-200 rounded-xl">
                                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <X className="w-3 h-3 text-red-500" />
                                                </div>
                                                <p className="text-[12px] text-red-700 leading-relaxed">{uploadVersionError}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {editOpen && (
                <VisibilityModal
                    currentVisibility={doc.visibility}
                    saving={savingMeta}
                    onClose={() => { if (!savingMeta) setEditOpen(false); }}
                    onSave={handleSaveVisibility}
                />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Delete confirmation dialog (independent of dropdown) */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setDeleteConfirm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] w-full max-w-sm mx-4 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <X className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-semibold text-slate-900">Xóa tài liệu</h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">Thao tác này không thể hoàn tác.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >Hủy</button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors"
                            >Xóa ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </StartupShell>
    );
}
