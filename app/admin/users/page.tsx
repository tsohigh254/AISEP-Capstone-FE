"use client";

import { useState, useMemo, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AddUserModal } from "@/components/admin/add-user-modal";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Search, ChevronDown, ChevronLeft, ChevronRight, FilterX,
    Eye, Pencil, Lock, Unlock, MoreHorizontal,
    AlertTriangle, UserPlus,
    Copy, FileText, RefreshCw, X, Loader2,
} from "lucide-react";
import { GetUsers, UpdateUserStatus } from "@/services/admin/admin.api";

/* ─── Types ──────────────────────────────────────────────── */
type SortKey = "newest" | "oldest" | "recent_active" | "least_active" | "alpha";

/* ─── Config ─────────────────────────────────────────────── */
const PAGE_SIZE = 10;

const PRESET_TABS = [
    { key: "all",      label: "Tất cả" },
    { key: "active",   label: "Kích hoạt" },
    { key: "locked",   label: "Bị khoá" },
];

/* ─── Helpers ─────────────────────────────────────────────── */
function relativeTime(dateStr: string, nowMs: number) {
    if (!dateStr) return "—";
    const diff = nowMs - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "Hôm nay";
    if (d === 1) return "Hôm qua";
    if (d < 30) return `${d} ngày trước`;
    if (d < 365) return `${Math.floor(d / 30)} tháng trước`;
    return `${Math.floor(d / 365)} năm trước`;
}

function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getInitials(email: string) {
    const name = email.split("@")[0];
    return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
    "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
];
function avatarColor(str: string) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/* ─── Sub-components ─────────────────────────────────────── */
function ActiveBadge({ isActive }: { isActive: boolean }) {
    return isActive ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-400" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border bg-red-50 text-red-600 border-red-200/80">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-400" />
            Locked
        </span>
    );
}

function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                            <div className={cn("h-3 bg-slate-100 rounded-full animate-pulse", j === 0 ? "w-8" : j === 1 ? "w-40" : "w-16")} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

