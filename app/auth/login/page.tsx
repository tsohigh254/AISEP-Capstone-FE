"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Rocket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Globe,
  HelpCircle,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { Login } from "@/services/auth/auth.api";
import { GetMe } from "@/services/user/user.api";
import { GetAdvisorProfile } from "@/services/advisor/advisor.api";
import { useAuth } from "@/context/context";

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

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken, setIsAuthen } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Định dạng email không hợp lệ");
    } else {
      setEmailError(null);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const redirectByUserType = (userType: string | undefined, roles?: string[]) => {
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
      case "startup":
        // Check if onboarding was already skipped or completed in this browser
        if (typeof window !== "undefined") {
          const skipped = localStorage.getItem("aisep_startup_onboarding_skipped") === "true";
          const completed = localStorage.getItem("aisep_startup_onboarding_completed") === "true";
          if (skipped || completed) {
            router.push("/startup");
          } else {
            router.push("/startup/onboard");
          }
        } else {
          router.push("/startup");
        }
        break;
      case "investor":
        router.push("/investor");
        break;
      case "advisor":
        router.push("/advisor");
        break;
      case "staff":
        router.push("/staff");
        break;
      case "admin":
        router.push("/admin/users");
        break;
      default:
        // By default, if userType/roles are missing or unknown, route to landing.
        router.push("/");
        break;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Định dạng email không hợp lệ");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      const res = await Login(email, password);
      console.log("API_RESPONSE:", res);
      console.log("TOKEN_EXTRACT:", res?.data?.accessToken, (res as any)?.accessToken);

      // Check for success safely (either boolean success, text message, or token presence)
      const payload = res?.data ? res.data : (res as any);
      const token = payload?.accessToken || (res as any)?.accessToken;

      const isSuccess =
        res?.success === true ||
        (res as any)?.isSuccess === true ||
        (res?.message && res.message.toLowerCase().includes("success")) ||
        !!token;

      if (isSuccess && token) {
        let infoObj = payload?.info || payload || {};

        // Fallback: Decode token if backend doesn't send user object
        const decoded = parseJwt(token);
        if (decoded) {
          infoObj = { ...infoObj, ...decoded };

          // Extract .NET roles claim
          const netCoreRoleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
          if (decoded[netCoreRoleClaim]) {
            infoObj.roles = Array.isArray(decoded[netCoreRoleClaim])
              ? decoded[netCoreRoleClaim]
              : [decoded[netCoreRoleClaim]];
          } else if (decoded.role) {
            infoObj.roles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];
          } else if (decoded.roles) {
            infoObj.roles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
          }

          if (!infoObj.userType && decoded.userType) {
            infoObj.userType = decoded.userType;
          }
        }

        const userId = infoObj?.userId || infoObj?.id || 0;
        const targetUserEmail = infoObj?.email || email;
        const targetUserType = infoObj?.userType;
        const targetRoles = infoObj?.roles || [];

        setUser({ userID: userId, email: targetUserEmail, userType: targetUserType, roles: targetRoles });
        setAccessToken(token);
        setIsAuthen(true);

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", token);
        }

        // --- Advisor Flow Mapping ---
        if (targetUserType?.toLowerCase() === "advisor") {
          try {
            // 1. Verify user status
            const userMeRes = await GetMe();
            const userData = userMeRes?.data;
            
            if (!userMeRes.success || !userData || !userData.isActive) {
              setUser(undefined);
              setAccessToken(undefined);
              setIsAuthen(false);
              if (typeof window !== "undefined") localStorage.removeItem("accessToken");
              setError("Tài khoản của bạn chưa được kích hoạt hoặc bị khóa.");
              setIsLoading(false);
              return;
            }

            // 2. Check Advisor profile
            try {
              const advisorProfileRes = await GetAdvisorProfile();
              if (advisorProfileRes.success && advisorProfileRes.data) {
                router.push("/advisor");
              } else {
                router.push("/advisor/onboard");
              }
            } catch (profileErr: any) {
              if (profileErr?.response?.status === 404) {
                router.push("/advisor/onboard");
              } else {
                router.push("/advisor"); // Fallback to dashboard on other errors
              }
            }
          } catch (meErr: any) {
            setError("Không thể xác thực thông tin người dùng.");
            setIsLoading(false);
          }
        } else {
          redirectByUserType(targetUserType, targetRoles);
        }
      } else {
        setError(res?.message || "Đăng nhập không thành công");
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
    <div className="min-h-screen bg-[#f8f8f6] flex flex-col" style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}>
      <div className="h-[73px]" />

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Side: Welcome Info */}
          <div className="lg:col-span-5 space-y-8 hidden lg:block">
            <div>
              <h2 className="text-4xl font-black leading-tight mb-4 text-slate-900">
                Chào mừng bạn trở lại!
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Tiếp tục hành trình kết nối và phát triển trong hệ sinh thái AI.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f042]/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-slate-800" />
                </div>
                <p className="text-sm font-medium text-slate-700">Theo dõi tiến độ startup của bạn</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f042]/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-slate-800" />
                </div>
                <p className="text-sm font-medium text-slate-700">Trao đổi trực tiếp với cố vấn</p>
              </div>
            </div>

            <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-xl">
              <img
                alt="Startup collaboration"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsyCrgtVGIMawqfHL7kw004DQmq-95E59-ycCuTdv4TGohN59RDfDJ73i6ZF0_wotHD2fHKwDIM1IM55N0ySYi2zAet3JnLeDkxWoYNR3fXFHCMdV-jw8gU_1CnuvJYQfu80yoCTkHwQqMw6-z6QOXyw52t1zPn0ayl9JU74mO8n-LfMDnIPd8awGztB---pGNP78tJWeI3esUQDj0F5yJbluyZU81RHhFxtQ1YEMQuekKSobZuMsdJnz-PAZi9x3UBDTJWWh1I9Q"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-medium italic mb-2">
                  &ldquo;Nhờ AISEP, chúng tôi không chỉ tìm thấy nhà đầu tư mà còn có được những đối tác chiến lược quan trọng.&rdquo;
                </p>
                <p className="text-[#f0f042] text-xs font-bold uppercase tracking-wider">
                  — Giám đốc điều hành, TechAI Global
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-100">
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-2 text-slate-900">Đăng nhập Hệ thống</h3>
                <p className="text-slate-500 text-sm">Vui lòng nhập thông tin để truy cập vào tài khoản của bạn.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${emailError ? "text-red-500" : "text-slate-400"}`} />
                      <input
                        type="email"
                        placeholder="nguyenvana@email.com"
                        value={email}
                        onChange={handleEmailChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${emailError
                          ? "border-2 border-red-400 bg-white focus:ring-red-300"
                          : "border-none bg-slate-50 focus:ring-[#f0f042]"
                          }`}
                      />
                    </div>
                    {emailError && (
                      <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border-none rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#f0f042]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#f0f042] focus:ring-[#f0f042] bg-slate-50"
                    />
                    <label htmlFor="remember" className="text-xs text-slate-500 font-medium cursor-pointer">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <Link href="/auth/forgot-password" className="text-xs font-bold text-slate-900 hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>

                {error && (
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                )}

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f0f042] hover:bg-[#e6e632] text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-[#f0f042]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    <span>{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
                    {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-slate-100" />
                  <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium uppercase tracking-widest">Hoặc đăng nhập bằng</span>
                  <div className="flex-grow border-t border-slate-100" />
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm font-bold">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="#0077b5" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <span className="text-sm font-bold">LinkedIn</span>
                  </button>
                </div>

                {/* Register Link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-slate-500">
                    Bạn chưa có tài khoản?{" "}
                    <Link href="/auth/register" className="text-slate-900 font-bold ml-1 hover:underline">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="w-full py-8 border-t border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">© 2024 AISEP Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-[#f0f042] transition-colors">
              <Globe className="w-5 h-5" />
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

