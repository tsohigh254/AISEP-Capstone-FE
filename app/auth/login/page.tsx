"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Login } from "@/services/auth/auth.api";
import { useAuth } from "@/context/context";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await Login(email, password);

      if (res.success && res.data) {
        const { info, accessToken } = res.data;

        setUser(info);
        setAccessToken(accessToken);
        setIsAuthen(true);

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }

        redirectByUserType(info.userType);
      } else {
        setError(res.message || "Đăng nhập không thành công");
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="container mx-auto px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-6 py-12">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="space-y-6">
            {/* Brand Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">StartupHub</h1>
                <p className="text-sm text-gray-600">Powered by AI</p>
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Đăng nhập vào tài khoản
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Chào mừng bạn quay trở lại!
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            {/* Registration Link */}
            <div className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

