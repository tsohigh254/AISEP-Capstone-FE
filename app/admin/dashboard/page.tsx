"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { cn } from "@/lib/utils";
import {
    Users, AlertTriangle, Flame, RefreshCw, ArrowRight,
    FileText, Activity, ChevronRight, ShieldCheck,
    LayoutDashboard, CheckCircle2,
    Briefcase, UserCheck, Lock,
} from "lucide-react";
import { GetUsers, GetAuditLogs } from "@/services/admin/admin.api";

/* --- Types --------------------------------------------------- */
type SectionState = "ready" | "loading" | "empty" | "error";

interface UserStats {
    total: number;
    startups: number;
    investors: number;
    advisors: number;
    staff: number;
    locked: number;
}

/* --- SectionWrapper ------------------------------------------ */
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

/* --- Quick Access -------------------------------------------- */
const QUICK_ACCESS = [
    { label: "Người dùng",          icon: Users,        href: "/admin/users",              desc: "Quản lý tài khoản"    },
    { label: "Vai trò & Quyền",     icon: ShieldCheck,  href: "/admin/roles-permissions",  desc: "Phân quyền hệ thống"  },
    { label: "Audit Logs",          icon: FileText,     href: "/admin/audit-logs",         desc: "Lịch sử hoạt động"    },
    { label: "Incident Center",     icon: Flame,        href: "/admin/incident",           desc: "Xử lý sự cố"          },
];

/* --- Page ---------------------------------------------------- */
export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
    const [statsState, setStatsState] = useState<SectionState>("loading");
    const [auditState, setAuditState] = useState<SectionState>("loading");

    const fetchStats = useCallback(async () => {
        setStatsState("loading");
        try {
            const res = await GetUsers({ page: 1, pageSize: 9999 }) as unknown as IBackendRes<any>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                const raw = res.data;
                const list: IUser[] = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
                setStats({
                    total: list.length,
                    startups: list.filter(u => u.userType === "Startup").length,
                    investors: list.filter(u => u.userType === "Investor").length,
                    advisors: list.filter(u => u.userType === "Advisor").length,
                    staff: list.filter(u => u.userType === "Staff").length,
                    locked: list.filter(u => !u.isActive).length,
                });
                setStatsState("ready");
            } else {
                setStatsState("error");
            }
        } catch {
            setStatsState("error");
        }
    }, []);

    const fetchAudit = useCallback(async () => {
        setAuditState("loading");
        try {
            const res = await GetAuditLogs({ page: 1, pageSize: 5 }) as unknown as IBackendRes<any>;
            if ((res?.isSuccess || res?.success) && res?.data) {
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
        fetchStats();
        fetchAudit();
    }, [fetchStats, fetchAudit]);

    const statCards = stats ? [
        { id: "users",     icon: Users,      label: "Tổng người dùng", value: stats.total,     sub: `${stats.startups} startup, ${stats.investors} investor`, href: "/admin/users" },
        { id: "startups",  icon: Briefcase,   label: "Startups",        value: stats.startups,  sub: "tài khoản startup",  href: "/admin/users?role=Startup" },
        { id: "investors", icon: UserCheck,    label: "Investors",       value: stats.investors, sub: "tài khoản investor", href: "/admin/users?role=Investor" },
        { id: "advisors",  icon: ShieldCheck, label: "Advisors",        value: stats.advisors,  sub: "tài khoản advisor",  href: "/admin/users?role=Advisor" },
        { id: "staff",     icon: Users,       label: "Staff",           value: stats.staff,     sub: "tài khoản staff",    href: "/admin/users?role=Staff" },
        { id: "locked",    icon: Lock,        label: "Bị khoá",        value: stats.locked,    sub: "tài khoản bị khoá",  href: "/admin/users?tab=locked" },
    ] : [];

    return (
        <AdminShell>
            <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">

                {/* -- Overview Stats -- */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-400" />
                            Tổng quan
                        </h2>
                        <button onClick={() => { fetchStats(); fetchAudit(); }} className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                    </div>
                    <SectionWrapper state={statsState} onRetry={fetchStats}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {statCards.map(card => {
                                const Icon = card.icon;
                                const isWarn = card.id === "locked" && card.value > 0;
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
                                            {isWarn && <span className="w-2 h-2 rounded-full mt-1 shrink-0 bg-red-400 animate-pulse" />}
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

                {/* -- Recent Audit + Quick Access (2 col) -- */}
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
