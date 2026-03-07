"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import { AddUserModal } from "@/components/admin/add-user-modal";
import { ViewUserModal } from "@/components/admin/view-user-modal";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { GetUsers, UpdateUserStatus } from "@/services/admin/admin.api";
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FilterX,
    Loader2,
    AlertCircle,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

    // API data state
    const [users, setUsers] = useState<IAdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [paging, setPaging] = useState<IPaging | null>(null);

    // Filter state
    const [userTypeFilter, setUserTypeFilter] = useState<string | undefined>(undefined);
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

    // Filter dropdowns
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showEmailVerifiedDropdown, setShowEmailVerifiedDropdown] = useState(false);
    const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<boolean | undefined>(undefined);

    const fetchUsers = useCallback(async (p: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await GetUsers({
                page: p,
                pageSize: PAGE_SIZE,
                userType: userTypeFilter,
                isActive: isActiveFilter,
            }) as unknown as IBackendRes<IAdminUser[]>;

            if (res.success && res.data) {
                setUsers(res.data);
                // If backend returns paginated response, update paging
                const anyRes = res as any;
                if (anyRes.data?.items) {
                    setUsers(anyRes.data.items);
                    setPaging(anyRes.data.paging);
                } else if (Array.isArray(res.data)) {
                    setUsers(res.data);
                    setPaging(null);
                }
            } else {
                setError(res.message || "Không thể tải danh sách người dùng.");
            }
        } catch {
            setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [userTypeFilter, isActiveFilter]);

    useEffect(() => {
        fetchUsers(page);
    }, [page, fetchUsers]);

    const handleAddUser = () => {
        fetchUsers(page);
    };

    const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
        try {
            const res = await UpdateUserStatus(userId, !currentStatus) as unknown as IBackendRes<string>;
            if (res.success) {
                setUsers(prev => prev.map(u =>
                    u.userId === userId ? { ...u, isActive: !currentStatus } : u
                ));
            }
        } catch { /* silent */ }
    };

    const handleViewUser = (userId: number) => {
        setSelectedUserId(userId);
        setIsViewModalOpen(true);
    };

    const handleEditUser = (userId: number) => {
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa người dùng này?")) return;
        setDeletingUserId(userId);
        try {
            const res = await UpdateUserStatus(userId, false) as unknown as IBackendRes<string>;
            if (res.success) {
                setUsers(prev => prev.map(u =>
                    u.userId === userId ? { ...u, isActive: false } : u
                ));
            }
        } catch { /* silent */ }
        finally { setDeletingUserId(null); }
    };

    const clearFilters = () => {
        setUserTypeFilter(undefined);
        setIsActiveFilter(undefined);
        setEmailVerifiedFilter(undefined);
        setSearchQuery("");
        setPage(1);
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? "bg-green-50 text-green-600 border-green-100"
            : "bg-red-50 text-red-600 border-red-100";
    };

    const getEmailInitials = (email: string) => {
        const name = email.split("@")[0];
        if (name.length >= 2) return name.substring(0, 2).toUpperCase();
        return name.toUpperCase();
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    // Client-side search filter (email)
    const filteredUsers = users.filter(user => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return user.email.toLowerCase().includes(q) || user.userId.toString().includes(q);
    }).filter(user => {
        if (emailVerifiedFilter === undefined) return true;
        return user.emailVerified === emailVerifiedFilter;
    });

    return (
        <AdminShell>
            <AdminHeader title="Quản trị Người dùng" onAddClick={() => setIsAddUserModalOpen(true)} />

            <div className="px-6 pb-4 space-y-4 animate-in fade-in duration-700">
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-3xl">
                    Quản lý danh sách và thông tin chi tiết của người dùng trong hệ thống AISEP.
                </p>

                {/* Filter Section */}
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                        <Input
                            placeholder="Tìm theo email, ID..."
                            className="w-full pl-14 h-11 bg-[#f8fafc]/50 border-none rounded-xl text-[13px] font-bold focus:ring-[#eec54e]/20 transition-all placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
                        {/* Role/UserType filter */}
                        <div className="relative">
                            <div
                                onClick={() => { setShowRoleDropdown(!showRoleDropdown); setShowStatusDropdown(false); setShowEmailVerifiedDropdown(false); }}
                                className="h-11 px-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4 cursor-pointer group hover:bg-slate-50 transition-all min-w-[120px] justify-between shadow-sm shadow-slate-200/20"
                            >
                                <span className="text-[14px] font-bold text-slate-900 whitespace-nowrap">
                                    {userTypeFilter || "Vai trò"}
                                </span>
                                <ChevronDown className={cn("size-4 text-slate-400 transition-transform", showRoleDropdown && "rotate-180")} />
                            </div>
                            {showRoleDropdown && (
                                <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button onClick={() => { setUserTypeFilter(undefined); setShowRoleDropdown(false); setPage(1); }} className={cn("w-full px-5 py-3 text-left text-[13px] font-bold hover:bg-slate-50 transition-colors", !userTypeFilter && "text-[#eec54e]")}>
                                        Tất cả
                                    </button>
                                    {["Startup", "Investor", "Admin"].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => { setUserTypeFilter(type); setShowRoleDropdown(false); setPage(1); }}
                                            className={cn("w-full px-5 py-3 text-left text-[13px] font-bold hover:bg-slate-50 transition-colors", userTypeFilter === type && "text-[#eec54e]")}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status filter */}
                        <div className="relative">
                            <div
                                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowRoleDropdown(false); setShowEmailVerifiedDropdown(false); }}
                                className="h-11 px-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4 cursor-pointer group hover:bg-slate-50 transition-all min-w-[120px] justify-between shadow-sm shadow-slate-200/20"
                            >
                                <span className="text-[14px] font-bold text-slate-900 whitespace-nowrap">
                                    {isActiveFilter === undefined ? "Trạng thái" : isActiveFilter ? "Hoạt động" : "Vô hiệu"}
                                </span>
                                <ChevronDown className={cn("size-4 text-slate-400 transition-transform", showStatusDropdown && "rotate-180")} />
                            </div>
                            {showStatusDropdown && (
                                <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button onClick={() => { setIsActiveFilter(undefined); setShowStatusDropdown(false); setPage(1); }} className={cn("w-full px-5 py-3 text-left text-[13px] font-bold hover:bg-slate-50 transition-colors", isActiveFilter === undefined && "text-[#eec54e]")}>
                                        Tất cả
                                    </button>
                                    <button onClick={() => { setIsActiveFilter(true); setShowStatusDropdown(false); setPage(1); }} className={cn("w-full px-5 py-3 text-left text-[13px] font-bold hover:bg-slate-50 transition-colors", isActiveFilter === true && "text-[#eec54e]")}>
                                        Hoạt động
                                    </button>
                                    <button onClick={() => { setIsActiveFilter(false); setShowStatusDropdown(false); setPage(1); }} className={cn("w-full px-5 py-3 text-left text-[13px] font-bold hover:bg-slate-50 transition-colors", isActiveFilter === false && "text-[#eec54e]")}>
                                        Vô hiệu hóa
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email Verified filter */}
                        <div className="relative">
                            <div
                                onClick={() => { setShowEmailVerifiedDropdown(!showEmailVerifiedDropdown); setShowRoleDropdown(false); setShowStatusDropdown(false); }}
                                className="h-11 px-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4 cursor-pointer group hover:bg-slate-50 transition-all min-w-[150px] justify-between shadow-sm shadow-slate-200/20"
                            >
                                <span className="text-[14px] font-bold text-slate-900 whitespace-nowrap">
                                    {emailVerifiedFilter === undefined ? "Xác thực email" : emailVerifiedFilter ? "Đã xác thực" : "Chưa xác thực"}
                                </span>
                                <ChevronDown className={cn("size-4 text-slate-400 transition-transform", showEmailVerifiedDropdown && "rotate-180")} />
                            </div>
                            {showEmailVerifiedDropdown && (
                                <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button onClick={() => { setEmailVerifiedFilter(undefined); setShowEmailVerifiedDropdown(false); }} className={cn("w-full px-5 py-3 text-left text-[13px] font-bold hover:bg-slate-50 transition-colors", emailVerifiedFilter === undefined && "text-[#eec54e]")}>
                                        Tất cả
                                    </button>
                                    <button onClick={() => { setEmailVerifiedFilter(true); setShowEmailVerifiedDropdown(false); }} className={cn("w-full px-5 py-3 text-left text-[13px] font-bold hover:bg-slate-50 transition-colors", emailVerifiedFilter === true && "text-[#eec54e]")}>
                                        Đã xác thực
                                    </button>
                                    <button onClick={() => { setEmailVerifiedFilter(false); setShowEmailVerifiedDropdown(false); }} className={cn("w-full px-5 py-3 text-left text-[13px] font-bold hover:bg-slate-50 transition-colors", emailVerifiedFilter === false && "text-[#eec54e]")}>
                                        Chưa xác thực
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 h-11 text-[12px] font-black text-[#eec54e] hover:text-[#d4ae3d] uppercase tracking-[0.1em] hover:bg-[#fdf8e6] rounded-xl transition-all bg-[#fdf8e6]/30 border border-[#eec54e]/10"
                        >
                            <FilterX className="size-4" strokeWidth={3} />
                            <span>Xóa bộ lọc</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl px-8 py-5 flex items-center justify-between animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="size-5 text-red-500" />
                            <span className="text-[14px] font-bold text-red-600">{error}</span>
                        </div>
                        <button
                            onClick={() => fetchUsers(page)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all"
                        >
                            <RefreshCw className="size-4" />
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Table Section */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="size-8 text-[#eec54e] animate-spin" />
                                <span className="text-[14px] font-bold text-slate-400">Đang tải danh sách người dùng...</span>
                            </div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Search className="size-7 text-slate-300" />
                                </div>
                                <span className="text-[14px] font-bold text-slate-400">Không tìm thấy người dùng nào</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">UserID</th>
                                            <th className="px-4 py-3 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Email</th>
                                            <th className="px-4 py-3 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Loại TK</th>
                                            <th className="px-4 py-3 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Vai trò</th>
                                            <th className="px-4 py-3 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Trạng thái</th>
                                            <th className="px-4 py-3 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Email</th>
                                            <th className="px-4 py-3 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Ngày tạo</th>
                                            <th className="px-4 py-3 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <span className="text-[13px] font-black text-slate-400 tracking-tighter uppercase">#{user.userId}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full flex items-center justify-center font-black text-[10px] border border-slate-100/50 shadow-sm bg-[#fdf8e6] text-[#e6cc4c]">
                                                            {getEmailInitials(user.email)}
                                                        </div>
                                                        <span className="text-[14px] font-bold text-slate-700 group-hover:text-[#eec54e] transition-colors">{user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-black uppercase tracking-wider border border-slate-200/50">
                                                        {user.userType}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-wrap justify-center gap-1">
                                                        {user.roles && user.roles.length > 0 ? user.roles.map((role, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-[#fdf8e6] text-[#b8960f] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#eec54e]/20">
                                                                {role}
                                                            </span>
                                                        )) : (
                                                            <span className="text-[12px] text-slate-300 italic">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button
                                                        onClick={() => handleToggleStatus(user.userId, user.isActive)}
                                                        className={cn(
                                                            "px-4 py-1.5 rounded-full text-[10px] font-black border tracking-widest uppercase cursor-pointer hover:opacity-80 transition-all",
                                                            getStatusBadge(user.isActive)
                                                        )}
                                                    >
                                                        {user.isActive ? "Active" : "Disabled"}
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-full text-[10px] font-black border tracking-widest uppercase",
                                                        user.emailVerified
                                                            ? "bg-blue-50 text-blue-600 border-blue-100"
                                                            : "bg-slate-50 text-slate-400 border-slate-100"
                                                    )}>
                                                        {user.emailVerified ? "Verified" : "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center text-[13px] font-black text-slate-500 uppercase tracking-tight opacity-70">
                                                    {formatDate(user.createdAt)}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleViewUser(user.userId)}
                                                            title="Xem chi tiết"
                                                            className="size-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-[#eec54e] hover:bg-[#fdf8e6] transition-all"
                                                        >
                                                            <Eye className="size-[18px]" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditUser(user.userId)}
                                                            title="Cập nhật"
                                                            className="size-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                        >
                                                            <Pencil className="size-[16px]" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.userId)}
                                                            title="Vô hiệu hóa"
                                                            disabled={deletingUserId === user.userId}
                                                            className="size-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                                                        >
                                                            {deletingUserId === user.userId ? (
                                                                <Loader2 className="size-[16px] animate-spin" />
                                                            ) : (
                                                                <Trash2 className="size-[16px]" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                                <p className="text-[12px] font-bold text-slate-400 italic tracking-tight">
                                    {paging
                                        ? `Đang hiển thị ${filteredUsers.length} trong tổng số ${paging.totalItems} người dùng`
                                        : `Đang hiển thị ${filteredUsers.length} người dùng`
                                    }
                                </p>
                                {paging && paging.totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={page <= 1}
                                            onClick={() => setPage(p => p - 1)}
                                            className="size-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="size-4" />
                                        </button>
                                        {Array.from({ length: Math.min(paging.totalPages, 5) }, (_, i) => {
                                            let pageNum: number;
                                            if (paging.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (page <= 3) {
                                                pageNum = i + 1;
                                            } else if (page >= paging.totalPages - 2) {
                                                pageNum = paging.totalPages - 4 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={cn(
                                                        "size-8 rounded-xl text-[13px] font-black transition-all",
                                                        page === pageNum
                                                            ? "bg-[#eec54e] text-white shadow-lg shadow-yellow-500/20"
                                                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            disabled={page >= paging.totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                            className="size-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="size-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSave={handleAddUser}
            />

            {/* View User Modal */}
            <ViewUserModal
                isOpen={isViewModalOpen}
                onClose={() => { setIsViewModalOpen(false); setSelectedUserId(null); }}
                userId={selectedUserId}
            />

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedUserId(null); }}
                onSaved={() => fetchUsers(page)}
                userId={selectedUserId}
            />
        </AdminShell>
    );
}
