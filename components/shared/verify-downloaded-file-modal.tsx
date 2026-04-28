"use client";

import { useEffect, useRef, useState } from "react";
import { X, ShieldCheck, ShieldAlert, ShieldX, FileLock, Upload, ExternalLink, Loader2, Lock } from "lucide-react";
import { sha256File } from "@/lib/file-hash";
import { VerifyHashLookup, IHashLookupResponse } from "@/services/document/document.api";

interface VerifyDownloadedFileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Phase = "pick" | "hashing" | "checking" | "result" | "error";

export function VerifyDownloadedFileModal({ isOpen, onClose }: VerifyDownloadedFileModalProps) {
    const [phase, setPhase] = useState<Phase>("pick");
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [hash, setHash] = useState<string | null>(null);
    const [result, setResult] = useState<IHashLookupResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setPhase("pick");
            setFile(null);
            setProgress(0);
            setHash(null);
            setResult(null);
            setErrorMsg(null);
            setDragging(false);
        }
    }, [isOpen]);

    const startVerify = async (chosen: File) => {
        setFile(chosen);
        setProgress(0);
        setPhase("hashing");
        setErrorMsg(null);
        try {
            const hex = await sha256File(chosen, (r) => setProgress(r));
            setHash(hex);
            setPhase("checking");
            const res = await VerifyHashLookup(hex) as unknown as IBackendRes<IHashLookupResponse>;
            if (res?.isSuccess === false || !res?.data) {
                setErrorMsg(res?.message ?? "Không xác minh được hash.");
                setPhase("error");
                return;
            }
            setResult(res.data);
            setPhase("result");
        } catch (e: unknown) {
            const err = e as { message?: string };
            setErrorMsg(err?.message ?? "Lỗi không xác định khi xác minh file.");
            setPhase("error");
        }
    };

    const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) startVerify(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) startVerify(f);
    };

    const reset = () => {
        setPhase("pick");
        setFile(null);
        setProgress(0);
        setHash(null);
        setResult(null);
        setErrorMsg(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.12)] w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">

                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <FileLock className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-[#0f172a]">Xác minh file đã tải</h2>
                            <p className="text-[12px] text-slate-400 mt-0.5">So khớp với hash gốc đã đăng ký trên blockchain</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 px-6 py-5 overflow-y-auto space-y-4">

                    {phase === "pick" && (
                        <>
                            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-start gap-3">
                                <Lock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[12px] text-slate-600 leading-relaxed">
                                    File <strong>không upload</strong> lên máy chủ. Trình duyệt tự tính chuỗi 64 ký tự (hash SHA-256) và chỉ gửi chuỗi đó để tra cứu.
                                </p>
                            </div>

                            <input ref={inputRef} type="file" id="verify-file-input" className="hidden" onChange={handlePick} />
                            <label
                                htmlFor="verify-file-input"
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                className={`block border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-all ${dragging ? "border-emerald-400 bg-emerald-50/50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"}`}
                            >
                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                                <p className="text-[13px] font-medium text-slate-700">Kéo thả file vào đây hoặc bấm để chọn</p>
                                <p className="text-[11px] text-slate-400 mt-1">PDF, DOCX, PPTX, …</p>
                            </label>
                        </>
                    )}

                    {(phase === "hashing" || phase === "checking") && (
                        <div className="py-8 text-center space-y-4">
                            <Loader2 className="w-8 h-8 text-emerald-500 mx-auto animate-spin" />
                            <div>
                                <p className="text-[13px] font-medium text-slate-700">
                                    {phase === "hashing" ? "Đang tính hash file..." : "Đang đối chiếu blockchain..."}
                                </p>
                                {file && <p className="text-[11px] text-slate-400 mt-1 truncate">{file.name}</p>}
                            </div>
                            {phase === "hashing" && (
                                <div className="w-full max-w-xs mx-auto">
                                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5">{Math.round(progress * 100)}%</p>
                                </div>
                            )}
                        </div>
                    )}

                    {phase === "result" && result && (
                        <ResultPanel result={result} fileName={file?.name} />
                    )}

                    {phase === "error" && (
                        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-4 flex items-start gap-3">
                            <ShieldX className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="text-[13px] text-red-700">
                                <p className="font-semibold mb-1">Không xác minh được</p>
                                <p className="text-[12px]">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                    {hash && (phase === "result" || phase === "error") && (
                        <details className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-[11px] text-slate-500">
                            <summary className="cursor-pointer select-none">Hash đã tính</summary>
                            <p className="mt-2 break-all font-mono text-slate-600">{hash}</p>
                        </details>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0 bg-slate-50/50">
                    {(phase === "result" || phase === "error") && (
                        <button
                            onClick={reset}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Xác minh file khác
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-white text-[13px] font-medium hover:bg-slate-700 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

function ResultPanel({ result, fileName }: { result: IHashLookupResponse; fileName?: string }) {
    const anchored = result.anchoredAt ? new Date(result.anchoredAt).toLocaleString("vi-VN") : null;

    if (result.status === "Verified") {
        return (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-4">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-[14px] font-semibold text-emerald-800">File khớp với bản gốc</p>
                        <p className="text-[12px] text-emerald-700 mt-1 leading-relaxed">
                            File này đúng là bản đã được đăng ký trên blockchain — chưa bị chỉnh sửa sau khi đăng ký.
                        </p>
                        {fileName && <p className="text-[11px] text-emerald-600/80 mt-2 truncate">📄 {fileName}</p>}
                        {anchored && (
                            <p className="text-[11px] text-emerald-700 mt-2">
                                <span className="text-emerald-600/70">Đăng ký lúc:</span> <span className="font-medium">{anchored}</span>
                            </p>
                        )}
                        {result.etherscanUrl && (
                            <a href={result.etherscanUrl} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-md bg-white border border-emerald-200 text-[12px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
                                Xem trên Etherscan <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (result.status === "OnChainOnly") {
        return (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-4">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-[14px] font-semibold text-amber-800">Khớp blockchain, nhưng AISEP không có document tương ứng</p>
                        <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">
                            Blockchain xác nhận hash này đã được đăng ký, nhưng hệ thống AISEP không tìm thấy document gốc. Có thể document đã bị xoá khỏi AISEP, hoặc hash được đăng ký từ hệ thống khác.
                        </p>
                        {fileName && <p className="text-[11px] text-amber-600/80 mt-2 truncate">📄 {fileName}</p>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-4">
            <div className="flex items-start gap-3">
                <ShieldX className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-[14px] font-semibold text-red-800">File KHÔNG khớp bản gốc</p>
                    <p className="text-[12px] text-red-700 mt-1 leading-relaxed">
                        Hash của file này chưa từng được đăng ký trên blockchain. File có thể đã bị chỉnh sửa, hoặc startup chưa đăng ký bản gốc lên blockchain.
                    </p>
                    {fileName && <p className="text-[11px] text-red-600/80 mt-2 truncate">📄 {fileName}</p>}
                </div>
            </div>
        </div>
    );
}
