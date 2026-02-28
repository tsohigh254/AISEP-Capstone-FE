"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { ChangePassword } from "@/services/auth/auth.api";

export default function AdvisorProfileClient() {
  const searchParams = useSearchParams();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "password") {
      setShowPasswordDialog(true);
    }
  }, [searchParams]);

  // Combined profile data
  const [profileData, setProfileData] = useState({
    name: "Nguyễn Văn A",
    description: "Chuyên gia công nghệ với hơn 15 năm kinh nghiệm trong lĩnh vực AI và Machine Learning",
    field: "AI & Technology",
    achievements: "Ex-CTO tại Tech Corp, Advisor cho 50+ startups, 10 successful exits",
    pricePerHour: "",
    phone: "0901234567",
    email: "advisor@example.com",
  });

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    setIsChanging(true);
    try {
      const res = await ChangePassword(oldPassword, newPassword, confirmPassword);

      if (res.success) {
        setPasswordSuccess("Đổi mật khẩu thành công");
        setShowPasswordDialog(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(res.message || "Đổi mật khẩu không thành công");
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      setPasswordError(message);
    } finally {
      setIsChanging(false);
    }
  };

  const handleSaveProfile = () => {
    // TODO: Implement save profile logic
    console.log("Save profile", profileData);
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
                  <AvatarFallback className="text-2xl font-semibold text-white">
                    N
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
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={profileData.description}
                    onChange={(e) =>
                      setProfileData({ ...profileData, description: e.target.value })
                    }
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field">Lĩnh vực</Label>
                  <select
                    id="field"
                    value={profileData.field}
                    onChange={(e) =>
                      setProfileData({ ...profileData, field: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="AI & Technology">AI & Technology</option>
                    <option value="Business Strategy">Business Strategy</option>
                    <option value="Legal & IP">Legal & IP</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievements">Thành tích</Label>
                  <Textarea
                    id="achievements"
                    value={profileData.achievements}
                    onChange={(e) =>
                      setProfileData({ ...profileData, achievements: e.target.value })
                    }
                    className="min-h-[100px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Giá mỗi giờ tư vấn</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Ví dụ: 250"
                    value={profileData.pricePerHour}
                    onChange={(e) =>
                      setProfileData({ ...profileData, pricePerHour: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Hủy</Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={handleSaveProfile}
                >
                  Lưu thay đổi
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

