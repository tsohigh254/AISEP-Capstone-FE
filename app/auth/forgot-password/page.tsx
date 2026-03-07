"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Rocket,
  Mail,
  ArrowLeft,
  ArrowRight,
  Shield,
  ShieldCheck,
  Globe,
  HelpCircle,
  Menu,
  X,
  Loader2,
  AlertCircle,
  MailCheck,
  ShieldEllipsis,
  KeyRound,
} from "lucide-react";
import { ForgotPassword, VerifyEmail, ResendVerificationEmail } from "@/services/auth/auth.api";

type Step = "email" | "otp-sent" | "enter-otp";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* shared */
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("email");

  /* step 1 */
  const [isLoading, setIsLoading] = useState(false);

  /* step 2 + 3 — resend */
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  /* step 3 — OTP */
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── helpers ── */
  const validateEmail = (value: string) => {
    if (!value) { setEmailError(null); return; }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(re.test(value) ? null : "Định dạng email không hợp lệ");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  /* ── step 1: gửi email ── */
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setEmailError("Vui lòng nhập email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError("Định dạng email không hợp lệ"); return; }

    setIsLoading(true);
    try {
      const res = await ForgotPassword(email);
      if (res.success) {
        setCooldown(60);
        setStep("otp-sent");
      } else {
        setError(res.message || "Không thể gửi mã xác nhận");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── step 3: xác thực OTP ── */
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(data)) {
      const next = [...otp];
      for (let i = 0; i < 6; i++) next[i] = data[i] || "";
      setOtp(next);
      inputRefs.current[Math.min(data.length - 1, 5)]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join("");
    if (code.length !== 6) return;

    setIsVerifying(true);
    try {
      const res = await VerifyEmail(email, code);
      if (res.success) {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        setError(res.message || "Mã OTP không hợp lệ");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsVerifying(false);
    }
  };

  /* ── resend (step 2 & 3) ── */
  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;
    setError(null);
    setResendMsg(null);
    setIsResending(true);
    try {
      const res = await ForgotPassword(email);
      if (res.success) {
        setResendMsg("Đã gửi lại mã OTP vào email của bạn.");
        setOtp(["", "", "", "", "", ""]);
        setCooldown(60);
      } else {
        setError(res.message || "Không thể gửi lại mã");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Có lỗi xảy ra.");
    } finally {
      setIsResending(false);
    }
  };

  /* ── effects ── */
  useEffect(() => {
    if (step === "enter-otp") inputRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  /* ── left‑panel configs per step ── */
  const leftPanels: Record<Step, { title: string; desc: string; feat1Icon: React.ReactNode; feat1: string; feat2Icon: React.ReactNode; feat2: string; quote: string; author: string }> = {
    email: {
      title: "Khôi phục mật khẩu",
      desc: "Đừng lo lắng! Chỉ cần nhập email đã đăng ký, chúng tôi sẽ hỗ trợ bạn lấy lại quyền truy cập.",
      feat1Icon: <Shield className="w-5 h-5 text-slate-800" />,
      feat1: "Bảo mật thông tin tài khoản tuyệt đối",
      feat2Icon: <ShieldCheck className="w-5 h-5 text-slate-800" />,
      feat2: "Xác thực đa lớp an toàn",
      quote: "Hệ thống hỗ trợ nhanh chóng giúp tôi quay lại công việc chỉ trong vài phút.",
      author: "— Sáng lập viên, GreenTech VN",
    },
    "otp-sent": {
      title: "Kiểm tra hộp thư của bạn!",
      desc: "Chúng tôi vừa gửi mã OTP để giúp bạn nhanh chóng trở lại với dự án của mình.",
      feat1Icon: <ShieldCheck className="w-5 h-5 text-slate-800" />,
      feat1: "Bảo mật tài khoản là ưu tiên hàng đầu",
      feat2Icon: <HelpCircle className="w-5 h-5 text-slate-800" />,
      feat2: "Hỗ trợ kỹ thuật 24/7 khi cần thiết",
      quote: "Hệ thống khôi phục nhanh chóng giúp đội ngũ của tôi không bị gián đoạn công việc.",
      author: "— Quản lý vận hành, AI Solutions",
    },
    "enter-otp": {
      title: "Bảo mật là ưu tiên hàng đầu",
      desc: "Chúng tôi sử dụng xác thực hai lớp để đảm bảo chỉ bạn mới có quyền truy cập vào tài khoản và các dự án của mình.",
      feat1Icon: <ShieldCheck className="w-5 h-5 text-slate-800" />,
      feat1: "Xác thực mã OTP 6 chữ số an toàn",
      feat2Icon: <KeyRound className="w-5 h-5 text-slate-800" />,
      feat2: "Quy trình đặt lại mật khẩu nhanh chóng",
      quote: "Hệ thống xác thực giúp tôi yên tâm hơn khi quản lý các tài sản số quan trọng.",
      author: "— Đội ngũ phát triển, AISEP Platform",
    },
  };

  const lp = leftPanels[step];

  /* ============================================================
   *  RENDER
   * ============================================================ */
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex flex-col" style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}>
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white font-manrope">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FACC15] text-slate-900">
              <Rocket className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">AISEP</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-[#f0f042] transition-colors">Về chúng tôi</Link>
            <Link href="/faq" className="text-sm font-medium text-slate-600 hover:text-[#f0f042] transition-colors">Cộng đồng</Link>
            <Link href="/#trust" className="text-sm font-medium text-slate-600 hover:text-[#f0f042] transition-colors">Tin tức</Link>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <span className="text-sm font-bold text-slate-900">Chưa có tài khoản?</span>
            <Link
              href="/auth/register"
              className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Đăng ký ngay
            </Link>
          </nav>

          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
            <Link href="/about" className="block text-sm font-medium text-slate-600 hover:text-slate-900 py-2" onClick={() => setMobileMenuOpen(false)}>Về chúng tôi</Link>
            <Link href="/faq" className="block text-sm font-medium text-slate-600 hover:text-slate-900 py-2" onClick={() => setMobileMenuOpen(false)}>Cộng đồng</Link>
            <Link href="/#trust" className="block text-sm font-medium text-slate-600 hover:text-slate-900 py-2" onClick={() => setMobileMenuOpen(false)}>Tin tức</Link>
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Link href="/auth/register" className="flex-1 text-center px-4 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-lg" onClick={() => setMobileMenuOpen(false)}>Đăng ký ngay</Link>
            </div>
          </div>
        )}
      </header>

      <div className="h-16" />

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ── LEFT PANEL ── */}
          <div className="lg:col-span-5 space-y-8 hidden lg:block">
            <div>
              <h2 className="text-4xl font-black leading-tight mb-4 text-slate-900">{lp.title}</h2>
              <p className="text-slate-600 text-lg leading-relaxed">{lp.desc}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f042]/20 flex items-center justify-center shrink-0">{lp.feat1Icon}</div>
                <p className="text-sm font-medium text-slate-700">{lp.feat1}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f0f042]/20 flex items-center justify-center shrink-0">{lp.feat2Icon}</div>
                <p className="text-sm font-medium text-slate-700">{lp.feat2}</p>
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
                <p className="text-white font-medium italic mb-2">&ldquo;{lp.quote}&rdquo;</p>
                <p className="text-[#f0f042] text-xs font-bold uppercase tracking-wider">{lp.author}</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT CARD ── */}
          <div className="lg:col-span-7">
            {/* ====== STEP 1: ENTER EMAIL ====== */}
            {step === "email" && (
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-100">
                <div className="mb-8">
                  <Link href="/auth/login" className="flex items-center gap-2 mb-4 group text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-semibold">Quay lại đăng nhập</span>
                  </Link>
                  <h3 className="text-2xl font-black mb-2 text-slate-900">Quên mật khẩu?</h3>
                  <p className="text-slate-500 text-sm">
                    Nhập địa chỉ email liên kết với tài khoản của bạn để nhận mã OTP đặt lại mật khẩu.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmitEmail} noValidate>
                  <div className="space-y-2">
                    <label className={`text-sm font-semibold ${isLoading ? "text-slate-400" : "text-slate-700"}`}>Email</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${emailError ? "text-red-500" : "text-slate-400"}`} />
                      <input
                        type="email"
                        placeholder="nguyenvana@email.com"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                          emailError
                            ? "border-2 border-red-400 bg-white focus:ring-red-300"
                            : isLoading
                              ? "border-none bg-slate-100 text-slate-500 cursor-not-allowed"
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

                  {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
                        isLoading
                          ? "bg-[#f0f042]/80 text-slate-900/60 cursor-not-allowed"
                          : "bg-[#f0f042] hover:bg-[#e6e632] text-slate-900 shadow-[#f0f042]/20"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <span>Gửi mã OTP</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-400">
                      Bạn cần trợ giúp thêm?{" "}
                      <button type="button" className="text-slate-900 font-bold ml-1 hover:underline">Liên hệ hỗ trợ</button>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* ====== STEP 2: OTP SENT CONFIRMATION ====== */}
            {step === "otp-sent" && (
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
                  <MailCheck className="w-12 h-12 text-green-500" />
                </div>

                <div className="mb-8">
                  <h3 className="text-3xl font-black mb-4 text-slate-900">Kiểm tra mã OTP!</h3>
                  <p className="text-slate-600 text-base leading-relaxed max-w-md mx-auto">
                    Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email của bạn. Vui lòng kiểm tra hộp thư (và thư rác) để tiếp tục quá trình đặt lại mật khẩu.
                  </p>
                </div>

                {error && <p className="text-sm text-red-600 font-medium mb-4">{error}</p>}
                {resendMsg && <p className="text-sm text-green-600 font-medium mb-4">{resendMsg}</p>}

                <div className="w-full max-w-sm space-y-6">
                  <button
                    type="button"
                    onClick={() => { setError(null); setResendMsg(null); setStep("enter-otp"); }}
                    className="w-full bg-[#f0f042] hover:bg-[#e6e632] text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-[#f0f042]/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Nhập mã xác thực</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="pt-2">
                    <p className="text-sm text-slate-500">
                      Bạn không nhận được mã OTP?{" "}
                      {cooldown > 0 ? (
                        <span className="text-slate-400 font-medium ml-1">Gửi lại sau ({cooldown}s)</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-slate-900 font-bold ml-1 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                          disabled={isResending}
                        >
                          {isResending ? "Đang gửi..." : "Gửi lại mã"}
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ====== STEP 3: ENTER OTP ====== */}
            {step === "enter-otp" && (
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-[#f0f042]/20 rounded-2xl flex items-center justify-center mb-8">
                  <ShieldEllipsis className="w-10 h-10 text-slate-800" />
                </div>

                <div className="mb-8">
                  <h3 className="text-3xl font-black mb-4 text-slate-900">Nhập mã xác thực</h3>
                  <p className="text-slate-600 text-base leading-relaxed max-w-md mx-auto">
                    Vui lòng nhập mã OTP 6 chữ số đã được gửi đến hộp thư của bạn.
                  </p>
                </div>

                {error && <p className="text-sm text-red-600 font-medium mb-4">{error}</p>}
                {resendMsg && <p className="text-sm text-green-600 font-medium mb-4">{resendMsg}</p>}

                <form onSubmit={handleVerifyOtp} className="w-full max-w-md space-y-8">
                  {/* OTP inputs */}
                  <div className="flex justify-between gap-2 md:gap-4">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#f0f042] focus:ring-0 focus:outline-none transition-all"
                      />
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={otp.join("").length !== 6 || isVerifying}
                    className="w-full bg-[#f0f042] hover:bg-[#e6e632] text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-[#f0f042]/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác thực &amp; Tiếp tục</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Resend */}
                  <div className="pt-2">
                    <p className="text-sm text-slate-500">
                      Không nhận được mã?{" "}
                      {cooldown > 0 ? (
                        <span className="text-slate-400 font-medium ml-1">Gửi lại sau ({cooldown}s)</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-slate-900 font-bold ml-1 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                          disabled={isResending}
                        >
                          {isResending ? "Đang gửi..." : "Gửi lại"}
                        </button>
                      )}
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="w-full py-8 border-t border-slate-200 bg-white mt-auto">
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
