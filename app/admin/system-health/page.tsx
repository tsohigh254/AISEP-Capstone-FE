"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Activity, Database, Users, Rocket, Briefcase, GraduationCap,
    AlertTriangle, Flag, Clock, RefreshCw, Loader2, Terminal,
    FileText, Play, Pause, ArrowDown,
} from "lucide-react";
import {
    GetSystemHealth, ListLogFiles, ReadLogFile,
    type SystemHealthRes, type LogFileRes, type LogContentRes,
} from "@/services/admin/admin.api";

/* ─── Helpers ──────────────────────────────────────────────── */
function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleString("vi-VN", {
            hour: "2-digit", minute: "2-digit", second: "2-digit",
            day: "2-digit", month: "2-digit", year: "numeric",
        });
    } catch { return iso; }
}

/** Parse Serilog level from a line. Template: `2026-04-15 12:34:56.789 +07:00 [INF] ...` */
function detectLevel(line: string): "ERR" | "WRN" | "INF" | "DBG" | "OTHER" {
    const m = line.match(/\[(ERR|WRN|INF|DBG|FTL|VRB)\]/);
    if (!m) return "OTHER";
    if (m[1] === "ERR" || m[1] === "FTL") return "ERR";
    if (m[1] === "WRN") return "WRN";
    if (m[1] === "DBG" || m[1] === "VRB") return "DBG";
    return "INF";
}

const LEVEL_CLASS: Record<string, string> = {
    ERR: "text-red-300 bg-red-500/10",
    WRN: "text-amber-300 bg-amber-500/10",
    INF: "text-slate-200",
    DBG: "text-slate-400",
    OTHER: "text-slate-500",
};

