"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { ResetPassword } from "@/services/auth/auth.api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Mật khẩu phải có tối thiểu 8 ký tự";
    }
    return "";
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setErrors((prev) => ({
      ...prev,
      newPassword: validatePassword(value),
    }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value !== newPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Mật khẩu xác nhận không khớp",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError = newPassword !== confirmPassword
      ? "Mật khẩu xác nhận không khớp"
      : "";

    if (newPasswordError || confirmPasswordError) {
      setErrors({
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    if (!email) {
      setApiError("Thiếu thông tin email để đặt lại mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      const res = await ResetPassword(email, newPassword, confirmPassword);

      if (res.success) {
        router.push("/auth/login");
      } else {
        setApiError(res.message || "Đặt lại mật khẩu không thành công");
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg shadow-lg bg-white">
        <CardHeader className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">StartupHub</h1>
              <p className="text-sm text-gray-600">Powered by AI</p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="text-center space-y-2 pt-2">
            <h2 className="text-2xl font-bold text-gray-900">Tạo mật khẩu mới</h2>
            <p className="text-base text-gray-700">Mật khẩu mới phải khác với mật khẩu cũ</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-900">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="........"
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  className={`w-full pr-10 border-gray-300 focus-visible:ring-green-500 ${
                    errors.newPassword ? "border-red-500" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-gray-500">Tối thiểu 8 ký tự</p>
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="........"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full pr-10 border-gray-300 focus-visible:ring-green-500 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            {apiError && <p className="text-sm text-red-600">{apiError}</p>}

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
