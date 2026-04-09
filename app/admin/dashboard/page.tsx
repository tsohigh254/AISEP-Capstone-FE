"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { cn } from "@/lib/utils";
import {
    Users, AlertTriangle, Flame, RefreshCw, ArrowRight,
    FileText, Activity, ChevronRight, ShieldCheck,
    LayoutDashboard, X, CheckCircle2, Database,
    Briefcase, UserCheck, Clock, Flag,
} from "lucide-react";
import { GetSystemHealth, GetAuditLogs, type SystemHealthRes } from "@/services/admin/admin.api";

/* ─── Types ──────────────────────────────────────────────── */
type Status = "healthy" | "warning" | "critical" | "unknown";
type SectionState = "ready" | "loading" | "empty" | "error";

/* ─── Helpers ─────────────────────────────────────────────── */
const STATUS_CFG: Record<Status, { dot: string; badge: string; label: string }> = {
    healthy:  { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", label: "Healthy"  },
    warning:  { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200/80",       label: "Warning"  },
    critical: { dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border-red-200/80",             label: "Critical" },
    unknown:  { dot: "bg-slate-300",   badge: "bg-slate-50 text-slate-500 border-slate-200/80",       label: "Unknown"  },
};

function StatusBadge({ status }: { status: Status }) {
    const cfg = STATUS_CFG[status];
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
            {cfg.label}
        </span>
    );
}

/* ─── SectionWrapper ──────────────────────────────────────── */
function SectionWrapper({ state, onRetry, emptyMsg, children }: {
    state: SectionState; onRetry?: () => void; emptyMsg?: string; children: React.ReactNode;
}) {
    if (state === "loading") return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 animate-pulse">
            <div className="space-y-3">
                <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2" />
            </div>
        </div>
    );
    if (state === "empty") return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center justify-center text-center">
            <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[13px] font-medium text-slate-400">{emptyMsg || "Không có dữ liệu"}</p>
        </div>
    );
    if (state === "error") return (
        <div className="bg-white rounded-2xl border border-red-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center justify-center text-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-[13px] text-red-500">Không tải được dữ liệu</p>
            {onRetry && (
                <button onClick={onRetry} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-[12px] font-medium hover:bg-red-50 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                </button>
            )}
        </div>
    );
    return <>{children}</>;
}

