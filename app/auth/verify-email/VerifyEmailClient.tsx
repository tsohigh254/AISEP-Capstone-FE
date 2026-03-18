"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Rocket,
  MailCheck,
  ShieldCheck,
  HelpCircle,
  Pencil,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ResendVerificationEmail, VerifyEmail } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();


  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedUserType, setVerifiedUserType] = useState("");
  const [verifiedRolesState, setVerifiedRolesState] = useState<string[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const getWorkspacePath = (userType: string | undefined, roles?: string[]) => {
    let type = (userType ?? "").toLowerCase();

    // Fallback to roles if userType is empty
    if (!type && roles && roles.length > 0) {
      // Find the first role that matches one of our known dashboards
      const knownRoles = ["startup", "investor", "advisor", "staff", "admin"];
      const lowerRoles = roles.map(r => r.toLowerCase());

      for (const known of knownRoles) {
        if (lowerRoles.includes(known)) {
          type = known;
          break;
        }
      }
    }

    switch (type) {
      case "startup": return "/startup";
      case "investor": return "/investor";
      case "advisor":
      case "expert": return "/advisor";
      case "staff": return "/staff";
      case "admin": return "/admin/users";
      default: return "/";
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) newOtp[i] = pastedData[i] || "";
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length - 1, 5)]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    setIsVerifying(true);
    try {
      const res = await VerifyEmail(email, otpCode);
      if (res.success && res.data) {
        // Safe destructuring to handle both IRegisterInfo and ILoginInfo-like structures
        const data = res.data as any;
        const info = data.info || data;

        const finalUserID = info.userID || info.userId;
        const finalEmail = info.email;
        let finalUserType = info.userType;
        let finalRoles = info.roles;
        const finalAccessToken = data.accessToken;

        // Fallback: Decode token if backend doesn't send user object fully
        const decoded = parseJwt(finalAccessToken);
        if (decoded) {
          const netCoreRoleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
          if (decoded[netCoreRoleClaim]) {
            const rolesFromToken = Array.isArray(decoded[netCoreRoleClaim])
              ? decoded[netCoreRoleClaim]
              : [decoded[netCoreRoleClaim]];
            finalRoles = finalRoles && finalRoles.length > 0 ? finalRoles : rolesFromToken;
          } else if (decoded.role) {
            const rolesFromToken = Array.isArray(decoded.role) ? decoded.role : [decoded.role];
            finalRoles = finalRoles && finalRoles.length > 0 ? finalRoles : rolesFromToken;
          } else if (decoded.roles) {
            const rolesFromToken = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
            finalRoles = finalRoles && finalRoles.length > 0 ? finalRoles : rolesFromToken;
          }

          if (!finalUserType && decoded.userType) {
            finalUserType = decoded.userType;
          }
        }

        setUser({
          userID: finalUserID,
          email: finalEmail,
          userType: finalUserType,
          roles: finalRoles
        });
        setAccessToken(finalAccessToken);
        setIsAuthen(true);
        if (typeof window !== "undefined") localStorage.setItem("accessToken", finalAccessToken);
        setVerifiedUserType(finalUserType || "");
        setVerifiedRolesState(finalRoles || []);
        setIsSuccess(true);
      } else {
        setError(res.message || "Xác thực OTP không thành công");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;
    setError(null);
    setSuccessMessage(null);
    setIsResending(true);
    try {
      const res = await ResendVerificationEmail(email);
      if (res.success) {
        setSuccessMessage("Đã gửi lại mã xác nhận vào email của bạn.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setCooldown(60);
      } else {
        setError(res.message || "Không thể gửi lại mã xác nhận");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (!isSuccess) inputRefs.current[0]?.focus();
  }, [isSuccess]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  /* ==========================================================
   *  SCREEN 2 — Xác thực thành công
   * ========================================================== */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex flex-col" style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}>
      <div className="h-16" />

        {/* Main */}
        <main className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="max-w-[520px] w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 px-8 py-12 md:px-12 md:py-14 text-center">
              {/* Success icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#f0f042]/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#f0f042] flex items-center justify-center shadow-lg shadow-[#f0f042]/30">
                      <ShieldCheck className="w-8 h-8 text-slate-900" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -left-3 w-6 h-6 rounded-full bg-[#f0f042]/15" />
                  <div className="absolute -bottom-1 -right-4 w-5 h-5 rounded-full bg-[#f0f042]/10" />
                </div>
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-4">Xác thực thành công!</h2>
              <p className="text-slate-500 leading-relaxed mb-10 max-w-sm mx-auto">
                Tài khoản của bạn đã sẵn sàng. Chào mừng bạn gia nhập hệ sinh thái khởi nghiệp{" "}
                <span className="font-bold text-slate-900">AISEP</span>.
              </p>

              <Link
                href={getWorkspacePath(verifiedUserType, verifiedRolesState)}
                className="w-full bg-[#f0f042] hover:bg-[#e6e632] text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-[#f0f042]/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Vào Workspace của tôi</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link href="/" className="inline-block mt-5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                Quay về Trang chủ
              </Link>
            </div>
          </div>
        </main>

        {/* Minimal footer */}
        <footer className="py-8 px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
              <button className="hover:text-slate-600 transition-colors">Điều khoản</button>
              <button className="hover:text-slate-600 transition-colors">Bảo mật</button>
              <button className="hover:text-slate-600 transition-colors">Liên hệ</button>
            </div>
            <p className="text-xs text-slate-400">© 2024 AISEP, Nền tảng hệ sinh thái khởi nghiệp AI.</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  /* ==========================================================
   *  SCREEN 1 — Nhập mã OTP
   * ========================================================== */
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex flex-col" style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}>
      <div className="h-[73px]" />

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px] flex flex-col items-center">
          {/* Card */}
          <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 px-8 py-10 md:px-12 md:py-12">
            {/* Mail Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#f0f042]/20 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-slate-800" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-3">Xác thực Email của bạn</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Vui lòng nhập mã OTP 6 chữ số đã được gửi đến email:
              </p>
              <p className="text-slate-900 font-bold text-sm mt-1">{email || "(chưa có email)"}</p>
            </div>

            {/* OTP Input */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#f0f042] focus:border-[#f0f042] transition-all"
                  />
                ))}
              </div>

              {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
              {successMessage && <p className="text-sm text-green-600 text-center font-medium">{successMessage}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={otp.join("").length !== 6 || isVerifying || !email}
                className="w-full bg-[#f0f042] hover:bg-[#e6e632] text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-[#f0f042]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">
                Không nhận được mã?{" "}
                {cooldown > 0 ? (
                  <span className="font-semibold text-slate-400">Gửi lại sau ({cooldown}s)</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-bold text-slate-900 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                    disabled={isResending || !email}
                  >
                    {isResending ? "Đang gửi lại..." : "Gửi lại"}
                  </button>
                )}
              </p>
            </div>

            {/* Change email */}
            <div className="text-center mt-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Thay đổi địa chỉ email
              </Link>
            </div>
          </div>

          {/* Back link */}
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang đăng ký
          </Link>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="w-full py-8 border-t border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">© 2024 AISEP Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-[#f0f042] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            </button>
            <button className="text-slate-400 hover:text-[#f0f042] transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
