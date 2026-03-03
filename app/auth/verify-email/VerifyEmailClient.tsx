"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, Mail } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ResendVerificationEmail, VerifyEmail } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();

  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "forgot-password";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const redirectByUserType = (userType: string) => {
    switch (userType) {
      case "Startup":
        router.push("/startup");
        break;
      case "Investor":
        router.push("/investor");
        break;
      case "Advisor":
        router.push("/advisor");
        break;
      default:
        router.push("/");
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtp(newOtp);
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
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

      if (res.isSuccess && res.statusCode === 200 && res.data) {
        const { data, accessToken } = res.data;

        if (purpose === "register") {

          setUser(data);
          setAccessToken(accessToken);
          setIsAuthen(true);

          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken);
          }

          redirectByUserType(data.userType);
        } else {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }
      } else {
        setError(res.message || "Xác thực OTP không thành công");
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
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
      const res = await ResendVerificationEmail(email);
      if (res.isSuccess && res.statusCode === 200) {
        setSuccessMessage("Đã gửi lại mã xác nhận vào email của bạn.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setCooldown(60);
      } else {
        setError(res.message || "Không thể gửi lại mã xác nhận");
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

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
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="text-center space-y-2 pt-2">
            <h2 className="text-2xl font-bold text-gray-900">Kiểm tra email</h2>
            <p className="text-base text-gray-700">Chúng tôi đã gửi mã xác nhận 6 số đến</p>
            <p className="text-base font-bold text-gray-900">{email || "(chưa có email)"}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
              disabled={otp.join("").length !== 6 || isVerifying || !email}
            >
              {isVerifying ? "Đang xác thực..." : "Xác nhận"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 space-y-1">
            <p>
              Không nhận được mã?{" "}
              <button
                type="button"
                onClick={handleResend}
                className={`font-medium ${cooldown > 0 || isResending ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-700 hover:underline"}`}
                disabled={cooldown > 0 || isResending || !email}
              >
                {isResending ? "Đang gửi lại..." : "Gửi lại"}
              </button>
            </p>
            {cooldown > 0 && <p className="text-xs text-gray-500">Bạn có thể gửi lại sau {cooldown}s</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-8">
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
      </div>
    </div>
  );
}
