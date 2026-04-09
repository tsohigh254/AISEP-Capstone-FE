"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminShell } from "@/components/admin/admin-shell";
import {
    ChevronDown, ChevronRight, Loader2, Pencil, Plus,
    Search, Shield, ShieldCheck, Trash2, Users, X,
    CheckSquare, Square, RefreshCw,
} from "lucide-react";
import {
    GetRoles, GetPermissions, GetRoleUsers,
    CreateRole, UpdateRole, DeleteRole,
    AssignPermissionToRole, RemovePermissionFromRole,
    type RoleRes, type PermissionRes,
} from "@/services/admin/admin.api";

/* ─── Types ──────────────────────────────────────────────── */
type TabKey = "roles" | "matrix";
type DrawerMode = "view" | "create" | "edit";

const SYSTEM_ROLES = ["Admin", "Staff", "Startup", "Investor", "Advisor"];

interface UIRole extends RoleRes {
    userCount: number;
    isSystem: boolean;
}

/* ─── Helpers ────────────────────────────────────────────── */
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ─── Page ────────────────────────────────────────────────── */
export default function RolesPermissionsPage() {
    const [tab, setTab] = useState<TabKey>("roles");
    const [roles, setRoles] = useState<UIRole[]>([]);
    const [permissions, setPermissions] = useState<PermissionRes[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQ, setSearchQ] = useState("");

    /* Drawer */
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
    const [selectedRole, setSelectedRole] = useState<UIRole | null>(null);
    const [draftName, setDraftName] = useState("");
    const [draftDesc, setDraftDesc] = useState("");
    const [draftPerms, setDraftPerms] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /* Fetch data */
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [rolesRes, permsRes] = await Promise.all([
                GetRoles() as unknown as Promise<IBackendRes<RoleRes[]>>,
                GetPermissions() as unknown as Promise<IBackendRes<PermissionRes[]>>,
            ]);

            const rawRoles = (rolesRes?.isSuccess || rolesRes?.success) && rolesRes?.data ? rolesRes.data : [];
            const rawPerms = (permsRes?.isSuccess || permsRes?.success) && permsRes?.data ? permsRes.data : [];

            setPermissions(rawPerms);

            // Fetch user counts for each role
            const uiRoles: UIRole[] = await Promise.all(
                rawRoles.map(async (r) => {
                    let userCount = 0;
                    try {
                        const usersRes = await GetRoleUsers(r.roleId) as unknown as IBackendRes<IUser[]>;
                        if ((usersRes?.isSuccess || usersRes?.success) && usersRes?.data) {
                            userCount = usersRes.data.length;
                        }
                    } catch { /* silent */ }
                    return {
                        ...r,
                        userCount,
                        isSystem: SYSTEM_ROLES.includes(r.roleName),
                    };
                })
            );

            setRoles(uiRoles);
        } catch {
            toast.error("Lỗi tải dữ liệu");
        }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* Group permissions by category */
    const permsByCategory = useMemo(() => {
        const map: Record<string, PermissionRes[]> = {};
        permissions.forEach(p => {
            const cat = p.category || "Uncategorized";
            if (!map[cat]) map[cat] = [];
            map[cat].push(p);
        });
        return map;
    }, [permissions]);

    const categories = Object.keys(permsByCategory).sort();

    /* Filtered roles */
    const filteredRoles = useMemo(() => {
        if (!searchQ) return roles;
        const q = searchQ.toLowerCase();
        return roles.filter(r => r.roleName.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
    }, [roles, searchQ]);

    /* Open drawer */
    const openView = (role: UIRole) => {
        setSelectedRole(role);
        setDrawerMode("view");
        setDrawerOpen(true);
    };
    const openCreate = () => {
        setSelectedRole(null);
        setDraftName("");
        setDraftDesc("");
        setDraftPerms([]);
        setDrawerMode("create");
        setDrawerOpen(true);
    };
    const openEdit = (role: UIRole) => {
        setSelectedRole(role);
        setDraftName(role.roleName);
        setDraftDesc(role.description || "");
        setDraftPerms(role.permissions?.map(p => p.permissionId) || []);
        setDrawerMode("edit");
        setDrawerOpen(true);
    };

    /* Save role (create / edit) */
    const handleSave = async () => {
        if (!draftName.trim()) { toast.error("Tên role không được để trống"); return; }
        setSaving(true);
        try {
            if (drawerMode === "create") {
                const res = await CreateRole({ roleName: draftName, description: draftDesc }) as unknown as IBackendRes<RoleRes>;
                if ((res?.isSuccess || res?.success) && res?.data) {
                    const newRoleId = (res.data as any)?.roleId ?? (res.data as any)?.data?.roleId;
                    // Assign selected permissions
                    if (newRoleId) {
                        for (const pid of draftPerms) {
                            await AssignPermissionToRole(newRoleId, pid);
                        }
                    }
                    toast.success("Tạo role thành công");
                } else {
                    toast.error((res as any)?.message || "Tạo thất bại");
                    setSaving(false);
                    return;
                }
            } else if (drawerMode === "edit" && selectedRole) {
                const res = await UpdateRole(selectedRole.roleId, { roleName: draftName, description: draftDesc }) as unknown as IBackendRes<RoleRes>;
                if (!((res?.isSuccess || res?.success))) {
                    toast.error((res as any)?.message || "Cập nhật thất bại");
                    setSaving(false);
                    return;
                }

                // Sync permissions: add new, remove old
                const currentPermIds = selectedRole.permissions?.map(p => p.permissionId) || [];
                const toAdd = draftPerms.filter(id => !currentPermIds.includes(id));
                const toRemove = currentPermIds.filter(id => !draftPerms.includes(id));
                for (const pid of toAdd) await AssignPermissionToRole(selectedRole.roleId, pid);
                for (const pid of toRemove) await RemovePermissionFromRole(selectedRole.roleId, pid);

                toast.success("Cập nhật role thành công");
            }
            setDrawerOpen(false);
            fetchData();
        } catch { toast.error("Lỗi hệ thống"); }
        finally { setSaving(false); }
    };

    /* Delete role */
    const handleDelete = async () => {
        if (!selectedRole) return;
        setDeleting(true);
        try {
            const res = await DeleteRole(selectedRole.roleId) as unknown as IBackendRes<string>;
            if ((res?.isSuccess || res?.success)) {
                toast.success("Đã xoá role");
                setDrawerOpen(false);
                fetchData();
            } else {
                toast.error((res as any)?.message || "Xoá thất bại");
            }
        } catch { toast.error("Lỗi hệ thống"); }
        finally { setDeleting(false); }
    };

    /* Toggle permission in draft */
    const togglePerm = (pid: number) => {
        setDraftPerms(prev => prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]);
    };

    return (
        <AdminShell>
            <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-[20px] font-bold text-slate-900">Roles & Permissions</h1>
                        <p className="text-[13px] text-slate-400 mt-0.5">Quản lý vai trò và phân quyền hệ thống</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchData} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm">
                            <Plus className="w-4 h-4" /> Tạo role mới
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-1 w-fit">
                    {[
                        { key: "roles" as TabKey, label: "Role Management", icon: Shield },
                        { key: "matrix" as TabKey, label: "Permissions Matrix", icon: ShieldCheck },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                                tab === t.key ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            )}>
                            <t.icon className="w-3.5 h-3.5" /> {t.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                {tab === "roles" && (
                    <div className="relative max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Tìm role..."
                            className="w-full pl-10 pr-4 h-10 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-all"
                            value={searchQ}
                            onChange={e => setSearchQ(e.target.value)}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : tab === "roles" ? (
                    /* ═══ ROLES TAB ═══ */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRoles.map(role => (
                            <button
                                key={role.roleId}
                                onClick={() => openView(role)}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 text-left hover:shadow-md hover:border-slate-300 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#fdf8e6] transition-colors">
                                        <Shield className="w-5 h-5 text-slate-400 group-hover:text-[#b8902e] transition-colors" />
                                    </div>
                                    {role.isSystem && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/80">System</span>
                                    )}
                                </div>
                                <p className="text-[14px] font-bold text-slate-900 mb-1">{role.roleName}</p>
                                <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">{role.description || "Không có mô tả"}</p>
                                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> {role.permissions?.length || 0} quyền
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {role.userCount} người dùng
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-300 mt-2">Tạo: {formatDate(role.createdAt)}</p>
                            </button>
                        ))}
                        {filteredRoles.length === 0 && (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-[13px] text-slate-400">Không tìm thấy role nào</p>
                            </div>
                        )}
                    </div>
                ) : permissions.length === 0 ? (
                    /* ═══ MATRIX EMPTY STATE ═══ */
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 flex flex-col items-center justify-center text-center">
                        <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-[14px] font-semibold text-slate-700 mb-1">Chưa có permission nào</p>
                        <p className="text-[12px] text-slate-400 max-w-sm">
                            Hệ thống chưa có dữ liệu permissions. Hãy kiểm tra lại database hoặc chạy lại seed data để tạo permissions mặc định.
                        </p>
                    </div>
                ) : (
                    /* ═══ MATRIX TAB ═══ */
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                        {/* Matrix hint */}
                        {roles.every(r => !r.permissions || r.permissions.length === 0) && (
                            <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                                <Square className="w-4 h-4 text-amber-500 shrink-0" />
                                <p className="text-[12px] text-amber-700">
                                    Chưa có permission nào được gán cho role. Nhấn vào role ở tab <strong>Role Management</strong> để gán permissions.
                                </p>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 min-w-[200px]">Permission</th>
                                        {roles.map(r => (
                                            <th key={r.roleId} className="px-3 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[100px]">
                                                {r.roleName}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <>
                                            <tr key={`cat-${cat}`}>
                                                <td colSpan={roles.length + 1} className="px-4 py-2 bg-slate-50/50">
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{cat}</span>
                                                </td>
                                            </tr>
                                            {permsByCategory[cat].map(perm => (
                                                <tr key={perm.permissionId} className="border-b border-slate-50 hover:bg-slate-50/40">
                                                    <td className="px-4 py-2.5 sticky left-0 bg-white z-10">
                                                        <p className="text-[12px] font-medium text-slate-700">{perm.permissionName}</p>
                                                        {perm.description && (
                                                            <p className="text-[10px] text-slate-400 mt-0.5">{perm.description}</p>
                                                        )}
                                                    </td>
                                                    {roles.map(role => {
                                                        const has = role.permissions?.some(rp => rp.permissionId === perm.permissionId);
                                                        return (
                                                            <td key={role.roleId} className="px-3 py-2.5 text-center">
                                                                {has ? (
                                                                    <CheckSquare className="w-4 h-4 text-emerald-500 mx-auto" />
                                                                ) : (
                                                                    <Square className="w-4 h-4 text-slate-200 mx-auto" />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ DRAWER ═══ */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
                    <div className="relative bg-white w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                        {/* Drawer header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h3 className="text-[16px] font-bold text-slate-900">
                                {drawerMode === "create" ? "Tạo Role mới" : drawerMode === "edit" ? "Chỉnh sửa Role" : selectedRole?.roleName}
                            </h3>
                            <div className="flex items-center gap-2">
                                {drawerMode === "view" && selectedRole && !selectedRole.isSystem && (
                                    <button onClick={() => openEdit(selectedRole)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50">
                                        <Pencil className="w-3.5 h-3.5" /> Sửa
                                    </button>
                                )}
                                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Drawer body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                            {drawerMode === "view" && selectedRole ? (
                                <>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">Mô tả</p>
                                            <p className="text-[13px] text-slate-700">{selectedRole.description || "Không có"}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">Người dùng</p>
                                                <p className="text-[14px] font-bold text-slate-900">{selectedRole.userCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">Quyền</p>
                                                <p className="text-[14px] font-bold text-slate-900">{selectedRole.permissions?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-slate-700 mb-3">Permissions</p>
                                        {categories.map(cat => {
                                            const catPerms = permsByCategory[cat].filter(p =>
                                                selectedRole.permissions?.some(rp => rp.permissionId === p.permissionId)
                                            );
                                            if (catPerms.length === 0) return null;
                                            return (
                                                <div key={cat} className="mb-3">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{cat}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {catPerms.map(p => (
                                                            <span key={p.permissionId} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                                                {p.permissionName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!selectedRole.permissions || selectedRole.permissions.length === 0) && (
                                            <p className="text-[13px] text-slate-400">Không có permission nào</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Create / Edit form */
                                <>
                                    <div>
                                        <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Tên Role *</label>
                                        <input
                                            value={draftName}
                                            onChange={e => setDraftName(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:border-slate-400"
                                            placeholder="VD: ContentModerator"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-semibold text-slate-600 mb-1 block">Mô tả</label>
                                        <textarea
                                            value={draftDesc}
                                            onChange={e => setDraftDesc(e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:border-slate-400 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-semibold text-slate-600 mb-3">Permissions</p>
                                        {categories.map(cat => (
                                            <div key={cat} className="mb-4">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{cat}</p>
                                                <div className="space-y-1.5">
                                                    {permsByCategory[cat].map(p => {
                                                        const checked = draftPerms.includes(p.permissionId);
                                                        return (
                                                            <button
                                                                key={p.permissionId}
                                                                onClick={() => togglePerm(p.permissionId)}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors",
                                                                    checked ? "bg-emerald-50 border border-emerald-200/80" : "bg-white border border-slate-200 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                {checked ? <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" /> : <Square className="w-4 h-4 text-slate-300 shrink-0" />}
                                                                <div>
                                                                    <p className="text-[12px] font-medium text-slate-700">{p.permissionName}</p>
                                                                    {p.description && <p className="text-[10px] text-slate-400">{p.description}</p>}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Drawer footer */}
                        {drawerMode !== "view" && (
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                                {drawerMode === "edit" && selectedRole && !selectedRole.isSystem && (
                                    <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-red-500 border border-red-200 hover:bg-red-50 disabled:opacity-50">
                                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        Xoá
                                    </button>
                                )}
                                <div className="flex items-center gap-3 ml-auto">
                                    <button onClick={() => setDrawerOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">
                                        Huỷ
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2">
                                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {drawerMode === "create" ? "Tạo" : "Lưu"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
