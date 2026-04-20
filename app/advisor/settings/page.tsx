"use client";

import { useState, useEffect } from "react";
import {
  User, Shield, LogOut,
  CheckCircle2, AlertCircle, Loader2,
  Eye, EyeOff, ShieldCheck, Mail
} from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Logout, RevokeAll } from "@/services/auth/auth.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  getMockAdvisorSettings, 
  changeMockPassword,
  IAdvisorSettings
} from "@/services/advisor/advisor-settings.mock";

/* ─── Sub-components ─────────────────────────────────────────── */

function SectionCard({ title, icon: Icon, description, children }: {
  title: string; 
  icon: React.ElementType; 
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[15px] font-bold text-slate-800">{title}</p>
        </div>
        {description && <p className="text-[12px] text-slate-400 ml-9">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const inputClass = (hasError = false) => cn(
  "w-full h-11 px-4 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white",
  "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  hasError ? "border-red-300 bg-red-50/40" : "border-slate-200"
);

/* ─── Main Component ─────────────────────────────────────────── */

export default function AdvisorSettingsPage() {
  const [settings, setSettings] = useState<IAdvisorSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Password Form
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getMockAdvisorSettings();
      setSettings(data);
} finally {
      setIsLoading(false);
    }
  };

  const clearSessionAndRedirect = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  const handleLogout = async () => {
    try {
      await Logout();
    } finally {
      clearSessionAndRedirect();
    }
  };

  const handleRevokeAll = async () => {
    try {
      await RevokeAll();
      toast.success("Đã đăng xuất khỏi tất cả các thiết bị");
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");

    if (pwForm.next !== pwForm.confirm) {
      setPwError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setIsChangingPw(true);
    try {
      await changeMockPassword(pwForm);
      toast.success("Đổi mật khẩu thành công");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (e) {
      setPwError("Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setIsChangingPw(false);
    }
  };

  if (isLoading) {
    return (
      <AdvisorShell>
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </AdvisorShell>
    );
  }

  return (
    <AdvisorShell>
      <Dialog open={confirmModal.open} onOpenChange={open => setConfirmModal(m => ({ ...m, open }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{confirmModal.title}</DialogTitle>
            <DialogDescription>{confirmModal.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
              className="px-4 h-9 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-semibold hover:bg-slate-50 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                setConfirmModal(m => ({ ...m, open: false }));
                confirmModal.onConfirm();
              }}
              className="px-4 h-9 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-all"
            >
              Xác nhận
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        
        {/* Page Header */}
        <div className="mb-2">
          <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
          <p className="text-[14px] text-slate-500 mt-1">Quản lý bảo mật, thông báo và các tùy chọn cá nhân.</p>
        </div>

        {/* Section A: Thông tin tài khoản */}
        <SectionCard 
          title="Thông tin tài khoản" 
          icon={User} 
          description="Trạng thái tài khoản và thông tin đăng nhập hệ thống."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Địa chỉ Email</p>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-slate-700">{settings?.account.email}</p>
                {settings?.account.emailVerified ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Đã xác minh
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                    <Mail className="w-2.5 h-2.5" />
                    Chưa xác minh
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Vai trò tài khoản</p>
              <p className="text-[14px] font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                Advisor (Cố vấn)
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Trạng thái</p>
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                Đang hoạt động (Active)
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Section B: Bảo mật & Đổi mật khẩu */}
        <SectionCard 
          title="Bảo mật & Mật khẩu" 
          icon={Shield} 
          description="Cập nhật mật khẩu định kỳ để đảm bảo an toàn cho tài khoản của bạn."
        >
          <form onSubmit={handlePwChange} className="space-y-5 max-w-md">
            {[
              { label: "Mật khẩu hiện tại", key: "current" as const, placeholder: "Nhập mật khẩu đang dùng" },
              { label: "Mật khẩu mới", key: "next" as const, placeholder: "Tối thiểu 8 ký tự" },
              { label: "Xác nhận mật khẩu mới", key: "confirm" as const, placeholder: "Nhập lại mật khẩu mới" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{label}</label>
                <div className="relative">
                  <input 
                    type={pwShow[key] ? "text" : "password"}
                    value={pwForm[key]}
                    onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={inputClass(!!pwError && key === "confirm")}
                  />
                  <button 
                    type="button" 
                    onClick={() => setPwShow(p => ({ ...p, [key]: !p[key] }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {pwShow[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            {pwError && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-[12px] text-red-600">{pwError}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={!pwForm.current || !pwForm.next || !pwForm.confirm || isChangingPw}
              className="px-6 h-10 bg-[#0f172a] text-white text-[13px] font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isChangingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...</> : "Cập nhật mật khẩu"}
            </button>
          </form>
        </SectionCard>

        {/* Section C: Phiên đăng nhập */}
        <SectionCard 
          title="Phiên đăng nhập" 
          icon={LogOut} 
          description="Quản lý các kết nối hiện tại đến tài khoản này."
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConfirmModal({
                open: true,
                title: "Đăng xuất phiên hiện tại?",
                description: "Bạn sẽ bị đăng xuất khỏi phiên làm việc này và cần đăng nhập lại để tiếp tục.",
                onConfirm: handleLogout,
              })}
              className="px-5 h-11 rounded-xl border border-red-100 text-red-600 bg-red-50/30 text-[13px] font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất phiên hiện tại
            </button>
            <button
              onClick={() => setConfirmModal({
                open: true,
                title: "Đăng xuất khỏi tất cả thiết bị?",
                description: "Hành động này sẽ ngắt kết nối trên TẤT CẢ các thiết bị khác. Bạn vẫn duy trì phiên hiện tại.",
                onConfirm: handleRevokeAll,
              })}
              className="px-5 h-11 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Đăng xuất khỏi tất cả thiết bị
            </button>
          </div>
        </SectionCard>

      </div>
    </AdvisorShell>
  );
}
