"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChangePassword } from "@/services/auth/auth.api";

export default function InvestorSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    setIsLoading(true);
    try {
      const res = await ChangePassword(
        form.oldPassword,
        form.newPassword,
        form.confirmPassword,
      );

      if (res.isSuccess && res.statusCode === 200) {
        router.back();
      } else {
        setError(res.message || "Đổi mật khẩu không thành công");
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <InvestorShell>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full">
          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Đổi mật khẩu</h1>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mật khẩu cũ */}
              <div className="space-y-2">
                <Label htmlFor="oldPassword" className="text-sm font-medium text-slate-900">
                  Mật khẩu cũ
                </Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={form.oldPassword}
                  onChange={(e) => handleChange("oldPassword", e.target.value)}
                  placeholder="Nhập mật khẩu cũ"
                  className="h-11 border-slate-300"
                  required
                />
              </div>

              {/* Mật khẩu mới */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-slate-900">
                  Mật khẩu mới
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="h-11 border-slate-300"
                  required
                />
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-900">
                  Xác nhận mật khẩu mới
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="h-11 border-slate-300"
                  required
                />
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-11 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </InvestorShell>
  );
}
