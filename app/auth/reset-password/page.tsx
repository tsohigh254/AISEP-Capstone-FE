"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import {
  Rocket,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Globe,
  HelpCircle,
  Info,
} from "lucide-react";
import { ResetPassword } from "@/services/auth/auth.api";

/* ================================================================
 *  Password strength calculator
 * ================================================================ */
function getPasswordStrength(pw: string) {
  if (!pw) return { label: "CHƯA NHẬP", pct: 0, color: "bg-slate-200", textColor: "text-slate-400" };

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const map: Record<number, { label: string; pct: number; color: string; textColor: string }> = {
    0: { label: "YẾU", pct: 20, color: "bg-red-500", textColor: "text-red-500" },
    1: { label: "YẾU", pct: 20, color: "bg-red-500", textColor: "text-red-500" },
    2: { label: "TRUNG BÌNH", pct: 50, color: "bg-yellow-500", textColor: "text-yellow-600" },
    3: { label: "MẠNH", pct: 75, color: "bg-green-500", textColor: "text-green-600" },
    4: { label: "RẤT MẠNH", pct: 100, color: "bg-green-600", textColor: "text-green-600" },
  };
  return map[score];
}

/* ================================================================
 *  Main component (wrapped in Suspense)
 * ================================================================ */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setErrors((prev) => ({
      ...prev,
      newPassword: value && value.length < 8 ? "Mật khẩu phải có tối thiểu 8 ký tự" : "",
    }));
    // Re-validate confirm if it was already entered
    if (confirmPassword && value !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Mật khẩu xác nhận không khớp" }));
    } else if (confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: value !== newPassword ? "Mật khẩu xác nhận không khớp" : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const pwErr = newPassword.length < 8 ? "Mật khẩu phải có tối thiểu 8 ký tự" : "";
    const cfErr = newPassword !== confirmPassword ? "Mật khẩu xác nhận không khớp" : "";
    if (pwErr || cfErr) {
      setErrors({ newPassword: pwErr, confirmPassword: cfErr });
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
        setIsSuccess(true);
      } else if (!res.isSuccess && res.statusCode === 400 && Array.isArray(res.data) && res.data.length > 0) {
        const newPwErrs: string[] = [];
        const cfPwErrs: string[] = [];
        const generalErrs: string[] = [];
        for (const item of res.data) {
          const f = item.field?.toLowerCase() ?? "";
          const msgs = item.messages ?? [];
          if (f === "newpassword" || f === "password") newPwErrs.push(...msgs);
          else if (f === "confirmnewpassword" || f === "confirmpassword") cfPwErrs.push(...msgs);
          else generalErrs.push(...msgs);
        }
        setErrors({ newPassword: newPwErrs.join(" "), confirmPassword: cfPwErrs.join(" ") });
        if (generalErrs.length > 0) setApiError(generalErrs.join(" "));
      } else {
        const rawMsg = res.message || "";
        let msg: string;
        if (rawMsg === "User does not exists") {
          msg = "Email không tồn tại trong hệ thống.";
        } else if (rawMsg === "Passwords do not match") {
          msg = "Mật khẩu xác nhận không khớp.";
        } else {
          msg = rawMsg || "Đặt lại mật khẩu không thành công";
        }
        if (rawMsg.toLowerCase().includes("expired") || rawMsg.toLowerCase().includes("invalid") || rawMsg.toLowerCase().includes("hết hạn")) {
          setIsExpired(true);
        }
        setApiError(msg);
      }
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid") || message.toLowerCase().includes("hết hạn")) {
        setIsExpired(true);
      }
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ==============================================================
   *  SUCCESS STATE
   * ============================================================== */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex flex-col" style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}>
      <div className="h-14" />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-[480px] w-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center flex flex-col items-center gap-6">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-2xl font-bold text-slate-900 font-manrope">
                  Mật khẩu đã được cập nhật
                </h1>
                <p className="text-slate-600 text-base leading-relaxed">
                  Bạn có thể sử dụng mật khẩu mới để đăng nhập vào hệ thống ngay bây giờ.
                </p>
              </div>

              {/* Decorative image */}
              <div className="w-full aspect-video rounded-lg overflow-hidden relative">
                <img
                  alt="Thành công"
                  className="w-full h-full object-cover grayscale opacity-20"
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop&q=80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              </div>

              {/* CTA */}
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center h-12 px-6 bg-[#f0f042] text-slate-900 text-base font-bold rounded-lg hover:bg-[#e6e632] transition-all shadow-sm"
              >
                Đăng nhập ngay
              </Link>

              <Link href="/" className="text-slate-500 text-sm font-medium hover:text-[#f0f042] underline transition-colors">
                Quay lại trang chủ
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex flex-col gap-6 px-5 py-10 text-center bg-white border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-6 md:justify-around max-w-[960px] mx-auto w-full">
            <button className="text-slate-600 text-sm hover:text-[#f0f042] transition-colors">Điều khoản</button>
            <button className="text-slate-600 text-sm hover:text-[#f0f042] transition-colors">Bảo mật</button>
            <button className="text-slate-600 text-sm hover:text-[#f0f042] transition-colors">Liên hệ</button>
          </div>
          <p className="text-slate-500 text-xs">
            © 2026 AISEP - Nền tảng Hệ sinh thái Startup AI. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  /* ==============================================================
   *  RESET PASSWORD FORM
   * ============================================================== */
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex flex-col" style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}>
      <div className="h-14" />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[480px]">
          {/* Expired / Invalid Banner */}
          {isExpired && (
            <div className="flex flex-col items-start gap-4 rounded-xl border border-red-300/30 bg-red-50 p-5 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <p className="text-slate-900 text-base font-bold leading-tight">Yêu cầu không hợp lệ hoặc liên kết đã hết hạn</p>
                  <p className="text-slate-600 text-sm">Vui lòng yêu cầu một liên kết mới để tiếp tục quá trình bảo mật.</p>
                </div>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-bold leading-normal tracking-tight flex items-center gap-2 text-slate-900 hover:underline"
              >
                Gửi lại yêu cầu
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/20 p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Đặt lại mật khẩu</h1>
              <p className="text-slate-500 text-base leading-relaxed">
                Vui lòng nhập mật khẩu mới để tiếp tục truy cập vào hệ sinh thái AISEP. Đảm bảo mật khẩu của bạn là duy nhất.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nhập ít nhất 8 ký tự"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    disabled={isLoading}
                    className={`w-full h-12 pl-4 pr-12 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-[#f0f042]/50 focus:border-[#f0f042] outline-none transition-all text-slate-900 placeholder:text-slate-400 ${errors.newPassword ? "border-red-500" : "border-slate-200"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Strength indicator */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Độ mạnh mật khẩu</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Sử dụng ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                  </p>
                </div>

                {errors.newPassword && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    disabled={isLoading}
                    className={`w-full h-12 pl-4 pr-12 bg-slate-50 border-2 rounded-lg focus:ring-2 focus:ring-[#f0f042]/50 focus:border-[#f0f042] outline-none transition-all text-slate-900 placeholder:text-slate-400 ${errors.confirmPassword ? "border-red-500 bg-white" : "border-slate-200"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1.5 text-red-500 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              {apiError && !isExpired && (
                <p className="text-sm text-red-600 font-medium">{apiError}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center rounded-lg h-14 text-base font-bold shadow-lg transition-all ${isLoading
                    ? "bg-[#f0f042]/80 text-slate-900/60 cursor-not-allowed"
                    : "bg-[#f0f042] hover:bg-[#e6e632] text-slate-900 shadow-[#f0f042]/20 active:scale-[0.99]"
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <span>Cập nhật mật khẩu</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <p className="mt-8 text-center text-sm text-slate-500">
            © 2026 AISEP Platform. Bản quyền thuộc về AISEP.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 flex justify-center gap-6 text-xs text-slate-400 font-medium">
        <button className="hover:underline hover:text-slate-600 transition-colors">Điều khoản</button>
        <button className="hover:underline hover:text-slate-600 transition-colors">Bảo mật</button>
        <button className="hover:underline hover:text-slate-600 transition-colors">Liên hệ</button>
      </footer>
    </div>
  );
}

/* ================================================================
 *  Page wrapper with Suspense (needed for useSearchParams)
 * ================================================================ */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f8f8f6] text-slate-500">Đang tải...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
