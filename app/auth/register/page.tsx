"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Rocket,
  User,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Network,
  CircleDollarSign,
  Landmark,
  GraduationCap,
  Globe,
  HelpCircle,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { Register } from "@/services/auth/auth.api";

type Role = "startup" | "investor" | "expert";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const roles: { id: Role; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: "startup",
      title: "Startup",
      desc: "Tìm kiếm nguồn lực và cố vấn",
      icon: <Rocket className="w-6 h-6" />,
    },
    {
      id: "investor",
      title: "Nhà đầu tư",
      desc: "Tìm kiếm cơ hội tiềm năng",
      icon: <Landmark className="w-6 h-6" />,
    },
    {
      id: "expert",
      title: "Cố vấn",
      desc: "Chia sẻ và dẫn dắt startup",
      icon: <GraduationCap className="w-6 h-6" />,
    },
  ];

  const mapRoleToUserType = (role: Role): string => {
    switch (role) {
      case "startup":
        return "Startup";
      case "investor":
        return "Investor";
      case "expert":
      default:
        return "Advisor";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Định dạng email không hợp lệ");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!selectedRole) {
      setError("Vui lòng chọn vai trò của bạn");
      return;
    }

    if (!agreedTerms) {
      setError("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật");
      return;
    }

    setIsLoading(true);

    try {
      const userType = mapRoleToUserType(selectedRole!);
      const res = await Register(email, password, confirmPassword, userType);

      if (res.isSuccess && res.statusCode === 200) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&purpose=register`);
      } else if (!res.isSuccess && res.statusCode === 400 && Array.isArray(res.data) && res.data.length > 0) {
        let hasFieldError = false;
        for (const item of res.data) {
          const fieldLower = item.field?.toLowerCase();
          const msg = item.messages?.join(" ") ?? "";
          if (fieldLower === "email") {
            setEmailError(msg);
            hasFieldError = true;
          } else if (fieldLower === "password") {
            setPasswordError(msg);
            hasFieldError = true;
          }
        }
        if (!hasFieldError) {
          const allMessages = res.data.flatMap((item) => item.messages ?? []);
          setError(allMessages.join(" "));
        }
      } else {
        setError(res.message || "Đăng ký không thành công");
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
        <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Side: Welcome Info */}
          <div className="lg:col-span-5 space-y-8 hidden lg:block">
            <div>
              <h2 className="text-4xl font-black leading-tight mb-4 text-slate-900">
                Gia nhập hệ sinh thái khởi nghiệp AI
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Kết nối với hàng nghìn chuyên gia, nhà đầu tư và các startup tiềm năng nhất trong lĩnh vực Trí tuệ nhân tạo.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f042]/20 flex items-center justify-center shrink-0">
                  <Network className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Mạng lưới rộng lớn</h4>
                  <p className="text-sm text-slate-500">Tiếp cận hơn 500+ cố vấn chuyên môn hàng đầu.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f042]/20 flex items-center justify-center shrink-0">
                  <CircleDollarSign className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Cơ hội đầu tư</h4>
                  <p className="text-sm text-slate-500">Vốn đầu tư trực tiếp từ các quỹ AI uy tín.</p>
                </div>
              </div>
            </div>

            <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-xl">
              <img
                alt="Startup collaboration"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsyCrgtVGIMawqfHL7kw004DQmq-95E59-ycCuTdv4TGohN59RDfDJ73i6ZF0_wotHD2fHKwDIM1IM55N0ySYi2zAet3JnLeDkxWoYNR3fXFHCMdV-jw8gU_1CnuvJYQfu80yoCTkHwQqMw6-z6QOXyw52t1zPn0ayl9JU74mO8n-LfMDnIPd8awGztB---pGNP78tJWeI3esUQDj0F5yJbluyZU81RHhFxtQ1YEMQuekKSobZuMsdJnz-PAZi9x3UBDTJWWh1I9Q"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-white font-medium italic text-sm">
                &ldquo;AISEP đã giúp chúng tôi gọi vốn thành công vòng Seed chỉ trong 3 tháng.&rdquo;
              </p>
            </div>
          </div>

          {/* Right Side: Registration Card */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-100">
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-2 text-slate-900">Đăng ký Tài khoản Mới</h3>
              <p className="text-slate-500">Bắt đầu hành trình của bạn tại AISEP ngay hôm nay.</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit} noValidate>
              {/* Role Selection */}
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Tôi là:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <label key={role.id} className="cursor-pointer group">
                      <input
                        type="radio"
                        name="role"
                        value={role.id}
                        checked={selectedRole === role.id}
                        onChange={() => setSelectedRole(role.id as Role)}
                        className="sr-only peer"
                      />
                      <div className={`h-full border-2 rounded-xl p-4 transition-all text-center flex flex-col items-center ${
                        selectedRole === role.id
                          ? "border-[#f0f042] bg-[#f0f042]/10"
                          : "border-slate-100 hover:border-[#f0f042] hover:bg-[#f0f042]/5"
                      }`}>
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-slate-700">
                          {role.icon}
                        </div>
                        <span className="font-bold text-sm block text-slate-900">{role.title}</span>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">{role.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Email</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${emailError ? "text-red-500" : "text-slate-400"}`} />
                      <input
                        type="email"
                        placeholder="nguyenvana@email.com"
                        value={email}
                        onChange={handleEmailChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                          emailError
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

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Mật khẩu</label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${passwordError ? "text-red-500" : "text-slate-400"}`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                      className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                        passwordError
                          ? "border-2 border-red-400 bg-white focus:ring-red-300"
                          : "border-none bg-slate-50 focus:ring-[#f0f042]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border-none rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#f0f042]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-[#f0f042] focus:ring-[#f0f042]"
                />
                <label htmlFor="terms" className="text-xs text-slate-500 leading-normal">
                  Bằng cách đăng ký, tôi đồng ý với{" "}
                  <Link href="#" className="text-slate-900 underline font-medium">Điều khoản sử dụng</Link>{" "}
                  và{" "}
                  <Link href="#" className="text-slate-900 underline font-medium">Chính sách bảo mật</Link>{" "}
                  của AISEP.
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#f0f042] hover:bg-[#e6e632] text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-[#f0f042]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isLoading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}</span>
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-sm text-slate-500">
                  Bạn đã có tài khoản?{" "}
                  <Link href="/auth/login" className="text-slate-900 font-bold ml-1 hover:underline">
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="w-full py-8 border-t border-slate-200 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">© 2026 AISEP Platform. All rights reserved.</p>
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




