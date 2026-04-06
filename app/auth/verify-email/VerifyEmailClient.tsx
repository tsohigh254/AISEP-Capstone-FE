"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Loader2,
  MailCheck,
  Pencil,
} from "lucide-react";
import { ResendVerificationEmail, VerifyEmail } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";

type AuthPayloadShape = {
  accessToken?: string;
  data?: Partial<IUser>;
  info?: Partial<IUser>;
  user?: Partial<IUser>;
};

function VerifyEmailClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();

  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getWorkspacePath = (userType: string) => {
    const type = userType.toLowerCase();

    if (purpose === "register") {
      if (type === "startup") return "/startup/onboard";
      if (type === "investor") return "/investor/onboard";
      if (type === "advisor" || type === "expert") return "/advisor/onboard";
    }

    switch (type) {
      case "startup":
        return "/startup";
      case "investor":
        return "/investor";
      case "advisor":
      case "expert":
        return "/advisor";
      case "staff":
        return "/staff";
      case "admin":
        return "/admin/users";
      default:
        return "/";
    }
  };

  const extractAuthPayload = (payload: AuthPayloadShape | null | undefined) => {
    if (!payload?.accessToken) return null;

    const rawUser = payload.data ?? payload.info ?? payload.user;
    if (!rawUser?.userType) return null;

    const normalizedUser: IUser = {
      userId: rawUser.userId ?? 0,
      email: rawUser.email ?? email,
      userType: rawUser.userType,
      isActive: rawUser.isActive ?? true,
      emailVerified: rawUser.emailVerified ?? true,
      createdAt: rawUser.createdAt ?? "",
      lastLoginAt: rawUser.lastLoginAt ?? "",
      roles: Array.isArray(rawUser.roles) ? rawUser.roles : [],
    };

    return {
      accessToken: payload.accessToken,
      user: normalizedUser,
    };
  };

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const nextOtp = [...otp];
    for (let index = 0; index < 6; index += 1) {
      nextOtp[index] = pastedData[index] || "";
    }

    setOtp(nextOtp);
    inputRefs.current[Math.min(pastedData.length - 1, 5)]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    setIsVerifying(true);
    try {
      const response = await VerifyEmail(email, otpCode);

      if (!response.success || !response.data) {
        setError(response.message || "Xác thực OTP không thành công.");
        return;
      }

      const authPayload = extractAuthPayload(response.data as AuthPayloadShape);
      if (!authPayload) {
        setError("Phản hồi xác thực không đầy đủ. Vui lòng thử lại.");
        return;
      }

      setUser(authPayload.user);
      setAccessToken(authPayload.accessToken);
      setIsAuthen(true);

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", authPayload.accessToken);
        localStorage.setItem("user", JSON.stringify(authPayload.user));
      }

      router.replace(getWorkspacePath(authPayload.user.userType));
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(message);
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
      const response = await ResendVerificationEmail(email);
      if (!response.success) {
        setError(response.message || "Không thể gửi lại mã xác nhận.");
        return;
      }

      setSuccessMessage("Đã gửi lại mã xác nhận vào email của bạn.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setCooldown(60);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div
      className="min-h-screen bg-[#f8f8f6] flex flex-col"
      style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
    >
      <div className="h-[73px]" />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px] flex flex-col items-center">
          <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 px-8 py-10 md:px-12 md:py-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#f0f042]/20 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-slate-800" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-3">Xác thực email của bạn</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Vui lòng nhập mã OTP 6 chữ số đã được gửi đến email:
              </p>
              <p className="text-slate-900 font-bold text-sm mt-1">{email || "(chưa có email)"}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#f0f042] focus:border-[#f0f042] transition-all"
                  />
                ))}
              </div>

              {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
              {successMessage && (
                <p className="text-sm text-green-600 text-center font-medium">{successMessage}</p>
              )}

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

          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang đăng ký
          </Link>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">© 2024 AISEP Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-[#f0f042] transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
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

export default function VerifyEmailClient() {
  return (
    <Suspense>
      <VerifyEmailClientInner />
    </Suspense>
  );
}