/* ─── Confirm Modal ──────────────────────────────────────── */
function ConfirmLockModal({ user, onConfirm, onCancel, loading: submitting }: {
    user: IUser; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
    const isLocking = user.isActive;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-[420px] mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-4", isLocking ? "bg-red-50" : "bg-emerald-50")}>
                    {isLocking ? <Lock className="w-5 h-5 text-red-500" /> : <Unlock className="w-5 h-5 text-emerald-600" />}
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-1">
                    {isLocking ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                </h3>
                <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
                    {isLocking
                        ? "Tài khoản này sẽ bị khoá và không thể đăng nhập cho đến khi được mở lại."
                        : "Tài khoản này sẽ được mở khoá và có thể đăng nhập lại."
                    }
                </p>
                <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Email</span>
                        <span className="text-[12px] font-mono text-slate-600">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">ID</span>
                        <span className="text-[12px] font-mono text-slate-500">#{user.userId}</span>
                    </div>
                </div>
                {isLocking && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 mb-5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-amber-700">Hành động này sẽ ngắt phiên đăng nhập hiện tại của người dùng.</p>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className={cn(
                            "flex-1 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-2",
                            isLocking ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"
                        )}
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLocking ? "Khoá tài khoản" : "Mở khoá"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function AdminUsersPage() {
    return (
        <Suspense>
            <AdminUsersContent />
        </Suspense>
    );
}

function AdminUsersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [nowMs] = useState(() => Date.now());

    // Modal state
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [confirmUser, setConfirmUser] = useState<IUser | null>(null);
    const [moreMenuId, setMoreMenuId] = useState<number | null>(null);
    const [lockLoading, setLockLoading] = useState(false);

    // Data state
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state — initialise from URL search params
    const [searchRaw, setSearchRaw] = useState("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
    const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
    const [sortBy, setSortBy] = useState<SortKey>("newest");
    const [page, setPage] = useState(1);

    // Dropdown visibility
    const [showRoleDD, setShowRoleDD] = useState(false);
    const [showSortDD, setShowSortDD] = useState(false);
    const roleDDRef = useRef<HTMLDivElement>(null);
    const sortDDRef = useRef<HTMLDivElement>(null);
    const moreMenuRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GetUsers({ page: 1, pageSize: 500 }) as unknown as IBackendRes<any>;
            if ((res?.isSuccess || res?.success) && res?.data) {
                // Backend returns paged: { page, pageSize, total, data: [...users] }
                const raw = res.data;
                const list = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
                setUsers(list);
            }
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Debounce search
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const handleSearchChange = (v: string) => {
        setSearchRaw(v);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setSearch(v); setPage(1); }, 300);
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (roleDDRef.current?.contains(e.target as Node)) return;
            if (sortDDRef.current?.contains(e.target as Node)) return;
            for (const el of moreMenuRefs.current.values()) {
                if (el?.contains(e.target as Node)) return;
            }
            setShowRoleDD(false);
            setShowSortDD(false);
            setMoreMenuId(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Active filter chips
    const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];
    if (roleFilter) activeFilters.push({ key: "role", label: `Vai trò: ${roleFilter}`, onRemove: () => { setRoleFilter(""); setPage(1); } });
    if (search) activeFilters.push({ key: "search", label: `Tìm: "${search}"`, onRemove: () => { setSearch(""); setSearchRaw(""); setPage(1); } });

    const clearAll = () => { setSearch(""); setSearchRaw(""); setRoleFilter(""); setActiveTab("all"); setPage(1); };

    // Derived: filtered + sorted users
    const filtered = useMemo(() => {
        let list = [...users];

        // Tab preset
        if (activeTab === "active") list = list.filter(u => u.isActive);
        else if (activeTab === "locked") list = list.filter(u => !u.isActive);

        // Filters
        if (search) list = list.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || String(u.userId).includes(search));
        if (roleFilter) list = list.filter(u => u.userType === roleFilter);

        // Sort
        if (sortBy === "newest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        else if (sortBy === "oldest") list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        else if (sortBy === "recent_active") list.sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());
        else if (sortBy === "least_active") list.sort((a, b) => new Date(a.lastLoginAt).getTime() - new Date(b.lastLoginAt).getTime());
        else if (sortBy === "alpha") list.sort((a, b) => a.email.localeCompare(b.email));

        return list;
    }, [users, search, roleFilter, activeTab, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleLockConfirm = async (user: IUser) => {
        setLockLoading(true);
        try {
            const res = await UpdateUserStatus(user.userId, !user.isActive) as unknown as IBackendRes<string>;
            if ((res?.isSuccess || res?.success)) {
                toast.success(user.isActive ? `Đã khoá tài khoản ${user.email}` : `Đã mở khoá ${user.email}`);
                setConfirmUser(null);
                fetchUsers();
            } else {
                toast.error(res?.message || "Thao tác thất bại");
            }
        } catch { toast.error("Lỗi hệ thống"); }
        finally { setLockLoading(false); }
    };

    const SORT_LABELS: Record<SortKey, string> = {
        newest: "Mới tạo nhất", oldest: "Cũ nhất", recent_active: "Hoạt động gần đây",
        least_active: "Ít hoạt động", alpha: "A → Z",
    };

    // Tab → count badge
    const TAB_COUNTS: Record<string, number> = {
        all: users.length,
        active: users.filter(u => u.isActive).length,
        locked: users.filter(u => !u.isActive).length,
    };

    return (
        <AdminShell>
            <div className="px-8 py-7 space-y-5 pb-16 animate-in fade-in duration-400">

                {/* ── Page Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-[20px] font-bold text-slate-900">User Management</h1>
                        <p className="text-[13px] text-slate-400 mt-0.5">Manage user accounts across the AISEP platform</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchUsers} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm"
                        >
                            <UserPlus className="w-4 h-4" />
                            Thêm người dùng
                        </button>
                    </div>
                </div>

                {/* ── Preset Tabs ── */}
                <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-1 w-fit">
                    {PRESET_TABS.map(tab => {
                        const isActive = activeTab === tab.key;
                        const count = TAB_COUNTS[tab.key] ?? 0;
                        const isWarnTab = tab.key === "locked";
                        return (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-[#0f172a] text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={cn(
                                        "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none",
                                        isActive
                                            ? "bg-white/20 text-white"
                                            : isWarnTab
                                                ? "bg-red-100 text-red-600"
                                                : "bg-slate-100 text-slate-500"
                                    )}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 flex flex-col lg:flex-row items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Tìm theo email, ID..."
                            className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all"
                            value={searchRaw}
                            onChange={e => handleSearchChange(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto">
                        {/* Role filter */}
                        <div className="relative" ref={roleDDRef}>
                            <button
                                onClick={() => { setShowRoleDD(!showRoleDD); setShowSortDD(false); }}
                                className="h-10 px-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-all min-w-[110px] justify-between"
                            >
                                <span className="truncate">{roleFilter || "Vai trò"}</span>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform", showRoleDD && "rotate-180")} />
                            </button>
                            {showRoleDD && (
                                <div className="absolute top-full mt-1.5 left-0 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 min-w-[160px] z-50">
                                    {["", "Startup", "Investor", "Advisor", "Admin", "Staff"].map(v => (
                                        <button key={v} onClick={() => { setRoleFilter(v); setShowRoleDD(false); setPage(1); }}
                                            className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-slate-50 transition-colors", roleFilter === v ? "text-[#b8902e] font-semibold" : "text-slate-600")}>
                                            {v || "Tất cả vai trò"}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sort */}
                        <div className="relative" ref={sortDDRef}>
                            <button
                                onClick={() => { setShowSortDD(!showSortDD); setShowRoleDD(false); }}
                                className="h-10 px-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-all min-w-[160px] justify-between"
                            >
                                <span className="truncate">{SORT_LABELS[sortBy]}</span>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform", showSortDD && "rotate-180")} />
                            </button>
                            {showSortDD && (
                                <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 min-w-[190px] z-50">
                                    {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([k, label]) => (
                                        <button key={k} onClick={() => { setSortBy(k); setShowSortDD(false); }}
                                            className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-slate-50", sortBy === k ? "text-[#b8902e] font-semibold" : "text-slate-600")}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {activeFilters.length > 0 && (
                            <button onClick={clearAll}
                                className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-[12px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 transition-all">
                                <FilterX className="w-3.5 h-3.5" />
                                Xoá lọc
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Active Filter Chips ── */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {activeFilters.map(f => (
                            <span key={f.key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf8e6] border border-[#eec54e]/30 text-[12px] font-medium text-[#b8902e]">
                                {f.label}
                                <button onClick={f.onRemove} className="hover:text-red-500 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">ID</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vai trò</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hoạt động cuối</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <TableSkeleton />
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                    <Search className="w-5 h-5 text-slate-300" />
                                                </div>
                                                <p className="text-[13px] font-medium text-slate-400">Không tìm thấy người dùng nào</p>
                                                {activeFilters.length > 0 && (
                                                    <button onClick={clearAll} className="text-[12px] text-[#b8902e] hover:underline font-medium">
                                                        Xoá bộ lọc để xem tất cả
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map(user => {
                                        const isAdmin = user.userType === "Admin";
                                        return (
                                            <tr
                                                key={user.userId}
                                                onClick={() => { router.push(`/admin/users/${user.userId}`); }}
                                                className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <span className="text-[11px] font-mono text-slate-400">#{user.userId}</span>
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("size-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-bold shrink-0", avatarColor(user.email))}>
                                                            {getInitials(user.email)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-semibold text-slate-700 group-hover:text-[#b8902e] transition-colors truncate">{user.email}</p>
                                                            <p className="text-[11px] text-slate-400 truncate">
                                                                {user.emailVerified ? "Email verified" : "Not verified"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                                        {user.userType}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3.5 text-center">
                                                    <ActiveBadge isActive={user.isActive} />
                                                </td>

                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="text-[12px] text-slate-500">{relativeTime(user.lastLoginAt, nowMs)}</span>
                                                </td>

                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="text-[12px] text-slate-400">{formatDate(user.createdAt)}</span>
                                                </td>

                                                <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => { router.push(`/admin/users/${user.userId}`); }}
                                                            title="Xem chi tiết"
                                                            className="size-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-[#b8902e] hover:bg-[#fdf8e6] hover:border-[#eec54e]/30 transition-all"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedUserId(user.userId); setEditModalOpen(true); }}
                                                            title={isAdmin ? "Không thể chỉnh sửa Admin" : "Chỉnh sửa"}
                                                            disabled={isAdmin}
                                                            className={cn(
                                                                "size-8 flex items-center justify-center rounded-lg border transition-all",
                                                                isAdmin ? "border-slate-100 text-slate-200 cursor-not-allowed bg-slate-50" : "border-slate-200 bg-white text-slate-400 hover:text-[#b8902e] hover:bg-[#fdf8e6] hover:border-[#eec54e]/30"
                                                            )}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => !isAdmin && setConfirmUser(user)}
                                                            title={isAdmin ? "Không thể khoá Admin" : user.isActive ? "Khoá tài khoản" : "Mở khoá"}
                                                            disabled={isAdmin}
                                                            className={cn(
                                                                "size-8 flex items-center justify-center rounded-lg border transition-all",
                                                                isAdmin ? "border-slate-100 text-slate-200 cursor-not-allowed bg-slate-50"
                                                                    : user.isActive ? "border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200"
                                                                    : "border-slate-200 bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                                                            )}
                                                        >
                                                            {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                                        </button>

                                                        {/* More menu */}
                                                        <div className="relative" ref={el => { if (el) moreMenuRefs.current.set(user.userId, el); else moreMenuRefs.current.delete(user.userId); }}>
                                                            <button
                                                                onClick={() => setMoreMenuId(moreMenuId === user.userId ? null : user.userId)}
                                                                className="size-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                                            >
                                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                                            </button>
                                                            {moreMenuId === user.userId && (
                                                                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200/80 shadow-lg py-1.5 min-w-[180px] z-50">
                                                                    <button
                                                                        onClick={() => { router.push(`/admin/audit-logs?userId=${user.userId}`); setMoreMenuId(null); }}
                                                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    >
                                                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                                        View Audit Trail
                                                                    </button>
                                                                    <div className="my-1 border-t border-slate-100" />
                                                                    <button
                                                                        onClick={() => { navigator.clipboard?.writeText(String(user.userId)); toast.success("Đã copy User ID"); setMoreMenuId(null); }}
                                                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    >
                                                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                                                        Copy User ID
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filtered.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[12px] text-slate-400">
                                {filtered.length} người dùng · trang {page}/{totalPages}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                    className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                                    return (
                                        <button key={p} onClick={() => setPage(p)}
                                            className={cn("size-8 rounded-lg text-[12px] font-semibold transition-all",
                                                page === p ? "bg-[#0f172a] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            )}>
                                            {p}
                                        </button>
                                    );
                                })}
                                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                                    className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Lock Modal */}
            {confirmUser && (
                <ConfirmLockModal
                    user={confirmUser}
                    loading={lockLoading}
                    onConfirm={() => handleLockConfirm(confirmUser)}
                    onCancel={() => setConfirmUser(null)}
                />
            )}

            {/* Existing modals */}
            <AddUserModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={() => { setAddModalOpen(false); fetchUsers(); }} />
            <EditUserModal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setSelectedUserId(null); }} onSaved={() => { setEditModalOpen(false); setSelectedUserId(null); fetchUsers(); }} userId={selectedUserId} />
        </AdminShell>
    );
}
