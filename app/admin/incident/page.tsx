"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Flame, Plus, RotateCcw, RefreshCw, Loader2,
    AlertTriangle, CheckCircle2, X,
} from "lucide-react";
import { GetIncidents, CreateIncident, RollbackIncident, type IncidentRes } from "@/services/admin/admin.api";

/* ─── Severity helpers ──────────────────────────────────── */
const SEVERITY_LABELS: Record<string, string> = { "0": "Low", "1": "Medium", "2": "High", "3": "Critical" };
const SEVERITY_BADGE: Record<string, string> = {
    "0": "bg-slate-100 text-slate-600",
    "1": "bg-blue-100 text-blue-700",
    "2": "bg-amber-100 text-amber-700",
    "3": "bg-red-100 text-red-600",
};

function sevLabel(s: string) { return SEVERITY_LABELS[s] || s; }
function sevBadge(s: string) { return SEVERITY_BADGE[s] || "bg-slate-100 text-slate-600"; }

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminIncidentPage() {
    const [incidents, setIncidents] = useState<IncidentRes[]>([]);
    const [loading, setLoading] = useState(true);

    /* Create modal */
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ title: "", description: "", severity: 2 });
    const [creating, setCreating] = useState(false);

    /* Rollback modal */
    const [rollbackTarget, setRollbackTarget] = useState<IncidentRes | null>(null);
    const [rollbackNotes, setRollbackNotes] = useState("");
    const [rollingBack, setRollingBack] = useState(false);

    const fetchIncidents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GetIncidents() as unknown as IBackendRes<IncidentRes[]>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                setIncidents(res.data);
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

    const handleCreate = async () => {
        if (!createForm.title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
        setCreating(true);
        try {
            const res = await CreateIncident(createForm) as unknown as IBackendRes<IncidentRes>;
            if ((res?.isSuccess || res?.success)) {
                toast.success("Tạo incident thành công");
                setShowCreate(false);
                setCreateForm({ title: "", description: "", severity: 2 });
                fetchIncidents();
            } else {
                toast.error(res?.message || "Tạo thất bại");
            }
        } catch { toast.error("Lỗi hệ thống"); }
        finally { setCreating(false); }
    };

    const handleRollback = async () => {
        if (!rollbackTarget || !rollbackNotes.trim()) { toast.error("Vui lòng nhập ghi chú rollback"); return; }
        setRollingBack(true);
        try {
            const res = await RollbackIncident(rollbackTarget.incidentId, { rollbackNotes }) as unknown as IBackendRes<string>;
            if ((res?.isSuccess || res?.success)) {
                toast.success("Rollback thành công");
                setRollbackTarget(null);
                setRollbackNotes("");
                fetchIncidents();
            } else {
                toast.error(res?.message || "Rollback thất bại");
            }
        } catch { toast.error("Lỗi hệ thống"); }
        finally { setRollingBack(false); }
    };

    const openIncidents = incidents.filter(i => i.status !== "Resolved" && !i.isRolledBack);
    const resolvedIncidents = incidents.filter(i => i.status === "Resolved" || i.isRolledBack);

    return (
        <AdminShell>
            <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">

                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">Incident Center</p>
                        <h1 className="text-3xl font-semibold text-slate-950">Incident Response</h1>
                        <p className="max-w-2xl text-sm text-slate-500 mt-2">Ghi nhận, theo dõi và rollback sự cố hệ thống trong thời gian thực.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={fetchIncidents} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors">
                            <Plus className="w-4 h-4" /> Tạo incident
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                )}

                {/* Open Incidents */}
                {!loading && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <Flame className="w-5 h-5 text-red-600" />
                            <h2 className="text-[15px] font-semibold text-slate-900">Open Incidents</h2>
                            <span className="ml-auto text-[12px] font-semibold text-slate-400">{openIncidents.length} mục</span>
                        </div>
                        {openIncidents.length === 0 ? (
                            <div className="px-6 py-8 text-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                                <p className="text-[13px] text-slate-400">Không có sự cố đang mở</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {openIncidents.map(inc => (
                                    <div key={inc.incidentId} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-semibold text-slate-900">{inc.title}</p>
                                            <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{inc.description}</p>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                {new Date(inc.createdAt).toLocaleString("vi-VN")} · by user #{inc.createdBy}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-lg", sevBadge(inc.severity))}>
                                                {sevLabel(inc.severity)}
                                            </span>
                                            <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                                                {inc.status}
                                            </span>
                                            <button
                                                onClick={() => { setRollbackTarget(inc); setRollbackNotes(""); }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 text-[12px] font-semibold hover:bg-amber-50 transition-colors"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Rollback
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Resolved Incidents */}
                {!loading && resolvedIncidents.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-[15px] font-semibold text-slate-900">Resolved</h2>
                            <span className="ml-auto text-[12px] font-semibold text-slate-400">{resolvedIncidents.length} mục</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {resolvedIncidents.map(inc => (
                                <div key={inc.incidentId} className="px-6 py-3 flex items-center gap-3 opacity-70">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-slate-700">{inc.title}</p>
                                        <p className="text-[11px] text-slate-400">
                                            {inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleString("vi-VN") : ""}
                                            {inc.isRolledBack && " · Rolled back"}
                                            {inc.rollbackNotes && ` · ${inc.rollbackNotes}`}
                                        </p>
                                    </div>
                                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-lg", sevBadge(inc.severity))}>
                                        {sevLabel(inc.severity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Create Modal ── */}
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)} />
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[16px] font-bold text-slate-900">Tạo Incident mới</h3>
                                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Tiêu đề *</label>
                                    <input
                                        value={createForm.title}
                                        onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:border-slate-400"
                                        placeholder="VD: Database connection timeout"
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Mô tả</label>
                                    <textarea
                                        value={createForm.description}
                                        onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:border-slate-400 resize-none"
                                        placeholder="Chi tiết sự cố..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Severity</label>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setCreateForm(p => ({ ...p, severity: s }))}
                                                className={cn(
                                                    "flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors",
                                                    createForm.severity === s
                                                        ? sevBadge(String(s)) + " border-current"
                                                        : "border-slate-200 text-slate-400 hover:bg-slate-50"
                                                )}
                                            >
                                                {sevLabel(String(s))}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
                                    Huỷ
                                </button>
                                <button onClick={handleCreate} disabled={creating} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2">
                                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Tạo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Rollback Modal ── */}
                {rollbackTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/30" onClick={() => setRollbackTarget(null)} />
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[16px] font-bold text-slate-900">Rollback Incident</h3>
                                <button onClick={() => setRollbackTarget(null)}><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[13px] font-semibold text-amber-700">{rollbackTarget.title}</p>
                                        <p className="text-[11px] text-amber-600 mt-0.5">{rollbackTarget.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Ghi chú rollback *</label>
                                <textarea
                                    value={rollbackNotes}
                                    onChange={e => setRollbackNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:border-slate-400 resize-none"
                                    placeholder="Lý do rollback, các bước đã thực hiện..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setRollbackTarget(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
                                    Huỷ
                                </button>
                                <button onClick={handleRollback} disabled={rollingBack} className="px-4 py-2 rounded-xl bg-amber-500 text-white text-[13px] font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2">
                                    {rollingBack && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <RotateCcw className="w-4 h-4" /> Rollback
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
