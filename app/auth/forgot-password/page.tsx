"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ForgotPassword } from "@/services/auth/auth.api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await ForgotPassword(email);

      if (res.success) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&purpose=forgot-password`);
      } else {
        setError(res.message || "Không thể gửi mã xác nhận");
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
          href="/auth/login" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại đăng nhập</span>
        </Link>
      </div>

      {/* Forgot Password Card */}
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

            {/* Email Icon */}
            <div className="flex justify-center pt-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Title and Description */}
            <div className="text-center space-y-2 pt-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Quên mật khẩu?
              </h2>
              <p className="text-base text-gray-700">
                Không sao, chúng tôi sẽ gửi hướng dẫn khôi phục qua email của bạn
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">
                  Địa chỉ Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-blue-200 focus-visible:ring-blue-500"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-2 justify-center pb-8">
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
}

