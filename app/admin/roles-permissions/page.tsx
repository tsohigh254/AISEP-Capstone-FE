"use client";

import { useState, useMemo, Fragment, type ElementType, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  MOCK_ROLES,
  MOCK_PERMISSIONS,
  PERMISSION_CATEGORIES,
  getPermissionsByCategory,
  type Role,
  type Permission,
  type PermissionCategory,
} from "@/services/admin/roles-permissions.mock";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  Lock,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  X,
  Copy,
  CheckSquare,
  Square,
  Info,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type TabKey = "roles" | "matrix";
type DrawerMode = "view" | "create" | "edit";

interface EditDraft {
  name: string;
  description: string;
  permissionIds: string[];
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function diffPermissions(original: string[], draft: string[]) {
  const added = draft.filter(id => !original.includes(id));
  const removed = original.filter(id => !draft.includes(id));
  return { added, removed };
}

/* ─── Small reusable components ──────────────────────────────────────────── */
function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]", className)}>
      {children}
    </div>
  );
}

function ProtectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#fdf8e6] text-[#b8902e] border border-[#eec54e]/40">
      <Lock className="w-2.5 h-2.5" />
      Protected
    </span>
  );
}

function CriticalBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200/80">
      Critical
    </span>
  );
}

function EmptyState({ icon: Icon, title, description, action }: { icon: ElementType; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-[15px] font-semibold text-slate-700">{title}</p>
      <p className="text-[13px] text-slate-400 mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ─── Permission Group Selector ──────────────────────────────────────────── */
function PermissionGroupSelector({
  draft,
  onChange,
  searchFilter,
}: {
  draft: string[];
  onChange: (ids: string[]) => void;
  searchFilter: string;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    const next = draft.includes(id) ? draft.filter(x => x !== id) : [...draft, id];
    onChange(next);
  };

  const toggleGroup = (category: PermissionCategory) => {
    const groupIds = getPermissionsByCategory(category).map(p => p.id);
    const allSelected = groupIds.every(id => draft.includes(id));
    if (allSelected) {
      onChange(draft.filter(id => !groupIds.includes(id)));
    } else {
      const merged = [...new Set([...draft, ...groupIds])];
      onChange(merged);
    }
  };

  const toggleExpand = (category: string) => {
    setExpanded(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
      {PERMISSION_CATEGORIES.map(category => {
        const perms = getPermissionsByCategory(category).filter(p =>
          !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.description.toLowerCase().includes(searchFilter.toLowerCase())
        );
        if (perms.length === 0) return null;

        const selectedCount = perms.filter(p => draft.includes(p.id)).length;
        const allSelected = selectedCount === perms.length;
        const isOpen = expanded[category] ?? false;

        return (
          <div key={category} className="rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer select-none"
              onClick={() => toggleExpand(category)}>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); toggleGroup(category); }}
                className="shrink-0 text-slate-400 hover:text-[#b8902e] transition-colors"
              >
                {allSelected
                  ? <CheckSquare className="w-4 h-4 text-[#b8902e]" />
                  : <Square className="w-4 h-4" />}
              </button>
              <span className="flex-1 text-[12px] font-semibold text-slate-700">{category}</span>
              <span className="text-[11px] text-slate-400">{selectedCount}/{perms.length}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </div>

            {isOpen && (
              <div className="divide-y divide-slate-100">
                {perms.map(perm => (
                  <label key={perm.id} className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={draft.includes(perm.id)}
                      onChange={() => toggle(perm.id)}
                      className="mt-0.5 w-4 h-4 accent-[#eec54e] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-slate-700">{perm.name}</span>
                        {perm.isCritical && <CriticalBadge />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{perm.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Role Drawer ─────────────────────────────────────────────────────────── */
function RoleDrawer({
  mode,
  role,
  allRoles,
  onClose,
  onSave,
  onDelete,
  onEdit,
}: {
  mode: DrawerMode;
  role: Role | null;
  allRoles: Role[];
  onClose: () => void;
  onSave: (draft: EditDraft, roleId?: string) => void;
  onDelete: (role: Role) => void;
  onEdit: (role: Role) => void;
}) {
  const [draft, setDraft] = useState<EditDraft>({
    name: mode === "create" ? "" : (role?.name ?? ""),
    description: mode === "create" ? "" : (role?.description ?? ""),
    permissionIds: mode === "create" ? [] : (role?.permissionIds ?? []),
  });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [permSearch, setPermSearch] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const update = <K extends keyof EditDraft>(key: K, value: EditDraft[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const e: { name?: string } = {};
    if (!draft.name.trim()) { e.name = "Tên vai trò không được để trống."; }
    const nameConflict = allRoles.some(r => r.name.toLowerCase() === draft.name.trim().toLowerCase() && r.id !== role?.id);
    if (nameConflict) { e.name = "Tên vai trò đã tồn tại."; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(draft, role?.id);
  };

  const handleClose = () => {
    if (isDirty) {
      if (!confirm("Thay đổi chưa được lưu. Bạn có chắc muốn thoát không?")) return;
    }
    onClose();
  };

  const diff = role ? diffPermissions(role.permissionIds, draft.permissionIds) : null;
  const isEditing = mode === "edit";
  const isViewing = mode === "view";
  const isCreating = mode === "create";

  const selectedPerms = MOCK_PERMISSIONS.filter(p => draft.permissionIds.includes(p.id));
  const groupedSelected = PERMISSION_CATEGORIES.map(cat => ({
    category: cat,
    perms: selectedPerms.filter(p => p.category === cat),
  })).filter(g => g.perms.length > 0);

  const title = isCreating ? "Tạo vai trò mới" : isEditing ? "Chỉnh sửa vai trò" : "Chi tiết vai trò";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[520px] max-w-[95vw] bg-white z-50 flex flex-col shadow-xl border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
            {role && !isCreating && (
              <p className="text-[12px] text-slate-400 mt-0.5 font-mono">{role.id}</p>
            )}
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* View mode: identity block */}
          {isViewing && role && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[20px] font-bold text-slate-900">{role.name}</h3>
                    {role.isProtected && <ProtectedBadge />}
                  </div>
                  <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{role.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Số quyền", value: `${role.permissionIds.length} quyền` },
                  { label: "Users đang dùng", value: `${role.assignedUserCount} users` },
                  { label: "Tạo bởi", value: role.createdBy },
                  { label: "Cập nhật bởi", value: role.updatedBy },
                  { label: "Ngày tạo", value: formatDate(role.createdAt) },
                  { label: "Cập nhật lần cuối", value: formatDate(role.updatedAt) },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                    <p className="text-[13px] font-semibold text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Quyền đang gán ({selectedPerms.length})
                </p>
                {groupedSelected.map(g => (
                  <div key={g.category} className="mb-3">
                    <p className="text-[11px] text-slate-400 font-semibold mb-1.5">{g.category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.perms.map(p => (
                        <span key={p.id} className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border",
                          p.isCritical ? "bg-red-50 text-red-600 border-red-200/80" : "bg-slate-100 text-slate-600 border-slate-200/80"
                        )}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {groupedSelected.length === 0 && (
                  <p className="text-[13px] text-slate-400">Chưa gán quyền nào.</p>
                )}
              </div>
            </div>
          )}

          {/* Edit / Create mode: form */}
          {(isEditing || isCreating) && (
            <div className="space-y-5">
              {role?.isProtected && isEditing && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-700">Đây là <strong>protected role</strong>. Thay đổi permission sẽ ảnh hưởng tất cả {role.assignedUserCount} users đang dùng vai trò này.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-700">Tên vai trò <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={e => update("name", e.target.value)}
                  disabled={role?.isProtected && isEditing}
                  placeholder="Ví dụ: Reviewer, Compliance Officer..."
                  className={cn(
                    "w-full h-11 rounded-xl border bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors",
                    errors.name ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-[#eec54e] focus:ring-4 focus:ring-[#eec54e]/20",
                    role?.isProtected && isEditing && "opacity-50 cursor-not-allowed bg-slate-50"
                  )}
                />
                {errors.name && <p className="text-[11px] text-red-500">{errors.name}</p>}
                {role?.isProtected && isEditing && <p className="text-[11px] text-slate-400">Tên của protected role không thể thay đổi.</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-700">Mô tả</label>
                <textarea
                  value={draft.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Mô tả ngắn về vai trò này..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none transition-colors focus:border-[#eec54e] focus:ring-4 focus:ring-[#eec54e]/20 resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-slate-700">
                    Quyền được gán
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-[#fdf8e6] text-[#b8902e] text-[10px] font-bold border border-[#eec54e]/40">
                      {draft.permissionIds.length} / {MOCK_PERMISSIONS.length}
                    </span>
                  </label>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm quyền..."
                    value={permSearch}
                    onChange={e => setPermSearch(e.target.value)}
                    className="w-full pl-9 pr-4 h-9 rounded-xl border border-slate-200 bg-slate-50 text-[13px] text-slate-700 outline-none focus:border-[#eec54e] transition-colors"
                  />
                </div>

                <PermissionGroupSelector
                  draft={draft.permissionIds}
                  onChange={ids => update("permissionIds", ids)}
                  searchFilter={permSearch}
                />
              </div>

              {/* Impact summary when editing */}
              {isEditing && role && diff && (diff.added.length > 0 || diff.removed.length > 0) && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 space-y-1">
                  <p className="text-[12px] font-semibold text-blue-700">Tóm tắt thay đổi</p>
                  {diff.added.length > 0 && (
                    <p className="text-[12px] text-blue-600">
                      +{diff.added.length} quyền thêm mới
                    </p>
                  )}
                  {diff.removed.length > 0 && (
                    <p className="text-[12px] text-blue-600">
                      -{diff.removed.length} quyền bị bỏ
                    </p>
                  )}
                  <p className="text-[12px] text-blue-600">
                    Áp dụng cho {role.assignedUserCount} users đang dùng vai trò này
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 shrink-0">
          {isViewing && role && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!role.isProtected && (
                  <button
                    onClick={() => onDelete(role)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xoá
                  </button>
                )}
                {role.isProtected && (
                  <span className="text-[12px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Không thể xoá protected role
                  </span>
                )}
              </div>
              <button
                onClick={() => onEdit(role)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Chỉnh sửa
              </button>
            </div>
          )}

          {(isEditing || isCreating) && (
            <div className="flex items-center justify-end gap-3">
              <button onClick={handleClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-[#1e293b] transition-colors">
                {isCreating ? "Tạo vai trò" : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Delete Confirm Modal ───────────────────────────────────────────────── */
function DeleteRoleModal({ role, onConfirm, onCancel }: { role: Role; onConfirm: () => void; onCancel: () => void }) {
  const canDelete = !role.isProtected && role.assignedUserCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-[440px] p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Xoá vai trò này?</h3>
            <p className="text-[13px] text-slate-500 mt-1">Bạn đang xoá vai trò <strong>{role.name}</strong>.</p>
          </div>
        </div>

        {!canDelete && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-700">
              {role.isProtected
                ? "Không thể xoá protected role."
                : `Vai trò này đang được gán cho ${role.assignedUserCount} users. Cần gỡ hết user trước khi xoá.`}
            </p>
          </div>
        )}

        {canDelete && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-700">Hành động này không thể hoàn tác. Role sẽ bị xoá vĩnh viễn cùng toàn bộ permission mapping.</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete}
            className={cn(
              "px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors",
              canDelete
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            Xoá vai trò
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab 1: Role Management ─────────────────────────────────────────────── */
function RoleManagementTab({
  roles,
  onRolesChange,
}: {
  roles: Role[];
  onRolesChange: (roles: Role[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return roles;
    const q = search.toLowerCase();
    return roles.filter(r =>
      r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [roles, search]);

  const openView = (role: Role) => { setSelectedRole(role); setDrawerMode("view"); setDrawerOpen(true); };
  const openEdit = (role: Role) => { setSelectedRole(role); setDrawerMode("edit"); setDrawerOpen(true); };
  const openCreate = () => { setSelectedRole(null); setDrawerMode("create"); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setSelectedRole(null); };

  const handleSave = (draft: EditDraft, roleId?: string) => {
    if (roleId) {
      // edit
      onRolesChange(roles.map(r =>
        r.id === roleId
          ? { ...r, name: draft.name, description: draft.description, permissionIds: draft.permissionIds, updatedAt: new Date().toISOString(), updatedBy: "Application Admin" }
          : r
      ));
      toast.success(`Đã cập nhật vai trò "${draft.name}".`);
    } else {
      // create
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: draft.name.trim(),
        description: draft.description.trim(),
        isProtected: false,
        permissionIds: draft.permissionIds,
        assignedUserCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "Application Admin",
        updatedBy: "Application Admin",
      };
      onRolesChange([...roles, newRole]);
      toast.success(`Đã tạo vai trò "${draft.name}".`);
    }
    closeDrawer();
  };

  const handleDelete = (role: Role) => { setDeleteTarget(role); };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    onRolesChange(roles.filter(r => r.id !== deleteTarget.id));
    toast.success(`Đã xoá vai trò "${deleteTarget.name}".`);
    setDeleteTarget(null);
    closeDrawer();
  };

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[360px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Tìm vai trò..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#eec54e] focus:ring-4 focus:ring-[#eec54e]/20 transition-all"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-slate-400">{roles.length} vai trò</span>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tạo vai trò
            </button>
          </div>
        </div>

        {/* Table */}
        <SectionCard>
          {filtered.length === 0 ? (
            <EmptyState
              icon={Shield}
              title={search ? "Không tìm thấy vai trò" : "Chưa có vai trò nào"}
              description={search ? "Thử từ khoá khác hoặc xoá bộ lọc." : "Tạo vai trò đầu tiên để bắt đầu quản lý quyền truy cập."}
              action={!search ? (
                <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors">
                  <Plus className="w-4 h-4" /> Tạo vai trò
                </button>
              ) : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Tên vai trò", "Mô tả", "Số quyền", "Users", "Cập nhật", ""].map(col => (
                      <th key={col} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(role => (
                    <tr
                      key={role.id}
                      onClick={() => openView(role)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-slate-800">{role.name}</span>
                          {role.isProtected && <ProtectedBadge />}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[260px]">
                        <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">{role.description}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[12px] font-semibold">
                          {role.permissionIds.length}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                          <Users className="w-3.5 h-3.5" />
                          {role.assignedUserCount}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[12px] text-slate-400">{formatDate(role.updatedAt)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(role)}
                            title="Chỉnh sửa"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!role.isProtected && (
                            <button
                              onClick={() => handleDelete(role)}
                              title="Xoá"
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      {drawerOpen && (
        <RoleDrawer
          mode={drawerMode}
          role={selectedRole}
          allRoles={roles}
          onClose={closeDrawer}
          onSave={handleSave}
          onDelete={handleDelete}
          onEdit={openEdit}
        />
      )}

      {deleteTarget && (
        <DeleteRoleModal
          role={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

/* ─── Tab 2: Permissions Matrix ──────────────────────────────────────────── */
function PermissionsMatrixTab({
  roles,
  onJumpToRole,
}: {
  roles: Role[];
  onJumpToRole: (role: Role) => void;
}) {
  const [permSearch, setPermSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PermissionCategory | "">("");
  const [showCatDD, setShowCatDD] = useState(false);
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);

  const filteredPerms = useMemo(() => {
    let list = [...MOCK_PERMISSIONS];
    if (permSearch) list = list.filter(p => p.name.toLowerCase().includes(permSearch.toLowerCase()));
    if (categoryFilter) list = list.filter(p => p.category === categoryFilter);
    if (showAssignedOnly) list = list.filter(p => roles.some(r => r.permissionIds.includes(p.id)));
    return list;
  }, [permSearch, categoryFilter, showAssignedOnly, roles]);

  // Group filtered permissions by category
  const groupedPerms = useMemo(() => {
    return PERMISSION_CATEGORIES.map(cat => ({
      category: cat,
      perms: filteredPerms.filter(p => p.category === cat),
    })).filter(g => g.perms.length > 0);
  }, [filteredPerms]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-[360px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Tìm quyền..."
            value={permSearch}
            onChange={e => setPermSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-10 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#eec54e] focus:ring-4 focus:ring-[#eec54e]/20 transition-all"
          />
        </div>

        <div className="relative" onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={() => setShowCatDD(!showCatDD)}
            className="h-10 px-3.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-all min-w-[160px] justify-between"
          >
            <span className="truncate">{categoryFilter || "Tất cả nhóm"}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform", showCatDD && "rotate-180")} />
          </button>
          {showCatDD && (
            <div className="absolute top-full mt-1.5 left-0 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 min-w-[200px] z-20">
              {(["", ...PERMISSION_CATEGORIES] as (PermissionCategory | "")[]).map(cat => (
                <button key={cat} onClick={() => { setCategoryFilter(cat); setShowCatDD(false); }}
                  className={cn("w-full px-4 py-2 text-left text-[13px] hover:bg-slate-50 transition-colors", categoryFilter === cat ? "text-[#b8902e] font-semibold" : "text-slate-600")}>
                  {cat || "Tất cả nhóm"}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAssignedOnly(!showAssignedOnly)}
          className={cn(
            "h-10 px-3.5 rounded-xl border text-[13px] font-medium transition-colors",
            showAssignedOnly
              ? "bg-[#fdf8e6] border-[#eec54e]/60 text-[#b8902e]"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          Chỉ hiện assigned
        </button>

        <div className="ml-auto text-[12px] text-slate-400">
          {filteredPerms.length} quyền · {roles.length} vai trò
        </div>
      </div>

      {/* Matrix */}
      <SectionCard className="overflow-hidden">
        {filteredPerms.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Không có quyền phù hợp"
            description="Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm."
          />
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-260px)]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  {/* Permission name column header */}
                  <th className="sticky left-0 z-20 bg-white border-b border-r border-slate-100 px-5 py-3 text-left min-w-[260px]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Quyền</span>
                  </th>
                  {roles.map(role => (
                    <th key={role.id} className="border-b border-slate-100 px-4 py-3 text-center min-w-[120px]">
                      <button
                        onClick={() => onJumpToRole(role)}
                        className="group flex flex-col items-center gap-1 mx-auto hover:text-[#b8902e] transition-colors"
                        title="Xem chi tiết vai trò"
                      >
                        <span className="text-[12px] font-semibold text-slate-700 group-hover:text-[#b8902e] transition-colors">
                          {role.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{role.permissionIds.length} quyền</span>
                        {role.isProtected && (
                          <Lock className="w-2.5 h-2.5 text-[#b8902e]" />
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedPerms.map(group => (
                  <Fragment key={group.category}>
                    {/* Category header row */}
                    <tr className="bg-slate-50">
                      <td
                        colSpan={roles.length + 1}
                        className="sticky left-0 px-5 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-y border-slate-100"
                      >
                        {group.category}
                      </td>
                    </tr>

                    {/* Permission rows */}
                    {group.perms.map(perm => (
                      <tr key={perm.id} className="hover:bg-slate-50/50 group transition-colors">
                        <td className="sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors border-r border-slate-100 px-5 py-3">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] font-medium text-slate-700">{perm.name}</span>
                                {perm.isCritical && <CriticalBadge />}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{perm.description}</p>
                            </div>
                          </div>
                        </td>
                        {roles.map(role => {
                          const assigned = role.permissionIds.includes(perm.id);
                          return (
                            <td key={role.id} className="border-l border-slate-50 px-4 py-3 text-center">
                              {assigned ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              ) : (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-200 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[12px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          Đang được gán
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-200" />
          Chưa gán
        </div>
        <div className="flex items-center gap-2">
          <CriticalBadge />
          Quyền nhạy cảm cao
        </div>
        <div className="flex items-center gap-2 ml-auto text-slate-400">
          <Info className="w-3.5 h-3.5" />
          Click tên vai trò để xem chi tiết
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function RolesPermissionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTab = searchParams.get("tab");
  const activeTab: TabKey = rawTab === "matrix" ? "matrix" : "roles";

  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [jumpRole, setJumpRole] = useState<Role | null>(null);

  const setTab = (tab: TabKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/admin/roles-permissions?${params.toString()}`, { scroll: false });
  };

  const handleJumpToRole = (role: Role) => {
    setJumpRole(role);
    setTab("roles");
  };

  // When tab switches to "roles" with a jump target, open the drawer
  // handled by passing jumpRole as initial selection
  const handleRolesTabMount = jumpRole;

  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-5 pb-16 animate-in fade-in duration-400">

        {/* Breadcrumb + Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <nav className="flex items-center gap-1.5 text-[12px]">
              <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">Admin Workspace</Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-600 font-medium">Vai trò & Quyền</span>
            </nav>
            <h1 className="text-[20px] font-bold text-slate-900">Vai trò & Quyền</h1>
            <p className="text-[13px] text-slate-400">Quản lý RBAC roles và xem tổng thể permission mapping</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toast.info("Mock flow: Audit Logs chưa được implement.")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Audit logs
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-1 w-fit">
          {([
            { key: "roles" as TabKey, label: "Quản lý vai trò", icon: Shield },
            { key: "matrix" as TabKey, label: "Permissions Matrix", icon: ShieldCheck },
          ] as const).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap",
                  isActive ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "roles" && (
          <RoleManagementTab
            roles={roles}
            onRolesChange={setRoles}
          />
        )}

        {activeTab === "matrix" && (
          <PermissionsMatrixTab
            roles={roles}
            onJumpToRole={handleJumpToRole}
          />
        )}
      </div>
    </AdminShell>
  );
}
