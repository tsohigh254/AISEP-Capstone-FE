"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    GetMembers,
    AddMember,
    UpdateMember,
    DeleteMember,
    IAddMemberRequest,
    IUpdateMemberRequest,
} from "@/services/startup/startup.api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Users, Plus, Pencil, Trash2, Loader2, X,
    Star, Briefcase, Clock, Upload, UserCircle2,
} from "lucide-react";

// ─── Avatar helpers ───────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];
function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Shared input class ───────────────────────────────────────────────────────
const INPUT_CLS = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all bg-white";

// ─── Field label ──────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1.5 font-medium">
            {children}{required && <span className="text-red-400 ml-0.5">*</span>}
        </p>
    );
}

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pt-1 pb-0.5 border-b border-slate-100">
            {children}
        </p>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StartupTeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);

    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("");
    const [title, setTitle] = useState("");
    const [linkedInURL, setLinkedInURL] = useState("");
    const [bio, setBio] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState("");
    const [isFounder, setIsFounder] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [existingPhotoURL, setExistingPhotoURL] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<ITeamMember | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchMembers(); }, []);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const res = await GetMembers() as unknown as IBackendRes<ITeamMember[]>;
            setMembers((res.success || res.isSuccess) && Array.isArray(res.data) ? res.data : []);
        } catch {
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFullName(""); setRole(""); setTitle(""); setLinkedInURL("");
        setBio(""); setYearsOfExperience(""); setIsFounder(false);
        setPhotoFile(null); setExistingPhotoURL("");
        setIsEditing(false); setCurrentMemberId(null);
    };

    const openAdd = () => { resetForm(); setIsDialogOpen(true); };
    const openEdit = (m: ITeamMember) => {
        resetForm(); setIsEditing(true); setCurrentMemberId(m.teamMemberID);
        setFullName(m.fullName || ""); setRole(m.role || ""); setTitle(m.title || "");
        setLinkedInURL(m.linkedInURL || ""); setBio(m.bio || "");
        setYearsOfExperience(m.yearsOfExperience?.toString() || "");
        setIsFounder(!!m.isFounder);
        if (m.photoURL) setExistingPhotoURL(m.photoURL);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await DeleteMember(deleteTarget.teamMemberID);
            toast.success(`Đã xóa ${deleteTarget.fullName} khỏi đội ngũ.`);
            setDeleteTarget(null);
            await fetchMembers();
        } catch {
            toast.error("Xóa thất bại, vui lòng thử lại.");
        } finally {
            setIsDeleting(false);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditing && currentMemberId) {
                const payload: IUpdateMemberRequest = {
                    fullName, role, title, linkedInURL, bio, isFounder,
                    yearsOfExperience: parseInt(yearsOfExperience) || 0,
                };
                if (photoFile) payload.photoURL = photoFile;
                await UpdateMember(currentMemberId, payload);
                toast.success("Đã cập nhật thông tin thành viên.");
            } else {
                if (!photoFile) { toast.error("Vui lòng chọn ảnh đại diện."); setIsSubmitting(false); return; }
                const payload: IAddMemberRequest = {
                    fullName, role, title, linkedInURL, bio,
                    photoURL: photoFile, isFounder,
                    yearsOfExperience: parseInt(yearsOfExperience) || 0,
                };
                await AddMember(payload);
                toast.success("Đã thêm thành viên mới vào đội ngũ.");
            }
            setIsDialogOpen(false);
            resetForm();
            await fetchMembers();
        } catch {
            toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewURL = photoFile ? URL.createObjectURL(photoFile) : existingPhotoURL || null;
    const founderCount = members.filter(m => m.isFounder).length;

    return (
        <div className="space-y-5 animate-in fade-in duration-400">

            {/* ── Page header card ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-slate-400" />
                        <div>
                            <h2 className="text-[15px] font-semibold text-slate-900">Đội ngũ sáng lập & nhân sự chủ chốt</h2>
                            <p className="text-[12px] text-slate-400 mt-0.5">Giới thiệu những con người đứng sau sự thành công của dự án</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        {members.length > 0 && (
                            <div className="flex items-center gap-4 pr-5 border-r border-slate-100">
                                <div className="text-center">
                                    <p className="text-[20px] font-bold text-slate-900 leading-none">{members.length}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Thành viên</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[20px] font-bold text-[#eec54e] leading-none">{founderCount}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Founder</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={openAdd}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm thành viên
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Member list ── */}
            {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] py-20 flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                    <p className="text-[13px] text-slate-400">Đang tải danh sách...</p>
                </div>
            ) : members.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] py-20 flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Users className="w-7 h-7 text-slate-300" />
                    </div>
                    <div className="text-center">
                        <p className="text-[13px] font-semibold text-slate-700">Chưa có thành viên nào</p>
                        <p className="text-[12px] text-slate-400 mt-1">Thêm thành viên để xây dựng đội ngũ của bạn</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm thành viên đầu tiên
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {members.map((m: ITeamMember) => (
                        <MemberCard key={m.teamMemberID} member={m} onEdit={() => openEdit(m)} onDelete={() => setDeleteTarget(m)} />
                    ))}
                </div>
            )}

            {/* ── Add / Edit Dialog ── */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-[15px] font-semibold text-slate-900">
                                    {isEditing ? "Cập nhật thành viên" : "Thêm thành viên mới"}
                                </h3>
                                <p className="text-[12px] text-slate-400 mt-0.5">
                                    {isEditing ? "Chỉnh sửa thông tin thành viên trong đội ngũ" : "Điền thông tin để thêm thành viên vào đội ngũ"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <form onSubmit={onSubmit} className="overflow-y-auto flex-1">
                            <div className="px-6 py-5 space-y-5">

                                {/* Photo upload */}
                                <div className="flex items-center gap-5 px-4 py-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="relative shrink-0">
                                        {previewURL ? (
                                            <div className="relative w-16 h-16">
                                                <img src={previewURL} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setPhotoFile(null); setExistingPhotoURL(""); }}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center">
                                                <UserCircle2 className="w-7 h-7 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">
                                            Ảnh đại diện{!isEditing && <span className="text-red-400 ml-0.5">*</span>}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mb-2.5">PNG, JPG · Tối đa 5 MB · Khuyến nghị ảnh vuông</p>
                                        <label htmlFor="photo-upload" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-white hover:border-slate-300 transition-colors cursor-pointer">
                                            <Upload className="w-3.5 h-3.5" />
                                            {previewURL ? "Thay đổi ảnh" : "Tải ảnh lên"}
                                            <input
                                                id="photo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={e => { if (e.target.files?.[0]) setPhotoFile(e.target.files[0]); }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Basic info */}
                                <div className="space-y-4">
                                    <SectionLabel>Thông tin cơ bản</SectionLabel>

                                    <div>
                                        <FieldLabel required>Họ & Tên</FieldLabel>
                                        <input
                                            className={INPUT_CLS}
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            required
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <FieldLabel required>Chức danh</FieldLabel>
                                            <input
                                                className={INPUT_CLS}
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                required
                                                placeholder="CEO & Co-founder"
                                            />
                                        </div>
                                        <div>
                                            <FieldLabel required>Hình thức tham gia</FieldLabel>
                                            <input
                                                className={INPUT_CLS}
                                                value={role}
                                                onChange={e => setRole(e.target.value)}
                                                required
                                                placeholder="Full-time / Part-time"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <FieldLabel required>Số năm kinh nghiệm</FieldLabel>
                                        <input
                                            type="number"
                                            min="0"
                                            className={INPUT_CLS}
                                            value={yearsOfExperience}
                                            onChange={e => setYearsOfExperience(e.target.value)}
                                            required
                                            placeholder="5"
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="space-y-4">
                                    <SectionLabel>Giới thiệu</SectionLabel>
                                    <div>
                                        <FieldLabel required>Tiểu sử ngắn</FieldLabel>
                                        <textarea
                                            rows={3}
                                            className={INPUT_CLS + " resize-none"}
                                            value={bio}
                                            onChange={e => setBio(e.target.value)}
                                            required
                                            placeholder="Giới thiệu nhanh về kinh nghiệm, thành tựu nổi bật của thành viên này..."
                                        />
                                    </div>
                                </div>

                                {/* Social & status */}
                                <div className="space-y-4">
                                    <SectionLabel>Liên kết & Vai trò</SectionLabel>

                                    <div>
                                        <FieldLabel>LinkedIn URL</FieldLabel>
                                        <input
                                            type="url"
                                            className={INPUT_CLS}
                                            value={linkedInURL}
                                            onChange={e => setLinkedInURL(e.target.value)}
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>

                                    <label className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#0f172a] focus:ring-[#eec54e]"
                                            checked={isFounder}
                                            onChange={e => setIsFounder(e.target.checked)}
                                        />
                                        <div>
                                            <p className="text-[13px] font-semibold text-slate-800 flex items-center gap-1.5">
                                                <Star className="w-3.5 h-3.5 text-[#eec54e]" />
                                                Là Co-founder sáng lập dự án
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Thành viên này là một trong những người sáng lập startup</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm disabled:opacity-60"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm thành viên"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete confirm dialog ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[15px] font-semibold text-slate-900">Xóa thành viên?</h3>
                            <button onClick={() => setDeleteTarget(null)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                            <p className="text-[12px] text-amber-700">
                                Bạn có chắc chắn muốn xóa <span className="font-semibold">{deleteTarget.fullName}</span> khỏi đội ngũ không? Hành động này không thể hoàn tác.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Xóa thành viên
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Member card ──────────────────────────────────────────────────────────────
function MemberCard({ member, onEdit, onDelete }: {
    member: ITeamMember;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const avatarGradient = getAvatarColor(member.fullName || "");

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:border-slate-300/60 transition-all overflow-hidden">
            <div className="flex items-stretch">

                {/* Left accent bar for founders */}
                {member.isFounder && (
                    <div className="w-1 bg-[#eec54e] shrink-0" />
                )}

                <div className="flex items-center gap-5 px-6 py-5 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        {member.photoURL ? (
                            <img
                                src={member.photoURL}
                                alt={member.fullName}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                            />
                        ) : (
                            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm", avatarGradient)}>
                                {member.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[13px] font-semibold text-slate-900">{member.fullName}</span>
                            {member.isFounder && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-semibold">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                    Founder
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {member.title && (
                                <span className="inline-flex items-center gap-1 text-[12px] text-slate-600 font-medium">
                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                    {member.title}
                                </span>
                            )}
                            {member.title && (member.role || Number(member.yearsOfExperience) > 0) && (
                                <span className="text-slate-200">·</span>
                            )}
                            {member.role && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                                    {member.role}
                                </span>
                            )}
                            {Number(member.yearsOfExperience) > 0 && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {member.yearsOfExperience} năm KN
                                </span>
                            )}
                        </div>

                        {member.bio && (
                            <p className="mt-1.5 text-[12px] text-slate-400 leading-relaxed line-clamp-1">
                                {member.bio}
                            </p>
                        )}
                    </div>

                    {/* Actions – always visible, subtle */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-4 border-l border-slate-100">
                        {member.linkedInURL && (
                            <a
                                href={member.linkedInURL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[12px] font-medium hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            >
                                <Image src="https://thesvg.org/icons/linkedin/default.svg" alt="LinkedIn" width={14} height={14} unoptimized />
                                LinkedIn
                            </a>
                        )}
                        <button
                            onClick={onEdit}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Xóa"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
