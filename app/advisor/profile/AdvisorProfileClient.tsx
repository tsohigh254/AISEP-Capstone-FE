"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { ChangePassword } from "@/services/auth/auth.api";
import {
  CreateAdvisorProfile,
  UpdateAdvisorProfile,
  GetAdvisorProfile,
  ExpertiseItemDto,
} from "@/services/advisor/advisor.api";

export default function AdvisorProfileClient() {
  const searchParams = useSearchParams();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Trạng thái hồ sơ đã tồn tại hay chưa để quyết định gọi create hay update
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "password") {
      setShowPasswordDialog(true);
    }
  }, [searchParams]);

  // Combined profile data (UI state) - chỉ giữ các trường backend cần
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    company: "",
    description: "",
    mentorshipPhilosophy: "",
    website: "",
    linkedInURL: "",
  });

  // Expertise items (Items: ExpertiseItemDto[])
  const [expertiseItems, setExpertiseItems] = useState<ExpertiseItemDto[]>([]);

  // Lấy hồ sơ advisor từ backend và bind dữ liệu vào form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await GetAdvisorProfile();
        if (res.isSuccess && res.statusCode === 200 && res.data) {
          const data: any = res.data;

          setProfileData({
            name: data.fullName || "",
            title: data.title || "",
            company: data.company || "",
            description: data.bio || "",
            mentorshipPhilosophy: data.mentorshipPhilosophy || "",
            website: data.website || "",
            linkedInURL: data.linkedInURL || "",
          });

          // Expertise từ backend
          setExpertiseItems(
            Array.isArray(data.items) ? (data.items as ExpertiseItemDto[]) : [],
          );

          // Ảnh profile từ backend (url)
          setProfileImageUrl(data.profilePhotoURL || null);

          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      } catch {
        setHasProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    setIsChanging(true);
    try {
      const res = await ChangePassword(
        oldPassword,
        newPassword,
        confirmPassword
      );

      if (res.isSuccess && res.statusCode === 200) {
        setPasswordSuccess("Đổi mật khẩu thành công");
        toast.success("Đổi mật khẩu thành công");
        setShowPasswordDialog(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const message = res.message || "Đổi mật khẩu không thành công";
        setPasswordError(message);
        toast.error(message);
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsChanging(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);

    const items: ExpertiseItemDto[] = expertiseItems;

    try {
      if (hasProfile) {
        // Gọi UpdateAdvisorProfile với body đúng CreateAdvisorRequest/Update DTO
        await UpdateAdvisorProfile(profileData.name, {
          title: profileData.title || null,
          company: profileData.company || null,
          bio: profileData.description,
          website: profileData.website || null,
          linkedInURL: profileData.linkedInURL || null,
          mentorshipPhilosophy: profileData.mentorshipPhilosophy || null,
          items,
        });
      } else {
        // Nếu chưa có profile (hoặc lỗi khi check), gọi CreateAdvisorProfile
        await CreateAdvisorProfile(profileData.name, {
          title: profileData.title || null,
          company: profileData.company || null,
          bio: profileData.description,
          website: profileData.website || null,
          linkedInURL: profileData.linkedInURL || null,
          mentorshipPhilosophy: profileData.mentorshipPhilosophy || null,
          items,
        });
        setHasProfile(true);
      }

      toast.success("Lưu hồ sơ advisor thành công");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Lưu hồ sơ advisor thất bại";
      console.error("Lưu hồ sơ advisor thất bại", error);
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <AdvisorShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ Advisor</h1>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500">
                  {profileImageUrl && (
                    <AvatarImage
                      src={profileImageUrl}
                      alt={profileData.name || "Advisor Avatar"}
                    />
                  )}
                  <AvatarFallback className="text-2xl font-semibold text-white">
                    {profileData.name
                      ? profileData.name.charAt(0).toUpperCase()
                      : "N"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="border-slate-300">
                  <Camera className="w-4 h-4 mr-2" />
                  Thay đổi ảnh
                </Button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên Advisor</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Chức danh</Label>
                  <Input
                    id="title"
                    placeholder="VD: Senior Advisor, Partner..."
                    value={profileData.title}
                    onChange={(e) =>
                      setProfileData({ ...profileData, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Công ty / Tổ chức</Label>
                  <Input
                    id="company"
                    placeholder="VD: ABC Ventures"
                    value={profileData.company}
                    onChange={(e) =>
                      setProfileData({ ...profileData, company: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={profileData.description}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        description: e.target.value,
                      })
                    }
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mentorshipPhilosophy">Triết lý mentoring</Label>
                  <Textarea
                    id="mentorshipPhilosophy"
                    placeholder="Chia sẻ cách bạn hỗ trợ và đồng hành cùng startup..."
                    value={profileData.mentorshipPhilosophy}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        mentorshipPhilosophy: e.target.value,
                      })
                    }
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website cá nhân / công ty</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData({ ...profileData, website: e.target.value })
                    }
                  />
                </div>

                {/* Expertise Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Chuyên môn (Expertise)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpertiseItems((prev) => [
                          ...prev,
                          { category: "", subTopic: "", proficiencyLevel: "", yearsOfExperience: null },
                        ])
                      }
                    >
                      Thêm chuyên môn
                    </Button>
                  </div>

                  {expertiseItems.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Bạn chưa thêm chuyên môn nào. Nhấn &quot;Thêm chuyên môn&quot; để bắt đầu.
                    </p>
                  )}

                  <div className="space-y-3">
                    {expertiseItems.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-md border border-slate-200 p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">
                            Chuyên môn #{index + 1}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              setExpertiseItems((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                          >
                            Xóa
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs" htmlFor={`category-${index}`}>
                              Lĩnh vực chính (Category)
                            </Label>
                            <Input
                              id={`category-${index}`}
                              placeholder="Ví dụ: AI, Marketing, Finance..."
                              value={item.category}
                              onChange={(e) =>
                                setExpertiseItems((prev) => {
                                  const next = [...prev];
                                  next[index] = { ...next[index], category: e.target.value };
                                  return next;
                                })
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs" htmlFor={`subTopic-${index}`}>
                              Chủ đề cụ thể (SubTopic)
                            </Label>
                            <Input
                              id={`subTopic-${index}`}
                              placeholder="Ví dụ: Go-to-market, Fundraising..."
                              value={item.subTopic ?? ""}
                              onChange={(e) =>
                                setExpertiseItems((prev) => {
                                  const next = [...prev];
                                  next[index] = { ...next[index], subTopic: e.target.value };
                                  return next;
                                })
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs" htmlFor={`proficiency-${index}`}>
                              Mức độ thành thạo (ProficiencyLevel)
                            </Label>
                            <Input
                              id={`proficiency-${index}`}
                              placeholder="Ví dụ: Expert, Intermediate..."
                              value={item.proficiencyLevel ?? ""}
                              onChange={(e) =>
                                setExpertiseItems((prev) => {
                                  const next = [...prev];
                                  next[index] = {
                                    ...next[index],
                                    proficiencyLevel: e.target.value,
                                  };
                                  return next;
                                })
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs" htmlFor={`years-${index}`}>
                              Số năm kinh nghiệm (YearsOfExperience)
                            </Label>
                            <Input
                              id={`years-${index}`}
                              type="number"
                              min={0}
                              placeholder="Ví dụ: 5"
                              value={item.yearsOfExperience ?? ""}
                              onChange={(e) =>
                                setExpertiseItems((prev) => {
                                  const next = [...prev];
                                  const value = e.target.value;
                                  next[index] = {
                                    ...next[index],
                                    yearsOfExperience:
                                      value === "" ? null : Number.parseInt(value, 10),
                                  };
                                  return next;
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://www.linkedin.com/in/username"
                    value={profileData.linkedInURL}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        linkedInURL: e.target.value,
                      })
                    }
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Hủy</Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Đổi mật khẩu</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">Mật khẩu cũ</Label>
              <Input
                id="old-password"
                type="password"
                placeholder="Nhập mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}

            {passwordSuccess && (
              <p className="text-sm text-green-600">{passwordSuccess}</p>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Hủy
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              onClick={handlePasswordChange}
              disabled={!oldPassword || !newPassword || !confirmPassword || isChanging}
            >
              {isChanging ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdvisorShell>
  );
}