/* ─── Page ────────────────────────────────────────────────── */
export default function SystemHealthPage() {
    /* Health */
    const [health, setHealth] = useState<SystemHealthRes | null>(null);
    const [loadingHealth, setLoadingHealth] = useState(true);

    /* Log files */
    const [files, setFiles] = useState<LogFileRes[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [selected, setSelected] = useState<string>("");

    /* Log content */
    const [logContent, setLogContent] = useState<LogContentRes | null>(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [tail, setTail] = useState<number>(500);

    /* Filters */
    const [levelFilter, setLevelFilter] = useState<"ALL" | "ERR" | "WRN" | "INF">("ALL");
    const [search, setSearch] = useState("");

    /* Auto refresh */
    const [autoRefresh, setAutoRefresh] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const preRef = useRef<HTMLPreElement | null>(null);

    /* ── Fetchers ──────────────────────────────────────────── */
    const fetchHealth = useCallback(async () => {
        setLoadingHealth(true);
        try {
            const res = await GetSystemHealth() as unknown as IBackendRes<SystemHealthRes>;
            if ((res?.isSuccess || res?.success) && res?.data) setHealth(res.data);
        } catch { /* silent */ }
        finally { setLoadingHealth(false); }
    }, []);

    const fetchFiles = useCallback(async () => {
        setLoadingFiles(true);
        try {
            const res = await ListLogFiles() as unknown as IBackendRes<LogFileRes[]>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                setFiles(res.data);
                if (res.data.length > 0 && !selected) {
                    setSelected(res.data[0].fileName);
                }
            }
        } catch { toast.error("Không tải được danh sách log"); }
        finally { setLoadingFiles(false); }
    }, [selected]);

    const fetchContent = useCallback(async (fileName: string, tailLines: number, silent = false) => {
        if (!fileName) return;
        if (!silent) setLoadingContent(true);
        try {
            const res = await ReadLogFile(fileName, tailLines) as unknown as IBackendRes<LogContentRes>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                setLogContent(res.data);
            } else if (!silent) {
                toast.error(res?.message || "Không đọc được file log");
            }
        } catch { if (!silent) toast.error("Lỗi hệ thống"); }
        finally { if (!silent) setLoadingContent(false); }
    }, []);

    /* ── Effects ──────────────────────────────────────────── */
    useEffect(() => { fetchHealth(); fetchFiles(); }, [fetchHealth, fetchFiles]);

    useEffect(() => {
        if (selected) fetchContent(selected, tail);
    }, [selected, tail, fetchContent]);

    useEffect(() => {
        if (!autoRefresh) {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            return;
        }
        timerRef.current = setInterval(() => {
            if (selected) fetchContent(selected, tail, true);
            fetchHealth();
        }, 5000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [autoRefresh, selected, tail, fetchContent, fetchHealth]);

    /* ── Derived ──────────────────────────────────────────── */
    const filteredLines = useMemo(() => {
        if (!logContent) return [];
        const q = search.trim().toLowerCase();
        return logContent.lines.filter(line => {
            if (levelFilter !== "ALL" && detectLevel(line) !== levelFilter) return false;
            if (q && !line.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [logContent, levelFilter, search]);

    const scrollToBottom = () => {
        if (preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
    };

    useEffect(() => {
        if (autoRefresh) scrollToBottom();
    }, [filteredLines, autoRefresh]);

    /* ── Render ───────────────────────────────────────────── */
    return (
        <AdminShell>
            <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">

                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[13px] font-semibold text-emerald-600 uppercase tracking-[0.24em]">System Health</p>
                        <h1 className="text-3xl font-semibold text-slate-950">Giám sát hệ thống</h1>
                        <p className="max-w-2xl text-sm text-slate-500 mt-2">
                            Trạng thái database, số liệu tổng quan và log thời gian thực từ server.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => { fetchHealth(); fetchFiles(); if (selected) fetchContent(selected, tail); }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" /> Làm mới
                        </button>
                    </div>
                </div>

                {/* Health cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <HealthCard
                        icon={Database}
                        label="Database"
                        value={health?.databaseConnected ? "Kết nối OK" : "Mất kết nối"}
                        tone={health?.databaseConnected ? "ok" : "err"}
                        loading={loadingHealth}
                    />
                    <HealthCard icon={Users} label="Tổng người dùng" value={health?.totalUsers ?? 0} tone="neutral" loading={loadingHealth} />
                    <HealthCard icon={Rocket} label="Startup" value={health?.totalStartups ?? 0} tone="neutral" loading={loadingHealth} />
                    <HealthCard icon={Briefcase} label="Investor" value={health?.totalInvestors ?? 0} tone="neutral" loading={loadingHealth} />
                    <HealthCard icon={GraduationCap} label="Advisor" value={health?.totalAdvisors ?? 0} tone="neutral" loading={loadingHealth} />
                    <HealthCard icon={Clock} label="Chờ duyệt" value={health?.pendingApprovals ?? 0} tone={health && health.pendingApprovals > 0 ? "warn" : "neutral"} loading={loadingHealth} />
                    <HealthCard icon={AlertTriangle} label="Incident mở" value={health?.openIncidents ?? 0} tone={health && health.openIncidents > 0 ? "err" : "ok"} loading={loadingHealth} />
                    <HealthCard icon={Flag} label="Flag chưa xử lý" value={health?.unresolvedFlags ?? 0} tone={health && health.unresolvedFlags > 0 ? "warn" : "ok"} loading={loadingHealth} />
                </div>
                {health?.checkedAt && (
                    <p className="text-[11px] text-slate-400">Cập nhật lúc: {formatDate(health.checkedAt)}</p>
                )}

                {/* Log viewer */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
                        <Terminal className="w-5 h-5 text-slate-700" />
                        <h2 className="text-[15px] font-semibold text-slate-900">Server Logs</h2>
                        <span className="ml-auto text-[12px] font-semibold text-slate-400">
                            {logContent ? `${filteredLines.length}/${logContent.totalLinesReturned} dòng` : ""}
                        </span>
                    </div>

                    {/* Controls */}
                    <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        {/* File */}
                        <div className="md:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                <FileText className="w-3 h-3 inline mr-1" /> File log
                            </label>
                            <select
                                value={selected}
                                onChange={e => setSelected(e.target.value)}
                                disabled={loadingFiles || files.length === 0}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            >
                                {files.length === 0 && <option value="">Không có file</option>}
                                {files.map(f => (
                                    <option key={f.fileName} value={f.fileName}>
                                        {f.fileName} — {formatBytes(f.sizeBytes)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tail */}
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Số dòng cuối</label>
                            <select
                                value={tail}
                                onChange={e => setTail(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            >
                                {[100, 500, 1000, 2000, 5000].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>

                        {/* Level */}
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mức độ</label>
                            <select
                                value={levelFilter}
                                onChange={e => setLevelFilter(e.target.value as "ALL" | "ERR" | "WRN" | "INF")}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="ERR">Error</option>
                                <option value="WRN">Warning</option>
                                <option value="INF">Info</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="md:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tìm kiếm</label>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Lọc theo từ khoá..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            />
                        </div>

                        {/* Auto refresh */}
                        <div className="md:col-span-1">
                            <button
                                onClick={() => setAutoRefresh(v => !v)}
                                title={autoRefresh ? "Đang auto-refresh 5s" : "Bật auto-refresh 5s"}
                                className={cn(
                                    "w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-semibold transition-colors",
                                    autoRefresh
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {autoRefresh ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                {autoRefresh ? "Live" : "Live"}
                            </button>
                        </div>
                    </div>

                    {/* Log viewer body */}
                    <div className="relative bg-slate-950">
                        {loadingContent && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 z-10">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                            </div>
                        )}
                        {!loadingContent && filteredLines.length === 0 && (
                            <div className="py-16 text-center">
                                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                {files.length === 0 ? (
                                    <>
                                        <p className="text-[13px] text-slate-400 font-semibold">Không tìm thấy file log nào</p>
                                        <p className="text-[11px] text-slate-500 mt-1">Kiểm tra endpoint <code className="text-slate-300">/api/admin/logs</code> (BE đã restart chưa?)</p>
                                    </>
                                ) : !logContent ? (
                                    <>
                                        <p className="text-[13px] text-slate-400 font-semibold">Chưa đọc được nội dung file</p>
                                        <p className="text-[11px] text-slate-500 mt-1">Endpoint <code className="text-slate-300">/api/admin/logs/{"{fileName}"}</code> trả về lỗi — xem DevTools Network</p>
                                    </>
                                ) : logContent.totalLinesReturned === 0 ? (
                                    <p className="text-[13px] text-slate-500">File log trống</p>
                                ) : (
                                    <>
                                        <p className="text-[13px] text-slate-500">Không có dòng log nào khớp bộ lọc</p>
                                        <p className="text-[11px] text-slate-600 mt-1">{logContent.totalLinesReturned} dòng gốc · thử bỏ filter level/search</p>
                                    </>
                                )}
                            </div>
                        )}
                        {filteredLines.length > 0 && (
                            <pre
                                ref={preRef}
                                className="font-mono text-[12px] leading-[1.65] max-h-[560px] overflow-auto p-4"
                            >
                                {filteredLines.map((line, i) => {
                                    const lv = detectLevel(line);
                                    return (
                                        <div key={i} className={cn("px-2 py-0.5 rounded", LEVEL_CLASS[lv])}>
                                            <span className="text-slate-600 select-none mr-3">{String(i + 1).padStart(4, " ")}</span>
                                            {line}
                                        </div>
                                    );
                                })}
                            </pre>
                        )}

                        {filteredLines.length > 0 && (
                            <button
                                onClick={scrollToBottom}
                                title="Cuộn xuống cuối"
                                className="absolute bottom-4 right-4 p-2 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-lg"
                            >
                                <ArrowDown className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Footer info */}
                    {logContent && (
                        <div className="px-6 py-3 border-t border-slate-100 text-[11px] text-slate-400 flex flex-wrap gap-4">
                            <span>File: <strong className="text-slate-600">{logContent.fileName}</strong></span>
                            <span>Kích thước: <strong className="text-slate-600">{formatBytes(logContent.sizeBytes)}</strong></span>
                            <span>Sửa lần cuối: <strong className="text-slate-600">{formatDate(logContent.lastModifiedUtc)}</strong></span>
                        </div>
                    )}
                </div>
            </div>
        </AdminShell>
    );
}

/* ─── HealthCard ──────────────────────────────────────────── */
function HealthCard({
    icon: Icon, label, value, tone, loading,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    tone: "ok" | "warn" | "err" | "neutral";
    loading?: boolean;
}) {
    const toneClass: Record<string, string> = {
        ok: "bg-emerald-50 text-emerald-700 border-emerald-100",
        warn: "bg-amber-50 text-amber-700 border-amber-100",
        err: "bg-red-50 text-red-700 border-red-100",
        neutral: "bg-white text-slate-900 border-slate-200",
    };
    const iconTone: Record<string, string> = {
        ok: "text-emerald-500",
        warn: "text-amber-500",
        err: "text-red-500",
        neutral: "text-slate-400",
    };
    return (
        <div className={cn("rounded-xl border p-4 transition-colors", toneClass[tone])}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                <Icon className={cn("w-4 h-4", iconTone[tone])} />
            </div>
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin opacity-50" />
            ) : (
                <p className="text-2xl font-bold">{value}</p>
            )}
        </div>
    );
}
