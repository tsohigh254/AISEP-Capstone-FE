"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { cn } from "@/lib/utils";
import {
    Users, Lock, ShieldAlert, Cpu, Link2, Database, Globe,
    AlertTriangle, Flame, RefreshCw, ArrowRight,
    FileText, Activity, ChevronRight, Settings, ShieldCheck,
    LayoutDashboard, Zap, LockOpen, Workflow, Flag, X, CheckCircle2,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
type Status = "healthy" | "warning" | "critical" | "unknown";
type Priority = "critical" | "high" | "medium" | "low";
type SectionState = "ready" | "loading" | "empty" | "error";

/* ─── Mock Data ──────────────────────────────────────────── */
const HEALTH_CARDS = [
    { id: "users",      icon: Users,        label: "Tổng người dùng",    value: "1,284",   sub: "+12 hôm nay",     status: "healthy"  as Status, href: "/admin/users"      },
    { id: "locked",     icon: Lock,         label: "Tài khoản bị khoá",  value: "3",       sub: "cần xem xét",     status: "warning"  as Status, href: "/admin/users?status=locked" },
    { id: "roles",      icon: ShieldCheck,  label: "Active Roles",       value: "12",      sub: "3 thay đổi gần đây", status: "healthy" as Status, href: "/admin/roles"    },
    { id: "ai",         icon: Cpu,          label: "AI Service",         value: "99.8%",   sub: "uptime 30 ngày",  status: "healthy"  as Status, href: "/admin/monitoring"  },
    { id: "blockchain", icon: Link2,        label: "Blockchain Node",    value: "Online",  sub: "sync 100%",       status: "healthy"  as Status, href: "/admin/blockchain"  },
    { id: "database",   icon: Database,     label: "Database",           value: "Healthy", sub: "latency 12ms",    status: "healthy"  as Status, href: "/admin/monitoring"  },
    { id: "api",        icon: Globe,        label: "API Gateway",        value: "Degraded",sub: "p95 >2s",         status: "warning"  as Status, href: "/admin/monitoring"  },
    { id: "alerts",     icon: AlertTriangle,label: "Open Alerts",        value: "5",       sub: "2 critical",      status: "warning"  as Status, href: "/admin/monitoring"  },
    { id: "incidents",  icon: Flame,        label: "Incidents",          value: "1",       sub: "đang xử lý",      status: "critical" as Status, href: "/admin/incident"    },
];

const GOV_CARDS = [
    { label: "Chờ duyệt tài khoản",    value: 7,  icon: Users,        color: "text-blue-600",    bg: "bg-blue-50",    href: "/admin/users"    },
    { label: "Khoá trong 24h qua",      value: 2,  icon: Lock,         color: "text-amber-600",   bg: "bg-amber-50",   href: "/admin/users?status=locked" },
    { label: "Báo cáo leo thang",       value: 3,  icon: ShieldAlert,  color: "text-red-600",     bg: "bg-red-50",     href: "/admin/incident" },
    { label: "Role thay đổi gần đây",   value: 5,  icon: ShieldCheck,  color: "text-violet-600",  bg: "bg-violet-50",  href: "/admin/roles"    },
    { label: "Yêu cầu mở khoá",        value: 4,  icon: LockOpen,     color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/users"    },
    { label: "Workflow chờ duyệt",      value: 2,  icon: Workflow,     color: "text-indigo-600",  bg: "bg-indigo-50",  href: "/admin/workflow" },
];

const PRIORITY_ACTIONS = [
    { type: "Tài khoản bị khoá",   subject: "user.nguyen@startup.vn",    priority: "critical" as Priority, time: "2 giờ trước",  href: "/admin/users"    },
    { type: "Báo cáo leo thang",   subject: "Startup Alpha – vi phạm",   priority: "critical" as Priority, time: "3 giờ trước",  href: "/admin/incident" },
    { type: "API Gateway chậm",    subject: "p95 latency >2s",           priority: "high"     as Priority, time: "5 giờ trước",  href: "/admin/monitoring"},
    { type: "Role thay đổi",       subject: "advisor_role – thêm quyền", priority: "high"     as Priority, time: "6 giờ trước",  href: "/admin/roles"    },
    { type: "Yêu cầu mở khoá",     subject: "investor.tran@fund.com",    priority: "medium"   as Priority, time: "8 giờ trước",  href: "/admin/users"    },
];

const MONITORS = [
    { label: "AI Service",       uptime: "99.8%", latency: "142ms", status: "healthy"  as Status, icon: Cpu      },
    { label: "Blockchain Node",  uptime: "100%",  latency: "38ms",  status: "healthy"  as Status, icon: Link2    },
    { label: "Database",         uptime: "99.9%", latency: "12ms",  status: "healthy"  as Status, icon: Database },
    { label: "API Gateway",      uptime: "97.2%", latency: "2.1s",  status: "warning"  as Status, icon: Globe    },
];

const AUDIT_ROWS = [
    { time: "10:32",     actor: "admin@aisep.vn",     action: "LOCK_USER",         target: "user.abc@mail.com",    severity: "warning"  as Status },
    { time: "09:15",     actor: "system",              action: "AI_EVAL_COMPLETED", target: "Startup Beta",         severity: "healthy"  as Status },
    { time: "08:47",     actor: "admin@aisep.vn",     action: "ROLE_ASSIGNED",     target: "advisor_role → tuan",  severity: "healthy"  as Status },
    { time: "08:21",     actor: "system",              action: "BLOCKCHAIN_SYNC",   target: "Block #198432",        severity: "healthy"  as Status },
    { time: "Yesterday", actor: "admin@aisep.vn",     action: "USER_CREATED",      target: "newuser@startup.vn",   severity: "healthy"  as Status },
];

const QUICK_ACCESS = [
    { label: "Người dùng",          icon: Users,        href: "/admin/users",       desc: "Quản lý tài khoản"    },
    { label: "Vai trò & Quyền",     icon: ShieldCheck,  href: "/admin/roles",       desc: "Phân quyền hệ thống"  },
    { label: "Cài đặt hệ thống",    icon: Settings,     href: "/admin/settings",    desc: "Cấu hình nền tảng"    },
    { label: "Audit Logs",          icon: FileText,     href: "/admin/audit-logs",  desc: "Lịch sử hoạt động"    },
    { label: "Incident Center",     icon: Flame,        href: "/admin/incident",    desc: "Xử lý sự cố"          },
    { label: "AI Configuration",    icon: Cpu,          href: "/admin/ai-config",   desc: "Cấu hình mô hình AI"  },
    { label: "Blockchain Config",   icon: Link2,        href: "/admin/blockchain",  desc: "Cấu hình blockchain"  },
    { label: "Security Config",     icon: ShieldCheck,  href: "/admin/security",    desc: "Bảo mật hệ thống"     },
    { label: "Workflow Management", icon: Workflow,     href: "/admin/workflow",    desc: "Quản lý quy trình"    },
    { label: "Escalated Reports",   icon: Flag,         href: "/admin/escalated",   desc: "Báo cáo leo thang"    },
];

/* ─── Helpers ─────────────────────────────────────────────── */
const STATUS_CFG: Record<Status, { dot: string; badge: string; label: string }> = {
    healthy:  { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", label: "Healthy"  },
    warning:  { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200/80",       label: "Warning"  },
    critical: { dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border-red-200/80",             label: "Critical" },
    unknown:  { dot: "bg-slate-300",   badge: "bg-slate-50 text-slate-500 border-slate-200/80",       label: "Unknown"  },
};

const PRIORITY_CFG: Record<Priority, { badge: string; label: string }> = {
    critical: { badge: "bg-red-50 text-red-600 border border-red-200/80",           label: "Critical" },
    high:     { badge: "bg-amber-50 text-amber-700 border border-amber-200/80",     label: "High"     },
    medium:   { badge: "bg-blue-50 text-blue-700 border border-blue-200/80",        label: "Medium"   },
    low:      { badge: "bg-slate-50 text-slate-500 border border-slate-200/80",     label: "Low"      },
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

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
    const router = useRouter();

    const [bannerVisible, setBannerVisible] = useState(true);

    const [sectionStates] = useState<Record<string, SectionState>>({
        health: "ready",
        governance: "ready",
        actions: "ready",
        monitoring: "ready",
        audit: "ready",
        quickAccess: "ready",
    });

    return (
        <AdminShell>
            <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">

                {/* ── System Banner (dismissible) ── */}
                {bannerVisible && (
                    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-[13px] font-semibold text-amber-700">Bảo trì hệ thống định kỳ</p>
                                <p className="text-[11px] text-amber-600 mt-0.5">Hệ thống sẽ bảo trì vào Chủ nhật 02:00–04:00. Một số dịch vụ có thể bị gián đoạn.</p>
                            </div>
                        </div>
                        <button onClick={() => setBannerVisible(false)} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0 ml-4">
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
                        <button onClick={() => router.push("/admin/monitoring")} className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
                            Xem monitoring <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <SectionWrapper state={sectionStates["health"]} onRetry={() => {}}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {HEALTH_CARDS.map(card => {
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

                {/* ── Governance Summary ── */}
                <div>
                    <div className="flex items-center mb-4">
                        <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                            Governance Summary
                        </h2>
                    </div>
                    <SectionWrapper state={sectionStates["governance"]} onRetry={() => {}}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {GOV_CARDS.map((card, i) => {
                                const Icon = card.icon;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => router.push(card.href)}
                                        className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 text-left hover:shadow-md hover:border-slate-300 transition-all group flex items-center gap-3"
                                    >
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", card.bg)}>
                                            <Icon className={cn("w-4.5 h-4.5", card.color)} style={{ width: 18, height: 18 }} />
                                        </div>
                                        <div>
                                            <p className="text-[20px] font-bold text-slate-900 leading-none">{card.value}</p>
                                            <p className="text-[12px] font-medium text-slate-500 mt-0.5 leading-tight">{card.label}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </SectionWrapper>
                </div>

                {/* ── Priority Actions + Service Health (2 col) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Priority Actions */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-slate-400" />
                                Priority Actions
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-semibold border border-red-200/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                {PRIORITY_ACTIONS.filter(a => a.priority === "critical").length} critical
                            </span>
                        </div>
                        <SectionWrapper state={sectionStates["actions"]} onRetry={() => {}}>
                            <div className="divide-y divide-slate-50">
                                {PRIORITY_ACTIONS.map((action, i) => {
                                    const pcfg = PRIORITY_CFG[action.priority];
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => router.push(action.href)}
                                            className="w-full px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50/60 transition-colors text-left group"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-slate-700 truncate">{action.type}</p>
                                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{action.subject}</p>
                                            </div>
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0", pcfg.badge)}>
                                                {pcfg.label}
                                            </span>
                                            <span className="text-[11px] text-slate-300 shrink-0 hidden sm:block">{action.time}</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                                        </button>
                                    );
                                })}
                            </div>
                        </SectionWrapper>
                    </div>

                    {/* Service Health */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-400" />
                                Service Health
                            </h2>
                            <button onClick={() => router.push("/admin/monitoring")} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
                                Xem thêm <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <SectionWrapper state={sectionStates["monitoring"]} onRetry={() => {}}>
                            <div className="divide-y divide-slate-50">
                                {MONITORS.map((m, i) => {
                                    const Icon = m.icon;
                                    return (
                                        <div key={i} className="px-6 py-3.5 flex items-center gap-3">
                                            <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                                <Icon className="w-3.5 h-3.5 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-slate-700">{m.label}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">↑ {m.uptime} · {m.latency}</p>
                                            </div>
                                            <StatusBadge status={m.status} />
                                        </div>
                                    );
                                })}
                            </div>
                        </SectionWrapper>
                    </div>
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
                        <SectionWrapper state={sectionStates["audit"]} onRetry={() => {}}>
                            <div className="divide-y divide-slate-50">
                                {AUDIT_ROWS.map((row, i) => {
                                    const cfg = STATUS_CFG[row.severity];
                                    return (
                                        <div key={i} className="px-6 py-3 flex items-center gap-3">
                                            <span className="text-[11px] text-slate-400 font-mono w-14 shrink-0">{row.time}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-semibold text-slate-700">{row.action}</p>
                                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{row.actor} → {row.target}</p>
                                            </div>
                                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0", cfg.badge)}>
                                                <span className={cn("w-1 h-1 rounded-full", cfg.dot)} />
                                                {cfg.label}
                                            </span>
                                        </div>
                                    );
                                })}
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
                        <SectionWrapper state={sectionStates["quickAccess"]} onRetry={() => {}}>
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
                        </SectionWrapper>
                    </div>
                </div>

            </div>
        </AdminShell>
    );
}
