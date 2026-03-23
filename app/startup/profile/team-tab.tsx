"use client";

import { useState, useEffect } from "react";
import {
  GetMembers,
  AddMember,
  UpdateMember,
  DeleteMember,
  IAddMemberRequest,
  IUpdateMemberRequest
} from "@/services/startup/startup.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, Pencil, Trash2, Linkedin, ImagePlus, Loader2, X } from "lucide-react";

export function TeamTab() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);

  // Form State
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

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await GetMembers();
      if (res && res.data) {
        const memberData = Array.isArray(res.data) ? res.data : [res.data];
        setMembers(memberData);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error("Failed to load members", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setRole("");
    setTitle("");
    setLinkedInURL("");
    setBio("");
    setYearsOfExperience("");
    setIsFounder(false);
    setPhotoFile(null);
    setExistingPhotoURL("");
    setIsEditing(false);
    setCurrentMemberId(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (member: any) => {
    resetForm();
    setIsEditing(true);
    setCurrentMemberId(member.teamMemberID); // ensure this matches the backend ID property

    setFullName(member.fullName);
    setRole(member.role);
    setTitle(member.title);
    setLinkedInURL(member.linkedInURL || "");
    setBio(member.bio || "");
    setYearsOfExperience(member.yearsOfExperience?.toString() || "");
    setIsFounder(member.isFounder === "true" || member.isFounder === true);
    if (member.photoURL) setExistingPhotoURL(member.photoURL);

    setIsDialogOpen(true);
  };

  const handleDelete = async (memberId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thành viên này?")) return;

    try {
      await DeleteMember(memberId);
      await fetchMembers();
    } catch (err) {
      console.error("Xóa thất bại", err);
      alert("Xóa thất bại!");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && currentMemberId) {
        let payload: any = {
          memberId: currentMemberId,
          fullName,
          role,
          title,
          linkedInURL,
          bio,
          isFounder,
          yearsOfExperience: parseInt(yearsOfExperience) || 0
        };
        if (photoFile) {
          payload.photoURL = photoFile;
        }
        await UpdateMember(payload as IUpdateMemberRequest);
      } else {
        if (!photoFile) {
          alert("Vui lòng chọn ảnh đại diện.");
          setIsSubmitting(false);
          return;
        }
        let payload: IAddMemberRequest = {
          fullName,
          role,
          title,
          linkedInURL,
          bio,
          photoURL: photoFile,
          isFounder,
          yearsOfExperience: parseInt(yearsOfExperience) || 0
        };
        await AddMember(payload);
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMembers();
    } catch (err) {
      console.error("Thao tác thất bại", err);
      alert("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tab Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex bg-yellow-50/50 p-4 rounded-xl items-start gap-4 flex-1 mr-4 border border-yellow-100/50">
          <div className="bg-white p-2 text-yellow-500 rounded-lg shadow-sm border border-yellow-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Đội ngũ sáng lập & nhân sự chủ chốt</h2>
            <p className="text-sm text-gray-500">Giới thiệu những con người đứng sau sự thành công của dự án.</p>
          </div>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          variant="outline"
          className="border-yellow-200 bg-yellow-50/30 text-yellow-700 hover:bg-yellow-50 gap-2 shrink-0 h-11"
        >
          <Plus className="w-4 h-4" />
          Thêm thành viên
        </Button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-8 pt-4 pb-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <div className="col-span-6">THÀNH VIÊN</div>
        <div className="col-span-3">CHỨC DANH / VAI TRÒ</div>
        <div className="col-span-2 text-center">LIÊN KẾT</div>
        <div className="col-span-1 text-right">THAO TÁC</div>
      </div>

      {/* Members List */}
      <div className="divide-y divide-gray-50">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Chưa có thành viên nào. Hãy thêm thành viên đầu tiên!
          </div>
        ) : (
          members.map((member, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-gray-50/50 transition-colors">
              <div className="col-span-6 flex items-start gap-4">
                <img
                  src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=random`}
                  alt={member.fullName}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-100"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{member.fullName}</span>
                    {member.isFounder && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-wide">
                        FOUNDER
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-snug line-clamp-2 max-w-sm">
                    {member.bio}
                  </p>
                </div>
              </div>

              <div className="col-span-3">
                <p className="font-semibold text-gray-900 text-sm">{member.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
              </div>

              <div className="col-span-2 flex justify-center">
                {member.linkedInURL ? (
                  <a href={member.linkedInURL} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </div>

              <div className="col-span-1 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEditDialog(member)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.teamMemberID)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-50/50 p-4 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">Hồ sơ có ít nhất 2 thành viên sáng lập thường được nhà đầu tư đánh giá cao hơn.</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-xl font-bold">
              {isEditing ? "Cập nhật thành viên" : "Thêm thành viên mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Họ & Tên *</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Nguyễn Văn A" />
              </div>

              <div className="space-y-1.5">
                <Label>Chức danh (Title) *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="ex: CEO & Co-founder" />
              </div>

              <div className="space-y-1.5">
                <Label>Vai trò (Role) *</Label>
                <Input value={role} onChange={e => setRole(e.target.value)} required placeholder="ex: Toàn thời gian" />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label>Kinh nghiệm (Số năm) *</Label>
                <Input type="number" min="0" value={yearsOfExperience} onChange={e => setYearsOfExperience(e.target.value)} required placeholder="ex: 10" />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label>LinkedIn URL</Label>
                <Input type="url" value={linkedInURL} onChange={e => setLinkedInURL(e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label>Tiểu sử ngắn (Bio) *</Label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} required placeholder="Giới thiệu nhanh về kinh nghiệm của thành viên này..." className="min-h-[80px]" />
              </div>

              <div className="flex items-center gap-2 col-span-2 mt-2">
                <input
                  type="checkbox"
                  id="isFounder"
                  className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  checked={isFounder}
                  onChange={(e) => setIsFounder(e.target.checked)}
                />
                <Label htmlFor="isFounder" className="font-medium cursor-pointer">Là Co-founder sáng lập dự án</Label>
              </div>

              <div className="col-span-2 mt-2 space-y-1.5">
                <Label>Ảnh đại diện {!isEditing && "*"}</Label>
                <div className="flex flex-col items-center gap-3 mt-2">
                  <div
                    className="relative w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center overflow-hidden group transition-colors hover:border-blue-300"
                  >
                    {photoFile ? (
                      <img
                        src={URL.createObjectURL(photoFile)}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : existingPhotoURL ? (
                      <img
                        src={existingPhotoURL}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-gray-400">
                        <ImagePlus className="w-8 h-8" />
                        <span className="text-xs">Ảnh đại diện</span>
                      </div>
                    )}
                    {(photoFile || existingPhotoURL) && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          type="button"
                          className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                          onClick={() => {
                            setPhotoFile(null);
                            setExistingPhotoURL("");
                          }}
                          title="Xóa ảnh"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="photo"
                    className="inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Thay đổi ảnh
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) setPhotoFile(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thành viên"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