/* ─── Quick Access (only existing pages) ─────────────────── */
const QUICK_ACCESS = [
    { label: "Người dùng",          icon: Users,        href: "/admin/users",              desc: "Quản lý tài khoản"    },
    { label: "Vai trò & Quyền",     icon: ShieldCheck,  href: "/admin/roles-permissions",  desc: "Phân quyền hệ thống"  },
    { label: "Audit Logs",          icon: FileText,     href: "/admin/audit-logs",         desc: "Lịch sử hoạt động"    },
    { label: "Incident Center",     icon: Flame,        href: "/admin/incident",           desc: "Xử lý sự cố"          },
];

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
    const router = useRouter();
    const [bannerVisible, setBannerVisible] = useState(true);
    const [health, setHealth] = useState<SystemHealthRes | null>(null);
    const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
    const [healthState, setHealthState] = useState<SectionState>("loading");
    const [auditState, setAuditState] = useState<SectionState>("loading");

    const fetchHealth = useCallback(async () => {
        setHealthState("loading");
        try {
            const res = await GetSystemHealth() as unknown as IBackendRes<SystemHealthRes>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                setHealth(res.data);
                setHealthState("ready");
            } else {
                setHealthState("error");
            }
        } catch {
            setHealthState("error");
        }
    }, []);

    const fetchAudit = useCallback(async () => {
        setAuditState("loading");
        try {
            const res = await GetAuditLogs({ page: 1, pageSize: 5 }) as unknown as IBackendRes<any>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                // Backend returns { page, pageSize, total, data: [...] }
                const items = res.data.items ?? res.data.data ?? [];
                setAuditLogs(items);
                setAuditState(items.length ? "ready" : "empty");
            } else {
                setAuditState("error");
            }
        } catch {
            setAuditState("error");
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        fetchAudit();
    }, [fetchHealth, fetchAudit]);

    /* Build health cards from real data */
    const healthCards = health ? [
        { id: "users",      icon: Users,         label: "Tổng người dùng",     value: String(health.totalUsers),      sub: `${health.totalStartups} startup, ${health.totalInvestors} investor`, status: "healthy"  as Status, href: "/admin/users" },
        { id: "startups",   icon: Briefcase,     label: "Startups",            value: String(health.totalStartups),   sub: "đã đăng ký",            status: "healthy"  as Status, href: "/admin/users" },
        { id: "investors",  icon: UserCheck,      label: "Investors",           value: String(health.totalInvestors),  sub: "đã đăng ký",            status: "healthy"  as Status, href: "/admin/users" },
        { id: "advisors",   icon: ShieldCheck,   label: "Advisors",            value: String(health.totalAdvisors),   sub: "đã đăng ký",            status: "healthy"  as Status, href: "/admin/users" },
        { id: "pending",    icon: Clock,         label: "Chờ duyệt",          value: String(health.pendingApprovals),sub: "cần xem xét",            status: health.pendingApprovals > 0 ? "warning" as Status : "healthy" as Status, href: "/admin/users" },
        { id: "incidents",  icon: Flame,         label: "Sự cố đang mở",      value: String(health.openIncidents),   sub: "cần xử lý",             status: health.openIncidents > 0 ? "critical" as Status : "healthy" as Status, href: "/admin/incident" },
        { id: "flags",      icon: Flag,          label: "Vi phạm chưa xử lý", value: String(health.unresolvedFlags), sub: "báo cáo",                status: health.unresolvedFlags > 0 ? "warning" as Status : "healthy" as Status, href: "/admin/incident" },
        { id: "database",   icon: Database,      label: "Database",            value: health.databaseConnected ? "Connected" : "Disconnected", sub: new Date(health.checkedAt).toLocaleTimeString("vi-VN"), status: health.databaseConnected ? "healthy" as Status : "critical" as Status, href: "/admin/dashboard" },
    ] : [];

    return (
        <AdminShell>
            <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">

                {/* ── System Banner (dismissible) ── */}
                {bannerVisible && health && !health.databaseConnected && (
                    <div className="rounded-2xl border-2 border-red-200 bg-red-50/60 px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                            <div>
                                <p className="text-[13px] font-semibold text-red-700">Database không kết nối được</p>
                                <p className="text-[11px] text-red-600 mt-0.5">Kiểm tra lại kết nối PostgreSQL.</p>
                            </div>
                        </div>
                        <button onClick={() => setBannerVisible(false)} className="text-red-400 hover:text-red-600 transition-colors shrink-0 ml-4">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── System Health Overview ── */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-400" />
                            System Health
                        </h2>
                        <button onClick={() => { fetchHealth(); fetchAudit(); }} className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                    </div>
                    <SectionWrapper state={healthState} onRetry={fetchHealth}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {healthCards.map(card => {
                                const Icon = card.icon;
                                const cfg = STATUS_CFG[card.status];
                                return (
                                    <button
                                        key={card.id}
                                        onClick={() => router.push(card.href)}
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                                <Icon className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className={cn(
                                                "w-2 h-2 rounded-full mt-1 shrink-0",
                                                cfg.dot,
                                                card.status !== "healthy" && "animate-pulse"
                                            )} />
                                        </div>
                                        <p className="text-[20px] font-bold text-slate-900 leading-none mb-1">{card.value}</p>
                                        <p className="text-[12px] font-medium text-slate-500">{card.label}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </SectionWrapper>
                </div>

                {/* ── Recent Audit + Quick Access (2 col) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Recent Audit Activity */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                Recent Audit Activity
                            </h2>
                            <button onClick={() => router.push("/admin/audit-logs")} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
                                Xem tất cả <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <SectionWrapper state={auditState} onRetry={fetchAudit} emptyMsg="Chưa có audit log nào">
                            <div className="divide-y divide-slate-50">
                                {auditLogs.map((log) => (
                                    <div key={log.logId} className="px-6 py-3 flex items-center gap-3">
                                        <span className="text-[11px] text-slate-400 font-mono w-14 shrink-0">
                                            {new Date(log.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-semibold text-slate-700">{log.actionType}</p>
                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                {log.userEmail || "system"} → {log.entityType}{log.entityId ? `#${log.entityId}` : ""}
                                            </p>
                                        </div>
                                        <StatusBadge status="healthy" />
                                    </div>
                                ))}
                            </div>
                        </SectionWrapper>
                    </div>

                    {/* Quick Access */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                                Quick Access
                            </h2>
                        </div>
                        <div className="p-3 space-y-0.5">
                            {QUICK_ACCESS.map((qa, i) => {
                                const Icon = qa.icon;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => router.push(qa.href)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                    >
                                        <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-[#fdf8e6] transition-colors">
                                            <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#b8902e] transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium text-slate-700">{qa.label}</p>
                                            <p className="text-[11px] text-slate-400">{qa.desc}</p>
                                        </div>
                                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </AdminShell>
    );
}
